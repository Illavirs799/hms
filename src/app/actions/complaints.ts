'use server';

import { db } from '@/db';
import { complaints, students } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createComplaint(description: string) {
  const session = await getSession();
  if (!session || session.role !== 'student') return { error: 'Unauthorized' };

  try {
    const student = await db.query.students.findFirst({
      where: eq(students.userId, session.userId as string),
    });

    if (!student) return { error: 'Student profile not found' };

    await db.insert(complaints).values({
      studentId: student.id,
      description,
      status: 'pending',
    });

    revalidatePath('/student/complaints');
    return { success: true };
  } catch (error) {
    console.error('Create complaint error:', error);
    return { error: 'Failed to submit complaint' };
  }
}

export async function getStudentComplaints() {
  const session = await getSession();
  if (!session || session.role !== 'student') return [];

  try {
    // First get student ID
    const student = await db.query.students.findFirst({
      where: eq(students.userId, session.userId as string),
      columns: { id: true },
    });

    if (!student) return [];

    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.studentId, student.id))
      .orderBy(desc(complaints.createdAt));
  } catch (error) {
    console.error('Fetch complaints error:', error);
    return [];
  }
}
