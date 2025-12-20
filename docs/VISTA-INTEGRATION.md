# Integração Vista CRM - Pharos Imobiliária

## Credenciais e Configuração

### Ambiente de Produção

```bash
Host REST: gabarito-rest.vistahost.com.br
API Key: e4e62e22782c7646f2db00a2c56ac70e
```

### Configuração (.env.local)

```bash
NEXT_PUBLIC_LISTING_PROVIDER=vista
NEXT_PUBLIC_VISTA_BASE_URL=http://gabarito-rest.vistahost.com.br
NEXT_PUBLIC_VISTA_API_KEY=e4e62e22782c7646f2db00a2c56ac70e
```

## Documentação Oficial

- **API Docs**: https://www.vistasoft.com.br/api/
- **Sandbox**: http://sandbox-rest.vistahost.com.br/

## Endpoints Utilizados

### 1. Listar Imóveis

```
GET /imoveis/listar?key={API_KEY}&pesquisa={JSON}&showtotal=1
```

#### Parâmetros de Pesquisa

```json
{
  "fields": [
    "Codigo", "TipoImovel", "Finalidade", "Status",
    "Titulo", "Descricao",
    "Endereco", "Numero", "Bairro", "Cidade", "Estado", "CEP",
    "Latitude", "Longitude",
    "ValorVenda", "ValorLocacao", "ValorCondominio", "ValorIPTU",
    "AreaTotal", "AreaPrivativa",
    "Dormitorios", "Suites", "Banheiros", "Vagas",
    "FotoDestaque",
    "DataAtualizacao"
  ],
  "filter": {
    "Cidade": "Balneário Camboriú",
    "Finalidade": "Venda",
    "Status": "Ativo"
  },
  "order": {
    "DataAtualizacao": "desc"
  },
  "paginacao": {
    "pagina": 1,
    "quantidade": 50
  }
}
```

#### Resposta

```json
{
  "0": {
    "Codigo": 12345,
    "TipoImovel": "Apartamento",
    "Finalidade": "Venda",
    "Cidade": "Balneário Camboriú",
    "Bairro": "Centro",
    "ValorVenda": "4500000",
    "Dormitorios": "4",
    "Suites": "3",
    "AreaPrivativa": "220",
    "FotoDestaque": "https://...",
    "DataAtualizacao": "2025-10-10 14:30:00"
  },
  "1": { ... },
  "total": 150,
  "paginas": 3,
  "pagina": 1,
  "quantidade": 50
}
```

### 2. Detalhes do Imóvel

```
GET /imoveis/detalhes?key={API_KEY}&pesquisa={JSON}&imovel={CODIGO}
```

#### Parâmetros

```json
{
  "fields": [
    "Codigo", "CodigoImovel", "TipoImovel", "Finalidade", "Status",
    "Titulo", "Descricao", "Observacao",
    "Endereco", "Numero", "Complemento", "Bairro", "Cidade", "Estado", "CEP",
    "Latitude", "Longitude",
    "ValorVenda", "ValorLocacao", "ValorCondominio", "ValorIPTU",
    "AreaTotal", "AreaPrivativa", "AreaTerreno",
    "Dormitorios", "Suites", "Banheiros", "Lavabos", "Vagas",
    "Andar", "TotalAndares",
    "Mobiliado", "AceitaPet", "Acessibilidade",
    "FotoDestaque", "TourVirtual",
    "DataCadastro", "DataAtualizacao",
    {
      "fotos": [
        "Foto", "FotoGrande", "FotoPequena", "Descricao", "Ordem", "Destaque"
      ]
    },
    {
      "Corretor": [
        "Codigo", "Nome", "Email", "Fone", "Celular", "Creci", "Foto"
      ]
    },
    {
      "Agencia": [
        "Codigo", "Nome", "Email", "Fone", "Endereco", "Cidade", "Logo"
      ]
    }
  ]
}
```

### 3. Fotos do Imóvel

```
GET /imoveis/fotos?key={API_KEY}&imovel={CODIGO}
```

#### Resposta

```json
{
  "fotos": [
    {
      "Foto": "https://...",
      "FotoGrande": "https://...",
      "FotoPequena": "https://...",
      "Descricao": "Sala de estar",
      "Ordem": 1,
      "Destaque": "Sim"
    }
  ]
}
```

### 4. Enviar Lead

```
POST /clientes/enviarLeads?key={API_KEY}
Content-Type: application/json
```

#### Body

```json
{
  "Nome": "João Silva",
  "Email": "joao@example.com",
  "Telefone": "47999990000",
  "Celular": "47999990000",
  "Mensagem": "Gostaria de mais informações",
  "Assunto": "Interesse no imóvel PHR-001",
  "CodigoImovel": "12345",
  "Origem": "site",
  "UTMSource": "google",
  "UTMMedium": "cpc",
  "UTMCampaign": "campanha-verao",
  "URLOrigem": "https://pharos.com.br/imoveis/..."
}
```

#### Resposta

```json
{
  "sucesso": true,
  "codigo": 54321,
  "mensagem": "Lead cadastrado com sucesso"
}
```

## Filtros Avançados

### Operadores

- `[min, max]` - Intervalo
- `[">=", valor]` - Maior ou igual
- `["<=", valor]` - Menor ou igual
- `[">", valor]` - Maior que
- `["<", valor]` - Menor que
- `["like", "texto"]` - Similar

