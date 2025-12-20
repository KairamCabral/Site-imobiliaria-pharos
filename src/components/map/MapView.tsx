'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds, LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { createPropertyMarkerIcon } from './PropertyMarker';
import PropertyMiniCardHorizontal from './PropertyMiniCardHorizontal';
import MapControls from './MapControls';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type BoundsLike =
  | LatLngBounds
  | {
      north: number;
      south: number;
      east: number;
      west: number;
    };

interface Property {
  id: string;
  titulo: string;
  preco: number;
  quartos: number;
  suites: number;
  vagas: number;
  area: number;
  latitude: number;
  longitude: number;
  imagem: string;
  imagens?: string[];
  destaque?: boolean;
  distanciaMar?: number;
}

interface MapViewProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: BoundsLike | null) => void;
  onSearch?: () => void;
  selectedPropertyId?: string | null;
  onPropertySelect?: (id: string | null) => void;
}

const DEFAULT_CENTER: [number, number] = [-26.9906, -48.645];

const getGoogleMapsKey = () =>
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
  process.env.NEXT_PUBLIC_GMAPS_KEY;

function loadGoogleMaps(apiKey?: string) {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (!apiKey) return Promise.reject(new Error('Missing API key'));
  if ((window as any).google?.maps) return Promise.resolve();
  if ((window as any).__gmapsLoading) return (window as any).__gmapsLoading as Promise<void>;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker,places,geometry&language=pt-BR&region=BR`;
  script.async = true;
  script.defer = true;

  const loader = new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Erro ao carregar Google Maps'));
  });

  (window as any).__gmapsLoading = loader;
  document.head.appendChild(script);
  return loader;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const createMarkerContent = (property: Property, isSelected: boolean) => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.transition = 'all 0.2s ease';
  wrapper.style.transform = isSelected ? 'scale(1.08)' : 'scale(1)';
  wrapper.style.zIndex = isSelected ? '1000' : '1';
  wrapper.dataset.id = property.id;

  const pill = document.createElement('div');
  pill.style.position = 'relative';
  pill.style.display = 'flex';
  pill.style.alignItems = 'center';
  pill.style.gap = property.destaque ? '6px' : '0';
  pill.style.backgroundColor = isSelected ? '#054ADA' : '#192233';
  pill.style.color = '#ffffff';
  pill.style.padding = '6px 12px';
  pill.style.borderRadius = '20px';
  pill.style.fontSize = '13px';
  pill.style.fontWeight = '700';
  pill.style.whiteSpace = 'nowrap';
  pill.style.boxShadow = isSelected
    ? '0 4px 12px rgba(5, 74, 218, 0.4), 0 0 0 2px #054ADA'
    : '0 2px 8px rgba(0, 0, 0, 0.25)';
  pill.textContent = formatPrice(property.preco);

  if (property.destaque) {
    const dot = document.createElement('div');
    dot.style.width = '6px';
    dot.style.height = '6px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = '#C8A968';
    dot.style.flexShrink = '0';
    pill.prepend(dot);
  }

  const pointer = document.createElement('div');
  pointer.style.width = '0';
  pointer.style.height = '0';
  pointer.style.borderLeft = '6px solid transparent';
  pointer.style.borderRight = '6px solid transparent';
  pointer.style.borderTop = `8px solid ${isSelected ? '#054ADA' : '#192233'}`;
  pointer.style.marginTop = '-1px';

  wrapper.appendChild(pill);
  wrapper.appendChild(pointer);
  return wrapper;
};

const createClusterRenderer = () => ({
  render: ({ count, position }: { count: number; position: google.maps.LatLng }) => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.width = '44px';
    div.style.height = '44px';
    div.style.background = '#054ADA';
    div.style.color = '#fff';
    div.style.borderRadius = '50%';
    div.style.fontWeight = '700';
    div.style.fontSize = '14px';
    div.style.boxShadow = '0 6px 16px rgba(5, 74, 218, 0.35)';
    div.textContent = String(count);

    return new google.maps.marker.AdvancedMarkerElement({
      position,
      content: div,
      zIndex: 100 + count,
      title: `${count} imóveis`,
    });
  },
});

const toBoundsLiteral = (bounds?: google.maps.LatLngBounds | null): BoundsLike | null => {
  if (!bounds) return null;
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  return {
    north: ne.lat(),
    east: ne.lng(),
    south: sw.lat(),
    west: sw.lng(),
  };
};

function GoogleMapView({
  properties,
  center = DEFAULT_CENTER,
  zoom = 13,
  onBoundsChange,
  onSearch,
  selectedPropertyId,
  onPropertySelect,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markersByIdRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const infoWindowRootRef = useRef<Root | null>(null);
  const [hasMovedMap, setHasMovedMap] = useState(false);
  const hasInteractedRef = useRef(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [geocodedProperties, setGeocodedProperties] = useState<Property[]>(properties);
  const geocodingInProgressRef = useRef(false);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [markersLoadingProgress, setMarkersLoadingProgress] = useState<number>(0);

  const handleCloseMiniCard = useCallback(() => {
    setSelectedProperty(null);
    onPropertySelect?.(null);
    infoWindowRef.current?.close();
    infoWindowRootRef.current?.unmount();
  }, [onPropertySelect]);

  const openInfoWindow = useCallback(
    (property: Property, anchor: google.maps.marker.AdvancedMarkerElement) => {
      console.log('[openInfoWindow] 🎯 Iniciando abertura do InfoWindow para:', property.id);
      
      const map = mapInstanceRef.current;
      if (!map) {
        console.error('[openInfoWindow] ❌ Mapa não disponível!');
        return;
      }

      // FECHAR InfoWindow existente primeiro (evita duplicatas)
      if (infoWindowRef.current) {
        console.log('[openInfoWindow] 🔄 Fechando InfoWindow anterior');
        infoWindowRef.current.close();
      }

      console.log('[openInfoWindow] 📦 Criando container para o card...');
      // Criar container limpo (sem wrappers extras)
      const container = document.createElement('div');
      
      // Limpar root anterior
      if (infoWindowRootRef.current) {
        infoWindowRootRef.current.unmount();
      }

      // Criar novo root e renderizar ANTES de abrir
      const root = createRoot(container);
      infoWindowRootRef.current = root;

      root.render(
        <PropertyMiniCardHorizontal
          id={property.id}
          titulo={property.titulo}
          imagens={property.imagens || [property.imagem]}
          preco={property.preco}
          quartos={property.quartos}
          vagas={property.vagas}
          area={property.area}
          onClose={handleCloseMiniCard}
        />,
      );

      // Criar InfoWindow se não existir
      if (!infoWindowRef.current) {
        infoWindowRef.current = new google.maps.InfoWindow({
          disableAutoPan: false,
        });
      }

      // Definir conteúdo
      infoWindowRef.current.setContent(container);
      
      // Aplicar estilos para remover container branco
      google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
        // Remover padding e background do container
        const iwOuter = document.querySelector('.gm-style-iw-d');
        const iwContainer = document.querySelector('.gm-style-iw-c');
        const iwClose = document.querySelector('.gm-ui-hover-effect');
        
        if (iwOuter) {
          (iwOuter as HTMLElement).style.cssText = `
            overflow: visible !important;
            padding: 0 !important;
            background: transparent !important;
          `;
        }
        
        if (iwContainer) {
          (iwContainer as HTMLElement).style.cssText = `
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
          `;
        }

        // Esconder botão de fechar do Google Maps
        if (iwClose) {
          (iwClose as HTMLElement).style.display = 'none';
        }
      });

      // Abrir InfoWindow
      infoWindowRef.current.open({
        map,
        anchor,
        shouldFocus: false,
      });
      
      console.log('[openInfoWindow] ✅ InfoWindow aberto com sucesso!');
    },
    [handleCloseMiniCard],
  );

  const handlePropertyClick = useCallback(
    (property: Property, marker: google.maps.marker.AdvancedMarkerElement) => {
      console.log('[GoogleMapView] 🖱️ CLIQUE no marcador:', property.id);
      
      // Prevenir cliques duplicados
      if (selectedProperty?.id === property.id && infoWindowRef.current && (infoWindowRef.current as any).getMap?.()) {
        console.log('[GoogleMapView] ℹ️ InfoWindow já aberto para', property.id);
        return; // InfoWindow já está aberto para esta propriedade
      }

      console.log('[GoogleMapView] ✅ Abrindo card para:', property.titulo);
      setSelectedProperty(property);
      onPropertySelect?.(property.id);
      
      // Pequeno delay para garantir render do React antes de abrir InfoWindow
      setTimeout(() => {
        openInfoWindow(property, marker);
      }, 0);
    },
    [selectedProperty, onPropertySelect, openInfoWindow],
  );

  const handleSearchInArea = useCallback(() => {
    setHasMovedMap(false);
    onSearch?.();
  }, [onSearch]);

  const handleGeolocation = useCallback(() => {
    if (!mapInstanceRef.current || !navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextCenter = { lat: coords.latitude, lng: coords.longitude };
        mapInstanceRef.current?.panTo(nextCenter);
        mapInstanceRef.current?.setZoom(15);
        setHasMovedMap(false);
      },
      (err) => {
        console.error('Erro ao obter localização', err);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  // Sistema de geocoding dinâmico (só viewport atual)
  const performViewportGeocoding = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const mapBounds = {
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng(),
    };

    // Filtrar apenas propriedades que precisam geocoding E estão no viewport
    const { groupPropertiesByPriority } = await import('@/utils/mapBoundsUtils');
    const { geocodeBatch } = await import('@/utils/optimizedGeocoding');

    const needsGeocoding = geocodedProperties.filter(
      p => (p as any).needsGeocoding && (p as any).addressForGeocoding
    );

    if (needsGeocoding.length === 0) return;

    const priorityGroups = groupPropertiesByPriority(needsGeocoding, mapBounds);
    
    // Só geocodificar os IMEDIATOS (visíveis agora)
    if (priorityGroups.immediate.length === 0) return;

    console.log(`[GoogleMapView] 🎯 Geocoding viewport: ${priorityGroups.immediate.length} imóveis visíveis`);

    const requests = priorityGroups.immediate.map(p => ({
      propertyId: p.id,
      address: (p as any).addressForGeocoding,
    }));

    // Processar em chunks rápidos
    const results = await geocodeBatch(requests);

    setGeocodedProperties(currentProps => {
      return currentProps.map(prop => {
        const result = results.find(r => r.propertyId === prop.id);
        if (result) {
          return {
            ...prop,
            latitude: result.lat,
            longitude: result.lng,
            needsGeocoding: false,
          };
        }
        return prop;
      });
    });

    console.log(`[GoogleMapView] ✅ Viewport geocodificado: ${results.length} imóveis`);
  }, [geocodedProperties]);

  // Geocodificar viewport inicial + listeners para mudanças
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || geocodingInProgressRef.current) return;
    
    const needsGeocoding = properties.filter(p => (p as any).needsGeocoding && (p as any).addressForGeocoding);
    
    if (needsGeocoding.length === 0) {
      setGeocodedProperties(properties);
      return;
    }

    geocodingInProgressRef.current = true;
    setGeocodedProperties(properties);
    
    const performSmartGeocoding = async () => {
      const { geocodeBatch } = await import('@/utils/optimizedGeocoding');
      const { groupPropertiesByPriority } = await import('@/utils/mapBoundsUtils');
      
      // Obter bounds atuais do mapa
      const bounds = map.getBounds();
      if (!bounds) {
        console.warn('[GoogleMapView] Bounds não disponível ainda');
        geocodingInProgressRef.current = false;
        return;
      }

      const mapBounds = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng(),
      };

      // Agrupar por prioridade (viewport → buffer → resto)
      const priorityGroups = groupPropertiesByPriority(needsGeocoding, mapBounds);
      
      console.log(`[GoogleMapView] 🎯 Priorização inteligente:`);
      console.log(`   🔴 Visíveis agora: ${priorityGroups.immediate.length}`);
      console.log(`   🟡 Buffer próximo: ${priorityGroups.nearby.length}`);
      console.log(`   ⚪ Distantes: ${priorityGroups.distant.length}`);

      let processedResults: any[] = [];
      const CHUNK_SIZE = 15; // Aumentado para 15 (mais rápido)

      // Função auxiliar para processar um grupo
      const processGroup = async (group: any[], groupName: string) => {
        if (group.length === 0) return;
        
        const requests = group.map(p => ({
          propertyId: p.id,
          address: (p as any).addressForGeocoding,
        }));

        for (let i = 0; i < requests.length; i += CHUNK_SIZE) {
          const chunk = requests.slice(i, i + CHUNK_SIZE);
          const chunkResults = await geocodeBatch(chunk);
          processedResults = [...processedResults, ...chunkResults];
          
          // Atualizar marcadores imediatamente
          setGeocodedProperties(currentProps => {
            return currentProps.map(prop => {
              const result = processedResults.find(r => r.propertyId === prop.id);
              if (result) {
                return {
                  ...prop,
                  latitude: result.lat,
                  longitude: result.lng,
                  needsGeocoding: false,
                };
              }
              return prop;
            });
          });
          
          console.log(`[GoogleMapView] ${groupName}: ${Math.min(i + CHUNK_SIZE, requests.length)}/${requests.length}`);
          
          // Delay menor entre chunks
          if (i + CHUNK_SIZE < requests.length) {
            await new Promise(r => setTimeout(r, 100));
          }
        }
      };

      // 1️⃣ Geocodificar IMEDIATOS (viewport atual) - PRIORIDADE MÁXIMA
      await processGroup(priorityGroups.immediate, '🔴 Visíveis');
      
      // 2️⃣ Geocodificar PRÓXIMOS (buffer) - PRIORIDADE MÉDIA
      await processGroup(priorityGroups.nearby, '🟡 Próximos');
      
      // 3️⃣ Geocodificar DISTANTES (resto) - BAIXA PRIORIDADE
      // Usar chunks maiores para ir mais rápido
      if (priorityGroups.distant.length > 0) {
        const distantRequests = priorityGroups.distant.map(p => ({
          propertyId: p.id,
          address: (p as any).addressForGeocoding,
        }));

        const LARGE_CHUNK = 25; // Chunks maiores para distantes
        for (let i = 0; i < distantRequests.length; i += LARGE_CHUNK) {
          const chunk = distantRequests.slice(i, i + LARGE_CHUNK);
          const chunkResults = await geocodeBatch(chunk);
          processedResults = [...processedResults, ...chunkResults];
          
          setGeocodedProperties(currentProps => {
            return currentProps.map(prop => {
              const result = processedResults.find(r => r.propertyId === prop.id);
              if (result) {
                return { ...prop, latitude: result.lat, longitude: result.lng, needsGeocoding: false };
              }
              return prop;
            });
          });
          
          if (i % 50 === 0) {
            console.log(`[GoogleMapView] ⚪ Distantes: ${i}/${distantRequests.length}`);
          }
          
          await new Promise(r => setTimeout(r, 50)); // Delay menor
        }
      }

      geocodingInProgressRef.current = false;
      console.log(`[GoogleMapView] ✅ Geocoding completo! ${processedResults.length} propriedades posicionadas.`);
    };

    // Aguardar mapa estar pronto antes de pegar bounds
    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
      // Marcar Google Maps como totalmente pronto
      setIsGoogleMapsReady(true);
      console.log('[GoogleMapView] ✅ Google Maps TOTALMENTE carregado e pronto!');
      performSmartGeocoding();
    });
  }, [properties]);

  // Listener para geocoding dinâmico ao mover mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let geocodingTimeout: NodeJS.Timeout;

    // Geocodificar quando parar de mover (debounce de 1s)
    const handleIdle = () => {
      clearTimeout(geocodingTimeout);
      geocodingTimeout = setTimeout(() => {
        performViewportGeocoding();
      }, 1000);
    };

    const idleListener = map.addListener('idle', handleIdle);

    return () => {
      clearTimeout(geocodingTimeout);
      idleListener.remove();
    };
  }, [performViewportGeocoding]);

  // Inicializa mapa do Google
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    console.log('[GoogleMapView] 🗺️ Inicializando mapa...');
    
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: center[0], lng: center[1] },
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy',
      backgroundColor: '#E8ECF2',
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID', // ID necessário para Advanced Markers
    });
    mapInstanceRef.current = map;

    // 🔧 FIX: Forçar resize após inicialização (corrige mapa branco no desktop)
    setTimeout(() => {
      google.maps.event.trigger(map, 'resize');
      map.setCenter({ lat: center[0], lng: center[1] });
      console.log('[GoogleMapView] ✅ Resize triggered - tiles should load now');
    }, 100);

    // Trigger resize quando tiles carregarem
    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
      console.log('[GoogleMapView] 🎨 Tiles loaded!');
      google.maps.event.trigger(map, 'resize');
    });

    const emitBounds = () => {
      const bounds = toBoundsLiteral(map.getBounds());
      if (bounds && onBoundsChange) onBoundsChange(bounds);
    };

    const idleListener = map.addListener('idle', emitBounds);
    const dragStart = map.addListener('dragstart', () => {
      hasInteractedRef.current = true;
    });
    const dragEnd = map.addListener('dragend', () => {
      if (hasInteractedRef.current) setHasMovedMap(true);
      emitBounds();
    });
    const zoomChanged = map.addListener('zoom_changed', () => {
      hasInteractedRef.current = true;
      setHasMovedMap(true);
      emitBounds();
    });

    // 🔧 FIX ADICIONAL: Observer para detectar mudanças de tamanho do container (corrige mapa branco)
    const resizeObserver = new ResizeObserver(() => {
      google.maps.event.trigger(map, 'resize');
      map.setCenter({ lat: center[0], lng: center[1] });
      console.log('[GoogleMapView] 📐 Container resized, map refreshed');
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    return () => {
      idleListener.remove();
      dragEnd.remove();
      zoomChanged.remove();
      dragStart.remove();
      resizeObserver.disconnect();
    };
  }, [center, zoom, onBoundsChange]);

  // Auto-ajustar mapa para enquadrar todos os imóveis (fitBounds automático)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || hasInteractedRef.current) return; // Não ajustar se usuário já moveu o mapa
    
    // Filtrar propriedades com coordenadas válidas
    const validProperties = geocodedProperties.filter(
      p => p.latitude && p.longitude && 
           !isNaN(p.latitude) && !isNaN(p.longitude) &&
           p.latitude >= -90 && p.latitude <= 90 &&
           p.longitude >= -180 && p.longitude <= 180
    );

    if (validProperties.length === 0) return;

    // Aguardar mapa estar pronto
    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
      const bounds = new google.maps.LatLngBounds();
      
      validProperties.forEach(property => {
        bounds.extend({
          lat: property.latitude,
          lng: property.longitude,
        });
      });

      // Se houver apenas 1 propriedade, centralizar e dar zoom
      if (validProperties.length === 1) {
        map.setCenter({
          lat: validProperties[0].latitude,
          lng: validProperties[0].longitude,
        });
        map.setZoom(15);
        console.log(`[GoogleMapView] 📍 Centralizado em 1 imóvel`);
      } else {
        // Se houver múltiplas, ajustar bounds com padding
        map.fitBounds(bounds, {
          top: 80,
          right: 50,
          bottom: 50,
          left: 50,
        });
        console.log(`[GoogleMapView] 📍 Enquadrados ${validProperties.length} imóveis`);
      }
    });
  }, [geocodedProperties]);

  // Renderiza marcadores e clusters (OTIMIZADO - Carregamento Progressivo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 🔒 VERIFICAÇÃO DE SEGURANÇA: Google Maps totalmente carregado?
    if (
      typeof google === 'undefined' ||
      !google.maps ||
      !google.maps.marker ||
      !google.maps.marker.AdvancedMarkerElement
    ) {
      console.warn('[GoogleMapView] ⚠️ Google Maps ainda não carregado completamente, aguardando...');
      return;
    }

    console.log(`[GoogleMapView] 🚀 Iniciando renderização OTIMIZADA de ${geocodedProperties.length} marcadores...`);
    const startTime = performance.now();

    // Limpar marcadores existentes
    clustererRef.current?.clearMarkers();
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];
    markersByIdRef.current.clear();

    // 🎯 OTIMIZAÇÃO 1: Renderização em chunks (50 de cada vez)
    const CHUNK_SIZE = 50;
    const chunks: Property[][] = [];
    for (let i = 0; i < geocodedProperties.length; i += CHUNK_SIZE) {
      chunks.push(geocodedProperties.slice(i, i + CHUNK_SIZE));
    }

    let processedCount = 0;
    const allMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    // Função para processar um chunk
    const processChunk = (chunkIndex: number) => {
      if (chunkIndex >= chunks.length) {
        // Todos os chunks processados!
        const endTime = performance.now();
        console.log(`[GoogleMapView] ✅ ${allMarkers.length} marcadores renderizados em ${Math.round(endTime - startTime)}ms`);
        setMarkersLoadingProgress(100);
        return;
      }

      const chunk = chunks[chunkIndex];
      
      // Criar marcadores do chunk atual
      const chunkMarkers = chunk.map((property) => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: property.latitude, lng: property.longitude },
          content: createMarkerContent(property, property.id === selectedPropertyId),
          title: property.titulo,
          zIndex: property.id === selectedPropertyId ? 200 : 1,
        });

        marker.addListener('gmp-click', () => handlePropertyClick(property, marker));
        markersByIdRef.current.set(property.id, marker);
        return marker;
      });

      allMarkers.push(...chunkMarkers);
      processedCount += chunk.length;

      // Atualizar progresso
      const progress = Math.round((processedCount / geocodedProperties.length) * 100);
      setMarkersLoadingProgress(progress);

      // Adicionar ao cluster
      if (!clustererRef.current) {
        clustererRef.current = new MarkerClusterer({
          map,
          markers: chunkMarkers,
          renderer: createClusterRenderer(),
        });
      } else {
        clustererRef.current.addMarkers(chunkMarkers);
      }

      console.log(`[GoogleMapView] 📦 Chunk ${chunkIndex + 1}/${chunks.length} (${processedCount}/${geocodedProperties.length}) - ${progress}%`);

      // 🎯 OTIMIZAÇÃO 2: requestIdleCallback para não bloquear UI
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => processChunk(chunkIndex + 1), { timeout: 1000 });
      } else {
        // Fallback: setTimeout
        setTimeout(() => processChunk(chunkIndex + 1), 0);
      }
    };

    // Iniciar processamento do primeiro chunk imediatamente
    processChunk(0);

    markersRef.current = allMarkers;

    // Cleanup
    return () => {
      allMarkers.forEach(marker => {
        marker.map = null;
      });
    };
  }, [geocodedProperties, selectedPropertyId, handlePropertyClick, isGoogleMapsReady]);

  // Atualiza seleção visual quando selectedPropertyId muda externamente
  useEffect(() => {
    markersByIdRef.current.forEach((marker, id) => {
      const content = marker.content as HTMLElement | null;
      if (!content) return;
      const isSelected = id === selectedPropertyId;
      const pill = content.firstElementChild as HTMLElement | null;
      const pointer = content.lastElementChild as HTMLElement | null;
      if (pill && pointer) {
        pill.style.backgroundColor = isSelected ? '#054ADA' : '#192233';
        pill.style.boxShadow = isSelected
          ? '0 4px 12px rgba(5, 74, 218, 0.4), 0 0 0 2px #054ADA'
          : '0 2px 8px rgba(0, 0, 0, 0.25)';
        pointer.style.borderTop = `8px solid ${isSelected ? '#054ADA' : '#192233'}`;
        content.style.transform = isSelected ? 'scale(1.08)' : 'scale(1)';
      }
    });
  }, [selectedPropertyId]);

  // Cleanup do InfoWindow
  useEffect(() => {
    return () => {
      infoWindowRootRef.current?.unmount();
      clustererRef.current?.clearMarkers();
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];
    };
  }, []);

  return (
    <div className="relative w-full h-full" role="application" aria-label="Mapa de imóveis (Google)">
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden bg-[#E8ECF2]" />

      <MapControls
        onZoomIn={() => {
          const map = mapInstanceRef.current;
          if (map) map.setZoom((map.getZoom() ?? zoom) + 1);
        }}
        onZoomOut={() => {
          const map = mapInstanceRef.current;
          if (map) map.setZoom((map.getZoom() ?? zoom) - 1);
        }}
        onGeolocation={handleGeolocation}
      />

      {hasMovedMap && onSearch && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={handleSearchInArea}
            className="bg-[#054ADA] hover:bg-[#043bb8] text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Buscar nesta área
          </button>
        </div>
      )}

      {/* Indicador de Progresso de Carregamento */}
      {markersLoadingProgress > 0 && markersLoadingProgress < 100 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#054ADA] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-[#192233]">
                Carregando marcadores... {markersLoadingProgress}%
              </span>
            </div>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#054ADA] rounded-full transition-all duration-300"
                style={{ width: `${markersLoadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de cluster nativo usando leaflet.markercluster
 */
interface LeafletClusterGroupProps {
  children: React.ReactNode;
  iconCreateFunction: (cluster: any) => L.DivIcon;
  maxClusterRadius?: number;
}

function LeafletClusterGroup({ 
  children, 
  iconCreateFunction, 
  maxClusterRadius = 60 
}: LeafletClusterGroupProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Criar cluster group
  useEffect(() => {
    if (!map) return;

    clusterGroupRef.current = L.markerClusterGroup({
      maxClusterRadius,
      iconCreateFunction,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      chunkedLoading: true,
    });

    map.addLayer(clusterGroupRef.current);

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current.clearLayers();
      }
    };
  }, [map, iconCreateFunction, maxClusterRadius]);

  // Sincronizar marcadores com children
  useEffect(() => {
    if (!clusterGroupRef.current) return;

    const cluster = clusterGroupRef.current;
    const newMarkers = new Map<string, L.Marker>();

    // Processar children (componentes Marker do react-leaflet)
    React.Children.forEach(children, (child: any) => {
      if (!child || !child.props || !child.key) return;

      const key = child.key as string;
      const { position, icon, eventHandlers, children: markerChildren } = child.props;

      // Reutilizar marcador existente ou criar novo
      let marker = markersRef.current.get(key);
      
      if (!marker) {
        marker = L.marker(position, { icon });
        
        // Adicionar eventos
        if (eventHandlers?.click) {
          marker.on('click', eventHandlers.click);
        }

        // Adicionar popup se houver children (Popup component)
        if (markerChildren) {
          const popupContent = document.createElement('div');
          // Renderizar o conteúdo do Popup diretamente no DOM
          const root = createRoot(popupContent);
          root.render(markerChildren.props.children);
          
          marker.bindPopup(popupContent, {
            closeButton: markerChildren.props.closeButton ?? true,
            className: markerChildren.props.className || '',
          });
        }

        cluster.addLayer(marker);
      }

      newMarkers.set(key, marker);
    });

    // Remover marcadores que não existem mais
    markersRef.current.forEach((marker, key) => {
      if (!newMarkers.has(key)) {
        cluster.removeLayer(marker);
      }
    });

    markersRef.current = newMarkers;

    return () => {
      // Cleanup não é necessário aqui pois é feito no useEffect do cluster group
    };
  }, [children]);

  return null;
}

