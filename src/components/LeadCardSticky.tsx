'use client';

import { useEffect, useRef, useState } from 'react';
import LeadCaptureCard from './LeadCaptureCard';

/**
 * PHAROS - Lead Card Sticky (Desktop)
 * 
 * Card inteligente que:
 * - Acompanha a sidebar com IntersectionObserver
 * - Sincroniza offset com altura do header fixo
 * - Mantém largura com ResizeObserver (evita CLS)
 * - Para antes do fim do container (sentinel)
 * - Performance: 60fps, CSS-based sticky
 */

interface LeadCardStickyProps {
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  realtor?: {
    id?: string;
    name: string;
    photo?: string;
    creci?: string;
    whatsapp?: string;
    online?: boolean;
  };
}

export default function LeadCardSticky({
  propertyId,
  propertyCode,
  propertyTitle,
  realtor,
}: LeadCardStickyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(88);
  const [width, setWidth] = useState<number>();

  // 1) Sincronizar offset top com altura do header fixo
  useEffect(() => {
    const updateTop = () => {
      // Buscar header fixo (ajustar seletor conforme seu projeto)
      const header = document.querySelector<HTMLElement>('header') || 
                     document.querySelector<HTMLElement>('[role="banner"]');
      
      const headerHeight = header ? header.getBoundingClientRect().height : 72;
      const offset = headerHeight + 16; // +16px de margem
      
      setTop(offset);
      
      // Definir CSS custom property para usar nos estilos
      document.documentElement.style.setProperty('--lead-stick-top', `${offset}px`);
    };

    updateTop();
    
    // Atualizar quando redimensionar (ex: header muda de altura)
    window.addEventListener('resize', updateTop);
    window.addEventListener('scroll', updateTop, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateTop);
      window.removeEventListener('scroll', updateTop);
    };
  }, []);

  // 2) Manter largura do card = largura do container (evita "pular" ao virar sticky)
  useEffect(() => {
    const container = ref.current?.parentElement;
    if (!container) return;

    const ro = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect) {
        setWidth(entry.contentRect.width);
      }
    });

    ro.observe(container);
    
    return () => ro.disconnect();
  }, []);

  // 3) Controlar sticky com sentinel inferior (não encostar no fim)
  useEffect(() => {
    const el = ref.current;
    const boundary = el?.closest('.sticky-boundary');
    const sentinel = boundary?.querySelector('#sticky-bottom-sentinel');

    if (!el || !boundary || !sentinel) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        // Quando o sentinel entra na viewport, card encosta no fundo
        if (entry.isIntersecting) {
          el.classList.add('is-bottomed');
        } else {
          el.classList.remove('is-bottomed');
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `0px 0px -${top + 24}px 0px`,
      }
    );

    io.observe(sentinel);

    return () => io.disconnect();
  }, [top]);

  // Telemetria
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_sticky_impression', {
        property_id: propertyId,
        property_code: propertyCode,
        type: 'desktop',
      });
    }
  }, [propertyId, propertyCode]);

  return (
    <div
      ref={ref}
      className="lead-card-sticky"
      style={{ width: width ? `${width}px` : undefined }}
      role="complementary"
      aria-label="Formulário de contato"
    >
      <LeadCaptureCard
        propertyId={propertyId}
        propertyCode={propertyCode}
        propertyTitle={propertyTitle}
        realtor={realtor}
      />
    </div>
  );
}

