/**
 * Performance Benchmarking Framework
 * Worker Communication Optimization
 *
 * Comprehensive benchmarking for JSON vs YAML messaging performance
 */

import { YAML } from "bun";
import { WorkerMessenger } from "../core/worker-messenger";

export interface BenchmarkResult {
  format: "json" | "yaml";
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  throughput: number; // messages per second
  sizes: {
    average: number;
    min: number;
    max: number;
  };
  compressionRatio?: number;
}

export interface BenchmarkComparison {
  json: BenchmarkResult;
  yaml: BenchmarkResult;
  improvement: {
    latency: number; // percentage improvement
    throughput: number; // percentage improvement
    size: number; // percentage reduction
  };
  recommendation: string;
}

export interface MessageTestData {
  settlement: {
    id: string;
    customerId: string;
    amount: number;
    status: string;
    event: {
      id: string;
      betType: string;
    };
    processing: {
      processedBy: string;
      processingTime: number;
      retryCount: number;
      queuePosition: number;
    };
    metadata: {
      sourceDomain: string;
      targetDomain: string;
      priority: string;
      ttl: number;
    };
  };
}

export class MessagePerformanceBenchmark {
  private results: {
    json: { times: number[]; sizes: number[] };
    yaml: { times: number[]; sizes: number[] };
  };

  constructor() {
    this.results = {
      json: { times: [], sizes: [] },
      yaml: { times: [], sizes: [] },
    };
  }

  /**
   * Run comprehensive benchmark comparing JSON vs YAML
   */
  async runBenchmark(
    message: MessageTestData,
    iterations: number = 1000,
    options: {
      enableCompression?: boolean;
      enableBatching?: boolean;
      batchSize?: number;
    } = {},
  ): Promise<BenchmarkComparison> {
    console.log(`🧪 Running performance benchmark: ${iterations} iterations`);

    // Benchmark JSON serialization
    console.log("📊 Benchmarking JSON serialization...");
    const jsonResult = await this.benchmarkFormat("json", message, iterations);

    // Benchmark YAML serialization
    console.log("📊 Benchmarking YAML serialization...");
    const yamlResult = await this.benchmarkFormat(
      "yaml",
      message,
      iterations,
      options,
    );

    // Calculate improvements
    const improvement = this.calculateImprovement(jsonResult, yamlResult);

    // Generate recommendation
    const recommendation = this.generateRecommendation(improvement);

    const comparison: BenchmarkComparison = {
      json: jsonResult,
      yaml: yamlResult,
      improvement,
      recommendation,
    };

    console.log("✅ Benchmark completed");
    this.printResults(comparison);

    return comparison;
  }

