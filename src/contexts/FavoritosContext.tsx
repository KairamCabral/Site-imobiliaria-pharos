'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type {
  Favorito,
  Colecao,
  FavoritoTag,
  FavoritosListQuery,
  FavoritosOrdenacao,
  FavoritosViewMode,
  FavoritosFiltros,
  Imovel,
} from '@/types';
import { popularImoveisNosFavoritos, loadAPICache } from '@/utils/favoritosUtils';

/**
 * PHAROS - CONTEXTO DE FAVORITOS
 * Gerenciamento completo de favoritos com persistência local (guest)
 * e sincronização para usuários autenticados (futuro)
 */

interface FavoritosContextData {
  // Estado
  favoritos: Favorito[];
  colecoes: Colecao[];
  selectedIds: string[];
  currentQuery: FavoritosListQuery;
  viewMode: FavoritosViewMode;
  isLoading: boolean;
  
  // Favoritos
  addFavorito: (imovelId: string, collectionId?: string) => void;
  removeFavorito: (imovelId: string) => void;
  toggleFavorito: (imovelId: string) => void;
  isFavorito: (imovelId: string) => boolean;
  getFavorito: (imovelId: string) => Favorito | undefined;
  
  // Coleções
  createColecao: (name: string, icon?: string) => Colecao;
  updateColecao: (id: string, data: Partial<Colecao>) => void;
  deleteColecao: (id: string) => void;
  moveToColecao: (imovelIds: string[], collectionId: string) => void;
  
  // Anotações e Tags
  updateNotes: (imovelId: string, notes: string) => void;
  addTag: (imovelId: string, tag: FavoritoTag) => void;
  removeTag: (imovelId: string, tag: FavoritoTag) => void;
  
  // Seleção múltipla
  toggleSelection: (imovelId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Filtros e ordenação
  setQuery: (query: Partial<FavoritosListQuery>) => void;
  setViewMode: (mode: FavoritosViewMode) => void;
  setSort: (sort: FavoritosOrdenacao) => void;
  setFilters: (filters: Partial<FavoritosFiltros>) => void;
  
  // Ações em massa
  removeSelected: () => void;
  moveSelected: (collectionId: string) => void;
  tagSelected: (tag: FavoritoTag) => void;
  
  // Utilidades
  getFilteredFavoritos: () => Favorito[];
  getTotalCount: () => number;
  getCollectionCount: (collectionId: string) => number;
}

const FavoritosContext = createContext<FavoritosContextData | undefined>(undefined);

// Chaves de storage
const STORAGE_KEYS = {
  favoritos: 'pharos_favoritos',
  colecoes: 'pharos_colecoes',
  viewMode: 'pharos_favoritos_view',
  query: 'pharos_favoritos_query',
};

// Coleção padrão
const DEFAULT_COLECAO: Colecao = {
  id: 'default',
  name: 'Todos os favoritos',
  order: 0,
  createdAt: new Date().toISOString(),
  icon: '⭐',
};

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [colecoes, setColecoes] = useState<Colecao[]>([DEFAULT_COLECAO]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewModeState] = useState<FavoritosViewMode>('grid');
  const [currentQuery, setCurrentQuery] = useState<FavoritosListQuery>({
    collectionId: 'default',
    sort: 'savedAt-desc',
    view: 'grid',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage ao montar E carregar cache da API
  useEffect(() => {
    async function initializeFavoritos() {
      try {
        // Carregar cache da API primeiro
        await loadAPICache();

        const storedFavoritos = localStorage.getItem(STORAGE_KEYS.favoritos);
        const storedColecoes = localStorage.getItem(STORAGE_KEYS.colecoes);
        const storedViewMode = localStorage.getItem(STORAGE_KEYS.viewMode);
        const storedQuery = localStorage.getItem(STORAGE_KEYS.query);

        if (storedFavoritos) {
          setFavoritos(JSON.parse(storedFavoritos));
        }

        if (storedColecoes) {
          const parsed = JSON.parse(storedColecoes);
          setColecoes([DEFAULT_COLECAO, ...parsed]);
        }

        if (storedViewMode) {
          setViewModeState(storedViewMode as FavoritosViewMode);
        }

        if (storedQuery) {
          setCurrentQuery(JSON.parse(storedQuery));
        }

        // Disparar analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'fav_page_load', {
            total_favoritos: storedFavoritos ? JSON.parse(storedFavoritos).length : 0,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeFavoritos();
  }, []);

  // Persistir favoritos
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.favoritos, JSON.stringify(favoritos));
    }
  }, [favoritos, isLoading]);

