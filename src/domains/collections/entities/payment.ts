/**
 * Payment Entity - Domain-Driven Design
 * Represents a payment transaction within the Collections domain
 */

import { ValueObject } from '../shared/value-object';
import { DomainEntity } from '../shared/domain-entity';

export class Payment extends DomainEntity {
  private constructor(
    id: string,
    private readonly playerId: string,
    private readonly amount: Money,
    private readonly currency: Currency,
    private readonly paymentMethod: PaymentMethod,
    private readonly status: PaymentStatus,
    private readonly riskScore: number,
    private readonly metadata: PaymentMetadata,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(request: PaymentRequest): Payment {
    const now = new Date();
    const amount = Money.create(request.amount, request.currency);
    const currency = Currency.fromCode(request.currency);
    const paymentMethod = PaymentMethod.fromString(request.paymentMethod);

    return new Payment(
      request.id,
      request.playerId,
      amount,
      currency,
      paymentMethod,
      PaymentStatus.PENDING,
      0,
      request.metadata || {},
      now,
      now
    );
  }

  // Business logic methods
  markAsProcessing(): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new DomainError('Can only process pending payments', 'INVALID_STATUS_TRANSITION');
    }
    this.status = PaymentStatus.PROCESSING;
    this.updatedAt = new Date();
  }

  markAsCompleted(): void {
    if (this.status !== PaymentStatus.PROCESSING) {
      throw new DomainError('Can only complete processing payments', 'INVALID_STATUS_TRANSITION');
    }
    this.status = PaymentStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  markAsFailed(reason: string): void {
    this.status = PaymentStatus.FAILED;
    this.metadata.failureReason = reason;
    this.updatedAt = new Date();
  }

  updateRiskScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new DomainError('Risk score must be between 0 and 100', 'INVALID_RISK_SCORE');
    }
    this.riskScore = score;
    this.updatedAt = new Date();
  }

  // Getters
  getPlayerId(): string { return this.playerId; }
  getAmount(): Money { return this.amount; }
  getCurrency(): Currency { return this.currency; }
  getPaymentMethod(): PaymentMethod { return this.paymentMethod; }
  getStatus(): PaymentStatus { return this.status; }
  getRiskScore(): number { return this.riskScore; }
  getMetadata(): PaymentMetadata { return { ...this.metadata }; }

  // Business rules
  isHighRisk(): boolean {
    return this.riskScore > 75;
  }

  canBeProcessed(): boolean {
    return this.status === PaymentStatus.PENDING && !this.isHighRisk();
  }

  requiresManualReview(): boolean {
    return this.amount.greaterThan(Money.create(10000, this.currency.code)) ||
           this.riskScore > 50;
  }
}

// Value Objects
export class Money extends ValueObject {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {
    super();
    if (amount < 0) {
      throw new DomainError('Amount cannot be negative', 'INVALID_AMOUNT');
    }
  }

  static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  getAmount(): number { return this.amount; }
  getCurrency(): string { return this.currency; }

  greaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot compare different currencies', 'CURRENCY_MISMATCH');
    }
    return this.amount > other.amount;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot add different currencies', 'CURRENCY_MISMATCH');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

export class Currency extends ValueObject {
  private constructor(
    private readonly code: string,
    private readonly symbol: string,
    private readonly decimalPlaces: number
  ) {
    super();
  }

  static fromCode(code: string): Currency {
    const currencies = {
      'USD': { symbol: '$', decimalPlaces: 2 },
      'EUR': { symbol: '€', decimalPlaces: 2 },
      'GBP': { symbol: '£', decimalPlaces: 2 },
      'BTC': { symbol: '₿', decimalPlaces: 8 }
    };

    const currency = currencies[code as keyof typeof currencies];
    if (!currency) {
      throw new DomainError(`Unsupported currency: ${code}`, 'UNSUPPORTED_CURRENCY');
    }

    return new Currency(code, currency.symbol, currency.decimalPlaces);
  }

  getCode(): string { return this.code; }
  getSymbol(): string { return this.symbol; }
  getDecimalPlaces(): number { return this.decimalPlaces; }
}

export class PaymentMethod extends ValueObject {
  private constructor(
    private readonly type: string,
    private readonly provider: string
  ) {
    super();
  }

  static fromString(method: string): PaymentMethod {
    const [type, provider] = method.split(':');
    if (!type || !provider) {
      throw new DomainError('Invalid payment method format', 'INVALID_PAYMENT_METHOD');
    }
    return new PaymentMethod(type, provider);
  }

  getType(): string { return this.type; }
  getProvider(): string { return this.provider; }

  isCrypto(): boolean {
    return this.type === 'crypto';
  }

  isCard(): boolean {
    return this.type === 'card';
  }

  toString(): string {
    return `${this.type}:${this.provider}`;
  }
}

// Enums
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Interfaces
export interface PaymentRequest {
  id: string;
  playerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: PaymentMetadata;
}

export interface PaymentMetadata {
  [key: string]: any;
  failureReason?: string;
  processingAttempts?: number;
  externalReference?: string;
}

export interface CollectionResult {
  paymentId: string;
  amount: number;
  playerId: string;
  status: PaymentStatus;
  processedAt: Date;
}

// Domain Error
export class DomainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DomainError';
  }
}
