const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

export function getStoredToken() {
  return localStorage.getItem('shnoor_token');
}

export function authHeaders(extra = {}) {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function persistSessionUser(user) {
  localStorage.setItem('shnoor_user', JSON.stringify(user));
}

/**
 * @returns {Promise<object>} Auth user payload from backend
 */
export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  if (!data.success) {
    const err = new Error(data.message || 'Failed to load profile');
    err.status = res.status;
    throw err;
  }
  return data.user;
}

export async function authFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });
}

export { API_BASE };
