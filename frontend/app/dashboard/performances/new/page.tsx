'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

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

interface Production {
  productionid: string;
  productionname: string;
}

export default function NewPerformancePage() {
  const router = useRouter();
  const [productions, setProductions] = useState<Production[]>([]);
  const [productionid, setProductionid] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('evening');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch('/api/productions').then(data => {
      setProductions(data);
      if (data.length > 0) setProductionid(data[0].productionid);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/api/performances', {
        method: 'POST',
        body: JSON.stringify({ performancedate: date, performancetype: type, productionid }),
      });
      router.push('/dashboard/performances');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create performance');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>New Performance</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Schedule a performance for a production</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ maxWidth: '400px' }}>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: '#9ca3af' }}>Production <span style={{ color: '#c9a84c' }}>*</span></label>
          <select value={productionid} onChange={e => setProductionid(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
            {productions.map(p => (
              <option key={p.productionid} value={p.productionid}>{p.productionname}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: '#9ca3af' }}>Date & Time <span style={{ color: '#c9a84c' }}>*</span></label>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: '#9ca3af' }}>Performance Type <span style={{ color: '#c9a84c' }}>*</span></label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="matinee">Matinee</option>
            <option value="evening">Evening</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
          >
            {loading ? 'Saving...' : 'Schedule Performance'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/performances')}
            className="px-6 py-2 rounded text-sm"
            style={{ backgroundColor: '#16213e', color: '#9ca3af', border: '1px solid #c9a84c33' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
