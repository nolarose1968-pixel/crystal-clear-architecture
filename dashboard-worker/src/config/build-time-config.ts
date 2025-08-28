/**
 * Build-Time Configuration System
 * 
 * This module provides build-time constants that are embedded during compilation
 * using Bun's --define flag. These constants are available at runtime and can be
 * used to configure the application behavior based on the build environment.
 * 
 * Features:
 * - Environment-specific configuration
 * - Build-time constants for performance
 * - Runtime argument integration
 * - Cross-platform compatibility
 */

export interface BuildTimeConfig {
  environment: string;
  debugMode: boolean;
  logLevel: string;
  apiUrl: string;
  version: string;
  buildTime: string;
  features: {
    bytecode: boolean;
    sourcemap: boolean;
    minify: boolean;
    windows: boolean;
  };
  runtime: {
    port: number;
    host: string;
    optimize: boolean;
    monitor: boolean;
    demoMode: boolean;
  };
}

/**
 * Build-time constants that are embedded during compilation
 * These values are set via the --define flag in build scripts
 */
export const BUILD_TIME_CONFIG: BuildTimeConfig = {
  environment: process.env.BUILD_ENVIRONMENT || 'development',
  debugMode: process.env.BUILD_DEBUG_MODE === 'true',
  logLevel: process.env.BUILD_LOG_LEVEL || 'info',
  apiUrl: process.env.BUILD_API_URL || 'http://localhost:3000',
  version: process.env.BUILD_VERSION || '3.0.8',
  buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  features: {
    bytecode: process.env.BUILD_BYTECODE === 'true',
    sourcemap: process.env.BUILD_SOURCEMAP === 'true',
    minify: process.env.BUILD_MINIFY === 'true',
    windows: process.env.BUILD_WINDOWS === 'true'
  },
  runtime: {
    port: parseInt(process.env.BUILD_PORT || '3000'),
    host: process.env.BUILD_HOST || 'localhost',
    optimize: process.env.BUILD_OPTIMIZE === 'true',
    monitor: process.env.BUILD_MONITOR === 'true',
    demoMode: process.env.BUILD_DEMO_MODE === 'true'
  }
};

/**
 * Runtime argument parser for embedded --compile-exec-argv flags
 * This allows the executable to process runtime arguments that were
 * embedded during compilation
 */
export function parseRuntimeArgs(): Record<string, any> {
  const execArgs = process.execArgv || [];
  const args: Record<string, any> = {};
  
  for (const arg of execArgs) {
    if (arg.startsWith('--env=')) {
      args.environment = arg.split('=')[1];
    } else if (arg.startsWith('--port=')) {
      args.port = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--host=')) {
      args.host = arg.split('=')[1];
    } else if (arg === '--debug') {
      args.debug = true;
    } else if (arg === '--optimize') {
      args.optimize = true;
    } else if (arg === '--monitor') {
      args.monitor = true;
    } else if (arg === '--demo-mode') {
      args.demoMode = true;
    } else if (arg === '--smol') {
      args.smol = true;
    } else if (arg.startsWith('--user-agent=')) {
      args.userAgent = arg.split('=')[1];
    } else if (arg.startsWith('--memory-limit=')) {
      args.memoryLimit = parseInt(arg.split('=')[1]);
    }
  }
  
  return args;
}

/**
 * Get the effective configuration combining build-time constants
 * with runtime arguments
 */
