/**
 * Componente de Erro para lista de imóveis
 * Suporta diferentes tipos de erro: not-found, temporary, unknown
 */

import Link from 'next/link';

interface PropertiesErrorProps {
  error?: Error | null;
  errorType?: 'not-found' | 'temporary' | 'unknown' | null;
  onRetry?: () => void;
}

export default function PropertiesError({ error, errorType, onRetry }: PropertiesErrorProps) {
  // Mensagens personalizadas por tipo
  const errorConfig = {
    'not-found': {
      title: 'Imóvel não encontrado',
      message: 'Não encontramos esse imóvel. Ele pode ter sido vendido ou removido.',
      cta: 'Ver outros imóveis em Barra Sul',
      ctaHref: '/imoveis?bairros=barra-sul',
      showRetry: false,
    },
    'temporary': {
      title: 'Falha temporária',
      message: 'Não conseguimos buscar o imóvel no momento. Por favor, tente novamente.',
      cta: 'Tentar Novamente',
      ctaHref: null,
      showRetry: true,
    },
    'unknown': {
      title: 'Erro ao carregar imóvel',
      message: error?.message || 'Algo deu errado. Por favor, tente novamente.',
      cta: 'Tentar Novamente',
      ctaHref: null,
      showRetry: true,
    },
  };

  const config = errorConfig[errorType || 'unknown'];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
      {/* Ícone de erro */}
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          {errorType === 'not-found' ? (
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Título */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {config.title}
      </h3>

      {/* Mensagem */}
      <p className="text-gray-600 mb-6">
        {config.message}
      </p>

      {/* Botão de ação */}
      {config.showRetry && onRetry ? (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {config.cta}
        </button>
      ) : config.ctaHref ? (
        <Link
          href={config.ctaHref}
          className="inline-flex items-center gap-2 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg"
        >
          {config.cta}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ) : null}

      {/* Link para suporte */}
      <p className="mt-6 text-sm text-gray-500">
        Problema persistente?{' '}
        <a href="/contato" className="text-pharos-blue-500 hover:underline font-medium">
          Entre em contato
        </a>
      </p>
    </div>
  );
}

