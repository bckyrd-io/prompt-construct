-- Seed Data for rag_properties Database
-- Run this in pgAdmin to populate your database with sample data

-- ============================================
-- 1. CREATE EXTENSION (if not exists)
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 2. CREATE TABLES (if not exists)
-- ============================================

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
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  current BOOLEAN DEFAULT FALSE,
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'due', 'unpaid')),
  amount INTEGER DEFAULT 0,
  due_date DATE,
  photos TEXT[],
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

-- ============================================
-- 2. INSERT DEFAULT MILESTONES TEMPLATE
-- ============================================

INSERT INTO milestones (name, display_order) VALUES
  ('Site Clearing', 1),
  ('Foundation', 2),
  ('Framing', 3),
  ('Roofing', 4),
  ('Interior', 5),
  ('Inspection', 6),
  ('Handover', 7)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. INSERT SAMPLE USERS
-- Passwords stored as plaintext (system requirement)
-- Default password for all users: "password123"
-- ============================================

INSERT INTO users (name, email, password_hash, role, status, created_at) VALUES
  ('Admin User', 'admin@prompt.construct', 'password123', 'admin', 'Active', '2024-01-01 10:00:00'),
  ('Adam Smith', 'adam@prompt.construct', 'password123', 'client', 'Active', '2024-01-15 09:00:00')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- ============================================
-- 4. INSERT SAMPLE PROPERTIES
-- ============================================

INSERT INTO properties (name, location, price, type, status, image_url, client_id, progress, beds, baths, sqft, description, created_at) VALUES
  ('The Highlands Estate', 'Austin, TX', 1200000, 'Residential', 'active', '/uploads/image.jpg', 2, 65, 4, 3.5, 3200, 'A stunning hillside estate in Austin featuring panoramic views of the Texas Hill Country. This modern 4-bedroom home boasts an open-concept design with floor-to-ceiling windows, a gourmet kitchen with high-end appliances, and a spacious master suite with a private balcony. The property includes a landscaped backyard with a saltwater pool and outdoor entertaining area. Located in a prestigious neighborhood with excellent schools and easy access to downtown Austin.', '2024-01-20 10:00:00'),
  ('Urban Loft Project', 'Seattle, WA', 850000, 'Residential', 'available', '/uploads/image.jpg', NULL, 0, 2, 2, 1800, 'A contemporary urban loft in the heart of Seattle''s Capitol Hill district. This 2-bedroom industrial-style residence features exposed brick walls, polished concrete floors, and soaring 14-foot ceilings. The open floor plan seamlessly connects the living area to a modern kitchen with quartz countertops. Building amenities include a rooftop deck with city views, fitness center, and secure parking. Walking distance to trendy restaurants, coffee shops, and light rail transit.', '2024-02-10 14:00:00'),
  ('Rocky Mountain Estate', 'Denver, CO', 2400000, 'Land', 'available', '/uploads/image.jpg', NULL, 0, 5, 4, 4500, 'A pristine 5-acre parcel of land nestled in the Rocky Mountains just 30 minutes from Denver. This elevated lot offers breathtaking views of the continental divide and direct access to hiking trails. The property features mature pine trees, a natural spring, and building sites approved for a custom 5-bedroom mountain retreat. Perfect for those seeking privacy and outdoor recreation while maintaining proximity to urban amenities. Ideal for building a luxury vacation home or permanent residence.', '2024-03-01 09:00:00'),
  ('Coastal Haven', 'Miami, FL', 1850000, 'Waterfront', 'active', '/uploads/image.jpg', 2, 45, 4, 3.5, 3800, 'An exquisite waterfront property in Miami''s exclusive Coconut Grove area. This 4-bedroom Mediterranean-style home features direct ocean access, a private dock, and stunning water views from every room. The interior includes a chef''s kitchen, formal dining room, and a master suite with a spa-like bathroom. Outdoor amenities include a heated infinity pool, outdoor kitchen, and lush tropical landscaping. Located near top-rated schools, marinas, and vibrant dining scene.', '2024-02-15 11:00:00'),
  ('Lakefront Paradise', 'Lake Tahoe, NV', 2800000, 'Waterfront', 'pending', '/uploads/image.jpg', NULL, 0, 5, 4.5, 5200, 'A magnificent lakefront estate on the Nevada side of Lake Tahoe with 200 feet of private shoreline. This 5-bedroom mountain modern home features floor-to-ceiling windows showcasing lake and mountain views. The property includes a private beach, boat lift, hot tub, and multiple outdoor living spaces. Interior highlights include a great room with stone fireplace, wine cellar, and a gourmet kitchen. Perfect for year-round enjoyment with world-class skiing just minutes away.', '2024-04-01 16:00:00'),
  ('Desert Springs Villa', 'Phoenix, AZ', 950000, 'Residential', 'completed', '/uploads/image.jpg', 2, 100, 3, 2.5, 2400, 'A charming desert-inspired villa in Phoenix''s Arcadia neighborhood. This 3-bedroom home features an open floor plan with a modern kitchen, spacious living areas, and a covered patio perfect for Arizona living. The property includes a desert landscaping with native plants, a sparkling pool, and mountain views. Located near hiking trails, golf courses, and the Biltmore Fashion Park. Energy-efficient design with solar panels and smart home technology.', '2023-11-15 08:30:00')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. INSERT PROPERTY MILESTONES
