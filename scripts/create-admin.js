const bcrypt = require("bcryptjs")

async function createAdminUser() {
  try {
    // Hash the password 'admin123'
    const password = "admin123"
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    console.log("=== ADMIN USER SETUP ===")
    console.log("Password: admin123")
    console.log("Hashed Password:", hashedPassword)

    // Test the hash
    const isValid = await bcrypt.compare(password, hashedPassword)
    console.log("Hash verification test:", isValid ? "✅ PASSED" : "❌ FAILED")

    console.log("\n=== SQL COMMAND TO RUN ===")
    console.log("Copy and paste this SQL into your database:")
    console.log("----------------------------------------")

    const sqlCommand = `
-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'admin@teslainvest.com';

-- Create new admin user
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  status, 
  email_verified,
  referral_code,
  created_at,
  updated_at
) VALUES (
  'admin@teslainvest.com',
  '${hashedPassword}',
  'Admin',
  'User',
  'super_admin',
  'active',
  true,
  'ADMIN001',
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT id, email, first_name, last_name, role, status, created_at 
FROM users 
WHERE email = 'admin@teslainvest.com';
`

    console.log(sqlCommand)
    console.log("----------------------------------------")
    console.log("\n=== NEXT STEPS ===")
    console.log("1. Copy the SQL command above")
    console.log("2. Run it in your database")
    console.log("3. Then try logging in with:")
    console.log("   Email: admin@teslainvest.com")
    console.log("   Password: admin123")
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

// Run the function
createAdminUser()
