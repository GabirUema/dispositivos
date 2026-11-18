import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_URL, getMe, getProducts, login, register } from '@/lib/mobile-api';
afterEach(() => vi.unstubAllGlobals());
describe('API da atividade', () => {
  it('envia username e senha em JSON e retorna access_token', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ access_token: 'test-jwt' })));
    vi.stubGlobal('fetch', fetcher);
    expect(await login(' aluno ', '123456')).toBe('test-jwt');
    expect(fetcher).toHaveBeenCalledWith(`${API_URL}/auth/login`, expect.objectContaining({ method: 'POST', body: JSON.stringify({ username: 'aluno', senha: '123456' }), headers: { 'Content-Type': 'application/json' } }));
  });
  it('trata credenciais incorretas como erro 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    await expect(login('aluno', 'errada')).rejects.toMatchObject({ status: 401 });
  });
  it('envia nome completo, username e senha no cadastro', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 3 }), { status: 201 }));
    vi.stubGlobal('fetch', fetcher);
    await register('Novo Aluno', 'novoaluno', '123456');
    expect(fetcher).toHaveBeenCalledWith(`${API_URL}/auth/cadastrar`, expect.objectContaining({ method: 'POST', body: JSON.stringify({ nome: 'Novo Aluno', username: 'novoaluno', senha: '123456' }) }));
  });
  it('trata usuário já existente como erro 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 400 })));
    await expect(register('Aluno', 'aluno', '123456')).rejects.toMatchObject({ status: 400 });
  });
  it('envia Bearer token na identificação do usuário', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ username: 'aluno' })));
    vi.stubGlobal('fetch', fetcher);
    await getMe('test-jwt');
    expect(fetcher).toHaveBeenCalledWith(`${API_URL}/auth/me`, expect.objectContaining({ headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-jwt' } }));
  });
  it('envia Bearer token no catálogo protegido', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('[]'));
    vi.stubGlobal('fetch', fetcher);
    await getProducts('test-jwt');
    expect(fetcher).toHaveBeenCalledWith(`${API_URL}/produtos`, expect.objectContaining({ headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-jwt' } }));
  });
});
describe('product writes', () => {
  it('signs POST, PUT and DELETE with the Bearer token', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetcher);
    const { createProduct, updateProduct, deleteProduct } = await import('@/lib/mobile-api');
    const data = { nome: 'X', preco: 10, descricao: null, disponivel: true };
    await createProduct('t', data); await updateProduct('t', 3, data); await deleteProduct('t', 3);
    const h = { 'Content-Type': 'application/json', Authorization: 'Bearer t' };
    expect(fetcher).toHaveBeenNthCalledWith(1, `${API_URL}/produtos`, expect.objectContaining({ method: 'POST', headers: h }));
    expect(fetcher).toHaveBeenNthCalledWith(2, `${API_URL}/produtos/3`, expect.objectContaining({ method: 'PUT', headers: h }));
    expect(fetcher).toHaveBeenNthCalledWith(3, `${API_URL}/produtos/3`, expect.objectContaining({ method: 'DELETE', headers: h }));
  });
});
describe('ApiService', () => {
  it('lê jwt_token salvo e envia Authorization Bearer', async () => {
    const { ApiService } = await import('@/lib/mobile-api');
    localStorage.setItem('jwt_token', 'salvo');
    const fetcher = vi.fn().mockResolvedValue(new Response('[]'));
    vi.stubGlobal('fetch', fetcher);
    await ApiService.get('/produtos');
    expect(fetcher).toHaveBeenCalledWith(`${API_URL}/produtos`, expect.objectContaining({ headers: { 'Content-Type': 'application/json', Authorization: 'Bearer salvo' } }));
  });
  it('em 401 remove jwt_token e avisa o app', async () => {
    const { ApiService } = await import('@/lib/mobile-api');
    localStorage.setItem('jwt_token', 'vencido');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    const onUnauthorized = vi.fn(); ApiService.onUnauthorized = onUnauthorized;
    await expect(ApiService.put('/produtos/1', {})).rejects.toMatchObject({ status: 401 });
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(onUnauthorized).toHaveBeenCalled();
  });
});
