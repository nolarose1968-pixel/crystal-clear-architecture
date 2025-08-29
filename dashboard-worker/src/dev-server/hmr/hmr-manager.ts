/**
 * HMR Manager Module
 * Handles Hot Module Replacement, file watching, and live reloading
 */

import type {
  FileChangeEvent,
  HMRMessage,
  HMRMessageType,
  WebSocketClient,
  WatchConfig,
  HMRConfig
} from '../../../core/types/dev-server';

export class HMRManager {
  private watchers: Map<string, any> = new Map(); // File watchers
  private clients: Map<string, WebSocketClient> = new Map();
  private config: HMRConfig;
  private watchConfig: WatchConfig;
  private fileHashes: Map<string, string> = new Map();
  private changeQueue: FileChangeEvent[] = [];
  private processingChanges = false;

  constructor(hmrConfig: Partial<HMRConfig> = {}, watchConfig: Partial<WatchConfig> = {}) {
    this.config = {
      enabled: true,
      port: 3001,
      heartbeatInterval: 30000,
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      overlay: true,
      ...hmrConfig
    };

    this.watchConfig = {
      paths: ['./src', './public'],
      ignored: ['node_modules', '.git', 'dist', '*.log'],
      debounceMs: 300,
      usePolling: false,
      interval: 100,
      ...watchConfig
    };
  }

  /**
   * Initialize HMR system
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('ℹ️ HMR is disabled');
      return;
    }

    console.log('🔥 Initializing HMR system...');

    try {
      await this.setupFileWatchers();
      this.startHeartbeat();
      console.log('✅ HMR system initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize HMR system:', error);
      throw error;
    }
  }

  /**
   * Setup file watchers for monitored paths
   */
  private async setupFileWatchers(): Promise<void> {
    for (const watchPath of this.watchConfig.paths) {
      try {
        // In a real implementation, this would use a file watching library
        // For now, we'll simulate file watching
        const watcher = this.createMockWatcher(watchPath);
        this.watchers.set(watchPath, watcher);

        console.log(`👀 Watching: ${watchPath}`);
      } catch (error) {
        console.error(`❌ Failed to watch path ${watchPath}:`, error);
      }
    }
  }

  /**
   * Handle file change event
   */
  async handleFileChange(change: FileChangeEvent): Promise<void> {
    console.log(`📝 File ${change.type}: ${change.path}`);

    // Add to queue for debounced processing
    this.changeQueue.push(change);

    // Debounce file change processing
    if (!this.processingChanges) {
      this.processingChanges = true;
      setTimeout(() => this.processFileChanges(), this.watchConfig.debounceMs);
    }
  }

  /**
   * Process queued file changes
   */
  private async processFileChanges(): Promise<void> {
    if (this.changeQueue.length === 0) {
      this.processingChanges = false;
      return;
    }

    const changes = [...this.changeQueue];
    this.changeQueue = [];

    try {
      // Filter and validate changes
      const validChanges = changes.filter(change => this.isValidChange(change));

      if (validChanges.length === 0) {
        this.processingChanges = false;
        return;
      }

      // Check for circular dependencies or excessive changes
      if (validChanges.length > 100) {
        console.warn('⚠️ Large number of file changes detected, triggering full reload');
        await this.triggerFullReload(validChanges);
      } else {
        await this.triggerHMRUpdate(validChanges);
      }

    } catch (error) {
      console.error('❌ Failed to process file changes:', error);
    } finally {
      this.processingChanges = false;
    }
  }

  /**
   * Register WebSocket client
   */
  registerClient(client: Omit<WebSocketClient, 'id' | 'connectedAt' | 'lastActivity'>): string {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const fullClient: WebSocketClient = {
      id: clientId,
      connectedAt: now,
      lastActivity: now,
      ...client
    };

    this.clients.set(clientId, fullClient);

    // Send welcome message
    this.sendMessageToClient(clientId, {
      type: 'connect',
      payload: {
        message: 'Connected to HMR server',
        clientId,
        config: this.config
      },
      timestamp: new Date()
    });

    console.log(`🔗 HMR client connected: ${clientId}`);
    return clientId;
  }

