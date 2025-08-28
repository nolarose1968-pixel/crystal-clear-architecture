/**
 * Bun Build Configuration for CSS
 * Enhanced CSS bundling with Fire22 styles
 */

import { BuildConfig } from "bun";

// CSS Build Configuration
export const cssConfig: BuildConfig = {
  entrypoints: [
    "./src/styles/index.css",
    "./src/index.ts",
    "./src/main-worker.ts"
  ],
  outdir: "./dist",
  naming: {
    // Add content hash to CSS files for cache busting
    asset: "[name]-[hash].[ext]",
    chunk: "[name]-[hash].js",
    entry: "[name].js"
  },
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true
  },
  sourcemap: process.env.NODE_ENV !== "production" ? "external" : "none",
  target: "browser",
  
  // CSS-specific options
  loader: {
    ".css": "css",
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".gif": "file",
    ".svg": "file",
    ".woff": "file",
    ".woff2": "file",
    ".ttf": "file",
    ".eot": "file"
  },
  
  // External packages (don't bundle these)
  external: [
    "cloudflare:*"
  ],
  
  // Define environment variables
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    "BUILD_TIME": JSON.stringify(new Date().toISOString()),
    "BUILD_VERSION": JSON.stringify(process.env.npm_package_version || "1.0.0")
  }
};

// Development Build
export async function buildDevelopment() {
  const result = await Bun.build({
    ...cssConfig,
    minify: false,
    sourcemap: "inline"
  });
  
  if (!result.success) {
    console.error("Build failed:", result.logs);
    process.exit(1);
  }
  
  console.log("✅ Development build complete");
  return result;
}

// Production Build
export async function buildProduction() {
  const result = await Bun.build({
    ...cssConfig,
    minify: true,
    sourcemap: "external",
    define: {
      ...cssConfig.define,
      "process.env.NODE_ENV": JSON.stringify("production")
    }
  });
  
  if (!result.success) {
    console.error("Build failed:", result.logs);
    process.exit(1);
  }
  
  console.log("✅ Production build complete");
  console.log(`📦 Output size: ${result.outputs.reduce((acc, output) => acc + output.size, 0)} bytes`);
  return result;
}

// Watch Mode
export async function watch() {
  console.log("👁️ Watching for changes...");
  
  const watcher = Bun.build({
    ...cssConfig,
    minify: false,
    sourcemap: "inline",
    // Note: Bun doesn't have built-in watch mode yet
    // This is a placeholder for when it's available
  });
  
  // For now, use Bun's file watcher
  const { watch } = await import("fs");
  watch("./src", { recursive: true }, async (event, filename) => {
    if (filename?.endsWith('.css') || filename?.endsWith('.ts')) {
      console.log(`📝 ${event}: ${filename}`);
      await buildDevelopment();
    }
  });
}

// CLI Interface
if (import.meta.main) {
  const command = process.argv[2] || "development";
  
  switch (command) {
    case "production":
    case "prod":
      await buildProduction();
      break;
    case "watch":
      await watch();
      break;
    case "development":
    case "dev":
    default:
      await buildDevelopment();
      break;
  }
}