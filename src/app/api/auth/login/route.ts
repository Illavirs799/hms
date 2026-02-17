import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Special check for initial admin creation if no users exist
    // In a real app, you'd seed this. For this demo, let's allow creating admin if none exists?
    // User requested "Admin can login directly". This implies an account exists.
    // I will add a check: if email is "admin@example.com" and password "admin123", create it if not exists.
    // This is a strictly dev-mode hack for the user to be able to login immediately without manual seeding.

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existingUser) {
      // DEV ONLY: Auto-create admin if trying to login as specific admin credentials
      if (
        role === 'admin' &&
        email === 'admin@hostel.com' &&
        password === 'admin123'
      ) {
        const hashedPassword = await hashPassword(password);
        const [newUser] = await db
          .insert(users)
          .values({
            name: 'System Admin',
            email,
            passwordHash: hashedPassword,
            role: 'admin',
          })
          .returning();

        await createSession(newUser.id, newUser.role);
        return NextResponse.json({
          success: true,
          user: { id: newUser.id, name: newUser.name, role: newUser.role },
        });
      }
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Verify Password
    const isValid = await verifyPassword(password, existingUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Login logic
    // Admin: Direct login if role matches
    if (existingUser.role === 'admin' && role === 'admin') {
      await createSession(existingUser.id, existingUser.role);
      return NextResponse.json({ success: true, redirect: '/admin' });
    }

    // Warden: Login only if role matches. (Approval check to be added later if column exists, currently minimal schema)
    if (existingUser.role === 'warden' && role === 'warden') {
      await createSession(existingUser.id, existingUser.role);
      return NextResponse.json({ success: true, redirect: '/warden' });
    }

    // Student: Login
    if (existingUser.role === 'student' && role === 'student') {
      await createSession(existingUser.id, existingUser.role);
      return NextResponse.json({ success: true, redirect: '/student' });
    }

    return NextResponse.json(
      { error: 'Role mismatch or unauthorized' },
      { status: 403 },
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
