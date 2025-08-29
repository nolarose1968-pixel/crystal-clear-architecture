/**
 * Bet Repository Interface
 * Domain-Driven Design Implementation
 *
 * Repository pattern for Bet entity persistence
 */

import { Bet, BetStatus } from "../entities/Bet";

export interface BetQuery {
  customerId?: string;
  status?: BetStatus;
  marketId?: string;
  fromDate?: Date;
  toDate?: Date;
  minStake?: number;
  maxStake?: number;
  limit?: number;
  offset?: number;
}

export interface BetSummary {
  totalBets: number;
  betsByStatus: Record<BetStatus, number>;
  totalStaked: number;
  totalPotentialWin: number;
  totalActualWin: number;
  winRate: number;
  averageStake: number;
}

export abstract class BetRepository {
  /**
   * Save a bet
   */
  abstract save(bet: Bet): Promise<Bet>;

  /**
   * Find bet by ID
   */
  abstract findById(id: string): Promise<Bet | null>;

  /**
   * Find bets by customer ID
   */
  abstract findByCustomerId(
    customerId: string,
    limit?: number,
    offset?: number,
  ): Promise<Bet[]>;

  /**
   * Find bets by query
   */
  abstract findByQuery(query: BetQuery): Promise<Bet[]>;

  /**
   * Find open bets
   */
  abstract findOpenBets(): Promise<Bet[]>;

  /**
   * Find open bets by market
   */
  abstract findOpenBetsByMarket(marketId: string): Promise<Bet[]>;

  /**
   * Find bets that need settlement
   */
  abstract findBetsNeedingSettlement(): Promise<Bet[]>;

  /**
   * Get bet summary statistics
   */
  abstract getSummary(customerId?: string): Promise<BetSummary>;

  /**
   * Check if bet exists
   */
  abstract exists(id: string): Promise<boolean>;

  /**
   * Delete bet (soft delete)
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Get customer's betting statistics
   */
  abstract getCustomerStats(customerId: string): Promise<CustomerBetStats>;
}

export interface CustomerBetStats {
  customerId: string;
  totalBets: number;
  totalStaked: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  profitLoss: number;
  averageStake: number;
  favoriteMarket?: string;
  lastBetDate?: Date;
}
