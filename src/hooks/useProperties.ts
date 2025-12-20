/**
 * Hook para buscar imóveis da API
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { hashFilters, reportApiMetric } from '@/lib/analytics';

const generateMetricId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} | null;

type CacheEntry = {
  data: any[];
  pagination: PaginationState;
  timestamp: number;
};

const propertiesCache = new Map<string, CacheEntry>();
const DEFAULT_STALE_TIME = 1000 * 30; // 30 segundos

interface PropertyFilters {
  city?: string;
  neighborhood?: string;
  type?: string;
  purpose?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSuites?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UsePropertiesOptions {
  filters?: PropertyFilters;
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  keepPreviousData?: boolean;
  initialData?: any[];
  initialPagination?: PaginationState;
}

interface UsePropertiesResult {
  data: any[];
  pagination: PaginationState;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  error: Error | null;
  fromCache: boolean;
  lastUpdated: number | null;
  refetch: () => void;
}

const stableSerialize = (value: any): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `"${key}":${stableSerialize((value as any)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

const buildCacheKey = (filters: PropertyFilters) => stableSerialize(filters);

export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesResult {
  const {
    filters = {},
    enabled = true,
    refetchInterval,
    staleTime = DEFAULT_STALE_TIME,
    keepPreviousData = true,
    initialData,
    initialPagination,
  } = options;

  const cacheKey = useMemo(() => buildCacheKey(filters), [filters]);
  const filtersForFetch = useMemo(() => ({ ...filters }), [cacheKey]);
  const initialCache = propertiesCache.get(cacheKey);

  const [data, setData] = useState<any[]>(() => initialCache?.data ?? initialData ?? []);
  const [pagination, setPagination] = useState<PaginationState>(() => initialCache?.pagination ?? initialPagination ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialCache && !initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(() => Boolean(initialCache));
  const [lastUpdated, setLastUpdated] = useState<number | null>(() => initialCache?.timestamp ?? (initialData ? Date.now() : null));
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    const cached = propertiesCache.get(cacheKey);
    if (cached) {
      setData(cached.data);
      setPagination(cached.pagination);
      setFromCache(true);
      setLastUpdated(cached.timestamp);
      setIsLoading(false);
    } else if (!keepPreviousData) {
      setData([]);
      setPagination(null);
      setFromCache(false);
      setIsLoading(true);
    }
  }, [cacheKey, enabled, keepPreviousData]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    let cancelled = false;
    const cached = propertiesCache.get(cacheKey);
    const now = Date.now();
    const isFresh = cached ? now - cached.timestamp < staleTime : false;
    const shouldFetch = !cached || !isFresh || refetchTrigger > 0;

    if (cached) {
      setFromCache(true);
      setLastUpdated(cached.timestamp);
      setIsLoading(!cached || (!isFresh && !shouldFetch));
    } else {
      setFromCache(false);
      if (!keepPreviousData) {
        setIsLoading(true);
      }
    }

    if (!shouldFetch) {
      setIsRefreshing(false);
      setIsLoading(false);
      return () => {
        controller.abort();
      };
    }

    if (cached) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setIsError(false);
    setError(null);

    const fetchProperties = async () => {
      const params = new URLSearchParams();
      Object.entries(filtersForFetch).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const url = `/api/properties?${params.toString()}`;
      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const filtersHashPromise = hashFilters(params);

      try {
        const response = await fetch(url, { signal: controller.signal });
        const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;
        const filtersHash = await filtersHashPromise;

        if (!response.ok) {
          const errorMessage = `Erro ao buscar imóveis: ${response.status}`;
          reportApiMetric({
            id: generateMetricId(),
            url,
            endpoint: '/api/properties',
            method: 'GET',
            status: response.status,
            ok: false,
            duration,
            fromCache:
              response.headers.get('x-vercel-cache') ||
              response.headers.get('x-cache') ||
              response.headers.get('x-cache-status'),
            timestamp: new Date().toISOString(),
            filtersHash,
            errorMessage,
          });
          throw new Error(errorMessage);
        }

        const result = await response.json();

        reportApiMetric({
          id: generateMetricId(),
          url,
          endpoint: '/api/properties',
          method: 'GET',
          status: response.status,
          ok: true,
          duration,
          fromCache:
            response.headers.get('x-vercel-cache') ||
            response.headers.get('x-cache') ||
            response.headers.get('x-cache-status'),
          timestamp: new Date().toISOString(),
          filtersHash,
        });

        if (cancelled) return;

        if (!result.success) {
          throw new Error(result.error || 'Erro desconhecido');
        }

        const nextData = result.data || [];
        const nextPagination = result.pagination || null;
        const timestamp = Date.now();

        propertiesCache.set(cacheKey, {
          data: nextData,
          pagination: nextPagination,
          timestamp,
        });

        setData(nextData);
        setPagination(nextPagination);
        setIsLoading(false);
        setIsRefreshing(false);
        setIsError(false);
        setError(null);
        setFromCache(false);
        setLastUpdated(timestamp);
      } catch (err: any) {
        if (cancelled) return;

        if (err?.name === 'AbortError') {
          return;
        }

        setIsError(true);
        setError(err as Error);
        setIsLoading(false);
        setIsRefreshing(false);
        console.error('[useProperties] Erro:', err);

        filtersHashPromise
          .then((filtersHash) => {
            reportApiMetric({
              id: generateMetricId(),
              url,
              endpoint: '/api/properties',
              method: 'GET',
              status: typeof err?.status === 'number' ? err.status : 0,
              ok: false,
              duration: 0,
              fromCache: undefined,
              timestamp: new Date().toISOString(),
              filtersHash,
              errorMessage: err instanceof Error ? err.message : String(err),
            });
          })
          .catch(() => undefined);
      }
    };

    fetchProperties().catch(() => undefined);

    let intervalId: NodeJS.Timeout | undefined;
    if (refetchInterval && refetchInterval > 0) {
      intervalId = setInterval(() => {
        fetchProperties().catch(() => undefined);
      }, refetchInterval);
    }

    return () => {
      cancelled = true;
      controller.abort();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [cacheKey, enabled, filtersForFetch, keepPreviousData, refetchInterval, refetchTrigger, staleTime]);

  return {
    data,
    pagination,
    isLoading,
    isRefreshing,
    isError,
    error,
    fromCache,
    lastUpdated,
    refetch,
  };
}

