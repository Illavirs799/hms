import { db } from '@/db';
import { floors, rooms } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { Users } from 'lucide-react';

// Define explicit types for the query result
interface Room {
  id: string;
  roomNumber: string;
  maxCapacity: number;
  status: 'occupied' | 'vacant';
  capacity: number;
  floorId: string;
}

interface Floor {
  id: string;
  floorNumber: number;
  rooms: Room[];
}

async function getFloorsWithRooms() {
  const allFloors = await db.query.floors.findMany({
    orderBy: [asc(floors.floorNumber)],
    with: {
      rooms: {
        orderBy: [asc(rooms.roomNumber)],
      },
    },
  });
  return allFloors as Floor[];
}

export default async function RoomsPage() {
  const floorsData = await getFloorsWithRooms();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Rooms</h1>
          <p className="text-gray-400 text-sm">
            View occupancy and manage rooms per floor
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            Vacant
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            Occupied
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {floorsData.length === 0 && (
          <div className="text-center p-12 text-gray-400">
            <p>No floors or rooms created explicitly yet.</p>
            <p className="text-xs">Add Wardens to auto-create floors.</p>
          </div>
        )}

        {floorsData.map((floor) => (
          <div key={floor.id}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-400 pl-1">
              Floor {floor.floorNumber}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {floor.rooms.length === 0 && (
                <p className="text-xs text-gray-500 italic col-span-full">
                  No rooms on this floor
                </p>
              )}

              {floor.rooms.map((room) => (
                <div
                  key={room.id}
                  className={`bg-[#2f3136] p-4 rounded-lg relative cursor-pointer border-l-4 transition-transform hover:-translate-y-1 shadow-sm ${
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
                        room.status === 'occupied'
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
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
        ))}
      </div>
    </div>
  );
}
