#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Crystal Clear Architecture - Cloudflare Pages & Workers
 */

const fs = require("fs");
const path = require("path");

class DeploymentVerifier {
  constructor() {
    this.baseDir = path.join(__dirname);
    this.distDir = path.join(this.baseDir, "dist");
    this.functionsDir = path.join(this.baseDir, "functions");
  }

  async run() {
    console.log("🔍 Crystal Clear Architecture - Deployment Verification\n");

    const tests = [
      { name: "Build Output", test: () => this.verifyBuildOutput() },
      { name: "Functions Structure", test: () => this.verifyFunctions() },
      { name: "Configuration Files", test: () => this.verifyConfigFiles() },
      { name: "Documentation Files", test: () => this.verifyDocumentation() },
      { name: "Package Dependencies", test: () => this.verifyDependencies() },
    ];

    const results = [];

    for (const test of tests) {
      console.log(`📋 Testing: ${test.name}`);
      try {
        const result = await test.test();
        results.push({ ...test, status: "PASS", details: result });
        console.log(`✅ PASS: ${result}\n`);
      } catch (error) {
        results.push({ ...test, status: "FAIL", details: error.message });
        console.log(`❌ FAIL: ${error.message}\n`);
      }
    }

    this.printSummary(results);
    return results.every((r) => r.status === "PASS");
  }

  async verifyBuildOutput() {
    const requiredFiles = [
      "index.html",
      "docs/index.html",
      "docs/communication.html",
      "docs/domains.html",
      "docs/performance.html",
      "docs/HEALTH-CHECK-API.md",
    ];

    const missing = requiredFiles.filter((file) => {
      return !fs.existsSync(path.join(this.distDir, file));
    });

    if (missing.length > 0) {
      throw new Error(`Missing build files: ${missing.join(", ")}`);
    }

    const stats = fs.statSync(path.join(this.distDir, "index.html"));
    return `Build output verified. Main index: ${stats.size} bytes`;
  }

  async verifyFunctions() {
    const requiredFunctions = [
      "functions/api/health.js",
      "functions/api/link-health.js",
      "functions/api/analytics.js",
    ];

    const missing = requiredFunctions.filter((func) => {
      return !fs.existsSync(path.join(this.baseDir, func));
    });

    if (missing.length > 0) {
      throw new Error(`Missing function files: ${missing.join(", ")}`);
    }

    // Check function syntax
    for (const func of requiredFunctions) {
      const content = fs.readFileSync(path.join(this.baseDir, func), "utf8");
      if (!content.includes("export async function onRequest")) {
        throw new Error(`Invalid function format: ${func}`);
      }
    }

    return `All ${requiredFunctions.length} functions verified`;
  }

  async verifyConfigFiles() {
    const configFiles = ["wrangler.toml", "package.json"];

    for (const file of configFiles) {
      if (!fs.existsSync(path.join(this.baseDir, file))) {
        throw new Error(`Missing config file: ${file}`);
      }
    }

    // Check wrangler.toml
    const wranglerContent = fs.readFileSync(
      path.join(this.baseDir, "wrangler.toml"),
      "utf8",
    );
    if (!wranglerContent.includes("crystal-clear-architecture")) {
      throw new Error("wrangler.toml missing project name");
    }

    // Check package.json scripts
    const packageContent = fs.readFileSync(
      path.join(this.baseDir, "package.json"),
      "utf8",
    );
    const packageJson = JSON.parse(packageContent);

    const requiredScripts = ["build", "deploy", "dev"];
    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        throw new Error(`Missing script in package.json: ${script}`);
      }
    }

    return "Configuration files verified";
  }

  async verifyDocumentation() {
    const docs = ["CLOUDFLARE-PAGES-README.md", "docs-worker/README.md"];

    for (const doc of docs) {
      if (!fs.existsSync(path.join(this.baseDir, doc))) {
        throw new Error(`Missing documentation: ${doc}`);
      }
    }

    return `Documentation files verified (${docs.length} files)`;
  }

  async verifyDependencies() {
    const packageContent = fs.readFileSync(
      path.join(this.baseDir, "package.json"),
      "utf8",
    );
    const packageJson = JSON.parse(packageContent);

    const requiredDeps = ["wrangler", "@cloudflare/workers-types"];

    const missing = requiredDeps.filter((dep) => {
      return (
        !packageJson.devDependencies[dep] && !packageJson.dependencies[dep]
      );
    });

    if (missing.length > 0) {
      throw new Error(`Missing dependencies: ${missing.join(", ")}`);
    }

    return `Dependencies verified (${requiredDeps.length} packages)`;
  }

  printSummary(results) {
    console.log("📊 Verification Summary\n");

    const passed = results.filter((r) => r.status === "PASS").length;
    const failed = results.filter((r) => r.status === "FAIL").length;
    const total = results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%\n`);

    if (failed > 0) {
      console.log("❌ Failed Tests:");
      results
        .filter((r) => r.status === "FAIL")
        .forEach((result) => {
          console.log(`   • ${result.name}: ${result.details}`);
        });
    }

    if (passed === total) {
      console.log("🎉 All tests passed! Ready for deployment.");
      console.log("\n🚀 Next Steps:");
      console.log("   1. Run: bun run build");
      console.log("   2. Run: bun run deploy (or ./deploy-pages.sh)");
      console.log(
        "   3. Test: curl https://crystal-clear-architecture.pages.dev/api/health",
      );
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  verifier
    .run()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Verification failed:", error);
      process.exit(1);
    });
}

module.exports = DeploymentVerifier;
