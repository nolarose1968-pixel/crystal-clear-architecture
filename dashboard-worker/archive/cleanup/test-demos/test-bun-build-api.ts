#!/usr/bin/env bun

/**
 * 🧪 Fire22 Bun.build API Integration Test
 * 
 * Demonstrates the new Bun.build JavaScript API integration with 
 * enhanced build constants, complex data types, and feature flags.
 * 
 * @version 3.0.8
 * @author Fire22 Development Team
 * @see docs/BUILD-INDEX.md for usage guide
 */

import { createBuildContext, BuildUtilities } from './build-utilities.ts';
import { getBuildProfile } from '../build.config.ts';
import { join } from 'path';

async function testBunBuildAPI() {
  console.log('🧪 Fire22 Bun.build API Integration Test');
  console.log('='.repeat(50));
  
  const profile = getBuildProfile('production');
  const context = createBuildContext(profile, {
    version: '3.0.8',
    environment: 'development',
    outputDir: './dist/test-api-build'
  });
  
  const utilities = new BuildUtilities(context);
  
  try {
    // Setup directories
    await utilities.setupDirectories();
    
    // Test 1: Generate build constants
    console.log('\n📊 Testing build constants generation...');
    const constants = await utilities.generateBuildConstants();
    console.log('✅ Build constants generated:', Object.keys(constants).length, 'constants');
    
    // Show a few interesting constants
    console.log('🔧 Sample constants:');
    console.log('  - BUILD_VERSION:', constants.BUILD_VERSION);
    console.log('  - ENVIRONMENT:', constants.ENVIRONMENT);
    console.log('  - ENABLE_DEBUG_LOGS:', constants.ENABLE_DEBUG_LOGS);
    console.log('  - FIRE22_CONFIG:', constants.FIRE22_CONFIG);
    console.log('  - FEATURE_FLAGS:', constants.FEATURE_FLAGS);
    
    // Test 2: Generate TypeScript declarations
    console.log('\n📄 Testing TypeScript declaration generation...');
    await utilities.saveBuildConstantsDeclaration();
    console.log('✅ TypeScript declarations generated');
    
    // Test 3: Build bundle with Bun.build API
    console.log('\n📦 Testing Bun.build API bundle generation...');
    
    const entrypoint = join(process.cwd(), 'src/index.ts');
    if (!await Bun.file(entrypoint).exists()) {
      // Create a simple test entrypoint
      const testEntry = `
// Test entrypoint for Bun.build API
console.log('Fire22 Dashboard Worker');
console.log('Build Version:', BUILD_VERSION);
console.log('Environment:', ENVIRONMENT);
console.log('Debug Mode:', DEBUG_MODE);
console.log('Feature Flags:', FEATURE_FLAGS);

export default {
  version: BUILD_VERSION,
  environment: ENVIRONMENT,
  buildTime: BUILD_TIME,
  config: FIRE22_CONFIG
};
`;
      
      await Bun.write(entrypoint, testEntry);
      console.log('📝 Created test entrypoint:', entrypoint);
    }
    
    const outputPaths = await utilities.buildBundle({
      entrypoint,
      outputDir: context.outputDir,
      minify: false,
      sourcemap: true,
      format: 'esm',
      target: 'bun'
    });
    
    console.log('✅ Bundle generation completed');
    console.log('📂 Output files:', outputPaths);
    
    // Test 4: Generate build report
    console.log('\n📋 Generating build report...');
    const report = await utilities.generateBuildReport();
    await utilities.saveBuildReport(report);
    console.log('✅ Build report generated');
    
    // Test 5: Show final statistics
    const stats = utilities.getStats();
    console.log('\n📊 Build Statistics:');
    console.log('  - Duration:', Math.round(stats.duration), 'ms');
    console.log('  - Memory Usage:', Math.round(stats.memoryUsage.heapUsed / 1024 / 1024), 'MB');
    console.log('  - Artifacts:', stats.artifacts.length);
    console.log('  - Errors:', stats.errors.length);
    console.log('  - Warnings:', stats.warnings.length);
    console.log('  - Success:', stats.success ? '✅' : '❌');
    
    if (stats.artifacts.length > 0) {
      console.log('\n📦 Generated Artifacts:');
      for (const artifact of stats.artifacts) {
        const size = artifact.size > 1024 * 1024 
          ? `${Math.round(artifact.size / 1024 / 1024 * 100) / 100}MB`
          : artifact.size > 1024
          ? `${Math.round(artifact.size / 1024 * 100) / 100}KB`
          : `${artifact.size}B`;
        console.log(`  - ${artifact.name} (${artifact.type}): ${size}`);
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.main) {
  await testBunBuildAPI();
}