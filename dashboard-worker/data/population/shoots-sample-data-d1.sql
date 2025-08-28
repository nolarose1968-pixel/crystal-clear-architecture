-- Sample SHOOTS Agent Player Data - D1 Compatible
-- Based on real Fire22 data patterns, adapted to our players table schema

-- Insert SHOOTS/SCRAMPOST customers with real data patterns
INSERT OR IGNORE INTO players (
    player_id, customer_id, agent_id, username, first_name, last_name, phone,
    outstanding_balance, credit_limit, account_type, status, last_login_at
) VALUES
-- High credit customers ($10,000 limit)
('PLR_BB2209', 'BB2209', 'SCRAMPOST', 'BB2209', 'J', 'Tran', '+1 (832) 287 77 93', 
 0.76, 10000, 'premium', 'active', datetime('now', '-30 days')),

('PLR_BB2251', 'BB2251', 'SCRAMPOST', 'BB2251', 'Santi', 'Rodriguez', '(857) 383-1654', 
 0, 10000, 'premium', 'active', datetime('now', '-45 days')),

('PLR_BB2326', 'BB2326', 'SCRAMPOST', 'BB2326', 'Lee', 'Jones', '(713) 902-7055', 
 0.44, 10000, 'premium', 'active', datetime('now', '-15 days')),

-- Low credit customer ($2,000 limit)
('PLR_BB2147', 'BB2147', 'SCRAMPOST', 'BB2147', 'Taj', 'Ahmed', '', 
 0.88, 2000, 'regular', 'active', datetime('now', '-60 days')),

-- Problem customers (negative balances, suspended accounts)
('PLR_BB2155', 'BB2155', 'SCRAMPOST', 'BB2155', 'Chicago', 'Smith', '(312) 718-5278', 
 1449.51, 5000, 'regular', 'suspended', datetime('now', '-120 days')),

('PLR_BB2322', 'BB2322', 'SCRAMPOST', 'BB2322', 'Roberty', 'Gypsy', '(832) 829-9200', 
 1097.20, 3000, 'regular', 'active', datetime('now', '-10 days')),

-- Additional SCRAMPOST players to match agent hierarchy
('PLR_SP7001', 'SP7001', 'SCRAMPOST', 'fastbet77', 'Carlos', 'Martinez', '(555) 123-4567',
 450.00, 7500, 'vip', 'active', datetime('now', '-5 days')),

('PLR_SP7002', 'SP7002', 'SCRAMPOST', 'luckyplayer', 'Maria', 'Garcia', '(555) 234-5678',
 0, 5000, 'premium', 'active', datetime('now', '-20 days')),

('PLR_SP7003', 'SP7003', 'SCRAMPOST', 'highroller99', 'Diego', 'Rodriguez', '(555) 345-6789',
 2250.75, 15000, 'vip', 'active', datetime('now', '-3 days'));

-- Update financial data for these players
UPDATE players SET 
    total_deposits = ROUND(credit_limit * 1.5, 2),
    total_withdrawals = ROUND(credit_limit * 0.8, 2),
    lifetime_volume = ROUND(credit_limit * 8, 2),
    lifetime_winnings = ROUND(lifetime_volume * 0.42, 2),
    lifetime_losses = ROUND(lifetime_volume * 0.48, 2),
    available_credit = credit_limit - outstanding_balance,
    max_bet_limit = ROUND(credit_limit * 0.15, 2),
    daily_bet_limit = ROUND(credit_limit * 0.4, 2),
    weekly_bet_limit = ROUND(credit_limit * 1.8, 2),
    risk_score = CASE 
        WHEN status = 'suspended' THEN 85
        WHEN outstanding_balance > credit_limit * 0.8 THEN 75
        WHEN account_type = 'vip' THEN 45
        ELSE 25
    END,
    risk_level = CASE 
        WHEN risk_score >= 80 THEN 'high'
        WHEN risk_score >= 50 THEN 'medium'
        ELSE 'low'
    END
WHERE customer_id LIKE 'BB%' OR customer_id LIKE 'SP70%';