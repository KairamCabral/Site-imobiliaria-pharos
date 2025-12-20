'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { 
  ChevronRight, 
  Home as HomeIcon,
  X,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Calendar,
  Waves,
  MapPin,
  List,
  Map as MapIcon,
  Loader2,
} from 'lucide-react';
import PropertyCardHorizontal from '@/components/PropertyCardHorizontal';
import FiltersSidebar from '@/components/FiltersSidebar';
import BottomSheet from '@/components/map/BottomSheet';

// Lazy load do mapa (componente pesado, não necessário no primeiro render)
const MapView = dynamic(() => import('@/components/map/MapViewWrapper'), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
      <div className="text-center space-y-3">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
        <p className="text-gray-600 font-medium">Carregando mapa...</p>
        <p className="text-gray-400 text-sm">Preparando visualização de imóveis</p>
      </div>
    </div>
  ),
  ssr: false, // Mapa não precisa SSR
});
import { EmptyState } from '@/components/EmptyState';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import { generateBreadcrumbSchema } from '@/utils/structuredData';
import { buildPropertySearchParams } from '@/utils/propertySearchParams';
import { AnimatedSection } from '@/components/AnimatedSection';
import { PROPERTY_TYPE_OPTIONS } from '@/constants/filterOptions';
import type { Imovel as ImovelType } from '@/types';
import { LazySection } from '@/components/LazySection';
import { useGeocodedProperties } from '@/hooks/useGeocodedProperties';

// ============================================
// INTERFACES E TIPOS
// ============================================

interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  slug: string;
  endereco: string;
  cidade: string;
  bairro: string;
  empreendimento?: string;
  empreendimentoNome?: string;
  preco: number;
  precoAntigo?: number;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  area: number;
  imagens: string[];
  tipoImovel: string;
  status: string;
  destaque?: boolean;
  featured?: boolean;
  caracteristicas?: string[];
  caracteristicasImovel?: string[];
  caracteristicasLocalizacao?: string[];
  caracteristicasEmpreendimento?: string[];
  distanciaMar?: number;
  distancia_mar_m?: number;
  entrega_prevista?: string;
  updatedAt?: string;
  createdAt?: string;
  caracImovel?: string[];
  caracLocalizacao?: string[];
  caracEmpreendimento?: string[];
  condominio?: number;
  iptu?: number;
  lancamento?: boolean;
  vistaParaMar?: boolean;
  mobiliado?: boolean;
  // Propriedades de priorização
  exclusivo?: boolean;
  temPlaca?: boolean;
  superDestaque?: boolean;
  destaqueWeb?: boolean;
}

export interface FiltrosState {
  localizacao: string[];
  bairros: string[];
  tipos: string[];
  status: string[];
  precoMin: string;
  precoMax: string;
  areaMin: string;
  areaMax: string;
  quartos: string;
  suites: string;
  banheiros: string;
  vagas: string;
  codigoImovel: string;
  empreendimento: string;
  caracteristicasImovel: string[];
  caracteristicasLocalizacao: string[];
  caracteristicasEmpreendimento: string[];
  apenasExclusivos: boolean;
}

export type OrdenacaoType = 
  | 'relevancia'
  | 'preco-asc'
  | 'preco-desc'
  | 'distancia-mar-asc'
  | 'distancia-mar-desc'
  | 'prazo-entrega-asc'
  | 'prazo-entrega-desc'
  | 'mais-recentes';

type CacheLayer = 'memory' | 'redis' | 'origin';

