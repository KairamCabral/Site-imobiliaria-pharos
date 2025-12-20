# Monitoramento de Performance

## Web Vitals

- As métricas básicas (LCP, FID, CLS, INP, TTFB, FCP) são coletadas automaticamente no cliente via `src/lib/analytics`.
- Os dados são enviados para `/api/metrics` usando `navigator.sendBeacon`, permitindo integração com serviços externos (Datadog, Vercel Analytics, GA4) no backend.
- Durante o desenvolvimento os valores são exibidos no console para facilitar depuração.

## Métricas de API

- Todo `fetch` realizado pelo hook `useProperties` é temporizado e reportado (tempo de resposta, status, cache hit, filtros hash).
- As métricas são entregues para o mesmo endpoint `/api/metrics`, centralizando observabilidade de front e back.

## Testes Lighthouse Automatizados

1. Suba o servidor local em `http://localhost:3600`.
2. Execute os relatórios:
   - `npm run lighthouse:mobile`
   - `npm run lighthouse:desktop`
3. Os resultados (JSON) ficam em `.reports/*` (ignorados no Git), prontos para dashboards ou CI.

## Próximos Passos Sugeridos

- Integrar `/api/metrics` com Datadog (HTTP intake) ou Vercel Analytics para dashboard contínuo.
- Publicar os artefatos Lighthouse em uma pipeline (GitHub Actions) agendada para acompanhar regressões.
- Definir alertas para quedas de Web Vitals ou respostas lentas da API.

