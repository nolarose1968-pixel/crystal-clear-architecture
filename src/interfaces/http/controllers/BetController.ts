/**
 * Bet Controller
 * Domain-Driven Design Implementation
 *
 * HTTP interface for betting operations
 */

import {
  PlaceBetUseCase,
  PlaceBetCommand,
  PlaceBetResult,
} from "../../../application/use-cases/PlaceBetUseCase";
import {
  SettleBetUseCase,
  SettleBetCommand,
  SettleBetResult,
} from "../../../application/use-cases/SettleBetUseCase";
import { BettingService } from "../../../domains/betting/services/BettingService";
import { DomainError } from "../../../domains/shared/domain-entity";
import { InsufficientFundsError } from "../../../domains/betting/entities/Bet";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

export class BetController {
  constructor(
    private placeBetUseCase: PlaceBetUseCase,
    private settleBetUseCase: SettleBetUseCase,
    private bettingService: BettingService,
  ) {}

  async placeBet(request: Request): Promise<Response> {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
      const body = await request.json();
      const command: PlaceBetCommand = {
        customerId: body.customerId,
        stake: body.stake,
        oddsPrice: body.oddsPrice,
        selection: body.selection,
        marketId: body.marketId,
      };

      const result = await this.placeBetUseCase.execute(command);

      const response: ApiResponse<PlaceBetResult> = {
        success: true,
        data: result,
        timestamp,
        requestId,
      };

      return new Response(JSON.stringify(response), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return this.handleError(error, timestamp, requestId);
    }
  }

  async settleBet(request: Request): Promise<Response> {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
      const body = await request.json();
      const command: SettleBetCommand = {
        betId: body.betId,
        outcome: body.outcome,
        marketResult: body.marketResult,
      };

      const result = await this.settleBetUseCase.execute(command);

      const response: ApiResponse<SettleBetResult> = {
        success: true,
        data: result,
        timestamp,
        requestId,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return this.handleError(error, timestamp, requestId);
    }
  }

  async getBet(request: Request, betId: string): Promise<Response> {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
      const bet = await this.bettingService.getBet(betId);

      if (!bet) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: "BET_NOT_FOUND",
            message: `Bet ${betId} not found`,
          },
          timestamp,
          requestId,
        };

        return new Response(JSON.stringify(response), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const response: ApiResponse = {
        success: true,
        data: bet.toJSON(),
        timestamp,
        requestId,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return this.handleError(error, timestamp, requestId);
    }
  }

  async getCustomerBets(
    request: Request,
    customerId: string,
  ): Promise<Response> {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
      const url = new URL(request.url);
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let bets;

      if (status === "active") {
        bets = await this.bettingService.getCustomerActiveBets(customerId);
      } else {
        bets = await this.bettingService.getCustomerBetHistory(
          customerId,
          limit,
          offset,
        );
      }

      const response: ApiResponse = {
        success: true,
        data: {
          bets: bets.map((bet) => bet.toJSON()),
          count: bets.length,
          customerId,
        },
        timestamp,
        requestId,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return this.handleError(error, timestamp, requestId);
    }
  }

  async getCustomerStats(
    request: Request,
    customerId: string,
  ): Promise<Response> {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
      const stats =
        await this.bettingService.getCustomerBettingStats(customerId);

      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp,
        requestId,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return this.handleError(error, timestamp, requestId);
    }
  }

  private handleError(
    error: any,
    timestamp: string,
    requestId: string,
  ): Response {
    console.error("Bet Controller Error:", error);

    let status = 500;
    let errorCode = "INTERNAL_ERROR";
    let message = "An unexpected error occurred";

    if (error instanceof DomainError) {
      errorCode = error.code;
      message = error.message;

      // Map domain errors to HTTP status codes
      switch (error.code) {
        case "INSUFFICIENT_FUNDS":
          status = 400;
          break;
        case "BET_NOT_FOUND":
          status = 404;
          break;
        case "BET_ALREADY_SETTLED":
          status = 409;
          break;
        default:
          status = 400;
      }
    } else if (error instanceof Error) {
      message = error.message;

      // Handle validation errors
      if (
        message.includes("required") ||
        message.includes("must be") ||
        message.includes("Maximum")
      ) {
        status = 400;
        errorCode = "VALIDATION_ERROR";
      }
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        details: error.context || undefined,
      },
      timestamp,
      requestId,
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
