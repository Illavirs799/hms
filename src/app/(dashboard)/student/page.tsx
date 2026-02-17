import { db } from '@/db';
import { students, rooms, floors, users } from '@/db/schema';
import { auth } from '@/auth';
import { eq } from 'drizzle-orm';
import { User, Home, DollarSign } from 'lucide-react';
import { redirect } from 'next/navigation';

async function getStudentData(userId: string) {
  try {
    const studentData = await db
      .select({
        name: users.name,
        registerNumber: students.registerNumber,
        room: rooms.roomNumber,
        floor: floors.floorNumber,
        feeStatus: students.feeStatus,
        feeAmount: students.feeAmount,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(rooms, eq(students.roomId, rooms.id))
      .leftJoin(floors, eq(rooms.floorId, floors.id))
      .where(eq(users.id, userId))
      .limit(1);

    return studentData[0] || null;
  } catch (error) {
    console.error('Error fetching student data:', error);
    return null;
  }
}

export default async function StudentDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== 'student') {
    redirect('/login');
  }

  const student = await getStudentData(session.user.id as string);

  if (!student) {
    // Fallback if student record doesn't exist yet (or registration incomplete)
    return (
      <div className="text-center p-12 text-gray-400">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome!</h1>
        <p>
          Your profile is being set up. Please contact the admin if this
          persists.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">My Dashboard</h1>
        <p className="text-gray-400 text-sm">Welcome back, {student.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#2f3136] p-6 rounded-lg relative overflow-hidden shadow-sm hover:translate-y-[-2px] transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-gray-400">
            <Home size={100} />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Room Details
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {student.room || 'N/A'}
            </span>
            {student.floor && (
              <span className="text-gray-400 text-sm font-bold uppercase">
                Floor {student.floor}
              </span>
            )}
          </div>
          <div
            className={`mt-4 flex items-center gap-2 text-xs font-bold uppercase ${student.room ? 'text-emerald-400' : 'text-orange-400'}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${student.room ? 'bg-emerald-500' : 'bg-orange-500'}`}
            ></div>
            {student.room ? 'Assigned' : 'Not Assigned'}
          </div>
        </div>

        <div className="bg-[#2f3136] p-6 rounded-lg relative overflow-hidden shadow-sm hover:translate-y-[-2px] transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-gray-400">
            <DollarSign size={100} />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Fee Status
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              ₹{student.feeAmount?.toLocaleString() || '0'}
            </span>
          </div>
          <div
            className={`mt-4 flex items-center gap-2 text-xs font-bold uppercase ${student.feeStatus === 'paid' ? 'text-emerald-400' : 'text-orange-400'}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${student.feeStatus === 'paid' ? 'bg-emerald-500' : 'bg-orange-500'}`}
            ></div>
            {student.feeStatus === 'paid' ? 'Paid' : 'Payment Pending'}
          </div>
        </div>

        <div className="bg-[#2f3136] p-6 rounded-lg relative overflow-hidden shadow-sm hover:translate-y-[-2px] transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-gray-400">
            <User size={100} />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Profile
          </h3>
          <div className="space-y-1">
            <p className="font-bold text-lg text-white">{student.name}</p>
            <p className="text-gray-400 text-sm font-mono">
              {student.registerNumber}
            </p>
          </div>
          <button className="mt-4 text-[#00aff4] text-xs font-bold hover:underline uppercase">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
