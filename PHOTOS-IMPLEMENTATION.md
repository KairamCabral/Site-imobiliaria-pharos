# 📸 Sistema de Galeria de Fotos - Implementação Completa

> Implementação robusta de busca de fotos com múltiplos fallbacks e sanitização de URLs  
> **Data:** 19/10/2025  
> **Status:** ✅ Concluído

---

## 📋 Resumo Executivo

Implementação completa de um sistema robusto para busca de galerias de fotos da API Vista CRM, com:

- ✅ **3 níveis de fallback** automático
- ✅ **Sanitização** completa de URLs (http→https)
- ✅ **Normalização** de domínios CDN
- ✅ **Cache** com revalidação de 30 minutos
- ✅ **Logs** detalhados para observabilidade
- ✅ **UI adaptativa** para 0, 1 ou múltiplas fotos
- ✅ **Campo debug** `photosSource` para rastreamento

---

## 🎯 Objetivos Alcançados

### 1. Busca de Fotos com Múltiplos Fallbacks

**Ordem de tentativas:**

```
1. GET /imoveis/fotos?imovel={codigo}       (código como string: "PH742")
   └─ Se 404/empty →

2. GET /imoveis/fotos?imovel={numerico}     (código numérico: "742")
   └─ Se 404/empty →

3. GET /imoveis/detalhes?imovel={codigo}    (procura array fotos[] no detalhes)
   └─ Se empty →

4. Fallback: FotoDestaque                   (foto da listagem)
```

**Arquivo:** `src/providers/vista/VistaProvider.ts`

**Método:** `getPropertyPhotos(id: string)`

**Retorno:**
```typescript
{
  photos: Photo[],
  source: 'vista-fotos' | 'vista-fotos-numeric' | 'vista-detalhes' | 'fallback-destaque-detalhes' | 'fallback-empty'
}
```

---

### 2. Normalização e Sanitização de URLs

**Implementado em:** `src/utils/photoUtils.ts`

#### Funções Principais:

```typescript
// Converte http → https e normaliza CDN
sanitizePhotoUrl(url: string): string | undefined

// Valida se URL é uma imagem válida
isValidImageUrl(url: string): boolean

// Extrai melhor resolução (FotoGrande → Foto → FotoMedia)
extractBestPhotoUrl(foto: any): string | undefined

// Extrai thumbnail (FotoPequena → FotoMedia → fallback)
extractThumbnailUrl(foto: any, fallbackUrl?: string): string | undefined

// Remove duplicatas
deduplicatePhotos<T extends { url: string }>(photos: T[]): T[]
```

#### Domínios Normalizados:

```typescript
// Sandbox/Vistasoft → CDN
'www.vistasoft.com.br'    → 'https://cdn.vistahost.com.br'
'sandbox.vistahost.com.br' → 'https://cdn.vistahost.com.br'

// Força HTTPS em todos
http://cdn.vistahost.com.br → https://cdn.vistahost.com.br
```

---

### 3. Cache com Revalidação

**Arquivo:** `src/app/api/properties/[id]/route.ts`

**Configuração:**

```typescript
export const revalidate = 1800; // 30 minutos

// Headers de resposta
headers: {
  'Cache-Control': 's-maxage=1800, stale-while-revalidate=60'
}
```

**Estratégia:**
- **Cache de 30 minutos** no servidor (Next.js)
- **Stale-while-revalidate** de 60s (servir cache enquanto revalida)
- **Tolerância a erro**: se fotos falharem, não derruba o imóvel

---

### 4. Logs e Observabilidade

**Logs implementados:**

```typescript
// VistaProvider
console.log(`[VistaProvider] Tentando buscar fotos via /imoveis/fotos para ${codigo}`);
console.log(`[VistaProvider] ✅ Fotos encontradas via /imoveis/fotos: ${fotos.length} fotos`);
console.log(`[VistaProvider] /imoveis/fotos falhou (string):`, error.message);

// API Route
console.log(`[API /properties/${id}] Buscando galeria completa com fallbacks...`);
console.log(`[API /properties/${id}] ✓ Fotos via Provider: ${photos.length} (source: ${source})`);
console.warn(`[TELEMETRY] photo_gallery_missing - Imóvel ${id} com apenas ${photos.length} foto(s)`);
```

---

### 5. Campo Debug: `photosSource`

**Modelo atualizado:** `src/domain/models/Property.ts`

```typescript
interface Property {
  // ... outros campos
  photos: Photo[];
  photosSource?: 'vista-fotos' | 'vista-fotos-numeric' | 'vista-detalhes' | 
                 'fallback-destaque-detalhes' | 'fallback-destaque' | 'fallback-empty';
  galleryMissing?: boolean; // Flag para indicar galeria não disponível
}
```

**Resposta da API:**

```json
{
  "id": "PH1060",
  "photos": [...],
  "galleryMissing": false,
  "meta": {
    "photoCount": 12,
    "photosSource": "vista-fotos",
    "duration": 245,
    "fotosEndpointEnabled": true
  }
}
```

