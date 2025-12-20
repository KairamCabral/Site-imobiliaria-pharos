# Arquitetura de Providers - Pharos Imobiliária

## Visão Geral

O sistema Pharos implementa uma **camada de integração desacoplada** baseada no padrão **Provider (Adapter)**. Isso permite trocar o backend de CRM (Vista → Pharos) sem refatorar o front-end ou a lógica de domínio.

## Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                             │
│  (React Components, Pages, Forms)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  PropertyService, LeadService                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  Provider Registry                           │
│  Feature Flag: NEXT_PUBLIC_LISTING_PROVIDER                  │
│  (vista | pharos | mock)                                     │
└──────────┬────────────────────────┬─────────────────────────┘
           │                        │
           ↓                        ↓
┌────────────────────┐    ┌─────────────────────┐
│  VistaProvider     │    │  PharosProvider     │
│  (produção)        │    │  (futuro)           │
└────────┬───────────┘    └─────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────┐
│            Mappers & Normalizers               │
│  Vista Data → Domain Models                    │
│  (PropertyMapper, LeadMapper)                  │
└────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────┐
│               HTTP Client                      │
│  Resilient, Retry, Timeout, Logs               │
└────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────┐
│            Vista CRM API                       │
│  gabarito-rest.vistahost.com.br                │
└────────────────────────────────────────────────┘
```

## Estrutura de Diretórios

```
src/
├── domain/
│   ├── models/              # Entidades core (Property, Lead)
│   │   ├── Property.ts
│   │   ├── Lead.ts
│   │   └── index.ts
│   └── contracts/           # Interfaces de Provider
│       ├── IListingProvider.ts
│       └── index.ts
│
├── providers/
│   ├── vista/               # VistaProvider + client HTTP
│   │   ├── VistaProvider.ts
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── pharos/              # PharosProvider (futuro)
│   │   ├── PharosProvider.ts
│   │   └── index.ts
│   ├── registry.ts          # Feature flag e seleção de provider
│   └── index.ts
│
├── mappers/
│   ├── vista/               # Mapeadores Vista → Domain
│   │   ├── PropertyMapper.ts
│   │   ├── LeadMapper.ts
│   │   └── index.ts
│   └── normalizers/         # Normalização de dados
│       ├── dictionary.ts
│       ├── numbers.ts
│       ├── strings.ts
│       ├── dates.ts
│       └── index.ts
│
├── services/
│   ├── PropertyService.ts   # Camada de serviço
│   ├── LeadService.ts
│   └── index.ts
│
├── config/
│   └── providers.ts         # Configuração de providers
│
└── utils/
    └── propertyAdapter.ts   # Adapta Domain → UI (Imovel)
```

## Contratos e Interfaces

### IListingProvider

Todos os providers devem implementar esta interface:

```typescript
interface IListingProvider {
  getName(): string;
  getCapabilities(): ProviderCapabilities;
  
  // Leitura
  listProperties(filters: PropertyFilters, pagination: Pagination): Promise<PropertyList>;
  getPropertyDetails(id: string): Promise<Property>;
  getPropertyPhotos(id: string): Promise<Photo[]>;
  
  // Escrita
  createLead(lead: LeadInput): Promise<LeadResult>;
  
  // Health
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
```

### Property (Domain Model)

Modelo normalizado independente de provider:

```typescript
interface Property {
  id: string;
  code: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  purpose: PropertyPurpose;
  address: Address;
  pricing: PropertyPricing;
  specs: PropertySpecs;
  photos: Photo[];
  updatedAt: Date;
  // ... outros campos
}
```

## Normalização de Dados

### Dicionário de Mapeamento

| Conceito | Vista | Pharos Domain |
|----------|-------|---------------|
| **Status** | Ativo, Reservado, Vendido | disponivel, reservado, vendido |
| **Tipos** | Apartamento, Casa, Cobertura | apartamento, casa, cobertura |
| **Finalidade** | Venda, Aluguel | venda, aluguel |
| **Área** | String "150,50 m²" | Number 150.5 |
| **Preço** | String "R$ 1.500.000,00" | Number 1500000 |

### Normalizers

- **dictionary.ts**: Mapeia vocabulário Vista ↔ Pharos
- **numbers.ts**: Normaliza preços, áreas, coordenadas
- **strings.ts**: Limpa textos, formata telefones, CEPs
- **dates.ts**: Parse e formatação de datas

## Como Adicionar um Novo Provider

### 1. Implementar a Interface

```typescript
// src/providers/meu-crm/MeuCrmProvider.ts
import { IListingProvider } from '@/domain/contracts';

export class MeuCrmProvider implements IListingProvider {
  getName() { return 'MeuCRM'; }
  
