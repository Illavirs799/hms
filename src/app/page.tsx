import Link from 'next/link';
import { Shield, Smartphone, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#36393f] text-gray-200">
      {/* Navbar */}
      <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="text-xl font-bold text-white tracking-wide">
          HostelMS
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-5 py-2 rounded text-sm font-medium text-white hover:underline transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm font-medium transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-4xl space-y-6">
          <div className="inline-block px-3 py-1 rounded bg-[#2f3136] text-[#b9bbbe] text-xs font-bold uppercase tracking-widest mb-4">
            ✨ Next-Gen Management
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white pb-2">
            Manage Your Hostel With <br />{' '}
            <span className="text-[#5865f2]">Confidence</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A premium, role-based solution for Admins, Wardens, and Students.
            Experience seamless room allocation, fee management, and complaint
            resolution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/login"
              className="px-8 py-3 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium text-lg transition shadow-md"
            >
              Access Dashboard
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 rounded bg-[#2f3136] hover:bg-[#34373c] text-white font-medium text-lg transition shadow-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-32 px-4">
          {[
            {
              icon: Shield,
              title: 'Role-Based Security',
              description:
                'Secure access for Admins, Wardens, and Students with dedicated portals.',
            },
            {
              icon: Zap,
              title: 'Real-time Updates',
              description:
                'Instant notifications for room allocation, fee status, and complaints.',
            },
            {
              icon: Smartphone,
              title: 'Modern Interface',
              description:
                'Beautiful, responsive slate design that works on any device.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-[#2f3136] p-8 rounded-lg hover:bg-[#34373c] transition duration-200 border-l-4 border-transparent hover:border-[#5865f2] text-left shadow-sm"
            >
              <div className="w-10 h-10 rounded bg-[#5865f2]/10 flex items-center justify-center text-[#5865f2] mb-4">
                <feature.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="p-8 text-center text-gray-500 text-xs border-t border-[#202225] mt-20">
        © 2024 Hostel Management System. All rights reserved.
      </footer>
    </div>
  );
}
