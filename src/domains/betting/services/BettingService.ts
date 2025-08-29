/**
 * Betting Service
 * Domain-Driven Design Implementation
 *
 * Core business logic for betting operations
 */

import { BetRepository } from "../repositories/BetRepository";
import { LedgerRepository } from "../../accounting/repositories/LedgerRepository";
import {
  Bet,
  BetStatus,
  BetOutcome,
  InsufficientFundsError,
  BetNotFoundError,
  BetAlreadySettledError,
} from "../entities/Bet";
import {
  LedgerEntry,
  TransactionType,
  EntryType,
} from "../../accounting/entities/LedgerEntry";
import { OddsValue } from "../value-objects/OddsValue";
import { DomainEvents } from "../../shared/events/domain-events";
import { BaseDomainEvent } from "../../shared/events/domain-events";

export interface PlaceBetRequest {
  customerId: string;
  stake: number;
  odds: OddsValue;
}

export interface SettleBetRequest {
  betId: string;
  outcome: BetOutcome;
  marketResult: string;
}

export interface CancelBetRequest {
  betId: string;
  reason?: string;
}

export interface VoidBetRequest {
  betId: string;
  reason?: string;
}

export class BettingService {
  constructor(
    private betRepository: BetRepository,
    private ledgerRepository: LedgerRepository,
    private domainEvents = DomainEvents.getInstance(),
  ) {}

  /**
   * Place a new bet
   */
  async placeBet(request: PlaceBetRequest): Promise<Bet> {
    const { customerId, stake, odds } = request;

    // Check customer balance first
    const balance = await this.ledgerRepository.getCustomerBalance(customerId);
    if (balance < stake) {
      throw new InsufficientFundsError(
        `Insufficient balance to place bet. Required: ${stake}, Available: ${balance}`,
        customerId,
        stake,
        balance,
      );
    }

    // Validate stake
    this.validateStake(stake);

    // Create the bet
    const bet = Bet.create(customerId, stake, odds);

    // Create ledger entries in a transaction
    await this.createBetLedgerEntries(bet, balance);

    // Save the bet
    const savedBet = await this.betRepository.save(bet);

    // Publish domain event
    await this.domainEvents.publish(
      "BetPlaced",
      new BaseDomainEvent("BetPlaced", bet.getId(), "Bet", {
        betId: bet.getId(),
        customerId,
        stake,
        potentialWin: bet.getPotentialWin(),
        odds: odds.toJSON(),
      }),
    );

    return savedBet;
  }

  /**
   * Settle a bet
   */
  async settleBet(request: SettleBetRequest): Promise<Bet> {
    const { betId, outcome, marketResult } = request;

    // Find the bet
    const bet = await this.betRepository.findById(betId);
    if (!bet) {
      throw new BetNotFoundError(betId);
    }

    if (bet.isSettled()) {
      throw new BetAlreadySettledError(betId);
    }

    // Settle the bet based on outcome
    if (outcome === BetOutcome.WON) {
      await this.settleBetAsWon(bet, marketResult);
    } else {
      await this.settleBetAsLost(bet, marketResult);
    }

    // Save the updated bet
    const updatedBet = await this.betRepository.save(bet);

    return updatedBet;
  }

  /**
   * Cancel a bet
   */
  async cancelBet(request: CancelBetRequest): Promise<Bet> {
    const { betId, reason } = request;

    const bet = await this.betRepository.findById(betId);
    if (!bet) {
      throw new BetNotFoundError(betId);
    }

    if (bet.isSettled()) {
      throw new BetAlreadySettledError(betId);
    }

    // Cancel the bet
    bet.cancel(reason);

    // Create refund ledger entry
    await this.createBetRefundEntry(bet, reason);

    // Save the updated bet
    const updatedBet = await this.betRepository.save(bet);

    return updatedBet;
  }

  /**
   * Void a bet
   */
  async voidBet(request: VoidBetRequest): Promise<Bet> {
    const { betId, reason } = request;

    const bet = await this.betRepository.findById(betId);
    if (!bet) {
      throw new BetNotFoundError(betId);
    }

    if (bet.isSettled()) {
      throw new BetAlreadySettledError(betId);
    }

    // Void the bet
    bet.void(reason);

    // Create refund ledger entry
    await this.createBetRefundEntry(bet, reason);

    // Save the updated bet
    const updatedBet = await this.betRepository.save(bet);

    return updatedBet;
  }

  /**
   * Get customer's active bets
   */
  async getCustomerActiveBets(customerId: string): Promise<Bet[]> {
    const query = {
      customerId,
      status: BetStatus.OPEN,
      limit: 50,
    };

    return await this.betRepository.findByQuery(query);
  }

  /**
   * Get customer's betting history
   */
  async getCustomerBetHistory(
    customerId: string,
    limit = 20,
    offset = 0,
  ): Promise<Bet[]> {
    return await this.betRepository.findByCustomerId(customerId, limit, offset);
  }

  /**
   * Get bet by ID
   */
  async getBet(betId: string): Promise<Bet | null> {
    return await this.betRepository.findById(betId);
  }

  /**
   * Get customer's betting statistics
   */
  async getCustomerBettingStats(customerId: string) {
    return await this.betRepository.getCustomerStats(customerId);
  }

  // Private helper methods

