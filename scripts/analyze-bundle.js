#!/usr/bin/env bun

import { readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { build } from "bun";

// Configuration
const CONFIG = {
  entrypoints: [
    "./dashboard-worker/src/index.ts",
    "./dashboard-worker/src/index-router.ts",
    "./dashboard-worker/src/worker.ts"
  ],
  outdir: "./dist",
  sizeLimitKB: 500,
  excludePatterns: [/\.map$/, /\.d\.ts$/, /node_modules/]
};

// Utility function to get file size in KB
function getFileSizeKB(filePath) {
  try {
    const stats = statSync(filePath);
    return stats.size / 1024;
  } catch (error) {
    console.warn(`⚠️  Could not get size for ${filePath}:`, error.message);
    return 0;
  }
}

// Utility function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Analyze directory recursively
function analyzeDirectory(dirPath, results = [], basePath = dirPath) {
  try {
    const items = readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dirPath, item.name);
      const relativePath = fullPath.replace(basePath + '/', '');

      if (item.isDirectory()) {
        if (!CONFIG.excludePatterns.some(pattern => pattern.test(relativePath))) {
          analyzeDirectory(fullPath, results, basePath);
        }
      } else if (item.isFile()) {
        const shouldExclude = CONFIG.excludePatterns.some(pattern => pattern.test(item.name));
        if (!shouldExclude) {
          const sizeKB = getFileSizeKB(fullPath);
          results.push({
            path: relativePath,
            fullPath,
            sizeKB,
            sizeBytes: sizeKB * 1024,
            extension: extname(item.name)
          });
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not analyze directory ${dirPath}:`, error.message);
  }

  return results;
}

// Main bundle analysis function
async function analyzeBundle() {
  console.log("🔍 Fire22 Bundle Analysis");
  console.log("========================");

  try {
    // First, try to analyze existing built files
    console.log("📊 Analyzing existing files...");
    console.log("==============================");

    const existingFiles = analyzeDirectory("./dashboard-worker");
    const jsFiles = existingFiles.filter(file =>
      file.extension === '.js' || file.extension === '.ts'
    );

    if (jsFiles.length === 0) {
      console.log("⚠️  No JavaScript/TypeScript files found in dashboard-worker directory");
      console.log("💡 Try building your project first or check your source directory");
    } else {
      console.log(`📁 Found ${jsFiles.length} JavaScript/TypeScript files`);

      let totalSizeKB = 0;
      let largeFiles = [];

      for (const file of jsFiles) {
        totalSizeKB += file.sizeKB;
        if (file.sizeKB > 100) {
          largeFiles.push(file);
        }
      }

      console.log(`📈 Total source size: ${totalSizeKB.toFixed(2)} KB`);
      console.log(`📊 Average file size: ${(totalSizeKB / jsFiles.length).toFixed(2)} KB`);
      console.log("");

      if (largeFiles.length > 0) {
        console.log("📋 Large Source Files (>100KB):");
        for (const file of largeFiles.slice(0, 5)) {
          console.log(`  - ${file.path}: ${file.sizeKB.toFixed(2)} KB`);
        }
        if (largeFiles.length > 5) {
          console.log(`  ... and ${largeFiles.length - 5} more`);
        }
        console.log("");
      }

      // Now try building
      console.log("📦 Attempting to build bundles...");
      console.log("=================================");

      try {
        const result = await build({
          entrypoints: CONFIG.entrypoints,
          outdir: CONFIG.outdir,
          minify: true,
          sourcemap: "external",
          metafile: true,
          target: "bun"
        });

        if (!result.success) {
          console.log("⚠️  Build failed, but source analysis is available above");
          console.log("💡 To fix build issues:");
          console.log("   - Check for missing import dependencies");
          console.log("   - Verify all required files exist");
          console.log("   - Review import paths in entry points");
          console.log("");
          console.log("✅ Source analysis complete!");
          return;
        }

        console.log("✅ Build successful!");
        console.log("");

        // Analyze bundle outputs
        console.log("📊 Bundle Analysis:");
        console.log("==================");

        let bundleTotalSizeKB = 0;
        let exceededLimit = false;

        for (const [path, output] of Object.entries(result.outputs)) {
          const sizeKB = output.bytes / 1024;
          bundleTotalSizeKB += sizeKB;

          const status = sizeKB > CONFIG.sizeLimitKB ? "❌ EXCEEDS LIMIT" : "✅ OK";
          console.log(`- ${path}: ${sizeKB.toFixed(2)} KB ${status}`);

          if (sizeKB > CONFIG.sizeLimitKB) {
            exceededLimit = true;
            console.error(`  └─ Limit: ${CONFIG.sizeLimitKB} KB, Actual: ${sizeKB.toFixed(2)} KB`);
          }
        }

        console.log("");
        console.log(`📈 Bundle total size: ${bundleTotalSizeKB.toFixed(2)} KB`);

        if (exceededLimit) {
          console.error("❌ Bundle size limits exceeded!");
        } else {
          console.log("✅ All bundles are within size limits!");
        }

      } catch (buildError) {
        console.log("⚠️  Build failed, but source analysis is available above");
        console.log("💡 Build error:", buildError.message);
        console.log("");
        console.log("✅ Source analysis complete!");
        return;
      }
    }

    console.log("");
    console.log("🎉 Bundle analysis complete!");

  } catch (error) {
    console.error("❌ Bundle analysis failed:", error.message);
    process.exit(1);
  }
}

// Run analysis if this script is executed directly
if (import.meta.main) {
  analyzeBundle();
}

export { analyzeBundle, CONFIG };
