-- Fix Real Fire22 Agent IDs - D1 Compatible
-- Update database with correct agent IDs matching our D1 schema

-- Update existing agents with real Fire22 configuration
UPDATE agents SET 
    username = CASE agent_id
        WHEN 'BLAKEPPH' THEN 'blakepph'  
        WHEN 'DAKOMA' THEN 'dakoma'
        WHEN 'SCRAMPOST' THEN 'scrampost'
        WHEN 'SPEN' THEN 'spen'
        ELSE username
    END,
    first_name = CASE agent_id
        WHEN 'BLAKEPPH' THEN 'Blake'
        WHEN 'DAKOMA' THEN 'Dakota' 
        WHEN 'SCRAMPOST' THEN 'Sam'
        WHEN 'SPEN' THEN 'Spencer'
        ELSE first_name
    END,
    last_name = CASE agent_id
        WHEN 'BLAKEPPH' THEN 'Phillips'
        WHEN 'DAKOMA' THEN 'Martinez'
        WHEN 'SCRAMPOST' THEN 'Crawford'
        WHEN 'SPEN' THEN 'Nelson'
        ELSE last_name
    END,
    email = CASE agent_id
        WHEN 'BLAKEPPH' THEN 'blake@fire22.com'
        WHEN 'DAKOMA' THEN 'dakota@fire22.com'
        WHEN 'SCRAMPOST' THEN 'scrampost@fire22.com'
        WHEN 'SPEN' THEN 'spencer@fire22.com'
        ELSE email
    END,
    agent_type = CASE agent_id
        WHEN 'BLAKEPPH' THEN 'master'
        WHEN 'DAKOMA' THEN 'senior'
        WHEN 'SCRAMPOST' THEN 'regular'
        WHEN 'SPEN' THEN 'regular'
        ELSE agent_type
    END,
    commission_percentage = CASE agent_id
        WHEN 'BLAKEPPH' THEN 15.00
        WHEN 'DAKOMA' THEN 12.50
        WHEN 'SCRAMPOST' THEN 10.00
        WHEN 'SPEN' THEN 10.00
        ELSE commission_percentage
    END,
    level = CASE agent_id
        WHEN 'BLAKEPPH' THEN 1
        WHEN 'DAKOMA' THEN 2
        WHEN 'SCRAMPOST' THEN 3
        WHEN 'SPEN' THEN 3
        ELSE level
    END,
    status = 'active'
WHERE agent_id IN ('BLAKEPPH', 'DAKOMA', 'SCRAMPOST', 'SPEN');

-- Update agent statistics based on their players
UPDATE agents SET 
    total_players = (
        SELECT COUNT(*) FROM players WHERE players.agent_id = agents.agent_id
    ),
    total_volume = (
        SELECT COALESCE(SUM(lifetime_volume), 0) FROM players WHERE players.agent_id = agents.agent_id
    ),
    total_commission = (
        SELECT COALESCE(SUM(lifetime_volume * 0.05), 0) FROM players WHERE players.agent_id = agents.agent_id
    )
WHERE agent_id IN ('BLAKEPPH', 'DAKOMA', 'SCRAMPOST', 'SPEN');