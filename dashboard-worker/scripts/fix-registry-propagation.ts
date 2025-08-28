#!/usr/bin/env bun

/**
 * 🔧 Registry Configuration Propagation Fix
 * Ensures all registry configurations are properly synchronized
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface RegistryConfig {
  npmrc: string;
  bunfig: string;
  packageJson: Record<string, any>;
}

class RegistryPropagationFixer {
  private readonly targetRegistry = 'https://fire22.workers.dev/registry/';
  private readonly scopes = ['@fire22', '@ff', '@brendadeeznuts'];
  private readonly configFiles = {
    npmrc: '.npmrc',
    bunfig: 'bunfig.toml',
    packageJson: 'package.json'
  };

  async fixRegistryPropagation(): Promise<void> {
    console.log('🔧 Registry Configuration Propagation Fix');
    console.log('━'.repeat(50));

    await this.analyzeCurrentConfig();
    await this.fixNpmrcConfig();
    await this.fixBunfigConfig();
    await this.fixPackageJsonOverrides();
    await this.validateConfiguration();

    console.log('✅ Registry configuration propagation fixed');
  }

  private async analyzeCurrentConfig(): Promise<void> {
    console.log('\n📊 Current Configuration Analysis:');
    
    // Check .npmrc
    if (existsSync(this.configFiles.npmrc)) {
      const npmrc = readFileSync(this.configFiles.npmrc, 'utf-8');
      const hasOldRegistry = npmrc.includes('packages.apexodds.net');
      console.log(`  .npmrc: ${hasOldRegistry ? '⚠️  Contains old registry' : '✅ Clean'}`);
    }

    // Check bunfig.toml
    if (existsSync(this.configFiles.bunfig)) {
      const bunfig = readFileSync(this.configFiles.bunfig, 'utf-8');
      const hasCorrectScopes = this.scopes.every(scope => 
        bunfig.includes(`"${scope}" = "${this.targetRegistry}"`)
      );
      console.log(`  bunfig.toml: ${hasCorrectScopes ? '✅ Correct scopes' : '⚠️  Scope issues'}`);
    }

    // Check package.json
    if (existsSync(this.configFiles.packageJson)) {
      const pkg = JSON.parse(readFileSync(this.configFiles.packageJson, 'utf-8'));
      const hasOverrides = pkg.overrides && Object.keys(pkg.overrides).length > 0;
      console.log(`  package.json: ${hasOverrides ? '⚠️  Has overrides' : '✅ Clean'}`);
    }
  }

  private async fixNpmrcConfig(): Promise<void> {
    console.log('\n🔧 Fixing .npmrc configuration...');
    
    const npmrcContent = `# NPM Configuration for Fire22 Dashboard Worker
# Managed by fix-registry-propagation.ts

# Main Registry (Official NPM)
registry=https://registry.npmjs.org/

# Package Management
save-exact=true
engine-strict=true
fund=false

# Security
audit=true
audit-level=high

# Performance
prefer-offline=false
cache-min=86400

# Logging
loglevel=warn
progress=true

# Fire22 Private Registry (Authenticated)
${this.scopes.map(scope => `${scope}:registry=${this.targetRegistry}`).join('\n')}
//${this.targetRegistry.replace('https://', '')}:_authToken=fire22_demo_1756395238611_cti99sksw
//${this.targetRegistry.replace('https://', '')}:always-auth=true
`;

    writeFileSync(this.configFiles.npmrc, npmrcContent);
    console.log('  ✅ .npmrc updated');
  }

  private async fixBunfigConfig(): Promise<void> {
    console.log('\n🔧 Fixing bunfig.toml configuration...');
    
    const bunfigContent = `# Fire22 Dashboard - Enhanced Bun Configuration
# Production-ready configuration with fixed registry propagation

# Telemetry Configuration
telemetry = false

[install]
# Use official NPM registry as primary
registry = "https://registry.npmjs.org/"
linker = "hoisted"
cache = true
exact = true
dev = true
optional = true
auto = false

# Security scanner configuration (Bun v1.2.0+)
[install.security]
scanner = "@fire22/security-scanner"

# Scoped package registries - FIXED
[install.scopes]
${this.scopes.map(scope => `"${scope}" = "${this.targetRegistry}"`).join('\n')}

[build]
target = "bun"
format = "esm"
splitting = true
minify = false

[test]
coverage = true
bunx = true

[run]
bun = true
hot = true

[console]
depth = 4

[debug]
editor = "code"

# CSS Build Scripts
[scripts]
"css:extract" = "bun run scripts/extract-css.ts"
"css:build" = "bun build ./src/styles/index.css --outdir=public/css --naming='[name].[ext]'"
"css:watch" = "bun build ./src/styles/index.css --outdir=public/css --naming='[name].[ext]' --watch"
"css:consolidate" = "bun run css:extract && bun run css:build"
"build:css" = "bun run css:consolidate"

# Serve configuration
[serve]
port = 3001
host = "0.0.0.0"

[serve.static]
directory = "public"
plugins = []

[serve.static.paths]
"/css" = "./public/css"
"/styles" = "./src/styles"
"/js" = "./src/js"
`;

    writeFileSync(this.configFiles.bunfig, bunfigContent);
    console.log('  ✅ bunfig.toml updated');
  }

  private async fixPackageJsonOverrides(): Promise<void> {
    console.log('\n🔧 Fixing package.json overrides...');
    
    if (!existsSync(this.configFiles.packageJson)) {
      console.log('  ⚠️  package.json not found');
      return;
    }

    const pkg = JSON.parse(readFileSync(this.configFiles.packageJson, 'utf-8'));
    
    // Remove problematic overrides that might cause registry conflicts
    if (pkg.overrides) {
      const originalOverrides = { ...pkg.overrides };
      
      // Remove overrides that could interfere with registry resolution
      delete pkg.overrides['@types/node'];
      delete pkg.overrides['@types/bun'];
      
      // Clean empty overrides
      if (Object.keys(pkg.overrides).length === 0) {
        delete pkg.overrides;
      }
      
      console.log(`  📦 Removed ${Object.keys(originalOverrides).length - (pkg.overrides ? Object.keys(pkg.overrides).length : 0)} problematic overrides`);
    }

    // Ensure publishConfig is correct
    if (pkg.publishConfig) {
      pkg.publishConfig.registry = this.targetRegistry;
    }

    writeFileSync(this.configFiles.packageJson, JSON.stringify(pkg, null, 2));
    console.log('  ✅ package.json updated');
  }

  private async validateConfiguration(): Promise<void> {
    console.log('\n✅ Configuration Validation:');
    
    // Test registry resolution
    console.log('  🔍 Testing registry resolution...');
    
    try {
      // Check if Fire22 registry is accessible
      const response = await fetch(this.targetRegistry);
      const isAccessible = response.ok;
      console.log(`  🌐 Fire22 registry: ${isAccessible ? '✅ Accessible' : '❌ Not accessible'}`);
      
      if (isAccessible) {
        const data = await response.json();
        console.log(`  📊 Registry status: ${data.status || 'unknown'}`);
      }
    } catch (error) {
      console.log(`  ❌ Registry test failed: ${error.message}`);
    }

    // Verify configuration files
    const npmrc = readFileSync(this.configFiles.npmrc, 'utf-8');
    const bunfig = readFileSync(this.configFiles.bunfig, 'utf-8');
    
    const npmrcValid = this.scopes.every(scope => 
      npmrc.includes(`${scope}:registry=${this.targetRegistry}`)
    );
    const bunfigValid = this.scopes.every(scope => 
      bunfig.includes(`"${scope}" = "${this.targetRegistry}"`)
    );
    
    console.log(`  📄 .npmrc validity: ${npmrcValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`  📄 bunfig.toml validity: ${bunfigValid ? '✅ Valid' : '❌ Invalid'}`);
  }
}

// Main execution
async function main() {
  const fixer = new RegistryPropagationFixer();
  await fixer.fixRegistryPropagation();
}

main().catch(console.error);