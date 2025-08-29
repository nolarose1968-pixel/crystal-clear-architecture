/**
 * Collections Domain Message Templates
 * YAML-Based Message Formats for Worker Communication Optimization
 */

import { WorkerMessage } from "../core/worker-messenger";

// Settlement Processing Messages
export const SETTLEMENT_UPDATE_MESSAGE = (payload: {
  settlementId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  processedAt: string;
  confirmationNumber: string;
}): WorkerMessage => ({
  type: "SETTLEMENT_UPDATE",
  metadata: {} as any, // Will be filled by WorkerMessenger
  payload: {
    settlement: {
      id: payload.settlementId,
      customerId: payload.customerId,
      amount: payload.amount,
      status: "completed",
      event: {
        id: "event_context",
        betType: "settlement",
      },
      processing: {
        processedBy: "system",
        processingTime: 0,
        retryCount: 0,
        queuePosition: 0,
      },
      paymentMethod: payload.paymentMethod,
      processedAt: payload.processedAt,
      confirmationNumber: payload.confirmationNumber,
      metadata: {
        sourceDomain: "collections",
        targetDomain: "balance",
        priority: "high",
        ttl: 300000,
      },
    },
  },
});

export const SETTLEMENT_FAILED_MESSAGE = (payload: {
  settlementId: string;
  error: string;
  retryCount: number;
  nextRetryAt: string;
  errorDetails: any;
}): WorkerMessage => ({
  type: "SETTLEMENT_FAILED",
  metadata: {} as any,
  payload: {
    settlementId: payload.settlementId,
    error: payload.error,
    retryCount: payload.retryCount,
    nextRetryAt: payload.nextRetryAt,
    errorDetails: payload.errorDetails,
    metadata: {
      sourceDomain: "collections",
      targetDomain: "notifications",
      priority: "high",
      ttl: 180000,
    },
  },
});

export const PAYMENT_VALIDATION_MESSAGE = (payload: {
  paymentId: string;
  customerId: string;
  amount: number;
  currency: string;
  validationResult: "approved" | "rejected" | "pending";
  riskScore: number;
  validationDetails: any;
}): WorkerMessage => ({
  type: "PAYMENT_VALIDATION",
  metadata: {} as any,
  payload: {
    paymentId: payload.paymentId,
    customerId: payload.customerId,
    amount: payload.amount,
    currency: payload.currency,
    validationResult: payload.validationResult,
    riskScore: payload.riskScore,
    validationDetails: payload.validationDetails,
    metadata: {
      sourceDomain: "collections",
      targetDomain: "risk",
      priority: "high",
      ttl: 120000,
    },
  },
});

export const TRANSACTION_SETTLED_MESSAGE = (payload: {
  transactionId: string;
  settlementId: string;
  customerId: string;
  amount: number;
  settlementType: "deposit" | "withdrawal" | "transfer";
  settledAt: string;
  finalStatus: "completed" | "failed" | "cancelled";
  settlementDetails: any;
}): WorkerMessage => ({
  type: "TRANSACTION_SETTLED",
  metadata: {} as any,
  payload: {
    transactionId: payload.transactionId,
    settlementId: payload.settlementId,
    customerId: payload.customerId,
    amount: payload.amount,
    settlementType: payload.settlementType,
    settledAt: payload.settledAt,
    finalStatus: payload.finalStatus,
    settlementDetails: payload.settlementDetails,
    metadata: {
      sourceDomain: "collections",
      targetDomain: "balance",
      priority: "normal",
      ttl: 600000,
    },
  },
});

// Collections Analytics Messages
export const COLLECTIONS_METRICS_UPDATE = (payload: {
  period: string;
  totalSettlements: number;
  totalVolume: number;
  successRate: number;
  averageProcessingTime: number;
  topPaymentMethods: Array<{ method: string; volume: number; count: number }>;
  failureReasons: Record<string, number>;
}): WorkerMessage => ({
  type: "COLLECTIONS_METRICS_UPDATE",
  metadata: {} as any,
  payload: {
    period: payload.period,
    totalSettlements: payload.totalSettlements,
    totalVolume: payload.totalVolume,
    successRate: payload.successRate,
    averageProcessingTime: payload.averageProcessingTime,
    topPaymentMethods: payload.topPaymentMethods,
    failureReasons: payload.failureReasons,
    metadata: {
      sourceDomain: "collections",
      targetDomain: "analytics",
      priority: "low",
      ttl: 3600000, // 1 hour
    },
  },
});

// Collections Health Messages
export const COLLECTIONS_HEALTH_STATUS = (payload: {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    database: "healthy" | "degraded" | "unhealthy";
    paymentGateway: "healthy" | "degraded" | "unhealthy";
    queue: "healthy" | "degraded" | "unhealthy";
    cache: "healthy" | "degraded" | "unhealthy";
  };
  metrics: {
    activeSettlements: number;
    queueDepth: number;
    errorRate: number;
    averageLatency: number;
  };
  timestamp: string;
}): WorkerMessage => ({
  type: "COLLECTIONS_HEALTH_STATUS",
  metadata: {} as any,
  payload: {
    status: payload.status,
    checks: payload.checks,
    metrics: payload.metrics,
    timestamp: payload.timestamp,
    metadata: {
      sourceDomain: "collections",
      targetDomain: "monitoring",
      priority: "normal",
      ttl: 300000,
    },
  },
});

