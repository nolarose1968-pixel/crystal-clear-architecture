/**
 * Worker Messenger - YAML-Based Communication Optimization
 * Domain-Driven Design Implementation
 *
 * Implements Bun's native YAML support with 500x faster postMessage
 * for optimized inter-domain communication in Crystal Clear Architecture.
 */

import { YAML } from "bun";

export interface MessageMetadata {
  correlationId: string;
  timestamp: string;
  version: string;
  sourceDomain: string;
  targetDomain: string;
  priority: "low" | "normal" | "high" | "critical";
  ttl: number; // Time to live in milliseconds
  compression?: boolean;
  batchId?: string;
}

export interface WorkerMessage {
  type: string;
  metadata: MessageMetadata;
  payload: Record<string, any>;
}

export interface WorkerMetrics {
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
  errors: number;
  compressionRatio: number;
  batchEfficiency: number;
}

export interface MessageBatch {
  batchId: string;
  messages: WorkerMessage[];
  totalSize: number;
  compressionRatio: number;
  priority: "low" | "normal" | "high" | "critical";
}

export class WorkerMessenger {
  private worker: Worker;
  private messageQueue: Map<string, WorkerMessage> = new Map();
  private batchQueue: MessageBatch[] = [];
  private performanceMetrics: WorkerMetrics;
  private batchTimer: Timer | null = null;
  private readonly BATCH_INTERVAL = 100; // ms
  private readonly MAX_BATCH_SIZE = 10;
  private readonly COMPRESSION_THRESHOLD = 1024; // bytes

  constructor(
    worker: Worker,
    private domainName: string,
  ) {
    this.worker = worker;
    this.performanceMetrics = {
      messagesSent: 0,
      messagesReceived: 0,
      averageLatency: 0,
      errors: 0,
      compressionRatio: 1.0,
      batchEfficiency: 1.0,
    };

    this.setupMessageHandler();
    this.startBatchTimer();
  }

  /**
   * Send YAML message with performance optimization
   */
  async send(
    message: Omit<WorkerMessage, "metadata">,
    options: {
      priority?: "low" | "normal" | "high" | "critical";
      compress?: boolean;
      batch?: boolean;
      ttl?: number;
    } = {},
  ): Promise<{ success: boolean; correlationId: string; latency?: number }> {
    const startTime = performance.now();

    try {
      const correlationId = this.generateCorrelationId();
      const metadata: MessageMetadata = {
        correlationId,
        timestamp: new Date().toISOString(),
        version: "1.0",
        sourceDomain: this.domainName,
        targetDomain: message.payload.targetDomain || "unknown",
        priority: options.priority || "normal",
        ttl: options.ttl || 300000, // 5 minutes default
        compression: options.compress || false,
      };

      const fullMessage: WorkerMessage = {
        ...message,
        metadata,
      };

      // Check if message should be batched
      if (options.batch && this.shouldBatch(message)) {
        return this.addToBatch(fullMessage);
      }

      // Serialize to YAML with optional compression
      const yamlMessage = this.serializeMessage(fullMessage, options.compress);

      // Send with performance optimization
      this.worker.postMessage(yamlMessage, {
        transfer: options.compress ? [] : undefined,
      });

      // Track metrics
      this.performanceMetrics.messagesSent++;
      const latency = performance.now() - startTime;
      this.trackLatency(latency);

      // Store message for correlation tracking
      this.messageQueue.set(correlationId, fullMessage);

      // Clean up old messages after TTL
      setTimeout(() => {
        this.messageQueue.delete(correlationId);
      }, metadata.ttl);

      return {
        success: true,
        correlationId,
        latency,
      };
    } catch (error) {
      this.performanceMetrics.errors++;
      console.error(`❌ Worker Messenger: Failed to send message:`, error);
      throw error;
    }
  }

