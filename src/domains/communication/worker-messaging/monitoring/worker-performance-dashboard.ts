/**
 * Worker Performance Dashboard
 * Worker Communication Optimization Monitoring
 *
 * Comprehensive monitoring for YAML-based worker messaging performance
 */

import { YAML } from "bun";
import { WorkerMessenger, WorkerMetrics } from "../core/worker-messenger";

export interface PerformanceMetrics {
  messagesProcessed: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
  compressionRatio: number;
  batchEfficiency: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  cooldown: number; // minutes
}

export interface Alert {
  id: string;
  ruleId: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metrics: PerformanceMetrics;
  resolved: boolean;
  resolvedAt?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface PerformanceReport {
  period: string;
  startTime: string;
  endTime: string;
  summary: {
    totalMessages: number;
    averageLatency: number;
    errorRate: number;
    throughput: number;
    compressionRatio: number;
  };
  alerts: Alert[];
  recommendations: string[];
  trends: {
    latency: "improving" | "stable" | "degrading";
    throughput: "improving" | "stable" | "degrading";
    errors: "improving" | "stable" | "degrading";
  };
}

export class WorkerPerformanceDashboard {
  private metrics: PerformanceMetrics;
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private messengers: Map<string, WorkerMessenger> = new Map();
  private startTime: number;
  private alertHistory: Map<string, number> = new Map(); // ruleId -> lastTriggered

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      messagesProcessed: 0,
      averageLatency: 0,
      errorRate: 0,
      throughput: 0,
      compressionRatio: 1.0,
      batchEfficiency: 1.0,
      memoryUsage: 0,
      cpuUsage: 0,
    };

