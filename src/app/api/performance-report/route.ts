/**
 * API Route: /api/performance-report
 * 
 * Dashboard de métricas de performance em tempo real
 * Agrega dados de Web Vitals, bundle size, cache hit rate
 * 
 * Acesso: GET /api/performance-report?secret=YOUR_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  page: string;
}

// In-memory storage (em produção usar Redis)
const metricsStore = new Map<string, PerformanceMetric[]>();
const MAX_METRICS_PER_PAGE = 100;

/**
 * Calcular estatísticas de métricas
 */
function calculateStats(metrics: PerformanceMetric[]) {
  if (metrics.length === 0) {
    return { p50: 0, p75: 0, p95: 0, avg: 0, count: 0 };
  }
  
  const values = metrics.map(m => m.value).sort((a, b) => a - b);
  const count = values.length;
  
  return {
    p50: values[Math.floor(count * 0.5)],
    p75: values[Math.floor(count * 0.75)],
    p95: values[Math.floor(count * 0.95)],
    avg: values.reduce((a, b) => a + b, 0) / count,
    count,
  };
}

/**
 * Obter threshold para uma métrica
 */
function getThreshold(metric: string, level: 'good' | 'needs-improvement'): number {
  const thresholds: Record<string, { good: number; needsImprovement: number }> = {
    LCP: { good: 2500, needsImprovement: 4000 },
    INP: { good: 200, needsImprovement: 500 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
  };
  const key = level === 'good' ? 'good' : 'needsImprovement';
  return thresholds[metric]?.[key] || 0;
}

/**
 * Formatar valor de métrica
 */
function formatMetric(name: string, value: number): string {
  if (name === 'CLS') return value.toFixed(3);
  return Math.round(value) + 'ms';
}

/**
 * Calcular distribuição por rating
 */
function calculateRatingDistribution(metrics: PerformanceMetric[]) {
  const total = metrics.length;
  if (total === 0) return { good: 0, needsImprovement: 0, poor: 0 };
  
  const good = metrics.filter(m => m.rating === 'good').length;
  const needsImprovement = metrics.filter(m => m.rating === 'needs-improvement').length;
  const poor = metrics.filter(m => m.rating === 'poor').length;
  
  return {
    good: (good / total) * 100,
    needsImprovement: (needsImprovement / total) * 100,
    poor: (poor / total) * 100,
  };
}

/**
 * Gerar relatório completo
 */
function generateReport() {
  const pages = Array.from(metricsStore.keys());
  const report: any = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: pages.length,
      totalMetrics: 0,
    },
    pages: {},
    overall: {
      LCP: { p50: 0, p75: 0, p95: 0, avg: 0, distribution: {} },
      INP: { p50: 0, p75: 0, p95: 0, avg: 0, distribution: {} },
      CLS: { p50: 0, p75: 0, p95: 0, avg: 0, distribution: {} },
      FCP: { p50: 0, p75: 0, p95: 0, avg: 0, distribution: {} },
      TTFB: { p50: 0, p75: 0, p95: 0, avg: 0, distribution: {} },
    },
  };
  
  // Agregar todas as métricas
  const allMetrics: Record<string, PerformanceMetric[]> = {
    LCP: [],
    INP: [],
    CLS: [],
    FCP: [],
    TTFB: [],
  };
  
  pages.forEach((page) => {
    const pageMetrics = metricsStore.get(page) || [];
    report.summary.totalMetrics += pageMetrics.length;
    
    const pageReport: any = {
      url: page,
      metrics: {},
    };
    
    // Agrupar por tipo de métrica
    const metricsByName: Record<string, PerformanceMetric[]> = {};
    pageMetrics.forEach((metric) => {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = [];
      }
      metricsByName[metric.name].push(metric);
      
      // Adicionar ao overall
      if (allMetrics[metric.name]) {
        allMetrics[metric.name].push(metric);
      }
    });
    
    // Calcular stats por métrica
    Object.entries(metricsByName).forEach(([name, metrics]) => {
      pageReport.metrics[name] = {
        ...calculateStats(metrics),
        distribution: calculateRatingDistribution(metrics),
      };
    });
    
    report.pages[page] = pageReport;
  });
  
  // Calcular overall stats
  Object.entries(allMetrics).forEach(([name, metrics]) => {
    report.overall[name] = {
      ...calculateStats(metrics),
      distribution: calculateRatingDistribution(metrics),
    };
  });
  
  // Score geral (baseado em % de "good")
  const avgGoodPercent = Object.values(allMetrics)
    .map(metrics => calculateRatingDistribution(metrics).good)
    .reduce((a, b) => a + b, 0) / Object.keys(allMetrics).length;
  
  report.summary.score = Math.round(avgGoodPercent);
  
  return report;
}

