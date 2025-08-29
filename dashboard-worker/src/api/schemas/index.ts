/**
 * Fire22 API Validation Schemas
 * 
 * Re-exports all validation schemas from @fire22/validator with additional
 * dashboard-specific schemas
 */

// Re-export all schemas from @fire22/validator
// Note: @fire22/validator package needs to be built first
// export * from '@fire22/validator/schemas';

// Additional schemas specific to the dashboard API
import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Login request schema
 */
export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(100),
  rememberMe: z.boolean().optional()
});

/**
 * Refresh token request schema
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

/**
 * Agent ID parameter schema
 */
export const AgentIDParamSchema = z.object({
  agentID: z.string()
    .min(1, 'Agent ID is required')
    .max(20, 'Agent ID must be 20 characters or less')
    .regex(/^[A-Z0-9]+$/, 'Agent ID must contain only uppercase letters and numbers')
});

/**
 * Customer ID parameter schema
 */
export const CustomerIDParamSchema = z.object({
  customerID: z.string()
    .min(1, 'Customer ID is required')
    .max(20, 'Customer ID must be 20 characters or less')
});

/**
 * Pagination query schema
 */
export const PaginationQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('10'),
  offset: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(0)).optional()
});

/**
 * Date range query schema
 */
export const DateRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('weekly')
});

/**
 * Live wagers request schema
 */
export const GetLiveWagersRequestSchema = z.object({
  agentID: z.string().min(1, 'Agent ID is required')
});

/**
 * Weekly figures request schema
 */
export const GetWeeklyFiguresRequestSchema = z.object({
  agentID: z.string().min(1, 'Agent ID is required'),
  week: z.string().optional(),
  year: z.string().optional()
});

/**
 * Agent performance request schema
 */
export const GetAgentPerformanceRequestSchema = z.object({
  agentID: z.string().min(1, 'Agent ID is required'),
  period: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

/**
 * Customer admin request schema
 */
export const GetCustomerAdminRequestSchema = z.object({
  agentID: z.string().min(1, 'Agent ID is required'),
  status: z.enum(['active', 'inactive', 'suspended', 'all']).optional(),
  limit: z.number().int().min(1).max(1000).optional()
});

/**
 * Customer details query schema
 */
export const GetCustomerDetailsQuerySchema = z.object({
  customerID: z.string().min(1, 'Customer ID is required')
});

// ============================================================================
// Admin Schemas
// ============================================================================

/**
 * Settle wager request schema
 */
export const SettleWagerRequestSchema = z.object({
  wagerId: z.string().min(1, 'Wager ID is required'),
  result: z.enum(['win', 'lose', 'push', 'cancelled']),
  amount: z.number().min(0).optional(),
  notes: z.string().max(500).optional()
});

/**
 * Bulk settle request schema
 */
export const BulkSettleRequestSchema = z.object({
  wagers: z.array(z.object({
    wagerId: z.string().min(1),
    result: z.enum(['win', 'lose', 'push', 'cancelled']),
    amount: z.number().min(0).optional()
  })).min(1, 'At least one wager is required'),
  notes: z.string().max(500).optional()
});

/**
 * Void wager request schema
 */
export const VoidWagerRequestSchema = z.object({
  wagerId: z.string().min(1, 'Wager ID is required'),
  reason: z.string().min(1, 'Reason is required').max(500)
});

/**
 * Create customer request schema
 */
export const CreateCustomerRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  agentID: z.string().min(1, 'Agent ID is required'),
  creditLimit: z.number().min(0),
  weeklyLimit: z.number().min(0).optional(),
  phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
  email: z.string().email().optional(),
  notes: z.string().max(500).optional()
});

/**
 * Enhanced create customer request schema (dashboard version)
 */
export const CreateCustomerDashboardRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
  customerType: z.enum(['NEW', 'REGULAR', 'VIP', 'VVIP', 'PREPAID', 'CREDIT', 'CASH_ONLY']),
  serviceTier: z.number().int().min(1).max(3),
  initialBalance: z.number().min(0).optional(),
  currency: z.string().max(3).optional(),
  telegramId: z.string().max(100).optional(),
  referralCode: z.string().max(50).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Rules query parameters schema
 */
export const GetRulesQuerySchema = z.object({
  category: z.enum(['business', 'compliance', 'operational', 'security', 'all']).default('all'),
  format: z.enum(['detailed', 'summary']).default('detailed')
});

/**
 * Rule item schema
 */
export const RuleItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
  lastUpdated: z.string().datetime(),
  status: z.enum(['active', 'inactive', 'pending'])
});

/**
 * Rules category schema
 */
export const RulesCategorySchema = z.object({
  title: z.string(),
  description: z.string(),
  rules: z.array(RuleItemSchema)
});

/**
 * Rules response schema
 */
export const RulesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    rules: z.record(RulesCategorySchema),
    metadata: z.object({
      totalCategories: z.number(),
      totalRules: z.number(),
      lastUpdated: z.string().datetime(),
      generatedBy: z.string()
    })
  })
});

/**
 * Rules summary response schema
 */
export const RulesSummaryResponseSchema = z.object({
  categories: z.array(z.string()),
  totalRules: z.number(),
  lastUpdated: z.string().datetime(),
  summary: z.array(z.object({
    category: z.string(),
    title: z.string(),
    ruleCount: z.number(),
    criticalRules: z.number(),
    highRules: z.number()
  }))
});

/**
 * Transaction type enum
 */
export const TransactionTypeSchema = z.enum(['deposit', 'withdrawal', 'transfer', 'bonus', 'fee', 'adjustment']);

/**
 * Transaction status enum
 */
export const TransactionStatusSchema = z.enum(['pending', 'completed', 'failed', 'cancelled']);

/**
 * Transaction item schema
 */
export const TransactionItemSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),
  type: TransactionTypeSchema,
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  method: z.string().optional(),
  status: TransactionStatusSchema,
  description: z.string(),
  reference: z.string().optional(),
  timestamp: z.string().datetime(),
  processingTime: z.string().optional(),
  fee: z.number().min(0).default(0),
  netAmount: z.number().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Transaction filter query schema
 */
export const TransactionQuerySchema = z.object({
  customerId: z.string().optional(),
  type: z.enum(['all', 'deposit', 'withdrawal', 'transfer', 'bonus']).default('all'),
  status: z.enum(['all', 'pending', 'completed', 'failed']).default('all'),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

/**
 * Transaction summary schema
 */
export const TransactionSummarySchema = z.object({
  totalTransactions: z.number(),
  totalDeposits: z.number(),
  totalWithdrawals: z.number(),
  totalAmount: z.number(),
  pendingTransactions: z.number(),
  completedTransactions: z.number(),
  averageTransactionAmount: z.number()
});

/**
 * Transaction pagination schema
 */
export const TransactionPaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalTransactions: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean()
});

/**
 * Transactions response schema
 */
export const TransactionsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transactions: z.array(TransactionItemSchema),
    summary: TransactionSummarySchema,
    pagination: TransactionPaginationSchema,
    filters: z.object({
      customerId: z.string().nullable(),
      type: z.string(),
      status: z.string(),
      dateRange: z.object({
        startDate: z.string().nullable(),
        endDate: z.string().nullable()
      }).nullable()
    })
  })
});

// Betting Lines Schemas
export const BetTypeSchema = z.enum(['moneyline', 'spread', 'total']);

export const SportSchema = z.enum(['football', 'basketball', 'soccer', 'baseball', 'hockey', 'tennis', 'all']);

export const GameStatusSchema = z.enum(['upcoming', 'live', 'completed', 'cancelled']);

export const OddsSchema = z.object({
  american: z.number().int(),
  decimal: z.number().positive().optional(),
  fractional: z.string().optional()
});

