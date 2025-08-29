/**
 * Cloudflare Pages Function - Link Health Checker
 * Validates external links for the documentation site
 */

export async function onRequest(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing url parameter",
          usage: "?url=https://example.com",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate URL format
    let target;
    try {
      target = new URL(targetUrl);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Invalid URL format",
          url: targetUrl,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Only allow HTTPS for security
    if (target.protocol !== "https:") {
      return new Response(
        JSON.stringify({
          status: "error",
          url: targetUrl,
          error: "Only HTTPS URLs are allowed",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if it's a known documentation URL
    const knownUrls = [
      "github.com/nolarose1968-pixel/crystal-clear-architecture",
      "dashboard-worker.brendawill2233.workers.dev",
      "raw.githubusercontent.com",
    ];

    const isKnown = knownUrls.some(
      (known) =>
        target.hostname.includes(known) || known.includes(target.hostname),
    );

    // Perform lightweight health check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(targetUrl, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
        headers: {
          "User-Agent": "Crystal-Clear-Link-Checker/1.0",
        },
      });

      clearTimeout(timeoutId);

      const result = {
        status: "success",
        url: targetUrl,
        reachable: true,
        responseTime: Date.now(),
        isKnown: isKnown,
        timestamp: new Date().toISOString(),
        metadata: {
          hostname: target.hostname,
          pathname: target.pathname,
          protocol: target.protocol,
        },
      };

      return new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
          "X-Link-Status": "HEALTHY",
        },
      });
    } catch (error) {
      clearTimeout(timeoutId);

      const errorResult = {
        status: "error",
        url: targetUrl,
        reachable: false,
        error: error.name === "AbortError" ? "Timeout" : error.message,
        isKnown: isKnown,
        timestamp: new Date().toISOString(),
        metadata: {
          hostname: target.hostname,
          pathname: target.pathname,
          protocol: target.protocol,
        },
      };

      return new Response(JSON.stringify(errorResult, null, 2), {
        status: 200, // Return 200 with error status for client handling
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60", // Cache errors for 1 minute
          "X-Link-Status": "UNREACHABLE",
        },
      });
    }
  } catch (error) {
    console.error("Link health check error:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
