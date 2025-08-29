const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// MIME types for different file extensions
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Handle token endpoint
  if (req.url.includes("/api/v1/token")) {
    if (req.method === "GET") {
      // Simulate token endpoint
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          token: "mock-token-" + Date.now(),
          expires_in: 3600,
          type: "Bearer",
        }),
      );
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
    return;
  }

  // Handle file requests
  let filePath = req.url;
  if (filePath === "/" || filePath === "") {
    filePath = "/test-service-worker.html";
  }

  // Remove query parameters
  filePath = filePath.split("?")[0];

  // Construct full file path
  filePath = path.join(__dirname, filePath);

  // Get file extension
  const extname = path.extname(filePath);
  let contentType = mimeTypes[extname] || "application/octet-stream";

  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log(`File not found: ${filePath}`);
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(
          "<html><body><h1>404 Not Found</h1><p>File not found</p></body></html>",
        );
      } else {
        console.error(`Server error: ${err.code}`);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end(
          "<html><body><h1>500 Internal Server Error</h1><p>Server error</p></body></html>",
        );
      }
    } else {
      console.log(`Serving file: ${filePath} (${contentType})`);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Test page: http://localhost:${PORT}/test-service-worker.html`);
  console.log(`Token endpoint: http://localhost:${PORT}/api/v1/token`);
  console.log(`Offline fallback: http://localhost:${PORT}/offline-token.html`);
  console.log("\nTo test the service worker:");
  console.log(
    "1. Open http://localhost:3000/test-service-worker.html in your browser",
  );
  console.log("2. Register the service worker using the test interface");
  console.log("3. Test the token endpoint");
  console.log(
    "4. To test offline behavior, use browser dev tools to go offline",
  );
  console.log(
    "5. Try accessing the token endpoint again - it should show the offline page",
  );
});
