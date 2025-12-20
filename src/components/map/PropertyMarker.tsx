'use client';

import { DivIcon } from 'leaflet';
import { renderToString } from 'react-dom/server';

interface PropertyMarkerIconProps {
  preco: number;
  isSelected?: boolean;
  isDestaque?: boolean;
}

/**
 * Gera ícone customizado para marcador de imóvel no mapa
 * Visual: Pill navy com preço em branco + seta apontando para baixo
 */
export function createPropertyMarkerIcon({
  preco,
  isSelected = false,
  isDestaque = false,
}: PropertyMarkerIconProps): DivIcon {
  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(preco);

  const markerHTML = renderToString(
    <div
      className={`property-marker ${isSelected ? 'selected' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Pill com preço */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: isDestaque ? '6px' : '0',
          backgroundColor: isSelected ? '#054ADA' : '#192233',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
          whiteSpace: 'nowrap',
          boxShadow: isSelected
            ? '0 4px 12px rgba(5, 74, 218, 0.4), 0 0 0 2px #054ADA'
            : '0 2px 8px rgba(0, 0, 0, 0.25)',
          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
          zIndex: isSelected ? 1000 : 'auto',
        }}
      >
        {/* Dot dourado para destaque */}
        {isDestaque && (
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#C8A968',
              flexShrink: 0,
            }}
          />
        )}
        {precoFormatado}
      </div>

      {/* Seta (pointer) */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${isSelected ? '#054ADA' : '#192233'}`,
          marginTop: '-1px',
        }}
      />
    </div>
  );

  return new DivIcon({
    html: markerHTML,
    className: 'property-marker-wrapper',
    iconSize: [80, 40],
    iconAnchor: [40, 40],
  });
}

