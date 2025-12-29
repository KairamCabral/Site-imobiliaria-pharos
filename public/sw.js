/**
 * Service Worker para Pharos Imobiliária
 * Implementa cache estratégico para melhor performance e experiência offline
 */

const CACHE_VERSION = 'pharos-v1.0.0';
const CACHE_NAME = `pharos-${CACHE_VERSION}`;

// Recursos estáticos para cache imediato
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/images/logos/Favicon.png',
  '/images/logos/Logo-pharos.webp',
];

// Instalar service worker e fazer cache inicial
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE);
    })
  );
  
  // Ativar imediatamente
  self.skipWaiting();
});

// Ativar service worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Assumir controle imediatamente
  self.clients.claim();
});

// Estratégia de cache por tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Ignorar requisições de API para dados dinâmicos
  if (url.pathname.startsWith('/api/properties')) {
    return;
  }
  
  // Estratégia: Cache First para imagens
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Só cachear respostas bem-sucedidas
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Retornar placeholder em caso de falha
          return caches.match('/images/placeholder.jpg');
        });
      })
    );
    return;
  }
  
  // Estratégia: Network First para HTML/documentos
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }
  
  // Estratégia: Cache First para CSS/JS/Fonts
  if (
    request.destination === 'style' || 
    request.destination === 'script' || 
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
});

// Log de mensagens
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
