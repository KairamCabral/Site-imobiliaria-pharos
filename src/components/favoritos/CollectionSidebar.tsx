'use client';

import { useState } from 'react';
import { useFavoritos } from '@/contexts/FavoritosContext';
import type { Colecao } from '@/types';

/**
 * PHAROS - SIDEBAR DE COLEÇÕES
 * Gerenciamento de coleções de favoritos com CRUD completo
 */

export default function CollectionSidebar() {
  const {
    colecoes,
    currentQuery,
    setQuery,
    createColecao,
    updateColecao,
    deleteColecao,
    getCollectionCount,
  } = useFavoritos();

  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleCreate = () => {
    if (newCollectionName.trim()) {
      createColecao(newCollectionName.trim());
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editingName.trim() && editingName !== colecoes.find(c => c.id === id)?.name) {
      updateColecao(id, { name: editingName.trim() });
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta pasta? Os imóveis serão movidos para "Todos os favoritos".')) {
      deleteColecao(id);
      setMenuOpenId(null);
    }
  };

  const startEdit = (colecao: Colecao) => {
    setEditingId(colecao.id);
    setEditingName(colecao.name);
    setMenuOpenId(null);
  };

  return (
    <aside className="w-80 sm:w-[320px] lg:w-80 bg-pharos-base-white border-r border-pharos-slate-300 flex flex-col h-full">
      {/* Header - Mobile Otimizado */}
      <div className="p-4 sm:p-6 border-b border-pharos-slate-300">
        <h2 className="text-base sm:text-lg font-bold text-pharos-navy-900 mb-1">
          Pastas
        </h2>
        <p className="text-xs sm:text-sm text-pharos-slate-500">
          Organize seus imóveis favoritos
        </p>
      </div>

      {/* Lista de coleções - Mobile Otimizado */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <nav className="space-y-1">
          {colecoes.map((colecao) => {
            const count = getCollectionCount(colecao.id);
            const isActive = currentQuery.collectionId === colecao.id;
            const isEditing = editingId === colecao.id;

            return (
              <div key={colecao.id} className="relative group">
                {isEditing ? (
                  // Modo de edição
                  <div className="flex items-center gap-2 px-3 py-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(colecao.id);
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditingName('');
                        }
                      }}
                      onBlur={() => handleRename(colecao.id)}
                      className="flex-1 px-2 py-1 text-sm border border-pharos-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  // Modo normal
                  <div
                    className={`
                      w-full flex items-center gap-2 sm:gap-3 px-3 py-3 rounded-lg
                      transition-all duration-200 cursor-pointer active:scale-[0.98]
                      ${isActive 
                        ? 'bg-pharos-blue-500 text-white shadow-sm' 
                        : 'text-pharos-slate-700 hover:bg-pharos-base-off active:bg-pharos-slate-200'
                      }
                    `}
                    onClick={() => setQuery({ collectionId: colecao.id })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setQuery({ collectionId: colecao.id });
                      }
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Ícone */}
                    <span className="text-base sm:text-lg flex-shrink-0" aria-hidden="true">
                      {colecao.icon || '📁'}
                    </span>

                    {/* Nome */}
                    <span className="flex-1 text-left text-xs sm:text-sm font-medium truncate">
                      {colecao.name}
                    </span>

                    {/* Contador */}
                    <span
                      className={`
                        text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-pharos-slate-300 text-pharos-slate-700'
                        }
                      `}
                    >
                      {count}
                    </span>

                    {/* Menu (somente coleções personalizadas) - Sempre visível em mobile */}
                    {colecao.id !== 'default' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === colecao.id ? null : colecao.id);
                        }}
                        className={`
                          p-1.5 rounded sm:opacity-0 sm:group-hover:opacity-100 opacity-100
                          transition-opacity active:scale-90 flex-shrink-0
                          ${isActive ? 'text-white hover:bg-white/20' : 'text-pharos-slate-500 hover:bg-pharos-slate-300'}
                        `}
                        aria-label="Menu da pasta"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {/* Dropdown menu */}
                {menuOpenId === colecao.id && colecao.id !== 'default' && (
                  <div className="absolute right-3 top-full mt-1 bg-white rounded-lg shadow-lg border border-pharos-slate-300 py-1 z-50 min-w-[140px]">
                    <button
                      onClick={() => startEdit(colecao)}
                      className="w-full text-left px-4 py-2 text-sm text-pharos-slate-700 hover:bg-pharos-base-off flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Renomear
                    </button>
                    <button
                      onClick={() => handleDelete(colecao.id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Formulário de nova coleção */}
        {isCreating ? (
          <div className="mt-2 p-3 bg-pharos-base-off rounded-lg border border-pharos-slate-300">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewCollectionName('');
                }
              }}
              placeholder="Nome da pasta"
              className="w-full px-3 py-2.5 text-sm border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 mb-2 min-h-[44px]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newCollectionName.trim()}
                className="flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all min-h-[44px]"
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewCollectionName('');
                }}
                className="flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off active:scale-95 transition-all min-h-[44px]"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-medium text-pharos-blue-500 hover:bg-pharos-base-off active:bg-pharos-blue-50 rounded-lg active:scale-[0.98] transition-all border border-dashed border-pharos-slate-300 min-h-[44px]"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova pasta
          </button>
        )}
      </div>

      {/* Footer - Mobile Otimizado */}
      <div className="p-3 sm:p-4 border-t border-pharos-slate-300">
        <div className="text-xs sm:text-sm text-pharos-slate-500 text-center">
          <p>
            Total: <strong className="text-pharos-navy-900">{getCollectionCount('default')}</strong> imóveis
          </p>
        </div>
      </div>

      {/* Click fora fecha menu */}
      {menuOpenId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </aside>
  );
}

