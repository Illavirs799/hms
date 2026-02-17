import { db } from '@/db';
import { floors, rooms, students } from '@/db/schema';
import { count, eq } from 'drizzle-orm';

async function getStats() {
  try {
    const [floorCount] = await db.select({ count: count() }).from(floors);
    const [roomCount] = await db.select({ count: count() }).from(rooms);
    const [studentCount] = await db.select({ count: count() }).from(students);
    const [occupiedRooms] = await db
      .select({ count: count() })
      .from(rooms)
      .where(eq(rooms.status, 'occupied'));

    return {
      totalFloors: floorCount?.count || 0,
      totalRooms: roomCount?.count || 0,
      totalStudents: studentCount?.count || 0,
      occupiedRooms: occupiedRooms?.count || 0,
      vacantRooms: (roomCount?.count || 0) - (occupiedRooms?.count || 0),
    };
  } catch (error) {
    console.error('DB Error:', error);
    return {
      totalFloors: 0,
      totalRooms: 0,
      totalStudents: 0,
      occupiedRooms: 0,
      vacantRooms: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: 'Total Floors', value: stats.totalFloors, color: 'text-blue-400' },
    { label: 'Total Rooms', value: stats.totalRooms, color: 'text-purple-400' },
    { label: 'Occupied', value: stats.occupiedRooms, color: 'text-orange-400' },
    { label: 'Vacant', value: stats.vacantRooms, color: 'text-emerald-400' },
    { label: 'Students', value: stats.totalStudents, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-[#2f3136] p-4 rounded-lg shadow-sm hover:bg-[#34373c] transition-colors border-l-4 border-[#202225] hover:border-[#5865f2]"
          >
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              {card.label}
            </h3>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#2f3136] p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-[#5865f2] text-white text-sm font-medium rounded hover:bg-[#4752c4] transition shadow-sm">
            Add Student
          </button>
          <button className="px-4 py-2 bg-[#4f545c] text-white text-sm font-medium rounded hover:bg-[#5d6269] transition shadow-sm">
            Assign Warden
          </button>
        </div>
      </div>
    </div>
  );
}
