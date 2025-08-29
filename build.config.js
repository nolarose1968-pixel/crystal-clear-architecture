/**
 * Fire22 Build Configuration
 *
 * Performance optimization and asset bundling configuration
 */

const path = require('path');

module.exports = {
  // Build paths
  paths: {
    src: path.resolve(__dirname, 'src'),
    build: path.resolve(__dirname, 'build'),
    analytics: path.resolve(__dirname, 'analytics'),
    performance: path.resolve(__dirname, 'performance-dashboard.html'),
    styles: path.resolve(__dirname, 'terminal-framework.css'),
    scripts: path.resolve(__dirname, 'src/api'),
  },

  // Build targets
  targets: {
    analytics: {
      entry: 'analytics/index.html',
      output: 'build/analytics/',
      assets: [
        'analytics/analytics.css',
        'analytics/analytics.js',
        'analytics/config.js',
        'terminal-framework.css'
      ]
    },
    performance: {
      entry: 'performance-dashboard.html',
      output: 'build/performance/',
      assets: [
        'terminal-framework.css'
      ]
    }
  },

  // Optimization settings
  optimization: {
    // JavaScript minification
    js: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },

    // CSS optimization
    css: {
      discardComments: {
        removeAll: true
      },
      discardDuplicates: true,
      discardEmpty: true,
      discardUnused: false, // Keep for dynamic classes
      mergeLonghand: true,
      mergeRules: true
    },

    // Image optimization
    images: {
      quality: 80,
      progressive: true,
      optimizationLevel: 3,
      pngquant: {
        quality: [0.6, 0.8]
      }
    }
  },

  // Performance budgets
  budgets: {
    // Maximum bundle sizes
    bundles: {
      analytics: {
        js: '150KB',
        css: '50KB',
        total: '200KB'
      },
      performance: {
        js: '100KB',
        css: '30KB',
        total: '130KB'
      }
    },

    // Performance metrics
    metrics: {
      // Lighthouse scores (target)
      lighthouse: {
        performance: 90,
        accessibility: 90,
        bestPractices: 90,
        seo: 90
      },

      // Core Web Vitals (target)
      coreWebVitals: {
        lcp: 2500, // ms
        fid: 100,  // ms
        cls: 0.1   // score
      },

      // Bundle analysis
      bundleAnalysis: {
        maxChunks: 10,
        maxInitialSize: '200KB',
        maxAsyncSize: '100KB'
      }
    }
  },

  // Caching strategy
  caching: {
    // Cache versioning
    version: Date.now(),

    // Cache keys
    keys: {
      static: 'fire22-static-v',
      api: 'fire22-api-v',
      images: 'fire22-images-v'
    },

    // Cache durations
    durations: {
      static: 60 * 60 * 24 * 30, // 30 days
      api: 60 * 5,               // 5 minutes
      images: 60 * 60 * 24 * 7   // 7 days
    }
  },

  // Development server
  devServer: {
    port: 3000,
    host: '0.0.0.0',
    hot: true,
    open: false,
    compress: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'build'),
      publicPath: '/'
    }
  },

  // Plugins configuration
  plugins: {
    // Bundle analyzer
    bundleAnalyzer: {
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    },

    // Compression
    compression: {
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 1024,
      minRatio: 0.8
    },

    // PWA
    pwa: {
      name: 'Fire22 Analytics',
      shortName: 'Fire22',
      description: 'Enterprise analytics dashboard',
      themeColor: '#58a6ff',
      backgroundColor: '#0d1117'
    }
  }
};
