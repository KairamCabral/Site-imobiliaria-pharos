import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Cookies | Pharos Negócios Imobiliários',
  description:
    'Entenda como a Pharos utiliza cookies e tecnologias similares para melhorar sua experiência de navegação. Política completa, transparente e com instruções detalhadas para gerenciar suas preferências.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Política de Cookies | Pharos Negócios Imobiliários',
    description:
      'Saiba como usamos cookies, para que servem e como você pode gerenciá-los. Transparência total sobre tecnologias de rastreamento.',
    type: 'website',
    url: 'https://pharosnegocios.com.br/politica-cookies',
  },
};

export default function PoliticaCookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

