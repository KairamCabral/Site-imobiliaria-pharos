# Exemplo de Integração - Sistema Sticky

## Como Integrar na Página Atual do Imóvel

### 1. Importar CSS Global

Em `src/app/layout.tsx` ou `src/app/imoveis/layout.tsx`:

```tsx
import '@/styles/lead-sticky.css';
```

### 2. Atualizar `src/app/imoveis/[id]/page.tsx`

**Substituir o LeadCaptureCard atual por:**

```tsx
'use client';

import { use } from 'react';
import PropertyPageLayout from '@/components/PropertyPageLayout';
import ImageGallery from '@/components/ImageGallery';
import PropertySpecs from '@/components/PropertySpecs';
import PropertyMap from '@/components/PropertyMap';
import AgendarVisita from '@/components/AgendarVisita';
import PropertyDevelopmentSection from '@/components/PropertyDevelopmentSection';
import PropertySeo from '@/components/PropertySeo';
import { usePropertyDetails } from '@/hooks/usePropertyDetails';
// ... outros imports

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: property, isLoading, isError, error, refetch } = usePropertyDetails(id);

  if (isLoading) return <PropertyDetailLoading />;
  if (isError || !property) return <PropertiesError error={error} onRetry={refetch} />;

  return (
    <>
      {/* SEO */}
      <PropertySeo
        property={{
          id: property.id,
          code: property.code,
          title: property.title,
          description: property.description,
          price: property.pricing.sale || 0,
          address: property.address,
          specs: property.specs,
          photos: property.photos,
          coordinates: property.address.coordinates,
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/80">
        <div className="mx-auto" style={{ maxWidth: '1440px', paddingInline: 'clamp(16px, 4vw, 48px)', paddingBlock: 'clamp(14px, 2vw, 18px)' }}>
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      {/* Galeria Full-Bleed (fora do layout) */}
      <ImageGallery
        images={property.photos.map(p => p.url)}
        title={property.title}
        videoUrl={property.videos?.[0]}
        tour360Url={property.virtualTour}
        localizacao={property.address.coordinates}
        propertyId={property.id}
        propertyCode={property.code}
      />

      {/* Layout com Sidebar Sticky */}
      <PropertyPageLayout
        propertyId={property.id}
        propertyCode={property.code}
        propertyTitle={property.title}
        realtor={{
          id: property.realtor?.id,
          name: property.realtor?.name || 'Equipe Pharos',
          photo: property.realtor?.photo,
          creci: property.realtor?.creci,
          whatsapp: property.realtor?.whatsapp,
          online: true,
        }}
        sidebar={
          /* Navegação vertical opcional */
          <nav className="mb-6">
            <ul className="space-y-2">
              <li><a href="#detalhes" className="text-sm text-pharos-slate-600 hover:text-pharos-blue-500">Detalhes</a></li>
              <li><a href="#specs" className="text-sm text-pharos-slate-600 hover:text-pharos-blue-500">Ficha Técnica</a></li>
              <li><a href="#localizacao" className="text-sm text-pharos-slate-600 hover:text-pharos-blue-500">Localização</a></li>
              <li><a href="#agendar" className="text-sm text-pharos-slate-600 hover:text-pharos-blue-500">Agendar Visita</a></li>
            </ul>
          </nav>
        }
      >
        {/* Conteúdo Principal */}
        <div className="space-y-12">
          {/* Header do Imóvel */}
          <div id="detalhes" className="space-y-5">
            <h1 className="text-3xl lg:text-4xl font-light text-pharos-navy-900">
              {property.title}
            </h1>
            
            <div className="flex items-start gap-2 text-pharos-slate-600">
              <MapPin className="w-4 h-4 mt-0.5" />
              <p className="text-sm">
                {property.address.street && `${property.address.street}${property.address.number ? ', ' + property.address.number : ''}, `}
                {property.address.neighborhood}, {property.address.city}/{property.address.state}
              </p>
            </div>

            {/* Preço + Métricas */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-3xl font-bold text-pharos-navy-900">
                R$ {property.pricing.sale?.toLocaleString('pt-BR')}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-pharos-slate-600">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {property.specs.bedrooms}
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  {property.specs.bathrooms}
                </div>
                <div className="flex items-center gap-1">
                  <Car className="w-4 h-4" />
                  {property.specs.parkingSpots}
                </div>
                <div className="flex items-center gap-1">
                  <Maximize className="w-4 h-4" />
                  {property.specs.privateArea}m²
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="prose prose-slate max-w-none">
              <p className="text-pharos-slate-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* Ficha Técnica */}
          <div id="specs">
            <PropertySpecs
              propertyId={property.id}
              specs={{
                propertyType: property.type,
                bedrooms: property.specs.bedrooms,
                suites: property.specs.suites,
                bathrooms: property.specs.bathrooms,
                parkingSpots: property.specs.parkingSpots,
                privateArea: property.specs.privateArea,
                totalArea: property.specs.totalArea,
                condoFee: property.pricing.condo,
                iptuMonthly: property.pricing.iptu,
                development: property.development?.name,
                vistaCode: property.code,
                updatedAt: property.updatedAt,
              }}
            />
          </div>

          {/* Empreendimento */}
          {property.developmentId && (
            <PropertyDevelopmentSection
              developmentId={property.developmentId}
              propertyId={property.id}
            />
          )}

          {/* Mapa */}
          {property.address.coordinates && (
            <div id="localizacao">
              <PropertyMap
                propertyId={property.id}
                propertyTitle={property.title}
                address={`${property.address.street}, ${property.address.neighborhood}, ${property.address.city}/${property.address.state}`}
                coordinates={property.address.coordinates}
                pois={[
                  // Exemplo de POIs - ajustar conforme dados disponíveis
                  { label: 'Praia', distance: 150, type: 'beach' },
                ]}
              />
            </div>
          )}

          {/* Agendar Visita */}
          <div id="agendar">
            <AgendarVisita
              propertyId={property.id}
              propertyTitle={property.title}
              propertyAddress={`${property.address.street}, ${property.address.neighborhood}, ${property.address.city}`}
            />
          </div>
        </div>
      </PropertyPageLayout>
    </>
  );
}
```

