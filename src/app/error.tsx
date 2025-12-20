'use client';

/**
 * Error Boundary Global
 * 
 * Captura erros não tratados no nível da aplicação
 * Envia para Sentry/Datadog e exibe UI de fallback premium
 * 
 * Seguindo Next.js App Router conventions:
 * - error.tsx: Erros gerais
 * - global-error.tsx: Erros críticos (layouts, _app)
 * - not-found.tsx: 404s
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw, Mail } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error para monitoramento
    console.error('[Error Boundary] Erro capturado:', error);
    
    // Enviar para Sentry (se configurado)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          errorBoundary: 'app-level',
          digest: error.digest,
        },
        contexts: {
          page: {
            url: window.location.href,
            pathname: window.location.pathname,
          },
        },
      });
    }
  }, [error]);

  // Detectar tipo de erro
  const isNetworkError = error.message?.includes('fetch') || 
                         error.message?.includes('network') ||
                         error.message?.includes('Failed to fetch');
  
  const isChunkLoadError = error.message?.includes('ChunkLoadError') ||
                           error.message?.includes('Loading chunk');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-2xl w-full">
            {/* Card de erro */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              {/* Ícone */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              {/* Título */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {isChunkLoadError ? 'Atualize a página' : 'Algo deu errado'}
              </h1>
              
              {/* Descrição */}
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {isChunkLoadError ? (
                  'Uma nova versão do site foi lançada. Por favor, recarregue a página.'
                ) : isNetworkError ? (
                  'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
                ) : (
                  'Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.'
                )}
              </p>
              
              {/* Detalhes técnicos (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-8 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                    Detalhes técnicos (dev only)
                  </summary>
                  <div className="bg-gray-100 rounded-lg p-4 text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <p className="font-bold mb-2">Erro:</p>
                    <p className="text-red-600 mb-3">{error.message}</p>
                    {error.digest && (
                      <>
                        <p className="font-bold mb-2">Digest:</p>
                        <p className="text-blue-600 mb-3">{error.digest}</p>
                      </>
                    )}
                    {error.stack && (
                      <>
                        <p className="font-bold mb-2">Stack:</p>
                        <pre className="whitespace-pre-wrap">{error.stack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}
              
              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Tentar novamente */}
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Tentar Novamente
                </button>
                
                {/* Voltar para home */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors border-2 border-gray-300"
                >
                  <Home className="w-5 h-5" />
                  Ir para Home
                </Link>
              </div>
              
              {/* Link de suporte */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">
                  Precisa de ajuda?
                </p>
                <Link
                  href="/contato"
                  className="inline-flex items-center gap-2 text-pharos-blue-500 hover:text-pharos-blue-600 font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Fale conosco
                </Link>
              </div>
            </div>
            
            {/* Footer com logo */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Pharos Negócios Imobiliários
              </p>
          </div>
        </div>
      </div>
  );
}

