#!/usr/bin/env bun

/**
 * 🔥📱 Fire22 Telegram Integration Configuration
 *
 * Centralized configuration for Telegram bot integration
 * Connects to hub endpoints, environment management, and main config
 */

import { TelegramEnvironment } from '../telegram/telegram-env';
import { hubConnection } from './hub-connection';
import { Fire22Config } from './fire22-config';

export interface TelegramIntegrationConfig {
  // Core Bot Configuration
  botToken: string;
  webhookUrl?: string;
  webhookSecret?: string;

  // Feature Flags
  enableMultilingual: boolean;
  enableNotifications: boolean;
  enableP2PMatching: boolean;
  enableDepartmentWorkflows: boolean;
  enableMetrics: boolean;

  // Performance Settings
  rateLimitCommands: number;
  rateLimitMessages: number;
  translationCacheSize: number;
  translationCacheTTL: number;

  // Security Settings
  jwtSecret?: string;
  encryptionKey?: string;
  sessionTimeout: number;

  // Database Integration
  databaseUrl?: string;
  enableDatabaseSync: boolean;

  // API Integration
  fire22ApiUrl: string;
  fire22ApiKey?: string;
  fire22AgentToken?: string;

  // Monitoring & Analytics
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  sentryDsn?: string;
  analyticsApiKey?: string;

  // Group IDs
  cashierGroupId: string;
  p2pQueueGroupId: string;
  transactionChannelId: string;
  supportGroupId: string;
}

export class TelegramIntegrationConfigManager {
  private static instance: TelegramIntegrationConfigManager;
  private telegramEnv: TelegramEnvironment;
  private config: TelegramIntegrationConfig;

  private constructor() {
    this.telegramEnv = TelegramEnvironment.getInstance();
    this.config = this.buildConfig();
  }

  static getInstance(): TelegramIntegrationConfigManager {
    if (!TelegramIntegrationConfigManager.instance) {
      TelegramIntegrationConfigManager.instance = new TelegramIntegrationConfigManager();
    }
    return TelegramIntegrationConfigManager.instance;
  }

  /**
   * Build configuration from environment and existing configs
   */
  private buildConfig(): TelegramIntegrationConfig {
    const env = this.telegramEnv;

    return {
      // Core Bot Configuration
      botToken: env.botToken,
      webhookUrl: env.webhookUrl,
      webhookSecret: env.webhookSecret,

      // Feature Flags
      enableMultilingual: env.featureFlags.enableMultilingual,
      enableNotifications: env.featureFlags.enableNotifications,
      enableP2PMatching: env.featureFlags.enableP2pMatching,
      enableDepartmentWorkflows: env.featureFlags.enableDepartmentWorkflows,
      enableMetrics: env.featureFlags.enableMetrics,

      // Performance Settings
      rateLimitCommands: env.performanceConfig.rateLimitCommands,
      rateLimitMessages: env.performanceConfig.rateLimitMessages,
      translationCacheSize: env.performanceConfig.translationCacheSize,
      translationCacheTTL: env.performanceConfig.translationCacheTtl,

      // Security Settings
      jwtSecret: env.securityConfig.jwtSecret,
      encryptionKey: env.securityConfig.encryptionKey,
      sessionTimeout: env.securityConfig.sessionTimeout,

      // Database Integration
      databaseUrl: env.databaseUrl,
      enableDatabaseSync: true, // Always enabled for hub integration

      // API Integration
      fire22ApiUrl: env.fire22ApiUrl,
      fire22ApiKey: env.fire22ApiKey,
      fire22AgentToken: env.fire22AgentToken,

      // Monitoring & Analytics
      enableHealthChecks: true,
      healthCheckInterval: env.monitoringConfig.healthCheckInterval,
      sentryDsn: env.monitoringConfig.sentryDsn,
      analyticsApiKey: env.monitoringConfig.analyticsApiKey,

      // Group IDs
      cashierGroupId: env.cashierGroupId,
      p2pQueueGroupId: env.p2pQueueGroupId,
      transactionChannelId: env.transactionChannelId,
      supportGroupId: env.supportGroupId,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): TelegramIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Validate configuration completeness
   */
  validateConfig(): { valid: boolean; missing: string[]; warnings: string[] } {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!this.config.botToken) {
      missing.push('TELEGRAM_BOT_TOKEN');
    }

    // Production requirements
    if (this.telegramEnv.isProduction) {
      if (!this.config.webhookUrl) {
        missing.push('TELEGRAM_WEBHOOK_URL');
      }
      if (!this.config.jwtSecret) {
        missing.push('JWT_SECRET');
      }
      if (!this.config.encryptionKey) {
        missing.push('ENCRYPTION_KEY');
      }
    }

    // Warnings for development
    if (this.telegramEnv.isDevelopment) {
      if (!this.config.webhookUrl) {
        warnings.push('TELEGRAM_WEBHOOK_URL not set (webhook mode disabled)');
      }
      if (!this.config.jwtSecret) {
        warnings.push('JWT_SECRET not set (using development defaults)');
      }
    }

    // Feature-specific warnings
    if (this.config.enableMultilingual && !this.config.enableNotifications) {
      warnings.push('Multilingual enabled but notifications disabled');
    }

    if (this.config.enableP2PMatching && !this.config.enableNotifications) {
      warnings.push('P2P matching enabled but notifications disabled');
    }

    return {
      valid: missing.length === 0,
      missing,
      warnings,
    };
  }

