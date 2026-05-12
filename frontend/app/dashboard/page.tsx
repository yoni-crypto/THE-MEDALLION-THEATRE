'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Theater, CalendarDays, Ticket, ClipboardList } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Stats {
  totalPatrons: number;
  totalProductions: number;
  totalPerformances: number;
  ticketsSoldToday: number;
  ticketsSoldTotal: number;
}

function StatCard({ icon: Icon, label, value, href }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  href?: string;
}) {
  const content = (
    <div className="rounded-lg p-6 flex flex-col gap-2" style={{ backgroundColor: '#16213e', border: '1px solid #c9a84c22' }}>
      <Icon size={22} color="#c9a84c" />
      <p className="text-3xl font-bold" style={{ color: '#c9a84c' }}>{value}</p>
      <p className="text-sm" style={{ color: '#9ca3af' }}>{label}</p>
    </div>
  );
  if (href) return <Link href={href} className="hover:opacity-80 transition-opacity">{content}</Link>;
  return content;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/stats').then(setStats).catch(() => setError('Failed to load stats'));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Medallion Theatre — Ticket Sales Overview</p>
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <div className="grid grid-cols-2 gap-4 mb-10" style={{ maxWidth: '640px' }}>
        <StatCard icon={Users} label="Total Patrons" value={stats?.totalPatrons ?? '—'} href="/dashboard/patrons" />
        <StatCard icon={Theater} label="Productions" value={stats?.totalProductions ?? '—'} href="/dashboard/productions" />
        <StatCard icon={CalendarDays} label="Performances" value={stats?.totalPerformances ?? '—'} href="/dashboard/performances" />
        <StatCard icon={Ticket} label="Tickets Sold Today" value={stats?.ticketsSoldToday ?? '—'} />
        <StatCard icon={ClipboardList} label="Total Tickets Sold" value={stats?.ticketsSoldTotal ?? '—'} href="/dashboard/reports" />
      </div>
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: '#9ca3af' }}>Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/dashboard/patrons/new', label: 'Register Patron' },
            { href: '/dashboard/tickets/new', label: 'Reserve Ticket' },
            { href: '/dashboard/performances', label: 'View Seat Map' },
            { href: '/dashboard/reports', label: 'View Reports' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="px-4 py-2 rounded text-sm hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44' }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
