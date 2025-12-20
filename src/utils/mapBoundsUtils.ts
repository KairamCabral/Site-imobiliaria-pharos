/**
 * Utilitários para calcular bounds do mapa e priorizar propriedades
 */

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PropertyLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
}

/**
 * Verifica se uma coordenada está dentro dos bounds
 */
export function isInBounds(lat: number, lng: number, bounds: Bounds): boolean {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

/**
 * Expande bounds com um buffer percentual
 */
export function expandBounds(bounds: Bounds, bufferPercent = 50): Bounds {
  const latDiff = bounds.north - bounds.south;
  const lngDiff = bounds.east - bounds.west;
  
  const latBuffer = latDiff * (bufferPercent / 100);
  const lngBuffer = lngDiff * (bufferPercent / 100);

  return {
    north: bounds.north + latBuffer,
    south: bounds.south - latBuffer,
    east: bounds.east + lngBuffer,
    west: bounds.west - lngBuffer,
  };
}

/**
 * Calcula distância aproximada do centro dos bounds (para priorização)
 */
export function getDistanceFromBoundsCenter(
  lat: number,
  lng: number,
  bounds: Bounds
): number {
  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;
  
  // Distância euclidiana aproximada
  return Math.sqrt(
    Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2)
  );
}

/**
 * Estima coordenadas aproximadas baseado no endereço (para priorização inicial)
 * Usa apenas cidade/bairro para estimativa grosseira
 */
export function estimateCoordinates(address: string): { lat: number; lng: number } | null {
  const normalized = address.toLowerCase();
  
  // Coordenadas aproximadas de bairros conhecidos de Balneário Camboriú
  const areaEstimates: Record<string, { lat: number; lng: number }> = {
    'centro': { lat: -26.9906, lng: -48.6350 },
    'barra sul': { lat: -27.0050, lng: -48.6250 },
    'barra norte': { lat: -26.9750, lng: -48.6450 },
    'praia central': { lat: -26.9950, lng: -48.6320 },
    'pioneiros': { lat: -26.9850, lng: -48.6400 },
    'nações': { lat: -27.0000, lng: -48.6300 },
    'barra': { lat: -27.0000, lng: -48.6300 },
    'estados': { lat: -27.0020, lng: -48.6280 },
  };

  // Procurar por bairro conhecido
  for (const [area, coords] of Object.entries(areaEstimates)) {
    if (normalized.includes(area)) {
      return coords;
    }
  }

  // Fallback: centro de Balneário Camboriú
  if (normalized.includes('balneário') || normalized.includes('camboriú')) {
    return { lat: -26.9906, lng: -48.6350 };
  }

  return null;
}

/**
 * Prioriza propriedades por proximidade com viewport
 * Retorna array ordenado por prioridade (mais próximas primeiro)
 */
export function prioritizePropertiesByViewport<T extends { id: string; addressForGeocoding?: string; latitude?: number; longitude?: number }>(
  properties: T[],
  bounds: Bounds
): T[] {
  return properties
    .map(prop => {
      // Se já tem coordenadas, usar elas
      if (prop.latitude && prop.longitude) {
        const distance = getDistanceFromBoundsCenter(prop.latitude, prop.longitude, bounds);
        const isVisible = isInBounds(prop.latitude, prop.longitude, bounds);
        return {
          property: prop,
          distance,
          priority: isVisible ? 0 : distance, // Visíveis têm prioridade 0
        };
      }
      
      // Se não tem coordenadas, estimar pelo endereço
      if (prop.addressForGeocoding) {
        const estimated = estimateCoordinates(prop.addressForGeocoding);
        if (estimated) {
          const distance = getDistanceFromBoundsCenter(estimated.lat, estimated.lng, bounds);
          const isVisible = isInBounds(estimated.lat, estimated.lng, bounds);
          return {
            property: prop,
            distance,
            priority: isVisible ? 1 : distance + 10, // Estimativas têm prioridade menor
          };
        }
      }
      
      // Sem info, baixa prioridade
      return {
        property: prop,
        distance: 999,
        priority: 999,
      };
    })
    .sort((a, b) => a.priority - b.priority)
    .map(item => item.property);
}

/**
 * Divide propriedades em grupos de prioridade
 */
export interface PriorityGroups<T> {
  immediate: T[];  // Visíveis agora
  nearby: T[];     // Buffer ao redor
  distant: T[];    // Resto
}

export function groupPropertiesByPriority<T extends { id: string; addressForGeocoding?: string; latitude?: number; longitude?: number }>(
  properties: T[],
  bounds: Bounds
): PriorityGroups<T> {
  const immediate: T[] = [];
  const nearby: T[] = [];
  const distant: T[] = [];
  
  const expandedBounds = expandBounds(bounds, 50);

  properties.forEach(prop => {
    // Estimar coordenadas
    let lat: number, lng: number;
    
    if (prop.latitude && prop.longitude) {
      lat = prop.latitude;
      lng = prop.longitude;
    } else if (prop.addressForGeocoding) {
      const estimated = estimateCoordinates(prop.addressForGeocoding);
      if (!estimated) {
        distant.push(prop);
        return;
      }
      lat = estimated.lat;
      lng = estimated.lng;
    } else {
      distant.push(prop);
      return;
    }

    // Classificar por bounds
    if (isInBounds(lat, lng, bounds)) {
      immediate.push(prop);
    } else if (isInBounds(lat, lng, expandedBounds)) {
      nearby.push(prop);
    } else {
      distant.push(prop);
    }
  });

  return { immediate, nearby, distant };
}

