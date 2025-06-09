import { query } from "@/lib/database"

export const adminQueries = {
  async getAdminStats() {
    try {
      // Get user statistics
      const userStatsQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_users_today,
          COUNT(*) FILTER (WHERE status = 'active') as active_users
        FROM users
        WHERE role != 'super_admin'
      `

      // Get investment statistics
      const investmentStatsQuery = `
        SELECT 
          COUNT(*) as active_investments,
          COALESCE(SUM(amount), 0) as total_invested,
          COALESCE(SUM(total_earned), 0) as total_payouts
        FROM user_investments
        WHERE status = 'active'
      `

      // Get transaction statistics
      const transactionStatsQuery = `
        SELECT 
          COALESCE(SUM(amount), 0) FILTER (WHERE type = 'withdrawal' AND status = 'pending') as pending_withdrawals
        FROM transactions
      `

      const [userStats, investmentStats, transactionStats] = await Promise.all([
        query(userStatsQuery),
        query(investmentStatsQuery),
        query(transactionStatsQuery),
      ])

      return {
        total_users: Number.parseInt(userStats.rows[0]?.total_users || "0"),
        new_users_today: Number.parseInt(userStats.rows[0]?.new_users_today || "0"),
        active_users: Number.parseInt(userStats.rows[0]?.active_users || "0"),
        active_investments: Number.parseInt(investmentStats.rows[0]?.active_investments || "0"),
        total_invested: Number.parseFloat(investmentStats.rows[0]?.total_invested || "0"),
        total_payouts: Number.parseFloat(investmentStats.rows[0]?.total_payouts || "0"),
        pending_withdrawals: Number.parseFloat(transactionStats.rows[0]?.pending_withdrawals || "0"),
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      return {
        total_users: 0,
        new_users_today: 0,
        active_users: 0,
        active_investments: 0,
        total_invested: 0,
        total_payouts: 0,
        pending_withdrawals: 0,
      }
    }
  },

  async getAllUsers() {
    try {
      const usersQuery = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.status,
          u.created_at,
          u.last_login,
          COALESCE(SUM(ui.amount), 0) as total_invested
        FROM users u
        LEFT JOIN user_investments ui ON u.id = ui.user_id AND ui.status = 'active'
        WHERE u.role != 'super_admin'
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.status, u.created_at, u.last_login
        ORDER BY u.created_at DESC
      `

      const result = await query(usersQuery)
      return result.rows
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  },

  async getAllTransactions() {
    try {
      const transactionsQuery = `
        SELECT 
          t.id,
          t.user_id,
          t.type,
          t.amount,
          t.currency,
          t.status,
          t.created_at,
          t.screenshot_url,
          t.admin_notes,
          u.first_name || ' ' || u.last_name as user_name,
          u.email as user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 50
      `

      const result = await query(transactionsQuery)
      return result.rows
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return []
    }
  },

  async updateUserStatus(userId: number, status: string) {
    try {
      const updateQuery = `
        UPDATE users 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND role != 'super_admin'
        RETURNING id, first_name, last_name, email, status
      `

      const result = await query(updateQuery, [status, userId])
      return result.rows[0]
    } catch (error) {
      console.error("Error updating user status:", error)
      throw error
    }
  },

  async updateTransactionStatus(transactionId: number, status: string, adminNotes?: string) {
    try {
      const updateQuery = `
        UPDATE transactions 
        SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, type, amount, currency, status
      `

      const result = await query(updateQuery, [status, adminNotes || null, transactionId])
      return result.rows[0]
    } catch (error) {
      console.error("Error updating transaction status:", error)
      throw error
    }
  },

  async getUserById(userId: number) {
    try {
      const userQuery = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.status,
          u.role,
          u.created_at,
          u.last_login,
          COALESCE(SUM(ui.amount), 0) as total_invested,
          COUNT(ui.id) as total_investments
        FROM users u
        LEFT JOIN user_investments ui ON u.id = ui.user_id
        WHERE u.id = $1
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.status, u.role, u.created_at, u.last_login
      `

      const result = await query(userQuery, [userId])
      return result.rows[0]
    } catch (error) {
      console.error("Error fetching user by ID:", error)
      return null
    }
  },

  async getTransactionById(transactionId: number) {
    try {
      const transactionQuery = `
        SELECT 
          t.*,
          u.first_name || ' ' || u.last_name as user_name,
          u.email as user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = $1
      `

      const result = await query(transactionQuery, [transactionId])
      return result.rows[0]
    } catch (error) {
      console.error("Error fetching transaction by ID:", error)
      return null
    }
  },
}
