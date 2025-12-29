'use client';

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Skeleton para carregamento do mapa
 */
function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Carregando mapa...</p>
      </div>
    </div>
  );
}

/**
 * Lazy load do MapView - só carrega quando componente é renderizado
 * Isso remove Leaflet (~150KB) do bundle inicial
 */
const MapViewDynamic = dynamic(() => import('./map/MapView'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Maps não funcionam bem com SSR
});

export default MapViewDynamic;

