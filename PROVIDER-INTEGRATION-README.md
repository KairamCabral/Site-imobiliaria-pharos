# Sistema de Integração Provider - Pharos Imobiliária

## ✅ Implementação Completa

Este projeto implementa uma **camada de integração desacoplada** que permite trocar o backend de CRM sem modificar o código do front-end.

### Status Atual

- ✅ **Arquitetura Provider (Adapter)** implementada
- ✅ **VistaProvider** completo (leitura de imóveis + criação de leads)
- ✅ **Normalizers e Mappers** (Vista → Domain → UI)
- ✅ **Cliente HTTP resiliente** (retry, timeout, logs)
- ✅ **API Routes** do Next.js
- ✅ **Documentação técnica**
- ⏳ **PharosProvider** (estrutura criada, aguardando implementação)

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Provider ativo
NEXT_PUBLIC_LISTING_PROVIDER=vista

# Vista CRM
NEXT_PUBLIC_VISTA_BASE_URL=http://gabarito-rest.vistahost.com.br
NEXT_PUBLIC_VISTA_API_KEY=e4e62e22782c7646f2db00a2c56ac70e
```

### 2. Instalar Dependências

```bash
cd imobiliaria-pharos
npm install
```

### 3. Iniciar Servidor

```bash
npm run dev
```

O servidor estará disponível em: http://localhost:3600

### 4. Testar Integração

#### Health Check

```bash
curl http://localhost:3600/api/health
```

Resposta esperada:

```json
{
  "success": true,
  "status": "healthy",
  "provider": {
    "name": "Vista",
    "active": "vista",
    "healthy": true,
    "capabilities": { ... }
  }
}
```

#### Listar Imóveis

```bash
curl "http://localhost:3600/api/properties?city=Balneário Camboriú&limit=5"
```

#### Detalhes de um Imóvel

```bash
curl "http://localhost:3600/api/properties/12345"
```

#### Criar Lead

```bash
curl -X POST http://localhost:3600/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "47999990000",
    "message": "Gostaria de mais informações",
    "propertyId": "12345"
  }'
```

## 📁 Estrutura do Projeto

```
src/
├── domain/                 # Modelos e contratos independentes
│   ├── models/            # Property, Lead, etc.
│   └── contracts/         # IListingProvider
│
├── providers/             # Implementações de providers
│   ├── vista/            # Vista CRM (produção)
│   ├── pharos/           # Pharos CRM (futuro)
│   └── registry.ts       # Seleção de provider
│
├── mappers/              # Mapeamento de dados
│   ├── vista/           # Vista → Domain
│   └── normalizers/     # Limpeza e normalização
│
├── services/            # Camada de serviço
│   ├── PropertyService.ts
│   └── LeadService.ts
│
├── utils/
│   └── propertyAdapter.ts  # Domain → UI (Imovel)
│
├── config/
│   └── providers.ts     # Configurações
│
└── app/api/            # API Routes do Next.js
    ├── properties/
    ├── leads/
    └── health/
```

## 🔧 Como Usar nos Componentes

### Opção 1: Via API Routes (Recomendado)

```typescript
// Client-side
async function buscarImoveis() {
  const response = await fetch('/api/properties?city=Balneário Camboriú');
  const data = await response.json();
  
  if (data.success) {
    setImoveis(data.data);
  }
}
```

### Opção 2: Via PropertyService (Server-side)

```typescript
// Server Component ou API Route
import { getPropertyService } from '@/services';

