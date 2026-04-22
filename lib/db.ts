import { Pool, PoolClient } from 'pg';

// Database connection configuration
// Using environment variables or defaults for pgAdmin offline setup
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'db_prompt_construct',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

// SQL to create tables if they don't exist
const CREATE_TABLES_SQL = `
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Migration: Update embedding column to 3072 dimensions if it exists with 768
DO $$
BEGIN
  -- Check if the table exists and has the old embedding dimension
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'embedding'
  ) THEN
    -- Drop the column and recreate with new dimension
    -- Note: This will delete existing embeddings, regenerate them after migration
    ALTER TABLE properties DROP COLUMN IF EXISTS embedding;
    ALTER TABLE properties ADD COLUMN embedding vector(3072);
  END IF;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'client')),
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('active', 'available', 'pending', 'completed', 'acquired', 'payment_in_progress')),
  image_url TEXT,
  client_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  beds INTEGER DEFAULT 0,
  baths DECIMAL(3,1) DEFAULT 0,
  sqft INTEGER DEFAULT 0,
  description TEXT,
  embedding vector(3072),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Milestones template table (default milestones)
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property-specific milestones (each property gets its own copy)
CREATE TABLE IF NOT EXISTS property_milestones (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  milestone_id INTEGER REFERENCES milestones(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL, -- denormalized for flexibility
  completed BOOLEAN DEFAULT FALSE,
  current BOOLEAN DEFAULT FALSE,
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'due', 'unpaid')),
  amount INTEGER DEFAULT 0,
  due_date DATE,
  photos TEXT[], -- array of photo URLs
  ai_note TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  step INTEGER DEFAULT 1,

  -- Personal Info
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),

  -- Financial Info
  employment VARCHAR(100),
  income INTEGER,
  down_payment INTEGER,

  -- Documents (JSON array of uploaded doc IDs)
  uploaded_documents TEXT[],

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default milestones if they don't exist
INSERT INTO milestones (name, display_order) VALUES
  ('Site Clearing', 1),
  ('Foundation', 2),
  ('Framing', 3),
  ('Roofing', 4),
  ('Interior', 5),
  ('Inspection', 6),
  ('Handover', 7)
ON CONFLICT DO NOTHING;
`;

// Initialize database - create tables if they don't exist
export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(CREATE_TABLES_SQL);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get a client from the pool
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

// Query helper
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Export pool for direct use
export { pool };
