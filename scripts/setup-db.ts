import { db, users, contents } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function setupDatabase() {
  try {
    // Drop existing tables if they exist
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${contents} CASCADE`);

    // Create tables
    await db.execute(sql`
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

    await db.execute(sql`
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

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
