'use server';

import { db } from '@/db';
import { floors, rooms } from '@/db/schema';
import { auth } from '@/auth';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- Floor Actions ---

export async function createFloor(floorNumber: number) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const existingFloor = await db.query.floors.findFirst({
      where: eq(floors.floorNumber, floorNumber),
    });

    if (existingFloor) {
      return { error: `Floor ${floorNumber} already exists` };
    }

    await db.insert(floors).values({ floorNumber });
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (error) {
    console.error('Create Floor Error:', error);
    return { error: 'Failed to create floor' };
  }
}

export async function deleteFloor(floorId: string) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' };

  try {
    // Check if floor has rooms
    const roomCount = await db.query.rooms.findMany({
      where: eq(rooms.floorId, floorId),
    });

    if (roomCount.length > 0) {
      return { error: 'Cannot delete floor with existing rooms' };
    }

    await db.delete(floors).where(eq(floors.id, floorId));
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (error) {
    console.error('Delete Floor Error:', error);
    return { error: 'Failed to delete floor' };
  }
}

// --- Room Actions ---

export async function createRoom(
  floorId: string,
  roomNumber: string,
  capacity: number = 3,
) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const existingRoom = await db.query.rooms.findFirst({
      where: eq(rooms.roomNumber, roomNumber),
    });

    if (existingRoom) {
      return { error: `Room ${roomNumber} already exists` };
    }

    await db.insert(rooms).values({
      floorId,
      roomNumber,
      capacity,
      status: 'vacant',
    });
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (error) {
    console.error('Create Room Error:', error);
    return { error: 'Failed to create room' };
  }
}

export async function deleteRoom(roomId: string) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' };

  try {
    // Check if room is occupied
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (room?.status === 'occupied') {
      return { error: 'Cannot delete occupied room' };
    }

    await db.delete(rooms).where(eq(rooms.id, roomId));
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (error) {
    console.error('Delete Room Error:', error);
    return { error: 'Failed to delete room' };
  }
}
