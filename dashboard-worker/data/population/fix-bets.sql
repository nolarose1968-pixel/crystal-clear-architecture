-- Fix Bet Stakes and Payouts
-- Update bets to have realistic stake amounts

-- Fix bet stakes to be reasonable amounts
UPDATE bets SET 
    stake = ROUND(
        CASE 
            WHEN substr(bet_id, -1) IN ('0', '5') THEN 25.00 + (ABS(CAST(substr(bet_id, -2) AS INTEGER)) % 475)    -- $25-$500
            WHEN substr(bet_id, -1) IN ('1', '6') THEN 50.00 + (ABS(CAST(substr(bet_id, -2) AS INTEGER)) % 950)    -- $50-$1000  
            WHEN substr(bet_id, -1) IN ('2', '7') THEN 100.00 + (ABS(CAST(substr(bet_id, -2) AS INTEGER)) % 1900)  -- $100-$2000
            WHEN substr(bet_id, -1) IN ('3', '8') THEN 250.00 + (ABS(CAST(substr(bet_id, -2) AS INTEGER)) % 2250)  -- $250-$2500
            ELSE 75.00 + (ABS(CAST(substr(bet_id, -2) AS INTEGER)) % 425)  -- $75-$500
        END, 2
    )
WHERE bet_id IS NOT NULL;

-- Update to_win based on typical -110 odds (approximately 0.91 ratio)
UPDATE bets SET 
    to_win = ROUND(stake * 0.91, 2)
WHERE bet_id IS NOT NULL;

-- Update potential_payout (stake + to_win)
UPDATE bets SET 
    potential_payout = ROUND(stake + to_win, 2)
WHERE bet_id IS NOT NULL;

-- Update actual_payout for winning bets
UPDATE bets SET 
    actual_payout = potential_payout,
    commission_rate = 0.025,
    commission_amount = ROUND(stake * 0.025, 2)
WHERE status = 'won';

-- Create some additional bets to show more realistic volume per agent
-- Add more bets for each agent to show realistic activity

INSERT OR IGNORE INTO bets (
    bet_id, player_id, agent_id, game_id, bet_type, bet_category,
    selection, odds, stake, to_win, potential_payout, status,
    placed_at, accepted_at, settled_at
)
SELECT 
    'BET_EXTRA_' || p.customer_id || '_' || CAST(((ABS(CAST(substr(p.customer_id, -3) AS INTEGER)) % 5) + 1) AS TEXT) as bet_id,
    p.player_id,
    p.agent_id,
    (CASE (ABS(CAST(substr(p.customer_id, -1) AS INTEGER)) % 4)
        WHEN 0 THEN 'NFL_2024_001'
        WHEN 1 THEN 'NBA_2024_001' 
        WHEN 2 THEN 'NFL_2024_002'
        ELSE 'NBA_2024_002'
    END) as game_id,
    (CASE (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 5)
        WHEN 0 THEN 'moneyline'
        WHEN 1 THEN 'spread'
        WHEN 2 THEN 'total'
        WHEN 3 THEN 'prop'
        ELSE 'moneyline'
    END) as bet_type,
    'pre_game' as bet_category,
    (CASE (ABS(CAST(substr(p.customer_id, -1) AS INTEGER)) % 6)
        WHEN 0 THEN 'Home Team -3.5'
        WHEN 1 THEN 'Away Team +3.5'
        WHEN 2 THEN 'Over 45.5'
        WHEN 3 THEN 'Under 45.5'
        WHEN 4 THEN 'Home Team Moneyline'
        ELSE 'Away Team Moneyline'
    END) as selection,
    -110 as odds,
    ROUND(
        CASE 
            WHEN p.account_type = 'vip' THEN 100.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 1400)
            WHEN p.account_type = 'premium' THEN 50.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 950)
            ELSE 25.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 475)
        END, 2
    ) as stake,
    ROUND(
        CASE 
            WHEN p.account_type = 'vip' THEN (100.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 1400)) * 0.91
            WHEN p.account_type = 'premium' THEN (50.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 950)) * 0.91
            ELSE (25.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 475)) * 0.91
        END, 2
    ) as to_win,
    ROUND(
        CASE 
            WHEN p.account_type = 'vip' THEN (100.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 1400)) * 1.91
            WHEN p.account_type = 'premium' THEN (50.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 950)) * 1.91
            ELSE (25.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 475)) * 1.91
        END, 2
    ) as potential_payout,
    (CASE (ABS(CAST(substr(p.customer_id, -1) AS INTEGER)) % 12)
        WHEN 0 THEN 'won'
        WHEN 1 THEN 'won' 
        WHEN 2 THEN 'won'
        WHEN 3 THEN 'won'
        WHEN 4 THEN 'won'  -- 5/12 = ~42% win rate
        WHEN 10 THEN 'pending'
        WHEN 11 THEN 'pushed'
        ELSE 'lost'  -- 5/12 = ~42% loss rate, rest pending/push
    END) as status,
    datetime('now', '-' || (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 4320 + 60) || ' minutes') as placed_at,
    datetime('now', '-' || (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 4320 + 55) || ' minutes') as accepted_at,
    CASE 
        WHEN (ABS(CAST(substr(p.customer_id, -1) AS INTEGER)) % 12) < 10 THEN datetime('now', '-' || (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 2880 + 30) || ' minutes')
        ELSE NULL
    END as settled_at
FROM players p
WHERE 
    p.status = 'active' 
    AND (ABS(CAST(substr(p.customer_id, -3) AS INTEGER)) % 10) < 8  -- ~80% of players have extra bets
    AND p.player_id NOT LIKE '%999%'  -- Skip some players to vary activity
LIMIT 15000;  -- Add about 15,000 more bets

-- Update actual payouts for winning extra bets
UPDATE bets SET 
    actual_payout = potential_payout,
    commission_rate = 0.025,
    commission_amount = ROUND(stake * 0.025, 2)
WHERE bet_id LIKE 'BET_EXTRA_%' AND status = 'won';