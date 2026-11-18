import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiService, type Product } from '@/lib/mobile-api';

export function ProductDialog({ token, product, onClose, onSaved, onError }: { token: string; product: Product | null; onClose: () => void; onSaved: () => void; onError: (err: unknown) => void }) {
  const [nome, setNome] = useState(product?.nome ?? '');
  const [preco, setPreco] = useState(product ? String(product.preco) : '');
  const [descricao, setDescricao] = useState(product?.descricao ?? '');
  const [disponivel, setDisponivel] = useState(product?.disponivel ?? true);
  const [saving, setSaving] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const price = Number(preco.replace(',', '.'));
    if (!nome.trim() || !(price > 0)) { toast.error('Informe um nome e um preço maior que zero.'); return; }
    setSaving(true);
    try {
      const data = { nome: nome.trim(), preco: price, descricao: descricao.trim() || null, disponivel };
      if (product) await ApiService.put(`/produtos/${product.id}`, data); else await ApiService.post('/produtos', data);
      toast.success(product ? 'Produto atualizado.' : 'Produto cadastrado.');
      onSaved();
    } catch (err) { onError(err); } finally { setSaving(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent>
      <DialogHeader><DialogTitle>{product ? 'Editar produto' : 'Novo produto'}</DialogTitle><DialogDescription>Os dados são enviados à API com o seu token de acesso.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="p-nome">Nome</Label><Input id="p-nome" value={nome} onChange={e => setNome(e.target.value)} /></div>
        <div className="grid gap-2"><Label htmlFor="p-preco">Preço (R$)</Label><Input id="p-preco" inputMode="decimal" value={preco} onChange={e => setPreco(e.target.value)} /></div>
        <div className="grid gap-2"><Label htmlFor="p-desc">Descrição</Label><Input id="p-desc" value={descricao} onChange={e => setDescricao(e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={disponivel} onChange={e => setDisponivel(e.target.checked)} />Disponível em estoque</label>
        <Button type="submit" disabled={saving}>{saving && <LoaderCircle className="animate-spin" />}{product ? 'Salvar alterações' : 'Cadastrar produto'}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}