-- Each property gets its own copy of milestones
-- ============================================

-- Milestones for "The Highlands Estate" (id: 1) - Active project at 65%
INSERT INTO property_milestones (property_id, milestone_id, name, completed, current, payment_status, amount, display_order) VALUES
  (1, 1, 'Site Clearing', true, false, 'paid', 75000, 1),
  (1, 2, 'Foundation', true, false, 'paid', 85000, 2),
  (1, 3, 'Framing', true, false, 'paid', 90000, 3),
  (1, 4, 'Roofing', false, true, 'due', 65000, 4),
  (1, 5, 'Interior', false, false, 'unpaid', 120000, 5),
  (1, 6, 'Inspection', false, false, 'unpaid', 25000, 6),
  (1, 7, 'Handover', false, false, 'unpaid', 50000, 7);

-- Milestones for "Coastal Haven" (id: 4) - Active project at 45%
INSERT INTO property_milestones (property_id, milestone_id, name, completed, current, payment_status, amount, display_order) VALUES
  (4, 1, 'Site Clearing', true, false, 'paid', 70000, 1),
  (4, 2, 'Foundation', true, false, 'paid', 80000, 2),
  (4, 3, 'Framing', false, true, 'due', 75000, 3),
  (4, 4, 'Roofing', false, false, 'unpaid', 60000, 4),
  (4, 5, 'Interior', false, false, 'unpaid', 110000, 5),
  (4, 6, 'Inspection', false, false, 'unpaid', 20000, 6),
  (4, 7, 'Handover', false, false, 'unpaid', 45000, 7);

-- Milestones for "Desert Springs Villa" (id: 6) - Completed project at 100%
INSERT INTO property_milestones (property_id, milestone_id, name, completed, current, payment_status, amount, display_order) VALUES
  (6, 1, 'Site Clearing', true, false, 'paid', 60000, 1),
  (6, 2, 'Foundation', true, false, 'paid', 70000, 2),
  (6, 3, 'Framing', true, false, 'paid', 75000, 3),
  (6, 4, 'Roofing', true, false, 'paid', 55000, 4),
  (6, 5, 'Interior', true, false, 'paid', 100000, 5),
  (6, 6, 'Inspection', true, false, 'paid', 20000, 6),
  (6, 7, 'Handover', true, false, 'paid', 40000, 7);

-- Milestones for "Urban Loft Project" (id: 2) - Available (no client)
INSERT INTO property_milestones (property_id, milestone_id, name, completed, current, payment_status, amount, display_order) VALUES
  (2, 1, 'Site Clearing', false, false, 'unpaid', 50000, 1),
  (2, 2, 'Foundation', false, false, 'unpaid', 60000, 2),
  (2, 3, 'Framing', false, false, 'unpaid', 70000, 3),
  (2, 4, 'Roofing', false, false, 'unpaid', 50000, 4),
  (2, 5, 'Interior', false, false, 'unpaid', 90000, 5),
  (2, 6, 'Inspection', false, false, 'unpaid', 15000, 6),
  (2, 7, 'Handover', false, false, 'unpaid', 30000, 7);

-- Milestones for "Rocky Mountain Estate" (id: 3) - Available (no client)
INSERT INTO property_milestones (property_id, milestone_id, name, completed, current, payment_status, amount, display_order) VALUES
  (3, 1, 'Site Clearing', false, false, 'unpaid', 100000, 1),
  (3, 2, 'Foundation', false, false, 'unpaid', 120000, 2),
  (3, 3, 'Framing', false, false, 'unpaid', 130000, 3),
  (3, 4, 'Roofing', false, false, 'unpaid', 100000, 4),
  (3, 5, 'Interior', false, false, 'unpaid', 180000, 5),
  (3, 6, 'Inspection', false, false, 'unpaid', 30000, 6),
  (3, 7, 'Handover', false, false, 'unpaid', 60000, 7);

-- Milestones for "Lakefront Paradise" (id: 5) - Pending
INSERT INTO property_milestones (property_id, milestone_id, name, completed, current, payment_status, amount, display_order) VALUES
  (5, 1, 'Site Clearing', false, false, 'unpaid', 120000, 1),
  (5, 2, 'Foundation', false, false, 'unpaid', 140000, 2),
  (5, 3, 'Framing', false, false, 'unpaid', 160000, 3),
  (5, 4, 'Roofing', false, false, 'unpaid', 110000, 4),
  (5, 5, 'Interior', false, false, 'unpaid', 200000, 5),
  (5, 6, 'Inspection', false, false, 'unpaid', 40000, 6),
  (5, 7, 'Handover', false, false, 'unpaid', 80000, 7);

-- ============================================
-- VERIFICATION QUERIES (uncomment to check data)
-- ============================================

-- SELECT * FROM users;
-- SELECT * FROM properties;
-- SELECT * FROM milestones;
-- SELECT * FROM property_milestones;

-- SELECT p.name as property, pm.name as milestone, pm.completed, pm.current, pm.payment_status
-- FROM property_milestones pm
-- JOIN properties p ON pm.property_id = p.id
-- ORDER BY p.id, pm.display_order;
