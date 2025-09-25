import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Import schema types
import { eq, desc, and } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { hash } from 'bcryptjs';

declare global {
  // This ensures we can access the pool in server components
  var _pool: Pool | undefined;
}

let _db: NodePgDatabase | undefined;
let pool: Pool;

// This function will be used to get the database instance
export function getDb(): { db: NodePgDatabase; pool: Pool } {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations can only be performed on the server side');
  }

  if (!_db) {
    if (!global._pool) {
      const connectionUrl = new URL(process.env.POSTGRES_URL!);
      const dbName = connectionUrl.pathname.replace(/^\//, '');

      const sslConfig =
        process.env.NODE_ENV === 'production'
          ? {
              ssl: {
                rejectUnauthorized: false,
              },
            }
          : {};

      global._pool = new Pool({
        host: connectionUrl.hostname,
        port: parseInt(connectionUrl.port) || 5432,
        user: connectionUrl.username,
        password: connectionUrl.password,
        database: dbName,
        ...sslConfig,
      });
    }

    pool = global._pool;
    _db = drizzle(pool);
  }

  return { db: _db!, pool };
}

// Set default admin email/password if not provided
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Check for required environment variables
if (!process.env.POSTGRES_URL) {
  console.warn('POSTGRES_URL environment variable is not set. Database operations will fail.');
  // Don't throw error here to allow the app to start in development
}

// ============================================
// Database Schema
// ============================================

export const contents = pgTable('contents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  featuredMedia: text('featured_media'),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  category: varchar('category', { length: 50 }),
  tags: text('tags').array(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('editor').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Database Connection
// ============================================

// Get the db instance when needed
function getDatabase(): NodePgDatabase {
  const { db } = getDb();
  return db;
}

export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(target, prop: string | symbol, receiver: unknown) {
    const dbInstance = getDatabase();
    // Use Reflect.get to safely access properties without assuming an index signature
    return Reflect.get(dbInstance as unknown as Record<string | symbol, unknown>, prop, receiver);
  },
});

// ============================================
// Types
// ============================================

export type Content = typeof contents.$inferSelect;
export type NewContent = Omit<typeof contents.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type User = typeof users.$inferSelect;
export type NewUser = Omit<typeof users.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================
// Content Operations
// ============================================

export async function getContentById(id: number, category?: string): Promise<Content | null> {
  const query = db.select().from(contents).$dynamic();

  if (category) {
    query.where(and(eq(contents.id, id), eq(contents.category, category)));
  } else {
    query.where(eq(contents.id, id));
  }

  const [content] = await query;
  return content || null;
}

export async function getContents(category?: string): Promise<Content[]> {
  const query = db.select().from(contents).$dynamic();

  if (category) {
    query.where(eq(contents.category, category));
  }

  return query.orderBy(desc(contents.publishedAt));
}

export async function createContent(data: NewContent): Promise<Content> {
  const [content] = await db
    .insert(contents)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return content;
}

export async function updateContent(
  id: number,
  data: Partial<Omit<NewContent, 'id' | 'createdAt'>>,
): Promise<Content> {
  const [content] = await db
    .update(contents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(contents.id, id))
    .returning();
  return content;
}

export async function deleteContent(id: number): Promise<Content | undefined> {
  const [content] = await db.delete(contents).where(eq(contents.id, id)).returning();
  return content;
}

// ============================================
// User Operations
// ============================================

export async function getUserById(id: number): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user || null;
}

export async function createUser(userData: Omit<NewUser, 'role'>): Promise<User> {
  const hashedPassword = await hash(userData.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      ...userData,
      password: hashedPassword,
      role: 'editor', // Default role
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return user;
}

// ============================================
// Admin User Setup
// ============================================

export async function ensureAdminUser(): Promise<User> {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;

  try {
    // Check if admin user already exists
    let adminUser = await getUserByEmail(adminEmail);

    if (!adminUser) {
      // Create admin user if it doesn't exist
      const hashedPassword = await hash(adminPassword, 10);
      const { db } = getDb();

      const [newUser] = await db
        .insert(users)
        .values({
          username: 'admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!newUser) {
        throw new Error('Failed to create admin user');
      }

      adminUser = newUser;
      console.log('Admin user created successfully');
    }

    if (!adminUser) {
      throw new Error('Admin user not found and could not be created');
    }

    return adminUser;
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    throw error;
  }
}

// Initialize admin user on startup if no users exist
async function initializeAdmin() {
  if (typeof window !== 'undefined') return; // Skip in browser

  try {
    const { pool } = getDb();
    const client = await pool.connect();
    try {
      // Check if users table exists and has any users
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'users'
        )
      `);

      const usersTableExists = result.rows[0].exists;

      if (usersTableExists) {
        const db = getDatabase();
        const existingUsers = await db.select().from(users).limit(1);
        if (existingUsers.length === 0) {
          console.log('No users found. Creating admin user...');
          await ensureAdminUser();
        }
      } else {
        console.log('Users table does not exist yet. Run migrations first.');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}

// Run initialization after a short delay to ensure database is ready
if (typeof window === 'undefined') {
  setTimeout(() => {
    initializeAdmin().catch(console.error);
  }, 2000);
}

// ============================================
// Helper Functions
// ============================================

export async function testConnection() {
  if (typeof window !== 'undefined') {
    console.log('Database connection test skipped in browser');
    return;
  }

  const { pool } = getDb();
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Test the connection on startup
testConnection().catch(console.error);
