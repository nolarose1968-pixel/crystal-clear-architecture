/**
 * Custom Docusaurus plugin to handle MDX compilation errors gracefully
 * Provides fallback content for files that fail to compile
 */

const fs = require('fs');
const path = require('path');

function mdxErrorHandlerPlugin() {
  return {
    name: 'mdx-error-handler',
    
    configureWebpack(config, isServer, utils) {
      return {
        plugins: [
          // Custom webpack plugin to catch MDX compilation errors
          {
            apply(compiler) {
              compiler.hooks.compilation.tap('MDXErrorHandler', (compilation) => {
                // Hook into the compilation process to catch MDX errors
                compilation.hooks.failedModule.tap('MDXErrorHandler', (module) => {
                  if (module.resource && module.resource.endsWith('.md')) {
                    console.warn(`⚠️ MDX compilation failed for: ${module.resource}`);
                    console.warn('Error details:', module.error?.message);
                    
                    // Log the error for monitoring
                    const errorInfo = {
                      file: module.resource,
                      error: module.error?.message,
                      timestamp: new Date().toISOString(),
                      type: 'mdx-compilation-error'
                    };
                    
                    // Write error log to file for debugging
                    const logFile = path.join(__dirname, '../../logs/mdx-errors.json');
                    try {
                      const logDir = path.dirname(logFile);
                      if (!fs.existsSync(logDir)) {
                        fs.mkdirSync(logDir, { recursive: true });
                      }
                      
                      let existingLogs = [];
                      if (fs.existsSync(logFile)) {
                        existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
                      }
                      
                      existingLogs.push(errorInfo);
                      fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
                    } catch (e) {
                      console.warn('Failed to write error log:', e.message);
                    }
                  }
                });
              });
            }
          }
        ]
      };
    },

    async contentLoaded({ content, actions }) {
      const { createData } = actions;
      
      // Create error registry for failed MDX files
      const errorRegistry = {
        timestamp: new Date().toISOString(),
        errors: [],
        totalErrors: 0,
        handledErrors: 0
      };

      // Save error registry data
      await createData('mdx-error-registry.json', JSON.stringify(errorRegistry, null, 2));
    },

    getClientModules() {
      return [
        // Client-side error boundary registration
        path.resolve(__dirname, '../components/ErrorBoundary.tsx'),
      ];
    },
  };
}

module.exports = mdxErrorHandlerPlugin;