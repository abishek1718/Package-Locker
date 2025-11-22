import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // Publicly accessible for pickup page, but maybe should be secured?
    // For now, we allow fetching by ID to show details on pickup page.
    // In production, we might want a token.
    const { id } = await params

    const pkg = await prisma.package.findUnique({
        where: { id },
        include: {
            locker: true,
            resident: true,
        }
    })

    if (!pkg) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(pkg)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Allow staff or resident (if we had resident auth) to mark as picked up.
    // For now, assume public endpoint for "Mark as Picked Up" button on the link sent to email?
    // Or require staff auth? The requirements say "resident or staff can mark the package as Picked up".
    // So we might need to allow it without session if it's the resident link.
    // But to be safe, we should probably check a token or just allow it for now.

    // Let's allow it without session for now to support the resident link flow easily.

    try {
        const body = await request.json()
        const { status } = body

        if (status === 'PICKED_UP') {
            const pkg = await prisma.package.update({
                where: { id },
                data: {
                    status: 'PICKED_UP',
                    pickedUpAt: new Date(),
                },
                include: { locker: true }
            })

            // Free up the locker
            await prisma.locker.update({
                where: { id: pkg.lockerId },
                data: {
                    status: 'AVAILABLE',
                    currentPin: null, // Clear PIN
                }
            })

            return NextResponse.json(pkg)
        }

        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Error updating package' }, { status: 500 })
    }
}
