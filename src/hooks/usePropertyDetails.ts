/**
 * Hook para buscar detalhes de um imóvel específico
 * 
 * Trata erros 404 (não encontrado) e 502/504 (falha temporária)
 * Inicializa photos como array vazio para evitar quebras na galeria
 */

'use client';

import { useState, useEffect } from 'react';
import type { Property } from '@/domain/models';

interface UsePropertyDetailsOptions {
  enabled?: boolean;
  initialData?: Property | null;
  fetchOnMount?: boolean;
}

interface UsePropertyDetailsResult {
  data: Property | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  errorType: 'not-found' | 'temporary' | 'unknown' | null;
  refetch: () => void;
}

export function usePropertyDetails(
  id: string | null,
  options: UsePropertyDetailsOptions = {}
): UsePropertyDetailsResult {
  const {
    enabled = true,
    initialData = null,
    fetchOnMount = false,
  } = options;

  const [data, setData] = useState<Property | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialData);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorType, setErrorType] = useState<'not-found' | 'temporary' | 'unknown' | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setIsLoading(false);
    }
  }, [initialData]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (!enabled || !id) {
      setIsLoading(false);
      return;
    }

    const shouldFetch = refetchTrigger > 0 || fetchOnMount || !initialData;

    if (!shouldFetch) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchPropertyDetails() {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        setErrorType(null);

        const response = await fetch(`/api/properties/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Classificar tipo de erro
          if (response.status === 404) {
            const err = new Error(errorData.message || 'Imóvel não encontrado');
            if (isMounted) {
              setError(err);
              setErrorType('not-found');
              setIsError(true);
            }
            return;
          }
          
          if (response.status === 502 || response.status === 504) {
            const err = new Error(errorData.message || 'Falha temporária ao buscar imóvel');
            if (isMounted) {
              setError(err);
              setErrorType('temporary');
              setIsError(true);
            }
            return;
          }
          
          throw new Error(errorData.message || `Erro ao buscar imóvel: ${response.status}`);
        }

        const result = await response.json();

        if (isMounted) {
          // A API retorna { success: true, data: {...} }
          const propertyData: Property = (result.data || result) as Property;
          
          // Garantir que photos sempre seja um array
          if (!propertyData.photos || !Array.isArray(propertyData.photos)) {
            (propertyData as any).photos = [];
          }
          
          setData(propertyData);
          setIsError(false);
          setErrorType(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setIsError(true);
          setError(err);
          setErrorType('unknown');
          console.error('[usePropertyDetails] Erro:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPropertyDetails();

    return () => {
      isMounted = false;
    };
  }, [id, enabled, fetchOnMount, initialData, refetchTrigger]);

  return {
    data,
    isLoading,
    isError,
    error,
    errorType,
    refetch,
  };
}
