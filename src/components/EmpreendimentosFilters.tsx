"use client";

import React from 'react';
import { 
  MagnifyingGlassIcon,
  Squares2X2Icon,
  Bars3Icon 
} from '@heroicons/react/24/outline';
import { Select } from './Select';
import type { StatusFilter, SortOption } from '@/hooks/useEmpreendimentosFilter';

interface EmpreendimentosFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  stats: {
    total: number;
    preLancamento: number;
    lancamento: number;
    construcao: number;
    prontos: number;
  };
}

export const EmpreendimentosFilters: React.FC<EmpreendimentosFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  stats,
}) => {
  const filters = [
    { id: 'todos' as StatusFilter, label: 'Todos', count: stats.total },
    { id: 'pre-lancamento' as StatusFilter, label: 'Pré-Lançamento', count: stats.preLancamento },
    { id: 'lancamento' as StatusFilter, label: 'Lançamento', count: stats.lancamento },
    { id: 'em-construcao' as StatusFilter, label: 'Em Construção', count: stats.construcao },
    { id: 'pronto' as StatusFilter, label: 'Prontos', count: stats.prontos },
  ];

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-pharos-slate-300 shadow-md" role="search">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        {/* Mobile: Stack vertical com melhor espaçamento */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Search - Largura total em mobile */}
          <div className="relative w-full lg:flex-1 lg:max-w-md">
            <label htmlFor="search-empreendimentos" className="sr-only">
              Buscar empreendimento
            </label>
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharos-slate-600" aria-hidden="true" />
            <input
              id="search-empreendimentos"
              type="search"
              placeholder="Buscar empreendimento..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-pharos-slate-300 rounded-xl focus:ring-2 focus:ring-pharos-blue-600 focus:border-pharos-blue-600 outline-none transition-all text-sm bg-white"
              aria-label="Campo de busca de empreendimentos"
            />
          </div>

          {/* Filter Chips - Scroll horizontal em mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide" role="tablist" aria-label="Filtros de status">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                role="tab"
                aria-selected={activeFilter === filter.id}
                aria-label={`Filtrar por ${filter.label}, ${filter.count} empreendimentos`}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-pharos-blue-600 text-white shadow-lg scale-105'
                    : 'bg-pharos-slate-200 text-pharos-slate-800 hover:bg-pharos-slate-300 hover:scale-102'
                }`}
              >
                {filter.label} <span className="font-normal">({filter.count})</span>
              </button>
            ))}
          </div>

          {/* Sort apenas (visão em grade fixa) */}
          <div className="flex items-center gap-3 justify-between lg:justify-end">
            <div className="relative">
              <label htmlFor="sort-empreendimentos" className="sr-only">
                Ordenar por
              </label>
              <select
                id="sort-empreendimentos"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="px-4 py-2.5 border-2 border-pharos-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-pharos-blue-600 focus:border-pharos-blue-600 outline-none bg-white text-pharos-slate-800 appearance-none pr-10"
                aria-label="Ordenar empreendimentos"
              >
                <option value="relevancia">Relevantes</option>
                <option value="lancamento">Lançamentos</option>
                <option value="preco-asc">Menor Preço</option>
                <option value="preco-desc">Maior Preço</option>
                <option value="nome">A-Z</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharos-slate-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
