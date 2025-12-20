'use client';

import { useState, useRef, useEffect } from 'react';
import { useFavoritos } from '@/contexts/FavoritosContext';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

/**
 * PHAROS - SELETOR DE PASTA
 * Componente para selecionar/criar pastas de favoritos
 */

interface PastaSelectorProps {
  imovelId: string;
  currentCollectionId?: string;
  onSelect?: () => void;
  triggerClassName?: string;
  triggerText?: string;
  showIcon?: boolean;
}

export default function PastaSelector({
  imovelId,
  currentCollectionId = 'default',
  onSelect,
  triggerClassName = 'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off active:scale-[0.98] transition-all min-h-[44px]',
  triggerText = 'Pasta',
  showIcon = true,
}: PastaSelectorProps) {
  const { colecoes, moveToColecao, createColecao } = useFavoritos();
  const { toasts, showToast, removeToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPastaName, setNewPastaName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowCreateForm(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleMove = async (collectionId: string) => {
    moveToColecao([imovelId], collectionId);
    
    const pastaName = colecoes.find(c => c.id === collectionId)?.name || 'Pasta';
    showToast(`Movido para "${pastaName}"`, 'success');
    
    setShowMenu(false);
    onSelect?.();
  };

  const handleCreatePasta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPastaName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newColecao = createColecao(newPastaName.trim());
      moveToColecao([imovelId], newColecao.id);
      
      showToast(`Pasta "${newPastaName}" criada`, 'success');
      
      setNewPastaName('');
      setShowCreateForm(false);
      setShowMenu(false);
      onSelect?.();
    } finally {
      setIsCreating(false);
    }
  };

  // Filtrar pastas (excluir a padrão se quiser, ou manter)
  const pastasList = colecoes.filter(c => c.id !== 'default');
  const hasPastas = pastasList.length > 0;

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão trigger */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className={triggerClassName}
        title="Mover para pasta"
      >
        {showIcon && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        )}
        {triggerText}
      </button>

      {/* Menu dropdown - Mobile Otimizado */}
      {showMenu && (
        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl border border-pharos-slate-300 z-50 min-w-[280px] sm:min-w-[240px] max-w-[320px] max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="px-4 py-2.5 sm:py-3 border-b border-pharos-slate-200 flex-shrink-0">
            <h4 className="text-sm font-semibold text-pharos-navy-900">Mover para Pasta</h4>
          </div>

          {/* Lista de pastas - Mobile Otimizado */}
          <div className="py-2 overflow-y-auto flex-1">
            {/* Pasta padrão (Todos) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMove('default');
              }}
              className={`w-full text-left px-4 py-3 text-xs sm:text-sm flex items-center gap-3 transition-colors active:scale-[0.98] min-h-[48px] ${
                currentCollectionId === 'default'
                  ? 'bg-pharos-blue-500/10 text-pharos-blue-600 font-medium'
                  : 'text-pharos-slate-700 hover:bg-pharos-base-off'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="flex-1">Todos os Favoritos</span>
              {currentCollectionId === 'default' && (
                <svg className="w-4 h-4 text-pharos-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Separador */}
            {hasPastas && <div className="my-2 border-t border-pharos-slate-200" />}

            {/* Pastas customizadas */}
            {pastasList.map((pasta) => (
              <button
                key={pasta.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMove(pasta.id);
                }}
                className={`w-full text-left px-4 py-3 text-xs sm:text-sm flex items-center gap-3 transition-colors active:scale-[0.98] min-h-[48px] ${
                  currentCollectionId === pasta.id
                    ? 'bg-pharos-blue-500/10 text-pharos-blue-600 font-medium'
                    : 'text-pharos-slate-700 hover:bg-pharos-base-off'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="flex-1 truncate">{pasta.name}</span>
                {currentCollectionId === pasta.id && (
                  <svg className="w-4 h-4 text-pharos-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}

            {/* Mensagem se não há pastas */}
            {!hasPastas && !showCreateForm && (
              <div className="px-4 py-6 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-pharos-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-sm text-pharos-slate-500 mb-1">Nenhuma pasta criada</p>
                <p className="text-xs text-pharos-slate-400">Crie uma pasta para organizar seus favoritos</p>
              </div>
            )}
          </div>

          {/* Footer: Criar nova pasta */}
          <div className="border-t border-pharos-slate-200">
            {showCreateForm ? (
              <form onSubmit={handleCreatePasta} className="p-3">
                <label htmlFor="pasta-name" className="block text-xs font-medium text-pharos-slate-700 mb-2">
                  Nome da Pasta
                </label>
                <input
                  id="pasta-name"
                  type="text"
                  value={newPastaName}
                  onChange={(e) => setNewPastaName(e.target.value)}
                  placeholder="Ex: Frente Mar, Investimento..."
                  className="w-full px-3 py-2.5 text-sm border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 mb-2 min-h-[44px]"
                  autoFocus
                  maxLength={50}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!newPastaName.trim() || isCreating}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all min-h-[44px]"
                  >
                    {isCreating ? 'Criando...' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCreateForm(false);
                      setNewPastaName('');
                    }}
                    className="px-3 py-2 text-xs font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off active:scale-95 transition-all min-h-[44px]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCreateForm(true);
                }}
                className="w-full px-4 py-3 text-xs sm:text-sm font-medium text-pharos-blue-500 hover:bg-pharos-blue-500/5 active:bg-pharos-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Pasta
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

