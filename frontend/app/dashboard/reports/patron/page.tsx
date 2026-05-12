'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Ticket {
  ticketid: string;
  seatnumber: string;
  seatcategory: string;
  price: string;
  performancedate: string;
  performancetype: string;
  productionname: string;
}

interface PatronResult {
  patron: {
    patronid: string;
    firstname: string;
    lastname: string;
    email: string;
    phonenumber: string;
  };
  tickets: Ticket[];
}

export default function PatronReportPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatronResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      apiFetch(`/api/reports/patron/search?name=${encodeURIComponent(query)}`)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Patron Ticket Report</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Search a patron to view their ticket history</p>
        </div>
        <Link
          href="/dashboard/reports"
          className="px-4 py-2 rounded text-sm"
          style={{ backgroundColor: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44' }}
        >
          ← Seat Availability Report
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search patron by name..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="mb-6 px-3 py-2 rounded text-sm outline-none"
        style={{
          backgroundColor: '#16213e',
          border: '1px solid #c9a84c33',
          color: '#fff8e7',
          width: '100%',
          maxWidth: 400,
        }}
      />

      {loading && <p style={{ color: '#9ca3af' }}>Searching...</p>}

      {!loading && query.trim() && results.length === 0 && (
        <p style={{ color: '#9ca3af' }}>No patrons found.</p>
      )}

      <div className="flex flex-col gap-3">
        {results.map(({ patron, tickets }) => {
          const isOpen = expanded === patron.patronid;
          return (
            <div key={patron.patronid} className="rounded-lg overflow-hidden" style={{ border: '1px solid #c9a84c22' }}>
              {/* Patron header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : patron.patronid)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                style={{ backgroundColor: '#16213e' }}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: '#fff8e7' }}>
                    {patron.firstname} {patron.lastname}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                    {patron.email} · {patron.phonenumber || 'No phone'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#c9a84c22', color: '#c9a84c' }}>
                    {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                  </span>
                  {isOpen ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                </div>
              </button>

              {/* Ticket table */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #c9a84c22' }}>
                  {tickets.length === 0 ? (
                    <p className="px-5 py-4 text-sm" style={{ color: '#9ca3af' }}>No tickets found for this patron.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: '#0f0f23' }}>
                          {['Production', 'Date', 'Time', 'Seat', 'Category', 'Price'].map(h => (
                            <th key={h} className="text-left px-4 py-2 font-medium text-xs" style={{ color: '#c9a84c' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((t, i) => (
                          <tr key={t.ticketid} style={{ backgroundColor: i % 2 === 0 ? '#1a1a2e' : '#16213e', borderTop: '1px solid #c9a84c11' }}>
                            <td className="px-4 py-2" style={{ color: '#fff8e7' }}>{t.productionname}</td>
                            <td className="px-4 py-2" style={{ color: '#9ca3af' }}>{new Date(t.performancedate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 capitalize" style={{ color: '#9ca3af' }}>{t.performancetype}</td>
                            <td className="px-4 py-2 font-mono text-xs" style={{ color: '#fff8e7' }}>{t.seatnumber}</td>
                            <td className="px-4 py-2" style={{ color: '#9ca3af' }}>{t.seatcategory}</td>
                            <td className="px-4 py-2" style={{ color: '#c9a84c' }}>${t.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
