-- Seed production data for Tesla Investment Platform

-- Insert default investment plans
INSERT INTO investment_plans (name, description, min_investment, max_investment, daily_return_rate, duration_days, currency, status) VALUES
('Tesla Starter', 'Perfect for beginners looking to start their Tesla investment journey', 0.001, 0.1, 2.5, 30, 'BTC', 'active'),
('Tesla Pro', 'Advanced plan for experienced investors seeking higher returns', 0.1, 1.0, 3.2, 45, 'BTC', 'active'),
('Tesla Elite', 'Premium plan for high-net-worth individuals', 1.0, 10.0, 4.1, 60, 'BTC', 'active'),
('Tesla ETH Starter', 'Ethereum-based investment plan for crypto enthusiasts', 1.0, 10.0, 2.8, 30, 'ETH', 'active'),
('Tesla USDT Stable', 'Stable coin investment with consistent returns', 100, 50000, 2.0, 90, 'USDT', 'active');

-- Insert admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('platform_name', 'Tesla Invest', 'Platform display name'),
('min_withdrawal_btc', '0.001', 'Minimum withdrawal amount for Bitcoin'),
('min_withdrawal_eth', '0.01', 'Minimum withdrawal amount for Ethereum'),
('min_withdrawal_usdt', '10', 'Minimum withdrawal amount for USDT'),
('withdrawal_fee_btc', '0.0005', 'Withdrawal fee for Bitcoin'),
('withdrawal_fee_eth', '0.005', 'Withdrawal fee for Ethereum'),
('withdrawal_fee_usdt', '5', 'Withdrawal fee for USDT'),
('referral_commission_rate', '5.0', 'Referral commission percentage'),
('max_daily_withdrawal', '10', 'Maximum daily withdrawal limit in BTC equivalent'),
('support_email', 'support@teslainvest.com', 'Support email address'),
('support_phone', '+1-234-567-8900', 'Support phone number'),
('whatsapp_number', '+1234567890', 'WhatsApp support number'),
('telegram_channel', '@teslainvestchannel', 'Telegram channel username'),
('maintenance_mode', 'false', 'Platform maintenance mode status'),
('registration_enabled', 'true', 'New user registration status'),
('two_fa_required', 'false', 'Require 2FA for all users'),
('email_verification_required', 'true', 'Require email verification for new users'),
('max_login_attempts', '5', 'Maximum login attempts before account lock'),
('account_lock_duration', '30', 'Account lock duration in minutes'),
('session_timeout', '7', 'Session timeout in days'),
('btc_price_usd', '45000', 'Current BTC price in USD (updated by cron job)'),
('eth_price_usd', '2500', 'Current ETH price in USD (updated by cron job)'),
('usdt_price_usd', '1', 'Current USDT price in USD');

-- Create default admin user
-- Password: admin123 (hashed with bcrypt)
-- Update the existing admin user to ensure super_admin role and active status
UPDATE users 
SET role = 'super_admin', 
    status = 'active', 
    email_verified = true
WHERE email = 'admin@teslainvest.com';

-- If the update doesn't find the user (in case it doesn't exist yet), insert it
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    status, 
    email_verified,
    referral_code
) 
SELECT 
    'admin@teslainvest.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDxy',
    'Admin',
    'User',
    'super_admin',
    'active',
    true,
    'ADMIN001'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@teslainvest.com'
);

-- Create sample support admin
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    status, 
    email_verified,
    referral_code
) VALUES (
    'support@teslainvest.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDxy',
    'Support',
    'Team',
    'admin',
    'active',
    true,
    'SUPPORT001'
);

COMMIT;
