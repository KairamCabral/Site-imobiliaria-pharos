'use client';

import { useEffect } from 'react';
import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, Metric } from 'web-vitals';

/**
 * Monitor de performance usando Web Vitals
 * Coleta e reporta métricas essenciais de performance
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Função para reportar métricas
    function sendToAnalytics(metric: Metric) {
      const { name, value, rating, delta, id } = metric;
      
      // Log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(`${emoji} [Web Vitals] ${name}:`, {
          value: Math.round(value),
          rating,
          delta: Math.round(delta),
          id,
        });
        
        // Alertas para métricas ruins
        if (rating === 'poor') {
          console.warn(`🚨 [Performance Alert] ${name} está com performance ruim:`, value);
          
          // Sugestões baseadas na métrica
          switch (name) {
            case 'CLS':
              console.info('💡 Dica: Verifique elementos sem dimensões definidas ou que mudam de tamanho.');
              break;
            case 'LCP':
              console.info('💡 Dica: Otimize a imagem do hero ou recursos críticos acima da dobra.');
              break;
            case 'FID':
            case 'INP':
              console.info('💡 Dica: Reduza JavaScript bloqueante ou otimize event handlers.');
              break;
            case 'TTFB':
              console.info('💡 Dica: Verifique o cache do servidor ou CDN.');
              break;
          }
        }
      }
      
      // Em produção, enviar para Google Analytics 4
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        // @ts-ignore
        if (window.gtag) {
          // @ts-ignore
          window.gtag('event', name, {
            event_category: 'Web Vitals',
            event_label: id,
            value: Math.round(value),
            metric_rating: rating,
            non_interaction: true,
          });
        }
      }
    }
    
    // Registrar todos os Web Vitals
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
    
  }, []);
  
  return null;
}

/**
 * Hook para monitorar performance de componentes específicos
 */
export function usePerformanceMarker(name: string) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;
      const measureName = `${name}-duration`;
      
      // Marcar início
      performance.mark(startMark);
      
      return () => {
        // Marcar fim e medir
        try {
          performance.mark(endMark);
          performance.measure(measureName, startMark, endMark);
          
          const measure = performance.getEntriesByName(measureName)[0];
          if (measure && process.env.NODE_ENV === 'development') {
            console.log(`⏱️ [Performance] ${name}: ${Math.round(measure.duration)}ms`);
          }
          
          // Limpar marcadores
          performance.clearMarks(startMark);
          performance.clearMarks(endMark);
          performance.clearMeasures(measureName);
        } catch (error) {
          // Ignorar erros de performance API
        }
      };
    }
  }, [name]);
}

