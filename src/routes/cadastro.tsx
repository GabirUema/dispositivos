import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/components/auth-layout';
import { AuthForm } from '@/components/auth-form';
export const Route = createFileRoute('/cadastro')({
  head: () => ({ meta: [
    { title: 'Criar conta | Forma' },
    { name: 'description', content: 'Crie sua conta Forma para explorar o catálogo de produtos.' },
    { property: 'og:title', content: 'Criar conta | Forma' },
    { property: 'og:description', content: 'Novas descobertas começam com você. Cadastre-se na Forma.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <AuthLayout><AuthForm signup /></AuthLayout>,
});