import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sobre Nós | Pharos Negócios Imobiliários",
  description: "Conheça a Pharos Negócios Imobiliários, sua consultoria especializada em imóveis de alto padrão em Balneário Camboriú. Tradição, excelência e resultados com equipe especializada.",
  keywords: [
    "imobiliária Balneário Camboriú",
    "Pharos",
    "sobre nós",
    "equipe imobiliária",
    "imóveis de luxo",
    "alto padrão",
    "história pharos",
    "corretores especializados"
  ],
  openGraph: {
    title: "Sobre Nós | Pharos Negócios Imobiliários",
    description: "Guiando clientes para o imóvel ideal em Balneário Camboriú. Conheça nossa história, equipe e valores.",
    url: 'https://pharos.imob.br/sobre',
    siteName: 'Pharos Negócios Imobiliários',
    images: [
      {
        url: 'https://pharos.imob.br/images/og-sobre.jpg',
        width: 1200,
        height: 630,
        alt: 'Pharos Negócios Imobiliários - Sobre Nós',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sobre Nós | Pharos Negócios Imobiliários",
    description: "Guiando clientes para o imóvel ideal em Balneário Camboriú. Conheça nossa história, equipe e valores.",
    images: ['https://pharos.imob.br/images/og-sobre.jpg'],
  },
  alternates: {
    canonical: 'https://pharos.imob.br/sobre',
  },
};

