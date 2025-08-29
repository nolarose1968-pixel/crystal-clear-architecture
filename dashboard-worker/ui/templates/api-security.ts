/**
 * API Security Template
 * Security policies, authentication, and access control
 */

import type { EmployeeData } from '../../personal-subdomains/src/types';
import {
  generateHtmlHead,
  generateHeader,
  generateFooter,
} from '../../personal-subdomains/src/components';

export function generateApiSecurityPage(employee: EmployeeData, pathname?: string): string {
  const content = generateApiSecurityContent(employee);

  const html = `
    ${generateHtmlHead(
      `API Security - ${employee.name}`,
      'Advanced security policies, authentication, and compliance management'
    )}
    ${generateHeader(employee, '/api/security')}
    <main class="api-container">
      ${content}
    </main>
    ${generateFooter()}
    </body>
    </html>
  `;

  return html;
}

function generateApiSecurityContent(employee: EmployeeData): string {
  return `
    <div class="api-security">
      <div class="security-header">
        <h1>🔒 API Security Center</h1>
        <p>Advanced security policies, authentication, and compliance management</p>
      </div>

      <div class="security-overview">
        <h2>📊 Security Status</h2>
        <div class="security-metrics">
          <div class="metric-card">
            <div class="metric-icon">🛡️</div>
            <div class="metric-content">
              <div class="metric-value">0</div>
              <div class="metric-label">Active Threats</div>
              <div class="metric-change positive">No threats detected</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔐</div>
            <div class="metric-content">
              <div class="metric-value">156</div>
              <div class="metric-label">Security Policies</div>
              <div class="metric-change positive">All active</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔍</div>
            <div class="metric-content">
              <div class="metric-value">24/7</div>
              <div class="metric-label">Monitoring</div>
              <div class="metric-change positive">Continuous</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">100%</div>
              <div class="metric-label">Compliance</div>
              <div class="metric-change positive">GDPR/SOC2</div>
            </div>
          </div>
        </div>
      </div>

      <div class="security-policies">
        <h2>📋 Security Policies</h2>
        <div class="policies-grid">
          <div class="policy-card">
            <div class="policy-icon">🔐</div>
            <div class="policy-content">
              <h3>Authentication</h3>
              <p>JWT tokens with RSA encryption</p>
              <div class="policy-status active">Active</div>
            </div>
            <button class="policy-config" onclick="configurePolicy('auth')">⚙️</button>
          </div>
          <div class="policy-card">
            <div class="policy-icon">⏱️</div>
            <div class="policy-content">
              <h3>Rate Limiting</h3>
              <p>1000 requests per minute per IP</p>
              <div class="policy-status active">Active</div>
            </div>
            <button class="policy-config" onclick="configurePolicy('rate-limit')">⚙️</button>
          </div>
          <div class="policy-card">
            <div class="policy-icon">🛡️</div>
            <div class="policy-content">
              <h3>CORS Policy</h3>
              <p>Configured for allowed domains</p>
              <div class="policy-status active">Active</div>
            </div>
            <button class="policy-config" onclick="configurePolicy('cors')">⚙️</button>
          </div>
          <div class="policy-card">
            <div class="policy-icon">🔍</div>
            <div class="policy-content">
              <h3>Input Validation</h3>
              <p>Schema-based validation active</p>
              <div class="policy-status active">Active</div>
            </div>
            <button class="policy-config" onclick="configurePolicy('validation')">⚙️</button>
          </div>
          <div class="policy-card">
            <div class="policy-icon">📊</div>
            <div class="policy-content">
              <h3>Audit Logging</h3>
              <p>All API calls logged and monitored</p>
              <div class="policy-status active">Active</div>
            </div>
            <button class="policy-config" onclick="configurePolicy('audit')">⚙️</button>
          </div>
          <div class="policy-card">
            <div class="policy-icon">🔒</div>
            <div class="policy-content">
              <h3>Data Encryption</h3>
              <p>AES-256 encryption at rest</p>
              <div class="policy-status active">Active</div>
            </div>
            <button class="policy-config" onclick="configurePolicy('encryption')">⚙️</button>
          </div>
        </div>
      </div>

      <div class="security-threats">
        <h2>🚨 Threat Detection</h2>
        <div class="threats-list">
          <div class="threat-item low">
            <div class="threat-icon">⚠️</div>
            <div class="threat-content">
              <div class="threat-title">Unusual Traffic Pattern</div>
              <div class="threat-description">Detected 15% increase in requests from IP 192.168.1.100</div>
              <div class="threat-time">5 minutes ago</div>
            </div>
            <div class="threat-severity">Low</div>
          </div>
          <div class="threat-item medium">
            <div class="threat-icon">🚨</div>
            <div class="threat-content">
              <div class="threat-title">Failed Authentication Attempts</div>
              <div class="threat-description">5 consecutive failed login attempts from IP 10.0.0.50</div>
              <div class="threat-time">12 minutes ago</div>
            </div>
            <div class="threat-severity">Medium</div>
          </div>
        </div>
        <div class="threats-empty">
          <p>✅ No active high-severity threats detected</p>
        </div>
      </div>

      <div class="security-keys">
        <h2>🔑 API Keys Management</h2>
        <div class="keys-actions">
          <button class="primary-btn" onclick="generateApiKey()">
            <span class="btn-icon">➕</span>
            Generate New Key
          </button>
          <button class="secondary-btn" onclick="revokeExpiredKeys()">
            <span class="btn-icon">🗑️</span>
            Revoke Expired Keys
          </button>
        </div>
        <div class="keys-table">
          <div class="table-header">
            <span>Key Name</span>
            <span>Permissions</span>
            <span>Created</span>
            <span>Expires</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div class="table-row">
            <span>Production API Key</span>
            <span>Read/Write</span>
            <span>2024-01-15</span>
            <span>2025-01-15</span>
            <span class="status active">🟢 Active</span>
            <span class="actions">
              <button onclick="editKey('prod')">✏️</button>
              <button onclick="rotateKey('prod')">🔄</button>
              <button onclick="revokeKey('prod')">🚫</button>
            </span>
          </div>
          <div class="table-row">
            <span>Development API Key</span>
            <span>Read Only</span>
            <span>2024-02-01</span>
            <span>2024-08-01</span>
            <span class="status active">🟢 Active</span>
            <span class="actions">
              <button onclick="editKey('dev')">✏️</button>
              <button onclick="rotateKey('dev')">🔄</button>
              <button onclick="revokeKey('dev')">🚫</button>
            </span>
          </div>
        </div>
      </div>

      <div class="security-reports">
        <h2>📊 Security Reports</h2>
        <div class="reports-grid">
          <div class="report-card" onclick="viewReport('access-logs')">
            <div class="report-icon">📋</div>
            <div class="report-content">
              <h3>Access Logs</h3>
              <p>Detailed logs of all API access attempts</p>
              <div class="report-meta">Last updated: 2 hours ago</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
          <div class="report-card" onclick="viewReport('security-audit')">
            <div class="report-icon">🔍</div>
            <div class="report-content">
              <h3>Security Audit</h3>
              <p>Comprehensive security assessment report</p>
              <div class="report-meta">Last updated: 1 day ago</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
          <div class="report-card" onclick="viewReport('compliance')">
            <div class="report-icon">📜</div>
            <div class="report-content">
              <h3>Compliance Report</h3>
              <p>GDPR and SOC2 compliance status</p>
              <div class="report-meta">Last updated: 3 days ago</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
          <div class="report-card" onclick="viewReport('threat-analysis')">
            <div class="report-icon">🎯</div>
            <div class="report-content">
              <h3>Threat Analysis</h3>
              <p>Analysis of detected security threats</p>
              <div class="report-meta">Last updated: 6 hours ago</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Security management functions
declare function configurePolicy(policyType: string): void;
declare function generateApiKey(): void;
declare function revokeExpiredKeys(): void;
declare function editKey(keyId: string): void;
declare function rotateKey(keyId: string): void;
declare function revokeKey(keyId: string): void;
declare function viewReport(reportType: string): void;
