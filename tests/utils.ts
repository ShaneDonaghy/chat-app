import {PrismaClient} from "@prisma/client";

export async function resetORMDB(prisma: PrismaClient) {
    await prisma.$transaction([
        prisma.message.deleteMany(),
        prisma.chat.deleteMany(),
        prisma.user.deleteMany(),
    ]);
}
