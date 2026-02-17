'use server';

import { db } from '@/db';
import { students, rooms } from '@/db/schema';
import { auth } from '@/auth';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateStudentRoom(
  studentId: string,
  roomId: string | null,
) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' };

  try {
    // If assigning to a room, check capacity
    if (roomId) {
      const room = await db.query.rooms.findFirst({
        where: eq(rooms.id, roomId),
        with: { students: true }, // Get current students
      });

      if (!room) return { error: 'Room not found' };

      if (room.status === 'occupied' && room.students.length >= room.capacity) {
        return { error: 'Room is full' };
      }

      // Update room status if it becomes full?
      // Actually, status update should probably happen automatically or be explicit.
      // For now, let's just assign. The occupancy logic in dashboard might rely on student count or explicit status.
      // The schema has `status` on room. We should update it if full?
      // Or better: The `rooms` table `status` enum might be manual or calculated.
      // Let's update status to 'occupied' if we add a student?
      // Actually, 'occupied' usually means "has at least one student" or "full"?
      // Dashboard logic seems to treat 'occupied' as "red dot".
      // Let's set status to 'occupied' if it was 'vacant'.

      if (room.status === 'vacant') {
        await db
          .update(rooms)
          .set({ status: 'occupied' })
          .where(eq(rooms.id, roomId));
      }
    } else {
      // Unassigning? We might need to check if old room becomes empty.
      // Complex logic for unassigning old room status update is skipped for now for simplicity,
      // or we can handle it if we know the old room.
      // For MVP, just update the student.
    }

    await db
      .update(students)
      .set({ roomId: roomId }) // set to null if unassigning
      .where(eq(students.id, studentId));

    revalidatePath('/admin/students');
    revalidatePath('/admin/rooms'); // Occupancy changes
    return { success: true };
  } catch (error) {
    console.error('Update Room Error:', error);
    return { error: 'Failed to update student room' };
  }
}

export async function updateStudentFee(
  studentId: string,
  status: 'paid' | 'pending',
) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' };

  try {
    await db
      .update(students)
      .set({ feeStatus: status })
      .where(eq(students.id, studentId));

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error) {
    console.error('Update Fee Error:', error);
    return { error: 'Failed to update fee status' };
  }
}
