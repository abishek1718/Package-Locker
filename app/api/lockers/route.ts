import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { GET as authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
    const session = await getServerSession(authOptions as any)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lockers = await prisma.locker.findMany({
        orderBy: { lockerNumber: 'asc' }
    })
    return NextResponse.json(lockers)
}
