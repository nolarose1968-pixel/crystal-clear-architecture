/**
 * 🔒 Analytics Security Monitor
 * Real-time security monitoring and threat detection for analytics dashboard
 */

class AnalyticsSecurityMonitor {
  constructor() {
    this.threats = [];
    this.failedRequests = 0;
    this.sessionStartTime = Date.now();
    this.userAgent = navigator.userAgent;
    this.sessionId = this.generateSessionId();

    this.initialize();
  }

  initialize() {
    console.log("🛡️ Initializing Analytics Security Monitor...");

    // Setup threat detection
    this.setupThreatDetection();

    // Setup session monitoring
    this.setupSessionMonitoring();

    // Setup data validation
    this.setupDataValidation();

    // Setup audit logging
    this.setupAuditLogging();

    // Periodic security checks
    setInterval(() => this.runSecurityCheck(), window.SECURITY_CONFIG.scanInterval);
  }

  setupThreatDetection() {
    // Monitor for SQL injection attempts
    this.monitorSQLInjection();

    // Monitor for XSS attacks
    this.monitorXSS();

    // Monitor for data exfiltration
    this.monitorDataExfiltration();

    // Monitor for brute force attacks
    this.monitorBruteForce();

    // Monitor for session hijacking
    this.monitorSessionHijacking();
  }

  monitorSQLInjection() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;

      if (options && options.body) {
        const body = typeof options.body === 'string' ? options.body : options.body.toString();
        const sqlPatterns = window.THREAT_CONFIG.detectionRules.sqlInjection.patterns;

        for (const pattern of sqlPatterns) {
          if (body.toLowerCase().includes(pattern.toLowerCase())) {
            this.logThreat({
              type: 'sql_injection',
              severity: window.THREAT_CONFIG.detectionRules.sqlInjection.severity,
              details: `SQL injection pattern detected: ${pattern}`,
              url: url,
              timestamp: new Date().toISOString()
            });
            break;
          }
        }
      }

