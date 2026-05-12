'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Production {
  productionid: string;
  productionname: string;
  productiontype: string;
}

export default function ProductionsPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/productions')
      .then(setProductions)
      .catch(() => setProductions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Productions</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{productions.length} productions</p>
        </div>
        <Link
          href="/dashboard/productions/new"
          className="px-4 py-2 rounded text-sm font-semibold"
          style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
        >
          + New Production
        </Link>
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #c9a84c22' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#0f0f23' }}>
              {['Production Name', 'Type', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#c9a84c' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center" style={{ color: '#9ca3af' }}>Loading...</td></tr>
            ) : productions.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center" style={{ color: '#9ca3af' }}>No productions yet</td></tr>
            ) : productions.map((p, i) => (
              <tr key={p.productionid} style={{ backgroundColor: i % 2 === 0 ? '#16213e' : '#1a1a2e', borderTop: '1px solid #c9a84c11' }}>
                <td className="px-4 py-3" style={{ color: '#fff8e7' }}>{p.productionname}</td>
                <td className="px-4 py-3 capitalize" style={{ color: '#9ca3af' }}>{p.productiontype}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/productions/${p.productionid}`}
                    className="text-xs px-3 py-1 rounded"
                    style={{ backgroundColor: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44' }}
                  >
                    Edit
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
