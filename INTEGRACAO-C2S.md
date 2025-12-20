# Integração Contact2Sale (C2S) - Guia Completo

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Funcionalidades](#funcionalidades)
4. [Endpoints da API](#endpoints-da-api)
5. [Sistema de Tags Automáticas](#sistema-de-tags-automáticas)
6. [Webhooks](#webhooks)
7. [Monitoramento](#monitoramento)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A integração com Contact2Sale (C2S) centraliza todos os leads capturados no site em um CRM profissional, permitindo:

- ✅ **Envio automático de leads** enriquecidos com dados completos do imóvel
- ✅ **Tags automáticas inteligentes** baseadas em regras de negócio
- ✅ **Webhooks bidirecionais** para sincronização em tempo real
- ✅ **Sincronização de corretores** entre sistemas
- ✅ **Agendamento de visitas** integrado
- ✅ **Sistema de retry** com fila para garantir entrega
- ✅ **Monitoramento e métricas** em tempo real

---

## Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env.local`:

```bash
# Contact2Sale API Configuration
C2S_API_URL=https://api.contact2sale.com/integration
C2S_API_TOKEN=seu_token_aqui
C2S_COMPANY_ID=seu_company_id
C2S_WEBHOOK_SECRET=seu_secret_seguro
C2S_TIMEOUT_MS=15000
C2S_RETRY_ATTEMPTS=3
C2S_RETRY_DELAY_MS=1000

# C2S Feature Flags
C2S_ENABLED=true
C2S_SYNC_SELLERS=true
C2S_AUTO_TAGS=true
C2S_WEBHOOKS_ENABLED=true
C2S_DISTRIBUTION_ENABLED=false
C2S_VISIT_INTEGRATION=true
```

### 2. Obtendo o Token da API

1. Acesse o painel administrativo do Contact2Sale
2. Navegue para **Configurações → API → Token de Integração**
3. Copie o token e adicione à variável `C2S_API_TOKEN`

### 3. Gerando Webhook Secret

Execute no terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e adicione à variável `C2S_WEBHOOK_SECRET`.

### 4. Configurando Webhooks no C2S

Após deploy em produção, registre os webhooks:

```bash
curl -X POST https://api.contact2sale.com/integration/leads/subscribe \
  -H "Content-Type: application/json" \
  -H "Authentication: Bearer SEU_TOKEN" \
  -d '{
    "hook_url": "https://seu-dominio.com/api/webhooks/c2s",
    "hook_action": "on_update_lead"
  }'
```

Repita para outros eventos (`on_create_lead`, `on_close_lead`).

---

## Funcionalidades

### 1. Envio Automático de Leads

Quando um lead é capturado no site:

1. **Dados do cliente** são validados e formatados
2. **Dados do imóvel** são buscados e enriquecidos
3. **Tags automáticas** são geradas baseadas em regras
4. **Lead é enviado ao C2S** com payload completo
5. **Se falhar**, entra na fila de retry automático

#### Exemplo de Payload Enviado:

```json
{
  "description": "Interesse no imóvel PH1060 - Apartamento Luxo Vista Mar",
  "customer": {
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": 5548999999999
  },
  "product": {
    "description": "Apartamento de 3 quartos com vista para o mar",
    "brand": "Empreendimento Boreal",
    "model": "Apartamento",
    "license_plate": "PH1060",
    "price": 850000,
    "real_estate_detail": {
      "negotiation_name": "Venda",
      "area": 120,
      "rooms": 3,
      "suites": 2,
      "bathrooms": 2,
      "garage": 2,
      "neighborhood": "Centro",
      "city": "Balneário Camboriú",
      "state": "SC"
    }
  },
  "seller": {
    "name": "Maria Corretor",
    "external_id": "corretor-123"
  },
  "tags": [
    "origem:site",
    "tipo:apartamento",
    "valor:alto",
    "bairro:centro",
    "vista-mar",
    "premium",
    "primeiro-contato"
  ]
}
```

### 2. Sistema de Tags Automáticas

Tags são geradas automaticamente baseadas em:

#### Tags por Valor do Imóvel:
- `valor:alto` (> R$ 1.000.000)
- `valor:medio` (R$ 500.000 - R$ 1.000.000)
- `valor:entry` (< R$ 500.000)

#### Tags por Tipo:
- `tipo:apartamento`, `tipo:casa`, `tipo:cobertura`

#### Tags por Localização:
- `bairro:centro`, `bairro:barra-sul`
- `regiao:praia`
- `vista-mar`, `frente-mar`, `proximo-mar`

#### Tags por Origem:
- `origem:site`, `origem:facebook`, `origem:google`
- `utm-source:google-ads`
- `campanha:verao-2025`

#### Tags por Características:
- `lancamento`, `exclusivo`, `pronto-morar`
- `mobiliado`, `pet-friendly`
- `aceita-financiamento`

#### Tags por Comportamento:
- `primeiro-contato`, `hot-lead`
- `agendou-visita`, `alta-intencao`
- `horario-comercial`, `final-semana`

### 3. Agendamento de Visitas Integrado

Quando uma visita é agendada:

1. Lead é criado no C2S (se não existir)
2. Atividade de tipo "visita" é registrada
3. Tags `agendou-visita` e `hot-lead` são aplicadas
4. Dados incluem data/hora, tipo (presencial/vídeo), plataforma

#### Uso:

```javascript
const response = await fetch('/api/schedule-visit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    propertyId: 'prop-123',
    propertyCode: 'PH1060',
    type: 'in_person', // ou 'video'
    date: '2025-12-15',
    time: '14:00',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    phone: '48999999999',
    consent: true,
  }),
});
```

### 4. Sincronização de Corretores

#### Buscar sellers do C2S:

```bash
GET /api/sync/c2s-sellers
```

#### Sincronizar sellers:

```bash
POST /api/sync/c2s-sellers
Content-Type: application/json

{
  "mode": "sync",
  "sellers": [
    {
      "name": "Maria Corretor",
      "email": "maria@pharos.com.br",
      "phone": "48999999999",
      "external_id": "corretor-123"
    }
  ]
}
```

Modos disponíveis:
- `sync`: Cria novos e atualiza existentes
- `create`: Apenas cria novos
- `update`: Apenas atualiza existentes

---

## Endpoints da API

### `/api/leads` (POST)
Cria lead no sistema (integra automaticamente com C2S).

### `/api/schedule-visit` (POST)
Agenda visita e cria atividade no C2S.

### `/api/webhooks/c2s` (POST)
Recebe notificações de eventos do C2S.

### `/api/sync/c2s-sellers` (GET/POST)
Sincroniza corretores entre sistemas.

### `/api/admin/c2s/stats` (GET/POST)
Retorna estatísticas e métricas da integração.

### `/api/admin/c2s/queue` (GET/POST)
Gerencia fila de retry de leads.

### `/api/health` (GET)
Health check incluindo status do C2S.

---

## Webhooks

### Eventos Suportados:

#### `on_create_lead`
Disparado quando um novo lead é criado no C2S.

#### `on_update_lead`
Disparado quando um lead é atualizado (mudança de status, notas, etc.).

#### `on_close_lead`
Disparado quando um negócio é fechado.

### Segurança

Webhooks são validados usando HMAC SHA-256:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payloadBody)
  .digest('hex');

if (signature !== expectedSignature) {
  // Requisição inválida
}
```

---

## Monitoramento

### Health Check

```bash
GET /api/health
```

Resposta:

```json
{
  "success": true,
  "status": "healthy",
  "provider": { ... },
  "c2s": {
    "status": "healthy",
    "latency": 150,
    "enabled": true,
    "features": {
      "enabled": true,
      "syncSellers": true,
      "autoTags": true,
      "webhooksEnabled": true
    }
  }
}
```

### Estatísticas Detalhadas

```bash
POST /api/admin/c2s/stats
Content-Type: application/json

{
  "includeLeads": true,
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "health": {
      "healthy": true,
      "latency": 145
    },
    "client": {
      "totalRequests": 1250,
      "lastRequestTime": "2025-12-10T15:30:00Z"
    },
    "leads": {
      "total": 856,
      "byStatus": {
        "novo": 125,
        "em_negociacao": 45,
        "convertido": 15
      },
      "bySource": {
        "Site Pharos": 650,
        "Facebook": 150,
        "Google Ads": 56
      }
    }
  }
}
```

### Fila de Retry

```bash
GET /api/admin/c2s/queue?details=true
```

Resposta:

```json
{
  "success": true,
  "stats": {
    "total": 3,
    "byAttempts": {
      "first": 1,
      "second": 2,
      "maxed": 0
    },
    "isProcessing": false
  },
  "leads": [
    {
      "id": "lead-joao-silva-1733850000-abc123",
      "leadName": "João Silva",
      "propertyCode": "PH1060",
      "attempts": 1,
      "maxAttempts": 3,
      "error": "Network timeout"
    }
  ]
}
```

### Ações na Fila

```bash
POST /api/admin/c2s/queue
Content-Type: application/json

{
  "action": "process"  // ou "remove", "clear_maxed", "clear_all"
}
```

---

## Troubleshooting

### Lead não chegou no C2S

1. **Verificar logs do servidor:**
   ```bash
   grep "C2S" logs/production.log
   ```

2. **Checar health check:**
   ```bash
   curl https://seu-site.com/api/health
   ```

3. **Verificar fila de retry:**
   ```bash
   curl https://seu-site.com/api/admin/c2s/queue?details=true
   ```

4. **Processar fila manualmente:**
   ```bash
   curl -X POST https://seu-site.com/api/admin/c2s/queue \
     -H "Content-Type: application/json" \
     -d '{"action": "process"}'
   ```

### Webhook não está funcionando

1. **Verificar se está registrado no C2S:**
   ```bash
   curl https://api.contact2sale.com/integration/leads/webhooks \
     -H "Authentication: Bearer SEU_TOKEN"
   ```

2. **Testar endpoint manualmente:**
   ```bash
   curl -X POST https://seu-site.com/api/webhooks/c2s \
     -H "Content-Type: application/json" \
     -d '{"hook_action": "on_update_lead", "data": {...}}'
   ```

3. **Verificar logs do webhook:**
   ```bash
   grep "webhook" logs/production.log
   ```

### Tags não estão sendo aplicadas

1. **Verificar feature flag:**
   ```bash
   echo $C2S_AUTO_TAGS  # Deve ser "true"
   ```

2. **Verificar logs de tags:**
   ```bash
   grep "autoTags" logs/production.log
   ```

### Erro de autenticação

1. **Verificar token:**
   - Token deve começar com caracteres alfanuméricos
   - Não deve ter espaços ou quebras de linha
   - Verificar se não expirou

2. **Testar token diretamente:**
   ```bash
   curl https://api.contact2sale.com/integration/leads \
     -H "Authentication: Bearer SEU_TOKEN"
   ```

---

## Suporte

Para problemas ou dúvidas:

1. Consulte [documentação oficial do C2S](https://api.contact2sale.com/docs/api)
2. Verifique logs do sistema
3. Entre em contato com suporte técnico da Pharos

---

**Última atualização:** 10/12/2025

