import { db } from '@/db';
import { complaints, students, users, rooms } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { CheckCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

async function getComplaints() {
  try {
    return await db
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
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(rooms, eq(students.roomId, rooms.id))
      .orderBy(desc(complaints.createdAt));
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
}

async function resolveComplaint(id: string) {
  'use server';
  await db
    .update(complaints)
    .set({ status: 'resolved', resolvedAt: new Date() })
    .where(eq(complaints.id, id));
  revalidatePath('/admin/complaints');
}

export default async function ComplaintsPage() {
  const complaintsData = await getComplaints();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Complaints</h1>
          <p className="text-gray-400 text-sm">Track and resolve issues</p>
        </div>
      </div>

      <div className="bg-[#2f3136] rounded-lg overflow-hidden shadow-sm">
        <div className="divide-y divide-[#202225]">
          {complaintsData.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No complaints found.
            </div>
          )}
          {complaintsData.map((complaint) => (
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
                <h3 className="font-semibold text-lg mb-1 text-gray-200">
                  {complaint.description}
                </h3>
                <p className="text-gray-400 text-sm">
                  Reported by{' '}
                  <span className="text-white font-medium">
                    {complaint.studentName}
                  </span>{' '}
                  (Room{' '}
                  <span className="font-mono text-gray-300">
                    {complaint.roomNumber || 'N/A'}
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
              {complaint.status === 'resolved' && (
                <div className="text-emerald-500 flex items-center gap-2 opacity-50 text-sm font-medium">
                  <CheckCircle size={16} />
                  <span>Resolved</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
