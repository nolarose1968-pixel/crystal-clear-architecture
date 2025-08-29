/**
 * Fantasy402 Gateway - Anti-Corruption Layer
 * Domain-Driven Design Implementation
 *
 * This gateway provides a clean interface for internal domains to interact with
 * the external Fantasy402 system without exposing external complexity.
 */

import { Fantasy402Adapter } from '../adapters/fantasy402-adapter';
import { FantasySportEvent } from '../entities/fantasy-sport-event';
import { FantasyAgent } from '../entities/fantasy-agent';
import { FantasyBet } from '../entities/fantasy-bet';
import { FantasyAccount } from '../entities/fantasy-account';
import { DomainEvents } from '../../shared/events/domain-events';

export interface FantasyGatewayConfig {
  baseUrl: string;
  apiUrl: string;
  username: string;
  password: string;
  requestTimeout: number;
  retryAttempts: number;
}

export interface SportEventQuery {
  sport?: string;
  league?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

export interface AgentQuery {
  agentId?: string;
  masterAgentId?: string;
  office?: string;
  active?: boolean;
}

export interface BetQuery {
  betId?: string;
  agentId?: string;
  customerId?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'won' | 'lost' | 'cancelled';
  dateFrom?: Date;
  dateTo?: Date;
}

export class Fantasy402Gateway {
  private adapter: Fantasy402Adapter;
  private eventPublisher: DomainEvents;

  constructor(config: FantasyGatewayConfig) {
    this.adapter = new Fantasy402Adapter(config);
    this.eventPublisher = DomainEvents.getInstance();
  }

  /**
   * Initialize the gateway connection
   */
  async initialize(): Promise<void> {
    try {
      await this.adapter.authenticate();
      console.log('🎯 Fantasy402 Gateway: Successfully initialized');
    } catch (error) {
      console.error('❌ Fantasy402 Gateway: Failed to initialize:', error);
      throw new Error(`Fantasy402 Gateway initialization failed: ${error.message}`);
    }
  }

  /**
   * Get live sports events
   */
  async getLiveSportEvents(query: SportEventQuery = {}): Promise<FantasySportEvent[]> {
    try {
      const rawEvents = await this.adapter.getSportEvents(query);

      const events = rawEvents.map(event => FantasySportEvent.fromExternalData(event));

      // Publish domain events for new events
      for (const event of events) {
        await this.eventPublisher.publish('fantasy.sport_event.discovered', {
          eventId: event.getId(),
          sport: event.getSport(),
          league: event.getLeague(),
          homeTeam: event.getHomeTeam(),
          awayTeam: event.getAwayTeam(),
          startTime: event.getStartTime(),
          status: event.getStatus()
        });
      }

      return events;
    } catch (error) {
      console.error('❌ Fantasy402 Gateway: Failed to get live events:', error);
      throw new Error(`Failed to retrieve live sport events: ${error.message}`);
    }
  }

  /**
   * Get agent information
   */
  async getAgent(agentId: string): Promise<FantasyAgent | null> {
    try {
      const rawAgent = await this.adapter.getAgentInfo(agentId);
      return rawAgent ? FantasyAgent.fromExternalData(rawAgent) : null;
    } catch (error) {
      console.error(`❌ Fantasy402 Gateway: Failed to get agent ${agentId}:`, error);
      throw new Error(`Failed to retrieve agent information: ${error.message}`);
    }
  }

  /**
   * Get agents by query
   */
  async getAgents(query: AgentQuery = {}): Promise<FantasyAgent[]> {
    try {
      const rawAgents = await this.adapter.getAgents(query);
      return rawAgents.map(agent => FantasyAgent.fromExternalData(agent));
    } catch (error) {
      console.error('❌ Fantasy402 Gateway: Failed to get agents:', error);
      throw new Error(`Failed to retrieve agents: ${error.message}`);
    }
  }

  /**
   * Get agent account information
   */
  async getAgentAccount(agentId: string): Promise<FantasyAccount | null> {
    try {
      const rawAccount = await this.adapter.getAgentAccount(agentId);
      return rawAccount ? FantasyAccount.fromExternalData(rawAccount) : null;
    } catch (error) {
      console.error(`❌ Fantasy402 Gateway: Failed to get agent account ${agentId}:`, error);
      throw new Error(`Failed to retrieve agent account: ${error.message}`);
    }
  }

