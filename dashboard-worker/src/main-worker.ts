// dashboard-worker/src/main-worker.ts

// Import enhanced CSS styles for bundling
import "./styles/index.css";

import { WagerSystem, type WagerRequest, type SettlementRequest, type WagerValidation } from '@fire22/wager-system';
import { MiddlewareSystem } from '@fire22/middleware';
import { EnvironmentManager } from '@fire22/env-manager';
import { Fire22ApiClient, Fire22ApiError, Fire22RateLimitError } from './fire22-api';
import { HeaderManager, HeaderValidator } from './utils/header-manager';
import { PerformanceMonitor, withRequestTracking } from './monitoring/performance-monitor';
import { SecurityMonitor } from './monitoring/security-monitor';
import { HealthMonitor, HealthUtils } from './monitoring/health-check';
import { EnhancedError, createEnhancedError, handleApiError, ErrorCodes, validateRequiredFields } from './error/enhanced-error-handler';
import { type MonitoringConfig, type SecurityConfig, type RequestInfo } from './types/enhanced-types';
import { ErrorCodes as ErrorHandlerErrorCodes } from './error/enhanced-error-handler';
import { MonitoringUtils } from './utils/monitoring-utils';
import { createLogger } from './utils/logger';

interface CustomerRequestBody {
  agentID?: string;
  customerID?: string;
  start?: string;
  end?: string;
  type?: string;
  actions?: string;
  operation?: string;
  RRO?: string;
  agentOwner?: string;
  agentSite?: string;
}

// Default configuration for EnvironmentManager
const defaultEnvConfig = {
  environment: 'development',
  envFiles: {
    development: '.env.development',
    staging: '.env.staging',
    production: '.env.production',
    test: '.env.test'
  },
  envValidation: {
    required: ['JWT_SECRET', 'ADMIN_PASSWORD'],
    optional: ['BOT_TOKEN', 'DEMO_MODE'],
    secrets: ['JWT_SECRET', 'ADMIN_PASSWORD']
  }
};

export class MainWorker {
  private wagerSystem: WagerSystem;
  private middleware: MiddlewareSystem;
  private envManager: EnvironmentManager;
  private fire22ApiClient: Fire22ApiClient; // Add Fire22ApiClient instance
  private performanceMonitor: PerformanceMonitor;
  private securityMonitor: SecurityMonitor;
  private healthMonitor: HealthMonitor;
  private monitoringConfig: MonitoringConfig;
  private securityConfig: SecurityConfig;
  private logger: any;

  constructor() {
    this.envManager = new EnvironmentManager(defaultEnvConfig);
    this.wagerSystem = new WagerSystem();
    this.middleware = new MiddlewareSystem();
    // Pass the environment configuration to Fire22ApiClient
    this.fire22ApiClient = new Fire22ApiClient({
      FIRE22_API_URL: Bun.env.FIRE22_API_URL,
      FIRE22_TOKEN: Bun.env.FIRE22_TOKEN,
      FIRE22_WEBHOOK_SECRET: Bun.env.FIRE22_WEBHOOK_SECRET,
    });
    
    // Initialize monitoring components
    this.monitoringConfig = MonitoringUtils.createMonitoringConfig({
      enabled: Bun.env.NODE_ENV !== 'test',
      logLevel: (Bun.env.LOG_LEVEL as any) || 'info'
    });
    
    this.securityConfig = MonitoringUtils.createSecurityConfig({
      enableSecurityMonitoring: Bun.env.NODE_ENV !== 'test',
      suspiciousActivityThreshold: parseInt(Bun.env.SUSPICIOUS_ACTIVITY_THRESHOLD || '10')
    });
    
    this.logger = createLogger(this.monitoringConfig);
    
    this.performanceMonitor = new PerformanceMonitor(this.monitoringConfig);
    this.securityMonitor = new SecurityMonitor(this.securityConfig);
    this.healthMonitor = new HealthMonitor(['database', 'api', 'authentication', 'cache']);
    
    // Start periodic monitoring
    if (this.monitoringConfig.enabled) {
      this.performanceMonitor.startPeriodicCollection();
      this.healthMonitor.startPeriodicChecks();
    }
    
    this.logger.info('MainWorker initialized with monitoring capabilities');
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing MainWorker...');
    
    try {
      await this.envManager.validateEnvironment();
      this.logger.info('Environment validated.');
      
      // Perform initial health check
      const healthStatus = await this.healthMonitor.getSystemHealth();
      this.logger.info(`Initial health status: ${healthStatus.status}`);
      
      this.logger.info('MainWorker initialization complete.');
    } catch (error) {
      this.logger.error('Failed to initialize MainWorker', error);
      throw createEnhancedError(
        'INITIALIZATION_ERROR',
        'Failed to initialize MainWorker',
        { originalError: error instanceof Error ? error.message : String(error) },
        500
      );
    }
  }

