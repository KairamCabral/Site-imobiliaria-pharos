import type { Metadata } from 'next';

/**
 * PHAROS - LAYOUT DE FAVORITOS
 * Metadata e configurações SEO para a página de favoritos
 */

export const metadata: Metadata = {
  title: 'Meus Favoritos | Pharos Imobiliária',
  description: 'Organize, compare e compartilhe seus imóveis favoritos. Crie coleções personalizadas e encontre o imóvel perfeito em Balneário Camboriú.',
  robots: {
    index: false, // Página privada, não indexar
    follow: true,
  },
  openGraph: {
    title: 'Meus Favoritos | Pharos Imobiliária',
    description: 'Organize seus imóveis favoritos e encontre o imóvel perfeito em Balneário Camboriú.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function FavoritosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