  // Persistir coleções (exceto default)
  useEffect(() => {
    if (!isLoading) {
      const customColecoes = colecoes.filter(c => c.id !== 'default');
      localStorage.setItem(STORAGE_KEYS.colecoes, JSON.stringify(customColecoes));
    }
  }, [colecoes, isLoading]);

  // Persistir viewMode
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
    }
  }, [viewMode, isLoading]);

  // Persistir query
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.query, JSON.stringify(currentQuery));
    }
  }, [currentQuery, isLoading]);

  // ===== FAVORITOS =====

  const addFavorito = useCallback((imovelId: string, collectionId: string = 'default') => {
    const existing = favoritos.find(f => f.id === imovelId);
    if (existing) return;

    const novoFavorito: Favorito = {
      id: imovelId,
      savedAt: new Date().toISOString(),
      collectionId,
      order: favoritos.filter(f => f.collectionId === collectionId).length,
    };

    setFavoritos(prev => [...prev, novoFavorito]);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_add', {
        imovel_id: imovelId,
        collection_id: collectionId,
      });
    }
  }, [favoritos]);

  const removeFavorito = useCallback((imovelId: string) => {
    setFavoritos(prev => prev.filter(f => f.id !== imovelId));
    setSelectedIds(prev => prev.filter(id => id !== imovelId));

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_remove', { imovel_id: imovelId });
    }
  }, []);

  const toggleFavorito = useCallback((imovelId: string) => {
    const existing = favoritos.find(f => f.id === imovelId);
    if (existing) {
      removeFavorito(imovelId);
    } else {
      addFavorito(imovelId);
    }
  }, [favoritos, addFavorito, removeFavorito]);

  const isFavorito = useCallback((imovelId: string) => {
    return favoritos.some(f => f.id === imovelId);
  }, [favoritos]);

  const getFavorito = useCallback((imovelId: string) => {
    return favoritos.find(f => f.id === imovelId);
  }, [favoritos]);

  // ===== COLEÇÕES =====

  const createColecao = useCallback((name: string, icon?: string): Colecao => {
    const newColecao: Colecao = {
      id: `col_${Date.now()}`,
      name,
      order: colecoes.length,
      createdAt: new Date().toISOString(),
      icon,
    };

    setColecoes(prev => [...prev, newColecao]);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_collection_create', { name });
    }
    
    return newColecao;
  }, [colecoes]);

  const updateColecao = useCallback((id: string, data: Partial<Colecao>) => {
    setColecoes(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteColecao = useCallback((id: string) => {
    if (id === 'default') return;

    // Mover favoritos da coleção deletada para "default"
    setFavoritos(prev => prev.map(f => 
      f.collectionId === id ? { ...f, collectionId: 'default' } : f
    ));

    setColecoes(prev => prev.filter(c => c.id !== id));

    // Se estava vendo essa coleção, voltar para default
    if (currentQuery.collectionId === id) {
      setCurrentQuery(prev => ({ ...prev, collectionId: 'default' }));
    }

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_collection_delete', { collection_id: id });
    }
  }, [currentQuery.collectionId]);

  const moveToColecao = useCallback((imovelIds: string[], collectionId: string) => {
    setFavoritos(prev => prev.map(f => 
      imovelIds.includes(f.id) ? { ...f, collectionId } : f
    ));

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_move', {
        count: imovelIds.length,
        to_collection: collectionId,
      });
    }
  }, []);

  // ===== ANOTAÇÕES E TAGS =====

  const updateNotes = useCallback((imovelId: string, notes: string) => {
    setFavoritos(prev => prev.map(f => 
      f.id === imovelId ? { ...f, notes } : f
    ));

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_note_save', { imovel_id: imovelId });
    }
  }, []);

  const addTag = useCallback((imovelId: string, tag: FavoritoTag) => {
    setFavoritos(prev => prev.map(f => {
      if (f.id === imovelId) {
        const tags = f.tags || [];
        if (!tags.includes(tag)) {
          return { ...f, tags: [...tags, tag] };
        }
      }
      return f;
    }));

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_tag_apply', { tag });
    }
  }, []);

  const removeTag = useCallback((imovelId: string, tag: FavoritoTag) => {
    setFavoritos(prev => prev.map(f => {
      if (f.id === imovelId && f.tags) {
        return { ...f, tags: f.tags.filter(t => t !== tag) };
      }
      return f;
    }));

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_tag_remove', { tag });
    }
  }, []);

  // ===== SELEÇÃO MÚLTIPLA =====

  const toggleSelection = useCallback((imovelId: string) => {
    setSelectedIds(prev => 
      prev.includes(imovelId) 
        ? prev.filter(id => id !== imovelId)
        : [...prev, imovelId]
    );
  }, []);

  const selectAll = useCallback(() => {
    const filtered = getFilteredFavoritos();
    setSelectedIds(filtered.map(f => f.id));
  }, [favoritos, currentQuery]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // ===== FILTROS E ORDENAÇÃO =====

  const setQuery = useCallback((query: Partial<FavoritosListQuery>) => {
    setCurrentQuery(prev => ({ ...prev, ...query }));
  }, []);

  const setViewMode = useCallback((mode: FavoritosViewMode) => {
    setViewModeState(mode);
    setCurrentQuery(prev => ({ ...prev, view: mode }));

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_view_change', { view: mode });
    }
  }, []);

  const setSort = useCallback((sort: FavoritosOrdenacao) => {
    setCurrentQuery(prev => ({ ...prev, sort }));

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_sort_change', { sort });
    }
  }, []);

  const setFilters = useCallback((filters: Partial<FavoritosFiltros>) => {
    setCurrentQuery(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, ...filters } 
    }));

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_filter_apply');
    }
  }, []);

  // ===== AÇÕES EM MASSA =====

  const removeSelected = useCallback(() => {
    setFavoritos(prev => prev.filter(f => !selectedIds.includes(f.id)));
    setSelectedIds([]);
  }, [selectedIds]);

  const moveSelected = useCallback((collectionId: string) => {
    moveToColecao(selectedIds, collectionId);
    setSelectedIds([]);
  }, [selectedIds, moveToColecao]);

  const tagSelected = useCallback((tag: FavoritoTag) => {
    selectedIds.forEach(id => addTag(id, tag));
    setSelectedIds([]);
  }, [selectedIds, addTag]);

  // ===== UTILIDADES =====

  const getFilteredFavoritos = useCallback(() => {
    // Popular os dados dos imóveis primeiro
    let filtered = popularImoveisNosFavoritos([...favoritos]);

    // Filtrar por coleção
    if (currentQuery.collectionId && currentQuery.collectionId !== 'default') {
      filtered = filtered.filter(f => f.collectionId === currentQuery.collectionId);
    }

    // Busca textual (precisa popular imovel para funcionar corretamente)
    if (currentQuery.q && currentQuery.q.trim()) {
      const q = currentQuery.q.toLowerCase();
      filtered = filtered.filter(f => {
        if (f.imovel) {
          return (
            f.imovel.titulo.toLowerCase().includes(q) ||
            f.imovel.endereco?.bairro?.toLowerCase().includes(q) ||
            f.imovel.codigo?.toLowerCase().includes(q) ||
            f.notes?.toLowerCase().includes(q)
          );
        }
        return false;
      });
    }

    // Aplicar filtros
    if (currentQuery.filters) {
      const filters = currentQuery.filters;

      if (filters.city?.length) {
        filtered = filtered.filter(f => 
          f.imovel && f.imovel.endereco?.cidade && filters.city!.includes(f.imovel.endereco.cidade)
        );
      }

      if (filters.bairro?.length) {
        filtered = filtered.filter(f => 
          f.imovel && f.imovel.endereco?.bairro && filters.bairro!.includes(f.imovel.endereco.bairro)
        );
      }

      if (filters.type?.length) {
        filtered = filtered.filter(f => 
          f.imovel && filters.type!.includes(f.imovel.tipo)
        );
      }

      if (filters.status?.length) {
        filtered = filtered.filter(f => 
          f.imovel && filters.status!.includes(f.imovel.status)
        );
      }

      if (filters.priceMin !== undefined) {
        filtered = filtered.filter(f => 
          f.imovel && f.imovel.preco >= filters.priceMin!
        );
      }

      if (filters.priceMax !== undefined) {
        filtered = filtered.filter(f => 
          f.imovel && f.imovel.preco <= filters.priceMax!
        );
      }

      if (filters.areaMin !== undefined) {
        filtered = filtered.filter(f => 
          f.imovel && f.imovel.areaTotal >= filters.areaMin!
        );
      }

      if (filters.areaMax !== undefined) {
        filtered = filtered.filter(f => 
          f.imovel && f.imovel.areaTotal <= filters.areaMax!
        );
      }

      if (filters.tags?.length) {
        filtered = filtered.filter(f => 
          f.tags && filters.tags!.some(tag => f.tags!.includes(tag))
        );
      }
    }

    // Ordenar
    if (currentQuery.sort) {
      switch (currentQuery.sort) {
        case 'savedAt-desc':
          filtered.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
          break;
        case 'savedAt-asc':
          filtered.sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());
          break;
        case 'price-asc':
          filtered.sort((a, b) => (a.imovel?.preco || 0) - (b.imovel?.preco || 0));
          break;
        case 'price-desc':
          filtered.sort((a, b) => (b.imovel?.preco || 0) - (a.imovel?.preco || 0));
          break;
        case 'area-asc':
          filtered.sort((a, b) => (a.imovel?.areaTotal || 0) - (b.imovel?.areaTotal || 0));
          break;
        case 'area-desc':
          filtered.sort((a, b) => (b.imovel?.areaTotal || 0) - (a.imovel?.areaTotal || 0));
          break;
        case 'relevance':
          filtered.sort((a, b) => {
            const dateA = new Date(a.imovel?.updatedAt || a.savedAt).getTime();
            const dateB = new Date(b.imovel?.updatedAt || b.savedAt).getTime();
            return dateB - dateA;
          });
          break;
      }
    }

    return filtered;
  }, [favoritos, currentQuery]);

  const getTotalCount = useCallback(() => favoritos.length, [favoritos]);

  const getCollectionCount = useCallback((collectionId: string) => {
    if (collectionId === 'default') return favoritos.length;
    return favoritos.filter(f => f.collectionId === collectionId).length;
  }, [favoritos]);

  const value = useMemo(() => ({
    favoritos,
    colecoes,
    selectedIds,
    currentQuery,
    viewMode,
    isLoading,
    addFavorito,
    removeFavorito,
    toggleFavorito,
    isFavorito,
    getFavorito,
    createColecao,
    updateColecao,
    deleteColecao,
    moveToColecao,
    updateNotes,
    addTag,
    removeTag,
    toggleSelection,
    selectAll,
    clearSelection,
    setQuery,
    setViewMode,
    setSort,
    setFilters,
    removeSelected,
    moveSelected,
    tagSelected,
    getFilteredFavoritos,
    getTotalCount,
    getCollectionCount,
  }), [
    favoritos,
    colecoes,
    selectedIds,
    currentQuery,
    viewMode,
    isLoading,
    addFavorito,
    removeFavorito,
    toggleFavorito,
    isFavorito,
    getFavorito,
    createColecao,
    updateColecao,
    deleteColecao,
    moveToColecao,
    updateNotes,
    addTag,
    removeTag,
    toggleSelection,
    selectAll,
    clearSelection,
    setQuery,
    setViewMode,
    setSort,
    setFilters,
    removeSelected,
    moveSelected,
    tagSelected,
    getFilteredFavoritos,
    getTotalCount,
    getCollectionCount,
  ]);

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (context === undefined) {
    throw new Error('useFavoritos deve ser usado dentro de FavoritosProvider');
  }
  return context;
}

