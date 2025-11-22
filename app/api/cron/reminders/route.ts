import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/email'

export async function GET() {
    try {
        // Calculate 48 hours ago
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

        // Find packages that are PENDING and created more than 48 hours ago
        const expiredPackages = await prisma.package.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    lt: fortyEightHoursAgo
                }
            },
            include: {
                resident: true,
                locker: true
            }
        })

        const results = []

        for (const pkg of expiredPackages) {
            const pickupLink = `${process.env.NEXTAUTH_URL}/pickup/${pkg.id}`

            // Send reminder email
            // Note: In a real app, we might want a slightly different email template for reminders
            // For now, we'll re-send the original notification with a "REMINDER" prefix in subject if possible,
            // but our sendNotification function is simple. 
            // Let's just re-send the notification.

            await sendNotification(
                pkg.resident.email,
                pkg.resident.name,
                pkg.locker.lockerNumber,
                pkg.pin,
                pickupLink
            )

            results.push({
                id: pkg.id,
                resident: pkg.resident.email,
                status: 'Reminder Sent'
            })
        }

        return NextResponse.json({
            message: `Processed ${expiredPackages.length} expired packages`,
            results
        })

    } catch (error) {
        console.error('Reminder Job Error:', error)
        return NextResponse.json({ error: 'Error processing reminders' }, { status: 500 })
    }
}
