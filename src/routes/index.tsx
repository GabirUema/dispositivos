import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from '@/components/auth-layout';
import { AuthForm } from '@/components/auth-form';

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Entrar | Forma' },
    { name: 'description', content: 'Entre na sua conta Forma e descubra o catálogo de produtos.' },
    { property: 'og:title', content: 'Entrar | Forma' },
    { property: 'og:description', content: 'Seu próximo favorito está aqui. Acesse sua conta Forma.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <AuthLayout><AuthForm /></AuthLayout>;
}
