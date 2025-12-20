/**
 * AnimatedSection
 * 
 * Wrapper para seções com animação fade-in-up ao entrar na viewport
 * Usa Intersection Observer para performance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useInViewAnimation } from '@/hooks/useInViewAnimation';

export interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
  threshold?: number;
  style?: React.CSSProperties;
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  as = 'div',
  threshold = 0.1,
  style,
}: AnimatedSectionProps) {
  // ✅ CORREÇÃO: Prevenir hydration mismatch
  // Servidor e cliente renderizam a MESMA estrutura, animação só ativa no cliente
  const [isMounted, setIsMounted] = useState(false);
  
  const { ref, isInView } = useInViewAnimation({
    threshold,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
    delay,
  });
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const Component = as;
  
  // Servidor e cliente inicial: renderiza com as MESMAS classes (visível)
  // Após animação ativar: aplica fade-in
  return (
    <Component
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isMounted && !isInView
          ? 'opacity-0 translate-y-4' 
          : 'opacity-100 translate-y-0'
      } ${className}`}
      style={style}
    >
      {children}
    </Component>
  );
}

/**
 * AnimatedList
 * 
 * Lista com animação staggered (cascata)
 */
interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  as?: React.ElementType;
}

export function AnimatedList({
  children,
  className = '',
  staggerDelay = 50,
  as = 'div',
}: AnimatedListProps) {
  const Component = as;
  
  return (
    <Component className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedSection delay={index * staggerDelay} key={index}>
          {child}
        </AnimatedSection>
      ))}
    </Component>
  );
}

