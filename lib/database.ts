import { Pool } from "pg"

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Database query function with error handling
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Transaction wrapper
export async function transaction(callback: (client: any) => Promise<any>) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

// User management functions
export const userQueries = {
  // Create new user with $0 balance
  async createUser(userData: {
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    phone?: string
    country?: string
    referredBy?: number
  }) {
    const { email, passwordHash, firstName, lastName, phone, country, referredBy } = userData

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, country, referred_by, wallet_balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0.00)
       RETURNING id, email, first_name, last_name, referral_code, status, wallet_balance, created_at`,
      [email, passwordHash, firstName, lastName, phone, country, referredBy],
    )

    return result.rows[0]
  },

  // Get user by email
  async getUserByEmail(email: string) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email])
    return result.rows[0]
  },

  // Get user by ID
  async getUserById(id: number) {
    const result = await query("SELECT * FROM users WHERE id = $1", [id])
    return result.rows[0]
  },

  // Update user
  async updateUser(id: number, updates: any) {
    const fields = Object.keys(updates)
    const values = Object.values(updates)
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ")

    const result = await query(`UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`, [id, ...values])

    return result.rows[0]
  },

  // Get all users with pagination
  async getAllUsers(page = 1, limit = 50, filters: any = {}) {
    let whereClause = "WHERE 1=1"
    const params: any[] = []
    let paramCount = 0

    if (filters.status) {
      paramCount++
      whereClause += ` AND status = $${paramCount}`
      params.push(filters.status)
    }

    if (filters.role) {
      paramCount++
      whereClause += ` AND role = $${paramCount}`
      params.push(filters.role)
    }

    if (filters.search) {
      paramCount++
      whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`
      params.push(`%${filters.search}%`)
    }

    const offset = (page - 1) * limit
    paramCount++
    const limitClause = `LIMIT $${paramCount}`
    params.push(limit)

    paramCount++
    const offsetClause = `OFFSET $${paramCount}`
    params.push(offset)

    const result = await query(
      `SELECT id, email, first_name, last_name, phone, country, status, role, 
              referral_code, email_verified, last_login, wallet_balance, created_at
       FROM users 
       ${whereClause} 
       ORDER BY created_at DESC 
       ${limitClause} ${offsetClause}`,
      params,
    )

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params.slice(0, -2), // Remove limit and offset params
    )

    return {
      users: result.rows,
      total: Number.parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(Number.parseInt(countResult.rows[0].count) / limit),
    }
  },

  // Delete user
  async deleteUser(id: number) {
    const result = await query("DELETE FROM users WHERE id = $1 RETURNING *", [id])
    return result.rows[0]
  },

  // Update user status
  async updateUserStatus(id: number, status: string) {
    const result = await query("UPDATE users SET status = $1 WHERE id = $2 RETURNING *", [status, id])
    return result.rows[0]
  },

  // Get user statistics
  async getUserStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE status = 'active') as active_users,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
        COUNT(*) FILTER (WHERE status = 'banned') as banned_users,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_today,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_this_month,
        SUM(wallet_balance) as total_wallet_balance
      FROM users
    `)
    return result.rows[0]
  },
}

// Wallet management functions
export const walletQueries = {
  // Add money to user wallet (Admin function)
  async addFunds(userId: number, amount: number, description: string, adminId: number) {
    return await transaction(async (client) => {
      // Update user balance
      const userResult = await client.query(
        "UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance",
        [amount, userId],
      )

      // Record transaction
      await client.query(
        `INSERT INTO wallet_transactions (user_id, amount, type, description, admin_id)
         VALUES ($1, $2, 'credit', $3, $4)`,
        [userId, amount, description, adminId],
      )

      return userResult.rows[0]
    })
  },

  // Deduct money from user wallet
  async deductFunds(userId: number, amount: number, description: string, adminId?: number) {
    return await transaction(async (client) => {
      // Check if user has sufficient balance
      const balanceResult = await client.query("SELECT wallet_balance FROM users WHERE id = $1", [userId])
      const currentBalance = Number.parseFloat(balanceResult.rows[0]?.wallet_balance || 0)

      if (currentBalance < amount) {
        throw new Error("Insufficient balance")
      }

      // Update user balance
      const userResult = await client.query(
        "UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2 RETURNING wallet_balance",
        [amount, userId],
      )

      // Record transaction
      await client.query(
        `INSERT INTO wallet_transactions (user_id, amount, type, description, admin_id)
         VALUES ($1, $2, 'debit', $3, $4)`,
        [userId, -amount, description, adminId],
      )

      return userResult.rows[0]
    })
  },

  // Get user wallet transactions
  async getWalletTransactions(userId: number, page = 1, limit = 20) {
    const offset = (page - 1) * limit

    const result = await query(
      `SELECT wt.*, u.first_name as admin_name, u.last_name as admin_last_name
       FROM wallet_transactions wt
       LEFT JOIN users u ON wt.admin_id = u.id
       WHERE wt.user_id = $1 
       ORDER BY wt.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )

    return result.rows
  },

  // Get user balance
  async getUserBalance(userId: number) {
    const result = await query("SELECT wallet_balance FROM users WHERE id = $1", [userId])
    return Number.parseFloat(result.rows[0]?.wallet_balance || 0)
  },
}

