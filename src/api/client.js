const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'shnoor_token';
const USER_KEY = 'shnoor_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSessionUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  persistSessionUser(user);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function authHeaders(extra = {}) {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/** Low-level fetch wrapper. Throws an Error with `.status` on HTTP failure. */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(options.headers || {}), ...(options.headers || {}) },
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.status === 401) {
    clearSession();
    const err = new Error('Unauthorized');
    err.status = 401;
    err.body = body;
    throw err;
  }
  if (!res.ok || (body && body.success === false)) {
    const err = new Error(body?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  get:    (path) =>                  apiFetch(path),
  post:   (path, data) =>            apiFetch(path, { method: 'POST',   body: data ? JSON.stringify(data) : undefined }),
  put:    (path, data) =>            apiFetch(path, { method: 'PUT',    body: data ? JSON.stringify(data) : undefined }),
  patch:  (path, data) =>            apiFetch(path, { method: 'PATCH',  body: data ? JSON.stringify(data) : undefined }),
  delete: (path) =>                  apiFetch(path, { method: 'DELETE' }),
};

export async function fetchMe() {
  const data = await api.get('/auth/me');
  return data.user;
}

/** Backwards-compatible aliases used by older components. */
export async function authFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
}

export { API_BASE };
