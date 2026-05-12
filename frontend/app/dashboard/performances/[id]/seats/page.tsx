'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { isManager } from '@/lib/auth';
import MedallionLogo from '@/components/MedallionLogo';

interface Seat {
  seatid: string;
  seatnumber: string;
  seatcategory: 'Orchestra' | 'Mezzanine' | 'Balcony' | 'Box';
  price: string;
  isavailable: boolean;
  ticketid?: string;
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
  const [manager, setManager] = useState(false);

  const [selected, setSelected] = useState<Seat | null>(null);
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [patronSearch, setPatronSearch] = useState('');
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');

  const [cancelSeat, setCancelSeat] = useState<Seat | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [receipt, setReceipt] = useState<{ patron: Patron; seat: Seat; performance: Performance } | null>(null);

  async function refreshSeats() {
    const updated = await apiFetch(`/api/performances/${id}/seats`);
    setSeats(updated);
  }

  useEffect(() => {
    setManager(isManager());
    Promise.all([
      apiFetch(`/api/performances/${id}/seats`),
      apiFetch('/api/performances'),
    ]).then(([seatData, perfData]) => {
      setSeats(seatData);
      const perf = perfData.find((p: Performance) => p.performanceid === id);
      if (perf) setPerformance(perf);
    }).finally(() => setLoading(false));

    const params = new URLSearchParams(window.location.search);
    const patronId = params.get('patron');
    if (patronId) {
      apiFetch(`/api/patrons/${patronId}`).then(p => {
        setSelectedPatron(p);
        setPatronSearch(`${p.firstname} ${p.lastname}`);
      }).catch(() => {});
    }
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

  function handleSeatClick(seat: Seat) {
    if (seat.isavailable) {
      setSelected(seat);
      setCancelSeat(null);
    } else if (manager) {
      setCancelSeat(seat);
      setSelected(null);
    }
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
      await refreshSeats();
    } catch (err: unknown) {
      setReserveError(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setReserving(false);
    }
  }

  async function handleCancel() {
    if (!cancelSeat?.ticketid) return;
    setCancelling(true);
    try {
      await apiFetch(`/api/tickets/${cancelSeat.ticketid}`, { method: 'DELETE' });
      setCancelSeat(null);
      await refreshSeats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel ticket');
    } finally {
      setCancelling(false);
    }
  }

  function SeatButton({ seat }: { seat: Seat | undefined }) {
    if (!seat) return <div style={{ width: 22, height: 22 }} />;
    const colors = categoryColors[seat.seatcategory];
    const isSelected = selected?.seatid === seat.seatid || cancelSeat?.seatid === seat.seatid;
    const clickable = seat.isavailable || (!seat.isavailable && manager);
    return (
      <button
        title={`${seat.seatnumber} — ${seat.isavailable ? `$${seat.price}` : `${seat.firstname} ${seat.lastname}`}`}
        onClick={() => handleSeatClick(seat)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 3,
          backgroundColor: seat.isavailable ? colors.available : colors.taken,
          border: isSelected ? '2px solid #fff' : '1px solid transparent',
          cursor: clickable ? 'pointer' : 'not-allowed',
          opacity: seat.isavailable ? 1 : (manager ? 0.7 : 0.4),
          flexShrink: 0,
        }}
      />
    );
  }

  function SeatRow({ row, leftCount, centerCount, rightCount }: { row: string; leftCount: number; centerCount: number; rightCount: number }) {
    return (
      <div className="flex items-center justify-center mb-1 relative z-10">
        <div className="flex gap-1 justify-end" style={{ width: 204 }}>
          {Array.from({ length: leftCount }, (_, i) => (
            <SeatButton key={i} seat={getSeat(row, i + 1)} />
          ))}
        </div>
        
        <span className="text-xs w-6 text-center mx-2 font-bold" style={{ color: '#9ca3af' }}>{row}</span>
        
        <div className="flex gap-1 justify-center" style={{ width: 360 }}>
          {Array.from({ length: centerCount }, (_, i) => (
            <SeatButton key={i} seat={getSeat(row, leftCount + i + 1)} />
          ))}
        </div>
        
        <span className="text-xs w-6 text-center mx-2 font-bold" style={{ color: '#9ca3af' }}>{row}</span>
        
        <div className="flex gap-1 justify-start" style={{ width: 204 }}>
          {Array.from({ length: rightCount }, (_, i) => (
            <SeatButton key={i} seat={getSeat(row, leftCount + centerCount + i + 1)} />
          ))}
        </div>
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
          {manager && <span className="ml-3 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#c9a84c22', color: '#c9a84c' }}>Click taken seats to cancel</span>}
        </p>
      </div>

      <div className="flex gap-8 flex-wrap items-start">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start justify-center gap-10" style={{ minWidth: 1050 }}>
            {/* Left Box */}
            <div className="mt-20 flex items-center gap-4">
              <div className="text-2xl font-bold tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#9ca3af' }}>BOX 1-8</div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-1"><SeatButton seat={getBoxSeat(1)} /><SeatButton seat={getBoxSeat(2)} /></div>
                <div className="flex gap-1 ml-4"><SeatButton seat={getBoxSeat(3)} /><SeatButton seat={getBoxSeat(4)} /></div>
                <div className="flex gap-1"><SeatButton seat={getBoxSeat(5)} /><SeatButton seat={getBoxSeat(6)} /></div>
                <div className="flex gap-1 ml-4"><SeatButton seat={getBoxSeat(7)} /><SeatButton seat={getBoxSeat(8)} /></div>
              </div>
            </div>

            {/* Main Seating Area */}
            <div className="flex flex-col items-center">
              {/* Stage */}
              <div className="w-full text-center text-sm py-4 mb-8 font-bold tracking-[0.5em]" style={{ backgroundColor: '#c9a84c11', color: '#c9a84c', border: '1px solid #c9a84c44', clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)' }}>
                STAGE
              </div>

              {/* ORCHESTRA */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <span className="text-5xl font-bold tracking-widest" style={{ color: '#ffffff10' }}>ORCHESTRA</span>
                </div>
                {ORCHESTRA_ROWS.map(row => <SeatRow key={row} row={row} leftCount={8} centerCount={14} rightCount={8} />)}
              </div>

              {/* MEZZANINE */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <span className="text-5xl font-bold tracking-widest" style={{ color: '#ffffff10' }}>MEZZANINE</span>
                </div>
                {MEZZANINE_ROWS.map(row => <SeatRow key={row} row={row} leftCount={8} centerCount={14} rightCount={8} />)}
              </div>

              {/* BALCONY */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <span className="text-5xl font-bold tracking-widest" style={{ color: '#ffffff10' }}>BALCONY</span>
                </div>
                {['AA', 'BB', 'CC'].map(row => <SeatRow key={row} row={row} leftCount={8} centerCount={14} rightCount={8} />)}
                <SeatRow row="DD" leftCount={7} centerCount={14} rightCount={7} />
                {['EE', 'FF'].map(row => <SeatRow key={row} row={row} leftCount={5} centerCount={14} rightCount={5} />)}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-2">
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

            {/* Right Box */}
            <div className="mt-20 flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex gap-1 ml-4"><SeatButton seat={getBoxSeat(9)} /><SeatButton seat={getBoxSeat(10)} /></div>
                <div className="flex gap-1"><SeatButton seat={getBoxSeat(11)} /><SeatButton seat={getBoxSeat(12)} /></div>
                <div className="flex gap-1 ml-4"><SeatButton seat={getBoxSeat(13)} /><SeatButton seat={getBoxSeat(14)} /></div>
                <div className="flex gap-1"><SeatButton seat={getBoxSeat(15)} /><SeatButton seat={getBoxSeat(16)} /></div>
              </div>
              <div className="text-2xl font-bold tracking-widest" style={{ writingMode: 'vertical-rl', color: '#9ca3af' }}>BOX 9-16</div>
            </div>
          </div>
        </div>

        {/* Reserve panel */}
        {selected && (
          <div className="rounded-lg p-5 flex flex-col gap-4" style={{ backgroundColor: '#16213e', border: '1px solid #c9a84c33', minWidth: 280, maxWidth: 320, height: 'fit-content' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold" style={{ color: '#fff8e7' }}>Reserve Seat</h2>
              <button onClick={() => { setSelected(null); setReserveError(''); }} style={{ color: '#9ca3af' }}><X size={16} /></button>
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

        {/* Cancel panel — manager only */}
        {cancelSeat && manager && (
          <div className="rounded-lg p-5 flex flex-col gap-4" style={{ backgroundColor: '#16213e', border: '1px solid #ef444433', minWidth: 280, maxWidth: 320, height: 'fit-content' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold" style={{ color: '#fff8e7' }}>Cancel Reservation</h2>
              <button onClick={() => setCancelSeat(null)} style={{ color: '#9ca3af' }}><X size={16} /></button>
            </div>
            <div className="text-sm flex flex-col gap-1" style={{ color: '#9ca3af' }}>
              <p>Seat: <span style={{ color: '#fff8e7' }}>{cancelSeat.seatnumber}</span></p>
              <p>Category: {cancelSeat.seatcategory}</p>
              <p>Price: ${cancelSeat.price}</p>
              <p>Reserved by: <span style={{ color: '#fff8e7' }}>{cancelSeat.firstname} {cancelSeat.lastname}</span></p>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center justify-center gap-2 py-2 rounded text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#7f1d1d', color: '#fca5a5' }}
            >
              <Trash2 size={14} />
              {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          </div>
        )}
      </div>

      {/* Will Call Receipt */}
      {receipt && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: '#000000aa' }}>
          <div className="print-area relative shadow-2xl" style={{ backgroundColor: '#fef5cc', width: '800px', maxWidth: '100%', border: '4px solid #000', padding: '40px 60px', color: '#000' }}>
            
            <button onClick={() => setReceipt(null)} className="no-print absolute top-4 right-4 hover:opacity-70" style={{ color: '#000' }}><X size={24} /></button>

            <div className="flex items-center mb-8">
              <div className="flex-shrink-0">
                <MedallionLogo size={100} />
              </div>
              <div className="flex-1 text-center -ml-10">
                <h2 className="text-xl font-bold tracking-wide">Will Call Reservation Form</h2>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Row 1 */}
              <div className="flex items-end gap-2">
                <span className="font-bold text-sm whitespace-nowrap">First Name</span>
                <div className="border-b-2 border-black flex-1 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.patron.firstname}
                </div>
                <span className="font-bold text-sm whitespace-nowrap ml-4">Last Name</span>
                <div className="border-b-2 border-black flex-1 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.patron.lastname}
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-end gap-2">
                <span className="font-bold text-sm whitespace-nowrap">Street Address</span>
                <div className="border-b-2 border-black flex-1 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.patron.streetaddress}
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-end gap-2">
                <span className="font-bold text-sm whitespace-nowrap">City</span>
                <div className="border-b-2 border-black w-48 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.patron.city}
                </div>
                <span className="font-bold text-sm whitespace-nowrap ml-2">State</span>
                <div className="border-b-2 border-black w-24 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.patron.state}
                </div>
                <span className="font-bold text-sm whitespace-nowrap ml-2">Zip</span>
                <div className="border-b-2 border-black flex-1 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.patron.zipcode}
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex items-end gap-2">
                <span className="font-bold text-sm whitespace-nowrap">Phone Number</span>
                <div className="border-b-2 border-black w-48 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.patron.phonenumber}
                </div>
                <span className="font-bold text-sm whitespace-nowrap ml-2">Email address</span>
                <div className="border-b-2 border-black flex-1 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.patron.email}
                </div>
              </div>

              <div className="h-4"></div> {/* Blank Space */}

              {/* Row 5 */}
              <div className="flex items-end gap-2">
                <span className="font-bold text-sm whitespace-nowrap">Performance</span>
                <div className="border-b-2 border-black flex-1 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.performance.productionname}
                </div>
                <span className="font-bold text-sm whitespace-nowrap ml-4">Date</span>
                <div className="border-b-2 border-black w-32 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {new Date(receipt.performance.performancedate).toLocaleDateString()}
                </div>
                <span className="font-bold text-sm whitespace-nowrap ml-4">Time</span>
                <div className="border-b-2 border-black w-32 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.performance.performancetype === 'evening' ? 'Evening' : 'Matinee'}
                </div>
              </div>

              {/* Row 6 */}
              <div className="flex items-end gap-2">
                <span className="font-bold text-sm whitespace-nowrap">Seats</span>
                <div className="border-b-2 border-black w-64 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.seat.seatnumber}
                </div>
                <div className="flex-1"></div>
              </div>

              <div className="h-6"></div> {/* Blank Space */}

              {/* Row 7 */}
              <div className="flex items-end gap-2">
                <span className="font-bold text-sm whitespace-nowrap">Total to be Collected</span>
                <div className="font-bold text-lg mx-2">$</div>
                <div className="border-b-2 border-black w-32 text-center font-bold pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontSize: '1.2rem', lineHeight: '1' }}>
                  {receipt.seat.price}
                </div>
              </div>

            </div>

            <button onClick={() => window.print()} className="no-print absolute bottom-6 right-6 px-6 py-2 rounded text-sm font-semibold" style={{ backgroundColor: '#1a1a2e', color: '#fff8e7' }}>
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
