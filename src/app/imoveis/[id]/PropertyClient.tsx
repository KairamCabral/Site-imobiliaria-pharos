'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, Sparkles, Share2 } from 'lucide-react';

import { usePropertyDetails } from '@/hooks/usePropertyDetails';
import { useTracking } from '@/hooks/useTracking';
import PropertyDetailLoading from '@/components/PropertyDetailLoading';
import PropertiesError from '@/components/PropertiesError';
import dynamic from 'next/dynamic';

// ✅ OTIMIZAÇÃO: Dynamic imports com skeleton loaders para melhor UX e reduzir CLS
const PropertyMediaGallery = dynamic(
  () => import('@/components/PropertyMediaGallery'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[16/9] lg:aspect-[21/9] bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    ),
  },
);

import PropertySpecs from '@/components/PropertySpecs';
import PropertyConstructionTimeline from '@/components/PropertyConstructionTimeline';
import PropertyFeatures from '@/components/PropertyFeatures';
import FavoriteButton from '@/components/FavoriteButton';
import ImovelCard from '@/components/ImovelCard';
import PropertyCardHorizontal from '@/components/PropertyCardHorizontal';
import StructuredData from '@/components/StructuredData';
import { LazyLoadSection } from '@/components/LazyLoadSection';
import type { Property } from '@/domain/models';
import {
  getBreadcrumbParts,
  getDisplayPrice,
  getPropertyTitle,
  getPropertyCode,
  formatCurrencyBRL,
} from '@/utils/propertyDisplay';
import { buildPropertySearchParams } from '@/utils/propertySearchParams';
import { generateRealEstateListingSchema, generateBreadcrumbSchema, combineSchemas } from '@/utils/structuredData';

// ✅ Import estático do Swiper (necessário para funcionamento correto)
// A otimização de lazy load é feita através do LazyLoadSection
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ✅ OTIMIZAÇÃO: Componentes de contato com skeleton loaders
const PropertyContact = dynamic(
  () => import('@/components/PropertyContact').then((m) => m.default),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-3/4" />
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/2" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    ),
  },
);

const PropertyContactSticky = dynamic(
  () => import('@/components/PropertyContact').then((m) => m.PropertyContactSticky),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-4 z-40">
        <div className="container mx-auto flex items-center gap-4">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse flex-1" />
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-32" />
        </div>
      </div>
    ),
  },
);
const RECENTLY_VIEWED_KEY = 'pharos_recent_properties_v2';

type PropertyClientProps = {
  propertyId: string;
  initialProperty: Property | null;
};

