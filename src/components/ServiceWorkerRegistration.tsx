'use client';

import { useEffect } from 'react';

/**
 * Componente para registrar service worker
 * Melhora performance com cache estratégico
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Registrar service worker após o load da página
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration.scope);
            
            // Verificar atualizações a cada 1 hora
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error);
          });
      });
      
      // Detectar updates do service worker
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('🔄 Service Worker updated, reloading page...');
        window.location.reload();
      });
    }
  }, []);
  
  return null;
}

