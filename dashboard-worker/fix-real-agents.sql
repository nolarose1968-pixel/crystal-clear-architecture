-- Fix Real Fire22 Agent IDs
-- Update database with correct agent IDs from your system

-- Delete test agents and insert real ones
DELETE FROM agents;
DELETE FROM agent_permissions;

-- Insert real agents with proper configuration
INSERT OR REPLACE INTO agents (
  agent_id, agent_name, agent_type, status, can_place_bet, 
  internet_rate, casino_rate, sports_rate, credit_limit,
  created_at, updated_at, activated_at
) VALUES 
('BLAKEPPH', 'Blake PPH Agent', 'agent', 'active', 1, 2.50, 2.00, 3.00, 50000.00, datetime('now'), datetime('now'), datetime('now')),
('DAKOMA', 'Dakoma Agent', 'agent', 'active', 1, 2.25, 1.75, 2.75, 40000.00, datetime('now'), datetime('now'), datetime('now')),
('SCRAMPOST', 'Scram Post Agent', 'agent', 'active', 1, 2.00, 1.50, 2.50, 35000.00, datetime('now'), datetime('now'), datetime('now')),
('SPEN', 'Spen Agent', 'agent', 'active', 1, 2.75, 2.25, 3.25, 60000.00, datetime('now'), datetime('now'), datetime('now'));

-- Insert permissions for real agents
INSERT OR REPLACE INTO agent_permissions (agent_id, permission_name, permission_value) VALUES
('BLAKEPPH', 'place_bet', 1),
('BLAKEPPH', 'view_reports', 1),
('BLAKEPPH', 'manage_players', 1),
('DAKOMA', 'place_bet', 1),
('DAKOMA', 'view_reports', 1),
('DAKOMA', 'manage_players', 1),
('SCRAMPOST', 'place_bet', 1),
('SCRAMPOST', 'view_reports', 1),
('SCRAMPOST', 'manage_players', 1),
('SPEN', 'place_bet', 1),
('SPEN', 'view_reports', 1),
('SPEN', 'manage_players', 1);