  /**
   * Test Telegram integration connectivity
   */
  async testConnectivity(): Promise<{
    success: boolean;
    botStatus: boolean;
    hubConnection: boolean;
    databaseAccess: boolean;
    details: any;
  }> {
    try {
      // Test bot token
      const botResponse = await fetch(`https://api.telegram.org/bot${this.config.botToken}/getMe`);
      const botStatus = botResponse.ok;

      // Test hub connection
      const hubStatus = await hubConnection.getTelegramStatus();

      // Test database access (if available)
      let databaseAccess = false;
      try {
        const dbTest = await hubConnection.executeD1Query(
          'fire22-dashboard',
          'SELECT COUNT(*) as user_count FROM users WHERE telegram_id IS NOT NULL'
        );
        databaseAccess = !!dbTest.results;
      } catch (error) {
        console.warn('Database access test failed:', error);
      }

      const success = botStatus && hubStatus.connected && databaseAccess;

      return {
        success,
        botStatus,
        hubConnection: hubStatus.connected,
        databaseAccess,
        details: {
          bot: botStatus ? 'Connected' : 'Failed',
          hub: hubStatus.connected ? 'Connected' : 'Failed',
          database: databaseAccess ? 'Accessible' : 'Failed',
          config: this.config,
          hubDetails: hubStatus,
        },
      };
    } catch (error) {
      return {
        success: false,
        botStatus: false,
        hubConnection: false,
        databaseAccess: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          config: this.config,
        },
      };
    }
  }

  /**
   * Get integration health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    metrics: any;
    timestamp: string;
  }> {
    const connectivity = await this.testConnectivity();
    const validation = this.validateConfig();

    const checks = {
      configuration: validation.valid,
      botConnectivity: connectivity.botStatus,
      hubConnection: connectivity.hubConnection,
      databaseAccess: connectivity.databaseAccess,
      environment: this.telegramEnv.environment === 'production' ? true : true, // Always true for now
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.7) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      metrics: {
        totalChecks,
        healthyChecks,
        healthPercentage: (healthyChecks / totalChecks) * 100,
        connectivity: connectivity.details,
        validation: validation,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get configuration summary for dashboard
   */
  getDashboardSummary(): {
    status: string;
    features: Record<string, boolean>;
    performance: Record<string, any>;
    security: Record<string, boolean>;
    integrations: Record<string, boolean>;
  } {
    const validation = this.validateConfig();

    return {
      status: validation.valid ? 'Configured' : 'Incomplete',
      features: {
        multilingual: this.config.enableMultilingual,
        notifications: this.config.enableNotifications,
        p2pMatching: this.config.enableP2PMatching,
        departmentWorkflows: this.config.enableDepartmentWorkflows,
        metrics: this.config.enableMetrics,
      },
      performance: {
        rateLimitCommands: this.config.rateLimitCommands,
        rateLimitMessages: this.config.rateLimitMessages,
        cacheSize: this.config.translationCacheSize,
        cacheTTL: this.config.translationCacheTTL / 1000 + 's',
      },
      security: {
        jwtEnabled: !!this.config.jwtSecret,
        encryptionEnabled: !!this.config.encryptionKey,
        webhookSecured: !!this.config.webhookSecret,
        sessionTimeout: this.config.sessionTimeout / 1000 + 's',
      },
      integrations: {
        fire22: !!this.config.fire22ApiKey,
        database: !!this.config.databaseUrl,
        webhook: !!this.config.webhookUrl,
        monitoring: !!this.config.sentryDsn,
      },
    };
  }

  /**
   * Update configuration (for runtime updates)
   */
  updateConfig(updates: Partial<TelegramIntegrationConfig>): boolean {
    try {
      this.config = { ...this.config, ...updates };

      // Update environment if possible
      if (updates.enableMultilingual !== undefined) {
        // This would need to be implemented in TelegramEnvironment
        console.log('Feature flag updated:', updates.enableMultilingual);
      }

      return true;
    } catch (error) {
      console.error('Failed to update Telegram config:', error);
      return false;
    }
  }

  /**
   * Export configuration for external use
   */
  exportConfig(): string {
    const config = this.getConfig();
    const summary = this.getDashboardSummary();

    return JSON.stringify(
      {
        config,
        summary,
        validation: this.validateConfig(),
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }
}

// Export singleton instance
export const telegramIntegrationConfig = TelegramIntegrationConfigManager.getInstance();

// Export helper functions
export function getTelegramConfig(): TelegramIntegrationConfig {
  return telegramIntegrationConfig.getConfig();
}

export function validateTelegramConfig(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  return telegramIntegrationConfig.validateConfig();
}

export function testTelegramConnectivity() {
  return telegramIntegrationConfig.testConnectivity();
}

export function getTelegramHealthStatus() {
  return telegramIntegrationConfig.getHealthStatus();
}

export default TelegramIntegrationConfigManager;
