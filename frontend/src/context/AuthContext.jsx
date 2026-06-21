import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('acadiet_token');
    if (!token) { setLoading(false); return; }
    authService.getMe()
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem('acadiet_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('acadiet_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (firstName, lastName, email, password) => {
    const data = await authService.register({ firstName, lastName, email, password });
    localStorage.setItem('acadiet_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('acadiet_token');
    setUser(null);
  }, []);

  const saveGoals = useCallback(async (goals) => {
    const data = await authService.saveGoals(goals);
    setUser(prev => prev ? { ...prev, goals: data.goals } : prev);
    return data.goals;
  }, []);

  const saveHistory = useCallback((entry) => authService.saveHistory(entry), []);
  const getHistory = useCallback(() => authService.getHistory(), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, saveGoals, saveHistory, getHistory }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
