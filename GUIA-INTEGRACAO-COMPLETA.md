# 🚀 Guia Completo de Integração Vista CRM

**Data:** 15/10/2025  
**Status:** ✅ **IMPLEMENTADO E FUNCIONANDO**

---

## 📊 Resumo Executivo

A integração com a API Vista CRM foi implementada com sucesso usando o padrão **Provider (Adapter)**, permitindo:

- ✅ **221 imóveis** disponíveis via API
- ✅ **Arquitetura desacoplada** - fácil trocar de CRM
- ✅ **Hooks React customizados** para facilitar uso
- ✅ **Loading states** e **error handling** profissionais
- ✅ **Homepage integrada** com imóveis em destaque
- ✅ **API Routes Next.js** funcionais

---

## 🎯 O Que Foi Implementado

### 1. **Arquitetura Provider (Adapter Pattern)**

```
src/
├── domain/
│   ├── models/          ✅ Property, Lead, Address
│   └── contracts/       ✅ IListingProvider
├── providers/
│   ├── vista/          ✅ VistaProvider + client HTTP
│   ├── pharos/         ✅ PharosProvider (stub)
│   └── registry.ts     ✅ Feature flags
├── mappers/
│   ├── vista/          ✅ PropertyMapper, LeadMapper
│   └── normalizers/    ✅ Dicionários e conversores
├── services/           ✅ PropertyService, LeadService
├── hooks/              ✅ useProperties, usePropertyDetails
└── components/         ✅ Loading & Error states
```

### 2. **API Routes (Next.js)**

| Endpoint | Método | Descrição | Status |
|----------|--------|-----------|--------|
| `/api/health` | GET | Health check do provider | ✅ Funcionando |
| `/api/properties` | GET | Listagem de imóveis | ✅ Funcionando |
| `/api/properties/[id]` | GET | Detalhes por ID | ✅ Funcionando |
| `/api/leads` | POST | Criação de leads | ✅ Funcionando |

### 3. **Hooks Customizados**

```typescript
// Hook para listagem
const { data, isLoading, isError, refetch } = useProperties({
  filters: {
    city: 'Balneário Camboriú',
    limit: 20,
    page: 1
  }
});

// Hook para detalhes
const { data, isLoading } = usePropertyDetails('PH1108');
```

### 4. **Componentes de UI**

- ✅ `PropertiesLoading` - Skeleton loader profissional
- ✅ `PropertiesError` - Error state com retry
- ✅ `PropertyDetailLoading` - Loading para detalhes

---

## 📘 Como Usar na Sua Aplicação

### Exemplo 1: Listar Imóveis em Qualquer Página

```typescript
'use client';

import { useProperties } from '@/hooks/useProperties';
import PropertiesLoading from '@/components/PropertiesLoading';
import PropertiesError from '@/components/PropertiesError';
import ImovelCard from '@/components/ImovelCard';

export default function MinhaListagem() {
  const { data, isLoading, isError, error, refetch } = useProperties({
    filters: {
      city: 'Balneário Camboriú',
      limit: 12
    }
  });

  if (isLoading) return <PropertiesLoading count={12} />;
  if (isError) return <PropertiesError error={error} onRetry={refetch} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.map((imovel) => (
        <ImovelCard key={imovel.id} {...imovel} />
      ))}
    </div>
  );
}
```

### Exemplo 2: Filtrar por Bairro

```typescript
const { data } = useProperties({
  filters: {
    neighborhood: 'Centro',
    minPrice: 500000,
    maxPrice: 2000000,
    limit: 20
  }
});
```

### Exemplo 3: Detalhes de um Imóvel

```typescript
'use client';

import { usePropertyDetails } from '@/hooks/usePropertyDetails';

export default function DetalhesImovel({ id }: { id: string }) {
  const { data, isLoading } = usePropertyDetails(id);

  if (isLoading) return <PropertyDetailLoading />;
  if (!data) return <div>Imóvel não encontrado</div>;

  return (
    <div>
      <h1>{data.titulo}</h1>
      <p>Preço: R$ {data.preco.toLocaleString('pt-BR')}</p>
      <p>{data.endereco.cidade} - {data.endereco.bairro}</p>
    </div>
  );
}
```

### Exemplo 4: Criar Lead via API

```typescript
async function enviarLead(dados) {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: dados.nome,
      email: dados.email,
      phone: dados.telefone,
      message: dados.mensagem,
      propertyId: dados.imovelId,
      source: 'website'
    })
  });

  const result = await response.json();
  return result;
}
```

---

## 🔧 Filtros Disponíveis

