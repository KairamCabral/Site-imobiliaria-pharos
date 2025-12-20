'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * PHAROS - Property Map Component
 * 
 * Mapa interativo do Google Maps com:
 * - Animações fly-to e marker drop
 * - CTA "Rotas"
 * - Lazy loading com IntersectionObserver
 * - POIs (Points of Interest) opcionais
 */

interface PropertyMapProps {
  propertyId: string;
  propertyTitle: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  pois?: {
    label: string;
    distance?: number; // em metros
    type?: 'beach' | 'school' | 'market' | 'hospital' | 'transport' | 'other';
  }[];
}

// Função para carregar Google Maps dinamicamente
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Verificar se já foi carregado
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    // Verificar se o script já existe
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    // Criar script
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    
    document.head.appendChild(script);
  });
}

export default function PropertyMap({
  propertyId,
  propertyTitle,
  address,
  coordinates,
  pois = [],
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Lazy loading com IntersectionObserver
  useEffect(() => {
    if (!mapRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(mapRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isVisible]);

  // Carregar Google Maps API
  useEffect(() => {
    if (!isVisible || isLoaded) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    
    if (!apiKey) {
      console.warn('[PropertyMap] Google Maps API key não configurada');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('[PropertyMap] Erro ao carregar Google Maps:', error);
      });
  }, [isVisible, isLoaded]);

  // Inicializar mapa com animações
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    // Inicializar com zoom out
    const google = (window as any).google;
    const initialMap = new google.maps.Map(mapRef.current, {
      center: { lat: coordinates.lat - 0.01, lng: coordinates.lng }, // Offset inicial
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    // Criar marker
    const marker = new google.maps.Marker({
      position: coordinates,
      map: initialMap,
      title: propertyTitle,
      animation: undefined, // Sem animação inicial
    });

    // InfoWindow
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #192233;">
            ${propertyTitle}
          </h3>
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            ${address}
          </p>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(initialMap, marker);
    });

    // Animação fly-to com easeOutQuad
    setTimeout(() => {
      // Fly-to com pan suave
      initialMap.panTo(coordinates);
      
      // Zoom gradual
      let currentZoom = 12;
      const targetZoom = 15;
      const zoomInterval = setInterval(() => {
        if (currentZoom < targetZoom) {
          currentZoom += 0.5;
          initialMap.setZoom(currentZoom);
        } else {
          clearInterval(zoomInterval);
          
          // Drop animation no marker após zoom
          setTimeout(() => {
            marker.setAnimation(google.maps.Animation.DROP);
          }, 300);
        }
      }, 100);
    }, 500);

    setMap(initialMap);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'map_open', {
        property_id: propertyId,
      });
    }
  }, [isLoaded, map, coordinates, propertyTitle, address, propertyId]);

  // Abrir rotas no Google Maps
  const handleRoutesClick = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'map_routes_click', {
        property_id: propertyId,
      });
    }
  };

  // Ícones por tipo de POI
  const getPoiIcon = (type: string) => {
    switch (type) {
      case 'beach':
        return '🏖️';
      case 'school':
        return '🏫';
      case 'market':
        return '🛒';
      case 'hospital':
        return '🏥';
      case 'transport':
        return '🚇';
      default:
        return '📍';
    }
  };

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-pharos-navy-900 mb-3">
            Localização
          </h2>
          <p className="text-lg text-pharos-slate-600">
            {address}
          </p>
        </div>

        {/* Mapa */}
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-pharos-slate-200 shadow-md"
            role="region"
            aria-label="Mapa de localização do imóvel"
          >
            {!isVisible && (
              <div className="w-full h-full bg-pharos-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-pharos-slate-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-pharos-slate-500">Carregando mapa...</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA Rotas - Flutuante */}
          {isLoaded && (
            <button
              onClick={handleRoutesClick}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-5 py-3 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Como chegar
            </button>
          )}
        </div>

        {/* POIs (Points of Interest) */}
        {pois && pois.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pois.map((poi, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-pharos-slate-50 rounded-lg border border-pharos-slate-200"
              >
                <span className="text-2xl" role="img" aria-label={poi.type}>
                  {getPoiIcon(poi.type || 'other')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-pharos-navy-900 truncate">
                    {poi.label}
                  </p>
                  {poi.distance != null && (
                    <p className="text-xs text-pharos-slate-500 mt-0.5">
                      {poi.distance >= 1000
                        ? `${(poi.distance / 1000).toFixed(1)} km`
                        : `${poi.distance} m`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 text-xs text-pharos-slate-500 text-center">
          As distâncias são aproximadas e podem variar dependendo do trajeto escolhido.
        </div>
      </div>
    </section>
  );
}
