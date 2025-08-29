/**
 * Financial Report Entity
 * Domain-Driven Design Implementation
 *
 * Represents a comprehensive financial report with regulatory compliance
 */

import { DomainEntity, DomainError } from '../../shared/domain-entity';
import { BaseDomainEvent } from '../../shared/events/domain-events';

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  CUSTOM = 'custom'
}

export enum ReportStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  PENDING_REVIEW = 'pending_review',
  REQUIRES_ATTENTION = 'requires_attention',
  NON_COMPLIANT = 'non_compliant'
}

export class FinancialReport extends DomainEntity {
  private readonly _id: string;
  private readonly _reportType: ReportType;
  private readonly _periodStart: Date;
  private readonly _periodEnd: Date;
  private readonly _generatedAt: Date;
  private _status: ReportStatus;
  private _complianceStatus: ComplianceStatus;
  private _approvedBy?: string;
  private _approvedAt?: Date;
  private _publishedAt?: Date;

  // Financial Data
  private readonly _summary: ReportSummary;
  private readonly _collections: CollectionMetrics;
  private readonly _settlements: SettlementMetrics;
  private readonly _balance: BalanceMetrics;
  private readonly _revenue: RevenueMetrics;
  private readonly _compliance: ComplianceMetrics;

  constructor(params: FinancialReportParams) {
    super(params.id, new Date(), new Date()); // DomainEntity requires id, createdAt, updatedAt
    this._id = params.id;
    this._reportType = params.reportType;
    this._periodStart = new Date(params.periodStart);
    this._periodEnd = new Date(params.periodEnd);
    this._generatedAt = new Date(params.generatedAt);
    this._status = params.status || ReportStatus.DRAFT;
    this._complianceStatus = params.complianceStatus || ComplianceStatus.PENDING_REVIEW;
    this._approvedBy = params.approvedBy;
    this._approvedAt = params.approvedAt ? new Date(params.approvedAt) : undefined;
    this._publishedAt = params.publishedAt ? new Date(params.publishedAt) : undefined;

    this._summary = params.summary;
    this._collections = params.collections;
    this._settlements = params.settlements;
    this._balance = params.balance;
    this._revenue = params.revenue;
    this._compliance = params.compliance;
  }

  // Getters
  getId(): string { return this._id; }
  getReportType(): ReportType { return this._reportType; }
  getPeriodStart(): Date { return new Date(this._periodStart); }
  getPeriodEnd(): Date { return new Date(this._periodEnd); }
  getGeneratedAt(): Date { return new Date(this._generatedAt); }
  getStatus(): ReportStatus { return this._status; }
  getComplianceStatus(): ComplianceStatus { return this._complianceStatus; }
  getApprovedBy(): string | undefined { return this._approvedBy; }
  getApprovedAt(): Date | undefined { return this._approvedAt ? new Date(this._approvedAt) : undefined; }
  getPublishedAt(): Date | undefined { return this._publishedAt ? new Date(this._publishedAt) : undefined; }

  getSummary(): ReportSummary { return { ...this._summary }; }
  getCollections(): CollectionMetrics { return { ...this._collections }; }
  getSettlements(): SettlementMetrics { return { ...this._settlements }; }
  getBalance(): BalanceMetrics { return { ...this._balance }; }
  getRevenue(): RevenueMetrics { return { ...this._revenue }; }
  getCompliance(): ComplianceMetrics { return { ...this._compliance }; }

  // Business Logic Methods
  approve(approvedBy: string): void {
    if (this._status !== ReportStatus.PENDING_REVIEW) {
      throw new Error(`Cannot approve report with status: ${this._status}`);
    }

    this._approvedBy = approvedBy;
    this._approvedAt = new Date();
    this._status = ReportStatus.APPROVED;

    this.addDomainEvent(new BaseDomainEvent(
      'FinancialReportApproved',
      this._id,
      'FinancialReport',
      {
        reportId: this._id,
        approvedBy,
        approvedAt: this._approvedAt
      }
    ));
  }

  publish(): void {
    if (this._status !== ReportStatus.APPROVED) {
      throw new Error(`Cannot publish report with status: ${this._status}`);
    }

    this._publishedAt = new Date();
    this._status = ReportStatus.PUBLISHED;

    this.addDomainEvent(new BaseDomainEvent(
      'FinancialReportPublished',
      this._id,
      'FinancialReport',
      {
        reportId: this._id,
        publishedAt: this._publishedAt
      }
    ));
  }

