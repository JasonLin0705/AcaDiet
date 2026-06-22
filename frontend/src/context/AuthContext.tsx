import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  restrictions: string[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  goals: UserGoals | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  saveGoals: (goals: Partial<UserGoals> & { restrictions?: string[] }) => Promise<UserGoals>;
  saveHistory: (entry: {
    date: string;
    school: string;
    hallName: string;
    plan: unknown;
    totals: { calories: number; protein: number; carbs: number; fat: number };
  }) => Promise<unknown>;
  getHistory: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('acadiet_token');
    if (!token) { setLoading(false); return; }
    authService.getMe()
      .then((data: { user: User }) => setUser(data.user))
      .catch(() => localStorage.removeItem('acadiet_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('acadiet_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (firstName: string, lastName: string, email: string, password: string) => {
    const data = await authService.register({ firstName, lastName, email, password });
    localStorage.setItem('acadiet_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('acadiet_token');
    setUser(null);
  }, []);

  const saveGoals = useCallback(async (goals: Partial<UserGoals> & { restrictions?: string[] }) => {
    const data = await authService.saveGoals(goals);
    setUser(prev => prev ? { ...prev, goals: data.goals } : prev);
    return data.goals;
  }, []);

  const saveHistory = useCallback((entry: Parameters<AuthContextType['saveHistory']>[0]) => authService.saveHistory(entry), []);
  const getHistory = useCallback(() => authService.getHistory(), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, saveGoals, saveHistory, getHistory }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
