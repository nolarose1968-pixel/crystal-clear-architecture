/**
 * Fantasy Agent Entity
 * Domain-Driven Design Implementation
 *
 * Represents an agent from the external Fantasy402 system
 * in our internal domain format.
 */

import { DomainEntity } from '../../shared/domain-entity';
import { ExternalAgent } from '../adapters/fantasy402-adapter';
import { DomainError } from '../../shared/domain-entity';

export type AgentType = 'master' | 'sub_agent' | 'retail';
export type AgentStatus = 'active' | 'inactive' | 'suspended';

export class FantasyAgent extends DomainEntity {
  private constructor(
    id: string,
    private readonly externalId: string,
    private readonly customerId: string,
    private readonly masterAgentId?: string,
    private readonly office: string,
    private readonly store: string,
    private agentType: AgentType,
    private status: AgentStatus,
    private readonly permissions: {
      canManageLines: boolean;
      canAddAccounts: boolean;
      canDeleteBets: boolean;
      canViewReports: boolean;
      canAccessBilling: boolean;
    },
    private metadata: Record<string, any> = {},
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromExternalData(data: ExternalAgent): FantasyAgent {
    const now = new Date();

    return new FantasyAgent(
      crypto.randomUUID(),
      data.agentID,
      data.customerID,
      data.masterAgentID || undefined,
      data.office,
      data.store,
      this.mapExternalAgentType(data.agentType),
      data.active ? 'active' : 'inactive',
      data.permissions,
      data.metadata || {},
      now,
      now
    );
  }

  private static mapExternalAgentType(externalType: string): AgentType {
    const typeMap: Record<string, AgentType> = {
      'master': 'master',
      'sub': 'sub_agent',
      'retail': 'retail',
      'agent': 'sub_agent'
    };

    return typeMap[externalType.toLowerCase()] || 'sub_agent';
  }

  // Business methods
  updateStatus(newStatus: AgentStatus): void {
    if (this.status === 'suspended' && newStatus === 'active') {
      // Log reactivation
      this.addMetadata('reactivated_at', new Date().toISOString());
    }

    this.status = newStatus;
    this.markAsModified();
  }

  updatePermissions(permissions: Partial<FantasyAgent['permissions']>): void {
    this.permissions = { ...this.permissions, ...permissions };
    this.markAsModified();
  }

  addMetadata(key: string, value: any): void {
    this.metadata[key] = value;
    this.markAsModified();
  }

  // Getters
  getExternalId(): string { return this.externalId; }
  getCustomerId(): string { return this.customerId; }
  getMasterAgentId(): string | undefined { return this.masterAgentId; }
  getOffice(): string { return this.office; }
  getStore(): string { return this.store; }
  getAgentType(): AgentType { return this.agentType; }
  getStatus(): AgentStatus { return this.status; }
  getPermissions(): FantasyAgent['permissions'] { return { ...this.permissions }; }
  getMetadata(): Record<string, any> { return { ...this.metadata }; }

  // Business rules
  isActive(): boolean {
    return this.status === 'active';
  }

  isSuspended(): boolean {
    return this.status === 'suspended';
  }

  isMasterAgent(): boolean {
    return this.agentType === 'master';
  }

  isSubAgent(): boolean {
    return this.agentType === 'sub_agent';
  }

  canManageLines(): boolean {
    return this.permissions.canManageLines && this.isActive();
  }

  canAddAccounts(): boolean {
    return this.permissions.canAddAccounts && this.isActive();
  }

  canDeleteBets(): boolean {
    return this.permissions.canDeleteBets && this.isActive();
  }

  canViewReports(): boolean {
    return this.permissions.canViewReports && this.isActive();
  }

  canAccessBilling(): boolean {
    return this.permissions.canAccessBilling && this.isActive();
  }

  hasPermission(permission: keyof FantasyAgent['permissions']): boolean {
    return this.permissions[permission] && this.isActive();
  }

  getFullName(): string {
    return `${this.office} - ${this.store}`;
  }

  getHierarchyLevel(): number {
    if (this.isMasterAgent()) return 1;
    if (this.isSubAgent()) return 2;
    return 3; // Retail
  }

  canManageAgent(otherAgent: FantasyAgent): boolean {
    if (!this.canManageLines()) return false;
    if (this.isMasterAgent()) return true;
    if (this.isSubAgent() && otherAgent.getAgentType() === 'retail') return true;
    return false;
  }

  toJSON(): any {
    return {
      id: this.getId(),
      externalId: this.externalId,
      customerId: this.customerId,
      masterAgentId: this.masterAgentId,
      office: this.office,
      store: this.store,
      agentType: this.agentType,
      status: this.status,
      permissions: this.permissions,
      metadata: this.metadata,
      createdAt: this.getCreatedAt().toISOString(),
      updatedAt: this.getUpdatedAt().toISOString()
    };
  }
}