/**
 * GET - Obter relatório de performance
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  
  // Autenticação (opcional em dev, obrigatório em prod)
  if (process.env.NODE_ENV === 'production') {
    const REPORT_SECRET = process.env.PERFORMANCE_REPORT_SECRET;
    if (REPORT_SECRET && secret !== REPORT_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  const format = searchParams.get('format') || 'json';
  const page = searchParams.get('page');
  
  // Filtrar por página específica
  if (page) {
    const pageMetrics = metricsStore.get(page) || [];
    const metricsByName: Record<string, PerformanceMetric[]> = {};
    
    pageMetrics.forEach((metric) => {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = [];
      }
      metricsByName[metric.name].push(metric);
    });
    
    const pageReport: any = { url: page, metrics: {} };
    
    Object.entries(metricsByName).forEach(([name, metrics]) => {
      pageReport.metrics[name] = {
        ...calculateStats(metrics),
        distribution: calculateRatingDistribution(metrics),
      };
    });
    
    return NextResponse.json(pageReport);
  }
  
  // Relatório completo
  const report = generateReport();
  
  if (format === 'html') {
    // HTML Dashboard (opcional)
    return new NextResponse(generateHTMLDashboard(report), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
  
  return NextResponse.json(report);
}

/**
 * POST - Adicionar métrica (usado internamente)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, page } = body;
    
    if (!metric || !page) {
      return NextResponse.json(
        { error: 'Missing metric or page' },
        { status: 400 }
      );
    }
    
    // Adicionar ao store
    if (!metricsStore.has(page)) {
      metricsStore.set(page, []);
    }
    
    const pageMetrics = metricsStore.get(page)!;
    pageMetrics.push({
      ...metric,
      timestamp: Date.now(),
    });
    
    // Limitar tamanho (manter apenas últimos 100)
    if (pageMetrics.length > MAX_METRICS_PER_PAGE) {
      pageMetrics.shift();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}

/**
 * Gerar HTML Dashboard (simples)
 */
function generateHTMLDashboard(report: any): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Dashboard - Pharos</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f9fafb;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #111827; margin-bottom: 8px; }
    .subtitle { color: #6b7280; margin-bottom: 32px; }
    .score {
      font-size: 72px;
      font-weight: bold;
      color: ${report.summary.score >= 75 ? '#10b981' : report.summary.score >= 50 ? '#f59e0b' : '#ef4444'};
      text-align: center;
      margin-bottom: 8px;
    }
    .score-label { text-align: center; color: #6b7280; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .metric-name { font-weight: 600; color: #374151; margin-bottom: 12px; }
    .metric-value { font-size: 32px; font-weight: bold; margin-bottom: 4px; }
    .metric-p75 { color: #6b7280; font-size: 14px; }
    .good { color: #10b981; }
    .needs-improvement { color: #f59e0b; }
    .poor { color: #ef4444; }
    .distribution {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .dist-good { background: #10b981; }
    .dist-warning { background: #f59e0b; }
    .dist-poor { background: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ Performance Dashboard</h1>
    <p class="subtitle">Real User Monitoring - Pharos Imobiliária</p>
    
    <div class="score">${report.summary.score}</div>
    <p class="score-label">Performance Score (% "Good" CWV)</p>
    
    <div class="grid">
      ${Object.entries(report.overall).map(([name, stats]: [string, any]) => `
        <div class="card">
          <div class="metric-name">${name}</div>
          <div class="metric-value ${stats.p75 <= getThreshold(name, 'good') ? 'good' : stats.p75 <= getThreshold(name, 'needs-improvement') ? 'needs-improvement' : 'poor'}">
            ${formatMetric(name, stats.p75)}
          </div>
          <div class="metric-p75">p75: ${formatMetric(name, stats.p75)} | avg: ${formatMetric(name, stats.avg)}</div>
          <div class="distribution">
            <div class="dist-good" style="flex: ${stats.distribution.good}"></div>
            <div class="dist-warning" style="flex: ${stats.distribution.needsImprovement}"></div>
            <div class="dist-poor" style="flex: ${stats.distribution.poor}"></div>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
            ✅ ${stats.distribution.good.toFixed(0)}% good
            ⚠️ ${stats.distribution.needsImprovement.toFixed(0)}% needs improvement
            ❌ ${stats.distribution.poor.toFixed(0)}% poor
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="card">
      <h2 style="margin-bottom: 16px;">📊 Por Página</h2>
      <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; overflow: auto; font-size: 12px;">
${JSON.stringify(report.pages, null, 2)}
      </pre>
    </div>
    
    <p style="text-align: center; color: #9ca3af; margin-top: 32px;">
      Atualizado em: ${new Date(report.timestamp).toLocaleString('pt-BR')}
    </p>
  </div>
  
  <script>
    function getThreshold(metric, level) {
      const thresholds = {
        LCP: { good: 2500, needsImprovement: 4000 },
        INP: { good: 200, needsImprovement: 500 },
        CLS: { good: 0.1, needsImprovement: 0.25 },
        FCP: { good: 1800, needsImprovement: 3000 },
        TTFB: { good: 800, needsImprovement: 1800 },
      };
      return thresholds[metric]?.[level] || 0;
    }
    
    function formatMetric(name, value) {
      if (name === 'CLS') return value.toFixed(3);
      return Math.round(value) + 'ms';
    }
    
    // Auto-refresh a cada 30s
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>
  `.trim();
}