  markForReview(): void {
    this._status = ReportStatus.PENDING_REVIEW;

    this.addDomainEvent(new BaseDomainEvent(
      'FinancialReportMarkedForReview',
      this._id,
      'FinancialReport',
      { reportId: this._id }
    ));
  }

  archive(): void {
    if (this._status === ReportStatus.PUBLISHED) {
      this._status = ReportStatus.ARCHIVED;

      this.addDomainEvent(new BaseDomainEvent(
        'FinancialReportArchived',
        this._id,
        'FinancialReport',
        { reportId: this._id }
      ));
    }
  }

  updateComplianceStatus(status: ComplianceStatus, notes?: string): void {
    this._complianceStatus = status;

    this.addDomainEvent(new BaseDomainEvent(
      'FinancialReportComplianceUpdated',
      this._id,
      'FinancialReport',
      {
        reportId: this._id,
        complianceStatus: status,
        notes
      }
    ));
  }

  // Utility Methods
  getPeriodDays(): number {
    return Math.ceil((this._periodEnd.getTime() - this._periodStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  isOverdue(): boolean {
    const now = new Date();
    return this._status === ReportStatus.DRAFT && now > this._periodEnd;
  }

  requiresAttention(): boolean {
    return this._complianceStatus === ComplianceStatus.REQUIRES_ATTENTION ||
           this._complianceStatus === ComplianceStatus.NON_COMPLIANT ||
           this.isOverdue();
  }

  toJSON() {
    return {
      id: this._id,
      reportType: this._reportType,
      periodStart: this._periodStart.toISOString(),
      periodEnd: this._periodEnd.toISOString(),
      generatedAt: this._generatedAt.toISOString(),
      status: this._status,
      complianceStatus: this._complianceStatus,
      approvedBy: this._approvedBy,
      approvedAt: this._approvedAt?.toISOString(),
      publishedAt: this._publishedAt?.toISOString(),
      summary: this._summary,
      collections: this._collections,
      settlements: this._settlements,
      balance: this._balance,
      revenue: this._revenue,
      compliance: this._compliance
    };
  }
}

// Supporting Interfaces
export interface FinancialReportParams {
  id: string;
  reportType: ReportType;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  status?: ReportStatus;
  complianceStatus?: ComplianceStatus;
  approvedBy?: string;
  approvedAt?: Date;
  publishedAt?: Date;
  summary: ReportSummary;
  collections: CollectionMetrics;
  settlements: SettlementMetrics;
  balance: BalanceMetrics;
  revenue: RevenueMetrics;
  compliance: ComplianceMetrics;
}

export interface ReportSummary {
  totalRevenue: number;
  totalCollections: number;
  totalSettlements: number;
  netProfit: number;
  totalFees: number;
  currency: string;
}

export interface CollectionMetrics {
  totalCollections: number;
  successfulCollections: number;
  failedCollections: number;
  totalAmount: number;
  averageAmount: number;
  collectionsByMethod: Record<string, number>;
  collectionsByCurrency: Record<string, number>;
  processingTime: {
    average: number;
    min: number;
    max: number;
  };
}

export interface SettlementMetrics {
  totalSettlements: number;
  successfulSettlements: number;
  pendingSettlements: number;
  failedSettlements: number;
  totalAmount: number;
  totalFees: number;
  netAmount: number;
  settlementsByMerchant: Record<string, number>;
  averageProcessingTime: number;
  settlementSuccessRate: number;
}

export interface BalanceMetrics {
  totalActiveBalances: number;
  totalBalanceAmount: number;
  averageBalance: number;
  lowBalanceAlerts: number;
  frozenBalances: number;
  balanceDistribution: {
    low: number;      // <$100
    medium: number;   // $100-$1000
    high: number;     // >$1000
  };
  thresholdBreaches: number;
}

export interface RevenueMetrics {
  grossRevenue: number;
  netRevenue: number;
  revenueBySource: Record<string, number>;
  revenueTrend: Array<{
    period: string;
    amount: number;
    growth: number;
  }>;
  topRevenueSources: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  revenueGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface ComplianceMetrics {
  pciDssCompliant: boolean;
  amlCompliant: boolean;
  kycCompliant: boolean;
  gdprCompliant: boolean;
  auditTrailComplete: boolean;
  requiredFilings: Array<{
    filing: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    dueDate: Date;
    submittedDate?: Date;
  }>;
  complianceIssues: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'investigating' | 'resolved';
    reportedAt: Date;
  }>;
}
