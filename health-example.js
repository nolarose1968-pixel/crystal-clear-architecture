/**
 * Crystal Clear Health Check API - Usage Example
 *
 * This file demonstrates how to integrate the comprehensive health check system
 * into a basic Express.js application.
 */

const express = require("express");
const { healthService } = require("./src/services/health/health.service");
const healthRouter = require("./src/api/health-router");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health monitoring middleware
app.use(async (req, res, next) => {
  const startTime = Date.now();

  // Store original send method
  const originalSend = res.send;

  // Override send to capture metrics
  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    const success = res.statusCode < 400;

    // Record performance metrics
    healthService.recordPerformanceMetrics(responseTime, success);

    // Call original send method
    return originalSend.call(this, data);
  };

  next();
});

// Mount health check routes
app.use("/api/health", healthRouter);

// Example API routes
app.get("/api/users", async (req, res) => {
  try {
    // Simulate API processing
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

    res.json({
      success: true,
      data: [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
      ],
      count: 2,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve users",
    });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required",
      });
    }

    // Simulate user creation
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));

    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        name,
        email,
        createdAt: new Date().toISOString(),
      },
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Crystal Clear Architecture API with Health Monitoring",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      comprehensive: "/api/health/comprehensive",
      metrics: "/api/health/metrics",
      users: "/api/users",
    },
    documentation: "/docs/HEALTH-CHECK-API.md",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Crystal Clear API Server running on port ${PORT}`);
  console.log(
    `📊 Health checks available at http://localhost:${PORT}/api/health`,
  );
  console.log(
    `📋 Comprehensive health report at http://localhost:${PORT}/api/health/comprehensive`,
  );
  console.log(
    `📈 Prometheus metrics at http://localhost:${PORT}/api/health/metrics`,
  );
  console.log(`📖 Health API documentation at ./docs/HEALTH-CHECK-API.md`);
});

// Periodic health monitoring
setInterval(async () => {
  try {
    const health = await healthService.getBasicHealth();
    if (health.status !== "healthy") {
      console.warn(`⚠️  Health check warning: ${health.message}`);
    }
  } catch (error) {
    console.error("❌ Health monitoring error:", error.message);
  }
}, 30000); // Check every 30 seconds

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Received SIGTERM, performing graceful shutdown...");

  try {
    const health = await healthService.getComprehensiveHealth();
    if (health.status === "critical") {
      console.error("🚨 Critical health issues detected during shutdown!");
      console.error(
        "Alerts:",
        health.alerts.map((a) => a.message),
      );
    }
  } catch (error) {
    console.error("❌ Health check failed during shutdown:", error.message);
  }

  console.log("✅ Shutdown complete");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT, performing graceful shutdown...");
  process.exit(0);
});

module.exports = app;
