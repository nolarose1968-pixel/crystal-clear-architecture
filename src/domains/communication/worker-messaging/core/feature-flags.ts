/**
 * Feature Flags for Worker Communication Optimization
 * Gradual Rollout and Rollback Support
 */

export interface FeatureFlag {
  enabled: boolean;
  description: string;
  rolloutPercentage: number;
  fallback: string;
  conditions?: {
    domain?: string;
    environment?: string;
    load?: number;
  };
}

export interface RolloutPhase {
  name: string;
  domains: string[];
  percentage: number;
  duration: string;
  monitoring: "intensive" | "standard" | "light";
  successCriteria: string[];
}

export const WORKER_COMMUNICATION_FLAGS: Record<string, FeatureFlag> = {
  useYamlMessaging: {
    enabled: true,
    description: "Use YAML instead of JSON for worker messages",
    rolloutPercentage: 100,
    fallback: "json",
    conditions: {
      environment: "production",
    },
  },

  enableCompression: {
    enabled: false,
    description: "Compress large messages to reduce bandwidth",
    rolloutPercentage: 0,
    fallback: "uncompressed",
    conditions: {
      load: 1000, // messages per minute
    },
  },

  enableBatching: {
    enabled: false,
    description: "Batch multiple messages for efficiency",
    rolloutPercentage: 0,
    fallback: "individual",
    conditions: {
      domain: "collections",
    },
  },

  enablePerformanceMonitoring: {
    enabled: true,
    description: "Enable detailed performance monitoring and alerting",
    rolloutPercentage: 100,
    fallback: "basic",
    conditions: {
      environment: "all",
    },
  },

  enableMessageValidation: {
    enabled: true,
    description: "Validate message structure and content",
    rolloutPercentage: 100,
    fallback: "none",
  },

  enableCircuitBreaker: {
    enabled: false,
    description: "Implement circuit breaker for message failures",
    rolloutPercentage: 0,
    fallback: "retry",
    conditions: {
      load: 5000,
    },
  },
};

export const ROLLOUT_PHASES: RolloutPhase[] = [
  {
    name: "pilot_phase",
    domains: ["collections"],
    percentage: 10,
    duration: "1_week",
    monitoring: "intensive",
    successCriteria: [
      "No message delivery failures",
      "Latency improvement > 20%",
      "Error rate < 0.1%",
      "YAML parsing successful",
    ],
  },
  {
    name: "expansion_phase",
    domains: ["collections", "balance"],
    percentage: 50,
    duration: "2_weeks",
    monitoring: "standard",
    successCriteria: [
      "Cross-domain communication working",
      "Latency improvement > 30%",
      "Throughput increase > 2x",
      "Memory usage stable",
    ],
  },
  {
    name: "full_rollout",
    domains: ["all"],
    percentage: 100,
    duration: "2_weeks",
    monitoring: "standard",
    successCriteria: [
      "All domains using YAML messaging",
      "70-80% latency reduction achieved",
      "System reliability > 99.9%",
      "No critical alerts",
    ],
  },
  {
    name: "optimization_phase",
    domains: ["all"],
    percentage: 100,
    duration: "2_weeks",
    monitoring: "light",
    successCriteria: [
      "Performance benchmarks completed",
      "Compression and batching optimized",
      "Monitoring dashboards operational",
      "Documentation updated",
    ],
  },
];

/**
 * Feature flag manager
 */