export default function PropertyClient({ propertyId, initialProperty }: PropertyClientProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    errorType,
    refetch,
  } = usePropertyDetails(propertyId, {
    enabled: Boolean(propertyId),
    initialData: initialProperty,
    fetchOnMount: false,
  });

  const property = data ?? initialProperty;
  const { trackPropertyView, trackPropertyShare, trackPropertyFavorite } = useTracking();

  const [isMounted, setIsMounted] = useState(false);
  const [relatedMode, setRelatedMode] = useState<'smart' | 'recent'>('smart');
  const [recentViewed, setRecentViewed] = useState<any[]>([]);
  const [loadingReco, setLoadingReco] = useState(false);
  const [clientReco, setClientReco] = useState<any[]>([]);
  const recoSwiperRef = useRef<any | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [buildingUnits, setBuildingUnits] = useState<any[]>([]);
  const [buildingUnitsLoading, setBuildingUnitsLoading] = useState(false);

  // Garante renderização apenas no cliente (evita hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const smartRelated: any[] = useMemo(() => {
    const list = (property as any)?.relatedProperties;
    return Array.isArray(list) ? list : [];
  }, [property]);

  // Mantém "Recomendados" como padrão; usuário escolhe "Recentes" manualmente

  const hasRecentViewed = recentViewed.length > 0;
  const isRecentMode = relatedMode === 'recent';
  const activeRelated = isRecentMode ? recentViewed : smartRelated;

  // ✅ OTIMIZAÇÃO: Busca recomendações apenas se smartRelated estiver vazio (fallback)
  useEffect(() => {
    if (!property) return;
    
    // ✅ Se já tem recomendações do servidor, usar elas
    if (smartRelated.length > 0) {
      setClientReco(smartRelated);
      setLoadingReco(false);
      return;
    }
    
    // ✅ Adicionar debounce de 500ms para evitar requisições desnecessárias
    let abort = false;
    const timer = setTimeout(async () => {
      try {
        setLoadingReco(true);
        // Definir faixa de preço +/- 20%
        const price = Number(property?.pricing?.sale || 0);
        const minPrice = price > 0 ? Math.floor(price * 0.8) : undefined;
        const maxPrice = price > 0 ? Math.ceil(price * 1.2) : undefined;

        const bedrooms = property?.specs?.bedrooms;
        const suites = property?.specs?.suites;
        const parking = property?.specs?.parkingSpots;

        const params = buildPropertySearchParams(
          {
            cityNames: property?.address?.city ? [property.address.city] : [],
            neighborhoods: property?.address?.neighborhood ? [property.address.neighborhood] : [],
            priceMin: minPrice,
            priceMax: maxPrice,
            bedroomsMin: bedrooms ? String(bedrooms) : undefined,
            suitesMin: suites ? String(suites) : undefined,
            parkingMin: parking ? String(parking) : undefined,
            types: property?.type ? [String(property.type)] : [],
          },
          {
            pagination: { page: 1, limit: 12 },
            sort: { sortBy: 'updatedAt', sortOrder: 'desc' },
          }
        );

        const res = await fetch(`/api/properties?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        if (abort) return;
        const list: any[] = Array.isArray(json?.data) ? json.data : [];
        setClientReco(list.filter((p) => p?.id && p.id !== property.id));
      } catch {
        if (!abort) setClientReco([]);
      } finally {
        if (!abort) setLoadingReco(false);
      }
    }, 500); // ✅ Debounce de 500ms
    
    return () => {
      abort = true;
      clearTimeout(timer);
    };
  }, [property?.id, smartRelated.length]);

  // ✅ OTIMIZAÇÃO: Debounce no localStorage e tracking para evitar bloqueio da thread principal
  useEffect(() => {
    if (!property || typeof window === 'undefined') return;

    // ✅ Usar requestIdleCallback para não bloquear a renderização
    const handleRecent = () => {
      try {
        const storedRaw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
        const stored: any[] = storedRaw ? JSON.parse(storedRaw) : [];
        const sanitized = Array.isArray(stored) ? stored.filter((item) => item && item.id) : [];

        const entry = {
          id: property.id,
          slug: property.slug || property.id,
          code: property.code,
          title: getPropertyTitle(property),
          address: property.address,
          pricing: property.pricing,
          specs: property.specs,
          type: property.type,
          photos: (property.photos || []).slice(0, 3),
          lastViewed: Date.now(),
        };

        const filtered = sanitized.filter((item) => item.id !== property.id);
        const updated = [entry, ...filtered].slice(0, 12);

        window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
        setRecentViewed(updated.filter((item) => item.id !== property.id));
      } catch (storageError) {
        console.warn('[PropertyPage] Falha ao registrar imóvel em vistos recentemente:', storageError);
      }
    };

    // ✅ Track visualização do imóvel de forma assíncrona
    const handleTracking = () => {
      trackPropertyView({
        id: property.id,
        code: property.code,
        title: getPropertyTitle(property),
        price: Number(property.pricing?.sale || property.pricing?.rent || 0),
        bedrooms: property.specs?.bedrooms,
        bathrooms: property.specs?.bathrooms,
        suites: property.specs?.suites,
        parkingSpaces: property.specs?.parkingSpots || property.specs?.parkingSpaces,
        area: property.specs?.totalArea || property.specs?.area,
        type: typeof property.type === 'string' ? property.type : 'property',
        city: property.address?.city || '',
        state: property.address?.state || '',
        neighborhood: property.address?.neighborhood,
        realtor: property.realtor && property.realtor.id ? {
          id: property.realtor.id,
          name: property.realtor.name,
        } : undefined,
      });
    };

    // ✅ Usar requestIdleCallback (fallback para setTimeout)
    if ('requestIdleCallback' in window) {
      const recentId = requestIdleCallback(handleRecent, { timeout: 1000 });
      const trackingId = requestIdleCallback(handleTracking, { timeout: 1500 });
      
      return () => {
        cancelIdleCallback(recentId);
        cancelIdleCallback(trackingId);
      };
    } else {
      const recentTimer = setTimeout(handleRecent, 500);
      const trackingTimer = setTimeout(handleTracking, 800);
      
      return () => {
        clearTimeout(recentTimer);
        clearTimeout(trackingTimer);
      };
    }
  }, [property?.id, trackPropertyView]);

  const handleShare = async () => {
    const url =
      typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title,
      text: `Imóvel ${title} • Código ${property?.code || ''} — Pharos`,
      url,
    };
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share(shareData);
        // Track compartilhamento
        if (property) {
          trackPropertyShare(
            {
              id: property.id,
              code: property.code,
              title: getPropertyTitle(property),
              price: Number(property.pricing?.sale || property.pricing?.rent || 0),
              type: property.type || 'property',
              city: property.address?.city || '',
              state: property.address?.state || '',
            },
            'link'
          );
        }
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
        // Track cópia do link
        if (property) {
          trackPropertyShare(
            {
              id: property.id,
              code: property.code,
              title: getPropertyTitle(property),
              price: Number(property.pricing?.sale || property.pricing?.rent || 0),
              type: property.type || 'property',
              city: property.address?.city || '',
              state: property.address?.state || '',
            },
            'link'
          );
        }
      }
    } catch {
      // silencioso (usuário pode cancelar o share)
    }
  };

  if (!propertyId) {
    return null;
  }

  if (isLoading && !property) {
    return <PropertyDetailLoading />;
  }

  if ((!property && isError) || (!property && !isLoading)) {
    return (
      <PropertiesError
        error={error || new Error('Imóvel não encontrado')}
        errorType={errorType}
        onRetry={refetch}
      />
    );
  }

  if (!property) {
    return <PropertyDetailLoading />;
  }

  const title = getPropertyTitle(property);
  const displayPrice = getDisplayPrice(property);
  const primaryPhoto = property.photos?.[0]?.url || '';
  const galleryVideos = useMemo(() => {
    // Suporta tanto videos (Property) quanto videosYoutube (Imovel)
    const videosList = (property as any).videos || (property as any).videosYoutube;
    
    console.log('[PropertyClient] 🎥 Processando vídeos:', {
      propertyId: property.id,
      propertyCode: property.code,
      videosRaw: videosList,
      isArray: Array.isArray(videosList),
      length: Array.isArray(videosList) ? videosList.length : 0,
    });
    
    if (!Array.isArray(videosList)) return [];
    
    // Remove duplicatas e URLs vazias
    const uniqueUrls = Array.from(new Set(
      videosList.filter((url): url is string => typeof url === 'string' && url.length > 0)
    ));
    
    if (videosList.length !== uniqueUrls.length) {
      console.log('[PropertyClient] ⚠️ Removidas duplicatas de vídeos:', {
        original: videosList.length,
        unique: uniqueUrls.length,
        removidas: videosList.length - uniqueUrls.length,
        originalUrls: videosList,
        uniqueUrls,
      });
    }

    return uniqueUrls.map((url, index) => ({
      url,
      thumbnail: primaryPhoto,
      title: `${uniqueUrls.length > 1 ? `Vídeo ${index + 1}` : 'Vídeo'} - ${title}`,
    }));
  }, [(property as any).videos, (property as any).videosYoutube, primaryPhoto, title]);

  const buildingSlug = useMemo(() => {
    const slugify = (valor?: string) => {
      if (!valor) return '';
      return valor
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };
    const candidatos = [
      property?.buildingName,
      (property as any)?.providerData?.raw?.Empreendimento,
      (property as any)?.providerData?.raw?.NomeEmpreendimento,
    ].filter(Boolean);
    for (const c of candidatos) {
      const s = slugify(String(c));
      if (s) return s;
    }
    return '';
  }, [property?.buildingName, (property as any)?.providerData?.raw]);

  // Buscar unidades do mesmo empreendimento (client-side) com filtro buildingName
  useEffect(() => {
    if (!property?.buildingName) return;
    let abort = false;
    const normalize = (valor: string) =>
      valor
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const run = async () => {
      try {
        setBuildingUnitsLoading(true);
        // API /api/properties espera "empreendimento" como filtro de buildingName
        const params = new URLSearchParams();
        if (property.buildingName) {
          params.set('empreendimento', property.buildingName);
        }
        params.set('page', '1');
        params.set('limit', '50'); // busca mais itens do empreendimento
        
        const res = await fetch(`/api/properties?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        if (abort) return;
        const list: any[] = Array.isArray(json?.data) ? json.data : [];
        const alvo = normalize(property.buildingName || '');

        // Filtro ESTRITO: correspondência EXATA do nome do empreendimento
        const unidadesDoEmpreendimento = list.filter((item) => {
          // Excluir o próprio imóvel
          if (!item?.id || item.id === property.id) return false;
          
          // Buscar em todos os campos possíveis do empreendimento
          const nomesDoItem = [
            item.buildingName,
            item.empreendimentoNome,
            (item as any)?.providerData?.raw?.Empreendimento,
            (item as any)?.providerData?.raw?.NomeEmpreendimento,
            (item as any)?.providerData?.raw?.Condominio,
          ]
            .filter(Boolean)
            .map((v) => normalize(String(v)));
          
          // CORRESPONDÊNCIA EXATA (não aceita parcial)
          return nomesDoItem.some((nomeItem) => nomeItem === alvo);
        });

        setBuildingUnits(unidadesDoEmpreendimento);
      } catch (err) {
        if (!abort) setBuildingUnits([]);
      } finally {
        if (!abort) setBuildingUnitsLoading(false);
      }
    };
    run();
    return () => {
      abort = true;
    };
  }, [property?.buildingName, property?.id]);

  const renderImovelCard = (imovel: any) => {
    const endereco = (() => {
      const rua = imovel.endereco?.rua ?? imovel.address?.street ?? '';
      const numero = imovel.endereco?.numero ?? imovel.address?.number ?? '';
      const bairro = imovel.endereco?.bairro ?? imovel.address?.neighborhood ?? '';
      const cidade = imovel.endereco?.cidade ?? imovel.address?.city ?? '';
      if (!rua && !bairro && !cidade) return '';
      const str = `${rua}${rua && numero ? `, ${numero}` : ''}${rua ? ' - ' : ''}${bairro}, ${cidade}`;
      return str.replace(/(,\\s*)+/g, ', ').replace(/\\s+-\\s+,/g, ',').trim();
    })();
    const imagens = (() => {
      const arr = Array.isArray(imovel.galeria) ? imovel.galeria
        : Array.isArray(imovel.photos) ? imovel.photos.map((p: any) => p.url || p)
        : [];
      return arr.filter((u: any) => typeof u === 'string' && /^https?:\/\//i.test(u));
    })();

    return (
      <ImovelCard
        key={imovel.id || imovel.codigo}
        id={imovel.id || imovel.codigo}
        titulo={imovel.titulo || imovel.title || ''}
        endereco={endereco}
        preco={imovel.preco ?? imovel.pricing?.sale ?? 0}
        quartos={imovel.quartos ?? imovel.specs?.bedrooms ?? 0}
        banheiros={imovel.banheiros ?? imovel.specs?.bathrooms ?? 0}
        suites={imovel.suites ?? imovel.specs?.suites ?? 0}
        area={imovel.areaPrivativa ?? imovel.specs?.privateArea ?? imovel.specs?.totalArea ?? 0}
        imagens={imagens}
        tipoImovel={imovel.tipo || imovel.type || ''}
        vagas={imovel.vagasGaragem ?? imovel.specs?.parkingSpots ?? 0}
        distanciaMar={imovel.distanciaMar ?? imovel.distancia_mar_m}
        caracteristicasImovel={imovel.caracteristicasImovel || []}
        caracteristicasLocalizacao={imovel.caracteristicasLocalizacao || []}
        caracteristicas={imovel.caracteristicas || []}
      />
    );
  };

  // Gerar schemas para SEO
  const realEstateSchema = generateRealEstateListingSchema({
    id: property.id,
    title: title,
    description: property.description || title,
    type: property.type || 'Imóvel',
    price: property.pricing?.sale || 0,
    area: property.specs?.totalArea || property.specs?.area || property.specs?.privateArea || 0,
    bedrooms: property.specs?.bedrooms,
    bathrooms: property.specs?.bathrooms,
    suites: property.specs?.suites,
    parkingSpots: property.specs?.parkingSpots,
    address: {
      street: property.address?.street,
      neighborhood: property.address?.neighborhood,
      city: property.address?.city || 'Balneário Camboriú',
      state: property.address?.state || 'SC',
      postalCode: property.address?.postalCode || property.address?.zipCode,
      country: 'BR',
    },
    location: property.address?.coordinates,
    photos: property.photos?.slice(0, 10),
    features: (property.caracteristicasImovel || []).slice(0, 20),
    availability: property.status === 'disponivel' ? 'InStock' : property.status === 'vendido' ? 'SoldOut' : 'InStock',
    datePosted: property.createdAt ? (property.createdAt instanceof Date ? property.createdAt.toISOString() : property.createdAt) : undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Imóveis', url: '/imoveis' },
    { name: getPropertyCode(property), url: `/imoveis/${property.id}` },
  ]);

  const combinedSchema = combineSchemas(realEstateSchema, breadcrumbSchema);

  return (
    <>
      <StructuredData data={combinedSchema} />
      <div className="bg-white min-h-screen">
        {/* Header com breadcrumb */}
      <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pharos-blue-600 transition-colors">
              Início
            </Link>
            <span>/</span>
            <Link href="/imoveis" className="hover:text-pharos-blue-600 transition-colors">
              Imóveis
            </Link>
            <span>/</span>
            <span className="text-pharos-navy-900 font-medium">{getPropertyCode(property)}</span>
          </div>
        </div>
      </div>

      {/* Galeria de Mídia Premium */}
      <PropertyMediaGallery
        images={(property.photos || []).map((p: any) => p.url).filter(Boolean)}
        title={title}
        propertyId={property.id}
        propertyCode={property.code}
        location={property.address?.coordinates}
        neighborhood={property.address?.neighborhood}
        city={property.address?.city}
        address={`${property.address?.street ?? ''}${property.address?.street && property.address?.number ? `, ${property.address?.number}` : ''} - ${property.address?.neighborhood ?? ''}, ${property.address?.city ?? ''}`.trim()}
        distanciaMar={property.distanciaMar}
        videos={galleryVideos}
        tour360Url={(property as any).virtualTour || (property as any).tourVirtual || undefined}
        attachments={property.attachments}
      />

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título e Localização */}
            <div>
              <div className="relative lg:flex lg:items-start lg:justify-between lg:gap-3">
                <div className="min-w-0">
                  <h1 className="text-3xl lg:text-4xl font-light text-gray-900 mb-3">
                    {title}
                  </h1>

                  <div className="flex items-start gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="text-sm">
                      {property.address?.street ?? ''}
                      {property.address?.street && property.address?.number ? `, ${property.address.number}` : ''}
                      {property.address?.street ? ' - ' : ''}
                      {property.address?.neighborhood || 'N/A'}, {property.address?.city || 'N/A'}/
                      {property.address?.state || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      Cód:{' '}
                      <strong className="font-mono text-gray-700">
                        {property.code}
                      </strong>
                    </span>
                    {property.updatedAt && (
                      <>
                        <span>•</span>
                        <span>Atualizado em {new Date(property.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ações rápidas: Favoritar / Compartilhar */}
                <div className="flex items-center gap-2 flex-shrink-0 absolute right-0 -top-6 lg:static lg:top-auto">
                  <FavoriteButton
                    imovelId={property.id}
                    className="shadow-sm border border-white/60"
                  />
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md text-pharos-slate-700"
                    aria-label="Compartilhar este imóvel"
                    title="Compartilhar"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {shareCopied && (
                <div className="mt-2 text-right">
                  <span className="text-xs text-gray-500">Link copiado</span>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200" />

            {/* Preço */}
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Valor de Venda
              </p>
              <p className="text-4xl lg:text-5xl font-light text-gray-900">
                {displayPrice}
              </p>

              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                Preço sujeito a alteração sem aviso prévio
              </p>

              {(typeof property.pricing?.condo === 'number' || typeof property.pricing?.iptu === 'number') && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">
                  {typeof property.pricing?.condo === 'number' && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-light">Condomínio</span>
                      <span className="font-normal text-gray-900">
                        {formatCurrencyBRL(property.pricing.condo)}
                      </span>
                    </div>
                  )}
                  {typeof property.pricing?.iptu === 'number' && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-light">IPTU</span>
                      <span className="font-normal text-gray-900">
                        {formatCurrencyBRL(property.pricing.iptu)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200" />

            {/* ✅ Especificações - Above the fold (sem lazy load) */}
            <PropertySpecs property={property} />

            {/* Status da Obra - Timeline Animada (Above the fold - sem lazy load) */}
            <PropertyConstructionTimeline 
              obraStatus={property.obraStatus}
              deliveryDate={(property as any).deliveryDate}
              buildingName={property.buildingName}
            />

            {/* Descrição */}
            {property.description && (
              <LazyLoadSection
                rootMargin="200px 0px"
                fallback={
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6" />
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                }
              >
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-2xl font-light text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-pharos-blue-500 to-pharos-blue-600 rounded-full" />
                    Descrição
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              </LazyLoadSection>
            )}

            <LazyLoadSection
              rootMargin="300px 0px"
              fallback={
                <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg" />
                    ))}
                  </div>
                </div>
              }
            >
              <PropertyFeatures property={property} />
            </LazyLoadSection>

            {/* Empreendimento relacionado + unidades disponíveis */}
            {property.buildingName && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-pharos-blue-50 flex items-center justify-center text-pharos-blue-500">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-light text-gray-900">
                        {property.buildingName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Empreendimento
                      </p>
                    </div>
                  </div>
                  {buildingSlug && (
                    <Link
                      href={`/empreendimentos/${buildingSlug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pharos-blue-100 text-pharos-blue-600 hover:bg-pharos-blue-50 transition-colors text-sm font-semibold"
                    >
                      Ver empreendimento
                    </Link>
                  )}
                </div>

                {(property as any)?.buildingDescription && (
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                    {(property as any).buildingDescription}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Unidades disponíveis</h3>
                      <p className="text-sm text-gray-500">No mesmo empreendimento</p>
                    </div>
                    {buildingUnits.length > 0 && (
                      <span className="text-sm font-semibold text-pharos-blue-600">
                        {buildingUnits.length} unidade{buildingUnits.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {buildingUnitsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2].map((s) => (
                        <div key={s} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
                      ))}
                  </div>
                ) : buildingUnits.length > 0 ? (
                  <div
                    className="overscroll-x-contain touch-pan-x"
                    onWheel={(e) => {
                      const sw = recoSwiperRef.current;
                      if (!sw) return;
                      const absX = Math.abs(e.deltaX);
                      const absY = Math.abs(e.deltaY);
                      const horizontal = absX > absY || e.shiftKey;
                      if (!horizontal) return;
                      e.preventDefault();
                      if (e.deltaX > 10 || (e.shiftKey && e.deltaY > 10)) sw.slideNext();
                      else if (e.deltaX < -10 || (e.shiftKey && e.deltaY < -10)) sw.slidePrev();
                    }}
                  >
                    <Swiper
                      modules={[Navigation, Pagination, Keyboard, A11y]}
                      spaceBetween={16}
                      slidesPerView={1.05}
                      pagination={{ clickable: true, dynamicBullets: true }}
                      keyboard={{ enabled: true, onlyInViewport: true }}
                      a11y={{ enabled: true }}
                      allowTouchMove
                      speed={300}
                      onSwiper={(sw) => {
                        // reutiliza ref existente
                        recoSwiperRef.current = sw;
                      }}
                      breakpoints={{
                        360: { slidesPerView: 1.05, spaceBetween: 14, slidesOffsetBefore: 8, slidesOffsetAfter: 8 },
                        640: { slidesPerView: 1.25, spaceBetween: 16, slidesOffsetBefore: 12, slidesOffsetAfter: 12 },
                        768: { slidesPerView: 1.6, spaceBetween: 16, slidesOffsetBefore: 14, slidesOffsetAfter: 14 },
                        1024: { slidesPerView: 2, spaceBetween: 18, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
                        1280: { slidesPerView: 2, spaceBetween: 18, slidesOffsetBefore: 18, slidesOffsetAfter: 18 },
                      }}
                      className="!pb-8"
                    >
                      {buildingUnits.map((imovel) => (
                        <SwiperSlide key={imovel.id || imovel.codigo} className="h-auto pt-2 pb-6">
                          <div className="h-full">
                            {renderImovelCard(imovel)}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600 space-y-4">
                    <p className="font-medium text-gray-700">
                      Nenhuma unidade disponível listada no momento para este empreendimento. Temos unidades que não podemos divulgar no site e também podemos captar novas opções para você.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`https://wa.me/5547991878070?text=Olá! Gostaria de saber sobre unidades no empreendimento ${encodeURIComponent(property.buildingName || '')} e também sobre opções exclusivas não publicadas.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold transition-colors"
                      >
                        Falar com um especialista
                      </a>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Características adicionais */}
            {(property as any)?.diferenciais?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pharos-blue-500" />
                  Diferenciais do Imóvel
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(property as any).diferenciais.map((item: string, index: number) => (
                    <span
                      key={`${item}-${index}`}
                      className="px-4 py-2 bg-pharos-blue-50 text-pharos-blue-600 rounded-full text-sm font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Barra flutuante (mobile) */}
            <PropertyContactSticky propertyCode={property.code} propertyTitle={title} />
            {/* Card lateral sticky (desktop) */}
            <PropertyContact
              propertyCode={property.code}
              propertyTitle={title}
              className="hidden lg:block lg:sticky lg:top-24"
            />
          </div>
        </div>
      </div>

      {/* ✅ OTIMIZAÇÃO: Carrossel de recomendações com lazy load */}
      {isMounted && (
      <LazyLoadSection
        rootMargin="400px 0px"
        fallback={
          <div className="bg-gray-50 border-t border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
                  <div className="h-4 w-96 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-56 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <div className="bg-gray-50 border-t border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-light text-gray-900">
                  {isRecentMode ? 'Imóveis que você viu recentemente' : 'Imóveis que combinam com você'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isRecentMode
                    ? 'Baseado no seu histórico de navegação'
                    : 'Selecionamos imóveis similares a este para você conhecer'}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full p-1">
                <button
                  onClick={() => setRelatedMode('smart')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    relatedMode === 'smart'
                      ? 'bg-pharos-blue-500 text-white shadow'
                      : 'text-gray-600 hover:text-pharos-blue-500'
                  }`}
                >
                  Recomendados
                </button>
                <button
                  onClick={() => setRelatedMode('recent')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    relatedMode === 'recent'
                      ? 'bg-pharos-blue-500 text-white shadow'
                      : 'text-gray-600 hover:text-pharos-blue-500'
                  }`}
                  disabled={!hasRecentViewed}
                >
                  Recentes
                </button>
              </div>
            </div>

            {(isRecentMode ? recentViewed.length > 0 : (smartRelated.length > 0 || clientReco.length > 0)) ? (
            <div
              className="overscroll-x-contain touch-pan-x"
              onWheel={(e) => {
                const sw = recoSwiperRef.current;
                if (!sw) return;
                const absX = Math.abs(e.deltaX);
                const absY = Math.abs(e.deltaY);
                const horizontal = absX > absY || e.shiftKey;
                if (!horizontal) return;
                e.preventDefault();
                if (e.deltaX > 10 || (e.shiftKey && e.deltaY > 10)) sw.slideNext();
                else if (e.deltaX < -10 || (e.shiftKey && e.deltaY < -10)) sw.slidePrev();
              }}
            >
            <Swiper
              modules={[Navigation, Pagination, Keyboard, A11y]}
              spaceBetween={24}
              slidesPerView={1.15}
              navigation={true}
              pagination={{ clickable: true, dynamicBullets: true }}
              keyboard={{ enabled: true, onlyInViewport: true }}
              a11y={{ enabled: true }}
              autoplay={false}
              allowTouchMove={true}
              simulateTouch={true}
              speed={400}
              onSwiper={(sw) => { recoSwiperRef.current = sw; }}
              breakpoints={{
                // Mobile pequeno (360px+)
                360: { 
                  slidesPerView: 1.15, 
                  spaceBetween: 16,
                  centeredSlides: false,
                },
                // Mobile médio (480px+)
                480: { 
                  slidesPerView: 1.3, 
                  spaceBetween: 18,
                },
                // Mobile grande / Phablet (640px+)
                640: { 
                  slidesPerView: 1.5, 
                  spaceBetween: 20,
                },
                // Tablet (768px+)
                768: { 
                  slidesPerView: 2.2, 
                  spaceBetween: 24,
                },
                // Desktop pequeno (1024px+)
                1024: { 
                  slidesPerView: 2.5, 
                  spaceBetween: 28,
                },
                // Desktop médio (1280px+)
                1280: { 
                  slidesPerView: 3, 
                  spaceBetween: 32,
                },
                // Desktop grande (1536px+)
                1536: { 
                  slidesPerView: 3.5, 
                  spaceBetween: 36,
                },
              }}
              className="!pb-12 property-recommendations-swiper"
            >
              {(isRecentMode ? recentViewed : (smartRelated.length > 0 ? smartRelated : clientReco))
                .slice(0, 18) // mostrar mais opções
                .map((imovel: any) => {
                  // Normalização robusta para ImovelCard (suporta estruturas da API e do client)
                  const endereco = (() => {
                    const rua = imovel.endereco?.rua ?? imovel.address?.street ?? '';
                    const numero = imovel.endereco?.numero ?? imovel.address?.number ?? '';
                    const bairro = imovel.endereco?.bairro ?? imovel.address?.neighborhood ?? '';
                    const cidade = imovel.endereco?.cidade ?? imovel.address?.city ?? '';
                    if (!rua && !bairro && !cidade) return '';
                    const str = `${rua}${rua && numero ? `, ${numero}` : ''}${rua ? ' - ' : ''}${bairro}, ${cidade}`;
                    return str.replace(/(,\s*)+/g, ', ').replace(/\s+-\s+,/g, ',').trim();
                  })();
                  const imagens = (() => {
                    const arr = Array.isArray(imovel.galeria) ? imovel.galeria
                      : Array.isArray(imovel.photos) ? imovel.photos.map((p: any) => p.url || p)
                      : [];
                    return arr.filter((u: any) => typeof u === 'string' && /^https?:\/\//i.test(u));
                  })();
                  return (
                    <SwiperSlide key={imovel.id || imovel.codigo} className="h-auto pt-2 pb-6">
                      <div className="h-full">
                        <ImovelCard
                          id={imovel.id || imovel.codigo}
                          titulo={imovel.titulo || imovel.title || ''}
                          endereco={endereco}
                          preco={imovel.preco ?? imovel.pricing?.sale ?? 0}
                          quartos={imovel.quartos ?? imovel.specs?.bedrooms ?? 0}
                          banheiros={imovel.banheiros ?? imovel.specs?.bathrooms ?? 0}
                          suites={imovel.suites ?? imovel.specs?.suites ?? 0}
                          area={imovel.areaPrivativa ?? imovel.specs?.privateArea ?? imovel.specs?.totalArea ?? 0}
                          imagens={imagens}
                          tipoImovel={imovel.tipo || imovel.type || ''}
                          vagas={imovel.vagasGaragem ?? imovel.specs?.parkingSpots ?? 0}
                          distanciaMar={imovel.distanciaMar ?? imovel.distancia_mar_m}
                          caracteristicasImovel={imovel.caracteristicasImovel || []}
                          caracteristicasLocalizacao={imovel.caracteristicasLocalizacao || []}
                          caracteristicas={imovel.caracteristicas || []}
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
            </Swiper>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pharos-blue-50 text-pharos-blue-600 grid place-items-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ainda não temos recomendações aqui
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore opções semelhantes por cidade, bairro ou veja os últimos imóveis que você visitou.
                </p>
                {/* Ações rápidas */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  {getBreadcrumbParts(property).slice(0, 3).map((crumb) => (
                    <Link
                      key={crumb.href}
                      href={crumb.href}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-pharos-blue-300 hover:text-pharos-blue-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/imoveis"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold transition-colors"
                  >
                    Ver todos os imóveis
                  </Link>
                  <a
                    href="https://wa.me/5547991878070?text=Olá!%20Gostaria%20de%20sugestões%20de%20imóveis%20parecidos."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    Converse no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </LazyLoadSection>
      )}

      {/* (Seção "Explore mais opções" removida conforme solicitado) */}
      </div>
    </>
  );
}


