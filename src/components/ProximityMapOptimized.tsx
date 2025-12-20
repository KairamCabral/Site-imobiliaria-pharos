/**
 * ProximityMap Optimized - Design Minimalista Premium
 * 
 * Mapa de proximidades usando Google Maps com:
 * - Layout side-by-side (mapa 60% | lista 40%)
 * - Ícones SVG personalizados por categoria
 * - Design ultra-minimalista
 * - Performance otimizada com lazy load
 * 
 * Bundle impact: -200KB (vs Leaflet)
 */

'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  ShoppingCart,
  GraduationCap,
  Building2,
  Coffee,
  Hospital,
  Palmtree,
  MapPin,
  Navigation,
  Loader2,
  X,
} from 'lucide-react';

interface POI {
  id: string;
  name: string;
  category: 'market' | 'school' | 'hospital' | 'restaurant' | 'shopping' | 'park';
  distance: number;
  walkTime: number;
  lat: number;
  lng: number;
  rating?: number;
}

interface ProximityMapProps {
  propertyLocation: {
    lat: number;
    lng: number;
  };
  propertyTitle?: string;
  neighborhood?: string;
  className?: string;
  showHeader?: boolean;
}

const POI_CATEGORIES = {
  market: { icon: ShoppingCart, label: 'Mercados', color: '#10b981', type: 'supermarket' },
  school: { icon: GraduationCap, label: 'Escolas', color: '#8b5cf6', type: 'school' },
  hospital: { icon: Hospital, label: 'Hospitais', color: '#ef4444', type: 'hospital' },
  restaurant: { icon: Coffee, label: 'Restaurantes', color: '#f59e0b', type: 'restaurant' },
  shopping: { icon: Building2, label: 'Shoppings', color: '#ec4899', type: 'shopping_mall' },
  park: { icon: Palmtree, label: 'Parques', color: '#14b8a6', type: 'park' },
};

// Tempo de caminhada (5km/h)
function calculateWalkTime(distanceMeters: number): number {
  return Math.round(distanceMeters / 1000 / 5 * 60);
}

// Formatar distância
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// Criar ícone SVG personalizado para markers
function createCustomIcon(color: string, iconPath: string) {
  const svg = `
    <svg width="36" height="45" viewBox="0 0 36 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M18 0C8.1 0 0 8.1 0 18c0 13.5 18 27 18 27s18-13.5 18-27c0-9.9-8.1-18-18-18z" fill="${color}"/>
        <circle cx="18" cy="18" r="11" fill="white" opacity="0.95"/>
        <path d="${iconPath}" fill="${color}" transform="translate(10, 10) scale(0.5)"/>
      </g>
    </svg>
  `.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(36, 45),
    anchor: new google.maps.Point(18, 45),
  };
}

// Ícones SVG paths para cada categoria
const ICON_PATHS = {
  beach: 'M12 18L6 12l6-6 6 6zm0 0v6', // Waves icon path
  market: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m12-8l2 8m0 0h-8m8 0h2', // Shopping cart
  school: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', // Graduation cap
  hospital: 'M12 4v16m8-8H4', // Plus/Cross
  restaurant: 'M8 8h8M8 12h8M8 16h8', // Coffee/Restaurant
  shopping: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5', // Building
  park: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', // Tree/Park
};

