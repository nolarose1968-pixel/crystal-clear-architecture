#!/usr/bin/env node

/**
 * Fire22 Dashboard Database Setup Script
 * Creates PostgreSQL tables matching Fire22 schema
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://postgres:testpass123@localhost:5432/fire22_dashboard',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const createTablesSQL = `
-- Players table (matches Fire22 customer structure)
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  settle DECIMAL(10,2) DEFAULT 0,
  carry DECIMAL(10,2) DEFAULT 0,
  tue_pnl DECIMAL(10,2) DEFAULT 0,
  wed_pnl DECIMAL(10,2) DEFAULT 0,
  thu_pnl DECIMAL(10,2) DEFAULT 0,
  fri_pnl DECIMAL(10,2) DEFAULT 0,
  sat_pnl DECIMAL(10,2) DEFAULT 0,
  sun_pnl DECIMAL(10,2) DEFAULT 0,
  mon_pnl DECIMAL(10,2) DEFAULT 0,
  week_total DECIMAL(10,2) DEFAULT 0,
  deposits_withdrawals DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  pending DECIMAL(10,2) DEFAULT 0,
  last_ticket VARCHAR(50),
  last_login VARCHAR(50),
  agent_id VARCHAR(50) DEFAULT 'BLAKEPPH',
  active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Fire22 specific fields
  credit_limit INTEGER DEFAULT 0,
  wager_limit INTEGER DEFAULT 100000,
  casino_balance INTEGER DEFAULT 0,
  freeplay_balance INTEGER DEFAULT 0,
  master_agent TEXT DEFAULT '',
  casino_active INTEGER DEFAULT 1,
  sportsbook_active INTEGER DEFAULT 1,
  notes TEXT DEFAULT ''
);

-- Wagers table (matches Fire22 wager structure)
CREATE TABLE IF NOT EXISTS wagers (
  id SERIAL PRIMARY KEY,
  wager_number BIGINT UNIQUE NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  wager_type VARCHAR(10) NOT NULL, -- M, S, I, P (Moneyline, Spread, Total, Parlay)
  amount_wagered DECIMAL(10,2) NOT NULL,
  to_win_amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, won, lost, cancelled
  vip INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES players(customer_id)
);

-- Agents table (Fire22 hierarchy)
CREATE TABLE IF NOT EXISTS agents (
  agent_id VARCHAR(50) PRIMARY KEY,
  agent_name VARCHAR(255),
  agent_type VARCHAR(10), -- 'M' for Master, 'A' for Agent
  parent_agent VARCHAR(50),
  master_agent VARCHAR(255),
  active INTEGER DEFAULT 1,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_agent) REFERENCES agents(agent_id)
);

-- Wager limits table
CREATE TABLE IF NOT EXISTS wager_limits (
  customer_id VARCHAR(50) PRIMARY KEY,
  parlay_max_bet INTEGER DEFAULT 0,
  parlay_max_payout INTEGER DEFAULT 2500000,
  teaser_max_bet INTEGER DEFAULT 0,
  contest_max_bet INTEGER DEFAULT 0,
  max_contest_price INTEGER DEFAULT 10000,
  max_prop_payout INTEGER DEFAULT 10000,
  max_soccer_bet INTEGER DEFAULT 0,
  max_money_line INTEGER DEFAULT 0,
  
  FOREIGN KEY (customer_id) REFERENCES players(customer_id)
);

-- Customer activity tracking
CREATE TABLE IF NOT EXISTS customer_activity (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(50),
  activity_type VARCHAR(50), -- 'login', 'wager', 'deposit', 'withdrawal'
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  ip_address VARCHAR(45),
  
  FOREIGN KEY (customer_id) REFERENCES players(customer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_customer_id ON players(customer_id);
CREATE INDEX IF NOT EXISTS idx_players_agent_id ON players(agent_id);
CREATE INDEX IF NOT EXISTS idx_wagers_customer_id ON wagers(customer_id);
CREATE INDEX IF NOT EXISTS idx_wagers_agent_id ON wagers(agent_id);
CREATE INDEX IF NOT EXISTS idx_wagers_status ON wagers(status);
CREATE INDEX IF NOT EXISTS idx_wagers_created_at ON wagers(created_at);
CREATE INDEX IF NOT EXISTS idx_agents_parent_agent ON agents(parent_agent);
CREATE INDEX IF NOT EXISTS idx_customer_activity_customer_id ON customer_activity(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_activity_date ON customer_activity(activity_date);
`;

const insertSampleData = `
-- Insert sample agent hierarchy
INSERT INTO agents (agent_id, agent_name, agent_type, parent_agent, master_agent) VALUES
('CSCALVIN', 'Master Agent Calvin', 'M', NULL, 'CSCALVIN'),
('CSMIYUKI', 'Agent Miyuki', 'A', 'CSCALVIN', 'CSCALVIN'),
('CSMARIANA', 'Agent Mariana', 'A', 'CSMIYUKI', 'CSCALVIN'),
('CSMARCUS', 'Agent Marcus', 'A', 'CSMARIANA', 'CSCALVIN'),
('BLAKEPPH2', 'Agent Blake PPH2', 'A', 'CSMARCUS', 'CSCALVIN'),
('VALL', 'Agent Vall', 'A', 'BLAKEPPH2', 'CSCALVIN'),
('BLAKEPPH', 'Agent Blake PPH', 'A', 'CSMARCUS', 'CSCALVIN')
ON CONFLICT (agent_id) DO NOTHING;

-- Insert sample players (Fire22 real customers)
INSERT INTO players (
  customer_id, name, password, phone, email, 
  balance, credit_limit, wager_limit, settle, 
  casino_balance, freeplay_balance, pending, 
  agent_id, master_agent, active, casino_active, sportsbook_active, notes
) VALUES
('BBS110', 'Javier', 'cached', '(195) 645-9895', '', 0, 0, 100000, 10000, 0, 0, 0, 'VALL', 'CSCALVIN/CSMIYUKI/CSMARIANA/CSMARCUS/BLAKEPPH2', 1, 1, 1, 'Referral: VALL Deal FP: N/A Notes: None'),
('BBS111', 'Carlos', 'cached', '(956) 293-8614', '', 0, 0, 100000, 10000, 0, 1, 0, 'VALL', 'CSCALVIN/CSMIYUKI/CSMARIANA/CSMARCUS/BLAKEPPH2', 1, 1, 1, 'Referral: VALL Deal FP: N/A tele handle @hurxie'),
('BBS112', 'Juan Anguiano', 'shared', '(195) 643-2106', '', 5000, 0, 100000, 10000, 0, 100, 0, 'VALL', 'CSCALVIN/CSMIYUKI/CSMARIANA/CSMARCUS/BLAKEPPH2', 1, 1, 1, 'Referral: VALL Deal FP: N/A Notes: None'),
('BBS113', 'Nathaniel Garcia', 'beef', '(956) 369-3691', '', 50, 0, 100000, 10000, 0, 0, 0, 'VALL', 'CSCALVIN/CSMIYUKI/CSMARIANA/CSMARCUS/BLAKEPPH2', 1, 1, 1, 'Referral: VALL Deal FP: N/A Notes: None'),
('BBS114', 'Andres', 'stays', '(956) 315-0817', '', 25, 0, 100000, 10000, 0, 1, 0, 'VALL', 'CSCALVIN/CSMIYUKI/CSMARIANA/CSMARCUS/BLAKEPPH2', 1, 1, 1, 'Referral: VALL Deal FP: N/A Notes: None')
ON CONFLICT (customer_id) DO NOTHING;

-- Insert sample wagers
INSERT INTO wagers (customer_id, wager_number, agent_id, wager_type, amount_wagered, to_win_amount, description, status, vip) VALUES
('BBS112', 892961050, 'VALL', 'M', 1000, 1100, 'NFL #101 Cowboys -3 -110', 'pending', 0),
('BBS111', 892961051, 'VALL', 'S', 500, 950, 'NBA #205 Lakers +190', 'pending', 0),
('BBS113', 892961052, 'VALL', 'I', 250, 475, 'MLB #88 Rangers O 8.5 +190', 'pending', 0),
('BBS114', 892961053, 'VALL', 'M', 50, 95, 'Soccer #45 Barcelona -1.5 +190', 'pending', 0),
('BBS110', 892961054, 'VALL', 'P', 100, 1300, 'NFL Parlay - 3 Teams', 'pending', 0)
ON CONFLICT (wager_number) DO NOTHING;

-- Insert wager limits
INSERT INTO wager_limits (customer_id, parlay_max_payout, max_contest_price, max_prop_payout) 
SELECT customer_id, 2500000, 10000, 10000 FROM players WHERE customer_id LIKE 'BBS%'
ON CONFLICT (customer_id) DO NOTHING;
`;

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Fire22 Dashboard Database...');

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Create tables
    console.log('📋 Creating tables...');
    await pool.query(createTablesSQL);
    console.log('✅ Tables created successfully');

    // Insert sample data
    console.log('📊 Inserting sample data...');
    await pool.query(insertSampleData);
    console.log('✅ Sample data inserted successfully');

    // Verify setup
    const playerCount = await pool.query('SELECT COUNT(*) FROM players');
    const wagerCount = await pool.query('SELECT COUNT(*) FROM wagers');
    const agentCount = await pool.query('SELECT COUNT(*) FROM agents');

    console.log('🎯 Database setup complete!');
    console.log(`   Players: ${playerCount.rows[0].count}`);
    console.log(`   Wagers: ${wagerCount.rows[0].count}`);
    console.log(`   Agents: ${agentCount.rows[0].count}`);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