  public getWagerSystem(): WagerSystem {
    return this.wagerSystem;
  }

  public getMiddleware(): MiddlewareSystem {
    return this.middleware;
  }

  public getEnvManager(): EnvironmentManager {
    return this.envManager;
  }

  public getFire22ApiClient(): Fire22ApiClient {
    return this.fire22ApiClient;
  }

  // New method to handle proxying requests to the external Fire22 API
  private async handleFire22ApiRequest(request: Request, apiPath: string, method: string, body?: any): Promise<Response> {
    const headerManager = HeaderManager.getInstance();
    const origin = request.headers.get('Origin') || 'http://localhost:8787'; // Define origin here
    const corsHeaders = headerManager.getPreflightHeaders(origin); // Define corsHeaders here

    // For development, return mock data to avoid authentication issues
    this.logger.debug(`[handleFire22ApiRequest] Mock response for: ${method} ${apiPath}`);
    
    // Generate mock responses based on the API path
    let mockResponse: any = { success: true };
    
    if (apiPath.includes('getListAgenstByAgent')) {
      mockResponse = {
        success: true,
        data: {
          agents: [
            {
              agent_id: 'BLAKEPPH',
              agentName: 'Blake Primary',
              agentType: 'M',
              status: { isActive: true },
              balance: 15000.00,
              currency: 'USD',
              commissionRates: { inet: 5, casino: 3 },
              created_date: '2024-01-15T10:30:00Z',
              updated_date: '2025-08-27T12:00:00Z',
              permissions: {
                canPlaceBets: true,
                canModifyInfo: true,
                canChangeAccounts: false,
                canOpenParlays: true
              }
            },
            {
              agent_id: 'TEST001',
              agentName: 'Test Agent',
              agentType: 'S',
              status: { isActive: true },
              balance: 5000.00,
              currency: 'USD',
              commissionRates: { inet: 3, casino: 2 },
              created_date: '2024-03-20T14:15:00Z',
              updated_date: '2025-08-27T11:45:00Z',
              permissions: {
                canPlaceBets: true,
                canModifyInfo: false,
                canChangeAccounts: false,
                canOpenParlays: false
              }
            }
          ],
          lastUpdated: new Date().toISOString()
        }
      };
    } else if (apiPath.includes('Auth/status')) {
      mockResponse = {
        success: true,
        data: {
          agentID: 'BLAKEPPH',
          status: 'authenticated',
          sessionValid: true,
          lastLogin: '2025-08-27T12:00:00Z',
          permissions: ['read', 'write', 'admin']
        }
      };
    } else if (apiPath.includes('Cache/stats')) {
      mockResponse = {
        success: true,
        data: {
          totalEntries: 1250,
          memoryUsage: '45MB',
          hitRate: 0.94,
          lastUpdated: '2025-08-27T17:20:00Z'
        }
      };
    } else if (apiPath.includes('getWebLog')) {
            mockResponse = {
              success: true,
              data: {
                customers: [
                  {
                    customerID: 'CUST001',
                    name: 'John Doe',
                    action: 'login',
                    lastActivity: '2025-08-27T17:15:00Z',
                    ipAddress: '192.168.1.100',
                    status: 'success',
                    balance: 1500.00,
                    active: true,
                    transactionCount: 25,
                    settleFigure: 1200.00,
                    suspectedBot: false
                  },
                  {
                    customerID: 'CUST002',
                    name: 'Jane Smith',
                    action: 'bet_placement',
                    lastActivity: '2025-08-27T17:10:00Z',
                    ipAddress: '192.168.1.101',
                    status: 'success',
                    balance: 2750.50,
                    active: true,
                    transactionCount: 42,
                    settleFigure: 2100.00,
                    suspectedBot: false
                  }
                ],
                pagination: {
                  total: 2,
                  page: 1,
                  pageSize: 20
                }
              }
            };
    } else if (apiPath.includes('syncCustomers')) {
      mockResponse = {
        success: true,
        data: {
          syncedCount: 42,
          totalCount: 50,
          syncTime: '2025-08-27T17:20:00Z'
        }
      };
    } else {
      mockResponse = {
        success: true,
        data: { message: 'Mock response for development' }
      };
    }

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  public async processRequest(request: Request): Promise<Response> {
    const correlationId = MonitoringUtils.extractCorrelationId(request) || MonitoringUtils.createCorrelationId();
    const startTime = Date.now();
    
    try {
      // Record security event for request start
      await this.securityMonitor.recordEvent({
        type: 'validation',
        severity: 'low',
        details: {
          method: request.method,
          url: request.url,
          userAgent: request.headers.get('User-Agent') || '',
          ip: this.getClientIP(request),
          correlationId
        },
        timestamp: new Date().toISOString()
      });

      const url = new URL(request.url);
      const path = url.pathname;

      // Handle preflight requests for CORS
      if (request.method === 'OPTIONS') {
        const headerManager = HeaderManager.getInstance();
        const origin = request.headers.get('Origin') || 'http://localhost:8787';
        const preflightHeaders = headerManager.getPreflightHeaders(origin);
        
        const response = new Response(null, {
          status: 204,
          headers: preflightHeaders
        });
        
        return MonitoringUtils.addCorrelationId(response, correlationId);
      }

      // Handle /api/health endpoint
      if (path === '/api/health') {
        const healthStatus = await this.healthMonitor.getSystemHealth();
        const metrics = this.performanceMonitor.getCurrentMetrics();
        
        const response = new Response(JSON.stringify({
          status: healthStatus.status,
          timestamp: new Date().toISOString(),
          server: 'Fire22 Dashboard Server',
          monitoring: {
            enabled: this.monitoringConfig.enabled,
            uptime: this.performanceMonitor.getUptime(),
            metrics: metrics,
            components: healthStatus.components
          },
          correlationId
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId
          }
        });
        
        return MonitoringUtils.addCorrelationId(response, correlationId);
      }

      // Handle favicon.ico requests
      if (path === '/favicon.ico') {
        const response = new Response(null, { status: 204 });
        return MonitoringUtils.addCorrelationId(response, correlationId);
      }

      // Handle generic /health path (redirect or simple response)
      if (path === '/health') {
        const response = new Response(JSON.stringify({
          status: 'healthy',
          message: 'Use /api/health for detailed status',
          timestamp: new Date().toISOString(),
          correlationId
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId
          }
        });
        
        return MonitoringUtils.addCorrelationId(response, correlationId);
      }

      // Handle monitoring dashboard
      if (path === '/monitoring/dashboard') {
        const healthHandler = HealthUtils.createHealthCheckHandler(this.healthMonitor);
        const response = await healthHandler(request);
        return MonitoringUtils.addCorrelationId(response, correlationId);
      }

      // Dashboard API endpoints that need to be proxied to fire22.ag
    if (path.startsWith('/api/admin/agent-configs-dashboard')) {
      const agentId = url.searchParams.get('agentId');
      const apiPath = `Manager/getListAgenstByAgent`;
      const body = `agentID=${agentId || 'BLAKEPPH'}&agentType=M&operation=getListAgenstByAgent&RRO=1&agentOwner=BLAKEPPH&agentSite=1`;
      return this.handleFire22ApiRequest(request, apiPath, 'POST', body);
    }

    if (path.startsWith('/api/fire22/auth-status')) {
      const requestBody: any = await request.json(); // Cast to any to access agentID
      const agentID = requestBody.agentID || 'BLAKEPPH';
      const apiPath = `Auth/status`; // Assuming an auth status endpoint
      const body = `agentID=${agentID}`;
      return this.handleFire22ApiRequest(request, apiPath, 'POST', body);
    }

    if (path.startsWith('/api/fire22/cache-stats')) {
      const apiPath = `Cache/stats`; // Assuming a cache stats endpoint
      return this.handleFire22ApiRequest(request, apiPath, 'GET');
    }

    if (path.startsWith('/api/customers')) {
      // Handle both GET with query params and POST with JSON body
      let agentID = 'BLAKEPPH';
      let customerID = 'ALL';
      let start = new Date().toISOString().split('T')[0];
      let end = new Date().toISOString().split('T')[0];
      let type = 'A';
      let actions = 'ALL';
      let operation = 'getWebLog';
      let RRO = '1';
      let agentOwner = 'BLAKEPPH';
      let agentSite = '1';

      if (request.method === 'POST') {
        try {
          const requestBody: CustomerRequestBody = await request.json();
          agentID = requestBody.agentID || agentID;
          customerID = requestBody.customerID || customerID;
          start = requestBody.start || start;
          end = requestBody.end || end;
          type = requestBody.type || type;
          actions = requestBody.actions || actions;
          operation = requestBody.operation || operation;
          RRO = requestBody.RRO || RRO;
          agentOwner = requestBody.agentOwner || agentOwner;
          agentSite = requestBody.agentSite || agentSite;
        } catch (error) {
          console.error('Error parsing JSON body:', error);
          // Fall back to query parameters
        }
      }

      // Also check query parameters for GET requests
      if (request.method === 'GET') {
        agentID = url.searchParams.get('agent') || agentID;
        customerID = url.searchParams.get('customerID') || customerID;
        start = url.searchParams.get('start') || start;
        end = url.searchParams.get('end') || end;
        type = url.searchParams.get('type') || type;
        actions = url.searchParams.get('actions') || actions;
        operation = url.searchParams.get('operation') || operation;
        RRO = url.searchParams.get('RRO') || RRO;
        agentOwner = url.searchParams.get('agentOwner') || agentOwner;
        agentSite = url.searchParams.get('agentSite') || agentSite;
      }

      const apiPath = `Manager/getWebLog`;
      const body = new URLSearchParams({
        agentID,
        customerID,
        start,
        end,
        type,
        actions,
        operation,
        RRO,
        agentOwner,
        agentSite
      }).toString();
      
      return this.handleFire22ApiRequest(request, apiPath, 'POST', body);
    }

    if (path.startsWith('/api/fire22/sync-customers')) {
      const requestBody: any = await request.json(); // Cast to any to access agentID
      const agentID = requestBody.agentID || 'BLAKEPPH';
      const apiPath = `Manager/syncCustomers`; // Assuming a sync endpoint
      const body = `agentID=${agentID}`;
      return this.handleFire22ApiRequest(request, apiPath, 'POST', body);
    }

    // Default response for unhandled routes
    const response = new Response(JSON.stringify({
      error: 'Not Found',
      message: `The requested endpoint ${path} was not found`,
      timestamp: new Date().toISOString(),
      correlationId
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId
      }
    });
    
    return MonitoringUtils.addCorrelationId(response, correlationId);
    } catch (error) {
      // Handle any uncaught errors in request processing
      this.logger.error('Unhandled error in processRequest', error);
      
      const errorResponse = new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        correlationId,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId
        }
      });
      
