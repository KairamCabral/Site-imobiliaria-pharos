/**
 * Web Vitals Monitoring
 * 
 * Sistema de monitoramento de Core Web Vitals seguindo as diretrizes do Google.
 * Envia métricas para Google Analytics e permite monitoramento de performance.
 * 
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - CLS (Cumulative Layout Shift): < 0.1
 * - INP (Interaction to Next Paint): < 200ms
 * 
 * Outras métricas importantes:
 * - FCP (First Contentful Paint): < 1.8s
 * - TTFB (Time to First Byte): < 800ms
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Determina o rating baseado nos thresholds do Google
 */
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    LCP: { good: 2500, needsImprovement: 4000 },
    FCP: { good: 1800, needsImprovement: 3000 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    INP: { good: 200, needsImprovement: 500 },
    TTFB: { good: 800, needsImprovement: 1800 },
  };

  const threshold = thresholds[metric.name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (metric.value <= threshold.good) return 'good';
  if (metric.value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Envia métrica para o Google Tag Manager
 */
function sendToGTM(metric: WebVitalMetric) {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  window.dataLayer.push({
    event: 'web_vitals',
    metric_name: metric.name,
    metric_value: metric.value,
    metric_rating: metric.rating,
    metric_delta: metric.delta,
    metric_id: metric.id,
    metric_navigation_type: metric.navigationType,
  });

  // Log em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta),
    });
  }
}

/**
 * Envia métrica para o Google Analytics 4
 */
function sendToGA4(metric: WebVitalMetric) {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Valor arredondado para facilitar agregação
  const roundedValue = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value);

  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: roundedValue,
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    metric_navigation_type: metric.navigationType,
    non_interaction: true, // Não afetar bounce rate
  });
}

// Buffer para envio em batch
let metricsBuffer: WebVitalMetric[] = [];
let sendTimeout: NodeJS.Timeout | null = null;

/**
 * Envia métricas em batch para API customizada (RUM)
 */
async function sendMetricsBatch() {
  if (metricsBuffer.length === 0) return;
  
  const metricsToSend = [...metricsBuffer];
  metricsBuffer = [];
  
  try {
    // Gerar session ID único (ou recuperar do localStorage)
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: metricsToSend,
        page: window.location.pathname,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          rtt: (navigator as any).connection.rtt,
          downlink: (navigator as any).connection.downlink,
        } : undefined,
      }),
      // Não bloquear a navegação
      keepalive: true,
    });
  } catch (error) {
    // Falhas silenciosas para não impactar a UX
    if (process.env.NODE_ENV === 'development') {
      console.error('[Web Vitals] Failed to send metrics batch:', error);
    }
  }
}

/**
 * Envia métrica para API customizada (dashboard interno)
 * Usa batching para reduzir requisições
 */
function sendToAnalyticsAPI(metric: WebVitalMetric) {
  // Sempre enviar para dashboard interno (exceto em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    // Em dev, só loga no console
    return;
  }

  // Adicionar ao buffer
  metricsBuffer.push(metric);
  
  // Agendar envio em batch (debounce de 2s)
  if (sendTimeout) {
    clearTimeout(sendTimeout);
  }
  
  sendTimeout = setTimeout(() => {
    sendMetricsBatch();
  }, 2000);
  
  // Enviar imediatamente antes de fechar a página
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (metricsBuffer.length > 0) {
        sendMetricsBatch();
      }
    }, { once: true });
  }
}

/**
 * Handler principal de métricas
 */
function handleMetric(metric: Metric) {
  const webVitalMetric: WebVitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'unknown',
  };

  // Enviar para múltiplos destinos
  sendToGTM(webVitalMetric);
  sendToGA4(webVitalMetric);
  sendToAnalyticsAPI(webVitalMetric);
}

/**
 * Inicializa monitoramento de Web Vitals
 * Deve ser chamado no client-side (useEffect)
 */
export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    // Core Web Vitals
    onLCP(handleMetric);
    onCLS(handleMetric);
    onINP(handleMetric);

    // Outras métricas importantes
    onFCP(handleMetric);
    onTTFB(handleMetric);
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

/**
 * Hook React para usar Web Vitals
 */
export function useWebVitals() {
  if (typeof window !== 'undefined') {
    reportWebVitals();
  }
}

/**
 * Monitora métricas customizadas
 */
export function reportCustomMetric(name: string, value: number, context?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  // GTM
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'custom_metric',
      metric_name: name,
      metric_value: value,
      ...context,
    });
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Custom Metrics',
      value: Math.round(value),
      ...context,
    });
  }

  // Log em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Custom Metric] ${name}:`, value, context);
  }
}

/**
 * Marca o início de uma performance mark
 */
export function startPerformanceMark(name: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${name}-start`);
  }
}

/**
 * Marca o fim de uma performance mark e reporta a duração
 */
export function endPerformanceMark(name: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${name}-end`);
    
    try {
      const measure = performance.measure(name, `${name}-start`, `${name}-end`);
      reportCustomMetric(name, measure.duration);
      
      // Limpar marks para evitar acúmulo de memória
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    } catch (error) {
      console.error(`[Performance] Failed to measure ${name}:`, error);
    }
  }
}

