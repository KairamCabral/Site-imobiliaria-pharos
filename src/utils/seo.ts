/**
 * Utilitários de SEO e Schema Markup
 * Otimizado para Google, Bing e IAs (ChatGPT, Perplexity, etc)
 */

import type {
  Imovel,
  Empreendimento,
  BreadcrumbItem,
  SchemaOrganization,
  SchemaRealEstateListing,
  SchemaApartmentComplex,
  SchemaBreadcrumbList,
} from '@/types';

/**
 * Converte texto para slug URL-friendly
 * @param text - Texto para converter
 * @returns Slug formatado
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w\-]+/g, '') // Remove caracteres especiais
    .replace(/\-\-+/g, '-') // Substitui múltiplos hífens por um único
    .replace(/^-+/, '') // Remove hífens do início
    .replace(/-+$/, ''); // Remove hífens do final
}

/**
 * Gera slug para imóvel
 * @param imovel - Dados do imóvel
 * @returns Slug otimizado para SEO
 */
export function gerarSlugImovel(imovel: {
  tipo: string;
  titulo?: string;
  quartos?: number;
  area?: number;
  bairro?: string;
  cidade?: string;
}): string {
  const partes: string[] = [];
  
  // Tipo do imóvel
  partes.push(imovel.tipo);
  
  // Título simplificado ou características
  if (imovel.titulo) {
    const tituloSimplificado = imovel.titulo
      .toLowerCase()
      .replace(/apartamento|casa|cobertura|imóvel/gi, '')
      .trim();
    if (tituloSimplificado) {
      partes.push(tituloSimplificado);
    }
  }
  
  // Área
  if (imovel.area) {
    partes.push(`${imovel.area}m2`);
  }
  
  // Quartos
  if (imovel.quartos) {
    partes.push(`${imovel.quartos}-quartos`);
  }
  
  // Localização
  if (imovel.bairro) {
    partes.push(imovel.bairro);
  }
  if (imovel.cidade) {
    partes.push(imovel.cidade);
  }
  
  return slugify(partes.join(' '));
}

/**
 * Gera slug para empreendimento
 * @param empreendimento - Dados do empreendimento
 * @returns Slug otimizado para SEO
 */
export function gerarSlugEmpreendimento(empreendimento: {
  nome: string;
  bairro?: string;
  cidade?: string;
}): string {
  const partes: string[] = [empreendimento.nome];
  
  if (empreendimento.bairro) {
    partes.push(empreendimento.bairro);
  }
  if (empreendimento.cidade) {
    partes.push(empreendimento.cidade);
  }
  
  return slugify(partes.join(' '));
}

/**
 * Formata preço em reais
 * @param valor - Valor numérico
 * @returns String formatada (ex: "R$ 1.500.000")
 */
export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formata área em metros quadrados
 * @param area - Área numérica
 * @returns String formatada (ex: "220 m²")
 */
export function formatarArea(area: number): string {
  return `${area.toLocaleString('pt-BR')} m²`;
}

/**
 * Gera Schema.org Organization para a empresa
 */
export function gerarSchemaOrganization(): SchemaOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Pharos Negócios Imobiliários',
    description: 'Imobiliária especializada em imóveis de alto padrão em Balneário Camboriú e região',
    url: 'https://pharosnegocios.com.br',
    logo: 'https://pharosnegocios.com.br/logo-pharos-new.svg',
    telephone: '+55-47-9-9187-8070',
    email: 'contato@pharosnegocios.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua 2300, 575, Sala 04',
      addressLocality: 'Balneário Camboriú',
      addressRegion: 'SC',
      postalCode: '88330-428',
      addressCountry: 'BR',
    },
    sameAs: [
      'https://www.instagram.com/pharosimobiliaria',
      'https://www.youtube.com/@PharosNegociosImobiliarios',
    ],
  };
}

/**
 * Gera Schema.org RealEstateListing para um imóvel
 */
