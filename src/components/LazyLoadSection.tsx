'use client';

/**
 * LazyLoadSection
 * 
 * Componente que só renderiza seu conteúdo quando entra na viewport
 * Usa Intersection Observer para máxima performance
 * Ideal para componentes pesados abaixo da fold
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyLoadSectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  as?: React.ElementType;
  minHeight?: string;
}

export function LazyLoadSection({
  children,
  fallback = null,
  rootMargin = '200px 0px', // Começa a carregar 200px antes
  threshold = 0.01,
  className = '',
  as = 'div',
  minHeight,
}: LazyLoadSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Se não há suporte a IntersectionObserver, renderiza imediatamente
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      setHasLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          // Desconecta após carregar (não precisa mais observar)
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, hasLoaded]);

  const Component = as;

  return (
    <Component
      ref={ref}
      className={className}
      style={minHeight ? { minHeight } : undefined}
    >
      {isVisible ? children : (fallback || <div style={{ minHeight }} />)}
    </Component>
  );
}

/**
 * Hook useInViewport
 * 
 * Retorna se um elemento está visível na viewport
 * Útil para lógica condicional baseada em visibilidade
 */
export function useInViewport(options?: {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
        if (entry.isIntersecting && options?.triggerOnce) {
          observer.disconnect();
        }
      },
      {
        rootMargin: options?.rootMargin || '0px',
        threshold: options?.threshold || 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options?.rootMargin, options?.threshold, options?.triggerOnce]);

  return { ref, isInView };
}

