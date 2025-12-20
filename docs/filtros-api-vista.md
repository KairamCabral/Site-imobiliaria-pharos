# Sistema de Filtros - API Vista CRM

## Visão Geral

Sistema completo de filtros integrado com a API Vista CRM, permitindo busca avançada de imóveis por características, localização, empreendimento e outros critérios.

## Arquitetura

```
┌──────────────────┐
│  Página Imóveis  │ (Frontend)
│  /imoveis        │
└────────┬─────────┘
         │ URLSearchParams
         ↓
┌──────────────────┐
│   API Route      │ (Backend)
│  /api/properties │
└────────┬─────────┘
         │ PropertyFilters
         ↓
┌──────────────────┐
│  PropertyService │ (Domain)
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  VistaProvider   │ (Provider)
│  buildVistaPesquisa
└────────┬─────────┘
         │ VistaPesquisa
         ↓
┌──────────────────┐
│   Vista CRM API  │ (External)
│  /imoveis/listar │
└──────────────────┘
```

## Fluxo de Dados

### 1. Frontend → API

**Página:** `src/app/imoveis/page.tsx`

```typescript
// Montar parâmetros de busca
const params = new URLSearchParams();

// Características do imóvel
filtros.caracteristicasImovel.forEach(c => 
  params.append('caracImovel', c)
);

// Código do imóvel
if (filtros.codigoImovel) {
  params.set('codigo', filtros.codigoImovel);
}

// Enviar para API
const response = await fetch(`/api/properties?${params}`);
```

### 2. API → PropertyFilters

**Arquivo:** `src/app/api/properties/route.ts`

```typescript
// Parse dos parâmetros
if (searchParams.has('caracImovel')) {
  const values = searchParams.getAll('caracImovel');
  filters.caracteristicasImovel = values;
}

if (searchParams.has('codigo')) {
  filters.propertyCode = searchParams.get('codigo')!;
}
```

### 3. PropertyFilters → VistaPesquisa

**Arquivo:** `src/providers/vista/VistaProvider.ts`

```typescript
// Mapear características UI → Vista
if (filters.caracteristicasImovel) {
  filters.caracteristicasImovel.forEach(caracUI => {
    const vistaField = mapUItoVista(caracUI, 'imovel');
    if (vistaField) {
      pesquisa.filter![vistaField] = 'Sim';
    }
  });
}

// Código do imóvel
if (filters.propertyCode) {
  pesquisa.filter!.Codigo = filters.propertyCode;
}
```

## Mapeamento UI ↔ Vista

### Características do Imóvel

| UI (Frontend) | Vista CRM | Exemplo |
|---------------|-----------|---------|
| Churrasqueira a gás | `ChurrasqueiraGas` | `'Sim'` |
| Mobiliado | `Mobiliado` | `'Sim'` |
| Vista para o Mar | `VistaMar` | `'Sim'` |
| Ar Condicionado | `ArCondicionado` | `'Sim'` |
| Sacada | `Sacada` | `'Sim'` |

**Arquivo de mapeamento:** `src/mappers/normalizers/caracteristicas.ts`

```typescript
export const caracteristicasImovelMap: Record<string, string> = {
  'Churrasqueira a gás': 'ChurrasqueiraGas',
  'Mobiliado': 'Mobiliado',
  'Vista para o Mar': 'VistaMar',
  // ... mais características
};
```

### Características da Localização

| UI (Frontend) | Vista CRM |
|---------------|-----------|
| Centro | `Centro` |
| Barra Norte | `BarraNorte` |
| Frente Mar | `FrenteMar` |
| Avenida Brasil | `AvenidaBrasil` |

### Características do Empreendimento

| UI (Frontend) | Vista CRM |
|---------------|-----------|
| Academia | `Academia` |
| Piscina Aquecida | `PiscinaAquecida` |
| Salão de Festas | `SalaoFestas` |
| Espaço Gourmet | `EspacoGourmet` |

## Tipos de Filtros

### 1. Filtros de Características

**Arrays de strings da UI**

