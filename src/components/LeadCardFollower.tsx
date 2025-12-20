'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import LeadCaptureCard from './LeadCaptureCard';

/**
 * PHAROS - Lead Card Follower (Sticky-Proof)
 * 
 * Sistema robusto de seguir a sidebar com position: fixed
 * - Funciona independente de overflow/transform no parent
 * - Respeita o topo (header fixo) e o fim do container (#lead-boundary)
 * - 60fps com requestAnimationFrame
 * - Sem CLS (mantém largura via ResizeObserver)
 */

interface LeadCardFollowerProps {
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

function getHeaderTopOffset(): number {
  const header = document.querySelector<HTMLElement>('#site-header');
  return (header?.getBoundingClientRect().height ?? 72) + 16; // header + espaçamento
}

export default function LeadCardFollower({
  propertyId,
  propertyCode,
  propertyTitle,
  realtor,
}: LeadCardFollowerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState(88); // fallback inicial
  const [width, setWidth] = useState<number>();
  const [isMobile, setIsMobile] = useState(false);

  // 1) Sincronizar offset do header e breakpoints
  useEffect(() => {
    const update = () => {
      setTopOffset(getHeaderTopOffset());
      setIsMobile(window.innerWidth <= 1024);
    };

    // Executar inicial
    update();

    // Listeners
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  // 2) Manter a largura = largura do boundary (evita "pulo" visual)
  useLayoutEffect(() => {
    const boundary = document.querySelector<HTMLElement>('#lead-boundary');
    if (!boundary) return;

    const ro = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect) {
        setWidth(entry.contentRect.width);
      }
    });

    ro.observe(boundary);

    return () => ro.disconnect();
  }, []);

  // 3) Lógica follower: fixed dentro do limite do boundary
  useEffect(() => {
    if (isMobile) return; // no mobile, usamos dock

    const card = ref.current;
    const boundary = document.querySelector<HTMLElement>('#lead-boundary');

    if (!card || !boundary) return;

    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const bRect = boundary.getBoundingClientRect();
        const cRect = card.getBoundingClientRect();

        // Posição X do boundary (para fixar o card alinhado à coluna)
        const left = bRect.left;
        const right = bRect.right;
        const cardWidth = right - left;

        // Se o topo do boundary chegou acima do topo permitido, fixa; senão, posiciona no topo do boundary
        const canFix = bRect.top - topOffset <= 0;

        if (canFix) {
          // Espaço restante até o fim do boundary (bottom "visível" – topo fixo – altura do card)
          const available = bRect.bottom - topOffset - cRect.height;

          if (available <= 0) {
            // Encosta no fundo do boundary (modo "bottomed")
            card.style.position = 'absolute';
            card.style.top = 'auto';
            card.style.bottom = '0';
            card.style.left = '0';
            card.style.width = '100%';
          } else {
            // Fixed preso no topo do viewport, alinhado à coluna
            card.style.position = 'fixed';
            card.style.top = `${topOffset}px`;
            card.style.bottom = 'auto';
            card.style.left = `${left}px`;
            card.style.width = `${cardWidth}px`;
          }
        } else {
          // Ainda não chegou no topo fixo — fica na posição original
          card.style.position = 'absolute';
          card.style.top = '0';
          card.style.bottom = 'auto';
          card.style.left = '0';
          card.style.width = '100%';
        }
      });
    };

    // Executar inicial
    onScroll();

    // Listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [topOffset, isMobile]);

  // Telemetria
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_follower_impression', {
        property_id: propertyId,
        property_code: propertyCode,
        type: 'desktop',
      });
    }
  }, [propertyId, propertyCode, isMobile]);

  // No mobile, não renderiza (usa dock)
  if (isMobile) return null;

  return (
    <div
      ref={ref}
      className="lead-follower"
      style={{
        position: 'absolute',
        top: 0,
        width: width ? `${width}px` : '100%',
        willChange: 'transform',
        zIndex: 5,
      }}
      role="complementary"
      aria-label="Formulário de contato"
    >
      <div className="lead-card">
        <LeadCaptureCard
          propertyId={propertyId}
          propertyCode={propertyCode}
          propertyTitle={propertyTitle}
          realtor={realtor}
        />
      </div>
    </div>
  );
}

