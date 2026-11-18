import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Layers3, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import collectionImage from '@/assets/collection-still-life.jpg';

export function Brand() {
  return <Link to="/" className="brand" aria-label="Forma — início"><span className="brand-mark"><Layers3 size={22} strokeWidth={1.8} /></span>forma<span className="brand-dot">.</span></Link>;
}
export function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="auth-page">
    <header className="auth-header"><Brand /><span className="header-caption">Seu próximo favorito está aqui.</span><a href="https://api-produtos-mobile.onrender.com/tutorial-login" target="_blank" rel="noreferrer" className="support-link">Sobre o projeto <ArrowUpRight size={15} /></a></header>
    <main className="auth-main">
      <section className="editorial-panel" aria-label="Coleção Forma">
        <img src={collectionImage} width={1024} height={1536} alt="Fone verde, câmera e tênis branco em uma composição de produtos" className="editorial-image" />
        <div className="editorial-copy"><span className="eyebrow">CURADORIA PARA O SEU DIA A DIA</span><h2>Boas escolhas.<br />Novas possibilidades.</h2><p>Um universo de produtos.<br />Um lugar para chamar de seu.</p></div>
        <div className="editorial-bottom"><span>Explore. Descubra. Encontre.</span><span className="editorial-arrow"><ArrowUpRight size={21} /></span></div>
      </section>
      <section className="auth-form-panel">{children}</section>
    </main>
    <footer className="auth-footer"><span>© {2026} Forma. Feito para descobrir.</span><span><ShieldCheck size={14} /> Sua conexão, protegida.</span><span>DESENVOLVIMENTO MOBILE <span className="footer-divider">/</span> ATIVIDADE 03</span></footer>
  </div>;
}