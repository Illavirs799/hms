'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { updateStudentRoom, updateStudentFee } from '@/app/actions/admin';
import { Edit, CheckCircle, XCircle } from 'lucide-react';

interface StudentActionModalProps {
  student: {
    id: string;
    name: string;
    roomId: string | null;
    feeStatus: 'paid' | 'pending';
  };
  vacantRooms: { id: string; roomNumber: string }[];
}

export default function StudentActionModal({
  student,
  vacantRooms,
}: StudentActionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(student.roomId || '');
  const [feeStatus, setFeeStatus] = useState(student.feeStatus);
  const [loading, setLoading] = useState(false);

  const handleRoomSave = async () => {
    setLoading(true);
    // If empty string, treat as null (unassign)
    const roomId = selectedRoomId === '' ? null : selectedRoomId;
    const result = await updateStudentRoom(student.id, roomId);
    if (result.success) {
      alert('Room updated!');
      setIsOpen(false);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleFeeToggle = async () => {
    const newStatus = feeStatus === 'paid' ? 'pending' : 'paid';
    if (confirm(`Mark fee as ${newStatus}?`)) {
      setLoading(true);
      const result = await updateStudentFee(student.id, newStatus);
      if (result.success) {
        setFeeStatus(newStatus); // Update local state immediately? Or rely on revalidate
        // We should probably rely on revalidate, but local state feedback is nice.
        // Since the modal might stay open? No, fee toggle is a separate action inside modal?
        // Let's make the modal have tabs or sections.
      } else {
        alert(result.error);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-[#202225] rounded text-blue-400 transition"
        title="Manage Student"
      >
        <Edit size={16} />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Manage ${student.name}`}
      >
        <div className="space-y-6">
          {/* Room Assignment Section */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Assign Room
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {student.roomId &&
                  !vacantRooms.find((r) => r.id === student.roomId) && (
                    <option value={student.roomId} disabled>
                      Current Room (Full?)
                    </option>
                  )}
                {/* Show current room if properly passed, or just trust vacant list? 
                             Issue: If student is already in a room, it might not be in 'vacantRooms' list from parent.
                             Ideally parent passes 'allRooms' or specific list.
                             For now, let's assume 'vacantRooms' contains valid options. 
                         */}
                {vacantRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRoomSave}
                disabled={loading}
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 rounded text-sm font-medium transition disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          <div className="h-px bg-[#202225]"></div>

          {/* Fee Section */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Fee Status
              </label>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase ${
                  feeStatus === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-orange-500/10 text-orange-400'
                }`}
              >
                {feeStatus === 'paid' ? (
                  <CheckCircle size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                {feeStatus}
              </span>
            </div>
            <button
              onClick={handleFeeToggle}
              disabled={loading}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase border transition ${
                feeStatus === 'paid'
                  ? 'border-orange-500 text-orange-400 hover:bg-orange-500/10'
                  : 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              {feeStatus === 'paid' ? 'Mark Pending' : 'Mark Paid'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