export const MoneylineOddsSchema = z.object({
  home: z.number().int(),
  away: z.number().int(),
  draw: z.number().int().nullable().optional()
});

export const SpreadOddsSchema = z.object({
  home: z.number(),
  away: z.number(),
  homeOdds: z.number().int(),
  awayOdds: z.number().int()
});

export const TotalOddsSchema = z.object({
  over: z.number(),
  under: z.number(),
  overOdds: z.number().int(),
  underOdds: z.number().int()
});

export const GameOddsSchema = z.object({
  moneyline: MoneylineOddsSchema,
  spread: SpreadOddsSchema,
  total: TotalOddsSchema
});

export const GameScoreSchema = z.object({
  home: z.number().int().min(0),
  away: z.number().int().min(0)
});

export const GamePeriodSchema = z.object({
  current: z.number().int().min(1),
  total: z.number().int().min(1),
  type: z.enum(['quarter', 'half', 'period', 'set']),
  timeRemaining: z.string().optional()
});

export const BettingLineSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  startTime: z.string().datetime(),
  status: GameStatusSchema,
  score: GameScoreSchema.optional(),
  period: GamePeriodSchema.optional(),
  odds: GameOddsSchema,
  league: z.string(),
  season: z.string(),
  week: z.number().int().min(1).optional(),
  round: z.number().int().min(1).optional(),
  venue: z.string().optional(),
  broadcast: z.string().optional()
});

export const GetLinesQuerySchema = z.object({
  sport: SportSchema.default('all'),
  date: z.string().optional(),
  type: z.enum(['place-bets', 'sportsbook']).default('place-bets'),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  league: z.string().optional(),
  status: z.enum(['all', 'upcoming', 'live', 'completed']).default('all')
});

export const LinesSummarySchema = z.object({
  totalLines: z.number().int().min(0),
  liveEvents: z.number().int().min(0),
  upcomingEvents: z.number().int().min(0),
  completedEvents: z.number().int().min(0),
  sportsBreakdown: z.record(z.number().int().min(0))
});

export const LinesPaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalLines: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean()
});

export const LinesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    lines: z.array(BettingLineSchema),
    summary: LinesSummarySchema,
    filters: z.object({
      sport: SportSchema,
      date: z.string().nullable(),
      type: z.enum(['place-bets', 'sportsbook']),
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      league: z.string().nullable(),
      status: z.string()
    }),
    pagination: LinesPaginationSchema,
    metadata: z.object({
      lastUpdated: z.string().datetime(),
      dataSource: z.string(),
      version: z.string(),
      totalRecords: z.number().int().min(0).optional()
    })
  })
});

// Bet Placement Schemas
export const BetSlipItemSchema = z.object({
  lineId: z.string(),
  betType: BetTypeSchema,
  selection: z.string().min(1),
  odds: z.number().int(),
  stake: z.number().positive(),
  line: BettingLineSchema.optional() // For validation reference
});

export const PlaceBetRequestSchema = z.object({
  customerId: z.string(),
  bets: z.array(BetSlipItemSchema).min(1).max(20), // Max 20 bets per slip
  totalStake: z.number().positive(),
  acceptBetterOdds: z.boolean().default(false),
  timestamp: z.string().datetime().optional()
});

export const BetPlacementResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    betId: z.string(),
    customerId: z.string(),
    bets: z.array(z.object({
      betId: z.string(),
      lineId: z.string(),
      betType: BetTypeSchema,
      selection: z.string(),
      odds: z.number().int(),
      stake: z.number().positive(),
      potentialPayout: z.number().positive()
    })),
    totalStake: z.number().positive(),
    totalPotentialPayout: z.number().positive(),
    timestamp: z.string().datetime(),
    status: z.enum(['placed', 'pending', 'confirmed']),
    reference: z.string().optional()
  })
});

// Customer Balance Schema
export const CustomerBalanceSchema = z.object({
  customerId: z.string(),
  availableBalance: z.number().min(0),
  creditLimit: z.number().min(0),
  currentExposure: z.number().min(0),
  maxBetAmount: z.number().min(0)
});

// Collections and Settlements Schemas
export const SettlementStatusSchema = z.enum(['settled', 'pending', 'cancelled', 'voided']);

export const SettlementOutcomeSchema = z.enum(['won', 'lost', 'push', 'pending']);

export const SettlementPrioritySchema = z.enum(['high', 'medium', 'low']);

export const SettlementProcessingStatusSchema = z.enum([
  'ready_for_settlement',
  'awaiting_verification',
  'awaiting_result',
  'processing',
  'completed',
  'failed'
]);

export const SettlementItemSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string().min(1),
  wagerId: z.string(),
  event: z.string().min(1),
  betType: BetTypeSchema,
  selection: z.string().min(1),
  stake: z.number().positive(),
  odds: z.number().int(),
  potentialPayout: z.number().positive(),
  outcome: SettlementOutcomeSchema,
  status: SettlementStatusSchema,
  settledAmount: z.number().min(0),
  settledDate: z.string().datetime().nullable(),
  processedBy: z.string().nullable(),
  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export const PendingSettlementSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string().min(1),
  wagerId: z.string(),
  event: z.string().min(1),
  betType: BetTypeSchema,
  selection: z.string().min(1),
  stake: z.number().positive(),
  odds: z.number().int(),
  potentialPayout: z.number().positive(),
  outcome: SettlementOutcomeSchema,
  priority: SettlementPrioritySchema,
  dueDate: z.string().datetime(),
  daysOverdue: z.number().int().min(0),
  notes: z.string().optional(),
  assignedTo: z.string().nullable(),
  status: SettlementProcessingStatusSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export const SettlementHistoryQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  status: SettlementStatusSchema.or(z.literal('all')).default('all'),
  customerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  processedBy: z.string().optional(),
  minAmount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  maxAmount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional()
});

export const PendingSettlementsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  priority: SettlementPrioritySchema.or(z.literal('all')).default('all'),
  customerId: z.string().optional(),
  status: SettlementProcessingStatusSchema.or(z.literal('all')).default('all'),
  overdueOnly: z.string().transform(val => val === 'true').pipe(z.boolean()).optional()
});

export const CollectionsDashboardQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month']).default('today'),
  includeMetrics: z.string().transform(val => val === 'true').pipe(z.boolean()).default(true),
  includeActivity: z.string().transform(val => val === 'true').pipe(z.boolean()).default(true)
});

export const ProcessSettlementRequestSchema = z.object({
  settlementId: z.string(),
  customerId: z.string(),
  amount: z.number().positive(),
  notes: z.string().optional(),
  processedBy: z.string().min(1),
  transactionReference: z.string().optional(),
  paymentMethod: z.enum(['cash', 'check', 'wire', 'credit', 'other']).default('cash'),
  confirmationNumber: z.string().optional()
});

export const BulkSettlementActionSchema = z.object({
  settlementIds: z.array(z.string()).min(1).max(50), // Max 50 settlements per bulk action
  action: z.enum(['process', 'void', 'hold', 'release']),
  notes: z.string().optional(),
  processedBy: z.string().min(1),
  reason: z.string().optional()
});

export const SettlementSummarySchema = z.object({
  totalSettlements: z.number().int().min(0),
  settledCount: z.number().int().min(0),
  pendingCount: z.number().int().min(0),
  cancelledCount: z.number().int().min(0),
  voidedCount: z.number().int().min(0),
  totalStakes: z.number().min(0),
  totalPayouts: z.number().min(0),
  netProfit: z.number(),
  winRate: z.number().min(0).max(100),
  averageProcessingTime: z.number().min(0).optional(),
  overdueCount: z.number().int().min(0)
});

