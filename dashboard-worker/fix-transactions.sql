-- Fix Transaction Amounts and Add Withdrawals
-- Replace extreme RANDOM() values in transactions

-- Update existing deposit transactions to have realistic amounts
UPDATE transactions SET 
    amount = ROUND(
        CASE 
            WHEN substr(transaction_id, -1) IN ('0', '5') THEN 500.00 + (ABS(CAST(substr(transaction_id, -2) AS INTEGER)) % 2000)
            WHEN substr(transaction_id, -1) IN ('1', '6') THEN 1000.00 + (ABS(CAST(substr(transaction_id, -2) AS INTEGER)) % 4000)
            WHEN substr(transaction_id, -1) IN ('2', '7') THEN 2500.00 + (ABS(CAST(substr(transaction_id, -2) AS INTEGER)) % 5000)
            WHEN substr(transaction_id, -1) IN ('3', '8') THEN 5000.00 + (ABS(CAST(substr(transaction_id, -2) AS INTEGER)) % 10000)
            ELSE 1500.00 + (ABS(CAST(substr(transaction_id, -2) AS INTEGER)) % 3000)
        END, 2
    ),
    balance_before = ROUND(
        CASE 
            WHEN substr(transaction_id, -1) IN ('0', '1', '2') THEN (ABS(CAST(substr(transaction_id, -3) AS INTEGER)) % 5000)
            ELSE (ABS(CAST(substr(transaction_id, -3) AS INTEGER)) % 10000)
        END, 2
    )
WHERE transaction_type = 'deposit';

-- Update net_amount to equal amount for deposits (no fees)
UPDATE transactions SET 
    net_amount = amount,
    balance_after = balance_before + amount
WHERE transaction_type = 'deposit';

-- Add some withdrawal transactions for realistic financial picture
INSERT OR IGNORE INTO transactions (
    transaction_id, player_id, agent_id, transaction_type, category,
    amount, net_amount, balance_before, balance_after, status,
    payment_method, description, requested_at, completed_at, created_by
)
SELECT 
    'TXN_WD_' || p.customer_id || '_' || (CAST(substr(p.customer_id, -2) AS INTEGER) % 3 + 1) as transaction_id,
    p.player_id,
    p.agent_id,
    'withdrawal' as transaction_type,
    'financial' as category,
    ROUND(
        CASE 
            WHEN p.account_type = 'vip' THEN 2000.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 8000)
            WHEN p.account_type = 'premium' THEN 1000.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 4000)
            ELSE 500.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 2000)
        END, 2
    ) as amount,
    ROUND(
        CASE 
            WHEN p.account_type = 'vip' THEN (2000.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 8000)) * 0.98
            WHEN p.account_type = 'premium' THEN (1000.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 4000)) * 0.98
            ELSE (500.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 2000)) * 0.98
        END, 2
    ) as net_amount, -- 2% withdrawal fee
    ROUND(p.credit_limit * 0.6, 2) as balance_before,
    ROUND(p.credit_limit * 0.6, 2) - ROUND(
        CASE 
            WHEN p.account_type = 'vip' THEN 2000.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 8000)
            WHEN p.account_type = 'premium' THEN 1000.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 4000)
            ELSE 500.00 + (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 2000)
        END, 2
    ) as balance_after,
    (CASE (ABS(CAST(substr(p.customer_id, -1) AS INTEGER)) % 10)
        WHEN 0 THEN 'pending'
        WHEN 9 THEN 'failed'
        ELSE 'completed'
    END) as status,
    (CASE (ABS(CAST(substr(p.customer_id, -1) AS INTEGER)) % 3)
        WHEN 0 THEN 'bank_transfer'
        WHEN 1 THEN 'check'
        ELSE 'crypto'
    END) as payment_method,
    'Player withdrawal request' as description,
    datetime('now', '-' || (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 720 + 60) || ' minutes') as requested_at,
    datetime('now', '-' || (ABS(CAST(substr(p.customer_id, -2) AS INTEGER)) % 720 + 30) || ' minutes') as completed_at,
    'player' as created_by
FROM players p
WHERE 
    p.status = 'active' 
    AND (ABS(CAST(substr(p.customer_id, -3) AS INTEGER)) % 10) < 4  -- ~40% of players have withdrawals
    AND p.account_type IN ('vip', 'premium'); -- Focus on higher value players first

-- Update bet debit/credit transaction amounts to be realistic
UPDATE transactions SET 
    amount = ROUND(
        CASE 
            WHEN transaction_type = 'bet_debit' THEN 50.00 + (ABS(CAST(substr(transaction_id, -3) AS INTEGER)) % 1500)
            WHEN transaction_type = 'bet_credit' THEN 95.00 + (ABS(CAST(substr(transaction_id, -3) AS INTEGER)) % 2850)  -- ~1.9x for winnings
            ELSE amount
        END, 2
    ),
    balance_before = ROUND((ABS(CAST(substr(transaction_id, -3) AS INTEGER)) % 5000 + 1000), 2)
WHERE transaction_type IN ('bet_debit', 'bet_credit');

-- Update net_amount and balance_after for bet transactions
UPDATE transactions SET 
    net_amount = amount,
    balance_after = CASE 
        WHEN transaction_type = 'bet_debit' THEN balance_before - amount
        WHEN transaction_type = 'bet_credit' THEN balance_before + amount
        ELSE balance_after
    END
WHERE transaction_type IN ('bet_debit', 'bet_credit');