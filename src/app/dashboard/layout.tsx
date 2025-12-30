'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, LogOut, Menu, X, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trialInfo, setTrialInfo] = useState<{days: number, isPaid: boolean} | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    // Basic auth check & Trial Info
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                     const end = new Date(data.user.trialEndsAt);
                     const now = new Date();
                     const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                     setTrialInfo({ days: diff, isPaid: data.user.isPaid });
                }
            } else {
                router.push('/login');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUserLoading(false);
        }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: PlusCircle, label: 'New Analysis', href: '/dashboard/new' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col fixed h-full z-20`}
      >
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              InsightBoard
            </h1>
          ) : (
            <span className="text-xl font-bold text-blue-500 mx-auto">IB</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-3 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        } p-8`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Trial Banner */}
          {!userLoading && trialInfo && !trialInfo.isPaid && (
             <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${
                 trialInfo.days <= 5 ? 'bg-orange-500/10 border border-orange-500/20 text-orange-500' : 'bg-blue-600/10 border border-blue-600/20 text-blue-400'
             }`}>
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${trialInfo.days <= 5 ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                   <span className="font-medium">
                     {trialInfo.days <= 0 ? 'Trial Expired' : `Trial ends in ${trialInfo.days} days`}
                   </span>
                </div>
                <Link href="/pricing" className={`text-sm font-semibold hover:underline ${trialInfo.days <= 5 ? 'text-orange-500' : 'text-blue-400'}`}>
                   Upgrade Now &rarr;
                </Link>
             </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
