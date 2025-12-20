/**
 * Cálculo de Distância do Mar
 * 
 * Usa fórmula Haversine (leve, sem libs externas)
 * Calcula distância entre coordenadas do imóvel e linha costeira
 */

const AV_ATLANTICA_SOUTH = { lat: -27.0185, lng: -48.6408 };
const AV_ATLANTICA_NORTH = { lat: -26.9652, lng: -48.6215 };

const PRAIA_BRAVA_SOUTH = { lat: -26.9302, lng: -48.6189 };
const PRAIA_BRAVA_NORTH = { lat: -26.8728, lng: -48.5943 };

/**
 * Calcula distância entre dois pontos GPS usando Haversine
 * @param lat1 Latitude ponto 1
 * @param lng1 Longitude ponto 1
 * @param lat2 Latitude ponto 2
 * @param lng2 Longitude ponto 2
 * @returns Distância em metros
 */
function calcularDistanciaHaversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em metros
}

/**
 * Calcula distância até o mar
 * @param lat Latitude do imóvel
 * @param lng Longitude do imóvel
 * @returns Distância em metros até o ponto mais próximo da orla (ou undefined se inválido)
 */
function distanceToCoastlineSegment(
  lat: number,
  lng: number,
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const toDeg = (value: number) => (value * 180) / Math.PI;

  const latMid = toRad((start.lat + end.lat) / 2);

  const toXY = (coordLat: number, coordLng: number) => ({
    x: Math.cos(latMid) * toRad(coordLng),
    y: toRad(coordLat),
  });

  const startXY = toXY(start.lat, start.lng);
  const endXY = toXY(end.lat, end.lng);
  const pointXY = toXY(lat, lng);

  const ab = {
    x: endXY.x - startXY.x,
    y: endXY.y - startXY.y,
  };

  const ap = {
    x: pointXY.x - startXY.x,
    y: pointXY.y - startXY.y,
  };

  const abSquared = ab.x * ab.x + ab.y * ab.y;
  let t = 0;
  if (abSquared > 0) {
    t = (ap.x * ab.x + ap.y * ab.y) / abSquared;
  }
  t = Math.max(0, Math.min(1, t));

  const projX = startXY.x + ab.x * t;
  const projY = startXY.y + ab.y * t;

  const projLat = toDeg(projY);
  const projLng = toDeg(projX / Math.cos(latMid));

  return calcularDistanciaHaversine(lat, lng, projLat, projLng);
}

export function calcularDistanciaMar(
  lat?: number | null,
  lng?: number | null
): number | undefined {
  if (lat === null || lat === undefined || isNaN(lat)) return undefined;
  if (lng === null || lng === undefined || isNaN(lng)) return undefined;

  const inBalneario =
    lat >= -27.08 && lat <= -26.92 &&
    lng >= -48.67 && lng <= -48.58;

  if (inBalneario) {
    return Math.round(distanceToCoastlineSegment(lat, lng, AV_ATLANTICA_SOUTH, AV_ATLANTICA_NORTH));
  }

  const inPraiaBrava =
    lat >= -26.94 && lat <= -26.85 &&
    lng >= -48.63 && lng <= -48.57;

  if (inPraiaBrava) {
    return Math.round(distanceToCoastlineSegment(lat, lng, PRAIA_BRAVA_SOUTH, PRAIA_BRAVA_NORTH));
  }

  return undefined;
}

/**
 * Formata distância para exibição
 * @param distanciaMetros Distância em metros
 * @returns String formatada (ex: "50m", "1,2km")
 */
export function formatarDistanciaMar(distanciaMetros?: number): string | undefined {
  if (!distanciaMetros) return undefined;

  if (distanciaMetros < 1000) {
    return `${distanciaMetros}m`;
  }

  const km = (distanciaMetros / 1000).toFixed(1);
  return `${km.replace('.', ',')}km`;
}

/**
 * Classifica proximidade do mar
 * @param distanciaMetros Distância em metros
 * @returns Categoria de proximidade
 */
export function classificarProximidadeMar(
  distanciaMetros?: number
): 'frente-mar' | 'proximo-mar' | 'perto-mar' | 'longe-mar' | undefined {
  if (!distanciaMetros) return undefined;

  if (distanciaMetros <= 100) return 'frente-mar';      // 0-100m
  if (distanciaMetros <= 300) return 'proximo-mar';     // 100-300m
  if (distanciaMetros <= 1000) return 'perto-mar';      // 300m-1km
  return 'longe-mar';                                    // > 1km
}

/**
 * Verifica se é vista para o mar
 * (considera frente mar ou muito próximo)
 * @param distanciaMetros Distância em metros
 * @returns true se tem vista para o mar
 */
export function temVistaMar(distanciaMetros?: number): boolean {
  if (!distanciaMetros) return false;
  return distanciaMetros <= 150; // Até 150m considera vista mar
}

