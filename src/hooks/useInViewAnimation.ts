/**
 * useInViewAnimation
 * 
 * Hook para animar elementos quando entram na viewport
 * Usa Intersection Observer para performance otimizada
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface UseInViewAnimationOptions {
  /**
   * Threshold para trigger (0.0 a 1.0)
   * 0.1 = 10% do elemento visível
   */
  threshold?: number;
  
  /**
   * Root margin (expand/shrink viewport area)
   * Ex: "0px 0px -100px 0px" (trigger 100px antes)
   */
  rootMargin?: string;
  
  /**
   * Trigger apenas uma vez?
   */
  triggerOnce?: boolean;
  
  /**
   * Delay inicial (ms) antes de aplicar animação
   */
  delay?: number;
}

export function useInViewAnimation(options: UseInViewAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
  } = options;
  
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    // Se já animou e é triggerOnce, não fazer nada
    if (triggerOnce && hasAnimated) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsInView(true);
              setHasAnimated(true);
            }, delay);
          } else {
            setIsInView(true);
            setHasAnimated(true);
          }
          
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, hasAnimated]);
  
  return { ref, isInView };
}

/**
 * Hook simplificado para fade-in-up animation
 */
export function useFadeInUp(delay: number = 0) {
  const { ref, isInView } = useInViewAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
    delay,
  });
  
  return {
    ref,
    className: isInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-4',
  };
}

