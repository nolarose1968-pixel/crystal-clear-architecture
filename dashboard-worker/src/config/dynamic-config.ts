/**
 * 🔥 Fire22 Dynamic Configuration System
 * Fully configurable rates, limits, and fees - nothing hardcoded
 */

// Configuration Structure Types
export interface DynamicFeeConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;

  // Base Configuration
  basePercentage: number; // e.g., 2.5% = 0.025
  fixedFeePerUnit: number; // e.g., $5 per $1000 = 5
  unitSize: number; // e.g., 1000 (for per-$1000 calculation)

  // Conditions
  minAmount?: number; // Apply only above this amount
  maxAmount?: number; // Apply only below this amount
  customerTypes?: string[]; // Apply only to these customer types
  paymentMethods?: string[]; // Apply only to these payment methods
  transactionTypes?: string[]; // deposit, withdrawal, p2p_transfer

  // Time-based conditions
  timeOfDayStart?: string; // "09:00" - apply only during certain hours
  timeOfDayEnd?: string; // "17:00"
  daysOfWeek?: number[]; // [1,2,3,4,5] - Monday to Friday

  // Dynamic scaling
  volumeTiers?: VolumeTier[]; // Different rates based on volume

  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface VolumeTier {
  minAmount: number;
  maxAmount?: number;
  percentageOverride?: number; // Override base percentage for this tier
  fixedFeeOverride?: number; // Override fixed fee for this tier
  description: string;
}

export interface CustomerLimitConfig {
  id: string;
  customerType: string;

  // Transaction Limits
  maxDailyDeposit: number;
  maxDailyWithdrawal: number;
  maxSingleTransaction: number;
  maxPendingTransactions: number;

  // Commission Settings
  baseCommissionRate: number;
  commissionBoostPerTier: number;
  maxCommissionRate: number;

  // Approval Settings
  autoApprovalLimit: number;
  managerApprovalRequired: boolean;
  verificationRequired: boolean;

