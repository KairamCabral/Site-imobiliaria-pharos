/**
 * useSwipe - Hook de Detecção de Gestos 100% Manual
 * 
 * Detecta gestos de swipe em elementos (horizontal e vertical).
 * 
 * IMPORTANTE: Este hook NÃO implementa autoplay.
 * - Swipe é detectado APENAS por gesto ativo do usuário
 * - Requer movimento mínimo (threshold) e velocidade mínima
 * - Não há detecção automática ou passiva de movimento
 * - Touch events são tratados com Pointer Events para melhor suporte
 * 
 * Características:
 * - Threshold padrão: 50px (ajustável)
 * - Velocidade mínima: 0.3 px/ms
 * - Suporta tanto touch quanto mouse/trackpad
 * - Compatível com scroll natural da página
 */

'use client';

import { useEffect, useRef, RefObject } from 'react';

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
  threshold?: number; // Mínimo de pixels para considerar um swipe (padrão: 50px)
  preventScroll?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export function useSwipe<T extends HTMLElement = HTMLDivElement>(
  options: UseSwipeOptions = {}
): RefObject<T> {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
    threshold = 50,
    preventScroll = false,
  } = options;

  const elementRef = useRef<T | null>(null);
  const touchStartRef = useRef<TouchPosition | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const supportsPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;
    const MIN_VELOCITY = 0.3;

    const shouldIgnoreEvent = (event: Event | null | undefined) => {
      if (!event) return false;

      const matchesControl = (node: EventTarget | null | undefined) => {
        if (!node || typeof node !== 'object') return false;
        const element = node as HTMLElement;
        if (element.dataset?.cardControl === 'true') return true;
        if (element.getAttribute?.('data-card-control') === 'true') return true;
        if (element.dataset?.swipeIgnore === 'true') return true;
        if (element.getAttribute?.('data-swipe-ignore') === 'true') return true;
        return false;
      };

      const target = event.target as (HTMLElement | null) ?? null;
      if (matchesControl(target)) return true;

      if (typeof event.composedPath === 'function') {
        const path = event.composedPath();
        for (const node of path) {
          if (matchesControl(node)) return true;
          if (node === element) break;
        }
      }

      let current = target?.parentElement ?? null;
      while (current) {
        if (matchesControl(current)) return true;
        if (current === element) break;
        current = current.parentElement;
      }

      return false;
    };

    const startTracking = (x: number, y: number) => {
      touchStartRef.current = {
        x,
        y,
        time: Date.now(),
      };
    };

    const finalizeSwipe = (endX: number, endY: number) => {
      if (!touchStartRef.current) return;

      const deltaX = endX - touchStartRef.current.x;
      const deltaY = endY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time || 1;

      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontal) {
        if (Math.abs(deltaX) > threshold && velocityX > MIN_VELOCITY) {
          const direction: SwipeDirection = deltaX > 0 ? 'right' : 'left';

          if (direction === 'left' && onSwipeLeft) {
            onSwipeLeft();
          } else if (direction === 'right' && onSwipeRight) {
            onSwipeRight();
          }

          if (onSwipe) {
            onSwipe(direction);
          }
        }
      } else if (Math.abs(deltaY) > threshold && velocityY > MIN_VELOCITY) {
        const direction: SwipeDirection = deltaY > 0 ? 'down' : 'up';

        if (direction === 'up' && onSwipeUp) {
          onSwipeUp();
        } else if (direction === 'down' && onSwipeDown) {
          onSwipeDown();
        }

        if (onSwipe) {
          onSwipe(direction);
        }
      }

      touchStartRef.current = null;
    };

    const cleanupTracking = () => {
      touchStartRef.current = null;
      pointerIdRef.current = null;
    };

    if (supportsPointerEvents) {
      const handlePointerDown = (event: PointerEvent) => {
        if (shouldIgnoreEvent(event)) {
          cleanupTracking();
          return;
        }

        if (event.pointerType === 'mouse' && event.button !== 0) return;

        pointerIdRef.current = event.pointerId;
        startTracking(event.clientX, event.clientY);

        if (preventScroll) {
          event.preventDefault();
        }

        if (element.setPointerCapture) {
          try {
            element.setPointerCapture(event.pointerId);
          } catch (_) {
            // Alguns elementos não suportam pointer capture
          }
        }
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (shouldIgnoreEvent(event)) {
          return;
        }

        if (pointerIdRef.current !== event.pointerId) return;
        if (preventScroll) {
          event.preventDefault();
        }
      };

      const handlePointerUp = (event: PointerEvent) => {
        if (shouldIgnoreEvent(event)) {
          cleanupTracking();
          return;
        }

        if (pointerIdRef.current !== event.pointerId) return;

        if (preventScroll) {
          event.preventDefault();
        }

        finalizeSwipe(event.clientX, event.clientY);

        if (element.releasePointerCapture) {
          try {
            element.releasePointerCapture(event.pointerId);
          } catch (_) {
            // Ignorar erros ao liberar o pointer capture
          }
        }

        cleanupTracking();
      };

      const handlePointerCancel = () => {
        cleanupTracking();
      };

      element.addEventListener('pointerdown', handlePointerDown, { passive: !preventScroll });
      element.addEventListener('pointermove', handlePointerMove, { passive: !preventScroll });
      element.addEventListener('pointerup', handlePointerUp, { passive: !preventScroll });
      element.addEventListener('pointercancel', handlePointerCancel);

      return () => {
        element.removeEventListener('pointerdown', handlePointerDown);
        element.removeEventListener('pointermove', handlePointerMove);
        element.removeEventListener('pointerup', handlePointerUp);
        element.removeEventListener('pointercancel', handlePointerCancel);
      };
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (shouldIgnoreEvent(event)) {
        cleanupTracking();
        return;
      }

      const touch = event.touches[0];
      startTracking(touch.clientX, touch.clientY);

      if (preventScroll) {
        event.preventDefault();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (shouldIgnoreEvent(event)) {
        return;
      }

      if (preventScroll) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (shouldIgnoreEvent(event)) {
        cleanupTracking();
        return;
      }

      if (preventScroll) {
        event.preventDefault();
      }

      const touch = event.changedTouches[0];
      finalizeSwipe(touch.clientX, touch.clientY);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe, threshold, preventScroll]);

  return elementRef as RefObject<T>;
}

/**
 * useSwipeDetector
 * Versão que retorna os valores ao invés de usar ref
 * Útil quando você quer detectar swipe em um elemento já existente
 */
export function useSwipeDetector(options: UseSwipeOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
    threshold = 50,
  } = options;

  const touchStartRef = useRef<TouchPosition | null>(null);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },

    onTouchEnd: (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontal) {
        if (Math.abs(deltaX) > threshold && velocityX > 0.3) {
          const direction: SwipeDirection = deltaX > 0 ? 'right' : 'left';
          
          if (direction === 'left' && onSwipeLeft) onSwipeLeft();
          else if (direction === 'right' && onSwipeRight) onSwipeRight();
          if (onSwipe) onSwipe(direction);
        }
      } else {
        if (Math.abs(deltaY) > threshold && velocityY > 0.3) {
          const direction: SwipeDirection = deltaY > 0 ? 'down' : 'up';
          
          if (direction === 'up' && onSwipeUp) onSwipeUp();
          else if (direction === 'down' && onSwipeDown) onSwipeDown();
          if (onSwipe) onSwipe(direction);
        }
      }

      touchStartRef.current = null;
    },
  };

  return handlers;
}

