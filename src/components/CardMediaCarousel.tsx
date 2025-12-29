"use client";

/**
 * CardMediaCarousel - Subcomponente de mídia para cards de imóvel
 * - Carrossel 100% manual (sem autoplay)
 * - Setas aparecem em hover/focus (desktop) e foco no touch
 * - Indicadores minimalistas sempre visíveis quando 2+ imagens
 * - Recorta bordas superiores (rounded-t-2xl) e evita layout shift
 */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePropertyCarousel } from "@/hooks/usePropertyCarousel";
import { OptimizedImage as Image } from "./OptimizedImage";

type CardMediaCarouselProps = {
  propertyId: string;
  imagens: string[];
  titulo?: string;
  tipoImovel?: string;
  destaque?: boolean;
  /** Overlays posicionados pelo pai (ex.: selo/código/favorito) */
  children?: React.ReactNode;
  /** Se true, primeira imagem usa priority para LCP */
  priority?: boolean;
};

const isValidImageUrl = (url: any): boolean =>
  typeof url === "string" && /^https?:\/\//i.test(url) && url.trim() !== "";

export default function CardMediaCarousel({
  propertyId,
  imagens,
  titulo,
  tipoImovel,
  destaque = false,
  children,
  priority = false,
}: CardMediaCarouselProps) {
  // Estado local de imagens com pré-carregamento da galeria completa quando necessário
  const [rawImages, setRawImages] = useState<string[]>(Array.isArray(imagens) ? imagens : []);
  const fetchGuardRef = useRef(false);
  const ioRef = useRef<HTMLDivElement | null>(null);

  // Mantém em sincronia quando a prop chega com mais imagens
  useEffect(() => {
    if (!Array.isArray(imagens)) return;
    if (imagens.length > rawImages.length) {
      setRawImages(imagens);
    }
  }, [imagens, rawImages.length]);

  // Lazy-fetch da galeria completa quando o card entra na viewport e só há 0/1 imagens
  useEffect(() => {
    if (rawImages.length > 1) return;
    if (fetchGuardRef.current) return;

    const el = ioRef.current;
    if (!el) return;

    const onIntersect: IntersectionObserverCallback = (entries, observer) => {
      const entry = entries[0];
      if (!entry || !entry.isIntersecting) return;
      observer.disconnect();

      fetchGuardRef.current = true;
      // Busca detalhada na API que já consolida a galeria do Vista
      const controller = new AbortController();
      fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
        method: "GET",
        signal: controller.signal,
        headers: { "Accept": "application/json" },
      })
        .then(async (res) => {
          if (!res.ok) return;
          const json = await res.json();
          const photos: Array<{ url?: string }> = Array.isArray(json?.photos) ? json.photos : [];
          const urls = photos.map((p) => (p?.url ? String(p.url).trim() : "")).filter(isValidImageUrl);
          if (urls.length > rawImages.length) {
            setRawImages(urls);
          }
        })
        .catch(() => {})
        .finally(() => {
          fetchGuardRef.current = true;
        });

      return () => controller.abort();
    };

    const io = new IntersectionObserver(onIntersect, { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [propertyId, rawImages.length]);

  const carouselImages = useMemo(() => {
    if (!Array.isArray(rawImages)) return [];
    const seen = new Set<string>();
    const normalized: { src: string; alt: string }[] = [];
    for (let i = 0; i < rawImages.length; i++) {
      const raw = rawImages[i];
      if (!isValidImageUrl(raw)) continue;
      const src = String(raw).trim();
      if (seen.has(src)) continue;
      seen.add(src);
      normalized.push({
        src,
        alt: `${titulo || tipoImovel || "Imóvel"} - imagem ${i + 1}`,
      });
    }
    return normalized;
  }, [rawImages, titulo, tipoImovel]);
  
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
    fallbackAlt: titulo || tipoImovel || "Imagem do imóvel",
    propertyId,
  });

  const canNavigate = carouselImages.length > 1;

  // Ref combinado: observer + swipe no mesmo elemento host
  const setHostRef = useCallback((el: HTMLDivElement | null) => {
    ioRef.current = el;
    (swipeRef as unknown as { current: HTMLDivElement | null }).current = el;
  }, [swipeRef]);

  return (
    <div
      ref={setHostRef}
      className="group relative w-full h-[220px] md:h-[240px] min-h-[220px] md:min-h-[240px] max-h-[220px] md:max-h-[240px] overflow-hidden bg-pharos-base-off focus:outline-none rounded-t-2xl"
      role="group"
      aria-roledescription="carousel"
      aria-label={`Galeria do imóvel ${titulo || tipoImovel || propertyId}`}
      tabIndex={canNavigate ? 0 : -1}
      onKeyDown={handleKeyDown}
      style={{
        touchAction: canNavigate ? "pan-y pinch-zoom" : "auto",
        contentVisibility: "auto"
      }}
      data-touch-action={canNavigate ? "pan-y" : undefined}
      data-card-control="true"
    >
      {currentImage ? (
        <Image
          src={currentImage.src}
          alt={currentImage.alt || titulo || `${tipoImovel} ${propertyId}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          priority={priority && currentIndex === 0}
          loading={priority && currentIndex === 0 ? "eager" : "lazy"}
          draggable={false}
          quality={currentIndex === 0 ? 85 : 75}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-pharos-blue-500/10 to-pharos-blue-500/5 grid place-items-center">
          <div className="text-center p-6">
            <svg className="w-16 h-16 mx-auto mb-3 text-pharos-blue-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-pharos-slate-500 font-medium">{tipoImovel || "Imóvel"}</p>
          </div>
        </div>
      )}

      {/* Overlay de gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

      {/* Slot para overlays (selo, código, favorito, etc.) */}
      {children}

      {/* Controles visuais (mostram sempre; ficam desabilitados quando não há 2+ imagens) */}
      <>
        <button
          type="button"
          onClick={() => prev()}
          disabled={!canNavigate}
          data-card-control="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center bg-white/95 hover:bg-white text-pharos-navy-900 rounded-full shadow-lg backdrop-blur-md z-50 opacity-0 pointer-events-none transition-opacity duration-200 md:group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 md:group-hover:pointer-events-auto group-focus-within:pointer-events-auto focus:pointer-events-auto md:group-hover/outer:opacity-100 group-focus-within/outer:opacity-100 md:group-hover/outer:pointer-events-auto group-focus-within/outer:pointer-events-auto hover:scale-110 active:scale-95 border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Ver imagem anterior do imóvel"
          title="Imagem anterior"
          aria-disabled={!canNavigate}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true" data-card-control="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => next()}
          disabled={!canNavigate}
          data-card-control="true"
          className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center bg-white/95 hover:bg-white text-pharos-navy-900 rounded-full shadow-lg backdrop-blur-md z-50 opacity-0 pointer-events-none transition-opacity duration-200 md:group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 md:group-hover:pointer-events-auto group-focus-within:pointer-events-auto focus:pointer-events-auto md:group-hover/outer:opacity-100 group-focus-within/outer:opacity-100 md:group-hover/outer:pointer-events-auto group-focus-within/outer:pointer-events-auto hover:scale-110 active:scale-95 border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Ver próxima imagem do imóvel"
          title="Próxima imagem"
          aria-disabled={!canNavigate}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} data-card-control="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicadores minimalistas (apenas se houver 2+ imagens) */}
        {canNavigate && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30 bg-transparent" role="tablist" aria-label="Galeria de imagens">
              {carouselImages.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  role="tab"
                  onClick={() => goTo(index)}
                  data-card-control="true"
                  className={`min-w-[32px] min-h-[32px] flex items-center justify-center transition-all duration-200 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 ${currentIndex === index ? "px-2" : "px-1.5"}`}
                  aria-label={`Ver imagem ${index + 1} de ${carouselImages.length}`}
                  aria-current={currentIndex === index ? "true" : "false"}
                  aria-selected={currentIndex === index}
                  title={`Imagem ${index + 1}`}
                >
                  <span data-card-control="true" className={`rounded-full transition-all duration-200 ${currentIndex === index ? "h-1.5 w-5 bg-white" : "h-1.5 w-1.5 bg-white/75 hover:bg-white/90"}`} />
                </button>
              ))}
            </div>
        )}
      </>
    </div>
  );
}


