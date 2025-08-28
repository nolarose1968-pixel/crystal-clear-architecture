// Dynamic Department Tasks Loading
class DepartmentTaskManager {
    constructor() {
        this.apiBaseUrl = window.location.origin + '/api';
        this.currentDepartment = this.getDepartmentFromPath();
        this.tasksContainer = null;
        this.refreshInterval = 30000; // 30 seconds
        this.refreshTimer = null;
    }

    getDepartmentFromPath() {
        const path = window.location.pathname;
        const match = path.match(/\/departments\/([^-]+)-department\.html/);
        return match ? match[1] : null;
    }

    async fetchTasks() {
        if (!this.currentDepartment) {
            console.warn('Could not determine department from URL');
            return null;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/departments/${this.currentDepartment}/tasks`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.tasks || [];
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Return fallback static data if API fails
            return this.getFallbackTasks();
        }
    }

    getFallbackTasks() {
        // Fallback to static data when API is unavailable
        const fallbackData = {
            'compliance': [
                { id: 1, title: 'SOC 2 Compliance Audit', priority: 'high', status: 'in-progress', assignee: 'Lisa Anderson', progress: 75 },
                { id: 2, title: 'GDPR Data Protection Review', priority: 'high', status: 'in-progress', assignee: 'Mark Thompson', progress: 60 },
                { id: 3, title: 'Security Policy Updates', priority: 'medium', status: 'active', assignee: 'Sarah Lee', progress: 45 },
                { id: 4, title: 'Vendor Risk Assessment', priority: 'medium', status: 'active', assignee: 'David Chen', progress: 30 },
                { id: 5, title: 'Internal Audit Planning', priority: 'low', status: 'planning', assignee: 'Emma Wilson', progress: 15 }
            ],
            'customer-support': [
                { id: 1, title: 'Support Ticket System Upgrade', priority: 'high', status: 'in-progress', assignee: 'Mike Johnson', progress: 80 },
                { id: 2, title: 'Customer Feedback Analysis', priority: 'medium', status: 'active', assignee: 'Jennifer Smith', progress: 55 },
                { id: 3, title: 'FAQ Documentation Update', priority: 'medium', status: 'active', assignee: 'Robert Brown', progress: 40 },
                { id: 4, title: 'Live Chat Integration', priority: 'high', status: 'in-progress', assignee: 'Amanda Garcia', progress: 65 },
                { id: 5, title: 'Support Team Training', priority: 'low', status: 'planning', assignee: 'Chris Martinez', progress: 20 }
            ],
            'finance': [
                { id: 1, title: 'Q4 Financial Planning', priority: 'high', status: 'in-progress', assignee: 'Sarah Thompson', progress: 70 },
                { id: 2, title: 'Budget Reconciliation', priority: 'high', status: 'in-progress', assignee: 'Michael Chen', progress: 85 },
                { id: 3, title: 'Expense Automation System', priority: 'medium', status: 'active', assignee: 'Jennifer Liu', progress: 50 },
                { id: 4, title: 'Tax Documentation Preparation', priority: 'medium', status: 'active', assignee: 'Robert Anderson', progress: 35 },
                { id: 5, title: 'Investment Portfolio Review', priority: 'low', status: 'planning', assignee: 'Emily Davis', progress: 10 }
            ],
            'management': [
                { id: 1, title: 'Strategic Planning 2025', priority: 'high', status: 'in-progress', assignee: 'John Smith', progress: 60 },
                { id: 2, title: 'Performance Review System', priority: 'high', status: 'in-progress', assignee: 'Patricia Johnson', progress: 75 },
                { id: 3, title: 'Organizational Restructure', priority: 'medium', status: 'active', assignee: 'David Miller', progress: 40 },
                { id: 4, title: 'Leadership Development Program', priority: 'medium', status: 'active', assignee: 'Susan Lee', progress: 55 },
                { id: 5, title: 'Board Meeting Preparation', priority: 'low', status: 'planning', assignee: 'Mark Wilson', progress: 25 }
            ],
            'marketing': [
                { id: 1, title: 'Q1 Campaign Launch', priority: 'high', status: 'in-progress', assignee: 'Amanda Foster', progress: 82 },
                { id: 2, title: 'Brand Guidelines Update', priority: 'medium', status: 'active', assignee: 'Kevin Park', progress: 45 },
                { id: 3, title: 'Social Media Strategy', priority: 'high', status: 'in-progress', assignee: 'Rachel Green', progress: 68 },
                { id: 4, title: 'Content Calendar Planning', priority: 'medium', status: 'active', assignee: 'Jason White', progress: 50 },
                { id: 5, title: 'Market Research Analysis', priority: 'low', status: 'planning', assignee: 'Michelle Brown', progress: 15 }
            ],
            'operations': [
                { id: 1, title: 'Supply Chain Optimization', priority: 'high', status: 'in-progress', assignee: 'Robert Garcia', progress: 73 },
                { id: 2, title: 'Warehouse Management System', priority: 'high', status: 'in-progress', assignee: 'Linda Martinez', progress: 58 },
                { id: 3, title: 'Process Automation Phase 2', priority: 'medium', status: 'active', assignee: 'James Wilson', progress: 42 },
                { id: 4, title: 'Quality Control Standards', priority: 'medium', status: 'active', assignee: 'Maria Rodriguez', progress: 65 },
                { id: 5, title: 'Vendor Contract Negotiations', priority: 'low', status: 'planning', assignee: 'Thomas Anderson', progress: 20 }
            ],
            'team-contributors': [
                { id: 1, title: 'Open Source Contribution Tracking', priority: 'high', status: 'in-progress', assignee: 'Alex Chen', progress: 77 },
                { id: 2, title: 'Developer Recognition Program', priority: 'medium', status: 'active', assignee: 'Jordan Taylor', progress: 52 },
                { id: 3, title: 'Code Review Automation', priority: 'high', status: 'in-progress', assignee: 'Sam Wilson', progress: 63 },
                { id: 4, title: 'Community Engagement Metrics', priority: 'medium', status: 'active', assignee: 'Morgan Lee', progress: 48 },
                { id: 5, title: 'Contribution Guidelines Update', priority: 'low', status: 'planning', assignee: 'Casey Brown', progress: 18 }
            ],
            'technology': [
                { id: 1, title: 'Cloud Migration Phase 3', priority: 'high', status: 'in-progress', assignee: 'David Kim', progress: 78 },
                { id: 2, title: 'Security Infrastructure Upgrade', priority: 'high', status: 'in-progress', assignee: 'Sarah Johnson', progress: 65 },
                { id: 3, title: 'API Gateway Implementation', priority: 'medium', status: 'active', assignee: 'Michael Brown', progress: 55 },
                { id: 4, title: 'DevOps Pipeline Optimization', priority: 'medium', status: 'active', assignee: 'Jennifer Chen', progress: 40 },
                { id: 5, title: 'Tech Stack Modernization', priority: 'low', status: 'planning', assignee: 'Robert Davis', progress: 22 }
            ]
        };

        return fallbackData[this.currentDepartment] || [];
    }

    formatPriority(priority) {
        const icons = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        return `${icons[priority] || '⚪'} ${priority.charAt(0).toUpperCase() + priority.slice(1)}`;
    }

    formatStatus(status) {
        const colors = {
            'in-progress': '#2563eb',
            'active': '#10b981',
            'planning': '#f59e0b'
        };
        return `<span style="background-color: ${colors[status] || '#6b7280'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${status}</span>`;
    }

    renderTasks(tasks) {
        if (!this.tasksContainer) {
            console.warn('Tasks container not found');
            return;
        }

        const tasksHTML = tasks.map(task => `
            <div class="task-item" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white;" data-task-id="${task.id}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${task.title}</h4>
                    ${this.formatStatus(task.status)}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 14px;">
                    <div><strong>Priority:</strong> ${this.formatPriority(task.priority)}</div>
                    <div><strong>Assignee:</strong> ${task.assignee}</div>
                </div>
                <div style="background-color: #f3f4f6; border-radius: 4px; height: 20px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); height: 100%; width: ${task.progress}%; transition: width 0.3s ease;"></div>
                </div>
                <div style="text-align: right; font-size: 12px; color: #6b7280; margin-top: 4px;">${task.progress}% Complete</div>
            </div>
        `).join('');

        const stats = {
            total: tasks.length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            active: tasks.filter(t => t.status === 'active').length,
            planning: tasks.filter(t => t.status === 'planning').length,
            avgProgress: Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
        };

        const containerHTML = `
            <div class="tasks-header" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">Current Tasks & Projects</h3>
                    <button id="refresh-tasks" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔄 Refresh
                    </button>
                </div>
                <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 14px; color: #6b7280;">
                    <span>Total: ${stats.total}</span>
                    <span>In Progress: ${stats.inProgress}</span>
                    <span>Active: ${stats.active}</span>
                    <span>Planning: ${stats.planning}</span>
                    <span>Avg Progress: ${stats.avgProgress}%</span>
                </div>
            </div>
            <div class="tasks-list">
                ${tasksHTML}
            </div>
            <div class="tasks-footer" style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
                Last updated: ${new Date().toLocaleString()}
            </div>
        `;

        this.tasksContainer.innerHTML = containerHTML;

        // Add refresh button listener
        const refreshBtn = document.getElementById('refresh-tasks');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTasks());
        }
    }

    async loadTasks() {
        try {
            // Show loading state
            if (this.tasksContainer) {
                this.tasksContainer.style.opacity = '0.5';
            }

            const tasks = await this.fetchTasks();
            if (tasks && tasks.length > 0) {
                this.renderTasks(tasks);
            } else {
                this.renderEmptyState();
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.renderErrorState();
        } finally {
            if (this.tasksContainer) {
                this.tasksContainer.style.opacity = '1';
            }
        }
    }

    renderEmptyState() {
        if (!this.tasksContainer) return;
        
        this.tasksContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <h3>No Tasks Found</h3>
                <p>There are currently no tasks assigned to this department.</p>
            </div>
        `;
    }

    renderErrorState() {
        if (!this.tasksContainer) return;
        
        this.tasksContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ef4444;">
                <h3>Error Loading Tasks</h3>
                <p>Unable to load tasks. Please try again later.</p>
                <button onclick="departmentTaskManager.loadTasks()" style="margin-top: 12px; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }

    startAutoRefresh() {
        // Clear any existing timer
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        // Set up auto-refresh
        this.refreshTimer = setInterval(() => {
            this.loadTasks();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    init() {
        // Find the tasks container
        this.tasksContainer = document.getElementById('department-tasks-container');
        
        if (!this.tasksContainer) {
            // Try to find existing tasks section
            const tasksSection = document.querySelector('.current-tasks-section');
            if (tasksSection) {
                // Create container if it doesn't exist
                const container = document.createElement('div');
                container.id = 'department-tasks-container';
                container.style.cssText = 'padding: 20px; background: #f9fafb; border-radius: 8px;';
                
                // Replace existing content
                tasksSection.innerHTML = '';
                tasksSection.appendChild(container);
                this.tasksContainer = container;
            }
        }

        if (this.tasksContainer) {
            // Load tasks on init
            this.loadTasks();
            
            // Start auto-refresh
            this.startAutoRefresh();
            
            // Stop refresh when page is hidden
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopAutoRefresh();
                } else {
                    this.startAutoRefresh();
                }
            });
        } else {
            console.warn('Department tasks container not found in DOM');
        }
    }
}

// Initialize when DOM is ready
let departmentTaskManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        departmentTaskManager = new DepartmentTaskManager();
        departmentTaskManager.init();
    });
} else {
    departmentTaskManager = new DepartmentTaskManager();
    departmentTaskManager.init();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DepartmentTaskManager;
}