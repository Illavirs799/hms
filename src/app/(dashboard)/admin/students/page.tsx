import { db } from '@/db';
import { students, users, rooms, floors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import StudentActionModal from '@/components/modals/StudentActionModal';

async function getStudents() {
  try {
    const studentList = await db
      .select({
        id: students.id,
        name: users.name,
        registerNumber: students.registerNumber,
        roomId: students.roomId, // Needed for modal
        room: rooms.roomNumber,
        floor: floors.floorNumber,
        feeStatus: students.feeStatus,
        feeAmount: students.feeAmount,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(rooms, eq(students.roomId, rooms.id))
      .leftJoin(floors, eq(rooms.floorId, floors.id));

    return studentList;
  } catch (error) {
    console.error('Fetch students error:', error);
    return [];
  }
}

async function getVacantRooms() {
  try {
    const vacantRooms = await db.query.rooms.findMany({
      where: eq(rooms.status, 'vacant'),
      columns: { id: true, roomNumber: true },
    });
    return vacantRooms;
  } catch (error) {
    console.error('Fetch vacant rooms error:', error);
    return [];
  }
}

export default async function StudentsPage() {
  const studentsData = await getStudents();
  const vacantRooms = await getVacantRooms();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Students</h1>
          <p className="text-gray-400 text-sm">
            View details, update fees and rooms
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            placeholder="Search by name or room..."
            className="w-full bg-[#202225] border border-transparent rounded p-2 pl-10 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
          />
        </div>
        <button className="px-4 py-2 bg-[#2f3136] hover:bg-[#34373c] text-white rounded flex items-center gap-2 transition text-sm font-medium shadow-sm">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="bg-[#2f3136] rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#202225] text-gray-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4">Reg. No</th>
              <th className="p-4">Room / Floor</th>
              <th className="p-4">Fee Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202225]">
            {studentsData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              studentsData.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-[#34373c] transition-colors"
                >
                  <td className="p-4 font-medium text-white">{student.name}</td>
                  <td className="p-4 text-gray-400 font-mono text-sm">
                    {student.registerNumber}
                  </td>
                  <td className="p-4">
                    {student.room ? (
                      <>
                        <span className="bg-[#202225] text-gray-300 px-2 py-1 rounded text-xs font-mono">
                          Room {student.room}
                        </span>
                        <span className="ml-2 text-gray-500 text-xs uppercase font-bold">
                          Floor {student.floor}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs uppercase font-bold">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase ${
                        student.feeStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-orange-500/10 text-orange-400'
                      }`}
                    >
                      {student.feeStatus === 'paid' ? (
                        <CheckCircle size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {student.feeStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <StudentActionModal
                      student={{
                        id: student.id,
                        name: student.name,
                        roomId: student.roomId,
                        feeStatus: student.feeStatus as 'paid' | 'pending',
                      }}
                      vacantRooms={vacantRooms}
                    />
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