export const CollectionsDashboardSummarySchema = z.object({
  totalPendingSettlements: z.number().int().min(0),
  totalSettledToday: z.number().int().min(0),
  totalPayoutAmount: z.number().min(0),
  averageProcessingTime: z.string(),
  overdueSettlements: z.number().int().min(0)
});

export const PriorityBreakdownSchema = z.object({
  high: z.number().int().min(0),
  medium: z.number().int().min(0),
  low: z.number().int().min(0)
});

export const StatusBreakdownSchema = z.object({
  ready_for_settlement: z.number().int().min(0),
  awaiting_verification: z.number().int().min(0),
  awaiting_result: z.number().int().min(0),
  processing: z.number().int().min(0),
  completed: z.number().int().min(0),
  failed: z.number().int().min(0)
});

export const ActivityItemSchema = z.object({
  id: z.string(),
  type: z.enum(['settlement_processed', 'settlement_pending', 'settlement_overdue', 'settlement_cancelled', 'bulk_action']),
  description: z.string(),
  timestamp: z.string().datetime(),
  processedBy: z.string(),
  metadata: z.record(z.any()).optional()
});

export const PerformanceMetricsSchema = z.object({
  averageSettlementTime: z.string(),
  settlementSuccessRate: z.number().min(0).max(100),
  customerSatisfaction: z.number().min(0).max(5),
  onTimeSettlementRate: z.number().min(0).max(100),
  errorRate: z.number().min(0).max(100).optional(),
  averageDailyVolume: z.number().min(0).optional()
});

export const CollectionsDashboardDataSchema = z.object({
  summary: CollectionsDashboardSummarySchema,
  priorityBreakdown: PriorityBreakdownSchema,
  statusBreakdown: StatusBreakdownSchema,
  recentActivity: z.array(ActivityItemSchema),
  performanceMetrics: PerformanceMetricsSchema,
  filters: z.object({
    period: z.string(),
    dateFrom: z.string(),
    dateTo: z.string()
  })
});

export const SettlementHistoryResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    settlements: z.array(SettlementItemSchema),
    summary: SettlementSummarySchema,
    filters: z.object({
      status: z.string(),
      customerId: z.string().nullable(),
      dateFrom: z.string().nullable(),
      dateTo: z.string().nullable(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1)
    }),
    pagination: LinesPaginationSchema,
    metadata: z.object({
      lastUpdated: z.string().datetime(),
      dataSource: z.string(),
      version: z.string(),
      totalRecords: z.number().int().min(0).optional()
    })
  })
});

export const PendingSettlementsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    settlements: z.array(PendingSettlementSchema),
    summary: z.object({
      totalPending: z.number().int().min(0),
      highPriority: z.number().int().min(0),
      mediumPriority: z.number().int().min(0),
      lowPriority: z.number().int().min(0),
      overdueCount: z.number().int().min(0),
      totalPotentialPayout: z.number().min(0),
      readyForSettlement: z.number().int().min(0),
      awaitingVerification: z.number().int().min(0),
      awaitingResult: z.number().int().min(0)
    }),
    filters: z.object({
      priority: z.string(),
      customerId: z.string().nullable(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1)
    }),
    pagination: LinesPaginationSchema,
    metadata: z.object({
      lastUpdated: z.string().datetime(),
      dataSource: z.string(),
      version: z.string()
    })
  })
});

export const CollectionsDashboardResponseSchema = z.object({
  success: z.literal(true),
  data: CollectionsDashboardDataSchema,
  metadata: z.object({
    generatedAt: z.string().datetime(),
    period: z.string(),
    dataSource: z.string()
  })
});

export const ProcessSettlementResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    settlementId: z.string(),
    customerId: z.string(),
    amount: z.number().positive(),
    status: z.string(),
    processedAt: z.string().datetime(),
    processedBy: z.string(),
    notes: z.string().optional(),
    transactionId: z.string(),
    confirmationNumber: z.string()
  }),
  message: z.string()
});

export const BulkSettlementResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    action: z.string(),
    processedCount: z.number().int().min(0),
    failedCount: z.number().int().min(0),
    totalCount: z.number().int().min(0),
    processedIds: z.array(z.string()),
    failedIds: z.array(z.string()),
    processedAt: z.string().datetime(),
    processedBy: z.string()
  }),
  message: z.string()
});

// Adjustments and Corrections Schemas
export const AdjustmentTypeSchema = z.enum([
  'balance_adjustment',
  'bet_correction',
  'bonus_adjustment',
  'fee_reversal',
  'limit_adjustment',
  'account_freeze',
  'account_unfreeze'
]);

export const AdjustmentStatusSchema = z.enum(['completed', 'pending_approval', 'cancelled']);

export const AdjustmentItemSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string().min(1),
  type: AdjustmentTypeSchema,
  description: z.string().min(1),
  amount: z.number(),
  previousBalance: z.number().optional(),
  newBalance: z.number().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  processedBy: z.string().min(1),
  processedAt: z.string().datetime(),
  status: AdjustmentStatusSchema,
  approvedBy: z.string().nullable(),
  approvedAt: z.string().datetime().nullable(),
  transactionId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export const AdjustmentTypeConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  requiresAmount: z.boolean(),
  requiresApproval: z.boolean(),
  template: z.object({
    description: z.string(),
    reason: z.string()
  })
});

export const AdjustmentsHistoryQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  type: AdjustmentTypeSchema.or(z.literal('all')).default('all'),
  status: AdjustmentStatusSchema.or(z.literal('all')).default('all'),
  customerId: z.string().optional(),
  processedBy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  maxAmount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional()
});

export const CreateAdjustmentRequestSchema = z.object({
  customerId: z.string().min(1),
  type: AdjustmentTypeSchema,
  description: z.string().min(1).max(500),
  amount: z.number().optional(),
  reason: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  processedBy: z.string().min(1),
  requiresApproval: z.boolean().default(false),
  transactionReference: z.string().optional(),
  effectiveDate: z.string().datetime().optional()
});

export const ApproveAdjustmentRequestSchema = z.object({
  id: z.string(),
  approvedBy: z.string().min(1),
  notes: z.string().max(1000).optional(),
  approvalLevel: z.enum(['agent', 'manager', 'senior_manager']).default('agent')
});

export const BulkAdjustmentRequestSchema = z.object({
  adjustments: z.array(z.object({
    customerId: z.string().min(1),
    type: AdjustmentTypeSchema,
    description: z.string().min(1).max(500),
    amount: z.number().optional(),
    reason: z.string().max(1000).optional(),
    notes: z.string().max(2000).optional()
  })).min(1).max(50), // Max 50 adjustments per bulk request
  processedBy: z.string().min(1),
  requiresApproval: z.boolean().default(true),
  reason: z.string().max(1000).optional()
});

export const AdjustmentSummarySchema = z.object({
  totalAdjustments: z.number().int().min(0),
  completedAdjustments: z.number().int().min(0),
  pendingAdjustments: z.number().int().min(0),
  cancelledAdjustments: z.number().int().min(0),
  totalAmountAdjusted: z.number(),
  adjustmentsByType: z.record(z.number().int().min(0)),
  adjustmentsByStatus: z.record(z.number().int().min(0)),
  topProcessedBy: z.array(z.object({
    user: z.string(),
    count: z.number().int().min(0)
  })),
  averageProcessingTime: z.number().min(0).optional(),
  mostCommonType: z.string().optional()
});

export const AdjustmentsHistoryResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    adjustments: z.array(AdjustmentItemSchema),
    summary: AdjustmentSummarySchema,
    filters: z.object({
      type: z.string(),
      status: z.string(),
      customerId: z.string().nullable(),
      processedBy: z.string().nullable(),
      dateFrom: z.string().nullable(),
      dateTo: z.string().nullable(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1)
    }),
    pagination: LinesPaginationSchema,
    metadata: z.object({
      lastUpdated: z.string().datetime(),
      dataSource: z.string(),
      version: z.string(),
      totalRecords: z.number().int().min(0).optional()
    })
  })
});

