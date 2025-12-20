/**
 * Sistema de Geocoding Otimizado
 * - Cache em 2 camadas (memória + IndexedDB)
 * - Processamento em batch inteligente
 * - Rate limiting automático
 * - Retry com backoff exponencial
 */

import { geocodingCache } from './geocodingCache';

const MAX_RETRIES = 2;
const BATCH_SIZE = 10; // Aumentado de 5 para 10
const BATCH_DELAY_MS = 150; // Reduzido de 300 para 150ms
const RETRY_DELAYS = [1000, 2000]; // Backoff exponencial

interface GeocodeRequest {
  address: string;
  propertyId: string;
}

interface GeocodeResult {
  propertyId: string;
  lat: number;
  lng: number;
  fromCache: boolean;
}

/**
 * Geocodifica um único endereço com retry
 */
async function geocodeSingleAddress(
  address: string,
  retryCount = 0
): Promise<{ lat: number; lng: number } | null> {
  // 1. Tentar cache primeiro
  const cached = await geocodingCache.get(address);
  if (cached) {
    return cached;
  }

  // 2. Verificar se Google Maps está disponível
  if (typeof window === 'undefined' || !(window as any).google?.maps?.Geocoder) {
    console.warn('[OptimizedGeocoding] Google Maps Geocoder não disponível');
    return null;
  }

  try {
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({
      address,
      region: 'BR',
      language: 'pt-BR',
      componentRestrictions: {
        country: 'BR',
        administrativeArea: 'SC', // Santa Catarina
      },
    });

    if (result.results && result.results.length > 0) {
      const location = result.results[0].geometry.location;
      const coords = {
        lat: location.lat(),
        lng: location.lng(),
      };

      // Salvar no cache
      await geocodingCache.set(address, coords.lat, coords.lng);

      return coords;
    }

    return null;
  } catch (error: any) {
    // Retry em caso de erro de rate limit
    if (
      retryCount < MAX_RETRIES &&
      (error.code === 'OVER_QUERY_LIMIT' || error.message?.includes('OVER_QUERY_LIMIT'))
    ) {
      const delay = RETRY_DELAYS[retryCount];
      console.warn(`[OptimizedGeocoding] Rate limit, retry ${retryCount + 1}/${MAX_RETRIES} em ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      return geocodeSingleAddress(address, retryCount + 1);
    }

    console.warn('[OptimizedGeocoding] Erro ao geocodificar:', address.substring(0, 30), error.message);
    return null;
  }
}

/**
 * Geocodifica múltiplos endereços de forma otimizada
 */
export async function geocodeBatch(
  requests: GeocodeRequest[]
): Promise<GeocodeResult[]> {
  if (requests.length === 0) return [];

  console.log(`[OptimizedGeocoding] 🚀 Iniciando geocoding de ${requests.length} endereços...`);

  // 1. Tentar buscar tudo do cache primeiro (rápido)
  const addresses = requests.map((r) => r.address);
  const cachedResults = await geocodingCache.getMany(addresses);

  const results: GeocodeResult[] = [];
  const pendingRequests: GeocodeRequest[] = [];

  requests.forEach((req) => {
    const cached = cachedResults.get(req.address);
    if (cached) {
      results.push({
        propertyId: req.propertyId,
        lat: cached.lat,
        lng: cached.lng,
        fromCache: true,
      });
    } else {
      pendingRequests.push(req);
    }
  });

  console.log(`[OptimizedGeocoding] ✅ ${results.length} do cache, ${pendingRequests.length} pendentes`);

  // 2. Processar requisições pendentes em batches
  for (let i = 0; i < pendingRequests.length; i += BATCH_SIZE) {
    const batch = pendingRequests.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (req) => {
        const coords = await geocodeSingleAddress(req.address);
        if (coords) {
          return {
            propertyId: req.propertyId,
            lat: coords.lat,
            lng: coords.lng,
            fromCache: false,
          };
        }
        return null;
      })
    );

    // Adicionar resultados válidos
    const validResults = batchResults.filter((r): r is GeocodeResult => r !== null);
    results.push(...validResults);

    console.log(
      `[OptimizedGeocoding] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${validResults.length}/${batch.length} sucesso`
    );

    // Delay entre batches (exceto no último)
    if (i + BATCH_SIZE < pendingRequests.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  const successRate = ((results.length / requests.length) * 100).toFixed(1);
  console.log(`[OptimizedGeocoding] ✅ Concluído: ${results.length}/${requests.length} (${successRate}%)`);

  return results;
}

/**
 * Pré-carrega endereços no cache (útil para páginas futuras)
 */
export async function preloadGeocoding(addresses: string[]): Promise<void> {
  const requests: GeocodeRequest[] = addresses.map((addr, i) => ({
    address: addr,
    propertyId: `preload_${i}`,
  }));

  await geocodeBatch(requests);
}

/**
 * Estatísticas do cache
 */
export async function getGeocodingStats() {
  return geocodingCache.getStats();
}

