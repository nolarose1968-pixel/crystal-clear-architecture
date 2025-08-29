/**
 * Enterprise Contact Page - Complete Communication Hub
 */

import type { EmployeeData } from '../types';
import {
  generateHtmlHead,
  generateHeader,
  generateFooter,
  generateActionButtons,
} from '../components';
import { sanitizeHtml } from '../utils';

export function generateContactPage(employee: EmployeeData): string {
  const contactMethods = generateContactMethods(employee);
  const businessHours = generateBusinessHours(employee);
  const apiIntegration = generateApiIntegration(employee);
  const supportChannels = generateSupportChannels(employee);
  const contactForms = generateAdvancedContactForms(employee);
  const liveSupport = generateLiveSupport(employee);
  const supportTickets = generateSupportTickets(employee);

  const html = `
    ${generateHtmlHead(
      `Enterprise Contact Hub - ${employee.name}`,
      `Get in touch with ${employee.name} through our comprehensive enterprise communication platform. API integration, live support, and multi-channel contact options.`
    )}
    ${generateHeader(employee, '/contact')}
    <main class="enterprise-contact-container">
      ${generateEnterpriseContactHero(employee)}
      ${contactMethods}
      ${supportChannels}
      ${apiIntegration}
      ${contactForms}
      ${liveSupport}
      ${supportTickets}
      ${businessHours}
    </main>
    ${generateFooter()}
    <style>
      ${getEnterpriseContactStyles()}
    </style>
    <script>
      ${getEnterpriseContactScripts()}
    </script>
    </body>
    </html>
  `;

  return html;
}

