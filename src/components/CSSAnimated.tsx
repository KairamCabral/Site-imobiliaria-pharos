'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Componente de animação usando apenas CSS
 * Substitui Framer Motion em casos simples, economizando ~50KB
 */
interface CSSAnimatedProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'scale-in';
  delay?: number;
  duration?: number;
  triggerOnce?: boolean;
}

export function CSSAnimated({ 
  children, 
  className = '', 
  animation = 'fade-in-up',
  delay = 0,
  duration = 600,
  triggerOnce = true,
}: CSSAnimatedProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [triggerOnce]);

  const animationClass = isVisible ? `animate-${animation}` : 'opacity-0';

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Versão simplificada para fade-in apenas
 */
export function FadeIn({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
}) {
  return (
    <CSSAnimated animation="fade-in" delay={delay} className={className}>
      {children}
    </CSSAnimated>
  );
}

/**
 * Versão simplificada para fade-in-up
 */
export function FadeInUp({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
}) {
  return (
    <CSSAnimated animation="fade-in-up" delay={delay} className={className}>
      {children}
    </CSSAnimated>
  );
}

