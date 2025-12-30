'use client';

/**
 * PropertyCardHorizontal - Card Horizontal com Carrossel 100% Manual
 * 
 * IMPORTANTE: Este componente implementa um carrossel de imagens TOTALMENTE MANUAL.
 * - Nenhum autoplay ou auto-advance
 * - Controles apenas por interação do usuário (setas, swipe, teclado)
 * - Área de toque mínima de 44x44px (WCAG 2.1 AA)
 * - Estados condicionais: 0 imagens (placeholder), 1 imagem (sem controles), 2+ imagens (controles completos)
 */

import React, { useCallback, useMemo } from 'react';
import { OptimizedImage as Image } from './OptimizedImage';
import { 
  Heart, 
  Share2, 
  Bed, 
  Bath,
  Car, 
  Maximize2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useFavoritos } from '@/contexts/FavoritosContext';
import { usePropertyCarousel } from '@/hooks/usePropertyCarousel';

interface PropertyImage {
  src: string;
  alt?: string;
}

interface PropertyCardHorizontalProps {
  id: string;
  slug: string;
  titulo: string;
  bairro?: string;
  cidade: string;
  imagens: PropertyImage[];
  quartos?: number;
  suites?: number;
  vagas?: number;
  areaPrivativa?: number;
  precoAtual: number;
  precoAntigo?: number;
  condominio?: number;
  iptuAnual?: number;
  badges?: string[];
  tags?: string[];
  favorito?: boolean;
  tipoImovel?: string;
  distanciaMar?: number;
  caracteristicas?: string[];
  caracteristicasImovel?: string[];
  caracteristicasLocalizacao?: string[];
}