export function gerarSchemaImovel(imovel: Imovel, url: string): SchemaRealEstateListing {
  // Garantir que galeria seja array
  const galeria = Array.isArray(imovel.galeria) ? imovel.galeria : [];
  const imagens = [imovel.imagemCapa, ...galeria].filter(Boolean);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.titulo,
    description: imovel.descricao,
    url,
    image: imagens,
    offers: {
      '@type': 'Offer',
      price: imovel.preco,
      priceCurrency: 'BRL',
      availability: imovel.status === 'disponivel' 
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      validFrom: imovel.publicadoEm || imovel.createdAt,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${imovel.endereco?.rua || ''}, ${imovel.endereco?.numero || ''}`,
      addressLocality: imovel.endereco?.cidade || '',
      addressRegion: imovel.endereco?.estado || '',
      postalCode: imovel.endereco?.cep || '',
      addressCountry: 'BR',
    },
    geo: imovel.endereco?.coordenadas ? {
      '@type': 'GeoCoordinates',
      latitude: imovel.endereco.coordenadas.latitude,
      longitude: imovel.endereco.coordenadas.longitude,
    } : undefined,
    numberOfRooms: imovel.quartos,
    numberOfBathroomsTotal: imovel.banheiros,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: imovel.areaTotal,
      unitCode: 'MTK',
    },
  };
}

/**
 * Gera Schema.org ApartmentComplex para um empreendimento
 */
export function gerarSchemaEmpreendimento(
  empreendimento: Empreendimento,
  url: string
): SchemaApartmentComplex {
  return {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: empreendimento.nome || 'Empreendimento',
    description: empreendimento.descricao || '',
    url,
    image: [empreendimento.imagemCapa || '', ...(empreendimento.galeria || [])].filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${empreendimento.endereco?.rua || ''}, ${empreendimento.endereco?.numero || ''}`,
      addressLocality: empreendimento.endereco?.cidade || '',
      addressRegion: empreendimento.endereco?.estado || '',
      postalCode: empreendimento.endereco?.cep || '',
      addressCountry: 'BR',
    },
    geo: empreendimento.endereco?.coordenadas ? {
      '@type': 'GeoCoordinates',
      latitude: empreendimento.endereco.coordenadas.latitude,
      longitude: empreendimento.endereco.coordenadas.longitude,
    } : undefined,
    amenityFeature: [
      ...(empreendimento.lazer || []).map((item) => ({
        '@type': 'LocationFeatureSpecification' as const,
        name: item,
        value: true,
      })),
      ...(empreendimento.areasComuns || []).map((item) => ({
        '@type': 'LocationFeatureSpecification' as const,
        name: item,
        value: true,
      })),
    ],
  };
}

/**
 * Gera Schema.org BreadcrumbList
 */
export function gerarSchemaBreadcrumb(
  items: BreadcrumbItem[],
  baseUrl: string
): SchemaBreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label || item.name || '',
      item: `${baseUrl}${item.href}`,
    })),
  };
}

/**
 * Gera meta tags Open Graph para imóvel
 */
export function gerarOpenGraphImovel(imovel: Imovel, url: string) {
  return {
    title: imovel.metaTitle,
    description: imovel.metaDescription,
    url,
    siteName: 'Pharos Negócios Imobiliários',
    images: [
      {
        url: imovel.imagemCapa,
        width: 1200,
        height: 630,
        alt: imovel.titulo,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  };
}

/**
 * Gera meta tags Open Graph para empreendimento
 */
export function gerarOpenGraphEmpreendimento(empreendimento: Empreendimento, url: string) {
  return {
    title: empreendimento.metaTitle,
    description: empreendimento.metaDescription,
    url,
    siteName: 'Pharos Negócios Imobiliários',
    images: [
      {
        url: empreendimento.imagemCapa,
        width: 1200,
        height: 630,
        alt: empreendimento.nome,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  };
}

/**
 * Gera título de página otimizado para SEO
 */
export function gerarTituloSEO(titulo: string, sufixo: string = 'Pharos Negócios Imobiliários'): string {
  return `${titulo} | ${sufixo}`;
}

/**
 * Trunca texto mantendo palavras completas
 */
export function truncarTexto(texto: string, limite: number = 160): string {
  if (texto.length <= limite) return texto;
  
  const textoTruncado = texto.substring(0, limite);
  const ultimoEspaco = textoTruncado.lastIndexOf(' ');
  
  return ultimoEspaco > 0
    ? textoTruncado.substring(0, ultimoEspaco) + '...'
    : textoTruncado + '...';
}

/**
 * Gera URL canônica
 */
export function gerarCanonicalUrl(path: string, baseUrl: string = 'https://pharosnegocios.com.br'): string {
  // Remove trailing slash e garante que começa com /
  const cleanPath = path.replace(/\/$/, '').replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Gera keywords otimizadas
 */
export function gerarKeywords(base: string[]): string {
  return base.join(', ');
}

/**
 * Converte status do imóvel para português
 */
export function traduzirStatus(status?: string): string {
  if (!status) return 'Status não informado';
  
  const traducoes: Record<string, string> = {
    disponivel: 'Disponível',
    reservado: 'Reservado',
    vendido: 'Vendido',
    alugado: 'Alugado',
    lancamento: 'Lançamento',
    'em-construcao': 'Em Construção',
    pronto: 'Pronto para Morar',
    entregue: 'Entregue',
  };
  
  return traducoes[status] || status;
}

/**
 * Gera breadcrumbs para página de imóvel
 */
export function gerarBreadcrumbsImovel(imovel: Imovel): BreadcrumbItem[] {
  return [
    { name: 'Home', label: 'Home', href: '/' },
    { name: 'Imóveis', label: 'Imóveis', href: '/imoveis' },
    { name: imovel.titulo, label: imovel.titulo, href: `/imoveis/${imovel.slug}`, current: true },
  ];
}

/**
 * Gera breadcrumbs para página de empreendimento
 */
export function gerarBreadcrumbsEmpreendimento(empreendimento: Empreendimento): BreadcrumbItem[] {
  return [
    { name: 'Home', label: 'Home', href: '/' },
    { name: 'Empreendimentos', label: 'Empreendimentos', href: '/empreendimentos' },
    { name: empreendimento.nome, label: empreendimento.nome, href: `/empreendimentos/${empreendimento.slug}`, current: true },
  ];
}