      return MonitoringUtils.addCorrelationId(errorResponse, correlationId);
    }
  }

  /**
   * Gets monitoring metrics
   */
  public async getMonitoringMetrics() {
    try {
      const health = await this.healthMonitor.getSystemHealth();
      const metrics = this.performanceMonitor.getCurrentMetrics();
      
      return {
        success: true,
        data: {
          performance: metrics,
          health: health,
          uptime: this.performanceMonitor.getUptime(),
          requestRate: this.performanceMonitor.getRequestRate(60000),
          averageResponseTime: this.performanceMonitor.getAverageResponseTime(60000),
          historicalMetrics: this.performanceMonitor.getMetrics(100)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error getting monitoring metrics', error);
      return {
        success: false,
        error: {
          code: 'METRICS_ERROR',
          message: 'Failed to retrieve monitoring metrics',
          details: error instanceof Error ? error.message : String(error)
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Gets security events
   */
  public async getSecurityEvents() {
    try {
      const securityReport = await this.securityMonitor.getSecurityReport();
      return {
        success: true,
        data: {
          events: securityReport.events.slice(-100), // Return last 100 events
          totalEvents: securityReport.events.length,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error getting security events', error);
      return {
        success: false,
        error: {
          code: 'SECURITY_ERROR',
          message: 'Failed to retrieve security events',
          details: error instanceof Error ? error.message : String(error)
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Gets system logs
   */
  public async getSystemLogs(limit: number = 100) {
    try {
      // In a real implementation, this would query a logging system
      const logs: any[] = [];
      
      return {
        success: true,
        data: {
          logs: logs.slice(-limit),
          totalLogs: logs.length,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error getting system logs', error);
      return {
        success: false,
        error: {
          code: 'LOGS_ERROR',
          message: 'Failed to retrieve system logs',
          details: error instanceof Error ? error.message : String(error)
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Performs system health check
   */
  public async performSystemHealthCheck() {
    try {
      const healthStatus = await this.healthMonitor.getSystemHealth();
      const metrics = this.performanceMonitor.getCurrentMetrics();
      
      return {
        success: true,
        data: {
          status: healthStatus.status,
          components: healthStatus.components,
          metrics: metrics,
          uptime: this.performanceMonitor.getUptime(),
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error performing health check', error);
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: 'Failed to perform health check',
          details: error instanceof Error ? error.message : String(error)
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Records a custom security event
   */
  public async recordSecurityEvent(event: any) {
    try {
      await this.securityMonitor.recordEvent({
        type: event.type || 'validation',
        severity: event.severity || 'medium',
        details: event.details || {},
        timestamp: new Date().toISOString(),
        userId: event.userId
      });
      
      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error('Error recording security event', error);
      return {
        success: false,
        error: {
          code: 'SECURITY_EVENT_ERROR',
          message: 'Failed to record security event',
          details: error instanceof Error ? error.message : String(error)
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup() {
    this.performanceMonitor.stopPeriodicCollection();
    this.healthMonitor.stopPeriodicChecks();
    this.logger.info('MainWorker cleanup complete');
  }

  /**
   * Get client IP from request
   */
  private getClientIP(request: Request): string {
    // Try to get IP from various headers
    const cfConnectingIP = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIP = request.headers.get('X-Real-IP');
    
    return cfConnectingIP || xForwardedFor?.split(',')[0] || xRealIP || 'unknown';
  }
}

// Optional: Export an instance for direct use if a singleton pattern is desired
export const mainWorkerInstance = new MainWorker();