  /**
   * Get bets by query
   */
  async getBets(query: BetQuery = {}): Promise<FantasyBet[]> {
    try {
      const rawBets = await this.adapter.getBets(query);
      return rawBets.map(bet => FantasyBet.fromExternalData(bet));
    } catch (error) {
      console.error('❌ Fantasy402 Gateway: Failed to get bets:', error);
      throw new Error(`Failed to retrieve bets: ${error.message}`);
    }
  }

  /**
   * Get specific bet
   */
  async getBet(betId: string): Promise<FantasyBet | null> {
    try {
      const rawBet = await this.adapter.getBet(betId);
      return rawBet ? FantasyBet.fromExternalData(rawBet) : null;
    } catch (error) {
      console.error(`❌ Fantasy402 Gateway: Failed to get bet ${betId}:`, error);
      throw new Error(`Failed to retrieve bet: ${error.message}`);
    }
  }

  /**
   * Place a bet on behalf of an agent
   */
  async placeBet(params: {
    agentId: string;
    eventId: string;
    betType: string;
    amount: number;
    odds: number;
    selection: string;
  }): Promise<FantasyBet> {
    try {
      const rawBet = await this.adapter.placeBet(params);
      const bet = FantasyBet.fromExternalData(rawBet);

      // Publish domain event
      await this.eventPublisher.publish('fantasy.bet.placed', {
        betId: bet.getId(),
        agentId: params.agentId,
        eventId: params.eventId,
        amount: params.amount,
        odds: params.odds,
        status: bet.getStatus()
      });

      return bet;
    } catch (error) {
      console.error('❌ Fantasy402 Gateway: Failed to place bet:', error);
      throw new Error(`Failed to place bet: ${error.message}`);
    }
  }

  /**
   * Cancel a bet
   */
  async cancelBet(betId: string, reason: string): Promise<void> {
    try {
      await this.adapter.cancelBet(betId, reason);

      // Publish domain event
      await this.eventPublisher.publish('fantasy.bet.cancelled', {
        betId,
        reason,
        cancelledAt: new Date()
      });
    } catch (error) {
      console.error(`❌ Fantasy402 Gateway: Failed to cancel bet ${betId}:`, error);
      throw new Error(`Failed to cancel bet: ${error.message}`);
    }
  }

  /**
   * Update agent balance
   */
  async updateAgentBalance(agentId: string, amount: number, reason: string): Promise<FantasyAccount> {
    try {
      const rawAccount = await this.adapter.updateBalance(agentId, amount, reason);
      const account = FantasyAccount.fromExternalData(rawAccount);

      // Publish domain event
      await this.eventPublisher.publish('fantasy.account.balance_updated', {
        agentId,
        previousBalance: account.getCurrentBalance() - amount,
        newBalance: account.getCurrentBalance(),
        changeAmount: amount,
        reason
      });

      return account;
    } catch (error) {
      console.error(`❌ Fantasy402 Gateway: Failed to update balance for ${agentId}:`, error);
      throw new Error(`Failed to update agent balance: ${error.message}`);
    }
  }

  /**
   * Get sports odds for an event
   */
  async getEventOdds(eventId: string): Promise<{
    eventId: string;
    homeOdds: number;
    awayOdds: number;
    drawOdds?: number;
    lastUpdated: Date;
  }> {
    try {
      const odds = await this.adapter.getEventOdds(eventId);
      return {
        eventId,
        homeOdds: odds.home,
        awayOdds: odds.away,
        drawOdds: odds.draw,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`❌ Fantasy402 Gateway: Failed to get odds for event ${eventId}:`, error);
      throw new Error(`Failed to retrieve event odds: ${error.message}`);
    }
  }

  /**
   * Check gateway health
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    lastChecked: Date;
  }> {
    const startTime = Date.now();

    try {
      await this.adapter.healthCheck();
      const latency = Date.now() - startTime;

      return {
        status: latency < 1000 ? 'healthy' : 'degraded',
        latency,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Clean up resources
   */
  async disconnect(): Promise<void> {
    try {
      await this.adapter.disconnect();
      console.log('🎯 Fantasy402 Gateway: Successfully disconnected');
    } catch (error) {
      console.error('❌ Fantasy402 Gateway: Error during disconnect:', error);
    }
  }
}
