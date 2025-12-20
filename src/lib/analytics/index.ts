type WebVitalMetric = {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: string;
  entries: PerformanceEntry[];
  attribution?: Record<string, unknown>;
  navigationType?: string;
};

type ApiMetric = {
  id: string;
  url: string;
  endpoint: string;
  method: string;
  status: number;
  ok: boolean;
  duration: number;
  fromCache?: string | null;
  timestamp: string;
  filtersHash?: string;
  errorMessage?: string;
};

type AnalyticsPayload =
  | { type: 'web-vital'; metric: WebVitalMetric }
  | { type: 'api'; metric: ApiMetric };

const ANALYTICS_ENDPOINT = '/api/metrics';

// Buffer para batching de métricas
let metricsQueue: AnalyticsPayload[] = [];
let batchTimer: NodeJS.Timeout | null = null;

function sendBatchedMetrics() {
  if (metricsQueue.length === 0) return;
  
  const batch = [...metricsQueue];
  metricsQueue = [];
  
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
      return;
    }

    if (typeof fetch !== 'undefined') {
      void fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
        keepalive: true,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[Analytics] Falha ao enviar métricas em batch', error);
    }
  }
}

function sendToAnalytics(payload: AnalyticsPayload) {
  // Não enviar em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  
  // Adicionar ao buffer
  metricsQueue.push(payload);
  
  // Agendar envio em batch (debounce de 3s)
  if (batchTimer) {
    clearTimeout(batchTimer);
  }
  
  batchTimer = setTimeout(() => {
    sendBatchedMetrics();
  }, 3000);
  
  // Enviar imediatamente antes de fechar a página
  if (typeof window !== 'undefined' && !('__pharos_beforeunload_set__' in window)) {
    (window as any).__pharos_beforeunload_set__ = true;
    window.addEventListener('beforeunload', () => {
      sendBatchedMetrics();
    });
  }
}

export async function initWebVitalsAnalytics() {
  if (typeof window === 'undefined') return;
  const flag = '__pharos_web_vitals_initialized__';
  if ((window as any)[flag]) return;
  (window as any)[flag] = true;

  try {
    const { onCLS, onFID, onLCP, onINP, onTTFB, onFCP } = await import('web-vitals');

    const report = (metric: WebVitalMetric) => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      sendToAnalytics({
        type: 'web-vital',
        metric: {
          ...metric,
          navigationType: navEntry?.type,
        },
      });

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.info(`📈 [WebVital] ${metric.name}:`, Math.round(metric.value * 100) / 100);
      }
    };

    // Reportar apenas valores finais (não todas as mudanças) para evitar requisições excessivas
    onCLS(report);
    onFID(report);
    onLCP(report);
    onINP(report);
    onTTFB(report);
    onFCP(report);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[Analytics] Web Vitals indisponível', error);
    }
  }
}

export function reportApiMetric(metric: ApiMetric) {
  sendToAnalytics({ type: 'api', metric });

  if (process.env.NODE_ENV === 'development') {
    const statusEmoji = metric.ok ? '✅' : '❌';
    const cacheInfo = metric.fromCache ? ` cache=${metric.fromCache}` : '';
    // eslint-disable-next-line no-console
    console.info(
      `${statusEmoji} [API Metric] ${metric.endpoint} em ${metric.duration.toFixed(1)}ms (status ${metric.status})${cacheInfo}`,
    );
  }
}

export async function hashFilters(params: URLSearchParams) {
  const raw = params.toString();

  if (typeof window === 'undefined' || typeof crypto === 'undefined' || !('subtle' in crypto)) {
    return raw.slice(0, 64);
  }

  try {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 64);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[Analytics] Falha ao gerar hash de filtros', error);
    }
    return raw.slice(0, 64);
  }
}

