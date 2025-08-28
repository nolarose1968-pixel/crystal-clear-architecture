/**
 * Database Links Configuration
 * 
 * Links D1, R2, SQLite databases and language system to hub at localhost:3000
 */

import { hubConnection } from './hub-connection';
import { fire22Language } from '../i18n/language-manager';

export interface DatabaseLinkConfig {
  name: string;
  type: 'D1' | 'R2' | 'SQLite' | 'Language';
  hubEndpoint: string;
  localBinding?: string;
  syncStrategy: 'realtime' | 'interval' | 'manual';
  syncIntervalMs?: number;
  enabled: boolean;
}

export class DatabaseLinksManager {
  private links: Map<string, DatabaseLinkConfig> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    this.initializeLinks();
  }

  /**
   * Initialize all database links to hub
   */
  private initializeLinks(): void {
    // D1 Database Links
    this.addLink({
      name: 'fire22-dashboard',
      type: 'D1',
      hubEndpoint: 'http://localhost:3001/api/d1/fire22-dashboard',
      localBinding: 'DB',
      syncStrategy: 'realtime',
      enabled: true
    });

    this.addLink({
      name: 'fire22-registry',
      type: 'D1', 
      hubEndpoint: 'http://localhost:3001/api/d1/fire22-registry',
      localBinding: 'REGISTRY_DB',
      syncStrategy: 'interval',
      syncIntervalMs: 30000, // 30 seconds
      enabled: true
    });

    // R2 Storage Links
    this.addLink({
      name: 'fire22-packages',
      type: 'R2',
      hubEndpoint: 'http://localhost:3001/api/r2/fire22-packages', 
      localBinding: 'REGISTRY_STORAGE',
      syncStrategy: 'manual',
      enabled: true
    });

    // SQLite Links
    this.addLink({
      name: 'local-sqlite',
      type: 'SQLite',
      hubEndpoint: 'http://localhost:3001/api/sqlite/local',
      syncStrategy: 'interval',
      syncIntervalMs: 60000, // 1 minute
      enabled: true
    });

    // Language System Link
    this.addLink({
      name: 'language-system',
      type: 'Language',
      hubEndpoint: 'http://localhost:3001/api/language',
      syncStrategy: 'interval',
      syncIntervalMs: 300000, // 5 minutes
      enabled: true
    });
  }

  /**
   * Add a database link
   */
  addLink(config: DatabaseLinkConfig): void {
    this.links.set(config.name, config);
    
    if (config.enabled && config.syncStrategy === 'interval' && config.syncIntervalMs) {
      this.startIntervalSync(config);
    }
  }

  /**
   * Remove a database link
   */
  removeLink(name: string): void {
    this.stopIntervalSync(name);
    this.links.delete(name);
  }

  /**
   * Start interval sync for a link
   */
  private startIntervalSync(config: DatabaseLinkConfig): void {
    if (this.syncIntervals.has(config.name)) {
      this.stopIntervalSync(config.name);
    }

    const interval = setInterval(async () => {
      try {
        await this.syncLink(config.name, 'push');
        console.log(`✅ Auto-sync completed for ${config.name}`);
      } catch (error) {
        console.error(`❌ Auto-sync failed for ${config.name}:`, error);
      }
    }, config.syncIntervalMs);

    this.syncIntervals.set(config.name, interval);
  }

  /**
   * Stop interval sync for a link
   */
  private stopIntervalSync(name: string): void {
    const interval = this.syncIntervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(name);
    }
  }

  /**
   * Sync a specific link
   */
  async syncLink(name: string, direction: 'push' | 'pull' = 'push'): Promise<boolean> {
    const link = this.links.get(name);
    if (!link || !link.enabled) {
      throw new Error(`Link not found or disabled: ${name}`);
    }

    try {
      switch (link.type) {
        case 'D1':
          return await this.syncD1Link(link, direction);
        case 'R2':
          return await this.syncR2Link(link, direction);
        case 'SQLite':
          return await this.syncSQLiteLink(link, direction);
        case 'Language':
          return await this.syncLanguageLink(link, direction);
        default:
          throw new Error(`Unsupported link type: ${link.type}`);
      }
    } catch (error) {
      console.error(`Sync failed for ${name}:`, error);
      return false;
    }
  }

  /**
   * Sync D1 database link
   */
  private async syncD1Link(link: DatabaseLinkConfig, direction: 'push' | 'pull'): Promise<boolean> {
    if (direction === 'push') {
      // Push local D1 changes to hub
      const response = await fetch(`${link.hubEndpoint}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'push',
          binding: link.localBinding,
          timestamp: new Date().toISOString()
        })
      });
      return response.ok;
    } else {
      // Pull hub D1 changes to local
      const response = await fetch(`${link.hubEndpoint}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pull',
          binding: link.localBinding,
          timestamp: new Date().toISOString()
        })
      });
      return response.ok;
    }
  }

  /**
   * Sync R2 storage link
   */
  private async syncR2Link(link: DatabaseLinkConfig, direction: 'push' | 'pull'): Promise<boolean> {
    if (direction === 'push') {
      // Push local R2 objects to hub
      return await hubConnection.uploadToR2(link.name, 'sync-marker', JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'sync-push'
      }));
    } else {
      // Pull hub R2 objects to local
      const data = await hubConnection.downloadFromR2(link.name, 'sync-marker');
      return data !== null;
    }
  }

  /**
   * Sync SQLite link
   */
  private async syncSQLiteLink(link: DatabaseLinkConfig, direction: 'push' | 'pull'): Promise<boolean> {
    return await hubConnection.syncSQLite(direction);
  }

  /**
   * Sync language system link
   */
  private async syncLanguageLink(link: DatabaseLinkConfig, direction: 'push' | 'pull'): Promise<boolean> {
    return await hubConnection.syncLanguageData(direction);
  }

  /**
   * Sync all enabled links
   */
  async syncAll(direction: 'push' | 'pull' = 'push'): Promise<{
    total: number;
    successful: number;
    failed: string[];
  }> {
    const enabledLinks = Array.from(this.links.values()).filter(link => link.enabled);
    const results = await Promise.allSettled(
      enabledLinks.map(link => this.syncLink(link.name, direction))
    );

    const failed: string[] = [];
    let successful = 0;

    results.forEach((result, index) => {
      const link = enabledLinks[index];
      if (result.status === 'fulfilled' && result.value) {
        successful++;
      } else {
        failed.push(link.name);
      }
    });

    return {
      total: enabledLinks.length,
      successful,
      failed
    };
  }

  /**
   * Test all links connectivity
   */
  async testAllLinks(): Promise<{
    [linkName: string]: {
      status: 'connected' | 'failed';
      responseTime: number;
      error?: string;
    }
  }> {
    const results: {
      [linkName: string]: {
        status: 'connected' | 'failed';
        responseTime: number;
        error?: string;
      }
    } = {};

    for (const [name, link] of this.links.entries()) {
      const startTime = Date.now();
      try {
        const response = await fetch(`${link.hubEndpoint}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        const responseTime = Date.now() - startTime;
        results[name] = {
          status: response.ok ? 'connected' : 'failed',
          responseTime,
          ...(response.ok ? {} : { error: `HTTP ${response.status}` })
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results[name] = {
          status: 'failed',
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return results;
  }

  /**
   * Get link status
   */
  getLinkStatus(): {
    name: string;
    type: string;
    endpoint: string;
    syncStrategy: string;
    enabled: boolean;
    hasInterval: boolean;
  }[] {
    return Array.from(this.links.values()).map(link => ({
      name: link.name,
      type: link.type,
      endpoint: link.hubEndpoint,
      syncStrategy: link.syncStrategy,
      enabled: link.enabled,
      hasInterval: this.syncIntervals.has(link.name)
    }));
  }

  /**
   * Enable/disable a link
   */
  setLinkEnabled(name: string, enabled: boolean): void {
    const link = this.links.get(name);
    if (!link) {
      throw new Error(`Link not found: ${name}`);
    }

    link.enabled = enabled;
    this.links.set(name, link);

    if (enabled && link.syncStrategy === 'interval' && link.syncIntervalMs) {
      this.startIntervalSync(link);
    } else {
      this.stopIntervalSync(name);
    }
  }

  /**
   * Update link sync strategy
   */
  updateSyncStrategy(
    name: string, 
    syncStrategy: 'realtime' | 'interval' | 'manual',
    syncIntervalMs?: number
  ): void {
    const link = this.links.get(name);
    if (!link) {
      throw new Error(`Link not found: ${name}`);
    }

    this.stopIntervalSync(name);
    
    link.syncStrategy = syncStrategy;
    if (syncIntervalMs) {
      link.syncIntervalMs = syncIntervalMs;
    }
    
    this.links.set(name, link);

    if (link.enabled && syncStrategy === 'interval' && link.syncIntervalMs) {
      this.startIntervalSync(link);
    }
  }

  /**
   * Cleanup all intervals
   */
  cleanup(): void {
    for (const name of this.syncIntervals.keys()) {
      this.stopIntervalSync(name);
    }
  }
}

// Export singleton instance
export const databaseLinks = new DatabaseLinksManager();

// Auto-sync all on startup
if (typeof window === 'undefined') {
  // Server-side auto-sync
  setTimeout(async () => {
    try {
      const results = await databaseLinks.syncAll('push');
      console.log(`🔗 Database links auto-sync: ${results.successful}/${results.total} successful`);
      if (results.failed.length > 0) {
        console.warn('Failed syncs:', results.failed);
      }
    } catch (error) {
      console.error('🚨 Database links auto-sync failed:', error);
    }
  }, 5000); // Wait 5 seconds after startup
}