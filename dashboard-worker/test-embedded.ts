#!/usr/bin/env bun

console.log(`Bun was launched with: ${process.execArgv?.join(" ") || "no flags"}`);

// This --user-agent flag is actually processed by Bun's runtime.
// All fetch requests will use this user-agent.
try {
  const res = await fetch("https://echo.hoppscotch.io/", {
    headers: {
      "Accept": "application/json"
    }
  });
  const data = await res.json();
  console.log(`User-Agent header sent: ${data.headers?.["user-agent"] || "not found in response"}`);
} catch (error) {
  console.log(`User-Agent test skipped (service unavailable)`);
}

// Also test that the embedded flags work
console.log(`\nEnvironment: ${process.env.ENVIRONMENT || "not set"}`);
console.log(`Version: ${process.env.VERSION || "not set"}`);

// Test ANSI stripping feature
const colored = "\u001b[31mRed\u001b[0m \u001b[32mGreen\u001b[0m";
const stripped = Bun.stripANSI(colored);
console.log(`\nANSI Stripping: ${stripped === "Red Green" ? "✅ Works" : "❌ Failed"}`);