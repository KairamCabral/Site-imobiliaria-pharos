"use client";

/**
 * usePropertyCarousel - Hook de Carrossel 100% Manual
 * 
 * IMPORTANTE: Este hook NÃO implementa autoplay nem auto-advance.
 * Todas as transições são EXCLUSIVAMENTE MANUAIS via:
 * - Setas de navegação (next/prev)
 * - Swipe/drag (mobile e desktop)
 * - Teclado (ArrowLeft/ArrowRight)
 * - Indicadores clicáveis (goTo)
 * 
 * Garante:
 * - Nenhum timer ou interval para mudança automática
 * - Eventos de foco/blur/visibility não disparam mudanças
 * - preloadNext apenas pré-carrega imagens, não avança slides
 * - Controle total do usuário sobre a navegação
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { PLACEHOLDER_SVG_BASE64 } from "@/utils/imageUtils";
import { useSwipe } from "@/hooks/useSwipe";

export interface CarouselImage {
  src: string;
  alt?: string;
}

interface UsePropertyCarouselOptions {
  loop?: boolean;
  preloadNext?: boolean;
  fallbackAlt?: string;
  propertyId?: string;
}

const DEFAULT_OPTIONS: Required<Omit<UsePropertyCarouselOptions, "propertyId">> = {
  loop: true,
  preloadNext: true,
  fallbackAlt: "Imagem do imóvel",
};

type PersistedCarouselState = {
  index: number;
  src: string | null;
};

const carouselIndexStore = new Map<string, PersistedCarouselState>();

const isValidImage = (value: CarouselImage | null | undefined): value is CarouselImage => {
  if (!value || typeof value.src !== "string") return false;
  const trimmed = value.src.trim();
  if (!trimmed || trimmed === PLACEHOLDER_SVG_BASE64) return false;
  return /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/");
};

export function usePropertyCarousel(
  rawImages: Array<CarouselImage | null | undefined>,
  options?: UsePropertyCarouselOptions
) {
  if (process.env.NODE_ENV !== "production" && options) {
    const forbiddenKeys = ["autoplay", "autoPlay", "autoAdvance", "auto"].filter((key) =>
      Object.prototype.hasOwnProperty.call(options, key)
    );
    if (forbiddenKeys.length > 0) {
      console.error(
        `[usePropertyCarousel] ⚠️ Configurações automáticas não são permitidas: ${forbiddenKeys.join(
          ", "
        )}`
      );
    }
  }

  const { loop, preloadNext, fallbackAlt, propertyId } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const images = useMemo(() => {
    const seen = new Set<string>();

    return rawImages
      .filter(isValidImage)
      .map((img) => ({
        src: img.src.trim(),
        alt: img.alt?.trim() || fallbackAlt,
      }))
      .filter((img) => {
        if (seen.has(img.src)) return false;
        seen.add(img.src);
        return true;
      });
  }, [rawImages, fallbackAlt]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const previousSourcesRef = useRef<string[]>([]);
  const didRestoreRef = useRef(false);

  useEffect(() => {
    didRestoreRef.current = false;
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    if (process.env.NEXT_PUBLIC_DEBUG_CAROUSEL !== '1') return;
    console.debug(`[Carousel] mount:${propertyId}`);
    return () => {
      console.debug(`[Carousel] unmount:${propertyId}`);
    };
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    if (didRestoreRef.current) return;

    const stored = carouselIndexStore.get(propertyId);
    if (!stored) return;

    const { index: storedIndex, src: storedSrc } = stored;
    if (images.length === 0) return;

    if (storedSrc) {
      const matchIndex = images.findIndex((img) => img.src === storedSrc);
      if (matchIndex >= 0) {
        setCurrentIndex(matchIndex);
        didRestoreRef.current = true;
        return;
      }
    }

    if (storedIndex >= 0 && storedIndex < images.length) {
      setCurrentIndex(storedIndex);
      didRestoreRef.current = true;
    }
  }, [images, propertyId]);

  useEffect(() => {
    const currentSources = images.map((img) => img.src);
    const previousSources = previousSourcesRef.current;

    if (currentSources.length === 0) {
      if (currentIndex !== 0) {
        setCurrentIndex(0);
      }
      previousSourcesRef.current = currentSources;
      if (propertyId) {
        carouselIndexStore.set(propertyId, { index: 0, src: null });
      }
      return;
    }

    const sameOrder =
      currentSources.length === previousSources.length &&
      currentSources.every((src, idx) => src === previousSources[idx]);

    if (sameOrder) {
      previousSourcesRef.current = currentSources;
      if (propertyId) {
        const persisted = carouselIndexStore.get(propertyId);
        if (!persisted || persisted.index !== currentIndex || persisted.src !== currentSources[currentIndex]) {
          carouselIndexStore.set(propertyId, {
            index: currentIndex,
            src: currentSources[currentIndex] ?? null,
          });
        }
      }
      return;
    }

    const currentSrc = previousSources[currentIndex] ?? null;
    let nextIndex = currentIndex;

    if (currentSrc) {
      const preservedIndex = currentSources.indexOf(currentSrc);
      if (preservedIndex >= 0) {
        nextIndex = preservedIndex;
      } else if (propertyId) {
        const stored = carouselIndexStore.get(propertyId);
        if (stored?.src) {
          const storedIndex = currentSources.indexOf(stored.src);
          if (storedIndex >= 0) {
            nextIndex = storedIndex;
          } else if (stored.index < currentSources.length) {
            nextIndex = stored.index;
          }
        }
      }
    }

    if (nextIndex >= currentSources.length) {
      nextIndex = currentSources.length - 1;
    }
    if (nextIndex < 0) {
      nextIndex = 0;
    }

    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }

    if (propertyId) {
      carouselIndexStore.set(propertyId, {
        index: nextIndex,
        src: currentSources[nextIndex] ?? null,
      });
    }

    previousSourcesRef.current = currentSources;
  }, [currentIndex, images, propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    if (images.length === 0) return;
    carouselIndexStore.set(propertyId, {
      index: currentIndex,
      src: images[currentIndex]?.src ?? null,
    });
  }, [currentIndex, images, propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    if (process.env.NEXT_PUBLIC_DEBUG_CAROUSEL !== '1') return;
    console.debug(`[Carousel] index:${propertyId}:${currentIndex}`);
  }, [currentIndex, propertyId]);

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;

      if (!loop) {
        const clamped = Math.min(Math.max(index, 0), images.length - 1);
        setCurrentIndex(clamped);
        if (propertyId) {
          carouselIndexStore.set(propertyId, {
            index: clamped,
            src: images[clamped]?.src ?? null,
          });
        }
        return;
      }

      const nextIndex = ((index % images.length) + images.length) % images.length;
      setCurrentIndex(nextIndex);
      if (propertyId) {
        carouselIndexStore.set(propertyId, {
          index: nextIndex,
          src: images[nextIndex]?.src ?? null,
        });
      }
    },
    [images, loop, propertyId]
  );

  const next = useCallback(() => {
    if (images.length <= 1) return;
    goTo(currentIndex + 1);
  }, [currentIndex, goTo, images.length]);

  const prev = useCallback(() => {
    if (images.length <= 1) return;
    goTo(currentIndex - 1);
  }, [currentIndex, goTo, images.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (images.length <= 1) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    },
    [images.length, next, prev]
  );

  // Pré-carrega APENAS a próxima imagem (otimização de performance)
  // IMPORTANTE: Pré-carregamento NÃO causa mudança automática de slide
  useEffect(() => {
    if (!preloadNext || images.length <= 1) return;

    const preload = new Image();
    const nextIndex = (currentIndex + 1) % images.length;
    preload.src = images[nextIndex]?.src ?? "";

    return () => {
      preload.onload = null;
    };
  }, [currentIndex, images, preloadNext]);

  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: images.length > 1 ? next : undefined,
    onSwipeRight: images.length > 1 ? prev : undefined,
  });

  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;
  const currentImage = hasImages ? images[currentIndex] : null;

  return {
    images,
    currentImage,
    currentIndex,
    hasImages,
    hasMultiple,
    goTo,
    next,
    prev,
    handleKeyDown,
    swipeRef,
  } as const;
}

export type UsePropertyCarouselReturn = ReturnType<typeof usePropertyCarousel>;


