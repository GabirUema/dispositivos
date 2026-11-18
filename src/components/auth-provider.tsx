import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ApiError, ApiService, getMe, login, SESSION_EXPIRED, TOKEN_KEY, type User } from '@/lib/mobile-api';
import { toast } from 'sonner';

interface AuthState { user: User | null; token: string | null; ready: boolean; error: string; signIn: (username: string, password: string) => Promise<void>; signOut: () => void; retry: () => void }
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function restore() {
      setReady(false); setError('');
      try {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved) {
          const profile = await getMe(saved);
          if (active) { setToken(saved); setUser(profile); }
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) { localStorage.removeItem(TOKEN_KEY); toast.error(SESSION_EXPIRED); }
        if (active) setError(err instanceof Error ? err.message : 'Não foi possível recuperar a sessão.');
      } finally { if (active) setReady(true); }
    }
    void restore();
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    ApiService.onUnauthorized = () => { setToken(null); setUser(null); setError(SESSION_EXPIRED); toast.error(SESSION_EXPIRED); };
    return () => { ApiService.onUnauthorized = null; };
  }, []);
  async function signIn(username: string, password: string) {
    const accessToken = await login(username, password);
    const profile = await getMe(accessToken);
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken); setUser(profile); setError('');
  }
  function signOut() { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setError(''); }
  return <AuthContext.Provider value={{ user, token, ready, error, signIn, signOut, retry: () => setAttempt(a => a + 1) }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requires AuthProvider');
  return context;
}