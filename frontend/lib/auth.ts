export interface JWTUser {
  userid: string;
  username: string;
  role: 'clerk' | 'manager';
  exp: number;
}

/*
 * getToken
 * Reads the JWT string from localStorage.
 * Returns null if no token is stored.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/*
 * setToken
 * Stores the JWT string in localStorage.
 *
 * @param {string} token - The JWT returned from /api/auth/login
 */
export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

/*
 * getUser
 * Decodes the JWT payload (without verification) and returns the user object.
 * Returns null if no token exists or the token is malformed.
 */
export function getUser(): JWTUser | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as JWTUser;
  } catch {
    return null;
  }
}

/*
 * isManager
 * Returns true if the currently logged-in user has the 'manager' role.
 */
export function isManager(): boolean {
  return getUser()?.role === 'manager';
}

/*
 * logout
 * Removes the token from localStorage and redirects to /login.
 */
export function logout(): void {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

/*
 * isAuthenticated
 * Returns true if a valid non-expired token exists in localStorage.
 */
export function isAuthenticated(): boolean {
  const user = getUser();
  if (!user) return false;
  return user.exp * 1000 > Date.now();
}
