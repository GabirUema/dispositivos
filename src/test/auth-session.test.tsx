import { act, renderHook, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { TOKEN_KEY } from '@/lib/mobile-api';
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });
const profile = { id: 1, username: 'aluno', nome: 'Aluno Exemplo' };
describe('Sessão do usuário', () => {
  it('persiste access_token após login e valida o usuário', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'test-jwt' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(profile))));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(() => result.current.signIn('aluno', '123456'));
    expect(localStorage.getItem(TOKEN_KEY)).toBe('test-jwt');
    expect(result.current.user?.nome).toBe('Aluno Exemplo');
  });
  it('restaura o token local e consulta /auth/me ao reabrir', async () => {
    localStorage.setItem(TOKEN_KEY, 'saved-jwt');
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(profile)));
    vi.stubGlobal('fetch', fetcher);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.token).toBe('saved-jwt');
    expect(result.current.user?.username).toBe('aluno');
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('/auth/me'), expect.objectContaining({ headers: { 'Content-Type': 'application/json', Authorization: 'Bearer saved-jwt' } }));
  });
  it('remove o token e o usuário no logout', async () => {
    localStorage.setItem(TOKEN_KEY, 'saved-jwt');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(profile))));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user?.id).toBe(1));
    act(() => result.current.signOut());
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
  it('não restaura uma sessão recusada pela API', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired-jwt');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});