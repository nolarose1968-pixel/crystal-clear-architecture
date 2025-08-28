// Fire22 Dashboard Worker - Database Migration System
// Supports schema versioning and data migration across MySQL/PostgreSQL/SQLite

import { SQL } from "bun";
import { DatabaseManager, getDatabase } from './connection';
import { generateTaskUUID, DEPARTMENT_IDS } from '../utils/uuid-generator';

export interface Migration {
  version: number;
  name: string;
  up: (sql: SQL) => Promise<void>;
  down: (sql: SQL) => Promise<void>;
}

export class MigrationRunner {
  private db: DatabaseManager;
  private sql: SQL | null = null;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  async initialize(): Promise<void> {
    this.sql = await this.db.getClient();
    await this.createMigrationsTable();
  }

  private async createMigrationsTable(): Promise<void> {
    if (!this.sql) throw new Error('Database not initialized');

    await this.sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  async getAppliedMigrations(): Promise<number[]> {
    if (!this.sql) throw new Error('Database not initialized');

    const result = await this.sql`SELECT version FROM schema_migrations ORDER BY version`;
    return result.map((row: any) => row.version);
  }

  async runMigrations(): Promise<void> {
    if (!this.sql) throw new Error('Database not initialized');

    const appliedVersions = await this.getAppliedMigrations();
    const migrations = this.getMigrations();

    console.log(`📋 Found ${migrations.length} total migrations`);
    console.log(`✅ ${appliedVersions.length} migrations already applied`);

    for (const migration of migrations) {
      if (!appliedVersions.includes(migration.version)) {
        console.log(`🔄 Running migration ${migration.version}: ${migration.name}`);
        
        try {
          await this.db.transaction(async (sql) => {
            await migration.up(sql);
            await sql`
              INSERT INTO schema_migrations (version, name) 
              VALUES (${migration.version}, ${migration.name})
            `;
          });
          
          console.log(`✅ Migration ${migration.version} completed successfully`);
        } catch (error) {
          console.error(`❌ Migration ${migration.version} failed:`, error);
          throw error;
        }
      }
    }

    console.log(`🎉 All migrations completed successfully`);
  }

  async rollbackMigration(targetVersion: number): Promise<void> {
    if (!this.sql) throw new Error('Database not initialized');

    const appliedVersions = await this.getAppliedMigrations();
    const migrations = this.getMigrations().reverse(); // Rollback in reverse order

    for (const migration of migrations) {
      if (appliedVersions.includes(migration.version) && migration.version > targetVersion) {
        console.log(`🔄 Rolling back migration ${migration.version}: ${migration.name}`);
        
        try {
          await this.db.transaction(async (sql) => {
            await migration.down(sql);
            await sql`DELETE FROM schema_migrations WHERE version = ${migration.version}`;
          });
          
          console.log(`✅ Migration ${migration.version} rolled back successfully`);
        } catch (error) {
          console.error(`❌ Rollback of migration ${migration.version} failed:`, error);
          throw error;
        }
      }
    }
  }

  private getMigrations(): Migration[] {
    return [
      {
        version: 1,
        name: 'create_initial_tables',
        up: async (sql) => {
          // Create departments table
          await sql`
            CREATE TABLE IF NOT EXISTS departments (
              id VARCHAR(36) PRIMARY KEY,
              name VARCHAR(100) NOT NULL UNIQUE,
              display_name VARCHAR(100) NOT NULL,
              icon VARCHAR(10),
              description TEXT,
              color VARCHAR(7),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;

          // Create team members table
          await sql`
            CREATE TABLE IF NOT EXISTS team_members (
              id VARCHAR(36) PRIMARY KEY,
              department_id VARCHAR(36) NOT NULL,
              name VARCHAR(100) NOT NULL,
              email VARCHAR(255) UNIQUE,
              role VARCHAR(100),
              avatar_url VARCHAR(500),
              efficiency_score INTEGER DEFAULT 100,
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;

          // Create tasks table with compatibility adjustments
          const createTasksQuery = this.db.getConfig().adapter === 'sqlite' 
            ? `
              CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid VARCHAR(36) UNIQUE NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
                status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'in-progress', 'review', 'completed', 'cancelled')),
                progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
                department_id VARCHAR(36) NOT NULL,
                assignee_id VARCHAR(36),
                reporter_id VARCHAR(36),
                due_date TIMESTAMP,
                start_date TIMESTAMP,
                completed_date TIMESTAMP,
                estimated_hours INTEGER,
                actual_hours INTEGER,
                story_points INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `
            : `
              CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                uuid VARCHAR(36) UNIQUE NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                status ENUM('planning', 'active', 'in-progress', 'review', 'completed', 'cancelled') DEFAULT 'planning',
                progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
                department_id VARCHAR(36) NOT NULL,
                assignee_id VARCHAR(36),
                reporter_id VARCHAR(36),
                due_date TIMESTAMP,
                start_date TIMESTAMP,
                completed_date TIMESTAMP,
                estimated_hours INTEGER,
                actual_hours INTEGER,
                story_points INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `;

          await sql.query(createTasksQuery);

          // Create indexes
          await sql`CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department_id)`;
          await sql`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id)`;
          await sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`;
          await sql`CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)`;
        },
        down: async (sql) => {
          await sql`DROP TABLE IF EXISTS tasks`;
          await sql`DROP TABLE IF EXISTS team_members`;
          await sql`DROP TABLE IF EXISTS departments`;
        }
      },
      {
        version: 2,
        name: 'create_task_tags_and_activities',
        up: async (sql) => {
          // Task tags table
          await sql`
            CREATE TABLE IF NOT EXISTS task_tags (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              task_uuid VARCHAR(36) NOT NULL,
              tag VARCHAR(50) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;

          // Task activities table
          const createActivitiesQuery = this.db.getConfig().adapter === 'sqlite'
            ? `
              CREATE TABLE IF NOT EXISTS task_activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_uuid VARCHAR(36) NOT NULL,
                user_id VARCHAR(36),
                activity_type TEXT NOT NULL CHECK (activity_type IN ('comment', 'status_change', 'assignment', 'progress_update', 'due_date_change', 'priority_change')),
                old_value TEXT,
                new_value TEXT,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `
            : `
              CREATE TABLE IF NOT EXISTS task_activities (
                id SERIAL PRIMARY KEY,
                task_uuid VARCHAR(36) NOT NULL,
                user_id VARCHAR(36),
                activity_type ENUM('comment', 'status_change', 'assignment', 'progress_update', 'due_date_change', 'priority_change') NOT NULL,
                old_value TEXT,
                new_value TEXT,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `;

          await sql.query(createActivitiesQuery);

          // Create indexes
          await sql`CREATE INDEX IF NOT EXISTS idx_task_tags_task ON task_tags(task_uuid)`;
          await sql`CREATE INDEX IF NOT EXISTS idx_task_activities_task ON task_activities(task_uuid)`;
        },
        down: async (sql) => {
          await sql`DROP TABLE IF EXISTS task_activities`;
          await sql`DROP TABLE IF EXISTS task_tags`;
        }
      },
      {
        version: 3,
        name: 'seed_initial_data',
        up: async (sql) => {
          await this.seedInitialData(sql);
        },
        down: async (sql) => {
          await sql`DELETE FROM tasks`;
          await sql`DELETE FROM team_members`;
          await sql`DELETE FROM departments`;
        }
      }
    ];
  }

  private async seedInitialData(sql: SQL): Promise<void> {
    // Seed departments
    const departments = [
      { id: DEPARTMENT_IDS.compliance, name: 'compliance', display_name: 'Compliance', icon: '⚖️', description: 'Legal and regulatory compliance', color: '#8B5CF6' },
      { id: DEPARTMENT_IDS['customer-support'], name: 'customer-support', display_name: 'Customer Support', icon: '🎧', description: 'Customer service and technical support', color: '#10B981' },
      { id: DEPARTMENT_IDS.finance, name: 'finance', display_name: 'Finance', icon: '💰', description: 'Financial operations and transaction management', color: '#F59E0B' },
      { id: DEPARTMENT_IDS.management, name: 'management', display_name: 'Management', icon: '👔', description: 'Strategic planning and leadership', color: '#3B82F6' },
      { id: DEPARTMENT_IDS.marketing, name: 'marketing', display_name: 'Marketing', icon: '📢', description: 'Marketing and brand management', color: '#EF4444' },
      { id: DEPARTMENT_IDS.operations, name: 'operations', display_name: 'Operations', icon: '⚙️', description: 'Business operations and processes', color: '#6B7280' },
      { id: DEPARTMENT_IDS['team-contributors'], name: 'team-contributors', display_name: 'Team Contributors', icon: '👥', description: 'Development team and contributors', color: '#14B8A6' },
      { id: DEPARTMENT_IDS.technology, name: 'technology', display_name: 'Technology', icon: '💻', description: 'Technical infrastructure and development', color: '#7C3AED' }
    ];

    for (const dept of departments) {
      await sql`
        INSERT OR IGNORE INTO departments (id, name, display_name, icon, description, color)
        VALUES (${dept.id}, ${dept.name}, ${dept.display_name}, ${dept.icon}, ${dept.description}, ${dept.color})
      `;
    }

    console.log(`✅ Seeded ${departments.length} departments`);

    // Seed some sample team members
    const sampleMembers = [
      { dept: 'compliance', name: 'Lisa Anderson', role: 'Compliance Manager', email: 'lisa.anderson@fire22.com' },
      { dept: 'finance', name: 'John Smith', role: 'Finance Director', email: 'john.smith@fire22.com' },
      { dept: 'technology', name: 'Sarah Johnson', role: 'Tech Lead', email: 'sarah.johnson@fire22.com' },
    ];

    for (const member of sampleMembers) {
      const deptId = DEPARTMENT_IDS[member.dept];
      const memberId = generateTaskUUID();
      
      await sql`
        INSERT OR IGNORE INTO team_members (id, department_id, name, role, email)
        VALUES (${memberId}, ${deptId}, ${member.name}, ${member.role}, ${member.email})
      `;
    }

    console.log(`✅ Seeded ${sampleMembers.length} team members`);
  }
}

// Utility functions for migration management
export async function runMigrations(env: any): Promise<void> {
  const db = getDatabase(env);
  const runner = new MigrationRunner(db);
  
  await runner.initialize();
  await runner.runMigrations();
}

export async function rollbackMigration(env: any, targetVersion: number): Promise<void> {
  const db = getDatabase(env);
  const runner = new MigrationRunner(db);
  
  await runner.initialize();
  await runner.rollbackMigration(targetVersion);
}