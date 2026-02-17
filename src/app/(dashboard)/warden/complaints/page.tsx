import { db } from '@/db';
import { auth } from '@/auth';
import { wardens, complaints, students, rooms, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

// Define explicit types
interface Complaint {
  id: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
  studentName: string | null;
  roomNumber: string | null;
}

async function getFloorComplaints(userId: string): Promise<Complaint[] | null> {
  const warden = await db.query.wardens.findFirst({
    where: eq(wardens.userId, userId),
    with: { assignedFloor: true },
  });

  if (!warden || !warden.assignedFloor) return null;
  const floorId = warden.assignedFloor.id;

  // Fetch complaints from students on this floor
  const result = await db
    .select({
      id: complaints.id,
      description: complaints.description,
      status: complaints.status,
      createdAt: complaints.createdAt,
      studentName: users.name,
      roomNumber: rooms.roomNumber,
    })
    .from(complaints)
    .innerJoin(students, eq(complaints.studentId, students.id))
    .innerJoin(rooms, eq(students.roomId, rooms.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(rooms.floorId, floorId))
    .orderBy(desc(complaints.createdAt));

  return result;
}

async function resolveComplaint(id: string) {
  'use server';
  await db
    .update(complaints)
    .set({ status: 'resolved', resolvedAt: new Date() })
    .where(eq(complaints.id, id));
  revalidatePath('/warden/complaints');
}

export default async function WardenComplaintsPage() {
  const session = await auth();
  if (!session || session.user?.role !== 'warden') redirect('/login');

  const complaintsList = await getFloorComplaints(session.user.id as string);

  if (!complaintsList) {
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
        <h1 className="text-2xl font-bold text-white">Floor Issues</h1>
        <p className="text-gray-400 text-sm">
          Manage student complaints for your floor
        </p>
      </div>

      <div className="bg-[#2f3136] rounded-lg overflow-hidden shadow-sm">
        <div className="divide-y divide-[#202225]">
          {complaintsList.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No complaints found.
            </div>
          ) : (
            complaintsList.map((complaint) => (
              <div
                key={complaint.id}
                className="p-6 flex items-start justify-between hover:bg-[#34373c] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${
                        complaint.status === 'pending'
                          ? 'border-orange-500/30 text-orange-400 bg-orange-500/10'
                          : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                      }`}
                    >
                      {complaint.status}
                    </span>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">
                      {complaint.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-gray-200">
                    {complaint.description}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Reported by{' '}
                    <span className="text-white font-medium">
                      {complaint.studentName}
                    </span>{' '}
                    (Room{' '}
                    <span className="text-gray-300 font-mono">
                      {complaint.roomNumber}
                    </span>
                    )
                  </p>
                </div>

                {complaint.status === 'pending' && (
                  <form action={resolveComplaint.bind(null, complaint.id)}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded transition text-sm font-medium">
                      <CheckCircle size={16} />
                      <span>Resolve</span>
                    </button>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
