#!/usr/bin/env bun

/**
 * User-Agent Customization Demo
 * Demonstrates the new --user-agent flag and build compilation features
 */

async function main() {
  console.log('🚀 User-Agent & Build Compilation Demo');
  console.log('========================================');

  // Check if custom User-Agent was provided via embedded args
  const embeddedArgs = process.execArgv || [];
  const hasEmbeddedUserAgent = embeddedArgs.some(arg =>
    arg.startsWith('--user-agent=')
  );

  if (hasEmbeddedUserAgent) {
    console.log('✅ Using embedded User-Agent from compilation');
    console.log('📋 Embedded args:', embeddedArgs.join(' '));
  }

  // Demonstrate User-Agent functionality
  console.log('\n🔍 Testing User-Agent functionality...');

  try {
    // Test with httpbin.org user-agent endpoint
    const response = await fetch('https://httpbin.org/user-agent');
    const data = await response.json();

    console.log('📊 Current User-Agent:');
    console.log('   ', data['user-agent']);

    // Check if it's our custom User-Agent
    if (data['user-agent'].includes('CrystalClearArchitecture')) {
      console.log('✅ Custom User-Agent is working!');
    } else if (data['user-agent'].includes('Bun/')) {
      console.log('📝 Using default Bun User-Agent');
    }

  } catch (error) {
    console.error('❌ Failed to test User-Agent:', error);
  }

  // Demonstrate process.execArgv inspection
  console.log('\n🔧 Runtime Arguments:');
  console.log('   process.execArgv:', process.execArgv);

  // Show current working directory and platform
  console.log('\n📁 Environment Info:');
  console.log('   Platform:', process.platform);
  console.log('   Architecture:', process.arch);
  console.log('   Node Version:', process.version);
  console.log('   Bun Version:', process.versions?.bun || 'N/A');

  console.log('\n✨ Demo completed!');
}

// Export for use as a module
export { main };

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}
