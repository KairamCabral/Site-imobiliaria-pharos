/**
 * Service Worker - Pharos Imobiliária PWA
 * 
 * Estratégia de cache:
 * - Cache-First: Assets estáticos (CSS, JS, fonts, images)
 * - Network-First: API calls, páginas dinâmicas
 * - Stale-While-Revalidate: Imagens de imóveis
 * 
 * Features:
 * - Offline fallback
 * - Background sync para leads
 * - Push notifications (preparado)
 * - Cache versioning
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `pharos-${CACHE_VERSION}`;

// Caches específicos
const CACHES = {
  static: `${CACHE_NAME}-static`,
  dynamic: `${CACHE_NAME}-dynamic`,
  images: `${CACHE_NAME}-images`,
  api: `${CACHE_NAME}-api`,
};

// Assets para pré-cache (install)
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.png',
  '/images/logos/Logo-pharos.webp', // ✅ Caminho correto
];

// Rotas que devem funcionar offline
const OFFLINE_ROUTES = [
  '/',
  '/imoveis',
  '/sobre',
  '/contato',
];

/**
 * Install Event
 * Pré-cache de assets essenciais com fallback individual
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHES.static)
      .then(async (cache) => {
        console.log('[SW] Precaching static assets');
        
        // ✅ OTIMIZAÇÃO: Cache individual para não falhar tudo se um asset falhar
        const results = await Promise.allSettled(
          PRECACHE_ASSETS.map(asset => 
            cache.add(asset)
              .then(() => {
                console.log(`[SW] ✓ Cached: ${asset}`);
                return asset;
              })
              .catch(err => {
                console.warn(`[SW] ✗ Failed to cache ${asset}:`, err.message);
                return null;
              })
          )
        );
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const failed = results.length - successful;
        console.log(`[SW] Precache complete: ${successful} successful, ${failed} failed`);
        
        return results;
      })
      .then(() => {
        // Skip waiting para ativar imediatamente
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache setup failed:', error);
      })
  );
});

/**
 * Activate Event
 * Limpar caches antigos
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Deletar caches de versões antigas
            if (cacheName.startsWith('pharos-') && cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim clients para controlar páginas abertas
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event
 * Estratégias de cache por tipo de requisição
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições externas (CDN, APIs externas)
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Ignorar requisições de API que não devem ser cacheadas
  if (url.pathname.startsWith('/api/metrics') || 
      url.pathname.startsWith('/api/leads')) {
    return;
  }
  
  // Estratégia baseada no tipo
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request, CACHES.images));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHES.api));
  } else if (request.destination === 'document') {
    event.respondWith(networkFirst(request, CACHES.dynamic));
  } else {
    // Assets estáticos (CSS, JS, fonts)
    event.respondWith(cacheFirst(request, CACHES.static));
  }
});

/**
 * Cache First Strategy
 * Prioriza cache, fallback para network
 */
async function cacheFirst(request, cacheName) {
  // Só processar requisições GET
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    // Só cachear respostas OK (excluindo 206 Partial Content que não pode ser cacheado)
    if (response.ok && response.status !== 206) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network First Strategy
 * Tenta network, fallback para cache
 */
async function networkFirst(request, cacheName) {
  // Só processar requisições GET
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    // Só cachear respostas OK (excluindo 206 Partial Content que não pode ser cacheado)
    if (response.ok && response.status !== 206) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback para resposta offline
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Stale While Revalidate Strategy
 * Retorna cache imediatamente, atualiza em background
 */
async function staleWhileRevalidate(request, cacheName) {
  // Só processar requisições GET
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      // Só cachear respostas OK (excluindo 206 Partial Content que não pode ser cacheado)
      if (response.ok && response.status !== 206) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  
  return cached || fetchPromise;
}

/**
 * Background Sync
 * Para enviar leads quando voltar online
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-leads') {
    event.waitUntil(syncLeads());
  }
});

async function syncLeads() {
  const cache = await caches.open(CACHES.api);
  const requests = await cache.keys();
  
  const leadRequests = requests.filter(req => 
    req.url.includes('/api/leads') && req.method === 'POST'
  );
  
  for (const request of leadRequests) {
    try {
      const response = await fetch(request);
      
      if (response.ok) {
        await cache.delete(request);
        console.log('[SW] Lead synced successfully');
      }
    } catch (error) {
      console.error('[SW] Failed to sync lead:', error);
    }
  }
}

/**
 * Push Notifications
 * (Preparado para futura implementação)
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nova atualização disponível',
    icon: '/icon.png',
    badge: '/images/logos/Favicon.png',
    tag: data.tag || 'pharos-notification',
    requireInteraction: false,
    data: data.url || '/',
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Pharos Imobiliária',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

/**
 * Message Handler
 * Para comunicação com o app
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded v' + CACHE_VERSION);
