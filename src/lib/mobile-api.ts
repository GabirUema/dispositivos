export const API_URL = 'https://api-produtos-mobile.onrender.com';
export const TOKEN_KEY = 'jwt_token';
export const SESSION_EXPIRED = 'Sua sessão expirou. Faça login novamente';

export interface User { id: number; username: string; nome: string | null }
export interface Product { id: number; nome: string; preco: number; descricao: string | null; disponivel: boolean }
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function request<T>(path: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown; token?: string; signal?: AbortSignal } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? (options.body ? 'POST' : 'GET'),
      headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
      body: options.body ? JSON.stringify(options.body) : null,
      signal: options.signal ?? AbortSignal.timeout(60000),
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar. Verifique sua internet e tente novamente. A primeira conexão pode levar alguns segundos.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status === 401
      ? (path === '/auth/login' ? 'Usuário ou senha incorretos. Confira seus dados e tente novamente.' : SESSION_EXPIRED)
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
export type ProductInput = Omit<Product, 'id'>;
export const createProduct = (token: string, product: ProductInput) => request<Product>('/produtos', { method: 'POST', token, body: product });
export const updateProduct = (token: string, id: number, product: ProductInput) => request<Product>(`/produtos/${id}`, { method: 'PUT', token, body: product });
export const deleteProduct = (token: string, id: number) => request<unknown>(`/produtos/${id}`, { method: 'DELETE', token });

/**
 * ApiService (passo 7 do tutorial): lê o token salvo (equivalente web do
 * shared_preferences), assina toda requisição com Authorization: Bearer <token>
 * e, em caso de 401, remove o token salvo e avisa o app para voltar ao login.
 */
export class ApiService {
  static onUnauthorized: (() => void) | null = null;
  static getToken() { return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY); }
  private static async send<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown) {
    const token = ApiService.getToken();
    if (!token) { ApiService.onUnauthorized?.(); throw new ApiError(401, 'Não autenticado. ' + SESSION_EXPIRED); }
    try { return await request<T>(path, { method, body, token }); }
    catch (err) {
      if (err instanceof ApiError && err.status === 401) { localStorage.removeItem(TOKEN_KEY); ApiService.onUnauthorized?.(); }
      throw err;
    }
  }
  static get<T>(path: string) { return ApiService.send<T>('GET', path); }
  static post<T>(path: string, body: unknown) { return ApiService.send<T>('POST', path, body); }
  static put<T>(path: string, body: unknown) { return ApiService.send<T>('PUT', path, body); }
  static delete<T>(path: string) { return ApiService.send<T>('DELETE', path); }
}
