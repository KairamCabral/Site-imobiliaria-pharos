import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type { Empreendimento } from '@/types';

export type StatusFilter = 'todos' | 'pre-lancamento' | 'lancamento' | 'em-construcao' | 'pronto' | 'entregue';
export type SortOption = 'relevancia' | 'lancamento' | 'preco-asc' | 'preco-desc' | 'nome';

type FilterOptions = {
  initialSearch?: string;
  initialStatus?: StatusFilter;
  initialSort?: SortOption;
};

export function useEmpreendimentosFilter(
  empreendimentos: Empreendimento[],
  options: FilterOptions = {}
) {
  const [searchQuery, setSearchQuery] = useState(options.initialSearch || '');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(options.initialStatus || 'todos');
  const [sortBy, setSortBy] = useState<SortOption>(options.initialSort || 'relevancia');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredAndSorted = useMemo(() => {
    let result = [...empreendimentos];

    // Filtro por busca
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(emp =>
        emp.nome.toLowerCase().includes(query) ||
        emp.endereco?.bairro?.toLowerCase().includes(query) ||
        emp.endereco?.cidade?.toLowerCase().includes(query) ||
        emp.construtora?.toLowerCase().includes(query)
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      result = result.filter(emp => emp.status === statusFilter);
    }

    // Ordenação
    switch (sortBy) {
      case 'lancamento':
        result.sort((a, b) => {
          const order = { 'pre-lancamento': 0, 'lancamento': 1, 'em-construcao': 2, 'pronto': 3, 'entregue': 4 };
          return (order[a.status as keyof typeof order] || 999) - (order[b.status as keyof typeof order] || 999);
        });
        break;
      case 'preco-asc':
        result.sort((a, b) => (a.precoDesde || 0) - (b.precoDesde || 0));
        break;
      case 'preco-desc':
        result.sort((a, b) => (b.precoDesde || 0) - (a.precoDesde || 0));
        break;
      case 'nome':
        result.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      default:
        // relevancia - mantém ordem original
        break;
    }

    return result;
  }, [empreendimentos, debouncedSearch, statusFilter, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredEmpreendimentos: filteredAndSorted,
  };
}

