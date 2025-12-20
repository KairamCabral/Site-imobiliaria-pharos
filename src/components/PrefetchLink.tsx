'use client';

/**
 * PrefetchLink
 * 
 * Link otimizado com prefetch inteligente ao hover
 * Pré-carrega páginas antes do clique para navegação instantânea
 */

import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PrefetchLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetchDelay?: number; // Delay antes de fazer prefetch (evita prefetch acidental)
  prefetchOnHover?: boolean;
  prefetchOnViewport?: boolean; // Prefetch quando entra na viewport
  [key: string]: any; // Outras props do Link
}

export function PrefetchLink({
  href,
  children,
  className,
  prefetchDelay = 100, // 100ms de delay
  prefetchOnHover = true,
  prefetchOnViewport = false,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasPrefetched = useRef(false);

  const handlePrefetch = useCallback(() => {
    if (hasPrefetched.current) return;
    
    try {
      router.prefetch(href);
      hasPrefetched.current = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Prefetch] ${href}`);
      }
    } catch (error) {
      console.warn('[Prefetch] Failed:', error);
    }
  }, [href, router]);

  const handleMouseEnter = useCallback(() => {
    if (!prefetchOnHover) return;
    
    // Limpar timeout anterior se houver
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Aguardar delay antes de fazer prefetch (evita prefetch em scroll rápido)
    timeoutRef.current = setTimeout(handlePrefetch, prefetchDelay);
  }, [prefetchOnHover, prefetchDelay, handlePrefetch]);

  const handleMouseLeave = useCallback(() => {
    // Cancelar prefetch se usuário sair antes do delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup no unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ✅ OTIMIZAÇÃO: Prefetch ao entrar na viewport (opcional)
  React.useEffect(() => {
    if (!prefetchOnViewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPrefetched.current) {
          // Aguardar um pouco antes de fazer prefetch (economia de banda)
          setTimeout(handlePrefetch, 1000);
        }
      },
      { rootMargin: '100px' }
    );

    const element = document.querySelector(`a[href="${href}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [href, prefetchOnViewport, handlePrefetch]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * withPrefetch
 * 
 * HOC para adicionar prefetch a qualquer componente de card
 */
export function withPrefetch<P extends { href?: string; id?: string; codigo?: string }>(
  Component: React.ComponentType<P>
) {
  return function PrefetchWrapper(props: P) {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasPrefetched = useRef(false);

    const href = props.href || `/imoveis/${props.id || props.codigo}`;

    const handleMouseEnter = useCallback(() => {
      if (hasPrefetched.current) return;
      
      timeoutRef.current = setTimeout(() => {
        router.prefetch(href);
        hasPrefetched.current = true;
      }, 100);
    }, [href, router]);

    const handleMouseLeave = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }, []);

    return (
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Component {...props} />
      </div>
    );
  };
}