```typescript
PropertyFilters {
  caracteristicasImovel?: string[];          // ['Mobiliado', 'Vista Mar']
  caracteristicasLocalizacao?: string[];     // ['Centro', 'Frente Mar']
  caracteristicasEmpreendimento?: string[];  // ['Academia', 'Piscina']
}
```

**Operador:** AND (todos devem estar presentes)

### 2. Filtro por Código

**Busca exata**

```typescript
PropertyFilters {
  propertyCode?: string;  // 'PH1060'
}
```

### 3. Filtro por Empreendimento

**Busca parcial (case-insensitive)**

```typescript
PropertyFilters {
  buildingName?: string;  // 'Senna Tower'
}
```

### 4. Filtro por Distância do Mar

**Enum com ranges predefinidos**

```typescript
PropertyFilters {
  distanciaMarRange?: 
    | 'frente-mar'       // até 50m
    | 'quadra-mar'       // até 100m
    | 'segunda-quadra'   // até 200m
    | 'terceira-quadra'  // até 300m
    | 'ate-500m'         // até 500m
    | 'ate-1km';         // até 1km
}
```

**NOTA:** Este filtro é aplicado no **pós-processamento** (não enviado ao Vista), pois o Vista não tem campo direto de distância do mar.

### 5. Filtros Numéricos

```typescript
PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSuites?: number;
  minParkingSpots?: number;
  minArea?: number;
  maxArea?: number;
}
```

### 6. Filtros de Localização

```typescript
PropertyFilters {
  city?: string;
  state?: string;
  neighborhood?: string | string[];  // Suporta múltiplos
}
```

## Validação

### Validação de Estrutura

**Utilitário:** `src/utils/filterDebug.ts`

```typescript
import { validateFilters } from '@/utils/filterDebug';

const result = validateFilters(filters);

if (!result.valid) {
  console.error('Erros:', result.errors);
}
```

### Regras de Validação

1. **Arrays devem ser arrays:** `caracteristicasImovel` não pode ser string
2. **Strings devem ser strings:** `propertyCode` não pode ser number
3. **Números devem ser números:** `minPrice` deve ser numérico
4. **Ranges válidos:** `minPrice` ≤ `maxPrice`
5. **Enums válidos:** `distanciaMarRange` deve ser um dos valores aceitos

## Logging e Debug

### Sistema de Logging

```typescript
import { logFiltersDebug } from '@/utils/filterDebug';

// Log em cada estágio
logFiltersDebug('frontend-send', params);
logFiltersDebug('api-receive', searchParams);
logFiltersDebug('api-processed', filters);
```

### Estágios de Logging

1. **frontend-send** 📤 - Enviando do frontend
2. **api-receive** 📥 - Recebido na API
3. **api-processed** ⚙️ - Processado na API
4. **provider-build** 🔨 - Construindo query
5. **provider-response** ✅ - Resposta do provider
6. **frontend-receive** 🎯 - Recebido no frontend

### Snapshots para Debug

```typescript
import { snapshotFilters, getFilterHistory } from '@/utils/filterDebug';

// Criar snapshot
snapshotFilters(filters, 'Antes de aplicar');

// Recuperar histórico
const history = getFilterHistory();
console.log('Histórico:', history);
```

## Exemplos de Uso

### Exemplo 1: Buscar apartamentos mobiliados no Centro

```typescript
// Frontend
const filtros = {
  tipos: ['apartamento'],
  bairros: ['centro'],
  caracteristicasImovel: ['Mobiliado'],
};

// URL gerada
/api/properties?type=apartamento&neighborhood=centro&caracImovel=Mobiliado

// Vista Query
{
  filter: {
    TipoImovel: 'Apartamento',
    Bairro: 'Centro',
    Mobiliado: 'Sim'
  }
}
```

### Exemplo 2: Buscar imóveis com vista para o mar e piscina

```typescript
// Frontend
const filtros = {
  caracteristicasImovel: ['Vista para o Mar'],
  caracteristicasEmpreendimento: ['Piscina'],
};

// Vista Query
{
  filter: {
    VistaMar: 'Sim',
    Piscina: 'Sim'
  }
}
```

### Exemplo 3: Buscar por código específico

