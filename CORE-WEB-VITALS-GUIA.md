# 🚀 Core Web Vitals - Guia de Otimização Pharos

**Objetivo:** LCP < 2.5s | CLS < 0.1 | INP < 200ms

---

## 📊 Métricas e Metas

| Métrica | Meta Good | Meta Needs Improvement | Meta Poor |
|---------|-----------|------------------------|-----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |
| **FCP** (First Contentful Paint) | < 1.8s | 1.8s - 3.0s | > 3.0s |
| **TTFB** (Time to First Byte) | < 800ms | 800ms - 1800ms | > 1800ms |

---

## 🎯 LCP (Largest Contentful Paint) - Otimizações

### O que é?
Tempo até o maior elemento de conteúdo ser renderizado (geralmente hero image, título principal).

### Implementações Atuais ✅

#### 1. Preload de Imagens Críticas
```typescript
// src/app/page.tsx - Hero Section
<link
  rel="preload"
  as="image"
  href="/images/hero-background.webp"
  imageSrcSet="/images/hero-background-mobile.webp 640w, /images/hero-background.webp 1920w"
  imageSizes="100vw"
  fetchPriority="high"
/>

<Image
  src="/images/hero-background.webp"
  alt="Imóveis de alto padrão"
  fill
  priority // Prioridade máxima
  quality={90}
  sizes="100vw"
/>
```

#### 2. Formatos Modernos de Imagem
```javascript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'], // AVIF 50% menor que WebP
}
```

#### 3. Font Optimization
```typescript
// src/app/layout.tsx
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Evita FOIT (Flash of Invisible Text)
  weight: ["400", "500", "700"],
  variable: "--font-inter",
});
```

### Próximas Otimizações Recomendadas 🎯

#### 1. Image CDN com Redimensionamento Automático
```typescript
// Cloudflare Images, Imgix, ou similar
// Redimensiona automaticamente por device
// Serve AVIF/WebP baseado em browser support
```

#### 2. Critical CSS Inline
```typescript
// Extrair CSS crítico da homepage
// Inline no <head> para eliminar render-blocking
```

#### 3. Server-Side Rendering Otimizado
```typescript
// Garantir que hero é SSR (não client-side)
// Evitar loading spinners no above-the-fold
```

---

## 📏 CLS (Cumulative Layout Shift) - Otimizações

### O que é?
Mede mudanças inesperadas de layout durante o carregamento.

### Implementações Atuais ✅

#### 1. Aspect Ratio em Todas as Imagens
```typescript
// src/components/PropertyCard.tsx
<div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
  <Image
    src={imagem}
    alt={titulo}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="object-cover"
  />
</div>
```

#### 2. Skeleton Loaders com Altura Reservada
```typescript
// Sempre reservar altura mínima para conteúdo dinâmico
<div className="min-h-[400px]">
  {loading ? <PropertyCardSkeleton /> : <PropertyCard />}
</div>
```

#### 3. Font Display Swap
```typescript
// Previne layout shift ao trocar fonte
display: "swap"
```

### Próximas Otimizações Recomendadas 🎯

#### 1. Reservar Espaço para Anúncios/Banners
```typescript
// Se houver banners dinâmicos, reservar altura
<div className="h-[250px] bg-gray-100">
  {banner && <Banner />}
</div>
```

#### 2. Preload de Fonts
```typescript
<link 
  rel="preload" 
  href="/fonts/inter-var.woff2" 
  as="font" 
  type="font/woff2" 
  crossOrigin="anonymous"
/>
```

#### 3. Evitar DOM Injection Acima do Fold
```typescript
// Não inserir elementos via JS no above-the-fold
// Se necessário, usar placeholder com mesma altura
```

---

## ⚡ INP (Interaction to Next Paint) - Otimizações

### O que é?
Tempo de resposta a interações do usuário (cliques, toques, teclado).

### Implementações Atuais ✅

#### 1. Debounce em Filtros
```typescript
// src/components/FiltersSidebar.tsx
const handleFilterChange = useDebouncedCallback(
  async (newFilters) => {
    setIsFiltering(true);
    await applyFilters(newFilters);
    setIsFiltering(false);
  },
  300 // 300ms debounce
);
```

#### 2. Loading States Visuais
```typescript
// Feedback imediato ao usuário
{isFiltering && (
  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm">
    <LoadingSpinner />
  </div>
)}
```

#### 3. Code Splitting Automático
```typescript
// Next.js App Router faz code splitting por rota
// Componentes pesados carregados sob demanda
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  loading: () => <MapSkeleton />,
  ssr: false,
});
```

### Próximas Otimizações Recomendadas 🎯

#### 1. Web Workers para Operações Pesadas
```typescript
// Filtros complexos ou ordenação de grandes listas
const worker = new Worker('/workers/filter.worker.js');
worker.postMessage({ properties, filters });
worker.onmessage = (e) => setFiltered(e.data);
```

#### 2. Virtualização de Listas
```typescript
// Para listagens com 100+ items
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={properties.length}
  itemSize={350}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <PropertyCard property={properties[index]} />
    </div>
  )}
</FixedSizeList>
```

#### 3. Optimistic UI Updates
```typescript
// Atualizar UI imediatamente, confirmar depois
const handleFavorite = async (id) => {
  // Atualizar UI imediatamente
  setFavorites(prev => [...prev, id]);
  
  try {
    await saveFavorite(id);
  } catch (error) {
    // Reverter se falhar
    setFavorites(prev => prev.filter(f => f !== id));
  }
};
```

