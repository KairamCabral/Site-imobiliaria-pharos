/**
 * Structured Data (Schema.org) Utilities
 * 
 * Funções para gerar structured data avançado seguindo schema.org
 * para melhorar SEO e rich snippets do Google.
 */

import type { Imovel, Empreendimento } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.imob.br';

/**
 * Schema de busca no site (SearchAction)
 * Aparece como caixa de busca nos resultados do Google
 */
export function generateSearchActionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Pharos Negócios Imobiliários',
    'url': BASE_URL,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${BASE_URL}/imoveis?termo={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Schema de Organização (Organization)
 * Informações principais da empresa
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    'name': 'Pharos Negócios Imobiliários',
    'legalName': 'Pharos Negócios Imobiliários LTDA',
    'url': BASE_URL,
    'logo': `${BASE_URL}/images/logos/pharos-logo.svg`,
    'image': `${BASE_URL}/images/logos/pharos-logo.svg`,
    'description': 'Imobiliária especializada em imóveis de alto padrão em Balneário Camboriú. Equipe experiente e resultados comprovados.',
    'foundingDate': '2007',
    'taxID': '51.040.966/0001-93',
    'telephone': '+55-47-9-9187-8070',
    'email': 'contato@pharosnegocios.com.br',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Rua 2300, 575, Sala 04',
      'addressLocality': 'Balneário Camboriú',
      'addressRegion': 'SC',
      'postalCode': '88330-428',
      'addressCountry': 'BR',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': -26.9947,
      'longitude': -48.6354,
    },
    'areaServed': [
      {
        '@type': 'City',
        'name': 'Balneário Camboriú',
        '@id': 'https://www.wikidata.org/wiki/Q271269',
      },
      {
        '@type': 'City',
        'name': 'Camboriú',
      },
      {
        '@type': 'City',
        'name': 'Itapema',
      },
    ],
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '09:00',
        'closes': '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': 'Saturday',
        'opens': '09:00',
        'closes': '13:00',
      },
    ],
    'priceRange': '$$$$',
    'sameAs': [
      'https://www.instagram.com/pharosimobiliaria',
      'https://www.youtube.com/@PharosNegociosImobiliarios',
      'https://www.facebook.com/pharosimobiliaria',
    ],
  };
}

/**
 * Schema LocalBusiness completo
 * Para páginas de contato e sobre
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['RealEstateAgent', 'LocalBusiness'],
    '@id': `${BASE_URL}#organization`,
    'name': 'Pharos Negócios Imobiliários',
    'legalName': 'Pharos Negócios Imobiliários LTDA',
    'url': BASE_URL,
    'logo': `${BASE_URL}/images/logos/pharos-logo.svg`,
    'image': [
      `${BASE_URL}/images/logos/pharos-logo.svg`,
      `${BASE_URL}/images/og-image.jpg`,
    ],
    'description': 'Imobiliária especializada em imóveis de alto padrão em Balneário Camboriú e região. Apartamentos, casas, terrenos e empreendimentos exclusivos.',
    'foundingDate': '2007',
    'taxID': '51.040.966/0001-93',
    'telephone': '+55-47-9-9187-8070',
    'email': 'contato@pharosnegocios.com.br',
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+55-47-9-9187-8070',
      'contactType': 'customer service',
      'areaServed': 'BR',
      'availableLanguage': ['Portuguese'],
      'contactOption': ['TollFree'],
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Rua 2300, 575, Sala 04',
      'addressLocality': 'Balneário Camboriú',
      'addressRegion': 'SC',
      'postalCode': '88330-428',
      'addressCountry': 'BR',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': -26.9947,
      'longitude': -48.6354,
    },
    'hasMap': `https://www.google.com/maps?q=-26.9947,-48.6354`,
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '09:00',
        'closes': '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': 'Saturday',
        'opens': '09:00',
        'closes': '13:00',
      },
    ],
    'priceRange': '$$$$',
    'areaServed': [
      {
        '@type': 'City',
        'name': 'Balneário Camboriú',
        '@id': 'https://www.wikidata.org/wiki/Q271269',
      },
      {
        '@type': 'City',
        'name': 'Camboriú',
      },
      {
        '@type': 'City',
        'name': 'Itapema',
      },
    ],
    'sameAs': [
      'https://www.instagram.com/pharosimobiliaria',
      'https://www.youtube.com/@PharosNegociosImobiliarios',
      'https://www.facebook.com/pharosimobiliaria',
    ],
  };
}

/**
 * Schema FAQ (Frequently Asked Questions)
 * Para páginas com perguntas frequentes
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };
}

/**
 * Schema ItemList (Lista de itens)
 * Para listagens de imóveis ou empreendimentos
 */
export function generateItemListSchema(items: Array<{ name: string; url: string; position: number }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': items.map((item) => ({
      '@type': 'ListItem',
      'position': item.position,
      'name': item.name,
      'url': item.url,
    })),
  };
}

/**
 * Schema OfferCatalog
 * Para catálogo de ofertas de imóveis
 */
export function generateOfferCatalogSchema(properties: Partial<Imovel>[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    'name': 'Catálogo de Imóveis Pharos',
    'description': 'Imóveis de alto padrão disponíveis em Balneário Camboriú e região',
    'itemListElement': properties.map((property) => ({
      '@type': 'Offer',
      'itemOffered': {
        '@type': 'RealEstateListing',
        'name': property.titulo,
        'url': `${BASE_URL}/imoveis/${property.codigo}`,
        'offers': {
          '@type': 'Offer',
          'price': property.preco || 0,
          'priceCurrency': 'BRL',
          'availability': property.status === 'disponivel' ? 'InStock' : 'OutOfStock',
        },
      },
    })),
  };
}

