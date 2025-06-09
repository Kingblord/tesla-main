import { neon } from "@neondatabase/serverless"

// Create the database connection
export const sql = neon(process.env.DATABASE_URL!)

// For compatibility with some components that expect 'db'
export const db = sql

// Mock prisma export for compatibility (we're using raw SQL instead)
export const prisma = {
  user: {
    findMany: async () => {
      return await sql`SELECT * FROM users`
    },
    findUnique: async (params: any) => {
      const { where } = params
      if (where.id) {
        const result = await sql`SELECT * FROM users WHERE id = ${where.id}`
        return result[0] || null
      }
      if (where.email) {
        const result = await sql`SELECT * FROM users WHERE email = ${where.email}`
        return result[0] || null
      }
      return null
    },
  },
  transaction: {
    findMany: async () => {
      return await sql`SELECT * FROM transactions ORDER BY created_at DESC`
    },
  },
  investment: {
    findMany: async () => {
      return await sql`SELECT * FROM investments ORDER BY created_at DESC`
    },
  },
}
