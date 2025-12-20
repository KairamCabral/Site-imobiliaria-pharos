/**
 * Hook para geocodificar propriedades que não têm coordenadas
 * Converte endereços em coordenadas usando Google Maps Geocoding API
 */

import { useState, useEffect } from 'react';
import { geocodeAddress } from '@/utils/geocoding';

interface PropertyWithGeocoding {
  id: string;
  latitude: number;
  longitude: number;
  needsGeocoding?: boolean;
  addressForGeocoding?: string;
  [key: string]: any;
}

export function useGeocodedProperties<T extends PropertyWithGeocoding>(
  properties: T[],
  enabled: boolean = true
): T[] {
  const [geocodedProperties, setGeocodedProperties] = useState<T[]>(properties);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (!enabled || isGeocoding) return;

    // Verificar se Google Maps está disponível
    if (typeof window === 'undefined' || !(window as any).google?.maps?.Geocoder) {
      console.log('[useGeocodedProperties] ⏳ Aguardando Google Maps carregar...');
      setGeocodedProperties(properties);
      
      // Tentar novamente após 3 segundos
      const retryTimer = setTimeout(() => {
        console.log('[useGeocodedProperties] 🔄 Tentando novamente...');
        setIsGeocoding(false);
      }, 3000);
      
      return () => clearTimeout(retryTimer);
    }
    
    console.log('[useGeocodedProperties] ✅ Google Maps Geocoder disponível!');

    const needsGeocoding = properties.filter(p => p.needsGeocoding && p.addressForGeocoding);
    
    if (needsGeocoding.length === 0) {
      setGeocodedProperties(properties);
      return;
    }

    console.log(`[useGeocodedProperties] 🔄 Iniciando geocoding de ${needsGeocoding.length} imóveis...`);
    setIsGeocoding(true);

    // Geocodificar em lotes para não sobrecarregar a API
    const batchSize = 5;
    const delay = 200; // ms entre requisições

    const geocodeBatch = async () => {
      const results = [...properties];
      
      for (let i = 0; i < needsGeocoding.length; i += batchSize) {
        const batch = needsGeocoding.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (property) => {
            if (!property.addressForGeocoding) return;
            
            const coords = await geocodeAddress(property.addressForGeocoding);
            
            if (coords) {
              const index = results.findIndex(p => p.id === property.id);
              if (index !== -1) {
                results[index] = {
                  ...results[index],
                  latitude: coords.lat,
                  longitude: coords.lng,
                  needsGeocoding: false,
                };
              }
            }
          })
        );

        // Atualizar estado intermediário
        setGeocodedProperties([...results]);
        
        // Aguardar antes do próximo lote (exceto no último)
        if (i + batchSize < needsGeocoding.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      setIsGeocoding(false);
      console.log(`[useGeocodedProperties] ✅ Geocoding concluído!`);
    };

    geocodeBatch();
  }, [properties, enabled, isGeocoding]);

  return geocodedProperties;
}

