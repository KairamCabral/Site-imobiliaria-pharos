/**
 * Web Worker para Geocoding em Background
 * Processa geocoding sem bloquear a UI principal
 */

// Cache em memória do worker
const cache = new Map();

/**
 * Normaliza endereço
 */
function normalizeAddress(address) {
  return address
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^\w\sàáâãèéêìíòóôõùúçñ]/g, '');
}

/**
 * Geocodifica endereço usando Google Maps API
 * (Nota: Google Maps não pode ser usado diretamente em Web Worker,
 * então vamos fazer chamadas HTTP diretas à API de Geocoding)
 */
async function geocodeAddress(address, apiKey) {
  const normalized = normalizeAddress(address);

  // Verificar cache
  if (cache.has(normalized)) {
    return { ...cache.get(normalized), fromCache: true };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&region=BR&language=pt-BR&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const coords = {
        lat: location.lat,
        lng: location.lng,
      };

      // Salvar no cache
      cache.set(normalized, coords);

      return { ...coords, fromCache: false };
    }

    return null;
  } catch (error) {
    console.error('[GeocodingWorker] Erro:', error);
    return null;
  }
}

/**
 * Processa batch de endereços
 */
async function processBatch(addresses, apiKey) {
  const results = [];

  for (const item of addresses) {
    const coords = await geocodeAddress(item.address, apiKey);
    
    results.push({
      propertyId: item.propertyId,
      address: item.address,
      coords,
    });

    // Delay entre requisições
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  return results;
}

/**
 * Escuta mensagens do thread principal
 */
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'GEOCODE_BATCH':
      const { addresses, apiKey, batchId } = payload;
      
      // Notificar início
      self.postMessage({
        type: 'BATCH_STARTED',
        payload: { batchId, total: addresses.length },
      });

      // Processar batch
      const results = await processBatch(addresses, apiKey);

      // Enviar resultados
      self.postMessage({
        type: 'BATCH_COMPLETED',
        payload: { batchId, results },
      });
      break;

    case 'CLEAR_CACHE':
      cache.clear();
      self.postMessage({
        type: 'CACHE_CLEARED',
        payload: {},
      });
      break;

    case 'GET_CACHE_SIZE':
      self.postMessage({
        type: 'CACHE_SIZE',
        payload: { size: cache.size },
      });
      break;

    default:
      console.warn('[GeocodingWorker] Tipo desconhecido:', type);
  }
});

// Notificar que o worker está pronto
self.postMessage({
  type: 'WORKER_READY',
  payload: {},
});

