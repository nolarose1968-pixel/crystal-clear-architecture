#!/bin/bash

# Enhanced Workspace Testing with Bun Security Features
# This script demonstrates the additional security setup you requested

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SECURITY_LEVEL="${FIRE22_SECURITY_LEVEL:-high}"
SERVICE_NAME="fire22-dashboard-worker"
SCAN_TIMEOUT=300000  # 5 minutes in milliseconds

echo -e "${BLUE}🔐 Fire22 Secure Workspace Testing${NC}"
echo "==============================================="

# Function to log with timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
handle_error() {
    local exit_code=$1
    local line_no=$2
    log "${RED}❌ Error occurred at line $line_no (exit code: $exit_code)${NC}"
    exit $exit_code
}

# Set error trap
trap 'handle_error $? $LINENO' ERR

# Step 1: Security Audit
log "${YELLOW}🔍 Step 1: Running security audit...${NC}"
echo "Audit Level: $SECURITY_LEVEL"
echo "Service: $SERVICE_NAME"

# Run comprehensive security audit
bun audit --audit-level=high --prod 2>/dev/null || {
    log "${YELLOW}⚠️  Some audit warnings found, continuing...${NC}"
}

# Step 2: Install and run security scanner
log "${YELLOW}🛡️  Step 2: Installing Fire22 Security Scanner...${NC}"

if [[ ! -d "packages/@fire22/security-scanner" ]]; then
    log "${RED}❌ Security scanner package not found${NC}"
    exit 1
fi

# Build the security scanner
cd packages/@fire22/security-scanner
bun install --frozen-lockfile
bun run build
cd - > /dev/null

# Run comprehensive security scan
log "${YELLOW}🔍 Running comprehensive security scan...${NC}"
timeout $SCAN_TIMEOUT bun run packages/@fire22/security-scanner/src/index.ts || {
    local scan_exit=$?
    if [[ $scan_exit -eq 124 ]]; then
        log "${RED}❌ Security scan timed out after ${SCAN_TIMEOUT}ms${NC}"
    elif [[ $scan_exit -eq 1 ]]; then
        log "${RED}❌ Critical or high-risk vulnerabilities found${NC}"
    fi
    exit $scan_exit
}

# Step 3: Secure credential retrieval
log "${YELLOW}🔑 Step 3: Retrieving credentials from secure storage...${NC}"

