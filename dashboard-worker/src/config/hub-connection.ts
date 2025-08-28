/**
 * Hub Connection Configuration
 * 
 * Centralizes connections to D1, R2, SQLite, and Language systems
 * through the hub at localhost:3000
 */

import { BunR2Client } from '../utils/bun-r2-client';
import { fire22Language } from '../i18n/language-manager';
import { errorStandardizer } from '../middleware/error-response-standardizer';
import { errorTracker } from '../../scripts/error-system/error-tracker';

export interface HubConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  enableHealthCheck: boolean;
}

export interface DatabaseConnection {
  name: string;
  type: 'D1' | 'R2' | 'SQLite' | 'Telegram' | 'ErrorSystem';
  binding?: string;
  endpoint?: string;
  status: 'connected' | 'disconnected' | 'error';
  config?: any;
  errorTracking?: {
    enabled: boolean;
    occurrences: number;
    lastError?: Date;
  };
}

export class HubConnectionManager {
  private config: HubConfig;
  private connections: Map<string, DatabaseConnection> = new Map();
  private r2Client?: BunR2Client;
  
  constructor(config: Partial<HubConfig> = {}) {
    this.config = {
      baseUrl: process.env.HUB_URL || 'http://localhost:3001', // Use 3001 for testing
      timeout: 10000,
      retries: 3,
      enableHealthCheck: true,
      ...config
    };
    
    this.initializeConnections();
  }

  /**
   * Initialize all database connections through the hub
   */
  private initializeConnections(): void {
    // D1 Database connections
    this.connections.set('fire22-dashboard', {
      name: 'fire22-dashboard',
      type: 'D1',
      binding: 'DB',
      endpoint: `${this.config.baseUrl}/api/d1/fire22-dashboard`,
      status: 'disconnected'
    });

    this.connections.set('fire22-registry', {
      name: 'fire22-registry',
      type: 'D1',
      binding: 'REGISTRY_DB',
      endpoint: `${this.config.baseUrl}/api/d1/fire22-registry`,
      status: 'disconnected'
    });

    // R2 Storage connections
    this.connections.set('fire22-packages', {
      name: 'fire22-packages',
      type: 'R2',
      binding: 'REGISTRY_STORAGE',
      endpoint: `${this.config.baseUrl}/api/r2/fire22-packages`,
      status: 'disconnected'
    });

    // SQLite connections (local with hub sync)
    this.connections.set('sqlite-local', {
      name: 'sqlite-local',
      type: 'SQLite',
      endpoint: `${this.config.baseUrl}/api/sqlite/sync`,
      status: 'disconnected'
    });

    // Telegram Bot Service
    this.connections.set('telegram-bot', {
      name: 'telegram-bot',
      type: 'Telegram',
      endpoint: `${this.config.baseUrl}/api/telegram/status`,
      status: 'disconnected',
      config: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
        enableMultilingual: process.env.ENABLE_MULTILINGUAL === 'true',
        enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true'
      }
    });