```typescript
// Frontend
const filtros = {
  codigoImovel: 'PH1060',
};

// Vista Query
{
  filter: {
    Codigo: 'PH1060'
  }
}
```

### Exemplo 4: Buscar frente mar até R$ 2mi

```typescript
// Frontend
const filtros = {
  distanciaMar: ['frente-mar'],
  precoMax: '2000000',
};

// Vista Query (pré-filtro)
{
  filter: {
    ValorVenda: [0, 2000000]
  }
}

// Pós-filtro (client-side)
properties.filter(p => p.distanciaMar <= 50)
```

## Troubleshooting

### Problema: Filtro não retorna resultados

**Possíveis causas:**

1. **Campo não mapeado:** Verificar `caracteristicas.ts`
2. **Nome incorreto:** Verificar case-sensitive
3. **Campo não existe no Vista:** Verificar `/imoveis/listarcampos`
4. **Valor incorreto:** Vista espera `'Sim'` não `true`

**Debug:**

```typescript
// Verificar logs do VistaProvider
console.log('Pesquisa montada:', pesquisa);

// Verificar resposta da API
console.log('Resposta Vista:', response.data);
```

### Problema: Características não sendo aplicadas

**Checklist:**

- [ ] Característica está em `caracteristicas.ts`?
- [ ] Filtro está sendo enviado na URL?
- [ ] API route está processando o filtro?
- [ ] VistaProvider está mapeando corretamente?
- [ ] Campo existe no Vista CRM?

**Teste de mapeamento:**

```typescript
import { mapUItoVista } from '@/mappers/normalizers/caracteristicas';

const result = mapUItoVista('Mobiliado', 'imovel');
console.log('Mapeado para:', result); // Deve retornar 'Mobiliado'
```

### Problema: Performance lenta

**Otimizações:**

1. **Reduzir campos retornados:** Ajustar `fields` em `buildVistaPesquisa`
2. **Aumentar cache:** Aumentar TTL do cache
3. **Paginação:** Limitar `limit` a 20-50 itens
4. **Índices:** Verificar índices no Vista CRM

## Adicionando Novas Características

### Passo 1: Adicionar ao mapeamento

**Arquivo:** `src/mappers/normalizers/caracteristicas.ts`

```typescript
export const caracteristicasImovelMap: Record<string, string> = {
  // ... existentes
  'Nova Característica': 'NovaCaracteristica',  // ← Adicionar aqui
};
```

### Passo 2: Adicionar na UI

**Arquivo:** `src/components/FiltersSidebar.tsx`

```typescript
const caracteristicasImovelOptions = [
  'Churrasqueira a gás',
  'Mobiliado',
  'Nova Característica',  // ← Adicionar aqui
];
```

### Passo 3: Verificar no Vista

```bash
# Verificar se campo existe no Vista
GET /imoveis/listarcampos

# Procurar por "NovaCaracteristica"
```

### Passo 4: Testar

```typescript
// Criar teste
it('deve mapear Nova Característica', () => {
  expect(mapUItoVista('Nova Característica', 'imovel'))
    .toBe('NovaCaracteristica');
});
```

## Performance

### Métricas Esperadas

| Cenário | Tempo Esperado |
|---------|----------------|
| Filtros simples (1-2 filtros) | < 2s |
| Filtros complexos (5+ filtros) | < 4s |
| Com cache | < 500ms |

### Otimizações Implementadas

1. **Cache de campos:** `listarcampos` é cacheado
2. **Cache de detalhes:** Detalhes são cacheados por 5min
3. **Paginação:** Máximo 50 itens por página
4. **Pós-filtros:** Aplicados apenas quando necessário
5. **Logs condicionais:** Apenas em desenvolvimento

## Referências

- [Vista CRM API Docs](https://www.vistasoft.com.br/api/)
- [PropertyFilters Model](../src/domain/models/property.ts)
- [VistaProvider](../src/providers/vista/VistaProvider.ts)
- [Mapeamento de Características](../src/mappers/normalizers/caracteristicas.ts)
- [Utilitários de Debug](../src/utils/filterDebug.ts)

---

**Última atualização:** 23/10/2025  
**Versão:** 1.0.0

