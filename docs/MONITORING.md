# 📊 Guia de Monitoramento - Pharos Imobiliária

**Última atualização:** 12/12/2025  
**Objetivo:** Observabilidade completa de performance, erros e negócio

---

## 🎯 O Que Monitorar

### 1. Core Web Vitals (RUM)

**Métricas:**
- LCP (Largest Contentful Paint)
- INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

**Onde:**
- Google Analytics 4 (custom events)
- Google Search Console
- `/api/metrics` endpoint (RUM interno)
- Datadog RUM (opcional)

**Alertas:**
- LCP > 3.5s → Slack #alerts
- INP > 400ms → Slack #alerts
- CLS > 0.2 → Slack #alerts

---

### 2. Erros (Client + Server)

**Client-side:**
- Capturados por Error Boundaries
- Enviados para Sentry
- Logs em `/api/metrics`

**Server-side:**
- Erros de API (Vista CRM)
- Falhas de build
- Problemas de cache (Redis)

**Onde:**
- Sentry: https://sentry.io/pharos
- Logs: Vercel/Railway
- Error Boundary: `src/app/error.tsx`

---

### 3. Negócio

**Métricas:**
- Leads gerados (formulários)
- Cliques em WhatsApp
- Visualizações de imóveis
- Taxa de conversão por fonte
- Tempo médio no site

**Onde:**
- Google Analytics 4
- `/api/leads` (tracking interno)
- CRM (Mautic/Vista)

---

## 🚀 Setup: RUM (Real User Monitoring)

### Endpoint: `/api/metrics`

**Já implementado:** ✅

**Funcionalidades:**
- Recebe Web Vitals dos usuários reais
- Envia para GA4 e Datadog
- Rate limiting (10 req/min por IP)
- Batching automático (reduz requests)

**Formato de payload:**
```typescript
POST /api/metrics
Content-Type: application/json

{
  "metrics": [
    {
      "name": "LCP",
      "value": 2134,
      "rating": "good",
      "delta": 2134,
      "id": "v3-1702...",
      "navigationType": "navigate"
    }
  ],
  "page": "/imoveis",
  "sessionId": "abc123",
  "timestamp": 1702310400000,
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "connection": {
    "effectiveType": "4g",
    "rtt": 50,
    "downlink": 10
  }
}
```

**Client-side (já configurado):**
```tsx
// src/lib/analytics/webVitals.ts
import { onLCP, onINP, onCLS } from 'web-vitals';

export function reportWebVitals() {
  onLCP(handleMetric);
  onINP(handleMetric);
  onCLS(handleMetric);
}

// Envia em batch para /api/metrics
// Debounce de 2s para reduzir requests
```

---

## 📈 Google Analytics 4

### Setup

**1. Criar propriedade GA4:**
```
Property ID: G-XXXXXXXXXX
Measurement ID: G-XXXXXXXXXX
```

**2. Configurar no .env.local:**
```bash
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_api_secret_here
```

**3. Custom Events (já implementados):**

**Web Vitals:**
```javascript
gtag('event', 'web_vitals', {
  event_category: 'Web Vitals',
  metric_name: 'LCP',
  metric_value: 2134,
  metric_rating: 'good',
  metric_id: 'v3-1702...',
  page_path: '/imoveis'
});
```

**Lead Tracking:**
```javascript
gtag('event', 'lead_submit_success', {
  property_id: 'PH1234',
  lead_id: 'lead-abc123',
  source: 'property_detail'
});
```

**Property Views:**
```javascript
gtag('event', 'property_view', {
  property_id: 'PH1234',
  property_type: 'apartamento',
  property_price: 850000
});
```

---

### Relatórios Customizados

**1. Web Vitals Report:**

```
GA4 > Exploração > Criar nova exploração

Dimensões:
- page_path
- device_category
- metric_name
- metric_rating

Métricas:
- metric_value (avg, p75, p95)
- event_count

Filtros:
- event_name = 'web_vitals'

Segmentos:
- Good (rating = 'good')
- Needs Improvement (rating = 'needs-improvement')
- Poor (rating = 'poor')
```

**2. Conversão Funnel:**

```
Landing Page → Property View → Lead Submit

Etapas:
1. page_view (entrada)
2. property_view
3. lead_submit_attempt
4. lead_submit_success
```

**3. Performance por Device:**

```
Exploração > Análise de coorte

Dimensões:
- device_category (mobile/desktop/tablet)
- browser (Chrome/Safari/Firefox)
- connection_type (4g/5g/wifi)

Métricas:
- LCP (avg)
- INP (p95)
- Bounce rate
```

---

## 🔍 Google Search Console

### Core Web Vitals Report

**Acesso:**
```
GSC > Experiência > Core Web Vitals
```

**Visualizações:**
- URLs com problemas (Poor URLs)
- Evolução temporal (28 dias)
- Segmentação Mobile vs Desktop
- Detalhes por URL individual

**Ações:**
1. Identificar páginas com LCP > 4s
2. Verificar origem dos problemas
3. Priorizar correções por volume de acessos
4. Validar correções (Request Indexing)

---

### Coverage Report

**Verificar:**
- [ ] URLs indexadas vs. não indexadas
- [ ] Erros de crawling (4xx, 5xx)
- [ ] Sitemaps processados
- [ ] Canonical tags corretos
- [ ] Mobile usability issues