    // Error Management System
    this.connections.set('error-system', {
      name: 'error-system',
      type: 'ErrorSystem',
      endpoint: `${this.config.baseUrl}/api/errors`,
      status: 'disconnected',
      config: {
        trackingEnabled: process.env.ERROR_TRACKING_ENABLED !== 'false',
        alertingEnabled: process.env.ERROR_ALERTING_ENABLED !== 'false',
        registryPath: './docs/error-codes.json',
        maxOccurrences: parseInt(process.env.MAX_ERROR_OCCURRENCES || '1000'),
        retentionDays: parseInt(process.env.ERROR_RETENTION_DAYS || '30')
      },
      errorTracking: {
        enabled: true,
        occurrences: 0
      }
    });
  }

  /**
   * Connect to the hub and test all services
   */
  async connectToHub(): Promise<{success: boolean, connections: DatabaseConnection[]}> {
    try {
      // Test hub availability
      const hubResponse = await fetch(`${this.config.baseUrl}/health`, {
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!hubResponse.ok) {
        throw new Error(`Hub not available: ${hubResponse.status}`);
      }

      const hubData = await hubResponse.json();
      console.log('Hub health:', hubData);

      // Test each connection
      const connectionResults = await Promise.allSettled(
        Array.from(this.connections.values()).map(conn => this.testConnection(conn))
      );

      // Update connection statuses
      connectionResults.forEach((result, index) => {
        const connections = Array.from(this.connections.values());
        const connection = connections[index];
        if (result.status === 'fulfilled') {
          connection.status = 'connected';
        } else {
          connection.status = 'error';
          console.error(`Connection failed for ${connection.name}:`, result.reason);
        }
        this.connections.set(connection.name, connection);
      });

      const connectedCount = Array.from(this.connections.values())
        .filter(conn => conn.status === 'connected').length;

      return {
        success: connectedCount > 0,
        connections: Array.from(this.connections.values())
      };
    } catch (error) {
      console.error('Failed to connect to hub:', error);
      return {
        success: false,
        connections: Array.from(this.connections.values())
      };
    }
  }

  /**
   * Test individual connection
   */
  private async testConnection(connection: DatabaseConnection): Promise<boolean> {
    if (!connection.endpoint) return false;

    try {
      // Special handling for Telegram bot connection
      if (connection.type === 'Telegram') {
        return await this.testTelegramConnection(connection);
      }

      // Special handling for Error System connection
      if (connection.type === 'ErrorSystem') {
        return await this.testErrorSystemConnection(connection);
      }

      const response = await fetch(connection.endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      return response.ok;
    } catch (error) {
      console.error(`Connection test failed for ${connection.name}:`, error);
      return false;
    }
  }

  /**
   * Test Error System connection specifically
   */
  private async testErrorSystemConnection(connection: DatabaseConnection): Promise<boolean> {
    try {
      // Test if error registry is accessible
      const registryPath = connection.config?.registryPath || './docs/error-codes.json';
      
      // Try to access error system health endpoint
      const response = await fetch(`${connection.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const healthData = await response.json();
        console.log(`✅ Error System connected: ${healthData.data?.registry?.totalErrorCodes || 0} error codes`);
        
        // Update error tracking info
        if (connection.errorTracking) {
          connection.errorTracking.occurrences = 0;
          connection.errorTracking.lastError = undefined;
        }
        
        return true;
      } else {
        console.error('Error System health check failed:', response.statusText);
        this.trackConnectionError(connection, 'E4001', 'Health check failed');
        return false;
      }
    } catch (error) {
      console.error('Error System connection test failed:', error);
      this.trackConnectionError(connection, 'E4001', error.message);
      return false;
    }
  }

  /**
   * Test Telegram bot connection specifically
   */
  private async testTelegramConnection(connection: DatabaseConnection): Promise<boolean> {
    try {
      // Check if Telegram environment is properly configured
      const { TelegramEnvironment } = await import('../telegram/telegram-env');
      const telegramEnv = TelegramEnvironment.getInstance();
      
      // Validate required secrets
      const validation = telegramEnv.validateRequiredSecrets();
      if (!validation.valid) {
        console.error('Telegram validation failed:', validation.missing);
        return false;
      }

      // Test bot token by making a simple API call
      const response = await fetch(`https://api.telegram.org/bot${telegramEnv.botToken}/getMe`, {
        signal: AbortSignal.timeout(5000) // Shorter timeout for external API
      });

      if (response.ok) {
        const botInfo = await response.json();
        console.log(`✅ Telegram bot connected: @${botInfo.result?.username || 'Unknown'}`);
        return true;
      } else {
        console.error('Telegram bot API test failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Telegram connection test failed:', error);
      this.trackConnectionError(connection, 'E8001', error.message);
      return false;
    }
  }

  /**
   * Track connection error for monitoring
   */
  private trackConnectionError(connection: DatabaseConnection, errorCode: string, message: string): void {
    try {
      // Update connection error tracking
      if (connection.errorTracking) {
        connection.errorTracking.occurrences++;
        connection.errorTracking.lastError = new Date();
      }

      // Track error in error system if available
      if (errorTracker) {
        errorTracker.trackError(errorCode, {
          connectionName: connection.name,
          connectionType: connection.type,
          endpoint: connection.endpoint,
          errorMessage: message
        });
      }

      // Create standardized error response for logging
      if (errorStandardizer) {
        const errorResponse = errorStandardizer.createErrorResponse(errorCode, {
          metadata: {
            connectionName: connection.name,
            connectionType: connection.type,
            endpoint: connection.endpoint,
            errorMessage: message,
            timestamp: new Date().toISOString()
          }
        });

        console.error(`🚨 Connection Error [${errorCode}]:`, errorResponse.error.message);
      }
    } catch (trackingError) {
      console.warn('Failed to track connection error:', trackingError);
    }
  }

  /**
   * Execute D1 query through hub
   */
  async executeD1Query(databaseName: string, query: string, params?: any[]): Promise<any> {
    const connection = this.connections.get(databaseName);
    if (!connection || connection.type !== 'D1') {
      throw new Error(`D1 database not found: ${databaseName}`);
    }

    try {
      const response = await fetch(`${connection.endpoint}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({ query, params }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`D1 query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`D1 query failed for ${databaseName}:`, error);
      this.trackConnectionError(connection, 'E2001', error.message);
      throw error;
    }
  }

  /**
   * Upload to R2 through hub
   */
  async uploadToR2(bucketName: string, key: string, data: Buffer | string): Promise<boolean> {
    const connection = this.connections.get(bucketName);
    if (!connection || connection.type !== 'R2') {
      throw new Error(`R2 bucket not found: ${bucketName}`);
    }

    try {
      const formData = new FormData();
      formData.append('key', key);
      formData.append('data', new Blob([data]));

      const response = await fetch(`${connection.endpoint}/upload`, {
        method: 'POST',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: formData,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      return response.ok;
    } catch (error) {
      console.error(`R2 upload failed for ${bucketName}:`, error);
      return false;
    }
  }

  /**
   * Download from R2 through hub
   */
  async downloadFromR2(bucketName: string, key: string): Promise<ArrayBuffer | null> {
    const connection = this.connections.get(bucketName);
    if (!connection || connection.type !== 'R2') {
      throw new Error(`R2 bucket not found: ${bucketName}`);
    }

    try {
      const response = await fetch(`${connection.endpoint}/download/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        return null;
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error(`R2 download failed for ${bucketName}:`, error);
      return null;
    }
  }

  /**
   * Delete object from R2
   */
  async deleteFromR2(bucketName: string, key: string): Promise<boolean> {
    const connection = this.connections.get('r2-storage');
    if (!connection || connection.type !== 'R2') {
      throw new Error('R2 storage connection not configured');
    }

    try {
      const response = await fetch(`${connection.endpoint}/${bucketName}/${key}`, {
        method: 'DELETE',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to delete from R2 (${bucketName}/${key}):`, error);
      return false;
    }
  }

  /**
   * List objects in R2 bucket
   */
  async listR2Objects(bucketName: string, options?: { prefix?: string; limit?: number }): Promise<any[]> {
    const connection = this.connections.get('r2-storage');
    if (!connection || connection.type !== 'R2') {
      throw new Error('R2 storage connection not configured');
    }

    try {
      const params = new URLSearchParams();
      if (options?.prefix) params.append('prefix', options.prefix);
      if (options?.limit) params.append('limit', String(options.limit));

      const response = await fetch(`${connection.endpoint}/${bucketName}/list?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Failed to list R2 objects: ${response.statusText}`);
      }

      const result = await response.json();
      return result.objects || [];
    } catch (error) {
      console.error(`Failed to list R2 objects in ${bucketName}:`, error);
      return [];
    }
  }

  /**
   * Sync SQLite with hub
   */
  async syncSQLite(operation: 'push' | 'pull', tableName?: string): Promise<boolean> {
    const connection = this.connections.get('sqlite-local');
    if (!connection) {
      throw new Error('SQLite connection not configured');
    }

    try {
      const response = await fetch(`${connection.endpoint}/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({ tableName }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      return response.ok;
    } catch (error) {
      console.error(`SQLite sync failed (${operation}):`, error);
      return false;
    }
  }

  /**
   * Sync language data with hub
   */
  async syncLanguageData(operation: 'push' | 'pull'): Promise<boolean> {
    try {
      if (operation === 'push') {
        // Push local language data to hub
        const languageData = {
          codes: fire22Language.getAllCodes(),
          supportedLanguages: fire22Language.getSupportedLanguages(),
          statistics: fire22Language.getStatistics(),
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: '1.0.0'
          }
        };

        const response = await fetch(`${this.config.baseUrl}/api/language/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          },
          body: JSON.stringify(languageData),
          signal: AbortSignal.timeout(this.config.timeout)
        });

        return response.ok;
      } else {
        // Pull language data from hub
        const response = await fetch(`${this.config.baseUrl}/api/language/data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          },
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (response.ok) {
          const hubLanguageData = await response.json();
          // Update local language manager with hub data
          if (hubLanguageData.translations) {
            fire22Language.importTranslations(
              JSON.stringify(hubLanguageData.translations), 
              fire22Language.getCurrentLanguage()
            );
          }
        }

        return response.ok;
      }
    } catch (error) {
      console.error(`Language sync failed (${operation}):`, error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): DatabaseConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connected services count
   */
  getConnectedServicesCount(): number {
    return Array.from(this.connections.values())
      .filter(conn => conn.status === 'connected').length;
  }

  /**
   * Health check all connections
   */
  async healthCheck(): Promise<{
    hub: boolean;
    services: Record<string, boolean>;
    totalConnected: number;
    totalServices: number;
  }> {
    const results = await this.connectToHub();
    const serviceStatus: Record<string, boolean> = {};
    
    results.connections.forEach(conn => {
      serviceStatus[conn.name] = conn.status === 'connected';
    });

    return {
      hub: results.success,
      services: serviceStatus,
      totalConnected: this.getConnectedServicesCount(),
      totalServices: this.connections.size
    };
  }

  /**
   * Get Telegram bot status and configuration
   */
  async getTelegramStatus(): Promise<{
    connected: boolean;
    config: any;
    features: any;
    health: any;
  }> {
    const connection = this.connections.get('telegram-bot');
    if (!connection || connection.type !== 'Telegram') {
      throw new Error('Telegram bot connection not configured');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/api/hub/telegram/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Telegram status check failed: ${response.statusText}`);
      }

      const status = await response.json();
      return {
        connected: status.success && status.status === 'active',
        config: status.config || {},
        features: status.features || {},
        health: {
          timestamp: status.timestamp,
          status: status.status
        }
      };
    } catch (error) {
      console.error('Failed to get Telegram status:', error);
      return {
        connected: false,
        config: {},
        features: {},
        health: {
          timestamp: new Date().toISOString(),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get Error System status and statistics
   */
  async getErrorSystemStatus(): Promise<{
    connected: boolean;
    registry: any;
    tracking: any;
    health: any;
  }> {
    const connection = this.connections.get('error-system');
    if (!connection || connection.type !== 'ErrorSystem') {
      throw new Error('Error System connection not configured');
    }

    try {
      const response = await fetch(`${connection.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Error System status check failed: ${response.statusText}`);
      }

      const status = await response.json();
      return {
        connected: status.success,
        registry: status.data?.registry || {},
        tracking: status.data?.tracking || {},
        health: {
          timestamp: status.data?.timestamp,
          status: status.success ? 'healthy' : 'degraded'
        }
      };
    } catch (error) {
      console.error('Failed to get Error System status:', error);
      this.trackConnectionError(connection, 'E5001', error.message);
      return {
        connected: false,
        registry: {},
        tracking: {},
        health: {
          timestamp: new Date().toISOString(),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Track error occurrence through Error System
   */
  async trackError(errorCode: string, context?: Record<string, unknown>): Promise<boolean> {
    const connection = this.connections.get('error-system');
    if (!connection || connection.type !== 'ErrorSystem' || !connection.config?.trackingEnabled) {
      return false;
    }

    try {
      const response = await fetch(`${connection.endpoint}/${errorCode}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({ context: context || {} }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`📊 Error tracked: ${errorCode} (${result.data?.currentStatistics?.occurrences || 0} occurrences)`);
        return true;
      } else {
        console.warn(`Failed to track error ${errorCode}:`, response.statusText);
        return false;
      }
    } catch (error) {
      console.error(`Failed to track error ${errorCode}:`, error);
      return false;
    }
  }

  /**
   * Get error statistics from Error System
   */
  async getErrorStatistics(options?: {
    category?: string;
    severity?: string;
    timeRange?: string;
    limit?: number;
  }): Promise<any> {
    const connection = this.connections.get('error-system');
    if (!connection || connection.type !== 'ErrorSystem') {
      throw new Error('Error System connection not configured');
    }

    try {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.severity) params.append('severity', options.severity);
      if (options?.timeRange) params.append('timeRange', options.timeRange);
      if (options?.limit) params.append('limit', String(options.limit));

      const response = await fetch(`${connection.endpoint}/statistics?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Failed to get error statistics: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to get error statistics:', error);
      this.trackConnectionError(connection, 'E5001', error.message);
      throw error;
    }
  }

  /**
   * Send notification via Telegram bot
   */
  async sendTelegramNotification(userId: number, message: string, options?: {
    type?: string;
    priority?: string;
    data?: any;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/hub/telegram/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          userId,
          message,
          type: options?.type || 'info',
          priority: options?.priority || 'normal',
          data: options?.data || {}
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Notification failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error(`Failed to send Telegram notification to user ${userId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const hubConnection = new HubConnectionManager();

// Auto-initialize connection on import
if (typeof window === 'undefined') {
  // Server-side initialization
  hubConnection.connectToHub().then(result => {
    console.log(`🔗 Hub connection initialized: ${result.connections.length} services, ${result.connections.filter(c => c.status === 'connected').length} connected`);
  }).catch(error => {
    console.error('🚨 Hub connection failed:', error.message);
  });
}