  private validateStake(stake: number): void {
    if (stake == null || stake <= 0) {
      throw new InsufficientFundsError(
        "Stake must be greater than 0",
        "",
        stake,
        0,
      );
    }

    if (stake > 10000) {
      throw new Error("Maximum stake is $10,000");
    }

    // Check for reasonable decimal places
    if (stake !== Math.round(stake * 100) / 100) {
      throw new Error("Stake can have at most 2 decimal places");
    }
  }

  private async createBetLedgerEntries(
    bet: Bet,
    customerBalance: number,
  ): Promise<void> {
    const customerAccountId = await this.getCustomerAccountId(
      bet.getCustomerId(),
    );
    const operatingAccountId = await this.getOperatingAccountId();

    // Debit customer account (reduce balance)
    const debitEntry = LedgerEntry.createDebit({
      accountId: customerAccountId,
      amount: bet.getStake(),
      transactionType: TransactionType.BET,
      currency: "USD",
      customerId: bet.getCustomerId(),
      betId: bet.getId(),
      description: `Bet placed: ${bet.getOdds().getSelection()} @ ${bet.getOdds().getPrice()}`,
      balanceBefore: customerBalance,
      balanceAfter: customerBalance - bet.getStake(),
    });

    // Credit operating account (increase balance)
    const creditEntry = LedgerEntry.createCredit({
      accountId: operatingAccountId,
      amount: bet.getStake(),
      transactionType: TransactionType.BET,
      currency: "USD",
      betId: bet.getId(),
      description: `Bet stake received: ${bet.getStake()}`,
    });

    // Save entries
    await this.ledgerRepository.save(debitEntry);
    await this.ledgerRepository.save(creditEntry);

    // Post the entries
    debitEntry.post();
    creditEntry.post();

    await this.ledgerRepository.save(debitEntry);
    await this.ledgerRepository.save(creditEntry);
  }

  private async settleBetAsWon(bet: Bet, marketResult: string): Promise<void> {
    bet.settleAsWon(marketResult);

    const operatingAccountId = await this.getOperatingAccountId();
    const customerAccountId = await this.getCustomerAccountId(
      bet.getCustomerId(),
    );
    const customerBalance = await this.ledgerRepository.getCustomerBalance(
      bet.getCustomerId(),
    );

    // Debit operating account (pay out winnings)
    const debitEntry = LedgerEntry.createDebit({
      accountId: operatingAccountId,
      amount: bet.getPotentialWin(),
      transactionType: TransactionType.WIN,
      currency: "USD",
      betId: bet.getId(),
      description: `Bet payout: ${bet.getPotentialWin()}`,
    });

    // Credit customer account (receive winnings)
    const creditEntry = LedgerEntry.createCredit({
      accountId: customerAccountId,
      amount: bet.getPotentialWin(),
      transactionType: TransactionType.WIN,
      currency: "USD",
      customerId: bet.getCustomerId(),
      betId: bet.getId(),
      description: `Bet winnings: ${bet.getPotentialWin()}`,
      balanceBefore: customerBalance,
      balanceAfter: customerBalance + bet.getPotentialWin(),
    });

    // Save entries
    await this.ledgerRepository.save(debitEntry);
    await this.ledgerRepository.save(creditEntry);

    // Post the entries
    debitEntry.post();
    creditEntry.post();

    await this.ledgerRepository.save(debitEntry);
    await this.ledgerRepository.save(creditEntry);
  }

  private async settleBetAsLost(bet: Bet, marketResult: string): Promise<void> {
    bet.settleAsLost(marketResult);

    // No ledger entries needed for losses - the stake was already debited when the bet was placed
    // and the operating account already received the funds
  }

  private async createBetRefundEntry(bet: Bet, reason?: string): Promise<void> {
    const operatingAccountId = await this.getOperatingAccountId();
    const customerAccountId = await this.getCustomerAccountId(
      bet.getCustomerId(),
    );
    const customerBalance = await this.ledgerRepository.getCustomerBalance(
      bet.getCustomerId(),
    );

    // Debit operating account (return stake)
    const debitEntry = LedgerEntry.createDebit({
      accountId: operatingAccountId,
      amount: bet.getStake(),
      transactionType: TransactionType.REFUND,
      currency: "USD",
      betId: bet.getId(),
      description: `Bet refund: ${reason || "Bet cancelled/voided"}`,
    });

    // Credit customer account (receive refund)
    const creditEntry = LedgerEntry.createCredit({
      accountId: customerAccountId,
      amount: bet.getStake(),
      transactionType: TransactionType.REFUND,
      currency: "USD",
      customerId: bet.getCustomerId(),
      betId: bet.getId(),
      description: `Bet refund: ${reason || "Bet cancelled/voided"}`,
      balanceBefore: customerBalance,
      balanceAfter: customerBalance + bet.getStake(),
    });

    // Save entries
    await this.ledgerRepository.save(debitEntry);
    await this.ledgerRepository.save(creditEntry);

    // Post the entries
    debitEntry.post();
    creditEntry.post();

    await this.ledgerRepository.save(debitEntry);
    await this.ledgerRepository.save(creditEntry);
  }

  private async getCustomerAccountId(customerId: string): Promise<string> {
    // In a real implementation, this would look up the customer's account
    // For now, we'll use a simple mapping
    return `account_${customerId}`;
  }

  private async getOperatingAccountId(): Promise<string> {
    // Operating account for the betting platform
    return "operating_account";
  }
}
