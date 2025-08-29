/**
 * Financial Reporting Service Tests
 * Comprehensive testing following DDD patterns
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { FinancialReportingService, FinancialReportingServiceFactory } from './services/financial-reporting-service';
import { SQLiteFinancialReportingRepository } from './repositories/financial-reporting-repository';
import { ReportType, ReportStatus, ComplianceStatus } from './entities/financial-report';

// Mock services for testing
class MockCollectionsService {
  async calculateRevenue(timeRange: any) {
    return {
      totalCollections: 150,
      successfulCollections: 145,
      failedCollections: 5,
      totalAmount: 75000,
      averageAmount: 500,
      collectionsByMethod: { card: 100, bank_transfer: 45, wallet: 5 },
      collectionsByCurrency: { USD: 150 },
      processingTime: { average: 1200, min: 800, max: 2500 }
    };
  }
}

class MockSettlementsService {
  async getSettlementAnalytics(merchantId: any, dateRange: any) {
    return {
      totalSettlements: 145,
      successfulSettlements: 140,
      pendingSettlements: 3,
      failedSettlements: 2,
      totalAmount: 72500,
      totalFees: 725,
      netAmount: 71775,
      settlementsByMerchant: { merchant_1: 100, merchant_2: 45 },
      averageProcessingTime: 1800,
      settlementSuccessRate: 96.55
    };
  }
}

class MockBalanceService {
  async getSystemBalanceSummary() {
    return {
      totalActiveBalances: 1000,
      totalBalanceAmount: 500000,
      averageBalance: 500,
      lowBalanceAlerts: 50,
      frozenBalances: 5,
      balanceDistribution: { low: 200, medium: 600, high: 200 },
      thresholdBreaches: 25
    };
  }
}

describe('FinancialReportingService', () => {
  let service: FinancialReportingService;
  let mockCollectionsService: MockCollectionsService;
  let mockSettlementsService: MockSettlementsService;
  let mockBalanceService: MockBalanceService;

  beforeEach(() => {
    mockCollectionsService = new MockCollectionsService();
    mockSettlementsService = new MockSettlementsService();
    mockBalanceService = new MockBalanceService();

    service = FinancialReportingServiceFactory.create(
      new SQLiteFinancialReportingRepository(':memory:'),
      {
        collectionsService: mockCollectionsService,
        settlementsService: mockSettlementsService,
        balanceService: mockBalanceService
      }
    );
  });

  describe('generateReport', () => {
    it('should successfully generate a comprehensive financial report', async () => {
      const request = {
        reportType: ReportType.MONTHLY,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        includeCollections: true,
        includeSettlements: true,
        includeBalances: true,
        includeRevenue: true,
        includeCompliance: true
      };

      const result = await service.generateReport(request);

      expect(result).toBeDefined();
      expect(result.report).toBeDefined();
      expect(result.report.getId()).toMatch(/^report_/);
      expect(result.report.getReportType()).toBe(ReportType.MONTHLY);
      expect(result.report.getStatus()).toBe(ReportStatus.DRAFT);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.dataSources).toContain('collections');
      expect(result.dataSources).toContain('settlements');
      expect(result.dataSources).toContain('balance');
      expect(result.dataSources).toContain('compliance');

      // Verify aggregated data
      const summary = result.report.getSummary();
      expect(summary.totalCollections).toBe(150);
      expect(summary.totalSettlements).toBe(145);
      expect(summary.totalRevenue).toBe(75000);
      expect(summary.netProfit).toBe(74275); // 75000 - 725
    });

    it('should reject report generation with invalid period', async () => {
      const request = {
        reportType: ReportType.WEEKLY,
        periodStart: new Date('2024-01-31'),
        periodEnd: new Date('2024-01-01') // End before start
      };

      await expect(service.generateReport(request)).rejects.toThrow('Period start must be before period end');
    });

    it('should reject report generation with invalid report type', async () => {
      const request = {
        reportType: 'invalid_type' as any,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31')
      };

      await expect(service.generateReport(request)).rejects.toThrow('Invalid report type');
    });

    it('should handle missing optional services gracefully', async () => {
      const serviceWithoutServices = FinancialReportingServiceFactory.create(
        new SQLiteFinancialReportingRepository(':memory:')
      );

      const request = {
        reportType: ReportType.DAILY,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-01'),
        includeCollections: false,
        includeSettlements: false,
        includeBalances: false
      };

      const result = await serviceWithoutServices.generateReport(request);

      expect(result).toBeDefined();
      expect(result.report).toBeDefined();
      expect(result.dataSources).not.toContain('collections');
      expect(result.dataSources).not.toContain('settlements');
      expect(result.dataSources).not.toContain('balance');
    });

    it('should generate reports with different types', async () => {
      const reportTypes = [ReportType.DAILY, ReportType.WEEKLY, ReportType.MONTHLY, ReportType.QUARTERLY];

      for (const reportType of reportTypes) {
        const request = {
          reportType,
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-01-31')
        };

        const result = await service.generateReport(request);
        expect(result.report.getReportType()).toBe(reportType);
      }
    });
  });

  describe('approveReport', () => {
    let reportId: string;

    beforeEach(async () => {
      const request = {
        reportType: ReportType.MONTHLY,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31')
      };

      const result = await service.generateReport(request);
      reportId = result.report.getId();
    });

    it('should successfully approve a draft report', async () => {
      const approvedReport = await service.approveReport(reportId, 'test_approver');

      expect(approvedReport.getStatus()).toBe(ReportStatus.APPROVED);
      expect(approvedReport.getApprovedBy()).toBe('test_approver');
      expect(approvedReport.getApprovedAt()).toBeInstanceOf(Date);
    });

    it('should reject approval of non-draft report', async () => {
      // First approve the report
      await service.approveReport(reportId, 'test_approver');

      // Try to approve again
      await expect(service.approveReport(reportId, 'another_approver'))
        .rejects.toThrow('Cannot approve report with status: approved');
    });

    it('should reject approval of non-existent report', async () => {
      await expect(service.approveReport('non_existent_id', 'test_approver'))
        .rejects.toThrow('Financial report not found');
    });
  });

  describe('publishReport', () => {
    let reportId: string;

    beforeEach(async () => {
      const request = {
        reportType: ReportType.MONTHLY,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31')
      };

      const result = await service.generateReport(request);
      reportId = result.report.getId();

      // Approve the report first
      await service.approveReport(reportId, 'test_approver');
    });

    it('should successfully publish an approved report', async () => {
      const publishedReport = await service.publishReport(reportId);

      expect(publishedReport.getStatus()).toBe(ReportStatus.PUBLISHED);
      expect(publishedReport.getPublishedAt()).toBeInstanceOf(Date);
    });

    it('should reject publishing of non-approved report', async () => {
      // Create a new draft report
      const request = {
        reportType: ReportType.WEEKLY,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-07')
      };

      const result = await service.generateReport(request);

      await expect(service.publishReport(result.report.getId()))
        .rejects.toThrow('Cannot publish report with status: draft');
    });
  });

  describe('checkCompliance', () => {
    let reportId: string;

    beforeEach(async () => {
      const request = {
        reportType: ReportType.MONTHLY,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31')
      };

      const result = await service.generateReport(request);
      reportId = result.report.getId();
    });

    it('should perform comprehensive compliance check', async () => {
      const reports = await service.searchReports({});
      const report = reports.find(r => r.getId() === reportId)!;

      const complianceResult = await service.checkCompliance(report);

      expect(complianceResult).toBeDefined();
      expect(complianceResult.reportId).toBe(reportId);
      expect(complianceResult.isCompliant).toBe(true);
      expect(complianceResult.issues).toBeDefined();
      expect(complianceResult.recommendations).toBeDefined();
    });

    it('should identify critical compliance issues', async () => {
      // Create a report with negative revenue (simulating compliance issue)
      const reports = await service.searchReports({});
      const report = reports.find(r => r.getId() === reportId)!;

      // Mock a report with critical issues
      const mockReport = {
        ...report,
        getSummary: () => ({ totalRevenue: -1000 }),
        getCompliance: () => ({
          pciDssCompliant: false,
          amlCompliant: true,
          kycCompliant: true,
          gdprCompliant: true,
          auditTrailComplete: true,
          requiredFilings: [],
          complianceIssues: []
        })
      };

      const complianceResult = await service.checkCompliance(mockReport as any);

      expect(complianceResult.isCompliant).toBe(false);
      expect(complianceResult.issues.length).toBeGreaterThan(0);
      expect(complianceResult.issues.some(issue => issue.severity === 'critical')).toBe(true);
    });
  });

  describe('getAnalytics', () => {
    beforeEach(async () => {
      // Generate multiple reports for analytics
      const reportTypes = [ReportType.DAILY, ReportType.WEEKLY, ReportType.MONTHLY];
      const periods = [
        { start: '2024-01-01', end: '2024-01-01' },
        { start: '2024-01-01', end: '2024-01-07' },
        { start: '2024-01-01', end: '2024-01-31' }
      ];

      for (let i = 0; i < reportTypes.length; i++) {
        const request = {
          reportType: reportTypes[i],
          periodStart: new Date(periods[i].start),
          periodEnd: new Date(periods[i].end)
        };

        await service.generateReport(request);
      }
    });

    it('should generate comprehensive analytics', async () => {
      const analytics = await service.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.period).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.totalReports).toBeGreaterThan(0);
      expect(analytics.trends).toBeDefined();
      expect(analytics.trends.revenue).toBeDefined();
      expect(analytics.trends.compliance).toBeDefined();
      expect(analytics.trends.volume).toBeDefined();
      expect(analytics.alerts).toBeDefined();
    });

    it('should calculate compliance rate correctly', async () => {
      const analytics = await service.getAnalytics();

      expect(analytics.summary.complianceRate).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.complianceRate).toBeLessThanOrEqual(100);
    });

    it('should generate alerts for issues', async () => {
      // Create an overdue report
      const overdueRequest = {
        reportType: ReportType.DAILY,
        periodStart: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        periodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000)   // 1 day ago
      };

      await service.generateReport(overdueRequest);

      const analytics = await service.getAnalytics();

      expect(analytics.alerts.length).toBeGreaterThan(0);
    });
  });

  describe('searchReports', () => {
    beforeEach(async () => {
      // Generate test reports
      const reports = [
        { type: ReportType.DAILY, status: ReportStatus.DRAFT },
        { type: ReportType.WEEKLY, status: ReportStatus.PENDING_REVIEW },
        { type: ReportType.MONTHLY, status: ReportStatus.APPROVED },
        { type: ReportType.QUARTERLY, status: ReportStatus.PUBLISHED }
      ];

      for (const report of reports) {
        const request = {
          reportType: report.type,
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-01-31')
        };

        const result = await service.generateReport(request);

        // Update status for testing
        if (report.status !== ReportStatus.DRAFT) {
          const reportEntity = result.report;
          // Note: In a real implementation, we'd have methods to update status directly
        }
      }
    });

    it('should search reports by type', async () => {
      const dailyReports = await service.searchReports({ reportType: ReportType.DAILY });
      const weeklyReports = await service.searchReports({ reportType: ReportType.WEEKLY });

      expect(dailyReports.length).toBeGreaterThan(0);
      expect(weeklyReports.length).toBeGreaterThan(0);

      dailyReports.forEach(report => {
        expect(report.getReportType()).toBe(ReportType.DAILY);
      });

      weeklyReports.forEach(report => {
        expect(report.getReportType()).toBe(ReportType.WEEKLY);
      });
    });

    it('should search reports by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const reports = await service.searchReports({
        periodStart: startDate,
        periodEnd: endDate
      });

      expect(reports.length).toBeGreaterThan(0);

      reports.forEach(report => {
        expect(report.getPeriodStart().getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(report.getPeriodEnd().getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should handle pagination', async () => {
      const allReports = await service.searchReports({ limit: 100 });
      const paginatedReports = await service.searchReports({ limit: 2, offset: 1 });

      expect(paginatedReports.length).toBeLessThanOrEqual(2);
      expect(allReports.length).toBeGreaterThanOrEqual(paginatedReports.length);
    });
  });

  describe('getReportsRequiringAttention', () => {
    beforeEach(async () => {
      // Generate reports with different statuses
      const reports = [
        { type: ReportType.DAILY, overdue: true },
        { type: ReportType.WEEKLY, complianceIssue: true },
        { type: ReportType.MONTHLY, pendingReview: true }
      ];

      for (const report of reports) {
        const periodEnd = report.overdue
          ? new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
          : new Date('2024-01-31');

        const request = {
          reportType: report.type,
          periodStart: new Date('2024-01-01'),
          periodEnd
        };

        await service.generateReport(request);
      }
    });

    it('should identify reports requiring attention', async () => {
      const attentionReports = await service.getReportsRequiringAttention();

      expect(attentionReports.length).toBeGreaterThan(0);

      // All returned reports should require attention
      attentionReports.forEach(report => {
        expect(report.requiresAttention()).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailability gracefully', async () => {
      // Create service with broken dependencies
      const brokenService = FinancialReportingServiceFactory.create(
        new SQLiteFinancialReportingRepository(':memory:'),
        {
          collectionsService: { calculateRevenue: () => Promise.reject(new Error('Service unavailable')) },
          settlementsService: mockSettlementsService,
          balanceService: mockBalanceService
        }
      );

      const request = {
        reportType: ReportType.MONTHLY,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        includeCollections: true
      };

      // Should not throw, but should handle the error gracefully
      const result = await brokenService.generateReport(request);
      expect(result).toBeDefined();
      expect(result.report).toBeDefined();
      // Data sources should not include collections due to error
      expect(result.dataSources).not.toContain('collections');
    });

    it('should validate all required parameters', async () => {
      const invalidRequests = [
        { reportType: null, periodStart: new Date(), periodEnd: new Date() },
        { reportType: ReportType.MONTHLY, periodStart: null, periodEnd: new Date() },
        { reportType: ReportType.MONTHLY, periodStart: new Date(), periodEnd: null },
        { reportType: ReportType.MONTHLY, periodStart: new Date('2024-01-31'), periodEnd: new Date('2024-01-01') }
      ];

      for (const request of invalidRequests) {
        await expect(service.generateReport(request as any)).rejects.toThrow();
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent report generations', async () => {
      const requests = Array(5).fill(null).map((_, i) => ({
        reportType: ReportType.DAILY,
        periodStart: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        periodEnd: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`)
      }));

      const startTime = Date.now();
      const results = await Promise.all(requests.map(req => service.generateReport(req)));
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.report).toBeDefined();
        expect(result.processingTime).toBeGreaterThan(0);
      });

      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle large date ranges efficiently', async () => {
      const request = {
        reportType: ReportType.CUSTOM,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-12-31') // Full year
      };

      const startTime = Date.now();
      const result = await service.generateReport(request);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.report).toBeDefined();

      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('Integration Tests', () => {
    it('should complete full report lifecycle', async () => {
      // 1. Generate report
      const generateRequest = {
        reportType: ReportType.MONTHLY,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31')
      };

      const generateResult = await service.generateReport(generateRequest);
      expect(generateResult.report.getStatus()).toBe(ReportStatus.DRAFT);

      // 2. Check compliance
      const complianceResult = await service.checkCompliance(generateResult.report);
      expect(complianceResult).toBeDefined();

      // 3. Approve report
      const approvedReport = await service.approveReport(generateResult.report.getId(), 'test_approver');
      expect(approvedReport.getStatus()).toBe(ReportStatus.APPROVED);

      // 4. Publish report
      const publishedReport = await service.publishReport(generateResult.report.getId());
      expect(publishedReport.getStatus()).toBe(ReportStatus.PUBLISHED);

      // 5. Verify in search results
      const publishedReports = await service.searchReports({ status: ReportStatus.PUBLISHED });
      expect(publishedReports.some(r => r.getId() === generateResult.report.getId())).toBe(true);
    });
  });
});

console.log('✅ Financial Reporting Domain Tests Loaded');
console.log('Run tests with: bun test financial-reporting-service.test.ts');
