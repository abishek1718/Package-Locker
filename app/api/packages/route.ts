import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { sendNotification } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

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
            resident: true,
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
        const { lockerId, residentId, photoUrl } = body

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
                residentId,
                pin,
                photoUrl,
                status: 'PENDING',
            },
            include: {
                resident: true,
                locker: true,
            }
        })

        // Update Locker Status
        await prisma.locker.update({
            where: { id: lockerId },
            data: {
                status: 'OCCUPIED',
                currentPin: pin,
                pickupLink
        )

        return NextResponse.json(pkg)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error creating package' }, { status: 500 })
    }
}
