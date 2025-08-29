#!/usr/bin/env node

/**
 * Fire22 Asset Optimizer
 *
 * Simple performance optimization for dashboard assets
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class AssetOptimizer {
  constructor() {
    this.startTime = performance.now();
    this.stats = { files: 0, original: 0, optimized: 0, savings: 0 };
  }

  async optimize() {
    console.log('🔥 Fire22 Asset Optimizer Starting...\n');

    const assets = [
      'analytics/analytics.css',
      'analytics/analytics.js',
      'analytics/config.js',
      'terminal-framework.css',
      'performance-dashboard.html'
    ];

    // Create build directory
    const buildDir = 'build';
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    // Create analytics build directory
    const analyticsBuildDir = 'build/analytics';
    if (!fs.existsSync(analyticsBuildDir)) {
      fs.mkdirSync(analyticsBuildDir, { recursive: true });
    }

    // Optimize each asset
    for (const asset of assets) {
      await this.optimizeAsset(asset, buildDir);
    }

    // Copy analytics HTML with optimizations
    await this.optimizeAnalyticsHTML();

    // Generate performance report
    this.generateReport();

    this.showSummary();
  }

  async optimizeAsset(assetPath, buildDir) {
    const fullPath = path.join(process.cwd(), assetPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Skipping ${assetPath} (not found)`);
      return;
    }

    const originalContent = fs.readFileSync(fullPath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');

    let optimizedContent = originalContent;
    let optimizedSize = originalSize;

    const ext = path.extname(assetPath).toLowerCase();

    try {
      switch (ext) {
        case '.js':
          optimizedContent = this.optimizeJS(originalContent);
          break;
        case '.css':
          optimizedContent = this.optimizeCSS(originalContent);
          break;
        case '.html':
          optimizedContent = this.optimizeHTML(originalContent);
          break;
      }

      optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');

      // Determine output path
      let outputPath;
      if (assetPath.startsWith('analytics/')) {
        outputPath = path.join(buildDir, assetPath);
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } else {
        outputPath = path.join(buildDir, path.basename(assetPath));
      }

      fs.writeFileSync(outputPath, optimizedContent);

      // Update stats
      this.stats.files++;
      this.stats.original += originalSize;
      this.stats.optimized += optimizedSize;
      this.stats.savings += (originalSize - optimizedSize);

      const savingsPercent = originalSize > 0 ?
        ((originalSize - optimizedSize) / originalSize * 100).toFixed(1) : '0.0';

      console.log(`✅ ${assetPath}`);
      console.log(`   ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savingsPercent}% saved)\n`);

    } catch (error) {
      console.error(`❌ Failed to optimize ${assetPath}:`, error.message);
    }
  }

  optimizeJS(js) {
    // Basic JavaScript optimizations
    let optimized = js;

    // Remove comments (basic)
    optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
    optimized = optimized.replace(/\/\/.*$/gm, '');

    // Remove extra whitespace
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, '$1');

    // Remove console.log in production (basic detection)
    if (process.env.NODE_ENV === 'production') {
      optimized = optimized.replace(/console\.log\([^)]*\);?/g, '');
      optimized = optimized.replace(/console\.debug\([^)]*\);?/g, '');
      optimized = optimized.replace(/console\.info\([^)]*\);?/g, '');
    }

    return optimized.trim();
  }

  optimizeCSS(css) {
    let optimized = css;

    // Remove comments
    optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove extra whitespace and line breaks
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/\s*([{}:;,>])\s*/g, '$1');

    // Remove trailing semicolons before closing braces
    optimized = optimized.replace(/;}/g, '}');

    // Remove empty rules
    optimized = optimized.replace(/[^{}]+\{\s*\}/g, '');

    return optimized.trim();
  }

  optimizeHTML(html) {
    let optimized = html;

    // Remove HTML comments (but keep conditional comments)
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

    // Remove whitespace between tags
    optimized = optimized.replace(/>\s+</g, '><');

    // Remove multiple whitespace
    optimized = optimized.replace(/\s+/g, ' ');

    // Remove whitespace at line start/end
    optimized = optimized.replace(/^\s+/gm, '');
    optimized = optimized.replace(/\s+$/gm, '');

    return optimized.trim();
  }

  async optimizeAnalyticsHTML() {
    const htmlPath = 'analytics/index.html';
    const outputPath = 'build/analytics/index.html';

    if (!fs.existsSync(htmlPath)) {
      console.log('⚠️  Analytics HTML not found');
      return;
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // Add performance optimizations
    html = this.addPerformanceHints(html);

    // Update asset paths for build directory
    html = html.replace(/href="analytics\.css"/g, 'href="analytics.css"');
    html = html.replace(/src="analytics\.js"/g, 'src="analytics.js"');
    html = html.replace(/src="config\.js"/g, 'src="config.js"');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html);
    console.log('✅ analytics/index.html (optimized)\n');
  }

  addPerformanceHints(html) {
    // Add resource hints
    const hints = `
      <!-- Performance Optimization -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://cdn.jsdelivr.net">
      <link rel="dns-prefetch" href="//fonts.googleapis.com">
      <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    `;

    // Insert before closing head
    html = html.replace('</head>', hints + '</head>');

    // Add critical CSS inlining hint (placeholder)
    const criticalHint = `
      <!-- Critical CSS should be inlined here -->
      <link rel="preload" href="analytics.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
      <noscript><link rel="stylesheet" href="analytics.css"></noscript>
    `;

    html = html.replace('<link rel="stylesheet"', criticalHint + '\n    <link rel="stylesheet"');

    return html;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: (performance.now() - this.startTime) / 1000,
      stats: this.stats,
      recommendations: this.getRecommendations()
    };

    fs.writeFileSync('build/optimization-report.json', JSON.stringify(report, null, 2));
    console.log('📊 Optimization report saved to build/optimization-report.json');
  }

  getRecommendations() {
    const recommendations = [];

    if (this.stats.savings < 10000) {
      recommendations.push('Consider implementing more aggressive minification');
    }

    if (this.stats.files < 5) {
      recommendations.push('Add more assets to the optimization pipeline');
    }

    recommendations.push('Enable gzip compression on your server');
    recommendations.push('Implement CDN for static assets');
    recommendations.push('Add browser caching headers');

    return recommendations;
  }

  showSummary() {
    const duration = ((performance.now() - this.startTime) / 1000).toFixed(2);
    const compressionRatio = this.stats.original > 0 ?
      ((this.stats.original - this.stats.optimized) / this.stats.original * 100).toFixed(1) : '0.0';

    console.log('\n🎉 Optimization Complete!');
    console.log('='.repeat(50));
    console.log(`📁 Files Processed: ${this.stats.files}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`💾 Space Saved: ${this.formatBytes(this.stats.savings)}`);
    console.log(`📊 Compression: ${compressionRatio}%`);
    console.log(`📦 Original: ${this.formatBytes(this.stats.original)}`);
    console.log(`🎯 Optimized: ${this.formatBytes(this.stats.optimized)}`);
    console.log('='.repeat(50));
    console.log('✅ Assets ready for production!');
    console.log('\n🚀 Next: Deploy to GitHub Pages');
    console.log('💡 Run: git add build/ && git commit -m "Optimize assets" && git push');
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new AssetOptimizer();
  optimizer.optimize().catch(console.error);
}

module.exports = AssetOptimizer;
