'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Patron {
  patronid: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  city: string;
  state: string;
}

export default function PatronsPage() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatrons = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const url = q.trim() ? `/api/patrons/search?q=${encodeURIComponent(q)}` : '/api/patrons';
      setPatrons(await apiFetch(url));
    } catch {
      setPatrons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchPatrons(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchPatrons]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Patrons</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{patrons.length} records</p>
        </div>
        <Link
          href="/dashboard/patrons/new"
          className="px-4 py-2 rounded text-sm font-semibold"
          style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
        >
          + Register Patron
        </Link>
      </div>
      <input
        type="text"
        placeholder="Search by name or patron ID..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="mb-4 px-3 py-2 rounded text-sm w-full outline-none"
        style={{ backgroundColor: '#16213e', border: '1px solid #c9a84c33', color: '#fff8e7', maxWidth: '400px' }}
      />
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #c9a84c22' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#0f0f23' }}>
              {['Name', 'Email', 'Phone', 'City / State', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#c9a84c' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: '#9ca3af' }}>Loading...</td></tr>
            ) : patrons.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: '#9ca3af' }}>No patrons found</td></tr>
            ) : patrons.map((p, i) => (
              <tr key={p.patronid} style={{ backgroundColor: i % 2 === 0 ? '#16213e' : '#1a1a2e', borderTop: '1px solid #c9a84c11' }}>
                <td className="px-4 py-3" style={{ color: '#fff8e7' }}>{p.firstname} {p.lastname}</td>
                <td className="px-4 py-3" style={{ color: '#9ca3af' }}>{p.email}</td>
                <td className="px-4 py-3" style={{ color: '#9ca3af' }}>{p.phonenumber || '—'}</td>
                <td className="px-4 py-3" style={{ color: '#9ca3af' }}>{[p.city, p.state].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/patrons/${p.patronid}`}
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
