-- Fire22 Enterprise Web Logs Schema
-- Database: fire22-dashboard (D1)
-- Purpose: Comprehensive web activity tracking with retention policies

-- Main web logs table for all activity tracking
CREATE TABLE IF NOT EXISTS web_logs (
  id TEXT PRIMARY KEY, -- UUID v4
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  log_type TEXT NOT NULL, -- 'transaction', 'wager', 'authentication', 'casino_bet', 'system', 'security'
  action_type TEXT NOT NULL, -- Specific action within the log_type
  customer_id TEXT, -- Fire22 customer ID (BB2212, BCC1537, etc.)
  session_id TEXT, -- Session tracking
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  geo_location TEXT, -- JSON: {"country": "BR", "city": "São Paulo", "region": "SP"}
  device_info TEXT, -- JSON: {"type": "Mobile", "os": "iOS", "browser": "Safari"}
  
  -- Action-specific data (JSON)
  action_data TEXT NOT NULL, -- JSON with action-specific fields
  
  -- Security and compliance
  risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
  is_suspicious BOOLEAN DEFAULT FALSE,
  compliance_flags TEXT, -- JSON array of compliance issues
  
  -- Processing and status
  status TEXT DEFAULT 'processed', -- 'pending', 'processed', 'failed', 'archived'
  processing_time_ms INTEGER,
  
  -- Language and internationalization
  language_code TEXT DEFAULT 'en', -- en, es, pt
  fire22_language_keys TEXT, -- JSON array of L-keys used
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP, -- When moved to R2 storage
  retention_expires_at TIMESTAMP -- Auto-deletion date
);

-- Transaction-specific logs
CREATE TABLE IF NOT EXISTS transaction_logs (
  id TEXT PRIMARY KEY,
  web_log_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'transfer', 'p2p'
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  from_account TEXT,
  to_account TEXT,
  payment_method TEXT, -- 'pix', 'bank_transfer', 'crypto', 'card'
  reference_id TEXT, -- External transaction ID
  bank_details TEXT, -- JSON with bank-specific info
  crypto_details TEXT, -- JSON with crypto-specific info
  fees_applied DECIMAL(10,2) DEFAULT 0.00,
  exchange_rate DECIMAL(10,6), -- If currency conversion
  compliance_checked BOOLEAN DEFAULT FALSE,
  aml_score INTEGER, -- Anti-money laundering score
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (web_log_id) REFERENCES web_logs(id)
);

-- Wager-specific logs
CREATE TABLE IF NOT EXISTS wager_logs (
  id TEXT PRIMARY KEY,
  web_log_id TEXT NOT NULL,
  wager_type TEXT NOT NULL, -- 'sports', 'casino', 'live_casino', 'virtual'
  sport_type TEXT, -- 'football', 'basketball', 'tennis', etc.
  event_id TEXT,
  event_name TEXT,
  market_type TEXT, -- 'match_winner', 'over_under', 'handicap'
  selection TEXT,
  odds DECIMAL(8,3),
  stake_amount DECIMAL(10,2),
  potential_payout DECIMAL(10,2),
  wager_status TEXT, -- 'pending', 'won', 'lost', 'void', 'cashed_out'
  settlement_amount DECIMAL(10,2),
  settlement_time TIMESTAMP,
  bookmaker_limits TEXT, -- JSON with limit details
  is_live_bet BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (web_log_id) REFERENCES web_logs(id)
);

-- Authentication logs
CREATE TABLE IF NOT EXISTS authentication_logs (
  id TEXT PRIMARY KEY,
  web_log_id TEXT NOT NULL,
  auth_type TEXT NOT NULL, -- 'login', 'logout', 'register', 'password_reset', '2fa', 'kyc'
  auth_method TEXT, -- 'password', 'sms', 'email', 'biometric', 'social'
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  login_source TEXT, -- 'web', 'mobile_app', 'api'
  mfa_used BOOLEAN DEFAULT FALSE,
  device_fingerprint TEXT,
  previous_login TIMESTAMP,
  login_streak INTEGER DEFAULT 0,
  password_strength INTEGER, -- 0-100
  account_locked BOOLEAN DEFAULT FALSE,
  lockout_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (web_log_id) REFERENCES web_logs(id)
);

-- Casino betting logs
CREATE TABLE IF NOT EXISTS casino_bet_logs (
  id TEXT PRIMARY KEY,
  web_log_id TEXT NOT NULL,
  game_type TEXT NOT NULL, -- 'blackjack', 'roulette', 'baccarat', 'slots', 'poker'
  game_variant TEXT, -- 'european_roulette', 'texas_holdem', etc.
  table_id TEXT,
  dealer_id TEXT,
  session_id TEXT,
  bet_type TEXT, -- 'main', 'side', 'insurance'
  bet_amount DECIMAL(10,2),
  bet_details TEXT, -- JSON with bet-specific data
  game_result TEXT, -- JSON with detailed game outcome
  payout_amount DECIMAL(10,2) DEFAULT 0.00,
  house_edge DECIMAL(5,4),
  rtp_percentage DECIMAL(5,2), -- Return to Player
  jackpot_contribution DECIMAL(10,2) DEFAULT 0.00,
  is_bonus_bet BOOLEAN DEFAULT FALSE,
  bonus_details TEXT, -- JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (web_log_id) REFERENCES web_logs(id)
);