export const CreateAdjustmentResponseSchema = z.object({
  success: z.literal(true),
  data: AdjustmentItemSchema,
  message: z.string()
});

export const ApproveAdjustmentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    adjustmentId: z.string(),
    status: z.string(),
    approvedBy: z.string(),
    approvedAt: z.string().datetime(),
    approvalNotes: z.string().optional(),
    transactionId: z.string()
  }),
  message: z.string()
});

export const AdjustmentTypesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    types: z.record(AdjustmentTypeConfigSchema),
    categories: z.object({
      financial: z.array(AdjustmentTypeSchema),
      account: z.array(AdjustmentTypeSchema),
      all: z.array(AdjustmentTypeSchema)
    })
  }),
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    version: z.string()
  })
});

export const BulkAdjustmentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    processedCount: z.number().int().min(0),
    failedCount: z.number().int().min(0),
    totalCount: z.number().int().min(0),
    processedAdjustments: z.array(AdjustmentItemSchema),
    failedAdjustments: z.array(z.object({
      index: z.number().int().min(0),
      error: z.string()
    })),
    processedAt: z.string().datetime(),
    processedBy: z.string()
  }),
  message: z.string()
});

// Adjustment Workflow Schemas
export const AdjustmentWorkflowStepSchema = z.enum([
  'created',
  'pending_review',
  'approved',
  'rejected',
  'processed',
  'completed',
  'failed'
]);

export const AdjustmentWorkflowLogSchema = z.object({
  step: AdjustmentWorkflowStepSchema,
  timestamp: z.string().datetime(),
  user: z.string(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const AdjustmentWorkflowSchema = z.object({
  id: z.string(),
  adjustmentId: z.string(),
  currentStep: AdjustmentWorkflowStepSchema,
  steps: z.array(AdjustmentWorkflowLogSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  slaHours: z.number().int().min(1).max(168).optional(), // Max 1 week
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

// Customer Impact Assessment
export const AdjustmentRiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const AdjustmentImpactAssessmentSchema = z.object({
  customerId: z.string(),
  riskLevel: AdjustmentRiskLevelSchema,
  impactAreas: z.array(z.enum([
    'balance',
    'credit_limit',
    'betting_limits',
    'account_status',
    'loyalty_points',
    'bonus_eligibility'
  ])),
  potentialIssues: z.array(z.string()),
  recommendations: z.array(z.string()),
  requiresEscalation: z.boolean(),
  assessedBy: z.string(),
  assessedAt: z.string().datetime()
});

// Audit and Compliance
export const AdjustmentAuditLogSchema = z.object({
  id: z.string(),
  adjustmentId: z.string(),
  action: z.enum([
    'created',
    'modified',
    'approved',
    'rejected',
    'processed',
    'cancelled',
    'viewed',
    'exported'
  ]),
  user: z.string(),
  timestamp: z.string().datetime(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  changes: z.record(z.any()).optional(),
  reason: z.string().optional(),
  complianceFlags: z.array(z.string()).optional()
});

export const AdjustmentComplianceReportSchema = z.object({
  adjustmentId: z.string(),
  complianceStatus: z.enum(['compliant', 'review_required', 'non_compliant']),
  flags: z.array(z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    recommendation: z.string()
  })),
  assessedAt: z.string().datetime(),
  assessedBy: z.string()
});

// Balance Management Schemas
export const AccountStatusSchema = z.enum(['active', 'suspended', 'frozen', 'closed']);

export const VipLevelSchema = z.enum(['None', 'Bronze', 'Silver', 'Gold', 'Platinum']);

export const TransactionTypeSchema = z.enum([
  'deposit',
  'withdrawal',
  'adjustment',
  'bonus',
  'fee',
  'transfer',
  'bet_placed',
  'bet_settled',
  'bet_cancelled'
]);

export const BalanceHistoryEntrySchema = z.object({
  date: z.string().datetime(),
  balance: z.number(),
  transaction: z.string(),
  amount: z.number(),
  description: z.string(),
  reference: z.string().optional(),
  processedBy: z.string().optional()
});

export const CustomerBalanceSchema = z.object({
  customerId: z.string(),
  customerName: z.string().min(1),
  currentBalance: z.number(),
  availableBalance: z.number(),
  pendingWithdrawals: z.number(),
  creditLimit: z.number(),
  lastUpdated: z.string().datetime(),
  currency: z.string().length(3).default('USD'),
  accountStatus: AccountStatusSchema,
  vipLevel: VipLevelSchema,
  balanceHistory: z.array(BalanceHistoryEntrySchema).optional(),
  summary: z.object({
    totalDeposits: z.number(),
    totalWithdrawals: z.number(),
    totalBets: z.number(),
    totalWins: z.number(),
    netProfit: z.number()
  }).optional()
});

export const CustomerBalanceSummarySchema = z.object({
  customerId: z.string(),
  customerName: z.string().min(1),
  currentBalance: z.number(),
  availableBalance: z.number(),
  pendingWithdrawals: z.number(),
  creditLimit: z.number(),
  lastActivity: z.string().datetime(),
  accountStatus: AccountStatusSchema,
  vipLevel: VipLevelSchema
});

export const BalancesSummarySchema = z.object({
  totalCustomers: z.number().int().min(0),
  activeCustomers: z.number().int().min(0),
  suspendedCustomers: z.number().int().min(0),
  totalBalance: z.number().min(0),
  totalAvailable: z.number().min(0),
  totalPendingWithdrawals: z.number().min(0),
  averageBalance: z.number().min(0),
  vipDistribution: z.record(z.number().int().min(0))
});

export const GetCustomerBalancesQuerySchema = z.object({
  customerId: z.string().min(1),
  includeHistory: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

export const GetBalancesSummaryQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  sortBy: z.enum(['balance', 'customerName', 'lastActivity', 'vipLevel']).default('balance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minBalance: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  maxBalance: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  accountStatus: AccountStatusSchema.or(z.literal('all')).default('all'),
  vipLevel: VipLevelSchema.or(z.literal('all')).default('all')
});

export const UpdateCustomerBalanceRequestSchema = z.object({
  customerId: z.string().min(1),
  amount: z.number(),
  transactionType: TransactionTypeSchema,
  description: z.string().min(1).max(500),
  reference: z.string().max(100).optional(),
  processedBy: z.string().min(1),
  notes: z.string().max(1000).optional(),
  requiresApproval: z.boolean().default(false)
});

export const BalanceSettingsSchema = z.object({
  displayOptions: z.object({
    showBalances: z.boolean().default(true),
    showAvailableBalance: z.boolean().default(true),
    showPendingWithdrawals: z.boolean().default(true),
    showCreditLimit: z.boolean().default(false),
    currency: z.string().length(3).default('USD'),
    decimalPlaces: z.number().int().min(0).max(4).default(2)
  }),
  securitySettings: z.object({
    requireApprovalForLargeAmounts: z.boolean().default(true),
    largeAmountThreshold: z.number().positive().default(1000.00),
    requireDualApproval: z.boolean().default(false),
    dualApprovalThreshold: z.number().positive().default(5000.00)
  }),
  notificationSettings: z.object({
    lowBalanceAlert: z.boolean().default(true),
    lowBalanceThreshold: z.number().min(0).default(50.00),
    highBalanceAlert: z.boolean().default(false),
    highBalanceThreshold: z.number().positive().default(10000.00),
    largeTransactionAlert: z.boolean().default(true),
    largeTransactionThreshold: z.number().positive().default(1000.00)
  }),
  automationSettings: z.object({
    autoProcessSmallDeposits: z.boolean().default(true),
    smallDepositThreshold: z.number().min(0).default(100.00),
    autoProcessSmallWithdrawals: z.boolean().default(false),
    smallWithdrawalThreshold: z.number().min(0).default(50.00)
  })
});

export const CustomerBalancesResponseSchema = z.object({
  success: z.literal(true),
  data: CustomerBalanceSchema,
  metadata: z.object({
    requestedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

export const BalancesSummaryResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    customers: z.array(CustomerBalanceSummarySchema),
    summary: BalancesSummarySchema,
    filters: z.object({
      sortBy: z.string(),
      sortOrder: z.string(),
      minBalance: z.number().nullable(),
      maxBalance: z.number().nullable(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1)
    }),
    pagination: LinesPaginationSchema
  }),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

export const UpdateCustomerBalanceResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    customerId: z.string(),
    previousBalance: z.number(),
    newBalance: z.number(),
    amount: z.number(),
    transactionType: z.string(),
    description: z.string(),
    reference: z.string().optional(),
    processedBy: z.string(),
    transactionId: z.string(),
    timestamp: z.string().datetime()
  }),
  message: z.string()
});

export const BalanceSettingsResponseSchema = z.object({
  success: z.literal(true),
  data: BalanceSettingsSchema,
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    version: z.string()
  })
});

// Balance Analytics and Reporting
export const BalanceAnalyticsSchema = z.object({
  period: z.string(),
  totalDeposits: z.number().min(0),
  totalWithdrawals: z.number().min(0),
  netFlow: z.number(),
  averageBalance: z.number().min(0),
  topDepositors: z.array(z.object({
    customerId: z.string(),
    customerName: z.string(),
    totalDeposited: z.number().min(0)
  })),
  topWithdrawers: z.array(z.object({
    customerId: z.string(),
    customerName: z.string(),
    totalWithdrawn: z.number().min(0)
  })),
  balanceDistribution: z.record(z.number().int().min(0)), // Balance ranges
  activityByHour: z.record(z.number().int().min(0)),
  growthRate: z.number()
});

export const BalanceAlertSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  alertType: z.enum(['low_balance', 'high_balance', 'large_transaction', 'suspicious_activity']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string(),
  balance: z.number(),
  threshold: z.number(),
  createdAt: z.string().datetime(),
  acknowledgedAt: z.string().datetime().nullable(),
  acknowledgedBy: z.string().nullable()
});

// Balance Transfer Schemas
export const BalanceTransferRequestSchema = z.object({
  fromCustomerId: z.string().min(1),
  toCustomerId: z.string().min(1),
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
  processedBy: z.string().min(1),
  notes: z.string().max(1000).optional(),
  requiresApproval: z.boolean().default(true)
});

export const BalanceTransferResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transferId: z.string(),
    fromCustomerId: z.string(),
    toCustomerId: z.string(),
    amount: z.number().positive(),
    reason: z.string(),
    processedBy: z.string(),
    transactionId: z.string(),
    timestamp: z.string().datetime()
  }),
  message: z.string()
});