  /**
   * Send batch of messages for efficiency
   */
  async sendBatch(
    messages: Omit<WorkerMessage, "metadata">[],
    priority: "low" | "normal" | "high" | "critical" = "normal",
  ): Promise<{ success: boolean; batchId: string; latency: number }> {
    const startTime = performance.now();
    const batchId = this.generateCorrelationId();

    try {
      // Create batch message
      const batchMessage: MessageBatch = {
        batchId,
        messages: messages.map((msg) => ({
          ...msg,
          metadata: {
            correlationId: this.generateCorrelationId(),
            timestamp: new Date().toISOString(),
            version: "1.0",
            sourceDomain: this.domainName,
            targetDomain: msg.payload.targetDomain || "unknown",
            priority,
            ttl: 300000,
          },
        })),
        totalSize: 0,
        compressionRatio: 1.0,
        priority,
      };

      // Calculate total size and apply compression if beneficial
      const serializedBatch = YAML.stringify({
        type: "BATCH_MESSAGE",
        metadata: {
          correlationId: batchId,
          timestamp: new Date().toISOString(),
          version: "1.0",
          sourceDomain: this.domainName,
          targetDomain: "batch",
          priority,
          ttl: 300000,
          compression: true,
        },
        payload: batchMessage,
      });

      batchMessage.totalSize = new Blob([serializedBatch]).size;
      batchMessage.compressionRatio = this.calculateCompressionRatio(
        messages,
        serializedBatch,
      );

      // Send batch
      this.worker.postMessage(serializedBatch);

      // Track metrics
      this.performanceMetrics.messagesSent += messages.length;
      this.performanceMetrics.batchEfficiency = batchMessage.compressionRatio;

      const latency = performance.now() - startTime;
      this.trackLatency(latency);

      return {
        success: true,
        batchId,
        latency,
      };
    } catch (error) {
      this.performanceMetrics.errors++;
      console.error(`❌ Worker Messenger: Failed to send batch:`, error);
      throw error;
    }
  }

  /**
   * Handle incoming messages
   */
  private setupMessageHandler(): void {
    this.worker.onmessage = async (event: MessageEvent) => {
      const startTime = performance.now();

      try {
        const message = this.deserializeMessage(event.data);

        if (message.type === "BATCH_MESSAGE") {
          await this.processBatchMessage(message.payload as MessageBatch);
        } else {
          await this.processSingleMessage(message);
        }

        this.performanceMetrics.messagesReceived++;
        const latency = performance.now() - startTime;
        this.trackLatency(latency);
      } catch (error) {
        this.performanceMetrics.errors++;
        console.error(`❌ Worker Messenger: Failed to process message:`, error);
      }
    };
  }

  /**
   * Process single message
   */
  private async processSingleMessage(message: WorkerMessage): Promise<void> {
    // Validate message structure
    if (!this.validateMessage(message)) {
      throw new Error("Invalid message format");
    }

    // Handle different message types
    switch (message.type) {
      case "SETTLEMENT_UPDATE":
        await this.handleSettlementUpdate(message);
        break;
      case "COMMISSION_CALCULATED":
        await this.handleCommissionCalculated(message);
        break;
      case "BONUS_AWARDED":
        await this.handleBonusAwarded(message);
        break;
      case "BALANCE_UPDATED":
        await this.handleBalanceUpdated(message);
        break;
      default:
        console.warn(
          `⚠️ Worker Messenger: Unknown message type: ${message.type}`,
        );
    }

    // Publish domain event for tracking
    await this.publishDomainEvent("worker.message.processed", {
      messageType: message.type,
      correlationId: message.metadata.correlationId,
      processingTime: performance.now(),
    });
  }

  /**
   * Process batch message
   */
  private async processBatchMessage(batch: MessageBatch): Promise<void> {
    console.log(
      `📦 Processing batch: ${batch.batchId} (${batch.messages.length} messages)`,
    );

    for (const message of batch.messages) {
      await this.processSingleMessage(message);
    }

    // Update batch efficiency metrics
    this.performanceMetrics.batchEfficiency = batch.compressionRatio;
  }

  /**
   * Domain-specific message handlers
   */
  private async handleSettlementUpdate(message: WorkerMessage): Promise<void> {
    console.log(`💰 Processing settlement update:`, message.payload);

    // Forward to appropriate domain handler
    await this.publishDomainEvent("settlement.update.received", {
      settlementId: message.payload.settlementId,
      amount: message.payload.amount,
      correlationId: message.metadata.correlationId,
    });
  }

  private async handleCommissionCalculated(
    message: WorkerMessage,
  ): Promise<void> {
    console.log(`📊 Processing commission calculation:`, message.payload);

    await this.publishDomainEvent("commission.calculated.received", {
      recipientId: message.payload.recipientId,
      amount: message.payload.calculatedAmount,
      correlationId: message.metadata.correlationId,
    });
  }

  private async handleBonusAwarded(message: WorkerMessage): Promise<void> {
    console.log(`🎁 Processing bonus award:`, message.payload);

    await this.publishDomainEvent("bonus.awarded.received", {
      customerId: message.payload.customerId,
      bonusAmount: message.payload.amount,
      correlationId: message.metadata.correlationId,
    });
  }

