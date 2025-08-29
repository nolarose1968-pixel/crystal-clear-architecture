/**
 * Regulatory Filing Value Object
 * Domain-Driven Design Implementation
 *
 * Represents regulatory filings and compliance requirements
 */

import { DomainError } from '../../shared/domain-entity';

export enum FilingStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  OVERDUE = 'overdue'
}

export enum FilingType {
  FINANCIAL_STATEMENT = 'financial_statement',
  AML_REPORT = 'aml_report',
  KYC_REPORT = 'kyc_report',
  TAX_REPORT = 'tax_report',
  REGULATORY_DISCLOSURE = 'regulatory_disclosure',
  AUDIT_REPORT = 'audit_report'
}

export class RegulatoryFiling {
  private readonly _id: string;
  private readonly _filingType: FilingType;
  private readonly _description: string;
  private readonly _dueDate: Date;
  private readonly _jurisdiction: string;
  private _status: FilingStatus;
  private _submittedDate?: Date;
  private _approvedDate?: Date;
  private _rejectionReason?: string;
  private readonly _requiredDocuments: string[];
  private readonly _metadata: Record<string, any>;

  constructor(params: RegulatoryFilingParams) {
    this.validateParams(params);

    this._id = params.id;
    this._filingType = params.filingType;
    this._description = params.description;
    this._dueDate = new Date(params.dueDate);
    this._jurisdiction = params.jurisdiction;
    this._status = params.status || FilingStatus.PENDING;
    this._submittedDate = params.submittedDate ? new Date(params.submittedDate) : undefined;
    this._approvedDate = params.approvedDate ? new Date(params.approvedDate) : undefined;
    this._rejectionReason = params.rejectionReason;
    this._requiredDocuments = [...params.requiredDocuments];
    this._metadata = { ...params.metadata };
  }

  // Getters
  getId(): string { return this._id; }
  getFilingType(): FilingType { return this._filingType; }
  getDescription(): string { return this._description; }
  getDueDate(): Date { return new Date(this._dueDate); }
  getJurisdiction(): string { return this._jurisdiction; }
  getStatus(): FilingStatus { return this._status; }
  getSubmittedDate(): Date | undefined { return this._submittedDate ? new Date(this._submittedDate) : undefined; }
  getApprovedDate(): Date | undefined { return this._approvedDate ? new Date(this._approvedDate) : undefined; }
  getRejectionReason(): string | undefined { return this._rejectionReason; }
  getRequiredDocuments(): string[] { return [...this._requiredDocuments]; }
  getMetadata(): Record<string, any> { return { ...this._metadata }; }

  // Business Logic Methods
  submit(submittedDate?: Date): void {
    if (this._status !== FilingStatus.PENDING && this._status !== FilingStatus.OVERDUE) {
      throw new DomainError(`Cannot submit filing with status: ${this._status}`, 'INVALID_FILING_STATUS');
    }

    this._submittedDate = submittedDate || new Date();
    this._status = FilingStatus.SUBMITTED;
  }

  approve(approvedDate?: Date): void {
    if (this._status !== FilingStatus.SUBMITTED) {
      throw new DomainError(`Cannot approve filing with status: ${this._status}`, 'INVALID_FILING_STATUS');
    }

    this._approvedDate = approvedDate || new Date();
    this._status = FilingStatus.APPROVED;
  }

  reject(reason: string): void {
    if (this._status !== FilingStatus.SUBMITTED) {
      throw new DomainError(`Cannot reject filing with status: ${this._status}`, 'INVALID_FILING_STATUS');
    }

    this._rejectionReason = reason;
    this._status = FilingStatus.REJECTED;
  }

  markOverdue(): void {
    if (this._status === FilingStatus.PENDING && new Date() > this._dueDate) {
      this._status = FilingStatus.OVERDUE;
    }
  }

  // Utility Methods
  isOverdue(): boolean {
    return this._status === FilingStatus.OVERDUE ||
           (this._status === FilingStatus.PENDING && new Date() > this._dueDate);
  }

  isCompleted(): boolean {
    return this._status === FilingStatus.APPROVED || this._status === FilingStatus.REJECTED;
  }

