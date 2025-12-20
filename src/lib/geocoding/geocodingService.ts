/**
 * Serviço de Geocoding Server-Side
 * Converte endereços em coordenadas geográficas
 * Usa cache persistente para evitar chamadas repetidas à API
 */

import { unstable_cache } from 'next/cache';
import { logger } from '@/utils/logger';

export interface GeocodedAddress {
  address: string;
  latitude: number;
  longitude: number;
  confidence: 'high' | 'medium' | 'low';
  geocodedAt: Date;
  source: 'google' | 'fallback';
}

/**
 * Coordenadas de fallback para cidades/bairros conhecidos
 * Usadas quando geocoding falha ou para acelerar queries
 */
const FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
  // Balneário Camboriú
  'Balneário Camboriú': { lat: -26.9906, lng: -48.6348 },
  'Centro': { lat: -26.9906, lng: -48.6348 },
  'Barra Sul': { lat: -27.0031, lng: -48.6278 },
  'Barra Norte': { lat: -26.9781, lng: -48.6415 },
  'Pioneiros': { lat: -26.9945, lng: -48.6520 },
  'Nações': { lat: -27.0053, lng: -48.6241 },
  'Praia Brava': { lat: -26.9598, lng: -48.6197 },
  'Fazenda': { lat: -26.9780, lng: -48.6726 },
  
  // Itajaí
  'Itajaí': { lat: -26.9078, lng: -48.6620 },
  'Centro-Itajaí': { lat: -26.9078, lng: -48.6620 },
  
  // Itapema
  'Itapema': { lat: -27.0920, lng: -48.6116 },
  
  // Camboriú
  'Camboriú': { lat: -27.0238, lng: -48.6522 },
};

/**
 * Geocodifica um endereço usando Google Geocoding API
 * Com cache persistente de 30 dias
 */
export const geocodeAddress = unstable_cache(
  async (address: string, city: string, state: string): Promise<GeocodedAddress> => {
    const fullAddress = `${address}, ${city}, ${state}, Brasil`;
    
    // Verificar se temos API key
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    if (!apiKey) {
      logger.warn('Geocoding', 'Google Geocoding API key não configurada, usando fallback');
      return getFallbackCoordinates(address, city, state);
    }
    
    try {
      logger.debug('Geocoding', `Geocodificando: ${fullAddress}`);
      
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      url.searchParams.set('address', fullAddress);
      url.searchParams.set('key', apiKey);
      url.searchParams.set('region', 'br');
      url.searchParams.set('language', 'pt-BR');
      
      const response = await fetch(url.toString(), {
        next: { revalidate: 2592000 }, // 30 dias
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results[0]) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        logger.info('Geocoding', `✅ Geocodificado: ${fullAddress}`, {
          lat: location.lat,
          lng: location.lng,
        });
        
        return {
          address: fullAddress,
          latitude: location.lat,
          longitude: location.lng,
          confidence: determineConfidence(result),
          geocodedAt: new Date(),
          source: 'google',
        };
      }
      
      // Se não encontrou resultado, usar fallback
      logger.warn('Geocoding', `Sem resultados para: ${fullAddress}, usando fallback`);
      return getFallbackCoordinates(address, city, state);
      
    } catch (error) {
      logger.error('Geocoding', `Erro ao geocodificar ${fullAddress}`, error);
      return getFallbackCoordinates(address, city, state);
    }
  },
  ['geocode'], // Cache key prefix
  {
    revalidate: 2592000, // 30 dias
    tags: ['geocoding'],
  }
);

/**
 * Determina o nível de confiança do resultado de geocoding
 */
function determineConfidence(result: any): 'high' | 'medium' | 'low' {
  const locationType = result.geometry?.location_type;
  
  if (locationType === 'ROOFTOP') return 'high';
  if (locationType === 'RANGE_INTERPOLATED') return 'medium';
  if (locationType === 'GEOMETRIC_CENTER') return 'medium';
  
  // Se chegou aqui, é approximate
  return 'low';
}

