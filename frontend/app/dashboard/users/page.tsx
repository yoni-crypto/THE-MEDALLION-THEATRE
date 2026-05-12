'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface User {
  userid: string;
  username: string;
  role: 'clerk' | 'manager';
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'clerk' | 'manager'>('clerk');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const currentUser = getUser();

  function loadUsers() {
    apiFetch('/api/users')
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
      });
      setUsername('');
      setPassword('');
      setRole('clerk');
      setShowForm(false);
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(userid: string) {
    if (!confirm('Delete this user?')) return;
    try {
      await apiFetch(`/api/users/${userid}`, { method: 'DELETE' });
      loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>User Management</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Manage staff accounts</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold"
          style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg p-5 mb-6 flex flex-col gap-4" style={{ backgroundColor: '#16213e', border: '1px solid #c9a84c33', maxWidth: 420 }}>
          <p className="text-sm font-medium" style={{ color: '#c9a84c' }}>New Staff Account</p>
          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: '#9ca3af' }}>Username <span style={{ color: '#c9a84c' }}>*</span></label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: '#9ca3af' }}>Password <span style={{ color: '#c9a84c' }}>*</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: '#9ca3af' }}>Role <span style={{ color: '#c9a84c' }}>*</span></label>
            <select value={role} onChange={e => setRole(e.target.value as 'clerk' | 'manager')} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="clerk">Clerk</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded text-sm font-semibold disabled:opacity-50 self-start"
            style={{ backgroundColor: '#c9a84c', color: '#1a1a2e' }}
          >
            {saving ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      )}

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #c9a84c22' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#0f0f23' }}>
              {['Username', 'Role', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#c9a84c' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center" style={{ color: '#9ca3af' }}>Loading...</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.userid} style={{ backgroundColor: i % 2 === 0 ? '#16213e' : '#1a1a2e', borderTop: '1px solid #c9a84c11' }}>
                <td className="px-4 py-3" style={{ color: '#fff8e7' }}>
                  {u.username}
                  {u.userid === currentUser?.userid && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#c9a84c22', color: '#c9a84c' }}>you</span>
                  )}
                </td>
                <td className="px-4 py-3 capitalize" style={{ color: u.role === 'manager' ? '#c9a84c' : '#9ca3af' }}>{u.role}</td>
                <td className="px-4 py-3">
                  {u.userid !== currentUser?.userid && (
                    <button
                      onClick={() => handleDelete(u.userid)}
                      className="p-1.5 rounded hover:bg-red-900/30 transition-colors"
                      style={{ color: '#9ca3af' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
