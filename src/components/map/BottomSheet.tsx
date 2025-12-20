'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronUp, ChevronDown, List } from 'lucide-react';
import ImovelCard from '../ImovelCard';

interface Property {
  id: string;
  titulo: string;
  endereco: string;
  preco: number;
  quartos: number;
  banheiros: number;
  area: number;
  vagas: number;
  imagens: string[];
  tipoImovel: string;
  caracteristicas?: string[];
  caracteristicasImovel?: string[];
  caracteristicasLocalizacao?: string[];
  distanciaMar?: number;
  destaque?: boolean;
}

interface BottomSheetProps {
  properties: Property[];
  onPropertyHover?: (id: string | null) => void;
  onBackToList?: () => void;
}

/**
 * Bottom Sheet para mobile
 * Mostra cards de imóveis em carrossel com snap points em 40% e 85%
 */
export default function BottomSheet({ properties, onPropertyHover, onBackToList }: BottomSheetProps) {
  const [snapPoint, setSnapPoint] = useState<'peek' | 'half' | 'full'>('peek');
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentY.current = e.touches[0].clientY;
    const diff = startY.current - currentY.current;

    if (sheetRef.current) {
      const height = sheetRef.current.scrollHeight;
      const newTransform = Math.max(0, Math.min(height, -diff));
      sheetRef.current.style.transform = `translateY(${newTransform}px)`;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const diff = startY.current - currentY.current;

    // Determina snap point baseado na direção e distância
    if (diff > 50) {
      // Arrasta para cima
      setSnapPoint(snapPoint === 'peek' ? 'half' : 'full');
    } else if (diff < -50) {
      // Arrasta para baixo
      setSnapPoint(snapPoint === 'full' ? 'half' : 'peek');
    }

    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
  };

  const getHeight = () => {
    switch (snapPoint) {
      case 'peek':
        return 'h-24'; // 96px
      case 'half':
        return 'h-[40vh]';
      case 'full':
        return 'h-[85vh]';
      default:
        return 'h-24';
    }
  };

  return (
    <div
      ref={sheetRef}
      className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 z-[1000] ${getHeight()}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Handle */}
      <div className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing">
        <div className="w-12 h-1.5 bg-[#E8ECF2] rounded-full" />
      </div>

      {/* Header */}
      <div className="px-4 pb-3 flex items-center justify-between border-b border-[#E8ECF2]">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[#192233]">{properties.length} imóveis</h3>
          <button
            onClick={() => setSnapPoint(snapPoint === 'full' ? 'peek' : 'full')}
            className="text-[#8E99AB] hover:text-[#054ADA] transition-colors"
            aria-label={snapPoint === 'full' ? 'Minimizar' : 'Expandir'}
          >
            {snapPoint === 'full' ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>

        {onBackToList && (
          <button
            onClick={onBackToList}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#054ADA] hover:text-[#043bb8] transition-colors"
          >
            <List className="w-4 h-4" />
            Ver lista
          </button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="overflow-y-auto h-[calc(100%-80px)] px-4 py-4">
        {snapPoint === 'peek' ? (
          /* Carrossel horizontal quando minimizado */
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-slim">
            {properties.slice(0, 10).map((property) => (
              <div
                key={property.id}
                className="min-w-[280px] snap-start"
                onMouseEnter={() => onPropertyHover?.(property.id)}
                onMouseLeave={() => onPropertyHover?.(null)}
              >
                <ImovelCard
                  id={property.id}
                  titulo={property.titulo}
                  endereco={property.endereco}
                  preco={property.preco}
                  quartos={property.quartos}
                  banheiros={property.banheiros}
                  area={property.area}
                  imagens={property.imagens && property.imagens.length > 0 ? property.imagens : []}
                  tipoImovel={property.tipoImovel}
                  destaque={property.destaque}
                  caracteristicas={property.caracteristicas}
                  caracteristicasImovel={property.caracteristicasImovel}
                  caracteristicasLocalizacao={property.caracteristicasLocalizacao}
                  vagas={property.vagas}
                  distanciaMar={property.distanciaMar}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Grid vertical quando expandido */
          <div className="grid grid-cols-1 gap-4">
            {properties.map((property) => (
              <div
                key={property.id}
                onMouseEnter={() => onPropertyHover?.(property.id)}
                onMouseLeave={() => onPropertyHover?.(null)}
              >
                <ImovelCard
                  id={property.id}
                  titulo={property.titulo}
                  endereco={property.endereco}
                  preco={property.preco}
                  quartos={property.quartos}
                  banheiros={property.banheiros}
                  area={property.area}
                  imagens={property.imagens && property.imagens.length > 0 ? property.imagens : []}
                  tipoImovel={property.tipoImovel}
                  destaque={property.destaque}
                  caracteristicas={property.caracteristicas}
                  caracteristicasImovel={property.caracteristicasImovel}
                  caracteristicasLocalizacao={property.caracteristicasLocalizacao}
                  vagas={property.vagas}
                  distanciaMar={property.distanciaMar}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