---

### 6. UI Adaptativa da Galeria

**Arquivo:** `src/components/ImageGallery.tsx`

#### Cenário 1: **0 Fotos**
```jsx
<div className="placeholder-premium">
  <svg>📷</svg>
  <p>Sem imagens disponíveis</p>
</div>
```

#### Cenário 2: **1 Foto** (FotoDestaque)
```jsx
// Hero: foto principal
// Grid lateral: 4 placeholders com CTA "Solicitar via WhatsApp"
<button onClick={handleWhatsAppClick}>
  Solicitar galeria completa
</button>
```

#### Cenário 3: **Múltiplas Fotos** (Galeria Completa)
```jsx
// Hero: 1ª foto
// Grid lateral: fotos 2-5
// Badge: "+X fotos" (se mais de 5)
// Lightbox: todas as fotos com navegação
```

**Props da Galeria:**

```typescript
interface ImageGalleryProps {
  images: string[];
  galleryMissing?: boolean; // Ativa placeholder quando só há FotoDestaque
  // ... outras props
}
```

---

### 7. Configuração de Domínios

**Arquivo:** `next.config.js`

**RemotePatterns configurados:**

```javascript
remotePatterns: [
  // Vista CRM
  {
    protocol: 'https',
    hostname: 'cdn.vistahost.com.br',
  },
  {
    protocol: 'https',
    hostname: '*.vistahost.com.br', // Wildcard para subdomínios
  },
  {
    protocol: 'https',
    hostname: '*.vista.imobi', // Algumas contas usam este domínio
  },
  // ... outros domínios
]
```

---

## 🔄 Fluxo Completo

### Requisição do Cliente

```
Cliente → GET /api/properties/PH1060
```

### Processamento no Servidor

```
1. Buscar imóvel via listagem (todos os dados básicos)
   └─ Retorna: property com FotoDestaque

2. Buscar galeria completa:
   
   a) Tenta /imoveis/fotos?imovel=PH1060
      └─ Status 200, 12 fotos → ✅ SUCESSO
      └─ photosSource = 'vista-fotos'
   
   Se falhar:
   
   b) Tenta /imoveis/fotos?imovel=1060 (numérico)
      └─ Status 200 → ✅ SUCESSO
      └─ photosSource = 'vista-fotos-numeric'
   
   Se falhar:
   
   c) Tenta via Provider.getPropertyPhotos()
      └─ Internamente tenta /imoveis/detalhes
      └─ Procura por arrays: fotos[], Fotos[], galeria[], Galeria[]
      └─ Se encontrar → ✅ SUCESSO
      └─ photosSource = 'vista-detalhes'
   
   Se falhar:
   
   d) Fallback: usa FotoDestaque da listagem
      └─ photos = [property.photos[0]]
      └─ photosSource = 'fallback-destaque'

3. Sanitizar URLs:
   - http → https
   - sandbox/vistasoft → cdn.vistahost.com.br
   - Remover duplicatas
   - Ordenar por Ordem

4. Retornar resposta com meta:
   - photos[] (sanitizadas)
   - galleryMissing: boolean
   - photosSource: string
   - photoCount: number
```

### Resposta ao Cliente

```json
{
  "id": "PH1060",
  "title": "Apartamento 2 Dormitórios - Barra Norte",
  "photos": [
    {
      "url": "https://cdn.vistahost.com.br/gabarito/vista.imobi/fotos/1060/foto1.jpg",
      "thumbnail": "https://cdn.vistahost.com.br/gabarito/vista.imobi/fotos/1060/foto1_thumb.jpg",
      "isHighlight": true,
      "order": 0
    },
    // ... mais 11 fotos
  ],
  "galleryMissing": false,
  "meta": {
    "photoCount": 12,
    "photosSource": "vista-fotos",
    "duration": 245,
    "fotosEndpointEnabled": true
  }
}
```

---

## 📊 Telemetria e Monitoramento

### Métricas Rastreadas

```typescript
// Analytics - Photo View
gtag('event', 'image_view', {
  property_id: 'PH1060',
  image_index: 3,
  direction: 'next'
});

// Telemetry - Gallery Missing
console.warn(`[TELEMETRY] photo_gallery_missing - Imóvel ${id} com apenas 1 foto`);

// Logs de Performance
console.log(`[API /properties/${id}] ✓ Concluído em ${duration}ms - ${photos.length} fotos`);
```

### Campos de Debug

```json
{
  "meta": {
    "photoCount": 1,
    "photosSource": "fallback-destaque",
    "duration": 180,
    "codigoVista": "PH1060",
    "codigoNumerico": "1060",
    "fotosEndpointEnabled": true
  }
}
```

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente

```bash
# .env.local
VISTA_BASE_URL=https://gabarito-rest.vistahost.com.br
VISTA_API_KEY=sua_chave_aqui

# Habilitar endpoint de fotos (se disponível na conta)
FOTOS_ENDPOINT_ENABLED=true  # ou false
```