function generateEnterpriseContactHero(employee: EmployeeData): string {
  return `
    <div class="enterprise-contact-hero">
      <div class="hero-background">
        <div class="hero-gradient"></div>
        <div class="hero-particles"></div>
      </div>

      <div class="hero-content">
        <div class="hero-header">
          <h1>🏢 Enterprise Communication Hub</h1>
          <div class="hero-subtitle">
            <span class="pulse-dot"></span>
            <span>24/7 Enterprise Support & API Integration</span>
          </div>
        </div>

        <div class="hero-executive">
          <div class="executive-avatar">
            <div class="avatar-glow"></div>
            <span class="executive-emoji">👑</span>
          </div>
          <div class="executive-info">
            <h2>${sanitizeHtml(employee.name)}</h2>
            <p class="executive-title">${sanitizeHtml(employee.title)}</p>
            <p class="executive-dept">${sanitizeHtml(employee.department)}</p>
          </div>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-value">24/7</div>
            <div class="stat-label">Support</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">< 2hrs</div>
            <div class="stat-label">Response</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">99.9%</div>
            <div class="stat-label">API Uptime</div>
          </div>
        </div>

        <div class="hero-description">
          <p>Experience our comprehensive enterprise communication platform. From API integration support to live assistance, we're here to ensure your success with Fantasy402.</p>
        </div>

        <div class="hero-actions">
          <button class="hero-btn primary" onclick="scrollToSection('live-support')">
            <span class="btn-icon">💬</span>
            <span>Start Live Chat</span>
          </button>
          <button class="hero-btn secondary" onclick="scrollToSection('api-integration')">
            <span class="btn-icon">🔌</span>
            <span>API Integration</span>
          </button>
          <button class="hero-btn accent" onclick="scrollToSection('contact-forms')">
            <span class="btn-icon">📝</span>
            <span>Contact Forms</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function generateContactMethods(employee: EmployeeData): string {
  const methods: Array<{
    icon: string;
    title: string;
    value: string;
    action: string;
    description: string;
    primary: boolean;
    category: string;
    availability: string;
  }> = [];

  // VIP Hotline for tier 5
  if (employee.tier === 5) {
    methods.push({
      icon: '👑',
      title: 'VIP Priority Line',
      value: '1-800-VIP-HELP',
      action: 'tel:1-800-VIP-HELP',
      description: '24/7 VIP support hotline - Immediate assistance',
      primary: true,
      category: 'urgent',
      availability: '24/7',
    });
  }

  // Direct Phone
  if (employee.phone) {
    methods.push({
      icon: '📞',
      title: 'Direct Phone',
      value: employee.phone,
      action: `tel:${employee.phone}`,
      description: 'Call directly during business hours',
      primary: employee.tier >= 4,
      category: 'direct',
      availability: 'Business Hours',
    });
  }

  // Email
  if (employee.email) {
    methods.push({
      icon: '📧',
      title: 'Enterprise Email',
      value: employee.email,
      action: `mailto:${employee.email}`,
      description: 'Professional email communication',
      primary: true,
      category: 'professional',
      availability: '24/7',
    });
  }

  // Telegram
  if (employee.telegram) {
    methods.push({
      icon: '✈️',
      title: 'Telegram',
      value: `@${employee.telegram}`,
      action: `https://t.me/${employee.telegram}`,
      description: 'Instant messaging & file sharing',
      primary: false,
      category: 'instant',
      availability: '24/7',
    });
  }

  // Slack
  if (employee.slack) {
    methods.push({
      icon: '💬',
      title: 'Slack',
      value: `@${employee.slack}`,
      action: `slack://user?team=T123456&id=${employee.slack}`,
      description: 'Team collaboration platform',
      primary: false,
      category: 'team',
      availability: 'Business Hours',
    });
  }

  return `
    <div class="enterprise-contact-methods" id="contact-methods">
      <div class="section-header">
        <h2>📱 Enterprise Contact Channels</h2>
        <p>Multiple ways to reach our team with guaranteed response times</p>
      </div>

      <!-- Quick Contact Summary -->
      <div class="quick-contact-summary">
        <div class="summary-item">
          <span class="summary-icon">📧</span>
          <div class="summary-content">
            <div class="summary-label">Email</div>
            <div class="summary-value">vinny2times@fire22.com</div>
          </div>
          <button class="copy-btn" onclick="copyToClipboard('vinny2times@fire22.com', 'Email')" title="Copy Email">
            📋
          </button>
        </div>
        <div class="summary-item">
          <span class="summary-icon">📱</span>
          <div class="summary-content">
            <div class="summary-label">Phone</div>
            <div class="summary-value">+1-555-VIP-0000</div>
          </div>
          <button class="copy-btn" onclick="copyToClipboard('+1-555-VIP-0000', 'Phone')" title="Copy Phone">
            📋
          </button>
        </div>
        <div class="summary-item">
          <span class="summary-icon">💬</span>
          <div class="summary-content">
            <div class="summary-label">Slack</div>
            <div class="summary-value">@vinny2times</div>
          </div>
          <button class="copy-btn" onclick="copyToClipboard('@vinny2times', 'Slack')" title="Copy Slack">
            📋
          </button>
        </div>
        <div class="summary-item">
          <span class="summary-icon">✈️</span>
          <div class="summary-content">
            <div class="summary-label">Telegram</div>
            <div class="summary-value">@vinny2times</div>
          </div>
          <button class="copy-btn" onclick="copyToClipboard('@vinny2times', 'Telegram')" title="Copy Telegram">
            📋
          </button>
        </div>
      </div>

      <div class="methods-grid">
        ${methods.map(method => `
          <div class="contact-method-card ${method.primary ? 'primary' : 'secondary'} ${method.category}">
            <div class="method-header">
              <div class="method-icon">${method.icon}</div>
              <div class="method-meta">
                <span class="availability-badge ${method.availability === '24/7' ? 'always' : 'business'}">
                  ${method.availability}
                </span>
                ${method.primary ? '<span class="priority-badge">Priority</span>' : ''}
              </div>
            </div>

            <div class="method-content">
              <h3>${method.title}</h3>
              <div class="method-value">${sanitizeHtml(method.value)}</div>
              <p class="method-description">${method.description}</p>

              <div class="method-actions">
                <a href="${method.action}" class="method-btn primary">
                  <span>Contact Now</span>
                  <span class="btn-arrow">→</span>
                </a>
                <button class="method-btn secondary" onclick="copyContactInfo('${method.value}', '${method.title}')">
                  <span>📋 Copy</span>
                </button>
              </div>
            </div>

            <div class="method-glow"></div>
          </div>
        `).join('')}
      </div>

      <div class="contact-tips">
        <div class="tip-card">
          <div class="tip-icon">⚡</div>
          <div class="tip-content">
            <h4>Response Guarantee</h4>
            <p>Priority channels: < 2 hours | Standard: < 4 hours | Business hours only</p>
          </div>
        </div>
        <div class="tip-card">
          <div class="tip-icon">🔒</div>
          <div class="tip-content">
            <h4>Secure Communication</h4>
            <p>All channels are encrypted and monitored for security compliance</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateSupportChannels(employee: EmployeeData): string {
  return `
    <div class="enterprise-support-channels" id="support-channels">
      <div class="section-header">
        <h2>🚀 Primary Communication Channels</h2>
        <p>Choose your preferred method to connect with our enterprise support team</p>
      </div>

      <div class="primary-channels-grid">
        <!-- Live Chat Channel -->
        <div class="primary-channel-card live-chat">
          <div class="channel-hero">
            <div class="channel-icon-large">💬</div>
            <div class="channel-status">
              <div class="status-indicator online"></div>
              <span class="status-text">Live Agents Available</span>
            </div>
          </div>
          <div class="channel-content">
            <h3>Start Live Chat</h3>
            <p>Connect instantly with our support team for immediate assistance. Get real-time help with any questions or issues.</p>
            <div class="channel-features">
              <span class="feature">⚡ Instant Response</span>
              <span class="feature">🎯 Real-time Support</span>
              <span class="feature">💬 Interactive Chat</span>
            </div>
            <div class="channel-metrics">
              <div class="metric">
                <span class="metric-value">24/7</span>
                <span class="metric-label">Availability</span>
              </div>
              <div class="metric">
                <span class="metric-value">< 2min</span>
                <span class="metric-label">Response Time</span>
              </div>
            </div>
          </div>
          <div class="channel-actions">
            <button class="channel-btn primary large" onclick="startLiveChat()">
              <span class="btn-icon">💬</span>
              <span>Start Live Chat</span>
            </button>
          </div>
        </div>

        <!-- API Integration Channel -->
        <div class="primary-channel-card api-integration">
          <div class="channel-hero">
            <div class="channel-icon-large">🔌</div>
            <div class="channel-status">
              <div class="status-indicator online"></div>
              <span class="status-text">API Status: Healthy</span>
            </div>
          </div>
          <div class="channel-content">
            <h3>API Integration</h3>
            <p>Technical support for API integration, authentication, webhooks, and development assistance. Access documentation and SDKs.</p>
            <div class="channel-features">
              <span class="feature">🔧 Technical Support</span>
              <span class="feature">📚 Documentation</span>
              <span class="feature">🔑 Authentication Help</span>
            </div>
            <div class="channel-metrics">
              <div class="metric">
                <span class="metric-value">99.9%</span>
                <span class="metric-label">Uptime</span>
              </div>
              <div class="metric">
                <span class="metric-value">< 1hr</span>
                <span class="metric-label">Response Time</span>
              </div>
            </div>
          </div>
          <div class="channel-actions">
            <button class="channel-btn secondary large" onclick="openApiIntegration()">
              <span class="btn-icon">🔌</span>
              <span>API Integration</span>
            </button>
          </div>
        </div>

        <!-- Contact Forms Channel -->
        <div class="primary-channel-card contact-forms">
          <div class="channel-hero">
            <div class="channel-icon-large">📝</div>
            <div class="channel-status">
              <div class="status-indicator online"></div>
              <span class="status-text">Forms Active</span>
            </div>
          </div>
          <div class="channel-content">
            <h3>Contact Forms</h3>
            <p>Submit detailed inquiries through our structured forms. Perfect for complex requests, bug reports, and feature requests.</p>
            <div class="channel-features">
              <span class="feature">📋 Structured Forms</span>
              <span class="feature">🎯 Detailed Requests</span>
              <span class="feature">📎 File Attachments</span>
            </div>
            <div class="channel-metrics">
              <div class="metric">
                <span class="metric-value">< 2hrs</span>
                <span class="metric-label">Response Time</span>
              </div>
              <div class="metric">
                <span class="metric-value">24/7</span>
                <span class="metric-label">Submission</span>
              </div>
            </div>
          </div>
          <div class="channel-actions">
            <button class="channel-btn accent large" onclick="openContactForms()">
              <span class="btn-icon">📝</span>
              <span>Contact Forms</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Additional Support Options -->
      <div class="additional-channels">
        <h3>💡 Additional Support Options</h3>
        <div class="additional-grid">
          <div class="additional-card">
            <div class="additional-icon">📞</div>
            <div class="additional-content">
              <h4>Phone Support</h4>
              <p>Direct voice communication for urgent matters</p>
              <button class="additional-btn" onclick="callSupport()">Call Now</button>
            </div>
          </div>
          <div class="additional-card">
            <div class="additional-icon">📧</div>
            <div class="additional-content">
              <h4>Email Support</h4>
              <p>Send detailed inquiries via email</p>
              <button class="additional-btn" onclick="emailSupport()">Send Email</button>
            </div>
          </div>
          <div class="additional-card">
            <div class="additional-icon">📚</div>
            <div class="additional-content">
              <h4>Knowledge Base</h4>
              <p>Self-service help articles and guides</p>
              <button class="additional-btn" onclick="openKnowledgeBase()">Browse Help</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateApiIntegration(employee: EmployeeData): string {
  return `
    <div class="api-integration-showcase" id="api-integration">
      <div class="section-header">
        <h2>🔌 API Integration Center</h2>
        <p>Everything you need to integrate with Fantasy402's enterprise API platform</p>
      </div>

      <div class="integration-grid">
        <div class="integration-section docs">
          <div class="section-icon">📚</div>
          <h3>API Documentation</h3>
          <p>Complete API reference with interactive examples</p>
          <div class="integration-links">
            <a href="/api/documentation" class="integration-link primary">
              <span>📖 Full Documentation</span>
              <span class="link-arrow">→</span>
            </a>
            <a href="/api/documentation#examples" class="integration-link secondary">
              <span>💻 Code Examples</span>
            </a>
          </div>
        </div>

        <div class="integration-section monitoring">
          <div class="section-icon">📊</div>
          <h3>API Monitoring</h3>
          <p>Real-time API performance and health monitoring</p>
          <div class="integration-links">
            <a href="/api/monitoring" class="integration-link primary">
              <span>📊 Live Monitoring</span>
              <span class="link-arrow">→</span>
            </a>
            <a href="/api/monitoring#analytics" class="integration-link secondary">
              <span>📈 Performance Analytics</span>
            </a>
          </div>
        </div>

        <div class="integration-section testing">
          <div class="section-icon">🧪</div>
          <h3>API Testing Tools</h3>
          <p>Test endpoints in real-time with our interactive console</p>
          <div class="integration-links">
            <button class="integration-link primary" onclick="openApiTester()">
              <span>🚀 API Tester</span>
              <span class="link-arrow">→</span>
            </button>
            <button class="integration-link secondary" onclick="openPostmanCollection()">
              <span>📦 Postman Collection</span>
            </button>
          </div>
        </div>

        <div class="integration-section webhooks">
          <div class="section-icon">🪝</div>
          <h3>Webhook Management</h3>
          <p>Configure real-time event notifications</p>
          <div class="integration-links">
            <a href="/api/developer" class="integration-link primary">
              <span>⚙️ Configure Webhooks</span>
              <span class="link-arrow">→</span>
            </a>
            <button class="integration-link secondary" onclick="testWebhook()">
              <span>🧪 Test Webhook</span>
            </button>
          </div>
        </div>

        <div class="integration-section sdks">
          <div class="section-icon">📦</div>
          <h3>SDK & Libraries</h3>
          <p>Official SDKs for popular programming languages</p>
          <div class="sdk-options">
            <button class="sdk-btn" onclick="downloadSdk('javascript')">JS</button>
            <button class="sdk-btn" onclick="downloadSdk('python')">Python</button>
            <button class="sdk-btn" onclick="downloadSdk('php')">PHP</button>
            <button class="sdk-btn" onclick="downloadSdk('java')">Java</button>
            <button class="sdk-btn" onclick="downloadSdk('csharp')">C#</button>
          </div>
        </div>
      </div>

      <div class="integration-stats">
        <div class="stat-box">
          <div class="stat-number">99.9%</div>
          <div class="stat-label">API Uptime</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">< 100ms</div>
          <div class="stat-label">Response Time</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">500+</div>
          <div class="stat-label">Endpoints</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">24/7</div>
          <div class="stat-label">Support</div>
        </div>
      </div>
    </div>
  `;
}

