import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Zap, Eye, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard Web Vitals | Pharos',
  description: 'Monitoramento em tempo real das métricas de performance do site (LCP, INP, CLS, FCP, TTFB)',
  robots: 'noindex, nofollow', // Página interna/administrativa
};

// ✅ Força renderização dinâmica (página faz fetch com no-store)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Tipos para as métricas
type WebVitalMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  url: string;
  userAgent: string;
  timestamp: number;
  receivedAt: string;
};

type MetricStats = {
  p50: number;
  p75: number;
  p95: number;
  count: number;
  good: number;
  needsImprovement: number;
  poor: number;
};

// Thresholds para cada métrica
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
  FID: { good: 100, poor: 300 },
};

// Server Component que busca dados do endpoint
async function getWebVitalsData(metricName: string, limit = 100): Promise<WebVitalMetric[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3700';
  
  try {
    const response = await fetch(`${baseUrl}/api/metrics?name=${metricName}&limit=${limit}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${metricName} data:`, response.status);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching ${metricName}:`, error);
    return [];
  }
}

// Calcular estatísticas
function calculateStats(metrics: WebVitalMetric[]): MetricStats {
  if (metrics.length === 0) {
    return { p50: 0, p75: 0, p95: 0, count: 0, good: 0, needsImprovement: 0, poor: 0 };
  }

  const values = metrics.map(m => m.value).sort((a, b) => a - b);
  const count = values.length;

  const p50 = values[Math.floor(count * 0.5)] || 0;
  const p75 = values[Math.floor(count * 0.75)] || 0;
  const p95 = values[Math.floor(count * 0.95)] || 0;

  const ratings = metrics.reduce((acc, m) => {
    acc[m.rating]++;
    return acc;
  }, { good: 0, 'needs-improvement': 0, poor: 0 });

  return {
    p50,
    p75,
    p95,
    count,
    good: ratings.good,
    needsImprovement: ratings['needs-improvement'],
    poor: ratings.poor,
  };
}

// Formatar valores
function formatMetricValue(name: string, value: number): string {
  if (name === 'CLS') return value.toFixed(3);
  return `${Math.round(value)}ms`;
}

// Componente de Card de Métrica
function MetricCard({
  name,
  label,
  icon: Icon,
  stats,
  threshold,
}: {
  name: string;
  label: string;
  icon: any;
  stats: MetricStats;
  threshold: { good: number; poor: number };
}) {
  const getRatingColor = (value: number) => {
    if (value <= threshold.good) return 'text-green-600 bg-green-50 border-green-200';
    if (value <= threshold.poor) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const ratingClass = getRatingColor(stats.p75);
  const goodPercentage = stats.count > 0 ? ((stats.good / stats.count) * 100).toFixed(0) : '0';

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-pharos-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5 text-pharos-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">{label}</h3>
          </div>
          <p className="text-sm text-gray-500">{name}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${ratingClass}`}>
          {goodPercentage}% Good
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-gray-600">P75 (target)</span>
            <span className={`text-2xl font-bold ${getRatingColor(stats.p75).split(' ')[0]}`}>
              {formatMetricValue(name, stats.p75)}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${stats.p75 <= threshold.good ? 'bg-green-500' : stats.p75 <= threshold.poor ? 'bg-orange-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min((stats.p75 / (threshold.poor * 1.5)) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500 mb-1">P50</div>
            <div className="text-base font-semibold text-gray-900">
              {formatMetricValue(name, stats.p50)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">P95</div>
            <div className="text-base font-semibold text-gray-900">
              {formatMetricValue(name, stats.p95)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Amostras</div>
            <div className="text-base font-semibold text-gray-900">{stats.count}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <div className="text-xs text-gray-500">Good</div>
            <div className="text-sm font-semibold text-green-600">{stats.good}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Needs Work</div>
            <div className="text-sm font-semibold text-orange-600">{stats.needsImprovement}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Poor</div>
            <div className="text-sm font-semibold text-red-600">{stats.poor}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function WebVitalsDashboardPage() {
  // Buscar dados de todas as métricas em paralelo
  const [lcpData, inpData, clsData, fcpData, ttfbData] = await Promise.all([
    getWebVitalsData('LCP', 200),
    getWebVitalsData('INP', 200),
    getWebVitalsData('CLS', 200),
    getWebVitalsData('FCP', 200),
    getWebVitalsData('TTFB', 200),
  ]);

  // Calcular estatísticas
  const lcpStats = calculateStats(lcpData);
  const inpStats = calculateStats(inpData);
  const clsStats = calculateStats(clsData);
  const fcpStats = calculateStats(fcpData);
  const ttfbStats = calculateStats(ttfbData);

  // Score geral (baseado em P75)
  const calculateScore = () => {
    const weights = { LCP: 0.3, INP: 0.3, CLS: 0.25, FCP: 0.1, TTFB: 0.05 };
    let score = 0;

    if (lcpStats.p75 <= THRESHOLDS.LCP.good) score += weights.LCP * 100;
    else if (lcpStats.p75 <= THRESHOLDS.LCP.poor) score += weights.LCP * 50;

    if (inpStats.p75 <= THRESHOLDS.INP.good) score += weights.INP * 100;
    else if (inpStats.p75 <= THRESHOLDS.INP.poor) score += weights.INP * 50;

    if (clsStats.p75 <= THRESHOLDS.CLS.good) score += weights.CLS * 100;
    else if (clsStats.p75 <= THRESHOLDS.CLS.poor) score += weights.CLS * 50;

    if (fcpStats.p75 <= THRESHOLDS.FCP.good) score += weights.FCP * 100;
    else if (fcpStats.p75 <= THRESHOLDS.FCP.poor) score += weights.FCP * 50;

    if (ttfbStats.p75 <= THRESHOLDS.TTFB.good) score += weights.TTFB * 100;
    else if (ttfbStats.p75 <= THRESHOLDS.TTFB.poor) score += weights.TTFB * 50;

    return Math.round(score);
  };

  const overallScore = calculateScore();
  const totalSamples = lcpStats.count + inpStats.count + clsStats.count + fcpStats.count + ttfbStats.count;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Web Vitals Dashboard</h1>
                <p className="text-sm text-gray-500">Monitoramento Real User Metrics (RUM)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Performance Score</div>
              <div className={`text-3xl font-bold ${overallScore >= 90 ? 'text-green-600' : overallScore >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                {overallScore}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Amostras</div>
                <div className="text-xl font-bold text-gray-900">{totalSamples}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Core Web Vitals</div>
                <div className="text-xl font-bold text-gray-900">3/3</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Período</div>
                <div className="text-xl font-bold text-gray-900">24h</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Última atualização</div>
                <div className="text-xl font-bold text-gray-900">Tempo real</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Core Web Vitals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              name="LCP"
              label="Largest Contentful Paint"
              icon={Zap}
              stats={lcpStats}
              threshold={THRESHOLDS.LCP}
            />
            <MetricCard
              name="INP"
              label="Interaction to Next Paint"
              icon={Activity}
              stats={inpStats}
              threshold={THRESHOLDS.INP}
            />
            <MetricCard
              name="CLS"
              label="Cumulative Layout Shift"
              icon={TrendingDown}
              stats={clsStats}
              threshold={THRESHOLDS.CLS}
            />
          </div>
        </div>

        {/* Additional Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Métricas Adicionais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              name="FCP"
              label="First Contentful Paint"
              icon={Eye}
              stats={fcpStats}
              threshold={THRESHOLDS.FCP}
            />
            <MetricCard
              name="TTFB"
              label="Time to First Byte"
              icon={Clock}
              stats={ttfbStats}
              threshold={THRESHOLDS.TTFB}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📊 Sobre este Dashboard</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            Este dashboard monitora métricas reais de usuários (RUM - Real User Monitoring) coletadas via API <code className="bg-white px-1.5 py-0.5 rounded">/api/metrics</code>.
            As métricas seguem os padrões do Google Core Web Vitals e são essenciais para SEO e UX.
            <strong> P75</strong> é o percentil 75, usado como referência pelo Google para classificação.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-blue-900">🟢 Good:</strong> Performance excelente
            </div>
            <div>
              <strong className="text-blue-900">🟡 Needs Improvement:</strong> Pode melhorar
            </div>
            <div>
              <strong className="text-blue-900">🔴 Poor:</strong> Requer atenção urgente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

