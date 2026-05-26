const API_BASE = import.meta.env?.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith('/api')
      ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
      : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`)
  : typeof window !== 'undefined'
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

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

function authHeaders(extra = {}, isFormData = false) {
  const token = getStoredToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

/** Low-level fetch wrapper. Throws an Error with `.status` on HTTP failure. */
export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  
  // If headers contains Content-Type, fetch won't auto-set the multipart boundary.
  // We must ensure 'Content-Type' is NOT passed manually if we use FormData.
  const reqHeaders = authHeaders(options.headers || {}, isFormData);
  if (isFormData && reqHeaders['Content-Type']) {
    delete reqHeaders['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: reqHeaders,
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

function buildUrl(path, params) {
  if (!params || Object.keys(params).length === 0) return path;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `${path}?${qs}` : path;
}

export const api = {
  get:    (path, options = {}) =>       apiFetch(buildUrl(path, options?.params), options),
  post:   (path, data, options = {}) => apiFetch(buildUrl(path, options?.params), { method: 'POST',   body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined), ...options }),
  put:    (path, data, options = {}) => apiFetch(buildUrl(path, options?.params), { method: 'PUT',    body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined), ...options }),
  patch:  (path, data, options = {}) => apiFetch(buildUrl(path, options?.params), { method: 'PATCH',  body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined), ...options }),
  delete: (path) =>                     apiFetch(path, { method: 'DELETE' }),
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
