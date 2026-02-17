import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  console.log('🌱 Seeding Admin User...');

  try {
    const email = 'admin@hostel.com';
    const password = 'admin123';

    // Check if admin exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name: 'System Admin',
      email,
      passwordHash: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@hostel.com');
    console.log('🔑 Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAdmin();
