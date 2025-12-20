'use client';

import { useEffect, useState } from 'react';
import type { Property } from '@/domain/models';

interface PropertyConstructionTimelineProps {
  obraStatus?: Property['obraStatus'];
  deliveryDate?: string;
  buildingName?: string;
  className?: string;
}

interface Stage {
  id: number;
  key: string;
  label: string;
  shortLabel: string;
}

const STAGES: Stage[] = [
  { id: 1, key: 'pre-lancamento', label: 'Pré-Lançamento', shortLabel: 'Breve Lançamento' },
  { id: 2, key: 'lancamento', label: 'Lançamento', shortLabel: 'Lançamento' },
  { id: 3, key: 'construcao', label: 'Em Construção', shortLabel: 'Em Construção' },
  { id: 4, key: 'pronto', label: 'Pronto', shortLabel: 'Pronto' },
];

export default function PropertyConstructionTimeline({
  obraStatus,
  deliveryDate,
  buildingName,
  className = '',
}: PropertyConstructionTimelineProps) {
  const [animated, setAnimated] = useState(false);
  
  // Não renderiza se não tiver status da obra
  if (!obraStatus) {
    return null;
  }

  // Determinar estágio atual (sem fallback - se não encontrar, não renderiza)
  const currentStage = STAGES.find(s => s.key === obraStatus);
  
  // Se não encontrou estágio válido, não renderiza
  if (!currentStage) {
    return null;
  }
  
  // Formatar data de entrega
  const formattedDeliveryDate = deliveryDate ? (() => {
    try {
      const date = new Date(deliveryDate);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      const year = date.getFullYear();
      return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    } catch {
      return null;
    }
  })() : null;

  // Animar após montagem
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 ${className}`}>
      {/* Título */}
      <div className="mb-8">
        <h2 className="text-lg lg:text-xl font-light text-gray-900 mb-1">
          Status do {buildingName || 'Empreendimento'}
        </h2>
        <p className="text-sm text-gray-500">
          Acompanhe a evolução da obra
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linha de fundo (cinza) */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" 
             style={{ 
               left: 'calc(1.5rem)', 
               right: 'calc(1.5rem)',
               marginLeft: '0',
               marginRight: '0',
             }} 
        />
        
        {/* Linha de progresso (azul animada) */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-pharos-blue-500 to-pharos-blue-600 transition-all duration-1000 ease-out"
          style={{ 
            left: 'calc(1.5rem)',
            width: animated 
              ? `calc(${((currentStage.id - 1) / (STAGES.length - 1)) * 100}% - 1.5rem)` 
              : '0%',
          }} 
        />

        {/* Estágios */}
        <div className="relative grid grid-cols-4 gap-2">
          {STAGES.map((stage, index) => {
            const isActive = stage.id <= currentStage.id;
            const isCurrent = stage.id === currentStage.id;
            const isPast = stage.id < currentStage.id;
            
            return (
              <div key={stage.id} className="flex flex-col items-center">
                {/* Círculo */}
                <div className="relative mb-3">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                      transition-all duration-500 ease-out
                      ${animated ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
                      ${isCurrent 
                        ? 'bg-pharos-blue-500 text-white shadow-lg shadow-pharos-blue-500/30 ring-4 ring-pharos-blue-100' 
                        : isPast
                        ? 'bg-pharos-blue-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}
                    style={{ 
                      transitionDelay: `${index * 150}ms` 
                    }}
                  >
                    {stage.id}
                  </div>
                  
                  {/* Pulso animado no estágio atual */}
                  {isCurrent && animated && (
                    <div className="absolute inset-0 rounded-full bg-pharos-blue-500 animate-ping opacity-20" />
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p 
                    className={`
                      text-xs lg:text-sm font-medium transition-all duration-500
                      ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                      ${isCurrent 
                        ? 'text-pharos-blue-600' 
                        : isActive 
                        ? 'text-gray-700' 
                        : 'text-gray-400'
                      }
                    `}
                    style={{ 
                      transitionDelay: `${index * 150 + 200}ms` 
                    }}
                  >
                    {stage.shortLabel}
                  </p>
                  
                  {/* Data de entrega (só no estágio atual se houver) */}
                  {isCurrent && formattedDeliveryDate && (
                    <p 
                      className={`
                        text-xs text-pharos-blue-500 font-semibold mt-1
                        transition-all duration-500
                        ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                      `}
                      style={{ 
                        transitionDelay: `${index * 150 + 400}ms` 
                      }}
                    >
                      {formattedDeliveryDate}
                    </p>
                  )}
                  
                  {/* Data "Aproximadamente" no estágio Pronto (se houver e for futuro) */}
                  {stage.key === 'pronto' && formattedDeliveryDate && currentStage.id < 4 && (
                    <p 
                      className={`
                        text-xs text-gray-400 mt-1
                        transition-all duration-500
                        ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                      `}
                      style={{ 
                        transitionDelay: `${index * 150 + 400}ms` 
                      }}
                    >
                      Aprox.
                      <br />
                      {formattedDeliveryDate}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