  /**
   * Benchmark specific format
   */
  private async benchmarkFormat(
    format: "json" | "yaml",
    message: MessageTestData,
    iterations: number,
    options: { enableCompression?: boolean } = {},
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    const sizes: number[] = [];
    let compressionRatio = 1.0;

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      let serialized: string;
      let originalSize: number;

      if (format === "json") {
        serialized = JSON.stringify(message);
        originalSize = new Blob([serialized]).size;

        // Round-trip test
        JSON.parse(serialized);
      } else {
        // YAML serialization
        serialized = YAML.stringify(message);
        originalSize = new Blob([serialized]).size;

        // Apply compression if enabled
        if (options.enableCompression && serialized.length > 1024) {
          const compressed = `COMPRESSED:${btoa(serialized)}`;
          compressionRatio = serialized.length / compressed.length;
          serialized = compressed;
        }

        // Round-trip test
        let dataToParse = serialized;
        if (dataToParse.startsWith("COMPRESSED:")) {
          dataToParse = atob(dataToParse.substring("COMPRESSED:".length));
        }
        YAML.parse(dataToParse);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      times.push(duration);
      sizes.push(new Blob([serialized]).size);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = iterations / (totalTime / 1000); // messages per second

    return {
      format,
      iterations,
      totalTime,
      averageTime: avgTime,
      minTime,
      maxTime,
      throughput,
      sizes: {
        average: sizes.reduce((sum, size) => sum + size, 0) / sizes.length,
        min: Math.min(...sizes),
        max: Math.max(...sizes),
      },
      compressionRatio: format === "yaml" ? compressionRatio : undefined,
    };
  }

  /**
   * Calculate performance improvements
   */
  private calculateImprovement(
    json: BenchmarkResult,
    yaml: BenchmarkResult,
  ): BenchmarkComparison["improvement"] {
    const latencyImprovement =
      ((json.averageTime - yaml.averageTime) / json.averageTime) * 100;
    const throughputImprovement =
      ((yaml.throughput - json.throughput) / json.throughput) * 100;
    const sizeReduction =
      ((json.sizes.average - yaml.sizes.average) / json.sizes.average) * 100;

    return {
      latency: latencyImprovement,
      throughput: throughputImprovement,
      size: sizeReduction,
    };
  }

  /**
   * Generate performance recommendation
   */
  private generateRecommendation(
    improvement: BenchmarkComparison["improvement"],
  ): string {
    let recommendation = "YAML messaging recommended for ";

    if (improvement.latency > 50) {
      recommendation += "significant latency improvement. ";
    } else if (improvement.latency > 20) {
      recommendation += "moderate latency improvement. ";
    } else {
      recommendation += "minimal latency improvement. ";
    }

    if (improvement.throughput > 100) {
      recommendation += "Excellent throughput gains. ";
    } else if (improvement.throughput > 50) {
      recommendation += "Good throughput improvement. ";
    }

    if (improvement.size > 30) {
      recommendation += "Significant message size reduction. ";
    }

    if (improvement.latency > 30 && improvement.throughput > 50) {
      recommendation += "Strong recommendation for production deployment.";
    } else if (improvement.latency > 10 || improvement.throughput > 25) {
      recommendation += "Consider for production with monitoring.";
    } else {
      recommendation += "Evaluate further or maintain JSON for stability.";
    }

    return recommendation;
  }

  /**
   * Print benchmark results
   */
  private printResults(comparison: BenchmarkComparison): void {
    console.log("\n📊 PERFORMANCE BENCHMARK RESULTS");
    console.log("=".repeat(60));

    console.log("\n📈 LATENCY COMPARISON:");
    console.log(`JSON Average: ${comparison.json.averageTime.toFixed(3)}ms`);
    console.log(`YAML Average: ${comparison.yaml.averageTime.toFixed(3)}ms`);
    console.log(`Improvement: ${comparison.improvement.latency.toFixed(2)}%`);

    console.log("\n⚡ THROUGHPUT COMPARISON:");
    console.log(`JSON: ${comparison.json.throughput.toFixed(0)} msg/sec`);
    console.log(`YAML: ${comparison.yaml.throughput.toFixed(0)} msg/sec`);
    console.log(
      `Improvement: ${comparison.improvement.throughput.toFixed(2)}%`,
    );

    console.log("\n💾 SIZE COMPARISON:");
    console.log(
      `JSON Average: ${comparison.json.sizes.average.toFixed(0)} bytes`,
    );
    console.log(
      `YAML Average: ${comparison.yaml.sizes.average.toFixed(0)} bytes`,
    );
    console.log(`Reduction: ${comparison.improvement.size.toFixed(2)}%`);

    if (
      comparison.yaml.compressionRatio &&
      comparison.yaml.compressionRatio < 1
    ) {
      console.log(
        `Compression Ratio: ${comparison.yaml.compressionRatio.toFixed(2)}x`,
      );
    }

    console.log("\n🎯 RECOMMENDATION:");
    console.log(comparison.recommendation);

    console.log("\n" + "=".repeat(60));
  }

  /**
   * Run stress test with increasing load
   */
  async runStressTest(
    message: MessageTestData,
    maxIterations: number = 10000,
    stepSize: number = 1000,
  ): Promise<{
    loadPoints: number[];
    jsonThroughput: number[];
    yamlThroughput: number[];
    jsonLatency: number[];
    yamlLatency: number[];
  }> {
    console.log(`🔥 Running stress test: up to ${maxIterations} iterations`);

    const results = {
      loadPoints: [] as number[],
      jsonThroughput: [] as number[],
      yamlThroughput: [] as number[],
      jsonLatency: [] as number[],
      yamlLatency: [] as number[],
    };

    for (
      let iterations = stepSize;
      iterations <= maxIterations;
      iterations += stepSize
    ) {
      console.log(`📊 Testing ${iterations} iterations...`);

      // Quick benchmark for this load point
      const jsonResult = await this.benchmarkFormat(
        "json",
        message,
        Math.min(iterations, 100),
      );
      const yamlResult = await this.benchmarkFormat(
        "yaml",
        message,
        Math.min(iterations, 100),
      );

      results.loadPoints.push(iterations);
      results.jsonThroughput.push(
        jsonResult.throughput * (iterations / Math.min(iterations, 100)),
      );
      results.yamlThroughput.push(
        yamlResult.throughput * (iterations / Math.min(iterations, 100)),
      );
      results.jsonLatency.push(jsonResult.averageTime);
      results.yamlLatency.push(yamlResult.averageTime);
    }

    console.log("✅ Stress test completed");
    return results;
  }

  /**
   * Generate performance report
   */
  generateReport(comparison: BenchmarkComparison): string {
    return YAML.stringify({
      reportType: "WORKER_MESSAGING_PERFORMANCE",
      timestamp: new Date().toISOString(),
      benchmark: {
        iterations: comparison.json.iterations,
        messageType: "settlement_update",
      },
      results: {
        json: {
          averageLatency: comparison.json.averageTime,
          throughput: comparison.json.throughput,
          averageSize: comparison.json.sizes.average,
        },
        yaml: {
          averageLatency: comparison.yaml.averageTime,
          throughput: comparison.yaml.throughput,
          averageSize: comparison.yaml.sizes.average,
          compressionRatio: comparison.yaml.compressionRatio,
        },
        improvement: comparison.improvement,
      },
      recommendation: comparison.recommendation,
      metadata: {
        testEnvironment: "bun_runtime",
        yamlVersion: "latest",
        benchmarkVersion: "1.0",
      },
    });
  }

  /**
   * Export benchmark data for analysis
   */
  exportData(comparison: BenchmarkComparison): {
    summary: any;
    rawData: any;
    charts: any;
  } {
    return {
      summary: {
        yaml_vs_json_latency_improvement: `${comparison.improvement.latency.toFixed(2)}%`,
        yaml_vs_json_throughput_improvement: `${comparison.improvement.throughput.toFixed(2)}%`,
        message_size_reduction: `${comparison.improvement.size.toFixed(2)}%`,
        recommendation: comparison.recommendation,
      },
      rawData: {
        json: comparison.json,
        yaml: comparison.yaml,
      },
      charts: {
        latencyComparison: {
          json: comparison.json.averageTime,
          yaml: comparison.yaml.averageTime,
        },
        throughputComparison: {
          json: comparison.json.throughput,
          yaml: comparison.yaml.throughput,
        },
        sizeComparison: {
          json: comparison.json.sizes.average,
          yaml: comparison.yaml.sizes.average,
        },
      },
    };
  }
}

/**
 * Quick benchmark utility for development
 */
export async function quickBenchmark(
  message: any,
  iterations: number = 100,
): Promise<{ json: number; yaml: number; improvement: number }> {
  const benchmark = new MessagePerformanceBenchmark();

  const jsonStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    const serialized = JSON.stringify(message);
    JSON.parse(serialized);
  }
  const jsonTime = performance.now() - jsonStart;

  const yamlStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    const serialized = YAML.stringify(message);
    YAML.parse(serialized);
  }
  const yamlTime = performance.now() - yamlStart;

  const improvement = ((jsonTime - yamlTime) / jsonTime) * 100;

  console.log(`🚀 Quick Benchmark (${iterations} iterations):`);
  console.log(`JSON: ${jsonTime.toFixed(2)}ms`);
  console.log(`YAML: ${yamlTime.toFixed(2)}ms`);
  console.log(`Improvement: ${improvement.toFixed(2)}%`);

  return {
    json: jsonTime,
    yaml: yamlTime,
    improvement,
  };
}
