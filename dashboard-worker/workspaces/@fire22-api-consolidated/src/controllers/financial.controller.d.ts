/**
 * Financial Controller
 *
 * Handles financial operations for Fire22 dashboard
 */
import type { ValidatedRequest } from '../middleware/validate.middleware';
/**
 * Request withdrawal
 */
export declare function requestWithdrawal(request: ValidatedRequest): Promise<Response>;
/**
 * Approve withdrawal
 */
export declare function approveWithdrawal(request: ValidatedRequest): Promise<Response>;
/**
 * Complete withdrawal
 */
export declare function completeWithdrawal(request: ValidatedRequest): Promise<Response>;
/**
 * Reject withdrawal
 */
export declare function rejectWithdrawal(request: ValidatedRequest): Promise<Response>;
/**
 * Get pending withdrawals
 */
export declare function getPendingWithdrawals(request: ValidatedRequest): Promise<Response>;
/**
 * Get withdrawal history
 */
export declare function getWithdrawalHistory(request: ValidatedRequest): Promise<Response>;
/**
 * Process deposit
 */
export declare function processDeposit(request: ValidatedRequest): Promise<Response>;
/**
 * Get deposit history
 */
export declare function getDepositHistory(request: ValidatedRequest): Promise<Response>;
//# sourceMappingURL=financial.controller.d.ts.map