/**
 * Cloudflare Turnstile Widget
 * 
 * CAPTCHA invisível e privacy-friendly
 * Alternativa ao reCAPTCHA com melhor experiência de usuário
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  theme = 'light',
  size = 'normal',
  className = '',
}: TurnstileWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se a chave está configurada
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.error('[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY não configurada');
      setError('Configuração de segurança ausente');
      return;
    }

    // Carrega o script do Turnstile
    const loadTurnstile = () => {
      if (window.turnstile) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        setError('Falha ao carregar verificação de segurança');
        if (onError) onError();
      };

      document.body.appendChild(script);
    };

    loadTurnstile();
  }, [onError]);

  useEffect(() => {
    if (!isLoaded || !widgetRef.current || !window.turnstile) return;

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    try {
      // Renderiza o widget
      const widgetId = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
        'error-callback': () => {
          setError('Erro na verificação de segurança');
          if (onError) onError();
        },
        'expired-callback': () => {
          if (onExpire) onExpire();
        },
        theme,
        size,
      });

      widgetIdRef.current = widgetId;
    } catch (err) {
      console.error('[Turnstile] Erro ao renderizar:', err);
      setError('Erro ao inicializar verificação');
      if (onError) onError();
    }

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (err) {
          console.error('[Turnstile] Erro ao remover widget:', err);
        }
      }
    };
  }, [isLoaded, onVerify, onError, onExpire, theme, size]);

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 ${className}`}>
        <p className="font-medium">⚠️ {error}</p>
        <p className="mt-1 text-xs">Por favor, recarregue a página e tente novamente.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={widgetRef} />
      {!isLoaded && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
          <span>Carregando verificação de segurança...</span>
        </div>
      )}
    </div>
  );
}