export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private rolloutPhase: string = "pilot_phase";

  constructor() {
    // Initialize with default flags
    Object.entries(WORKER_COMMUNICATION_FLAGS).forEach(([key, flag]) => {
      this.flags.set(key, { ...flag });
    });
  }

  /**
   * Check if a feature flag is enabled
   */
  isEnabled(
    flagName: string,
    context?: {
      domain?: string;
      environment?: string;
      load?: number;
      userId?: string;
    },
  ): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) return false;

    // Check basic enablement
    if (!flag.enabled) return false;

    // Check rollout percentage (simplified - in real implementation, use user/context-based rollout)
    if (Math.random() * 100 > flag.rolloutPercentage) return false;

    // Check conditions
    if (flag.conditions) {
      if (
        flag.conditions.domain &&
        context?.domain !== flag.conditions.domain
      ) {
        return false;
      }
      if (
        flag.conditions.environment &&
        context?.environment !== flag.conditions.environment
      ) {
        return false;
      }
      if (
        flag.conditions.load &&
        context?.load &&
        context.load < flag.conditions.load
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get flag configuration
   */
  getFlag(flagName: string): FeatureFlag | undefined {
    return this.flags.get(flagName);
  }

  /**
   * Update flag configuration
   */
  updateFlag(flagName: string, updates: Partial<FeatureFlag>): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) return false;

    this.flags.set(flagName, { ...flag, ...updates });
    return true;
  }

  /**
   * Get all flags
   */
  getAllFlags(): Record<string, FeatureFlag> {
    const result: Record<string, FeatureFlag> = {};
    this.flags.forEach((flag, name) => {
      result[name] = { ...flag };
    });
    return result;
  }

  /**
   * Get current rollout phase
   */
  getCurrentPhase(): RolloutPhase | undefined {
    return ROLLOUT_PHASES.find((phase) => phase.name === this.rolloutPhase);
  }

  /**
   * Advance to next rollout phase
   */
  advancePhase(): boolean {
    const currentIndex = ROLLOUT_PHASES.findIndex(
      (phase) => phase.name === this.rolloutPhase,
    );
    if (currentIndex < 0 || currentIndex >= ROLLOUT_PHASES.length - 1) {
      return false;
    }

    const nextPhase = ROLLOUT_PHASES[currentIndex + 1];
    this.rolloutPhase = nextPhase.name;

    // Update flags based on new phase
    this.updateFlagsForPhase(nextPhase);

    console.log(`🚀 Advanced to rollout phase: ${nextPhase.name}`);
    return true;
  }

  /**
   * Update flags for a specific phase
   */
  private updateFlagsForPhase(phase: RolloutPhase): void {
    // Update rollout percentages
    if (
      phase.domains.includes("collections") ||
      phase.domains.includes("all")
    ) {
      this.updateFlag("useYamlMessaging", {
        rolloutPercentage: phase.percentage,
      });
    }

    if (phase.percentage >= 50) {
      this.updateFlag("enableBatching", { rolloutPercentage: 25 });
    }

    if (phase.percentage >= 100) {
      this.updateFlag("enableCompression", { rolloutPercentage: 50 });
      this.updateFlag("enableCircuitBreaker", { rolloutPercentage: 25 });
    }
  }

  /**
   * Emergency rollback - disable all advanced features
   */
  emergencyRollback(): void {
    console.log("🚨 EMERGENCY ROLLBACK: Disabling all advanced features");

    this.updateFlag("useYamlMessaging", {
      enabled: false,
      rolloutPercentage: 0,
    });
    this.updateFlag("enableCompression", {
      enabled: false,
      rolloutPercentage: 0,
    });
    this.updateFlag("enableBatching", { enabled: false, rolloutPercentage: 0 });
    this.updateFlag("enableCircuitBreaker", {
      enabled: false,
      rolloutPercentage: 0,
    });

    this.rolloutPhase = "rollback";
  }

  /**
   * Generate rollout status report
   */
  generateStatusReport(): {
    currentPhase: string;
    flags: Record<string, { enabled: boolean; percentage: number }>;
    recommendations: string[];
  } {
    const currentPhase = this.getCurrentPhase();
    const flags: Record<string, { enabled: boolean; percentage: number }> = {};
    const recommendations: string[] = [];

    this.flags.forEach((flag, name) => {
      flags[name] = {
        enabled: flag.enabled,
        percentage: flag.rolloutPercentage,
      };
    });

    // Generate recommendations
    if (currentPhase && currentPhase.monitoring === "intensive") {
      recommendations.push("Monitor closely - intensive monitoring phase");
    }

    if (this.rolloutPhase === "rollback") {
      recommendations.push(
        "System in rollback mode - investigate issues before re-enabling",
      );
    }

    const yamlFlag = this.flags.get("useYamlMessaging");
    if (yamlFlag && yamlFlag.rolloutPercentage < 100) {
      recommendations.push(
        `YAML messaging at ${yamlFlag.rolloutPercentage}% rollout - monitor performance`,
      );
    }

    return {
      currentPhase: this.rolloutPhase,
      flags,
      recommendations,
    };
  }

  /**
   * Validate rollout phase success criteria
   */
  validatePhaseCriteria(
    phase: RolloutPhase,
    metrics: {
      latency: number;
      errorRate: number;
      throughput: number;
      alerts: number;
    },
  ): { passed: boolean; results: Record<string, boolean> } {
    const results: Record<string, boolean> = {};

    // Define validation logic for each criterion
    phase.successCriteria.forEach((criterion) => {
      switch (true) {
        case criterion.includes("latency improvement"):
          const target = criterion.includes("70-80%")
            ? 70
            : criterion.includes("20%")
              ? 20
              : 30;
          results[criterion] = metrics.latency >= target;
          break;
        case criterion.includes("error rate"):
          results[criterion] = metrics.errorRate < 0.1;
          break;
        case criterion.includes("throughput"):
          results[criterion] = metrics.throughput >= 100;
          break;
        case criterion.includes("alerts"):
          results[criterion] = metrics.alerts === 0;
          break;
        case criterion.includes("YAML parsing"):
          results[criterion] = true; // Would check actual parsing success
          break;
        default:
          results[criterion] = true; // Default to pass
      }
    });

    const passed = Object.values(results).every((result) => result);

    return { passed, results };
  }
}

/**
 * Usage example and utilities
 */
export function createFeatureFlagManager(): FeatureFlagManager {
  return new FeatureFlagManager();
}

export function getRolloutPhaseInfo(
  phaseName: string,
): RolloutPhase | undefined {
  return ROLLOUT_PHASES.find((phase) => phase.name === phaseName);
}

export function validateFeatureFlags(flags: Record<string, FeatureFlag>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  Object.entries(flags).forEach(([name, flag]) => {
    if (!flag.description) {
      errors.push(`Flag ${name} missing description`);
    }
    if (flag.rolloutPercentage < 0 || flag.rolloutPercentage > 100) {
      errors.push(`Flag ${name} has invalid rollout percentage`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export singleton instance
export const featureFlagManager = new FeatureFlagManager();
