/**
 * 🔬 Fire22 Analytics Performance Benchmark Suite
 * Comprehensive benchmarking tools for API performance testing
 */

class PerformanceBenchmark {
  constructor(config = {}) {
    this.config = {
      targetUrl: config.targetUrl || 'https://dashboard-worker.brendawill2233.workers.dev/api/health',
      duration: config.duration || 60000, // 60 seconds
      concurrency: config.concurrency || 10,
      rampUpTime: config.rampUpTime || 5000, // 5 seconds
      timeout: config.timeout || 10000,
      headers: config.headers || {},
      method: config.method || 'GET',
      body: config.body || null,
      ...config
    };

    this.results = {
      startTime: null,
      endTime: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      statusCodes: {},
      errors: [],
      throughput: [],
      latency: {
        min: Infinity,
        max: 0,
        avg: 0,
        p50: 0,
        p95: 0,
        p99: 0
      },
      percentiles: {}
    };

    this.isRunning = false;
    this.activeRequests = 0;
  }

  /**
   * Run comprehensive performance benchmark
   */
  async runBenchmark() {
    if (this.isRunning) {
      throw new Error('Benchmark is already running');
    }

    this.isRunning = true;
    this.results.startTime = Date.now();

    console.log('🚀 Starting Performance Benchmark...');
    console.log(`🎯 Target: ${this.config.targetUrl}`);
    console.log(`⏱️  Duration: ${this.config.duration}ms`);
    console.log(`👥 Concurrency: ${this.config.concurrency}`);
    console.log(`📈 Ramp-up: ${this.config.rampUpTime}ms`);
    console.log('-'.repeat(50));

    try {
      await this.executeBenchmark();
      this.calculateResults();

      console.log('✅ Benchmark completed successfully!');
      return this.results;

    } catch (error) {
      console.error('❌ Benchmark failed:', error);
      this.results.errors.push({
        type: 'benchmark_error',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;

    } finally {
      this.isRunning = false;
      this.results.endTime = Date.now();
    }
  }

  /**
   * Execute the benchmark with controlled concurrency
   */
  async executeBenchmark() {
    const endTime = Date.now() + this.config.duration;
    const rampUpEnd = Date.now() + this.config.rampUpTime;

    const workers = Array.from({ length: this.config.concurrency }, (_, i) =>
      this.createWorker(i, endTime, rampUpEnd)
    );

    await Promise.all(workers);
  }

  /**
   * Create a worker for making requests
   */
  async createWorker(workerId, endTime, rampUpEnd) {
    while (Date.now() < endTime && this.isRunning) {
      // Implement ramp-up logic
      if (Date.now() < rampUpEnd) {
        const rampUpProgress = (Date.now() - (rampUpEnd - this.config.rampUpTime)) / this.config.rampUpTime;
        const delay = Math.random() * 1000 * (1 - rampUpProgress); // Reduce delay as ramp-up progresses
        await this.delay(delay);
      }

      // Check if we can make another request (concurrency control)
      if (this.activeRequests >= this.config.concurrency) {
        await this.delay(10); // Small delay before retry
        continue;
      }

      this.activeRequests++;
      await this.makeRequest(workerId);
      this.activeRequests--;
    }
  }

  /**
   * Make a single HTTP request and record metrics
   */
  async makeRequest(workerId) {
    const requestStart = performance.now();

    try {
      const response = await fetch(this.config.targetUrl, {
        method: this.config.method,
        headers: {
          'User-Agent': `Fire22-Performance-Benchmark/1.0 (Worker ${workerId})`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.config.headers
        },
        body: this.config.body,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      const requestEnd = performance.now();
      const responseTime = requestEnd - requestStart;

      this.recordResult({
        success: true,
        status: response.status,
        responseTime,
        timestamp: Date.now(),
        workerId
      });

    } catch (error) {
      const requestEnd = performance.now();
      const responseTime = requestEnd - requestStart;

      this.recordResult({
        success: false,
        status: 0,
        responseTime,
        error: error.message,
        timestamp: Date.now(),
        workerId
      });
    }
  }

  /**
   * Record request result
   */
  recordResult(result) {
    this.results.totalRequests++;

    if (result.success && result.status >= 200 && result.status < 400) {
      this.results.successfulRequests++;
    } else {
      this.results.failedRequests++;
      if (result.error) {
        this.results.errors.push({
          type: 'request_error',
          message: result.error,
          status: result.status,
          timestamp: result.timestamp,
          workerId: result.workerId
        });
      }
    }

    // Record status code
    this.results.statusCodes[result.status] = (this.results.statusCodes[result.status] || 0) + 1;

    // Record response time
    this.results.responseTimes.push(result.responseTime);

    // Update min/max
    this.results.latency.min = Math.min(this.results.latency.min, result.responseTime);
    this.results.latency.max = Math.max(this.results.latency.max, result.responseTime);

    // Record throughput (requests per second) every second
    const now = Date.now();
    const second = Math.floor(now / 1000);
    if (!this.results.throughput[second]) {
      this.results.throughput[second] = 0;
    }
    this.results.throughput[second]++;
  }

  /**
   * Calculate final benchmark results and percentiles
   */
  calculateResults() {
    const responseTimes = this.results.responseTimes;

    if (responseTimes.length === 0) {
      console.warn('⚠️ No response times recorded');
      return;
    }

    // Calculate average
    this.results.latency.avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    // Calculate percentiles
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    this.results.latency.p50 = this.calculatePercentile(sortedTimes, 50);
    this.results.latency.p95 = this.calculatePercentile(sortedTimes, 95);
    this.results.latency.p99 = this.calculatePercentile(sortedTimes, 99);

    // Calculate throughput statistics
    const throughputValues = Object.values(this.results.throughput);
    const avgThroughput = throughputValues.reduce((a, b) => a + b, 0) / throughputValues.length;
    const maxThroughput = Math.max(...throughputValues);

    this.results.throughputStats = {
      average: Math.round(avgThroughput * 100) / 100,
      max: maxThroughput,
      total: this.results.totalRequests
    };

    // Calculate error rate
    this.results.errorRate = (this.results.failedRequests / this.results.totalRequests) * 100;

    console.log('\n📊 Benchmark Results:');
    console.log(`   Total Requests: ${this.results.totalRequests}`);
    console.log(`   Successful: ${this.results.successfulRequests}`);
    console.log(`   Failed: ${this.results.failedRequests}`);
    console.log(`   Error Rate: ${this.results.errorRate.toFixed(2)}%`);
    console.log(`   Average Response Time: ${this.results.latency.avg.toFixed(2)}ms`);
    console.log(`   P95 Response Time: ${this.results.latency.p95.toFixed(2)}ms`);
    console.log(`   P99 Response Time: ${this.results.latency.p99.toFixed(2)}ms`);
    console.log(`   Average Throughput: ${this.results.throughputStats.average} req/s`);
    console.log(`   Max Throughput: ${this.results.throughputStats.max} req/s`);
  }

  /**
   * Calculate percentile from sorted array
   */
  calculatePercentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get comprehensive benchmark report
   */
  getReport() {
    return {
      config: this.config,
      results: this.results,
      summary: {
        duration: this.results.endTime - this.results.startTime,
        requestsPerSecond: this.results.throughputStats ?
          this.results.throughputStats.average : 0,
        successRate: ((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2) + '%',
        errorRate: this.results.errorRate.toFixed(2) + '%',
        avgLatency: this.results.latency.avg.toFixed(2) + 'ms',
        p95Latency: this.results.latency.p95.toFixed(2) + 'ms',
        p99Latency: this.results.latency.p99.toFixed(2) + 'ms'
      },
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate performance recommendations based on results
   */
  generateRecommendations() {
    const recommendations = [];
    const results = this.results;

    // Throughput recommendations
    if (results.throughputStats && results.throughputStats.average < 50) {
      recommendations.push('📈 Consider implementing caching to improve throughput');
    }

    // Latency recommendations
    if (results.latency.avg > 1000) {
      recommendations.push('⚡ High average latency detected - optimize database queries and API calls');
    }

    if (results.latency.p95 > 2000) {
      recommendations.push('📊 High P95 latency - investigate outliers and implement circuit breakers');
    }

    // Error rate recommendations
    if (results.errorRate > 5) {
      recommendations.push('🚨 High error rate detected - review error handling and implement retries');
    }

    // Success rate recommendations
    const successRate = (results.successfulRequests / results.totalRequests) * 100;
    if (successRate < 95) {
      recommendations.push('⚠️ Low success rate - implement better error handling and monitoring');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance metrics look good - continue monitoring');
    }

    return recommendations;
  }

  /**
   * Export benchmark results to JSON
   */
  exportResults() {
    const report = this.getReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `benchmark-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('📤 Benchmark results exported');
  }

  /**
   * Compare results with previous benchmark
   */
  compareWithPrevious(previousResults) {
    if (!previousResults) return null;

    const current = this.results;
    const previous = previousResults;

    return {
      latencyChange: {
        avg: ((current.latency.avg - previous.latency.avg) / previous.latency.avg * 100).toFixed(2) + '%',
        p95: ((current.latency.p95 - previous.latency.p95) / previous.latency.p95 * 100).toFixed(2) + '%'
      },
      throughputChange: previous.throughputStats ?
        ((current.throughputStats.average - previous.throughputStats.average) / previous.throughputStats.average * 100).toFixed(2) + '%' : 'N/A',
      errorRateChange: (current.errorRate - previous.errorRate).toFixed(2) + '%',
      improvement: this.calculateImprovement(current, previous)
    };
  }

  /**
   * Calculate overall performance improvement
   */
  calculateImprovement(current, previous) {
    let score = 0;

    // Better latency = higher score
    if (current.latency.avg < previous.latency.avg) score += 30;
    if (current.latency.p95 < previous.latency.p95) score += 20;

    // Better throughput = higher score
    if (current.throughputStats && previous.throughputStats) {
      if (current.throughputStats.average > previous.throughputStats.average) score += 25;
    }

    // Lower error rate = higher score
    if (current.errorRate < previous.errorRate) score += 25;

    if (score >= 70) return 'significant_improvement';
    if (score >= 40) return 'moderate_improvement';
    if (score >= 0) return 'slight_improvement';
    return 'degradation';
  }
}

// ============================================================================
// PREDEFINED BENCHMARK SCENARIOS
// ============================================================================

const BENCHMARK_SCENARIOS = {
  smoke: {
    name: 'Smoke Test',
    description: 'Quick smoke test with minimal load',
    config: {
      duration: 10000, // 10 seconds
      concurrency: 2,
      rampUpTime: 1000
    }
  },

  load: {
    name: 'Load Test',
    description: 'Standard load test with moderate concurrency',
    config: {
      duration: 60000, // 1 minute
      concurrency: 10,
      rampUpTime: 5000
    }
  },

  stress: {
    name: 'Stress Test',
    description: 'High concurrency stress test',
    config: {
      duration: 30000, // 30 seconds
      concurrency: 50,
      rampUpTime: 5000
    }
  },

  spike: {
    name: 'Spike Test',
    description: 'Sudden traffic spike simulation',
    config: {
      duration: 60000, // 1 minute
      concurrency: 5,
      rampUpTime: 1000,
      spikeConfig: {
        spikeDuration: 10000, // 10 second spike
        spikeConcurrency: 100
      }
    }
  },

  endurance: {
    name: 'Endurance Test',
    description: 'Long-running test for stability',
    config: {
      duration: 300000, // 5 minutes
      concurrency: 5,
      rampUpTime: 10000
    }
  }
};

// ============================================================================
// BENCHMARK RUNNER UTILITIES
// ============================================================================

/**
 * Run a specific benchmark scenario
 */
async function runScenario(scenarioName, customConfig = {}) {
  const scenario = BENCHMARK_SCENARIOS[scenarioName];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioName}`);
  }

  console.log(`🎯 Running ${scenario.name} Scenario`);
  console.log(`📝 ${scenario.description}`);
  console.log('-'.repeat(50));

  const config = { ...scenario.config, ...customConfig };
  const benchmark = new PerformanceBenchmark(config);

  try {
    const results = await benchmark.runBenchmark();
    return results;
  } catch (error) {
    console.error(`❌ Scenario ${scenarioName} failed:`, error);
    throw error;
  }
}

/**
 * Run multiple scenarios in sequence
 */
async function runMultipleScenarios(scenarios, customConfig = {}) {
  const results = {};

  for (const scenarioName of scenarios) {
    try {
      console.log(`\n🚀 Starting scenario: ${scenarioName}`);
      results[scenarioName] = await runScenario(scenarioName, customConfig);
      console.log(`✅ Scenario ${scenarioName} completed\n`);
    } catch (error) {
      console.error(`❌ Scenario ${scenarioName} failed:`, error.message);
      results[scenarioName] = { error: error.message };
    }
  }

  return results;
}

/**
 * Generate comprehensive benchmark report
 */
function generateBenchmarkReport(results, scenarios = []) {
  const report = {
    timestamp: new Date().toISOString(),
    scenarios: {},
    summary: {},
    recommendations: []
  };

  // Process each scenario result
  for (const [scenarioName, result] of Object.entries(results)) {
    if (result.error) {
      report.scenarios[scenarioName] = { error: result.error };
      continue;
    }

    const scenario = BENCHMARK_SCENARIOS[scenarioName];
    report.scenarios[scenarioName] = {
      name: scenario.name,
      description: scenario.description,
      config: result.config,
      metrics: {
        totalRequests: result.totalRequests,
        successfulRequests: result.successfulRequests,
        failedRequests: result.failedRequests,
        errorRate: result.errorRate,
        avgResponseTime: result.latency.avg,
        p95ResponseTime: result.latency.p95,
        p99ResponseTime: result.latency.p99,
        avgThroughput: result.throughputStats.average,
        maxThroughput: result.throughputStats.max
      },
      recommendations: result.recommendations || []
    };
  }

  // Generate overall summary
  report.summary = generateOverallSummary(results);

  // Generate recommendations
  report.recommendations = generateOverallRecommendations(results);

  return report;
}

/**
 * Generate overall summary from all scenarios
 */
function generateOverallSummary(results) {
  const validResults = Object.values(results).filter(r => !r.error);

  if (validResults.length === 0) {
    return { message: 'No successful benchmark results' };
  }

  const totalRequests = validResults.reduce((sum, r) => sum + r.totalRequests, 0);
  const avgResponseTime = validResults.reduce((sum, r) => sum + r.latency.avg, 0) / validResults.length;
  const avgErrorRate = validResults.reduce((sum, r) => sum + r.errorRate, 0) / validResults.length;
  const avgThroughput = validResults.reduce((sum, r) => sum + r.throughputStats.average, 0) / validResults.length;

  return {
    totalScenarios: validResults.length,
    totalRequests,
    avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    avgErrorRate: Math.round(avgErrorRate * 100) / 100,
    avgThroughput: Math.round(avgThroughput * 100) / 100,
    bestScenario: findBestScenario(validResults),
    worstScenario: findWorstScenario(validResults)
  };
}

/**
 * Generate overall recommendations
 */
function generateOverallRecommendations(results) {
  const recommendations = [];
  const validResults = Object.values(results).filter(r => !r.error);

  if (validResults.length === 0) {
    return ['Unable to generate recommendations due to benchmark failures'];
  }

  // Check for common issues across scenarios
  const highLatencyScenarios = validResults.filter(r => r.latency.avg > 1000);
  if (highLatencyScenarios.length > 0) {
    recommendations.push(`⚡ ${highLatencyScenarios.length} scenarios showed high latency - optimize API performance`);
  }

  const highErrorScenarios = validResults.filter(r => r.errorRate > 5);
  if (highErrorScenarios.length > 0) {
    recommendations.push(`🚨 ${highErrorScenarios.length} scenarios had high error rates - improve error handling`);
  }

  const lowThroughputScenarios = validResults.filter(r => r.throughputStats.average < 20);
  if (lowThroughputScenarios.length > 0) {
    recommendations.push(`📈 ${lowThroughputScenarios.length} scenarios showed low throughput - consider scaling`);
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All benchmark scenarios performed well - maintain current performance levels');
  }

  return recommendations;
}

/**
 * Find the best performing scenario
 */
function findBestScenario(results) {
  return results.reduce((best, current) => {
    const bestScore = calculateScenarioScore(best);
    const currentScore = calculateScenarioScore(current);
    return currentScore > bestScore ? current : best;
  });
}

/**
 * Find the worst performing scenario
 */
function findWorstScenario(results) {
  return results.reduce((worst, current) => {
    const worstScore = calculateScenarioScore(worst);
    const currentScore = calculateScenarioScore(current);
    return currentScore < worstScore ? current : worst;
  });
}

/**
 * Calculate performance score for a scenario
 */
function calculateScenarioScore(result) {
  let score = 0;

  // Lower latency = higher score
  score += Math.max(0, 100 - (result.latency.avg / 10));

  // Lower error rate = higher score
  score += Math.max(0, 100 - result.errorRate * 2);

  // Higher throughput = higher score
  score += Math.min(100, result.throughputStats.average * 2);

  return score;
}

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================

// Make benchmark tools globally available
window.PerformanceBenchmark = PerformanceBenchmark;
window.runScenario = runScenario;
window.runMultipleScenarios = runMultipleScenarios;
window.generateBenchmarkReport = generateBenchmarkReport;
window.BENCHMARK_SCENARIOS = BENCHMARK_SCENARIOS;

console.log('🔬 Performance Benchmark Suite loaded successfully!');