  // Risk Settings
  enhancedMonitoringRequired: boolean;
  suspendAfterFailedAttempts: number;

  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodConfig {
  id: string;
  code: string;
  name: string;

  // Processing Settings
  minAmount: number;
  maxAmount: number;
  processingTimeMinutes: number;
  currency: string;

  // Fee Structure (can be overridden by dynamic fees)
  baseCommissionRate: number;
  processingFee: number;

  // Availability
  isActive: boolean;
  availableForDeposits: boolean;
  availableForWithdrawals: boolean;
  availableForP2P: boolean;

  // Restrictions
  restrictedCustomerTypes?: string[];
  requiresVerification: boolean;

  // UI Settings
  icon: string;
  color: string;
  displayOrder: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array';
  category: string;
  description: string;

  // Validation
  minValue?: number;
  maxValue?: number;
  allowedValues?: any[];
  validationRegex?: string;

  // Security
  isPublic: boolean; // Can be read by frontend
  requiresRestart: boolean; // Requires app restart to take effect

  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dynamic Configuration Manager
export class DynamicConfigManager {
  private static instance: DynamicConfigManager;
  private feeConfigs: Map<string, DynamicFeeConfig> = new Map();
  private limitConfigs: Map<string, CustomerLimitConfig> = new Map();
  private paymentConfigs: Map<string, PaymentMethodConfig> = new Map();
  private systemConfigs: Map<string, SystemConfig> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
  }

  public static getInstance(): DynamicConfigManager {
    if (!DynamicConfigManager.instance) {
      DynamicConfigManager.instance = new DynamicConfigManager();
    }
    return DynamicConfigManager.instance;
  }

  /**
   * Calculate total fee for a transaction with dynamic configuration
   */
  public calculateTransactionFee(params: {
    amount: number;
    customerType: string;
    paymentMethod: string;
    transactionType: 'deposit' | 'withdrawal' | 'p2p_transfer';
    timestamp?: Date;
    customerVolume?: number;
  }): {
    totalFee: number;
    breakdown: FeeBreakdown[];
    netAmount: number;
    appliedConfigs: string[];
  } {
    const breakdown: FeeBreakdown[] = [];
    const appliedConfigs: string[] = [];
    let totalFee = 0;

    const timestamp = params.timestamp || new Date();

    // Get all applicable fee configurations
    const applicableFees = this.getApplicableFeeConfigs(params, timestamp);

    for (const feeConfig of applicableFees) {
      const fee = this.calculateSingleFee(params.amount, feeConfig, params.customerVolume);

      if (fee.amount > 0) {
        totalFee += fee.amount;
        breakdown.push({
          configId: feeConfig.id,
          configName: feeConfig.name,
          basePercentage: fee.appliedPercentage,
          fixedFee: fee.appliedFixedFee,
          amount: fee.amount,
          calculation: fee.calculation,
        });
        appliedConfigs.push(feeConfig.id);
      }
    }

    return {
      totalFee,
      breakdown,
      netAmount: params.amount - totalFee,
      appliedConfigs,
    };
  }

  /**
   * Calculate fee for your specific example: 2.5% + $5 per $1000
   */
  private calculateSingleFee(
    amount: number,
    config: DynamicFeeConfig,
    customerVolume?: number
  ): {
    amount: number;
    appliedPercentage: number;
    appliedFixedFee: number;
    calculation: string;
  } {
    let appliedPercentage = config.basePercentage;
    let appliedFixedFee = config.fixedFeePerUnit;

    // Check for volume tier overrides
    if (config.volumeTiers && customerVolume !== undefined) {
      for (const tier of config.volumeTiers) {
        if (
          customerVolume >= tier.minAmount &&
          (tier.maxAmount === undefined || customerVolume <= tier.maxAmount)
        ) {
          appliedPercentage = tier.percentageOverride ?? appliedPercentage;
          appliedFixedFee = tier.fixedFeeOverride ?? appliedFixedFee;
          break;
        }
      }
    }

    // Calculate percentage fee
    const percentageFee = amount * appliedPercentage;

    // Calculate fixed fee per unit (e.g., $5 per $1000)
    const units = Math.ceil(amount / config.unitSize);
    const fixedFee = units * appliedFixedFee;

    const totalFee = percentageFee + fixedFee;

    const calculation = `(${amount} × ${(appliedPercentage * 100).toFixed(2)}%) + (${units} units × $${appliedFixedFee}) = $${percentageFee.toFixed(2)} + $${fixedFee.toFixed(2)} = $${totalFee.toFixed(2)}`;

    return {
      amount: totalFee,
      appliedPercentage,
      appliedFixedFee,
      calculation,
    };
  }

  /**
   * Get applicable fee configurations based on conditions
   */
  private getApplicableFeeConfigs(
    params: {
      amount: number;
      customerType: string;
      paymentMethod: string;
      transactionType: string;
    },
    timestamp: Date
  ): DynamicFeeConfig[] {
    const applicable: DynamicFeeConfig[] = [];

    for (const config of this.feeConfigs.values()) {
      if (!config.enabled) continue;

      // Check amount range
      if (config.minAmount !== undefined && params.amount < config.minAmount) continue;
      if (config.maxAmount !== undefined && params.amount > config.maxAmount) continue;

      // Check customer type
      if (config.customerTypes && !config.customerTypes.includes(params.customerType)) continue;

      // Check payment method
      if (config.paymentMethods && !config.paymentMethods.includes(params.paymentMethod)) continue;

      // Check transaction type
      if (config.transactionTypes && !config.transactionTypes.includes(params.transactionType))
        continue;

      // Check time of day
      if (config.timeOfDayStart && config.timeOfDayEnd) {
        const currentTime = timestamp.toTimeString().substring(0, 5);
        if (currentTime < config.timeOfDayStart || currentTime > config.timeOfDayEnd) continue;
      }

      // Check days of week
      if (config.daysOfWeek && !config.daysOfWeek.includes(timestamp.getDay())) continue;

      applicable.push(config);
    }

    return applicable;
  }

  /**
   * Create or update a fee configuration
   */
  public setFeeConfig(config: Partial<DynamicFeeConfig> & { id: string }): DynamicFeeConfig {
    const existing = this.feeConfigs.get(config.id);

    const newConfig: DynamicFeeConfig = {
      ...existing,
      ...config,
      version: (existing?.version || 0) + 1,
      updatedAt: new Date(),
    } as DynamicFeeConfig;

    this.feeConfigs.set(config.id, newConfig);

    // Persist to database
    this.persistFeeConfig(newConfig);

    return newConfig;
  }

  /**
   * Get customer limits dynamically
   */
  public getCustomerLimits(customerType: string): CustomerLimitConfig | null {
    return this.limitConfigs.get(customerType) || null;
  }

  /**
   * Get payment method configuration
   */
  public getPaymentMethodConfig(paymentMethod: string): PaymentMethodConfig | null {
    return this.paymentConfigs.get(paymentMethod) || null;
  }

  /**
   * Get system configuration value
   */
  public getSystemConfig<T = any>(key: string, defaultValue?: T): T {
    const config = this.systemConfigs.get(key);
    return config ? config.value : defaultValue;
  }

  /**
   * Set system configuration value
   */
  public setSystemConfig(key: string, value: any, updatedBy: string): void {
    const existing = this.systemConfigs.get(key);

    const config: SystemConfig = {
      ...existing,
      id: existing?.id || this.generateId(),
      key,
      value,
      updatedBy,
      updatedAt: new Date(),
    } as SystemConfig;

    this.systemConfigs.set(key, config);
    this.persistSystemConfig(config);
  }

  /**
   * Initialize with example configurations
   */
  private initializeDefaultConfigs(): void {
    // Example: Your specific fee structure (2.5% + $5 per $1000)
    this.setFeeConfig({
      id: 'standard_p2p_fee',
      name: 'Standard P2P Transfer Fee',
      description: '2.5% base rate plus $5 per $1000 transferred',
      enabled: true,
      basePercentage: 0.025, // 2.5%
      fixedFeePerUnit: 5, // $5
      unitSize: 1000, // per $1000
      minAmount: 100, // Only apply to transfers $100+
      transactionTypes: ['p2p_transfer'],
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    // Example: VIP customer reduced fees
    this.setFeeConfig({
      id: 'vip_discount_fee',
      name: 'VIP Customer Discount',
      description: 'Reduced rates for VIP customers: 1.5% + $3 per $1000',
      enabled: true,
      basePercentage: 0.015, // 1.5%
      fixedFeePerUnit: 3, // $3
      unitSize: 1000, // per $1000
      customerTypes: ['vip'],
      transactionTypes: ['p2p_transfer', 'deposit', 'withdrawal'],
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    // Example: High-risk customer penalty fees
    this.setFeeConfig({
      id: 'risk_penalty_fee',
      name: 'High Risk Penalty Fee',
      description: 'Additional fees for risky customers: +1% penalty',
      enabled: true,
      basePercentage: 0.01, // Additional 1%
      fixedFeePerUnit: 0, // No additional fixed fee
      unitSize: 1,
      customerTypes: ['risky'],
      transactionTypes: ['deposit', 'withdrawal'],
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    // Example: Weekend processing fee
    this.setFeeConfig({
      id: 'weekend_processing_fee',
      name: 'Weekend Processing Fee',
      description: 'Additional $10 fee for weekend transactions',
      enabled: true,
      basePercentage: 0, // No percentage
      fixedFeePerUnit: 10, // $10 flat fee
      unitSize: 1, // Per transaction
      daysOfWeek: [0, 6], // Saturday and Sunday
      transactionTypes: ['deposit', 'withdrawal'],
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    // Initialize system configs
    this.setSystemConfig('MAX_DAILY_DEPOSIT', 50000, 'system');
    this.setSystemConfig('MAX_DAILY_WITHDRAWAL', 25000, 'system');
    this.setSystemConfig('P2P_MATCH_TIMEOUT_MINUTES', 15, 'system');
    this.setSystemConfig('COMMISSION_RATE_MULTIPLIER', 1.0, 'system');
  }

  private persistFeeConfig(config: DynamicFeeConfig): void {
    // In real implementation, save to database
    console.log(`Persisting fee config: ${config.id}`);
  }

  private persistSystemConfig(config: SystemConfig): void {
    // In real implementation, save to database
    console.log(`Persisting system config: ${config.key} = ${config.value}`);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export interface FeeBreakdown {
  configId: string;
  configName: string;
  basePercentage: number;
  fixedFee: number;
  amount: number;
  calculation: string;
}

// Example usage functions
export class ConfigurableFeeService {
  private configManager = DynamicConfigManager.getInstance();

  /**
   * Example: Calculate fee for $3000 P2P transfer
   */
  public calculateP2PTransferFee(
    amount: number,
    customerType: string = 'standard',
    paymentMethod: string = 'bank_transfer'
  ) {
    return this.configManager.calculateTransactionFee({
      amount,
      customerType,
      paymentMethod,
      transactionType: 'p2p_transfer',
    });
  }

  /**
   * Create a new fee configuration via API
   */
  public createFeeConfiguration(
    name: string,
    description: string,
    basePercentage: number,
    fixedFeePerUnit: number,
    unitSize: number = 1000,
    conditions: Partial<DynamicFeeConfig> = {}
  ): DynamicFeeConfig {
    const id = `fee_${Date.now()}`;

    return this.configManager.setFeeConfig({
      id,
      name,
      description,
      enabled: true,
      basePercentage,
      fixedFeePerUnit,
      unitSize,
      createdBy: 'api',
      updatedBy: 'api',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...conditions,
    });
  }

  /**
   * Update existing fee configuration
   */
  public updateFeeConfiguration(
    id: string,
    updates: Partial<DynamicFeeConfig>,
    updatedBy: string = 'api'
  ): DynamicFeeConfig {
    return this.configManager.setFeeConfig({
      id,
      ...updates,
      updatedBy,
      updatedAt: new Date(),
    });
  }
}
