'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Seat {
  seatid: string;
  seatnumber: string;
  seatcategory: 'Orchestra' | 'Mezzanine' | 'Balcony' | 'Box';
  price: string;
  isavailable: boolean;
  firstname?: string;
  lastname?: string;
}

interface Patron {
  patronid: string;
  firstname: string;
  lastname: string;
  email: string;
  streetaddress: string;
  city: string;
  state: string;
  zipcode: string;
  phonenumber: string;
}

interface Performance {
  performanceid: string;
  performancedate: string;
  performancetype: string;
  productionname: string;
}

const categoryColors: Record<string, { available: string; taken: string; label: string }> = {
  Orchestra: { available: '#3b82f6', taken: '#1e3a5f', label: 'Orchestra — $65' },
  Mezzanine: { available: '#f97316', taken: '#7c3a10', label: 'Mezzanine — $55' },
  Balcony:   { available: '#22c55e', taken: '#14532d', label: 'Balcony — $40' },
  Box:       { available: '#c9a84c', taken: '#5c4a1e', label: 'Box — $85' },
};

const ORCHESTRA_ROWS = ['A','B','C','D','E','F'];
const MEZZANINE_ROWS = ['G','H','I','J','K','L','M','N'];
const BALCONY_ROWS   = ['AA','BB','CC','DD','EE','FF'];
const BALCONY_COUNTS: Record<string, number> = { AA:30, BB:30, CC:30, DD:28, EE:24, FF:24 };

