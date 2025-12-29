'use client';

import { Property } from '@/domain/models';
import { Check } from 'lucide-react';

/**
 * PHAROS - Características Premium
 * Design nobre, minimalista e sofisticado
 */

interface PropertyFeaturesProps {
  property: Property;
}

// Mapeamento refinado - apenas características relevantes
const caracteristicasMap: Record<string, string> = {
  'Mobiliado': 'Mobiliado',
  'Semi Mobiliado': 'Semi Mobiliado',
  'Churrasqueira': 'Churrasqueira',
  'Churrasqueira Carvao': 'Churrasqueira a carvão',
  'Churrasqueira Gas': 'Churrasqueira a gás',
  'Vista Mar': 'Vista para o Mar',
  'Sacada': 'Sacada',
  'Sacada Com Churrasqueira': 'Sacada com churrasqueira',
  'Ar Condicionado': 'Ar Condicionado',
  'Lareira': 'Lareira',
  'Hidromassagem': 'Hidromassagem',
  'Piscina': 'Piscina',
  'Sauna': 'Sauna',
  'Alarme': 'Alarme',
  'Cerca Eletrica': 'Cerca Elétrica',
  'Home Theater': 'Home Theater',
  'Elevador': 'Elevador',
  'Playground': 'Playground',
  'Quadra Esportes': 'Quadra de esportes',
  'Quadra Tenis': 'Quadra de tênis',
  'Salao Festas': 'Salão de festas',
  'Salao Jogos': 'Salão de jogos',
  'Sala Fitness': 'Academia',
  'Espaco Gourmet': 'Espaço Gourmet',
  'Piscina Aquecida': 'Piscina Aquecida',
  'Piscina Coletiva': 'Piscina',
  'Bicicletario': 'Bicicletário',
  'Portaria24 Hrs': 'Portaria 24 horas',
};

// Localização
const localizacaoMap: Record<string, string> = {
  'Centro': 'Centro',
  'Barra Norte': 'Barra Norte',
  'Barra Sul': 'Barra Sul',
  'Praia Brava': 'Praia Brava',
  'Praia Dos Amores': 'Praia dos Amores',
  'Avenida Brasil': 'Avenida Brasil',
  'Frente Mar': 'Frente Mar',
  'Quadra Mar': 'Quadra Mar',
  'Segunda Quadra': 'Segunda Quadra',
  'Terceira Avenida': 'Terceira Avenida',
};

export default function PropertyFeatures({ property }: PropertyFeaturesProps) {
  // Pegar dados do Vista
  const vistaData = property.providerData?.raw as any;
  const caracteristicas = vistaData?.Caracteristicas || {};
  const infraestrutura = vistaData?.InfraEstrutura || {};

  // Combinar características e infraestrutura
  const allFeatures = { ...caracteristicas, ...infraestrutura };

  // Filtrar e mapear características
  const activeFeatures = Object.entries(allFeatures)
    .filter(([key, value]) => caracteristicasMap[key] && value === 'Sim')
    .map(([key]) => caracteristicasMap[key])
    .sort();

  // Filtrar localização
  const activeLocation = Object.entries(caracteristicas)
    .filter(([key, value]) => localizacaoMap[key] && value === 'Sim')
    .map(([key]) => localizacaoMap[key])
    .sort();

  // Se não houver nada, não renderiza
  if (activeFeatures.length === 0 && activeLocation.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden">
      
      {/* Características do Imóvel */}
      {activeFeatures.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-sm overflow-x-hidden">
          <h2 className="text-lg md:text-xl font-normal text-gray-900 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-100">
            Características do Imóvel
          </h2>
          
          {/* Grid minimalista */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-4 max-w-full">
            {activeFeatures.map((label) => (
              <div
                key={label}
                className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 min-w-0"
              >
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" strokeWidth={2} />
                <span className="break-words overflow-wrap-anywhere">{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Características da Localização */}
      {activeLocation.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-sm overflow-x-hidden">
          <h2 className="text-lg md:text-xl font-normal text-gray-900 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-100">
            Características da Localização
          </h2>
          
          {/* Grid minimalista */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-4 max-w-full">
            {activeLocation.map((label) => (
              <div
                key={label}
                className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 min-w-0"
              >
                <Check className="w-4 h-4 text-purple-600 flex-shrink-0" strokeWidth={2} />
                <span className="break-words overflow-wrap-anywhere">{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
    </div>
  );
}
