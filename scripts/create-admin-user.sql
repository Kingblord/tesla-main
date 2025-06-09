-- Create or update admin user with properly hashed password
-- Password: admin123

-- First, let's check if the user exists
DO $$
BEGIN
    -- Delete existing admin user if exists to avoid conflicts
    DELETE FROM users WHERE email = 'admin@teslainvest.com';
    
    -- Insert new admin user with fresh password hash
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
        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Admin',
        'User',
        'super_admin',
        'active',
        true,
        'ADMIN001',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Admin user created successfully';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating admin user: %', SQLERRM;
END $$;

-- Verify the user was created
SELECT id, email, first_name, last_name, role, status, email_verified 
FROM users 
WHERE email = 'admin@teslainvest.com';
