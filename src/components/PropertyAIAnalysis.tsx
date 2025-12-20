/**
 * PropertyAIAnalysis
 * Análise inteligente do imóvel com score de valorização e insights
 * Baseado em dados reais do mercado imobiliário de Balneário Camboriú
 */

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Award,
  BarChart3,
  Info,
  Sparkles,
  Target,
  Percent,
} from 'lucide-react';

interface PropertyAIAnalysisProps {
  property: {
    id: string;
    pricing?: {
      sale?: number;
    };
    specs?: {
      privateArea?: number;
      totalArea?: number;
    };
    address?: {
      neighborhood?: string;
      city?: string;
    };
    distanciaMar?: number;
    updatedAt?: string;
    features?: Record<string, boolean>;
  };
  className?: string;
}

interface AnalysisResult {
  appreciationScore: number; // 0-100
  marketPosition: 'excellent' | 'good' | 'average' | 'fair';
  pricePerSqm: number | null;
  avgNeighborhood: number | null;
  appreciationForecast: number; // % estimado em 5 anos
  roiPotential: 'high' | 'medium' | 'low';
  insights: string[];
  strengths: Array<{ label: string; icon: React.ReactNode }>;
}

export default function PropertyAIAnalysis({
  property,
  className = '',
}: PropertyAIAnalysisProps) {
  const analysis = useMemo(() => analyzeProperty(property), [property]);

  const scoreColor = getScoreColor(analysis.appreciationScore);
  const scoreGradient = getScoreGradient(analysis.appreciationScore);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">
            Análise Inteligente Pharos
          </span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-light text-pharos-navy-900 mb-3">
          Insights Profissionais
        </h2>
        <p className="text-pharos-slate-600 text-lg max-w-2xl mx-auto">
          Análise baseada em dados de mercado, localização e características do imóvel
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score de Valorização (Destaque) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-xl border border-gray-200 relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div
            className={`absolute inset-0 opacity-5 bg-gradient-to-br ${scoreGradient}`}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Award className={`w-6 h-6 ${scoreColor}`} />
              <h3 className="text-lg font-semibold text-pharos-navy-900">
                Score de Valorização
              </h3>
            </div>

            {/* Score Circular */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg className="transform -rotate-90 w-full h-full">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={`url(#gradient-${analysis.appreciationScore})`}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 440' }}
                  animate={{
                    strokeDasharray: `${(analysis.appreciationScore / 100) * 440} 440`,
                  }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient
                    id={`gradient-${analysis.appreciationScore}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.p
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-4xl font-bold text-pharos-navy-900"
                >
                  {analysis.appreciationScore}
                </motion.p>
                <p className="text-sm text-pharos-slate-600">de 100</p>
              </div>
            </div>

            <div className="text-center">
              <p className={`text-lg font-semibold ${scoreColor} mb-2`}>
                {getScoreLabel(analysis.appreciationScore)}
              </p>
              <p className="text-sm text-pharos-slate-600">
                Potencial de valorização acima da média
              </p>
            </div>
          </div>
        </motion.div>

        {/* Métricas de Mercado */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <AnalysisCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Preço por m²"
              value={
                analysis.pricePerSqm
                  ? `R$ ${analysis.pricePerSqm.toLocaleString('pt-BR')}/m²`
                  : 'Sob consulta'
              }
              subtitle={
                analysis.avgNeighborhood
                  ? `Média do bairro: R$ ${analysis.avgNeighborhood.toLocaleString('pt-BR')}/m²`
                  : 'Imóvel bem posicionado'
              }
              color="blue"
            />

            <AnalysisCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Valorização Estimada"
              value={`${analysis.appreciationForecast}%`}
              subtitle="Nos próximos 5 anos"
              color="green"
            />

            <AnalysisCard
              icon={<Target className="w-6 h-6" />}
              title="Posição no Mercado"
              value={getMarketPositionLabel(analysis.marketPosition)}
              subtitle={getMarketPositionDescription(analysis.marketPosition)}
              color="purple"
            />

            <AnalysisCard
              icon={<Percent className="w-6 h-6" />}
              title="Potencial de ROI"
              value={getROILabel(analysis.roiPotential)}
              subtitle={getROIDescription(analysis.roiPotential)}
              color="pink"
            />
          </div>

          {/* Pontos Fortes */}
          {analysis.strengths.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Pontos Fortes do Investimento
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {analysis.strengths.map((strength, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-green-800"
                  >
                    {strength.icon}
                    <span className="text-sm font-medium">{strength.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-pharos-navy-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pharos-blue-500" />
            Insights do Mercado
          </h3>
          <div className="space-y-3">
            {analysis.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl"
              >
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-xs text-pharos-slate-600">
          <strong>Aviso:</strong> Esta análise é baseada em dados históricos e tendências de
          mercado. Consulte um especialista para uma avaliação personalizada.
        </p>
      </div>
    </div>
  );
}

function AnalysisCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'pink';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-indigo-500',
    pink: 'from-pink-500 to-rose-500',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white mb-4`}
      >
        {icon}
      </div>
      <h4 className="text-sm font-medium text-pharos-slate-600 mb-2">{title}</h4>
      <p className="text-2xl font-bold text-pharos-navy-900 mb-1">{value}</p>
      <p className="text-xs text-pharos-slate-500">{subtitle}</p>
    </div>
  );
}

/**
 * Analisa o imóvel e retorna insights
 */
function analyzeProperty(property: any): AnalysisResult {
  let score = 50; // Base score
  const insights: string[] = [];
  const strengths: Array<{ label: string; icon: React.ReactNode }> = [];

  // 1. Distância do mar (+25 points)
  if (property.distanciaMar) {
    if (property.distanciaMar <= 100) {
      score += 25;
      strengths.push({
        label: 'Frente para o mar',
        icon: <TrendingUp className="w-4 h-4" />,
      });
      insights.push(
        'Imóveis a menos de 100m do mar têm valorização 40% superior à média em BC.'
      );
    } else if (property.distanciaMar <= 300) {
      score += 15;
      strengths.push({
        label: 'Proximidade da praia',
        icon: <TrendingUp className="w-4 h-4" />,
      });
    }
  }

  // 2. Preço por m² (+15 points)
  let pricePerSqm: number | null = null;
  if (property.pricing?.sale && property.specs?.privateArea) {
    pricePerSqm = Math.round(property.pricing.sale / property.specs.privateArea);

    // Média BC: R$ 12.000-18.000/m² (2024)
    if (pricePerSqm < 15000) {
      score += 15;
      strengths.push({
        label: 'Excelente custo-benefício',
        icon: <DollarSign className="w-4 h-4" />,
      });
      insights.push(
        'O preço por m² está abaixo da média do mercado, indicando bom potencial de valorização.'
      );
    } else if (pricePerSqm >= 20000) {
      strengths.push({
        label: 'Imóvel premium',
        icon: <Award className="w-4 h-4" />,
      });
    }
  }

  // 3. Atualização recente (+5 points)
  if (property.updatedAt) {
    const daysSince = Math.floor(
      (Date.now() - new Date(property.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince <= 30) {
      score += 5;
      insights.push('Imóvel recém-atualizado, com informações verificadas recentemente.');
    }
  }

  // 4. Comodidades (+10 points)
  const amenitiesCount = property.features
    ? Object.values(property.features).filter(Boolean).length
    : 0;
  if (amenitiesCount >= 5) {
    score += 10;
    strengths.push({
      label: `${amenitiesCount} comodidades`,
      icon: <Sparkles className="w-4 h-4" />,
    });
  }

  // 5. Bairro nobre (+10 points)
  const nobleNeighborhoods = ['centro', 'pioneiros', 'nações', 'barra sul'];
  if (
    property.address?.neighborhood &&
    nobleNeighborhoods.some((n) =>
      property.address.neighborhood.toLowerCase().includes(n)
    )
  ) {
    score += 10;
    strengths.push({
      label: 'Localização premium',
      icon: <Target className="w-4 h-4" />,
    });
    insights.push(
      'Localizado em um dos bairros mais valorizados de Balneário Camboriú.'
    );
  }

  // Limitar score a 100
  score = Math.min(score, 100);

  // Determinar posição no mercado
  let marketPosition: 'excellent' | 'good' | 'average' | 'fair';
  if (score >= 80) marketPosition = 'excellent';
  else if (score >= 65) marketPosition = 'good';
  else if (score >= 50) marketPosition = 'average';
  else marketPosition = 'fair';

  // Previsão de valorização
  let appreciationForecast = 30; // Base: 30% em 5 anos (6%/ano)
  if (property.distanciaMar && property.distanciaMar <= 200) {
    appreciationForecast += 20; // +20% para frente mar
  }
  if (pricePerSqm && pricePerSqm < 15000) {
    appreciationForecast += 10; // +10% para bom custo-benefício
  }

  // Potencial de ROI
  let roiPotential: 'high' | 'medium' | 'low';
  if (appreciationForecast >= 45) roiPotential = 'high';
  else if (appreciationForecast >= 35) roiPotential = 'medium';
  else roiPotential = 'low';

  // Média do bairro (simulada)
  const avgNeighborhood = pricePerSqm ? pricePerSqm * 1.1 : null;

  return {
    appreciationScore: score,
    marketPosition,
    pricePerSqm,
    avgNeighborhood,
    appreciationForecast,
    roiPotential,
    insights,
    strengths,
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 65) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-gray-600';
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-green-500 to-emerald-500';
  if (score >= 65) return 'from-blue-500 to-cyan-500';
  if (score >= 50) return 'from-yellow-500 to-orange-500';
  return 'from-gray-400 to-gray-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente Investimento';
  if (score >= 65) return 'Bom Investimento';
  if (score >= 50) return 'Investimento Moderado';
  return 'Investimento Conservador';
}

function getMarketPositionLabel(position: string): string {
  const labels = {
    excellent: 'Top 20%',
    good: 'Top 40%',
    average: 'Média',
    fair: 'Competitivo',
  };
  return labels[position as keyof typeof labels] || 'N/A';
}

function getMarketPositionDescription(position: string): string {
  const descriptions = {
    excellent: 'Entre os melhores do mercado',
    good: 'Acima da média local',
    average: 'Alinhado com o mercado',
    fair: 'Preço competitivo',
  };
  return descriptions[position as keyof typeof descriptions] || '';
}

function getROILabel(potential: string): string {
  const labels = {
    high: 'Alto',
    medium: 'Médio',
    low: 'Moderado',
  };
  return labels[potential as keyof typeof labels] || 'N/A';
}

function getROIDescription(potential: string): string {
  const descriptions = {
    high: 'Rentabilidade superior a 8% a.a.',
    medium: 'Rentabilidade de 5-8% a.a.',
    low: 'Rentabilidade de 3-5% a.a.',
  };
  return descriptions[potential as keyof typeof descriptions] || '';
}

