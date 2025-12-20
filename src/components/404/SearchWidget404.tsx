"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * Widget de busca rápida para página 404
 * Permite ao usuário buscar imóveis diretamente da página de erro
 */

const QUICK_SUGGESTIONS = [
  { label: 'Apartamentos', value: 'tipo=apartamento' },
  { label: 'Casas', value: 'tipo=casa' },
  { label: 'Alto Padrão', value: 'tags=alto-padrao' },
  { label: 'Balneário Camboriú', value: 'cidade=balneario-camboriu' },
];

interface SearchWidget404Props {
  onSearch?: (query: string) => void;
}

export default function SearchWidget404({ onSearch }: SearchWidget404Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    // Callback para analytics
    if (onSearch) {
      onSearch(searchQuery);
    }

    // Redireciona para página de imóveis com query
    const searchParams = new URLSearchParams({ busca: searchQuery.trim() });
    router.push(`/imoveis?${searchParams.toString()}`);
  }, [searchQuery, onSearch, router]);

  const handleQuickSuggestion = useCallback((value: string) => {
    setIsLoading(true);
    
    if (onSearch) {
      onSearch(value);
    }

    router.push(`/imoveis?${value}`);
  }, [onSearch, router]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Busque por tipo, cidade ou características..."
            aria-label="Buscar imóveis"
            className="
              w-full px-5 py-4 pr-14
              text-base
              bg-white
              border-2 border-pharos-slate-300
              rounded-xl
              focus:border-pharos-blue-500 focus:ring-2 focus:ring-pharos-blue-500/20
              transition-all duration-200
              placeholder:text-pharos-slate-500
              touch-target
            "
          />
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            aria-label="Buscar"
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              w-10 h-10
              flex items-center justify-center
              bg-pharos-blue-500
              text-white
              rounded-lg
              hover:bg-pharos-blue-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
            "
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MagnifyingGlassIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-pharos-slate-500 self-center">
          Sugestões rápidas:
        </span>
        {QUICK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.value}
            onClick={() => handleQuickSuggestion(suggestion.value)}
            disabled={isLoading}
            className="
              px-4 py-2
              text-sm font-medium
              text-pharos-blue-500
              bg-pharos-blue-500/10
              rounded-full
              hover:bg-pharos-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
              touch-target
            "
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}




