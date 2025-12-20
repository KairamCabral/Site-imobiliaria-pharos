# 📊 MAPEAMENTO COMPLETO: API VISTA CRM

> Documentação técnica completa sobre campos disponíveis e indisponíveis da API Vista CRM  
> **Última atualização:** 19/10/2025  
> **Projeto:** Pharos Negócios Imobiliários

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Campos Disponíveis](#campos-disponíveis)
3. [Campos Indisponíveis](#campos-indisponíveis)
4. [Campos Calculados](#campos-calculados)
5. [Resumo Estatístico](#resumo-estatístico)
6. [Impacto no Sistema](#impacto-no-sistema)
7. [Soluções e Workarounds](#soluções-e-workarounds)

---

## 🎯 Visão Geral

A API do Vista CRM fornece dados de imóveis através do endpoint `/imoveis/listar` e `/imoveis/detalhes`. Este documento mapeia **TODOS** os campos solicitados vs. campos efetivamente retornados pela API na conta atual.

### Estrutura de Dados

```typescript
// Vista CRM (Provider) → Property (Domain Model)
VistaImovel → mapVistaToProperty() → Property
```

### Taxa de Disponibilidade Geral

```
✅ Disponíveis: ~55%
⚠️  Parciais: ~15%
❌ Indisponíveis: ~30%
```

---

## ✅ CAMPOS DISPONÍVEIS

### 1. Identificação Básica

| Campo Vista | Tipo | Mapeado Para | Sempre Disponível |
|-------------|------|--------------|-------------------|
| `Codigo` | `number\|string` | `property.id` & `property.code` | ✅ Sim |
| `CodigoImovel` | `string` | `property.code` (fallback) | ✅ Sim |
| `TipoImovel` | `string` | `property.type` | ✅ Sim |
| `Finalidade` | `string` | `property.purpose` | ✅ Sim |
| `Status` | `string` | `property.status` | ✅ Sim |
| `Categoria` | `string` | *(não usado)* | ✅ Sim |

**Exemplo de Resposta:**
```json
{
  "Codigo": "PH1060",
  "CodigoImovel": "PH1060",
  "TipoImovel": "Apartamento",
  "Finalidade": "Venda",
  "Status": "Ativo"
}
```

---

### 2. Localização Completa

| Campo Vista | Tipo | Mapeado Para | Sempre Disponível |
|-------------|------|--------------|-------------------|
| `Endereco` | `string` | `property.address.street` | ✅ Sim |
| `Numero` | `string` | `property.address.number` | ✅ Sim |
| `Complemento` | `string` | `property.address.complement` | ⚠️ Opcional |
| `Bairro` | `string` | `property.address.neighborhood` | ✅ Sim |
| `Cidade` | `string` | `property.address.city` | ✅ Sim |
| `UF` / `Estado` | `string` | `property.address.state` | ✅ Sim |
| `CEP` | `string` | `property.address.zipCode` | ⚠️ Opcional |
| `Latitude` | `string\|number` | `property.address.coordinates.lat` | ✅ Sim |
| `Longitude` | `string\|number` | `property.address.coordinates.lng` | ✅ Sim |

**Exemplo de Resposta:**
```json
{
  "Endereco": "Atlântica",
  "Numero": "680",
  "Bairro": "Barra Norte",
  "Cidade": "Balneário Camboriú",
  "UF": "SC",
  "CEP": "88330-012",
  "Latitude": "-26.9876",
  "Longitude": "-48.6342"
}
```

**Observação:** As coordenadas são validadas antes de uso. Se inválidas, o campo `coordinates` fica `undefined`.

---

### 3. Valores Financeiros

| Campo Vista | Tipo | Mapeado Para | Sempre Disponível |
|-------------|------|--------------|-------------------|
| `ValorVenda` | `string\|number` | `property.pricing.sale` | ✅ Sim |
| `ValorLocacao` | `string\|number` | `property.pricing.rent` | ⚠️ Se for aluguel |
| `ValorCondominio` | `string\|number` | `property.pricing.condo` | ⚠️ Se tiver condomínio |
| `ValorIPTU` | `string\|number` | `property.pricing.iptu` | ❌ **NUNCA retorna** |

**Exemplo de Resposta:**
```json
{
  "ValorVenda": "1800000",
  "ValorCondominio": "5413"
}
```

**⚠️ Campo Problemático:**
- `ValorIPTU`: Solicitado na query, mas **nunca** retorna dados (sempre `null` ou `undefined`)

---

### 4. Especificações do Imóvel

| Campo Vista | Tipo | Mapeado Para | Sempre Disponível |
|-------------|------|--------------|-------------------|
| `AreaTotal` | `string\|number` | `property.specs.totalArea` | ⚠️ Opcional |
| `AreaPrivativa` | `string\|number` | `property.specs.privateArea` | ✅ Sim |
| `AreaTerreno` | `string\|number` | `property.specs.landArea` | ⚠️ Só para terrenos/casas |
| `Dormitorios` | `string\|number` | `property.specs.bedrooms` | ✅ Sim |
| `Suites` | `string\|number` | `property.specs.suites` | ⚠️ Opcional |
| `Banheiros` | `string\|number` | `property.specs.bathrooms` | ❌ **NUNCA retorna** |
| `Lavabos` | `string\|number` | `property.specs.halfBathrooms` | ❌ Não retorna |
| `Vagas` | `string\|number` | `property.specs.parkingSpots` | ⚠️ Opcional |
| `Andar` | `string\|number` | `property.specs.floor` | ❌ Não retorna |
| `TotalAndares` | `string\|number` | `property.specs.totalFloors` | ❌ Não retorna |

**Exemplo de Resposta:**
```json
{
  "AreaTotal": "52",
  "AreaPrivativa": "52",
  "Dormitorios": "2",
  "Suites": "0",
  "Vagas": "0"
}
```

**❌ Campos Críticos Ausentes:**
- `Banheiros`: Campo solicitado mas **NUNCA** retorna (impacta filtros e cards)
- `Andar` / `TotalAndares`: Não disponíveis nesta conta

---

### 5. Características/Features (Booleanos)

#### ✅ Campos que Retornam (50%)

| Campo Vista | Mapeado Para | Formato Retornado |
|-------------|--------------|-------------------|
| `Mobiliado` | `features.furnished` | `"Sim"/"Não"`, `"S"/"N"`, `1/0`, `true/false` |
| `Sacada` | `features.balcony` | `"Sim"/"Não"` |
| `Varanda` | `features.balcony` | `"Sim"/"Não"` |
| `Piscina` | `features.pool` | `"Sim"/"Não"` |
| `Elevador` | `features.elevator` | `"Sim"/"Não"` |
| `Churrasqueira` | `features.bbqGrill` | `"Sim"/"Não"` |
| `Sauna` | `features.sauna` | `"Sim"/"Não"` |
| `SalaoFestas` | `features.partyRoom` | `"Sim"/"Não"` |
| `Playground` | `features.playground` | `"Sim"/"Não"` |
| `Hidromassagem` | `features.jacuzzi` | `"Sim"/"Não"` |
| `ArCondicionado` | `features.airConditioning` | `"Sim"/"Não"` |
| `Alarme` | `features.alarm` | `"Sim"/"Não"` |
| `Interfone` | `features.intercom` | `"Sim"/"Não"` |

**Função de Parse:**
```typescript
function parseBoolean(value: any): boolean | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  
  const normalized = String(value).toLowerCase().trim();
  if (['sim', 's', 'true', '1'].includes(normalized)) return true;
  if (['não', 'nao', 'n', 'false', '0'].includes(normalized)) return false;
  
  return undefined;
}
```

#### ❌ Campos que NÃO Retornam (50%)

| Campo Vista | Mapeado Para | Status |
|-------------|--------------|--------|
| `AceitaPet` | `features.petFriendly` | ❌ Não retorna |
| `Acessibilidade` | `features.accessible` | ❌ Não retorna |
| `VarandaGourmet` | `features.balcony` | ❌ Não retorna |
| `VistaMar` | `features.oceanView` | ❌ Não retorna |
| `Academia` | `features.gym` | ❌ Não retorna |
| `Lareira` | `features.fireplace` | ❌ Não retorna |
| `Quadra` | `features.sportsField` | ❌ Não retorna |
| `Bicicletario` | `features.bikeRack` | ❌ Não retorna |
| `Aquecimento` | `features.heating` | ❌ Não retorna |
| `CercaEletrica` | `features.electricFence` | ❌ Não retorna |
| `Portaria24h` | `features.gatedCommunity` | ❌ Não retorna |
| `Jardim` | `features.garden` | ❌ Não retorna |
| `Quintal` | `features.backyard` | ❌ Não retorna |

---

### 6. Mídia e Conteúdo

| Campo Vista | Tipo | Mapeado Para | Sempre Disponível |
|-------------|------|--------------|-------------------|
| `FotoDestaque` | `string` (URL) | `property.photos[0]` | ✅ Sim |
| `TituloSite` | `string` | `property.title` | ✅ Sim |
| `DescricaoWeb` | `string` | `property.description` | ⚠️ Opcional |

**Exemplo de Resposta:**
```json
{
  "FotoDestaque": "https://cdn.vistahost.com.br/123456/foto.jpg",
  "TituloSite": "Apartamento 2 Dormitórios - Barra Norte",
  "DescricaoWeb": "Lindo apartamento frente mar..."
}
```

#### ❌ Campos de Mídia Indisponíveis

| Campo Vista | Motivo |
|-------------|--------|
| `fotos[]` | **Não disponível nesta conta do Vista** |
| `FotoCapa` | Não retorna (usa `FotoDestaque` como fallback) |
| `Titulo` | Não retorna (usa `TituloSite`) |
| `Descricao` | Não retorna (usa `DescricaoWeb`) |
| `Videos[]` | Não retorna |
| `TourVirtual` | Não retorna |

**⚠️ Impacto Crítico:**
- Sistema tem apenas **1 foto por imóvel** (foto destaque)
- Galeria de fotos não é possível com a configuração atual

---

### 7. Empreendimento/Condomínio

| Campo Vista | Tipo | Mapeado Para | Sempre Disponível |
|-------------|------|--------------|-------------------|
| `Empreendimento` | `string` | `property.buildingName` | ⚠️ Opcional |

**Exemplo de Resposta:**
```json
{
  "Empreendimento": "Edifício Vista Mar"
}
```

**Campos Alternativos (não retornam):**
- `NomeEmpreendimento`
- `NomeCondominio`
- `Condominio`

**Mapeamento Interno:**
O `buildingId` (ID interno Pharos) é mapeado através do arquivo:
```
src/data/empreendimentosMapping.ts
```

---

### 8. Datas e Timestamps

| Campo Vista | Tipo | Mapeado Para | Sempre Disponível |
|-------------|------|--------------|-------------------|
| `DataCadastro` | `string` (ISO) | `property.createdAt` | ✅ Sim |
| `DataAtualizacao` | `string` (ISO) | `property.updatedAt` | ✅ Sim |

**Exemplo de Resposta:**
```json
{
  "DataCadastro": "2025-01-15T10:30:00",
  "DataAtualizacao": "2025-10-08T14:22:00"
}
```

**Formato de Parse:**
```typescript
function parseDate(value: any): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}
```

---

### 9. Flags de Lançamento

| Campo Vista | Tipo | Mapeado Para | Sempre Disponível |
|-------------|------|--------------|-------------------|
| `Lancamento` | `boolean\|string` | `property.isLaunch` | ✅ Sim |

**Exemplo de Resposta:**
```json
{
  "Lancamento": "Sim"
}
```

---

## ❌ CAMPOS INDISPONÍVEIS

### 1. Flags de Prioridade e Visibilidade (0% disponível)

| Campo Vista | Finalidade | Status |
|-------------|------------|--------|
| `ExibirSite` | Exibir no site | ❌ Nunca retorna |
| `ExibirWeb` | Exibir no site (alt) | ❌ Nunca retorna |
| `PublicarSite` | Publicar no site (alt) | ❌ Nunca retorna |
| `Exclusivo` | Prioridade 1 - Exclusivos | ❌ Nunca retorna |
| `SuperDestaque` | Prioridade 2 - Super Destaques | ❌ Nunca retorna |
| `TemPlaca` | Prioridade 3 - Com Placa | ❌ Nunca retorna |
| `Placa` | Prioridade 3 (alt) | ❌ Nunca retorna |
| `DestaqueWeb` | Prioridade 4 - Destaque Web | ❌ Nunca retorna |
| `Destaque` | Destaque genérico | ❌ Nunca retorna |

**🚨 Impacto Crítico:**
```
Impossível ordenar imóveis por prioridade conforme marcação no CRM Vista.
O usuário marca "Super Destaque" no CRM, mas a API não retorna essa informação.
```

**Solução Atual:**
- Sistema usa ordenação por `DataAtualizacao` (mais recentes primeiro)
- Flags ficam sempre `false` ou `undefined`

---

### 2. Relacionamentos - Corretor (0% disponível)

| Campo Vista | Finalidade | Status |
|-------------|------------|--------|
| `Corretor.Codigo` | ID do corretor | ❌ Não retorna |
| `Corretor.Nome` | Nome do corretor | ❌ Não retorna |
| `Corretor.Email` | Email do corretor | ❌ Não retorna |
| `Corretor.Fone` | Telefone | ❌ Não retorna |
| `Corretor.Celular` | WhatsApp | ❌ Não retorna |
| `Corretor.Creci` | CRECI | ❌ Não retorna |
| `Corretor.Foto` | Foto do corretor | ❌ Não retorna |

**Solução Atual:**
```typescript
// Corretor padrão da Pharos
const DEFAULT_REALTOR = {
  id: '1',
  name: 'Equipe Pharos',
  creci: 'CRECI-SC',
  whatsapp: '+55 (47) 99999-9999',
  photo: '/images/team/default.jpg'
};
```

---

### 3. Relacionamentos - Agência (0% disponível)

| Campo Vista | Status |
|-------------|--------|
| `Agencia.Codigo` | ❌ Não retorna |
| `Agencia.Nome` | ❌ Não retorna |
| `Agencia.Email` | ❌ Não retorna |
| `Agencia.Telefone` | ❌ Não retorna |
| `Agencia.Endereco` | ❌ Não retorna |
| `Agencia.Logo` | ❌ Não retorna |

---

## 🔧 CAMPOS CALCULADOS

Estes campos **NÃO** vêm do Vista CRM. São gerados pela aplicação:

### 1. Distância do Mar

```typescript
// Calculado via geolocalização
property.distanciaMar = calcularDistanciaMar(lat, lng);
```

**Lógica:**
- Usa coordenadas do imóvel
- Calcula distância até a linha da costa
- Retorna distância em metros
- `0m` = frente mar

**Arquivo:** `src/utils/distanciaMar.ts`

---

### 2. ID do Empreendimento

```typescript
// Mapeado via dicionário interno
property.buildingId = encontrarEmpreendimentoId(buildingName);
```

**Lógica:**
- Recebe nome do empreendimento do Vista
- Busca correspondência no dicionário interno
- Retorna ID Pharos do empreendimento

**Arquivo:** `src/data/empreendimentosMapping.ts`

**Exemplo:**
```typescript
{
  "Edifício Vista Mar": "emp-001",
  "Residencial Barra Sul": "emp-002"
}
```

---

### 3. Slug para SEO

```typescript
property.slug = createSlug(`${type}-${code}-${neighborhood}`);
```

**Exemplo:**
```
apartamento-ph1060-barra-norte
```

**Arquivo:** `src/mappers/normalizers.ts`

---

### 4. Título Gerado (Fallback)

Se Vista não enviar `TituloSite`, geramos automaticamente:

```typescript
// "Apartamento de 3 quartos em Barra Sul, Balneário Camboriú"
const title = generateTitle(type, bedrooms, neighborhood, city);
```

**Lógica:**
```typescript
const parts = [capitalize(type)];

if (bedrooms > 0) {
  parts.push(`de ${bedrooms} ${bedrooms === 1 ? 'quarto' : 'quartos'}`);
}

if (neighborhood) {
  parts.push(`em ${neighborhood}`);
}

if (city && !parts.includes(city)) {
  parts[parts.length - 1] += `, ${city}`;
}

return parts.join(' ');
```

---

## 📊 RESUMO ESTATÍSTICO

### Taxa de Disponibilidade por Categoria

```
┌─────────────────────────┬──────────────┬────────────┬─────────┐
│ Categoria               │ Solicitados  │ Retornados │ Taxa    │
├─────────────────────────┼──────────────┼────────────┼─────────┤
│ Identificação           │ 6            │ 6          │ 100%    │
│ Localização             │ 9            │ 9          │ 100%    │
│ Valores                 │ 4            │ 3          │ 75%     │
│ Especificações          │ 10           │ 6          │ 60%     │
│ Características         │ 24           │ 12         │ 50%     │
│ Mídia                   │ 8            │ 3          │ 37.5%   │
│ Empreendimento          │ 4            │ 1          │ 25%     │
│ Flags/Prioridades       │ 9            │ 1          │ 11%     │
│ Relacionamentos         │ 13           │ 0          │ 0%      │
├─────────────────────────┼──────────────┼────────────┼─────────┤
│ TOTAL                   │ 87           │ 48         │ 55.2%   │
└─────────────────────────┴──────────────┴────────────┴─────────┘
```

### Distribuição de Disponibilidade

```
✅ Sempre Disponível:     41 campos (47%)
⚠️  Parcialmente:         7 campos  (8%)
❌ Nunca Disponível:      39 campos (45%)
```

---

## 🎯 IMPACTO NO SISTEMA

### Funcionalidades Afetadas

#### 1. **Sistema de Filtros**

**Afetado:**
- ❌ Filtro de "Banheiros" não funciona (campo nunca retorna)
- ❌ Filtro de "Aceita Pet" não funciona
- ❌ Filtro de "Vista para o Mar" não funciona

**Funcionando:**
- ✅ Filtros de Quartos, Suítes, Vagas
- ✅ Filtros de Área, Preço, Localização

---

#### 2. **Cards de Imóveis**

**Afetado:**
- ❌ Badge "mock" aparece para Banheiros (sempre mockado)
- ⚠️ Apenas 1 foto disponível (sem galeria)

**Funcionando:**
- ✅ Exibe Quartos, Suítes, Vagas, Área
- ✅ Exibe Preço, Localização

---

#### 3. **Página de Detalhes**

**Afetado:**
- ❌ Ficha Técnica com campos mockados:
  - Banheiros
  - IPTU
  - Andar
  - Vista para o Mar
  - Aceita Pet
- ❌ Galeria limitada a 1 foto
- ❌ Corretor sempre "Equipe Pharos" (genérico)

**Funcionando:**
- ✅ Todas as especificações disponíveis
- ✅ Características (50% delas)
- ✅ Mapa e localização
- ✅ Formulário de contato

---

#### 4. **Sistema de Priorização**

**Totalmente Afetado:**
```
❌ Seção "Exclusivos" → Vazia (flag não retorna)
❌ Seção "Super Destaques" → Usa ordenação por data
❌ Ordenação por prioridade → Impossível
```

**Solução Atual:**
- Ordena por `DataAtualizacao` (mais recentes primeiro)
- Usa flags locais (arquivo estático)

---

#### 5. **Relatórios PDF**

**Afetado:**
- ⚠️ Campos mockados aparecem em vermelho
- ❌ "Listagem por Corretor" não funciona (dados não disponíveis)

**Funcionando:**
- ✅ Listagem de Imóveis (com campos disponíveis)
- ✅ Ficha Individual
- ✅ Comparativo

---

## 💡 SOLUÇÕES E WORKAROUNDS

### 1. Campos Mockados (Badge Vermelho)

**Componente:** `MockFieldBadge.tsx`

```tsx
{!property.specs.bathrooms && (
  <MockFieldBadge 
    field="banheiros" 
    value="Indisponível" 
    propertyId={property.id}
  />
)}
```

**Visual:**
```
Banheiros: [Indisponível] ← Badge vermelho
```

---

### 2. Corretor Padrão

**Arquivo:** `src/data/defaultRealtor.ts`

```typescript
export const DEFAULT_REALTOR = {
  id: '1',
  name: 'Equipe Pharos',
  creci: 'CRECI-SC 12345',
  whatsapp: '+5547999999999',
  email: 'contato@pharos.imob.br',
  photo: '/images/team/equipe.jpg',
  online: true
};
```

---

### 3. Galeria com 1 Foto

**Solução:**
- Mostra foto destaque
- Oculta navegação se apenas 1 foto
- Placeholder se nenhuma foto

```tsx
{photos.length === 1 && (
  <div className="single-photo">
    <Image src={photos[0].url} alt={title} />
  </div>
)}
```

---

### 4. Priorização Manual

**Arquivo:** `src/data/highlightedProperties.ts`

```typescript
// IDs de imóveis exclusivos (manualmente mantido)
export const EXCLUSIVE_PROPERTIES = [
  'PH1060',
  'PH1068',
  'PH1110'
];

// IDs de super destaques
export const SUPER_HIGHLIGHTS = [
  'PH1066',
  'PH1070'
];
```

**Uso:**
```typescript
const isExclusive = EXCLUSIVE_PROPERTIES.includes(property.id);
const isSuperHighlight = SUPER_HIGHLIGHTS.includes(property.id);
```

---

### 5. Validação de Dados

**Arquivo:** `src/utils/validarDadosImovel.ts`

```typescript
export function validarImovel(imovel: Property) {
  const erros = [];
  
  if (!imovel.specs.bathrooms) {
    erros.push('Banheiros não disponível');
  }
  
  if (!imovel.pricing.iptu) {
    erros.push('IPTU não disponível');
  }
  
  // ... mais validações
  
  return {
    valido: erros.length === 0,
    erros
  };
}
```

---

## 📝 NOTAS TÉCNICAS

### Arquivos Principais

```
imobiliaria-pharos/
├── src/
│   ├── providers/vista/
│   │   ├── types.ts              ← Tipos do Vista
│   │   ├── VistaProvider.ts      ← Provider principal
│   │   └── client.ts             ← Cliente HTTP
│   ├── mappers/vista/
│   │   ├── PropertyMapper.ts     ← Mapeamento Vista → Domain
│   │   └── normalizers.ts        ← Funções de normalização
│   ├── domain/models/
│   │   └── Property.ts           ← Modelo de domínio
│   ├── data/
│   │   ├── empreendimentosMapping.ts
│   │   ├── defaultRealtor.ts
│   │   └── highlightedProperties.ts
│   └── utils/
│       ├── distanciaMar.ts
│       └── validarDadosImovel.ts
└── VISTA-API-MAPPING.md         ← Este arquivo
```

---

### Query Enviada ao Vista

```typescript
const pesquisa = {
  fields: [
    // Básicos
    'Codigo', 'TipoImovel', 'Finalidade', 'Status',
    
    // Localização
    'Endereco', 'Numero', 'Bairro', 'Cidade', 'UF', 'CEP',
    'Latitude', 'Longitude',
    
    // Valores
    'ValorVenda', 'ValorLocacao', 'ValorCondominio', 'ValorIPTU',
    
    // Especificações
    'AreaTotal', 'AreaPrivativa', 'Dormitorios', 'Suites', 
    'Banheiros', 'Vagas', 'Andar',
    
    // Características
    'Mobiliado', 'AceitaPet', 'Sacada', 'VistaMar', 'Piscina',
    // ... (24 características)
    
    // Mídia
    'FotoDestaque', 'TituloSite', 'DescricaoWeb',
    
    // Flags
    'Exclusivo', 'SuperDestaque', 'Destaque', 'Lancamento',
    
    // Relacionamentos
    'Corretor', 'Agencia', 'Empreendimento',
    
    // Datas
    'DataCadastro', 'DataAtualizacao'
  ],
  filter: { /* filtros */ },
  order: { DataAtualizacao: 'desc' },
  paginacao: { pagina: 1, quantidade: 50 }
};
```

---

### Exemplo de Resposta Completa

```json
{
  "0": {
    "Codigo": "PH1060",
    "TipoImovel": "Apartamento",
    "Finalidade": "Venda",
    "Status": "Ativo",
    "Endereco": "Atlântica",
    "Numero": "680",
    "Bairro": "Barra Norte",
    "Cidade": "Balneário Camboriú",
    "UF": "SC",
    "Latitude": "-26.9876",
    "Longitude": "-48.6342",
    "ValorVenda": "1800000",
    "ValorCondominio": "5413",
    "AreaPrivativa": "52",
    "Dormitorios": "2",
    "Suites": "0",
    "Vagas": "0",
    "FotoDestaque": "https://cdn.vistahost.com.br/123456/foto.jpg",
    "TituloSite": "Apartamento 2 Dormitórios - Barra Norte",
    "Lancamento": "Sim",
    "DataCadastro": "2025-01-15T10:30:00",
    "DataAtualizacao": "2025-10-08T14:22:00"
  },
  "total": 150,
  "paginas": 3,
  "pagina": 1
}
```

**Campos ausentes na resposta:**
- `ValorIPTU`: `null`
- `Banheiros`: `null`
- `Andar`: `null`
- `AceitaPet`: `null`
- `VistaMar`: `null`
- `Corretor`: `null`
- `Exclusivo`: `null`
- `SuperDestaque`: `null`
- etc.

---

## 🔄 Histórico de Mudanças

| Data | Alteração |
|------|-----------|
| 19/10/2025 | Documentação inicial completa |

---

## 📞 Contato

**Dúvidas sobre este mapeamento:**
- Email: dev@pharos.imob.br
- Slack: #tech-vista-integration

---

*Documento gerado automaticamente pelo sistema Pharos*

