/**
 * Event-Driven Communication Example
 * Domain-Driven Design Implementation
 *
 * Complete example showing how domains communicate through events
 */

import {
  DomainOrchestrator,
  EventWorkflows,
  DomainEvents,
  BalanceController,
  CollectionsController,
  Fantasy402Gateway,
  FantasySportEvent,
} from "./shared/index";

// Mock implementations for demonstration
class MockBalanceController {
  async processBalanceChange(params: any) {
    console.log("💰 Processing balance change:", params);
    return { success: true, balance: { currentBalance: 1000 - params.amount } };
  }

  async getBalanceStatus(customerId: string) {
    console.log("📊 Getting balance status for:", customerId);
    return {
      success: true,
      balance: {
        getCurrentBalance: () => 1000,
        getIsActive: () => true,
      },
    };
  }

  async createBalance(params: any) {
    console.log("🏦 Creating balance account:", params);
    return { success: true };
  }
}

class MockCollectionsController {
  async processPayment(params: any) {
    console.log("💳 Processing payment:", params);
    return {
      success: true,
      paymentId: `payment_${Date.now()}`,
      amount: params.amount,
      playerId: params.playerId,
    };
  }
}

class MockFantasyGateway {
  async placeBet(params: any) {
    console.log("🎯 Placing bet:", params);
    return {
      getExternalId: () => `bet_${Date.now()}`,
      getAmount: () => params.amount,
    };
  }

  async getAgentAccount(agentId: string) {
    console.log("👤 Getting agent account:", agentId);
    return {
      getCurrentBalance: () => ({ getAmount: () => 5000 }),
    };
  }
}

/**
 * Complete Event-Driven Communication Demonstration
 */