// Distribution Management Schemas
export const RecipientTypeSchema = z.enum(['affiliate', 'agent', 'partner', 'referral']);

export const PaymentMethodSchema = z.enum(['wire_transfer', 'paypal', 'bank_transfer', 'check']);

export const DistributionTypeSchema = z.enum(['commission', 'bonus', 'revenue_share', 'performance_bonus', 'referral_bonus']);

export const DistributionStatusSchema = z.enum(['pending', 'completed', 'failed', 'cancelled', 'processing']);

export const DistributionRecipientSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: RecipientTypeSchema,
  email: z.string().email(),
  totalEarned: z.number().min(0),
  pendingPayment: z.number().min(0),
  lastPayment: z.string().datetime().optional(),
  paymentMethod: PaymentMethodSchema,
  status: z.enum(['active', 'inactive', 'suspended']),
  commissionRate: z.number().min(0).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const DistributionTransactionSchema = z.object({
  id: z.string(),
  recipientId: z.string(),
  recipientName: z.string(),
  recipientType: RecipientTypeSchema,
  amount: z.number().positive(),
  type: DistributionTypeSchema,
  period: z.string(), // e.g., "2025-01", "Q1-2025"
  paymentMethod: PaymentMethodSchema,
  status: DistributionStatusSchema,
  processedAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  processedBy: z.string().optional(),
  transactionId: z.string().optional()
});

export const DistributionBreakdownSchema = z.object({
  affiliateCommissions: z.number().min(0),
  agentCommissions: z.number().min(0),
  partnerShares: z.number().min(0),
  referralBonuses: z.number().min(0),
  performanceBonuses: z.number().min(0),
  platformFees: z.number().min(0),
  operationalCosts: z.number().min(0)
});

export const DistributionOverviewSchema = z.object({
  totalRevenue: z.number().min(0),
  totalDistributed: z.number().min(0),
  pendingDistribution: z.number().min(0),
  distributionRate: z.number().min(0).max(100),
  period: z.string(),
  lastUpdated: z.string().datetime(),
  breakdown: DistributionBreakdownSchema.optional(),
  recipients: z.array(DistributionRecipientSchema).optional(),
  recentTransactions: z.array(DistributionTransactionSchema).optional()
});