/**
 * Schema ImageObject
 * Para galerias de imagens
 */
export function generateImageObjectSchema(images: Array<{ url: string; alt?: string; width?: number; height?: number }>) {
  return images.map((img, index) => ({
    '@type': 'ImageObject',
    'contentUrl': img.url,
    'name': img.alt || `Imagem ${index + 1}`,
    'description': img.alt,
    'encodingFormat': 'image/webp',
    'width': img.width || 1200,
    'height': img.height || 800,
  }));
}

/**
 * Schema VideoObject
 * Para vídeos de imóveis ou tours virtuais
 */
export function generateVideoObjectSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
  embedUrl?: string;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': video.name,
    'description': video.description,
    'thumbnailUrl': video.thumbnailUrl,
    'uploadDate': video.uploadDate,
    'contentUrl': video.contentUrl,
    'embedUrl': video.embedUrl,
    'duration': video.duration, // Formato ISO 8601 (ex: PT5M30S para 5min30s)
  };
}

/**
 * Schema Breadcrumb
 * Para navegação estrutural
 */
export function generateBreadcrumbSchema(items: Array<{ name?: string; label?: string; url?: string; href?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name || item.label || '',
      'item': (item.url || item.href) ? `${BASE_URL}${item.url || item.href}` : undefined,
    })),
  };
}

/**
 * Schema AggregateRating
 * Para avaliações de imóveis ou da empresa
 */
export function generateAggregateRatingSchema(rating: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}) {
  return {
    '@type': 'AggregateRating',
    'ratingValue': rating.ratingValue,
    'reviewCount': rating.reviewCount,
    'bestRating': rating.bestRating || 5,
    'worstRating': rating.worstRating || 1,
  };
}

/**
 * Schema Review
 * Para avaliações individuais
 */
export function generateReviewSchema(review: {
  author: string;
  datePublished: string;
  reviewRating: number;
  reviewBody: string;
}) {
  return {
    '@type': 'Review',
    'author': {
      '@type': 'Person',
      'name': review.author,
    },
    'datePublished': review.datePublished,
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.reviewRating,
      'bestRating': 5,
    },
    'reviewBody': review.reviewBody,
  };
}

/**
 * Schema RealEstateListing completo
 * Para páginas de detalhes de imóveis
 */
export function generateRealEstateListingSchema(property: {
  id: string;
  title: string;
  description?: string;
  type: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  suites?: number;
  parkingSpots?: number;
  address: {
    street?: string;
    neighborhood?: string;
    city: string;
    state: string;
    postalCode?: string;
    country?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  photos?: Array<{ url: string; alt?: string }>;
  features?: string[];
  availability?: 'InStock' | 'SoldOut' | 'PreOrder';
  datePosted?: string;
  yearBuilt?: number;
}) {
  const fullAddress = [
    property.address.street,
    property.address.neighborhood,
    property.address.city,
    property.address.state,
  ]
    .filter(Boolean)
    .join(', ');

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${BASE_URL}/imoveis/${property.id}`,
    'name': property.title,
    'description': property.description || property.title,
    'url': `${BASE_URL}/imoveis/${property.id}`,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': property.address.street || '',
      'addressLocality': property.address.city,
      'addressRegion': property.address.state || 'SC',
      'postalCode': property.address.postalCode || '',
      'addressCountry': property.address.country || 'BR',
    },
  };

  // Preço
  if (property.price > 0) {
    schema.price = {
      '@type': 'PriceSpecification',
      'price': property.price,
      'priceCurrency': 'BRL',
    };
  }

  // Área
  if (property.area > 0) {
    schema.floorSize = {
      '@type': 'QuantitativeValue',
      'value': property.area,
      'unitCode': 'MTK',
      'unitText': 'm²',
    };
  }

  // Quartos
  if (property.bedrooms && property.bedrooms > 0) {
    schema.numberOfRooms = property.bedrooms;
    schema.numberOfBedrooms = property.bedrooms;
  }

  // Banheiros
  if (property.bathrooms && property.bathrooms > 0) {
    schema.numberOfBathroomsTotal = property.bathrooms;
  }

  // Vagas
  if (property.parkingSpots && property.parkingSpots > 0) {
    schema.numberOfParkingSpaces = property.parkingSpots;
  }

  // Localização geográfica
  if (property.location) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      'latitude': property.location.lat,
      'longitude': property.location.lng,
    };
  }

  // Imagens
  if (property.photos && property.photos.length > 0) {
    schema.image = property.photos.slice(0, 10).map((photo) => photo.url);
  }

  // Características/Amenidades
  if (property.features && property.features.length > 0) {
    schema.amenityFeature = property.features.slice(0, 20).map((feature) => ({
      '@type': 'LocationFeatureSpecification',
      'name': feature,
      'value': true,
    }));
  }

  // Disponibilidade
  if (property.availability) {
    schema.availability = `https://schema.org/${property.availability}`;
  }

  // Data de publicação
  if (property.datePosted) {
    schema.datePosted = property.datePosted;
  }

  // Ano de construção
  if (property.yearBuilt) {
    schema.yearBuilt = property.yearBuilt;
  }

  return schema;
}

/**
 * Combinar múltiplos schemas em um único JSON-LD
 */
export function combineSchemas(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

