/**
 * Bet Entity
 * Domain-Driven Design Implementation
 *
 * Core betting entity representing a customer's wager
 */

import { DomainEntity, DomainError } from "../../shared/domain-entity";
import { BaseDomainEvent } from "../../shared/events/domain-events";
import { OddsValue } from "../value-objects/OddsValue";

export enum BetStatus {
  OPEN = "OPEN",
  WON = "WON",
  LOST = "LOST",
  CANCELLED = "CANCELLED",
  VOIDED = "VOIDED",
}

export enum BetOutcome {
  WON = "WON",
  LOST = "LOST",
}

export class Bet extends DomainEntity {
  private readonly _id: string;
  private readonly _customerId: string;
  private readonly _stake: number;
  private readonly _potentialWin: number;
  private readonly _odds: OddsValue;
  private readonly _placedAt: Date;
  private _status: BetStatus;
  private _settledAt?: Date;
  private _outcome?: BetOutcome;
  private _actualWin?: number;
  private _marketResult?: string;

  constructor(params: BetParams) {
    super(params.id, new Date(), new Date());
    this._id = params.id;
    this._customerId = params.customerId;
    this._stake = params.stake;
    this._potentialWin = params.potentialWin;
    this._odds = params.odds;
    this._placedAt = new Date(params.placedAt);
    this._status = params.status || BetStatus.OPEN;
    this._settledAt = params.settledAt ? new Date(params.settledAt) : undefined;
    this._outcome = params.outcome;
    this._actualWin = params.actualWin;
    this._marketResult = params.marketResult;
  }

  // Getters
  getId(): string {
    return this._id;
  }
  getCustomerId(): string {
    return this._customerId;
  }
  getStake(): number {
    return this._stake;
  }
  getPotentialWin(): number {
    return this._potentialWin;
  }
  getOdds(): OddsValue {
    return this._odds;
  }
  getPlacedAt(): Date {
    return new Date(this._placedAt);
  }
  getStatus(): BetStatus {
    return this._status;
  }
  getSettledAt(): Date | undefined {
    return this._settledAt ? new Date(this._settledAt) : undefined;
  }
  getOutcome(): BetOutcome | undefined {
    return this._outcome;
  }
  getActualWin(): number | undefined {
    return this._actualWin;
  }
  getMarketResult(): string | undefined {
    return this._marketResult;
  }

  // Business Logic Methods
  isOpen(): boolean {
    return this._status === BetStatus.OPEN;
  }

  isSettled(): boolean {
    return (
      this._status === BetStatus.WON ||
      this._status === BetStatus.LOST ||
      this._status === BetStatus.CANCELLED ||
      this._status === BetStatus.VOIDED
    );
  }

  isWon(): boolean {
    return this._status === BetStatus.WON;
  }

  isLost(): boolean {
    return this._status === BetStatus.LOST;
  }

  canBeSettled(): boolean {
    return this.isOpen();
  }

  canBeCancelled(): boolean {
    return this.isOpen();
  }

  canBeVoided(): boolean {
    return this.isOpen();
  }

  /**
   * Settle the bet with a winning outcome
   */
  settleAsWon(marketResult: string): void {
    if (!this.canBeSettled()) {
      throw new DomainError(
        `Cannot settle bet ${this._id} with status ${this._status}`,
        "BET_CANNOT_SETTLE",
        { betId: this._id, currentStatus: this._status },
      );
    }

    this._status = BetStatus.WON;
    this._outcome = BetOutcome.WON;
    this._settledAt = new Date();
    this._actualWin = this._potentialWin;
    this._marketResult = marketResult;

    this.addDomainEvent(
      new BaseDomainEvent("BetWon", this._id, "Bet", {
        betId: this._id,
        customerId: this._customerId,
        stake: this._stake,
        potentialWin: this._potentialWin,
        actualWin: this._actualWin,
        marketResult,
        settledAt: this._settledAt,
      }),
    );
  }

  /**
   * Settle the bet with a losing outcome
   */
  settleAsLost(marketResult: string): void {
    if (!this.canBeSettled()) {
      throw new DomainError(
        `Cannot settle bet ${this._id} with status ${this._status}`,
        "BET_CANNOT_SETTLE",
        { betId: this._id, currentStatus: this._status },
      );
    }

    this._status = BetStatus.LOST;
    this._outcome = BetOutcome.LOST;
    this._settledAt = new Date();
    this._actualWin = 0;
    this._marketResult = marketResult;

    this.addDomainEvent(
      new BaseDomainEvent("BetLost", this._id, "Bet", {
        betId: this._id,
        customerId: this._customerId,
        stake: this._stake,
        marketResult,
        settledAt: this._settledAt,
      }),
    );
  }

