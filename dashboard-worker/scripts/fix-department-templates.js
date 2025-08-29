#!/usr/bin/env bun

/**
 * Fix Department Template Placeholders
 * Replaces all {{PLACEHOLDER}} values with proper department-specific content
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const departmentConfigs = {
  'finance-department.html': {
    name: 'Finance',
    icon: '💰',
    gradient: '#10b981, #059669',
    primaryColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: 'rgba(16, 185, 129, 0.3)',
    hoverBg: 'rgba(16, 185, 129, 0.1)',
    description: 'Financial operations and transaction management',
    fullDescription: 'Manages deposits, withdrawals, financial reports, and transaction processing',
    totalMembers: 12,
    activeProjects: 8,
    completionRate: '98%',
    code: 'FIN',
  },
  'customer-support-department.html': {
    name: 'Customer Support',
    icon: '🎧',
    gradient: '#3b82f6, #2563eb',
    primaryColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    hoverBg: 'rgba(59, 130, 246, 0.1)',
    description: 'Customer service and technical support',
    fullDescription: 'Provides 24/7 customer service, technical support, and issue resolution',
    totalMembers: 18,
    activeProjects: 15,
    completionRate: '94%',
    code: 'SUP',
  },
  'compliance-department.html': {
    name: 'Compliance',
    icon: '⚖️',
    gradient: '#8b5cf6, #7c3aed',
    primaryColor: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    shadowColor: 'rgba(139, 92, 246, 0.3)',
    hoverBg: 'rgba(139, 92, 246, 0.1)',
    description: 'Regulatory compliance and legal oversight',
    fullDescription: 'Ensures regulatory compliance, manages audits, and maintains legal standards',
    totalMembers: 8,
    activeProjects: 12,
    completionRate: '100%',
    code: 'COM',
  },
  'operations-department.html': {
    name: 'Operations',
    icon: '⚙️',
    gradient: '#f59e0b, #d97706',
    primaryColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    shadowColor: 'rgba(245, 158, 11, 0.3)',
    hoverBg: 'rgba(245, 158, 11, 0.1)',
    description: 'Daily operations and workflow management',
    fullDescription:
      'Manages daily business operations, workflow optimization, and process improvement',
    totalMembers: 24,
    activeProjects: 32,
    completionRate: '97%',
    code: 'OPS',
  },
  'technology-department.html': {
    name: 'Technology',
    icon: '💻',
    gradient: '#06b6d4, #0891b2',
    primaryColor: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    shadowColor: 'rgba(6, 182, 212, 0.3)',
    hoverBg: 'rgba(6, 182, 212, 0.1)',
    description: 'IT infrastructure and development',
    fullDescription: 'Develops and maintains technology infrastructure, applications, and security',
    totalMembers: 16,
    activeProjects: 45,
    completionRate: '99.2%',
    code: 'TEC',
  },
  'marketing-department.html': {
    name: 'Marketing',
    icon: '📈',
    gradient: '#ef4444, #dc2626',
    primaryColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    shadowColor: 'rgba(239, 68, 68, 0.3)',
    hoverBg: 'rgba(239, 68, 68, 0.1)',
    description: 'Marketing campaigns and customer acquisition',
    fullDescription:
      'Creates marketing strategies, manages campaigns, and drives customer acquisition',
    totalMembers: 14,
    activeProjects: 28,
    completionRate: '92%',
    code: 'MKT',
  },
  'management-department.html': {
    name: 'Management',
    icon: '👔',
    gradient: '#6b7280, #4b5563',
    primaryColor: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: 'rgba(107, 114, 128, 0.4)',
    shadowColor: 'rgba(107, 114, 128, 0.3)',
    hoverBg: 'rgba(107, 114, 128, 0.1)',
    description: 'Executive leadership and strategic planning',
    fullDescription:
      'Provides executive leadership, strategic planning, and organizational governance',
    totalMembers: 6,
    activeProjects: 18,
    completionRate: '95%',
    code: 'MGT',
  },
};

// Sample team members for each department
const teamMemberTemplates = {
  finance: [
    {
      id: 'john-smith',
      name: 'John Smith',
      role: 'Finance Director',
      avatar: 'JS',
      avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
      metrics: { implementations: 42, efficiency: '98%' },
      responsibilities: ['Financial planning', 'Budget management', 'Risk assessment'],
    },
    {
      id: 'sarah-johnson',
      name: 'Sarah Johnson',
      role: 'Senior Analyst',
      avatar: 'SJ',
      avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
      metrics: { implementations: 35, efficiency: '96%' },
      responsibilities: ['Financial reporting', 'Data analysis', 'Compliance monitoring'],
    },
    {
      id: 'mike-chen',
      name: 'Mike Chen',
      role: 'Treasury Manager',
      avatar: 'MC',
      avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
      metrics: { implementations: 28, efficiency: '95%' },
      responsibilities: ['Cash management', 'Investment strategy', 'Banking relations'],
    },
  ],
  support: [
    {
      id: 'emily-davis',
      name: 'Emily Davis',
      role: 'Support Manager',
      avatar: 'ED',
      avatarBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      metrics: { implementations: 56, efficiency: '94%' },
      responsibilities: ['Team management', 'Customer escalations', 'Quality assurance'],
    },
    {
      id: 'alex-wilson',
      name: 'Alex Wilson',
      role: 'Senior Support Agent',
      avatar: 'AW',
      avatarBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      metrics: { implementations: 48, efficiency: '92%' },
      responsibilities: ['Ticket resolution', 'Customer training', 'Documentation'],
    },
  ],
  compliance: [
    {
      id: 'lisa-anderson',
      name: 'Lisa Anderson',
      role: 'Compliance Officer',
      avatar: 'LA',
      avatarBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      metrics: { implementations: 32, efficiency: '100%' },
      responsibilities: ['Regulatory compliance', 'Audit management', 'Policy enforcement'],
    },
    {
      id: 'robert-taylor',
      name: 'Robert Taylor',
      role: 'Legal Advisor',
      avatar: 'RT',
      avatarBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      metrics: { implementations: 25, efficiency: '98%' },
      responsibilities: ['Legal review', 'Contract management', 'Risk mitigation'],
    },
  ],
  operations: [
    {
      id: 'david-martinez',
      name: 'David Martinez',
      role: 'Operations Director',
      avatar: 'DM',
      avatarBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      metrics: { implementations: 67, efficiency: '97%' },
      responsibilities: ['Process optimization', 'Team coordination', 'Performance monitoring'],
    },
    {
      id: 'jennifer-lee',
      name: 'Jennifer Lee',
      role: 'Operations Manager',
      avatar: 'JL',
      avatarBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      metrics: { implementations: 54, efficiency: '95%' },
      responsibilities: ['Daily operations', 'Resource allocation', 'Quality control'],
    },
  ],
  technology: [
    {
      id: 'chris-brown',
      name: 'Chris Brown',
      role: 'CTO',
      avatar: 'CB',
      avatarBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      metrics: { implementations: 89, efficiency: '99%' },
      responsibilities: ['Technology strategy', 'Architecture design', 'Security oversight'],
    },
    {
      id: 'amanda-garcia',
      name: 'Amanda Garcia',
      role: 'Lead Developer',
      avatar: 'AG',
      avatarBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      metrics: { implementations: 76, efficiency: '98%' },
      responsibilities: ['Application development', 'Code review', 'Technical mentoring'],
    },
  ],
  marketing: [
    {
      id: 'michelle-rodriguez',
      name: 'Michelle Rodriguez',
      role: 'Marketing Director',
      avatar: 'MR',
      avatarBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      metrics: { implementations: 45, efficiency: '92%' },
      responsibilities: ['Strategy development', 'Campaign management', 'Brand oversight'],
    },
    {
      id: 'kevin-thompson',
      name: 'Kevin Thompson',
      role: 'Digital Marketing Lead',
      avatar: 'KT',
      avatarBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      metrics: { implementations: 38, efficiency: '90%' },
      responsibilities: ['Digital campaigns', 'SEO/SEM', 'Analytics'],
    },
  ],
  management: [
    {
      id: 'william-harris',
      name: 'William Harris',
      role: 'CEO',
      avatar: 'WH',
      avatarBg: 'linear-gradient(135deg, #6b7280, #4b5563)',
      metrics: { implementations: 95, efficiency: '96%' },
      responsibilities: ['Strategic leadership', 'Stakeholder relations', 'Corporate governance'],
    },
    {
      id: 'patricia-clark',
      name: 'Patricia Clark',
      role: 'COO',
      avatar: 'PC',
      avatarBg: 'linear-gradient(135deg, #6b7280, #4b5563)',
      metrics: { implementations: 82, efficiency: '95%' },
      responsibilities: ['Operations oversight', 'Process improvement', 'Team leadership'],
    },
  ],
};

function generateTeamMembersHTML(departmentKey) {
  const members = teamMemberTemplates[departmentKey] || [];

  return members
    .map(
      member => `
                <div class="team-member" id="${member.id}" onclick="openMemberProfile('${member.id}')">
                    <div class="member-avatar" style="background: ${member.avatarBg};">${member.avatar}</div>
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-role">${member.role}</div>
                        <div class="member-stats">📊 ${member.metrics.implementations} implementations • ${member.metrics.efficiency} efficiency</div>
                    </div>
                    <div class="member-actions">
                        <button class="action-button">View Profile</button>
                    </div>
                </div>`
    )
    .join('');
}

function generateTeamMembersJSON(departmentKey) {
  const members = teamMemberTemplates[departmentKey] || [];
  return JSON.stringify(members, null, 2);
}

function fixDepartmentFile(filename, config) {
  const filePath = join('src/departments', filename);
  let content = readFileSync(filePath, 'utf8');

  // Get department key for team members
  const deptKey = filename.replace('.html', '').replace('-', '');

  // Replace all placeholders
  const replacements = {
    '{{DEPARTMENT_NAME}}': config.name,
    '{{DEPT_ICON}}': config.icon,
    '{{DEPT_GRADIENT}}': config.gradient,
    '{{DEPT_PRIMARY_COLOR}}': config.primaryColor,
    '{{DEPT_BG_COLOR}}': config.bgColor,
    '{{DEPT_BORDER_COLOR}}': config.borderColor,
    '{{DEPT_SHADOW_COLOR}}': config.shadowColor,
    '{{DEPT_HOVER_BG}}': config.hoverBg,
    '{{DEPARTMENT_DESCRIPTION}}': config.description,
    '{{DEPARTMENT_FULL_DESCRIPTION}}': config.fullDescription,
    '{{TOTAL_MEMBERS}}': config.totalMembers,
    '{{ACTIVE_PROJECTS}}': config.activeProjects,
    '{{COMPLETION_RATE}}': config.completionRate,
    '{{DEPT_CODE}}': config.code,
    '{{TEAM_MEMBERS_HTML}}': generateTeamMembersHTML(deptKey),
    '{{TEAM_MEMBERS_JSON}}': generateTeamMembersJSON(deptKey),
  };

  // Replace all placeholders
  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, value);
  }

  // Write the fixed file
  writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filename}`);

  // Check for remaining placeholders
  const remainingPlaceholders = content.match(/\{\{[^}]*\}\}/g);
  if (remainingPlaceholders) {
    console.log(
      `   ⚠️ Warning: ${remainingPlaceholders.length} placeholders remain:`,
      remainingPlaceholders.slice(0, 3)
    );
  }
}

// Main execution
console.log('🔧 Fixing Department Template Placeholders');
console.log('='.repeat(60));

for (const [filename, config] of Object.entries(departmentConfigs)) {
  fixDepartmentFile(filename, config);
}

console.log('\n✅ All department files fixed!');
console.log('🏢 Departments ready for production use');
