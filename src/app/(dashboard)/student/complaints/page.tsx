'use client';

import { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle } from 'lucide-react';
import {
  createComplaint,
  getStudentComplaints,
} from '@/app/actions/complaints';

type Complaint = {
  id: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
  resolvedAt: Date | null;
};

export default function StudentComplaintsPage() {
  const [complaintText, setComplaintText] = useState('');
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    const data = await getStudentComplaints();
    // @ts-ignore - Date serialization mismatch from server action, simplified for demo
    setComplaints(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setLoading(true);
    const result = await createComplaint(complaintText);
    if (result.success) {
      setComplaintText('');
      await loadComplaints();
    } else {
      alert('Failed to submit');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Complaints</h1>
        <p className="text-gray-400 text-sm">
          Report issues regarding your room or hostel
        </p>
      </div>

      {/* Submit Form */}
      <div className="bg-[#2f3136] p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-white mb-4">New Complaint</h2>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            className="flex-1 bg-[#202225] border border-transparent rounded p-3 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
            placeholder="Describe your issue..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded font-medium flex items-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            <Send size={18} />
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">History</h2>
        <div className="bg-[#2f3136] rounded-lg overflow-hidden divide-y divide-[#202225] shadow-sm">
          {complaints.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No complaints found.
            </div>
          )}
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-4 flex items-center justify-between hover:bg-[#34373c] transition-colors"
            >
              <div>
                <p className="font-medium text-gray-200">{c.description}</p>
                <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wide">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold flex items-center gap-1.5 border ${
                  c.status === 'resolved'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                }`}
              >
                {c.status === 'resolved' ? (
                  <CheckCircle size={12} />
                ) : (
                  <Clock size={12} />
                )}
                <span className="capitalize">{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
