'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Armchair, DollarSign, TicketX } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Performance {
  performanceid: string;
  performancedate: string;
  performancetype: string;
  productionname: string;
}

interface SoldSeat {
  seatnumber: string;
  seatcategory: string;
  price: string;
  firstname: string;
  lastname: string;
}

interface ReportData {
  totalSeats: number;
  seatsSold: number;
  seatsAvailable: number;
  totalRevenue: string;
  soldSeats: SoldSeat[];
}

interface AllSeat {
  seatnumber: string;
  seatcategory: string;
  price: string;
  isavailable: boolean;
  firstname?: string;
  lastname?: string;
}

const selectStyle = {
  backgroundColor: '#0f0f23',
  border: '1px solid #c9a84c55',
  color: '#fff8e7',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '14px',
  outline: 'none',
  cursor: 'pointer',
};

export default function ReportsPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [allSeats, setAllSeats] = useState<AllSeat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch('/api/performances').then(setPerformances).catch(() => setPerformances([]));
  }, []);

  useEffect(() => {
    if (!selectedId) { setReport(null); setAllSeats([]); return; }
    setLoading(true);
    Promise.all([
      apiFetch(`/api/reports/performance/${selectedId}`),
      apiFetch(`/api/performances/${selectedId}/seats`),
    ]).then(([reportData, seatData]) => {
      setReport(reportData);
      setAllSeats(seatData);
    }).catch(() => {
      setReport(null);
      setAllSeats([]);
    }).finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Seat availability by performance</p>
        </div>
        <Link
          href="/dashboard/reports/patron"
          className="px-4 py-2 rounded text-sm"
          style={{ backgroundColor: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44' }}
        >
          Patron Ticket Report →
        </Link>
      </div>

      <div className="mb-6">
        <label className="text-sm block mb-2" style={{ color: '#9ca3af' }}>Select Performance</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ ...selectStyle, minWidth: 360 }}>
          <option value="">— Choose a performance —</option>
          {performances.map(p => (
            <option key={p.performanceid} value={p.performanceid}>
              {p.productionname} — {new Date(p.performancedate).toLocaleDateString()} ({p.performancetype})
            </option>
          ))}
        </select>
      </div>

      {loading && <p style={{ color: '#9ca3af' }}>Loading report...</p>}

      {report && !loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { icon: Armchair, label: 'Total Seats', value: report.totalSeats },
              { icon: TicketX, label: 'Seats Sold', value: report.seatsSold },
              { icon: TrendingUp, label: 'Available', value: report.seatsAvailable },
              { icon: DollarSign, label: 'Revenue', value: `$${report.totalRevenue}` },
            ].map(card => (
              <div key={card.label} className="rounded-lg p-4 flex flex-col gap-2" style={{ backgroundColor: '#16213e', border: '1px solid #c9a84c22' }}>
                <card.icon size={18} color="#c9a84c" />
                <p className="text-xl font-bold" style={{ color: '#c9a84c' }}>{card.value}</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Full seat table */}
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #c9a84c22' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#0f0f23' }}>
                  {['Seat', 'Category', 'Price', 'Status', 'Patron'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#c9a84c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSeats.map((s, i) => (
                  <tr key={s.seatnumber} style={{ backgroundColor: i % 2 === 0 ? '#16213e' : '#1a1a2e', borderTop: '1px solid #c9a84c11' }}>
                    <td className="px-4 py-2 font-mono text-xs" style={{ color: '#fff8e7' }}>{s.seatnumber}</td>
                    <td className="px-4 py-2" style={{ color: '#9ca3af' }}>{s.seatcategory}</td>
                    <td className="px-4 py-2" style={{ color: '#9ca3af' }}>${s.price}</td>
                    <td className="px-4 py-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: s.isavailable ? '#14532d' : '#7f1d1d',
                          color: s.isavailable ? '#4ade80' : '#f87171',
                        }}
                      >
                        {s.isavailable ? 'Available' : 'Sold'}
                      </span>
                    </td>
                    <td className="px-4 py-2" style={{ color: '#9ca3af' }}>
                      {!s.isavailable && s.firstname ? `${s.firstname} ${s.lastname}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
