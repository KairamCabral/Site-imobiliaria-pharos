/**
 * useKeyboard
 * Hook para detectar teclas pressionadas
 * Suporta combinações (Ctrl, Shift, Alt, Meta)
 */

'use client';

import { useEffect, useCallback, RefObject } from 'react';

type KeyMap = Record<string, () => void>;

interface UseKeyboardOptions {
  /**
   * Elemento específico para escutar eventos (default: window)
   */
  targetRef?: RefObject<HTMLElement>;
  
  /**
   * Executar apenas quando o elemento está focado
   */
  requireFocus?: boolean;
  
  /**
   * Prevenir comportamento padrão da tecla
   */
  preventDefault?: boolean;
  
  /**
   * Parar propagação do evento
   */
  stopPropagation?: boolean;
  
  /**
   * Ativar apenas quando não há input focado
   */
  ignoreWhenInputFocused?: boolean;
}

export function useKeyboard(
  keyMap: KeyMap,
  options: UseKeyboardOptions = {}
) {
  const {
    targetRef,
    requireFocus = false,
    preventDefault = false,
    stopPropagation = false,
    ignoreWhenInputFocused = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input/textarea
      if (ignoreWhenInputFocused) {
        const target = event.target as HTMLElement;
        const isInput = 
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;
        
        if (isInput) return;
      }

      // Verificar se requer foco no elemento
      if (requireFocus && targetRef?.current) {
        if (document.activeElement !== targetRef.current) {
          return;
        }
      }

      // Construir a chave com modificadores
      const modifiers: string[] = [];
      if (event.ctrlKey) modifiers.push('Ctrl');
      if (event.shiftKey) modifiers.push('Shift');
      if (event.altKey) modifiers.push('Alt');
      if (event.metaKey) modifiers.push('Meta');

      const keyWithModifiers = modifiers.length
        ? `${modifiers.join('+')}+${event.key}`
        : event.key;

      // Executar callback se a tecla estiver mapeada
      const callback = keyMap[keyWithModifiers] || keyMap[event.key];
      
      if (callback) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callback();
      }
    },
    [keyMap, targetRef, requireFocus, preventDefault, stopPropagation, ignoreWhenInputFocused]
  );

  useEffect(() => {
    const target = targetRef?.current || window;

    target.addEventListener('keydown', handleKeyDown as any);

    return () => {
      target.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [handleKeyDown, targetRef]);
}

/**
 * Hook para teclas específicas comuns
 */
export function useEscapeKey(callback: () => void, enabled = true) {
  useKeyboard(
    { Escape: callback },
    { 
      preventDefault: true,
      ignoreWhenInputFocused: false
    }
  );
}

export function useArrowKeys(callbacks: {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
}) {
  useKeyboard(
    {
      ArrowLeft: callbacks.onLeft || (() => {}),
      ArrowRight: callbacks.onRight || (() => {}),
      ArrowUp: callbacks.onUp || (() => {}),
      ArrowDown: callbacks.onDown || (() => {}),
    },
    {
      preventDefault: true,
      ignoreWhenInputFocused: true,
    }
  );
}

export function useEnterKey(callback: () => void) {
  useKeyboard(
    { Enter: callback },
    { preventDefault: false }
  );
}

/**
 * Hook para detectar combinação de teclas
 */
export function useHotkey(
  hotkey: string, // Ex: "Ctrl+K", "Meta+Shift+P"
  callback: () => void,
  options: UseKeyboardOptions = {}
) {
  useKeyboard(
    { [hotkey]: callback },
    {
      preventDefault: true,
      stopPropagation: true,
      ...options,
    }
  );
}