-- Security incident logs
CREATE TABLE IF NOT EXISTS security_logs (
  id TEXT PRIMARY KEY,
  web_log_id TEXT NOT NULL,
  incident_type TEXT NOT NULL, -- 'fraud_detection', 'unusual_activity', 'rate_limit', 'geo_block'
  severity_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  threat_indicators TEXT, -- JSON array of indicators
  automated_response TEXT, -- JSON of actions taken
  manual_review_required BOOLEAN DEFAULT FALSE,
  investigation_status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  investigator_id TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (web_log_id) REFERENCES web_logs(id)
);

-- Log aggregation and analytics
CREATE TABLE IF NOT EXISTS log_analytics (
  id TEXT PRIMARY KEY,
  date_hour TIMESTAMP NOT NULL, -- Hourly aggregation
  log_type TEXT NOT NULL,
  customer_id TEXT,
  
  -- Counts
  total_events INTEGER DEFAULT 0,
  success_events INTEGER DEFAULT 0,
  failed_events INTEGER DEFAULT 0,
  suspicious_events INTEGER DEFAULT 0,
  
  -- Amounts (for financial events)
  total_amount DECIMAL(15,2) DEFAULT 0.00,
  avg_amount DECIMAL(10,2) DEFAULT 0.00,
  max_amount DECIMAL(10,2) DEFAULT 0.00,
  
  -- Performance metrics
  avg_processing_time_ms INTEGER DEFAULT 0,
  max_processing_time_ms INTEGER DEFAULT 0,
  
  -- Risk metrics
  avg_risk_score INTEGER DEFAULT 0,
  max_risk_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(date_hour, log_type, customer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_web_logs_timestamp ON web_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_logs_customer ON web_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_web_logs_type_action ON web_logs(log_type, action_type);
CREATE INDEX IF NOT EXISTS idx_web_logs_status ON web_logs(status);
CREATE INDEX IF NOT EXISTS idx_web_logs_suspicious ON web_logs(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_web_logs_retention ON web_logs(retention_expires_at);

-- Language-specific indexes for Fire22 multilingual support
CREATE INDEX IF NOT EXISTS idx_web_logs_language ON web_logs(language_code);
CREATE INDEX IF NOT EXISTS idx_web_logs_geo ON web_logs(geo_location);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transaction_logs_type_amount ON transaction_logs(transaction_type, amount);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_reference ON transaction_logs(reference_id);

-- Wager indexes  
CREATE INDEX IF NOT EXISTS idx_wager_logs_sport_event ON wager_logs(sport_type, event_id);
CREATE INDEX IF NOT EXISTS idx_wager_logs_status ON wager_logs(wager_status);

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_auth_logs_success ON authentication_logs(success);
CREATE INDEX IF NOT EXISTS idx_auth_logs_device ON authentication_logs(device_fingerprint);

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity_level);
CREATE INDEX IF NOT EXISTS idx_security_logs_status ON security_logs(investigation_status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_log_analytics_date_type ON log_analytics(date_hour, log_type);

-- Data retention policy triggers (auto-archive to R2)
-- This would be implemented as a scheduled job in the Worker
-- CREATE TRIGGER IF NOT EXISTS auto_archive_old_logs...

-- Action type enums for validation
-- These would be enforced in the application layer:

-- TRANSACTION_TYPES: deposit, withdrawal, transfer, p2p, refund, chargeback, fee, bonus_credit, bonus_debit
-- WAGER_TYPES: sports_bet, casino_bet, live_casino_bet, virtual_bet, lottery_bet, pool_bet
-- AUTH_TYPES: login, logout, register, verify_email, verify_phone, password_reset, 2fa_enable, 2fa_disable, kyc_submit, kyc_approve, kyc_reject
-- CASINO_GAMES: blackjack, roulette, baccarat, poker, slots, craps, wheel_of_fortune, live_dealer
-- SECURITY_INCIDENTS: fraud_attempt, multiple_failed_logins, unusual_betting_pattern, geo_anomaly, device_change, rapid_transactions

-- Fire22 Language Key mapping for log messages
-- L-842: Transaction History, L-843: P2P Activity, L-1385: 3rd Party Limits
-- L-1387: Security Settings, L-1388: Account Verification, L-1389: Risk Management
-- L-1390: Compliance Check, L-1391: Audit Trail, L-848: Fraud Detection