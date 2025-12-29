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
  // Sempre renderiza visível para evitar problemas de carregamento
  // Animação é apenas um enhancement progressivo
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
  
  // Sempre visível por padrão
  // Apenas aplica a animação suave de entrada se o componente está montado
  return (
    <Component
      ref={ref}
      className={`${className}`}
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

