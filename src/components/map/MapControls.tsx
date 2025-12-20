'use client';

import { Plus, Minus, Navigation } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGeolocation: () => void;
}

/**
 * Controles do mapa (zoom e geolocalização)
 * Design: FAB buttons navy com ícones brancos
 */
export default function MapControls({ onZoomIn, onZoomOut, onGeolocation }: MapControlsProps) {
  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-11 h-11 bg-[#192233] hover:bg-[#054ADA] text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Aumentar zoom"
        title="Aumentar zoom"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-11 h-11 bg-[#192233] hover:bg-[#054ADA] text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Diminuir zoom"
        title="Diminuir zoom"
      >
        <Minus className="w-5 h-5" />
      </button>

      {/* Divisor */}
      <div className="h-px bg-[#E8ECF2] my-1" />

      {/* Geolocalização */}
      <button
        onClick={onGeolocation}
        className="w-11 h-11 bg-[#192233] hover:bg-[#054ADA] text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Minha localização"
        title="Minha localização"
      >
        <Navigation className="w-5 h-5" />
      </button>
    </div>
  );
}

