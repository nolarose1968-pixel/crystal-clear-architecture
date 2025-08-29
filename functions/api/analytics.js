/**
 * Cloudflare Pages Function - Analytics Tracking
 * Collects usage data for documentation site optimization
 */

export async function onRequest(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "pageview";

    // Get request data
    const userAgent = request.headers.get("User-Agent") || "Unknown";
    const clientIP =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "Unknown";
    const referrer = request.headers.get("Referer") || "";
    const country = request.cf?.country || "Unknown";

    // Extract page data from request
    const pageData = {
      action,
      path: url.pathname,
      timestamp: new Date().toISOString(),
      userAgent,
      clientIP: hashIP(clientIP), // Hash IP for privacy
      country,
      referrer,
      cloudflare: {
        datacenter: request.cf?.colo || "Unknown",
        httpProtocol: request.cf?.httpProtocol || "Unknown",
        tlsVersion: request.cf?.tlsVersion || "Unknown",
      },
    };

    // For POST requests, also parse body data
    if (request.method === "POST") {
      try {
        const body = await request.json();
        pageData.body = body;
      } catch (error) {
        // Ignore body parsing errors
      }
    }

    // Log analytics data (in production, you'd send to analytics service)
    console.log("📊 Analytics:", JSON.stringify(pageData, null, 2));

    // Store in analytics engine if available
    if (env.page_analytics) {
      try {
        // This would work with Cloudflare Analytics Engine
        await env.page_analytics.writeDataPoint({
          blobs: [
            pageData.action,
            pageData.path,
            pageData.country,
            pageData.timestamp,
          ],
          doubles: [1.0], // count
          indexes: [pageData.clientIP],
        });
      } catch (error) {
        console.warn("Analytics Engine error:", error);
      }
    }

    // Return success response
    const response = {
      status: "recorded",
      timestamp: new Date().toISOString(),
      action: pageData.action,
      path: pageData.path,
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Analytics-Status": "RECORDED",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Analytics-Status": "ERROR",
        },
      },
    );
  }
}

/**
 * Simple hash function for IP addresses (for privacy)
 */
function hashIP(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}