**Alertas automáticos:**
- Novas URLs não indexadas > 10
- Erros 4xx/5xx > 5%
- Sitemap não processado

---

## 🛠️ Sentry (Error Tracking)

### Setup

**1. Criar projeto:**
```
https://sentry.io/
Project: pharos-imobiliaria
Platform: Next.js
```

**2. Configurar .env.local:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

**3. Instalar SDK:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**4. Error Boundaries (já implementados):**

```tsx
// src/app/error.tsx
useEffect(() => {
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { page: 'property-detail' },
      extra: { propertyId },
    });
  }
}, [error]);
```

---

### Alertas Configurados

**1. High-Frequency Errors:**
```
Condition: > 10 errors/min
Action: Slack #alerts + Email dev team
```

**2. New Errors:**
```
Condition: Nunca visto antes
Action: Slack #dev + Assign to on-call
```

**3. Performance Regression:**
```
Condition: TTFB > 2s em 10% das requests
Action: Email tech lead
```

---

## 📊 Dashboards

### 1. Performance Dashboard (GA4)

**Métricas:**
- LCP (p50, p75, p95) por página
- INP (p95) por device
- CLS (avg) por página
- Evolução temporal (30 dias)

**Filtros:**
- Device (mobile/desktop)
- Browser
- Connection type
- Country (BR focus)

**URL:** `https://analytics.google.com/analytics/web/#/report/...`

---

### 2. Business Dashboard (GA4)

**Métricas:**
- Leads gerados (diário)
- Taxa de conversão por fonte
- Imóveis mais visualizados
- Tempo médio no site
- Páginas por sessão

**Segmentos:**
- Organic (SEO)
- Direct
- Social (Facebook/Instagram)
- Paid (Google Ads)

---

### 3. Error Dashboard (Sentry)

**Visualizações:**
- Errors por severity (fatal/error/warning)
- Top 10 errors por volume
- Affected users
- Release tracking (deploy correlation)

**URL:** `https://sentry.io/organizations/pharos/issues/`

---

## 🚨 Alertas e SLA

### Alertas Críticos (P0)

| Alerta | Condição | Ação | SLA |
|--------|----------|------|-----|
| Site Down | Uptime < 99% | PagerDuty → on-call | 5min |
| API Failure | Error rate > 5% | Slack #alerts | 15min |
| LCP Regression | LCP > 4s em 20% | Email tech lead | 1h |

### Alertas Importantes (P1)

| Alerta | Condição | Ação | SLA |
|--------|----------|------|-----|
| INP Alto | INP > 500ms em 10% | Slack #dev | 4h |
| Bundle Size | First Load JS > 500KB | Block deploy | Immediate |
| Low Conversion | Lead rate < 2% | Email marketing | 24h |

---

## 📋 Checklist de Monitoramento

### Setup Inicial

- [x] `/api/metrics` endpoint criado
- [x] Web Vitals reporter configurado
- [ ] GA4 propriedade criada
- [ ] GA4 API Secret configurado
- [ ] Sentry projeto criado
- [ ] Error boundaries implementados
- [ ] Alertas Slack configurados

### Semanal

- [ ] Revisar Core Web Vitals (GSC)
- [ ] Verificar top errors (Sentry)
- [ ] Analisar conversão por fonte (GA4)
- [ ] Identificar páginas lentas

### Mensal

- [ ] Relatório de performance (executivo)
- [ ] Análise de tendências (30d vs 30d anterior)
- [ ] Review de alertas falsos positivos
- [ ] Otimizações prioritárias para próximo sprint

---

## 🔧 Troubleshooting

### Web Vitals Não Aparecem no GA4

**Causas:**
1. GA4_MEASUREMENT_ID não configurado
2. GA4_API_SECRET incorreto
3. Ad blocker bloqueando requests
4. Ambiente dev (métricas não enviadas)

**Solução:**
```bash
# Verificar env vars
echo $NEXT_PUBLIC_GA4_MEASUREMENT_ID

# Testar endpoint
curl -X POST http://localhost:3700/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"metrics":[{"name":"LCP","value":2000,"rating":"good"}]}'

# Ver logs no console (dev)
# Web Vitals devem aparecer em console.log
```

---

### Erros Não Chegam no Sentry

**Causas:**
1. SENTRY_DSN não configurado
2. Error boundary não envolvendo componente
3. Build sem sourcemaps

**Solução:**
```tsx
// Verificar Sentry init
if (typeof window !== 'undefined' && !window.Sentry) {
  console.error('Sentry não inicializado');
}

// Forçar erro para testar
throw new Error('Test error for Sentry');
```

---

### Cache Hit Rate Baixo

**Causas:**
1. Revalidate muito agressivo
2. URLs com query params variados
3. Redis desconectado

**Solução:**
```bash
# Verificar Redis
redis-cli ping

# Ver stats de cache
curl http://localhost:3700/api/cache/stats

# Aumentar revalidate
export const revalidate = 600; // 10min
```

---

## 📚 Recursos

- [GA4 Setup Guide](https://developers.google.com/analytics/devguides/collection/ga4)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Web Vitals Library](https://github.com/GoogleChrome/web-vitals)
- [GSC API](https://developers.google.com/webmaster-tools)

---

**Dúvidas?** Consulte o time de engenharia ou documentação interna.

