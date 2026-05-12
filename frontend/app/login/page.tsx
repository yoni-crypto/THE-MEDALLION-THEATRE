'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import MedallionLogo from '@/components/MedallionLogo';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <MedallionLogo size={120} />
          <p className="mt-3 text-sm tracking-widest" style={{ color: '#9ca3af' }}>TICKET SALES SYSTEM</p>
        </div>
        <div className="rounded-lg p-8" style={{ backgroundColor: '#16213e', border: '1px solid #c9a84c33' }}>
          <h1 className="text-xl font-semibold mb-6 text-center" style={{ color: '#c9a84c' }}>Staff Login</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: '#9ca3af' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="px-3 py-2 rounded text-sm outline-none"
                style={{ backgroundColor: '#0f0f23', border: '1px solid #c9a84c55', color: '#fff8e7' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: '#9ca3af' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="px-3 py-2 rounded text-sm outline-none"
                style={{ backgroundColor: '#0f0f23', border: '1px solid #c9a84c55', color: '#fff8e7' }}
              />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-2 rounded font-semibold text-sm tracking-wide transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
