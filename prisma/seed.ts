import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create Admin User
    const hashedPassword = await bcrypt.hash('password123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })
    console.log({ admin })

    // Create Lockers
    const lockers = []
    for (let i = 101; i <= 110; i++) {
        const locker = await prisma.locker.upsert({
            where: { lockerNumber: `${i}` },
            update: {},
            create: {
                lockerNumber: `${i}`,
                qrIdentifier: `LOCKER-${i}`,
                status: 'AVAILABLE',
            },
        })
        lockers.push(locker)
    }
    console.log(`Seeded ${lockers.length} lockers`)

    // Create Recipients
    const recipients = [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' },
    ]

    for (const r of recipients) {
        await prisma.recipient.upsert({
            where: { email: r.email },
            update: {},
            create: {
                name: r.name,
                email: r.email,
            },
        })
    }
    console.log(`Seeded ${recipients.length} recipients`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