/**
 * Retorna coordenadas de fallback baseadas na cidade/bairro
 */
function getFallbackCoordinates(
  address: string, 
  city: string, 
  state: string
): GeocodedAddress {
  // Tentar encontrar coordenadas do bairro (se mencionado no endereço)
  for (const [location, coords] of Object.entries(FALLBACK_COORDS)) {
    if (address.toLowerCase().includes(location.toLowerCase()) ||
        city.toLowerCase().includes(location.toLowerCase())) {
      logger.debug('Geocoding', `Usando fallback para: ${location}`, coords);
      return {
        address: `${address}, ${city}, ${state}`,
        latitude: coords.lat,
        longitude: coords.lng,
        confidence: 'low',
        geocodedAt: new Date(),
        source: 'fallback',
      };
    }
  }
  
  // Fallback final: centro de Balneário Camboriú
  const defaultCoords = FALLBACK_COORDS['Balneário Camboriú'];
  logger.debug('Geocoding', 'Usando fallback padrão (BC)', defaultCoords);
  
  return {
    address: `${address}, ${city}, ${state}`,
    latitude: defaultCoords.lat,
    longitude: defaultCoords.lng,
    confidence: 'low',
    geocodedAt: new Date(),
    source: 'fallback',
  };
}

/**
 * Geocodifica múltiplos endereços em batch
 * Com rate limiting automático
 */
export async function geocodeBatch(
  addresses: Array<{ id: string; address: string; city: string; state: string }>
): Promise<Array<{ id: string } & GeocodedAddress>> {
  const results: Array<{ id: string } & GeocodedAddress> = [];
  
  logger.info('Geocoding', `Geocodificando ${addresses.length} endereços em batch`);
  
  // Processar com rate limit (50 requests/segundo = 20ms entre cada)
  for (let i = 0; i < addresses.length; i++) {
    const item = addresses[i];
    
    try {
      const result = await geocodeAddress(item.address, item.city, item.state);
      results.push({ id: item.id, ...result });
      
      // Log de progresso a cada 10 itens
      if ((i + 1) % 10 === 0) {
        logger.debug('Geocoding', `Progresso: ${i + 1}/${addresses.length}`);
      }
      
      // Rate limit: aguardar 20ms entre requests
      if (i < addresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } catch (error) {
      logger.error('Geocoding', `Erro ao processar ${item.id}`, error);
      // Continuar mesmo com erro
    }
  }
  
  logger.info('Geocoding', `✅ Batch concluído: ${results.length}/${addresses.length} endereços`);
  
  return results;
}

/**
 * Adiciona coordenadas de fallback a múltiplas propriedades
 * Usado quando não é viável fazer geocoding real
 */
export function addFallbackCoordinates<T extends { cidade: string; bairro?: string }>(
  properties: T[]
): Array<T & { latitude: number; longitude: number; geocoded: boolean }> {
  return properties.map(property => {
    // Tentar encontrar coordenadas do bairro
    const bairroCoords = property.bairro ? FALLBACK_COORDS[property.bairro] : null;
    if (bairroCoords) {
      return {
        ...property,
        latitude: bairroCoords.lat,
        longitude: bairroCoords.lng,
        geocoded: false, // Fallback, não é geocoding real
      };
    }
    
    // Tentar cidade
    const cityCoords = FALLBACK_COORDS[property.cidade];
    if (cityCoords) {
      return {
        ...property,
        latitude: cityCoords.lat,
        longitude: cityCoords.lng,
        geocoded: false,
      };
    }
    
    // Fallback padrão
    const defaultCoords = FALLBACK_COORDS['Balneário Camboriú'];
    return {
      ...property,
      latitude: defaultCoords.lat,
      longitude: defaultCoords.lng,
      geocoded: false,
    };
  });
}

