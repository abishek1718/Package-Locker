import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const text = await file.text()
        const lines = text.split('\n')
        const recipients = []
        const errors = []

        // Skip header row if present (simple check)
        let startIndex = 0
        if (lines[0].toLowerCase().includes('name') && lines[0].toLowerCase().includes('email')) {
            startIndex = 1
        }

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            // Expect CSV format: Name,Email
            const parts = line.split(',')
            if (parts.length < 2) {
                errors.push(`Line ${i + 1}: Invalid format (Expected: Name,Email)`)
                continue
            }

            const name = parts[0].trim()
            const email = parts[1].trim()

            if (!name || !email) {
                errors.push(`Line ${i + 1}: Missing name or email`)
                continue
            }

            recipients.push({ name, email })
        }

        let successCount = 0
        for (const r of recipients) {
            try {
                await prisma.recipient.upsert({
                    where: { email: r.email },
                    update: { name: r.name },
                    create: {
                        name: r.name,
                        email: r.email
                    }
                })
                successCount++
            } catch (err) {
                console.error(err)
                errors.push(`Failed to import ${r.email}`)
            }
        }

        return NextResponse.json({ successCount, errors })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Error processing CSV' }, { status: 500 })
    }
}
