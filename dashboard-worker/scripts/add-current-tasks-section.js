#!/usr/bin/env bun

import { readFile, writeFile } from "fs/promises";
import path from "path";

const departmentTasks = {
  "compliance-department.html": {
    tasks: [
      { title: "SOC 2 Type II Audit", status: "in-progress", priority: "high", assignee: "Lisa Anderson", progress: 75 },
      { title: "GDPR Compliance Review", status: "in-progress", priority: "high", assignee: "Robert Taylor", progress: 60 },
      { title: "Policy Documentation Update", status: "active", priority: "medium", assignee: "Compliance Team", progress: 40 },
      { title: "Quarterly Risk Assessment", status: "planning", priority: "medium", assignee: "Lisa Anderson", progress: 15 },
      { title: "License Renewal Tracking", status: "active", priority: "low", assignee: "Robert Taylor", progress: 90 }
    ]
  },
  "customer-support-department.html": {
    tasks: [
      { title: "AI Chatbot Enhancement", status: "in-progress", priority: "high", assignee: "Jessica Martinez", progress: 65 },
      { title: "24/7 Support Coverage Expansion", status: "active", priority: "high", assignee: "Support Team", progress: 80 },
      { title: "Knowledge Base Migration", status: "in-progress", priority: "medium", assignee: "Tom Williams", progress: 45 },
      { title: "Customer Satisfaction Survey", status: "active", priority: "medium", assignee: "Jessica Martinez", progress: 30 },
      { title: "Ticket System Upgrade", status: "planning", priority: "low", assignee: "Tech Support", progress: 10 }
    ]
  },
  "finance-department.html": {
    tasks: [
      { title: "Q4 Financial Report", status: "in-progress", priority: "high", assignee: "Michael Chen", progress: 70 },
      { title: "Budget Planning 2025", status: "active", priority: "high", assignee: "Finance Team", progress: 55 },
      { title: "Automated Invoice System", status: "in-progress", priority: "medium", assignee: "Emily Rodriguez", progress: 85 },
      { title: "Cost Optimization Analysis", status: "active", priority: "medium", assignee: "Michael Chen", progress: 40 },
      { title: "Tax Compliance Review", status: "planning", priority: "low", assignee: "Emily Rodriguez", progress: 20 }
    ]
  },
  "management-department.html": {
    tasks: [
      { title: "Strategic Planning 2025", status: "in-progress", priority: "high", assignee: "David Thompson", progress: 50 },
      { title: "Agile Transformation", status: "active", priority: "high", assignee: "Karen Anderson", progress: 65 },
      { title: "Performance Review Cycle", status: "in-progress", priority: "medium", assignee: "Management Team", progress: 80 },
      { title: "Leadership Training Program", status: "active", priority: "medium", assignee: "David Thompson", progress: 70 },
      { title: "Process Optimization", status: "planning", priority: "low", assignee: "Karen Anderson", progress: 25 }
    ]
  },
  "marketing-department.html": {
    tasks: [
      { title: "Q1 2025 Campaign Launch", status: "in-progress", priority: "high", assignee: "Sarah Johnson", progress: 60 },
      { title: "Social Media Strategy", status: "active", priority: "high", assignee: "Andrew Brown", progress: 75 },
      { title: "Brand Refresh Project", status: "in-progress", priority: "medium", assignee: "Marketing Team", progress: 40 },
      { title: "Content Calendar Planning", status: "active", priority: "medium", assignee: "Sarah Johnson", progress: 85 },
      { title: "SEO Optimization", status: "planning", priority: "low", assignee: "Andrew Brown", progress: 30 }
    ]
  },
  "operations-department.html": {
    tasks: [
      { title: "System Migration Phase 2", status: "in-progress", priority: "high", assignee: "Jennifer Wilson", progress: 55 },
      { title: "Supply Chain Optimization", status: "active", priority: "high", assignee: "Mark Davis", progress: 70 },
      { title: "Quality Assurance Automation", status: "in-progress", priority: "medium", assignee: "Operations Team", progress: 45 },
      { title: "Vendor Management System", status: "active", priority: "medium", assignee: "Jennifer Wilson", progress: 80 },
      { title: "Facility Upgrade Planning", status: "planning", priority: "low", assignee: "Mark Davis", progress: 15 }
    ]
  },
  "team-contributors-department.html": {
    tasks: [
      { title: "Cross-Team Innovation Sprint", status: "in-progress", priority: "high", assignee: "Brenda Williams", progress: 40 },
      { title: "Patent Filing Process", status: "active", priority: "high", assignee: "Innovation Team", progress: 65 },
      { title: "Mentorship Program Q1", status: "in-progress", priority: "medium", assignee: "Alex Rivera", progress: 75 },
      { title: "R&D Project Alpha", status: "active", priority: "medium", assignee: "Larry Kim", progress: 50 },
      { title: "Knowledge Sharing Platform", status: "planning", priority: "low", assignee: "Brenda Williams", progress: 20 }
    ]
  },
  "technology-department.html": {
    tasks: [
      { title: "Microservices Migration", status: "in-progress", priority: "high", assignee: "Chris Brown", progress: 70 },
      { title: "Security Infrastructure Upgrade", status: "active", priority: "high", assignee: "Amanda Garcia", progress: 85 },
      { title: "CI/CD Pipeline Enhancement", status: "in-progress", priority: "medium", assignee: "Tech Team", progress: 90 },
      { title: "Database Performance Tuning", status: "active", priority: "medium", assignee: "Chris Brown", progress: 60 },
      { title: "Cloud Cost Optimization", status: "planning", priority: "low", assignee: "Amanda Garcia", progress: 35 }
    ]
  }
};

