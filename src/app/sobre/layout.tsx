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
        url: 'https://pharos.imob.br/images/banners/balneario-camboriu.webp',
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
    images: ['https://pharos.imob.br/images/banners/balneario-camboriu.webp'],
  },
  alternates: {
    canonical: 'https://pharos.imob.br/sobre',
  },
};

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Pharos Negócios Imobiliários',
    legalName: 'Pharos Negócios Imobiliários LTDA',
    taxID: '51.040.966/0001-93',
    foundingDate: '2007',
    description: 'Excelência em negócios imobiliários de alto padrão em Balneário Camboriú',
    image: 'https://pharos.imob.br/images/logos/pharos-logo.svg',
    '@id': 'https://pharos.imob.br',
    url: 'https://pharos.imob.br',
    telephone: '+55-47-9-9187-8070',
    email: 'contato@pharosnegocios.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua 2300, 575, Sala 04',
      addressLocality: 'Balneário Camboriú',
      addressRegion: 'SC',
      postalCode: '88330-428',
      addressCountry: 'BR'
    },
    areaServed: {
      '@type': 'City',
      name: 'Balneário Camboriú',
      '@id': 'https://www.wikidata.org/wiki/Q271269'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '13:00'
      }
    ],
    sameAs: [
      'https://www.instagram.com/pharosimobiliaria',
      'https://www.youtube.com/@PharosNegociosImobiliarios'
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {children}
    </>
  );
}