export const GetDistributionsOverviewQuerySchema = z.object({
  period: z.enum(['current_month', 'last_month', 'current_year', 'last_year', 'custom']).default('current_month'),
  includeDetails: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

export const GetDistributionHistoryQuerySchema = z.object({
  recipientId: z.string().optional(),
  type: z.enum(['all', 'commission', 'bonus', 'revenue_share', 'performance_bonus', 'referral_bonus']).default('all'),
  status: z.enum(['all', 'pending', 'completed', 'failed', 'cancelled', 'processing']).default('all'),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  maxAmount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  paymentMethod: PaymentMethodSchema.or(z.literal('all')).default('all')
});

export const ProcessDistributionPaymentRequestSchema = z.object({
  recipientId: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: PaymentMethodSchema,
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  processedBy: z.string().min(1),
  scheduledDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

export const AddDistributionRecipientRequestSchema = z.object({
  name: z.string().min(1).max(100),
  type: RecipientTypeSchema,
  email: z.string().email(),
  paymentMethod: PaymentMethodSchema,
  commissionRate: z.number().min(0).max(100),
  notes: z.string().max(500).optional(),
  taxId: z.string().max(50).optional(),
  address: z.object({
    street: z.string().max(200),
    city: z.string().max(100),
    state: z.string().max(50),
    zipCode: z.string().max(20),
    country: z.string().max(2)
  }).optional(),
  bankDetails: z.object({
    accountNumber: z.string().max(50),
    routingNumber: z.string().max(50),
    bankName: z.string().max(100),
    accountType: z.enum(['checking', 'savings'])
  }).optional()
});

export const DistributionSettingsSchema = z.object({
  distributionRules: z.object({
    affiliateCommission: z.number().min(0).max(100),
    agentCommission: z.number().min(0).max(100),
    partnerShare: z.number().min(0).max(100),
    referralBonus: z.number().min(0).max(100),
    performanceBonus: z.number().min(0).max(100),
    platformFee: z.number().min(0).max(100),
    operationalReserve: z.number().min(0).max(100)
  }),
  paymentSchedule: z.object({
    affiliatePayments: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']),
    agentPayments: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']),
    partnerPayments: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']),
    minimumPayout: z.number().min(0),
    maximumDelay: z.number().int().min(1).max(90), // days
    autoApprovalThreshold: z.number().min(0)
  }),
  paymentMethods: z.record(PaymentMethodSchema, z.object({
    enabled: z.boolean(),
    fee: z.number().min(0),
    processingDays: z.number().int().min(0).max(30),
    minimumAmount: z.number().min(0),
    maximumAmount: z.number().min(0).optional()
  })),
  automationSettings: z.object({
    autoProcessSmallPayments: z.boolean(),
    smallPaymentThreshold: z.number().min(0),
    autoSchedulePayments: z.boolean(),
    paymentReminders: z.boolean(),
    reminderDays: z.number().int().min(1).max(30),
    autoRetryFailedPayments: z.boolean(),
    maxRetryAttempts: z.number().int().min(1).max(5)
  }),
  complianceSettings: z.object({
    requireTaxForms: z.boolean(),
    taxFormTypes: z.array(z.string()),
    requireIdVerification: z.boolean(),
    minimumAge: z.number().int().min(18),
    restrictedCountries: z.array(z.string()),
    requireAddressVerification: z.boolean(),
    antiMoneyLaunderingCheck: z.boolean()
  }),
  notificationSettings: z.object({
    emailNotifications: z.boolean(),
    paymentConfirmation: z.boolean(),
    failedPaymentAlerts: z.boolean(),
    largePaymentApproval: z.boolean(),
    largePaymentThreshold: z.number().min(0)
  })
});

export const DistributionAnalyticsSchema = z.object({
  period: z.string(),
  totalRevenue: z.number().min(0),
  totalDistributed: z.number().min(0),
  distributionEfficiency: z.number().min(0).max(100),
  averageDistributionTime: z.number().min(0), // days
  topPerformers: z.array(z.object({
    recipientId: z.string(),
    recipientName: z.string(),
    totalEarned: z.number().min(0),
    distributionCount: z.number().int().min(0),
    averageAmount: z.number().min(0),
    paymentReliability: z.number().min(0).max(100)
  })),
  distributionTrends: z.array(z.object({
    period: z.string(),
    amount: z.number().min(0),
    recipients: z.number().int().min(0)
  })),
  paymentMethodUsage: z.record(z.string(), z.object({
    count: z.number().int().min(0),
    totalAmount: z.number().min(0),
    percentage: z.number().min(0).max(100)
  })),
  geographicDistribution: z.record(z.string(), z.object({
    recipients: z.number().int().min(0),
    totalAmount: z.number().min(0)
  })),
  performanceMetrics: z.object({
    onTimePayments: z.number().min(0).max(100),
    averageProcessingTime: z.number().min(0),
    failureRate: z.number().min(0).max(100),
    customerSatisfaction: z.number().min(0).max(5)
  })
});

export const DistributionReportSchema = z.object({
  reportType: z.enum(['summary', 'detailed', 'tax', 'compliance']),
  period: z.string(),
  generatedAt: z.string().datetime(),
  generatedBy: z.string(),
  totalRecipients: z.number().int().min(0),
  totalDistributed: z.number().min(0),
  breakdown: DistributionBreakdownSchema,
  topRecipients: z.array(z.object({
    recipientId: z.string(),
    recipientName: z.string(),
    totalEarned: z.number().min(0),
    paymentCount: z.number().int().min(0)
  })),
  failedPayments: z.array(z.object({
    recipientId: z.string(),
    recipientName: z.string(),
    amount: z.number().min(0),
    failureReason: z.string(),
    failedAt: z.string().datetime()
  })).optional(),
  complianceIssues: z.array(z.object({
    recipientId: z.string(),
    issue: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    resolution: z.string().optional()
  })).optional()
});

// Response Schemas
export const DistributionsOverviewResponseSchema = z.object({
  success: z.literal(true),
  data: DistributionOverviewSchema,
  metadata: z.object({
    period: z.string(),
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

export const DistributionHistoryResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    distributions: z.array(DistributionTransactionSchema),
    summary: z.object({
      totalDistributed: z.number().min(0),
      pendingAmount: z.number().min(0),
      completedAmount: z.number().min(0),
      totalRecords: z.number().int().min(0),
      byType: z.record(z.string(), z.number().min(0)),
      byStatus: z.record(z.string(), z.number().int().min(0))
    }),
    filters: z.object({
      recipientId: z.string().nullable(),
      type: z.string(),
      status: z.string(),
      dateFrom: z.string().nullable(),
      dateTo: z.string().nullable(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1)
    }),
    pagination: LinesPaginationSchema
  }),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

export const ProcessDistributionPaymentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    distributionId: z.string(),
    recipientId: z.string(),
    amount: z.number().positive(),
    paymentMethod: z.string(),
    reference: z.string(),
    status: z.string(),
    processedAt: z.string().datetime(),
    processedBy: z.string(),
    transactionId: z.string()
  }),
  message: z.string()
});

export const AddDistributionRecipientResponseSchema = z.object({
  success: z.literal(true),
  data: DistributionRecipientSchema,
  message: z.string()
});

export const DistributionSettingsResponseSchema = z.object({
  success: z.literal(true),
  data: DistributionSettingsSchema,
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    version: z.string()
  })
});

