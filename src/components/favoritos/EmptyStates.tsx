'use client';

import Link from 'next/link';
import { useState } from 'react';
import LeadWizardModal from '../LeadWizardModal';

/**
 * PHAROS - EMPTY STATES PARA FAVORITOS
 * Estados vazios elegantes e informativos
 */

interface EmptyStateProps {
  type: 'no-favorites' | 'empty-collection' | 'no-results' | 'end-of-favorites';
  collectionName?: string;
}

export default function EmptyState({ type, collectionName }: EmptyStateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (type === 'end-of-favorites') {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 text-center max-w-[840px] mx-auto">
          <div className="bg-white border border-pharos-slate-300 rounded-2xl shadow-lg p-8 md:p-12 w-full">
            {/* Ícone */}
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20 bg-pharos-base-off rounded-full flex items-center justify-center border-2 border-pharos-slate-300">
                <svg className="w-10 h-10 text-pharos-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h3 className="text-2xl md:text-3xl font-bold text-pharos-navy-900 mb-4">
              Viu todos os imóveis disponíveis
            </h3>

            {/* Subtítulo */}
            <p className="text-base md:text-lg text-pharos-slate-600 mb-8 max-w-[600px] mx-auto leading-relaxed">
              Já conhece todas as opções disponíveis. Mas temos acesso a um <strong>portfólio exclusivo de imóveis</strong> que ainda não estão anunciados. Conte-nos o que você procura e teremos o prazer de apresentar oportunidades únicas.
            </p>

            {/* CTA Principal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-bold text-white bg-pharos-blue-500 rounded-xl hover:bg-pharos-blue-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98] min-h-[52px] mb-6"
            >
              Buscar imóveis exclusivos
            </button>

            {/* Benefícios */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-pharos-slate-600">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pharos-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Atendimento personalizado
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pharos-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Acesso a lançamentos
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pharos-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sem compromisso
              </span>
            </div>
          </div>
        </div>

        {/* Modal de Lead Wizard */}
        <LeadWizardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          filtrosIniciais={{}}
          tipo="end_of_list"
        />
      </>
    );
  }

  if (type === 'no-favorites') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        {/* Ilustração */}
        <div className="w-32 h-32 mb-6 relative">
          <svg
            className="w-full h-full text-pharos-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>

        {/* Conteúdo */}
        <h3 className="text-2xl font-bold text-pharos-navy-900 mb-3">
          Você ainda não salvou imóveis
        </h3>
        <p className="text-base text-pharos-slate-500 max-w-md mb-8">
          Comece a explorar nosso portfólio e salve os imóveis que mais te interessam.
          Organize suas preferências em coleções personalizadas.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/imoveis"
            className="px-6 py-3 text-sm font-bold text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 transition-colors shadow-md hover:shadow-lg"
          >
            Explorar imóveis
          </Link>
        </div>

        {/* Benefícios */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-pharos-blue-500/10 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-pharos-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-pharos-navy-900 mb-1">Organize</h4>
            <p className="text-xs text-pharos-slate-500">Crie coleções para categorizar seus favoritos</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-pharos-blue-500/10 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-pharos-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-pharos-navy-900 mb-1">Compare</h4>
            <p className="text-xs text-pharos-slate-500">Compare características lado a lado</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-pharos-blue-500/10 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-pharos-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-pharos-navy-900 mb-1">Compartilhe</h4>
            <p className="text-xs text-pharos-slate-500">Envie sua seleção para amigos ou corretores</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'empty-collection') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Ícone */}
        <div className="w-24 h-24 mb-6 relative">
          <svg
            className="w-full h-full text-pharos-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>

        {/* Conteúdo */}
        <h3 className="text-xl font-bold text-pharos-navy-900 mb-2">
          {collectionName ? `"${collectionName}" está vazia` : 'Coleção vazia'}
        </h3>
        <p className="text-sm text-pharos-slate-500 max-w-sm mb-6">
          Adicione imóveis a esta coleção ou mova alguns dos seus favoritos para organizá-los melhor.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/imoveis"
            className="px-5 py-2.5 text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 transition-colors"
          >
            Explorar imóveis
          </Link>
        </div>
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Ícone */}
        <div className="w-24 h-24 mb-6 relative">
          <svg
            className="w-full h-full text-pharos-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Conteúdo */}
        <h3 className="text-xl font-bold text-pharos-navy-900 mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-sm text-pharos-slate-500 max-w-sm mb-6">
          Tente ajustar os filtros ou buscar por outros termos para encontrar os imóveis que você salvou.
        </p>

        {/* CTA */}
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 text-sm font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off transition-colors"
        >
          Limpar filtros
        </button>
      </div>
    );
  }

  return null;
}

/**
 * Loading skeleton para cards de favoritos
 */
export function FavoriteCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-pharos-slate-300 animate-pulse">
      <div className="relative w-full aspect-[4/3] bg-pharos-slate-300" />
      <div className="p-5 space-y-4">
        <div className="h-4 bg-pharos-slate-300 rounded w-3/4" />
        <div className="h-6 bg-pharos-slate-300 rounded w-full" />
        <div className="flex gap-3">
          <div className="h-8 bg-pharos-slate-300 rounded w-20" />
          <div className="h-8 bg-pharos-slate-300 rounded w-20" />
          <div className="h-8 bg-pharos-slate-300 rounded w-20" />
        </div>
        <div className="pt-4 border-t border-pharos-slate-300">
          <div className="h-8 bg-pharos-slate-300 rounded w-32 mb-4" />
          <div className="h-10 bg-pharos-slate-300 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid de loading skeletons
 */
export function FavoritesLoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <FavoriteCardSkeleton key={idx} />
      ))}
    </div>
  );
}