export type ImoveisClientProps = {
  initialData: ImovelType[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialCacheLayer: CacheLayer;
  initialFetchedAt: number | null;
  initialFilters?: Partial<FiltrosState>;
  initialOrdenacao?: OrdenacaoType;
};

const DISABLED_SORTS = new Set<OrdenacaoType>(['distancia-mar-asc', 'distancia-mar-desc']);

function createFiltersState(overrides?: Partial<FiltrosState>): FiltrosState {
  return {
    localizacao: [...(overrides?.localizacao ?? [])],
    bairros: [...(overrides?.bairros ?? [])],
    tipos: [...(overrides?.tipos ?? [])],
    status: [...(overrides?.status ?? [])],
    precoMin: overrides?.precoMin ?? '',
    precoMax: overrides?.precoMax ?? '',
    areaMin: overrides?.areaMin ?? '',
    areaMax: overrides?.areaMax ?? '',
    quartos: overrides?.quartos ?? '',
    suites: overrides?.suites ?? '',
    banheiros: overrides?.banheiros ?? '',
    vagas: overrides?.vagas ?? '',
    codigoImovel: overrides?.codigoImovel ?? '',
    empreendimento: overrides?.empreendimento ?? '',
    caracteristicasImovel: [...(overrides?.caracteristicasImovel ?? [])],
    caracteristicasLocalizacao: [...(overrides?.caracteristicasLocalizacao ?? [])],
    caracteristicasEmpreendimento: [...(overrides?.caracteristicasEmpreendimento ?? [])],
    apenasExclusivos: overrides?.apenasExclusivos ?? false,
  };
}

// ============================================
// DADOS MOCKADOS (temporário - será substituído pela API)
// ============================================

const INITIAL_PAGE_SIZE = 24;
const SUBSEQUENT_PAGE_SIZE = 16;
const MAX_CLIENT_RESULTS = 400;

// ============================================
// HOOK DE DEBOUNCE
// ============================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ImoveisClient({
  initialData,
  initialPagination,
  initialCacheLayer,
  initialFetchedAt,
  initialFilters,
  initialOrdenacao = 'relevancia',
}: ImoveisClientProps) {
  const searchParams = useSearchParams()!;
  const [isMounted, setIsMounted] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const initialFiltersState = useMemo(() => createFiltersState(initialFilters), [initialFilters]);

  const [filtros, setFiltros] = useState<FiltrosState>(initialFiltersState);
  const [todosImoveis, setTodosImoveis] = useState<ImovelType[]>(initialData);
  const [apiError, setApiError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPagination?.page ?? 1);
  const [totalAvailable, setTotalAvailable] = useState(initialPagination?.total ?? initialData.length);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages ?? (initialData.length > 0 ? 1 : 0));
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(initialData.length === 0);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoType>(initialOrdenacao);
  const [showSortDesktop, setShowSortDesktop] = useState(false);
  const sortDesktopRef = useRef<HTMLDivElement | null>(null);
  const initialFetchedAtIso = useMemo(
    () => (initialFetchedAt ? new Date(initialFetchedAt).toISOString() : undefined),
    [initialFetchedAt],
  );
  const initialHydrationRef = useRef(initialData.length > 0);
  const initialPaginationRef = useRef(initialPagination);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [showSort, setShowSort] = useState(false);

  // Detecta se há algum filtro aplicado para regras especiais de ordenação
  const hasFiltersActive = useMemo(() => {
    let count = 0;
    count += filtros.localizacao.length;
    count += filtros.bairros.length;
    count += filtros.tipos.length;
    count += filtros.status.length;
    if (filtros.precoMin) count++;
    if (filtros.precoMax) count++;
    if (filtros.areaMin) count++;
    if (filtros.areaMax) count++;
    if (filtros.quartos) count++;
    if (filtros.suites) count++;
    if (filtros.banheiros) count++;
    if (filtros.vagas) count++;
    if (filtros.codigoImovel) count++;
    if (filtros.empreendimento) count++;
    count += filtros.caracteristicasImovel.length;
    count += filtros.caracteristicasLocalizacao.length;
    count += filtros.caracteristicasEmpreendimento.length;
    if (filtros.apenasExclusivos) count++;
    return count > 0;
  }, [filtros]);
  // Deduplica por id para evitar itens duplicados e chaves repetidas
  const dedupeById = useCallback(<T extends { id: any }>(items: T[]): T[] => {
    const seen = new Set<string>();
    const norm = (v: any) => String(v ?? '').trim().toLowerCase();
    const out: T[] = [];
    for (const it of items) {
      const key = norm((it as any)?.id);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  }, []);

  // Mapeia a ordenação de UI para sort da API
  const toApiSort = useCallback((ord: OrdenacaoType): { sortBy: string; sortOrder: 'asc' | 'desc' } => {
    switch (ord) {
      case 'preco-asc':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'preco-desc':
        return { sortBy: 'price', sortOrder: 'desc' };
      case 'mais-recentes':
        return { sortBy: 'updatedAt', sortOrder: 'desc' };
      case 'prazo-entrega-asc':
      case 'prazo-entrega-desc':
        // Ordenação por prazo é aplicada no client; no backend mantemos updatedAt para desempenho
        return { sortBy: 'updatedAt', sortOrder: 'desc' };
      case 'distancia-mar-asc':
        return { sortBy: 'distanceToSea', sortOrder: 'asc' };
      case 'distancia-mar-desc':
        return { sortBy: 'distanceToSea', sortOrder: 'desc' };
      default:
        return { sortBy: 'updatedAt', sortOrder: 'desc' };
    }
  }, []);

  const ordenacaoLabel = useMemo(() => {
    const map: Record<OrdenacaoType, string> = {
      'relevancia': 'Relevância',
      'preco-asc': 'Menor Preço',
      'preco-desc': 'Maior Preço',
      'distancia-mar-asc': 'Menor Distância do Mar',
      'distancia-mar-desc': 'Maior Distância do Mar',
      'prazo-entrega-asc': 'Prazo de Entrega ↑',
      'prazo-entrega-desc': 'Prazo de Entrega ↓',
      'mais-recentes': 'Mais Recentes',
    };
    return map[ordenacao] ?? 'Relevância';
  }, [ordenacao]);

  // Sanitizar ordenação quando opção estiver desabilitada (ex.: distância do mar)
  useEffect(() => {
    if (DISABLED_SORTS.has(ordenacao)) {
      setOrdenacao('mais-recentes');
    }
  }, [ordenacao]);
  
  // Fechar dropdown de ordenação desktop ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showSortDesktop && sortDesktopRef.current && !sortDesktopRef.current.contains(event.target as Node)) {
        setShowSortDesktop(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDesktop]);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list'); // Modo de visualização
  const requiresDeepScan = useMemo(() => {
    const empreendimentoTerm = filtros.empreendimento?.trim();
    const codigoTerm = filtros.codigoImovel?.trim();
    return Boolean(empreendimentoTerm || codigoTerm);
  }, [filtros.empreendimento, filtros.codigoImovel]);
  
  // Debounce para valores numéricos (necessários antes das requisições)
  const debouncedPrecoMin = useDebounce(filtros.precoMin, 300);
  const debouncedPrecoMax = useDebounce(filtros.precoMax, 300);
  const debouncedAreaMin = useDebounce(filtros.areaMin, 300);
  const debouncedAreaMax = useDebounce(filtros.areaMax, 300);

  // Inicializar filtros a partir da URL (tipo/tipoImovel/status)
  useEffect(() => {
    const tipoImovel = searchParams.get('tipoImovel') || searchParams.get('type') || '';
    const statusUrl = searchParams.get('status') || '';
    const minPriceUrl = searchParams.get('minPrice') || '';
    const maxPriceUrl = searchParams.get('maxPrice') || '';
    const isExclusiveUrl = searchParams.get('isExclusive') || '';
    const sanitizeNumber = (value: string) => value.replace(/\D/g, '');

    const novos: Partial<FiltrosState> = {};
    if (tipoImovel) {
      novos.tipos = [tipoImovel.toLowerCase()];
    }
    if (statusUrl) {
      novos.status = [statusUrl.toLowerCase()];
    }
    if (isExclusiveUrl) {
      const normalizedExclusive = isExclusiveUrl.toLowerCase();
      if (['1', 'true', 'sim', 'yes'].includes(normalizedExclusive)) {
        novos.apenasExclusivos = true;
      }
    }
    if (minPriceUrl) {
      const sanitized = sanitizeNumber(minPriceUrl);
      if (sanitized) novos.precoMin = sanitized;
    }
    if (maxPriceUrl) {
      const sanitized = sanitizeNumber(maxPriceUrl);
      if (sanitized) novos.precoMax = sanitized;
    }
    if (Object.keys(novos).length > 0) {
      setFiltros(prev => ({ ...prev, ...novos } as FiltrosState));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar imóveis da API (append para infinite scroll)
  useEffect(() => {
    if (page === 1 && initialHydrationRef.current) {
      setIsLoading(false);
      setIsFetchingMore(false);
      setTotalAvailable(initialPaginationRef.current?.total ?? initialData.length);
      setTotalPages(initialPaginationRef.current?.totalPages ?? (initialData.length > 0 ? 1 : 0));
      initialHydrationRef.current = false;
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function carregarImoveis() {
      const isFirstPage = page === 1;
      const baseLimit = isFirstPage ? INITIAL_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE;
      const effectiveLimit = requiresDeepScan ? MAX_CLIENT_RESULTS : baseLimit;

      try {
        if (isFirstPage) {
          setIsLoading(true);
          setIsFetchingMore(false);
        } else {
          setIsFetchingMore(true);
        }

        setApiError(null);

        const params = buildPropertySearchParams({
          citySlugs: filtros.localizacao,
          neighborhoods: filtros.bairros,
          types: filtros.tipos,
          status: filtros.status,
          priceMin: debouncedPrecoMin,
          priceMax: debouncedPrecoMax,
          areaMin: debouncedAreaMin,
          areaMax: debouncedAreaMax,
          bedroomsMin: filtros.quartos,
          suitesMin: filtros.suites,
          parkingMin: filtros.vagas,
          bedroomsExact: (filtros as any).quartosExatos,
          bedroomsFourPlus: (filtros as any).quartos4Plus,
          suitesExact: (filtros as any).suitesExatos,
          suitesFourPlus: (filtros as any).suites4Plus,
          parkingExact: (filtros as any).vagasExatos,
          parkingFourPlus: (filtros as any).vagas4Plus,
          propertyCode: filtros.codigoImovel,
          buildingName: filtros.empreendimento,
          propertyFeatures: filtros.caracteristicasImovel,
          locationFeatures: filtros.caracteristicasLocalizacao,
          buildingFeatures: filtros.caracteristicasEmpreendimento,
          isExclusive: filtros.apenasExclusivos,
        }, {
          pagination: {
            page,
            limit: effectiveLimit,
          },
          // Envia a ordenação escolhida para que o backend já traga a ordem correta
          // (distância do mar e prazo de entrega continuam sendo ordenados no client)
          sort: toApiSort(ordenacao),
        });

        const response = await fetch(`/api/properties?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Erro ao carregar imóveis (status ${response.status})`);
        }

        const data = await response.json();
        if (!isActive) return;

        if (data.success) {
          // DEBUG: Verificar características dos primeiros 3 imóveis
          const primeiros3 = (data.data || []).slice(0, 3).map((im: any) => ({
            id: im.id,
            tipo: im.tipo,
            statusObra: im.statusObra,
            caracteristicasImovel: im.caracteristicasImovel,
            caracteristicasLocalizacao: im.caracteristicasLocalizacao,
          }));

          setTodosImoveis((prev: ImovelType[]) => {
            const incoming = Array.isArray(data.data) ? data.data : [];
            return dedupeById(isFirstPage ? incoming : [...prev, ...incoming]);
          });

          const apiPagination = data.pagination || {};
          const apiTotal = typeof apiPagination.total === 'number' ? apiPagination.total : undefined;
          const apiTotalPages = typeof apiPagination.totalPages === 'number' ? apiPagination.totalPages : undefined;

          if (typeof apiTotal === 'number') {
            setTotalAvailable(apiTotal);
          } else if (isFirstPage) {
            const currentBatch = Array.isArray(data.data) ? data.data.length : 0;
            setTotalAvailable(currentBatch);
          }

          setTotalPages((prev) => {
            if (typeof apiTotalPages === 'number') return apiTotalPages;
            if (typeof apiTotal === 'number') {
              return Math.max(1, Math.ceil(apiTotal / effectiveLimit));
            }
            if (isFirstPage) {
              const currentBatch = Array.isArray(data.data) ? data.data.length : 0;
              return currentBatch > 0 ? 1 : 0;
            }
            return prev;
          });
        } else {
          setApiError(data.error || 'Erro ao carregar imóveis');
          if (isFirstPage) {
            setTodosImoveis([]);
          }
        }
      } catch (error) {
        if (controller.signal.aborted || (error as DOMException)?.name === 'AbortError') return;
        console.error('Erro ao carregar imóveis:', error);
        setApiError('Erro ao conectar com o servidor');
        if (page === 1) {
          setTodosImoveis([]);
        }
      } finally {
        if (!isActive) return;
        if (page === 1) {
          setIsLoading(false);
        } else {
          setIsFetchingMore(false);
        }
      }
    }

    // Suprime AbortError globalmente para este componente
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'AbortError' || 
          event.reason?.message?.includes('aborted') ||
          event.reason?.message?.includes('signal is aborted')) {
        event.preventDefault();
        // Silencia completamente o erro no console
        return;
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    carregarImoveis().catch((err) => {
      // Captura final para qualquer erro não tratado na promise
      if (err?.name !== 'AbortError') {
        console.error('Erro não tratado:', err);
      }
    });

    return () => {
      isActive = false;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      // Não lança erro mesmo se já foi abortado
      try {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      } catch (abortError) {
        if ((abortError as DOMException)?.name !== 'AbortError') {
          console.error('Erro ao abortar requisição:', abortError);
        }
      }
    };
  }, [
    page,
    initialData.length,
    filtros.bairros,
    filtros.tipos,
    filtros.quartos,
    filtros.suites,
    filtros.status,
    filtros.codigoImovel,
    filtros.empreendimento,
    filtros.caracteristicasImovel,
    filtros.caracteristicasLocalizacao,
    filtros.caracteristicasEmpreendimento,
    filtros.localizacao,
    filtros.apenasExclusivos,
    (filtros as any).quartosExatos,
    (filtros as any).quartos4Plus,
    (filtros as any).suitesExatos,
    (filtros as any).suites4Plus,
    (filtros as any).vagasExatos,
    (filtros as any).vagas4Plus,
    debouncedPrecoMin,
    debouncedPrecoMax,
    debouncedAreaMin,
    debouncedAreaMax,
    ordenacao,
    requiresDeepScan,
  ]);

  // Infinite scroll
  const canLoadMore = useMemo(() => {
    if (requiresDeepScan) return false;
    if (isLoading || isFetchingMore) return false;
    const notReachedMax = todosImoveis.length < MAX_CLIENT_RESULTS;
    if (!notReachedMax) return false;

    if (totalPages > 0) {
      return page < totalPages;
    }

    if (totalAvailable > 0) {
      return todosImoveis.length < totalAvailable;
    }

    return true;
  }, [requiresDeepScan, isLoading, isFetchingMore, todosImoveis.length, totalAvailable, totalPages, page]);

  // Considera se já carregamos tudo (para controlar o rodapé “fim da lista”)
  const allLoaded = useMemo(() => {
    if (isLoading) return false;
    if (totalPages > 0) {
      return page >= totalPages;
    }
    if (totalAvailable > 0) {
      return todosImoveis.length >= totalAvailable;
    }
    return false;
  }, [isLoading, page, totalPages, totalAvailable, todosImoveis.length]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && canLoadMore) {
        setPage((prev) => prev + 1);
      }
    }, { root: null, rootMargin: '200px', threshold: 0 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [canLoadMore]);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Bloquear scroll quando modal mobile aberto
  useEffect(() => {
    if (showMobileFilters) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [showMobileFilters]);

  // Filtrar e ordenar imóveis
  // Helper para adaptar campos da API para formato esperado pelos componentes
  const adaptarImovel = (imovel: ImovelType): Imovel => {
    const rawEmpreendimento = imovel.empreendimento;
    const nomeEmpreendimento =
      (typeof rawEmpreendimento === 'string'
        ? rawEmpreendimento
        : rawEmpreendimento?.nome) ||
      imovel.empreendimentoNome;
    const entregaPrevista =
      typeof rawEmpreendimento === 'object' && rawEmpreendimento
        ? rawEmpreendimento.dataPrevisaoEntrega ||
          rawEmpreendimento.dataEntrega ||
          undefined
        : undefined;

    return {
      id: imovel.id,
      codigo: imovel.codigo || imovel.id,
      titulo: imovel.titulo,
      slug: imovel.slug,
      // ✅ CORRIGIDO: Usar campos corretos do tipo ImovelType
      endereco: `${imovel.endereco?.rua || ''}, ${imovel.endereco?.numero || ''}`.trim() || 'Endereço não disponível',
      cidade: (imovel.endereco?.cidade || '').toLowerCase().replace(/\s+/g, '-'),
      bairro: imovel.endereco?.bairro || '',
      preco: imovel.preco,
      precoAntigo: undefined,
      quartos: imovel.quartos,
      suites: imovel.suites,
      banheiros: imovel.banheiros,
      // ✅ CORRIGIDO: "vagasGaragem" é o campo correto do tipo ImovelType
      vagas: imovel.vagasGaragem || 0,
      area: imovel.areaTotal || imovel.areaPrivativa || 0,
      // ✅ CORRIGIDO: "galeria" é o campo correto do tipo ImovelType
      imagens: imovel.galeria || [],
      tipoImovel: imovel.tipo,
      status: imovel.status,
      destaque: imovel.destaque,
      featured: imovel.destaque,
      distanciaMar: imovel.distancia_mar_m ?? imovel.distanciaMar,
      distancia_mar_m: imovel.distancia_mar_m ?? imovel.distanciaMar,
      updatedAt: imovel.updatedAt,
      createdAt: imovel.createdAt,
      condominio: imovel.precoCondominio,
      iptu: imovel.iptu,
      vistaParaMar: imovel.vistaParaMar,
      mobiliado: imovel.mobiliado,
      caracteristicas: imovel.caracteristicas || [],
      caracteristicasImovel: imovel.caracteristicasImovel || [],
      caracteristicasLocalizacao: imovel.caracteristicasLocalizacao || [],
      caracImovel: imovel.caracteristicas || [],
      caracLocalizacao: imovel.caracteristicasLocalizacao || [],
      caracEmpreendimento: imovel.caracteristicasEmpreendimento || [],
      empreendimento: nomeEmpreendimento,
      empreendimentoNome: nomeEmpreendimento,
      entrega_prevista: entregaPrevista,
      lancamento: imovel.lancamento,
      // Flags de destaque/placa/exclusivo já estão mapeadas corretamente
    };
  };

  const imoveisFiltrados = useMemo(() => {
    // Adaptar todos os imóveis da API para o formato esperado
    let resultado = todosImoveis.map(adaptarImovel);
    const totalAntesFiltros = resultado.length;

    const normalize = (valor: string) => String(valor)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // ✅ Filtragem client-side para faixas numéricas e outros filtros
    // ========================================
    // FILTROS CLIENT-SIDE
    // ========================================
    // NOTA: A maioria dos filtros JÁ foi aplicada pela API Vista no backend.
    // Aqui mantemos apenas filtros que precisam de lógica especial client-side
    // ou que são usados para refinamento adicional (como debounced values).
    // ========================================

    // NOTA: Os filtros de características JÁ estão sendo aplicados na API Vista
    // Não precisam de filtragem client-side adicional, pois a API já retorna filtrado
    // Se aplicássemos aqui também, estaríamos duplicando a lógica
    
    // Bairro (reforço client-side): alguns ambientes Vista não filtram corretamente por Bairro.
    // Mantemos o filtro server-side e reforçamos aqui para garantir a experiência.
    if (filtros.bairros && filtros.bairros.length > 0) {
      const mapSlugToLabel: Record<string, string> = {
        'centro': 'Centro',
        'barra-sul': 'Barra Sul',
        'barra-norte': 'Barra Norte',
        // "Pioneiros" na prática é Bairro Comercial "Barra Norte"; tratar como sinônimo
        'pioneiros': 'Barra Norte',
        'nacoes': 'Nações',
        'nações': 'Nações',
        'praia-brava': 'Praia Brava',
        'fazenda': 'Fazenda',
      };
      const labels = filtros.bairros.map(b => mapSlugToLabel[b] || b).map(x => String(x).toLowerCase());
      // Comparar contra bairro comercial (quando mapeado no adapter o neighborhood já preferiu BairroComercial)
      resultado = resultado.filter(im => labels.includes(String(im.bairro || '').toLowerCase()));
    }

    // Tipo de imóvel (reforço client-side)
    // Como o Vista agora filtra corretamente por Categoria, não precisamos mais de lógica client-side
    // O filtro já foi aplicado no servidor via VistaProvider
    if (filtros.tipos && filtros.tipos.length > 0) {
      const allowedTypes = new Set(
        PROPERTY_TYPE_OPTIONS.map(option => option.id.toLowerCase())
      );
      const selectedValid = filtros.tipos
        .map((t) => String(t).toLowerCase())
        .filter((t) => allowedTypes.has(t));

      if (selectedValid.length > 0) {
        const selected = new Set<string>(selectedValid);
        resultado = resultado.filter((imovel) => {
          const tipoImovel = String(imovel.tipoImovel || '').toLowerCase();
          return selected.has(tipoImovel);
        });
      }
    }

    if (filtros.codigoImovel) {
      const termoCodigo = normalize(filtros.codigoImovel);
      resultado = resultado.filter((imovel) => {
        const codigos = [imovel.codigo, imovel.id];
        return codigos.some((codigo) => normalize(codigo || '').includes(termoCodigo));
      });
    }

    // Empreendimento (fallback client-side para buscas textuais)
    if (filtros.empreendimento && filtros.empreendimento.trim().length > 0) {
      const termo = normalize(filtros.empreendimento);
      resultado = resultado.filter((imovel) => {
        const candidatos = [
          imovel.empreendimento,
          imovel.empreendimentoNome,
          (imovel as any).buildingName,
          imovel.titulo,
          imovel.codigo,
          imovel.id,
          imovel.bairro,
        ];
        return candidatos.some((valor) => normalize(valor || '').includes(termo));
      });
    }

    // ✅ REMOVIDO: Filtros client-side de características
    // Agora os filtros de características são aplicados diretamente na API Vista/Dual
    // Isso garante:
    // 1. Melhor performance (menos dados trafegados)
    // 2. Contagem correta de imóveis (totalAvailable reflete a API)
    // 3. Paginação funciona corretamente
    // 4. Imóveis DWV são automaticamente excluídos quando há filtros de características (no DualProvider)
    
    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
            if (Array.isArray(filtros.caracteristicasImovel) && filtros.caracteristicasImovel.length > 0) {
        console.log('[ImoveisClient] ✅ Filtro de características do imóvel aplicado na API');
      }
      if (filtros.caracteristicasLocalizacao.length > 0) {
        console.log('[ImoveisClient] ✅ Filtro de características da localização aplicado na API');
      }
      if (filtros.caracteristicasEmpreendimento.length > 0) {
        console.log('[ImoveisClient] ✅ Filtro de características do empreendimento aplicado na API');
      }
    }

    // Aplicar ordenação
    switch (ordenacao) {
      case 'preco-asc':
        resultado.sort((a, b) => a.preco - b.preco);
        break;
      case 'preco-desc':
        resultado.sort((a, b) => b.preco - a.preco);
        break;
      case 'distancia-mar-asc':
        resultado.sort((a, b) => {
          const aDistance = a.distancia_mar_m ?? a.distanciaMar ?? 999999;
          const bDistance = b.distancia_mar_m ?? b.distanciaMar ?? 999999;
          return aDistance - bDistance;
        });
        break;
      case 'distancia-mar-desc':
        resultado.sort((a, b) => {
          const aDistance = a.distancia_mar_m ?? a.distanciaMar ?? 0;
          const bDistance = b.distancia_mar_m ?? b.distanciaMar ?? 0;
          return bDistance - aDistance;
        });
        break;
      case 'prazo-entrega-asc':
        resultado.sort((a, b) => {
          const aDelivery = a.entrega_prevista ? new Date(a.entrega_prevista).getTime() : Infinity;
          const bDelivery = b.entrega_prevista ? new Date(b.entrega_prevista).getTime() : Infinity;
          return aDelivery - bDelivery;
        });
        break;
      case 'prazo-entrega-desc':
        resultado.sort((a, b) => {
          const aDelivery = a.entrega_prevista ? new Date(a.entrega_prevista).getTime() : 0;
          const bDelivery = b.entrega_prevista ? new Date(b.entrega_prevista).getTime() : 0;
          return bDelivery - aDelivery;
        });
        break;
      case 'mais-recentes':
        resultado.sort((a, b) => {
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bUpdated - aUpdated;
        });
        break;
      case 'relevancia':
      default:
        resultado.sort((a, b) => {
          // Regra especial: sem filtros → exclusivos primeiro, depois com placa
          if (!hasFiltersActive) {
            const exclusiveDiff = ((b.exclusivo ?? false) ? 1 : 0) - ((a.exclusivo ?? false) ? 1 : 0);
            if (exclusiveDiff !== 0) return exclusiveDiff;

            const placaDiff = ((b.temPlaca ?? false) ? 1 : 0) - ((a.temPlaca ?? false) ? 1 : 0);
            if (placaDiff !== 0) return placaDiff;
          }

          if (a.featured !== b.featured) {
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          }
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bUpdated - aUpdated;
        });
        break;
    }

    // Filtro de status agora é aplicado diretamente no servidor via campo StatusObra


    return resultado;
  }, [
    todosImoveis,
    filtros,
    debouncedPrecoMin,
    debouncedPrecoMax,
    debouncedAreaMin,
    debouncedAreaMax,
    ordenacao,
  ]);

  const resetPaginationState = useCallback(() => {
    initialHydrationRef.current = false;
    setPage(1);
    setTotalAvailable(0);
    setTotalPages(0);
    setTodosImoveis([]);
    setIsFetchingMore(false);
    setIsLoading(true);
  }, []);

  // Handlers
  const handleFiltrosChange = useCallback((novosFiltros: FiltrosState) => {
    console.log('🟡 handleFiltrosChange chamado:', novosFiltros);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImoveisClient.tsx:892',message:'handleFiltrosChange',data:{caracteristicasEmpreendimento:novosFiltros.caracteristicasEmpreendimento,todosFilters:Object.keys(novosFiltros).filter(k=>{const val=novosFiltros[k as keyof FiltrosState];return Array.isArray(val)?val.length>0:!!val;})},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H12'})}).catch(()=>{});
    // #endregion
    setFiltros(novosFiltros);
    resetPaginationState();
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'filter_apply', {
        filter_data: JSON.stringify(novosFiltros),
      });
    }
  }, [resetPaginationState]);

  const handleLimparFiltros = useCallback(() => {
    setFiltros(createFiltersState());
    setOrdenacao('relevancia');
    resetPaginationState();
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'filter_clear_all');
    }
    
    // Rolar para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetPaginationState]);

  const handleOrdenacaoChange = useCallback((novaOrdenacao: OrdenacaoType) => {
    setOrdenacao(novaOrdenacao);
    resetPaginationState();
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'sort_change', {
        sort: novaOrdenacao,
      });
    }
    
    // Rolar para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetPaginationState]);

  // Handler para ajustes rápidos de filtros do EmptyState
  const handleAjusteFiltrosRapido = useCallback((action: 'clear' | 'expand_area' | 'raise_price' | 'remove_features') => {
    switch (action) {
      case 'clear':
        handleLimparFiltros();
        break;
        
      case 'expand_area':
        // Limpar filtros de localização para expandir busca
        setFiltros(prev => ({
          ...prev,
          bairros: [],
          localizacao: [],
        }));
        // Toast
        break;
        
      case 'raise_price':
        // Aumentar preço máximo em 20%
        setFiltros(prev => {
          const precoMaxAtual = parseInt(prev.precoMax) || 0;
          const novoPrecoMax = precoMaxAtual > 0 ? Math.floor(precoMaxAtual * 1.2) : 0;
          return {
            ...prev,
            precoMax: novoPrecoMax > 0 ? novoPrecoMax.toString() : '',
          };
        });
        // Toast
        break;
        
      case 'remove_features':
        // Limpar todas as características/comodidades
        setFiltros(prev => ({
          ...prev,
          caracteristicasImovel: [],
          caracteristicasLocalizacao: [],
          caracteristicasEmpreendimento: [],
        }));
        // Toast
        break;
    }
    resetPaginationState();
    
    // Rolar para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [handleLimparFiltros, resetPaginationState]);

  // Transformar dados para o mapa com geocoding automático
  const propertiesForMap = useMemo(() => {
    // ✅ Logs de mapa silenciados para performance
    // console.log('[ImoveisClient] 📍 Processando imóveis para o mapa...');
    console.log('[ImoveisClient] Total de imóveis filtrados:', imoveisFiltrados.length);
    
    const mapped = imoveisFiltrados
      .map((imovel, index) => {
        // Buscar coordenadas em diferentes estruturas possíveis
        const lat = (imovel as any).coordenadas?.lat
          ?? (imovel as any).coordenadas?.latitude 
          ?? (imovel as any).latitude 
          ?? (imovel as any).endereco?.coordenadas?.latitude
          ?? null;
        
        const lng = (imovel as any).coordenadas?.lng
          ?? (imovel as any).coordenadas?.longitude 
          ?? (imovel as any).longitude 
          ?? (imovel as any).endereco?.coordenadas?.longitude
          ?? null;
        
        // Log dos primeiros 3 para debug
        if (index < 3) {
          console.log(`[ImoveisClient] Imóvel ${imovel.codigo || imovel.id}:`, {
            lat,
            lng,
            hasCoords: !!(lat && lng && isFinite(lat) && isFinite(lng)),
            endereco: imovel.endereco,
            bairro: imovel.bairro,
            cidade: imovel.cidade,
          });
        }
        
      const imagensArray = Array.isArray(imovel.imagens) && imovel.imagens.length > 0 
        ? imovel.imagens 
        : ['https://via.placeholder.com/400x300'];
      
        // Se tiver coordenadas válidas, usar diretamente
        if (lat && lng && isFinite(lat) && isFinite(lng)) {
      return {
        id: imovel.id,
        titulo: imovel.titulo,
        preco: imovel.preco,
        quartos: imovel.quartos,
        suites: imovel.suites,
        vagas: imovel.vagas,
        area: imovel.area,
            latitude: lat,
            longitude: lng,
        imagem: imagensArray[0],
        imagens: imagensArray,
        destaque: imovel.destaque,
        distanciaMar: imovel.distancia_mar_m ?? imovel.distanciaMar,
            needsGeocoding: false,
          };
        }
        
        // Se não tiver coordenadas, marcar para geocoding
        return {
          id: imovel.id,
          titulo: imovel.titulo,
          preco: imovel.preco,
          quartos: imovel.quartos,
          suites: imovel.suites,
          vagas: imovel.vagas,
          area: imovel.area,
          latitude: -26.9906, // Centro temporário de BC
          longitude: -48.6450,
          imagem: imagensArray[0],
          imagens: imagensArray,
          destaque: imovel.destaque,
          distanciaMar: imovel.distancia_mar_m ?? imovel.distanciaMar,
          needsGeocoding: true,
          // 🎯 Formatação MELHORADA: Sempre incluir cidade + estado para evitar geocoding errado
          addressForGeocoding: [
            imovel.endereco,
            imovel.bairro,
            imovel.cidade || 'Balneário Camboriú', // Fallback
            'Santa Catarina', // Sempre incluir estado por extenso
            'Brasil'
          ].filter(Boolean).join(', '),
      };
    });
    
    const withCoords = mapped.filter(m => !m.needsGeocoding).length;
    const needsGeo = mapped.filter(m => m.needsGeocoding).length;
    
    // ✅ Logs de coordenadas silenciados para performance
    // console.log('[ImoveisClient] ✅ Com coordenadas:', withCoords);
    // console.log('[ImoveisClient] 🔄 Precisam geocoding:', needsGeo);
    
    return mapped;
  }, [imoveisFiltrados]);

  // Geocodificar propriedades que não têm coordenadas
  const geocodedPropertiesForMap = useGeocodedProperties(propertiesForMap, viewMode === 'map');

  // Transformar dados para o BottomSheet
  const propertiesForBottomSheet = useMemo(() => {
    return imoveisFiltrados.map((imovel) => ({
      id: imovel.id,
      titulo: imovel.titulo,
      endereco: `${imovel.bairro}, ${imovel.cidade}`,
      preco: imovel.preco,
      quartos: imovel.quartos,
      banheiros: imovel.banheiros,
      area: imovel.area,
      vagas: imovel.vagas,
      imagens: imovel.imagens,
      tipoImovel: imovel.tipoImovel,
      destaque: imovel.destaque,
      caracteristicas: imovel.caracteristicas,
      distanciaMar: imovel.distancia_mar_m ?? imovel.distanciaMar,
    }));
  }, [imoveisFiltrados]);

  // Contar filtros ativos
  const countFiltrosAtivos = useCallback(() => {
    let count = 0;
    count += filtros.localizacao.length;
    count += filtros.bairros.length;
    count += filtros.tipos.length;
    count += filtros.status.length;
    if (filtros.precoMin) count++;
    if (filtros.precoMax) count++;
    if (filtros.areaMin) count++;
    if (filtros.areaMax) count++;
    if (filtros.quartos) count++;
    if (filtros.suites) count++;
    if (filtros.banheiros) count++;
    if (filtros.vagas) count++;
    if (filtros.codigoImovel) count++;
    if (filtros.empreendimento) count++;
    count += filtros.caracteristicasImovel.length;
    count += filtros.caracteristicasLocalizacao.length;
    count += filtros.caracteristicasEmpreendimento.length;
    if (filtros.apenasExclusivos) count++;
    return count;
  }, [filtros]);

  const filtrosAtivos = countFiltrosAtivos();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Imóveis', url: '/imoveis' },
  ]);

  return (
    <div
      className="min-h-screen bg-[#F5F7FA]"
      data-cache-layer={initialCacheLayer}
      data-cache-fetched-at={initialFetchedAtIso}
    >
      <StructuredData data={breadcrumbSchema} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E8ECF2]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <Breadcrumb
      items={[
        { name: 'Início', label: 'Início', href: '/', url: '/' },
        { name: 'Imóveis', label: 'Imóveis', href: '/imoveis', url: '/imoveis', current: true },
      ]}
          />
        </div>
      </div>

      {/* Layout Principal: 2 Colunas */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
          {/* Sidebar Esquerda - Sticky (Desktop) */}
          <aside 
            className="hidden lg:block sticky self-start"
            style={{ 
              top: 'var(--header-height)', 
              height: 'calc(100dvh - var(--header-height) - 2rem)',
              zIndex: 'var(--z-sticky-filter)',
            }}
            aria-label="Filtros de busca"
          >
            <FiltersSidebar
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              onLimpar={handleLimparFiltros}
            />
          </aside>

          {/* Conteúdo Principal - Direita */}
          <main className="min-w-0">
            {/* Header da Lista */}
            <div className="mb-6">
              {/* Título e Ordenação */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h6 className="text-[#8E99AB] text-sm font-semibold mb-1">
                    {imoveisFiltrados.length} {imoveisFiltrados.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
                    {totalAvailable > imoveisFiltrados.length && (
                      <span className="text-[#C8A968]"> de {totalAvailable}+ disponíveis</span>
                    )}
                    {filtrosAtivos > 0 && ` • ${filtrosAtivos} ${filtrosAtivos === 1 ? 'filtro ativo' : 'filtros ativos'}`}
                  </h6>
                  {requiresDeepScan && (isLoading || isFetchingMore) && (
                    <div className="flex items-center gap-2 text-xs text-[#8E99AB]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Buscando todos os imóveis deste filtro…</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
                  {/* Botão MAIS FILTROS - Destacado */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 bg-[#192233] hover:bg-[#2a3547] text-white px-3 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg active:scale-[0.98] relative whitespace-nowrap"
                    style={{ minHeight: '48px' }}
                    aria-label="Abrir mais filtros"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span>Mais Filtros</span>
                    {filtrosAtivos > 0 && (
                      <span className="absolute -top-1.5 right-1.5 bg-[#C8A968] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                        {filtrosAtivos}
                      </span>
                    )}
                  </button>

                  {/* Toggle Lista/Mapa */}
                  <div className="flex items-center bg-[#F7F9FC] border border-[#E8ECF2] rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                        viewMode === 'list'
                          ? 'bg-white text-[#192233] shadow-sm'
                          : 'text-[#8E99AB] hover:text-[#192233]'
                      }`}
                      aria-label="Visualizar como lista"
                      aria-pressed={viewMode === 'list'}
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">Lista</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                        viewMode === 'map'
                          ? 'bg-white text-[#192233] shadow-sm'
                          : 'text-[#8E99AB] hover:text-[#192233]'
                      }`}
                      aria-label="Visualizar no mapa"
                      aria-pressed={viewMode === 'map'}
                    >
                      <MapIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Mapa</span>
                    </button>
                  </div>

                  {/* Ordenação - Mobile (Sheet) / Desktop (custom dropdown) */}
                  {/* Desktop */}
                  <div
                    ref={sortDesktopRef}
                    className="relative hidden sm:block"
                  >
                    <button
                      type="button"
                      onClick={() => setShowSortDesktop((prev) => !prev)}
                      className="group inline-flex items-center gap-2 bg-white border border-[#E8ECF2] hover:border-[#C7D2E2] px-3 py-2 rounded-xl text-xs font-semibold text-[#192233] shadow-sm hover:shadow-md transition-all"
                      style={{ minHeight: '44px' }}
                      aria-haspopup="listbox"
                      aria-expanded={showSortDesktop}
                    >
                      <TrendingUp className="w-4 h-4 text-[#0066FF] group-hover:scale-110 transition-transform" />
                      <span>{ordenacaoLabel}</span>
                      <ChevronDown className={`w-4 h-4 text-[#8E99AB] transition-transform ${showSortDesktop ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {/* Dropdown via Portal (Desktop) */}
                  {isMounted && showSortDesktop && sortDesktopRef.current && createPortal(
                    <div
                      className="fixed w-60 bg-white rounded-2xl shadow-2xl border border-[#E8ECF2] overflow-hidden"
                      style={{
                        top: `${sortDesktopRef.current.getBoundingClientRect().bottom + 8}px`,
                        right: `${window.innerWidth - sortDesktopRef.current.getBoundingClientRect().right}px`,
                        zIndex: 9999,
                      }}
                    >
                      <ul role="listbox" aria-activedescendant={`sort-desktop-${ordenacao}`} className="divide-y divide-[#F1F4F9]">
                        {([
                          { id: 'relevancia', label: 'Relevância' },
                          { id: 'mais-recentes', label: 'Mais Recentes' },
                          { id: 'preco-asc', label: 'Menor Preço' },
                          { id: 'preco-desc', label: 'Maior Preço' },
                          { id: 'prazo-entrega-asc', label: 'Prazo de Entrega ↑' },
                          { id: 'prazo-entrega-desc', label: 'Prazo de Entrega ↓' },
                        ] as Array<{ id: OrdenacaoType; label: string }>).map(opt => (
                          <li key={opt.id}>
                            <button
                              id={`sort-desktop-${opt.id}`}
                              role="option"
                              aria-selected={ordenacao === opt.id}
                              onClick={() => {
                                handleOrdenacaoChange(opt.id);
                                setShowSortDesktop(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors ${
                                ordenacao === opt.id
                                  ? 'bg-[#F0F5FF] text-[#0A2B64] border-l-4 border-[#0066FF]'
                                  : 'text-[#192233] hover:bg-[#F7F9FC]'
                              }`}
                              style={{ minHeight: '44px' }}
                            >
                              {opt.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>,
                    document.body
                  )}
                  {/* Mobile */}
                  <button
                    type="button"
                    className="sm:hidden inline-flex items-center gap-1.5 bg-[#F7F9FC] border border-[#E8ECF2] px-3 py-2 rounded-xl text-xs font-semibold text-[#192233] whitespace-nowrap"
                    style={{ minHeight: '44px' }}
                    aria-haspopup="dialog"
                    aria-expanded={showSort}
                    onClick={() => setShowSort(true)}
                  >
                    <TrendingUp className="w-4 h-4 text-[#8E99AB]" />
                    <span>Ordem</span>
                    <ChevronDown className="w-4 h-4 text-[#8E99AB]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex gap-6">
                      <div className="w-64 h-48 bg-gray-200 rounded-xl flex-shrink-0"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
                        <div className="flex gap-2 mt-4">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : apiError ? (
              /* Error State */
              <div className="text-center py-16 bg-white rounded-2xl">
                <svg className="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{apiError}</h3>
                <p className="text-gray-500 mb-6">Tente novamente em alguns instantes</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Recarregar página
                </button>
              </div>
            ) : (
              /* Conteúdo: Lista ou Mapa */
              viewMode === 'list' ? (
                /* Modo Lista */
                imoveisFiltrados.length > 0 ? (
                <div className="space-y-4" role="list" aria-live="polite" aria-atomic="false">
                  {imoveisFiltrados.map((imovel, index) => (
                    <AnimatedSection
                      key={imovel.id}
                      delay={index * 50}
                      as="div"
                    >
                      <PropertyCardHorizontal
                        id={imovel.id}
                        slug={imovel.slug}
                        titulo={imovel.titulo}
                        bairro={imovel.bairro}
                        cidade={imovel.cidade}
                        imagens={imovel.imagens.map((img: string) => ({ src: img, alt: imovel.titulo }))}
                        quartos={imovel.quartos}
                        suites={imovel.suites}
                        vagas={imovel.vagas}
                        areaPrivativa={imovel.area}
                        precoAtual={imovel.preco}
                        precoAntigo={imovel.precoAntigo}
                        condominio={imovel.condominio}
                        iptuAnual={imovel.iptu}
                        tipoImovel={imovel.tipoImovel ? imovel.tipoImovel.charAt(0).toUpperCase() + imovel.tipoImovel.slice(1) : 'Imóvel'}
                        distanciaMar={imovel.distanciaMar ?? imovel.distancia_mar_m}
                        caracteristicasImovel={imovel.caracteristicasImovel || []}
                        caracteristicasLocalizacao={imovel.caracteristicasLocalizacao || []}
                        caracteristicas={[
                          ...(imovel.vistaParaMar && (imovel.distanciaMar === undefined || imovel.distanciaMar > 500) ? ['Vista mar'] : []),
                          ...(imovel.mobiliado ? ['Mobiliado'] : []),
                        ]}
                        badges={[
                          ...(imovel.destaque ? ['Exclusivo'] : []),
                          ...(imovel.lancamento ? ['Lançamento'] : []),
                        ]}
                        tags={[
                          ...(imovel.entrega_prevista ? [formatarPrazo(imovel.entrega_prevista)] : []),
                        ]}
                        favorito={false}
                      />
                    </AnimatedSection>
                  ))}
                  
                  {/* Loading More Animation */}
                  {isFetchingMore && (
                    <div className="space-y-4 animate-fade-in">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8ECF2] overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                          <div className="flex gap-6">
                            <div className="w-64 h-48 bg-gray-200 rounded-xl flex-shrink-0 animate-pulse"></div>
                            <div className="flex-1 space-y-3">
                              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                              <div className="h-8 bg-gray-200 rounded w-1/3 mt-4 animate-pulse"></div>
                              <div className="flex gap-2 mt-4">
                                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-center gap-3 py-4">
                        <Loader2 className="w-5 h-5 text-[#0066FF] animate-spin" />
                        <span className="text-[#192233] font-medium text-sm animate-pulse">Carregando mais imóveis...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* sentinel */}
                  <div ref={loadMoreRef} className="h-12"></div>
                </div>
              ) : (
              // Empty State: Mostrado pelo CTA Card abaixo
              <div className="py-12"></div>
                )
              ) : (
              /* Modo Mapa */
              <div className="relative">
                {/* Desktop: Mapa full width */}
                <LazySection
                  as="div"
                  className="hidden lg:block h-[calc(100vh-320px)] min-h-[500px] bg-white rounded-2xl overflow-hidden border border-[#E8ECF2]"
                  rootMargin="200px 0px"
                  fallback={<div className="hidden lg:block h-[calc(100vh-320px)] min-h-[500px] bg-white rounded-2xl border border-[#E8ECF2] animate-pulse" />}
                >
                  {geocodedPropertiesForMap.length > 0 ? (
                    <MapView
                      properties={geocodedPropertiesForMap}
                      selectedPropertyId={selectedPropertyId}
                      onPropertySelect={setSelectedPropertyId}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#F7F9FC] to-[#E8ECF2] p-8">
                      <div className="text-center max-w-md">
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                          <MapPin className="w-16 h-16 text-[#054ADA] mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-[#192233] mb-3">
                            Mapa em Configuração
                          </h3>
                          <p className="text-[#8E99AB] font-medium mb-4 leading-relaxed">
                            Estamos configurando as coordenadas dos imóveis para exibição no mapa.
                          </p>
                          <p className="text-sm text-[#8E99AB]">
                            Por enquanto, utilize a <button onClick={() => setViewMode('list')} className="text-[#054ADA] font-semibold hover:underline">visualização em lista</button>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </LazySection>

                {/* Mobile: Mapa fullscreen + BottomSheet */}
                <div
                  className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col"
                  style={{
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E8ECF2] bg-white shadow-sm">
                    <button
                      onClick={() => setViewMode('list')}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#192233] bg-[#F5F7FA] hover:bg-[#E8ECF2] transition-colors"
                      aria-label="Voltar para a lista"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Lista
                    </button>
                    <div className="text-sm font-semibold text-[#192233]">
                      {imoveisFiltrados.length} {imoveisFiltrados.length === 1 ? 'imóvel' : 'imóveis'}
                    </div>
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#192233] text-white hover:bg-[#2a3547] transition-colors"
                      aria-label="Abrir filtros rápidos"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Filtros
                    </button>
                  </div>

                  <div className="relative flex-1 min-h-[60vh]">
                    {geocodedPropertiesForMap.length > 0 ? (
                      <>
                        <div className="absolute inset-0">
                          <MapView
                            properties={geocodedPropertiesForMap}
                            selectedPropertyId={selectedPropertyId}
                            onPropertySelect={setSelectedPropertyId}
                          />
                        </div>
                        <BottomSheet
                          properties={propertiesForBottomSheet}
                          onPropertyHover={setSelectedPropertyId}
                          onBackToList={() => setViewMode('list')}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F7F9FC] to-[#E8ECF2] px-4">
                        <div className="text-center max-w-sm">
                          <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <MapPin className="w-14 h-14 text-[#054ADA] mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-[#192233] mb-2">
                              Mapa em Configuração
                            </h3>
                            <p className="text-sm text-[#8E99AB] font-medium mb-4">
                              Coordenadas dos imóveis em configuração.
                            </p>
                          <button
                            onClick={() => setViewMode('list')}
                              className="w-full bg-[#054ADA] hover:bg-[#043bb8] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
                          >
                              Ver em Lista
                          </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )
            )}

            {/* CTA Card: Final da lista ou nenhum resultado */}
            {viewMode === 'list' && (allLoaded || imoveisFiltrados.length === 0) && (
              <div className="mt-8">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#003D99] rounded-3xl p-8 md:p-12 shadow-2xl">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                  </div>

                  <div className="relative z-10 text-center max-w-2xl mx-auto">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 animate-bounce">
                      <HomeIcon className="w-8 h-8 text-white" />
                    </div>

                    {/* Heading */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Não encontrou o imóvel ideal?
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-lg mb-8 leading-relaxed">
                      Temos acesso exclusivo a imóveis ainda não divulgados publicamente. 
                      <span className="font-semibold block mt-2">
                        Solicite nossa tabela VIP ou descreva o imóvel dos seus sonhos!
                      </span>
                    </p>

                    {/* CTA Button */}
                    <a
                      href="https://wa.me/5547991878070?text=Olá!%20Gostaria%20de%20receber%20a%20tabela%20exclusiva%20de%20imóveis%20da%20Pharos."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-[#0066FF] font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                    >
                      <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>Falar no WhatsApp</span>
                    </a>

                    {/* Trust Badge */}
                    <p className="mt-6 text-white/70 text-sm flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Resposta em minutos · Atendimento VIP
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Mobile - Sheet */}
      {isMounted && showMobileFilters && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm backdrop-animate"
            style={{ zIndex: 'var(--z-sheet)' }}
            onClick={() => setShowMobileFilters(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            className="fixed inset-0 z-sheet bg-white flex flex-col sheet-animate-mobile"
            style={{ zIndex: 'calc(var(--z-sheet) + 1)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filters-title"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E8ECF2] safe-top">
              <h2 id="mobile-filters-title" className="text-lg font-bold text-[#192233]">
                Filtros
              </h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 -mr-2 hover:bg-[#F5F7FA] rounded-full transition-colors"
                aria-label="Fechar filtros"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-6 h-6 text-[#192233]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-6">
                <FiltersSidebar
                  filtros={filtros}
                  onFiltrosChange={handleFiltrosChange}
                  onLimpar={handleLimparFiltros}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex-shrink-0 border-t border-[#E8ECF2] px-6 py-4 bg-white safe-bottom">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-[#192233] hover:bg-[#2a3547] text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                style={{ minHeight: '48px' }}
              >
                Ver {imoveisFiltrados.length} {imoveisFiltrados.length === 1 ? 'imóvel' : 'imóveis'}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Sheet Ordenação (mobile) */}
      {isMounted && showSort && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm backdrop-animate"
            style={{ zIndex: 'var(--z-sheet)' }}
            onClick={() => setShowSort(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-sheet bg-white flex flex-col sheet-animate-mobile"
            style={{ zIndex: 'calc(var(--z-sheet) + 1)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-sort-title"
          >
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-bottom border-[#E8ECF2] safe-top">
              <h2 id="mobile-sort-title" className="text-lg font-bold text-[#192233]">
                Ordenar por
              </h2>
              <button
                onClick={() => setShowSort(false)}
                className="p-2 -mr-2 hover:bg-[#F5F7FA] rounded-full transition-colors"
                aria-label="Fechar ordenação"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-6 h-6 text-[#192233]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-2">
                <ul role="listbox" aria-activedescendant={`sort-${ordenacao}`} className="divide-y divide-[#E8ECF2]">
                  {([
                    { id: 'relevancia', label: 'Relevância' },
                    { id: 'mais-recentes', label: 'Mais Recentes' },
                    { id: 'preco-asc', label: 'Menor Preço' },
                    { id: 'preco-desc', label: 'Maior Preço' },
                    { id: 'prazo-entrega-asc', label: 'Prazo de Entrega ↑' },
                    { id: 'prazo-entrega-desc', label: 'Prazo de Entrega ↓' },
                  ] as Array<{ id: OrdenacaoType; label: string }>).map(opt => (
                    <li key={opt.id}>
                      <button
                        id={`sort-${opt.id}`}
                        role="option"
                        aria-selected={ordenacao === opt.id}
                        onClick={() => {
                          handleOrdenacaoChange(opt.id);
                          setShowSort(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-4 text-base ${
                          ordenacao === opt.id ? 'text-[#192233] font-semibold' : 'text-[#4B5563]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {ordenacao === opt.id ? (
                          <svg className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.704 5.29a1 1 0 00-1.414 0L8 12.58 4.71 9.29A1 1 0 103 10.7l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.41z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-[#C9D1E0]" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-[#E8ECF2] px-6 py-4 bg-white safe-bottom">
              <button
                onClick={() => setShowSort(false)}
                className="w-full bg-[#192233] hover:bg-[#2a3547] text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                style={{ minHeight: '48px' }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function formatarPrazo(dataISO: string): string {
  const data = new Date(dataISO);
  const ano = data.getFullYear();
  const mes = data.getMonth() + 1;
  const semestre = mes <= 6 ? '1º' : '2º';
  return `${ano}/${semestre} sem`;
}

