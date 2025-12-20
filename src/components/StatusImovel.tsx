'use client';

interface StatusImovelProps {
  status: 'pre-lancamento' | 'lancamento' | 'em-construcao' | 'pronto';
  dataEntrega?: string;
}

const statusConfig = {
  'pre-lancamento': {
    label: 'Pré-Lançamento',
    step: 0,
  },
  'lancamento': {
    label: 'Lançamento',
    step: 1,
  },
  'em-construcao': {
    label: 'Em Construção',
    step: 2,
  },
  'pronto': {
    label: 'Pronto para Morar',
    step: 3,
  },
};

const steps = [
  { id: 0, label: 'Pré-Lançamento', shortLabel: 'Pré-Lançamento' },
  { id: 1, label: 'Lançamento', shortLabel: 'Lançamento', info: '' },
  { id: 2, label: 'Em Construção', shortLabel: 'Em Construção' },
  { id: 3, label: 'Pronto para Morar', shortLabel: 'Pronto', info: '' },
];

export default function StatusImovel({ status, dataEntrega }: StatusImovelProps) {
  const currentStep = statusConfig[status].step;

  return (
    <div className="w-full max-w-2xl">
      {/* Status Badge - Animado e Sofisticado */}
      <div className="flex items-center justify-center mb-10">
        <div
          className={`
            relative inline-flex items-center gap-3 px-6 py-3 rounded-full
            font-medium text-sm tracking-wide backdrop-blur-sm
            ${
              currentStep === 3
                ? 'bg-green-50/80 text-green-700 border border-green-200/60'
                : 'bg-blue-50/80 text-pharos-blue-600 border border-blue-200/60'
            }
            shadow-sm hover:shadow-md transition-all duration-300
          `}
        >
          {/* Pulse Animation */}
          <div className="relative flex items-center justify-center">
            <div
              className={`
                absolute w-2 h-2 rounded-full animate-ping
                ${currentStep === 3 ? 'bg-green-500' : 'bg-pharos-blue-500'}
              `}
              style={{ animationDuration: '2s' }}
            />
            <div
              className={`
                relative w-2 h-2 rounded-full
                ${currentStep === 3 ? 'bg-green-500' : 'bg-pharos-blue-500'}
              `}
            />
          </div>
          {statusConfig[status].label}
        </div>
      </div>

      {/* Progress Stepper Ultra-Minimalista */}
      <div className="relative px-2">
        {/* Steps */}
        <div className="grid grid-cols-4 gap-2 relative">
          {/* Progress Line com Gradiente */}
          <div 
            className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full overflow-hidden" 
            style={{ left: '5%', right: '5%' }}
          >
            <div
              className="h-full bg-gradient-to-r from-pharos-blue-400 to-pharos-blue-600 transition-all duration-1000 ease-out rounded-full relative"
              style={{ 
                width: `${(currentStep / 3) * 100}%`,
              }}
            >
              {/* Shine Effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                style={{ animationDuration: '3s' }}
              />
            </div>
          </div>

          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.id} className="relative flex flex-col items-center">
                {/* Circle com Animação */}
                <div
                  className={`
                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                    font-medium text-xs transition-all duration-500
                    ${
                      isActive
                        ? 'bg-pharos-blue-500 text-white shadow-lg shadow-pharos-blue-500/30 scale-110'
                        : 'bg-white text-gray-400 border-2 border-gray-200 scale-100'
                    }
                    ${isCurrent ? 'animate-pulse-subtle' : ''}
                  `}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {/* Glow Effect para status atual */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-pharos-blue-500 opacity-20 animate-ping" 
                         style={{ animationDuration: '2s' }} 
                    />
                  )}
                  <span className="relative z-10">{index + 1}</span>
                </div>

                {/* Label */}
                <div className="mt-3 text-center px-1">
                  <p
                    className={`
                      text-xs font-medium transition-all duration-500 leading-tight
                      ${isActive ? 'text-pharos-navy-900 opacity-100' : 'text-gray-400 opacity-60'}
                    `}
                    style={{
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden text-[10px]">{step.shortLabel}</span>
                  </p>
                  {isCurrent && dataEntrega && (
                    <p className="text-[10px] text-pharos-blue-500 font-medium mt-1.5 animate-fade-in">
                      {dataEntrega}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

