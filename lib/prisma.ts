import { PrismaClient } from '@prisma/client'

declare global {
  // Avoid re-declaring PrismaClient in hot-reload environments
  // This is required in TypeScript
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
