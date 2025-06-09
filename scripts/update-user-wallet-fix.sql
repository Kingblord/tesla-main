-- Add wallet balance column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='wallet_balance') THEN
        ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(15,2) DEFAULT 0.00;
    END IF;
END $$;

-- Create wallet transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit', 'investment', 'return'
    description TEXT,
    admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update existing users to have 0 balance if wallet_balance exists
UPDATE users SET wallet_balance = 0.00 WHERE wallet_balance IS NULL;

-- Verify the changes
SELECT 
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='wallet_balance'
    ) AS wallet_column_exists,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name='wallet_transactions'
    ) AS transactions_table_exists;
