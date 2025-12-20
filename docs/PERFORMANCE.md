# 🚀 Guia de Performance - Pharos Imobiliária

**Última atualização:** 12/12/2025  
**Metas:** LCP < 2.0s | INP < 150ms | CLS < 0.05

---

## 📊 Core Web Vitals

### Metas por Página

| Página | LCP | INP | CLS | Lighthouse |
|--------|-----|-----|-----|------------|
| Home | < 1.8s | < 150ms | < 0.05 | 95+ |
| /imoveis | < 2.5s | < 200ms | < 0.08 | 90+ |
| /imoveis/[id] | < 2.3s | < 180ms | < 0.10 | 92+ |
| /contato | < 2.0s | < 150ms | < 0.05 | 95+ |

### Como Medir

**Desenvolvimento (Lab Data):**
```bash
# Lighthouse local
npm run lighthouse:mobile
npm run lighthouse:desktop

# WebPageTest
npx @webpagetest/api test http://localhost:3700 \
  --location Dulles:Chrome --runs 3
```

**Produção (Field Data):**
- Google Search Console > Core Web Vitals
- Google Analytics 4 > Web Vitals (custom report)
- `/api/metrics` endpoint (RUM data)

---

## 🎯 Otimizações Implementadas

### ✅ Imagens (LCP -40%)

**Problema:** Imagens Vista CRM pesadas (1-2MB JPEG)  
**Solução:** Image Proxy com AVIF/WebP

```tsx
// ❌ Antes
<Image src="https://vista.com/foto.jpg" ... />

// ✅ Depois
import { getOptimizedImageUrl } from '@/utils/imageOptimization';

const optimizedSrc = getOptimizedImageUrl(
  'https://vista.com/foto.jpg',
  800, // width
  85   // quality
);

<Image src={optimizedSrc} ... />
```

**Resultado:**
- Tamanho: 1.2MB → 180KB (85% redução)
- LCP: 3.5s → 2.1s (40% melhoria)
- Formato: AVIF para browsers modernos, fallback WebP/JPEG

**Uso em componentes:**
```tsx
import { IMAGE_PRESETS, getPresetProps } from '@/utils/imageOptimization';

// Preset otimizado para card de imóvel
<Image 
  {...getPresetProps(
    property.photos[0].url,
    'propertyCard',
    property.title,
    false // priority
  )}
/>
```

**API Endpoint:** `/api/image-proxy?url=X&w=800&q=85`

---

### ✅ Fontes (CLS -60%)

**Problema:** Inter loading causa FOIT e layout shift  
**Solução:** Preload + display:swap + fallback metrics

```tsx
// src/app/layout.tsx
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Evita FOIT
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  preload: true, // <link rel="preload">
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true, // Ajusta métricas
});
```

**Resultado:**
- CLS: 0.15 → 0.06 (60% melhoria)
- Sem flash de texto invisível
- Fallback visual consistente

**Preloads no <head>:**
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

---

### ✅ Filtros com Debounce (INP -50%)

**Problema:** Cada keystroke dispara re-render e API call  
**Solução:** Debounce 500ms + state local

```tsx
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

// State local (UX responsivo)
const [localSearch, setLocalSearch] = useState('');

// Debounced API call
const debouncedSearch = useDebouncedCallback(
  (query: string) => {
    fetchResults(query);
  },
  500 // 500ms
);

<input
  value={localSearch}
  onChange={(e) => {
    setLocalSearch(e.target.value); // Imediato
    debouncedSearch(e.target.value); // Debounced
  }}
/>
```

**Resultado:**
- INP: 350ms → 180ms (50% melhoria)
- Re-renders: 100/s → 2/s (98% redução)
- Melhor UX (sem lag)

**Hook disponível:** `src/hooks/useDebouncedCallback.ts`

---

### ✅ Lazy Loading de Scripts (FCP -30%)

**GTM carregado após interação:**
```tsx
// src/components/GTMScript.tsx
<Script
  id="gtm-script"
  strategy="lazyOnload" // Apenas após First Input
  dangerouslySetInnerHTML={{...}}
/>
```

**Google Maps on-demand:**
```tsx
import { useInView } from 'react-intersection-observer';

const { ref, inView } = useInView({ triggerOnce: true });

<div ref={ref}>
  {inView && <GoogleMapsEmbed />}
</div>
```

