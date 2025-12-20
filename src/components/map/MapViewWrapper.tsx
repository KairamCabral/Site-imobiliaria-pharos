'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Wrapper para carregamento dinâmico do MapView (client-side only)
 * Necessário porque Leaflet não funciona com SSR
 */
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F7F9FC]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#054ADA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#8E99AB] font-medium">Carregando mapa...</p>
      </div>
    </div>
  ),
}) as ComponentType<any>;

export default MapView;

