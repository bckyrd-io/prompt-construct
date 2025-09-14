import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, desc, sql } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  varchar, 
  boolean,
  jsonb,
  pgSchema
} from 'drizzle-orm/pg-core';
import { hash } from 'bcryptjs';

// Check for required environment variables
if (!process.env.POSTGRES_PRISMA_URL) {
  throw new Error('POSTGRES_PRISMA_URL environment variable is not set. Please check your .env.local file.');
}

// Set default admin email/password if not provided
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Database Schema
const contents = pgTable('contents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  imageUrl: text('image_url'),
  category: varchar('category', { length: 50 }).notNull(), // 'page', 'project', 'service', etc.
  metadata: jsonb('metadata').default({}), // For additional fields like location, tags, etc.
  isPublished: boolean('is_published').default(true),
  publishedAt: timestamp('published_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 256 }).unique().notNull(),
  password: varchar('password', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).unique(),
  role: varchar('role', { length: 50 }).default('editor'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Database Connection with error handling
// Parse the connection string to extract SSL parameters
const connectionString = new URL(process.env.POSTGRES_PRISMA_URL || '');
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: true }
  : { rejectUnauthorized: false }; // Allow self-signed certificates in development

const pool = new Pool({
  user: 'postgres.rxsbtzncwoknensfjisg',
  host: connectionString.hostname,
  database: 'postgres',
  password: connectionString.password,
  port: parseInt(connectionString.port || '5432'),
  ssl: sslConfig,
  connectionTimeoutMillis: 10000, // 10 seconds timeout
  idle_in_transaction_session_timeout: 20000, // 20 seconds
});

// Test the connection immediately
async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error('Failed to connect to the database. Please check your DATABASE_URL and ensure PostgreSQL is running.');
  } finally {
    client.release();
  }
}

// Initialize the database schema
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(256) UNIQUE NOT NULL,
        password VARCHAR(256) NOT NULL,
        email VARCHAR(256) UNIQUE,
        role VARCHAR(50) DEFAULT 'editor',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create contents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(256) NOT NULL,
        slug VARCHAR(256) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        image_url TEXT,
        category VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        is_published BOOLEAN DEFAULT true,
        published_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Database schema initialized');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize the database when this module loads
(async () => {
  try {
    await testConnection();
    await initializeDatabase();
    await ensureAdminUser();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
})();


// Test the connection when the module loads
testConnection().catch(console.error);

// Create a schema object for Drizzle
export const db = drizzle(pool, { 
  schema: { 
    contents, 
    users 
  } 
});

// Content Operations
export async function getContentBySlug(slug: string, category?: string) {
  const whereClause = category 
    ? eq(contents.slug, slug) && eq(contents.category, category)
    : eq(contents.slug, slug);
    
  const result = await db
    .select()
    .from(contents)
    .where(whereClause)
    .limit(1);
    
  return result[0];
}

export async function getContents(category?: string) {
  const query = db
    .select()
    .from(contents);
    
  if (category) {
    query.where(eq(contents.category, category));
  }
  
  return await query.orderBy(desc(contents.publishedAt));
}

export async function createContent(data: NewContent) {
  // Ensure metadata is an object and handle null/undefined for optional fields
  const insertData = {
    ...data,
    excerpt: data.excerpt || null,
    imageUrl: data.imageUrl || null,
    metadata: data.metadata || {},
  };
  
  const [newContent] = await db.insert(contents).values(insertData).returning();
  return newContent;
}

export async function updateContent(
  id: number,
  updates: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    imageUrl?: string;
    category?: string;
    metadata?: Record<string, any>;
    isPublished?: boolean;
  }
) {
  const [updatedContent] = await db
    .update(contents)
    .set({ 
      ...updates,
      updatedAt: new Date(),
      ...(updates.metadata && { metadata: { ...updates.metadata } }),
    })
    .where(eq(contents.id, id))
    .returning();
  return updatedContent;
}

export async function deleteContent(id: number) {
  const [deletedContent] = await db.delete(contents).where(eq(contents.id, id)).returning();
  return deletedContent;
}

// User Operations
export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return user;
}

export async function createUser(user: { username: string; password: string }) {
  const [newUser] = await db.insert(users).values(user).returning();
  return newUser;
}

export async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  try {
    // Check if admin user already exists
    const existingAdmin = await getUserByUsername(adminEmail);
    if (existingAdmin) return existingAdmin;
    
    // Hash the password
    const hashedPassword = await hash(adminPassword, 10);
    
    // Create admin user
    const [adminUser] = await db.insert(users).values({
      username: adminEmail,
      password: hashedPassword
    }).returning();
    
    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    throw error;
  }
}

// Types
export type Content = typeof contents.$inferSelect;

export interface NewContent extends Omit<typeof contents.$inferInsert, 'excerpt' | 'imageUrl'> {
  excerpt?: string | null;
  imageUrl?: string | null;
}
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Export the table objects for use in other files
export { contents, users };
