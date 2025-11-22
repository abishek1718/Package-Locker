import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { GET as authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
    const session = await getServerSession(authOptions as any) // Type casting for now
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const residents = await prisma.resident.findMany({
        orderBy: { name: 'asc' }
    })
    return NextResponse.json(residents)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions as any)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, email, unitNumber } = body

        const resident = await prisma.resident.create({
            data: {
                name,
                email,
                unitNumber,
            }
        })
        return NextResponse.json(resident)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating resident' }, { status: 500 })
    }
}
