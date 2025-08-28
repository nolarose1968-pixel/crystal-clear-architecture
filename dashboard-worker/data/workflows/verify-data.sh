#!/bin/bash
# Fire22 Data Verification Script
# Verify that database population was successful

set -e

echo "🔍 Fire22 Data Verification"
echo "=========================="

# Configuration
DB_NAME=${DB_NAME:-"fire22-dashboard"}[L-288]
WRANGLER_ENV=${WRANGLER_ENV:-"production"}
BASE_URL=${BASE_URL:-"https://dashboard-worker.nolarose1968-806.workers.dev"}

echo "📋 Configuration:"
echo "   Database: $DB_NAME"
echo "   Environment: $WRANGLER_ENV"
echo "   API Base: $BASE_URL"
echo ""

# Function to run SQL query and get count
check_count() {
    local query=$1
    local description=$2
    local expected_min=$3
    
    echo "🔄 Checking: $description"
    echo "   Query: $query"
    
    local result=$(wrangler d1 execute $DB_NAME --command="$query" --env=$WRANGLER_ENV 2>/dev/null || echo "ERROR")
    
    if [ "$result" = "ERROR" ]; then
        echo "   ❌ Error executing query"
        return 1
    fi
    
    # Extract count from result (assuming format includes the number)
    local count=$(echo "$result" | grep -o '[0-9]\+' | head -1)
    
    if [ -z "$count" ]; then
        count=0
    fi
    
    echo "   📊 Count: $count"
    
    if [ "$count" -ge "$expected_min" ]; then
        echo "   ✅ PASS: Count ($count) >= Expected minimum ($expected_min)"
    else
        echo "   ❌ FAIL: Count ($count) < Expected minimum ($expected_min)"
        return 1
    fi
    echo ""
}

# Function to test API endpoint
test_api() {
    local endpoint=$1
    local description=$2
    local method=${3:-"GET"}
    local data=$4
    
    echo "🌐 Testing API: $description"
    echo "   Endpoint: $endpoint"
    echo "   Method: $method"
    
    local response
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -X POST "$BASE_URL$endpoint" -d "$data" 2>/dev/null || echo "ERROR")
    else
        response=$(curl -s "$BASE_URL$endpoint" 2>/dev/null || echo "ERROR")
    fi
    
    if [ "$response" = "ERROR" ]; then
        echo "   ❌ API request failed"
        return 1
    fi
    
    # Check if response contains data
    local data_length=$(echo "$response" | jq '.data | length' 2>/dev/null || echo "0")
    local list_length=$(echo "$response" | jq '.INFO.LIST | length' 2>/dev/null || echo "0")
    
    if [ "$data_length" -gt "0" ] || [ "$list_length" -gt "0" ]; then
        echo "   ✅ PASS: API returned data (length: $data_length/$list_length)"
    else
        echo "   ❌ FAIL: API returned empty data"
        echo "   Response preview: $(echo "$response" | head -c 200)..."
        return 1
    fi
    echo ""
}

echo "📊 Step 1: Database Count Verification"
echo "=====================================  "

# Check players count
check_count "SELECT COUNT(*) FROM players;" "Players table" 20000

# Check transactions count  
check_count "SELECT COUNT(*) FROM transactions;" "Transactions table" 30000

# Check bets count
check_count "SELECT COUNT(*) FROM bets;" "Bets table" 10000

# Check agents
check_count "SELECT COUNT(DISTINCT agent_id) FROM players;" "Unique agents" 4

echo "🌐 Step 2: API Endpoint Verification"
echo "===================================="

# Test basic customer API
test_api "/api/customers" "Customer API"

# Test Fire22 legacy API endpoints  
test_api "/qubic/api/Manager/getAgentPerformance" "Agent Performance API" "POST" "agentID=BLAKEPPH&type=CP&start=08/27/2025&end=08/27/2025"

test_api "/qubic/api/Manager/getLiveWagers" "Live Wagers API" "POST" "agentID=BLAKEPPH"

test_api "/qubic/api/Manager/getWeeklyFigureByAgent" "Weekly Figures API" "POST" "agentID=BLAKEPPH&startDate=08/20/2025&endDate=08/27/2025"

echo "🔍 Step 3: Data Quality Checks"
echo "=============================="

# Check agent distribution
echo "🔄 Checking agent distribution..."
wrangler d1 execute $DB_NAME --command="SELECT agent_id, COUNT(*) as player_count FROM players GROUP BY agent_id;" --env=$WRANGLER_ENV || echo "❌ Failed to check agent distribution"
echo ""

# Check account types
echo "🔄 Checking account type distribution..."
wrangler d1 execute $DB_NAME --command="SELECT account_type, COUNT(*) as count FROM players GROUP BY account_type;" --env=$WRANGLER_ENV || echo "❌ Failed to check account types"
echo ""

# Check recent activity
echo "🔄 Checking recent activity..."
wrangler d1 execute $DB_NAME --command="SELECT COUNT(*) as recent_bets FROM bets WHERE created_at > datetime('now', '-7 days');" --env=$WRANGLER_ENV || echo "❌ Failed to check recent activity"
echo ""

echo "🎉 Verification Complete!"
echo "========================"
echo ""
echo "📊 Summary:"
echo "   • Database counts verified"
echo "   • API endpoints tested"
echo "   • Data quality checked"
echo ""
echo "✅ If all checks passed, the Fire22 system is fully populated and operational!"
echo "❌ If any checks failed, review the populate-database.sh script and re-run."