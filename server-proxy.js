import { serve } from "bun";
import axios from "axios";

const PORT = 8081; // You can choose any available port

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all origins for development
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Agent-ID, X-Agent-Owner, X-Agent-Site",
          "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
        },
      });
    }

    // Proxy requests to Fire22 API
    if (url.pathname.startsWith("/fire22-proxy/")) {
      try {
        const targetPath = url.pathname.substring("/fire22-proxy/".length);
        const targetUrl = `https://fire22.ag/cloud/api/${targetPath}${url.search}`;
        console.log(`Proxying request to: ${targetUrl}`);

        const requestHeaders = {};
        // Copy relevant headers from the incoming request
        for (const [key, value] of req.headers.entries()) {
          // Filter out hop-by-hop headers and problematic headers
          if (
            ![
              "connection",
              "keep-alive",
              "proxy-authenticate",
              "proxy-authorization",
              "te",
              "trailers",
              "transfer-encoding",
              "upgrade",
              "host",
            ].includes(key.toLowerCase())
          ) {
            requestHeaders[key] = value;
          }
        }
        requestHeaders["Host"] = "fire22.ag"; // Set the correct Host header for the target
        requestHeaders["Accept-Encoding"] = "identity"; // Prevent gzip encoding issues

        const response = await axios({
          method: req.method,
          url: targetUrl,
          headers: requestHeaders,
          data:
            req.method === "POST" || req.method === "PUT"
              ? await req.arrayBuffer()
              : undefined,
          responseType: "stream",
        });

        const proxyResponseHeaders = new Headers(response.headers);
        proxyResponseHeaders.set("Access-Control-Allow-Origin", "*"); // Allow all origins for development
        proxyResponseHeaders.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS",
        );
        proxyResponseHeaders.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Agent-ID, X-Agent-Owner, X-Agent-Site",
        );

        return new Response(response.data, {
          status: response.status,
          statusText: response.statusText,
          headers: proxyResponseHeaders,
        });
      } catch (error) {
        console.error("Proxy error:", error.message);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          return new Response(error.response.data, {
            status: error.response.status,
          });
        } else {
          return new Response("Proxy error", { status: 500 });
        }
      }
    }

    // Fallback for other requests (e.g., serving static files if needed)
    return new Response("Not Found", { status: 404 });
  },
  error(error) {
    console.error("Bun server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`Bun proxy server listening on port ${PORT}`);
console.log(`Access it at http://localhost:${PORT}/fire22-proxy/`);
