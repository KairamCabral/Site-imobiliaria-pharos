'use client';

/**
 * ImovelCard - Card de Imóvel com Carrossel 100% Manual
 * 
 * IMPORTANTE: Este componente implementa um carrossel de imagens TOTALMENTE MANUAL.
 * - Nenhum autoplay ou auto-advance
 * - Controles apenas por interação do usuário (setas, swipe, teclado)
 * - Área de toque mínima de 44x44px (WCAG 2.1 AA)
 * - Estados condicionais: 0 imagens (placeholder), 1 imagem (sem controles), 2+ imagens (controles completos)
 */

import { OptimizedImage as Image } from './OptimizedImage';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useFavoritos } from '@/contexts/FavoritosContext';
import CardMediaCarousel from '@/components/CardMediaCarousel';
import { useRouter } from 'next/navigation';

interface IImovelCardProps {
  id: string;
  titulo: string;
  endereco: string;
  preco: number;
  quartos: number;
  banheiros: number;
  suites?: number;
  area: number;
  imagens: string[];
  tipoImovel: string;
  destaque?: boolean;
  caracteristicas?: string[];
  caracteristicasImovel?: string[];
  caracteristicasLocalizacao?: string[];
  vagas?: number;
  distanciaMar?: number; // em metros
  priority?: boolean; // Se true, primeira imagem usa priority para LCP
}

