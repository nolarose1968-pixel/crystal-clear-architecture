#!/usr/bin/env bun

import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const departments = [
  {
    file: 'customer-support-department.html',
    name: 'Customer Support',
    color: '#3b82f6',
    teamLead: {
      name: 'Jessica Martinez',
      role: 'Head of Customer Support',
      experience: '10+ years',
    },
    mission:
      'The Customer Support Department delivers exceptional service experiences, ensuring customer satisfaction and loyalty through responsive, empathetic, and solution-oriented support across all channels.',
    metrics: { satisfactionRate: '96%', responseTime: '<2 hrs' },
    rankings: [
      { position: '🥇', name: 'J. Martinez', implementations: 43 },
      { position: '🥈', name: 'T. Williams', implementations: 38 },
    ],
    responsibilities: [
      'Customer Support',
      'Ticket Management',
      'Knowledge Base',
      'Live Chat',
      'Phone Support',
      'Escalation Handling',
    ],
    contributions: [
      'Implemented AI-powered chatbot reducing response time by 40%',
      'Achieved 96% customer satisfaction rate across all channels',
      'Created comprehensive knowledge base with 500+ articles',
      'Reduced average resolution time from 48 to 12 hours',
    ],
  },
  {
    file: 'finance-department.html',
    name: 'Finance',
    color: '#10b981',
    teamLead: { name: 'Michael Chen', role: 'Chief Financial Officer', experience: '12+ years' },
    mission:
      'The Finance Department ensures fiscal responsibility and strategic financial management, driving profitability through accurate reporting, budget optimization, and data-driven financial decision-making.',
    metrics: { accuracyRate: '99.8%', costSavings: '$2.4M' },
    rankings: [
      { position: '🥇', name: 'M. Chen', implementations: 56 },
      { position: '🥈', name: 'E. Rodriguez', implementations: 48 },
    ],
    responsibilities: [
      'Financial Planning',
      'Accounting',
      'Budget Management',
      'Financial Reporting',
      'Tax Compliance',
      'Investment Analysis',
    ],
    contributions: [
      'Implemented automated financial reporting saving 300+ hours monthly',
      'Achieved 99.8% accuracy in financial forecasting models',
      'Reduced operational costs by $2.4M through strategic optimization',
      'Established real-time financial dashboard for executive team',
    ],
  },
  {
    file: 'management-department.html',
    name: 'Management',
    color: '#f59e0b',
    teamLead: { name: 'David Thompson', role: 'Chief Operating Officer', experience: '18+ years' },
    mission:
      'The Management Department provides strategic leadership and operational excellence, aligning organizational resources with business objectives to drive growth, innovation, and sustainable success.',
    metrics: { projectSuccess: '94%', efficiency: '87%' },
    rankings: [
      { position: '🥇', name: 'D. Thompson', implementations: 67 },
      { position: '🥈', name: 'K. Anderson', implementations: 52 },
    ],
    responsibilities: [
      'Strategic Planning',
      'Operations Management',
      'Team Leadership',
      'Process Optimization',
      'Performance Management',
      'Change Management',
    ],
    contributions: [
      'Led digital transformation initiative increasing efficiency by 35%',
      'Implemented agile methodology across 15 departments',
      'Achieved 94% project success rate with on-time delivery',
      'Developed leadership training program for 50+ managers',
    ],
  },
  {
    file: 'marketing-department.html',
    name: 'Marketing',
    color: '#ef4444',
    teamLead: { name: 'Sarah Johnson', role: 'Chief Marketing Officer', experience: '14+ years' },
    mission:
      'The Marketing Department drives brand growth and customer engagement through innovative campaigns, data-driven strategies, and compelling storytelling that resonates with our target audiences.',
    metrics: { leadGen: '+127%', ROI: '4.2x' },
    rankings: [
      { position: '🥇', name: 'S. Johnson', implementations: 62 },
      { position: '🥈', name: 'A. Brown', implementations: 47 },
    ],
    responsibilities: [
      'Brand Strategy',
      'Digital Marketing',
      'Content Creation',
      'Campaign Management',
      'Market Research',
      'Social Media',
    ],
    contributions: [
      'Increased lead generation by 127% through targeted campaigns',
      'Achieved 4.2x marketing ROI through data-driven optimization',
      'Grew social media following by 300% across all platforms',
      'Launched successful rebranding campaign increasing brand value by 45%',
    ],
  },
  {
    file: 'operations-department.html',
    name: 'Operations',
    color: '#6366f1',
    teamLead: { name: 'Jennifer Wilson', role: 'VP of Operations', experience: '11+ years' },
    mission:
      'The Operations Department ensures seamless business operations through process excellence, resource optimization, and continuous improvement initiatives that enhance productivity and service delivery.',
    metrics: { uptime: '99.95%', efficiency: '92%' },
    rankings: [
      { position: '🥇', name: 'J. Wilson', implementations: 71 },
      { position: '🥈', name: 'M. Davis', implementations: 58 },
    ],
    responsibilities: [
      'Process Management',
      'Quality Assurance',
      'Supply Chain',
      'Logistics',
      'Vendor Management',
      'Facilities',
    ],
    contributions: [
      'Achieved 99.95% system uptime through proactive maintenance',
      'Reduced operational costs by 28% through process automation',
      'Implemented ISO 9001 quality management system',
      'Streamlined supply chain reducing delivery times by 40%',
    ],
  },
  {
    file: 'team-contributors-department.html',
    name: 'Team Contributors',
    color: '#ec4899',
    teamLead: { name: 'Alex Rivera', role: 'Head of Innovation', experience: '9+ years' },
    mission:
      'The Team Contributors Department fosters cross-functional collaboration and innovation, bringing together diverse talents to drive special projects, initiatives, and breakthrough solutions.',
    metrics: { projectSuccess: '91%', innovation: '23 patents' },
    rankings: [
      { position: '🥇', name: 'A. Rivera', implementations: 54 },
      { position: '🥈', name: 'L. Kim', implementations: 41 },
    ],
    responsibilities: [
      'Innovation Projects',
      'Cross-team Collaboration',
      'Special Initiatives',
      'Knowledge Sharing',
      'Research & Development',
      'Process Innovation',
    ],
    contributions: [
      'Filed 23 patents for innovative technology solutions',
      'Led cross-functional teams delivering 91% project success rate',
      'Established innovation lab generating 40+ new product ideas',
      'Created mentorship program connecting 100+ team members',
    ],
  },
  {
    file: 'technology-department.html',
    name: 'Technology',
    color: '#06b6d4',
    teamLead: { name: 'Chris Brown', role: 'Chief Technology Officer', experience: '16+ years' },
    mission:
      'The Technology Department drives digital innovation and infrastructure excellence, delivering cutting-edge solutions that power our platform, enhance security, and enable business growth through technology.',
    metrics: { uptime: '99.99%', deployments: '1,200+' },
    rankings: [
      { position: '🥇', name: 'C. Brown', implementations: 89 },
      { position: '🥈', name: 'A. Garcia', implementations: 76 },
    ],
    responsibilities: [
      'Software Development',
      'Infrastructure',
      'Security',
      'DevOps',
      'Data Architecture',
      'Technical Support',
    ],
    contributions: [
      'Achieved 99.99% platform uptime with zero security breaches',
      'Deployed 1,200+ updates with automated CI/CD pipeline',
      'Reduced infrastructure costs by 45% through cloud optimization',
      'Implemented microservices architecture improving scalability by 10x',
    ],
  },
];

