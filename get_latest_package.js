require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const pkg = await prisma.package.findFirst({
            orderBy: { createdAt: 'desc' }
        })
        console.log('LATEST_PACKAGE_ID:', pkg?.id)
    } catch (e) {
        console.error(e)
    }
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