export default function ImovelCard({
  id,
  titulo,
  endereco,
  preco,
  quartos,
  banheiros,
  suites = 0,
  area,
  imagens,
  tipoImovel,
  destaque = false,
  caracteristicas = [],
  caracteristicasImovel = [],
  caracteristicasLocalizacao = [],
  vagas = 0,
  distanciaMar,
  priority = false,
}: IImovelCardProps) {
  const [activeTagIndex, setActiveTagIndex] = useState(0);
  const { isFavorito, toggleFavorito: toggleFavContext } = useFavoritos();
  const isFav = isFavorito(id);
  
  // ✅ OTIMIZAÇÃO: Prefetch ao hover para navegação instantânea
  const router = useRouter();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasPrefetched = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (hasPrefetched.current) return;
    
    // Aguardar 100ms antes de fazer prefetch (evita prefetch em scroll rápido)
    prefetchTimeoutRef.current = setTimeout(() => {
      router.prefetch(`/imoveis/${id}`);
      hasPrefetched.current = true;
    }, 100);
  }, [id, router]);

  const handleMouseLeave = useCallback(() => {
    // Cancelar prefetch se usuário sair antes do delay
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);
  
  // Declarar funções auxiliares ANTES de usar
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

  const openPropertyDetails = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = `/imoveis/${id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [id]);

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

  const isValidImageUrl = (url: any): boolean => {
    return typeof url === 'string' && /^https?:\/\//i.test(url) && url.trim() !== '';
  };

  // Mantemos validações auxiliares locais para outros usos no card

  const stopControlEvent = useCallback((event: React.SyntheticEvent) => {
    // Somente evita que o clique borbulhe para o card,
    // não bloqueia o click do próprio botão/indicador.
    event.stopPropagation();
  }, []);

  // Impede que o carrossel capture o gesto dos controles (ex.: botão de favorito)
  const handlePointerDownControl = useCallback(
    (event: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const nativeEvent = (event as any).nativeEvent ?? (event as any);
      if (nativeEvent?.stopImmediatePropagation) {
        nativeEvent.stopImmediatePropagation();
      }
    },
    [],
  );

  // Controles de mídia tratados pelo CardMediaCarousel

  // Removido autoplay para manter controle manual pelo usuário

  const toggleFavorito = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nativeEvent = e.nativeEvent as any;
    if (nativeEvent?.stopImmediatePropagation) {
      nativeEvent.stopImmediatePropagation();
    }
    toggleFavContext(id);
  };

  // Formata o preço em reais sem centavos
  const formatarPreco = (valor: number) => {
    if (!valor || isNaN(valor) || valor <= 0) {
      return 'Consulte-nos';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const normalizeTag = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim()
      .toLowerCase();

  const formatLabel = (value: string) =>
    value.replace(/(^|\s)([a-zçáéíóúãõâêô])/giu, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);

  const rotatingTags = useMemo(() => {
    const pool: Array<{ id: string; label: string; variant: 'tipo' | 'imovel' | 'empreendimento' | 'local' }> = [];
    const seen = new Set<string>();

    const pushTag = (rawLabel: string | undefined | null, variant: 'tipo' | 'imovel' | 'empreendimento' | 'local') => {
      if (!rawLabel) return;
      const label = formatLabel(String(rawLabel).trim());
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
  }, [tipoImovel, caracteristicas, caracteristicasImovel, caracteristicasLocalizacao]);

  useEffect(() => {
    setActiveTagIndex(0);
  }, [rotatingTags.length]);

  useEffect(() => {
    if (rotatingTags.length <= 1) return;
    const intervalId = window.setInterval(() => {
      setActiveTagIndex((prev) => (prev + 1) % rotatingTags.length);
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [rotatingTags]);

  const activeTag = rotatingTags[activeTagIndex] ?? null;

  const badgeVariantClasses: Record<string, string> = {
    tipo: 'bg-pharos-blue-500 text-white border border-pharos-blue-400/60 shadow-lg',
    imovel: 'bg-gradient-to-r from-pharos-blue-500 via-pharos-blue-600 to-pharos-blue-700 text-white border border-white/15 shadow-lg',
    empreendimento: 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white border border-white/15 shadow-lg',
    local: 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white border border-white/15 shadow-lg',
  };
 
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardNavigation}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Ver detalhes do imóvel ${titulo}`}
      className="group/outer h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-pharos-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
    >
      <article className="bg-white rounded-2xl overflow-hidden transition-all duration-500 min-h-[460px] md:h-[560px] w-full flex flex-col border border-pharos-slate-200 hover:border-pharos-blue-400/40 hover:shadow-[0_20px_60px_-15px_rgba(5,74,218,0.15)] transform hover:-translate-y-1">
        {/* Área de imagens via subcomponente padronizado */}
        <CardMediaCarousel
          propertyId={id}
          imagens={imagens}
          titulo={titulo}
          priority={priority}
          tipoImovel={tipoImovel}
          destaque={destaque}
        >
          {/* Tag dinâmica + código */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
            <div className="relative h-8 min-w-[140px]">
              {activeTag && (
                <span
                  key={activeTag.id}
                  className={`absolute inset-0 inline-flex items-center justify-center rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] leading-none backdrop-blur-sm ${badgeVariantClasses[activeTag.variant] ?? badgeVariantClasses.tipo} transition-all duration-500 shadow-lg`}>
                  {activeTag.label}
                </span>
              )}
            </div>
            <span className="inline-flex items-center justify-center h-8 px-4 text-[11px] font-semibold uppercase tracking-[0.2em] rounded-full bg-white/95 text-pharos-navy-800 border border-white/70 shadow-sm">
              #{id}
            </span>
          </div>

          {/* Botão de Favorito - Refinado */}
          <button
            type="button"
            onClick={toggleFavorito}
            onPointerDown={handlePointerDownControl as any}
            onMouseDown={handlePointerDownControl as any}
            onTouchStart={handlePointerDownControl as any}
            data-card-control="true"
            className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all duration-300 shadow-md border border-white/40 hover:scale-110 active:scale-95"
            aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={isFav}
          >
            <svg
              className={`w-5 h-5 transition-all duration-300 ${isFav ? 'text-red-500 fill-current scale-110' : 'text-pharos-slate-600'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill={isFav ? 'currentColor' : 'none'}
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </CardMediaCarousel>

        {/* Conteúdo */}
        <div className="px-5 pt-4 pb-5 flex-grow flex flex-col">
          {/* Localização e Distância do Mar */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0 text-pharos-gold-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-xs text-pharos-slate-500 line-clamp-1 uppercase tracking-wide font-medium">
                {endereco}
              </span>
            </div>

            {/* Badge distância do mar - somente se <= 500m */}
            {distanciaMar && distanciaMar <= 500 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 3H3v18h18V3zM12.71 16.29L9 13.41 5.29 16.29l-.71-.71L9 12l3.71 3.58 4.58-4.58.71.71-5.29 5.29z" />
                </svg>
                <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
                  {distanciaMar}m do mar
                </span>
              </div>
            )}
          </div>

          {/* Título */}
          <h3 className="text-base font-bold text-pharos-navy-900 group-hover:text-pharos-blue-500 transition-colors duration-300 mb-4 line-clamp-2 leading-tight">
            {titulo}
          </h3>

          {/* Características com ícones */}
          <div className="flex items-center flex-wrap gap-3 mb-4">
            {/* Área */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
              <span className="text-base font-bold text-pharos-navy-900">{area}</span>
              <span className="text-sm text-pharos-slate-500">m²</span>
            </div>

            {/* Quartos */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 9.556V3h-2v2H6V3H4v6.556C2.81 10.25 2 11.526 2 13v4a1 1 0 001 1h1v4h2v-4h12v4h2v-4h1a1 1 0 001-1v-4c0-1.474-.811-2.75-2-3.444zM11 9a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0111 9zm5 0a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0116 9z" />
              </svg>
              <span className="text-base font-bold text-pharos-navy-900">{quartos}</span>
              <span className="text-sm text-pharos-slate-500">quartos</span>
            </div>

            {/* Suítes */}
            {suites !== undefined && suites > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 10.78V8c0-1.65-1.35-3-3-3h-4c-.77 0-1.47.3-2 .78-.53-.48-1.23-.78-2-.78H6C4.35 5 3 6.35 3 8v2.78c-.61.55-1 1.34-1 2.22v6h2v-2h16v2h2v-6c0-.88-.39-1.67-1-2.22zM14 7h4c.55 0 1 .45 1 1v2h-6V8c0-.55.45-1 1-1zM5 8c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v2H5V8z" />
                </svg>
                <span className="text-base font-bold text-pharos-navy-900">{suites}</span>
                <span className="text-sm text-pharos-slate-500">{suites === 1 ? 'suíte' : 'suítes'}</span>
              </div>
            )}

            {/* Vagas */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
              <span className="text-base font-bold text-pharos-navy-900">{vagas || 0}</span>
              <span className="text-sm text-pharos-slate-500">vagas</span>
            </div>
          </div>

          {/* Preço e Botão */}
          <div className="mt-auto pt-3 border-t border-pharos-slate-200">
            {/* Preço */}
            <div className="mb-3">
              <span className="text-2xl font-bold text-pharos-navy-900 block">{formatarPreco(preco)}</span>
            </div>

          {/* Botão CTA - Design Sofisticado */}
          <button
            type="button"
            onClick={handleCardNavigation}
            className="w-full text-center bg-gradient-to-r from-pharos-blue-500 to-pharos-blue-600 hover:from-pharos-blue-600 hover:to-pharos-blue-700 text-white text-sm font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] border border-pharos-blue-400/30 hover:border-pharos-blue-500/50"
          >
              Ver detalhes
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