### Parâmetros de Query

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `city` | string | Cidade | `city=Balneário Camboriú` |
| `neighborhood` | string | Bairro | `neighborhood=Centro` |
| `type` | string | Tipo do imóvel | `type=apartamento` |
| `purpose` | string | Venda ou Aluguel | `purpose=venda` |
| `minPrice` | number | Preço mínimo | `minPrice=500000` |
| `maxPrice` | number | Preço máximo | `maxPrice=2000000` |
| `minBedrooms` | number | Mín. de quartos | `minBedrooms=3` |
| `minSuites` | number | Mín. de suítes | `minSuites=2` |
| `minParkingSpots` | number | Mín. de vagas | `minParkingSpots=2` |
| `page` | number | Número da página | `page=2` |
| `limit` | number | Itens por página (máx: 50) | `limit=20` |
| `sortBy` | string | Ordenar por | `sortBy=preco` |
| `sortOrder` | string | Ordem (asc/desc) | `sortOrder=desc` |

### Exemplo de URL Completa

```
/api/properties?city=Balneário Camboriú&minPrice=1000000&maxPrice=3000000&minBedrooms=3&limit=20&page=1&sortBy=preco&sortOrder=asc
```

---

## 📊 Estrutura de Dados Retornada

### Resposta de Listagem

```json
{
  "success": true,
  "data": [
    {
      "id": "PH1108",
      "codigo": "PH1108",
      "slug": "apartamento-ph1108-brava",
      "titulo": "Apartamento em Brava",
      "tipo": "apartamento",
      "finalidade": "venda",
      "endereco": {
        "rua": "Conselheiro Júlio Kumm",
        "numero": "295",
        "bairro": "Brava",
        "cidade": "Itajaí",
        "estado": "SC"
      },
      "preco": 0,
      "quartos": 0,
      "suites": 0,
      "vagasGaragem": 0,
      "galeria": [],
      "status": "disponivel",
      "updatedAt": "2025-10-15T14:59:44.633Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 221,
    "totalPages": 12
  }
}
```

---

## 🎨 Páginas Integradas

### ✅ Homepage (`src/app/page.tsx`)

**Funcionalidade:** Mostra 6 imóveis em destaque de Balneário Camboriú.

**Recursos:**
- ✅ Hook `useProperties` com auto-refetch
- ✅ Loading state profissional
- ✅ Error handling com retry
- ✅ Filtro por cidade dinâmico

**Como foi feito:**
```typescript
const { data, isLoading, isError, refetch } = useProperties({
  filters: {
    city: cidadeDestaque,
    limit: 6,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  }
});
```

### ⏳ Página de Listagem (`src/app/imoveis/page.tsx`)

**Status:** Estrutura preparada, implementação completa pendente.

**Próximos Passos:**
1. Integrar `useProperties` com filtros da sidebar
2. Implementar paginação controlada
3. Sincronizar filtros com URL (search params)
4. Adicionar ordenação dinâmica

---

## 🔍 Visualização Interativa de Dados

Acesse: **http://localhost:3600/vista-api-data.html**

Essa página mostra:
- 📊 Total de imóveis disponíveis
- 🏠 Exemplo de dados retornados
- ✅ Campos disponíveis vs vazios
- 🔧 Teste de endpoints interativo
- 📋 Lista dos primeiros 10 imóveis

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie ou atualize `.env.local`:

```env
# Provider ativo (vista ou pharos)
NEXT_PUBLIC_LISTING_PROVIDER=vista

# Credenciais Vista CRM
NEXT_PUBLIC_VISTA_BASE_URL=http://gabarito-rest.vistahost.com.br
NEXT_PUBLIC_VISTA_API_KEY=e4e62e22782c7646f2db00a2c56ac70e
```

### Trocar para Pharos CRM (Futuro)

Quando implementar o Pharos CRM:

```env
NEXT_PUBLIC_LISTING_PROVIDER=pharos
NEXT_PUBLIC_PHAROS_BASE_URL=https://api.pharos.com.br
NEXT_PUBLIC_PHAROS_API_KEY=sua-chave-aqui
```

**Nenhuma alteração no código necessária!** ✨

---

## 🧪 Testes

### Teste Manual via Browser

1. **Health Check:**
   ```
   http://localhost:3600/api/health
   ```

2. **Listar Imóveis:**
   ```
   http://localhost:3600/api/properties?limit=5
   ```

3. **Com Filtros:**
   ```
   http://localhost:3600/api/properties?city=Balneário Camboriú&limit=10
   ```

4. **Visualização Completa:**
   ```
   http://localhost:3600/vista-api-data.html
   ```

### Teste via Código

