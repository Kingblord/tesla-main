-- Seed data for Tesla Investment Platform

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
('maintenance_mode', 'false', 'Platform maintenance mode status'),
('registration_enabled', 'true', 'New user registration status'),
('two_fa_required', 'false', 'Require 2FA for all users');

-- Insert sample admin user (password should be hashed in real implementation)
INSERT INTO users (email, password_hash, first_name, last_name, referral_code, status) VALUES
('admin@teslainvest.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDxy', 'Admin', 'User', 'ADMIN001', 'active');

-- Insert sample users for testing
INSERT INTO users (email, password_hash, first_name, last_name, phone, referral_code, status) VALUES
('john.doe@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDxy', 'John', 'Doe', '+1234567890', 'TESLA001', 'active'),
('jane.smith@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDxy', 'Jane', 'Smith', '+1234567891', 'TESLA002', 'active'),
('mike.johnson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDxy', 'Mike', 'Johnson', '+1234567892', 'TESLA003', 'active');

-- Create wallets for sample users
INSERT INTO wallets (user_id, currency, balance, address) VALUES
(2, 'BTC', 0.15432, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'),
(2, 'ETH', 2.5643, '0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4'),
(2, 'USDT', 1250.00, 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'),
(3, 'BTC', 0.08234, '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'),
(3, 'ETH', 1.2345, '0x8ba1f109551bD432803012645Hac136c22C4C4C4'),
(3, 'USDT', 800.00, 'TLa2f6VPqDgRE57B1tGb8SXQN5n4ByEwYP'),
(4, 'BTC', 0.25678, '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX'),
(4, 'ETH', 3.4567, '0x123f681646d4a755815f9CB19e1acc8565a0c2ac'),
(4, 'USDT', 2000.00, 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');

-- Insert sample investments
INSERT INTO user_investments (user_id, plan_id, amount, currency, start_date, end_date, daily_return, total_earned, status) VALUES
(2, 2, 0.1, 'BTC', '2024-01-15', '2024-03-01', 0.0032, 0.032, 'active'),
(2, 4, 1.5, 'ETH', '2024-01-20', '2024-03-21', 0.042, 0.15, 'active'),
(3, 1, 0.05, 'BTC', '2024-01-10', '2024-02-09', 0.00125, 0.0375, 'completed'),
(4, 3, 1.0, 'BTC', '2024-01-25', '2024-03-26', 0.041, 0.082, 'active');

-- Insert sample transactions
INSERT INTO transactions (user_id, type, amount, currency, status, transaction_hash, wallet_address) VALUES
(2, 'deposit', 0.1, 'BTC', 'completed', '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'),
(2, 'earning', 0.0032, 'BTC', 'completed', NULL, NULL),
(3, 'deposit', 0.05, 'BTC', 'completed', '2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a', '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'),
(3, 'withdrawal', 0.02, 'BTC', 'pending', NULL, '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'),
(4, 'deposit', 1.0, 'BTC', 'completed', '3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b', '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX');

-- Insert sample daily earnings
INSERT INTO daily_earnings (investment_id, user_id, amount, currency, earning_date, processed) VALUES
(1, 2, 0.0032, 'BTC', '2024-01-16', true),
(1, 2, 0.0032, 'BTC', '2024-01-17', true),
(1, 2, 0.0032, 'BTC', '2024-01-18', true),
(2, 2, 0.042, 'ETH', '2024-01-21', true),
(2, 2, 0.042, 'ETH', '2024-01-22', true),
(4, 4, 0.041, 'BTC', '2024-01-26', true),
(4, 4, 0.041, 'BTC', '2024-01-27', true);

-- Insert sample referrals
INSERT INTO referrals (referrer_id, referred_id, commission_rate, total_earned, status) VALUES
(2, 3, 5.00, 0.0025, 'active'),
(2, 4, 5.00, 0.005, 'active');

-- Insert sample support tickets
INSERT INTO support_tickets (user_id, subject, message, status, priority) VALUES
(2, 'Withdrawal Delay', 'My withdrawal has been pending for 24 hours. Can you please check the status?', 'open', 'medium'),
(3, 'Investment Question', 'I would like to know more about the Tesla Elite plan. What are the risks involved?', 'resolved', 'low'),
(4, 'Account Security', 'I want to enable 2FA on my account. How can I do this?', 'in_progress', 'high');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, read) VALUES
(2, 'Investment Activated', 'Your Tesla Pro investment of 0.1 BTC has been activated successfully.', 'investment', false),
(2, 'Daily Earning', 'You have earned 0.0032 BTC from your Tesla Pro investment today.', 'earning', true),
(3, 'Withdrawal Processed', 'Your withdrawal request of 0.02 BTC is being processed.', 'withdrawal', false),
(4, 'Welcome Bonus', 'Welcome to Tesla Invest! You have received a 5% bonus on your first investment.', 'bonus', true);
