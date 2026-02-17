'use client';

import { useState, useEffect } from 'react';
import { Plus, Shield, Trash2, Edit } from 'lucide-react';
import Modal from '@/components/ui/Modal';

// Define Types
type Warden = {
  id: string;
  name: string;
  email: string;
  floor: number | null;
};

export default function WardensPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    assignedFloor: '',
  });
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWardens();
  }, []);

  const fetchWardens = async () => {
    try {
      const res = await fetch('/api/admin/wardens'); // We need to update this API to support GET
      if (res.ok) {
        const data = await res.json();
        setWardens(data.wardens);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/wardens', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await fetchWardens(); // Refresh list
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', assignedFloor: '' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Wardens</h1>
          <p className="text-gray-400 text-sm">
            Create, assign and manage wardens
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={16} />
          Add Warden
        </button>
      </div>

      <div className="grid gap-4">
        {loading && (
          <div className="text-gray-400 text-sm">Loading wardens...</div>
        )}

        {!loading && wardens.length === 0 && (
          <div className="text-gray-400 text-sm">No wardens found.</div>
        )}

        {wardens.map((warden) => (
          <div
            key={warden.id}
            className="bg-[#2f3136] p-4 rounded-lg flex items-center justify-between shadow-sm border border-[#202225]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#202225] text-purple-400 rounded-full">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">{warden.name}</h3>
                <p className="text-xs text-gray-400">{warden.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  Floor
                </span>
                <p className="font-mono font-bold text-lg text-gray-200">
                  {warden.floor || '—'}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-[#202225] rounded text-blue-400 transition">
                  <Edit size={16} />
                </button>
                <button className="p-2 hover:bg-[#202225] rounded text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Warden"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Full Name
            </label>
            <input
              className="w-full bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Create Password
            </label>
            <input
              type="password"
              className="w-full bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Assign Floor (Optional)
            </label>
            <input
              type="number"
              className="w-full bg-[#202225] border border-transparent rounded p-2 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
              placeholder="1"
              value={formData.assignedFloor}
              onChange={(e) =>
                setFormData({ ...formData, assignedFloor: e.target.value })
              }
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2 rounded transition-colors shadow-sm"
            >
              Create Warden
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
