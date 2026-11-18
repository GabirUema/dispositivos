export const API_URL = 'https://api-produtos-mobile.onrender.com';
export const TOKEN_KEY = 'forma.access_token';

export interface User { id: number; username: string; nome: string | null }
export interface Product { id: number; nome: string; preco: number; descricao: string | null; disponivel: boolean }
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function request<T>(path: string, options: { body?: unknown; token?: string; signal?: AbortSignal } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.body ? 'POST' : 'GET',
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
      body: options.body ? JSON.stringify(options.body) : null,
      signal: options.signal ?? AbortSignal.timeout(60000),
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar. Verifique sua internet e tente novamente. A primeira conexão pode levar alguns segundos.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status === 401
      ? (path === '/auth/login' ? 'Usuário ou senha incorretos. Confira seus dados e tente novamente.' : 'Sua sessão expirou. Entre novamente para continuar.')
      : response.status === 400 && path === '/auth/cadastrar'
        ? 'Esse nome de usuário já está em uso. Escolha outro.'
        : typeof data.detail === 'string' ? data.detail : 'Não foi possível concluir. Confira os dados e tente novamente.';
    throw new ApiError(response.status, message);
  }
  return data as T;
}

export async function login(username: string, senha: string) {
  const data = await request<{ access_token: string }>('/auth/login', { body: { username: username.trim(), senha } });
  if (!data.access_token) throw new ApiError(502, 'A resposta de login não contém uma sessão válida.');
  return data.access_token;
}
export const register = (nome: string, username: string, senha: string) => request<User>('/auth/cadastrar', { body: { nome: nome.trim(), username: username.trim(), senha } });
export const getMe = (token: string) => request<User>('/auth/me', { token });
export const getProducts = (token: string) => request<Product[]>('/produtos', { token });