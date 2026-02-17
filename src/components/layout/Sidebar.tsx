'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  FileText,
  LogOut,
  Shield,
  User,
} from 'lucide-react';

export default function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Force full reload to clear any client-side state/cache
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const menuItems = [
    {
      role: 'admin',
      items: [
        { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
        { label: 'Students', icon: Users, href: '/admin/students' },
        { label: 'Wardens', icon: Shield, href: '/admin/wardens' },
        { label: 'Rooms', icon: DoorOpen, href: '/admin/rooms' },
        { label: 'Complaints', icon: FileText, href: '/admin/complaints' },
      ],
    },
    {
      role: 'warden',
      items: [
        { label: 'My Floor', icon: LayoutDashboard, href: '/warden' },
        { label: 'Students', icon: Users, href: '/warden/students' },
        { label: 'Complaints', icon: FileText, href: '/warden/complaints' },
      ],
    },
    {
      role: 'student',
      items: [
        { label: 'My Profile', icon: User, href: '/student' },
        { label: 'Complaints', icon: FileText, href: '/student/complaints' },
      ],
    },
  ];

  const currentMenu = menuItems.find((m) => m.role === userRole)?.items || [];

  return (
    <aside className="w-64 bg-[#2f3136] h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-4 border-b border-[#202225] shadow-sm">
        <h1 className="text-xl font-bold text-white tracking-wide">HostelMS</h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold">
          {userRole} Panel
        </p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {currentMenu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors group ${
                isActive
                  ? 'bg-[#40444b] text-white'
                  : 'text-[#b9bbbe] hover:bg-[#393c43] hover:text-gray-200'
              }`}
            >
              <item.icon
                size={20}
                className={
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-300'
                }
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 bg-[#292b2f]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-[#393c43] rounded transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
