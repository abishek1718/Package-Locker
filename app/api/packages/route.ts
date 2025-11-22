import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { sendNotification } from '@/lib/email'

// Generate a random 6-digit PIN
function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const packages = await prisma.package.findMany({
        include: {
            locker: true,
            recipient: true,
        },
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(packages)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { lockerId, recipientId, photoUrl } = body

        // Check if locker is available
        const locker = await prisma.locker.findUnique({ where: { id: lockerId } })
        if (!locker || locker.status !== 'AVAILABLE') {
            return NextResponse.json({ error: 'Locker not available' }, { status: 400 })
        }

        // Generate PIN (ensure it's not the same as last time - simple check)
        let pin = generatePin()
        if (locker.currentPin === pin) {
            pin = generatePin() // Retry once
        }

        // Create Package
        const pkg = await prisma.package.create({
            data: {
                lockerId,
                recipientId,
                pin,
                photoUrl,
                status: 'PENDING',
            },
            include: {
                recipient: true,
                locker: true,
            }
        })

        // Update Locker Status
        await prisma.locker.update({
            where: { id: lockerId },
            data: {
                status: 'OCCUPIED',
                currentPin: pin,
            }
        })

        // Send Email
        // Determine Base URL
        let baseUrl = process.env.NEXTAUTH_URL

        // Fallback if NEXTAUTH_URL is missing or invalid
        if (!baseUrl || baseUrl === 'undefined') {
            try {
                const url = new URL(request.url)
                baseUrl = url.origin
            } catch (e) {
                console.error('Error parsing request URL:', e)
                baseUrl = 'https://vercel.com'
            }
        }

        const pickupLink = `${baseUrl}/pickup/${pkg.id}`
        await sendNotification(
            pkg.recipient.email,
            pkg.recipient.name,
            pkg.locker.lockerNumber,
            pin,
            pickupLink
        )

        return NextResponse.json(pkg)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error creating package' }, { status: 500 })
    }
}