export default function ProximityMapOptimized({
  propertyLocation,
  propertyTitle = 'Imóvel',
  neighborhood = '',
  className = '',
  showHeader = true,
}: ProximityMapProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  
  // Lazy load
  const { ref: containerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '200px',
  });

  // Carregar Google Maps API
  useEffect(() => {
    if (!inView) return;
    
    const loadGoogleMaps = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('[ProximityMap] Google Maps API key not configured');
        return;
      }

      if ((window as any).google?.maps) {
        setMapReady(true);
        return;
      }

      if ((window as any).__gmapsLoading) {
        await (window as any).__gmapsLoading;
        setMapReady(true);
        return;
      }

      const loader = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=pt-BR&region=BR`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
      });

      (window as any).__gmapsLoading = loader;
      
      try {
        await loader;
        setMapReady(true);
      } catch (error) {
        console.error('[ProximityMap] Error loading Google Maps:', error);
      }
    };

    loadGoogleMaps();
  }, [inView]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: propertyLocation,
      zoom: 16, // ✅ Zoom mais próximo (de 15 para 16)
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstanceRef.current = map;

    // ✅ Ícone do imóvel principal - Pin azul Pharos simples e destacado
    const propertyIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="48" height="60" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="mainPinShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
              <feOffset dx="0" dy="5" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.6"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <g filter="url(#mainPinShadow)">
            <!-- Pin azul Pharos -->
            <path d="M24 2C12.4 2 3 11.4 3 23c0 17.5 21 35 21 35s21-17.5 21-35c0-11.6-9.4-21-21-21z" 
                  fill="#054ADA" 
                  stroke="#ffffff" 
                  stroke-width="3"/>
            
            <!-- Círculo branco interno simples -->
            <circle cx="24" cy="23" r="8" fill="white" opacity="0.95"/>
          </g>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(48, 60),
      anchor: new google.maps.Point(24, 60),
    };

    // Marker do imóvel com ícone personalizado
    new google.maps.Marker({
      position: propertyLocation,
      map,
      title: propertyTitle,
      icon: propertyIcon,
      zIndex: 1000,
    });

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      infoWindowsRef.current.forEach(iw => iw.close());
      markersRef.current = [];
      infoWindowsRef.current = [];
    };
  }, [mapReady, propertyLocation, propertyTitle]);

  // Buscar POIs
  const searchPOIs = useCallback(async (category: keyof typeof POI_CATEGORIES) => {
    if (!mapInstanceRef.current || loading) return;

    setLoading(true);
    const map = mapInstanceRef.current;
    const service = new google.maps.places.PlacesService(map);
    const config = POI_CATEGORIES[category];

    try {
      const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        service.nearbySearch(
          {
            location: propertyLocation,
            radius: 1000, // ✅ Apenas locais em até 1km (de 2500m para 1000m)
            type: config.type,
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              reject(new Error(`Places API error: ${status}`));
            }
          }
        );
      });

      // Limpar markers anteriores
      markersRef.current.forEach(m => m.setMap(null));
      infoWindowsRef.current.forEach(iw => iw.close());
      markersRef.current = [];
      infoWindowsRef.current = [];

      // Processar top 8 resultados
      const newPOIs: POI[] = results.slice(0, 8).map((place, index) => {
        const location = place.geometry?.location;
        if (!location) return null;

        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(propertyLocation.lat, propertyLocation.lng),
          location
        );

        // Criar marker com ícone customizado
        const marker = new google.maps.Marker({
          position: location,
          map: mapInstanceRef.current!,
          title: place.name,
          icon: createCustomIcon(config.color, ICON_PATHS[category]),
          animation: google.maps.Animation.DROP,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui;">
              <strong style="color: #1f2937; font-size: 14px;">${place.name}</strong>
              <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">
                ${formatDistance(distance)} • ${calculateWalkTime(distance)}min a pé
              </p>
              ${place.rating ? `<p style="margin: 4px 0 0; color: #f59e0b; font-size: 12px;">⭐ ${place.rating.toFixed(1)}</p>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindowsRef.current.forEach(iw => iw.close());
          infoWindow.open(mapInstanceRef.current!, marker);
          setSelectedPoiId(place.place_id || `poi-${index}`);
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);

        return {
          id: place.place_id || `poi-${index}`,
          name: place.name || 'Local',
          category,
          distance,
          walkTime: calculateWalkTime(distance),
          lat: location.lat(),
          lng: location.lng(),
          rating: place.rating,
        };
      }).filter(Boolean) as POI[];

      setPois(newPOIs.sort((a, b) => a.distance - b.distance));
    } catch (error) {
      console.error('[ProximityMap] Error searching POIs:', error);
    } finally {
      setLoading(false);
    }
  }, [propertyLocation, loading]);

  // Handler para categoria
  const handleCategoryClick = (category: keyof typeof POI_CATEGORIES) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      markersRef.current.forEach(m => m.setMap(null));
      infoWindowsRef.current.forEach(iw => iw.close());
      markersRef.current = [];
      infoWindowsRef.current = [];
      setPois([]);
      setSelectedPoiId(null);
    } else {
      setActiveCategory(category);
      searchPOIs(category);
    }
  };

  // Handler para POI click
  const handlePoiClick = (poi: POI) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: poi.lat, lng: poi.lng });
      mapInstanceRef.current.setZoom(17);
      setSelectedPoiId(poi.id);
      
      // Abrir infoWindow do marker correspondente
      const markerIndex = pois.findIndex(p => p.id === poi.id);
      if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
        infoWindowsRef.current.forEach(iw => iw.close());
        infoWindowsRef.current[markerIndex].open(mapInstanceRef.current!, markersRef.current[markerIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {showHeader && (
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pharos-blue-500" />
            Proximidades
          </h3>
          <p className="text-sm text-gray-600">
            Descubra o que há perto do imóvel
          </p>
        </div>
      )}

      {/* Filtros minimalistas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(POI_CATEGORIES).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeCategory === key;
          
          return (
            <button
              key={key}
              onClick={() => handleCategoryClick(key as keyof typeof POI_CATEGORIES)}
              disabled={loading}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isActive
                  ? 'bg-pharos-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-pharos-blue-300 hover:bg-gray-50'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {config.label}
              {isActive && pois.length > 0 && (
                <span className="ml-0.5 bg-white text-pharos-blue-500 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pois.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Layout Side-by-Side */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Mapa - 60% */}
        <div className="lg:w-3/5 relative">
          <div className="rounded-xl overflow-hidden shadow-md">
            <div
              ref={mapRef}
              className="w-full h-[400px] lg:h-[500px] bg-gray-100"
            />
            
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 text-pharos-blue-500 animate-spin mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Buscando...</p>
                </div>
              </div>
            )}

            {!mapReady && inView && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Lista - 40% */}
        <div className="lg:w-2/5">
          {pois.length > 0 ? (
            <div className="space-y-1.5 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {pois.map((poi) => {
                const config = POI_CATEGORIES[poi.category];
                const Icon = config.icon;
                const isSelected = selectedPoiId === poi.id;
                
                return (
                  <button
                    key={poi.id}
                    onClick={() => handlePoiClick(poi)}
                    className={`
                      w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all text-left
                      border-l-2
                      ${isSelected
                        ? 'bg-pharos-blue-50 border-pharos-blue-500 shadow-sm'
                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                        {poi.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <Navigation className="w-3 h-3" />
                        <span>{formatDistance(poi.distance)}</span>
                        <span>•</span>
                        <span>{poi.walkTime}min</span>
                        {poi.rating && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600">⭐ {poi.rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : activeCategory ? (
            <div className="flex items-center justify-center h-[400px] lg:h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum local encontrado</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] lg:h-[500px] bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl border-2 border-dashed border-blue-200">
              <div className="text-center px-6 py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-5">
                  <MapPin className="w-10 h-10 text-pharos-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Selecione uma categoria
                </h3>
                <p className="text-base text-gray-600 mb-6 max-w-xs mx-auto leading-relaxed">
                  Clique em um dos filtros acima para ver locais próximos ao imóvel
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-pharos-blue-500 font-medium">
                  <span>👆</span>
                  <span>Escolha acima</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
