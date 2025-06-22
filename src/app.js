const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

await prisma.user.create({ data: { email, passwordHash } });
const user = await prisma.user.findUnique({ where: { email } });
