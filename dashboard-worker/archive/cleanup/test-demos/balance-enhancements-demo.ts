#!/usr/bin/env bun

/**
 * Balance Enhancements Demo Script
 *
 * Demonstrates all four enhancement areas:
 * 1. Balance validation with min/max limits
 * 2. Enhanced audit trail for balance changes
 * 3. Balance threshold notifications
 * 4. Balance trend analysis and reporting
 */

import {
  BalanceManager,
  BalanceValidator,
  BalanceAuditTrail,
  BalanceNotificationService,
  BalanceAnalyticsService,
  initializeBalanceTables,
  type BalanceValidationRules,
  type BalanceChangeEvent,
} from '../src/balance-management';

// !== DEMO CONFIGURATION !==

const DEMO_CUSTOMERS = [
  { id: 'DEMO001', name: 'John Diamond', vipLevel: 'diamond', initialBalance: 50000 },
  { id: 'DEMO002', name: 'Sarah Platinum', vipLevel: 'platinum', initialBalance: 25000 },
  { id: 'DEMO003', name: 'Mike Gold', vipLevel: 'gold', initialBalance: 15000 },
  { id: 'DEMO004', name: 'Lisa Silver', vipLevel: 'silver', initialBalance: 10000 },
  { id: 'DEMO005', name: 'Bob Bronze', vipLevel: 'bronze', initialBalance: 5000 },
];

const DEMO_AGENT = 'DEMO_AGENT_001';

// !== DEMO FUNCTIONS !==

async function runBalanceValidationDemo(): Promise<void> {
  console.log('\n🔒 BALANCE VALIDATION DEMO');
  console.log('='.repeat(50));

  // Test different VIP levels
  for (const customer of DEMO_CUSTOMERS) {
    console.log(`\n📊 Testing ${customer.name} (${customer.vipLevel.toUpperCase()})`);

    const rules = BalanceValidator.getValidationRulesForVIP(customer.vipLevel);
    console.log(`  Min Balance: $${rules.minBalance.toLocaleString()}`);
    console.log(`  Max Balance: $${rules.maxBalance.toLocaleString()}`);
    console.log(`  Daily Change Limit: $${rules.dailyChangeLimit.toLocaleString()}`);

    // Test various balance changes
    const testChanges = [
      { amount: 1000, description: 'Small deposit' },
      { amount: 50000, description: 'Medium deposit' },
      { amount: 500000, description: 'Large deposit' },
      { amount: -2000, description: 'Small withdrawal' },
      { amount: -50000, description: 'Large withdrawal' },
    ];

    for (const test of testChanges) {
      const validation = BalanceValidator.validateBalanceChange(
        customer.initialBalance,
        test.amount,
        rules
      );

      const status = validation.isValid ? '✅' : '❌';
      console.log(`  ${status} ${test.description}: $${test.amount.toLocaleString()}`);

      if (!validation.isValid) {
        console.log(`    Errors: ${validation.errors.join(', ')}`);
      }
      if (validation.warnings.length > 0) {
        console.log(`    Warnings: ${validation.warnings.join(', ')}`);
      }
    }
  }
}

async function runAuditTrailDemo(): Promise<void> {
  console.log('\n📝 AUDIT TRAIL DEMO');
  console.log('='.repeat(50));

  // Simulate various balance changes
  const balanceChanges = [
    { customerId: 'DEMO001', amount: 5000, type: 'deposit', reason: 'Initial funding' },
    { customerId: 'DEMO002', amount: -1000, type: 'withdrawal', reason: 'Cash out' },
    { customerId: 'DEMO003', amount: -500, type: 'wager', reason: 'Sports bet' },
    { customerId: 'DEMO004', amount: 750, type: 'settlement', reason: 'Winning bet' },
    { customerId: 'DEMO005', amount: 200, type: 'adjustment', reason: 'Bonus credit' },
  ];

  console.log('\n🔄 Logging balance changes...');

  for (const change of balanceChanges) {
    const event: BalanceChangeEvent = {
      id: Bun.crypto.randomUUID(),
      customerId: change.customerId,
      agentId: DEMO_AGENT,
      timestamp: new Date().toISOString(),
      changeType: change.type as any,
      previousBalance: 1000, // Mock previous balance
      newBalance: 1000 + change.amount,
      changeAmount: change.amount,
      reason: change.reason,
      performedBy: 'demo_user',
      metadata: { demo: true, timestamp: Date.now() },
    };

    try {
      await BalanceAuditTrail.logBalanceChange(event);
      console.log(
        `  ✅ Logged ${change.type} for ${change.customerId}: $${change.amount.toLocaleString()}`
      );
    } catch (error) {
      console.log(`  ❌ Failed to log ${change.type} for ${change.customerId}: ${error}`);
    }
  }

  // Retrieve and display audit trail
  console.log('\n📋 Recent balance changes:');
  try {
    const recentChanges = await BalanceAuditTrail.getRecentBalanceChanges(24);
    recentChanges.slice(0, 5).forEach(change => {
      const sign = change.changeAmount >= 0 ? '+' : '';
      console.log(
        `  ${change.timestamp}: ${change.customerId} - ${sign}$${change.changeAmount.toLocaleString()} (${change.changeType})`
      );
    });
  } catch (error) {
    console.log(`  ❌ Failed to retrieve audit trail: ${error}`);
  }
}