---

## 🎨 Arquivos Criados/Modificados

### Arquivos Criados

- ✅ `src/utils/photoUtils.ts` - Utilitários de sanitização

### Arquivos Modificados

- ✅ `src/providers/vista/VistaProvider.ts` - Sistema de fallbacks
- ✅ `src/mappers/vista/PropertyMapper.ts` - Sanitização no mapper
- ✅ `src/domain/models/Property.ts` - Campo `photosSource`
- ✅ `src/app/api/properties/[id]/route.ts` - Integração dos fallbacks
- ✅ `next.config.js` - *(já estava configurado)*
- ✅ `src/components/ImageGallery.tsx` - *(já estava implementada)*

---

## 📈 Melhorias Implementadas

### Antes

```
❌ Apenas 1 foto por imóvel (FotoDestaque)
❌ URLs com http (inseguro)
❌ Sem fallbacks (se FotoDestaque falhar, quebra)
❌ Sem logs de debug
```

### Depois

```
✅ Até 50+ fotos por imóvel (se disponível)
✅ Todas URLs em HTTPS
✅ 4 níveis de fallback (nunca quebra)
✅ Logs detalhados com source tracking
✅ Cache de 30min
✅ UI adaptativa (0, 1 ou múltiplas fotos)
✅ Sanitização e normalização de CDN
✅ Remoção de duplicatas
✅ Ordenação correta
```

---

## 🧪 Testes Recomendados

### Teste 1: Imóvel com Galeria Completa

```bash
curl http://localhost:3600/api/properties/PH1060
# Espera: 10+ fotos, photosSource='vista-fotos'
```

### Teste 2: Imóvel com Apenas FotoDestaque

```bash
curl http://localhost:3600/api/properties/PH9999
# Espera: 1 foto, photosSource='fallback-destaque', galleryMissing=true
```

### Teste 3: Verificar Sanitização

```bash
# Abrir devtools → Network → filtrar por imagem
# Verificar: todas URLs devem estar em HTTPS
# Verificar: domínios devem ser cdn.vistahost.com.br
```

### Teste 4: Verificar Cache

```bash
# 1ª requisição (cold)
curl -I http://localhost:3600/api/properties/PH1060
# Header: Cache-Control: s-maxage=1800, stale-while-revalidate=60

# 2ª requisição (dentro de 30min)
# Deve ser servida do cache (resposta instantânea)
```

---

## 📝 Notas Importantes

### 1. Endpoint `/imoveis/fotos` Opcional

O endpoint `/imoveis/fotos` pode não estar disponível em todas as contas Vista.

**Controle:** `FOTOS_ENDPOINT_ENABLED=true|false`

- Se `false`: pula tentativas 1 e 2, vai direto para Provider
- Se `true`: tenta todas as estratégias

### 2. Código Numérico vs. String

Alguns endpoints Vista aceitam apenas código numérico (`742`), outros aceitam string (`PH742`).

**Solução:** Tentamos ambos automaticamente.

### 3. Duplicatas

Vista às vezes retorna a mesma foto em múltiplos campos (`FotoGrande`, `Foto`, `FotoMedia`).

**Solução:** Sistema remove duplicatas comparando URLs (sem query params).

### 4. Ordenação

Vista usa campo `Ordem` (número) para ordenar fotos. Foto destaque sempre tem `Ordem=0`.

**Solução:** Ordenamos por `Ordem` crescente, mantendo destaque primeiro.

---

## 🚀 Próximos Passos

### Opcionais (Futuro)

- [ ] **Lazy loading** de thumbnails no lightbox
- [ ] **WebP conversion** no CDN (se Vista suportar)
- [ ] **Placeholder blur** (LQIP) enquanto carrega
- [ ] **Analytics** de quais fontes de fotos são mais usadas
- [ ] **A/B test** de qual estratégia de fallback é mais efetiva

---

## ✅ Checklist de Implementação

- [x] Criar `photoUtils.ts` com funções de sanitização
- [x] Implementar `getPropertyPhotos()` com 3 fallbacks no VistaProvider
- [x] Adicionar campo `photosSource` no modelo Property
- [x] Atualizar PropertyMapper para sanitizar URLs
- [x] Integrar fallbacks na API route `/api/properties/[id]`
- [x] Configurar cache com `revalidate: 1800`
- [x] Adicionar logs detalhados em todos os níveis
- [x] Verificar que UI da galeria já suporta 0, 1 ou múltiplas fotos
- [x] Confirmar `remotePatterns` no next.config.js
- [x] Testar com imóveis reais
- [x] Documentar implementação completa

---

## 📞 Suporte

**Dúvidas sobre implementação:**
- Arquivo: `PHOTOS-IMPLEMENTATION.md`
- Mapeamento Vista: `VISTA-API-MAPPING.md`
- Slack: #tech-vista-integration

---

*Documento gerado em 19/10/2025 - Sistema Pharos Imobiliária*

