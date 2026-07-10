import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!getToken()) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setProfile(data);
    } catch {
      setToken(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = useCallback(async (accessToken) => {
    setToken(accessToken);
    setLoading(true);
    await loadProfile();
  }, [loadProfile]);

  const logout = useCallback(() => {
    setToken(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ profile, loading, login, logout, refresh: loadProfile }),
    [profile, loading, login, logout, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
