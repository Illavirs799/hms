'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { createRoom } from '@/app/actions/rooms';
import { Plus } from 'lucide-react';

export default function AddRoomModal({
  floorId,
  floorNumber,
}: {
  floorId: string;
  floorNumber: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return;

    setLoading(true);
    const result = await createRoom(floorId, roomNumber, parseInt(capacity));
    if (result.success) {
      setIsOpen(false);
      setRoomNumber('');
      setCapacity('3');
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-[#5865f2] hover:underline flex items-center gap-1 font-bold uppercase tracking-wide"
      >
        <Plus size={12} />
        Add Room
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Add Room to Floor ${floorNumber}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Room Number
            </label>
            <input
              type="text"
              className="w-full bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
              placeholder="e.g. 101, 102"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Capacity
            </label>
            <input
              type="number"
              className="w-full bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
              placeholder="3"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              max="10"
              required
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2 rounded transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Room'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
