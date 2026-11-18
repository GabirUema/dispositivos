import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Eye, EyeOff, UserRound, LockKeyhole, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth-provider';
import { register } from '@/lib/mobile-api';

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (auth.ready && auth.user) void navigate({ to: '/catalogo', replace: true });
    if (!signup && sessionStorage.getItem('forma.registered')) {
      setUsername(sessionStorage.getItem('forma.registered') ?? '');
      sessionStorage.removeItem('forma.registered');
      setSuccess(true);
    }
  }, [auth.ready, auth.user, navigate, signup]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      if (signup) {
        await register(name, username, password);
        sessionStorage.setItem('forma.registered', username.trim());
        await navigate({ to: '/' });
      } else {
        await auth.signIn(username, password);
        await navigate({ to: '/catalogo' });
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.'); }
    finally { setLoading(false); }
  }
  return <div className="auth-form-wrap">
    <div className="welcome-symbol">{signup ? <UserRound size={22} /> : <LockKeyhole size={22} />}</div>
    <span className="eyebrow form-eyebrow">{signup ? 'SEU PRIMEIRO PASSO' : 'BOM TER VOCÊ AQUI'}</span>
    <h1>{signup ? 'Crie sua conta.' : 'Bem-vindo de volta.'}</h1>
    <p className="form-subtitle">{signup ? 'Novas descobertas começam com você.' : 'Entre na sua conta e encontre seu próximo favorito.'}</p>
    {success && <div role="status" className="feedback success"><CheckCircle2 size={18} /> Conta criada! Entre com sua senha para continuar.</div>}
    {(error || auth.error) && <div role="alert" className="feedback error"><AlertCircle size={18} /><span>{error || auth.error}</span></div>}
    <form onSubmit={submit} className="auth-form">
      {signup && <div className="field"><label htmlFor="full-name">Nome completo</label><div className="input-wrap"><UserRound size={18} /><Input id="full-name" autoComplete="name" placeholder="Como você se chama?" value={name} onChange={e => setName(e.target.value)} required disabled={loading} maxLength={150} /></div></div>}
      <div className="field"><label htmlFor="username">Usuário</label><div className="input-wrap"><UserRound size={18} /><Input id="username" autoComplete="username" placeholder="Seu nome de usuário" value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} maxLength={100} /></div></div>
      <div className="field"><label htmlFor="password">Senha</label><div className="input-wrap"><LockKeyhole size={18} /><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'Crie uma senha' : 'Sua senha'} value={password} onChange={e => setPassword(e.target.value)} required minLength={signup ? 4 : undefined} disabled={loading} /><Button type="button" variant="ghost" size="icon" className="password-toggle" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} title={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff /> : <Eye />}</Button></div></div>
      {!signup && <div className="session-note"><CheckCircle2 size={15} /><span>Sua sessão fica salva neste dispositivo</span></div>}
      <Button type="submit" size="lg" className="submit-button" disabled={loading || !auth.ready}>{loading || !auth.ready ? <><LoaderCircle className="animate-spin" />{loading ? (signup ? 'Criando conta…' : 'Entrando…') : 'Verificando sessão…'}</> : <>{signup ? 'Criar minha conta' : 'Entrar'}<ArrowRight /></>}</Button>
    </form>
    <div className="form-divider"><span> {signup ? 'JÁ FAZ PARTE?' : 'NOVO POR AQUI?'} </span></div>
    <p className="signup-link">{signup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <Link to={signup ? '/' : '/cadastro'}>{signup ? 'Entrar' : 'Criar conta'}<ArrowUpRightIcon /></Link></p>
    <p className="secure-note"><LockKeyhole size={12} /> Acesso seguro. Descobertas sem limites.</p>
  </div>;
}
function ArrowUpRightIcon() { return <ArrowRight size={14} className="link-arrow" />; }