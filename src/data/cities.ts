// src/data/cities.ts

/**
 * Dados de cidades para SEO Programático
 * Cada cidade tem informações completas para gerar landing pages otimizadas
 */

export interface CityData {
  slug: string;
  name: string;
  state: string;
  population: number;
  description: string;
  neighborhoods: string[];
  highlights: string[];
  averagePrice: number;
  popularTypes: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  imageCover: string;
}

export const CITIES_DATA: CityData[] = [
  {
    slug: 'balneario-camboriu',
    name: 'Balneário Camboriú',
    state: 'SC',
    population: 145000,
    description: 'Conhecida como o "Dubai brasileiro", Balneário Camboriú é um dos destinos mais valorizados do litoral catarinense. Com prédios modernos, infraestrutura completa e praias urbanas, a cidade atrai investidores e moradores de todo o Brasil.',
    neighborhoods: [
      'Centro',
      'Barra Sul',
      'Barra Norte',
      'Pioneiros',
      'Nações',
      'Estados',
      'Praia Brava',
      'Praia dos Amores',
    ],
    highlights: [
      'Pontos Turísticos: Parque Unipraias, Cristo Luz, Avenida Atlântica',
      'Comércio: Shopping Atlântico, Boulevard, comércio de rua',
      'Gastronomia: Restaurantes variados, bares e cafés',
      'Lazer: Praias, parks, ciclovias, vida noturna',
      'Infraestrutura: Hospitais, escolas particulares, universidades',
    ],
    averagePrice: 850000,
    popularTypes: ['Apartamento', 'Cobertura', 'Studio'],
    seoTitle: 'Imóveis em Balneário Camboriú | Apartamentos e Coberturas Alto Padrão',
    seoDescription: 'Encontre apartamentos, coberturas e studios de alto padrão em Balneário Camboriú. Imóveis frente mar, lançamentos e pronto para morar. Confira!',
    keywords: [
      'imóveis balneário camboriú',
      'apartamentos balneário camboriú',
      'cobertura balneário camboriú',
      'imóveis frente mar bc',
      'lançamentos balneário camboriú',
    ],
    imageCover: '/images/cidades/balneario-camboriu.webp',
  },
  {
    slug: 'itajai',
    name: 'Itajaí',
    state: 'SC',
    population: 220000,
    description: 'Maior porto do Brasil, Itajaí é uma cidade dinâmica e em constante crescimento. Com economia forte baseada em comércio exterior, pesca e turismo, oferece excelente qualidade de vida e oportunidades de investimento imobiliário.',
    neighborhoods: [
      'Centro',
      'Fazenda',
      'Praia Brava',
      'Cordeiros',
      'Cabeçudas',
      'São João',
      'Cidade Nova',
    ],
    highlights: [
      'Porto: Maior porto do Brasil em movimentação de contêineres',
      'Economia: Comércio exterior, pesca, náutica',
      'Educação: Univali, escolas de qualidade',
      'Saúde: Hospital Marieta Konder Bornhausen, clínicas',
      'Lazer: Praias, Beira Rio, parques, museus',
    ],
    averagePrice: 520000,
    popularTypes: ['Apartamento', 'Casa', 'Terreno'],
    seoTitle: 'Imóveis em Itajaí SC | Casas, Apartamentos e Terrenos',
    seoDescription: 'Imóveis em Itajaí: apartamentos, casas e terrenos em bairros valorizados. Cidade do maior porto do Brasil. Invista em Itajaí!',
    keywords: [
      'imóveis itajaí',
      'apartamentos itajaí',
      'casas itajaí',
      'terrenos itajaí',
      'imóveis praia brava itajaí',
    ],
    imageCover: '/images/cidades/itajai.webp',
  },
  {
    slug: 'itapema',
    name: 'Itapema',
    state: 'SC',
    population: 65000,
    description: 'Cidade litorânea com clima tranquilo e praias paradisíacas. Itapema oferece qualidade de vida excepcional, sendo ideal para quem busca morar perto da natureza sem abrir mão da infraestrutura urbana.',
    neighborhoods: [
      'Centro',
      'Meia Praia',
      'Morretes',
      'Ilhota',
      'Canto da Praia',
    ],
    highlights: [
      'Praias: Meia Praia (8km de extensão), Canto da Praia',
      'Qualidade de vida: Tranquilidade, segurança, natureza',
      'Infraestrutura: Comércio completo, escolas, hospitais',
      'Gastronomia: Restaurantes frutos do mar',
      'Eventos: Festas tradicionais, mercado público',
    ],
    averagePrice: 620000,
    popularTypes: ['Apartamento', 'Casa', 'Cobertura'],
    seoTitle: 'Imóveis em Itapema SC | Apartamentos e Casas na Praia',
    seoDescription: 'Imóveis em Itapema: apartamentos e casas próximos à Meia Praia. Tranquilidade e qualidade de vida no litoral de SC.',
    keywords: [
      'imóveis itapema',
      'apartamentos itapema',
      'casas itapema',
      'imóveis meia praia',
      'lançamentos itapema',
    ],
    imageCover: '/images/cidades/itapema.webp',
  },
  {
    slug: 'camboriu',
    name: 'Camboriú',
    state: 'SC',
    population: 80000,
    description: 'Vizinha de Balneário Camboriú, a cidade de Camboriú (sem o "Balneário") oferece imóveis mais acessíveis mantendo proximidade com todas as comodidades da região. Ideal para famílias e investidores.',
    neighborhoods: [
      'Centro',
      'Tabuleiro',
      'Monte Alegre',
      'Rio Pequeno',
    ],
    highlights: [
      'Proximidade: 5-10 min de Balneário Camboriú',
      'Custo-benefício: Imóveis até 40% mais acessíveis',
      'Tranquilidade: Menos movimento que BC',
      'Infraestrutura: Comércio, escolas, hospitais',
      'Natureza: Áreas verdes, rios, trilhas',
    ],
    averagePrice: 420000,
    popularTypes: ['Casa', 'Apartamento', 'Terreno'],
    seoTitle: 'Imóveis em Camboriú SC | Casas e Apartamentos',
    seoDescription: 'Imóveis em Camboriú com excelente custo-benefício. Pertinho de Balneário Camboriú, com toda infraestrutura. Confira!',
    keywords: [
      'imóveis camboriú',
      'casas camboriú',
      'apartamentos camboriú',
      'terrenos camboriú',
      'imóveis camboriú sc',
    ],
    imageCover: '/images/cidades/camboriu.webp',
  },
  {
    slug: 'navegantes',
    name: 'Navegantes',
    state: 'SC',
    population: 75000,
    description: 'Cidade portuária com aeroporto internacional, Navegantes está em plena expansão. Oferece imóveis com preços competitivos e excelente potencial de valorização.',
    neighborhoods: [
      'Centro',
      'Gravatá',
      'São Pedro',
      'Morretes',
    ],
    highlights: [
      'Aeroporto: Aeroporto Internacional Ministro Victor Konder',
      'Porto: Porto de Navegantes (segundo maior de SC)',
      'Emprego: Oportunidades em logística, turismo',
      'Crescimento: Cidade em expansão',
      'Praias: 8km de praias tranquilas',
    ],
    averagePrice: 380000,
    popularTypes: ['Apartamento', 'Casa', 'Terreno'],
    seoTitle: 'Imóveis em Navegantes SC | Apartamentos e Casas Perto do Aeroporto',
    seoDescription: 'Imóveis em Navegantes: casas e apartamentos próximos ao aeroporto. Cidade em crescimento com preços atrativos.',
    keywords: [
      'imóveis navegantes',
      'apartamentos navegantes',
      'casas navegantes',
      'imóveis perto aeroporto',
      'investir navegantes',
    ],
    imageCover: '/images/cidades/navegantes.webp',
  },
  {
    slug: 'bombinhas',
    name: 'Bombinhas',
    state: 'SC',
    population: 20000,
    description: 'Península paradisíaca com as praias mais cristalinas de Santa Catarina. Bombinhas é destino certo para quem busca natureza preservada, mergulho e qualidade de vida em contato com o mar.',
    neighborhoods: [
      'Centro',
      'Bombas',
      'Bombinhas',
      'Quatro Ilhas',
      'Mariscal',
      'Canto Grande',
    ],
    highlights: [
      'Praias: 39 praias paradisíacas na península',
      'Mergulho: Melhor ponto de mergulho de SC',
      'Natureza: Mata Atlântica preservada',
      'Turismo: Alta temporada movimentada',
      'Qualidade de vida: Clima tropical, segurança',
    ],
    averagePrice: 680000,
    popularTypes: ['Casa', 'Apartamento', 'Terreno'],
    seoTitle: 'Imóveis em Bombinhas SC | Casas e Apartamentos na Praia',
    seoDescription: 'Imóveis em Bombinhas: casas e apartamentos em frente às praias mais lindas de SC. Península paradisíaca com 39 praias.',
    keywords: [
      'imóveis bombinhas',
      'casas bombinhas',
      'apartamentos bombinhas',
      'imóveis praia bombinhas',
      'terrenos bombinhas',
    ],
    imageCover: '/images/cidades/bombinhas.webp',
  },
  {
    slug: 'porto-belo',
    name: 'Porto Belo',
    state: 'SC',
    population: 22000,
    description: 'Cidade histórica com vocação náutica e turística. Porto Belo oferece praias tranquilas, marina completa e infraestrutura consolidada, sendo excelente opção para investimento e moradia.',
    neighborhoods: [
      'Centro',
      'Perequê',
      'Porto Belo Centro',
      'Araçá',
      'Caixa D\'Aço',
    ],
    highlights: [
      'Náutica: Maior marina da América Latina',
      'Praias: Perequê, Araçá, Caixa D\'Aço',
      'História: Patrimônio histórico preservado',
      'Infraestrutura: Comércio, escolas, saúde',
      'Turismo: Passeios de barco, mergulho',
    ],
    averagePrice: 580000,
    popularTypes: ['Casa', 'Apartamento', 'Cobertura'],
    seoTitle: 'Imóveis em Porto Belo SC | Casas e Apartamentos',
    seoDescription: 'Imóveis em Porto Belo: casas e apartamentos perto da marina e praias. Cidade histórica com infraestrutura completa.',
    keywords: [
      'imóveis porto belo',
      'casas porto belo',
      'apartamentos porto belo',
      'imóveis marina porto belo',
      'investir porto belo',
    ],
    imageCover: '/images/cidades/porto-belo.webp',
  },
  {
    slug: 'picarras',
    name: 'Balneário Piçarras',
    state: 'SC',
    population: 25000,
    description: 'Cidade tranquila e acolhedora, ideal para famílias. Balneário Piçarras oferece praias calmas, segurança e custo de vida acessível, mantendo proximidade com as principais cidades da região.',
    neighborhoods: [
      'Centro',
      'Itacolomi',
      'Areias de Piçarras',
      'Barra do Sul',
    ],
    highlights: [
      'Família: Cidade tranquila e segura',
      'Praias: 12km de praias calmas',
      'Pesca: Tradição pesqueira',
      'Custo: Imóveis mais acessíveis',
      'Localização: Entre Balneário Camboriú e Penha',
    ],
    averagePrice: 420000,
    popularTypes: ['Casa', 'Apartamento', 'Terreno'],
    seoTitle: 'Imóveis em Balneário Piçarras SC | Casas e Apartamentos',
    seoDescription: 'Imóveis em Balneário Piçarras: casas e apartamentos em cidade tranquila com praias calmas. Ideal para famílias.',
    keywords: [
      'imóveis piçarras',
      'casas piçarras',
      'apartamentos piçarras',
      'imóveis balneário piçarras',
      'morar piçarras',
    ],
    imageCover: '/images/cidades/picarras.webp',
  },
  {
    slug: 'penha',
    name: 'Penha',
    state: 'SC',
    population: 35000,
    description: 'Conhecida pelo Beto Carrero World, Penha é uma cidade em crescimento com boas oportunidades de investimento. Oferece praias, parques temáticos e infraestrutura em expansão.',
    neighborhoods: [
      'Centro',
      'Armação',
      'Praia Grande',
      'Piçarras',
      'Trapiche',
    ],
    highlights: [
      'Turismo: Beto Carrero World (maior parque da AL)',
      'Praias: Armação, Praia Grande',
      'Crescimento: Cidade em desenvolvimento',
      'Emprego: Turismo, comércio',
      'Acesso: BR-101, aeroporto próximo',
    ],
    averagePrice: 450000,
    popularTypes: ['Casa', 'Apartamento', 'Terreno'],
    seoTitle: 'Imóveis em Penha SC | Casas e Apartamentos Perto do Beto Carrero',
    seoDescription: 'Imóveis em Penha: casas e apartamentos em cidade turística com Beto Carrero World. Oportunidade de investimento.',
    keywords: [
      'imóveis penha',
      'casas penha',
      'apartamentos penha',
      'imóveis beto carrero',
      'investir penha',
    ],
    imageCover: '/images/cidades/penha.webp',
  },
  {
    slug: 'barra-velha',
    name: 'Barra Velha',
    state: 'SC',
    population: 30000,
    description: 'Cidade litorânea tranquila com belas praias e natureza preservada. Barra Velha oferece qualidade de vida excepcional e imóveis com preços atrativos, sendo ideal para quem busca paz e proximidade com o mar.',
    neighborhoods: [
      'Centro',
      'Itajuba',
      'São Cristóvão',
      'Tifa Martins',
    ],
    highlights: [
      'Praias: Extensas e preservadas',
      'Natureza: Rios, manguezais, fauna rica',
      'Tranquilidade: Cidade pacata',
      'Custo-benefício: Preços acessíveis',
      'Pesca: Tradição pesqueira forte',
    ],
    averagePrice: 380000,
    popularTypes: ['Casa', 'Terreno', 'Apartamento'],
    seoTitle: 'Imóveis em Barra Velha SC | Casas e Terrenos na Praia',
    seoDescription: 'Imóveis em Barra Velha: casas e terrenos em praias preservadas. Tranquilidade e custo-benefício no litoral norte de SC.',
    keywords: [
      'imóveis barra velha',
      'casas barra velha',
      'terrenos barra velha',
      'imóveis praia barra velha',
      'morar barra velha',
    ],
    imageCover: '/images/cidades/barra-velha.webp',
  },
];

/**
 * Helper para encontrar cidade por slug
 */
export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES_DATA.find((city) => city.slug === slug);
}

/**
 * Helper para gerar URL da cidade
 */
export function getCityUrl(slug: string): string {
  return `/imoveis/cidade/${slug}`;
}

/**
 * Todas as cidades disponíveis (para sitemap)
 */
export function getAllCities(): CityData[] {
  return CITIES_DATA;
}

