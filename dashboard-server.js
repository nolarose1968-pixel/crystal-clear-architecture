#!/usr/bin/env node

/**
 * Fire22 Dashboard API Server
 *
 * Simple Node.js server to serve dashboard API endpoints for development and testing
 */

const http = require("http");
const url = require("url");

// Import our dashboard handlers
const {
  handleDashboardRoutes,
} = require("./src/api/routes/dashboard.routes.ts");

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Health check endpoint
  if (pathname === "/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "Fire22 Dashboard API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }),
    );
    return;
  }

  // API info endpoint
  if (pathname === "/api") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        name: "Fire22 Dashboard API",
        version: "1.0.0",
        description:
          "Real-time metrics and analytics API for Fire22 dashboards",
        endpoints: {
          metrics: "/api/dashboard/metrics",
          analytics: "/api/dashboard/analytics",
          health: "/api/dashboard/health",
          performance: "/api/dashboard/performance",
        },
        documentation:
          "See DASHBOARD-API-README.md for detailed API documentation",
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  // Handle dashboard API routes
  try {
    const response = await handleDashboardRoutes(parsedUrl, req);
    if (response) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.end(JSON.stringify(response));
      return;
    }
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  // Default 404 response
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: "Not found",
      message: `Route ${pathname} not found`,
      availableRoutes: ["/health", "/api", "/api/dashboard/*"],
      timestamp: new Date().toISOString(),
    }),
  );
});

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(
    `🚀 Fire22 Dashboard API Server running on http://${HOST}:${PORT}`,
  );
  console.log(`📊 Dashboard endpoints available at:`);
  console.log(`   • http://${HOST}:${PORT}/api/dashboard/metrics`);
  console.log(`   • http://${HOST}:${PORT}/api/dashboard/analytics`);
  console.log(`   • http://${HOST}:${PORT}/api/dashboard/health`);
  console.log(`   • http://${HOST}:${PORT}/api/dashboard/performance`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📖 API info: http://${HOST}:${PORT}/api`);
});

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down Dashboard API Server...");
  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});
