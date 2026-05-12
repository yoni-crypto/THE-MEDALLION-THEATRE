'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Patron {
  patronid: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface Performance {
  performanceid: string;
  performancedate: string;
  performancetype: string;
  productionname: string;
}

const inputStyle = {
  backgroundColor: '#0f0f23',
  border: '1px solid #c9a84c55',
  color: '#fff8e7',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
};

export default function ReserveTicketPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [patronSearch, setPatronSearch] = useState('');
  const [patronResults, setPatronResults] = useState<Patron[]>([]);
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null);

  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  useEffect(() => {
    if (!patronSearch.trim()) { setPatronResults([]); return; }
    const t = setTimeout(() => {
      apiFetch(`/api/patrons/search?q=${encodeURIComponent(patronSearch)}`)
        .then(setPatronResults)
        .catch(() => setPatronResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [patronSearch]);

  useEffect(() => {
    if (step === 2) {
      apiFetch('/api/performances').then(setPerformances).catch(() => setPerformances([]));
    }
  }, [step]);

  function selectPatron(p: Patron) {
    setSelectedPatron(p);
    setPatronSearch(`${p.firstname} ${p.lastname}`);
    setPatronResults([]);
    setStep(2);
  }

  function selectPerformance(p: Performance) {
    setSelectedPerformance(p);
    setStep(3);
  }

  function goToSeatMap() {
    if (selectedPerformance) {
      router.push(`/dashboard/performances/${selectedPerformance.performanceid}/seats`);
    }
  }

  const steps = ['Select Patron', 'Select Performance', 'Choose Seat'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Reserve Ticket</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Follow the steps to reserve a seat</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((label, i) => {
          const num = i + 1;
          const done = step > num;
          const active = step === num;
          return (
            <div key={num} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: done ? '#c9a84c' : active ? '#c9a84c22' : '#16213e',
                    border: active ? '2px solid #c9a84c' : done ? 'none' : '1px solid #c9a84c33',
                    color: done ? '#1a1a2e' : active ? '#c9a84c' : '#9ca3af',
                  }}
                >
                  {done ? <Check size={12} /> : num}
                </div>
                <span className="text-sm" style={{ color: active ? '#fff8e7' : done ? '#c9a84c' : '#9ca3af' }}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} style={{ color: '#c9a84c33' }} />}
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: 480 }}>
        {/* Step 1 — Select Patron */}
        {step >= 1 && (
          <div className="mb-6 rounded-lg p-5" style={{ backgroundColor: '#16213e', border: `1px solid ${step === 1 ? '#c9a84c55' : '#c9a84c22'}` }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#c9a84c' }}>Step 1 — Select Patron</p>
            {selectedPatron && step > 1 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: '#fff8e7' }}>
                  {selectedPatron.firstname} {selectedPatron.lastname}
                  <span className="ml-2 text-xs" style={{ color: '#9ca3af' }}>{selectedPatron.email}</span>
                </p>
                <button
                  onClick={() => { setSelectedPatron(null); setPatronSearch(''); setStep(1); setSelectedPerformance(null); }}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: '#c9a84c', border: '1px solid #c9a84c44' }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Search by name or patron ID..."
                  value={patronSearch}
                  onChange={e => setPatronSearch(e.target.value)}
                  style={inputStyle}
                />
                {patronResults.length > 0 && (
                  <div className="rounded overflow-hidden" style={{ border: '1px solid #c9a84c22', maxHeight: 200, overflowY: 'auto' }}>
                    {patronResults.map(p => (
                      <button
                        key={p.patronid}
                        onClick={() => selectPatron(p)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                        style={{ color: '#fff8e7', borderBottom: '1px solid #c9a84c11' }}
                      >
                        {p.firstname} {p.lastname}
                        <span className="ml-2 text-xs" style={{ color: '#9ca3af' }}>{p.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                {patronSearch.trim() && patronResults.length === 0 && (
                  <p className="text-xs" style={{ color: '#9ca3af' }}>No patrons found. <a href="/dashboard/patrons/new" className="underline" style={{ color: '#c9a84c' }}>Register new patron</a></p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Select Performance */}
        {step >= 2 && (
          <div className="mb-6 rounded-lg p-5" style={{ backgroundColor: '#16213e', border: `1px solid ${step === 2 ? '#c9a84c55' : '#c9a84c22'}` }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#c9a84c' }}>Step 2 — Select Performance</p>
            {selectedPerformance && step > 2 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: '#fff8e7' }}>
                  {selectedPerformance.productionname} — {new Date(selectedPerformance.performancedate).toLocaleDateString()} ({selectedPerformance.performancetype})
                </p>
                <button
                  onClick={() => { setSelectedPerformance(null); setStep(2); }}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: '#c9a84c', border: '1px solid #c9a84c44' }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {performances.length === 0 ? (
                  <p className="text-sm" style={{ color: '#9ca3af' }}>No performances available.</p>
                ) : performances.map(p => (
                  <button
                    key={p.performanceid}
                    onClick={() => selectPerformance(p)}
                    className="text-left px-4 py-3 rounded text-sm hover:bg-white/5 transition-colors"
                    style={{ backgroundColor: '#0f0f23', border: '1px solid #c9a84c22', color: '#fff8e7' }}
                  >
                    <span className="font-medium">{p.productionname}</span>
                    <span className="ml-3 text-xs" style={{ color: '#9ca3af' }}>
                      {new Date(p.performancedate).toLocaleDateString()} · {p.performancetype}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Go to seat map */}
        {step === 3 && (
          <div className="rounded-lg p-5" style={{ backgroundColor: '#16213e', border: '1px solid #c9a84c55' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#c9a84c' }}>Step 3 — Choose a Seat</p>
            <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
              Open the seat map to pick an available seat for{' '}
              <span style={{ color: '#fff8e7' }}>{selectedPatron?.firstname} {selectedPatron?.lastname}</span>.
            </p>
            <button
              onClick={goToSeatMap}
              className="px-6 py-2 rounded text-sm font-semibold"
              style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
            >
              View Seat Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
