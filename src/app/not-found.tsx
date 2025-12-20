import { Metadata } from 'next';
import NotFoundClient from '@/components/404/NotFoundClient';
import SmartSuggestions from '@/components/404/SmartSuggestions';

/**
 * Página 404 Premium - Pharos Negócios Imobiliários
 * 
 * Features:
 * - SEO otimizado com metadata e structured data
 * - UI/UX avançado com animações sutis
 * - Analytics integrado para tracking de erros
 * - Sugestões inteligentes de imóveis
 * - Busca inline para rápida recuperação
 * - Acessibilidade WCAG 2.1 AA
 */

// Metadata SEO otimizado
export const metadata: Metadata = {
  title: 'Página Não Encontrada | Pharos Negócios Imobiliários',
  description: 'A página que você procura não existe. Explore nossos imóveis de alto padrão em Balneário Camboriú e região.',
  robots: {
    index: false, // Não indexar páginas 404
    follow: true, // Mas seguir os links
  },
  openGraph: {
    title: 'Página Não Encontrada | Pharos Negócios Imobiliários',
    description: 'A página que você procura não existe. Explore nossos imóveis de alto padrão.',
    type: 'website',
  },
};

export default function NotFound() {
  // Structured Data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Página Não Encontrada',
    description: 'Página de erro 404 da Pharos Negócios Imobiliários',
    url: 'https://pharosimoveis.com.br/404',
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Pharos Negócios Imobiliários',
      url: 'https://pharosimoveis.com.br',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://pharosimoveis.com.br',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Página Não Encontrada',
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Main Content - Client Component com interatividade */}
      <NotFoundClient />

      {/* Smart Suggestions - Server Component com dados da API */}
      <SmartSuggestions />
    </>
  );
}