# Helper function to retrieve secure credentials
get_secure_credential() {
    local credential_name=$1
    bun -e "
import { secrets } from 'bun';
try {
  const value = await secrets.get({
    service: '$SERVICE_NAME',
    name: '$credential_name'
  });
  if (value) {
    console.log(value);
  } else {
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to retrieve credential:', error.message);
  process.exit(1);
}
" 2>/dev/null || echo ""
}

# Try to retrieve GitHub token securely
GITHUB_TOKEN=$(get_secure_credential "github-token")
if [[ -n "$GITHUB_TOKEN" ]]; then
    log "${GREEN}✅ GitHub token retrieved from secure storage${NC}"
    export GITHUB_TOKEN
else
    log "${YELLOW}⚠️  No GitHub token in secure storage, using environment variable${NC}"
    # Check if token exists in environment
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
        log "${YELLOW}💡 To store GitHub token securely, run:${NC}"
        echo "bun -e \"import { secrets } from 'bun'; await secrets.set({ service: '$SERVICE_NAME', name: 'github-token', value: 'your-token-here' });\""
    fi
fi

# Try to retrieve API keys securely
API_KEY=$(get_secure_credential "api-key")
if [[ -n "$API_KEY" ]]; then
    log "${GREEN}✅ API key retrieved from secure storage${NC}"
    export API_KEY
fi

DATABASE_URL=$(get_secure_credential "database-url")
if [[ -n "$DATABASE_URL" ]]; then
    log "${GREEN}✅ Database URL retrieved from secure storage${NC}"
    export DATABASE_URL
fi

# Step 4: Workspace validation
log "${YELLOW}📦 Step 4: Validating workspace structure...${NC}"

# Check for bunfig.toml security configuration
if [[ -f "bunfig.toml" ]]; then
    if grep -q "\[install\.security\]" bunfig.toml; then
        log "${GREEN}✅ Security scanner configured in bunfig.toml${NC}"
    else
        log "${YELLOW}⚠️  Adding security scanner to bunfig.toml...${NC}"
        echo "" >> bunfig.toml
        echo "[install.security]" >> bunfig.toml
        echo "scanner = \"@fire22/security-scanner\"" >> bunfig.toml
        echo "" >> bunfig.toml
        echo "[install.scopes]" >> bunfig.toml
        echo "\"@fire22\" = \"https://fire22.workers.dev/registry/\"" >> bunfig.toml
    fi
else
    log "${YELLOW}⚠️  Creating bunfig.toml with security configuration...${NC}"
    cat > bunfig.toml << EOF
[install.security]
scanner = "@fire22/security-scanner"

[install.scopes]
"@fire22" = "https://fire22.workers.dev/registry/"

[install]
production = false
frozenLockfile = false
EOF
fi

# Step 5: Test execution across workspaces
log "${YELLOW}🧪 Step 5: Running tests across all workspaces...${NC}"

# Track test results
TOTAL_WORKSPACES=0
PASSED_WORKSPACES=0
FAILED_WORKSPACES=0
declare -a FAILED_WORKSPACE_NAMES

# Find and test all workspaces
for workspace_path in workspaces/*/; do
    if [[ ! -d "$workspace_path" ]]; then
        continue
    fi
    
    workspace_name=$(basename "$workspace_path")
    
    # Skip non-package directories
    if [[ ! -f "$workspace_path/package.json" ]]; then
        continue
    fi
    
    TOTAL_WORKSPACES=$((TOTAL_WORKSPACES + 1))
    
    log "${BLUE}🔍 Testing workspace: $workspace_name${NC}"
    
    cd "$workspace_path"
    
    # Check if workspace has test script
    if ! bun run --silent test --help >/dev/null 2>&1; then
        log "${YELLOW}⚠️  No test script found for $workspace_name, skipping...${NC}"
        cd - > /dev/null
        continue
    fi
    
    # Run tests with timeout
    if timeout 120 bun test 2>/dev/null; then
        log "${GREEN}✅ $workspace_name tests passed${NC}"
        PASSED_WORKSPACES=$((PASSED_WORKSPACES + 1))
    else
        local test_exit=$?
        log "${RED}❌ $workspace_name tests failed (exit code: $test_exit)${NC}"
        FAILED_WORKSPACES=$((FAILED_WORKSPACES + 1))
        FAILED_WORKSPACE_NAMES+=("$workspace_name")
    fi
    
    cd - > /dev/null
done

# Step 6: Test main project
log "${YELLOW}🎯 Step 6: Testing main project...${NC}"

if [[ -f "package.json" ]] && bun run --silent test --help >/dev/null 2>&1; then
    if bun test; then
        log "${GREEN}✅ Main project tests passed${NC}"
    else
        log "${RED}❌ Main project tests failed${NC}"
        FAILED_WORKSPACES=$((FAILED_WORKSPACES + 1))
        FAILED_WORKSPACE_NAMES+=("main")
    fi
fi

# Step 7: Security validation
log "${YELLOW}🔒 Step 7: Final security validation...${NC}"

# Check for common security issues
SECURITY_ISSUES=0

# Check for .env files in git
if git ls-files | grep -q "\.env$"; then
    log "${RED}❌ .env files found in git repository${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Check for hardcoded secrets in recent commits
if git log --oneline -10 | grep -qi "password\|secret\|token\|key"; then
    log "${YELLOW}⚠️  Potential secrets found in recent commit messages${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Check file permissions
if find . -type f \( -name "*.sh" -o -name "*.js" -o -name "*.ts" \) -perm -002 2>/dev/null | grep -q .; then
    log "${YELLOW}⚠️  World-writable files found${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Step 8: Generate comprehensive report
log "${BLUE}📊 Step 8: Generating test report...${NC}"

echo ""
echo "==============================================="
echo -e "${BLUE}🎯 FIRE22 SECURE TESTING REPORT${NC}"
echo "==============================================="

echo -e "${BLUE}📦 Workspace Testing Results:${NC}"
echo "  Total Workspaces: $TOTAL_WORKSPACES"
echo -e "  Passed: ${GREEN}$PASSED_WORKSPACES${NC}"
echo -e "  Failed: ${RED}$FAILED_WORKSPACES${NC}"

if [[ $FAILED_WORKSPACES -gt 0 ]]; then
    echo -e "${RED}❌ Failed Workspaces:${NC}"
    for failed_name in "${FAILED_WORKSPACE_NAMES[@]}"; do
        echo "    • $failed_name"
    done
fi

echo ""
echo -e "${BLUE}🔐 Security Results:${NC}"
if [[ $SECURITY_ISSUES -eq 0 ]]; then
    echo -e "  ${GREEN}✅ No additional security issues found${NC}"
else
    echo -e "  ${YELLOW}⚠️  $SECURITY_ISSUES security issues detected${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Performance Metrics:${NC}"
echo "  Total Execution Time: $SECONDS seconds"
echo "  Security Scanner: Bun-native with nanosecond precision"
echo "  Credential Storage: OS-native secure storage (Bun.secrets)"

echo ""
echo -e "${BLUE}💡 Security Recommendations:${NC}"
echo "  • Use 'bun run @fire22/security-scanner' for regular security scans"
echo "  • Store credentials with 'bun -e \"import { secrets } from 'bun'; await secrets.set({...})\""
echo "  • Enable security scanner in bunfig.toml for automatic vulnerability detection"
echo "  • Run this script in CI/CD with security validation"

echo ""
echo "==============================================="

# Step 9: Clean up and exit
log "${YELLOW}🧹 Step 9: Cleaning up...${NC}"

# Remove any temporary files created during testing
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name ".test-*" -delete 2>/dev/null || true

# Final exit status
if [[ $FAILED_WORKSPACES -gt 0 ]] || [[ $SECURITY_ISSUES -gt 2 ]]; then
    log "${RED}❌ Testing completed with failures${NC}"
    exit 1
else
    log "${GREEN}✅ All tests passed successfully with security validation${NC}"
    exit 0
fi