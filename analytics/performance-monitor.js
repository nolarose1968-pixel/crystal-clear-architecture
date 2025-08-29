/**
 * 🔍 Fire22 Analytics Performance Monitor
 * Real-time performance monitoring and benchmarking for analytics APIs
 */

class AnalyticsPerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      targetUrl: config.targetUrl || 'https://dashboard-worker.brendawill2233.workers.dev/api/health',
      sampleSize: config.sampleSize || 100,
      interval: config.interval || 30000, // 30 seconds
      timeout: config.timeout || 10000,
      enableHeapMonitoring: config.enableHeapMonitoring || false,
      enableMemoryProfiling: config.enableMemoryProfiling || false,
      ...config
    };

    this.metrics = {
      responseTimes: [],
      errorRates: [],
      throughput: [],
      memoryUsage: [],
      heapSnapshots: [],
      timestamp: new Date().toISOString()
    };

    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.lastHealthCheck = null;

    console.log('🚀 Initializing Analytics Performance Monitor');
    console.log(`🎯 Target: ${this.config.targetUrl}`);
    console.log(`📊 Sample Size: ${this.config.sampleSize}`);
    console.log(`⏱️  Interval: ${this.config.interval}ms`);
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn('⚠️ Performance monitoring is already running');
      return;
    }

    console.log('▶️ Starting performance monitoring...');
    this.isMonitoring = true;

    // Initial health check
    this.performHealthCheck();

    // Setup periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.interval);

    // Setup memory monitoring if enabled
    if (this.config.enableHeapMonitoring) {
      this.startHeapMonitoring();
    }

    console.log('✅ Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.warn('⚠️ Performance monitoring is not running');
      return;
    }

    console.log('⏹️ Stopping performance monitoring...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('✅ Performance monitoring stopped');
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const startTime = performance.now();
    const healthCheck = {
      timestamp: new Date().toISOString(),
      url: this.config.targetUrl,
      responseTime: 0,
      status: 0,
      success: false,
      error: null,
      headers: {},
      memoryUsage: null,
      heapStats: null
    };

    try {
      // Perform the actual request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.config.targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Fire22-Analytics-Performance-Monitor/1.0',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();

      healthCheck.responseTime = endTime - startTime;
      healthCheck.status = response.status;
      healthCheck.success = response.ok;
      healthCheck.headers = Object.fromEntries(response.headers.entries());

      // Get memory usage if available
      if (this.config.enableMemoryProfiling && typeof performance.memory !== 'undefined') {
        healthCheck.memoryUsage = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }

      // Get heap stats if available
      if (this.config.enableHeapMonitoring && typeof Bun !== 'undefined') {
        try {
          const { heapStats } = await import('bun:jsc');
          healthCheck.heapStats = heapStats();
        } catch (e) {
          // Heap stats not available in this environment
        }
      }

      // Log successful response
      console.log(`✅ Health Check: ${response.status} (${healthCheck.responseTime.toFixed(2)}ms)`);

    } catch (error) {
      const endTime = performance.now();
      healthCheck.responseTime = endTime - startTime;
      healthCheck.error = error.message;

      // Log error
      console.error(`❌ Health Check Failed: ${error.message} (${healthCheck.responseTime.toFixed(2)}ms)`);
    }

    // Store metrics
    this.storeMetrics(healthCheck);
    this.lastHealthCheck = healthCheck;

    return healthCheck;
  }

  /**
   * Store performance metrics
   */
  storeMetrics(healthCheck) {
    // Store response time
    this.metrics.responseTimes.push(healthCheck.responseTime);
    if (this.metrics.responseTimes.length > this.config.sampleSize) {
      this.metrics.responseTimes.shift();
    }

    // Store error rate
    const errorRate = healthCheck.success ? 0 : 1;
    this.metrics.errorRates.push(errorRate);
    if (this.metrics.errorRates.length > this.config.sampleSize) {
      this.metrics.errorRates.shift();
    }

    // Store throughput (requests per second)
    const throughput = healthCheck.success ? (1000 / Math.max(healthCheck.responseTime, 1)) : 0;
    this.metrics.throughput.push(throughput);
    if (this.metrics.throughput.length > this.config.sampleSize) {
      this.metrics.throughput.shift();
    }

    // Store memory usage if available
    if (healthCheck.memoryUsage) {
      this.metrics.memoryUsage.push(healthCheck.memoryUsage);
      if (this.metrics.memoryUsage.length > 100) { // Keep more memory samples
        this.metrics.memoryUsage.shift();
      }
    }
  }

  /**
   * Start heap monitoring
   */
  startHeapMonitoring() {
    if (typeof Bun === 'undefined') {
      console.warn('⚠️ Heap monitoring requires Bun runtime');
      return;
    }

    console.log('📊 Starting heap monitoring...');

    // Take heap snapshots periodically
    setInterval(async () => {
      try {
        const { generateHeapSnapshot } = await import('bun');
        const snapshot = generateHeapSnapshot();

        this.metrics.heapSnapshots.push({
          timestamp: new Date().toISOString(),
          snapshot: snapshot
        });

        // Keep only last 10 snapshots
        if (this.metrics.heapSnapshots.length > 10) {
          this.metrics.heapSnapshots.shift();
        }

        console.log('📸 Heap snapshot taken');
      } catch (error) {
        console.error('❌ Failed to generate heap snapshot:', error.message);
      }
    }, 300000); // Every 5 minutes
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport() {
    const report = {
      summary: this.getSummaryStats(),
      trends: this.getTrendAnalysis(),
      health: this.getHealthStatus(),
      recommendations: this.getRecommendations(),
      timestamp: new Date().toISOString(),
      monitoring: {
        isActive: this.isMonitoring,
        targetUrl: this.config.targetUrl,
        sampleSize: this.config.sampleSize,
        interval: this.config.interval
      }
    };

    return report;
  }

  /**
   * Get summary statistics
   */
  getSummaryStats() {
    const responseTimes = this.metrics.responseTimes;
    const errorRates = this.metrics.errorRates;
    const throughput = this.metrics.throughput;

    if (responseTimes.length === 0) {
      return { message: 'No data available yet' };
    }

    // Calculate statistics
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);

    const avgErrorRate = errorRates.reduce((a, b) => a + b, 0) / errorRates.length * 100;
    const avgThroughput = throughput.reduce((a, b) => a + b, 0) / throughput.length;

    return {
      responseTime: {
        average: Math.round(avgResponseTime * 100) / 100,
        min: Math.round(minResponseTime * 100) / 100,
        max: Math.round(maxResponseTime * 100) / 100,
        p95: Math.round(p95ResponseTime * 100) / 100,
        p99: Math.round(p99ResponseTime * 100) / 100
      },
      errorRate: {
        percentage: Math.round(avgErrorRate * 100) / 100,
        totalErrors: errorRates.filter(rate => rate > 0).length,
        totalRequests: errorRates.length
      },
      throughput: {
        average: Math.round(avgThroughput * 100) / 100,
        unit: 'requests/second'
      },
      sampleSize: responseTimes.length
    };
  }

  /**
   * Get trend analysis
   */
  getTrendAnalysis() {
    const responseTimes = this.metrics.responseTimes;
    if (responseTimes.length < 10) {
      return { message: 'Insufficient data for trend analysis' };
    }

    // Split into halves for comparison
    const midPoint = Math.floor(responseTimes.length / 2);
    const firstHalf = responseTimes.slice(0, midPoint);
    const secondHalf = responseTimes.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const trend = secondHalfAvg > firstHalfAvg ? 'degrading' : 'improving';
    const changePercent = Math.abs((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100);

    return {
      responseTimeTrend: trend,
      changePercentage: Math.round(changePercent * 100) / 100,
      firstHalfAverage: Math.round(firstHalfAvg * 100) / 100,
      secondHalfAverage: Math.round(secondHalfAvg * 100) / 100,
      dataPoints: responseTimes.length
    };
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const stats = this.getSummaryStats();

    if (typeof stats.message !== 'undefined') {
      return { status: 'unknown', message: stats.message };
    }

    let status = 'healthy';
    const issues = [];

    // Check response time
    if (stats.responseTime.average > 2000) {
      status = 'critical';
      issues.push('High average response time');
    } else if (stats.responseTime.average > 1000) {
      status = status === 'critical' ? 'critical' : 'warning';
      issues.push('Elevated response time');
    }

    // Check error rate
    if (stats.errorRate.percentage > 5) {
      status = 'critical';
      issues.push('High error rate');
    } else if (stats.errorRate.percentage > 1) {
      status = status === 'critical' ? 'critical' : 'warning';
      issues.push('Elevated error rate');
    }

    // Check P95 latency
    if (stats.responseTime.p95 > 5000) {
      status = status === 'critical' ? 'critical' : 'warning';
      issues.push('High P95 latency');
    }

    return {
      status,
      issues,
      lastCheck: this.lastHealthCheck,
      uptime: this.calculateUptime()
    };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations() {
    const recommendations = [];
    const stats = this.getSummaryStats();

    if (typeof stats.message !== 'undefined') {
      return ['Collect more performance data before generating recommendations'];
    }

    // Response time recommendations
    if (stats.responseTime.average > 2000) {
      recommendations.push('🚨 CRITICAL: Implement response time optimization (caching, CDN, etc.)');
    } else if (stats.responseTime.average > 1000) {
      recommendations.push('⚠️ Consider optimizing response times (database queries, API calls)');
    }

    if (stats.responseTime.p95 > 3000) {
      recommendations.push('📊 High P95 latency detected - investigate outliers');
    }

    // Error rate recommendations
    if (stats.errorRate.percentage > 5) {
      recommendations.push('🚨 CRITICAL: High error rate - investigate root causes immediately');
    } else if (stats.errorRate.percentage > 1) {
      recommendations.push('⚠️ Monitor error patterns and implement error handling improvements');
    }

    // Throughput recommendations
    if (stats.throughput.average < 10) {
      recommendations.push('📈 Consider implementing load balancing or scaling solutions');
    }

    // Memory recommendations
    if (this.metrics.memoryUsage.length > 0) {
      const avgMemoryUsage = this.metrics.memoryUsage.reduce((sum, usage) =>
        sum + usage.usedJSHeapSize, 0) / this.metrics.memoryUsage.length;

      if (avgMemoryUsage > 100 * 1024 * 1024) { // 100MB
        recommendations.push('💾 High memory usage detected - consider memory optimization');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance metrics look good - continue monitoring');
    }

    return recommendations;
  }

  /**
   * Calculate uptime percentage
   */
  calculateUptime() {
    if (this.metrics.errorRates.length === 0) return 100;

    const successfulRequests = this.metrics.errorRates.filter(rate => rate === 0).length;
    return Math.round((successfulRequests / this.metrics.errorRates.length) * 100 * 100) / 100;
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(data, percentile) {
    const sorted = [...data].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Export metrics data
   */
  exportMetrics() {
    const exportData = {
      config: this.config,
      metrics: this.metrics,
      report: this.getPerformanceReport(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-performance-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📤 Performance metrics exported');
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = {
      responseTimes: [],
      errorRates: [],
      throughput: [],
      memoryUsage: [],
      heapSnapshots: [],
      timestamp: new Date().toISOString()
    };

    console.log('🧹 Performance metrics cleared');
  }
}

// ============================================================================
// PERFORMANCE MONITORING UI INTEGRATION
// ============================================================================

/**
 * Create performance monitoring dashboard UI
 */
function createPerformanceDashboard(monitor) {
  const dashboard = document.createElement('div');
  dashboard.id = 'performance-dashboard';
  dashboard.innerHTML = `
    <div class="performance-header">
      <h2>🚀 Performance Monitor</h2>
      <div class="performance-controls">
        <button id="start-monitoring" class="btn btn-primary">Start Monitoring</button>
        <button id="stop-monitoring" class="btn btn-secondary" disabled>Stop Monitoring</button>
        <button id="refresh-metrics" class="btn btn-info">Refresh</button>
        <button id="export-metrics" class="btn btn-success">Export Data</button>
      </div>
    </div>

    <div class="performance-metrics">
      <div class="metric-card">
        <div class="metric-icon">⚡</div>
        <div class="metric-content">
          <div class="metric-value" id="avg-response-time">--</div>
          <div class="metric-label">Avg Response Time</div>
          <div class="metric-unit">ms</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📊</div>
        <div class="metric-content">
          <div class="metric-value" id="error-rate">--</div>
          <div class="metric-label">Error Rate</div>
          <div class="metric-unit">%</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">🚀</div>
        <div class="metric-content">
          <div class="metric-value" id="throughput">--</div>
          <div class="metric-label">Throughput</div>
          <div class="metric-unit">req/s</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">❤️</div>
        <div class="metric-content">
          <div class="metric-value" id="uptime">--</div>
          <div class="metric-label">Uptime</div>
          <div class="metric-unit">%</div>
        </div>
      </div>
    </div>

    <div class="performance-details">
      <div class="detail-section">
        <h3>Response Time Distribution</h3>
        <div class="distribution-bars">
          <div class="bar">
            <span class="bar-label">P50</span>
            <div class="bar-fill" id="p50-bar"></div>
            <span class="bar-value" id="p50-value">--</span>
          </div>
          <div class="bar">
            <span class="bar-label">P95</span>
            <div class="bar-fill" id="p95-bar"></div>
            <span class="bar-value" id="p95-value">--</span>
          </div>
          <div class="bar">
            <span class="bar-label">P99</span>
            <div class="bar-fill" id="p99-bar"></div>
            <span class="bar-value" id="p99-value">--</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Health Status</h3>
        <div class="health-indicators">
          <div class="health-item">
            <span class="health-label">Status:</span>
            <span class="health-value" id="health-status">Unknown</span>
          </div>
          <div class="health-item">
            <span class="health-label">Last Check:</span>
            <span class="health-value" id="last-check">--</span>
          </div>
          <div class="health-item">
            <span class="health-label">Active Issues:</span>
            <span class="health-value" id="active-issues">0</span>
          </div>
        </div>
      </div>
    </div>

    <div class="performance-recommendations">
      <h3>💡 Recommendations</h3>
      <div id="recommendations-list">
        <p class="no-data">Run performance monitoring to get recommendations</p>
      </div>
    </div>
  `;

  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .performance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    .performance-controls {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-info { background: #06b6d4; color: white; }
    .btn-success { background: #10b981; color: white; }

    .btn:hover { transform: translateY(-1px); opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .performance-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .metric-icon {
      font-size: 24px;
    }

    .metric-content {
      flex: 1;
    }

    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .metric-label {
      color: #6b7280;
      font-size: 14px;
    }

    .metric-unit {
      color: #9ca3af;
      font-size: 12px;
    }

    .performance-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .detail-section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .detail-section h3 {
      margin: 0 0 15px 0;
      color: #1f2937;
      font-size: 18px;
    }

    .distribution-bars {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bar {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bar-label {
      width: 30px;
      font-weight: 500;
      color: #6b7280;
    }

    .bar-fill {
      flex: 1;
      height: 20px;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }

    .bar-fill::after {
      content: '';
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #06b6d4);
      width: 0%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .bar-value {
      width: 60px;
      text-align: right;
      font-weight: 500;
      color: #1f2937;
    }

    .health-indicators {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .health-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .health-label {
      color: #6b7280;
      font-weight: 500;
    }

    .health-value {
      color: #1f2937;
      font-weight: 600;
    }

    .performance-recommendations {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .performance-recommendations h3 {
      margin: 0 0 15px 0;
      color: #1f2937;
      font-size: 18px;
    }

    .no-data {
      color: #9ca3af;
      font-style: italic;
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  // Setup event listeners
  setupPerformanceDashboardEvents(dashboard, monitor);

  return dashboard;
}

/**
 * Setup performance dashboard event listeners
 */
function setupPerformanceDashboardEvents(dashboard, monitor) {
  const startBtn = dashboard.querySelector('#start-monitoring');
  const stopBtn = dashboard.querySelector('#stop-monitoring');
  const refreshBtn = dashboard.querySelector('#refresh-metrics');
  const exportBtn = dashboard.querySelector('#export-metrics');

  startBtn.addEventListener('click', () => {
    monitor.startMonitoring();
    startBtn.disabled = true;
    stopBtn.disabled = false;
  });

  stopBtn.addEventListener('click', () => {
    monitor.stopMonitoring();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

  refreshBtn.addEventListener('click', () => {
    updatePerformanceDisplay(dashboard, monitor);
  });

  exportBtn.addEventListener('click', () => {
    monitor.exportMetrics();
  });
}

/**
 * Update performance display with latest metrics
 */
function updatePerformanceDisplay(dashboard, monitor) {
  const report = monitor.getPerformanceReport();

  if (report.summary.message) {
    // No data yet
    return;
  }

  // Update main metrics
  dashboard.querySelector('#avg-response-time').textContent =
    report.summary.responseTime.average;

  dashboard.querySelector('#error-rate').textContent =
    report.summary.errorRate.percentage;

  dashboard.querySelector('#throughput').textContent =
    report.summary.throughput.average;

  dashboard.querySelector('#uptime').textContent =
    report.health.uptime;

  // Update distribution bars
  updateDistributionBar(dashboard, 'p50', report.summary.responseTime.average, 2000);
  updateDistributionBar(dashboard, 'p95', report.summary.responseTime.p95, 2000);
  updateDistributionBar(dashboard, 'p99', report.summary.responseTime.p99, 2000);

  // Update health status
  const healthStatus = dashboard.querySelector('#health-status');
  healthStatus.textContent = report.health.status.toUpperCase();
  healthStatus.className = `health-value status-${report.health.status}`;

  dashboard.querySelector('#last-check').textContent =
    new Date(report.health.lastCheck?.timestamp || Date.now()).toLocaleTimeString();

  dashboard.querySelector('#active-issues').textContent =
    report.health.issues?.length || 0;

  // Update recommendations
  const recommendationsList = dashboard.querySelector('#recommendations-list');
  if (report.recommendations.length > 0) {
    recommendationsList.innerHTML = report.recommendations
      .map(rec => `<p>${rec}</p>`)
      .join('');
  }
}

/**
 * Update distribution bar visualization
 */
function updateDistributionBar(dashboard, percentile, value, maxValue) {
  const barFill = dashboard.querySelector(`#${percentile}-bar .bar-fill`);
  const valueElement = dashboard.querySelector(`#${percentile}-value`);

  if (barFill && valueElement) {
    const percentage = Math.min((value / maxValue) * 100, 100);
    barFill.style.setProperty('--fill-width', `${percentage}%`);
    valueElement.textContent = `${value}ms`;
  }
}

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================

// Make performance monitor globally available
window.AnalyticsPerformanceMonitor = AnalyticsPerformanceMonitor;
window.createPerformanceDashboard = createPerformanceDashboard;

// Auto-initialize if in analytics environment
if (typeof window !== 'undefined' && window.location.pathname.includes('/analytics')) {
  console.log('🔍 Analytics Performance Monitor loaded');

  // Create global performance monitor instance
  window.analyticsPerformanceMonitor = new AnalyticsPerformanceMonitor({
    targetUrl: 'https://dashboard-worker.brendawill2233.workers.dev/api/health',
    enableHeapMonitoring: false,
    enableMemoryProfiling: typeof performance.memory !== 'undefined'
  });
}

console.log('✅ Analytics Performance Monitor module loaded');
