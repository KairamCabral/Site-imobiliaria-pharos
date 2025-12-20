# Checklist de Build e Performance

Guia rápido para manter as otimizações já entregues (imagens, fontes, UX de navegação, build) e evoluir novas features sem regressões.

## 1. Imagens (`next/image`)

### Otimizações implementadas
- `next.config.ts` define `remotePatterns`, AVIF/WebP, `minimumCacheTTL` e cabeçalhos agressivos (`Cache-Control`) para todos os assets estáticos.
- `CustomImage` encapsula `next/image` com fallback, placeholders skeleton, `loading="lazy"` e desabilita otimização apenas quando a origem é externa.
- Seções críticas (hero da `Home`, carrosséis em `HomeClient`, banner de `/imoveis`) usam `priority`, `sizes` específicos e qualidade 85–90 focada no LCP.
- `LazySection` adia blocos pesados (carrosséis, depoimentos, CTA) usando `IntersectionObserver`, reduzindo trabalho durante o primeiro paint.

### Como evoluir com segurança
- Sempre utilizar `CustomImage` ou `next/image`; jamais voltar para `<img>` pois quebra a otimização automática.
- Definir `sizes` com breakpoints reais da seção e evitar `fill` sem um wrapper com `position: relative; aspect-ratio`.
- Marcar apenas o LCP com `priority`. Se vários `priority` forem necessários, validar pelo DevTools (`Performance Insights`) para não bloquear o main-thread.
- Para novas galerias, considerar `next/dynamic` ou mais uma camada de `LazySection` antes de renderizar Swiper/Leaflet.

### Checklist ao subir novas imagens
- [ ] Caminho remoto cadastrado em `next.config.ts` (`images.remotePatterns`).
- [ ] `width`, `height` ou `sizes` definidos.
- [ ] Placeholder visual (skeleton, blur ou `CustomImage`).
- [ ] Revisar impacto via `npm run lighthouse:mobile` após a feature.

## 2. Fontes (`next/font`)

- `src/app/layout.tsx` usa `next/font/google` para baixar e servir `Inter` localmente (`display: "swap"` e peso 400/500/700). Isso elimina flashes e evita requests de terceiros.
- Novas famílias devem seguir o mesmo padrão: preferir `next/font/local` para arquivos `.woff2` próprios ou `next/font/google` com `subsets`, `display` e `variable` configurados.
- Fontes customizadas devem ser guardadas em `public/fonts` e declaradas com `preload: true` apenas se participarem do LCP.
- Sempre validar no DevTools → aba “Rendering” → “Emulate vision deficiencies” para garantir que `font-smooth`/contrast não foi afetado.

## 3. Navegação, streaming e percepção de velocidade

- `LazySection` encapsula a estratégia de lazy loading inteligente. O `rootMargin` padrão é `0px`, mas em seções críticas usamos `200px` ou `320px` para pré-carregar um pouco antes do scroll.
- `Home` e `/imoveis` foram convertidos para Server Components com fetch na camada RSC (`getCachedPropertyList`), entregando HTML já preenchido e cacheado via ISR/RSC cache.
- No client (`HomeClient`, `ImoveisClient`) mantemos skeletons, debounce de filtros e infinite scroll com `IntersectionObserver`, evitando requisições repetidas.
- Sempre que criar novos widgets pesados (mapa, gráficos), envolver em `React.Suspense` com fallback leve e considerar `next/dynamic({ ssr: false })` se depender de APIs do browser.
- Links internos usam padrão `next/link` (prefetch automático). Para rotas muito pesadas, preferir `prefetch={false}` e acionar manualmente via `useEffect` para evitar downloads desnecessários.

## 4. Build, JS e CSS

- `next.config.ts` já habilita `compress`, remove `X-Powered-By` e aplica cache headers (JS/CSS/WOFF2 por 1 ano).
- Tailwind opera em JIT; combinar com `@apply` limitado e componentes utilitários evita CSS morto. Rodar `npm run build` garante que o purgador elimine classes não utilizadas.
- Para tree-shaking de ícones, continuar importando somente os necessários de `lucide-react`; dont usar `* as Icons`.
- Source maps de produção permanecem desabilitados (padrão Next). Se for preciso habilitar para depuração, usar `productionBrowserSourceMaps: true` apenas temporariamente.
- Recomendações adicionais:
  - Criar script opcional com `@next/bundle-analyzer` para auditar splits (`ANALYZE=true npm run build`).
  - Monitorar `React Server Components` no DevTools (tab `Components`) para checar se dependências client-only estão isoladas.
  - Conferir warnings de hydration e `use client` através do `next lint`.

## 5. Cache em três camadas

- CDN (Cloudflare/Vercel/NGINX): seguir as regras documentadas em `next.config.ts` e configurar purga via webhook chamando `/api/cache/revalidate` com a tag `properties:list`.
- Camada Next (`unstable_cache` + `revalidate` por rota): `Home` (`revalidate=300`) e `/imoveis` (`revalidate=60`) usam cache por filtros hash, devolvendo metadados de camada (`memory`, `redis`, `origin`).
- Redis/memória (`src/lib/cache`): `getOrSetMultiCache` fornece fallback seguro; use `invalidateMultiCache(namespace, key?)` após mutações ou webhooks de CRM.
- API responde com `x-cache-layer`, `x-cache-status`, `x-cache-expires` e `Cache-Control` público; mantenha logs para auditar HIT/MISS.

## 6. Observabilidade e QA contínua

- `docs/monitoramento-performance.md` detalha Web Vitals, `/api/metrics` e testes Lighthouse. Sempre registrar regressões de LCP/INP route-by-route.
- Scripts úteis:
  - `npm run lighthouse:mobile`
  - `npm run lighthouse:desktop`
  - `npm run test:properties` (smoke da API com cache)
- Recomendação: integrar `/api/metrics` com Datadog ou Vercel Web Analytics + agendamento de Lighthouse em CI.

> Dica final: qualquer PR que toque em imagens hero, fontes globais ou caches deve anexar prints do DevTools (Network → Size/Time) e resultados Lighthouse para manter a cadência de performance.
