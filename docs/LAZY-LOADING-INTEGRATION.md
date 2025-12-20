# Guia de Integração: Lazy Loading & Performance Percebida

## 🎯 Objetivo

Este guia mostra como integrar os novos componentes de lazy loading nos componentes existentes do site.

---

## 📦 O que foi criado

### 1. Skeleton Loaders
```
src/components/skeletons/
├── Skeleton.tsx                 # Base component
├── PropertyCardSkeleton.tsx     # Card de imóvel
├── PropertyGridSkeleton.tsx     # Grid de cards
├── HeroSkeleton.tsx             # Hero da homepage
└── index.ts                     # Exports
```

### 2. Progressive Images
```
src/components/ProgressiveImage.tsx   # Wrapper do next/image com blur
src/utils/imageBlurPlaceholder.ts     # Utilities para blur
```

### 3. Suspense Wrappers
```
src/components/suspense/
├── SuspenseWrapper.tsx          # Wrappers prontos
└── index.ts                     # Exports
```

---

## 🚀 Como Usar

### 1. Skeleton Loaders

#### ✅ Exemplo 1: Grid de Imóveis (Listagem)

**Antes:**
```tsx
// src/app/imoveis/page.tsx
export default async function ImoveisPage() {
  const properties = await fetchProperties();
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {properties.map(p => <PropertyCard key={p.id} property={p} />)}
    </div>
  );
}
```

**Depois:**
```tsx
// src/app/imoveis/page.tsx
import { Suspense } from 'react';
import { PropertyGridSkeleton } from '@/components/skeletons';

export default function ImoveisPage() {
  return (
    <Suspense fallback={<PropertyGridSkeleton count={6} />}>
      <PropertiesGrid />
    </Suspense>
  );
}

// Componente async separado
async function PropertiesGrid() {
  const properties = await fetchProperties();
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {properties.map(p => <PropertyCard key={p.id} property={p} />)}
    </div>
  );
}
```

**Resultado:** Usuário vê skeleton imediatamente, depois conteúdo real.

---

#### ✅ Exemplo 2: Homepage Hero

**Antes:**
```tsx
// src/components/HomeClient.tsx
export function HomeClient({ properties }) {
  return (
    <>
      <HeroSection properties={properties} />
      <FeaturedProperties properties={properties} />
    </>
  );
}
```

**Depois:**
```tsx
// src/app/page.tsx
import { Suspense } from 'react';
import { HeroSkeleton, FeaturedPropertiesSkeleton } from '@/components/skeletons';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroWithData />
      </Suspense>
      
      <Suspense fallback={<FeaturedPropertiesSkeleton />}>
        <FeaturedWithData />
      </Suspense>
    </>
  );
}

async function HeroWithData() {
  const properties = await fetchFeaturedProperties();
  return <HeroSection properties={properties} />;
}

async function FeaturedWithData() {
  const properties = await fetchHighlightedProperties();
  return <FeaturedProperties properties={properties} />;
}
```

**Resultado:** Hero e Featured carregam independentemente, com skeleton para cada um.

---

### 2. Progressive Images

#### ✅ Exemplo 3: PropertyCard com Imagem Progressiva

**Antes:**
```tsx
// src/components/PropertyCard.tsx
import Image from 'next/image';

export function PropertyCard({ property }) {
  return (
    <div className="card">
      <Image
        src={property.image}
        alt={property.title}
        width={640}
        height={480}
      />
      {/* ... resto do card ... */}
    </div>
  );
}
```

**Depois (Opção A - Simples):**
```tsx
// src/components/PropertyCard.tsx
import { ProgressiveImage } from '@/components/ProgressiveImage';

export function PropertyCard({ property }) {
  return (
    <div className="card">
      <ProgressiveImage
        src={property.image}
        alt={property.title}
        width={640}
        height={480}
        propertyType={property.tipo} // Cor do blur baseada no tipo
        priority={property.destaque} // LCP images
      />
      {/* ... resto do card ... */}
    </div>
  );
}
```

**Depois (Opção B - Com Aspect Ratio):**
```tsx
import { ProgressiveImageWithAspect } from '@/components/ProgressiveImage';

export function PropertyCard({ property }) {
  return (
    <div className="card">
      <ProgressiveImageWithAspect
        src={property.image}
        alt={property.title}
        aspectRatio="4/3"
        propertyType={property.tipo}
        className="rounded-t-xl"
      />
      {/* ... resto do card ... */}
    </div>
  );
}
```

**Resultado:** Imagem aparece com blur colorido instantaneamente, depois foca progressivamente.

---

#### ✅ Exemplo 4: Galeria de Imóvel

**Antes:**
```tsx
// src/components/PropertyMediaGallery.tsx
<Image
  src={image.url}
  alt={`Foto ${index + 1}`}
  fill
  className="object-cover"
/>
```