// Batch Messages for High-Volume Operations
export const BULK_SETTLEMENT_BATCH = (payload: {
  batchId: string;
  settlements: Array<{
    settlementId: string;
    customerId: string;
    amount: number;
    paymentMethod: string;
  }>;
  totalAmount: number;
  settlementCount: number;
  batchMetadata: any;
}): WorkerMessage => ({
  type: "BULK_SETTLEMENT_BATCH",
  metadata: {} as any,
  payload: {
    batchId: payload.batchId,
    settlements: payload.settlements,
    totalAmount: payload.totalAmount,
    settlementCount: payload.settlementCount,
    batchMetadata: payload.batchMetadata,
    metadata: {
      sourceDomain: "collections",
      targetDomain: "balance",
      priority: "high",
      ttl: 900000, // 15 minutes for batch processing
    },
  },
});

// Collections Configuration Messages
export const PAYMENT_METHOD_CONFIG_UPDATE = (payload: {
  paymentMethod: string;
  isEnabled: boolean;
  limits: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
  fees: {
    fixed: number;
    percentage: number;
  };
  processingTime: number;
  updatedAt: string;
  updatedBy: string;
}): WorkerMessage => ({
  type: "PAYMENT_METHOD_CONFIG_UPDATE",
  metadata: {} as any,
  payload: {
    paymentMethod: payload.paymentMethod,
    isEnabled: payload.isEnabled,
    limits: payload.limits,
    fees: payload.fees,
    processingTime: payload.processingTime,
    updatedAt: payload.updatedAt,
    updatedBy: payload.updatedBy,
    metadata: {
      sourceDomain: "collections",
      targetDomain: "all",
      priority: "normal",
      ttl: 1800000, // 30 minutes
    },
  },
});

// Collections Alert Messages
export const COLLECTIONS_ALERT_TRIGGERED = (payload: {
  alertId: string;
  alertType:
    | "settlement_failure"
    | "high_latency"
    | "payment_declined"
    | "queue_overflow";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  details: any;
  affectedEntities: string[];
  triggeredAt: string;
  recommendedActions: string[];
}): WorkerMessage => ({
  type: "COLLECTIONS_ALERT_TRIGGERED",
  metadata: {} as any,
  payload: {
    alertId: payload.alertId,
    alertType: payload.alertType,
    severity: payload.severity,
    message: payload.message,
    details: payload.details,
    affectedEntities: payload.affectedEntities,
    triggeredAt: payload.triggeredAt,
    recommendedActions: payload.recommendedActions,
    metadata: {
      sourceDomain: "collections",
      targetDomain: "monitoring",
      priority: payload.severity === "critical" ? "critical" : "high",
      ttl: 3600000, // 1 hour for alerts
    },
  },
});

// Helper function to create settlement workflow messages
export function createSettlementWorkflowMessages(settlementData: {
  settlementId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  processedAt: string;
  confirmationNumber: string;
}): WorkerMessage[] {
  return [
    // Initial settlement update
    SETTLEMENT_UPDATE_MESSAGE(settlementData),

    // Payment validation request
    PAYMENT_VALIDATION_MESSAGE({
      paymentId: settlementData.settlementId,
      customerId: settlementData.customerId,
      amount: settlementData.amount,
      currency: "USD",
      validationResult: "approved",
      riskScore: 25,
      validationDetails: {
        paymentMethod: settlementData.paymentMethod,
        processedAt: settlementData.processedAt,
      },
    }),

    // Transaction settlement confirmation
    TRANSACTION_SETTLED_MESSAGE({
      transactionId: settlementData.settlementId,
      settlementId: settlementData.settlementId,
      customerId: settlementData.customerId,
      amount: settlementData.amount,
      settlementType: "deposit",
      settledAt: settlementData.processedAt,
      finalStatus: "completed",
      settlementDetails: {
        confirmationNumber: settlementData.confirmationNumber,
        paymentMethod: settlementData.paymentMethod,
      },
    }),
  ];
}

// Message validation helper
export function validateCollectionsMessage(message: WorkerMessage): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields validation
  if (!message.type) {
    errors.push("Message type is required");
  }

  if (!message.payload) {
    errors.push("Message payload is required");
  }

  // Type-specific validation
  switch (message.type) {
    case "SETTLEMENT_UPDATE":
      if (!message.payload.settlement?.id) {
        errors.push("Settlement ID is required for SETTLEMENT_UPDATE");
      }
      if (!message.payload.settlement?.customerId) {
        errors.push("Customer ID is required for SETTLEMENT_UPDATE");
      }
      if (typeof message.payload.settlement?.amount !== "number") {
        errors.push("Valid amount is required for SETTLEMENT_UPDATE");
      }
      break;

    case "PAYMENT_VALIDATION":
      if (!message.payload.paymentId) {
        errors.push("Payment ID is required for PAYMENT_VALIDATION");
      }
      if (
        !["approved", "rejected", "pending"].includes(
          message.payload.validationResult,
        )
      ) {
        errors.push(
          "Valid validation result is required for PAYMENT_VALIDATION",
        );
      }
      break;

    case "COLLECTIONS_HEALTH_STATUS":
      if (
        !["healthy", "degraded", "unhealthy"].includes(message.payload.status)
      ) {
        errors.push(
          "Valid health status is required for COLLECTIONS_HEALTH_STATUS",
        );
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
