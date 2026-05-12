'use client';

import { useState } from 'react';
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

export default function NewProductionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('play');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/api/productions', {
        method: 'POST',
        body: JSON.stringify({ productionname: name, productiontype: type }),
      });
      router.push('/dashboard/productions');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create production');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>New Production</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Add a new theatre production</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ maxWidth: '400px' }}>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: '#9ca3af' }}>Production Name <span style={{ color: '#c9a84c' }}>*</span></label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: '#9ca3af' }}>Type <span style={{ color: '#c9a84c' }}>*</span></label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="play">Play</option>
            <option value="concert">Concert</option>
            <option value="musical">Musical</option>
            <option value="other">Other</option>
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
            {loading ? 'Saving...' : 'Create Production'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/productions')}
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
