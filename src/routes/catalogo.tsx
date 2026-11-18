import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProductDialog } from '@/components/product-dialog';
import { Pencil, Plus, Trash2, LogOut, Search, LoaderCircle, RotateCw, Package, ShieldCheck } from 'lucide-react';
import { Brand } from '@/components/auth-layout';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, ApiService, type Product } from '@/lib/mobile-api';
import phone from '@/assets/phone.jpg';
import headphones from '@/assets/headphones.jpg';
import watch from '@/assets/watch.jpg';
import powerbank from '@/assets/powerbank.jpg';

export const Route = createFileRoute('/catalogo')({
  head: () => ({ meta: [
    { title: 'Catálogo | Forma' },
    { name: 'description', content: 'Explore os produtos do catálogo Forma e encontre seu próximo favorito.' },
    { property: 'og:title', content: 'Catálogo | Forma' },
    { property: 'og:description', content: 'Boas escolhas e novas possibilidades no catálogo Forma.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Catalog,
});
function productImage(product: Product) {
  const name = product.nome.toLowerCase();
  if (name.includes('smartphone')) return phone;
  if (name.includes('fone')) return headphones;
  if (name.includes('smartwatch')) return watch;
  if (name.includes('power bank') || name.includes('carregador')) return powerbank;
  return null;
}
function Catalog() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const products = useQuery({ queryKey: ['products', auth.user?.id], queryFn: () => ApiService.get<Product[]>('/produtos'), enabled: Boolean(auth.token), retry: false });
  useEffect(() => { if (auth.ready && !auth.user) void navigate({ to: '/', replace: true }); }, [auth.ready, auth.user, navigate]);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  function handleError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      void navigate({ to: '/', replace: true });
      return;
    }
    toast.error(err instanceof Error ? err.message : 'Não foi possível concluir.');
  }
  useEffect(() => { if (products.error) { if (products.error instanceof ApiError && products.error.status === 401) handleError(products.error); } }, [products.error]);
  async function remove(product: Product) {
    if (!auth.token || !confirm(`Excluir "${product.nome}"?`)) return;
    try { await ApiService.delete(`/produtos/${product.id}`); toast.success('Produto excluído.'); await queryClient.invalidateQueries({ queryKey: ['products'] }); } catch (err) { handleError(err); }
  }
  async function logout() { auth.signOut(); await navigate({ to: '/', replace: true }); }
  if (!auth.ready || !auth.user) return <div className="empty-state"><LoaderCircle className="animate-spin" />Verificando sua sessão…</div>;
  const filtered = (products.data ?? []).filter(p => p.nome.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  return <div className="catalog-page">
    <header className="catalog-header"><Brand /><div className="user-menu"><span className="user-avatar">{(auth.user.nome || auth.user.username).slice(0,1).toUpperCase()}</span><span>{auth.user.username}</span><Button variant="ghost" onClick={logout}><LogOut />Sair</Button></div></header>
    <main><section className="catalog-intro"><span className="eyebrow form-eyebrow">SEU ESPAÇO DE DESCOBERTAS</span><h1>Olá, {auth.user.nome || auth.user.username}.</h1><p>Boas escolhas para acompanhar o seu dia.</p></section>
      <div className="catalog-toolbar"><h2>Explore o catálogo <span>{products.data?.length ?? 0} produtos</span></h2><div className="flex flex-wrap items-center gap-3"><Button onClick={() => setEditing(null)}><Plus />Novo produto</Button><div className="search-wrap"><Search size={17} /><Input aria-label="Buscar produtos" placeholder="Buscar um produto…" value={search} onChange={e => setSearch(e.target.value)} /></div></div></div>
      {products.isPending ? <div className="empty-state"><LoaderCircle className="animate-spin" />Carregando produtos…</div> : products.error ? <div className="empty-state" role="alert"><Package size={30} /><p>{products.error.message}</p><Button variant="outline" onClick={() => products.refetch()}><RotateCw />Tentar novamente</Button></div> : <div className="product-grid">{filtered.map(product => {
        const image = productImage(product);
        return <article className="product-card" key={product.id}><div className="product-image">{image ? <img src={image} alt={`Ilustração de ${product.nome}`} width={512} height={512} loading="lazy" /> : <div className="product-fallback"><Package size={50} /></div>}<span className={`stock-badge ${product.disponivel ? 'available' : ''}`}>{product.disponivel ? 'Disponível' : 'Indisponível'}</span></div><h3>{product.nome}</h3><p>{product.descricao}</p><div className="product-price">{product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(product)}><Pencil />Editar</Button><Button size="sm" variant="ghost" aria-label={`Excluir ${product.nome}`} onClick={() => remove(product)}><Trash2 />Excluir</Button></div></article>;
      })}</div>}
      {!products.isPending && !products.error && !filtered.length && <div className="empty-state"><Search size={28} /><p>Nenhum produto encontrado.</p><Button variant="outline" onClick={() => setSearch('')}>Limpar busca</Button></div>}
      {editing !== undefined && auth.token && <ProductDialog token={auth.token} product={editing} onClose={() => setEditing(undefined)} onError={handleError} onSaved={async () => { setEditing(undefined); await queryClient.invalidateQueries({ queryKey: ['products'] }); }} />}
    </main><footer className="catalog-note"><span>© 2026 Forma. Feito para descobrir. Imagens ilustrativas.</span><span className="flex items-center gap-2"><ShieldCheck size={14} />Conectado como {auth.user.username}</span></footer>
  </div>;
}