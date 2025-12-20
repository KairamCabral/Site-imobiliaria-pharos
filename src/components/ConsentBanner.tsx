/**
 * Consent Banner - LGPD/GDPR Compliant
 * Banner de consentimento de cookies
 */

'use client';

import { useState, useEffect } from 'react';
import { useConsentMode } from './GTMScript';

export default function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { acceptAll, rejectAll, updateConsent, getConsentPreferences } = useConsentMode();
  
  const [preferences, setPreferences] = useState({
    analytics: false,
    advertising: false,
    personalization: false,
  });
  
  useEffect(() => {
    // Verifica se já existe consentimento
    const stored = getConsentPreferences();
    if (!stored) {
      // Aguarda 1s antes de mostrar o banner
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, [getConsentPreferences]);
  
  const handleAcceptAll = () => {
    acceptAll();
    setIsVisible(false);
  };
  
  const handleRejectAll = () => {
    rejectAll();
    setIsVisible(false);
  };
  
  const handleSavePreferences = () => {
    updateConsent(
      preferences.analytics,
      preferences.advertising,
      preferences.personalization
    );
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🍪 Cookies e Privacidade
          </h2>
          <p className="text-gray-600">
            Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo. 
            Você pode escolher quais cookies aceitar.
          </p>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {!showDetails ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ℹ️
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Por que usamos cookies?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cookies essenciais garantem o funcionamento do site. 
                    Cookies de análise nos ajudam a melhorar. 
                    Cookies de publicidade personalizam anúncios.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowDetails(true)}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Ver detalhes e personalizar →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Essenciais (sempre ativos) */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Cookies Essenciais
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Sempre Ativo
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Necessários para o funcionamento básico do site (segurança, sessão, preferências).
                </p>
              </div>
              
              {/* Analytics */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Cookies de Análise
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Nos ajudam a entender como você usa o site para melhorar sua experiência (Google Analytics).
                </p>
              </div>
              
              {/* Advertising */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Cookies de Publicidade
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.advertising}
                      onChange={(e) => setPreferences({...preferences, advertising: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Permitem anúncios personalizados com base no seu interesse (Google Ads, Meta Pixel).
                </p>
              </div>
              
              {/* Personalization */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Cookies de Personalização
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.personalization}
                      onChange={(e) => setPreferences({...preferences, personalization: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Lembram suas preferências e personalizam conteúdo (recomendações, favoritos).
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            {showDetails ? (
              <>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Salvar Preferências
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Voltar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Aceitar Todos
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Rejeitar Todos
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-6 py-3 border border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-colors"
                >
                  Personalizar
                </button>
              </>
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Ao continuar navegando, você concorda com nossos{' '}
            <a href="/termos-de-uso" className="underline hover:text-gray-700">
              Termos de Uso
            </a>
            {' e '}
            <a href="/politica-privacidade" className="underline hover:text-gray-700">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