async function demonstrateEventDrivenCommunication() {
  console.log("🎯 === EVENT-DRIVEN COMMUNICATION DEMONSTRATION ===\n");

  // Initialize components
  const balanceController = new MockBalanceController() as any;
  const collectionsController = new MockCollectionsController() as any;
  const fantasyGateway = new MockFantasyGateway() as any;

  const orchestrator = new DomainOrchestrator(
    balanceController,
    collectionsController,
    fantasyGateway,
  );

  const workflows = new EventWorkflows(
    orchestrator,
    balanceController,
    collectionsController,
    fantasyGateway,
  );

  console.log("✅ Components initialized\n");

  // Setup event listeners to demonstrate communication
  setupEventListeners();

  // === DEMONSTRATION SCENARIOS ===

  console.log("📋 === SCENARIO 1: Customer Deposit Process ===");
  try {
    const depositResult = await orchestrator.processCustomerDeposit({
      customerId: "customer_123",
      amount: 250,
      paymentMethod: "credit_card",
      metadata: { source: "web_app" },
    });

    console.log("✅ Deposit completed:", {
      processId: depositResult.processId,
      success: depositResult.success,
      duration: `${depositResult.duration}ms`,
      steps: depositResult.steps.length,
    });
  } catch (error) {
    console.error(
      "❌ Deposit failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  console.log("\n📋 === SCENARIO 2: Agent Bet Placement ===");
  try {
    const betResult = await orchestrator.processAgentBetPlacement({
      agentId: "agent_456",
      eventId: "event_789",
      betType: "moneyline",
      amount: 100,
      odds: 150,
      selection: "home",
    });

    console.log("✅ Bet placement completed:", {
      processId: betResult.processId,
      success: betResult.success,
      duration: `${betResult.duration}ms`,
    });
  } catch (error) {
    console.error(
      "❌ Bet placement failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  console.log("\n📋 === SCENARIO 3: Customer Onboarding ===");
  try {
    const onboardingResult = await orchestrator.processCustomerOnboarding({
      customerId: "new_customer_001",
      agentId: "agent_456",
      initialDeposit: 100,
      customerData: {
        email: "customer@example.com",
        name: "John Doe",
      },
    });

    console.log("✅ Onboarding completed:", {
      processId: onboardingResult.processId,
      success: onboardingResult.success,
      duration: `${onboardingResult.duration}ms`,
    });
  } catch (error) {
    console.error(
      "❌ Onboarding failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  console.log("\n📋 === SCENARIO 4: Workflow Triggers ===");

  // Trigger bonus workflow
  console.log("🎁 Triggering bonus workflow...");
  await DomainEvents.getInstance().publish("bonus.eligibility_checked", {
    customerId: "customer_123",
    paymentAmount: 250,
    eligible: true,
  });

  // Trigger high-value bet workflow
  console.log("🎲 Triggering high-value bet workflow...");
  await DomainEvents.getInstance().publish("bet.high_value_detected", {
    betId: "bet_999",
    agentId: "agent_456",
    amount: 2000,
    eventId: "event_789",
  });

  // Trigger balance sync workflow
  console.log("🔄 Triggering balance sync workflow...");
  await DomainEvents.getInstance().publish("balance.sync_required", {
    agentId: "agent_456",
  });

  // Wait a moment for async processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("\n📊 === WORKFLOW STATISTICS ===");
  const workflowStats = workflows.getStats();
  console.log("Available workflows:", workflows.getAvailableWorkflows().length);
  console.log("Active workflows:", workflowStats.activeWorkflows);
  console.log("Completed workflows:", workflowStats.completedWorkflows);
  console.log("Failed workflows:", workflowStats.failedWorkflows);

  console.log("\n📈 === ORCHESTRATOR STATISTICS ===");
  const orchestratorStats = orchestrator.getStats();
  console.log("Active processes:", orchestratorStats.activeProcesses);
  console.log("Completed processes:", orchestratorStats.completedProcesses);
  console.log("Failed processes:", orchestratorStats.failedProcesses);
  console.log(
    "Average duration:",
    `${orchestratorStats.averageDuration.toFixed(2)}ms`,
  );

  console.log(
    "\n🎉 === EVENT-DRIVEN COMMUNICATION DEMONSTRATION COMPLETED ===",
  );
}

/**
 * Setup event listeners to demonstrate domain communication
 */
function setupEventListeners() {
  const events = DomainEvents.getInstance();

  console.log("🔧 Setting up event listeners...\n");

  // Collections Domain Events
  events.subscribe("payment.processed", async (event) => {
    console.log("🔗 [COLLECTIONS → BALANCE] Payment processed event received");
    console.log("   → Updating customer balance automatically");
  });

  events.subscribe("payment.failed", async (event) => {
    console.log("🔗 [COLLECTIONS → AUDIT] Payment failed event received");
    console.log("   → Logging failure for audit trail");
  });

  // Balance Domain Events
  events.subscribe("balance.threshold.exceeded", async (event) => {
    console.log("🔗 [BALANCE → NOTIFICATIONS] Low balance alert triggered");
    console.log("   → Sending balance warning notification");
  });

  events.subscribe("balance.frozen", async (event) => {
    console.log("🔗 [BALANCE → NOTIFICATIONS] Account frozen event received");
    console.log("   → Notifying relevant parties");
  });

  // External Integration Events
  events.subscribe("external.sport_event.live", async (event) => {
    console.log("🔗 [EXTERNAL → INTERNAL] Live sport event detected");
    console.log("   → Updating internal event tracking");
  });

  events.subscribe("external.bet.received", async (event) => {
    console.log("🔗 [EXTERNAL → INTERNAL] External bet received");
    console.log("   → Recording bet in internal system");
  });

  events.subscribe("external.agent.balance_updated", async (event) => {
    console.log("🔗 [EXTERNAL → BALANCE] Agent balance updated externally");
    console.log("   → Syncing with internal balance system");
  });

  // Workflow Events
  events.subscribe("bonus.eligibility_checked", async (event) => {
    console.log("🔗 [WORKFLOW] Bonus eligibility checked");
    console.log(
      `   → Customer ${event.payload.customerId} eligible: ${event.payload.eligible}`,
    );
  });

  events.subscribe("bonus.awarded", async (event) => {
    console.log("🔗 [WORKFLOW] Bonus awarded");
    console.log(
      `   → $${event.payload.bonusAmount} bonus credited to ${event.payload.customerId}`,
    );
  });

  events.subscribe("approval.required", async (event) => {
    console.log("🔗 [WORKFLOW] Approval required for high-value transaction");
    console.log(`   → Bet $${event.payload.amount} needs approval`);
  });

  events.subscribe("balance.discrepancy_detected", async (event) => {
    console.log("🔗 [WORKFLOW] Balance discrepancy detected");
    console.log(
      `   → Difference: $${event.payload.difference} for agent ${event.payload.agentId}`,
    );
  });

  // Audit Events
  events.subscribe("audit.payment_failure_logged", async (event) => {
    console.log("🔗 [AUDIT] Payment failure logged");
    console.log("   → Failure recorded in audit system");
  });

  events.subscribe("audit.bet_placed", async (event) => {
    console.log("🔗 [AUDIT] Bet placement logged");
    console.log(`   → Bet ${event.payload.betId} recorded for audit`);
  });

  console.log("✅ Event listeners configured\n");
}

/**
 * Demonstrate domain isolation and communication benefits
 */
function demonstrateDomainBenefits() {
  console.log("🎯 === DOMAIN-DRIVEN ARCHITECTURE BENEFITS ===\n");

  console.log("✅ DOMAIN ISOLATION:");
  console.log("   • Balance domain handles only balance operations");
  console.log("   • Collections domain handles only payment processing");
  console.log("   • External integrations isolated from internal logic");
  console.log("   • Changes in one domain don't affect others\n");

  console.log("✅ EVENT-DRIVEN COMMUNICATION:");
  console.log("   • Domains communicate through events, not direct calls");
  console.log("   • Loose coupling between domains");
  console.log("   • Asynchronous processing capabilities");
  console.log("   • Easy to add new domain integrations\n");

  console.log("✅ BUSINESS PROCESS ORCHESTRATION:");
  console.log("   • Complex processes span multiple domains");
  console.log("   • Each step tracked and auditable");
  console.log("   • Automatic error handling and compensation");
  console.log("   • Process monitoring and analytics\n");

  console.log("✅ EXTERNAL SYSTEM INTEGRATION:");
  console.log("   • Anti-corruption layer prevents external coupling");
  console.log("   • External events mapped to internal events");
  console.log("   • System resilience through adapters");
  console.log("   • Easy to switch external providers\n");

  console.log("✅ WORKFLOW AUTOMATION:");
  console.log("   • Complex business rules automated");
  console.log("   • Conditional processing based on events");
  console.log("   • Human-in-the-loop processes supported");
  console.log("   • Process metrics and monitoring\n");
}

// Run the demonstration
if (import.meta.main) {
  demonstrateEventDrivenCommunication()
    .then(() => {
      demonstrateDomainBenefits();
      console.log(
        "\n🎉 Event-driven communication demonstration completed successfully!",
      );
    })
    .catch((error) => {
      console.error("❌ Demonstration failed:", error);
    });
}

export {
  demonstrateEventDrivenCommunication,
  setupEventListeners,
  demonstrateDomainBenefits,
};
