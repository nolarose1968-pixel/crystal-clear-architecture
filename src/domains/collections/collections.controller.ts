/**
 * Collections Domain Controller
 * Domain-Driven Design Implementation
 *
 * Handles settlement processing and payment management with optimized transaction workflows
 */

import { PaymentProcessor } from './services/payment-processor';
import { SettlementService } from './services/settlement-service';
import { RiskAssessmentService } from './services/risk-assessment-service';
import { CollectionsRepository } from './repositories/collections-repository';
import { Payment, Settlement, CollectionResult } from './entities';
import { DomainEvents } from '../shared/events/domain-events';

export class CollectionsController {
  private paymentProcessor: PaymentProcessor;
  private settlementService: SettlementService;
  private riskAssessmentService: RiskAssessmentService;
  private repository: CollectionsRepository;
  private eventPublisher: DomainEvents;

  constructor() {
    this.paymentProcessor = new PaymentProcessor();
    this.settlementService = new SettlementService();
    this.riskAssessmentService = new RiskAssessmentService();
    this.repository = new CollectionsRepository();
    this.eventPublisher = DomainEvents.getInstance();
  }

  /**
   * Process new payment/collection
   */
  async processPayment(request: PaymentRequest): Promise<CollectionResult> {
    try {
      // Domain validation
      const payment = Payment.create(request);

      // Risk assessment
      const riskScore = await this.riskAssessmentService.assessRisk(payment);
      if (riskScore > 80) {
        throw new DomainError('High risk payment rejected', 'PAYMENT_RISK_TOO_HIGH');
      }

      // Process payment
      const result = await this.paymentProcessor.process(payment);

      // Publish domain event
      await this.eventPublisher.publish('payment.processed', {
        paymentId: result.paymentId,
        amount: result.amount,
        playerId: result.playerId,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      await this.eventPublisher.publish('payment.failed', {
        paymentId: request.id,
        error: error.message,
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Process settlement batch
   */
  async processSettlementBatch(settlementId: string): Promise<Settlement> {
    const settlement = await this.settlementService.processBatch(settlementId);

    await this.eventPublisher.publish('settlement.processed', {
      settlementId: settlement.id,
      totalAmount: settlement.totalAmount,
      transactionCount: settlement.transactions.length,
      timestamp: new Date()
    });

    return settlement;
  }

  /**
   * Get collections dashboard data
   */
  async getDashboardData(): Promise<CollectionsDashboard> {
    const [pendingPayments, processedPayments, settlements] = await Promise.all([
      this.repository.getPendingPayments(),
      this.repository.getProcessedPayments(),
      this.repository.getRecentSettlements()
    ]);

    return {
      pendingPayments: pendingPayments.length,
      processedPayments: processedPayments.length,
      totalSettled: settlements.reduce((sum, s) => sum + s.totalAmount, 0),
      pendingSettlements: settlements.filter(s => s.status === 'pending').length
    };
  }

  /**
   * Get worker performance metrics
   */
  async getWorkerPerformance(): Promise<WorkerPerformance[]> {
    return await this.repository.getWorkerPerformance();
  }
}

// Domain Entities
export interface PaymentRequest {
  id: string;
  playerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}

export interface CollectionsDashboard {
  pendingPayments: number;
  processedPayments: number;
  totalSettled: number;
  pendingSettlements: number;
}

export interface WorkerPerformance {
  workerId: string;
  processedPayments: number;
  successRate: number;
  averageProcessingTime: number;
}

// Domain Error
export class DomainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DomainError';
  }
}