export default function PropertyCardHorizontal({
  id,
  slug,
  titulo,
  bairro,
  cidade,
  imagens,
  quartos,
  suites,
  vagas,
  areaPrivativa,
  precoAtual,
  precoAntigo,
  condominio,
  iptuAnual,
  badges = [],
  tags = [],
  favorito = false,
  tipoImovel = 'Imóvel',
  distanciaMar,
  caracteristicas = [],
  caracteristicasImovel = [],
  caracteristicasLocalizacao = [],
}: PropertyCardHorizontalProps) {
  const { isFavorito, toggleFavorito: toggleFavContext } = useFavoritos();
  const isFavorited = isFavorito(id);
  const [activeTagIndex, setActiveTagIndex] = React.useState(0);

  const normalizeTag = (value: string) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim()
      .toLowerCase();

  const formatLabel = (value: string) =>
    String(value ?? '')
      .replace(/(^|\s)([a-zçáéíóúãõâêô])/giu, (_, space, letter) => `${space}${letter.toUpperCase()}`)
      .replace(/\s+/g, ' ')
      .trim();

  const badgeVariantClasses: Record<string, string> = {
    tipo: 'bg-pharos-blue-500 text-white border border-pharos-blue-400/60 shadow-lg',
    imovel: 'bg-gradient-to-r from-pharos-blue-500 via-pharos-blue-600 to-pharos-blue-700 text-white border border-white/15 shadow-lg',
    empreendimento: 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white border border-white/15 shadow-lg',
    local: 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white border border-white/15 shadow-lg',
  };

  const rotatingTags = React.useMemo(() => {
    const pool: Array<{ id: string; label: string; variant: 'tipo' | 'imovel' | 'empreendimento' | 'local' }> = [];
    const seen = new Set<string>();

    const pushTag = (rawLabel: string | undefined | null, variant: 'tipo' | 'imovel' | 'empreendimento' | 'local') => {
      if (!rawLabel) return;
      const label = formatLabel(rawLabel);
      if (!label) return;
      const key = `${variant}-${normalizeTag(label)}`;
      if (seen.has(key)) return;
      seen.add(key);
      pool.push({ id: key, label, variant });
    };

    pushTag(tipoImovel, 'tipo');
    caracteristicasImovel.slice(0, 4).forEach((item) => pushTag(item, 'imovel'));
    caracteristicas.slice(0, 4).forEach((item) => pushTag(item, 'empreendimento'));
    caracteristicasLocalizacao.slice(0, 4).forEach((item) => pushTag(item, 'local'));

    return pool;
  }, [tipoImovel, caracteristicasImovel, caracteristicas, caracteristicasLocalizacao, tags]);

  React.useEffect(() => {
    setActiveTagIndex(0);
  }, [rotatingTags.length]);

  React.useEffect(() => {
    if (rotatingTags.length <= 1 || typeof window === 'undefined') return;
    const timer = window.setInterval(() => {
      setActiveTagIndex((prev) => (prev + 1) % rotatingTags.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [rotatingTags]);

  const activeTag = rotatingTags[activeTagIndex] ?? null;
  const fallbackLabel = formatLabel(tipoImovel || 'Imóvel');
  const tagToRender = activeTag ?? (fallbackLabel ? { id: 'fallback', label: fallbackLabel, variant: 'tipo' as const } : null);
  const tagKey = tagToRender ? `${tagToRender.id}-${activeTagIndex}` : undefined;

  // DEBUG: Log características recebidas (apenas primeiros 3 cards)

  // Validação de URL de imagem
  const isValidImageUrl = (url: any): boolean => {
    return typeof url === "string" && /^https?:\/\//i.test(url) && url.trim() !== '';
  };

  // Encontrar primeira imagem válida
  const imagensSignature = useMemo(() => {
    if (!Array.isArray(imagens)) return '';
    return imagens
      .map((img) => (isValidImageUrl(img?.src) ? img.src.trim() : ''))
      .filter((src) => src.length > 0)
      .join('||');
  }, [imagens]);

  const validImages = useMemo(() => {
    if (!Array.isArray(imagens)) return [];
    const seen = new Set<string>();
    const unique: PropertyImage[] = [];

    for (const image of imagens) {
      if (!image || !isValidImageUrl(image.src)) continue;
      const normalized = image.src.trim();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      unique.push({ src: normalized, alt: image.alt });
    }

    return unique;
  }, [imagensSignature]);

  const carouselImages = useMemo(() => {
    return validImages.map((img, index) => ({
      src: img.src,
      alt: img.alt || `${titulo} - imagem ${index + 1}`,
    }));
  }, [validImages, titulo]);

  const {
    currentImage,
    currentIndex,
    hasMultiple,
    next,
    prev,
    goTo,
    handleKeyDown,
    swipeRef,
  } = usePropertyCarousel(carouselImages, {
    fallbackAlt: titulo,
    propertyId: id,
    preloadNext: false,
  });

  const openPropertyDetails = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = `/imoveis/${id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [id]);

  const shouldIgnoreNavigation = useCallback((event?: React.SyntheticEvent) => {
    if (!event) return false;
    if (event.isPropagationStopped?.()) return true;

    const nativeEvent = event.nativeEvent as (Event & {
      composedPath?: () => EventTarget[];
    }) | undefined;

    if (nativeEvent?.defaultPrevented) return true;

    const path = nativeEvent?.composedPath?.();
    if (Array.isArray(path)) {
      const hasControl = path.some((node) => {
        if (!node || typeof node !== 'object') return false;
        const element = node as HTMLElement;
        if (element.dataset?.cardControl === 'true') return true;
        return element.getAttribute?.('data-card-control') === 'true';
      });
      if (hasControl) return true;
    }

    const target = event.target as HTMLElement | null;
    if (!target) return false;
    return Boolean(target.closest('[data-card-control="true"]'));
  }, []);

  const handleCardNavigation = useCallback(
    (event?: React.SyntheticEvent) => {
      if (shouldIgnoreNavigation(event)) {
        return;
      }
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      openPropertyDetails();
    },
    [openPropertyDetails, shouldIgnoreNavigation]
  );

  const handleCardKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCardNavigation(event);
      }
    },
    [handleCardNavigation]
  );


  const formatPrice = (value: number) => {
    // Se o valor for 0, null, undefined ou negativo, mostrar "Sob consulta"
    if (!value || value <= 0) {
      return 'Sob consulta';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nativeEvent = e.nativeEvent as any;
    if (nativeEvent?.stopImmediatePropagation) {
      nativeEvent.stopImmediatePropagation();
    }
    toggleFavContext(id);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'card_favorite_toggle', {
        property_id: id,
        favorited: !isFavorited,
      });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nativeEvent = e.nativeEvent as any;
    if (nativeEvent?.stopImmediatePropagation) {
      nativeEvent.stopImmediatePropagation();
    }
    if (navigator.share) {
      navigator.share({
        title: titulo,
        text: `Confira este imóvel: ${titulo}`,
        url: window.location.origin + `/imoveis/${id}`,
      });
    }
  };

  const stopControlEvent = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nativeEvent = event.nativeEvent as any;
    if (nativeEvent?.stopImmediatePropagation) {
      nativeEvent.stopImmediatePropagation();
    }
  }, []);

  const handlePointerDownControl = useCallback((event: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handlePrevClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      stopControlEvent(event);
      prev();
    },
    [prev, stopControlEvent]
  );

  const handleNextClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      stopControlEvent(event);
      next();
    },
    [next, stopControlEvent]
  );

  const handleSelectImage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
      stopControlEvent(event);
      goTo(index);
    },
    [goTo, stopControlEvent]
  );

  const economia = precoAntigo && precoAntigo > precoAtual ? precoAntigo - precoAtual : 0;
  const localizacao = bairro ? `${bairro}, ${cidade}` : cidade;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardNavigation}
      onKeyDown={handleCardKeyDown}
      aria-label={`Ver detalhes do imóvel ${titulo}`}
      className="group block bg-white rounded-2xl border border-pharos-slate-200 hover:border-pharos-blue-400/40 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(5,74,218,0.15)] h-full transform hover:-translate-y-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-pharos-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {/* Layout: Vertical (mobile) | Horizontal (desktop ≥768px) */}
      <div className="flex flex-col md:flex-row md:h-[280px] lg:h-[300px]">
        
        {/* Área de Imagens - Carrossel Otimizado */}
        <div 
          ref={swipeRef}
          className="relative w-full md:w-[42%] aspect-[4/3] md:aspect-auto md:h-full flex-shrink-0 bg-pharos-base-off overflow-hidden focus:outline-none"
          role="region"
          aria-roledescription="carousel"
          aria-label="Galeria de fotos do imóvel"
          tabIndex={hasMultiple ? 0 : -1}
          onKeyDown={handleKeyDown}
          style={hasMultiple ? { touchAction: 'pan-y', contentVisibility: 'auto' } : { contentVisibility: 'auto' }}
          data-touch-action={hasMultiple ? 'pan-y' : undefined}
          data-card-control="true"
        >
          {/* Imagem Atual */}
          {currentImage ? (
            <Image
              src={currentImage.src}
              alt={currentImage.alt || titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
              sizes="(max-width: 768px) 100vw, 42vw"
              draggable={false}
              loading="lazy"
              variant="card"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
              key={currentImage.src}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-pharos-blue-500/10 to-pharos-blue-500/5 flex items-center justify-center">
              <div className="text-center p-6">
                <svg className="w-16 h-16 mx-auto mb-3 text-pharos-blue-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-pharos-slate-500 font-medium">{tipoImovel}</p>
              </div>
            </div>
          )}

          {/* Overlay sutil no hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Tags superiores (dinâmicas) */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2.5 z-20 max-w-[85%]">
            {tagToRender && (
              <span
                key={tagKey}
                className={`inline-flex items-center justify-center h-8 min-w-[120px] px-4 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] leading-none backdrop-blur-sm transition-all duration-500 ${badgeVariantClasses[tagToRender.variant] ?? badgeVariantClasses.tipo}`}
              >
                {tagToRender.label}
              </span>
            )}
            <span className="inline-flex items-center justify-center h-8 px-4 text-[11px] font-semibold uppercase tracking-[0.2em] rounded-full bg-white/95 text-pharos-navy-800 border border-white/70 shadow-sm">
              #{id}
            </span>
          </div>

          {/* Badges extras (mobile) */}
          <div className="md:hidden absolute top-4 left-4 flex flex-wrap gap-2.5 z-20 mt-12 max-w-[85%]">
            {precoAntigo && economia > 0 && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg text-white bg-red-700/90 backdrop-blur-sm animate-pulse">
                Venda Rápida
              </span>
            )}
            {badges.map((badge, index) => (
              <span
                key={`${badge}-${index}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-pharos-navy-900/90 backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Botão Favoritar - Design Refinado */}
          <button
            type="button"
            onClick={handleFavorite}
            data-card-control="true"
            className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all duration-300 shadow-md border border-white/40 hover:scale-110 active:scale-95"
            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={isFavorited}
          >
            <svg
              className={`w-5 h-5 transition-all duration-300 ${isFavorited ? 'text-red-500 fill-current scale-110' : 'text-pharos-slate-600'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill={isFavorited ? 'currentColor' : 'none'}
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Controles do Carrossel - 100% Manual (WCAG 2.1 AA - área mínima 44x44px) */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrevClick}
                onPointerDown={handlePointerDownControl as any}
                onMouseDown={handlePointerDownControl as any}
                onTouchStart={handlePointerDownControl as any}
                data-card-control="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center bg-white/95 hover:bg-white text-pharos-navy-900 rounded-full shadow-lg backdrop-blur-md z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                aria-label="Ver imagem anterior do imóvel"
                title="Imagem anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true" data-card-control="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                type="button"
                onClick={handleNextClick}
                onPointerDown={handlePointerDownControl as any}
                onMouseDown={handlePointerDownControl as any}
                onTouchStart={handlePointerDownControl as any}
                data-card-control="true"
                className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center bg-white/95 hover:bg-white text-pharos-navy-900 rounded-full shadow-lg backdrop-blur-md z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                aria-label="Ver próxima imagem do imóvel"
                title="Próxima imagem"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true" data-card-control="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Indicadores - Clicáveis (WCAG 2.1 AA compliant) */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20" role="tablist" aria-label="Galeria de imagens">
                {carouselImages.map((image, index) => (
                  <button
                    key={image?.src ?? `indicator-${index}`}
                    type="button"
                    role="tab"
                    onClick={(event) => handleSelectImage(event, index)}
                    onPointerDown={handlePointerDownControl as any}
                    onMouseDown={handlePointerDownControl as any}
                    onTouchStart={handlePointerDownControl as any}
                    data-card-control="true"
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 ${
                      currentIndex === index
                        ? 'px-2'
                        : 'px-1.5'
                    }`}
                    aria-label={`Ver imagem ${index + 1} de ${carouselImages.length}`}
                    aria-current={currentIndex === index ? 'true' : 'false'}
                    aria-selected={currentIndex === index}
                    title={`Imagem ${index + 1}`}
                  >
                    <span data-card-control="true" className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/70 hover:bg-white/90'
                    }`} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Conteúdo - Layout Adaptativo */}
        <div className="flex flex-col md:flex-row flex-1 min-w-0">
          
          {/* Conteúdo Central */}
          <div className="flex-1 p-4 md:p-5 lg:p-6 min-w-0 flex flex-col md:overflow-hidden">
            {/* Localização */}
            <div className="flex items-start gap-2 mb-3 md:mb-2 md:order-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-pharos-gold-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-xs text-pharos-slate-500 line-clamp-1 uppercase tracking-wide font-medium">{localizacao}</span>
            </div>

            {/* Título */}
            <h3 className="text-base font-bold text-pharos-navy-900 group-hover:text-pharos-blue-500 transition-colors duration-300 mb-3 md:mb-3 line-clamp-2 leading-tight md:order-1">
              {titulo}
            </h3>

            {/* Metadados - Estilo da Home */}
            <div className="flex items-center flex-wrap gap-2.5 md:gap-2 lg:gap-3 mb-3 md:mb-2 md:order-3">
              {/* Área */}
              {areaPrivativa !== undefined && areaPrivativa > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 md:w-[18px] md:h-[18px] text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                  </svg>
                  <span className="text-sm md:text-base font-bold text-pharos-navy-900">{formatNumber(areaPrivativa)}</span>
                  <span className="text-xs md:text-sm text-pharos-slate-500">m²</span>
                </div>
              )}

              {/* Quartos */}
              {quartos !== undefined && quartos > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 md:w-[18px] md:h-[18px] text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 9.556V3h-2v2H6V3H4v6.556C2.81 10.25 2 11.526 2 13v4a1 1 0 001 1h1v4h2v-4h12v4h2v-4h1a1 1 0 001-1v-4c0-1.474-.811-2.75-2-3.444zM11 9a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0111 9zm5 0a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0116 9z" />
                  </svg>
                  <span className="text-sm md:text-base font-bold text-pharos-navy-900">{quartos}</span>
                  <span className="text-xs md:text-sm text-pharos-slate-500">{quartos === 1 ? 'quarto' : 'quartos'}</span>
                </div>
              )}

              {/* Suítes */}
              {suites !== undefined && suites > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 md:w-[18px] md:h-[18px] text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 10.78V8c0-1.65-1.35-3-3-3h-4c-.77 0-1.47.3-2 .78-.53-.48-1.23-.78-2-.78H6C4.35 5 3 6.35 3 8v2.78c-.61.55-1 1.34-1 2.22v6h2v-2h16v2h2v-6c0-.88-.39-1.67-1-2.22zM14 7h4c.55 0 1 .45 1 1v2h-6V8c0-.55.45-1 1-1zM5 8c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v2H5V8z" />
                  </svg>
                  <span className="text-sm md:text-base font-bold text-pharos-navy-900">{suites}</span>
                  <span className="text-xs md:text-sm text-pharos-slate-500">{suites === 1 ? 'suíte' : 'suítes'}</span>
                </div>
              )}

              {/* Vagas */}
              {vagas !== undefined && vagas > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 md:w-[18px] md:h-[18px] text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                  <span className="text-sm md:text-base font-bold text-pharos-navy-900">{vagas}</span>
                  <span className="text-xs md:text-sm text-pharos-slate-500">{vagas === 1 ? 'vaga' : 'vagas'}</span>
                </div>
              )}
            </div>

            {/* Tags Minimalistas - Desktop Only (abaixo dos metadados) */}
            <div className="hidden md:flex items-center gap-1.5 flex-wrap mb-auto md:order-4">
              {/* Badge distância do mar */}
              {distanciaMar !== undefined && distanciaMar <= 500 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold uppercase tracking-wide">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 3H3v18h18V3zM12.71 16.29L9 13.41 5.29 16.29l-.71-.71L9 12l3.71 3.58 4.58-4.58.71.71-5.29 5.29z" />
                  </svg>
                  {distanciaMar === 0 ? 'Frente mar' : `${distanciaMar}m do mar`}
                </span>
              )}

              {/* Primeira característica especial */}
              {caracteristicas && caracteristicas.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 bg-pharos-blue-500/10 text-pharos-blue-600 rounded text-[10px] font-semibold uppercase tracking-wide">
                  {caracteristicas[0]}
                </span>
              )}

              {/* Badge "Venda Rápida" */}
              {precoAntigo && economia > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold uppercase tracking-wide">
                  Venda Rápida
                </span>
              )}

              {/* Badges adicionais (Exclusivo, Lançamento) */}
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 bg-pharos-navy-900/10 text-pharos-navy-900 rounded text-[10px] font-semibold uppercase tracking-wide"
                >
                  {badge}
                </span>
              ))}

              {/* Tags secundárias sutis (máx 2) */}
              {tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 bg-pharos-slate-100 text-pharos-slate-600 rounded text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Tags - Mobile only */}
            <div className="flex items-center gap-2 flex-wrap md:hidden md:order-4">
              {/* Badge distância do mar - Mobile */}
              {distanciaMar !== undefined && distanciaMar <= 500 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 3H3v18h18V3zM12.71 16.29L9 13.41 5.29 16.29l-.71-.71L9 12l3.71 3.58 4.58-4.58.71.71-5.29 5.29z" />
                  </svg>
                  <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
                    {distanciaMar === 0 ? 'Frente mar' : `${distanciaMar}m do mar`}
                  </span>
                </div>
              )}
              
              {/* Outras tags */}
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 bg-[#F5F7FA] text-[#192233] rounded-lg text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Preço e Botão - Mobile */}
            <div className="mt-auto pt-4 border-t border-pharos-slate-300 md:hidden">
              {/* Economia */}
              {precoAntigo && economia > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500 line-through">{formatPrice(precoAntigo)}</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      Economize {formatPrice(economia)}
                    </span>
                  </div>
                </div>
              )}

              {/* Preço */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-pharos-blue-500 block">{formatPrice(precoAtual)}</span>
              </div>

              {/* Botão Ver Detalhes */}
              <button
                type="button"
                onClick={handleCardNavigation}
                className="w-full text-center bg-pharos-navy-900 hover:bg-pharos-blue-500 text-white text-sm font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
              >
                Ver Detalhes
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Coluna Direita - Desktop Only */}
          <div className="hidden md:flex flex-col justify-between p-4 lg:p-5 w-[22%] min-w-[180px] lg:min-w-[200px] border-l border-[#E8ECF2]/60 bg-[#F5F7FA]/30">
            {/* Preços e Taxas */}
            <div className="flex-shrink-0">
              {precoAntigo && economia > 0 && (
                <div className="mb-2">
                  <p className="text-[#8E99AB] text-xs lg:text-sm line-through">{formatPrice(precoAntigo)}</p>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#2FBF71]/10 text-[#2FBF71] rounded-md text-[10px] lg:text-xs font-semibold mt-1">
                    <TrendingDown className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                    Economize {formatPrice(economia)}
                  </div>
                </div>
              )}

              <p className="text-[#192233] text-xl lg:text-[22px] font-extrabold leading-tight mb-2 lg:mb-3">{formatPrice(precoAtual)}</p>

              {condominio !== undefined && condominio > 0 && (
                <p className="text-[#8E99AB] text-xs lg:text-sm leading-relaxed mb-0.5">
                  Condomínio: <span className="text-[#192233] font-medium">{formatPrice(condominio)}/mês</span>
                </p>
              )}

              {iptuAnual !== undefined && iptuAnual > 0 && (
                <p className="text-[#8E99AB] text-xs lg:text-sm leading-relaxed">
                  IPTU: <span className="text-[#192233] font-medium">{formatPrice(iptuAnual)}/ano</span>
                </p>
              )}
            </div>

            {/* Ações Desktop */}
            <div className="space-y-2 mt-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleCardNavigation}
                className="w-full bg-[#192233] hover:bg-[#2a3547] text-white py-2.5 lg:py-3 rounded-xl font-semibold text-xs lg:text-sm transition-all shadow-sm hover:shadow-md"
                style={{ minHeight: '40px' }}
              >
                Saiba mais
              </button>
              
              <button
                type="button"
                onClick={handleShare}
                data-card-control="true"
                className="w-full bg-white hover:bg-[#F5F7FA] text-[#192233] border border-[#E8ECF2] py-2 lg:py-2.5 rounded-xl font-medium text-xs lg:text-sm transition-all flex items-center justify-center gap-1.5"
                aria-label="Compartilhar imóvel"
                style={{ minHeight: '40px' }}
              >
                <Share2 className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px]" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
