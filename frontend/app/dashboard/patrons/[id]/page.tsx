'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import PatronForm from '@/components/PatronForm';

export default function EditPatronPage() {
  const { id } = useParams<{ id: string }>();
  const [patron, setPatron] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/patrons/${id}`).then(setPatron).catch(() => setError('Patron not found'));
  }, [id]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!patron) return <p style={{ color: '#9ca3af' }}>Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Edit Patron</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Update patron information</p>
      </div>
      <PatronForm initial={patron} patronId={id} />
    </div>
  );
}
