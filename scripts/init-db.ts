import { db, users } from '../src/lib/db';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, 'admin@example.com'));
    
    if (!existingAdmin) {
      const hashedPassword = await hash('admin123', 10);
      
      await db.insert(users).values({
        username: 'admin@example.com',
        password: hashedPassword,
      });
      
      console.log('✅ Default admin user created');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('\n⚠️ Please change these credentials after first login!');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
    process.exit(1);
  }
}

createDefaultAdmin().then(() => {
  process.exit(0);
});
