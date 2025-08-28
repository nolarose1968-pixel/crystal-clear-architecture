#!/bin/bash
# Fire22 Database Population Workflow
# Complete database setup and population script

set -e  # Exit on error

echo "🔥 Fire22 Database Population Workflow"
echo "======================================"

# Configuration
DB_NAME=${DB_NAME:-"fire22-dashboard"}
WRANGLER_ENV=${WRANGLER_ENV:-"production"}

echo "📋 Configuration:"
echo "   Database: $DB_NAME"
echo "   Environment: $WRANGLER_ENV"
echo ""

# Function to run SQL file on D1 database
run_sql() {
    local file=$1
    local description=$2
    echo "🔄 $description..."
    echo "   File: $file"
    
    if [ -f "$file" ]; then
        wrangler d1 execute $DB_NAME --file="$file" --env=$WRANGLER_ENV
        echo "   ✅ Completed: $description"
    else
        echo "   ⚠️  File not found: $file"
    fi
    echo ""
}

# Step 1: Schema Setup
echo "📊 Step 1: Database Schema Setup"
echo "--------------------------------"
run_sql "../schemas/fire22-complete-schema.sql" "Creating Fire22 complete schema"

# Step 2: Player Data Population  
echo "👥 Step 2: Player Data Population"
echo "--------------------------------"
run_sql "../population/generate-players-data.sql" "Generating 20,000+ players across 4 agents"
run_sql "../population/fix-player-data.sql" "Fixing player data calculations"

# Step 3: Transaction Data
echo "💰 Step 3: Transaction Data Population"
echo "-------------------------------------"
run_sql "../population/generate-transactions-bets.sql" "Generating transactions and bets"
run_sql "../population/fix-transactions.sql" "Fixing transaction amounts"

# Step 4: Betting Data
echo "🎰 Step 4: Betting Data Population"
echo "---------------------------------" 
run_sql "../population/fix-bets.sql" "Generating 14,500+ betting records"

# Step 5: Additional Data
echo "📈 Step 5: Additional Data Population"
echo "------------------------------------"
run_sql "../population/bulk-import-customers.sql" "Importing additional customer data"
run_sql "../population/shoots-sample-data.sql" "Adding sample sports data"
run_sql "../population/create-comprehensive-dashboard.sql" "Creating dashboard data"

# Step 6: Data Migration
echo "🔄 Step 6: Data Migration and Updates"
echo "------------------------------------"
run_sql "../migration/import-real-fire22-customers.sql" "Importing real Fire22 customer data"

echo "🎉 Database Population Complete!"
echo "================================"
echo ""
echo "📊 Summary:"
echo "   • Fire22 complete schema created"
echo "   • 20,000+ players generated (BLAKEPPH, DAKOMA, SCRAMPOST, SPEN)"
echo "   • 35,000+ transactions created with realistic amounts"
echo "   • 14,500+ betting records with commission tracking"
echo "   • Real Fire22 customer data imported"
echo ""
echo "🧪 Next Steps:"
echo "   1. Verify data with: ./verify-data.sh"
echo "   2. Test API endpoints with populated data"
echo "   3. Check Fire22 legacy API responses"
echo ""
echo "🔗 Test the API:"
echo "   curl -s https://dashboard-worker.nolarose1968-806.workers.dev/api/customers | jq '.data | length'"
echo "   curl -s -X POST https://dashboard-worker.nolarose1968-806.workers.dev/qubic/api/Manager/getAgentPerformance -d 'agentID=BLAKEPPH&type=CP&start=08/27/2025&end=08/27/2025' | jq"