  /**
   * Cancel the bet (e.g., due to market suspension)
   */
  cancel(reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new DomainError(
        `Cannot cancel bet ${this._id} with status ${this._status}`,
        "BET_CANNOT_CANCEL",
        { betId: this._id, currentStatus: this._status },
      );
    }

    this._status = BetStatus.CANCELLED;
    this._settledAt = new Date();
    this._actualWin = this._stake; // Return stake

    this.addDomainEvent(
      new BaseDomainEvent("BetCancelled", this._id, "Bet", {
        betId: this._id,
        customerId: this._customerId,
        stake: this._stake,
        reason,
        settledAt: this._settledAt,
      }),
    );
  }

  /**
   * Void the bet (e.g., due to technical issues)
   */
  void(reason?: string): void {
    if (!this.canBeVoided()) {
      throw new DomainError(
        `Cannot void bet ${this._id} with status ${this._status}`,
        "BET_CANNOT_VOID",
        { betId: this._id, currentStatus: this._status },
      );
    }

    this._status = BetStatus.VOIDED;
    this._settledAt = new Date();
    this._actualWin = this._stake; // Return stake

    this.addDomainEvent(
      new BaseDomainEvent("BetVoided", this._id, "Bet", {
        betId: this._id,
        customerId: this._customerId,
        stake: this._stake,
        reason,
        settledAt: this._settledAt,
      }),
    );
  }

  /**
   * Get the net profit/loss for this bet
   */
  getNetResult(): number {
    if (!this.isSettled()) {
      return 0;
    }

    if (this._status === BetStatus.WON) {
      return this._actualWin! - this._stake;
    } else if (this._status === BetStatus.LOST) {
      return -this._stake;
    } else {
      // Cancelled or voided - stake returned
      return 0;
    }
  }

  /**
   * Get the total payout (stake + winnings for won bets, stake for cancelled/voided, 0 for lost)
   */
  getTotalPayout(): number {
    if (!this.isSettled()) {
      return 0;
    }

    return this._actualWin || 0;
  }

  // Factory method
  static create(customerId: string, stake: number, odds: OddsValue): Bet {
    const id = crypto.randomUUID();
    const potentialWin = stake * odds.getPrice();
    const now = new Date();

    const bet = new Bet({
      id,
      customerId,
      stake,
      potentialWin,
      odds,
      placedAt: now,
      status: BetStatus.OPEN,
    });

    // Add creation event
    bet.addDomainEvent(
      new BaseDomainEvent("BetPlaced", id, "Bet", {
        betId: id,
        customerId,
        stake,
        potentialWin,
        odds: odds.toJSON(),
        placedAt: now,
      }),
    );

    return bet;
  }

  toJSON() {
    return {
      id: this._id,
      customerId: this._customerId,
      stake: this._stake,
      potentialWin: this._potentialWin,
      odds: this._odds.toJSON(),
      placedAt: this._placedAt.toISOString(),
      status: this._status,
      settledAt: this._settledAt?.toISOString(),
      outcome: this._outcome,
      actualWin: this._actualWin,
      marketResult: this._marketResult,
      netResult: this.getNetResult(),
      totalPayout: this.getTotalPayout(),
    };
  }
}

// Supporting interfaces
export interface BetParams {
  id: string;
  customerId: string;
  stake: number;
  potentialWin: number;
  odds: OddsValue;
  placedAt: Date;
  status?: BetStatus;
  settledAt?: Date;
  outcome?: BetOutcome;
  actualWin?: number;
  marketResult?: string;
}

// Custom domain errors
export class InsufficientFundsError extends DomainError {
  constructor(
    message: string,
    customerId: string,
    required: number,
    available: number,
  ) {
    super(message, "INSUFFICIENT_FUNDS", {
      customerId,
      requiredAmount: required,
      availableAmount: available,
    });
  }
}

export class BetNotFoundError extends DomainError {
  constructor(betId: string) {
    super(`Bet ${betId} not found`, "BET_NOT_FOUND", { betId });
  }
}

export class BetAlreadySettledError extends DomainError {
  constructor(betId: string) {
    super(`Bet ${betId} is already settled`, "BET_ALREADY_SETTLED", { betId });
  }
}
