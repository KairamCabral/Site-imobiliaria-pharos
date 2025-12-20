/**
 * Sistema de Virtualização de Marcadores
 * Renderiza apenas marcadores visíveis no viewport + buffer
 * Melhora performance drasticamente em mapas com muitos pontos
 */

export interface MarkerBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface VirtualizedMarker {
  id: string;
  lat: number;
  lng: number;
  data: any;
}

/**
 * Calcula se um marcador está dentro dos bounds + buffer
 */
export function isMarkerInBounds(
  marker: VirtualizedMarker,
  bounds: MarkerBounds,
  bufferPercent = 20 // 20% de buffer para cada lado
): boolean {
  const latBuffer = Math.abs(bounds.north - bounds.south) * (bufferPercent / 100);
  const lngBuffer = Math.abs(bounds.east - bounds.west) * (bufferPercent / 100);

  return (
    marker.lat >= bounds.south - latBuffer &&
    marker.lat <= bounds.north + latBuffer &&
    marker.lng >= bounds.west - lngBuffer &&
    marker.lng <= bounds.east + lngBuffer
  );
}

/**
 * Filtra marcadores visíveis no viewport atual
 */
export function getVisibleMarkers(
  allMarkers: VirtualizedMarker[],
  bounds: MarkerBounds,
  bufferPercent = 20
): VirtualizedMarker[] {
  return allMarkers.filter((marker) => isMarkerInBounds(marker, bounds, bufferPercent));
}

/**
 * Agrupa marcadores próximos para clustering mais eficiente
 */
export function groupNearbyMarkers(
  markers: VirtualizedMarker[],
  distanceThreshold = 0.001 // ~100m
): Array<VirtualizedMarker[]> {
  const groups: Array<VirtualizedMarker[]> = [];
  const processed = new Set<string>();

  markers.forEach((marker) => {
    if (processed.has(marker.id)) return;

    const group: VirtualizedMarker[] = [marker];
    processed.add(marker.id);

    // Encontrar marcadores próximos
    markers.forEach((other) => {
      if (processed.has(other.id)) return;

      const distance = Math.sqrt(
        Math.pow(marker.lat - other.lat, 2) + Math.pow(marker.lng - other.lng, 2)
      );

      if (distance <= distanceThreshold) {
        group.push(other);
        processed.add(other.id);
      }
    });

    groups.push(group);
  });

  return groups;
}

/**
 * Calcula bounds otimizados para um conjunto de marcadores
 */
export function calculateOptimalBounds(markers: VirtualizedMarker[]): MarkerBounds {
  if (markers.length === 0) {
    return {
      north: -26.9,
      south: -27.1,
      east: -48.6,
      west: -48.7,
    };
  }

  const lats = markers.map((m) => m.lat);
  const lngs = markers.map((m) => m.lng);

  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);

  // Adicionar pequeno padding
  const latPadding = (north - south) * 0.1;
  const lngPadding = (east - west) * 0.1;

  return {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lngPadding,
    west: west - lngPadding,
  };
}

/**
 * Cache de marcadores visíveis para evitar recalculos
 */
export class MarkerCache {
  private cache = new Map<string, VirtualizedMarker[]>();
  private maxSize = 10;

  private getBoundsKey(bounds: MarkerBounds): string {
    return `${bounds.north.toFixed(4)}_${bounds.south.toFixed(4)}_${bounds.east.toFixed(4)}_${bounds.west.toFixed(4)}`;
  }

  get(bounds: MarkerBounds): VirtualizedMarker[] | null {
    const key = this.getBoundsKey(bounds);
    return this.cache.get(key) || null;
  }

  set(bounds: MarkerBounds, markers: VirtualizedMarker[]): void {
    const key = this.getBoundsKey(bounds);

    // Limitar tamanho do cache
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, markers);
  }

  clear(): void {
    this.cache.clear();
  }
}

