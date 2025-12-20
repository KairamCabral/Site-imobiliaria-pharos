'use client';

import { Construction, Calendar, CheckCircle2, Rocket } from 'lucide-react';

interface PropertyConstructionStatusProps {
  status: 'pre-lancamento' | 'lancamento' | 'em-construcao' | 'pronto';
  deliveryDate?: string;
  className?: string;
}

const statusConfig = {
  'pre-lancamento': {
    label: 'Pré-Lançamento',
    progress: 15,
    color: 'blue',
    icon: Rocket,
    description: 'Oportunidade exclusiva de investimento',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100/50',
    textColor: 'text-blue-700',
    progressBg: 'bg-blue-100',
    progressBar: 'bg-gradient-to-r from-blue-500 to-blue-600',
  },
  'lancamento': {
    label: 'Lançamento',
    progress: 35,
    color: 'cyan',
    icon: Rocket,
    description: 'Em fase de comercialização',
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
    textColor: 'text-cyan-700',
    progressBg: 'bg-cyan-100',
    progressBar: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
  'em-construcao': {
    label: 'Em Construção',
    progress: 65,
    color: 'green',
    icon: Construction,
    description: 'Obra em andamento',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50',
    textColor: 'text-green-700',
    progressBg: 'bg-green-100',
    progressBar: 'bg-gradient-to-r from-green-500 to-emerald-600',
  },
  'pronto': {
    label: 'Pronto para Morar',
    progress: 100,
    color: 'emerald',
    icon: CheckCircle2,
    description: 'Disponível para ocupação imediata',
    gradient: 'from-emerald-600 to-green-700',
    bgGradient: 'from-emerald-50 to-green-50',
    textColor: 'text-emerald-700',
    progressBg: 'bg-emerald-100',
    progressBar: 'bg-gradient-to-r from-emerald-600 to-green-700',
  },
};

export default function PropertyConstructionStatus({
  status,
  deliveryDate,
  className = '',
}: PropertyConstructionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div 
      className={`bg-gradient-to-br ${config.bgGradient} border border-${config.color}-200/50 rounded-2xl p-6 lg:p-8 ${className}`}
      role="status"
      aria-label={`Status da obra: ${config.label}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shadow-${config.color}-500/20`}>
              <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-pharos-navy-900">
                Status da Obra
              </h3>
              <p className={`text-xs font-semibold ${config.textColor} uppercase tracking-wide`}>
                {config.label}
              </p>
            </div>
          </div>
        </div>
        
        {/* Badge de Progresso */}
        <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} shadow-md`}>
          <span className="text-white text-sm font-bold">
            {config.progress}%
          </span>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-4">
        <div className={`relative h-3 ${config.progressBg} rounded-full overflow-hidden shadow-inner`}>
          <div
            className={`absolute inset-y-0 left-0 ${config.progressBar} rounded-full transition-all duration-1000 ease-out shadow-sm`}
            style={{ 
              width: `${config.progress}%`,
              animation: 'progressAnimation 2s ease-out'
            }}
            role="progressbar"
            aria-valuenow={config.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Descrição */}
      <p className="text-sm text-pharos-slate-700 mb-3">
        {config.description}
      </p>

      {/* Data de Entrega */}
      {deliveryDate && status !== 'pronto' && (
        <div className="flex items-center gap-2 pt-3 border-t border-current/10">
          <Calendar className={`w-4 h-4 ${config.textColor}`} />
          <span className="text-sm font-semibold text-pharos-slate-700">
            Previsão de entrega:
          </span>
          <span className={`text-sm font-bold ${config.textColor}`}>
            {deliveryDate}
          </span>
        </div>
      )}

      {/* Badge de Urgência (condicional) */}
      {status === 'lancamento' && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <svg className="w-4 h-4 text-amber-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold text-amber-700">
            Últimas unidades disponíveis!
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes progressAnimation {
          from {
            width: 0%;
          }
          to {
            width: ${config.progress}%;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}

