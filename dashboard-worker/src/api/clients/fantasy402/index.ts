/**
 * Fantasy402 Agent API Client
 * Consolidated modular client for Fantasy42 agent operations
 */

import { Fantasy402AgentClientCore } from './core/agent-client-core';
import { Fantasy402FinancialOperations } from './financial/financial-operations';
import { Fantasy402AgentManagement } from './agents/agent-management';
import { Fantasy402CustomerManagement } from './customers/customer-management';

// Re-export types for external use
export type {
  AgentPermissions,
  AgentAccountInfo,
  DetailedAccountInfo,
  LotteryGame,
  LotteryBet,
  LotteryDraw,
  LotterySettings,
  WeeklyFiguresParams,
  WeeklyFiguresResult,
  TransactionParams,
  WagerParams,
  CustomerParams,
  PlayerNote,
  PlayerNoteOptions,
  LotteryBetOptions,
  LotteryDrawOptions,
  LotteryStatisticsOptions,
  LotteryStatistics
} from './types';

export class Fantasy402AgentClient {
  private core: Fantasy402AgentClientCore;
  private financial: Fantasy402FinancialOperations;
  private agents: Fantasy402AgentManagement;
  private customers: Fantasy402CustomerManagement;

  constructor() {
    this.core = new Fantasy402AgentClientCore();
    this.financial = new Fantasy402FinancialOperations(this.core);
    this.agents = new Fantasy402AgentManagement(this.core);
    this.customers = new Fantasy402CustomerManagement(this.core);
  }

  /**
   * Initialize the client
   */
  async initialize(): Promise<boolean> {
    return await this.core.initialize();
  }

  // Core Operations
  get isInitialized(): boolean {
    return this.core.isClientInitialized;
  }

  getAgentPermissions() {
    return this.core.getAgentPermissions();
  }

  getAgentAccountInfo() {
    return this.core.getAgentAccountInfo();
  }

  async getAccountInfoOwner() {
    return await this.core.getAccountInfoOwner();
  }

  async renewToken() {
    return await this.core.renewToken();
  }

  async checkAndRenewToken() {
    return await this.core.checkAndRenewToken();
  }

  // Financial Operations
  async getWeeklyFigures(params?: any) {
    return await this.financial.getWeeklyFigures(params);
  }

  async getWeeklyFigureByAgentLite() {
    return await this.financial.getWeeklyFigureByAgentLite();
  }

  async getBalance() {
    return await this.financial.getBalance();
  }

  async getTransactions(params?: any) {
    return await this.financial.getTransactions(params);
  }

  async getWagers(params?: any) {
    return await this.financial.getWagers(params);
  }

  async getLiveWagers() {
    return await this.financial.getLiveWagers();
  }

  async writeLog(message: string, level: string = 'info') {
    return await this.financial.writeLog(message, level);
  }

  // Agent Management
  async getSubAgents() {
    return await this.agents.getSubAgents();
  }

  async getListAgentsByAgent() {
    return await this.agents.getListAgentsByAgent();
  }

  async testManagerEndpoints() {
    return await this.agents.testManagerEndpoints();
  }

  async getPendingWebReportsConfig() {
    return await this.agents.getPendingWebReportsConfig();
  }

  // Customer Management
  async getCustomers(limit: number = 100) {
    return await this.customers.getCustomers(limit);
  }

  async getInfoPlayer(playerID: string) {
    return await this.customers.getInfoPlayer(playerID);
  }

  async getNewUsers(days: number = 7) {
    return await this.customers.getNewUsers(days);
  }

  async getNewEmailsCount() {
    return await this.customers.getNewEmailsCount();
  }

  // Utility Methods
  async rawRequest(endpoint: string, method: string = 'POST', data?: any) {
    return await this.core.rawRequest(endpoint, method, data);
  }

  // Module Access (for advanced usage)
  getCore(): Fantasy402AgentClientCore {
    return this.core;
  }

  getFinancial(): Fantasy402FinancialOperations {
    return this.financial;
  }

  getAgents(): Fantasy402AgentManagement {
    return this.agents;
  }

  getCustomers(): Fantasy402CustomerManagement {
    return this.customers;
  }
}

// Export default instance
export const fantasy402Client = new Fantasy402AgentClient();

// Export individual modules for advanced usage
export { Fantasy402AgentClientCore } from './core/agent-client-core';
export { Fantasy402FinancialOperations } from './financial/financial-operations';
export { Fantasy402AgentManagement } from './agents/agent-management';
export { Fantasy402CustomerManagement } from './customers/customer-management';
