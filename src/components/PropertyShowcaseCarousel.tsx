"use client";

import { useId, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard, A11y, Mousewheel } from "swiper/modules";
import type { NavigationOptions } from "swiper/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ImovelCard from "@/components/ImovelCard";
import PropertiesLoading from "@/components/PropertiesLoading";
import PropertiesError from "@/components/PropertiesError";
import type { Imovel } from "@/types";

interface PropertyShowcaseCarouselProps {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  backgroundClass?: string;
  ctaHref?: string;
  ctaLabel?: string;
  properties: Imovel[];
  loading?: boolean;
  loadingCount?: number;
  error?: Error | null;
  onRetry?: () => void;
  errorType?: "not-found" | "temporary" | "unknown" | null;
  refreshing?: boolean;
  lastUpdated?: number | null;
  cacheLayer?: 'memory' | 'redis' | 'origin';
}

export function PropertyShowcaseCarousel({
  id,
  badge,
  title,
  subtitle,
  description,
  backgroundClass = "bg-white",
  ctaHref,
  ctaLabel,
  properties,
  loading = false,
  loadingCount = 3,
  error,
  onRetry,
  errorType = null,
  refreshing = false,
  lastUpdated,
  cacheLayer,
}: PropertyShowcaseCarouselProps) {
  const prevButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<any | null>(null);
  const swiperInstanceId = useId();

  const hasContent = Array.isArray(properties) && properties.length > 0;
  const shouldShowNavigation = hasContent && properties.length > 1;
  const showSkeleton = loading && !hasContent;
  const showOverlay = refreshing && hasContent;

  const sectionId = useMemo(() => `${id}-carousel`, [id]);
  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return null;
    try {
      return formatDistanceToNow(lastUpdated, {
        locale: ptBR,
        addSuffix: true,
      });
    } catch (error) {
      return null;
    }
  }, [lastUpdated]);

  return (
    <section
      id={sectionId}
      className={`${backgroundClass} py-20 md:py-24 lg:py-28 transition-colors duration-500`}
      aria-label={title}
      data-cache-layer={cacheLayer}
    >
      <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-14 md:mb-16">
          <div className="max-w-3xl">
            {badge && (
              <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-pharos-blue-500 mb-5">
                {badge}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-pharos-navy-900 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <div className="flex items-center gap-2 text-pharos-slate-600 mt-4 text-sm md:text-base">
                <svg className="w-4 h-4 text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5c-1.379 0-2.5-1.121-2.5-2.5S10.621 6.5 12 6.5s2.5 1.121 2.5 2.5S13.379 11.5 12 11.5z" />
                </svg>
                <span className="font-medium">{subtitle}</span>
              </div>
            )}
            {description && (
              <p className="text-base md:text-lg text-pharos-slate-600 leading-relaxed mt-4 max-w-2xl">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-col md:items-end md:justify-end gap-3 text-right">
            <div className="min-h-[20px]">
              {refreshing ? (
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-pharos-blue-500 animate-pulse" aria-live="polite">
                  <span className="h-2 w-2 rounded-full bg-pharos-blue-500 animate-ping" />
                  Atualizando listagem…
                </span>
              ) : lastUpdatedLabel ? (
                <span className="text-xs font-medium text-pharos-slate-500">
                  Atualizado {lastUpdatedLabel}
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
              {ctaHref && ctaLabel && (
                <Link
                  href={ctaHref}
                  className="group inline-flex items-center gap-3 text-primary font-semibold px-6 py-3 rounded-xl border-2 border-primary/15 hover:border-primary hover:bg-primary/5 hover:text-primary-600 transition-all"
                >
                  {ctaLabel}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}

              {shouldShowNavigation && (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    ref={prevButtonRef}
                    className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-pharos-slate-200 bg-white text-pharos-navy-900 shadow-sm transition-all hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Ver imóveis anteriores"
                    aria-controls={swiperInstanceId}
                  >
                    <svg className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    ref={nextButtonRef}
                    className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-pharos-slate-200 bg-white text-pharos-navy-900 shadow-sm transition-all hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Ver próximos imóveis"
                    aria-controls={swiperInstanceId}
                  >
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showSkeleton ? (
          <PropertiesLoading count={loadingCount} />
        ) : error ? (
          <PropertiesError error={error} errorType={errorType} onRetry={onRetry} />
        ) : hasContent ? (
          <div className="relative">
            {/* CARROSSEL 100% MANUAL - BLOQUEIO TOTAL DE AUTOPLAY */}
            {/* Wrapper para suportar gesto de trackpad (2 dedos) horizontal */}
            <div
              className="overscroll-x-contain"
              onWheel={useCallback((e: React.WheelEvent<HTMLDivElement>) => {
                const activeSwiper = (swiperRef.current as any) || null;
                if (!activeSwiper) return;
                
                const absX = Math.abs(e.deltaX);
                const absY = Math.abs(e.deltaY);
                
                // ✅ Apenas interceptar se for MUITO mais horizontal que vertical
                // Isso permite scroll vertical normal sobre os cards
                const isStronglyHorizontal = absX > absY * 2 || e.shiftKey;
                
                if (!isStronglyHorizontal) {
                  // Permitir scroll vertical normal
                  return;
                }
                
                // Apenas prevenir se for claramente horizontal
                e.preventDefault();
                if (e.deltaX > 10 || (e.shiftKey && e.deltaY > 10)) {
                  activeSwiper.slideNext();
                } else if (e.deltaX < -10 || (e.shiftKey && e.deltaY < -10)) {
                  activeSwiper.slidePrev();
                }
              }, [])}
            >
            <Swiper
              id={swiperInstanceId}
              modules={[Navigation, Pagination, Keyboard, A11y, Mousewheel]}
              spaceBetween={20}
              slidesPerView={1.05}
              onSwiper={(sw) => {
                swiperRef.current = sw;
              }}
              onBeforeInit={(swiper) => {
                if (typeof swiper.params.navigation === "object") {
                  const navigation = swiper.params.navigation as NavigationOptions;
                  navigation.prevEl = prevButtonRef.current;
                  navigation.nextEl = nextButtonRef.current;
                }
              }}
              navigation={{
                prevEl: prevButtonRef.current,
                nextEl: nextButtonRef.current,
              }}
              mousewheel={{
                forceToAxis: true,          // usa gesto horizontal do trackpad para deslizar
                releaseOnEdges: true,       // permite voltar a rolar a página ao chegar nas bordas
                sensitivity: 0.6,           // sensibilidade confortável
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              keyboard={{ enabled: true, onlyInViewport: true }}
              a11y={{ enabled: true }}
              autoplay={false}
              allowTouchMove={true}
              simulateTouch={true}
              watchSlidesProgress={false}
              preventInteractionOnTransition={false}
              speed={300}
              breakpoints={{
                360: {
                  slidesPerView: 1.1,
                  spaceBetween: 18,
                  slidesOffsetBefore: 12,
                  slidesOffsetAfter: 12,
                },
                640: {
                  slidesPerView: 1.35,
                  spaceBetween: 20,
                  slidesOffsetBefore: 18,
                  slidesOffsetAfter: 18,
                },
                768: {
                  slidesPerView: 2.05,
                  spaceBetween: 22,
                  slidesOffsetBefore: 24,
                  slidesOffsetAfter: 24,
                },
                1024: {
                  slidesPerView: 2.8,
                  spaceBetween: 26,
                  slidesOffsetBefore: 32,
                  slidesOffsetAfter: 32,
                },
                1280: {
                  slidesPerView: 3.2,
                  spaceBetween: 28,
                  slidesOffsetBefore: 40,
                  slidesOffsetAfter: 40,
                },
              }}
              watchOverflow
              className="!pb-12"
            >
              {properties.map((imovel, index) => (
                <SwiperSlide key={imovel.id} className="h-auto pt-2 pb-6">
                  <div className="h-full">
                    <ImovelCard
                      id={imovel.id}
                      titulo={imovel.titulo}
                      priority={index === 0}
                      endereco={`${imovel.endereco?.rua ?? ''}, ${imovel.endereco?.numero ?? ''} - ${imovel.endereco?.bairro ?? ''}, ${imovel.endereco?.cidade ?? ''}`.replace(/(,\s*)+/g, ', ')}
                      preco={imovel.preco}
                      quartos={imovel.quartos}
                      banheiros={imovel.banheiros}
                      suites={imovel.suites}
                      area={imovel.areaPrivativa || imovel.areaTotal || 0}
                      imagens={imovel.galeria || []}
                      tipoImovel={imovel.tipo}
                      destaque={Boolean(imovel.exclusivo || imovel.destaque || imovel.superDestaque)}
                      caracteristicas={imovel.caracteristicas}
                      caracteristicasImovel={imovel.caracteristicasImovel}
                      caracteristicasLocalizacao={imovel.caracteristicasLocalizacao}
                      vagas={imovel.vagasGaragem}
                      distanciaMar={imovel.distanciaMar ?? imovel.distancia_mar_m}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            </div>

            {/* Gradient edges para reforçar scroll em desktop */}
            <div className="pointer-events-none absolute inset-y-6 left-0 w-12 bg-gradient-to-r from-[rgba(250,251,252,0.95)] to-transparent hidden lg:block" />
            <div className="pointer-events-none absolute inset-y-6 right-0 w-12 bg-gradient-to-l from-[rgba(250,251,252,0.95)] to-transparent hidden lg:block" />

            {showOverlay && (
              <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-white/55 backdrop-blur-[1px]" aria-hidden="true" />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-pharos-slate-200 shadow-sm p-12 text-center">
            <h3 className="text-2xl font-semibold text-pharos-navy-900 mb-3">Nenhum imóvel disponível no momento</h3>
            <p className="text-pharos-slate-600 mb-6 max-w-xl mx-auto">
              Assim que novos imóveis forem publicados nesta categoria, eles aparecerão aqui. Enquanto isso, explore nosso catálogo completo.
            </p>
            <Link
              href="/imoveis"
              className="inline-flex items-center gap-2 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg"
            >
              Ver todos os imóveis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default PropertyShowcaseCarousel;