function generateWelcomeSection(dept) {
  const colorRgb = dept.color.replace('#', '');
  const r = parseInt(colorRgb.substr(0, 2), 16);
  const g = parseInt(colorRgb.substr(2, 2), 16);
  const b = parseInt(colorRgb.substr(4, 2), 16);

  return `
        <!-- Welcome Section -->
        <div class="department-overview" style="margin-bottom: 30px;">
            <div class="overview-header">
                <div class="overview-icon">👋</div>
                <div class="overview-title">
                    <h2>Welcome to ${dept.name} Department</h2>
                    <div class="overview-subtitle">Excellence in service, innovation in approach</div>
                </div>
            </div>
            
            <div style="margin-top: 25px; padding: 20px; background: rgba(0, 0, 0, 0.2); border-radius: 12px;">
                <h3 style="color: var(--dept-primary); margin-bottom: 15px; font-size: 20px;">🎯 Department Mission</h3>
                <p style="color: #e0e6ed; line-height: 1.8; margin-bottom: 20px;">
                    ${dept.mission}
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 25px;">
                    <div style="padding: 15px; background: rgba(${r}, ${g}, ${b}, 0.1); border-left: 4px solid var(--dept-primary); border-radius: 8px;">
                        <h4 style="color: var(--dept-primary); margin-bottom: 10px;">👔 Team Lead</h4>
                        <div style="color: #e0e6ed; font-weight: bold;">${dept.teamLead.name}</div>
                        <div style="color: #9ca3af; font-size: 14px;">${dept.teamLead.role}</div>
                        <div style="color: #9ca3af; font-size: 12px; margin-top: 5px;">${dept.teamLead.experience} experience</div>
                    </div>
                    
                    <div style="padding: 15px; background: rgba(${r}, ${g}, ${b}, 0.1); border-left: 4px solid var(--dept-primary); border-radius: 8px;">
                        <h4 style="color: var(--dept-primary); margin-bottom: 10px;">📊 Key Metrics</h4>
                        ${Object.entries(dept.metrics)
                          .map(
                            ([key, value]) => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #9ca3af;">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                            <span style="color: #10b981; font-weight: bold;">${value}</span>
                        </div>`
                          )
                          .join('')}
                    </div>
                    
                    <div style="padding: 15px; background: rgba(${r}, ${g}, ${b}, 0.1); border-left: 4px solid var(--dept-primary); border-radius: 8px;">
                        <h4 style="color: var(--dept-primary); margin-bottom: 10px;">🏆 Team Rankings</h4>
                        <div style="font-size: 14px;">
                            ${dept.rankings
                              .map(
                                rank => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span style="color: ${rank.position === '🥇' ? '#fbbf24' : '#d1d5db'};">${rank.position} ${rank.name}</span>
                                <span style="color: #9ca3af;">${rank.implementations} impl.</span>
                            </div>`
                              )
                              .join('')}
                        </div>
                    </div>
                </div>
                
                <h3 style="color: var(--dept-primary); margin: 25px 0 15px; font-size: 20px;">💼 Core Responsibilities</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    ${dept.responsibilities
                      .map(
                        resp => `
                    <div style="padding: 10px 15px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; border: 1px solid rgba(${r}, ${g}, ${b}, 0.3);">
                        <span style="color: var(--dept-primary);">•</span> ${resp}
                    </div>`
                      )
                      .join('')}
                </div>
                
                <h3 style="color: var(--dept-primary); margin: 25px 0 15px; font-size: 20px;">🚀 Recent Contributions</h3>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px;">
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${dept.contributions
                          .map(
                            (contrib, idx) => `
                        <li style="${idx < dept.contributions.length - 1 ? 'margin-bottom: 10px;' : ''} padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #10b981;">✓</span>
                            <span style="color: #e0e6ed;">${contrib}</span>
                        </li>`
                          )
                          .join('')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="department-overview">`;
}

async function updateDepartmentFiles() {
  const departmentsPath = path.join(process.cwd(), 'src', 'departments');

  for (const dept of departments) {
    const filePath = path.join(departmentsPath, dept.file);

    try {
      let content = await readFile(filePath, 'utf-8');

      // Check if welcome section already exists
      if (content.includes('Welcome Section')) {
        console.log(`✅ ${dept.file} already has a welcome section, skipping...`);
        continue;
      }

      // Find the insertion point (after breadcrumb, before department-overview)
      const insertionPattern = /<\/nav>\s*<div class="department-overview">/;

      if (insertionPattern.test(content)) {
        const welcomeSection = generateWelcomeSection(dept);
        content = content.replace(insertionPattern, `</nav>\n${welcomeSection}`);

        await writeFile(filePath, content);
        console.log(`✅ Updated ${dept.file} with welcome section`);
      } else {
        console.log(`⚠️ Could not find insertion point in ${dept.file}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${dept.file}:`, error.message);
    }
  }
}

// Run the update
console.log('🚀 Adding welcome sections to department pages...\n');
await updateDepartmentFiles();
console.log('\n✨ All department pages updated successfully!');
