'use client';

import { useState, useEffect } from 'react';

/**
 * PHAROS - BOTÃO FLUTUANTE DE AGENDAMENTO
 * Botão de atalho que aparece após scroll para levar o usuário à seção de agendamento
 */

interface FloatingScheduleButtonProps {
  /** Distância em pixels para mostrar o botão (default: 300) */
  showAfterScroll?: number;
  /** Texto do botão (default: "Agendar visita") */
  label?: string;
  /** ID da seção alvo (default: "agendar-visita") */
  targetSectionId?: string;
}

export default function FloatingScheduleButton({
  showAfterScroll = 300,
  label = 'Agendar visita',
  targetSectionId = 'agendar-visita',
}: FloatingScheduleButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isNearSection, setIsNearSection] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar botão após rolar X pixels
      const shouldShow = window.scrollY > showAfterScroll;
      setIsVisible(shouldShow);

      // Esconder se estiver próximo/na seção de agendamento
      const section = document.getElementById(targetSectionId);
      if (section) {
        const rect = section.getBoundingClientRect();
        const isNear = rect.top < window.innerHeight && rect.bottom > 0;
        setIsNearSection(isNear);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, targetSectionId]);

  const scrollToSchedule = () => {
    const section = document.getElementById(targetSectionId);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'floating_schedule_click', {
        section_id: targetSectionId,
      });
    }
  };

  // Não mostrar se não estiver visível ou se estiver perto da seção
  if (!isVisible || isNearSection) return null;

  return (
    <>
      {/* Versão Desktop/Tablet */}
      <button
        onClick={scrollToSchedule}
        className="hidden sm:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-6 py-4 bg-pharos-blue-500 text-white rounded-full shadow-xl hover:bg-pharos-blue-600 transition-all hover:scale-105 active:scale-95 group"
        aria-label={label}
      >
        <svg 
          className="w-5 h-5 group-hover:scale-110 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        <span className="font-bold">{label}</span>
      </button>

      {/* Versão Mobile (Compacta) */}
      <button
        onClick={scrollToSchedule}
        className="sm:hidden fixed bottom-6 right-4 z-50 flex items-center justify-center w-14 h-14 bg-pharos-blue-500 text-white rounded-full shadow-xl hover:bg-pharos-blue-600 transition-all active:scale-95"
        aria-label={label}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </button>
    </>
  );
}

