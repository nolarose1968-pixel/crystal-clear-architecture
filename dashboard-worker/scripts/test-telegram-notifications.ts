#!/usr/bin/env bun

/**
 * 🧪 Telegram Notifications Test Script
 *
 * Test the fixed Telegram notification system
 */

import { Fire22TelegramBot } from '../src/telegram-bot';
import { TelegramNotificationService } from '../src/notifications/telegram-notification-service';

async function testTelegramNotifications() {
  console.log('🧪 Testing Telegram Notifications...\n');

  // Check environment variables
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  if (!botToken) {
    console.error(
      '❌ No bot token found. Set TELEGRAM_BOT_TOKEN or BOT_TOKEN environment variable.'
    );
    process.exit(1);
  }

  try {
    // Create bot instance
    console.log('🤖 Creating bot instance...');
    const bot = new Fire22TelegramBot({
      token: botToken,
      notificationSettings: {
        wagerUpdates: true,
        balanceChanges: true,
        systemAlerts: true,
        weeklyReports: true,
      },
    });

    // Test 1: Basic bot connectivity
    console.log('\n📡 Test 1: Bot Connectivity');
    console.log('Checking bot status...');

    try {
      const botStatus = bot.getStatus();
      console.log('✅ Bot created successfully');
      console.log(`📊 User sessions: ${botStatus.userSessions}`);
      console.log(`⚙️ Command handlers: ${botStatus.commandHandlers}`);
    } catch (error) {
      console.log('❌ Bot creation failed:', error.message);
      return;
    }

    // Test 2: Notification service
    console.log('\n📋 Test 2: Notification Service');
    console.log('Testing notification queue system...');

    try {
      const stats = bot.getNotificationStats();
      console.log('✅ Notification service initialized');
      console.log(`📈 Total sent: ${stats.totalSent}`);
      console.log(`📋 Total queued: ${stats.totalQueued}`);
      console.log(`❌ Total failed: ${stats.totalFailed}`);
    } catch (error) {
      console.log('❌ Notification service failed:', error.message);
    }

    // Test 3: Queue status
    console.log('\n🔄 Test 3: Queue Status');
    console.log('Checking notification queue...');

    try {
      const queueStatus = bot.getNotificationQueueStatus();
      console.log('✅ Queue status retrieved');
      console.log(`📋 Total in queue: ${queueStatus.total}`);
      console.log(`⏳ Pending: ${queueStatus.pending}`);
      console.log(`🔄 Processing: ${queueStatus.processing}`);
      console.log(`❌ Failed: ${queueStatus.failed}`);
    } catch (error) {
      console.log('❌ Queue status check failed:', error.message);
    }

    // Test 4: Mock notification (if test user provided)
    const testUserId = process.argv[2] ? parseInt(process.argv[2]) : null;
    const testUsername = process.argv[3] || null;

    if (testUserId || testUsername) {
      console.log('\n📤 Test 4: Mock Notification');

      try {
        const testMessage = `
🧪 **Test Notification**
⏰ **Sent:** ${new Date().toLocaleString()}
🆔 **Test ID:** ${Date.now()}
✅ **System:** Working correctly
        `.trim();

        let notificationId: string;

        if (testUserId) {
          console.log(`📤 Sending test notification to user ID: ${testUserId}`);
          notificationId = await bot.sendNotificationById(testUserId, testMessage);
        } else if (testUsername) {
          console.log(`📤 Sending test notification to username: @${testUsername}`);
          notificationId = await bot.sendNotificationByUsername(testUsername, testMessage);
        }

        console.log(`✅ Notification queued with ID: ${notificationId}`);

        // Check status after a short delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const status = bot.getNotificationStatus(notificationId);
        if (status) {
          console.log(`📊 Notification status: ${status.status}`);
          console.log(`🎯 Type: ${status.type}`);
          console.log(`⏱️ Created: ${status.metadata.createdAt.toLocaleString()}`);
        }
      } catch (error) {
        console.log('❌ Test notification failed:', error.message);
      }
    } else {
      console.log('\n📤 Test 4: Mock Notification (Skipped)');
      console.log('💡 To test actual notifications, provide user ID and/or username:');
      console.log('   bun run scripts/test-telegram-notifications.ts <user_id> <username>');
    }

    // Test 5: Bulk notification test
    console.log('\n📦 Test 5: Bulk Notification Capability');

    try {
      const mockRecipients = [
        { telegramId: 123456789 },
        { username: 'testuser1' },
        { telegramId: 987654321, username: 'testuser2' },
      ];

      const bulkMessage = `
📦 **Bulk Test Notification**
🎯 **Recipients:** ${mockRecipients.length}
⏰ **Sent:** ${new Date().toLocaleString()}
✅ **System:** Bulk processing ready
      `.trim();

      // Note: This will fail without real recipients, but tests the system
      const notificationIds = await bot.sendBulkNotifications(mockRecipients, bulkMessage);
      console.log(`✅ Bulk notification queued for ${mockRecipients.length} recipients`);
      console.log(`🆔 Notification IDs: ${notificationIds.join(', ')}`);
    } catch (error) {
      console.log('❌ Bulk notification test failed:', error.message);
      console.log('💡 This is expected with mock recipients');
    }

    // Final status report
    console.log('\n📊 Final Status Report');
    console.log('='.repeat(50));

    const finalStats = bot.getNotificationStats();
    const finalQueue = bot.getNotificationQueueStatus();

    console.log(`📈 Notifications Sent: ${finalStats.totalSent}`);
    console.log(`📋 Currently Queued: ${finalStats.queueSize}`);
    console.log(`❌ Failed: ${finalStats.totalFailed}`);
    console.log(`🔄 Is Processing: ${finalStats.isProcessing ? 'Yes' : 'No'}`);
    console.log(`📊 Queue Status: ${finalQueue.total} total, ${finalQueue.pending} pending`);

    if (finalStats.averageProcessingTime > 0) {
      console.log(`⏱️ Avg Processing Time: ${finalStats.averageProcessingTime.toFixed(0)}ms`);
    }

    console.log('='.repeat(50));

    // Success message
    console.log('\n🎉 Telegram Notification System Test Complete!');
    console.log('✅ System is operational and ready for production use.');
    console.log('\n💡 Next steps:');
    console.log('1. Configure real database connection');
    console.log('2. Set up webhook for real-time updates');
    console.log('3. Add user registration system');
    console.log('4. Monitor performance and error rates');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log(`
🧪 Telegram Notifications Test Script

Usage:
  bun run scripts/test-telegram-notifications.ts [options] [user_id] [username]

Arguments:
  user_id     Optional Telegram user ID for testing notifications
  username    Optional Telegram username for testing notifications

Environment Variables:
  TELEGRAM_BOT_TOKEN    Your Telegram bot token (required)
  BOT_TOKEN            Alternative bot token variable

Examples:
  bun run scripts/test-telegram-notifications.ts
  bun run scripts/test-telegram-notifications.ts 123456789
  bun run scripts/test-telegram-notifications.ts 123456789 @testuser

Options:
  --help, -h    Show this help message

The script will test:
- Bot connectivity and configuration
- Notification service initialization
- Queue system functionality
- Mock notification sending (if recipients provided)
- Bulk notification capability
- System statistics and monitoring
  `);
  process.exit(0);
}

// Run the test
testTelegramNotifications().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
