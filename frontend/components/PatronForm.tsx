'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface PatronFormData {
  firstname: string;
  lastname: string;
  streetaddress: string;
  city: string;
  state: string;
  zipcode: string;
  phonenumber: string;
  email: string;
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

function Field({ label, name, value, onChange, type = 'text', required = false }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm" style={{ color: '#9ca3af' }}>
        {label}{required && <span style={{ color: '#c9a84c' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        required={required}
        style={inputStyle}
      />
    </div>
  );
}

export default function PatronForm({ initial, patronId }: {
  initial?: Partial<PatronFormData>;
  patronId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<PatronFormData>({
    firstname: initial?.firstname || '',
    lastname: initial?.lastname || '',
    streetaddress: initial?.streetaddress || '',
    city: initial?.city || '',
    state: initial?.state || '',
    zipcode: initial?.zipcode || '',
    phonenumber: initial?.phonenumber || '',
    email: initial?.email || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(name: string, value: string) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (patronId) {
        await apiFetch(`/api/patrons/${patronId}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/patrons', { method: 'POST', body: JSON.stringify(form) });
      }
      router.push('/dashboard/patrons');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save patron');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ maxWidth: '560px' }}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" name="firstname" value={form.firstname} onChange={handleChange} required />
        <Field label="Last Name" name="lastname" value={form.lastname} onChange={handleChange} required />
      </div>
      <Field label="Street Address" name="streetaddress" value={form.streetaddress} onChange={handleChange} />
      <div className="grid grid-cols-3 gap-4">
        <Field label="City" name="city" value={form.city} onChange={handleChange} />
        <Field label="State" name="state" value={form.state} onChange={handleChange} />
        <Field label="Zip Code" name="zipcode" value={form.zipcode} onChange={handleChange} />
      </div>
      <Field label="Phone Number" name="phonenumber" value={form.phonenumber} onChange={handleChange} />
      <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded text-sm font-semibold disabled:opacity-50"
          style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
        >
          {loading ? 'Saving...' : patronId ? 'Save Changes' : 'Register Patron'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/patrons')}
          className="px-6 py-2 rounded text-sm"
          style={{ backgroundColor: '#16213e', color: '#9ca3af', border: '1px solid #c9a84c33' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
