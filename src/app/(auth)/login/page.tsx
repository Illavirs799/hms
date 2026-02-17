'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, // We handle redirect manually to force reload or check response
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // Login successful - the middleware or client-side logic will handle redirect
        // But since we set redirect:false, we need to manually reload or push.
        // A hard reload is safest to clear stale client state.
        window.location.href = '/';
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
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
