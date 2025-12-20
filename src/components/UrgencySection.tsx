'use client';

import { useState, useEffect } from 'react';
import { Eye, Zap, CheckCircle2, Clock, TrendingUp, Users } from 'lucide-react';

interface UrgencySectionProps {
  propertyId: string;
  propertyCode: string;
  buildingId?: string;
  availableUnits?: number;
  className?: string;
}

export default function UrgencySection({
  propertyId,
  propertyCode,
  buildingId,
  availableUnits,
  className = '',
}: UrgencySectionProps) {
  const [mounted, setMounted] = useState(false);
  const [viewsToday, setViewsToday] = useState(0);
  const [visitsThisWeek, setVisitsThisWeek] = useState(0);
  const [interestedToday, setInterestedToday] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Simular dados de urgência (em produção, vir de API)
    const mockViewsToday = Math.floor(Math.random() * 30) + 15; // 15-45
    const mockVisitsThisWeek = Math.floor(Math.random() * 20) + 10; // 10-30
    const mockInterestedToday = Math.floor(Math.random() * 8) + 3; // 3-11
    
    setViewsToday(mockViewsToday);
    setVisitsThisWeek(mockVisitsThisWeek);
    setInterestedToday(mockInterestedToday);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'urgency_section_impression', {
        property_id: propertyId,
        property_code: propertyCode,
      });
    }
  }, [propertyId, propertyCode]);

  // Evitar hidratação incorreta: não renderizar até montar no cliente
  if (!mounted) {
    return (
      <div className={`bg-gradient-to-br from-pharos-slate-50 to-white border border-pharos-slate-200 rounded-2xl p-6 lg:p-8 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pharos-blue-500 to-pharos-blue-600 flex items-center justify-center shadow-lg shadow-pharos-blue-500/20">
            <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-pharos-navy-900">
              Imóvel em Destaque
            </h3>
            <p className="text-xs text-pharos-slate-600">
              Carregando informações...
            </p>
          </div>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-pharos-slate-100 rounded-xl" />
          <div className="h-20 bg-pharos-slate-100 rounded-xl" />
          <div className="h-20 bg-pharos-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const urgencyItems = [
    {
      icon: Eye,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-500',
      label: `${viewsToday} pessoas viram este imóvel hoje`,
      description: 'Alto interesse',
      pulse: true,
    },
    {
      icon: Users,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-500',
      label: `${interestedToday} interessados hoje`,
      description: 'Demanda ativa',
      pulse: false,
    },
    {
      icon: CheckCircle2,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconBg: 'bg-green-500',
      label: `${visitsThisWeek} visitas agendadas esta semana`,
      description: 'Procurado',
      pulse: false,
    },
  ];

  // Adicionar escassez se houver unidades limitadas
  if (availableUnits !== undefined && availableUnits <= 5) {
    urgencyItems.unshift({
      icon: Zap,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      iconBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      label: `Apenas ${availableUnits} ${availableUnits === 1 ? 'unidade disponível' : 'unidades disponíveis'}`,
      description: 'Últimas oportunidades!',
      pulse: true,
    });
  }

  return (
    <div className={`bg-gradient-to-br from-pharos-slate-50 to-white border border-pharos-slate-200 rounded-2xl p-6 lg:p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pharos-blue-500 to-pharos-blue-600 flex items-center justify-center shadow-lg shadow-pharos-blue-500/20">
          <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-pharos-navy-900">
            Imóvel em Destaque
          </h3>
          <p className="text-xs text-pharos-slate-600">
            Informações em tempo real
          </p>
        </div>
      </div>

      {/* Urgency Items */}
      <div className="space-y-3">
        {urgencyItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <div
              key={index}
              className={`relative group flex items-start gap-4 p-4 ${item.bgColor} border border-${item.color}-200/50 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}
            >
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shadow-lg shadow-${item.color}-500/20`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                {item.pulse && (
                  <>
                    <span className={`absolute inset-0 w-12 h-12 bg-${item.color}-500 rounded-xl animate-ping opacity-20`} />
                    <span className={`absolute top-0 right-0 w-3 h-3 bg-${item.color}-500 rounded-full border-2 border-white animate-pulse`} />
                  </>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className={`font-bold text-pharos-navy-900 text-sm lg:text-base leading-tight mb-1`}>
                  {item.label}
                </p>
                <p className={`text-xs ${item.textColor} font-semibold`}>
                  {item.description}
                </p>
              </div>

              {/* Hover Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg 
                  className={`w-5 h-5 ${item.textColor}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-6 pt-6 border-t border-pharos-slate-200">
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-pharos-blue-50 to-cyan-50 border border-pharos-blue-200/50 rounded-xl">
          <Clock className="w-5 h-5 text-pharos-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-pharos-navy-900 mb-1">
              Não perca tempo!
            </p>
            <p className="text-xs text-pharos-slate-700 leading-relaxed">
              Imóveis com alta procura são negociados rapidamente. Entre em contato agora e garanta sua visita.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

