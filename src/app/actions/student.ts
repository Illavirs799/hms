'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { auth } from '@/auth';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateStudentProfile(name: string) {
  const session = await auth();
  if (!session || !session.user) return { error: 'Unauthorized' };

  try {
    if (!name || name.trim().length === 0) {
      return { error: 'Name cannot be empty' };
    }

    await db
      .update(users)
      .set({ name })
      .where(eq(users.id, session.user.id as string));

    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error('Update Profile Error:', error);
    return { error: 'Failed to update profile' };
  }
}
