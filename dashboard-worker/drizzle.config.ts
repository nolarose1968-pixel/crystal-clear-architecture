import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: 'dashboard-worker/wrangler.toml',
    dbName: 'fire22-dashboard',
  },
  verbose: true,
  strict: true,
} satisfies Config;