    this.setupDefaultAlertRules();
  }

  /**
   * Register a worker messenger for monitoring
   */
  registerMessenger(domainName: string, messenger: WorkerMessenger): void {
    this.messengers.set(domainName, messenger);
    console.log(`📊 Registered messenger for domain: ${domainName}`);
  }

  /**
   * Update metrics from all registered messengers
   */
  updateMetrics(): void {
    let totalMessages = 0;
    let totalLatency = 0;
    let totalErrors = 0;
    let totalThroughput = 0;
    let totalCompressionRatio = 0;
    let totalBatchEfficiency = 0;
    let messengerCount = 0;

    for (const [domainName, messenger] of this.messengers.entries()) {
      const messengerMetrics = messenger.getMetrics();

      totalMessages +=
        messengerMetrics.messagesSent + messengerMetrics.messagesReceived;
      totalLatency += messengerMetrics.averageLatency;
      totalErrors += messengerMetrics.errors;
      totalCompressionRatio += messengerMetrics.compressionRatio;
      totalBatchEfficiency += messengerMetrics.batchEfficiency;
      messengerCount++;

      // Calculate messenger-specific throughput
      const uptime = (Date.now() - this.startTime) / 1000; // seconds
      const messengerThroughput =
        (messengerMetrics.messagesSent + messengerMetrics.messagesReceived) /
        uptime;
      totalThroughput += messengerThroughput;
    }

    if (messengerCount > 0) {
      this.metrics.messagesProcessed = totalMessages;
      this.metrics.averageLatency = totalLatency / messengerCount;
      this.metrics.errorRate =
        totalMessages > 0 ? (totalErrors / totalMessages) * 100 : 0;
      this.metrics.throughput = totalThroughput;
      this.metrics.compressionRatio = totalCompressionRatio / messengerCount;
      this.metrics.batchEfficiency = totalBatchEfficiency / messengerCount;
    }

    // Update system metrics
    this.updateSystemMetrics();

    // Check for alerts
    this.checkAlerts();
  }

  /**
   * Update system resource metrics
   */
  private updateSystemMetrics(): void {
    // Memory usage (simplified - in real implementation, use actual system metrics)
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage = memUsage.heapUsed / memUsage.heapTotal;
    }

    // CPU usage (simplified - in real implementation, use actual system metrics)
    // This would typically use a library like 'pidusage' or similar
    this.metrics.cpuUsage = Math.random() * 0.1 + 0.05; // Mock value for demonstration
  }

  /**
   * Setup default alert rules
   */
  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: "high_latency",
        name: "High Latency Alert",
        condition: (metrics) => metrics.averageLatency > 100,
        severity: "high",
        message: "Average message latency exceeds 100ms threshold",
        cooldown: 5,
      },
      {
        id: "high_error_rate",
        name: "High Error Rate Alert",
        condition: (metrics) => metrics.errorRate > 1.0,
        severity: "high",
        message: "Message error rate exceeds 1% threshold",
        cooldown: 10,
      },
      {
        id: "low_throughput",
        name: "Low Throughput Alert",
        condition: (metrics) => metrics.throughput < 50,
        severity: "medium",
        message: "Message throughput below 50 messages/second",
        cooldown: 15,
      },
      {
        id: "high_memory_usage",
        name: "High Memory Usage Alert",
        condition: (metrics) => metrics.memoryUsage > 0.8,
        severity: "critical",
        message: "Memory usage exceeds 80% threshold",
        cooldown: 2,
      },
      {
        id: "compression_inefficient",
        name: "Compression Inefficient Alert",
        condition: (metrics) => metrics.compressionRatio > 2.0,
        severity: "low",
        message: "Message compression ratio indicates inefficiency",
        cooldown: 30,
      },
    ];
  }

  /**
   * Check for alert conditions
   */
  private checkAlerts(): void {
    const now = Date.now();

    for (const rule of this.alertRules) {
      const lastTriggered = this.alertHistory.get(rule.id) || 0;
      const cooldownMs = rule.cooldown * 60 * 1000; // convert to milliseconds

      // Check cooldown period
      if (now - lastTriggered < cooldownMs) {
        continue;
      }

      // Check condition
      if (rule.condition(this.metrics)) {
        const alert: Alert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          timestamp: new Date().toISOString(),
          severity: rule.severity,
          message: rule.message,
          metrics: { ...this.metrics },
          resolved: false,
          acknowledged: false,
        };

        this.alerts.push(alert);
        this.alertHistory.set(rule.id, now);

        console.log(
          `🚨 ALERT [${rule.severity.toUpperCase()}]: ${rule.message}`,
        );

        // In real implementation, this would send notifications
        this.sendAlertNotification(alert);
      }
    }
  }

  /**
   * Send alert notification (placeholder for actual implementation)
   */
  private sendAlertNotification(alert: Alert): void {
    // This would integrate with email, Slack, monitoring systems, etc.
    console.log(
      `📢 Sending ${alert.severity} alert notification:`,
      alert.message,
    );

    // Example integrations:
    // - Send email via SMTP
    // - Post to Slack webhook
    // - Send to monitoring dashboard
    // - Trigger PagerDuty alert
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const now = new Date();
    const period = `${Math.floor((now.getTime() - this.startTime) / (1000 * 60))} minutes`;

    const recommendations = this.generateRecommendations();

    // Calculate trends (simplified - in real implementation, use historical data)
    const trends = {
      latency: this.metrics.averageLatency < 50 ? "improving" : "stable",
      throughput: this.metrics.throughput > 100 ? "improving" : "stable",
      errors: this.metrics.errorRate < 0.5 ? "improving" : "stable",
    };

    return {
      period,
      startTime: new Date(this.startTime).toISOString(),
      endTime: now.toISOString(),
      summary: {
        totalMessages: this.metrics.messagesProcessed,
        averageLatency: this.metrics.averageLatency,
        errorRate: this.metrics.errorRate,
        throughput: this.metrics.throughput,
        compressionRatio: this.metrics.compressionRatio,
      },
      alerts: this.getActiveAlerts(),
      recommendations,
      trends,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.averageLatency > 100) {
      recommendations.push(
        "Consider implementing message batching for high-volume operations",
      );
    }

    if (this.metrics.errorRate > 0.5) {
      recommendations.push(
        "Review message validation logic and error handling",
      );
    }

    if (this.metrics.throughput < 100) {
      recommendations.push("Evaluate worker pool sizing and load distribution");
    }

    if (this.metrics.memoryUsage > 0.8) {
      recommendations.push(
        "Monitor memory usage and consider implementing message cleanup",
      );
    }

    if (this.metrics.compressionRatio < 1.2) {
      recommendations.push(
        "Evaluate compression settings for better efficiency",
      );
    }

    if (this.alerts.filter((a) => !a.acknowledged).length > 5) {
      recommendations.push("Review and acknowledge pending alerts");
    }

    return recommendations;
  }

  /**
   * Export metrics in YAML format
   */
  exportMetrics(): string {
    const report = this.generateReport();
    return YAML.stringify({
      reportType: "WORKER_PERFORMANCE_DASHBOARD",
      timestamp: new Date().toISOString(),
      ...report,
    });
  }

  /**
   * Get dashboard summary
   */
  getDashboardSummary(): {
    status: "healthy" | "warning" | "critical";
    uptime: string;
    keyMetrics: {
      messagesProcessed: number;
      averageLatency: string;
      errorRate: string;
      throughput: string;
      activeAlerts: number;
    };
    recentAlerts: Alert[];
  } {
    const uptime = `${Math.floor((Date.now() - this.startTime) / (1000 * 60))}m`;
    const activeAlerts = this.getActiveAlerts();

    let status: "healthy" | "warning" | "critical" = "healthy";
    if (activeAlerts.some((a) => a.severity === "critical")) {
      status = "critical";
    } else if (activeAlerts.some((a) => a.severity === "high")) {
      status = "warning";
    }

    return {
      status,
      uptime,
      keyMetrics: {
        messagesProcessed: this.metrics.messagesProcessed,
        averageLatency: `${this.metrics.averageLatency.toFixed(2)}ms`,
        errorRate: `${this.metrics.errorRate.toFixed(2)}%`,
        throughput: `${this.metrics.throughput.toFixed(0)} msg/sec`,
        activeAlerts: activeAlerts.length,
      },
      recentAlerts: activeAlerts.slice(0, 5), // Last 5 alerts
    };
  }

  /**
   * Reset metrics (useful for testing or manual reset)
   */
  reset(): void {
    this.metrics = {
      messagesProcessed: 0,
      averageLatency: 0,
      errorRate: 0,
      throughput: 0,
      compressionRatio: 1.0,
      batchEfficiency: 1.0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
    this.alerts = [];
    this.alertHistory.clear();
    this.startTime = Date.now();
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex((rule) => rule.id === ruleId);
    if (index >= 0) {
      this.alertRules.splice(index, 1);
      return true;
    }
    return false;
  }
}

/**
 * Health check utility
 */
export async function performHealthCheck(
  dashboard: WorkerPerformanceDashboard,
): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  checks: Record<string, boolean>;
  message: string;
}> {
  const metrics = dashboard.getMetrics();
  const alerts = dashboard.getActiveAlerts();

  const checks = {
    latency_ok: metrics.averageLatency < 100,
    error_rate_ok: metrics.errorRate < 1.0,
    throughput_ok: metrics.throughput > 50,
    memory_ok: metrics.memoryUsage < 0.9,
    no_critical_alerts: !alerts.some((a) => a.severity === "critical"),
  };

  const allChecksPass = Object.values(checks).every((check) => check);

  let status: "healthy" | "degraded" | "unhealthy";
  let message: string;

  if (allChecksPass) {
    status = "healthy";
    message = "All systems operating normally";
  } else if (
    alerts.some((a) => a.severity === "critical") ||
    !checks.memory_ok
  ) {
    status = "unhealthy";
    message = "Critical issues detected - immediate attention required";
  } else {
    status = "degraded";
    message = "Some systems showing degradation - monitor closely";
  }

  return { status, checks, message };
}
