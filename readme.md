# Fire22 Manager Dashboard - Production Ready

## Overview
The Fire22 Manager Dashboard is a real-time KPI streaming dashboard deployed to Cloudflare Workers at:
**https://dashboard-worker.brendawill2233.workers.dev/dashboard**

## Features
- ✅ Real-time KPI streaming via Server-Sent Events (SSE)
- ✅ Live PostgreSQL database integration
- ✅ Production-ready API endpoints
- ✅ Cloudflare Workers deployment
- ✅ Responsive dashboard interface

## Database Setup Instructions

### 1. Set up PostgreSQL Database
You need to create a PostgreSQL database and run the schema. You can use any PostgreSQL provider (Supabase, Neon, AWS RDS, etc.).

### 2. Run Database Schema
```bash
# Set your DATABASE_URL environment variable
export DATABASE_URL="postgresql://username:password@host:port/database_name"

# Run the schema to create tables and insert sample data
psql $DATABASE_URL -f schema.sql
```

### 3. Configure Cloudflare Workers Secrets
```bash
# Navigate to the dashboard-worker directory
cd dashboard-worker

# Set the DATABASE_URL secret (this will prompt for the value)
wrangler secret put DATABASE_URL
# Enter your PostgreSQL connection string when prompted

# The BOT_TOKEN and CASHIER_BOT_TOKEN are already configured in wrangler.toml
```

### 4. Deploy to Cloudflare Workers
```bash
# Deploy the worker
wrangler deploy

# The dashboard will be available at:
# https://dashboard-worker.brendawill2233.workers.dev/dashboard
```

## API Endpoints

### Dashboard
- `GET /dashboard` - Main dashboard interface

### Real-time Data
- `GET /api/live` - Server-Sent Events for real-time KPI updates

### Management APIs
- `POST /api/manager/getWeeklyFigureByAgent` - Weekly betting figures by agent
- `POST /api/manager/getPending` - Pending bets and transactions
- `GET /api/manager/getCustomerDetails?customerID=AL500` - Customer details
- `POST /api/manager/getTransactionHistory` - Transaction history
- `GET /api/manager/getCustomerSummary?customerID=AL500` - Customer summary
- `GET /api/manager/getTransactions?customerID=AL500` - Customer transactions
- `GET /api/manager/getBets?customerID=AL500` - Customer bets

## Database Schema
The database includes the following tables:
- `customers` - Customer information
- `bets` - Betting records
- `transactions` - Financial transactions
- `balances` - Customer balances
- `freeplay` - Freeplay balances
- `pending_wagers` - Pending wager balances

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (set via wrangler secret)
- `BOT_TOKEN` - Telegram bot token (configured in wrangler.toml)
- `CASHIER_BOT_TOKEN` - Cashier bot token (configured in wrangler.toml)

## Local Development
```bash
# Install dependencies
cd dashboard-worker
bun install

# Run locally
bun run dev

# Build for production
bun run build
```

## Production Status
✅ **READY FOR PRODUCTION** - All components are configured and the dashboard is live at:
**https://dashboard-worker.brendawill2333.workers.dev/dashboard**

The only remaining step is to set up your PostgreSQL database and configure the DATABASE_URL secret as described above.
