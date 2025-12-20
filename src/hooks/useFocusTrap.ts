/**
 * useFocusTrap
 * 
 * Hook para capturar o foco dentro de um elemento (modal, dialog, drawer)
 * seguindo as diretrizes WCAG 2.1 para acessibilidade.
 * 
 * @param isOpen - Estado que determina se o trap está ativo
 * @returns ref para o container que deve capturar o foco
 * 
 * @example
 * ```tsx
 * const Modal = ({ isOpen, onClose }) => {
 *   const containerRef = useFocusTrap(isOpen);
 *   return (
 *     // Use ref={containerRef} no container principal
 *     // Adicione role="dialog" e aria-modal="true" para acessibilidade
 *   );
 * };
 * ```
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(isOpen: boolean) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    // Salvar elemento focado antes de abrir
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Bloquear scroll do body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focar no container ou no primeiro elemento focável
    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focar no primeiro elemento após um pequeno delay para garantir renderização
    setTimeout(() => {
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        // Se não houver elementos focáveis, focar no container
        container.setAttribute('tabindex', '-1');
        container.focus();
      }
    }, 50);

    // Handler para trap de foco
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      // Se não houver elementos focáveis, prevenir Tab
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      // Se houver apenas um elemento focável, prevenir Tab
      if (focusableElements.length === 1) {
        event.preventDefault();
        firstFocusable?.focus();
        return;
      }

      // Shift + Tab (navegação reversa)
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab (navegação normal)
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    // Adicionar listener
    container.addEventListener('keydown', handleTabKey);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = originalOverflow;

      // Restaurar foco ao elemento anterior
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        // Timeout para evitar conflitos com animações de fechamento
        setTimeout(() => {
          previousFocusRef.current?.focus();
        }, 100);
      }
    };
  }, [isOpen]);

  return containerRef;
}


