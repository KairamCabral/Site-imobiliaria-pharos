/**
 * Utilitários para otimização de payload de propriedades
 * Reduz tamanho de dados transferidos e cacheados
 */

import type { Property } from '@/domain/models';

/**
 * Interface para propriedade otimizada (listagem)
 * Contém apenas campos essenciais para cards/grid
 */
export interface OptimizedProperty {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  tipoImovel: string; // Tipo formatado para exibição
  categoria: string;
  preco: number;
  precoFormatado?: string;
  
  // Imagens (limitadas para performance) - USAR GALERIA para compatibilidade
  imagem: string; // Compatibilidade
  galeria: string[]; // Array limitado (máximo 3 para cards) - esperado pelo adaptarImovel
  imagens: string[]; // Alias para galeria
  thumbnail?: string;
  
  // Características essenciais
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  area: number;
  areaTotal?: number;
  
  // Localização mínima
  cidade: string;
  bairro: string;
  estado: string;
  endereco?: string;
  
  // Flags de priorização e visibilidade
  destaque?: boolean;
  lancamento?: boolean;
  exclusivo?: boolean;
  temPlaca?: boolean;
  superDestaque?: boolean;
  destaqueWeb?: boolean;
  
  // Coordenadas (se disponíveis)
  latitude?: number | null;
  longitude?: number | null;
  
  // Dados úteis
  distanciaMar?: number;
  distancia_mar_m?: number;
  empreendimento?: string;
  slug: string;
  
  // Opcionais para compatibilidade
  precoAntigo?: number;
  condominio?: number;
  iptu?: number;
  caracteristicasImovel?: string[];
  caracteristicasLocalizacao?: string[];
  vistaParaMar?: boolean;
  mobiliado?: boolean;
}

/**
 * Otimiza uma propriedade para listagem/grid
 * Remove campos pesados e desnecessários
 */
export function optimizePropertyForList(property: Property): OptimizedProperty {
  // Limitar imagens a 3 para cards (balance entre UX e performance)
  const photos = property.photos || [];
  const limitedImages = photos.slice(0, 3).map(p => {
    if (typeof p === 'string') return p;
    if (p && typeof p === 'object' && 'url' in p) return p.url;
    return '';
  }).filter(Boolean);
  
  return {
    id: property.id,
    codigo: property.code,
    titulo: property.title,
    tipo: property.type,
    tipoImovel: property.type || 'Imóvel', // Tipo formatado
    categoria: property.purpose,
    preco: property.pricing?.sale || property.pricing?.rent || 0,
    precoAntigo: undefined,
    
    // Usar 'galeria' para compatibilidade com adaptarImovel
    imagem: limitedImages[0] || '',
    galeria: limitedImages, // ✅ CORRIGIDO: era 'imagens', agora é 'galeria'
    imagens: limitedImages, // Alias para compatibilidade
    thumbnail: photos[0]?.thumbnail,
    
    // Características
    quartos: property.specs?.bedrooms || 0,
    suites: property.specs?.suites || 0,
    banheiros: property.specs?.bathrooms || 0,
    vagas: property.specs?.parkingSpots || 0,
    area: property.specs?.totalArea || property.specs?.area || 0,
    areaTotal: property.specs?.totalArea,
    
    // Localização
    cidade: property.address?.city || '',
    bairro: property.address?.neighborhood || '',
    estado: property.address?.state || '',
    endereco: property.address ? `${property.address.street || ''}, ${property.address.number || ''}`.trim() : '',
    
    // Flags de priorização
    destaque: property.isHighlight || property.webHighlight || false,
    lancamento: property.isLaunch || false,
    exclusivo: property.isExclusive || false,
    temPlaca: property.hasSignboard || false,
    superDestaque: property.superHighlight || false,
    destaqueWeb: property.webHighlight || false,
    
    // Coordenadas
    latitude: property.address?.coordinates?.lat || null,
    longitude: property.address?.coordinates?.lng || null,
    
    // Extras úteis
    distanciaMar: property.distanciaMar,
    distancia_mar_m: property.distanciaMar,
    empreendimento: property.buildingName,
    slug: property.slug || `${property.type}-${property.code}`.toLowerCase(),
    
    // Opcionais para compatibilidade
    condominio: property.pricing?.condo,
    iptu: property.pricing?.iptu,
    caracteristicasImovel: Array.isArray(property.features?.property) ? property.features.property : [],
    caracteristicasLocalizacao: Array.isArray(property.features?.location) ? property.features.location : [],
    vistaParaMar: Array.isArray(property.features?.property) ? property.features.property.includes('Vista para o mar') : false,
    mobiliado: Array.isArray(property.features?.property) ? property.features.property.includes('Mobiliado') : false,
  };
}

/**
 * Otimiza array de propriedades
 */
export function optimizePropertiesForList(properties: Property[]): OptimizedProperty[] {
  return properties.map(optimizePropertyForList);
}

/**
 * Estima tamanho do payload em bytes (aproximado)
 */
export function estimatePayloadSize(data: any): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    // Fallback: estimativa simples
    return JSON.stringify(data).length;
  }
}

/**
 * Formata tamanho em formato legível
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Valida se propriedade tem coordenadas válidas
 */
export function hasValidCoordinates(property: OptimizedProperty | Property): boolean {
  // Para OptimizedProperty
  if ('latitude' in property && 'longitude' in property) {
    return !!(
      property.latitude &&
      property.longitude &&
      !isNaN(property.latitude) &&
      !isNaN(property.longitude) &&
      property.latitude >= -90 &&
      property.latitude <= 90 &&
      property.longitude >= -180 &&
      property.longitude <= 180
    );
  }
  
  // Para Property
  if ('address' in property) {
    const lat = property.address?.coordinates?.lat;
    const lng = property.address?.coordinates?.lng;
    return !!(
      lat &&
      lng &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }
  
  return false;
}

/**
 * Filtra propriedades com coordenadas válidas
 */
export function filterPropertiesWithCoordinates<T extends OptimizedProperty | Property>(
  properties: T[]
): T[] {
  return properties.filter(p => hasValidCoordinates(p)) as T[];
}

/**
 * Prepara propriedades para o mapa (apenas as que têm coordenadas)
 */
export function preparePropertiesForMap(properties: OptimizedProperty[]) {
  const withCoords = filterPropertiesWithCoordinates(properties);
  const needsGeocoding = properties.filter(p => !hasValidCoordinates(p));
  
  return {
    mappable: withCoords,
    needsGeocoding: needsGeocoding,
    stats: {
      total: properties.length,
      withCoordinates: withCoords.length,
      needsGeocoding: needsGeocoding.length,
      percentage: Math.round((withCoords.length / properties.length) * 100),
    },
  };
}

