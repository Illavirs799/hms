'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { createFloor } from '@/app/actions/rooms';
import { Plus } from 'lucide-react';

export default function CreateFloorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [floorNumber, setFloorNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floorNumber) return;

    setLoading(true);
    const result = await createFloor(parseInt(floorNumber));
    if (result.success) {
      setIsOpen(false);
      setFloorNumber('');
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition shadow-sm"
      >
        <Plus size={16} />
        Add Floor
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Floor"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Floor Number
            </label>
            <input
              type="number"
              className="w-full bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
              placeholder="e.g. 1, 2, 3"
              value={floorNumber}
              onChange={(e) => setFloorNumber(e.target.value)}
              required
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2 rounded transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Floor'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
