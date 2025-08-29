/**
 * Cloudflare Pages Function - Health Check API
 * Crystal Clear Architecture Health Monitoring
 */

export async function onRequest(context) {
  const { request, env } = context;

  try {
    // Get request information
    const url = new URL(request.url);
    const userAgent = request.headers.get("User-Agent") || "Unknown";
    const clientIP =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "Unknown";

    // Get environment information
    const environment = {
      node_env: env.NODE_ENV || "production",
      cf_pages: env.CF_PAGES || "0",
      github_repo:
        env.GITHUB_REPO || "nolarose1968-pixel/crystal-clear-architecture",
      github_branch: env.GITHUB_BRANCH || "main",
    };

    // System health metrics
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Crystal Clear Architecture",
      version: "1.0.0",
      uptime: "N/A", // Pages functions don't have persistent uptime
      environment,
      request: {
        method: request.method,
        path: url.pathname,
        userAgent,
        clientIP,
      },
      performance: {
        responseTime: Date.now(), // This will be approximate
        memory: "N/A",
        cpu: "N/A",
      },
      features: {
        pages: true,
        functions: true,
        analytics: true,
        caching: true,
      },
      endpoints: {
        health: "/api/health",
        docs: "/docs/",
        main: "/",
      },
      cloudflare: {
        datacenter: request.cf?.colo || "Unknown",
        country: request.cf?.country || "Unknown",
        httpProtocol: request.cf?.httpProtocol || "Unknown",
      },
    };

    // Add cache headers for health endpoint
    const response = new Response(JSON.stringify(healthData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Service-Health": "OK",
        "X-Response-Time": Date.now().toString(),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

    return response;
  } catch (error) {
    console.error("Health check error:", error);

    const errorResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      service: "Crystal Clear Architecture",
      error: error.message,
      version: "1.0.0",
    };

    return new Response(JSON.stringify(errorResponse, null, 2), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Service-Health": "ERROR",
      },
    });
  }
}
