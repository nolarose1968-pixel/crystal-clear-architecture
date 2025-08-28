// Fire22 Dashboard Worker - Bun.SQL Unified Database Connection
// Supports MySQL/MariaDB, PostgreSQL, and SQLite with zero dependencies

import { SQL } from "bun";
import { Env } from '../types/env';

export type DatabaseAdapter = 'mysql' | 'postgres' | 'sqlite';

export interface DatabaseConfig {
  adapter: DatabaseAdapter;
  hostname?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
  // SQLite specific
  file?: string;
  // Connection pool settings
  maxConnections?: number;
  connectionTimeout?: number;
}

export class DatabaseManager {
  private sql: SQL | null = null;
  private config: DatabaseConfig;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initialize database connection based on environment
   */
  static fromEnvironment(env: Env): DatabaseManager {
    // Determine database type from environment
    const dbUrl = env.DATABASE_URL;
    
    if (dbUrl) {
      return this.fromUrl(dbUrl);
    }

    // Default configuration based on environment variables
    const config: DatabaseConfig = {
      adapter: (env.DB_ADAPTER as DatabaseAdapter) || 'sqlite',
      hostname: env.DB_HOST || '127.0.0.1',
      port: parseInt(env.DB_PORT || '5432'),
      username: env.DB_USERNAME || env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME || env.DATABASE_NAME || 'fire22_tasks',
      ssl: env.DB_SSL === 'true',
      file: env.DB_FILE || ':memory:', // SQLite default
      maxConnections: parseInt(env.DB_MAX_CONNECTIONS || '10'),
      connectionTimeout: parseInt(env.DB_TIMEOUT || '30000'),
    };

    return new DatabaseManager(config);
  }

  /**
   * Create DatabaseManager from connection URL
   */
  static fromUrl(url: string): DatabaseManager {
    const urlObj = new URL(url);
    
    let adapter: DatabaseAdapter;
    switch (urlObj.protocol.replace(':', '')) {
      case 'mysql':
        adapter = 'mysql';
        break;
      case 'postgres':
      case 'postgresql':
        adapter = 'postgres';
        break;
      case 'sqlite':
        adapter = 'sqlite';
        break;
      default:
        throw new Error(`Unsupported database protocol: ${urlObj.protocol}`);
    }

    const config: DatabaseConfig = {
      adapter,
      hostname: urlObj.hostname,
      port: urlObj.port ? parseInt(urlObj.port) : undefined,
      username: urlObj.username || undefined,
      password: urlObj.password || undefined,
      database: urlObj.pathname.replace('/', '') || undefined,
      file: adapter === 'sqlite' ? urlObj.pathname : undefined,
    };

    return new DatabaseManager(config);
  }

  /**
   * Establish database connection with retry logic
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.sql) {
      return;
    }

    this.connectionAttempts++;
    
    try {
      console.log(`🔗 Connecting to ${this.config.adapter} database (attempt ${this.connectionAttempts})`);
      
      switch (this.config.adapter) {
        case 'mysql':
          this.sql = new SQL({
            adapter: 'mysql',
            hostname: this.config.hostname!,
            port: this.config.port || 3306,
            username: this.config.username!,
            password: this.config.password!,
            database: this.config.database!,
          });
          break;
          
        case 'postgres':
          this.sql = new SQL({
            adapter: 'postgres',
            hostname: this.config.hostname!,
            port: this.config.port || 5432,
            username: this.config.username!,
            password: this.config.password!,
            database: this.config.database!,
            ssl: this.config.ssl,
          });
          break;
          
        case 'sqlite':
          // SQLite can use file path or :memory:
          const sqliteDb = this.config.file || ':memory:';
          this.sql = new SQL(sqliteDb);
          break;
          
        default:
          throw new Error(`Unsupported database adapter: ${this.config.adapter}`);
      }

      // Test connection with a simple query
      await this.sql`SELECT 1 as test`;
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      
      console.log(`✅ Connected to ${this.config.adapter} database successfully`);
      
    } catch (error) {
      console.error(`❌ Database connection failed:`, error);
      
      if (this.connectionAttempts < this.maxRetries) {
        const delay = Math.pow(2, this.connectionAttempts) * 1000; // Exponential backoff
        console.log(`⏳ Retrying connection in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connect();
      }
      
      throw new Error(`Failed to connect to database after ${this.maxRetries} attempts: ${error}`);
    }
  }

  /**
   * Get the SQL client instance
   */
  async getClient(): Promise<SQL> {
    if (!this.isConnected || !this.sql) {
      await this.connect();
    }
    
    if (!this.sql) {
      throw new Error('Database connection not established');
    }
    
    return this.sql;
  }

  /**
   * Execute health check query
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy', adapter: DatabaseAdapter, details: any }> {
    try {
      const client = await this.getClient();
      const startTime = Bun.nanoseconds();
      
      await client`SELECT 1 as health_check`;
      
      const endTime = Bun.nanoseconds();
      const responseTime = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
      
      return {
        status: 'healthy',
        adapter: this.config.adapter,
        details: {
          responseTime: `${responseTime.toFixed(2)}ms`,
          connected: this.isConnected,
          connectionAttempts: this.connectionAttempts,
        }
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        adapter: this.config.adapter,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          connected: this.isConnected,
          connectionAttempts: this.connectionAttempts,
        }
      };
    }
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    if (this.sql) {
      // Note: Bun.SQL doesn't have explicit close method yet
      // This will be handled by garbage collection
      this.sql = null;
      this.isConnected = false;
      console.log(`🔌 Disconnected from ${this.config.adapter} database`);
    }
  }

  /**
   * Get database configuration info (safe for logging)
   */
  getConfig(): Omit<DatabaseConfig, 'password'> {
    const { password, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Execute transaction with automatic rollback on error
   */
  async transaction<T>(callback: (sql: SQL) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client`BEGIN`;
      const result = await callback(client);
      await client`COMMIT`;
      return result;
    } catch (error) {
      await client`ROLLBACK`;
      throw error;
    }
  }

  /**
   * Batch execute multiple queries
   */
  async batch(queries: string[]): Promise<any[]> {
    const client = await this.getClient();
    const results = [];
    
    for (const query of queries) {
      try {
        const result = await client.query(query);
        results.push(result);
      } catch (error) {
        console.error(`Batch query failed: ${query}`, error);
        throw error;
      }
    }
    
    return results;
  }
}

// Singleton instance for the application
let dbManager: DatabaseManager | null = null;

export function getDatabase(env?: Env): DatabaseManager {
  if (!dbManager && env) {
    dbManager = DatabaseManager.fromEnvironment(env);
  }
  
  if (!dbManager) {
    throw new Error('Database manager not initialized. Call getDatabase(env) first.');
  }
  
  return dbManager;
}

export async function initializeDatabase(env: Env): Promise<DatabaseManager> {
  dbManager = DatabaseManager.fromEnvironment(env);
  await dbManager.connect();
  return dbManager;
}