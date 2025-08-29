#!/usr/bin/env bun

/**
 * 🌊 Water System Integration Script
 * Provides utilities to integrate water system displays into existing terminal dashboards
 */

class WaterSystemIntegrator {
  constructor() {
    this.metrics = {
      flowRate: 85,
      temperature: 22,
      pressure: 120,
    };

    this.updateInterval = null;
    this.isMonitoring = false;
  }

  /**
   * Get current water system metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Update metrics with new values
   */
  updateMetrics(newMetrics) {
    this.metrics = { ...this.metrics, ...newMetrics };
    return this.metrics;
  }

  /**
   * Simulate real-time metric updates
   */
  simulateUpdates() {
    this.metrics.flowRate = Math.max(
      50,
      Math.min(120, this.metrics.flowRate + (Math.random() - 0.5) * 10),
    );
    this.metrics.temperature = Math.max(
      18,
      Math.min(26, this.metrics.temperature + (Math.random() - 0.5) * 2),
    );
    this.metrics.pressure = Math.max(
      100,
      Math.min(140, this.metrics.pressure + (Math.random() - 0.5) * 10),
    );

    return this.metrics;
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(intervalMs = 5000, callback = null) {
    if (this.isMonitoring) {
      console.log("🌊 Water system monitoring already active");
      return;
    }

    this.isMonitoring = true;
    console.log(
      `🌊 Starting water system monitoring (${intervalMs}ms intervals)`,
    );

    this.updateInterval = setInterval(() => {
      const updatedMetrics = this.simulateUpdates();
      if (callback && typeof callback === "function") {
        callback(updatedMetrics);
      }
    }, intervalMs);

    return this.updateInterval;
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.isMonitoring = false;
      console.log("🌊 Water system monitoring stopped");
    }
  }

  /**
   * Generate water system display string
   */
  generateDisplay(format = "box") {
    switch (format) {
      case "box":
        return this.generateBoxDisplay();
      case "simple":
        return this.generateSimpleDisplay();
      case "json":
        return JSON.stringify(this.metrics, null, 2);
      default:
        return this.generateBoxDisplay();
    }
  }

  /**
   * Generate box-style display (like the user's original)
   */
  generateBoxDisplay() {
    const width = 50;
    const title = "WATER SYSTEM";
    const titleStr = ` ${title} `;
    const titlePadding = width - titleStr.length - 2;
    const leftPad = Math.floor(titlePadding / 2);
    const rightPad = Math.ceil(titlePadding / 2);

    let display = [];

    // Top line with title
    display.push(
      "╭" + "─".repeat(leftPad) + titleStr + "─".repeat(rightPad) + "╮",
    );

    // Content lines
    display.push(
      `│  🌊 Flow Rate: ${this.metrics.flowRate} L/min                          │`,
    );
    display.push(
      `│  🌡️ Temperature: ${this.metrics.temperature}°C                            │`,
    );
    display.push(
      `│  📊 Pressure: ${this.metrics.pressure} PSI                            │`,
    );

    // Bottom line
    display.push("╰" + "─".repeat(width - 2) + "╯");

    return display.join("\n");
  }

  /**
   * Generate simple display without box characters
   */
  generateSimpleDisplay() {
    return [
      `🌊 Flow Rate: ${this.metrics.flowRate} L/min`,
      `🌡️ Temperature: ${this.metrics.temperature}°C`,
      `📊 Pressure: ${this.metrics.pressure} PSI`,
    ].join("\n");
  }

  /**
   * Get system status summary
   */
  getStatusSummary() {
    const flowStatus =
      this.metrics.flowRate > 80
        ? "HIGH"
        : this.metrics.flowRate < 30
          ? "LOW"
          : "NORMAL";
    const tempStatus =
      this.metrics.temperature > 24
        ? "WARM"
        : this.metrics.temperature < 20
          ? "COOL"
          : "NORMAL";
    const pressureStatus =
      this.metrics.pressure > 130
        ? "HIGH"
        : this.metrics.pressure < 110
          ? "LOW"
          : "NORMAL";

    return {
      flow: { value: this.metrics.flowRate, unit: "L/min", status: flowStatus },
      temperature: {
        value: this.metrics.temperature,
        unit: "°C",
        status: tempStatus,
      },
      pressure: {
        value: this.metrics.pressure,
        unit: "PSI",
        status: pressureStatus,
      },
      overall:
        flowStatus === "NORMAL" &&
        tempStatus === "NORMAL" &&
        pressureStatus === "NORMAL"
          ? "HEALTHY"
          : "ATTENTION",
    };
  }

  /**
   * Export integration data for other systems
   */
  exportForIntegration() {
    return {
      metrics: this.getMetrics(),
      status: this.getStatusSummary(),
      display: {
        box: this.generateBoxDisplay(),
        simple: this.generateSimpleDisplay(),
        json: this.generateDisplay("json"),
      },
      controls: {
        startMonitoring: this.startMonitoring.bind(this),
        stopMonitoring: this.stopMonitoring.bind(this),
        updateMetrics: this.updateMetrics.bind(this),
      },
    };
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = WaterSystemIntegrator;
}

// CLI usage
if (import.meta.main) {
  const integrator = new WaterSystemIntegrator();

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "--display":
    case "-d":
      console.log("\n" + integrator.generateDisplay() + "\n");
      break;

    case "--simple":
    case "-s":
      console.log("\n" + integrator.generateSimpleDisplay() + "\n");
      break;

    case "--status":
      console.log(
        "\n" + JSON.stringify(integrator.getStatusSummary(), null, 2) + "\n",
      );
      break;

    case "--monitor":
    case "-m":
      const interval = parseInt(args[1]) || 5000;
      integrator.startMonitoring(interval, (metrics) => {
        console.clear();
        console.log("\n" + integrator.generateDisplay() + "\n");
      });
      break;

    case "--help":
    case "-h":
    default:
      console.log(`
🌊 Water System Integrator

Usage:
  bun water-system-integration.js [options]

Options:
  -d, --display           Show box-style display
  -s, --simple            Show simple display
  --status                Show system status
  -m, --monitor [ms]     Start monitoring with updates
  -h, --help             Show this help message

Examples:
  bun water-system-integration.js --display
  bun water-system-integration.js --simple
  bun water-system-integration.js --status
  bun water-system-integration.js --monitor 3000
`);
      break;
  }
}