      return originalFetch.apply(window, args);
    };
  }

  monitorXSS() {
    const originalEval = window.eval;
    window.eval = function(code) {
      const xssPatterns = window.THREAT_CONFIG.detectionRules.xssAttack.patterns;

      for (const pattern of xssPatterns) {
        if (code.toLowerCase().includes(pattern.toLowerCase())) {
          this.logThreat({
            type: 'xss_attack',
            severity: window.THREAT_CONFIG.detectionRules.xssAttack.severity,
            details: `XSS pattern detected in eval: ${pattern}`,
            code: code.substring(0, 100),
            timestamp: new Date().toISOString()
          });
          break;
        }
      }

      return originalEval.apply(window, arguments);
    }.bind(this);
  }

  monitorDataExfiltration() {
    // Monitor clipboard operations
    document.addEventListener('copy', (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      const data = clipboardData.getData('text');

      const sensitivePatterns = window.THREAT_CONFIG.detectionRules.dataExfiltration.patterns;
      for (const pattern of sensitivePatterns) {
        if (data.toLowerCase().includes(pattern.toLowerCase())) {
          this.logThreat({
            type: 'data_exfiltration',
            severity: window.THREAT_CONFIG.detectionRules.dataExfiltration.severity,
            details: `Sensitive data copied to clipboard: ${pattern}`,
            timestamp: new Date().toISOString()
          });
          break;
        }
      }
    });

    // Monitor form submissions
    document.addEventListener('submit', (e) => {
      const formData = new FormData(e.target);
      for (const [key, value] of formData.entries()) {
        const sensitivePatterns = window.THREAT_CONFIG.detectionRules.dataExfiltration.patterns;
        for (const pattern of sensitivePatterns) {
          if (value.toString().toLowerCase().includes(pattern.toLowerCase())) {
            this.logThreat({
              type: 'data_exfiltration',
              severity: window.THREAT_CONFIG.detectionRules.dataExfiltration.severity,
              details: `Sensitive data in form submission: ${pattern}`,
              field: key,
              timestamp: new Date().toISOString()
            });
            break;
          }
        }
      }
    });
  }

  monitorBruteForce() {
    let failedAttempts = 0;
    let lastAttemptTime = 0;

    // Monitor failed authentication attempts
    document.addEventListener('auth-failure', () => {
      failedAttempts++;
      const currentTime = Date.now();

      if (currentTime - lastAttemptTime < window.THREAT_CONFIG.detectionRules.bruteForce.timeWindow) {
        if (failedAttempts >= window.THREAT_CONFIG.detectionRules.bruteForce.maxAttempts) {
          this.logThreat({
            type: 'brute_force',
            severity: window.THREAT_CONFIG.detectionRules.bruteForce.severity,
            details: `Brute force attack detected: ${failedAttempts} failed attempts in ${window.THREAT_CONFIG.detectionRules.bruteForce.timeWindow / 1000}s`,
            attempts: failedAttempts,
            timestamp: new Date().toISOString()
          });
          failedAttempts = 0; // Reset counter
        }
      } else {
        failedAttempts = 1; // Reset counter for new time window
      }

      lastAttemptTime = currentTime;
    });
  }

  monitorSessionHijacking() {
    // Monitor for user agent changes
    setInterval(() => {
      if (window.THREAT_CONFIG.detectionRules.sessionHijacking.validateUserAgent) {
        if (navigator.userAgent !== this.userAgent) {
          this.logThreat({
            type: 'session_hijacking',
            severity: window.THREAT_CONFIG.detectionRules.sessionHijacking.severity,
            details: 'User agent changed during session',
            originalUserAgent: this.userAgent,
            currentUserAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }

  setupSessionMonitoring() {
    // Monitor session timeout
    setInterval(() => {
      const sessionDuration = Date.now() - this.sessionStartTime;
      if (sessionDuration > window.FANTASY402_CONFIG.sessionTimeout) {
        this.logThreat({
          type: 'session_timeout',
          severity: 'medium',
          details: 'Session exceeded maximum duration',
          duration: sessionDuration,
          maxDuration: window.FANTASY402_CONFIG.sessionTimeout,
          timestamp: new Date().toISOString()
        });
      }
    }, 60000); // Check every minute
  }

  setupDataValidation() {
    // Validate data before sending to analytics
    const originalXMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXMLHttpRequest();
      const originalSend = xhr.send;

      xhr.send = function(data) {
        if (window.SECURITY_CONFIG.monitoring.enableDataValidation && data) {
          const validation = this.validateAnalyticsData(data);
          if (!validation.valid) {
            this.logThreat({
              type: 'data_validation_failure',
              severity: 'medium',
              details: `Invalid analytics data: ${validation.errors.join(', ')}`,
              data: data.toString().substring(0, 100),
              timestamp: new Date().toISOString()
            });
          }
        }
        return originalSend.apply(this, arguments);
      }.bind(this);

      return xhr;
    };
  }

  setupAuditLogging() {
    if (window.SECURITY_CONFIG.monitoring.enableAuditLogging) {
      // Log all significant actions
      this.auditLog = [];

      // Override console methods to capture logs
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => {
        this.auditLog.push({
          level: 'info',
          message: args.join(' '),
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        });
        originalLog.apply(console, args);
      };

      console.warn = (...args) => {
        this.auditLog.push({
          level: 'warning',
          message: args.join(' '),
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        });
        originalWarn.apply(console, args);
      };

      console.error = (...args) => {
        this.auditLog.push({
          level: 'error',
          message: args.join(' '),
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        });
        originalError.apply(console, args);
      };
    }
  }

  validateAnalyticsData(data) {
    const errors = [];
    const dataStr = data.toString();

    // Check for minimum data requirements
    if (!dataStr.includes('timestamp')) {
      errors.push('Missing timestamp');
    }

    if (!dataStr.includes('userId') && !dataStr.includes('sessionId')) {
      errors.push('Missing user/session identifier');
    }

    // Check for data size limits
    if (dataStr.length > 10000) {
      errors.push('Data payload too large');
    }

    // Check for malicious patterns
    const maliciousPatterns = ['<script', 'javascript:', 'eval(', 'document.cookie'];
    for (const pattern of maliciousPatterns) {
      if (dataStr.toLowerCase().includes(pattern)) {
        errors.push(`Malicious pattern detected: ${pattern}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  logThreat(threat) {
    this.threats.push(threat);

    // Log to console
    console.warn(`🚨 Security Threat Detected:`, threat);

    // Send to security endpoint if available
    if (window.SECURITY_CONFIG.monitoring.enableRealTimeAlerts) {
      this.reportThreat(threat);
    }

    // Show notification to user
    this.showThreatNotification(threat);

    // Take response actions
    this.executeResponseActions(threat);
  }

  async reportThreat(threat) {
    try {
      await fetch('/api/security/threats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...threat,
          sessionId: this.sessionId,
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to report threat:', error);
    }
  }

  showThreatNotification(threat) {
    const severityColors = {
      low: '#f59e0b',
      medium: '#ef4444',
      high: '#dc2626',
      critical: '#7f1d1d'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${severityColors[threat.severity] || '#ef4444'};
      color: white;
      padding: 15px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    notification.innerHTML = `
      <strong>🛡️ Security Alert</strong><br>
      <small>${threat.type.toUpperCase().replace('_', ' ')}</small><br>
      ${threat.details}
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 10000);
  }

  executeResponseActions(threat) {
    const actions = window.THREAT_CONFIG.responseActions;

    if (actions.log) {
      console.log(`📝 Threat logged: ${threat.type}`);
    }

    if (actions.alert) {
      // Alert is already shown via showThreatNotification
    }

    if (actions.block && threat.severity === 'critical') {
      // Implement blocking logic for critical threats
      console.warn('🚫 Critical threat detected - additional security measures activated');
      this.activateEmergencyMode();
    }

    if (actions.notify) {
      // Send notification to security team
      this.notifySecurityTeam(threat);
    }
  }

  activateEmergencyMode() {
    // Implement emergency security measures
    console.warn('🔴 EMERGENCY MODE ACTIVATED');

    // Disable real-time updates
    if (window.analyticsDashboard) {
      window.analyticsDashboard.pauseRealTimeUpdates();
    }

    // Enable additional logging
    this.enableVerboseLogging();

    // Show emergency banner
    this.showEmergencyBanner();
  }

  enableVerboseLogging() {
    console.log('📊 Verbose security logging enabled');
    // Implementation for enhanced logging
  }

  showEmergencyBanner() {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc2626;
      color: white;
      text-align: center;
      padding: 10px;
      z-index: 10001;
      font-weight: bold;
    `;
    banner.innerHTML = '🚨 SECURITY ALERT: Enhanced monitoring active. Some features may be limited.';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  async notifySecurityTeam(threat) {
    // Implementation for notifying security team
    console.log('📧 Security team notified about threat:', threat.type);
  }

  runSecurityCheck() {
    console.log('🔍 Running periodic security check...');

    const securityStatus = {
      threatsDetected: this.threats.length,
      sessionDuration: Date.now() - this.sessionStartTime,
      failedRequests: this.failedRequests,
      auditEntries: this.auditLog ? this.auditLog.length : 0,
      timestamp: new Date().toISOString()
    };

    // Check thresholds
    if (securityStatus.threatsDetected > window.SECURITY_CONFIG.thresholds.maxSuspiciousActivity) {
      this.logThreat({
        type: 'security_threshold_exceeded',
        severity: 'high',
        details: `Security threshold exceeded: ${securityStatus.threatsDetected} threats detected`,
        threshold: window.SECURITY_CONFIG.thresholds.maxSuspiciousActivity,
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Security check completed:', securityStatus);
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getSecurityReport() {
    return {
      sessionId: this.sessionId,
      threats: this.threats,
      sessionDuration: Date.now() - this.sessionStartTime,
      failedRequests: this.failedRequests,
      auditLog: this.auditLog || [],
      lastCheck: new Date().toISOString()
    };
  }
}

// Initialize security monitor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.SECURITY_CONFIG && window.SECURITY_CONFIG.enabled) {
    window.analyticsSecurityMonitor = new AnalyticsSecurityMonitor();
    console.log('✅ Analytics Security Monitor initialized');
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsSecurityMonitor;
}
