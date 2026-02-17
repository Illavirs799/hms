'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { updateStudentProfile } from '@/app/actions/student';
import { Edit } from 'lucide-react';

export default function EditProfileModal({
  currentName,
}: {
  currentName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateStudentProfile(name);
    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 text-[#00aff4] text-xs font-bold hover:underline uppercase flex items-center gap-1"
      >
        Edit Profile
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2 rounded transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
