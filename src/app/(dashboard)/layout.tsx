import Sidebar from '@/components/layout/Sidebar';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const role = session.role as string;

  return (
    <div className="flex min-h-screen bg-[#36393f] text-gray-200">
      <Sidebar userRole={role} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