export default function SeatMapPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Seat | null>(null);
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [patronSearch, setPatronSearch] = useState('');
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [receipt, setReceipt] = useState<{ patron: Patron; seat: Seat; performance: Performance } | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/performances/${id}/seats`),
      apiFetch('/api/performances'),
    ]).then(([seatData, perfData]) => {
      setSeats(seatData);
      const perf = perfData.find((p: Performance) => p.performanceid === id);
      if (perf) setPerformance(perf);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!patronSearch.trim()) { setPatrons([]); return; }
    const t = setTimeout(() => {
      apiFetch(`/api/patrons/search?q=${encodeURIComponent(patronSearch)}`).then(setPatrons).catch(() => setPatrons([]));
    }, 300);
    return () => clearTimeout(t);
  }, [patronSearch]);

  function getSeat(row: string, num: number) {
    return seats.find(s => s.seatnumber === `${row}${num}`);
  }

  function getBoxSeat(num: number) {
    return seats.find(s => s.seatnumber === `X${num}`);
  }

  async function handleReserve() {
    if (!selected || !selectedPatron) return;
    setReserveError('');
    setReserving(true);
    try {
      await apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ patronid: selectedPatron.patronid, performanceid: id, seatid: selected.seatid }),
      });
      setReceipt({ patron: selectedPatron, seat: selected, performance: performance! });
      setSelected(null);
      setSelectedPatron(null);
      setPatronSearch('');
      const updated = await apiFetch(`/api/performances/${id}/seats`);
      setSeats(updated);
    } catch (err: unknown) {
      setReserveError(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setReserving(false);
    }
  }

  function SeatButton({ seat }: { seat: Seat | undefined }) {
    if (!seat) return <div style={{ width: 22, height: 22 }} />;
    const colors = categoryColors[seat.seatcategory];
    return (
      <button
        title={`${seat.seatnumber} — ${seat.isavailable ? `$${seat.price}` : `${seat.firstname} ${seat.lastname}`}`}
        onClick={() => seat.isavailable && setSelected(seat)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 3,
          backgroundColor: seat.isavailable ? colors.available : colors.taken,
          border: selected?.seatid === seat.seatid ? '2px solid #fff' : '1px solid transparent',
          cursor: seat.isavailable ? 'pointer' : 'not-allowed',
          opacity: seat.isavailable ? 1 : 0.5,
          flexShrink: 0,
        }}
      />
    );
  }

  function SeatRow({ row, count }: { row: string; count: number }) {
    return (
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs w-6 text-right mr-1" style={{ color: '#9ca3af' }}>{row}</span>
        {Array.from({ length: count }, (_, i) => (
          <SeatButton key={i} seat={getSeat(row, i + 1)} />
        ))}
      </div>
    );
  }

  if (loading) return <p style={{ color: '#9ca3af' }}>Loading seat map...</p>;

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm mb-3 flex items-center gap-1" style={{ color: '#9ca3af' }}>
          ← Back
        </button>
        <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>
          {performance?.productionname} — Seat Map
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
          {performance && new Date(performance.performancedate).toLocaleDateString()} · {performance?.performancetype}
        </p>
      </div>

      <div className="flex gap-8 flex-wrap">
        {/* Seat map */}
        <div>
          {/* Stage */}
          <div className="text-center text-xs py-2 mb-4 rounded" style={{ backgroundColor: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44', width: 700 }}>
            STAGE
          </div>

          {/* Orchestra + Box */}
          <div className="flex gap-3 mb-4">
            {/* Box left X1-X8 */}
            <div className="flex flex-col gap-1 justify-center">
              <p className="text-xs mb-1 text-center" style={{ color: '#c9a84c' }}>BOX<br/>1-8</p>
              {Array.from({ length: 8 }, (_, i) => (
                <SeatButton key={i} seat={getBoxSeat(i + 1)} />
              ))}
            </div>

            {/* Orchestra rows A-F */}
            <div>
              {ORCHESTRA_ROWS.map(row => <SeatRow key={row} row={row} count={30} />)}
            </div>

            {/* Box right X9-X16 */}
            <div className="flex flex-col gap-1 justify-center">
              <p className="text-xs mb-1 text-center" style={{ color: '#c9a84c' }}>BOX<br/>9-16</p>
              {Array.from({ length: 8 }, (_, i) => (
                <SeatButton key={i} seat={getBoxSeat(i + 9)} />
              ))}
            </div>
          </div>

          {/* Mezzanine rows G-N */}
          <div className="mb-4">
            {MEZZANINE_ROWS.map(row => <SeatRow key={row} row={row} count={30} />)}
          </div>

          {/* Balcony rows AA-FF */}
          <div>
            {BALCONY_ROWS.map(row => <SeatRow key={row} row={row} count={BALCONY_COUNTS[row]} />)}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6">
            {Object.entries(categoryColors).map(([cat, colors]) => (
              <div key={cat} className="flex items-center gap-2">
                <div style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: colors.available }} />
                <span className="text-xs" style={{ color: '#9ca3af' }}>{colors.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: '#374151' }} />
              <span className="text-xs" style={{ color: '#9ca3af' }}>Taken</span>
            </div>
          </div>
        </div>

        {/* Reservation panel */}
        {selected && (
          <div className="rounded-lg p-5 flex flex-col gap-4" style={{ backgroundColor: '#16213e', border: '1px solid #c9a84c33', minWidth: 280, maxWidth: 320, height: 'fit-content' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold" style={{ color: '#fff8e7' }}>Reserve Seat</h2>
              <button onClick={() => { setSelected(null); setReserveError(''); }} style={{ color: '#9ca3af' }}>
                <X size={16} />
              </button>
            </div>
            <div className="text-sm" style={{ color: '#9ca3af' }}>
              <p>Seat: <span style={{ color: '#c9a84c' }}>{selected.seatnumber}</span></p>
              <p>Category: {selected.seatcategory}</p>
              <p>Price: <span style={{ color: '#c9a84c' }}>${selected.price}</span></p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm" style={{ color: '#9ca3af' }}>Search Patron</label>
              <input
                type="text"
                placeholder="Type name..."
                value={patronSearch}
                onChange={e => { setPatronSearch(e.target.value); setSelectedPatron(null); }}
                className="px-3 py-2 rounded text-sm outline-none"
                style={{ backgroundColor: '#0f0f23', border: '1px solid #c9a84c55', color: '#fff8e7' }}
              />
              {patrons.length > 0 && !selectedPatron && (
                <div className="rounded overflow-hidden" style={{ border: '1px solid #c9a84c22', maxHeight: 160, overflowY: 'auto' }}>
                  {patrons.map(p => (
                    <button
                      key={p.patronid}
                      onClick={() => { setSelectedPatron(p); setPatronSearch(`${p.firstname} ${p.lastname}`); setPatrons([]); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                      style={{ color: '#fff8e7', borderBottom: '1px solid #c9a84c11' }}
                    >
                      {p.firstname} {p.lastname} — {p.email}
                    </button>
                  ))}
                </div>
              )}
              {selectedPatron && (
                <p className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#c9a84c22', color: '#c9a84c' }}>
                  Selected: {selectedPatron.firstname} {selectedPatron.lastname}
                </p>
              )}
            </div>
            {reserveError && <p className="text-sm text-red-400">{reserveError}</p>}
            <button
              onClick={handleReserve}
              disabled={!selectedPatron || reserving}
              className="py-2 rounded text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
            >
              {reserving ? 'Reserving...' : 'Confirm Reservation'}
            </button>
          </div>
        )}
      </div>

      {/* Will Call Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: '#000000aa' }}>
          <div className="print-area rounded-lg p-8 max-w-md w-full" style={{ backgroundColor: '#fffde7', color: '#1a1a2e' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Will Call Reservation Form</h2>
              <button onClick={() => setReceipt(null)} className="no-print" style={{ color: '#9ca3af' }}>
                <X size={18} />
              </button>
            </div>
            <div className="text-sm flex flex-col gap-1 mb-4">
              <p><strong>First Name:</strong> {receipt.patron.firstname} &nbsp; <strong>Last Name:</strong> {receipt.patron.lastname}</p>
              <p><strong>Street Address:</strong> {receipt.patron.streetaddress}</p>
              <p><strong>City:</strong> {receipt.patron.city} &nbsp; <strong>State:</strong> {receipt.patron.state} &nbsp; <strong>Zip:</strong> {receipt.patron.zipcode}</p>
              <p><strong>Phone:</strong> {receipt.patron.phonenumber} &nbsp; <strong>Email:</strong> {receipt.patron.email}</p>
            </div>
            <div className="text-sm flex flex-col gap-1 mb-4" style={{ borderTop: '1px solid #c9a84c', paddingTop: 12 }}>
              <p><strong>Performance:</strong> {receipt.performance.productionname}</p>
              <p><strong>Date:</strong> {new Date(receipt.performance.performancedate).toLocaleDateString()} &nbsp; <strong>Time:</strong> {receipt.performance.performancetype}</p>
              <p><strong>Seat:</strong> {receipt.seat.seatnumber} ({receipt.seat.seatcategory})</p>
            </div>
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid #c9a84c', paddingTop: 12 }}>
              <p className="font-bold">Total to be Collected: <span style={{ color: '#c9a84c' }}>${receipt.seat.price}</span></p>
              <button
                onClick={() => window.print()}
                className="no-print px-4 py-1 rounded text-sm font-semibold"
                style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
