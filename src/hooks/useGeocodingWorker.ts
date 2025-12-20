/**
 * Hook para usar Web Worker de Geocoding
 * Processa geocoding em background sem bloquear UI
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface GeocodingRequest {
  propertyId: string;
  address: string;
}

interface GeocodingResult {
  propertyId: string;
  address: string;
  coords: {
    lat: number;
    lng: number;
  } | null;
}

interface UseGeocodingWorkerResult {
  geocodeBatch: (requests: GeocodingRequest[]) => Promise<GeocodingResult[]>;
  isReady: boolean;
  isProcessing: boolean;
  progress: { completed: number; total: number } | null;
}

export function useGeocodingWorker(apiKey: string | undefined): UseGeocodingWorkerResult {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const pendingBatchesRef = useRef<Map<string, (results: GeocodingResult[]) => void>>(new Map());

  // Inicializar worker
  useEffect(() => {
    if (typeof window === 'undefined' || !apiKey) return;

    try {
      const worker = new Worker('/workers/geocoding.worker.js');
      
      worker.addEventListener('message', (event) => {
        const { type, payload } = event.data;

        switch (type) {
          case 'WORKER_READY':
            console.log('[GeocodingWorker] ✅ Worker pronto');
            setIsReady(true);
            break;

          case 'BATCH_STARTED':
            console.log(`[GeocodingWorker] 🔄 Iniciando batch ${payload.batchId}: ${payload.total} endereços`);
            setIsProcessing(true);
            setProgress({ completed: 0, total: payload.total });
            break;

          case 'BATCH_COMPLETED':
            console.log(`[GeocodingWorker] ✅ Batch ${payload.batchId} concluído`);
            setIsProcessing(false);
            setProgress(null);
            
            const resolver = pendingBatchesRef.current.get(payload.batchId);
            if (resolver) {
              resolver(payload.results);
              pendingBatchesRef.current.delete(payload.batchId);
            }
            break;

          case 'CACHE_SIZE':
            console.log(`[GeocodingWorker] Cache: ${payload.size} entradas`);
            break;
        }
      });

      worker.addEventListener('error', (error) => {
        console.error('[GeocodingWorker] Erro:', error);
        setIsReady(false);
        setIsProcessing(false);
      });

      workerRef.current = worker;

      return () => {
        worker.terminate();
        workerRef.current = null;
      };
    } catch (error) {
      console.warn('[GeocodingWorker] Falha ao inicializar worker:', error);
    }
  }, [apiKey]);

  // Função para geocodificar batch
  const geocodeBatch = useCallback(
    (requests: GeocodingRequest[]): Promise<GeocodingResult[]> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || !isReady || !apiKey) {
          console.warn('[GeocodingWorker] Worker não está pronto');
          reject(new Error('Worker não está pronto'));
          return;
        }

        const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        pendingBatchesRef.current.set(batchId, resolve);

        workerRef.current.postMessage({
          type: 'GEOCODE_BATCH',
          payload: {
            batchId,
            addresses: requests,
            apiKey,
          },
        });
      });
    },
    [isReady, apiKey]
  );

  return {
    geocodeBatch,
    isReady,
    isProcessing,
    progress,
  };
}