---

## 🔧 Ferramentas de Monitoramento

### 1. Chrome DevTools

#### Performance Tab
```
1. Abrir DevTools (F12)
2. Performance tab
3. Click em Record (Ctrl+E)
4. Navegar/interagir
5. Stop
6. Analisar:
   - LCP (linha vertical azul)
   - Layout shifts (seção Experience)
   - Long tasks (barras vermelhas)
```

#### Lighthouse
```bash
# Via CLI
npm run lighthouse:mobile
npm run lighthouse:desktop

# Ou via DevTools
1. Lighthouse tab
2. Selecionar categorias
3. "Analyze page load"
```

### 2. PageSpeed Insights
```
https://pagespeed.web.dev/

Features:
- Field data (dados reais de usuários)
- Lab data (simulação)
- Sugestões específicas
- Core Web Vitals status
```

### 3. Google Search Console

#### Core Web Vitals Report
```
1. Acessar GSC
2. Experience > Core Web Vitals
3. Ver URLs com problemas
4. Filtrar por Mobile/Desktop
5. Verificar issues específicas
```

### 4. Real User Monitoring (RUM)

#### Web Vitals Library
```typescript
// Já implementado em src/lib/analytics/webVitals.ts
import { onLCP, onCLS, onINP } from 'web-vitals';

// Enviado para:
// - Google Tag Manager
// - Google Analytics 4
// - API customizada (opcional)
```

#### Google Analytics 4
```
1. GA4 > Reports > Engagement > Events
2. Filtrar por event_name: "LCP", "CLS", "INP"
3. Ver distribuição de valores
4. Criar segmentos por rating (good/needs-improvement/poor)
```

---

## 📋 Checklist de Otimização

### Homepage

- [x] Hero image com `priority` e `fetchPriority="high"`
- [x] Fonts com `display: swap`
- [x] Aspect ratio em todos os cards
- [x] Skeleton loaders com altura reservada
- [ ] Critical CSS inline
- [ ] Preload de fonts
- [ ] Remover JS não utilizado

### Página de Listagem (/imoveis)

- [x] Debounce em filtros (300ms)
- [x] Loading states visuais
- [x] Lazy loading de imagens
- [ ] Virtualização para 100+ items
- [ ] Pagination server-side
- [ ] Cache de resultados (SWR)

### Página de Detalhes (/imoveis/[id])

- [x] First image priority
- [x] Lazy load galeria completa
- [x] Map carregado sob demanda
- [ ] Preload de próxima imagem ao navegar
- [ ] Optimistic updates em favoritos
- [ ] Lazy load de comentários/reviews

---

## 🎯 Metas por Página

### Homepage
- **LCP:** < 2.0s (Hero image otimizada)
- **CLS:** < 0.05 (Layout estável)
- **INP:** < 150ms (Sem interações pesadas)

### Listagem (/imoveis)
- **LCP:** < 2.5s (First card)
- **CLS:** < 0.08 (Grid estável)
- **INP:** < 200ms (Filtros com debounce)

### Detalhes (/imoveis/[id])
- **LCP:** < 2.5s (Hero image do imóvel)
- **CLS:** < 0.1 (Galeria reserva espaço)
- **INP:** < 200ms (Navegação de imagens)

---

## 🚨 Red Flags - O que Evitar

### ❌ LCP
- Imagens sem `priority` no above-the-fold
- Fonts sem `display: swap`
- Render-blocking CSS/JS
- Large JavaScript bundles
- Lazy loading de hero image

### ❌ CLS
- Imagens sem width/height ou aspect-ratio
- Fonts sem fallback ou preload
- Conteúdo injetado acima do fold
- Anúncios sem espaço reservado
- Layout shift em loading states

### ❌ INP
- Event handlers bloqueantes
- Falta de debounce em inputs
- Operações síncronas pesadas
- Falta de loading states
- JS main thread bloqueado

---

## 📈 Plano de Ação 30 Dias

### Semana 1: Baseline
- [ ] Rodar Lighthouse em todas páginas principais
- [ ] Documentar scores atuais
- [ ] Configurar RUM no GA4
- [ ] Identificar páginas com pior performance

### Semana 2: Quick Wins
- [x] Implementar preload de hero images
- [x] Adicionar aspect-ratio em todos os cards
- [x] Configurar fonts com display swap
- [ ] Otimizar bundle size (tree shaking)

### Semana 3: Otimizações Avançadas
- [ ] Implementar critical CSS inline
- [ ] Configurar Image CDN
- [ ] Adicionar virtualização em listagens
- [ ] Web workers para filtros complexos

### Semana 4: Validação
- [ ] Rodar Lighthouse novamente
- [ ] Comparar com baseline
- [ ] Validar field data no GSC
- [ ] Ajustes finais

---

## 🎉 Resultados Esperados

### Lighthouse Scores
- **Performance:** 90+ → 95+
- **Accessibility:** 95+ → 100
- **Best Practices:** 95+ → 100
- **SEO:** 95+ → 100

### Core Web Vitals
- **LCP:** ~3.5s → < 2.5s (✅ Good)
- **CLS:** ~0.15 → < 0.1 (✅ Good)
- **INP:** ~250ms → < 200ms (✅ Good)

### Business Impact
- **Bounce Rate:** -15-20%
- **Conversão:** +10-15%
- **SEO Ranking:** +5-10 posições
- **User Satisfaction:** +20-25%

---

**Monitorar continuamente e iterar!** 🚀
**Core Web Vitals é uma jornada, não um destino.**





