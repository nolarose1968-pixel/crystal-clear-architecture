#!/usr/bin/env bun
/**
 * Simple Alias Test with minimal config
 */

// Test with minimal configuration
import config from "./fire22-config.toml";

console.log("🔧 Simple Test");
console.log("=" .repeat(30));

console.log("📁 Direct import:");
console.log(`   Project: ${config.name}`);
console.log(`   Version: ${config.version}`);

console.log("\n✅ Basic TOML import working!");
