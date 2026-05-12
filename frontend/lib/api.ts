const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/*
 * apiFetch
 * Wrapper around fetch that automatically attaches the Authorization header
 * using the JWT stored in localStorage. Redirects to /login on 401 responses.
 *
 * @param {string} path - API path starting with /api/...
 * @param {RequestInit} options - Standard fetch options (method, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}
