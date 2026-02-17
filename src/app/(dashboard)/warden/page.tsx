import { db } from '@/db';
import { wardens, students, rooms, complaints } from '@/db/schema';
import { auth } from '@/auth';
import { eq, count, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  floorId: string;
  status: 'occupied' | 'vacant';
  capacity: number;
}

interface WardenData {
  floorNumber: number;
  totalStudents: number;
  vacantRooms: number;
  occupiedRooms: number;
  pendingComplaints: number;
  rooms: Room[];
}

async function getWardenData(userId: string): Promise<WardenData | null> {
  // 1. Get Warden's assigned floor
  const warden = await db.query.wardens.findFirst({
    where: eq(wardens.userId, userId),
    with: {
      assignedFloor: {
        with: {
          rooms: {
            orderBy: (rooms, { asc }) => [asc(rooms.roomNumber)],
          },
        },
      },
    },
  });

  if (!warden || !warden.assignedFloor) return null;

  const floorId = warden.assignedFloor.id;
  const floorNumber = warden.assignedFloor.floorNumber;
  const roomList = warden.assignedFloor.rooms;

  // 2. Get Stats
  // Count students in rooms on this floor
  const studentsOnFloor = await db
    .select({ count: count() })
    .from(students)
    .innerJoin(rooms, eq(students.roomId, rooms.id))
    .where(eq(rooms.floorId, floorId));

  const vacantRoomsCount = roomList.filter((r) => r.status === 'vacant').length;
  const occupiedRoomsCount = roomList.filter(
    (r) => r.status === 'occupied',
  ).length;

  // Get pending complaints for students on this floor
  const pendingComplaints = await db
    .select({ count: count() })
    .from(complaints)
    .innerJoin(students, eq(complaints.studentId, students.id))
    .innerJoin(rooms, eq(students.roomId, rooms.id))
    .where(and(eq(rooms.floorId, floorId), eq(complaints.status, 'pending')));

  return {
    floorNumber,
    totalStudents: studentsOnFloor[0].count,
    vacantRooms: vacantRoomsCount,
    occupiedRooms: occupiedRoomsCount,
    pendingComplaints: pendingComplaints[0].count,
    rooms: roomList as Room[],
  };
}

export default async function WardenDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== 'warden') {
    redirect('/login');
  }

  const data = await getWardenData(session.user.id as string);

  if (!data) {
    return (
      <div className="text-center p-12 text-gray-400">
        <h1 className="text-2xl font-bold text-white mb-2">
          Access Restricted
        </h1>
        <p>You have not been assigned a floor yet. Please contact the Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Floor {data.floorNumber} Dashboard
        </h1>
        <p className="text-gray-400 text-sm">Overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2f3136] p-4 rounded-lg border-l-4 border-blue-400 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Total Students
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {data.totalStudents}
          </p>
        </div>
        <div className="bg-[#2f3136] p-4 rounded-lg border-l-4 border-emerald-400 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Vacant Rooms
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {data.vacantRooms}
          </p>
        </div>
        <div className="bg-[#2f3136] p-4 rounded-lg border-l-4 border-orange-400 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Pending Issues
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {data.pendingComplaints}
          </p>
        </div>
      </div>

      {/* Room Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Room Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.rooms.length === 0 && (
            <p className="text-gray-500 text-sm italic">
              No rooms found on this floor.
            </p>
          )}
          {data.rooms.map((room) => (
            <div
              key={room.id}
              className={`bg-[#2f3136] p-4 rounded-lg relative border-l-4 shadow-sm ${
                room.status === 'occupied'
                  ? 'border-red-500'
                  : 'border-emerald-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg text-white">
                  {room.roomNumber}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    room.status === 'occupied' ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                <Users size={14} />
                <span>
                  {room.status === 'occupied' ? room.capacity : 0} /{' '}
                  {room.capacity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
