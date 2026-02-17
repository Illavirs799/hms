'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Shield, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#36393f] p-4 text-gray-200">
      <div className="w-full max-w-md bg-[#2f3136] p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-gray-400 text-sm">
            We're so excited to see you again!
          </p>
        </div>

        {/* Role Selection - Tab style */}
        <div className="flex bg-[#202225] p-1 rounded mb-6 select-none">
          {['student', 'warden', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-1.5 text-xs font-bold uppercase rounded transition-colors ${
                role === r
                  ? 'bg-[#40444b] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                className="w-full bg-[#202225] border border-transparent rounded p-2.5 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
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
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full bg-[#202225] border border-transparent rounded p-2.5 text-white focus:outline-none focus:border-[#5865f2] transition-colors"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="text-right mt-1">
              <a href="#" className="text-xs text-[#00aff4] hover:underline">
                Forgot your password?
              </a>
            </div>
          </div>

          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2.5 rounded transition-colors mt-4"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-400 text-xs">Need an account? </span>
            <Link
              href="/register"
              className="text-[#00aff4] hover:underline text-xs"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
