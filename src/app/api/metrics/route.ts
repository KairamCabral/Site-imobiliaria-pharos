/**
 * API Endpoint: /api/metrics
 * Recebe métricas de Web Vitals (RUM) dos usuários reais
 * e envia para sistemas de monitoramento
 */

import { NextRequest, NextResponse } from 'next/server';

// Tipos de métricas suportadas
type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
type MetricRating = 'good' | 'needs-improvement' | 'poor';

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: MetricRating;
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

interface MetricPayload {
  metrics: WebVitalMetric[];
  page: string;
  userAgent: string;
  timestamp: number;
  sessionId?: string;
}

// Rate limiting simples (em produção, usar Redis)
const metricsCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 30; // Aumentado para 30 requisições/minuto

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = metricsCache.get(ip);
  
  // Se não existe ou expirou, criar novo
  if (!entry || now > entry.resetAt) {
    metricsCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  // Se ainda dentro da janela, incrementar contador
  if (entry.count < MAX_REQUESTS_PER_WINDOW) {
    entry.count++;
    return false;
  }
  
  // Limite excedido
  return true;
}

// Validação de métricas
function isValidMetric(metric: any): metric is WebVitalMetric {
  return (
    typeof metric === 'object' &&
    typeof metric.name === 'string' &&
    ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'].includes(metric.name) &&
    typeof metric.value === 'number' &&
    metric.value >= 0 &&
    typeof metric.rating === 'string' &&
    ['good', 'needs-improvement', 'poor'].includes(metric.rating)
  );
}

// Enviar para Google Analytics 4
async function sendToGA4(payload: MetricPayload) {
  const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const GA4_API_SECRET = process.env.GA4_API_SECRET;
  
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    console.warn('[Metrics] GA4 não configurado, pulando envio');
    return;
  }
  
  try {
    const events = payload.metrics.map((metric) => ({
      name: 'web_vitals',
      params: {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_rating: metric.rating,
        metric_delta: Math.round(metric.delta),
        metric_id: metric.id,
        page_path: payload.page,
        navigation_type: metric.navigationType,
      },
    }));
    
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: payload.sessionId || 'anonymous',
          events,
        }),
      }
    );
    
    if (!response.ok) {
      console.error('[Metrics] Erro ao enviar para GA4:', response.status);
    }
  } catch (error) {
    console.error('[Metrics] Erro ao enviar para GA4:', error);
  }
}

// Enviar para Datadog (opcional)
async function sendToDatadog(payload: MetricPayload) {
  const DD_API_KEY = process.env.DATADOG_API_KEY;
  const DD_SITE = process.env.DATADOG_SITE || 'datadoghq.com';
  
  if (!DD_API_KEY) {
    return; // Opcional
  }
  
  try {
    const metrics = payload.metrics.map((metric) => ({
      metric: `web.vitals.${metric.name.toLowerCase()}`,
      points: [[Math.floor(payload.timestamp / 1000), metric.value]],
      type: 'gauge',
      tags: [
        `page:${payload.page}`,
        `rating:${metric.rating}`,
        `navigation:${metric.navigationType}`,
      ],
    }));
    
    await fetch(`https://api.${DD_SITE}/api/v1/series`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': DD_API_KEY,
      },
      body: JSON.stringify({ series: metrics }),
    });
  } catch (error) {
    console.error('[Metrics] Erro ao enviar para Datadog:', error);
  }
}

// Log para desenvolvimento
function logMetrics(payload: MetricPayload) {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📊 [Web Vitals] Métricas recebidas:');
    payload.metrics.forEach((metric) => {
      const icon = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`  ${icon} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    });
    console.log(`  📄 Página: ${payload.page}\n`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Parse body
    const body = await request.json();
    
    // Suporte para batch (array de payloads) ou payload único
    const payloads = Array.isArray(body) ? body : [body];
    
    // Processar cada payload
    let totalMetricsReceived = 0;
    
    for (const payload of payloads) {
      // Validação básica
      if (!payload.metrics || !Array.isArray(payload.metrics) || payload.metrics.length === 0) {
        continue; // Pular payloads inválidos no batch
      }
      
      totalMetricsReceived += payload.metrics.length;
    }
    
    if (totalMetricsReceived === 0) {
      return NextResponse.json(
        { error: 'No valid metrics found in batch' },
        { status: 400 }
      );
    }
    
    // Por simplicidade, processar apenas o primeiro payload válido
    // (em produção, processar todos)
    const validPayload = payloads.find(p => 
      p.metrics && Array.isArray(p.metrics) && p.metrics.length > 0
    );
    
    if (!validPayload) {
      return NextResponse.json(
        { error: 'Invalid payload: metrics array required' },
        { status: 400 }
      );
    }
    
    // Validar cada métrica
    const validMetrics = validPayload.metrics.filter(isValidMetric);
    if (validMetrics.length === 0) {
      return NextResponse.json(
        { error: 'No valid metrics found' },
        { status: 400 }
      );
    }
    
    const payload: MetricPayload = {
      metrics: validMetrics,
      page: validPayload.page || request.headers.get('referer') || '/',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: validPayload.timestamp || Date.now(),
      sessionId: validPayload.sessionId,
    };
    
    // Log (desenvolvimento)
    logMetrics(payload);
    
    // Enviar para sistemas de monitoramento (não-bloqueante)
    Promise.all([
      sendToGA4(payload),
      sendToDatadog(payload),
    ]).catch((error) => {
      console.error('[Metrics] Erro ao enviar métricas:', error);
    });
    
    return NextResponse.json(
      { 
        success: true, 
        received: validMetrics.length,
        message: 'Metrics received successfully' 
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[Metrics API] Erro:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'web-vitals-collector',
    timestamp: new Date().toISOString(),
  });
}
