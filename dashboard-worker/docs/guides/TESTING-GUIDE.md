# 🧪 Dashboard Worker Testing Guide

This guide covers comprehensive testing of your Cloudflare Workers dashboard
system with Fire22 API integration.

## 🚀 Quick Start

### **Run Quick Test (5 endpoints, ~30 seconds)**

```bash
bun run test:quick
```

### **Run Full Test Suite (All 11 test categories, ~2-3 minutes)**

```bash
bun run test:checklist
```

### **Test Fire22 Integration Only**

```bash
bun run test:fire22
```

## 📋 Test Categories

### **1. 🔐 Secrets & Environment Variables**

- ✅ Worker accessibility
- ✅ CORS headers configuration
- ✅ Environment variable validation

### **2. 🗄️ Database Connections**

- ✅ D1 database connectivity
- ✅ Customer data retrieval
- ✅ Wager data retrieval
- ✅ Live metrics generation

### **3. 🔥 Fire22 API Integration**

- ✅ API connection test
- ✅ Agent hierarchy retrieval
- ✅ Weekly figures endpoint
- ✅ Fallback behavior validation

### **4. 🎯 SHOOTS Agent Endpoints**

- ✅ Agent KPI calculation
- ✅ Customer filtering by agent
- ✅ Wager filtering by agent
- ✅ Pending wagers retrieval

### **5. 🔒 Authentication Tests**

- ✅ Invalid login rejection
- ✅ Protected endpoint access control
- ✅ Token validation

### **6. 📝 Error Handling & Logging**

- ✅ 404 error handling
- ✅ Malformed request validation
- ✅ Error response formatting

### **7. 🔄 Sync & Background Operations**

- ✅ Fire22 customer sync
- ✅ Background sync operations
- ✅ Data synchronization validation

### **8. 🌐 CORS & Headers**

- ✅ OPTIONS preflight handling
- ✅ CORS header configuration
- ✅ Cross-origin request support

### **9. 📱 Dashboard Interface**

- ✅ HTML response validation
- ✅ Dashboard page accessibility
- ✅ Content type verification

### **10. ⚡ Performance & Monitoring**

- ✅ Response time validation
- ✅ Performance benchmarks
- ✅ Load testing preparation

### **11. 🔍 Debug Information**

- ✅ Cache statistics
- ✅ API operation status
- ✅ Debug endpoint functionality

## 🔧 Test Configuration

### **Environment Variables**

The test suite automatically detects and validates:

- `FIRE22_TOKEN` - Fire22 API authentication
- `ADMIN_PASSWORD` - Admin access credentials
- `JWT_SECRET` - JWT token signing

### **Database Configuration**

Tests validate D1 database:

- Connection status
- Table structure
- Sample data availability
- Query performance

## 📊 Interpreting Results

### **Test Status Codes**

- ✅ **PASS** - Test completed successfully
- ❌ **FAIL** - Test failed with error details
- ⏭️ **SKIP** - Test skipped (not applicable)

### **Success Criteria**

- **Critical Endpoints**: Must return 200 status with expected data
- **Performance**: Response time under 5 seconds
- **Error Handling**: Proper HTTP status codes and error messages
- **CORS**: Valid preflight responses for cross-origin requests

### **Common Failure Scenarios**

#### **Fire22 API Failures**

```
❌ Test Fire22 API connection - Fire22 API failed
```

**Solution**: Check `FIRE22_TOKEN` secret and API endpoint availability

#### **Database Connection Issues**

```
❌ Test customers endpoint - Customers endpoint failed
```

**Solution**: Verify D1 database binding and table structure

#### **Authentication Problems**

```
❌ Test protected endpoint without token - HTTP 500
```

**Solution**: Check JWT_SECRET configuration and auth middleware

#### **CORS Configuration Issues**

```
❌ Verify CORS headers - CORS headers not configured
```

**Solution**: Ensure proper CORS headers in worker response

## 🛠️ Troubleshooting

### **Fire22 API Issues**

1. **Check token validity**: `wrangler secret list`
2. **Verify API endpoint**: Test direct Fire22 API calls
3. **Check network connectivity**: Ensure worker can reach external APIs

### **Database Issues**

1. **Verify D1 binding**: Check `wrangler.toml` configuration
2. **Check table structure**: Run
   `wrangler d1 execute fire22-dashboard --remote --command "SELECT name FROM sqlite_master WHERE type='table';"`
3. **Validate data**: Check sample data with
   `wrangler d1 execute fire22-dashboard --remote --command "SELECT COUNT(*) FROM players;"`

### **Performance Issues**

1. **Response time > 5s**: Check database query optimization
2. **Memory issues**: Monitor worker memory usage
3. **Cold start delays**: Consider worker warm-up strategies

## 📈 Continuous Testing

### **Pre-deployment Testing**

```bash
# Run full test suite before deployment
bun run test:checklist

# Deploy only if all tests pass
bun run deploy
```

### **Post-deployment Validation**

```bash
# Quick validation after deployment
bun run test:quick

# Full validation if quick test passes
bun run test:checklist
```

### **Monitoring Integration**

- Set up alerts for failed tests
- Monitor response time trends
- Track API success rates

## 🔍 Advanced Testing

### **Load Testing**

```bash
# Simple concurrent request test
for i in {1..10}; do
  curl "https://dashboard-worker.brendawill2233.workers.dev/api/live-metrics" &
done
wait
```

### **Error Simulation**

```bash
# Test malformed requests
curl -X POST "https://dashboard-worker.brendawill2233.workers.dev/api/manager/getWeeklyFigureByAgent" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'

# Test non-existent endpoints
curl "https://dashboard-worker.brendawill2233.workers.dev/api/nonexistent"
```

### **Real-time Monitoring**

```bash
# Monitor worker logs
wrangler tail --format=pretty

# Check database operations
wrangler d1 execute fire22-dashboard --remote --command "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;"
```

## 📚 Additional Resources

- **Fire22 Integration**: See `FIRE22-INTEGRATION.md`
- **SHOOTS Integration**: See `SHOOTS-INTEGRATION.md`
- **Database Schema**: See `fire22-enhanced-schema.sql`
- **Worker Configuration**: See `wrangler.toml`

## 🎯 Success Metrics

Your dashboard worker is production-ready when:

- ✅ All test categories pass
- ✅ Response times under 5 seconds
- ✅ Error handling returns proper HTTP status codes
- ✅ CORS properly configured for frontend integration
- ✅ Fire22 API integration working (with graceful fallback)
- ✅ Database queries optimized and responsive

---

**Happy Testing! 🚀**

For issues or questions, check the test output details and refer to the
troubleshooting section above.
