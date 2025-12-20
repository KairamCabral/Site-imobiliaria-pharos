import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Pharos Negócios Imobiliários',
  description:
    'Termos de Uso completos da Pharos Negócios Imobiliários. Conheça as regras, direitos e responsabilidades para utilização dos nossos serviços imobiliários e plataforma digital. Transparência e segurança jurídica.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Termos de Uso | Pharos Negócios Imobiliários',
    description:
      'Condições claras e transparentes para utilização dos serviços da Pharos. Conheça seus direitos e responsabilidades.',
    type: 'website',
    url: 'https://pharosnegocios.com.br/termos-de-uso',
  },
};

export default function TermosDeUsoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

