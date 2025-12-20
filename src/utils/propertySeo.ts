/**
 * PHAROS - Property SEO Utilities
 * 
 * Utilitários para gerar:
 * - Metadata (title, description, OG, Twitter)
 * - JSON-LD (RealEstateListing + Offer)
 */

export interface PropertySeoData {
  id: string;
  code: string;
  title: string;
  description: string;
  price: number;
  address: {
    street?: string;
    number?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode?: string;
    country?: string;
  };
  specs: {
    bedrooms?: number;
    bathrooms?: number;
    parkingSpots?: number;
    privateArea?: number;
    totalArea?: number;
  };
  photos: { url: string }[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  updatedAt?: string;
  realtor?: {
    name: string;
    phone?: string;
    email?: string;
  };
}

/**
 * Gera o JSON-LD para RealEstateListing + Offer
 */
export function generatePropertyJsonLd(property: PropertySeoData): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.com.br';

  const propertyUrl = `${baseUrl}/imoveis/${property.code}`;
  
  const address = {
    '@type': 'PostalAddress',
    streetAddress: [property.address.street, property.address.number]
      .filter(Boolean)
      .join(', '),
    addressLocality: property.address.city,
    addressRegion: property.address.state,
    postalCode: property.address.zipCode || undefined,
    addressCountry: property.address.country || 'BR',
  };

  const geo = property.coordinates
    ? {
        '@type': 'GeoCoordinates',
        latitude: property.coordinates.lat,
        longitude: property.coordinates.lng,
      }
    : undefined;

  const offer = {
    '@type': 'Offer',
    price: property.price,
    priceCurrency: 'BRL',
    availability: 'https://schema.org/InStock',
    url: propertyUrl,
    priceValidUntil: property.updatedAt
      ? new Date(
          new Date(property.updatedAt).getTime() + 90 * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0]
      : undefined,
    seller: property.realtor
      ? {
          '@type': 'RealEstateAgent',
          name: property.realtor.name,
          telephone: property.realtor.phone,
          email: property.realtor.email,
        }
      : {
          '@type': 'RealEstateAgent',
          name: 'Pharos Negócios Imobiliários',
          telephone: '+55 47 3366-0000',
        },
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: propertyUrl,
    image: property.photos
      .slice(0, 5)
      .map((p) => p.url),
    address,
    geo,
    numberOfRooms: property.specs.bedrooms,
    numberOfBathroomsTotal: property.specs.bathrooms,
    floorSize: property.specs.privateArea
      ? {
          '@type': 'QuantitativeValue',
          value: property.specs.privateArea,
          unitCode: 'MTK', // Metro quadrado
        }
      : undefined,
    offers: offer,
    datePosted: property.updatedAt,
  };

  // Remover campos undefined
  const cleanedJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return JSON.stringify(cleanedJsonLd);
}

/**
 * Gera os metadados para <head>
 */
export function generatePropertyMetadata(property: PropertySeoData) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.com.br';

  const propertyUrl = `${baseUrl}/imoveis/${property.code}`;
  
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  const title = `${property.title} - ${formattedPrice} | Pharos Imóveis`;
  
  const description = `${property.title} em ${property.address.neighborhood}, ${property.address.city}/${property.address.state}. ${
    property.specs.bedrooms ? `${property.specs.bedrooms} quarto${property.specs.bedrooms > 1 ? 's' : ''}` : ''
  }${
    property.specs.privateArea ? `, ${property.specs.privateArea}m²` : ''
  }. ${formattedPrice}. Confira!`;

  const ogImage = property.photos[0]?.url || `${baseUrl}/images/og-default.jpg`;

  return {
    title,
    description,
    canonical: propertyUrl,
    openGraph: {
      title,
      description,
      url: propertyUrl,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      siteName: 'Pharos Negócios Imobiliários',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      site: '@pharosimoveis', // Ajustar se houver Twitter
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

