const TOKEN_KEY = 'xoroj.jwt';

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Wrapper that auto-attaches Authorization: Bearer <token> for /api/** calls
export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || { 'Content-Type': 'application/json' });

  const needsAuth = options.auth ?? url.startsWith('/api/');
  const token = getToken();
  if (needsAuth && token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Do NOT auto-logout globally.
    // Let the caller decide what to do with 401.
    const body = await (async () => {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try { return await res.json(); } catch {}
      }
      return null;
    })();
    const err = new Error(body?.message || 'Unauthorized');
    err.status = 401;
    err.code = body?.code;
    throw err;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}
