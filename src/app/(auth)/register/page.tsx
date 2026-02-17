'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    registerNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#36393f] p-4 text-gray-200">
      <div className="w-full max-w-md bg-[#2f3136] p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Create an Account
          </h1>
          <p className="text-gray-400 text-sm">
            Join the hostel management portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                className="w-full bg-[#202225] border border-transparent rounded p-2 pl-10 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="email"
                className="w-full bg-[#202225] border border-transparent rounded p-2 pl-10 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Register Number
            </label>
            <div className="relative">
              <BookOpen
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="e.g. 22BQ1A05G0"
                className="w-full bg-[#202225] border border-transparent rounded p-2 pl-10 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
                required
                value={formData.registerNumber}
                onChange={(e) =>
                  setFormData({ ...formData, registerNumber: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="password"
                className="w-full bg-[#202225] border border-transparent rounded p-2 pl-10 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2 rounded transition-colors mt-6"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-400 text-xs">
              Already have an account?{' '}
            </span>
            <Link
              href="/login"
              className="text-[#00aff4] hover:underline text-xs"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