  getDaysUntilDue(): number {
    const now = new Date();
    const diffTime = this._dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;

    const now = new Date();
    const diffTime = now.getTime() - this._dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  hasRequiredDocument(documentName: string): boolean {
    return this._requiredDocuments.includes(documentName);
  }

  addRequiredDocument(documentName: string): void {
    if (!this._requiredDocuments.includes(documentName)) {
      this._requiredDocuments.push(documentName);
    }
  }

  removeRequiredDocument(documentName: string): void {
    const index = this._requiredDocuments.indexOf(documentName);
    if (index > -1) {
      this._requiredDocuments.splice(index, 1);
    }
  }

  updateMetadata(key: string, value: any): void {
    this._metadata[key] = value;
  }

  toJSON() {
    return {
      id: this._id,
      filingType: this._filingType,
      description: this._description,
      dueDate: this._dueDate.toISOString(),
      jurisdiction: this._jurisdiction,
      status: this._status,
      submittedDate: this._submittedDate?.toISOString(),
      approvedDate: this._approvedDate?.toISOString(),
      rejectionReason: this._rejectionReason,
      requiredDocuments: this._requiredDocuments,
      metadata: this._metadata,
      isOverdue: this.isOverdue(),
      isCompleted: this.isCompleted(),
      daysUntilDue: this.getDaysUntilDue(),
      daysOverdue: this.getDaysOverdue()
    };
  }

  equals(other: RegulatoryFiling): boolean {
    return this._id === other._id;
  }

  private validateParams(params: RegulatoryFilingParams): void {
    if (!params.id || typeof params.id !== 'string') {
      throw new DomainError('Filing ID is required and must be a string', 'INVALID_FILING_ID');
    }

    if (!params.filingType || !Object.values(FilingType).includes(params.filingType)) {
      throw new DomainError('Valid filing type is required', 'INVALID_FILING_TYPE');
    }

    if (!params.description || typeof params.description !== 'string') {
      throw new DomainError('Filing description is required', 'INVALID_DESCRIPTION');
    }

    if (!params.dueDate) {
      throw new DomainError('Due date is required', 'INVALID_DUE_DATE');
    }

    if (!params.jurisdiction || typeof params.jurisdiction !== 'string') {
      throw new DomainError('Jurisdiction is required', 'INVALID_JURISDICTION');
    }

    if (!params.requiredDocuments || !Array.isArray(params.requiredDocuments)) {
      throw new DomainError('Required documents must be an array', 'INVALID_DOCUMENTS');
    }
  }
}

// Factory for creating regulatory filings
export class RegulatoryFilingFactory {
  static create(params: RegulatoryFilingParams): RegulatoryFiling {
    return new RegulatoryFiling(params);
  }

  static createFinancialStatement(params: Omit<RegulatoryFilingParams, 'filingType' | 'description'>): RegulatoryFiling {
    return new RegulatoryFiling({
      ...params,
      filingType: FilingType.FINANCIAL_STATEMENT,
      description: 'Periodic financial statement filing'
    });
  }

  static createAMLReport(params: Omit<RegulatoryFilingParams, 'filingType' | 'description'>): RegulatoryFiling {
    return new RegulatoryFiling({
      ...params,
      filingType: FilingType.AML_REPORT,
      description: 'Anti-Money Laundering compliance report'
    });
  }

  static createKYCReport(params: Omit<RegulatoryFilingParams, 'filingType' | 'description'>): RegulatoryFiling {
    return new RegulatoryFiling({
      ...params,
      filingType: FilingType.KYC_REPORT,
      description: 'Know Your Customer compliance report'
    });
  }

  static createTaxReport(params: Omit<RegulatoryFilingParams, 'filingType' | 'description'>): RegulatoryFiling {
    return new RegulatoryFiling({
      ...params,
      filingType: FilingType.TAX_REPORT,
      description: 'Tax compliance and reporting'
    });
  }
}

export interface RegulatoryFilingParams {
  id: string;
  filingType: FilingType;
  description: string;
  dueDate: Date;
  jurisdiction: string;
  status?: FilingStatus;
  submittedDate?: Date;
  approvedDate?: Date;
  rejectionReason?: string;
  requiredDocuments: string[];
  metadata?: Record<string, any>;
}