export const DistributionAnalyticsResponseSchema = z.object({
  success: z.literal(true),
  data: DistributionAnalyticsSchema,
  metadata: z.object({
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

export const DistributionReportResponseSchema = z.object({
  success: z.literal(true),
  data: DistributionReportSchema,
  metadata: z.object({
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

// Free Play Management Schemas
export const BonusTypeSchema = z.enum([
  'welcome_bonus',
  'deposit_match',
  'free_bet',
  'loyalty',
  'referral',
  'tournament',
  'promotion'
]);

export const FreePlayStatusSchema = z.enum(['available', 'redeemed', 'expired', 'cancelled']);

export const WageringRequirementTypeSchema = z.enum(['deposit', 'wager', 'loss', 'mixed']);

export const FreePlayTransactionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string().min(1),
  type: BonusTypeSchema,
  amount: z.number().positive(),
  status: FreePlayStatusSchema,
  issuedAt: z.string().datetime(),
  redeemedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime(),
  wageringRequirement: z.number().min(0),
  wageringCompleted: z.number().min(0),
  reference: z.string().optional(),
  notes: z.string().optional(),
  processedBy: z.string().optional(),
  redemptionAmount: z.number().min(0).optional(),
  remainingAmount: z.number().min(0).optional()
});

export const FreePlayBreakdownSchema = z.object({
  welcomeBonuses: z.number().min(0),
  depositMatchBonuses: z.number().min(0),
  freeBets: z.number().min(0),
  loyaltyRewards: z.number().min(0),
  referralBonuses: z.number().min(0),
  tournamentPrizes: z.number().min(0),
  specialPromotions: z.number().min(0)
});

export const FreePlayOverviewSchema = z.object({
  totalFreePlayIssued: z.number().min(0),
  totalFreePlayRedeemed: z.number().min(0),
  totalFreePlayExpired: z.number().min(0),
  remainingFreePlay: z.number().min(0),
  redemptionRate: z.number().min(0).max(100),
  averageBonusPerCustomer: z.number().min(0),
  period: z.string(),
  lastUpdated: z.string().datetime(),
  breakdown: FreePlayBreakdownSchema.optional(),
  customers: z.array(z.object({
    customerId: z.string(),
    customerName: z.string().min(1),
    totalFreePlay: z.number().min(0),
    redeemedFreePlay: z.number().min(0),
    availableFreePlay: z.number().min(0),
    expiredFreePlay: z.number().min(0),
    lastActivity: z.string().datetime(),
    vipLevel: z.string()
  })).optional(),
  recentTransactions: z.array(FreePlayTransactionSchema).optional()
});

export const GetFreePlayOverviewQuerySchema = z.object({
  period: z.enum(['current_month', 'last_month', 'current_year', 'last_year', 'custom']).default('current_month'),
  includeDetails: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

export const GetFreePlayHistoryQuerySchema = z.object({
  customerId: z.string().optional(),
  type: z.enum(['all', 'welcome_bonus', 'deposit_match', 'free_bet', 'loyalty', 'referral', 'tournament', 'promotion']).default('all'),
  status: z.enum(['all', 'available', 'redeemed', 'expired', 'cancelled']).default('all'),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional(),
  maxAmount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)).optional()
});

export const CreateFreePlayTransactionRequestSchema = z.object({
  customerId: z.string().min(1),
  type: BonusTypeSchema,
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  wageringRequirement: z.number().min(0).max(50).default(1),
  expiresInDays: z.number().int().min(1).max(365).default(30),
  reference: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  processedBy: z.string().min(1),
  customWageringRules: z.object({
    requirementType: WageringRequirementTypeSchema.optional(),
    gameTypes: z.array(z.string()).optional(),
    excludedGames: z.array(z.string()).optional(),
    maxWageringAmount: z.number().positive().optional()
  }).optional()
});

export const RedeemFreePlayTransactionRequestSchema = z.object({
  transactionId: z.string().min(1),
  customerId: z.string().min(1),
  redemptionAmount: z.number().positive(),
  wagerAmount: z.number().min(0).optional(),
  processedBy: z.string().min(1),
  notes: z.string().max(500).optional(),
  partialRedemption: z.boolean().default(false)
});

export const FreePlaySettingsSchema = z.object({
  bonusTypes: z.record(BonusTypeSchema, z.object({
    enabled: z.boolean(),
    maxAmount: z.number().min(0),
    defaultWageringReq: z.number().min(0).max(50),
    maxWageringReq: z.number().min(0).max(100),
    autoIssue: z.boolean(),
    requiresApproval: z.boolean(),
    targetAudience: z.array(z.string()).optional()
  })),
  expirationSettings: z.object({
    defaultExpirationDays: z.number().int().min(1).max(365),
    maxExpirationDays: z.number().int().min(1).max(730),
    autoExpire: z.boolean(),
    expirationWarningDays: z.number().int().min(1).max(30),
    gracePeriodDays: z.number().int().min(0).max(7)
  }),
  wageringRequirements: z.object({
    minRequirement: z.number().min(0).max(10),
    maxRequirement: z.number().min(0).max(100),
    progressiveRequirements: z.boolean(),
    requirementTypes: z.array(WageringRequirementTypeSchema),
    contributionLimits: z.record(z.string(), z.number().min(0).max(100))
  }),
  limits: z.object({
    maxBonusPerCustomer: z.number().min(0),
    maxBonusPerDay: z.number().min(0),
    maxBonusPerMonth: z.number().min(0),
    dailyCustomerLimit: z.number().min(0),
    maxActiveBonusesPerCustomer: z.number().int().min(1).max(20)
  }),
  complianceSettings: z.object({
    responsibleGamingChecks: z.boolean(),
    bonusAbuseDetection: z.boolean(),
    jurisdictionCompliance: z.boolean(),
    taxReporting: z.boolean(),
    identityVerification: z.boolean(),
    minimumAge: z.number().int().min(18).max(25),
    restrictedCountries: z.array(z.string()),
    restrictedGames: z.array(z.string())
  }),
  automationSettings: z.object({
    autoIssueWelcomeBonuses: z.boolean(),
    autoIssueDepositMatches: z.boolean(),
    autoIssueLoyaltyRewards: z.boolean(),
    autoExpireBonuses: z.boolean(),
    autoSendExpirationWarnings: z.boolean(),
    autoProcessRedemptions: z.boolean(),
    autoGenerateReports: z.boolean(),
    reportFrequency: z.enum(['daily', 'weekly', 'monthly'])
  }),
  notificationSettings: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    bonusReceived: z.boolean(),
    bonusExpiring: z.boolean(),
    bonusExpired: z.boolean(),
    bonusRedeemed: z.boolean(),
    wageringProgress: z.boolean()
  })
});

export const FreePlayAnalyticsSchema = z.object({
  period: z.string(),
  totalBonusValue: z.number().min(0),
  totalRedeemed: z.number().min(0),
  totalExpired: z.number().min(0),
  redemptionRate: z.number().min(0).max(100),
  averageBonusPerCustomer: z.number().min(0),
  topBonusTypes: z.array(z.object({
    type: BonusTypeSchema,
    totalValue: z.number().min(0),
    redemptionCount: z.number().int().min(0),
    redemptionRate: z.number().min(0).max(100),
    averageAmount: z.number().min(0)
  })),
  bonusTrends: z.array(z.object({
    period: z.string(),
    issued: z.number().min(0),
    redeemed: z.number().min(0),
    expired: z.number().min(0)
  })),
  customerSegments: z.record(z.string(), z.object({
    count: z.number().int().min(0),
    averageBonus: z.number().min(0),
    redemptionRate: z.number().min(0).max(100),
    totalValue: z.number().min(0)
  })),
  performanceMetrics: z.object({
    bonusEffectiveness: z.number(), // Revenue multiplier
    customerRetention: z.number().min(0).max(100), // Percentage
    averageSessionLength: z.number().min(0), // Minutes
    conversionRate: z.number().min(0).max(100), // Percentage
    customerSatisfaction: z.number().min(0).max(5), // Rating
    roi: z.number().min(0) // Return on investment
  }),
  gamePerformance: z.array(z.object({
    gameId: z.string(),
    gameName: z.string(),
    bonusUsage: z.number().min(0),
    redemptionRate: z.number().min(0).max(100),
    averageWager: z.number().min(0),
    contribution: z.number().min(0).max(100)
  }))
});

export const FreePlayReportSchema = z.object({
  reportType: z.enum(['summary', 'detailed', 'compliance', 'performance', 'tax']),
  period: z.string(),
  generatedAt: z.string().datetime(),
  generatedBy: z.string(),
  totalCustomers: z.number().int().min(0),
  totalBonusValue: z.number().min(0),
  totalRedeemed: z.number().min(0),
  totalExpired: z.number().min(0),
  redemptionRate: z.number().min(0).max(100),
  breakdown: FreePlayBreakdownSchema,
  topPerformingBonuses: z.array(z.object({
    type: BonusTypeSchema,
    totalValue: z.number().min(0),
    redemptionCount: z.number().int().min(0),
    redemptionRate: z.number().min(0).max(100)
  })),
  customerAnalysis: z.object({
    newCustomers: z.number().int().min(0),
    returningCustomers: z.number().int().min(0),
    vipCustomers: z.number().int().min(0),
    averageBonusPerNewCustomer: z.number().min(0),
    averageBonusPerReturningCustomer: z.number().min(0)
  }),
  expirationAnalysis: z.object({
    expiredThisPeriod: z.number().int().min(0),
    expiringSoon: z.number().int().min(0),
    expiredValue: z.number().min(0),
    expirationRate: z.number().min(0).max(100)
  }),
  complianceIssues: z.array(z.object({
    customerId: z.string(),
    issue: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    bonusType: BonusTypeSchema.optional(),
    amount: z.number().min(0),
    resolution: z.string().optional()
  })).optional(),
  recommendations: z.array(z.object({
    type: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    effort: z.enum(['low', 'medium', 'high'])
  })).optional()
});

// Response Schemas
export const FreePlayOverviewResponseSchema = z.object({
  success: z.literal(true),
  data: FreePlayOverviewSchema,
  metadata: z.object({
    period: z.string(),
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

export const FreePlayHistoryResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transactions: z.array(FreePlayTransactionSchema),
    summary: z.object({
      totalFreePlay: z.number().min(0),
      redeemedAmount: z.number().min(0),
      availableAmount: z.number().min(0),
      expiredAmount: z.number().min(0),
      totalRecords: z.number().int().min(0),
      byType: z.record(z.string(), z.number().min(0)),
      byStatus: z.record(z.string(), z.number().int().min(0))
    }),
    filters: z.object({
      customerId: z.string().nullable(),
      type: z.string(),
      status: z.string(),
      dateFrom: z.string().nullable(),
      dateTo: z.string().nullable(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1)
    }),
    pagination: LinesPaginationSchema
  }),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

export const CreateFreePlayTransactionResponseSchema = z.object({
  success: z.literal(true),
  data: FreePlayTransactionSchema,
  message: z.string()
});

export const RedeemFreePlayTransactionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transactionId: z.string(),
    customerId: z.string(),
    originalAmount: z.number(),
    redemptionAmount: z.number(),
    remainingAmount: z.number(),
    status: z.string(),
    redeemedAt: z.string().datetime(),
    processedBy: z.string(),
    reference: z.string()
  }),
  message: z.string()
});

export const FreePlaySettingsResponseSchema = z.object({
  success: z.literal(true),
  data: FreePlaySettingsSchema,
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    version: z.string()
  })
});

