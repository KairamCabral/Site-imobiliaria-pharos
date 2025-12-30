'use client';

/**
 * 📊 Monitor de Performance de Imagens
 * 
 * Monitora e registra o desempenho de carregamento de imagens em tempo real.
 * 
 * Funcionalidades:
 * ✅ Rastreia todas as imagens carregadas
 * ✅ Alerta sobre imagens muito pesadas (>300KB)
 * ✅ Registra tempos de carregamento
 * ✅ Calcula estatísticas agregadas
 * ✅ Envia métricas para analytics (opcional)
 * 
 * Uso: Adicionar no layout.tsx
 */

import { useEffect, useRef } from 'react';

interface ImageMetrics {
  url: string;
  size: number; // bytes
  duration: number; // ms
  timestamp: number;
}

const MAX_IMAGE_SIZE = 300 * 1024; // 300KB (recomendação Web.dev)
const SLOW_IMAGE_THRESHOLD = 1000; // 1 segundo

export function ImagePerformanceMonitor() {
  const metricsRef = useRef<ImageMetrics[]>([]);
  const loggedUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Observer para recursos (imagens)
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        // Filtrar apenas imagens
        if (entry.initiatorType !== 'img' && entry.initiatorType !== 'image') {
          return;
        }

        const url = entry.name;
        
        // Evitar logs duplicados
        if (loggedUrlsRef.current.has(url)) {
          return;
        }
        loggedUrlsRef.current.add(url);

        const size = entry.transferSize || 0;
        const duration = entry.duration || 0;
        
        const metrics: ImageMetrics = {
          url,
          size,
          duration,
          timestamp: Date.now(),
        };

        metricsRef.current.push(metrics);

        // Log desenvolvimento (apenas em dev mode)
        if (process.env.NODE_ENV === 'development') {
          const sizeKB = (size / 1024).toFixed(2);
          const durationMs = duration.toFixed(2);
          
          console.log(
            `📸 Imagem carregada: ${getImageFileName(url)}\n` +
            `   Tamanho: ${sizeKB}KB | Tempo: ${durationMs}ms`
          );

          // ⚠️ Alertas para imagens problemáticas
          if (size > MAX_IMAGE_SIZE) {
            console.warn(
              `⚠️ IMAGEM MUITO GRANDE: ${getImageFileName(url)}\n` +
              `   Tamanho: ${sizeKB}KB (máx recomendado: 300KB)\n` +
              `   Redução recomendada: ${((size / MAX_IMAGE_SIZE - 1) * 100).toFixed(0)}%\n` +
              `   URL: ${url}`
            );
          }

          if (duration > SLOW_IMAGE_THRESHOLD) {
            console.warn(
              `🐌 IMAGEM LENTA: ${getImageFileName(url)}\n` +
              `   Tempo: ${durationMs}ms (>1s)\n` +
              `   Considere otimizar ou usar lazy loading\n` +
              `   URL: ${url}`
            );
          }
        }

        // Enviar para analytics (se configurado)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          // Enviar evento para Google Analytics
          (window as any).gtag('event', 'image_load', {
            event_category: 'Performance',
            event_label: getImageFileName(url),
            value: Math.round(size / 1024), // KB
            custom_map: {
              dimension1: duration, // tempo de carregamento
            },
          });

          // Evento especial para imagens grandes
          if (size > MAX_IMAGE_SIZE) {
            (window as any).gtag('event', 'large_image_detected', {
              event_category: 'Performance',
              event_label: getImageFileName(url),
              value: Math.round(size / 1024),
            });
          }
        }
      });
    });

    try {
      resourceObserver.observe({ 
        entryTypes: ['resource'],
        buffered: true, // Captura recursos já carregados
      });
    } catch (error) {
      console.warn('PerformanceObserver não suportado:', error);
    }

    // Cleanup e log de estatísticas ao desmontar (apenas em dev)
    return () => {
      resourceObserver.disconnect();

      if (process.env.NODE_ENV === 'development' && metricsRef.current.length > 0) {
        const metrics = metricsRef.current;
        const totalSize = metrics.reduce((acc, m) => acc + m.size, 0);
        const avgSize = totalSize / metrics.length;
        const avgDuration = metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length;
        const largeImages = metrics.filter(m => m.size > MAX_IMAGE_SIZE);

        console.log(
          '\n📊 ESTATÍSTICAS DE IMAGENS\n' +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Total de imagens: ${metrics.length}\n` +
          `Tamanho total: ${(totalSize / 1024 / 1024).toFixed(2)}MB\n` +
          `Tamanho médio: ${(avgSize / 1024).toFixed(2)}KB\n` +
          `Tempo médio: ${avgDuration.toFixed(2)}ms\n` +
          `Imagens grandes (>300KB): ${largeImages.length}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        );

        if (largeImages.length > 0) {
          console.warn(
            `\n⚠️ IMAGENS QUE PRECISAM DE OTIMIZAÇÃO:\n` +
            largeImages
              .sort((a, b) => b.size - a.size)
              .slice(0, 5)
              .map((m, i) => 
                `${i + 1}. ${getImageFileName(m.url)} (${(m.size / 1024).toFixed(2)}KB)`
              )
              .join('\n')
          );
        }
      }
    };
  }, []);

  // Não renderiza nada - é apenas um observer
  return null;
}

/**
 * Extrai nome do arquivo da URL
 */
function getImageFileName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || 'unknown';
    return fileName.length > 50 ? fileName.substring(0, 47) + '...' : fileName;
  } catch {
    return url.substring(0, 50);
  }
}

/**
 * Hook para acessar métricas de imagens (opcional)
 * Útil para dashboards ou debugging
 */
export function useImageMetrics() {
  const metricsRef = useRef<ImageMetrics[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.initiatorType === 'img' || entry.initiatorType === 'image') {
          metricsRef.current.push({
            url: entry.name,
            size: entry.transferSize || 0,
            duration: entry.duration || 0,
            timestamp: Date.now(),
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'], buffered: true });
    return () => observer.disconnect();
  }, []);

  return metricsRef.current;
}

