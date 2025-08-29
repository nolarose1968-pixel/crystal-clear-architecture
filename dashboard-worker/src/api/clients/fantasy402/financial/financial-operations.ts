/**
 * Fantasy402 Financial Operations
 * Handles financial transactions, balances, and reporting
 */

import type { WeeklyFiguresParams, WeeklyFiguresResult, TransactionParams, WagerParams } from '../types';
import { Fantasy402AgentClientCore } from '../core/agent-client-core';

export class Fantasy402FinancialOperations {
  constructor(private core: Fantasy402AgentClientCore) {}

  /**
   * Get weekly figures for agent
   */
  async getWeeklyFigures(params?: WeeklyFiguresParams): Promise<WeeklyFiguresResult[]> {
    try {
      const requestData = {
        agentID: params?.agentID,
        startDate: params?.startDate,
        endDate: params?.endDate,
        includeSubAgents: params?.includeSubAgents || false
      };

      const response = await this.core.rawRequest('/agent/weekly-figures', 'POST', requestData);

      if (response.success) {
        return response.data.map((item: any) => ({
          agentID: item.agentID,
          agentName: item.agentName,
          period: item.period,
          totalWagers: item.totalWagers || 0,
          totalWins: item.totalWins || 0,
          totalLosses: item.totalLosses || 0,
          netProfit: item.netProfit || 0,
          commission: item.commission || 0,
          subAgents: item.subAgents?.map((sub: any) => ({
            agentID: sub.agentID,
            agentName: sub.agentName,
            period: sub.period,
            totalWagers: sub.totalWagers || 0,
            totalWins: sub.totalWins || 0,
            totalLosses: sub.totalLosses || 0,
            netProfit: sub.netProfit || 0,
            commission: sub.commission || 0
          })) || []
        }));
      } else {
        throw new Error('Failed to get weekly figures');
      }
    } catch (error) {
      console.error('❌ Failed to get weekly figures:', error);
      throw error;
    }
  }

  /**
   * Get weekly figures by agent (lite version)
   */
  async getWeeklyFigureByAgentLite(): Promise<WeeklyFiguresResult[]> {
    try {
      const response = await this.core.rawRequest('/agent/weekly-figures-lite', 'POST', {});

      if (response.success) {
        return response.data.map((item: any) => ({
          agentID: item.agentID,
          agentName: item.agentName,
          period: item.period,
          totalWagers: item.totalWagers || 0,
          totalWins: item.totalWins || 0,
          totalLosses: item.totalLosses || 0,
          netProfit: item.netProfit || 0,
          commission: item.commission || 0
        }));
      } else {
        throw new Error('Failed to get weekly figures lite');
      }
    } catch (error) {
      console.error('❌ Failed to get weekly figures lite:', error);
      throw error;
    }
  }

  /**
   * Get current balance
   */
  async getBalance(): Promise<{ balance: number; availableBalance: number; pendingWagers: number }> {
    try {
      const response = await this.core.rawRequest('/agent/balance', 'POST', {});

      if (response.success) {
        return {
          balance: response.data.balance || 0,
          availableBalance: response.data.availableBalance || 0,
          pendingWagers: response.data.pendingWagers || 0
        };
      } else {
        throw new Error('Failed to get balance');
      }
    } catch (error) {
      console.error('❌ Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Get transactions with filtering
   */
  async getTransactions(params?: TransactionParams): Promise<any[]> {
    try {
      const requestData = {
        customerID: params?.customerID,
        startDate: params?.startDate,
        endDate: params?.endDate,
        type: params?.type,
        limit: params?.limit || 50,
        offset: params?.offset || 0
      };

      const response = await this.core.rawRequest('/agent/transactions', 'POST', requestData);

      if (response.success) {
        return response.data.transactions || [];
      } else {
        throw new Error('Failed to get transactions');
      }
    } catch (error) {
      console.error('❌ Failed to get transactions:', error);
      throw error;
    }
  }

  /**
   * Get wagers with filtering
   */
  async getWagers(params?: WagerParams): Promise<any[]> {
    try {
      const requestData = {
        customerID: params?.customerID,
        startDate: params?.startDate,
        endDate: params?.endDate,
        sport: params?.sport,
        status: params?.status,
        limit: params?.limit || 50,
        offset: params?.offset || 0
      };

      const response = await this.core.rawRequest('/agent/wagers', 'POST', requestData);

      if (response.success) {
        return response.data.wagers || [];
      } else {
        throw new Error('Failed to get wagers');
      }
    } catch (error) {
      console.error('❌ Failed to get wagers:', error);
      throw error;
    }
  }

  /**
   * Get live wagers
   */
  async getLiveWagers(): Promise<any[]> {
    try {
      const response = await this.core.rawRequest('/agent/live-wagers', 'POST', {});

      if (response.success) {
        return response.data.liveWagers || [];
      } else {
        throw new Error('Failed to get live wagers');
      }
    } catch (error) {
      console.error('❌ Failed to get live wagers:', error);
      throw error;
    }
  }

  /**
   * Write log entry
   */
  async writeLog(message: string, level: string = 'info'): Promise<void> {
    try {
      const requestData = {
        message,
        level,
        timestamp: new Date().toISOString(),
        agentID: this.core.getAgentPermissions()?.agentID
      };

      const response = await this.core.rawRequest('/agent/write-log', 'POST', requestData);

      if (!response.success) {
        console.warn('⚠️ Failed to write log entry, but continuing...');
      }
    } catch (error) {
      console.error('❌ Failed to write log:', error);
      // Don't throw for logging failures
    }
  }
}
