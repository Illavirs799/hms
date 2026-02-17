import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, students } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, registerNumber } = await req.json();

    if (!name || !email || !password || !registerNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check existing email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingUser)
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 },
      );

    // Check existing reg. number
    const existingStudent = await db.query.students.findFirst({
      where: eq(students.registerNumber, registerNumber),
    });
    if (existingStudent)
      return NextResponse.json(
        { error: 'Register Number already exists' },
        { status: 400 },
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          name,
          email,
          passwordHash: hashedPassword,
          role: 'student',
        })
        .returning();

      await tx.insert(students).values({
        userId: newUser.id,
        registerNumber,
        // Room and Fee are initially null/pending until assigned by admin/warden
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
