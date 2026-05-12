'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Map } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { isManager } from '@/lib/auth';

interface Performance {
  performanceid: string;
  performancedate: string;
  performancetype: string;
  productionname: string;
  productiontype: string;
}

export default function PerformancesPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState(false);

  useEffect(() => {
    setManager(isManager());
    apiFetch('/api/performances')
      .then(setPerformances)
      .catch(() => setPerformances([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Performances</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{performances.length} scheduled</p>
        </div>
        {manager && (
          <Link
            href="/dashboard/performances/new"
            className="px-4 py-2 rounded text-sm font-semibold"
            style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
          >
            + New Performance
          </Link>
        )}
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #c9a84c22' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#0f0f23' }}>
              {['Production', 'Date', 'Time', 'Type', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#c9a84c' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: '#9ca3af' }}>Loading...</td></tr>
            ) : performances.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: '#9ca3af' }}>No performances scheduled</td></tr>
            ) : performances.map((p, i) => (
              <tr key={p.performanceid} style={{ backgroundColor: i % 2 === 0 ? '#16213e' : '#1a1a2e', borderTop: '1px solid #c9a84c11' }}>
                <td className="px-4 py-3" style={{ color: '#fff8e7' }}>{p.productionname}</td>
                <td className="px-4 py-3" style={{ color: '#9ca3af' }}>
                  {new Date(p.performancedate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3" style={{ color: '#9ca3af' }}>
                  {new Date(p.performancedate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3 capitalize" style={{ color: '#9ca3af' }}>{p.performancetype}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/performances/${p.performanceid}/seats`}
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded w-fit"
                    style={{ backgroundColor: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44' }}
                  >
                    <Map size={12} />
                    Seat Map
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
