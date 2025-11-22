import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    // Security Check: Only ADMIN can upload
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const text = await file.text()
        const lines = text.split('\n')
        const results = []
        const errors = []

        // Skip header row if it exists (simple check: if first row has "email" case insensitive)
        let startIndex = 0
        if (lines[0].toLowerCase().includes('email')) {
            startIndex = 1
        }

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            // Expecting CSV format: Name, Email, UnitNumber
            const parts = line.split(',')
            if (parts.length < 3) {
                errors.push(`Line ${i + 1}: Invalid format (expected Name,Email,Unit)`)
                continue
            }

            const name = parts[0].trim()
            const email = parts[1].trim()
            const unitNumber = parts[2].trim()

            if (!email || !name || !unitNumber) {
                errors.push(`Line ${i + 1}: Missing required fields`)
                continue
            }

            try {
                const resident = await prisma.resident.create({
                    data: {
                        name,
                        email,
                        unitNumber
                    }
                })
                results.push(resident)
            } catch (e) {
                // Likely unique constraint violation on email
                errors.push(`Line ${i + 1}: Failed to create ${email} (might already exist)`)
            }
        }

        return NextResponse.json({
            message: `Processed ${lines.length - startIndex} lines`,
            successCount: results.length,
            errors
        })

    } catch (error) {
        console.error('CSV Import Error:', error)
        return NextResponse.json({ error: 'Error processing CSV' }, { status: 500 })
    }
}