// Investment management functions
export const investmentQueries = {
  // Create user investment (deduct from wallet)
  async createInvestment(investmentData: {
    userId: number
    planId: number
    amount: number
    currency: string
  }) {
    const { userId, planId, amount, currency } = investmentData

    return await transaction(async (client) => {
      // Check wallet balance
      const balanceResult = await client.query("SELECT wallet_balance FROM users WHERE id = $1", [userId])
      const currentBalance = Number.parseFloat(balanceResult.rows[0]?.wallet_balance || 0)

      if (currentBalance < amount) {
        throw new Error("Insufficient wallet balance")
      }

      // Get plan details
      const planResult = await client.query("SELECT * FROM investment_plans WHERE id = $1", [planId])

      if (!planResult.rows[0]) {
        throw new Error("Investment plan not found")
      }

      const plan = planResult.rows[0]
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000)
      const dailyReturn = (amount * plan.daily_return_rate) / 100

      // Create investment
      const investmentResult = await client.query(
        `INSERT INTO user_investments (user_id, plan_id, amount, currency, start_date, end_date, daily_return)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          planId,
          amount,
          currency,
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
          dailyReturn,
        ],
      )

      // Deduct from wallet
      await client.query("UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2", [amount, userId])

      // Record wallet transaction
      await client.query(
        `INSERT INTO wallet_transactions (user_id, amount, type, description)
         VALUES ($1, $2, 'investment', $3)`,
        [userId, -amount, `Investment in ${plan.name}`],
      )

      return investmentResult.rows[0]
    })
  },

  // Get user investments
  async getUserInvestments(userId: number) {
    const result = await query(
      `SELECT ui.*, ip.name as plan_name, ip.daily_return_rate
       FROM user_investments ui
       JOIN investment_plans ip ON ui.plan_id = ip.id
       WHERE ui.user_id = $1
       ORDER BY ui.created_at DESC`,
      [userId],
    )
    return result.rows
  },
}

// Transaction management functions
export const transactionQueries = {
  // Create transaction
  async createTransaction(transactionData: {
    userId: number
    type: string
    amount: number
    currency: string
    status?: string
    walletAddress?: string
    notes?: string
  }) {
    const { userId, type, amount, currency, status = "pending", walletAddress, notes } = transactionData

    const result = await query(
      `INSERT INTO transactions (user_id, type, amount, currency, status, wallet_address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, type, amount, currency, status, walletAddress, notes],
    )

    return result.rows[0]
  },

  // Get user transactions
  async getUserTransactions(userId: number, page = 1, limit = 20) {
    const offset = (page - 1) * limit

    const result = await query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )

    return result.rows
  },

  // Update transaction status
  async updateTransactionStatus(id: number, status: string, processedBy?: number, adminNotes?: string) {
    const result = await query(
      `UPDATE transactions 
       SET status = $1, processed_by = $2, admin_notes = $3, processed_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
      [status, processedBy, adminNotes, id],
    )

    return result.rows[0]
  },
}

export default pool
