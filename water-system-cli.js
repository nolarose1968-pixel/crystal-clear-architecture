#!/usr/bin/env bun

/**
 * 🌊 Water System CLI Display
 * Shows water system metrics in a beautiful terminal interface
 */

class WaterSystemCLI {
  constructor() {
    this.metrics = {
      flowRate: 85,
      temperature: 22,
      pressure: 120,
    };

    this.colors = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      cyan: "\x1b[36m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      red: "\x1b[31m",
      blue: "\x1b[34m",
    };
  }

  /**
   * Create a box with the given content
   */
  createBox(title, content) {
    const width = 50;
    const titleStr = ` ${title} `;
    const titlePadding = width - titleStr.length - 2;
    const leftPad = Math.floor(titlePadding / 2);
    const rightPad = Math.ceil(titlePadding / 2);

    let box = [];

    // Top line with title
    box.push(
      this.colors.cyan +
        "╭" +
        "─".repeat(leftPad) +
        this.colors.bright +
        this.colors.blue +
        titleStr +
        this.colors.reset +
        this.colors.cyan +
        "─".repeat(rightPad) +
        "╮" +
        this.colors.reset,
    );

    // Content lines
    content.forEach((line) => {
      const padding = width - line.length - 2;
      box.push(
        this.colors.cyan +
          "│" +
          this.colors.reset +
          line +
          " ".repeat(Math.max(0, padding)) +
          this.colors.cyan +
          "│" +
          this.colors.reset,
      );
    });

    // Bottom line
    box.push(
      this.colors.cyan + "╰" + "─".repeat(width - 2) + "╯" + this.colors.reset,
    );

    return box.join("\n");
  }

  /**
   * Display the water system metrics
   */
  displayWaterSystem() {
    const content = [
      `  🌊 Flow Rate: ${this.colors.green}${this.metrics.flowRate} L/min${this.colors.reset}`,
      `  🌡️ Temperature: ${this.colors.yellow}${this.metrics.temperature}°C${this.colors.reset}`,
      `  📊 Pressure: ${this.colors.red}${this.metrics.pressure} PSI${this.colors.reset}`,
    ];

    console.log("\n" + this.createBox("WATER SYSTEM", content) + "\n");
  }

  /**
   * Update metrics with simulated real-time data
   */
  updateMetrics() {
    // Simulate small variations
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
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(intervalMs = 5000) {
    console.log(
      `${this.colors.cyan}🌊 Starting water system monitoring...${this.colors.reset}`,
    );
    console.log(
      `${this.colors.cyan}Press Ctrl+C to stop${this.colors.reset}\n`,
    );

    // Initial display
    this.displayWaterSystem();

    // Start updates
    const interval = setInterval(() => {
      this.updateMetrics();
      this.displayWaterSystem();
    }, intervalMs);

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log(
        `\n${this.colors.cyan}🌊 Water system monitoring stopped${this.colors.reset}`,
      );
      clearInterval(interval);
      process.exit(0);
    });
  }

  /**
   * Show single display
   */
  showOnce() {
    this.displayWaterSystem();
  }
}

// Main execution
const waterSystem = new WaterSystemCLI();

// Check command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === "--monitor" || command === "-m") {
  const interval = parseInt(args[1]) || 5000;
  waterSystem.startMonitoring(interval);
} else if (command === "--help" || command === "-h") {
  console.log(`
${waterSystem.colors.cyan}🌊 Water System CLI${waterSystem.colors.reset}

Usage:
  bun water-system-cli.js [options]

Options:
  -m, --monitor [interval]  Start real-time monitoring (default: 5000ms)
  -h, --help               Show this help message

Examples:
  bun water-system-cli.js                    # Show current metrics once
  bun water-system-cli.js --monitor          # Start monitoring with 5s updates
  bun water-system-cli.js -m 3000           # Start monitoring with 3s updates
`);
} else {
  // Default: show once
  waterSystem.showOnce();
}
