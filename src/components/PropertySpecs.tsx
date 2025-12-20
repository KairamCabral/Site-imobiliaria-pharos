'use client';

import { Property } from '@/domain/models';
import { Maximize2, Home, Bed, Bath, Car, Building, Ruler, Sofa, BathIcon } from 'lucide-react';
import { useMemo } from 'react';

/**
 * PHAROS - Especificações Minimalistas do Imóvel
 * 
 * Design clean e refinado:
 * - Tipografia como protagonista
 * - Espaçamento generoso
 * - Ícones sutis e monocromáticos
 * - Grid limpo e organizado
 * - Sem sombras pesadas ou gradientes chamativos
 */

interface PropertySpecsProps {
  property: Property;
}

interface SpecItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
}

// ✅ FIX: Função helper para formatar preço sem toLocaleString (evita hydration mismatch)
function formatBRLPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function PropertySpecs({ property }: PropertySpecsProps) {
  const specs = useMemo(() => {
    const items: SpecItem[] = [];
    
    // 1. Área Total (se diferente da privativa)
    if (property.specs?.totalArea && property.specs.totalArea !== property.specs.privateArea) {
      items.push({
        icon: <Maximize2 className="w-5 h-5" strokeWidth={1.5} />,
        value: Math.round(property.specs.totalArea).toString(),
        label: 'm²',
        sublabel: 'Área total'
      });
    }
    
    // 2. Área Privativa
    if (property.specs?.privateArea) {
      // ✅ FIX: Usar formatação manual em vez de toLocaleString
      const pricePerSqm = property.pricing?.sale 
        ? Math.round(property.pricing.sale / property.specs.privateArea)
        : null;
      
      const sublabel = pricePerSqm
        ? `R$ ${formatBRLPrice(pricePerSqm)}/m²`
        : 'Área privativa';
      
      items.push({
        icon: <Ruler className="w-5 h-5" strokeWidth={1.5} />,
        value: Math.round(property.specs.privateArea).toString(),
        label: 'm²',
        sublabel
      });
    }
  
    // 3. Dormitórios / Quartos
    if (property.specs?.bedrooms) {
      const bedroomLabel = property.specs.bedrooms === 1 ? 'quarto' : 'quartos';
      items.push({
        icon: <Bed className="w-5 h-5" strokeWidth={1.5} />,
        value: String(property.specs.bedrooms),
        label: bedroomLabel,
      });
    }
    
    // 4. Suítes (ícone de banheira)
    if (property.specs?.suites) {
      items.push({
        icon: <BathIcon className="w-5 h-5" strokeWidth={1.5} />,
        value: String(property.specs.suites),
        label: property.specs.suites === 1 ? 'suíte' : 'suítes',
      });
    }
    
    // 5. Banheiros
    if (property.specs?.bathrooms) {
      items.push({
        icon: <Bath className="w-5 h-5" strokeWidth={1.5} />,
        value: String(property.specs.bathrooms),
        label: property.specs.bathrooms === 1 ? 'banheiro' : 'banheiros',
      });
    }
    
    // 6. Vagas
    if (property.specs?.parkingSpots) {
      items.push({
        icon: <Car className="w-5 h-5" strokeWidth={1.5} />,
        value: String(property.specs.parkingSpots),
        label: property.specs.parkingSpots === 1 ? 'vaga' : 'vagas',
      });
    }
    
    // 7. Andar (se disponível)
    if (property.specs?.floor) {
      items.push({
        icon: <Building className="w-5 h-5" strokeWidth={1.5} />,
        value: `${property.specs.floor}º`,
        label: property.specs.totalFloors ? `de ${property.specs.totalFloors}º andares` : 'andar',
      });
    }
    
    // 8. Mobiliado (se sim)
    if (property.features?.furnished) {
      items.push({
        icon: <Sofa className="w-5 h-5" strokeWidth={1.5} />,
        value: '',
        label: 'Mobiliado',
      });
    }
    
    return items;
  }, [property]);
  
  if (specs.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-6 py-2">
      {specs.map((spec, index) => (
        <SpecItem key={index} {...spec} />
      ))}
    </div>
  );
}

/**
 * Item de Especificação Minimalista
 * Layout horizontal compacto e clean, inspirado nos melhores portais imobiliários
 */
function SpecItem({ icon, value, label, sublabel }: SpecItem) {
  return (
    <div className="flex items-start gap-2.5">
      {/* Ícone minimalista e discreto */}
      <div className="text-gray-600 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      
      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        {/* Valor e Label - tipografia clean, sem quebra de linha */}
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          {value && (
            <span className="text-base font-normal text-gray-900 tabular-nums">
              {value}
            </span>
          )}
          <span className="text-base text-gray-700 font-light">
            {label}
          </span>
        </div>
        
        {/* Sublabel (informação extra em cinza suave) */}
        {sublabel && (
          <p className="text-xs text-gray-500 mt-1 leading-tight font-light whitespace-nowrap">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