function generateAdvancedContactForms(employee: EmployeeData): string {
  return `
    <div class="advanced-contact-forms" id="contact-forms">
      <div class="section-header">
        <h2>📝 Advanced Contact Forms</h2>
        <p>Specialized forms for different types of inquiries and support requests</p>
      </div>

      <div class="forms-tabs">
        <div class="tab-buttons">
          <button class="tab-btn active" onclick="switchFormTab('general')">General Inquiry</button>
          <button class="tab-btn" onclick="switchFormTab('technical')">Technical Support</button>
          <button class="tab-btn" onclick="switchFormTab('api')">API Integration</button>
          <button class="tab-btn" onclick="switchFormTab('business')">Business Development</button>
          ${employee.tier === 5 ? '<button class="tab-btn vip" onclick="switchFormTab(\'vip\')">VIP Support</button>' : ''}
        </div>

        <div class="tab-content">
          <!-- General Inquiry Form -->
          <div class="form-tab active" id="general-form">
            <div class="form-header">
              <h3>💬 General Inquiry</h3>
              <p>Send us a general message or question</p>
            </div>
            <form class="contact-form" id="generalForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="general-name">Your Name *</label>
                  <input type="text" id="general-name" name="name" required>
                </div>
                <div class="form-group">
                  <label for="general-company">Company</label>
                  <input type="text" id="general-company" name="company">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="general-email">Email *</label>
                  <input type="email" id="general-email" name="email" required>
                </div>
                <div class="form-group">
                  <label for="general-phone">Phone</label>
                  <input type="tel" id="general-phone" name="phone">
                </div>
              </div>

              <div class="form-group">
                <label for="general-subject">Subject *</label>
                <input type="text" id="general-subject" name="subject" required>
              </div>

              <div class="form-group">
                <label for="general-category">Category</label>
                <select id="general-category" name="category">
                  <option value="general">General Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="general-message">Message *</label>
                <textarea id="general-message" name="message" rows="5" required></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="form-submit-btn primary">
                  <span class="btn-icon">📤</span>
                  <span>Send Message</span>
                </button>
                <button type="button" class="form-submit-btn secondary" onclick="saveDraft('general')">
                  <span class="btn-icon">💾</span>
                  <span>Save Draft</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Technical Support Form -->
          <div class="form-tab" id="technical-form">
            <div class="form-header">
              <h3>🛠️ Technical Support</h3>
              <p>Report technical issues or request assistance</p>
            </div>
            <form class="contact-form" id="technicalForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="tech-name">Your Name *</label>
                  <input type="text" id="tech-name" name="name" required>
                </div>
                <div class="form-group">
                  <label for="tech-urgency">Urgency Level</label>
                  <select id="tech-urgency" name="urgency">
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Affects workflow</option>
                    <option value="high">High - System down</option>
                    <option value="critical">Critical - Business impact</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="tech-email">Email *</label>
                  <input type="email" id="tech-email" name="email" required>
                </div>
                <div class="form-group">
                  <label for="tech-system">Affected System</label>
                  <select id="tech-system" name="system">
                    <option value="api">API Integration</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="mobile">Mobile App</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="tech-subject">Issue Summary *</label>
                <input type="text" id="tech-subject" name="subject" required placeholder="Brief description of the issue">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="tech-browser">Browser/OS</label>
                  <input type="text" id="tech-browser" name="browser" placeholder="Chrome 91, Windows 10, etc.">
                </div>
                <div class="form-group">
                  <label for="tech-steps">Steps to Reproduce</label>
                  <input type="text" id="tech-steps" name="steps" placeholder="How to reproduce the issue">
                </div>
              </div>

              <div class="form-group">
                <label for="tech-description">Detailed Description *</label>
                <textarea id="tech-description" name="description" rows="6" required placeholder="Please provide as much detail as possible..."></textarea>
              </div>

              <div class="form-group">
                <label for="tech-files">Attachments</label>
                <input type="file" id="tech-files" name="files" multiple accept=".jpg,.png,.gif,.pdf,.txt,.log">
                <small class="file-help">Upload screenshots, logs, or related files (max 10MB)</small>
              </div>

              <div class="form-actions">
                <button type="submit" class="form-submit-btn primary">
                  <span class="btn-icon">🚨</span>
                  <span>Submit Support Request</span>
                </button>
                <button type="button" class="form-submit-btn secondary" onclick="saveDraft('technical')">
                  <span class="btn-icon">💾</span>
                  <span>Save Draft</span>
                </button>
              </div>
            </form>
          </div>

          <!-- API Integration Form -->
          <div class="form-tab" id="api-form">
            <div class="form-header">
              <h3>🔌 API Integration Support</h3>
              <p>Get help with API integration and development</p>
            </div>
            <form class="contact-form" id="apiForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="api-name">Developer Name *</label>
                  <input type="text" id="api-name" name="name" required>
                </div>
                <div class="form-group">
                  <label for="api-company">Company *</label>
                  <input type="text" id="api-company" name="company" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="api-email">Email *</label>
                  <input type="email" id="api-email" name="email" required>
                </div>
                <div class="form-group">
                  <label for="api-language">Primary Language</label>
                  <select id="api-language" name="language">
                    <option value="javascript">JavaScript/Node.js</option>
                    <option value="python">Python</option>
                    <option value="php">PHP</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="api-endpoints">Endpoints Needed</label>
                <div class="checkbox-group">
                  <label><input type="checkbox" name="endpoints" value="clients"> Client Management</label>
                  <label><input type="checkbox" name="endpoints" value="bets"> Betting Operations</label>
                  <label><input type="checkbox" name="endpoints" value="analytics"> Analytics</label>
                  <label><input type="checkbox" name="endpoints" value="webhooks"> Webhooks</label>
                </div>
              </div>

              <div class="form-group">
                <label for="api-subject">Integration Type *</label>
                <select id="api-subject" name="subject" required>
                  <option value="">Select integration type...</option>
                  <option value="authentication">Authentication Setup</option>
                  <option value="webhook">Webhook Configuration</option>
                  <option value="data-sync">Data Synchronization</option>
                  <option value="custom">Custom Integration</option>
                  <option value="troubleshooting">Troubleshooting</option>
                </select>
              </div>

              <div class="form-group">
                <label for="api-description">Integration Details *</label>
                <textarea id="api-description" name="description" rows="5" required placeholder="Describe your integration requirements, current setup, and any specific challenges..."></textarea>
              </div>

              <div class="form-group">
                <label for="api-timeline">Timeline</label>
                <select id="api-timeline" name="timeline">
                  <option value="asap">ASAP</option>
                  <option value="week">Within a week</option>
                  <option value="month">Within a month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="submit" class="form-submit-btn primary">
                  <span class="btn-icon">🔌</span>
                  <span>Request Integration Support</span>
                </button>
                <button type="button" class="form-submit-btn secondary" onclick="saveDraft('api')">
                  <span class="btn-icon">💾</span>
                  <span>Save Draft</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Business Development Form -->
          <div class="form-tab" id="business-form">
            <div class="form-header">
              <h3>💼 Business Development</h3>
              <p>Discuss partnerships, integrations, and business opportunities</p>
            </div>
            <form class="contact-form" id="businessForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="business-name">Contact Name *</label>
                  <input type="text" id="business-name" name="name" required>
                </div>
                <div class="form-group">
                  <label for="business-title">Job Title *</label>
                  <input type="text" id="business-title" name="title" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="business-company">Company *</label>
                  <input type="text" id="business-company" name="company" required>
                </div>
                <div class="form-group">
                  <label for="business-website">Website</label>
                  <input type="url" id="business-website" name="website" placeholder="https://">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="business-email">Email *</label>
                  <input type="email" id="business-email" name="email" required>
                </div>
                <div class="form-group">
                  <label for="business-phone">Phone *</label>
                  <input type="tel" id="business-phone" name="phone" required>
                </div>
              </div>

              <div class="form-group">
                <label for="business-type">Business Inquiry Type *</label>
                <select id="business-type" name="type" required>
                  <option value="">Select inquiry type...</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="integration">Platform Integration</option>
                  <option value="reseller">Reseller Agreement</option>
                  <option value="investment">Investment Discussion</option>
                  <option value="acquisition">Acquisition Interest</option>
                  <option value="other">Other Business Inquiry</option>
                </select>
              </div>

              <div class="form-group">
                <label for="business-description">Business Proposal *</label>
                <textarea id="business-description" name="description" rows="6" required placeholder="Please describe your business proposal, partnership idea, or integration requirements in detail..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="business-budget">Budget Range</label>
                  <select id="business-budget" name="budget">
                    <option value="">Select range...</option>
                    <option value="under-10k">Under $10K</option>
                    <option value="10k-50k">$10K - $50K</option>
                    <option value="50k-100k">$50K - $100K</option>
                    <option value="100k-500k">$100K - $500K</option>
                    <option value="over-500k">Over $500K</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="business-timeline">Expected Timeline</label>
                  <select id="business-timeline" name="timeline">
                    <option value="immediate">Immediate</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="6-months">Within 6 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="form-submit-btn primary">
                  <span class="btn-icon">🤝</span>
                  <span>Submit Business Inquiry</span>
                </button>
                <button type="button" class="form-submit-btn secondary" onclick="saveDraft('business')">
                  <span class="btn-icon">💾</span>
                  <span>Save Draft</span>
                </button>
              </div>
            </form>
          </div>

          ${employee.tier === 5 ? `
          <!-- VIP Support Form -->
          <div class="form-tab" id="vip-form">
            <div class="form-header vip-header">
              <h3>👑 VIP Priority Support</h3>
              <p>Exclusive support channel for premium clients</p>
            </div>
            <form class="contact-form vip-form" id="vipForm">
              <div class="vip-notice">
                <div class="vip-icon">👑</div>
                <div class="vip-text">
                  <h4>Priority Support Guaranteed</h4>
                  <p>Your inquiry will receive immediate attention from our executive team</p>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="vip-name">VIP Client Name *</label>
                  <input type="text" id="vip-name" name="name" required>
                </div>
                <div class="form-group">
                  <label for="vip-priority">Priority Level</label>
                  <select id="vip-priority" name="priority">
                    <option value="vip-standard">VIP Standard</option>
                    <option value="vip-urgent">VIP Urgent</option>
                    <option value="vip-critical">VIP Critical</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="vip-email">Secure Email *</label>
                  <input type="email" id="vip-email" name="email" required>
                </div>
                <div class="form-group">
                  <label for="vip-phone">Direct Line</label>
                  <input type="tel" id="vip-phone" name="phone">
                </div>
              </div>

              <div class="form-group">
                <label for="vip-subject">VIP Matter *</label>
                <input type="text" id="vip-subject" name="subject" required placeholder="Brief description of VIP matter">
              </div>

              <div class="form-group">
                <label for="vip-confidentiality">Confidentiality Level</label>
                <select id="vip-confidentiality" name="confidentiality">
                  <option value="standard">Standard Business</option>
                  <option value="confidential">Confidential</option>
                  <option value="highly-confidential">Highly Confidential</option>
                </select>
              </div>

              <div class="form-group">
                <label for="vip-description">VIP Request Details *</label>
                <textarea id="vip-description" name="description" rows="6" required placeholder="Please provide detailed information about your VIP request or concern..."></textarea>
              </div>

              <div class="vip-sla">
                <div class="sla-item">
                  <div class="sla-time">⚡ < 30 min</div>
                  <div class="sla-desc">Initial Response</div>
                </div>
                <div class="sla-item">
                  <div class="sla-time">🎯 < 2 hrs</div>
                  <div class="sla-desc">Resolution Time</div>
                </div>
                <div class="sla-item">
                  <div class="sla-time">👑 24/7</div>
                  <div class="sla-desc">Support Available</div>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="form-submit-btn vip">
                  <span class="btn-icon">👑</span>
                  <span>Submit VIP Request</span>
                </button>
                <button type="button" class="form-submit-btn secondary" onclick="requestUrgentCall()">
                  <span class="btn-icon">📞</span>
                  <span>Request Urgent Call</span>
                </button>
              </div>
            </form>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function generateLiveSupport(employee: EmployeeData): string {
  return `
    <div class="live-support-section" id="live-support">
      <div class="section-header">
        <h2>💬 Live Support Center</h2>
        <p>Real-time assistance through multiple channels</p>
      </div>

      <div class="live-support-grid">
        <div class="support-channel live-chat">
          <div class="channel-header">
            <div class="channel-icon">💬</div>
            <div class="channel-info">
              <h3>Live Chat Support</h3>
              <p>Instant messaging with our support team</p>
            </div>
            <div class="status-indicator online">
              <span class="status-dot"></span>
              <span>Online Now</span>
            </div>
          </div>

          <div class="channel-features">
            <div class="feature">
              <span class="feature-icon">⚡</span>
              <span>Response in < 30 seconds</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🌐</span>
              <span>24/7 Availability</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔒</span>
              <span>Secure & Encrypted</span>
            </div>
          </div>

          <div class="channel-preview">
            <div class="preview-message">
              <div class="message-avatar">👨‍💼</div>
              <div class="message-content">
                <div class="message-name">Support Agent</div>
                <div class="message-text">Hi! How can I help you today?</div>
                <div class="message-time">Just now</div>
              </div>
            </div>
          </div>

          <button class="channel-btn primary" onclick="startLiveChat()">
            <span class="btn-icon">💬</span>
            <span>Start Live Chat</span>
          </button>
        </div>

        <div class="support-channel video-call">
          <div class="channel-header">
            <div class="channel-icon">📹</div>
            <div class="channel-info">
              <h3>Video Consultation</h3>
              <p>Face-to-face support sessions</p>
            </div>
            <div class="status-indicator available">
              <span class="status-dot"></span>
              <span>Available</span>
            </div>
          </div>

          <div class="channel-features">
            <div class="feature">
              <span class="feature-icon">🎥</span>
              <span>HD Video Quality</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📅</span>
              <span>Schedule Ahead</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📝</span>
              <span>Session Recording</span>
            </div>
          </div>

          <div class="channel-options">
            <button class="option-btn" onclick="scheduleVideoCall()">
              <span class="btn-icon">📅</span>
              <span>Schedule Call</span>
            </button>
            <button class="option-btn" onclick="instantVideoCall()">
              <span class="btn-icon">⚡</span>
              <span>Instant Call</span>
            </button>
          </div>
        </div>

        <div class="support-channel phone-support">
          <div class="channel-header">
            <div class="channel-icon">📞</div>
            <div class="channel-info">
              <h3>Phone Support</h3>
              <p>Direct voice communication</p>
            </div>
            <div class="status-indicator busy">
              <span class="status-dot"></span>
              <span>Busy - Callback in 5 min</span>
            </div>
          </div>

          <div class="channel-features">
            <div class="feature">
              <span class="feature-icon">🎯</span>
              <span>Direct Expert Access</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔄</span>
              <span>Callback Service</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📞</span>
              <span>Toll-Free Numbers</span>
            </div>
          </div>

          <div class="phone-numbers">
            <div class="phone-item">
              <span class="phone-label">General Support:</span>
              <span class="phone-number">1-800-FANTASY</span>
            </div>
            <div class="phone-item">
              <span class="phone-label">API Support:</span>
              <span class="phone-number">1-800-API-HELP</span>
            </div>
            <div class="phone-item vip">
              <span class="phone-label">VIP Priority:</span>
              <span class="phone-number">1-800-VIP-HELP</span>
            </div>
          </div>
        </div>

        <div class="support-channel remote-access">
          <div class="channel-header">
            <div class="channel-icon">🖥️</div>
            <div class="channel-info">
              <h3>Remote Assistance</h3>
              <p>Screen sharing and remote control</p>
            </div>
            <div class="status-indicator available">
              <span class="status-dot"></span>
              <span>Available</span>
            </div>
          </div>

          <div class="channel-features">
            <div class="feature">
              <span class="feature-icon">🖼️</span>
              <span>Screen Sharing</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔧</span>
              <span>Remote Control</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>System Diagnostics</span>
            </div>
          </div>

          <button class="channel-btn secondary" onclick="requestRemoteAccess()">
            <span class="btn-icon">🖥️</span>
            <span>Request Remote Help</span>
          </button>
        </div>
      </div>

      <div class="support-queue">
        <div class="queue-header">
          <h3>📊 Current Support Status</h3>
        </div>
        <div class="queue-stats">
          <div class="queue-stat">
            <div class="stat-value">3</div>
            <div class="stat-label">Agents Online</div>
          </div>
          <div class="queue-stat">
            <div class="stat-value">12</div>
            <div class="stat-label">In Queue</div>
          </div>
          <div class="queue-stat">
            <div class="stat-value">< 5 min</div>
            <div class="stat-label">Wait Time</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateSupportTickets(employee: EmployeeData): string {
  return `
    <div class="support-tickets-section" id="support-tickets">
      <div class="section-header">
        <h2>🎫 Support Ticket System</h2>
        <p>Track and manage your support requests</p>
      </div>

      <div class="tickets-dashboard">
        <div class="tickets-header">
          <div class="tickets-stats">
            <div class="stat-card">
              <div class="stat-icon">📋</div>
              <div class="stat-info">
                <div class="stat-number">12</div>
                <div class="stat-label">Open Tickets</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-number">47</div>
                <div class="stat-label">Resolved</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏱️</div>
              <div class="stat-info">
                <div class="stat-number">2.3h</div>
                <div class="stat-label">Avg Response</div>
              </div>
            </div>
          </div>

          <button class="create-ticket-btn" onclick="createNewTicket()">
            <span class="btn-icon">➕</span>
            <span>New Ticket</span>
          </button>
        </div>

        <div class="tickets-list">
          <div class="ticket-item active">
            <div class="ticket-header">
              <div class="ticket-id">#TK-2024-001</div>
              <div class="ticket-status open">Open</div>
              <div class="ticket-priority high">High</div>
            </div>
            <div class="ticket-content">
              <h4>API Integration Authentication Issue</h4>
              <p>Having trouble with JWT token authentication in the client management endpoints...</p>
              <div class="ticket-meta">
                <span class="ticket-date">2 hours ago</span>
                <span class="ticket-agent">Agent: Sarah K.</span>
                <span class="ticket-updates">3 updates</span>
              </div>
            </div>
            <div class="ticket-actions">
              <button class="ticket-btn" onclick="viewTicket('TK-2024-001')">View</button>
              <button class="ticket-btn" onclick="updateTicket('TK-2024-001')">Update</button>
            </div>
          </div>

          <div class="ticket-item pending">
            <div class="ticket-header">
              <div class="ticket-id">#TK-2024-002</div>
              <div class="ticket-status pending">Pending</div>
              <div class="ticket-priority medium">Medium</div>
            </div>
            <div class="ticket-content">
              <h4>Webhook Configuration Request</h4>
              <p>Need assistance setting up webhooks for real-time betting notifications...</p>
              <div class="ticket-meta">
                <span class="ticket-date">4 hours ago</span>
                <span class="ticket-agent">Agent: Mike R.</span>
                <span class="ticket-updates">1 update</span>
              </div>
            </div>
            <div class="ticket-actions">
              <button class="ticket-btn" onclick="viewTicket('TK-2024-002')">View</button>
              <button class="ticket-btn" onclick="updateTicket('TK-2024-002')">Update</button>
            </div>
          </div>

          <div class="ticket-item resolved">
            <div class="ticket-header">
              <div class="ticket-id">#TK-2024-003</div>
              <div class="ticket-status resolved">Resolved</div>
              <div class="ticket-priority low">Low</div>
            </div>
            <div class="ticket-content">
              <h4>Dashboard Loading Performance</h4>
              <p>Dashboard was loading slowly - optimized caching and reduced load times by 40%...</p>
              <div class="ticket-meta">
                <span class="ticket-date">1 day ago</span>
                <span class="ticket-agent">Agent: John D.</span>
                <span class="ticket-updates">5 updates</span>
              </div>
            </div>
            <div class="ticket-actions">
              <button class="ticket-btn" onclick="viewTicket('TK-2024-003')">View</button>
              <button class="ticket-btn" onclick="reopenTicket('TK-2024-003')">Reopen</button>
            </div>
          </div>
        </div>

        <div class="tickets-footer">
          <button class="view-all-btn" onclick="viewAllTickets()">
            <span>View All Tickets</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>

      <div class="support-sla">
        <div class="sla-header">
          <h3>⏱️ Service Level Agreements</h3>
        </div>
        <div class="sla-grid">
          <div class="sla-tier">
            <div class="tier-name">Standard Support</div>
            <div class="tier-response">Response: < 4 hours</div>
            <div class="tier-resolution">Resolution: < 24 hours</div>
          </div>
          <div class="sla-tier priority">
            <div class="tier-name">Priority Support</div>
            <div class="tier-response">Response: < 2 hours</div>
            <div class="tier-resolution">Resolution: < 12 hours</div>
          </div>
          <div class="sla-tier vip">
            <div class="tier-name">VIP Support</div>
            <div class="tier-response">Response: < 30 min</div>
            <div class="tier-resolution">Resolution: < 2 hours</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateBusinessHours(employee: EmployeeData): string {
  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST', available: true },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST', available: employee.tier >= 3 },
    { day: 'Sunday', hours: 'Emergency Only', available: employee.tier === 5 },
  ];

  const availableHours = businessHours.filter(hour => hour.available);

  return `
    <div class="enterprise-business-hours" id="business-hours">
      <div class="section-header">
        <h2>🕒 Support Hours & Availability</h2>
        <p>Our comprehensive support schedule across all channels</p>
      </div>

      <div class="hours-grid">
        ${availableHours.map(hour => `
          <div class="hour-card ${hour.available ? 'available' : 'unavailable'}">
            <div class="hour-header">
              <div class="day-name">${hour.day}</div>
              <div class="availability-status">
                ${hour.available ? '<span class="status available">✓ Available</span>' : '<span class="status unavailable">✗ Unavailable</span>'}
              </div>
            </div>
            <div class="hour-details">
              <div class="hours-time">${hour.hours}</div>
              <div class="hours-description">
                ${hour.available ?
                  'Full support across all channels including live chat, phone, and email' :
                  'Emergency support only for critical system issues'}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      ${employee.tier === 5 ? `
        <div class="vip-hours-notice">
          <div class="vip-notice-header">
            <div class="vip-notice-icon">👑</div>
            <div class="vip-notice-title">24/7 VIP Support</div>
          </div>
          <div class="vip-notice-content">
            <p>As a VIP Management executive, I provide round-the-clock support for critical client matters and urgent business needs.</p>
            <div class="vip-contact-options">
              <div class="vip-option">
                <span class="option-icon">📞</span>
                <span class="option-text">Direct VIP Line: 1-800-VIP-HELP</span>
              </div>
              <div class="vip-option">
                <span class="option-icon">✈️</span>
                <span class="option-text">Emergency Telegram: @vip_support</span>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="response-guarantee">
        <div class="guarantee-header">
          <h3>⚡ Response Time Guarantee</h3>
        </div>
        <div class="guarantee-grid">
          <div class="guarantee-tier">
            <div class="tier-name">Standard</div>
            <div class="tier-response">< 4 hours</div>
            <div class="tier-description">General inquiries and non-urgent matters</div>
          </div>
          <div class="guarantee-tier priority">
            <div class="tier-name">Priority</div>
            <div class="tier-response">< 2 hours</div>
            <div class="tier-description">API issues and workflow disruptions</div>
          </div>
          <div class="guarantee-tier vip">
            <div class="tier-name">VIP</div>
            <div class="tier-response">< 30 min</div>
            <div class="tier-description">Critical business and system issues</div>
          </div>
        </div>
      </div>

      <div class="timezone-notice">
        <div class="timezone-icon">🌍</div>
        <div class="timezone-content">
          <h4>All times shown in Eastern Time (ET)</h4>
          <p>Support is available 24/7 for urgent matters through our emergency channels</p>
        </div>
      </div>
    </div>
  `;
}


function getEnterpriseContactStyles(): string {
  return `/* Enterprise Contact Page Styles */
    .enterprise-contact-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
      min-height: 100vh;
    }

    .enterprise-contact-hero {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(64, 224, 208, 0.1));
      border: 2px solid #ffd700;
      border-radius: 20px;
      padding: 3rem;
      margin-bottom: 3rem;
      position: relative;
      overflow: hidden;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .hero-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg,
        rgba(255, 215, 0, 0.1) 0%,
        rgba(255, 107, 53, 0.1) 25%,
        rgba(168, 85, 247, 0.1) 50%,
        rgba(64, 224, 208, 0.1) 75%,
        rgba(255, 215, 0, 0.1) 100%);
      animation: gradient-shift 8s ease-in-out infinite;
    }

    .hero-particles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 1px, transparent 1px),
        radial-gradient(circle at 80% 20%, rgba(64, 224, 208, 0.1) 1px, transparent 1px),
        radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.1) 1px, transparent 1px);
      background-size: 100px 100px, 150px 150px, 200px 200px;
      animation: particle-float 20s ease-in-out infinite;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-header h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #ffd700, #ff6b35);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    .hero-subtitle {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      color: #a0a9b8;
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }

    .pulse-dot {
      width: 12px;
      height: 12px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .hero-executive {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .executive-avatar {
      position: relative;
    }

    .avatar-glow {
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      background: linear-gradient(135deg, #ffd700, #ff6b35, #a855f7, #40e0d0);
      border-radius: 50%;
      opacity: 0.3;
      animation: glow-pulse 3s ease-in-out infinite;
    }

    .executive-emoji {
      font-size: 4rem;
      position: relative;
      z-index: 1;
    }

    .executive-info h2 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #e0e6ed;
    }

    .executive-title {
      color: #40e0d0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .executive-dept {
      color: #a0a9b8;
      font-size: 1rem;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 215, 0, 0.3);
      min-width: 120px;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #ffd700;
      display: block;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #a0a9b8;
      font-size: 0.9rem;
    }

    .hero-description {
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-description p {
      color: #a0a9b8;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }

    .hero-btn.primary {
      background: linear-gradient(135deg, #ffd700, #ff6b35);
      color: #000;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }

    .hero-btn.secondary {
      background: rgba(64, 224, 208, 0.1);
      color: #40e0d0;
      border: 2px solid rgba(64, 224, 208, 0.3);
    }

    .hero-btn.accent {
      background: linear-gradient(135deg, #ff6b35, #a855f7);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
    }

    .hero-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    /* Section Headers */
    .section-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .section-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ffd700, #ff6b35);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .section-header p {
      color: #a0a9b8;
      font-size: 1rem;
    }

    /* Contact Methods */
    .enterprise-contact-methods {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 215, 0, 0.3);
    }

    /* Quick Contact Summary */
    .quick-contact-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(64, 224, 208, 0.2);
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(64, 224, 208, 0.1);
      transition: all 0.3s ease;
      position: relative;
    }

    .summary-item:hover {
      transform: translateY(-2px);
      border-color: #40e0d0;
      box-shadow: 0 4px 15px rgba(64, 224, 208, 0.1);
    }

    .summary-icon {
      font-size: 2rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ffd700, #ff6b35);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .summary-content {
      flex: 1;
      min-width: 0;
    }

    .summary-label {
      font-size: 0.9rem;
      color: #a0a9b8;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .summary-value {
      font-size: 1.1rem;
      color: #e0e6ed;
      font-weight: 700;
      word-break: break-all;
    }

    .copy-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(64, 224, 208, 0.1);
      color: #40e0d0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .copy-btn:hover {
      background: #40e0d0;
      color: #0a0e27;
      transform: scale(1.1);
    }

    .copy-btn:active {
      transform: scale(0.95);
    }

    /* Primary Channels Grid */
    .primary-channels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .primary-channel-card {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2rem;
      border: 1px solid rgba(64, 224, 208, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .primary-channel-card:hover {
      transform: translateY(-5px);
      border-color: #40e0d0;
      box-shadow: 0 12px 30px rgba(64, 224, 208, 0.2);
    }

    .primary-channel-card.live-chat {
      border-color: rgba(34, 197, 94, 0.3);
    }

    .primary-channel-card.live-chat:hover {
      border-color: #22c55e;
      box-shadow: 0 12px 30px rgba(34, 197, 94, 0.2);
    }

    .primary-channel-card.api-integration {
      border-color: rgba(255, 215, 0, 0.3);
    }

    .primary-channel-card.api-integration:hover {
      border-color: #ffd700;
      box-shadow: 0 12px 30px rgba(255, 215, 0, 0.2);
    }

    .primary-channel-card.contact-forms {
      border-color: rgba(255, 107, 53, 0.3);
    }

    .primary-channel-card.contact-forms:hover {
      border-color: #ff6b35;
      box-shadow: 0 12px 30px rgba(255, 107, 53, 0.2);
    }

    .channel-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .channel-icon-large {
      font-size: 4rem;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ffd700, #ff6b35);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .channel-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #22c55e;
      position: relative;
    }

    .status-indicator.online {
      animation: pulse 2s infinite;
    }

    .status-indicator::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border: 2px solid rgba(34, 197, 94, 0.3);
      border-radius: 50%;
      animation: pulse-ring 2s infinite;
    }

    .status-text {
      color: #22c55e;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .channel-content h3 {
      color: #e0e6ed;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .channel-content p {
      color: #a0a9b8;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .channel-features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .channel-features .feature {
      background: rgba(64, 224, 208, 0.1);
      color: #40e0d0;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .channel-metrics {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .metric-value {
      color: #40e0d0;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .metric-label {
      color: #a0a9b8;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .channel-actions {
      margin-top: auto;
    }

    .channel-btn.large {
      width: 100%;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      border-radius: 12px;
      font-weight: 700;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .channel-btn.primary.large {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
    }

    .channel-btn.primary.large:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
    }

    .channel-btn.secondary.large {
      background: linear-gradient(135deg, #ffd700, #f59e0b);
      color: #000;
    }

    .channel-btn.secondary.large:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
    }

    .channel-btn.accent.large {
      background: linear-gradient(135deg, #ff6b35, #dc2626);
      color: white;
    }

    .channel-btn.accent.large:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
    }

    /* Additional Channels */
    .additional-channels {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .additional-channels h3 {
      color: #e0e6ed;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .additional-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .additional-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .additional-card:hover {
      transform: translateY(-2px);
      border-color: rgba(64, 224, 208, 0.3);
      background: rgba(255, 255, 255, 0.08);
    }

    .additional-icon {
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(64, 224, 208, 0.1);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .additional-content {
      flex: 1;
    }

    .additional-content h4 {
      color: #e0e6ed;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    .additional-content p {
      color: #a0a9b8;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .additional-btn {
      background: rgba(64, 224, 208, 0.1);
      color: #40e0d0;
      border: 1px solid rgba(64, 224, 208, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .additional-btn:hover {
      background: #40e0d0;
      color: #0a0e27;
      transform: translateY(-1px);
    }

    /* Animations */
    @keyframes pulse-ring {
      0% {
        transform: scale(0.33);
        opacity: 1;
      }
      40%, 50% {
        opacity: 0.7;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }

    .methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .contact-method-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 2rem;
      border: 1px solid rgba(64, 224, 208, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .contact-method-card:hover {
      transform: translateY(-5px);
      border-color: #40e0d0;
      box-shadow: 0 8px 25px rgba(64, 224, 208, 0.2);
    }

    .contact-method-card.primary {
      border-color: rgba(255, 215, 0, 0.3);
      background: rgba(255, 215, 0, 0.05);
    }

    .contact-method-card.primary:hover {
      border-color: #ffd700;
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
    }

    .contact-method-card.vip {
      border-color: rgba(168, 85, 247, 0.3);
      background: rgba(168, 85, 247, 0.05);
    }

    .contact-method-card.vip:hover {
      border-color: #a855f7;
      box-shadow: 0 8px 25px rgba(168, 85, 247, 0.2);
    }

    .method-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .method-icon {
      font-size: 2.5rem;
    }

    .method-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-end;
    }

    .availability-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .availability-badge.always {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .availability-badge.business {
      background: rgba(251, 191, 36, 0.2);
      color: #f59e0b;
    }

    .priority-badge {
      background: linear-gradient(135deg, #ffd700, #ff6b35);
      color: #000;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .method-content h3 {
      color: #e0e6ed;
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }

    .method-value {
      color: #40e0d0;
      font-family: monospace;
      font-size: 1rem;
      margin-bottom: 0.5rem;
      word-break: break-all;
    }

    .method-description {
      color: #a0a9b8;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .method-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .method-btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .method-btn.primary {
      background: linear-gradient(135deg, #ffd700, #ff6b35);
      color: #000;
    }

    .method-btn.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #a0a9b8;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .method-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .method-glow {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ffd700, #ff6b35, #a855f7, #40e0d0);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .contact-method-card:hover .method-glow {
      opacity: 1;
    }

    .contact-tips {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .tip-card {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .tip-icon {
      font-size: 1.5rem;
      color: #22c55e;
    }

    .tip-content h4 {
      color: #e0e6ed;
      margin-bottom: 0.5rem;
    }

    .tip-content p {
      color: #a0a9b8;
      font-size: 0.9rem;
    }

    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    @keyframes particle-float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-10px) rotate(120deg); }
      66% { transform: translateY(5px) rotate(240deg); }
    }

    @keyframes glow-pulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.05); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (max-width: 768px) {
      .enterprise-contact-hero {
        padding: 2rem;
      }

      .hero-header h1 {
        font-size: 2rem;
      }

      .executive-info h2 {
        font-size: 2rem;
      }

      .hero-stats {
        gap: 1rem;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .methods-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Responsive Design for Quick Contact Summary */
    @media (max-width: 768px) {
      .quick-contact-summary {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1.5rem;
      }

      .summary-item {
        padding: 0.75rem;
        gap: 0.75rem;
      }

      .summary-icon {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
      }

      .summary-value {
        font-size: 1rem;
        word-break: break-word;
      }

      .copy-btn {
        width: 35px;
        height: 35px;
        font-size: 1rem;
      }
    }

    @media (max-width: 480px) {
      .quick-contact-summary {
        padding: 1rem;
      }

      .summary-item {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
        padding: 1rem 0.5rem;
      }

      .summary-content {
        text-align: center;
      }

      .copy-btn {
        align-self: center;
      }

      /* Primary Channels Responsive */
      .primary-channels-grid {
        grid-template-columns: 1fr;
      }

      .channel-hero {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .channel-icon-large {
        width: 60px;
        height: 60px;
        font-size: 3rem;
      }

      .channel-content h3 {
        font-size: 1.3rem;
      }

      .channel-metrics {
        justify-content: center;
        gap: 3rem;
      }

      .additional-grid {
        grid-template-columns: 1fr;
      }

      .additional-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `;
}

function getEnterpriseContactScripts(): string {
  return `// Enterprise Contact Page - Interactive Features
    document.addEventListener('DOMContentLoaded', function() {
      initializeEnterpriseContact();
    });

    function initializeEnterpriseContact() {
      startContactUpdates();
      setupContactListeners();
      initializeFormTabs();
    }

    function startContactUpdates() {
      setInterval(() => {
        updateContactTimestamp();
        updateSupportStatus();
      }, 1000);
    }

    function updateContactTimestamp() {
      const element = document.getElementById('contactLastUpdate');
      if (element) {
        element.textContent = new Date().toLocaleTimeString();
      }
    }

    function updateSupportStatus() {
      // Simulate real-time support status updates
      const onlineAgents = document.querySelectorAll('.stat-value')[0];
      const queueCount = document.querySelectorAll('.stat-value')[1];
      const waitTime = document.querySelectorAll('.stat-value')[2];

      if (onlineAgents && queueCount && waitTime) {
        // Random realistic updates
        const agents = Math.floor(Math.random() * 3) + 2; // 2-4 agents
        const queue = Math.floor(Math.random() * 15) + 5; // 5-19 in queue
        const wait = Math.floor(Math.random() * 10) + 2; // 2-11 minutes

        onlineAgents.textContent = agents;
        queueCount.textContent = queue;
        waitTime.textContent = '< ' + wait + ' min';
      }
    }

    // Enhanced copy to clipboard function
    function copyToClipboard(text, type) {
      navigator.clipboard.writeText(text).then(() => {
        showNotification(\`\${type} copied to clipboard! 📋\`, 'success');
      }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', 'error');
      });
    }

    function setupContactListeners() {
      // Copy contact info buttons
      document.querySelectorAll('.method-btn.secondary').forEach(btn => {
        btn.addEventListener('click', function() {
          const card = this.closest('.contact-method-card');
          const valueElement = card.querySelector('.method-value');
          const titleElement = card.querySelector('h3');
          if (valueElement && titleElement) {
            copyContactInfo(valueElement.textContent, titleElement.textContent);
          }
        });
      });

      // Form submissions
      setupFormHandlers();
    }

    function copyContactInfo(value, type) {
      navigator.clipboard.writeText(value).then(() => {
        showNotification(type + ' copied to clipboard!', 'success');
      }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', 'error');
      });
    }

    function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = 'notification ' + type;
      notification.innerHTML = \`
        <div class="notification-icon">\${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
        <div class="notification-message">\${message}</div>
      \`;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }

    function initializeFormTabs() {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          switchFormTab(this.textContent.toLowerCase().replace(/\\s+/g, '-'));
        });
      });
    }

    function switchFormTab(tab) {
      // Remove active class from all tabs
      document.querySelectorAll('.tab-btn').forEach(t => {
        t.classList.remove('active');
      });
      document.querySelectorAll('.form-tab').forEach(f => {
        f.classList.remove('active');
      });

      // Add active class to selected tab
      const tabBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn =>
        btn.textContent.toLowerCase().replace(/\\s+/g, '-') === tab ||
        btn.textContent.toLowerCase().replace(/\\s+/g, '-') === tab.replace('-', '')
      );
      const formTab = document.getElementById(tab + '-form') || document.getElementById(tab.replace('-', '') + '-form');

      if (tabBtn) tabBtn.classList.add('active');
      if (formTab) formTab.classList.add('active');
    }

    function setupFormHandlers() {
      // General form
      const generalForm = document.getElementById('generalForm');
      if (generalForm) {
        generalForm.addEventListener('submit', function(e) {
          e.preventDefault();
          handleFormSubmission('general', this);
        });
      }

      // Technical form
      const technicalForm = document.getElementById('technicalForm');
      if (technicalForm) {
        technicalForm.addEventListener('submit', function(e) {
          e.preventDefault();
          handleFormSubmission('technical', this);
        });
      }

      // API form
      const apiForm = document.getElementById('apiForm');
      if (apiForm) {
        apiForm.addEventListener('submit', function(e) {
          e.preventDefault();
          handleFormSubmission('api', this);
        });
      }

      // Business form
      const businessForm = document.getElementById('businessForm');
      if (businessForm) {
        businessForm.addEventListener('submit', function(e) {
          e.preventDefault();
          handleFormSubmission('business', this);
        });
      }

      // VIP form
      const vipForm = document.getElementById('vipForm');
      if (vipForm) {
        vipForm.addEventListener('submit', function(e) {
          e.preventDefault();
          handleFormSubmission('vip', this);
        });
      }
    }

    function handleFormSubmission(type, form) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Show loading state
      const submitBtn = form.querySelector('.form-submit-btn.primary');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Submitting...</span>';
      submitBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        showNotification(\`Thank you! Your \${type} inquiry has been submitted successfully. We'll respond within 2 hours.\`, 'success');

        // Reset form
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Create ticket number for tracking
        const ticketNumber = 'TK-' + Date.now().toString().slice(-6);
        showNotification(\`Your ticket number is \${ticketNumber}. Save this for reference.\`, 'info');
      }, 2000);
    }

    function saveDraft(formType) {
      const form = document.getElementById(formType + 'Form');
      if (form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        localStorage.setItem(\`contact_draft_\${formType}\`, JSON.stringify(data));
        showNotification('Draft saved successfully!', 'success');
      }
    }

    // Global functions for button onclick handlers
    function scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function startLiveChat() {
      showNotification('Connecting to live chat... Please wait.', 'info');
      setTimeout(() => {
        showNotification('Live chat connected! An agent will be with you shortly.', 'success');
      }, 2000);
    }

    function scheduleVideoCall() {
      showNotification('Opening scheduling calendar...', 'info');
      setTimeout(() => {
        showNotification('Calendar opened! Select your preferred time slot.', 'success');
      }, 1500);
    }

    function instantVideoCall() {
      showNotification('Initiating instant video call...', 'info');
      setTimeout(() => {
        showNotification('Video call started! Connecting you to an agent.', 'success');
      }, 3000);
    }

    function requestRemoteAccess() {
      if (confirm('This will allow our support team to view your screen to help resolve the issue. Continue?')) {
        showNotification('Remote access request sent. An agent will contact you shortly.', 'success');
      }
    }

    function createNewTicket() {
      showNotification('Opening ticket creation form...', 'info');
      setTimeout(() => {
        showNotification('Ticket form opened! Please fill in the details.', 'success');
      }, 1000);
    }

    function viewTicket(ticketId) {
      showNotification(\`Opening ticket \${ticketId}...\`, 'info');
      setTimeout(() => {
        showNotification(\`Ticket \${ticketId} loaded successfully.\`, 'success');
      }, 1500);
    }

    function updateTicket(ticketId) {
      showNotification(\`Opening update form for ticket \${ticketId}...\`, 'info');
    }

    function reopenTicket(ticketId) {
      if (confirm(\`Are you sure you want to reopen ticket \${ticketId}?\`)) {
        showNotification(\`Ticket \${ticketId} has been reopened.\`, 'success');
      }
    }

    function viewAllTickets() {
      showNotification('Loading all tickets...', 'info');
      setTimeout(() => {
        showNotification('All tickets loaded successfully.', 'success');
      }, 2000);
    }

    function openApiSupport() {
      showNotification('Connecting to API support channel...', 'info');
      setTimeout(() => {
        showNotification('API support channel opened! How can we help with your integration?', 'success');
        // Could also open a chat widget or redirect to API documentation
        window.open('/api/documentation#support', '_blank');
      }, 1500);
    }

    function openMonitoringDashboard() {
      showNotification('Opening API monitoring dashboard...', 'info');
      setTimeout(() => {
        showNotification('API monitoring dashboard loaded!', 'success');
        window.open('/api/monitoring', '_blank');
      }, 1000);
    }

    function openBusinessSupport() {
      showNotification('Opening business development channel...', 'info');
      setTimeout(() => {
        showNotification('Business development channel opened! Let\\'s discuss partnership opportunities.', 'success');
      }, 1500);
    }

    function openVipSupport() {
      showNotification('Accessing VIP support channel...', 'info');
      setTimeout(() => {
        showNotification('VIP support channel opened! Priority assistance is now available.', 'success');
      }, 1500);
    }

    function openTechnicalSupport() {
      showNotification('Opening technical support portal...', 'info');
      setTimeout(() => {
        showNotification('Technical support portal opened! Please describe your issue.', 'success');
      }, 1500);
    }

    // New Communication Channel Functions
    function startLiveChat() {
      showNotification('🎯 Connecting to live chat...', 'info');

      // Simulate chat initialization
      setTimeout(() => {
        showNotification('💬 Live chat connected! Agent joining shortly...', 'success');

        // Simulate agent joining
        setTimeout(() => {
          showNotification('👋 Hi! Welcome to Fantasy402 support. How can I help you today?', 'info');
        }, 2000);
      }, 1000);
    }

    function openApiIntegration() {
      showNotification('🔌 Opening API integration portal...', 'info');
      setTimeout(() => {
        showNotification('📚 API documentation and integration tools loaded!', 'success');
        // Could redirect to API documentation
        window.open('/api/documentation', '_blank');
      }, 1500);
    }

    function openContactForms() {
      showNotification('📝 Loading contact forms...', 'info');

      // Scroll to forms section or open modal
      const formsSection = document.getElementById('contact-forms');
      if (formsSection) {
        formsSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          showNotification('📋 Contact forms ready! Please fill out the details.', 'success');
        }, 1000);
      } else {
        setTimeout(() => {
          showNotification('📋 Contact forms opened in new window.', 'success');
        }, 1500);
      }
    }

    function callSupport() {
      showNotification('📞 Initiating phone call...', 'info');
      setTimeout(() => {
        showNotification('📱 Connecting you to VIP support line...', 'success');
        // This would typically trigger a phone call or show phone number
        window.location.href = 'tel:+1-555-VIP-0000';
      }, 1000);
    }

    function emailSupport() {
      showNotification('📧 Opening email client...', 'info');
      setTimeout(() => {
        showNotification('✉️ Email client opened! Send your inquiry to support.', 'success');
        window.location.href = 'mailto:support@fantasy402.com?subject=Support Request';
      }, 500);
    }

    function openKnowledgeBase() {
      showNotification('📚 Opening knowledge base...', 'info');
      setTimeout(() => {
        showNotification('📖 Knowledge base loaded! Browse our help articles.', 'success');
        window.open('/help/knowledge-base', '_blank');
      }, 1500);
    }

    function openApiTester() {
      showNotification('Opening API testing console...', 'info');
      setTimeout(() => {
        showNotification('API testing console ready! Start testing endpoints.', 'success');
      }, 1500);
    }

    function openPostmanCollection() {
      showNotification('Downloading Postman collection...', 'info');
      setTimeout(() => {
        showNotification('Postman collection downloaded successfully!', 'success');
      }, 2000);
    }

    function testWebhook() {
      showNotification('Sending test webhook...', 'info');
      setTimeout(() => {
        showNotification('Test webhook sent! Check your endpoint for the payload.', 'success');
      }, 1500);
    }

    function downloadSdk(language) {
      showNotification(\`Downloading \${language.charAt(0).toUpperCase() + language.slice(1)} SDK...\`, 'info');
      setTimeout(() => {
        showNotification(\`\${language.charAt(0).toUpperCase() + language.slice(1)} SDK downloaded successfully!\`, 'success');
      }, 2000);
    }

    function requestUrgentCall() {
      showNotification('Requesting urgent callback...', 'info');
      setTimeout(() => {
        showNotification('Urgent callback requested! Expect a call within 15 minutes.', 'success');
      }, 1000);
    }

    // Add notification styles
    const notificationStyles = \`
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideInRight 0.3s ease-out;
      }

      .notification.success {
        background: rgba(34, 197, 94, 0.1);
        border-color: rgba(34, 197, 94, 0.3);
      }

      .notification.error {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
      }

      .notification.info {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
      }

      .notification-icon {
        font-size: 1.2rem;
      }

      .notification-message {
        color: #1f2937;
        font-weight: 500;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    ';

    // Inject notification styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
  `;
}

