#!/usr/bin/env bun

/**
 * Add Live Implementation Links to Department Pages
 * Adds working links to key systems and resources for each department
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const departmentLinks = {
  'finance-department.html': {
    links: [
      {
        title: '💸 Transaction Dashboard',
        url: '../dashboard.html#transactions',
        description: 'Real-time transaction monitoring',
      },
      {
        title: '📊 Financial Reports',
        url: '../reports/financial.html',
        description: 'Comprehensive financial analytics',
      },
      { title: '🏦 Banking Portal', url: '../banking/', description: 'Secure banking operations' },
      {
        title: '💰 Revenue Analytics',
        url: '../analytics/revenue.html',
        description: 'Revenue tracking and projections',
      },
      {
        title: '📈 Budget Management',
        url: '../budget/',
        description: 'Budget planning and allocation',
      },
      { title: '🔐 Audit Trail', url: '../audit/', description: 'Complete audit logging system' },
    ],
  },
  'customer-support-department.html': {
    links: [
      { title: '🎫 Ticket System', url: '../tickets/', description: 'Customer ticket management' },
      { title: '💬 Live Chat Portal', url: '../chat/', description: '24/7 customer chat support' },
      {
        title: '📞 Call Center Dashboard',
        url: '../call-center/',
        description: 'Phone support metrics',
      },
      { title: '📚 Knowledge Base', url: '../kb/', description: 'Self-service documentation' },
      {
        title: '😊 Satisfaction Metrics',
        url: '../metrics/satisfaction.html',
        description: 'Customer satisfaction tracking',
      },
      {
        title: '🔄 Escalation Manager',
        url: '../escalations/',
        description: 'Priority issue handling',
      },
    ],
  },
  'compliance-department.html': {
    links: [
      {
        title: '📋 Compliance Dashboard',
        url: '../compliance-dashboard/',
        description: 'Regulatory compliance overview',
      },
      { title: '⚖️ Legal Documents', url: '../legal/', description: 'Legal document repository' },
      { title: '🔍 Audit Reports', url: '../audits/', description: 'Compliance audit history' },
      { title: '📜 Policy Manager', url: '../policies/', description: 'Company policy management' },
      { title: '⚠️ Risk Assessment', url: '../risk/', description: 'Risk analysis and mitigation' },
      {
        title: '📝 License Tracker',
        url: '../licenses/',
        description: 'License compliance monitoring',
      },
    ],
  },
  'operations-department.html': {
    links: [
      {
        title: '⚡ Operations Center',
        url: '../ops-center/',
        description: 'Central operations dashboard',
      },
      {
        title: '📊 Performance Metrics',
        url: '../metrics/operations.html',
        description: 'Operational KPIs',
      },
      {
        title: '🔄 Process Automation',
        url: '../automation/',
        description: 'Automated workflow systems',
      },
      {
        title: '📦 Inventory Management',
        url: '../inventory/',
        description: 'Resource tracking system',
      },
      {
        title: '👥 Staff Scheduling',
        url: '../scheduling/',
        description: 'Team scheduling portal',
      },
      {
        title: '📈 Capacity Planning',
        url: '../capacity/',
        description: 'Resource capacity analysis',
      },
    ],
  },
  'technology-department.html': {
    links: [
      {
        title: '🚀 Fire22 Dashboard',
        url: '../dashboard.html',
        description: 'Main platform dashboard',
      },
      { title: '🔗 API Documentation', url: '../api-docs/', description: 'REST API reference' },
      {
        title: '💻 System Monitoring',
        url: '../monitoring/',
        description: 'Infrastructure monitoring',
      },
      {
        title: '🔐 Security Center',
        url: '../security/',
        description: 'Security operations center',
      },
      {
        title: '📊 Performance Analytics',
        url: '../analytics/performance.html',
        description: 'System performance metrics',
      },
      { title: '🛠️ DevOps Portal', url: '../devops/', description: 'CI/CD and deployment tools' },
    ],
  },
  'marketing-department.html': {
    links: [
      {
        title: '📢 Campaign Manager',
        url: '../campaigns/',
        description: 'Marketing campaign control',
      },
      {
        title: '📊 Analytics Dashboard',
        url: '../analytics/marketing.html',
        description: 'Marketing performance metrics',
      },
      { title: '🎯 Lead Tracker', url: '../leads/', description: 'Lead generation and tracking' },
      { title: '📱 Social Media Hub', url: '../social/', description: 'Social media management' },
      { title: '✉️ Email Marketing', url: '../email/', description: 'Email campaign platform' },
      { title: '🎨 Brand Assets', url: '../brand/', description: 'Brand resource library' },
    ],
  },
  'management-department.html': {
    links: [
      {
        title: '👔 Executive Dashboard',
        url: '../executive/',
        description: 'C-suite overview panel',
      },
      {
        title: '📊 Company Metrics',
        url: '../metrics/company.html',
        description: 'Organization-wide KPIs',
      },
      {
        title: '🎯 Strategic Planning',
        url: '../strategy/',
        description: 'Strategic initiatives tracker',
      },
      { title: '💼 Board Portal', url: '../board/', description: 'Board member resources' },
      {
        title: '📈 Investor Relations',
        url: '../investors/',
        description: 'Investor information hub',
      },
      { title: '🏆 Goals & OKRs', url: '../okrs/', description: 'Objective tracking system' },
    ],
  },
  'team-contributors-department.html': {
    links: [
      {
        title: '🌟 Fire22 Showcase',
        url: '../../packages/@fire22/grid-ui/fire22-highlight-system-showcase.html',
        description: 'CSS highlight system showcase',
      },
      {
        title: '👥 Team Directory',
        url: '../team/',
        description: 'Complete team member directory',
      },
      {
        title: '🏆 Recognition Wall',
        url: '../recognition/',
        description: 'Employee achievements',
      },
      {
        title: '📚 Training Portal',
        url: '../training/',
        description: 'Professional development resources',
      },
      {
        title: '🎯 Performance Reviews',
        url: '../reviews/',
        description: 'Performance management system',
      },
      {
        title: '💡 Innovation Hub',
        url: '../innovation/',
        description: 'Ideas and suggestions portal',
      },
    ],
  },
};

function generateLinksHTML(links) {
  return `
        <!-- Live Implementation Links Section -->
        <div class="implementation-links">
            <h3 class="links-header">🔗 Live Implementation Links</h3>
            <div class="links-grid">
                ${links
                  .map(
                    link => `
                <a href="${link.url}" class="link-card" target="_blank">
                    <div class="link-title">${link.title}</div>
                    <div class="link-description">${link.description}</div>
                    <div class="link-arrow">→</div>
                </a>`
                  )
                  .join('')}
            </div>
        </div>`;
}

function generateLinksCSS() {
  return `
        /* Live Implementation Links */
        .implementation-links {
            margin-top: 40px;
            padding: 30px;
            background: rgba(10, 14, 39, 0.7);
            border: 2px solid rgba(64, 224, 208, 0.2);
            border-radius: 20px;
            backdrop-filter: blur(15px);
            position: relative;
            overflow: hidden;
        }

        .implementation-links::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--dept-primary), var(--dept-gradient));
            animation: linkGradient 3s ease-in-out infinite;
        }

        @keyframes linkGradient {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
        }

        .links-header {
            font-size: 24px;
            color: var(--dept-primary);
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .link-card {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid var(--dept-border);
            border-radius: 12px;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .link-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, var(--dept-hover), transparent);
            transition: left 0.5s ease;
        }

        .link-card:hover::before {
            left: 100%;
        }

        .link-card:hover {
            transform: translateY(-3px) scale(1.02);
            background: rgba(0, 0, 0, 0.5);
            border-color: var(--dept-primary);
            box-shadow: 0 10px 30px var(--dept-shadow);
        }

        .link-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--dept-primary);
            margin-bottom: 8px;
        }

        .link-description {
            font-size: 13px;
            color: #9ca3af;
            flex: 1;
        }

        .link-arrow {
            font-size: 20px;
            color: var(--dept-primary);
            align-self: flex-end;
            margin-top: 10px;
            transition: transform 0.3s ease;
        }

        .link-card:hover .link-arrow {
            transform: translateX(5px);
        }

        @media (max-width: 768px) {
            .links-grid {
                grid-template-columns: 1fr;
            }
        }`;
}

function addLinksToFile(filename, links) {
  const filePath = join('src/departments', filename);
  let content = readFileSync(filePath, 'utf8');

  // Check if links already exist
  if (content.includes('Live Implementation Links')) {
    console.log(`⚠️  Links already exist in ${filename}, skipping...`);
    return;
  }

  // Add CSS if not already present
  if (!content.includes('.implementation-links')) {
    const cssToAdd = generateLinksCSS();
    content = content.replace('</style>', `${cssToAdd}\n    </style>`);
  }

  // Add HTML links section after team-grid
  const linksHTML = generateLinksHTML(links);
  content = content.replace(
    '</div>\n        </div>\n    </div>',
    `</div>\n        </div>\n\n${linksHTML}\n    </div>`
  );

  writeFileSync(filePath, content);
  console.log(`✅ Added links to ${filename}`);
}

// Main execution
console.log('🔗 Adding Live Implementation Links to Department Pages');
console.log('='.repeat(60));

for (const [filename, config] of Object.entries(departmentLinks)) {
  if (config.links) {
    addLinksToFile(filename, config.links);
  }
}

console.log('\n✅ All department pages updated with live links!');
console.log('🔗 Departments now have working implementation links');
