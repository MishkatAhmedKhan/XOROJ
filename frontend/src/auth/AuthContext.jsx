import { createContext, useContext, useMemo, useState } from 'react'
import { apiFetch, saveToken, clearToken, getToken } from '../api/client'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());

  async function login(username, password) {
    // /login returns a plain string JWT
    const jwt = await apiFetch('api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      auth: false,
    });
    saveToken(jwt);
    setToken(jwt);
  }

  async function register(payload) {
    // /register accepts a user object, encodes password server-side
    await apiFetch('api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false,
    });
    // optional: auto-login
    await login(payload.username, payload.password);
  }

  function logout() {
    clearToken();
    setToken(null);
  }

  const value = useMemo(() => ({ token, login, register, logout }), [token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
