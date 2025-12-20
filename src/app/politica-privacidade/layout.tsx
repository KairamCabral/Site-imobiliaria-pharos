import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade e LGPD | Pharos Negócios Imobiliários',
  description:
    'Política completa de privacidade e proteção de dados da Pharos Negócios Imobiliários. Entenda como coletamos, utilizamos e protegemos seus dados pessoais em conformidade com a LGPD. Transparência, segurança e respeito aos seus direitos.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Política de Privacidade | Pharos Negócios Imobiliários',
    description:
      'Transparência total sobre o uso de dados pessoais conforme a LGPD. Conheça seus direitos e como exercê-los. Proteção de dados com segurança e responsabilidade.',
    type: 'website',
    url: 'https://pharosnegocios.com.br/politica-privacidade',
  },
};

export default function PoliticaPrivacidadeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

