import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, wardens, floors } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const wardenList = await db
      .select({
        id: wardens.id,
        name: users.name,
        email: users.email,
        floor: floors.floorNumber,
      })
      .from(wardens)
      .innerJoin(users, eq(wardens.userId, users.id))
      .leftJoin(floors, eq(wardens.assignedFloorId, floors.id));

    return NextResponse.json({ wardens: wardenList });
  } catch (error) {
    console.error('Fetch Wardens Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, assignedFloor } = await req.json();

    // 1. Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    // Transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // 2. Create User
      const [newUser] = await tx
        .insert(users)
        .values({
          name,
          email,
          passwordHash: hashedPassword,
          role: 'warden',
        })
        .returning();

      let floorId = null;

      // 3. Handle Floor Logic
      if (assignedFloor) {
        const floorNum = parseInt(assignedFloor);

        // Check if floor exists
        let floor = await tx.query.floors.findFirst({
          where: eq(floors.floorNumber, floorNum),
        });

        // If not, create it
        if (!floor) {
          [floor] = await tx
            .insert(floors)
            .values({
              floorNumber: floorNum,
            })
            .returning();
        }

        floorId = floor.id;
      }

      // 4. Create Warden Record
      await tx.insert(wardens).values({
        userId: newUser.id,
        assignedFloorId: floorId,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create Warden Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
