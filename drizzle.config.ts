import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined in environment variables');
}

// Parse the connection URL
const connectionUrl = new URL(process.env.POSTGRES_URL);
const dbName = connectionUrl.pathname.replace(/^\//, '');

export default {
  schema: './src/lib/db.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: connectionUrl.hostname,
    port: parseInt(connectionUrl.port) || 5432,
    user: connectionUrl.username,
    password: connectionUrl.password,
    database: dbName,
    ssl: 'require'
  },
  verbose: true,
  strict: true,
} satisfies Config;