**Resultado:**
- FCP: 2.1s → 1.5s (30% melhoria)
- TTI: 4.2s → 3.1s (26% melhoria)
- Main thread menos bloqueado

---

### ✅ Sitemaps Paginados (SEO)

**Problema:** 1 sitemap com 2000+ URLs (lento para crawler)  
**Solução:** Máximo 1000 URLs por sitemap

```typescript
// src/app/sitemap-imoveis.ts
const MAX_URLS_PER_SITEMAP = 1000;

export default async function sitemap() {
  const { properties } = await service.searchProperties(
    { status: 'available' },
    { page: 1, limit: MAX_URLS_PER_SITEMAP }
  );
  
  return properties.map((p) => ({
    url: `${baseUrl}/imoveis/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: p.isExclusive ? 0.9 : 0.6,
  }));
}
```

**Estrutura:**
- `/sitemap.xml` → Index
- `/sitemap-imoveis.xml` → Primeiros 1000
- `/sitemap-empreendimentos.xml` → Empreendimentos
- `/sitemap-bairros.xml` → Landing pages locais

---

## 🔧 Próximas Otimizações

### P1 - Bundle Size (Em Andamento)

**Atual:** 450KB First Load JS  
**Meta:** < 300KB

**Ações:**
1. ❌ Remover Leaflet (200KB) → Usar apenas Google Maps
2. ⏳ Otimizar Framer Motion (usar apenas animations essenciais)
3. ⏳ Substituir Swiper por CSS scroll-snap nativo
4. ⏳ Dynamic imports agressivos

**Script de análise:**
```bash
ANALYZE=true npm run build
# Abre webpack bundle analyzer
```

---

### P2 - Virtualização da Listagem

**Problema:** 200+ cards renderizados de uma vez  
**Solução:** react-window ou Intersection Observer

**Opção 1: react-window (22KB)**
```tsx
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={3}
  columnWidth={350}
  height={800}
  rowCount={Math.ceil(properties.length / 3)}
  rowHeight={420}
>
  {PropertyCard}
</FixedSizeGrid>
```

**Opção 2: Native Intersection Observer (0KB)**
```tsx
// Renderizar apenas cards visíveis + 10 buffer
const { ref, inView } = useInView({ rootMargin: '200px' });

{properties.map((p, i) => (
  <PropertyCard
    key={p.id}
    ref={i === visibleIndex ? ref : null}
    visible={Math.abs(i - visibleIndex) < 10}
  />
))}
```

**Impacto esperado:**
- INP: 180ms → < 150ms
- Memory: -60%
- Scroll: Smooth 60fps

---

### P3 - Critical CSS Inline

**Objetivo:** Eliminar render-blocking CSS

```bash
# Extrair CSS crítico
npx critters dist/**/*.html

# Inline no layout.tsx
export default function Layout({ children }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: criticalCSS
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Impacto esperado:**
- FCP: 1.5s → < 1.2s
- Lighthouse: +5 pontos

---

## 📋 Checklist de Otimização

### Antes de Deploy

- [ ] `npm run lighthouse:mobile` > 85
- [ ] `npm run lighthouse:desktop` > 90
- [ ] Bundle size < 350KB
- [ ] Sem console.errors em produção
- [ ] Imagens com alt text
- [ ] Meta tags presentes
- [ ] Sitemaps acessíveis

### Após Deploy

- [ ] Validar Web Vitals no GSC (24h)
- [ ] Verificar Core Web Vitals Report
- [ ] Monitorar `/api/metrics` para regressões
- [ ] Testar em mobile real (não apenas emulador)

---

## 🛠️ Ferramentas

### Desenvolvimento

- **Lighthouse CI:** `npm run lighthouse:mobile`
- **Bundle Analyzer:** `ANALYZE=true npm run build`
- **Chrome DevTools:** Performance tab + Coverage
- **React DevTools Profiler:** Identificar re-renders

### Produção

- **Google Search Console:** Core Web Vitals report
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **WebPageTest:** https://webpagetest.org/
- **RUM interno:** `/api/metrics` + GA4

---

## 📚 Recursos

- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
- [JavaScript Performance](https://web.dev/fast/#optimize-your-javascript)

---

**Perguntas?** Consulte o time de engenharia ou abra issue no repositório.

