'use client';

import React from 'react';
import { WifiOff, Heart, Home, RefreshCw } from 'lucide-react';

/**
 * Página Offline
 * 
 * Exibida quando o usuário está sem conexão
 * Mostra favoritos salvos localmente (se disponível)
 */
export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-gray-400" />
        </div>
        
        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Você está offline
        </h1>
        
        {/* Descrição */}
        <p className="text-lg text-gray-600 mb-8">
          Parece que você perdeu sua conexão com a internet.
          Verifique sua rede e tente novamente.
        </p>
        
        {/* Cards informativos */}
        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Seus Favoritos
                </h3>
                <p className="text-sm text-blue-700">
                  Seus imóveis favoritos são salvos localmente e você pode visualizá-los mesmo offline.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Conteúdo em Cache
                </h3>
                <p className="text-sm text-green-700">
                  Páginas visitadas recentemente estão disponíveis offline.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </button>
          
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Voltar à Página Inicial
          </a>
          
          <a
            href="/favoritos"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-pharos-blue-500 hover:text-pharos-blue-600 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            <Heart className="w-5 h-5" />
            Ver Meus Favoritos
          </a>
        </div>
        
        {/* Tips */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            💡 Dicas para resolver:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Verifique se o Wi-Fi está ativado</li>
            <li>• Tente alternar entre Wi-Fi e dados móveis</li>
            <li>• Reinicie seu roteador se necessário</li>
            <li>• Aguarde alguns instantes e tente novamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
