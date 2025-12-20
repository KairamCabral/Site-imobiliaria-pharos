/**
 * Utilitários de Geocoding
 * Converte endereços em coordenadas usando Google Maps Geocoding API
 */

interface GeocodingResult {
  lat: number;
  lng: number;
}

interface GeocodingCache {
  [address: string]: GeocodingResult | null;
}

// Cache em memória para evitar requisições repetidas
const geocodingCache: GeocodingCache = {};

/**
 * Converte endereço em coordenadas usando Google Maps Geocoder (client-side)
 * Usa o geocoder que já está carregado no browser
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // Verificar cache
  if (address in geocodingCache) {
    return geocodingCache[address];
  }

  // Verificar se Google Maps está carregado
  if (typeof window === 'undefined' || !(window as any).google?.maps?.Geocoder) {
    console.warn('[Geocoding] Google Maps ainda não está carregado');
    return null;
  }

  try {
    const geocoder = new (window as any).google.maps.Geocoder();
    
    // 🎯 OTIMIZAÇÃO: Adicionar bounds de Santa Catarina para evitar resultados errados
    const scBounds = new (window as any).google.maps.LatLngBounds(
      new (window as any).google.maps.LatLng(-29.35, -53.83), // Sudoeste SC
      new (window as any).google.maps.LatLng(-25.96, -48.35)  // Nordeste SC
    );
    
    const result = await geocoder.geocode({
      address: address,
      region: 'BR',
      language: 'pt-BR',
      bounds: scBounds, // Priorizar resultados em SC
    });

    if (result.results && result.results.length > 0) {
      const location = result.results[0].geometry.location;
      const coords = {
        lat: location.lat(),
        lng: location.lng(),
      };
      
      // 🔒 VALIDAÇÃO: Verificar se está em Santa Catarina
      const isInSC = coords.lat >= -29.35 && coords.lat <= -25.96 && 
                     coords.lng >= -53.83 && coords.lng <= -48.35;
      
      if (!isInSC) {
        console.warn(`[Geocoding] ⚠️ FORA DE SC: ${address.substring(0, 40)}... → ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        // Tentar novamente com endereço mais específico
        const retryAddress = `${address}, Santa Catarina, Brasil`;
        const retryResult = await geocoder.geocode({
          address: retryAddress,
          region: 'BR',
          bounds: scBounds,
        });
        
        if (retryResult.results && retryResult.results.length > 0) {
          const retryLocation = retryResult.results[0].geometry.location;
          const retryCoords = {
            lat: retryLocation.lat(),
            lng: retryLocation.lng(),
          };
          geocodingCache[address] = retryCoords;
          console.log(`[Geocoding] ✅ RETRY OK: ${address.substring(0, 40)}... → ${retryCoords.lat.toFixed(4)}, ${retryCoords.lng.toFixed(4)}`);
          return retryCoords;
        }
        
        geocodingCache[address] = null;
        return null;
      }
      
      // Cachear resultado
      geocodingCache[address] = coords;
      
      console.log(`[Geocoding] ✅ ${address.substring(0, 40)}... → ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      return coords;
    }

    console.warn(`[Geocoding] ❌ Sem resultados para: ${address.substring(0, 50)}...`);
    geocodingCache[address] = null;
    return null;
  } catch (error: any) {
    console.warn(`[Geocoding] ⚠️ Erro: ${address.substring(0, 30)}... - ${error.message || error}`);
    geocodingCache[address] = null;
    return null;
  }
}

/**
 * Formata endereço para geocoding (melhor precisão)
 */
export function formatAddressForGeocoding(
  street?: string,
  number?: string,
  neighborhood?: string,
  city?: string,
  state?: string,
  zipCode?: string,
): string {
  const parts: string[] = [];

  if (street) {
    const fullStreet = number ? `${street}, ${number}` : street;
    parts.push(fullStreet);
  }

  if (neighborhood) parts.push(neighborhood);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  parts.push('Brasil');

  return parts.filter(Boolean).join(', ');
}

/**
 * Limpa cache de geocoding
 */
export function clearGeocodingCache() {
  Object.keys(geocodingCache).forEach(key => delete geocodingCache[key]);
}