### 3. Estrutura Final

```
┌─────────────────────────────────────────────┐
│           Header Fixo (72px)                │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│           Breadcrumb                         │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│    Galeria Full-Bleed (100vw)               │
└─────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────┐
│   Sidebar    │      Content                 │
│              │                              │
│ ┌──────────┐ │  • Header Imóvel            │
│ │ Nav      │ │  • Descrição                │
│ └──────────┘ │  • Ficha Técnica            │
│              │  • Empreendimento           │
│ ┌──────────┐ │  • Mapa                     │
│ │ LeadCard │◄──── Sticky!                 │
│ │  Sticky  │ │  • Agendar Visita           │
│ │          │ │                              │
│ │          │ │                              │
│ └──────────┘ │                              │
│      ▲       │                              │
│      │       │                              │
│   Sentinel   │                              │
└──────────────┴──────────────────────────────┘

Mobile (≤1024px):
┌─────────────────────────────────────────────┐
│              Content                         │
│  • Galeria                                  │
│  • Header                                   │
│  • Specs                                    │
│  • Mapa                                     │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  [🟦 Falar com Equipe]    ← Dock Fixo      │
└─────────────────────────────────────────────┘
```

---

## Resultado Visual

### Desktop

![Lead Card Sticky Desktop](https://via.placeholder.com/800x600.png?text=Desktop+Sticky+Card)

- Card na lateral direita
- Acompanha scroll suavemente
- Para antes do rodapé

### Mobile

![Lead Dock Mobile](https://via.placeholder.com/400x800.png?text=Mobile+Dock)

- Dock fixo no rodapé
- CTA "Falar com Equipe"
- Abre bottom sheet com form completo

---

## Próximos Passos

1. ✅ Importar CSS global (`lead-sticky.css`)
2. ✅ Substituir estrutura da página
3. ✅ Testar no desktop (verificar sticky)
4. ✅ Testar no mobile (verificar dock)
5. ✅ Verificar analytics disparando
6. ✅ QA completo (ver LEAD-STICKY-SYSTEM.md)

---

**Data:** 18/10/2025  
**Status:** ✅ Pronto para integração

