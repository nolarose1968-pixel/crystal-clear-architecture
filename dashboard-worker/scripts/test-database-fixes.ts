#!/usr/bin/env bun
/**
 * Test script to verify Bun SQL database fixes
 * Tests the updated database connection and query patterns
 */

import { SQL } from "bun";
import { DatabaseManager } from "../src/database/connection";
import { TaskService } from "../src/api/tasks-enhanced";
import { TeamConsultationService } from "../src/api/team-consultation-service";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log("\n🔧 Testing Database Connection", colors.cyan);
  
  try {
    // Test with in-memory SQLite
    const dbManager = new DatabaseManager({
      adapter: 'sqlite',
      file: ':memory:'
    });
    
    await dbManager.connect();
    log("✅ Database connection successful", colors.green);
    
    // Test health check
    const health = await dbManager.healthCheck();
    log(`✅ Health check: ${health.status} (${health.details.responseTime})`, colors.green);
    
    return await dbManager.getClient();
  } catch (error) {
    log(`❌ Database connection failed: ${error}`, colors.red);
    throw error;
  }
}

async function testBasicQueries(db: SQL) {
  log("\n🔧 Testing Basic SQL Queries", colors.cyan);
  
  try {
    // Test CREATE TABLE
    await db`
      CREATE TABLE test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;
    log("✅ CREATE TABLE successful", colors.green);
    
    // Test INSERT with tagged template literals
    const name = "Test Item";
    const value = 42;
    await db`
      INSERT INTO test_table (name, value) 
      VALUES (${name}, ${value})
    `;
    log("✅ INSERT with parameters successful", colors.green);
    
    // Test SELECT
    const results = await db`
      SELECT * FROM test_table WHERE value = ${value}
    `;
    log(`✅ SELECT query returned ${results.length} rows`, colors.green);
    
    // Test UPDATE
    const newValue = 100;
    await db`
      UPDATE test_table 
      SET value = ${newValue} 
      WHERE name = ${name}
    `;
    log("✅ UPDATE query successful", colors.green);
    
    // Test DELETE
    await db`
      DELETE FROM test_table WHERE value = ${newValue}
    `;
    log("✅ DELETE query successful", colors.green);
    
  } catch (error) {
    log(`❌ Basic query test failed: ${error}`, colors.red);
    throw error;
  }
}

async function testTaskService(db: SQL) {
  log("\n🔧 Testing TaskService", colors.cyan);
  
  try {
    // Initialize tables
    await db`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        department_id TEXT,
        assignee_id TEXT,
        reporter_id TEXT,
        due_date TEXT,
        start_date TEXT,
        estimated_hours REAL,
        story_points INTEGER,
        actual_hours REAL,
        completed_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await db`
      CREATE TABLE IF NOT EXISTS task_tags (
        task_uuid TEXT NOT NULL,
        tag TEXT NOT NULL,
        PRIMARY KEY (task_uuid, tag),
        FOREIGN KEY (task_uuid) REFERENCES tasks(uuid) ON DELETE CASCADE
      )
    `;
    
    // Create mock department and team member tables
    await db`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        display_name TEXT,
        icon TEXT
      )
    `;
    
    await db`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        role TEXT
      )
    `;
    
    // Insert test data
    await db`
      INSERT INTO departments (id, name, display_name, icon)
      VALUES ('dept-1', 'engineering', 'Engineering', '🔧')
    `;
    
    await db`
      INSERT INTO team_members (id, name, email, role)
      VALUES ('user-1', 'Test User', 'test@example.com', 'developer')
    `;
    
    log("✅ Task tables created successfully", colors.green);
    
    const taskService = new TaskService(db);
    
    // Test creating a task
    const newTask = await taskService.createTask({
      title: "Test Task",
      description: "Test Description",
      priority: 'high',
      status: 'active',
      progress: 0,
      departmentId: 'dept-1',
      assigneeId: 'user-1',
      tags: ['test', 'demo']
    }, 'user-1');
    
    log(`✅ Task created with UUID: ${newTask.uuid}`, colors.green);
    
    // Test getting task
    const task = await taskService.getTaskByUuid(newTask.uuid);
    log(`✅ Task retrieved: ${task.title}`, colors.green);
    
    // Test updating task
    const updatedTask = await taskService.updateTask({
      uuid: newTask.uuid,
      progress: 50,
      status: 'in-progress'
    }, 'user-1');
    
    log(`✅ Task updated: progress=${updatedTask.progress}`, colors.green);
    
    // Test deleting task
    await taskService.deleteTask(newTask.uuid, 'user-1');
    log("✅ Task deleted successfully", colors.green);
    
  } catch (error) {
    log(`❌ TaskService test failed: ${error}`, colors.red);
    throw error;
  }
}

async function testTeamConsultationService(db: SQL) {
  log("\n🔧 Testing TeamConsultationService", colors.cyan);
  
  try {
    const consultationService = new TeamConsultationService(db);
    
    // Create a consultation
    const consultation = await consultationService.createConsultation({
      projectId: 'proj-1',
      projectName: 'Test Project',
      description: 'Test consultation',
      priority: 'high',
      requesterId: 'user-1',
      requiredTeams: [
        {
          team: 'design',
          reviewType: 'ui-review',
          requirements: ['mockups', 'user-flow'],
          deliverables: ['approved-design']
        }
      ]
    });
    
    if (consultation.success) {
      log("✅ Consultation created successfully", colors.green);
      
      // Get consultation status
      const status = await consultationService.getConsultationStatus('proj-1');
      if (status) {
        log(`✅ Consultation status: ${status.overallStatus}`, colors.green);
      }
      
      // Update team status
      const updateResult = await consultationService.updateTeamStatus(
        'proj-1',
        'design',
        'approved',
        'reviewer-1',
        ['Looks good!']
      );
      
      if (updateResult.success) {
        log("✅ Team status updated successfully", colors.green);
      }
    }
    
  } catch (error) {
    log(`❌ TeamConsultationService test failed: ${error}`, colors.red);
    throw error;
  }
}

async function main() {
  log("\n🚀 Fire22 Dashboard - Database Fix Verification", colors.blue);
  log("=" .repeat(50), colors.blue);
  
  let db: SQL | null = null;
  
  try {
    // Test database connection
    db = await testDatabaseConnection();
    
    // Test basic queries
    await testBasicQueries(db);
    
    // Test TaskService
    await testTaskService(db);
    
    // Test TeamConsultationService
    await testTeamConsultationService(db);
    
    log("\n" + "=".repeat(50), colors.green);
    log("✅ All database tests passed successfully!", colors.green);
    log("=".repeat(50), colors.green);
    
  } catch (error) {
    log("\n" + "=".repeat(50), colors.red);
    log("❌ Database tests failed!", colors.red);
    log(`Error: ${error}`, colors.red);
    log("=".repeat(50), colors.red);
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);