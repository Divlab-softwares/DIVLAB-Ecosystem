import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

// Charger .env explicitement — Prisma 7 ne le fait plus automatiquement
dotenv.config()
// const url = new URL(process.env.DATABASE_URL!)
// console.log("HOST:", url.hostname)
// console.log("PORT:", url.port)
// console.log("PASSWORD détectée:", url.password ? `✅ (longueur: ${url.password.length})` : "❌ vide")
// console.log("USER:", url.username)
// console.log("RAW URL:", process.env.DATABASE_URL)
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error("DATABASE_URL est undefined — vérifie ton fichier .env")
}

const adapter = new PrismaPg({
     connectionString,
      ssl: {
        rejectUnauthorized: false, // ← Accepte le certificat auto-signé de Supabase
    },
 })

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}