async function runNotificationsDemo(): Promise<void> {
  console.log('\n🚨 NOTIFICATIONS DEMO');
  console.log('='.repeat(50));

  // Test threshold alerts
  const testScenarios = [
    {
      customerId: 'DEMO001',
      currentBalance: 500,
      previousBalance: 5000,
      description: 'Large balance drop',
    },
    {
      customerId: 'DEMO002',
      currentBalance: 50,
      previousBalance: 1000,
      description: 'Critical threshold',
    },
    {
      customerId: 'DEMO003',
      currentBalance: 800,
      previousBalance: 1500,
      description: 'Warning threshold',
    },
  ];

  console.log('\n🔍 Testing threshold alerts...');

  for (const scenario of testScenarios) {
    const rules = BalanceValidator.getValidationRulesForVIP('bronze'); // Use base rules

    try {
      const alerts = await BalanceNotificationService.checkAndCreateAlerts(
        scenario.customerId,
        scenario.currentBalance,
        scenario.previousBalance,
        rules
      );

      console.log(`\n📊 ${scenario.description} for ${scenario.customerId}:`);
      console.log(`  Current Balance: $${scenario.currentBalance.toLocaleString()}`);
      console.log(`  Previous Balance: $${scenario.previousBalance.toLocaleString()}`);

      if (alerts.length > 0) {
        console.log(`  🚨 Generated ${alerts.length} alert(s):`);
        alerts.forEach(alert => {
          console.log(`    - ${alert.alertType.toUpperCase()}: ${alert.message}`);
        });
      } else {
        console.log(`  ✅ No alerts generated`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to check alerts: ${error}`);
    }
  }

  // Display active alerts
  console.log('\n📋 Active alerts in system:');
  try {
    const activeAlerts = await BalanceNotificationService.getActiveAlerts();
    if (activeAlerts.length > 0) {
      activeAlerts.forEach(alert => {
        console.log(`  🚨 ${alert.customerId}: ${alert.message} (${alert.alertType})`);
      });
    } else {
      console.log(`  ✅ No active alerts`);
    }
  } catch (error) {
    console.log(`  ❌ Failed to retrieve alerts: ${error}`);
  }
}

async function runAnalyticsDemo(): Promise<void> {
  console.log('\n📈 ANALYTICS DEMO');
  console.log('='.repeat(50));

  // Generate analytics for each customer
  for (const customer of DEMO_CUSTOMERS) {
    console.log(`\n📊 Analytics for ${customer.name} (${customer.id}):`);

    try {
      const analytics = await BalanceAnalyticsService.generateCustomerAnalytics(
        customer.id,
        'monthly'
      );

      console.log(
        `  📅 Period: ${analytics.period} (${analytics.startDate} to ${analytics.endDate})`
      );
      console.log(`  💰 Starting Balance: $${analytics.startingBalance.toLocaleString()}`);
      console.log(`  💰 Ending Balance: $${analytics.endingBalance.toLocaleString()}`);
      console.log(
        `  📈 Net Change: $${analytics.netChange.toLocaleString()} (${analytics.changePercentage.toFixed(1)}%)`
      );
      console.log(`  📊 Trend: ${analytics.trendDirection.toUpperCase()}`);
      console.log(`  ⚠️  Risk Level: ${analytics.riskLevel.toUpperCase()}`);
      console.log(`  📊 Volatility Score: ${analytics.volatilityScore.toFixed(2)}`);

      // Activity breakdown
      console.log(`  💳 Activity Summary:`);
      console.log(`    - Deposits: $${analytics.totalDeposits.toLocaleString()}`);
      console.log(`    - Withdrawals: $${analytics.totalWithdrawals.toLocaleString()}`);
      console.log(`    - Wagers: $${analytics.totalWagers.toLocaleString()}`);
      console.log(`    - Settlements: $${analytics.totalSettlements.toLocaleString()}`);
    } catch (error) {
      console.log(`  ❌ Failed to generate analytics: ${error}`);
    }
  }

  // Generate system-wide analytics
  console.log('\n🏢 System-wide Analytics:');
  try {
    const systemAnalytics = await BalanceAnalyticsService.generateSystemAnalytics(
      DEMO_AGENT,
      'daily'
    );
    console.log(`  📊 Total Customers: ${systemAnalytics.totalCustomers}`);
    console.log(`  💰 Total Balance: $${systemAnalytics.totalBalance.toLocaleString()}`);
    console.log(`  📈 Average Balance: $${systemAnalytics.averageBalance.toLocaleString()}`);
    console.log(`  💳 Total Deposits: $${systemAnalytics.totalDeposits.toLocaleString()}`);
    console.log(`  💳 Total Withdrawals: $${systemAnalytics.totalWithdrawals.toLocaleString()}`);
  } catch (error) {
    console.log(`  ❌ Failed to generate system analytics: ${error}`);
  }
}

async function runIntegrationDemo(): Promise<void> {
  console.log('\n🔗 INTEGRATION DEMO');
  console.log('='.repeat(50));

  // Test the main BalanceManager
  console.log('\n🔄 Testing BalanceManager integration...');

  const testCustomer = DEMO_CUSTOMERS[0];
  console.log(`\n📊 Updating balance for ${testCustomer.name}:`);

  try {
    const result = await BalanceManager.updateBalance(
      testCustomer.id,
      DEMO_AGENT,
      2500,
      'deposit',
      'Demo integration test',
      'demo_user',
      testCustomer.vipLevel,
      { integration_test: true, timestamp: Date.now() }
    );

    console.log(`  ✅ Balance update successful!`);
    console.log(`  💰 New Balance: $${result.newBalance.toLocaleString()}`);
    console.log(`  🔒 Validation: ${result.validation.isValid ? 'PASSED' : 'FAILED'}`);

    if (result.validation.warnings.length > 0) {
      console.log(`  ⚠️  Warnings: ${result.validation.warnings.join(', ')}`);
    }

    if (result.alerts.length > 0) {
      console.log(`  🚨 Alerts generated: ${result.alerts.length}`);
    }

    // Get comprehensive balance report
    console.log(`\n📋 Generating comprehensive balance report...`);
    const report = await BalanceManager.getCustomerBalanceReport(
      testCustomer.id,
      true, // include history
      true // include alerts
    );

    console.log(`  💰 Current Balance: $${report.currentBalance.toLocaleString()}`);
    console.log(`  📝 History Records: ${report.history?.length || 0}`);
    console.log(`  🚨 Active Alerts: ${report.alerts?.length || 0}`);
    console.log(`  📊 Analytics: ${report.analytics ? 'Generated' : 'Not available'}`);
  } catch (error) {
    console.log(`  ❌ Integration test failed: ${error}`);
  }
}

// !== MAIN DEMO EXECUTION !==

async function main(): Promise<void> {
  console.log('🚀 BALANCE ENHANCEMENTS DEMO');
  console.log('='.repeat(60));
  console.log('This demo showcases all four enhancement areas:');
  console.log('1. 🔒 Balance validation with min/max limits');
  console.log('2. 📝 Enhanced audit trail for balance changes');
  console.log('3. 🚨 Balance threshold notifications');
  console.log('4. 📈 Balance trend analysis and reporting');
  console.log('='.repeat(60));

  try {
    // Initialize database tables
    console.log('\n🗄️  Initializing balance management tables...');
    await initializeBalanceTables();
    console.log('✅ Tables initialized successfully');

    // Run all demos
    await runBalanceValidationDemo();
    await runAuditTrailDemo();
    await runNotificationsDemo();
    await runAnalyticsDemo();
    await runIntegrationDemo();

    console.log('\n🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('All four balance enhancement areas have been demonstrated:');
    console.log('✅ Validation: VIP-based balance limits and change validation');
    console.log('✅ Audit Trail: Comprehensive logging of all balance changes');
    console.log('✅ Notifications: Automated threshold alerts and warnings');
    console.log('✅ Analytics: Trend analysis, risk assessment, and reporting');
    console.log('\n🚀 Ready for production integration!');
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo if this script is executed directly
if (import.meta.main) {
  main().catch(console.error);
}