export const FreePlayAnalyticsResponseSchema = z.object({
  success: z.literal(true),
  data: FreePlayAnalyticsSchema,
  metadata: z.object({
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

export const FreePlayReportResponseSchema = z.object({
  success: z.literal(true),
  data: FreePlayReportSchema,
  metadata: z.object({
    generatedAt: z.string().datetime(),
    dataSource: z.string(),
    version: z.string()
  })
});

// Bonus Campaign Schemas
export const BonusCampaignSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  type: BonusTypeSchema,
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetAudience: z.object({
    customerSegments: z.array(z.string()),
    minDeposit: z.number().min(0).optional(),
    maxDeposit: z.number().min(0).optional(),
    vipLevels: z.array(z.string()).optional(),
    excludedCustomers: z.array(z.string()).optional()
  }),
  bonusRules: z.object({
    bonusAmount: z.number().positive(),
    bonusType: z.enum(['fixed', 'percentage', 'tiered']),
    maxBonusAmount: z.number().positive().optional(),
    wageringRequirement: z.number().min(0),
    expirationDays: z.number().int().min(1),
    autoIssue: z.boolean()
  }),
  performance: z.object({
    totalIssued: z.number().min(0),
    totalRedeemed: z.number().min(0),
    redemptionRate: z.number().min(0).max(100),
    costToCompany: z.number().min(0),
    roi: z.number().min(0)
  }).optional(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const CreateBonusCampaignRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: BonusTypeSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetAudience: z.object({
    customerSegments: z.array(z.string()),
    minDeposit: z.number().min(0).optional(),
    maxDeposit: z.number().min(0).optional(),
    vipLevels: z.array(z.string()).optional(),
    excludedCustomers: z.array(z.string()).optional()
  }),
  bonusRules: z.object({
    bonusAmount: z.number().positive(),
    bonusType: z.enum(['fixed', 'percentage', 'tiered']),
    maxBonusAmount: z.number().positive().optional(),
    wageringRequirement: z.number().min(0),
    expirationDays: z.number().int().min(1),
    autoIssue: z.boolean()
  }),
  createdBy: z.string().min(1)
});

/**
 * Transaction creation schema
 */
export const CreateTransactionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  type: TransactionTypeSchema,
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  method: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Transaction update schema
 */
export const UpdateTransactionSchema = z.object({
  status: TransactionStatusSchema.optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
  processingTime: z.string().optional(),
  fee: z.number().min(0).optional(),
  netAmount: z.number().positive().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Process deposit request schema
 */
export const ProcessDepositRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  method: z.enum(['bank_transfer', 'credit_card', 'crypto', 'cash', 'other']),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional()
});

// ============================================================================
// Financial Schemas
// ============================================================================

/**
 * Withdrawal request schema
 */
export const WithdrawalRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  method: z.enum(['bank_transfer', 'crypto', 'check', 'other']),
  accountDetails: z.object({
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    cryptoAddress: z.string().optional(),
    bankName: z.string().optional()
  }).optional(),
  notes: z.string().max(500).optional()
});

/**
 * Approve withdrawal request schema
 */
export const ApproveWithdrawalRequestSchema = z.object({
  withdrawalId: z.string().min(1, 'Withdrawal ID is required'),
  approverNotes: z.string().max(500).optional()
});

/**
 * Complete withdrawal request schema
 */
export const CompleteWithdrawalRequestSchema = z.object({
  withdrawalId: z.string().min(1, 'Withdrawal ID is required'),
  transactionHash: z.string().min(1, 'Transaction hash is required').optional(),
  completionNotes: z.string().max(500).optional()
});

/**
 * Reject withdrawal request schema
 */
export const RejectWithdrawalRequestSchema = z.object({
  withdrawalId: z.string().min(1, 'Withdrawal ID is required'),
  reason: z.string().min(1, 'Reason is required').max(500)
});

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Generic success response schema
 */
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.string().datetime().optional()
});

/**
 * Generic error response schema
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false).optional(),
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
  timestamp: z.string().datetime().optional()
});

/**
 * Login response schema
 */
export const LoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: z.object({
      id: z.string(),
      username: z.string(),
      role: z.string(),
      level: z.number().int().min(1).max(5),
      permissions: z.array(z.string())
    }),
    tokens: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      tokenType: z.literal('Bearer'),
      expiresIn: z.number().int()
    })
  }),
  message: z.string()
});

/**
 * Health check response schema
 */
export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  timestamp: z.string().datetime(),
  version: z.string().optional(),
  uptime: z.number().min(0).optional(),
  services: z.record(z.string()).optional(),
  performance: z.object({
    uptime: z.number().min(0),
    memory: z.any(),
    cpu: z.any()
  }).optional()
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Get schema for a specific endpoint
 */
export function getSchemaForEndpoint(endpoint: string, method: string = 'GET'): z.ZodType | null {
  const schemaMap: Record<string, z.ZodType> = {
    // Auth endpoints
    'POST:/api/auth/login': LoginRequestSchema,
    'POST:/api/auth/refresh': RefreshTokenRequestSchema,
    
    // Manager endpoints
    'POST:/api/manager/getLiveWagers': GetLiveWagersRequestSchema,
    'POST:/api/manager/getWeeklyFigureByAgent': GetWeeklyFiguresRequestSchema,
    'POST:/api/manager/getAgentPerformance': GetAgentPerformanceRequestSchema,
    'POST:/api/manager/getCustomerAdmin': GetCustomerAdminRequestSchema,
    'GET:/api/manager/getCustomerDetails': GetCustomerDetailsQuerySchema,
    
    // Admin endpoints
    'POST:/api/admin/settle-wager': SettleWagerRequestSchema,
    'POST:/api/admin/bulk-settle': BulkSettleRequestSchema,
    'POST:/api/admin/void-wager': VoidWagerRequestSchema,
    'POST:/api/admin/create-customer': CreateCustomerRequestSchema,
    'POST:/api/admin/process-deposit': ProcessDepositRequestSchema,
    
    // Financial endpoints
    'POST:/api/withdrawals/request': WithdrawalRequestSchema,
    'POST:/api/withdrawals/approve': ApproveWithdrawalRequestSchema,
    'POST:/api/withdrawals/complete': CompleteWithdrawalRequestSchema,
    'POST:/api/withdrawals/reject': RejectWithdrawalRequestSchema,
  };
  
  const key = `${method.toUpperCase()}:${endpoint}`;
  return schemaMap[key] || null;
}

/**
 * Validate request data for an endpoint
 */
export async function validateEndpointRequest(
  endpoint: string,
  method: string,
  data: any
): Promise<any> {
  const schema = getSchemaForEndpoint(endpoint, method);
  
  if (!schema) {
    return data; // No validation schema defined
  }
  
  return await schema.parseAsync(data);
}