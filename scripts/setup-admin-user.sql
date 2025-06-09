-- Setup Admin User for Tesla Investment Platform
-- Password: admin123

-- First, delete any existing admin user
DELETE FROM users WHERE email = 'admin@teslainvest.com';

-- Create the admin user with a pre-hashed password
-- Password hash for 'admin123' using bcrypt with 12 rounds
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
  '$2a$12$8K1p/a0dUrOOqbnpVkRBTOHRnIkxqhJ5eEE.WuHkOVvVEeHxtO4We',
  'Admin',
  'User',
  'super_admin',
  'active',
  true,
  'ADMIN001',
  NOW(),
  NOW()
);

-- Verify the admin user was created successfully
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  status, 
  email_verified,
  created_at 
FROM users 
WHERE email = 'admin@teslainvest.com';

-- Show confirmation message
SELECT 'Admin user created successfully! Use email: admin@teslainvest.com and password: admin123' as message;
