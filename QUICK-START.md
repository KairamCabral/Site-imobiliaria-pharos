# Quick Start - Integração Provider Vista CRM

## ⚡ Início Rápido (5 minutos)

### 1. Configure o Ambiente

Crie `.env.local` na raiz:

```bash
NEXT_PUBLIC_LISTING_PROVIDER=vista
NEXT_PUBLIC_VISTA_BASE_URL=http://gabarito-rest.vistahost.com.br
NEXT_PUBLIC_VISTA_API_KEY=e4e62e22782c7646f2db00a2c56ac70e
```

### 2. Inicie o Servidor

```bash
npm run dev
```

Servidor em: http://localhost:3600 [[memory:8251365]]

### 3. Teste a Integração

**Health Check:**
```bash
curl http://localhost:3600/api/health
```

**Listar Imóveis:**
```bash
curl "http://localhost:3600/api/properties?city=Balneário Camboriú&limit=5"
```

**Ver Detalhes:**
```bash
# Substitua 12345 pelo ID de um imóvel real retornado acima
curl http://localhost:3600/api/properties/12345
```

## 🔥 Usar nos Componentes

### Client-side (Recomendado)

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadImoveis() {
      try {
        const response = await fetch('/api/properties?city=Balneário Camboriú&limit=20');
        const data = await response.json();
        
        if (data.success) {
          setImoveis(data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadImoveis();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      {imoveis.map(imovel => (
        <div key={imovel.id}>
          <h3>{imovel.titulo}</h3>
          <p>{imovel.endereco.cidade} - {imovel.endereco.bairro}</p>
          <p>R$ {imovel.preco.toLocaleString('pt-BR')}</p>
        </div>
      ))}
    </div>
  );
}
```

### Server-side (Server Components)

```typescript
import { getPropertyService } from '@/services';
import { adaptPropertiesToImoveis } from '@/utils/propertyAdapter';

export default async function ImoveisPage() {
  const propertyService = getPropertyService();
  
  const result = await propertyService.searchProperties(
    { city: 'Balneário Camboriú' },
    { page: 1, limit: 20 }
  );
  
  const imoveis = adaptPropertiesToImoveis(result.properties);
  
  return (
    <div>
      {imoveis.map(imovel => (
        <div key={imovel.id}>
          <h3>{imovel.titulo}</h3>
          <p>{imovel.endereco.cidade}</p>
        </div>
      ))}
    </div>
  );
}
```

### Criar Lead

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
    }),
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Lead criado!', result.data);
  } else {
    console.error('Erro:', result.error);
  }
}
```

## 🎯 Filtros Disponíveis

### GET /api/properties

```javascript
const params = new URLSearchParams({
  // Localização
  city: 'Balneário Camboriú',
  neighborhood: 'Centro,Pioneiros', // múltiplos valores
  
  // Tipo e finalidade
  type: 'apartamento,casa',
  purpose: 'venda',
  
  // Preços
  minPrice: '500000',
  maxPrice: '2000000',
  
  // Especificações
  minBedrooms: '3',
  minSuites: '2',
  minBathrooms: '2',
  minParkingSpots: '2',
  minArea: '100',
  maxArea: '300',
  
  // Ordenação
  sortBy: 'price', // price | area | updatedAt
  sortOrder: 'asc', // asc | desc
  
  // Paginação
  page: '1',
  limit: '20',
});

fetch(`/api/properties?${params}`);
```

## 📋 Formato de Resposta

### Sucesso - Lista

```json
{
  "success": true,
  "data": [
    {
      "id": "12345",
      "codigo": "PHR-001",
      "titulo": "Apartamento de Luxo",
      "tipo": "apartamento",
      "finalidade": "venda",
      "endereco": {
        "rua": "Av. Atlântica",
        "numero": "1500",
        "bairro": "Centro",
        "cidade": "Balneário Camboriú",
        "estado": "SC",
        "cep": "88330-000",
        "coordenadas": {
          "latitude": -26.9857,
          "longitude": -48.6348
        }
      },
      "preco": 4500000,
      "precoCondominio": 2800,
      "iptu": 15000,
      "areaTotal": 220,
      "areaPrivativa": 195,
      "quartos": 4,
      "suites": 3,
      "banheiros": 4,
      "vagasGaragem": 3,
      "imagemCapa": "https://...",
      "galeria": ["https://...", "https://..."],
      "caracteristicas": ["Vista para o Mar", "Mobiliado"],
      "status": "disponivel",
      "destaque": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Erro

```json
{
  "success": false,
  "error": "Erro ao buscar imóveis",
  "message": "Detalhes do erro..."
}
```

## 🔍 Troubleshooting Rápido

### Erro: "Cannot find module @/services"

Reinicie o servidor:
```bash
# Ctrl+C para parar
npm run dev
```

### Erro: "Provider offline"

1. Teste Vista diretamente:
```bash
curl "http://gabarito-rest.vistahost.com.br/imoveis/listar?key=e4e62e22782c7646f2db00a2c56ac70e&pesquisa={\"paginacao\":{\"pagina\":1,\"quantidade\":1}}" -H "Accept: application/json"
```

2. Verifique `.env.local`

### Dados não aparecem

1. Veja console do servidor (logs de erro)
2. Teste endpoint direto: `/api/health`
3. Veja Network tab do navegador

### Timeout

- Vista pode demorar 10-30s em primeira chamada
- Cache será implementado em próxima fase

## 📚 Próximos Passos

1. **Substituir mocks** - Trocar dados mockados por `fetch('/api/properties')`
2. **Filtros** - Conectar componentes de filtro aos params da API
3. **Formulários** - Integrar forms de lead com `POST /api/leads`
4. **Cache** - Implementar cache para performance

## 📖 Documentação Completa

- **[PROVIDER-ARCHITECTURE.md](./docs/PROVIDER-ARCHITECTURE.md)** - Arquitetura completa
- **[VISTA-INTEGRATION.md](./docs/VISTA-INTEGRATION.md)** - Detalhes Vista CRM
- **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)** - Sumário da implementação

---

**Dúvidas?** Veja logs do console ou documentação completa.

