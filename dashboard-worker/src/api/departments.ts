// Department Tasks API Endpoints
import { Env } from '../types/env';
import { DEPARTMENT_IDS, getTeamMemberId, getDepartmentId, generateTaskUUID } from '../utils/uuid-generator';

export interface DepartmentTask {
    id: number;
    uuid: string; // Unique UUID for the task
    title: string;
    priority: 'high' | 'medium' | 'low';
    status: 'in-progress' | 'active' | 'planning';
    assignee: string;
    assigneeId: string; // UUID for the team member
    departmentId: string; // UUID for the department
    progress: number;
    description?: string;
    dueDate?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface DepartmentTasksResponse {
    success: boolean;
    department: string;
    departmentId: string; // UUID for the department
    tasks: DepartmentTask[];
    summary: {
        total: number;
        inProgress: number;
        active: number;
        planning: number;
        avgProgress: number;
    };
    lastUpdated: string;
}

// Mock data for department tasks (in production, this would come from a database)
export const DEPARTMENT_TASKS_DATA: Record<string, DepartmentTask[]> = {
    compliance: [
        {
            id: 1,
            uuid: generateTaskUUID(),
            title: 'SOC 2 Compliance Audit',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Lisa Anderson',
            assigneeId: getTeamMemberId('Lisa Anderson'),
            departmentId: getDepartmentId('compliance'),
            progress: 75,
            description: 'Complete SOC 2 Type II audit preparation and documentation',
            dueDate: '2024-12-15',
            tags: ['audit', 'security', 'compliance'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-15T10:30:00Z'
        },
        {
            id: 2,
            uuid: generateTaskUUID(),
            title: 'GDPR Data Protection Review',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Mark Thompson',
            assigneeId: getTeamMemberId('Mark Thompson'),
            departmentId: getDepartmentId('compliance'),
            progress: 60,
            description: 'Review and update GDPR compliance procedures',
            dueDate: '2024-12-20',
            tags: ['gdpr', 'privacy', 'legal'],
            createdAt: '2024-10-15T00:00:00Z',
            updatedAt: '2024-11-14T16:45:00Z'
        },
        {
            id: 3,
            title: 'Security Policy Updates',
            priority: 'medium',
            status: 'active',
            assignee: 'Sarah Lee',
            progress: 45,
            description: 'Update company security policies and procedures',
            dueDate: '2025-01-10',
            tags: ['policy', 'security'],
            createdAt: '2024-10-20T00:00:00Z',
            updatedAt: '2024-11-12T14:20:00Z'
        },
        {
            id: 4,
            title: 'Vendor Risk Assessment',
            priority: 'medium',
            status: 'active',
            assignee: 'David Chen',
            progress: 30,
            description: 'Assess security risks for new vendor partnerships',
            dueDate: '2025-01-15',
            tags: ['vendor', 'risk', 'assessment'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-13T09:15:00Z'
        },
        {
            id: 5,
            title: 'Internal Audit Planning',
            priority: 'low',
            status: 'planning',
            assignee: 'Emma Wilson',
            progress: 15,
            description: 'Plan Q1 2025 internal audit schedule and scope',
            dueDate: '2025-02-01',
            tags: ['audit', 'planning'],
            createdAt: '2024-11-10T00:00:00Z',
            updatedAt: '2024-11-10T00:00:00Z'
        }
    ],
    'customer-support': [
        {
            id: 1,
            title: 'Support Ticket System Upgrade',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Mike Johnson',
            progress: 80,
            description: 'Upgrade customer support ticketing system',
            dueDate: '2024-12-01',
            tags: ['system', 'upgrade', 'tickets'],
            createdAt: '2024-10-01T00:00:00Z',
            updatedAt: '2024-11-15T11:00:00Z'
        },
        {
            id: 2,
            title: 'Customer Feedback Analysis',
            priority: 'medium',
            status: 'active',
            assignee: 'Jennifer Smith',
            progress: 55,
            description: 'Analyze customer feedback trends and satisfaction scores',
            dueDate: '2024-12-30',
            tags: ['feedback', 'analysis', 'satisfaction'],
            createdAt: '2024-10-15T00:00:00Z',
            updatedAt: '2024-11-14T15:30:00Z'
        },
        {
            id: 3,
            title: 'FAQ Documentation Update',
            priority: 'medium',
            status: 'active',
            assignee: 'Robert Brown',
            progress: 40,
            description: 'Update and expand FAQ documentation',
            dueDate: '2024-12-25',
            tags: ['documentation', 'faq'],
            createdAt: '2024-10-20T00:00:00Z',
            updatedAt: '2024-11-13T13:45:00Z'
        },
        {
            id: 4,
            title: 'Live Chat Integration',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Amanda Garcia',
            progress: 65,
            description: 'Integrate live chat functionality into support system',
            dueDate: '2024-12-10',
            tags: ['chat', 'integration', 'real-time'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-15T09:20:00Z'
        },
        {
            id: 5,
            title: 'Support Team Training',
            priority: 'low',
            status: 'planning',
            assignee: 'Chris Martinez',
            progress: 20,
            description: 'Plan and schedule training for new support processes',
            dueDate: '2025-01-15',
            tags: ['training', 'team'],
            createdAt: '2024-11-05T00:00:00Z',
            updatedAt: '2024-11-12T16:00:00Z'
        }
    ],
    finance: [
        {
            id: 1,
            uuid: generateTaskUUID(),
            title: 'Q4 Financial Planning',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Sarah Thompson',
            assigneeId: getTeamMemberId('Sarah Thompson'),
            departmentId: getDepartmentId('finance'),
            progress: 70,
            description: 'Complete Q4 budget planning and forecasting',
            dueDate: '2024-11-30',
            tags: ['budget', 'planning', 'q4'],
            createdAt: '2024-10-01T00:00:00Z',
            updatedAt: '2024-11-15T14:15:00Z'
        },
        {
            id: 2,
            title: 'Budget Reconciliation',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Michael Chen',
            progress: 85,
            description: 'Reconcile departmental budgets with actual spending',
            dueDate: '2024-11-25',
            tags: ['reconciliation', 'budget'],
            createdAt: '2024-10-15T00:00:00Z',
            updatedAt: '2024-11-15T16:30:00Z'
        },
        {
            id: 3,
            title: 'Expense Automation System',
            priority: 'medium',
            status: 'active',
            assignee: 'Jennifer Liu',
            progress: 50,
            description: 'Implement automated expense reporting system',
            dueDate: '2025-01-31',
            tags: ['automation', 'expenses'],
            createdAt: '2024-10-20T00:00:00Z',
            updatedAt: '2024-11-14T10:45:00Z'
        },
        {
            id: 4,
            title: 'Tax Documentation Preparation',
            priority: 'medium',
            status: 'active',
            assignee: 'Robert Anderson',
            progress: 35,
            description: 'Prepare documentation for annual tax filing',
            dueDate: '2025-02-15',
            tags: ['tax', 'documentation'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-13T12:00:00Z'
        },
        {
            id: 5,
            title: 'Investment Portfolio Review',
            priority: 'low',
            status: 'planning',
            assignee: 'Emily Davis',
            progress: 10,
            description: 'Review and optimize investment portfolio allocation',
            dueDate: '2025-03-01',
            tags: ['investment', 'portfolio'],
            createdAt: '2024-11-10T00:00:00Z',
            updatedAt: '2024-11-10T00:00:00Z'
        }
    ],
    management: [
        {
            id: 1,
            title: 'Strategic Planning 2025',
            priority: 'high',
            status: 'in-progress',
            assignee: 'John Smith',
            progress: 60,
            description: 'Develop strategic plan and roadmap for 2025',
            dueDate: '2024-12-15',
            tags: ['strategy', 'planning', '2025'],
            createdAt: '2024-10-01T00:00:00Z',
            updatedAt: '2024-11-15T15:00:00Z'
        },
        {
            id: 2,
            title: 'Performance Review System',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Patricia Johnson',
            progress: 75,
            description: 'Implement new performance review and feedback system',
            dueDate: '2024-12-31',
            tags: ['performance', 'review', 'hr'],
            createdAt: '2024-10-15T00:00:00Z',
            updatedAt: '2024-11-14T17:30:00Z'
        },
        {
            id: 3,
            title: 'Organizational Restructure',
            priority: 'medium',
            status: 'active',
            assignee: 'David Miller',
            progress: 40,
            description: 'Plan organizational restructure for improved efficiency',
            dueDate: '2025-02-28',
            tags: ['restructure', 'organization'],
            createdAt: '2024-10-20T00:00:00Z',
            updatedAt: '2024-11-12T11:15:00Z'
        },
        {
            id: 4,
            title: 'Leadership Development Program',
            priority: 'medium',
            status: 'active',
            assignee: 'Susan Lee',
            progress: 55,
            description: 'Design and launch leadership development program',
            dueDate: '2025-01-30',
            tags: ['leadership', 'development', 'training'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-13T14:45:00Z'
        },
        {
            id: 5,
            title: 'Board Meeting Preparation',
            priority: 'low',
            status: 'planning',
            assignee: 'Mark Wilson',
            progress: 25,
            description: 'Prepare materials and agenda for quarterly board meeting',
            dueDate: '2024-12-20',
            tags: ['board', 'meeting', 'quarterly'],
            createdAt: '2024-11-05T00:00:00Z',
            updatedAt: '2024-11-11T09:30:00Z'
        }
    ],
    marketing: [
        {
            id: 1,
            title: 'Q1 Campaign Launch',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Amanda Foster',
            progress: 82,
            description: 'Launch Q1 2025 marketing campaign',
            dueDate: '2024-12-01',
            tags: ['campaign', 'q1', 'launch'],
            createdAt: '2024-09-15T00:00:00Z',
            updatedAt: '2024-11-15T13:20:00Z'
        },
        {
            id: 2,
            title: 'Brand Guidelines Update',
            priority: 'medium',
            status: 'active',
            assignee: 'Kevin Park',
            progress: 45,
            description: 'Update brand guidelines and visual identity',
            dueDate: '2025-01-15',
            tags: ['brand', 'guidelines', 'identity'],
            createdAt: '2024-10-01T00:00:00Z',
            updatedAt: '2024-11-14T08:45:00Z'
        },
        {
            id: 3,
            uuid: generateTaskUUID(),
            title: 'Social Media Strategy',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Rachel Green',
            assigneeId: getTeamMemberId('Rachel Green'),
            departmentId: getDepartmentId('marketing'),
            progress: 68,
            description: 'Develop comprehensive social media strategy',
            dueDate: '2024-11-30',
            tags: ['social', 'strategy', 'media'],
            createdAt: '2024-10-10T00:00:00Z',
            updatedAt: '2024-11-15T12:10:00Z'
        },
        {
            id: 4,
            title: 'Content Calendar Planning',
            priority: 'medium',
            status: 'active',
            assignee: 'Jason White',
            progress: 50,
            description: 'Plan content calendar for next quarter',
            dueDate: '2024-12-15',
            tags: ['content', 'calendar', 'planning'],
            createdAt: '2024-10-20T00:00:00Z',
            updatedAt: '2024-11-13T16:20:00Z'
        },
        {
            id: 5,
            title: 'Market Research Analysis',
            priority: 'low',
            status: 'planning',
            assignee: 'Michelle Brown',
            progress: 15,
            description: 'Conduct market research and competitive analysis',
            dueDate: '2025-02-01',
            tags: ['research', 'analysis', 'competitive'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-10T14:00:00Z'
        }
    ],
    operations: [
        {
            id: 1,
            title: 'Supply Chain Optimization',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Robert Garcia',
            progress: 73,
            description: 'Optimize supply chain processes and reduce costs',
            dueDate: '2024-12-31',
            tags: ['supply-chain', 'optimization'],
            createdAt: '2024-10-01T00:00:00Z',
            updatedAt: '2024-11-15T10:45:00Z'
        },
        {
            id: 2,
            title: 'Warehouse Management System',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Linda Martinez',
            progress: 58,
            description: 'Implement new warehouse management system',
            dueDate: '2025-01-15',
            tags: ['warehouse', 'system', 'management'],
            createdAt: '2024-10-15T00:00:00Z',
            updatedAt: '2024-11-14T15:15:00Z'
        },
        {
            id: 3,
            title: 'Process Automation Phase 2',
            priority: 'medium',
            status: 'active',
            assignee: 'James Wilson',
            progress: 42,
            description: 'Continue automation of operational processes',
            dueDate: '2025-02-28',
            tags: ['automation', 'process', 'phase2'],
            createdAt: '2024-10-20T00:00:00Z',
            updatedAt: '2024-11-12T09:30:00Z'
        },
        {
            id: 4,
            title: 'Quality Control Standards',
            priority: 'medium',
            status: 'active',
            assignee: 'Maria Rodriguez',
            progress: 65,
            description: 'Update quality control standards and procedures',
            dueDate: '2024-12-20',
            tags: ['quality', 'control', 'standards'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-13T11:45:00Z'
        },
        {
            id: 5,
            title: 'Vendor Contract Negotiations',
            priority: 'low',
            status: 'planning',
            assignee: 'Thomas Anderson',
            progress: 20,
            description: 'Negotiate new vendor contracts for next year',
            dueDate: '2025-01-31',
            tags: ['vendor', 'contract', 'negotiation'],
            createdAt: '2024-11-05T00:00:00Z',
            updatedAt: '2024-11-11T16:20:00Z'
        }
    ],
    'team-contributors': [
        {
            id: 1,
            title: 'Open Source Contribution Tracking',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Alex Chen',
            progress: 77,
            description: 'Implement system to track open source contributions',
            dueDate: '2024-12-15',
            tags: ['opensource', 'tracking', 'contributions'],
            createdAt: '2024-10-01T00:00:00Z',
            updatedAt: '2024-11-15T14:30:00Z'
        },
        {
            id: 2,
            title: 'Developer Recognition Program',
            priority: 'medium',
            status: 'active',
            assignee: 'Jordan Taylor',
            progress: 52,
            description: 'Create program to recognize top contributors',
            dueDate: '2025-01-15',
            tags: ['recognition', 'program', 'developers'],
            createdAt: '2024-10-15T00:00:00Z',
            updatedAt: '2024-11-14T12:15:00Z'
        },
        {
            id: 3,
            title: 'Code Review Automation',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Sam Wilson',
            progress: 63,
            description: 'Automate code review process and quality checks',
            dueDate: '2024-12-30',
            tags: ['automation', 'code-review', 'quality'],
            createdAt: '2024-10-20T00:00:00Z',
            updatedAt: '2024-11-15T16:45:00Z'
        },
        {
            id: 4,
            title: 'Community Engagement Metrics',
            priority: 'medium',
            status: 'active',
            assignee: 'Morgan Lee',
            progress: 48,
            description: 'Develop metrics for community engagement',
            dueDate: '2025-01-30',
            tags: ['metrics', 'community', 'engagement'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-13T13:20:00Z'
        },
        {
            id: 5,
            title: 'Contribution Guidelines Update',
            priority: 'low',
            status: 'planning',
            assignee: 'Casey Brown',
            progress: 18,
            description: 'Update contribution guidelines and documentation',
            dueDate: '2025-02-15',
            tags: ['guidelines', 'documentation', 'contribution'],
            createdAt: '2024-11-10T00:00:00Z',
            updatedAt: '2024-11-12T10:30:00Z'
        }
    ],
    technology: [
        {
            id: 1,
            title: 'Cloud Migration Phase 3',
            priority: 'high',
            status: 'in-progress',
            assignee: 'David Kim',
            progress: 78,
            description: 'Complete third phase of cloud infrastructure migration',
            dueDate: '2024-12-31',
            tags: ['cloud', 'migration', 'phase3'],
            createdAt: '2024-09-01T00:00:00Z',
            updatedAt: '2024-11-15T15:45:00Z'
        },
        {
            id: 2,
            uuid: generateTaskUUID(),
            title: 'Security Infrastructure Upgrade',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Sarah Johnson',
            assigneeId: getTeamMemberId('Sarah Johnson'),
            departmentId: getDepartmentId('technology'),
            progress: 65,
            description: 'Upgrade security infrastructure and monitoring',
            dueDate: '2024-12-20',
            tags: ['security', 'infrastructure', 'upgrade'],
            createdAt: '2024-10-01T00:00:00Z',
            updatedAt: '2024-11-14T17:00:00Z'
        },
        {
            id: 3,
            title: 'API Gateway Implementation',
            priority: 'medium',
            status: 'active',
            assignee: 'Michael Brown',
            progress: 55,
            description: 'Implement API gateway for microservices',
            dueDate: '2025-01-31',
            tags: ['api', 'gateway', 'microservices'],
            createdAt: '2024-10-15T00:00:00Z',
            updatedAt: '2024-11-13T09:45:00Z'
        },
        {
            id: 4,
            title: 'DevOps Pipeline Optimization',
            priority: 'medium',
            status: 'active',
            assignee: 'Jennifer Chen',
            progress: 40,
            description: 'Optimize CI/CD pipeline for faster deployments',
            dueDate: '2025-02-15',
            tags: ['devops', 'pipeline', 'optimization'],
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-12T14:30:00Z'
        },
        {
            id: 5,
            title: 'Tech Stack Modernization',
            priority: 'low',
            status: 'planning',
            assignee: 'Robert Davis',
            progress: 22,
            description: 'Plan modernization of legacy technology stack',
            dueDate: '2025-03-15',
            tags: ['modernization', 'tech-stack', 'legacy'],
            createdAt: '2024-11-05T00:00:00Z',
            updatedAt: '2024-11-11T11:00:00Z'
        }
    ]
};

function calculateSummary(tasks: DepartmentTask[]) {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const active = tasks.filter(t => t.status === 'active').length;
    const planning = tasks.filter(t => t.status === 'planning').length;
    const avgProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total);

    return {
        total,
        inProgress,
        active,
        planning,
        avgProgress
    };
}

export async function handleDepartmentTasksRequest(
    request: Request,
    env: Env,
    department: string
): Promise<Response> {
    try {
        const tasks = DEPARTMENT_TASKS_DATA[department] || [];
        
        if (tasks.length === 0) {
            return Response.json({
                success: false,
                error: 'Department not found or no tasks available',
                department,
                availableDepartments: Object.keys(DEPARTMENT_TASKS_DATA)
            }, { status: 404 });
        }

        const summary = calculateSummary(tasks);

        const response: DepartmentTasksResponse = {
            success: true,
            department,
            tasks,
            summary,
            lastUpdated: new Date().toISOString()
        };

        // Add CORS headers for frontend requests
        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
                'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
            }
        });

    } catch (error) {
        console.error('Error handling department tasks request:', error);
        
        return Response.json({
            success: false,
            error: 'Internal server error',
            department,
            message: 'Unable to fetch department tasks'
        }, { 
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
            }
        });
    }
}

// Handle OPTIONS requests for CORS preflight
export function handleDepartmentTasksOptions(): Response {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
            'Access-Control-Max-Age': '86400' // Cache preflight for 24 hours
        }
    });
}