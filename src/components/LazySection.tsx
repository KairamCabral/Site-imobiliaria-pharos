'use client';

import { useEffect, useRef, useState, type ReactNode, type ElementType, type MutableRefObject } from 'react';

type LazySectionProps = {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  as?: ElementType;
  id?: string;
};

/**
 * Renderiza os filhos somente quando a seção entra no viewport.
 * Mantém o conteúdo montado após a primeira visualização (padrão).
 */
export function LazySection({
  children,
  fallback = null,
  className,
  rootMargin = '200px 0px',
  threshold = 0,
  once = true,
  as: Component = 'section',
  id,
}: LazySectionProps) {
  const ComponentTag = Component as ElementType;
  const containerRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            setRendered(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  const shouldRenderChildren = rendered || visible;

  return (
    <ComponentTag
      ref={containerRef as MutableRefObject<HTMLElement | null>}
      className={className}
      data-lazy-state={shouldRenderChildren ? 'visible' : 'pending'}
      id={id}
    >
      {shouldRenderChildren ? children : fallback}
    </ComponentTag>
  );
}


