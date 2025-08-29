/**
 * Odds Value Object
 * Domain-Driven Design Implementation
 *
 * Immutable value object representing betting odds
 */

import { ValueObject } from "../../shared/value-object";

export class OddsValue extends ValueObject {
  private readonly _price: number;
  private readonly _selection: string;
  private readonly _marketId: string;
  private readonly _snapshot: OddsSnapshot;

  constructor(
    price: number,
    selection: string,
    marketId: string,
    snapshot: OddsSnapshot,
  ) {
    super();
    this.validatePrice(price);
    this.validateSelection(selection);
    this.validateMarketId(marketId);

    this._price = price;
    this._selection = selection;
    this._marketId = marketId;
    this._snapshot = { ...snapshot };
  }

  private validatePrice(price: number): void {
    if (!price || price <= 0) {
      throw new Error("Odds price must be greater than 0");
    }
    if (price > 1000) {
      throw new Error("Odds price cannot exceed 1000");
    }
  }

  private validateSelection(selection: string): void {
    if (!selection || selection.trim().length === 0) {
      throw new Error("Selection cannot be empty");
    }
    if (selection.length > 100) {
      throw new Error("Selection cannot exceed 100 characters");
    }
  }

  private validateMarketId(marketId: string): void {
    if (!marketId || marketId.trim().length === 0) {
      throw new Error("Market ID cannot be empty");
    }
    if (marketId.length > 50) {
      throw new Error("Market ID cannot exceed 50 characters");
    }
  }

  // Getters
  getPrice(): number {
    return this._price;
  }

  getSelection(): string {
    return this._selection;
  }

  getMarketId(): string {
    return this._marketId;
  }

  getSnapshot(): OddsSnapshot {
    return { ...this._snapshot };
  }

  /**
   * Calculate potential winnings for a given stake
   */
  calculatePotentialWin(stake: number): number {
    if (stake <= 0) {
      throw new Error("Stake must be greater than 0");
    }
    return stake * this._price;
  }

  /**
   * Get odds in fractional format (e.g., "2/1")
   */
  getFractionalOdds(): string {
    const decimal = this._price;
    if (decimal < 2) {
      const denominator = Math.round(1 / (decimal - 1));
      return `1/${denominator}`;
    } else {
      const numerator = Math.round(decimal - 1);
      return `${numerator}/1`;
    }
  }

  /**
   * Get odds in American format (e.g., "+200" or "-150")
   */
  getAmericanOdds(): string {
    const decimal = this._price;
    if (decimal >= 2) {
      return `+${Math.round((decimal - 1) * 100)}`;
    } else {
      return `-${Math.round(100 / (decimal - 1))}`;
    }
  }

  /**
   * Check if odds are considered "long shot" (high risk, high reward)
   */
  isLongShot(): boolean {
    return this._price >= 5;
  }

  /**
   * Check if odds are considered "favorite" (low risk, low reward)
   */
  isFavorite(): boolean {
    return this._price < 2;
  }

  /**
   * Get implied probability percentage
   */
  getImpliedProbability(): number {
    return Math.round((1 / this._price) * 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Create odds with current timestamp snapshot
   */
  static create(price: number, selection: string, marketId: string): OddsValue {
    const snapshot: OddsSnapshot = {
      price,
      selection,
      marketId,
      timestamp: new Date(),
      fractionalOdds: null,
      americanOdds: null,
    };

    return new OddsValue(price, selection, marketId, snapshot);
  }

  /**
   * Create odds from existing snapshot
   */
  static fromSnapshot(snapshot: OddsSnapshot): OddsValue {
    return new OddsValue(
      snapshot.price,
      snapshot.selection,
      snapshot.marketId,
      snapshot,
    );
  }

  /**
   * Compare odds for equality
   */
  equals(other: ValueObject): boolean {
    if (!(other instanceof OddsValue)) {
      return false;
    }

    return (
      this._price === other._price &&
      this._selection === other._selection &&
      this._marketId === other._marketId
    );
  }

  /**
   * Get hash code for value object
   */
  getHashCode(): string {
    return `odds_${this._price}_${this._selection}_${this._marketId}`;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): OddsSnapshot {
    return {
      price: this._price,
      selection: this._selection,
      marketId: this._marketId,
      timestamp: this._snapshot.timestamp,
      fractionalOdds: this.getFractionalOdds(),
      americanOdds: this.getAmericanOdds(),
      impliedProbability: this.getImpliedProbability(),
      isLongShot: this.isLongShot(),
      isFavorite: this.isFavorite(),
    };
  }

  /**
   * String representation
   */
  toString(): string {
    return `${this._selection} @ ${this._price.toFixed(2)} (${this.getFractionalOdds()})`;
  }
}

// Supporting interfaces
export interface OddsSnapshot {
  price: number;
  selection: string;
  marketId: string;
  timestamp: Date;
  fractionalOdds?: string;
  americanOdds?: string;
  impliedProbability?: number;
  isLongShot?: boolean;
  isFavorite?: boolean;
}

// Utility functions
export class OddsUtils {
  /**
   * Convert decimal odds to fractional
   */
  static decimalToFractional(decimal: number): string {
    if (decimal < 2) {
      const denominator = Math.round(1 / (decimal - 1));
      return `1/${denominator}`;
    } else {
      const numerator = Math.round(decimal - 1);
      return `${numerator}/1`;
    }
  }

  /**
   * Convert decimal odds to American
   */
  static decimalToAmerican(decimal: number): string {
    if (decimal >= 2) {
      return `+${Math.round((decimal - 1) * 100)}`;
    } else {
      return `-${Math.round(100 / (decimal - 1))}`;
    }
  }

  /**
   * Calculate implied probability from decimal odds
   */
  static calculateImpliedProbability(decimal: number): number {
    return Math.round((1 / decimal) * 100 * 100) / 100;
  }

  /**
   * Calculate potential win from stake and odds
   */
  static calculatePotentialWin(stake: number, odds: number): number {
    if (stake <= 0 || odds <= 0) {
      throw new Error("Stake and odds must be greater than 0");
    }
    return stake * odds;
  }
}
