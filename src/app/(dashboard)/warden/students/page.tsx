import { db } from '@/db';
import { wardens, students, rooms, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

// Define return type
interface FloorStudentsData {
  students: {
    id: string;
    name: string;
    registerNumber: string;
    room: string;
  }[];
  floorNum: number;
}

async function getFloorStudents(
  userId: string,
): Promise<FloorStudentsData | null> {
  // 1. Get Warden's floor
  const warden = await db.query.wardens.findFirst({
    where: eq(wardens.userId, userId),
    with: { assignedFloor: true },
  });

  if (!warden || !warden.assignedFloor) return null;

  const floorId = warden.assignedFloor.id;
  const floorNum = warden.assignedFloor.floorNumber;

  // 2. Fetch students in rooms on this floor
  const studentList = await db
    .select({
      id: students.id,
      name: users.name,
      registerNumber: students.registerNumber,
      room: rooms.roomNumber,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(rooms, eq(students.roomId, rooms.id))
    .where(eq(rooms.floorId, floorId));

  return { students: studentList, floorNum };
}

export default async function WardenStudentsPage() {
  const session = await getSession();
  if (!session || session.role !== 'warden') redirect('/login');

  const data = await getFloorStudents(session.userId as string);

  if (!data) {
    return (
      <div className="text-center p-12 text-gray-400">
        <h1 className="text-2xl font-bold text-white mb-2">
          Access Restricted
        </h1>
        <p>You have not been assigned a floor yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Floor {data.floorNum} Students
        </h1>
        <p className="text-gray-400 text-sm">
          View students assigned to your floor
        </p>
      </div>

      <div className="bg-[#2f3136] rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#202225] text-gray-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4">Reg. No</th>
              <th className="p-4">Room</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202225]">
            {data.students.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="p-8 text-center text-gray-400 text-sm"
                >
                  No students found on this floor.
                </td>
              </tr>
            ) : (
              data.students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-[#34373c] transition-colors"
                >
                  <td className="p-4 font-medium text-white">{student.name}</td>
                  <td className="p-4 text-gray-400 text-sm font-mono">
                    {student.registerNumber}
                  </td>
                  <td className="p-4">
                    <span className="bg-[#202225] text-gray-300 px-2 py-1 rounded text-xs font-mono">
                      Room {student.room}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
