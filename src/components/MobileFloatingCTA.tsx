'use client';

import { useState, useEffect } from 'react';
import { Calendar, MessageCircle } from 'lucide-react';

interface MobileFloatingCTAProps {
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  realtorWhatsapp?: string;
  onScheduleClick: () => void;
  className?: string;
}

export default function MobileFloatingCTA({
  propertyId,
  propertyCode,
  propertyTitle,
  realtorWhatsapp,
  onScheduleClick,
  className = '',
}: MobileFloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar após rolar 300px
      if (currentScrollY > 300) {
        // Mostrar quando rolar para baixo ou quando estiver parado
        if (currentScrollY > lastScrollY || currentScrollY > 500) {
          setIsVisible(true);
        } else {
          // Esconder quando rolar rapidamente para cima
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll event
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    
    return () => window.removeEventListener('scroll', scrollListener);
  }, [lastScrollY]);

  // WhatsApp link
  const whatsappNumber = realtorWhatsapp?.replace(/\D/g, '') || '5547991878070';
  const whatsappMessage = `Olá! Tenho interesse no imóvel *${propertyCode}* - ${propertyTitle}`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } ${className}`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Backdrop Blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-md" />
      
      {/* Content */}
      <div className="relative px-4 pt-3 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* WhatsApp Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
          aria-label={`Falar no WhatsApp sobre o imóvel ${propertyCode}`}
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'cta_click', {
                  cta_type: 'whatsapp',
                  cta_location: 'floating_mobile',
                  property_id: propertyId,
                });
              }
            }}
            className="group flex items-center justify-center gap-2.5 px-4 py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.96]"
          >
            <MessageCircle 
              className="w-5 h-5 group-hover:scale-110 transition-transform" 
              strokeWidth={2.5} 
              fill="currentColor"
            />
            <span>WhatsApp</span>
          </a>

          {/* Agendar Button */}
          <button
            onClick={() => {
              onScheduleClick();
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'schedule_modal_open', {
                  trigger: 'floating_mobile',
                  property_id: propertyId,
                });
              }
            }}
          aria-label={`Agendar visita para o imóvel ${propertyCode}`}
            className="group flex items-center justify-center gap-2.5 px-4 py-4 bg-pharos-blue-600 hover:bg-pharos-blue-700 text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.96]"
          >
            <Calendar 
              className="w-5 h-5 group-hover:scale-110 transition-transform" 
              strokeWidth={2.5}
            />
            <span>Agendar</span>
          </button>
        </div>
      </div>

      {/* Shadow Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pharos-slate-300 to-transparent" />
    </div>
  );
}