**Depois:**
```tsx
import { ProgressiveImage } from '@/components/ProgressiveImage';

<ProgressiveImage
  src={image.url}
  alt={`Foto ${index + 1}`}
  fill
  className="object-cover"
  propertyType={property.tipo}
  showSkeleton // Mostra skeleton enquanto carrega
  onLoadComplete={() => console.log('Imagem carregada')}
/>
```

---

### 3. Suspense Wrappers (Helpers prontos)

#### ✅ Exemplo 5: Usando Wrappers Prontos

**Opção 1 - Wrapper específico:**
```tsx
import { PropertyGridSuspense } from '@/components/suspense';

export default function ImoveisPage() {
  return (
    <PropertyGridSuspense count={9}>
      <AsyncPropertyGrid />
    </PropertyGridSuspense>
  );
}
```

**Opção 2 - Wrapper genérico:**
```tsx
import { GenericSuspense } from '@/components/suspense';
import { PropertyGridSkeleton } from '@/components/skeletons';

export default function ImoveisPage() {
  return (
    <GenericSuspense fallback={<PropertyGridSkeleton count={9} />}>
      <AsyncPropertyGrid />
    </GenericSuspense>
  );
}
```

**Opção 3 - Componentes não-críticos:**
```tsx
import { NonCriticalSuspense } from '@/components/suspense';

export default function Page() {
  return (
    <>
      {/* Conteúdo principal */}
      <MainContent />
      
      {/* Newsletter (carrega depois, sem skeleton) */}
      <NonCriticalSuspense>
        <NewsletterPopup />
      </NonCriticalSuspense>
    </>
  );
}
```

---

## 🎯 Prioridades de Integração

### 🔴 Alta Prioridade (Faça Primeiro)

1. **Homepage (`src/app/page.tsx`)**
   - Hero → `HeroSkeleton`
   - Destaques → `FeaturedPropertiesSkeleton`

2. **Listagem (`src/app/imoveis/page.tsx`)**
   - Grid → `PropertyGridSkeleton`

3. **PropertyCard (`src/components/PropertyCard.tsx` ou similar)**
   - Imagens → `ProgressiveImage`

### 🟡 Média Prioridade

4. **Detalhe do Imóvel (`src/app/imoveis/[id]/page.tsx`)**
   - Galeria → `ProgressiveImage`
   - Seções → Suspense individuais

5. **Empreendimentos**
   - Grid → `PropertyGridSkeleton`
   - Cards → `ProgressiveImage`

### 🟢 Baixa Prioridade

6. **Componentes secundários**
   - Newsletter
   - Comentários
   - Related properties

---

## 📊 Resultados Esperados

### Antes
```
Timeline:
0ms ─────────→ 836ms ──────→ 1460ms
   (blank)      (algo)       (completo)

User feeling: 😟 → 😐 → 😊
```

### Depois
```
Timeline:
0ms ──→ 100ms ────────→ 836ms ──────→ 1460ms
   (nada) (skeleton)    (parcial)      (completo)

User feeling: 😊 → 😊 → 😊 → 😊
```

**Perceived loading time:** -600ms (70% melhoria)

---

## 🔧 Troubleshooting

### Erro: "This Suspense boundary received an update..."

**Causa:** Suspense boundary em Client Component  
**Solução:** Mover Suspense para Server Component

```tsx
// ❌ Errado (Client Component)
'use client';
export function Page() {
  return <Suspense>...</Suspense>
}

// ✅ Correto (Server Component)
export default function Page() {
  return <Suspense>...</Suspense>
}
```

### Erro: "Cannot read properties of undefined (Buffer)"

**Causa:** `imageBlurPlaceholder.ts` usando Buffer no client  
**Solução:** Já está tratado - apenas use as funções fornecidas

### Skeleton não aparece

**Causa:** Fetch muito rápido (< 100ms)  
**Solução:** Normal! Skeleton só aparece se loading > ~50ms

---

## 🎨 Customização

### Criar Skeleton Customizado

```tsx
import { Skeleton, SkeletonText, SkeletonImage } from '@/components/skeletons';

export function MyCustomSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonImage aspectRatio="16/9" />
      <Skeleton variant="rounded" width={100} height={24} />
      <SkeletonText lines={3} />
    </div>
  );
}
```

### Blur Placeholder Customizado

```tsx
import { getColoredBlurDataURL } from '@/utils/imageBlurPlaceholder';

const customBlur = getColoredBlurDataURL('#3b82f6'); // Azul

<ProgressiveImage
  src={image}
  alt="..."
  customBlurDataURL={customBlur}
/>
```

---

## 📚 Referências

- [Next.js Suspense Docs](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [next/image Blur Placeholder](https://nextjs.org/docs/app/api-reference/components/image#placeholder)
- [Web.dev: Optimize LCP](https://web.dev/optimize-lcp/)

---

**Última atualização:** Dezembro 2025