function generateCurrentTasksHTML(tasks, deptColor) {
  const statusColors = {
    'in-progress': '#3b82f6',
    'active': '#10b981',
    'planning': '#f59e0b',
    'completed': '#9ca3af'
  };

  const priorityIcons = {
    'high': '🔴',
    'medium': '🟡',
    'low': '🟢'
  };

  return `
                <h3 style="color: var(--dept-primary); margin: 25px 0 15px; font-size: 20px;">📋 Current Tasks & Projects</h3>
                <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 12px;">
                    <div style="display: grid; gap: 15px;">
                        ${tasks.map(task => `
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; border-left: 3px solid ${statusColors[task.status]};">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                        <span style="font-size: 16px; font-weight: bold; color: #e0e6ed;">${task.title}</span>
                                        <span title="Priority: ${task.priority}">${priorityIcons[task.priority]}</span>
                                        <span style="background: ${statusColors[task.status]}22; color: ${statusColors[task.status]}; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; font-weight: bold;">
                                            ${task.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                    <div style="color: #9ca3af; font-size: 13px;">
                                        Assigned to: <span style="color: var(--dept-primary);">${task.assignee}</span>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 18px; font-weight: bold; color: var(--dept-primary);">${task.progress}%</div>
                                    <div style="font-size: 11px; color: #9ca3af;">Progress</div>
                                </div>
                            </div>
                            <div style="margin-top: 10px;">
                                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 4px; height: 6px; overflow: hidden;">
                                    <div style="background: linear-gradient(90deg, ${statusColors[task.status]}, ${statusColors[task.status]}88); height: 100%; width: ${task.progress}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                        </div>`).join('')}
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: center;">
                            <div>
                                <div style="font-size: 24px; font-weight: bold; color: var(--dept-primary);">${tasks.filter(t => t.status === 'in-progress').length}</div>
                                <div style="font-size: 12px; color: #9ca3af;">In Progress</div>
                            </div>
                            <div>
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${tasks.filter(t => t.status === 'active').length}</div>
                                <div style="font-size: 12px; color: #9ca3af;">Active</div>
                            </div>
                            <div>
                                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${tasks.filter(t => t.status === 'planning').length}</div>
                                <div style="font-size: 12px; color: #9ca3af;">Planning</div>
                            </div>
                            <div>
                                <div style="font-size: 24px; font-weight: bold; color: var(--dept-primary);">${Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)}%</div>
                                <div style="font-size: 12px; color: #9ca3af;">Avg Progress</div>
                            </div>
                        </div>
                    </div>
                </div>`;
}

async function updateDepartmentFiles() {
  const departmentsPath = path.join(process.cwd(), "src", "departments");
  
  for (const [filename, data] of Object.entries(departmentTasks)) {
    const filePath = path.join(departmentsPath, filename);
    
    try {
      let content = await readFile(filePath, "utf-8");
      
      // Check if current tasks section already exists
      if (content.includes("Current Tasks & Projects")) {
        console.log(`✅ ${filename} already has a current tasks section, skipping...`);
        continue;
      }
      
      // Find insertion point (after Recent Contributions section)
      const insertionPattern = /<\/ul>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="department-overview">/;
      const recentContribPattern = /(<h3[^>]*>🚀 Recent Contributions<\/h3>[\s\S]*?<\/ul>\s*<\/div>)/;
      
      const match = content.match(recentContribPattern);
      if (match) {
        const endOfContributions = match.index + match[0].length;
        const tasksHTML = generateCurrentTasksHTML(data.tasks);
        
        // Insert the current tasks section after recent contributions but before closing divs
        content = content.slice(0, endOfContributions) + 
                  '\n' + tasksHTML + 
                  content.slice(endOfContributions);
        
        await writeFile(filePath, content);
        console.log(`✅ Updated ${filename} with current tasks section`);
      } else {
        console.log(`⚠️ Could not find insertion point in ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${filename}:`, error.message);
    }
  }
}

// Run the update
console.log("🚀 Adding current tasks sections to department pages...\n");
await updateDepartmentFiles();
console.log("\n✨ All department pages updated with current tasks!");