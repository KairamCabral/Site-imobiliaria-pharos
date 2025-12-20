'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { OptimizedImage as Image } from '../OptimizedImage';
import Link from 'next/link';
import { X, Bed, Bath, Car, Maximize, Waves, ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyMiniCardProps {
  id: string;
  titulo: string;
  imagens: string[] | { src: string; alt?: string }[];
  preco: number;
  quartos: number;
  suites: number;
  vagas: number;
  area: number;
  distanciaMar?: number;
  badge?: string;
  onClose: () => void;
}

/**
 * Mini card que aparece ao clicar em um marcador no mapa
 * Com carrossel de imagens e acessibilidade AAA
 * Otimizado com React.memo para evitar re-renders desnecessários
 */
const PropertyMiniCard = memo(function PropertyMiniCard({
  id,
  titulo,
  imagens,
  preco,
  quartos,
  suites,
  vagas,
  area,
  distanciaMar,
  badge,
  onClose,
}: PropertyMiniCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Normalizar imagens para array de strings (memoizado)
  const imagensArray = useMemo(() => 
    Array.isArray(imagens) 
      ? imagens.map(img => typeof img === 'string' ? img : img.src)
      : [imagens],
    [imagens]
  );
  
  const totalSlides = imagensArray.length;
  const hasMultipleImages = totalSlides > 1;

  // Formatação de preço (memoizada)
  const precoFormatado = useMemo(() => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(preco),
    [preco]
  );

  // Navegação do carrossel
  const nextSlide = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentSlide(index);
  }, []);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(totalSlides - 1);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, nextSlide, prevSlide, onClose]);

  return (
    <div
      className="property-mini-card bg-white rounded-2xl shadow-2xl border border-[#E8ECF2] overflow-hidden"
      style={{
        width: '360px',
        maxWidth: '95vw',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      role="dialog"
      aria-label={`Detalhes de ${titulo}`}
      aria-live="polite"
    >
      {/* Carrossel de Imagens */}
      <div 
        className="relative h-52 bg-gradient-to-br from-[#F7F9FC] to-[#E8ECF2]"
        style={{ overflow: 'hidden' }}
        role="group"
        aria-roledescription="carousel"
        aria-label="Galeria de fotos do imóvel"
      >
        {/* Imagem atual */}
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={imagensArray[currentSlide]}
            alt={`${titulo} - Foto ${currentSlide + 1} de ${totalSlides}`}
            fill
            sizes="360px"
            className="object-cover transition-transform duration-300 hover:scale-105"
            loading={currentSlide === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
          />
          {/* Overlay gradiente sutil para melhor contraste dos botões */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/10 pointer-events-none" />
        </div>

        {/* Badge (ex: Exclusivo) */}
        {badge && (
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A968] text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
              {badge}
            </span>
          </div>
        )}
        
        {/* Botão fechar - SEMPRE VISÍVEL */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute w-10 h-10 bg-[#192233] hover:bg-[#054ADA] text-white rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
          style={{ 
            top: '12px',
            right: '12px',
            zIndex: 99999,
            pointerEvents: 'auto'
          }}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" style={{ pointerEvents: 'none' }} />
        </button>

        {/* Setas de navegação - SEMPRE VISÍVEIS quando há múltiplas imagens */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute -translate-y-1/2 w-10 h-10 bg-white hover:bg-[#F7F9FC] text-[#192233] rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#054ADA]"
              style={{ 
                left: '12px',
                top: '50%',
                zIndex: 99998,
                pointerEvents: 'auto'
              }}
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5" style={{ pointerEvents: 'none' }} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute -translate-y-1/2 w-10 h-10 bg-white hover:bg-[#F7F9FC] text-[#192233] rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#054ADA]"
              style={{ 
                right: '12px',
                top: '50%',
                zIndex: 99998,
                pointerEvents: 'auto'
              }}
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-5 h-5" style={{ pointerEvents: 'none' }} />
            </button>
          </>
        )}

        {/* Contador e dots */}
        {hasMultipleImages && (
          <div className="absolute" style={{ bottom: '12px', right: '12px', zIndex: 99997, pointerEvents: 'auto' }}>
            <div className="flex items-center gap-2 bg-[#192233]/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg">
              {/* Contador */}
              <span className="text-white text-xs font-semibold">
                {currentSlide + 1}/{totalSlides}
              </span>
              
              {/* Separador */}
              <div className="w-px h-3 bg-white/30" />
              
              {/* Dots */}
              <div className="flex gap-1">
                {imagensArray.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToSlide(index, e)}
                    className={`w-1.5 h-1.5 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-white ${
                      index === currentSlide
                        ? 'bg-white w-3'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Ir para foto ${index + 1}`}
                    aria-current={index === currentSlide ? 'true' : 'false'}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Título */}
        <h3 className="text-lg font-bold text-[#192233] mb-4 line-clamp-2 leading-tight">
          {titulo}
        </h3>

        {/* Características em grid 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Quartos */}
          <div className="flex items-center gap-2 bg-[#F7F9FC] px-3 py-2 rounded-xl">
            <Bed className="w-4 h-4 text-[#054ADA] flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-bold text-[#192233]">
              {quartos} {quartos === 1 ? 'qto' : 'qtos'}
            </span>
          </div>

          {/* Suítes */}
          <div className="flex items-center gap-2 bg-[#F7F9FC] px-3 py-2 rounded-xl">
            <Bath className="w-4 h-4 text-[#054ADA] flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-bold text-[#192233]">
              {suites} {suites === 1 ? 'suíte' : 'suítes'}
            </span>
          </div>

          {/* Vagas */}
          <div className="flex items-center gap-2 bg-[#F7F9FC] px-3 py-2 rounded-xl">
            <Car className="w-4 h-4 text-[#054ADA] flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-bold text-[#192233]">
              {vagas} {vagas === 1 ? 'vaga' : 'vagas'}
            </span>
          </div>

          {/* Área */}
          <div className="flex items-center gap-2 bg-[#F7F9FC] px-3 py-2 rounded-xl">
            <Maximize className="w-4 h-4 text-[#054ADA] flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-bold text-[#192233]">{area}m²</span>
          </div>
        </div>

        {/* Distância do Mar */}
        {distanciaMar !== undefined && distanciaMar <= 500 && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E8ECF2]">
            <div className="flex items-center gap-2 bg-[#E8F4FF] px-3 py-2 rounded-xl flex-1">
              <Waves className="w-4 h-4 text-[#054ADA] flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold text-[#054ADA]">
                {distanciaMar}m do mar
              </span>
            </div>
          </div>
        )}

        {/* Preço em destaque */}
        <div className="mb-4 bg-gradient-to-r from-[#F0F5FF] to-[#E8F4FF] px-4 py-3 rounded-xl border border-[#054ADA]/10">
          <div className="text-xs text-[#8E99AB] font-semibold mb-0.5 uppercase tracking-wide">Valor</div>
          <div className="text-2xl font-extrabold text-[#054ADA] leading-none">{precoFormatado}</div>
        </div>

        {/* CTA Premium */}
        <Link
          href={`/imoveis/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-[#054ADA] to-[#0066FF] hover:from-[#043bb8] hover:to-[#0052CC] text-white font-bold text-center py-4 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:ring-offset-2"
          style={{
            fontSize: '15px',
            letterSpacing: '0.5px',
            minHeight: '52px',
            color: '#FFFFFF',
          }}
        >
          Ver Detalhes Completos
        </Link>
      </div>
    </div>
  );
});

export default PropertyMiniCard;

