'use client';

import { useState } from 'react';
import { useFavoritos } from '@/contexts/FavoritosContext';
import type { FavoritosOrdenacao, FavoritosViewMode } from '@/types';

/**
 * PHAROS - TOOLBAR DE FAVORITOS
 * Controles de visualização, ordenação e busca
 */

const SORT_OPTIONS: { value: FavoritosOrdenacao; label: string }[] = [
  { value: 'savedAt-desc', label: 'Mais recentes salvos' },
  { value: 'savedAt-asc', label: 'Mais antigos salvos' },
  { value: 'relevance', label: 'Últimos atualizados' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'sea-asc', label: 'Mais próximo do mar' },
  { value: 'area-asc', label: 'Menor área' },
  { value: 'area-desc', label: 'Maior área' },
];

const VIEW_MODES: { value: FavoritosViewMode; label: string }[] = [
  { value: 'grid', label: 'Grade' },
  { value: 'map', label: 'Mapa' },
];

interface FavoritesToolbarProps {
  onShareClick?: () => void;
  onExportClick?: () => void;
  showBulkActions?: boolean;
}

export default function FavoritesToolbar({
  onShareClick,
  onExportClick,
  showBulkActions = false,
}: FavoritesToolbarProps) {
  const {
    currentQuery,
    viewMode,
    selectedIds,
    setViewMode,
    setSort,
    setQuery,
    clearSelection,
    removeSelected,
    getFilteredFavoritos,
  } = useFavoritos();

  const [searchValue, setSearchValue] = useState(currentQuery.q || '');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filteredCount = getFilteredFavoritos().length;

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setQuery({ q: value });
  };

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === currentQuery.sort)?.label || 'Ordenar';

  return (
    <div className="bg-white border-b border-pharos-slate-300">
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        {/* Ações em massa - Mobile Otimizado */}
        {showBulkActions && selectedIds.length > 0 && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-pharos-blue-500/10 border border-pharos-blue-500/30 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-semibold text-pharos-navy-900">
                {selectedIds.length} {selectedIds.length === 1 ? 'imóvel' : 'imóveis'}
              </span>
              <button
                onClick={clearSelection}
                className="text-xs sm:text-sm text-pharos-slate-500 hover:text-pharos-slate-700 underline active:scale-95 transition-all"
              >
                Limpar
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={removeSelected}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 active:scale-95 transition-all"
              >
                Remover
              </button>
            </div>
          </div>
        )}

        {/* Toolbar principal - Mobile Otimizado */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Busca - Full width em mobile */}
          <div className="flex-1 sm:max-w-md">
            <div className="relative">
              <input
                type="search"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar imóveis..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent transition-shadow"
                aria-label="Buscar imóveis favoritos"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharos-slate-500"
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
            </div>
          </div>

          {/* Contador + Controles */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            {/* Contador de resultados - Oculto em mobile pequeno */}
            <span className="text-xs sm:text-sm text-pharos-slate-500 whitespace-nowrap">
              <strong className="text-pharos-navy-900">{filteredCount}</strong>{' '}
              <span className="hidden xs:inline">{filteredCount === 1 ? 'resultado' : 'resultados'}</span>
            </span>

            {/* Controles - Compactos em mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Ordenação - Ícone apenas em mobile */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off active:scale-95 transition-all"
                  aria-label="Ordenar favoritos"
                  aria-expanded={showSortDropdown}
                  title={currentSortLabel}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <span className="hidden lg:inline truncate max-w-[100px]">{currentSortLabel}</span>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Dropdown de ordenação - Mobile Otimizado */}
                {showSortDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSortDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-pharos-slate-300 py-2 z-50 max-h-[60vh] overflow-y-auto">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSort(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`
                            w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors active:scale-[0.98]
                            ${currentQuery.sort === option.value
                              ? 'bg-pharos-blue-500 text-white font-medium'
                              : 'text-pharos-slate-700 hover:bg-pharos-base-off'
                            }
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Separador */}
              <div className="w-px h-6 sm:h-8 bg-pharos-slate-300" />

              {/* Modos de visualização - Touch friendly */}
              <div className="flex items-center bg-pharos-base-off rounded-lg p-1 border border-pharos-slate-300">
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setViewMode(mode.value)}
                    className={`
                      p-2 sm:p-2.5 rounded-md transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center
                      ${viewMode === mode.value
                        ? 'bg-white text-pharos-blue-500 shadow-sm'
                        : 'text-pharos-slate-500 hover:text-pharos-slate-700'
                      }
                    `}
                    aria-label={`Visualizar como ${mode.label}`}
                    title={mode.label}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {mode.value === 'grid' ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      )}
                    </svg>
                  </button>
                ))}
              </div>

              {/* Separador */}
              <div className="w-px h-6 sm:h-8 bg-pharos-slate-300 hidden sm:block" />

              {/* Compartilhar - Oculto em mobile pequeno */}
              {onShareClick && (
                <button
                  onClick={onShareClick}
                  className="hidden sm:flex p-2.5 text-pharos-slate-700 hover:text-pharos-blue-500 hover:bg-pharos-base-off rounded-lg transition-colors active:scale-95 min-w-[44px] min-h-[44px] items-center justify-center"
                  aria-label="Compartilhar favoritos"
                  title="Compartilhar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
              )}

              {/* Exportar PDF - Compacto em mobile */}
              {onExportClick && (
                <button
                  onClick={onExportClick}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 active:scale-95 transition-all shadow-sm min-h-[44px]"
                  aria-label="Exportar como PDF"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