  /**
   * Unregister WebSocket client
   */
  unregisterClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      console.log(`🔌 HMR client disconnected: ${clientId}`);
    }
  }

  /**
   * Handle WebSocket message from client
   */
  handleClientMessage(clientId: string, message: HMRMessage): void {
    const client = this.clients.get(clientId);
    if (!client) {
      console.warn(`⚠️ Unknown HMR client: ${clientId}`);
      return;
    }

    // Update client activity
    client.lastActivity = new Date();

    switch (message.type) {
      case 'connect':
        this.handleClientConnect(clientId, client);
        break;
      case 'disconnect':
        this.unregisterClient(clientId);
        break;
      default:
        console.log(`📨 HMR message from ${clientId}:`, message);
    }
  }

  /**
   * Send message to specific client
   */
  private sendMessageToClient(clientId: string, message: HMRMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.socket) {
      try {
        // In a real implementation, this would send via WebSocket
        console.log(`📤 HMR message to ${clientId}:`, message.type);
      } catch (error) {
        console.error(`❌ Failed to send HMR message to ${clientId}:`, error);
      }
    }
  }

  /**
   * Broadcast message to all clients
   */
  private broadcastMessage(message: HMRMessage): void {
    for (const [clientId, client] of this.clients) {
      if (client.isAlive) {
        this.sendMessageToClient(clientId, message);
      }
    }
  }

  /**
   * Trigger HMR update for changed files
   */
  private async triggerHMRUpdate(changes: FileChangeEvent[]): Promise<void> {
    const hmrMessage: HMRMessage = {
      type: 'file-change',
      payload: {
        changes,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };

    this.broadcastMessage(hmrMessage);

    // Update stats
    changes.forEach(change => {
      console.log(`🔄 HMR update triggered for: ${change.path}`);
    });
  }

  /**
   * Trigger full page reload
   */
  private async triggerFullReload(changes: FileChangeEvent[]): Promise<void> {
    const reloadMessage: HMRMessage = {
      type: 'reload',
      payload: {
        reason: 'bulk_file_changes',
        changes: changes.length,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };

    this.broadcastMessage(reloadMessage);
    console.log(`🔄 Full page reload triggered (${changes.length} changes)`);
  }

  /**
   * Start heartbeat to check client connections
   */
  private startHeartbeat(): void {
    setInterval(() => {
      const now = Date.now();
      const timeoutMs = this.config.heartbeatInterval * 2;

      for (const [clientId, client] of this.clients) {
        const timeSinceActivity = now - client.lastActivity.getTime();

        if (timeSinceActivity > timeoutMs) {
          console.log(`💔 HMR client timeout: ${clientId}`);
          client.isAlive = false;
          // In a real implementation, you might remove the client or ping it
        } else {
          client.isAlive = true;
        }
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Check if file change should trigger HMR
   */
  private isValidChange(change: FileChangeEvent): boolean {
    // Check if path is ignored
    for (const ignored of this.watchConfig.ignored) {
      if (change.path.includes(ignored)) {
        return false;
      }
    }

    // Only process certain file types
    const validExtensions = ['.ts', '.js', '.tsx', '.jsx', '.vue', '.svelte', '.html', '.css'];
    const ext = change.path.substring(change.path.lastIndexOf('.'));

    return validExtensions.includes(ext);
  }

  /**
   * Handle client connection
   */
  private handleClientConnect(clientId: string, client: WebSocketClient): void {
    console.log(`🤝 HMR client handshake: ${clientId}`);

    // Send current state to client
    this.sendMessageToClient(clientId, {
      type: 'connect',
      payload: {
        message: 'HMR connection established',
        clientId,
        serverTime: new Date().toISOString()
      },
      timestamp: new Date()
    });
  }

  /**
   * Create mock file watcher (in real implementation, use chokidar or similar)
   */
  private createMockWatcher(path: string): any {
    // Mock implementation - in real app, use actual file watching
    return {
      path,
      active: true,
      onChange: (callback: (change: FileChangeEvent) => void) => {
        // Simulate occasional file changes for demo
        setInterval(() => {
          if (Math.random() < 0.1) { // 10% chance every 5 seconds
            const mockChange: FileChangeEvent = {
              type: 'modify',
              path: `${path}/mock-file-${Math.floor(Math.random() * 100)}.ts`,
              timestamp: new Date()
            };
            callback(mockChange);
          }
        }, 5000);
      }
    };
  }

  /**
   * Get HMR statistics
   */
  getStats(): {
    enabled: boolean;
    clients: number;
    watchers: number;
    config: HMRConfig;
  } {
    return {
      enabled: this.config.enabled,
      clients: this.clients.size,
      watchers: this.watchers.size,
      config: { ...this.config }
    };
  }

  /**
   * Get connected clients
   */
  getClients(): WebSocketClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Force reload all clients
   */
  forceReload(reason: string = 'manual_trigger'): void {
    const reloadMessage: HMRMessage = {
      type: 'reload',
      payload: {
        reason,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };

    this.broadcastMessage(reloadMessage);
    console.log(`🔄 Manual reload triggered: ${reason}`);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Stop watchers
    for (const [path, watcher] of this.watchers) {
      console.log(`🛑 Stopping watcher: ${path}`);
      // In real implementation, stop the actual watcher
    }
    this.watchers.clear();

    // Disconnect clients
    for (const [clientId] of this.clients) {
      this.unregisterClient(clientId);
    }
    this.clients.clear();

    console.log('🧹 HMR system cleaned up');
  }
}
