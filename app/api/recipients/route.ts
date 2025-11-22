import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recipients = await prisma.recipient.findMany({
        orderBy: { name: 'asc' }
    })
    return NextResponse.json(recipients)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, email } = body

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 })
        }

        const recipient = await prisma.recipient.create({
            data: {
                name,
                email
            }
        })

        return NextResponse.json(recipient)
    } catch (error: any) {
        console.error('Error creating recipient:', error)

        // Check for unique constraint violation (duplicate email)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A recipient with this email already exists' }, { status: 400 })
        }

        return NextResponse.json({ error: 'Error creating recipient' }, { status: 500 })
    }
}