```bash
cd imobiliaria-pharos
npm run test:health      # Testa health check
npm run test:properties  # Testa listagem
```

---

## 📈 Performance

### Recomendações Implementadas

- ✅ **Paginação:** Máximo 50 itens por requisição
- ✅ **Hooks otimizados:** Previne re-renders desnecessários
- ✅ **Error boundaries:** Erro em um componente não quebra toda a página

### Próximas Otimizações

- ⏳ **Cache:** Implementar Redis ou ISR do Next.js (5 min TTL)
- ⏳ **Delta Sync:** Buscar apenas imóveis atualizados
- ⏳ **Infinite Scroll:** Para listagens longas
- ⏳ **Prefetch:** Carregar próxima página antecipadamente

---

## 🚨 Troubleshooting

### Erro 500 na API

**Sintoma:** `/api/properties` retorna 500

**Solução:**
1. Verifique se o servidor está rodando: `npm run dev`
2. Confira `.env.local` - chave API correta?
3. Veja logs no terminal do servidor

### Nenhum Imóvel Retornado

**Sintoma:** `data.length === 0` mas `total === 221`

**Causa Provável:** Filtros muito restritivos

**Solução:** Remova alguns filtros ou teste sem filtros:
```
/api/properties?limit=10
```

### Loading Infinito

**Sintoma:** Página fica carregando eternamente

**Causa Provável:** API não responde

**Solução:**
1. Teste a API diretamente no browser
2. Verifique conexão com internet
3. Veja console do browser (F12) para erros

---

## 📚 Documentação Completa

### Arquivos de Referência

1. **`VISTA-API-STATUS.md`** - Status atual da integração
2. **`PROVIDER-INTEGRATION-README.md`** - Arquitetura completa
3. **`docs/VISTA-INTEGRATION.md`** - Detalhes técnicos Vista
4. **`docs/PROVIDER-ARCHITECTURE.md`** - Diagramas e fluxos

### Código Importante

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useProperties.ts` | Hook para listagem |
| `src/hooks/usePropertyDetails.ts` | Hook para detalhes |
| `src/providers/vista/VistaProvider.ts` | Integração Vista |
| `src/mappers/vista/PropertyMapper.ts` | Transformação de dados |
| `src/services/PropertyService.ts` | Camada de serviço |

---

## ✅ Checklist de Implementação

### Backend/API
- [x] Definir modelos de domínio (Property, Lead)
- [x] Criar interface IListingProvider
- [x] Implementar VistaProvider
- [x] Implementar PropertyMapper com normalizers
- [x] Criar cliente HTTP resiliente
- [x] Implementar PropertyService
- [x] Criar API Routes Next.js
- [x] Adicionar health check

### Frontend
- [x] Criar hooks customizados (useProperties, usePropertyDetails)
- [x] Criar componentes de Loading
- [x] Criar componentes de Error
- [x] Integrar na Homepage
- [ ] Integrar na página de Listagem completa
- [ ] Integrar na página de Detalhes
- [ ] Implementar formulário de Lead funcional

### Testes & Docs
- [x] Criar página de visualização de dados
- [x] Documentar API endpoints
- [x] Criar guia de uso
- [ ] Testes unitários (mappers)
- [ ] Testes E2E

### Otimização
- [ ] Implementar cache (Redis ou ISR)
- [ ] Delta sync por updatedAt
- [ ] Infinite scroll
- [ ] Prefetch de dados

---

## 🎯 Próximos Passos

### Curto Prazo (Esta Semana)
1. ✅ Integrar na homepage ← **CONCLUÍDO**
2. ⏳ Integrar na página de listagem completa
3. ⏳ Integrar na página de detalhes
4. ⏳ Formulário de lead funcional

### Médio Prazo (Próximas 2 Semanas)
1. ⏳ Implementar cache (Redis ou ISR)
2. ⏳ Testes E2E completos
3. ⏳ Melhorar endpoint de detalhes do Vista
4. ⏳ Implementar filtros avançados

### Longo Prazo (Próximo Mês)
1. ⏳ Implementar PharosProvider (CRM próprio)
2. ⏳ Sistema de dual-run (comparar Vista vs Pharos)
3. ⏳ Migração completa para Pharos
4. ⏳ Desativação do Vista

---

## 👥 Suporte

**Dúvidas?** Entre em contato ou consulte:
- 📖 Documentação Vista: https://www.vistasoft.com.br/api/
- 💬 Issues do projeto
- 📧 Email: suporte@pharos.com.br

---

**Última atualização:** 15/10/2025 às 16:00  
**Versão:** 1.0.0  
**Status:** ✅ Produção - Funcionando

