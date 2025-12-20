# Limitações da API Vista

## Performance vs Completude

### Contexto

A API Vista CRM possui dois endpoints principais para imóveis:

1. **`/imoveis/listar`** - Listagem rápida com dados básicos
2. **`/imoveis/detalhes`** - Detalhes completos de um imóvel

### Problema Identificado

O endpoint de listagem retorna apenas:
- Código do imóvel
- Endereço (rua, bairro, cidade)
- Tipo básico (apartamento, casa, etc.)
- Categoria

**NÃO retorna:**
- ❌ Preço (venda/locação)
- ❌ Quartos/Suítes/Vagas
- ❌ Áreas (privativa/total)
- ❌ Fotos/Galeria
- ❌ Descrição completa
- ❌ Características (mobiliado, aceita pet, etc.)

---

## Soluções Avaliadas

### Opção 1: Listagem Rápida ❌ (DESCARTADA)

**Implementação:**
- Usar apenas `/imoveis/listar`
- Exibir cards com dados parciais

**Resultado:**
- ⏱️ Tempo: ~500ms
- 📊 Dados: Apenas básicos (código, endereço)
- ⚠️ Problema: Cards vazios (R$ 0, sem fotos, sem quartos)

**Motivo da rejeição:**
Cards sem preço e fotos geram experiência ruim ao usuário e reduzem conversões.

---

### Opção 2: Listagem Completa ✅ (IMPLEMENTADA)

**Implementação:**
1. Buscar lista básica via `/imoveis/listar`
2. Para cada imóvel, buscar detalhes via `/imoveis/detalhes`
3. Enriquecer dados antes de exibir

**Resultado:**
- ⏱️ Tempo: ~2-5s para 6 imóveis (homepage)
- ⏱️ Tempo: ~3-8s para 12 imóveis (listagem)
- 📊 Dados: **Completos** (preço, quartos, fotos, descrição)
- ✅ UX: Cards preenchidos e atrativos

**Otimizações aplicadas:**

1. **Cache em Memória (5 minutos)**
   - Segunda busca é instantânea
   - Reduz chamadas à API em 90%

2. **Busca em Lotes (5 concorrentes)**
   - Evita timeout em listas grandes
   - Promise.allSettled para resiliência

3. **Fallback Inteligente**
   - Se detalhes falharem, usa dados básicos
   - Não quebra a listagem

---

## Configurações Recomendadas

### Homepage (Imóveis em Destaque)
```typescript
{
  limit: 6,          // Poucos imóveis
  cache: '5min',     // Cache agressivo
  enrichment: true   // Sempre enriquecer
}
```
**Tempo esperado:** 2-3s na primeira carga, <100ms no cache

---

### Página de Listagem
```typescript
{
  limit: 12,         // Paginação moderada
  cache: '5min',
  enrichment: true,
  lazyLoad: false    // Por ora, enriquecer tudo
}
```
**Tempo esperado:** 3-6s na primeira carga, <100ms no cache

---

### Página de Detalhes
```typescript
{
  cache: '10min',    // Cache mais longo (dados mudam pouco)
  enrichment: true
}
```
**Tempo esperado:** 500ms-1s na primeira carga, <50ms no cache

---

## Métricas de Performance

### Cenário Real (Produção)

| Cenário | Quantidade | Tempo (1ª vez) | Tempo (cache) | Qualidade |
|---------|-----------|----------------|---------------|-----------|
| Homepage | 6 imóveis | 2-3s | <100ms | 100% completo |
| Listagem | 12 imóveis | 4-6s | <100ms | 100% completo |
| Listagem | 20 imóveis | 6-10s | <100ms | 100% completo |
| Detalhes | 1 imóvel | 500ms-1s | <50ms | 100% completo |

### Custos de API

- **Listagem (12 imóveis):** 1 + 12 = **13 requisições**
- **Com cache (5min):** Reduz para **~1 requisição** na maioria dos casos
- **Rate limit Vista:** 100 req/min (suficiente)

---

## Trade-offs Aceitos

### ✅ Aceitável
- Tempo de carregamento inicial de 2-5s (padrão do mercado)
- Cache de 5 minutos (imóveis não mudam tanto)
- UX com skeleton durante carregamento

### ❌ Inaceitável (evitado)
- Cards sem preço/fotos (rejeitado)
- Erros visíveis ao usuário (tratados com fallback)
- Timeout (resolvido com busca em lotes)

---

## Monitoramento

### Logs Implementados

```
[VistaProvider] Found 6 basic properties
[VistaProvider] Enriching 6 properties with details...
[VistaProvider] Processing batch 1/2
[VistaProvider] Cache hit for PH1108
[VistaProvider] Enrichment complete: 6 properties
```

### Métricas Coletadas

1. **Tempo de enriquecimento** (enrichmentTime)
2. **Taxa de cache hit** (logs)
3. **Qualidade dos dados** (hasPrice, hasPhotos, etc.)
4. **Erros por imóvel** (warnings, não quebram fluxo)

---

## Próximos Passos (Futuro)

### Fase 2: Otimizações Avançadas

1. **Cache Persistente (Redis/Upstash)**
   - Compartilhar cache entre instâncias
   - TTL configurável por tipo

2. **Background Sync**
   - Job agendado (cron) para atualizar cache
   - Usuários sempre acessam dados frescos do cache

3. **GraphQL/Composite API**
   - Camada própria que pré-agrega dados
   - Vista → Pharos DB → Frontend

4. **Server-Side Rendering (SSR)**
   - Gerar HTML com dados no servidor
   - Tempo de First Contentful Paint reduzido

### Fase 3: CRM Próprio (Pharos)

Quando migrarmos para o CRM Pharos:
- API customizada com endpoint `/imoveis/completos`
- Dados desnormalizados para listagem
- Tempo alvo: <500ms para 20 imóveis

---

## Conclusão

A solução implementada **prioriza qualidade de dados e UX** sobre velocidade absoluta.

✅ **Prós:**
- Cards completos e atrativos
- Taxa de conversão otimizada
- Cache eficiente reduz carga

⚠️ **Contras:**
- Primeira carga pode levar 3-5s
- Dependente da performance da API Vista

**Decisão:** Solução aceitável para MVP e produção inicial. Otimizações avançadas serão implementadas conforme demanda.

---

**Última atualização:** 15/10/2025  
**Responsável:** Equipe Pharos Tech