### Exemplos

```json
{
  "filter": {
    "ValorVenda": [500000, 1000000],
    "Dormitorios": [">=", 3],
    "Bairro": ["Centro", "Pioneiros"],
    "DataAtualizacao": [">=", "2025-10-01"]
  }
}
```

### advFilter (Consultas Complexas)

```json
{
  "advFilter": {
    "Bairro": ["Centro", "Pioneiros"],
    "Or": {
      "ValorVenda": [500000, 1000000],
      "And": {
        "Cidade": "Balneário Camboriú",
        "Finalidade": "Venda"
      }
    }
  }
}
```

## Paginação

### Request

```json
{
  "paginacao": {
    "pagina": 1,
    "quantidade": 50
  }
}
```

**Importante:** Adicionar `showtotal=1` na URL para receber metadados de paginação.

### Response

```json
{
  "0": { ... },
  "1": { ... },
  "total": 150,
  "paginas": 3,
  "pagina": 1,
  "quantidade": 50
}
```

## Ordenação

```json
{
  "order": {
    "ValorVenda": "asc",
    "Bairro": "asc",
    "DataAtualizacao": "desc"
  }
}
```

## Limites e Quotas

| Recurso | Limite |
|---------|--------|
| **Resultados por página** | Máximo 50 |
| **Timeout** | 30 segundos |
| **Rate Limit** | ~100 req/min (estimado) |
| **Tamanho da query** | Sem limite documentado |

## Headers Obrigatórios

```http
Accept: application/json
```

## Tratamento de Erros

### HTTP Status Codes

- `200` - Sucesso
- `400` - Bad Request (parâmetros inválidos)
- `401` - Unauthorized (chave inválida)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error (erro do Vista)
- `503` - Service Unavailable (Vista offline)

### Retry Strategy

O cliente HTTP implementa retry automático para:

- HTTP 5xx (erro do servidor)
- HTTP 429 (rate limit)
- HTTP 408 (timeout)
- Network errors
- Timeouts

**Backoff exponencial:** 1s → 2s → 4s → 8s (máx 3 retries)

## Campos do Vista

### Status

- `Ativo` → disponivel
- `Reservado` → reservado
- `Vendido` → vendido
- `Locado` / `Alugado` → alugado
- `Inativo` → inativo

### Tipos de Imóvel

- `Apartamento` → apartamento
- `Casa` → casa
- `Cobertura` → cobertura
- `Terreno` / `Lote` → terreno
- `Comercial` → comercial
- `Sala Comercial` / `Sala` → sala
- `Loja` / `Ponto Comercial` → loja
- `Galpão` → galpao
- `Chácara` / `Sítio` → chacara
- `Fazenda` → fazenda

### Finalidade

- `Venda` → venda
- `Aluguel` / `Locação` → aluguel
- `Venda/Aluguel` → ambos

### Booleanos

Vista pode retornar: `"Sim"`, `"Não"`, `"S"`, `"N"`, `true`, `false`, `1`, `0`

Normalizado para: `true`, `false`, `undefined`

## Delta Sync (Sincronização Incremental)

Para buscar apenas imóveis atualizados recentemente:

```json
{
  "filter": {
    "DataAtualizacao": [">=", "2025-10-10"]
  },
  "order": {
    "DataAtualizacao": "desc"
  }
}
```

## Testes

### Health Check

```bash
curl "http://gabarito-rest.vistahost.com.br/imoveis/listar?key=e4e62e22782c7646f2db00a2c56ac70e&pesquisa={\"paginacao\":{\"pagina\":1,\"quantidade\":1}}" \
  -H "Accept: application/json"
```

### Listar Imóveis

```bash
curl "http://gabarito-rest.vistahost.com.br/imoveis/listar?key=e4e62e22782c7646f2db00a2c56ac70e&pesquisa={\"fields\":[\"Codigo\",\"Titulo\",\"Cidade\"],\"paginacao\":{\"pagina\":1,\"quantidade\":10}}&showtotal=1" \
  -H "Accept: application/json"
```

### Detalhes de um Imóvel

```bash
curl "http://gabarito-rest.vistahost.com.br/imoveis/detalhes?key=e4e62e22782c7646f2db00a2c56ac70e&pesquisa={\"fields\":[\"Codigo\",\"Titulo\",\"Descricao\"]}&imovel=12345" \
  -H "Accept: application/json"
```

## Troubleshooting

### Erro: "Parâmetro pesquisa inválido"

- Verifique se o JSON está corretamente formatado
- Use `encodeURIComponent()` ao construir a URL
- Vista não aceita espaços em branco, use `+` ou `%20`

### Erro: "Chave inválida"

- Verifique se a chave está correta
- Solicite nova chave via Central de Serviços do Vista

### Nenhum resultado retornado

- Verifique os filtros aplicados
- Teste sem filtros para validar conectividade
- Veja se há imóveis ativos no Vista

### Timeout

- Reduza a quantidade de campos solicitados
- Reduza o tamanho da página (ex: 20 ao invés de 50)
- Implemente cache para reduzir chamadas

---

**Documentação mantida por:** Equipe Pharos  
**Última atualização:** 15/10/2025