export default async function ImoveisPage() {
  const propertyService = getPropertyService();
  
  const result = await propertyService.searchProperties(
    { city: 'Balneário Camboriú' },
    { page: 1, limit: 20 }
  );
  
  return <ImovelList imoveis={result.properties} />;
}
```

## 🎯 API Endpoints

### GET /api/properties

Lista imóveis com filtros.

**Query Params:**
- `city` - Cidade
- `neighborhood` - Bairro (pode ser múltiplo separado por vírgula)
- `type` - Tipo de imóvel
- `purpose` - venda | aluguel
- `minPrice`, `maxPrice` - Faixa de preço
- `minBedrooms` - Mínimo de quartos
- `minSuites` - Mínimo de suítes
- `minArea`, `maxArea` - Faixa de área
- `sortBy` - price | area | updatedAt
- `sortOrder` - asc | desc
- `page`, `limit` - Paginação

**Exemplo:**

```
GET /api/properties?city=Balneário Camboriú&minBedrooms=3&sortBy=price&sortOrder=asc&page=1&limit=10
```

### GET /api/properties/[id]

Detalhes de um imóvel.

**Exemplo:**

```
GET /api/properties/12345
```

### POST /api/leads

Cria um lead.

**Body:**

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "47999990000",
  "message": "Gostaria de informações",
  "propertyId": "12345",
  "propertyCode": "PHR-001",
  "subject": "Interesse no imóvel"
}
```

### GET /api/health

Health check do sistema.

## 🔄 Trocar de Provider

### Desenvolvimento (Mock)

```bash
NEXT_PUBLIC_LISTING_PROVIDER=mock
```

### Produção (Vista)

```bash
NEXT_PUBLIC_LISTING_PROVIDER=vista
```

### Futuro (Pharos)

```bash
NEXT_PUBLIC_LISTING_PROVIDER=pharos
NEXT_PUBLIC_PHAROS_BASE_URL=https://api.pharos.com.br
NEXT_PUBLIC_PHAROS_API_KEY=sua-chave
```

## 📊 Monitoramento

### Logs

Todos os providers emitem logs estruturados:

```
[Vista] GET http://gabarito-rest.vistahost.com.br/imoveis/listar...
[Vista] Response: 200 (1234ms)
[VistaProvider] Mapped 50 properties
```

### Health Check

```bash
curl http://localhost:3600/api/health
```

Monitora:
- Status do provider
- Conectividade com API
- Capacidades suportadas

## 🐛 Troubleshooting

### "Provider not found"

Verifique `NEXT_PUBLIC_LISTING_PROVIDER` no `.env.local`.

### "Vista CRM offline"

1. Teste conectividade: `curl http://gabarito-rest.vistahost.com.br/`
2. Verifique credenciais
3. Veja logs do console

### Dados não aparecem

1. Teste `/api/health`
2. Teste `/api/properties` diretamente
3. Veja logs do console (avisos de mapeamento)

### Timeout

- Vista tem timeout de 30s
- Reduza quantidade de resultados por página
- Implemente cache

## 📚 Documentação Completa

- **[PROVIDER-ARCHITECTURE.md](./docs/PROVIDER-ARCHITECTURE.md)** - Arquitetura detalhada
- **[VISTA-INTEGRATION.md](./docs/VISTA-INTEGRATION.md)** - Integração Vista CRM

## 🛣️ Roadmap

- [x] Implementar VistaProvider (leitura + leads)
- [x] Criar API Routes
- [x] Documentação técnica
- [ ] Cache (Redis ou ISR do Next.js)
- [ ] Implementar PharosProvider
- [ ] DualProvider para validação (Vista vs Pharos)
- [ ] Webhooks (mudanças de preço, status)
- [ ] Delta sync otimizado
- [ ] Testes automatizados (unit + integration)

## 🤝 Contribuindo

### Adicionar Novo Provider

1. Criar `src/providers/meu-provider/MeuProvider.ts`
2. Implementar `IListingProvider`
3. Criar mappers em `src/mappers/meu-provider/`
4. Registrar em `src/providers/registry.ts`
5. Configurar em `.env.local`

### Padrões de Código

- TypeScript strict mode
- Logs estruturados com contexto
- Tratamento de erros consistente
- Normalização de dados (sempre)

---

**Mantido por:** Equipe Pharos  
**Última atualização:** 15/10/2025

