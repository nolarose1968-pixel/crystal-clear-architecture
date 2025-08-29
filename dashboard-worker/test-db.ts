
import { DatabaseManager } from './src/database/connection.ts';

const config = {
  adapter: 'sqlite' as const,
  file: './data/fire22.db'
};

const db = new DatabaseManager(config);

try {
  await db.connect();
  const health = await db.healthCheck();
  console.log('Database health:', health);
  
  if (health.status === 'healthy') {
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (error) {
  console.error('Database test failed:', error);
  process.exit(1);
}
