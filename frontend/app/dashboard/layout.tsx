'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Theater, CalendarDays, Ticket, BarChart2, LogOut } from 'lucide-react';
import { isAuthenticated, getUser, logout, isManager } from '@/lib/auth';
import MedallionLogo from '@/components/MedallionLogo';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, managerOnly: false },
  { href: '/dashboard/patrons', label: 'Patrons', icon: Users, managerOnly: false },
  { href: '/dashboard/productions', label: 'Productions', icon: Theater, managerOnly: true },
  { href: '/dashboard/performances', label: 'Performances', icon: CalendarDays, managerOnly: false },
  { href: '/dashboard/tickets/new', label: 'Reserve Ticket', icon: Ticket, managerOnly: false },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart2, managerOnly: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [manager, setManager] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const user = getUser();
    if (user) {
      setUsername(user.username);
      setRole(user.role);
      setManager(isManager());
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p style={{ color: '#c9a84c' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#1a1a2e' }}>
      <aside className="flex flex-col w-56 shrink-0 py-6 px-4" style={{ backgroundColor: '#0f0f23', borderRight: '1px solid #c9a84c22' }}>
        <div className="flex flex-col items-center mb-8">
          <MedallionLogo size={72} />
          <p className="mt-2 text-xs tracking-widest text-center" style={{ color: '#c9a84c' }}>MEDALLION THEATRE</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navLinks.map(link => {
            if (link.managerOnly && !manager) return null;
            const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors"
                style={{
                  backgroundColor: active ? '#c9a84c22' : 'transparent',
                  color: active ? '#c9a84c' : '#9ca3af',
                  borderLeft: active ? '2px solid #c9a84c' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #c9a84c22' }}>
          <p className="text-xs px-3 mb-1" style={{ color: '#fff8e7' }}>{username}</p>
          <p className="text-xs px-3 mb-3 capitalize" style={{ color: '#c9a84c' }}>{role}</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-red-900/30"
            style={{ color: '#9ca3af' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