/**
 * Fallback Leaflet para cenários sem chave do Google ou falha de carregamento
 */
function LeafletMapView({
  properties,
  center = DEFAULT_CENTER,
  zoom = 13,
  onBoundsChange,
  onSearch,
  selectedPropertyId,
  onPropertySelect,
}: MapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hasMovedMap, setHasMovedMap] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const handleBoundsChange = useCallback(
    (bounds: LatLngBounds) => {
      setHasMovedMap(true);
      onBoundsChange?.(bounds);
    },
    [onBoundsChange],
  );

  const handleSearchInArea = useCallback(() => {
    setHasMovedMap(false);
    onSearch?.();
  }, [onSearch]);

  const handleGeolocation = useCallback(() => {
    if (!mapInstance || !navigator?.geolocation) return;
      navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapInstance.setView([coords.latitude, coords.longitude], 15);
        setHasMovedMap(false);
      },
      (err) => console.error('Erro ao obter localização:', err),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [mapInstance]);

  const handleCloseMiniCard = useCallback(() => {
    setSelectedProperty(null);
    onPropertySelect?.(null);
    mapInstance?.closePopup();
  }, [mapInstance, onPropertySelect]);

  const handlePropertyClick = useCallback(
    (property: Property) => {
      setSelectedProperty(property);
      onPropertySelect?.(property.id);
    },
    [onPropertySelect],
  );

  const createClusterCustomIcon = useCallback((cluster: any) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: #054ADA;
        color: white;
        border-radius: 50%;
        font-size: 14px;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(5, 74, 218, 0.4);
      ">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: [40, 40],
    });
  }, []);

  return (
    <div className="relative w-full h-full" role="application" aria-label="Mapa de imóveis (Leaflet)">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full z-0"
        zoomControl={false}
        style={{ background: '#E8ECF2' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInstanceGetter onMapReady={setMapInstance} />
        <BoundsTracker onBoundsChange={handleBoundsChange} />

        <LeafletClusterGroup
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={60}
        >
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={[property.latitude, property.longitude] as LatLngExpression}
              icon={createPropertyMarkerIcon({
                preco: property.preco,
                isSelected: property.id === selectedPropertyId,
                isDestaque: property.destaque,
              })}
              eventHandlers={{
                click: () => handlePropertyClick(property),
              }}
            >
              <Popup closeButton={false} className="property-popup">
                <PropertyMiniCardHorizontal
                  id={property.id}
                  titulo={property.titulo}
                  imagens={property.imagens || [property.imagem]}
                  preco={property.preco}
                  quartos={property.quartos}
                  vagas={property.vagas}
                  area={property.area}
                  onClose={handleCloseMiniCard}
                />
              </Popup>
            </Marker>
          ))}
        </LeafletClusterGroup>
      </MapContainer>

      <MapControls
        onZoomIn={() => mapInstance?.zoomIn()}
        onZoomOut={() => mapInstance?.zoomOut()}
        onGeolocation={handleGeolocation}
      />

      {hasMovedMap && onSearch && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={handleSearchInArea}
            className="bg-[#054ADA] hover:bg-[#043bb8] text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Buscar nesta área
          </button>
        </div>
      )}

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .leaflet-popup-tip-container {
          display: none;
        }
        .property-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .custom-cluster-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

