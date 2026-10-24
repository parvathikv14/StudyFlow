import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('studyflow_token')));

  useEffect(() => {
    if (!localStorage.getItem('studyflow_token')) return;
    let active = true;
    apiRequest('/auth/me')
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem('studyflow_token');
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function authenticate(action, payload) {
    const data = await apiRequest(`/auth/${action}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    localStorage.setItem('studyflow_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('studyflow_token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, authLoading, authenticate, logout }), [user, authLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
