-- Fix Player Financial Data
-- Replace extreme RANDOM() values with realistic amounts

-- First, let's fix the player financial fields with realistic values
UPDATE players SET 
    outstanding_balance = ROUND(
        credit_limit * (
            CASE 
                WHEN account_type = 'vip' THEN (ABS(CAST(substr(player_id, -3) AS INTEGER) % 80) + 10) / 100.0
                WHEN account_type = 'premium' THEN (ABS(CAST(substr(player_id, -3) AS INTEGER) % 60) + 5) / 100.0  
                ELSE (ABS(CAST(substr(player_id, -3) AS INTEGER) % 40) + 5) / 100.0
            END
        ), 2
    ),
    total_deposits = ROUND(
        credit_limit * (
            CASE 
                WHEN account_type = 'vip' THEN (ABS(CAST(substr(player_id, -2) AS INTEGER) % 5) + 2)
                WHEN account_type = 'premium' THEN (ABS(CAST(substr(player_id, -2) AS INTEGER) % 4) + 1.5)  
                ELSE (ABS(CAST(substr(player_id, -2) AS INTEGER) % 3) + 1)
            END
        ), 2
    ),
    total_withdrawals = ROUND(
        credit_limit * (
            CASE 
                WHEN account_type = 'vip' THEN (ABS(CAST(substr(player_id, -2) AS INTEGER) % 3) + 0.5)
                WHEN account_type = 'premium' THEN (ABS(CAST(substr(player_id, -2) AS INTEGER) % 2) + 0.3)  
                ELSE (ABS(CAST(substr(player_id, -2) AS INTEGER) % 2) + 0.1)
            END
        ), 2
    ),
    lifetime_volume = ROUND(
        credit_limit * (
            CASE 
                WHEN account_type = 'vip' THEN (ABS(CAST(substr(player_id, -3) AS INTEGER) % 20) + 10)
                WHEN account_type = 'premium' THEN (ABS(CAST(substr(player_id, -3) AS INTEGER) % 15) + 8)  
                ELSE (ABS(CAST(substr(player_id, -3) AS INTEGER) % 10) + 5)
            END
        ), 2
    ),
    lifetime_winnings = ROUND(
        lifetime_volume * (
            CASE 
                WHEN (ABS(CAST(substr(player_id, -2) AS INTEGER)) % 100) < 45 THEN 0.52  -- 45% are winning players
                WHEN (ABS(CAST(substr(player_id, -2) AS INTEGER)) % 100) < 85 THEN 0.48  -- 40% break even-ish
                ELSE 0.35  -- 15% are big losers
            END
        ), 2
    )
WHERE player_id IS NOT NULL;

-- Calculate lifetime losses based on winnings
UPDATE players SET 
    lifetime_losses = ROUND(lifetime_volume - lifetime_winnings, 2)
WHERE player_id IS NOT NULL;

-- Update available credit
UPDATE players SET 
    available_credit = ROUND(credit_limit - outstanding_balance, 2)
WHERE player_id IS NOT NULL;

-- Update betting limits to be more realistic
UPDATE players SET 
    max_bet_limit = ROUND(
        CASE 
            WHEN credit_limit >= 100000 THEN credit_limit * 0.15
            WHEN credit_limit >= 50000 THEN credit_limit * 0.12
            WHEN credit_limit >= 20000 THEN credit_limit * 0.10
            ELSE credit_limit * 0.08
        END, 2
    ),
    daily_bet_limit = ROUND(
        CASE 
            WHEN credit_limit >= 100000 THEN credit_limit * 0.6
            WHEN credit_limit >= 50000 THEN credit_limit * 0.5
            ELSE credit_limit * 0.4
        END, 2
    ),
    weekly_bet_limit = ROUND(credit_limit * 2.5, 2)
WHERE player_id IS NOT NULL;

-- Fix risk scores to be reasonable (0-100)
UPDATE players SET 
    risk_score = ABS(CAST(substr(player_id, -2) AS INTEGER)) % 101,
    risk_level = CASE 
        WHEN (ABS(CAST(substr(player_id, -2) AS INTEGER)) % 101) >= 80 THEN 'high'
        WHEN (ABS(CAST(substr(player_id, -2) AS INTEGER)) % 101) >= 50 THEN 'medium' 
        ELSE 'low'
    END
WHERE player_id IS NOT NULL;

-- Update last activity dates to be more realistic
UPDATE players SET 
    last_login_at = datetime('now', '-' || (ABS(CAST(substr(player_id, -2) AS INTEGER)) % 30) || ' days'),
    last_bet_at = datetime('now', '-' || (ABS(CAST(substr(player_id, -2) AS INTEGER)) % 7) || ' days')
WHERE player_id IS NOT NULL;