function BoundsTracker({ onBoundsChange }: { onBoundsChange?: (bounds: LatLngBounds) => void }) {
  const map = useMap();
  useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange(bounds);
      }
    },
  });
  return null;
}

function MapInstanceGetter({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

export default function MapView(props: MapViewProps) {
  const apiKey = getGoogleMapsKey();
  const [gmapsReady, setGmapsReady] = useState(false);
  const [gmapsFailed, setGmapsFailed] = useState(false);

  useEffect(() => {
    console.log('[MapView] Google Maps API Key presente?', !!apiKey);
    console.log('[MapView] Chave (primeiros 10 chars):', apiKey?.substring(0, 10) || 'NENHUMA');
    if (!apiKey) {
      console.log('[MapView] Usando Leaflet (fallback) - chave não encontrada');
      console.log('[MapView] Variáveis env disponíveis:', {
        key1: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 10),
        key2: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.substring(0, 10),
        key3: process.env.NEXT_PUBLIC_GMAPS_KEY?.substring(0, 10),
      });
      return;
    }
    console.log('[MapView] Carregando Google Maps...');
    loadGoogleMaps(apiKey)
      .then(() => {
        console.log('[MapView] Google Maps carregado com sucesso!');
        setGmapsReady(true);
      })
      .catch((err) => {
        console.warn('[GoogleMaps] Falha ao carregar API:', err);
        setGmapsFailed(true);
      });
  }, [apiKey]);

  if (apiKey && gmapsReady) {
    return <GoogleMapView {...props} />;
  }

  if (apiKey && !gmapsFailed && !gmapsReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F7F9FC] rounded-2xl border border-[#E8ECF2]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#054ADA] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#192233] font-semibold">Carregando Google Maps…</p>
          <p className="text-[#8E99AB] text-sm">Pré-carregando scripts para uma navegação suave.</p>
        </div>
      </div>
    );
  }

  return <LeafletMapView {...props} />;
}