  getCapabilities() {
    return {
      supportsFiltering: true,
      supportsPagination: true,
      // ...
    };
  }
  
  async listProperties(filters, pagination) {
    // Implementação
  }
  
  // ... outros métodos
}
```

### 2. Criar Mappers

```typescript
// src/mappers/meu-crm/PropertyMapper.ts
export function mapMeuCrmToProperty(data: MeuCrmImovel): Property {
  return {
    id: data.id,
    code: data.codigo,
    // ... mapeamento completo
  };
}
```

### 3. Registrar no Registry

```typescript
// src/providers/registry.ts
case 'meu-crm':
  providerInstance = new MeuCrmProvider();
  break;
```

### 4. Configurar

```bash
# .env.local
NEXT_PUBLIC_LISTING_PROVIDER=meu-crm
NEXT_PUBLIC_MEUCRM_BASE_URL=https://api.meucrm.com
NEXT_PUBLIC_MEUCRM_API_KEY=sua-chave
```

## Troca de Provider (Vista → Pharos)

### Fase 1: Vista (Atual)

```
NEXT_PUBLIC_LISTING_PROVIDER=vista
```

### Fase 2: Dual-Run (Validação)

```typescript
// Implementar DualProvider que compara respostas
class DualProvider implements IListingProvider {
  private vista = new VistaProvider();
  private pharos = new PharosProvider();
  
  async listProperties(filters, pagination) {
    const [vistaResult, pharosResult] = await Promise.all([
      this.vista.listProperties(filters, pagination),
      this.pharos.listProperties(filters, pagination),
    ]);
    
    // Comparar e logar diferenças
    compareResults(vistaResult, pharosResult);
    
    // Retornar do provider ativo
    return vistaResult; // ou pharosResult
  }
}
```

### Fase 3: Cutover (Pharos)

```
NEXT_PUBLIC_LISTING_PROVIDER=pharos
```

## Observabilidade

### Logs Estruturados

```typescript
console.log('[Vista] listProperties', {
  provider: 'vista',
  operation: 'listProperties',
  filters,
  duration: 1234,
  resultCount: 50,
  status: 200
});
```

### Health Check

```bash
GET /api/health

{
  "status": "healthy",
  "provider": {
    "name": "Vista",
    "healthy": true,
    "capabilities": { ... }
  }
}
```

## Troubleshooting

### Erro: "Provider not found"

- Verifique a variável `NEXT_PUBLIC_LISTING_PROVIDER`
- Valores aceitos: `vista`, `pharos`, `mock`

### Erro: "Health check failed"

- Verifique credenciais da API
- Verifique conectividade com o backend
- Veja logs em `[Vista Client]` ou `[VistaProvider]`

### Dados não aparecem

- Verifique se o provider está retornando dados
- Veja logs do mapper (warnings sobre campos desconhecidos)
- Teste endpoint direto: `GET /api/properties`

### Rate Limit

- Vista: máx 50 resultados por página
- Implemente cache para reduzir chamadas
- Use delta sync (`updatedSince`) para sincronizações

## Próximos Passos

1. ✅ Implementar VistaProvider (leitura + leads)
2. ⏳ Implementar cache (Redis ou ISR)
3. ⏳ Implementar PharosProvider
4. ⏳ Implementar DualProvider para validação
5. ⏳ Migração completa para Pharos CRM

---

**Documentação mantida por:** Equipe Pharos  
**Última atualização:** 15/10/2025