  private async handleBalanceUpdated(message: WorkerMessage): Promise<void> {
    console.log(`💵 Processing balance update:`, message.payload);

    await this.publishDomainEvent("balance.updated.received", {
      agentId: message.payload.agentId,
      newBalance: message.payload.newBalance,
      correlationId: message.metadata.correlationId,
    });
  }

  /**
   * Message serialization with optional compression
   */
  private serializeMessage(
    message: WorkerMessage,
    compress: boolean = false,
  ): string {
    const yamlString = YAML.stringify(message);

    if (compress && yamlString.length > this.COMPRESSION_THRESHOLD) {
      // Apply simple compression (in real implementation, use proper compression)
      return `COMPRESSED:${btoa(yamlString)}`;
    }

    return yamlString;
  }

  /**
   * Message deserialization with compression support
   */
  private deserializeMessage(data: string): WorkerMessage {
    if (data.startsWith("COMPRESSED:")) {
      // Decompress (in real implementation, use proper decompression)
      const compressedData = data.substring("COMPRESSED:".length);
      data = atob(compressedData);
    }

    return YAML.parse(data) as WorkerMessage;
  }

  /**
   * Message validation
   */
  private validateMessage(message: WorkerMessage): boolean {
    const requiredFields = ["type", "metadata", "payload"];

    if (!requiredFields.every((field) => message[field])) {
      return false;
    }

    const requiredMetadata = [
      "correlationId",
      "timestamp",
      "version",
      "sourceDomain",
      "targetDomain",
    ];
    if (!requiredMetadata.every((field) => message.metadata[field])) {
      return false;
    }

    return true;
  }

  /**
   * Batch management
   */
  private shouldBatch(message: Omit<WorkerMessage, "metadata">): boolean {
    return (
      message.type.includes("UPDATE") || message.type.includes("CALCULATED")
    );
  }

  private addToBatch(message: WorkerMessage): {
    success: boolean;
    correlationId: string;
  } {
    // Find or create appropriate batch
    let batch = this.batchQueue.find(
      (b) => b.priority === message.metadata.priority,
    );

    if (!batch) {
      batch = {
        batchId: this.generateCorrelationId(),
        messages: [],
        totalSize: 0,
        compressionRatio: 1.0,
        priority: message.metadata.priority,
      };
      this.batchQueue.push(batch);
    }

    batch.messages.push(message);
    batch.totalSize = this.calculateBatchSize(batch.messages);

    // Send batch if it reaches max size
    if (batch.messages.length >= this.MAX_BATCH_SIZE) {
      this.processBatch(batch);
    }

    return {
      success: true,
      correlationId: message.metadata.correlationId,
    };
  }

  private startBatchTimer(): void {
    this.batchTimer = setInterval(() => {
      this.processPendingBatches();
    }, this.BATCH_INTERVAL);
  }

  private processPendingBatches(): void {
    for (const batch of this.batchQueue) {
      if (batch.messages.length > 0) {
        this.processBatch(batch);
      }
    }
    this.batchQueue = [];
  }

  private async processBatch(batch: MessageBatch): Promise<void> {
    try {
      await this.sendBatch(batch.messages, batch.priority);
    } catch (error) {
      console.error(
        `❌ Worker Messenger: Failed to process batch ${batch.batchId}:`,
        error,
      );
    }
  }

  /**
   * Utility methods
   */
  private generateCorrelationId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackLatency(latency: number): void {
    const alpha = 0.1; // Exponential moving average
    this.performanceMetrics.averageLatency =
      alpha * latency + (1 - alpha) * this.performanceMetrics.averageLatency;
  }

  private calculateCompressionRatio(
    originalMessages: any[],
    compressedString: string,
  ): number {
    const originalSize = JSON.stringify(originalMessages).length;
    const compressedSize = compressedString.length;
    return originalSize / compressedSize;
  }

  private calculateBatchSize(messages: WorkerMessage[]): number {
    return new Blob([YAML.stringify(messages)]).size;
  }

  private async publishDomainEvent(
    eventType: string,
    payload: any,
  ): Promise<void> {
    // This would integrate with our domain events system
    console.log(`📢 Domain Event: ${eventType}`, payload);
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): WorkerMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    message: string;
    metrics: WorkerMetrics;
  }> {
    const metrics = this.getMetrics();

    if (metrics.errors > 10) {
      return {
        status: "unhealthy",
        message: "High error rate detected",
        metrics,
      };
    }

    if (metrics.averageLatency > 100) {
      return {
        status: "degraded",
        message: "High latency detected",
        metrics,
      };
    }

    return {
      status: "healthy",
      message: "Worker messenger operating normally",
      metrics,
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    this.messageQueue.clear();
    this.batchQueue = [];
  }
}
