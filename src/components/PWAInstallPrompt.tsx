/**
 * PWA Install Prompt
 * 
 * Prompt para instalar o PWA no dispositivo
 * Aparece para usuários recorrentes em mobile
 * 
 * Features:
 * - Detecção de iOS vs Android
 * - A2HS (Add to Home Screen) prompt
 * - Persistência de preferência do usuário
 * - Analytics tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Share, Home } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone === true;
    
    setIsStandalone(isStandaloneMode);
    
    if (isStandaloneMode) return;

    // Detectar iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Verificar se usuário já recusou
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedAt = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    
    // Mostrar novamente após 7 dias
    if (daysSinceDismissed < 7) return;

    // Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após 30s (usuário já explorou o site)
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS - mostrar após 30s se for primeira vez
    if (ios && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar prompt nativo
    await deferredPrompt.prompt();
    
    // Aguardar escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: outcome,
      });
    }
    
    // Limpar prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_dismiss', {
        event_category: 'PWA',
      });
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={handleDismiss}
      />
      
      {/* Prompt Card */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-pharos-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Instalar Pharos
              </h3>
              <p className="text-sm text-gray-600">
                Acesso rápido aos imóveis
              </p>
            </div>
          </div>
          
          {/* Benefits */}
          <ul className="space-y-2 mb-6 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-pharos-blue-500 rounded-full" />
              <span>Acesso offline aos seus favoritos</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-pharos-blue-500 rounded-full" />
              <span>Notificações de novos imóveis</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-pharos-blue-500 rounded-full" />
              <span>Experiência nativa no celular</span>
            </li>
          </ul>
          
          {/* iOS Instructions */}
          {isIOS && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 mb-2 font-medium">
                Como instalar no iOS:
              </p>
              <ol className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-pharos-blue-500">1.</span>
                  <span>
                    Toque no botão <Share className="w-4 h-4 inline" /> (compartilhar)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-pharos-blue-500">2.</span>
                  <span>Role para baixo e toque em "Adicionar à Tela de Início"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-pharos-blue-500">3.</span>
                  <span>Toque em "Adicionar"</span>
                </li>
              </ol>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5" />
                Instalar
              </button>
            )}
            <button
              onClick={handleDismiss}
              className={`${!isIOS && deferredPrompt ? '' : 'flex-1'} px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors`}
            >
              {isIOS || !deferredPrompt ? 'Entendi' : 'Agora não'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Componente PWA Provider
 * Registra SW e mostra install prompt
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Registrar Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
}