export function getEffectiveConfig(): BuildTimeConfig {
  const runtimeArgs = parseRuntimeArgs();
  
  return {
    ...BUILD_TIME_CONFIG,
    environment: runtimeArgs.environment || BUILD_TIME_CONFIG.environment,
    debugMode: runtimeArgs.debug !== undefined ? runtimeArgs.debug : BUILD_TIME_CONFIG.debugMode,
    logLevel: BUILD_TIME_CONFIG.logLevel,
    apiUrl: BUILD_TIME_CONFIG.apiUrl,
    version: BUILD_TIME_CONFIG.version,
    buildTime: BUILD_TIME_CONFIG.buildTime,
    features: BUILD_TIME_CONFIG.features,
    runtime: {
      ...BUILD_TIME_CONFIG.runtime,
      port: runtimeArgs.port || BUILD_TIME_CONFIG.runtime.port,
      host: runtimeArgs.host || BUILD_TIME_CONFIG.runtime.host,
      optimize: runtimeArgs.optimize !== undefined ? runtimeArgs.optimize : BUILD_TIME_CONFIG.runtime.optimize,
      monitor: runtimeArgs.monitor !== undefined ? runtimeArgs.monitor : BUILD_TIME_CONFIG.runtime.monitor,
      demoMode: runtimeArgs.demoMode !== undefined ? runtimeArgs.demoMode : BUILD_TIME_CONFIG.runtime.demoMode
    }
  };
}

/**
 * Validate build-time configuration
 */
export function validateBuildConfig(): boolean {
  const config = getEffectiveConfig();
  
  // Validate environment
  const validEnvironments = ['development', 'staging', 'production', 'demo'];
  if (!validEnvironments.includes(config.environment)) {
    console.error(`Invalid environment: ${config.environment}`);
    return false;
  }
  
  // Validate port
  if (config.runtime.port < 1024 || config.runtime.port > 65535) {
    console.error(`Invalid port: ${config.runtime.port}`);
    return false;
  }
  
  // Validate log level
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(config.logLevel)) {
    console.error(`Invalid log level: ${config.logLevel}`);
    return false;
  }
  
  return true;
}

/**
 * Display build-time configuration information
 */
export function displayBuildInfo(): void {
  const config = getEffectiveConfig();
  const runtimeArgs = parseRuntimeArgs();
  
  console.log('🚀 Fire22 Dashboard Worker - Build Information');
  console.log('==============================================');
  console.log(`📦 Version: ${config.version}`);
  console.log(`🏗️ Build Time: ${config.buildTime}`);
  console.log(`🌍 Environment: ${config.environment}`);
  console.log(`🔧 Debug Mode: ${config.debugMode}`);
  console.log(`📝 Log Level: ${config.logLevel}`);
  console.log(`🌐 API URL: ${config.apiUrl}`);
  console.log(`🔌 Port: ${config.runtime.port}`);
  console.log(`🏠 Host: ${config.runtime.host}`);
  console.log(`⚡ Optimize: ${config.runtime.optimize}`);
  console.log(`📊 Monitor: ${config.runtime.monitor}`);
  console.log(`🎮 Demo Mode: ${config.runtime.demoMode}`);
  
  if (Object.keys(runtimeArgs).length > 0) {
    console.log('\n🔧 Runtime Arguments:');
    console.log(JSON.stringify(runtimeArgs, null, 2));
  }
  
  if (config.features.bytecode) {
    console.log('\n⚡ Bytecode compilation enabled');
  }
  
  if (config.features.windows) {
    console.log('🪟 Windows metadata embedded');
  }
  
  console.log('==============================================\n');
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(env?: string): Partial<BuildTimeConfig> {
  const targetEnv = env || BUILD_TIME_CONFIG.environment;
  
  const envConfigs: Record<string, Partial<BuildTimeConfig>> = {
    development: {
      debugMode: true,
      logLevel: 'debug',
      runtime: {
        port: 3000,
        host: 'localhost',
        optimize: false,
        monitor: false,
        demoMode: false
      }
    },
    staging: {
      debugMode: false,
      logLevel: 'info',
      runtime: {
        port: 3001,
        host: '0.0.0.0',
        optimize: true,
        monitor: true,
        demoMode: false
      }
    },
    production: {
      debugMode: false,
      logLevel: 'warn',
      runtime: {
        port: 8080,
        host: '0.0.0.0',
        optimize: true,
        monitor: true,
        demoMode: false
      }
    },
    demo: {
      debugMode: true,
      logLevel: 'debug',
      runtime: {
        port: 3002,
        host: 'localhost',
        optimize: false,
        monitor: false,
        demoMode: true
      }
    }
  };
  
  return envConfigs[targetEnv] || {};
}

// Export default configuration
export default getEffectiveConfig;
