/**
 * GTMScript Component
 * Inicializa Google Tag Manager com Consent Mode v2
 * e dataLayer para tracking avançado
 */

'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { logger } from '@/utils/logger';

interface GTMScriptProps {
  gtmId?: string;
}

export default function GTMScript({ gtmId }: GTMScriptProps) {
  const GTM_ID = gtmId || process.env.NEXT_PUBLIC_GTM_ID;
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return;
    
    // Marcar como inicializado para evitar múltiplas execuções
    initializedRef.current = true;
    
    // Inicializa dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    
    // Consent Mode v2 - Consentimento Implícito
    // Ao acessar o site, o usuário já consente automaticamente
    gtag('consent', 'default', {
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted',
      'analytics_storage': 'granted',
      'functionality_storage': 'granted',
      'personalization_storage': 'granted',
      'security_storage': 'granted',
    });
    
    // Região específica (Brasil - LGPD)
    // Consentimento implícito ao acessar
    gtag('consent', 'default', {
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted',
      'analytics_storage': 'granted',
      'region': ['BR'],
    });
    
    logger.info('GTM', 'Consent Mode inicializado (consentimento implícito: granted)');
  }, []);
  
  // Se não tiver GTM_ID configurado, não renderiza nada (silencioso em produção)
  if (!GTM_ID) {
    logger.warn('GTM', 'GTM_ID não configurado. Defina NEXT_PUBLIC_GTM_ID no .env.local');
    return null;
  }
  
  return (
    <>
      {/* Google Tag Manager - Script principal (afterInteractive para melhor performance) */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      
      {/* Google Tag Manager - Noscript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}

/**
 * Hook para atualizar consent
 * Use após o usuário aceitar/rejeitar cookies
 */
export function useConsentMode() {
  const updateConsent = (
    analytics: boolean,
    advertising: boolean,
    personalization: boolean = false
  ) => {
    if (typeof window === 'undefined' || !(window as any).dataLayer) return;
    
    (window as any).dataLayer.push({
      event: 'consent_update',
      consent_analytics: analytics,
      consent_advertising: advertising,
      consent_personalization: personalization,
    });
    
    // Atualiza Consent Mode
    (window as any).dataLayer.push({
      event: 'consent',
      command: 'update',
      parameters: {
        'analytics_storage': analytics ? 'granted' : 'denied',
        'ad_storage': advertising ? 'granted' : 'denied',
        'ad_user_data': advertising ? 'granted' : 'denied',
        'ad_personalization': personalization ? 'granted' : 'denied',
        'personalization_storage': personalization ? 'granted' : 'denied',
      },
    });
    
    // Salva preferência no localStorage
    localStorage.setItem('consent_preferences', JSON.stringify({
      analytics,
      advertising,
      personalization,
      timestamp: new Date().toISOString(),
    }));
    
    logger.info('GTM', 'Consent Mode atualizado', {
      analytics,
      advertising,
      personalization,
    });
  };
  
  const acceptAll = () => {
    updateConsent(true, true, true);
  };
  
  const rejectAll = () => {
    updateConsent(false, false, false);
  };
  
  const getConsentPreferences = () => {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('consent_preferences');
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };
  
  return {
    updateConsent,
    acceptAll,
    rejectAll,
    getConsentPreferences,
  };
}

