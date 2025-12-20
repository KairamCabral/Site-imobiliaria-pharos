/**
 * useScrollReveal
 * Hook para revelar elementos conforme o usuário scrolla
 * Usa Intersection Observer para performance
 */

'use client';

import { useEffect, useRef, RefObject } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  onReveal?: () => void;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): RefObject<T | null> {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    onReveal
  } = options;

  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            
            if (onReveal) {
              onReveal();
            }

            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce, onReveal]);

  return elementRef;
}

/**
 * useMultipleScrollReveal
 * Hook para revelar múltiplos elementos com stagger
 */
export function useMultipleScrollReveal<T extends HTMLElement = HTMLDivElement>(
  count: number,
  options: UseScrollRevealOptions & { staggerDelay?: number } = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    staggerDelay = 100,
  } = options;

  const refsArray = useRef<(T | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const delay = index * staggerDelay;
            
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, delay);

            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    refsArray.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      refsArray.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [threshold, rootMargin, triggerOnce, staggerDelay]);

  const setRef = (index: number) => (el: T | null) => {
    refsArray.current[index] = el;
  };

  return { refsArray, setRef };
}

