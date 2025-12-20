# Contact2Sale - API Reference

## Índice

1. [Autenticação](#autenticação)
2. [Endpoints de Leads](#endpoints-de-leads)
3. [Endpoints de Sellers](#endpoints-de-sellers)
4. [Endpoints de Webhooks](#endpoints-de-webhooks)
5. [Endpoints de Sincronização](#endpoints-de-sincronização)
6. [Endpoints de Monitoramento](#endpoints-de-monitoramento)
7. [Tipos e Interfaces](#tipos-e-interfaces)

---

## Autenticação

Todas as requisições devem incluir o header de autenticação:

```
Authentication: Bearer SEU_TOKEN_AQUI
```

---

## Endpoints de Leads

### POST /api/leads

Cria um novo lead no sistema (integra automaticamente com C2S).

**Request:**

```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "48999999999",
  "message": "Interesse no imóvel PH1060",
  "propertyId": "prop-123",
  "propertyCode": "PH1060",
  "intent": "buy",
  "source": "site",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "verao-2025"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "leadId": "lead-abc123",
  "message": "Lead criado com sucesso"
}
```

---

## Endpoints de Agendamento

### POST /api/schedule-visit

Agenda uma visita e cria atividade no C2S.

**Request:**

```json
{
  "propertyId": "prop-123",
  "propertyCode": "PH1060",
  "type": "in_person",
  "date": "2025-12-15",
  "time": "14:00",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "48999999999",
  "notes": "Preferência por período da tarde",
  "consent": true
}
```

**Response (200):**

```json
{
  "success": true,
  "leadId": "lead-abc123",
  "message": "Visita agendada com sucesso",
  "appointment": {
    "type": "in_person",
    "date": "2025-12-15",
    "time": "14:00"
  },
  "c2sIntegration": {
    "enabled": true,
    "success": true
  }
}
```

### GET /api/schedule-visit?propertyId=prop-123

Retorna disponibilidade de horários para agendamento.

**Response (200):**

```json
{
  "success": true,
  "propertyId": "prop-123",
  "availability": [
    {
      "date": "2025-12-15",
      "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"]
    }
  ]
}
```

---

## Endpoints de Sellers

### GET /api/sync/c2s-sellers

Busca todos os sellers (corretores) do C2S.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "seller-123",
      "name": "Maria Corretor",
      "email": "maria@pharos.com.br",
      "phone": "48999999999",
      "external_id": "corretor-123"
    }
  ],
  "total": 15
}
```

### POST /api/sync/c2s-sellers

Sincroniza sellers entre o sistema e o C2S.

**Request:**

```json
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

**Modos disponíveis:**
- `sync`: Cria novos e atualiza existentes (padrão)
- `create`: Apenas cria novos
- `update`: Apenas atualiza existentes

**Response (200):**

```json
{
  "success": true,
  "summary": {
    "total": 1,
    "created": 0,
    "updated": 1,
    "errors": 0
  }
}
```

---

## Endpoints de Webhooks

### POST /api/webhooks/c2s

Recebe notificações de eventos do Contact2Sale.

**Request:**

```json
{
  "hook_action": "on_update_lead",
  "data": {
    "type": "lead",
    "id": "lead-abc123",
    "attributes": {
      "customer": {
        "name": "João Silva"
      },
      "lead_status": {
        "alias": "em_negociacao"
      }
    }
  },
  "timestamp": "2025-12-10T15:30:00Z"
}
```

**Headers:**
- `x-c2s-signature`: Assinatura HMAC para validação

**Response (200):**

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "action": "on_update_lead"
}
```

### GET /api/webhooks/c2s

Verifica status do endpoint de webhooks.

**Response (200):**

```json
{
  "service": "Contact2Sale Webhooks",
  "status": "active",
  "enabled": true,
  "timestamp": "2025-12-10T15:30:00Z"
}
```

---

## Endpoints de Monitoramento

### GET /api/health

Health check geral do sistema incluindo C2S.

**Response (200):**

```json
{
  "success": true,
  "status": "healthy",
  "provider": {
    "name": "DualProvider",
    "healthy": true
  },
  "c2s": {
    "status": "healthy",
    "latency": 145,
    "enabled": true,
    "features": {
      "enabled": true,
      "syncSellers": true,
      "autoTags": true,
      "webhooksEnabled": true,
      "visitIntegration": true
    }
  }
}
```

### GET /api/admin/c2s/stats

Health check rápido do C2S.

**Response (200):**

```json
{
  "status": "healthy",
  "latency": 145,
  "timestamp": "2025-12-10T15:30:00Z",
  "features": {
    "enabled": true,
    "syncSellers": true,
    "autoTags": true
  }
}
```

### POST /api/admin/c2s/stats

Estatísticas detalhadas da integração C2S.

**Request:**

```json
{
  "includeLeads": true,
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}
```

**Response (200):**

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
        "Facebook": 150
      }
    },
    "sellers": {
      "total": 15,
      "withExternalId": 15
    }
  }
}
```

---

## Endpoints de Fila

### GET /api/admin/c2s/queue

Retorna estatísticas da fila de retry.

**Query Params:**
- `details=true`: Inclui lista completa de leads na fila

**Response (200):**

```json
{
  "success": true,
  "stats": {
    "total": 3,
    "byAttempts": {
      "first": 1,
      "second": 2,
      "third": 0,
      "maxed": 0
    },
    "isProcessing": false
  },
  "leads": [
    {
      "id": "lead-joao-silva-abc123",
      "leadName": "João Silva",
      "propertyCode": "PH1060",
      "attempts": 1,
      "maxAttempts": 3,
      "createdAt": "2025-12-10T14:00:00Z",
      "lastAttempt": "2025-12-10T14:05:00Z",
      "error": "Network timeout"
    }
  ]
}
```

### POST /api/admin/c2s/queue

Executa ações na fila de retry.

**Request:**

```json
{
  "action": "process"
}
```

**Ações disponíveis:**
- `process`: Processa fila manualmente
- `remove`: Remove lead específico (requer `leadId`)
- `clear_maxed`: Limpa leads que excederam max attempts
- `clear_all`: Limpa toda a fila

**Response (200):**

```json
{
  "success": true,
  "message": "Fila processada com sucesso",
  "stats": {
    "total": 2,
    "byAttempts": { ... }
  }
}
```

---

## Tipos e Interfaces

### LeadInput

```typescript
interface LeadInput {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  subject?: string;
  intent?: 'buy' | 'rent' | 'sell' | 'evaluate' | 'info';
  propertyId?: string;
  propertyCode?: string;
  source?: 'site' | 'facebook' | 'instagram' | 'google';
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  referralUrl?: string;
  userAgent?: string;
  acceptsMarketing?: boolean;
  acceptsWhatsapp?: boolean;
  metadata?: Record<string, any>;
}
```

### C2SLeadPayload

```typescript
interface C2SLeadPayload {
  description: string;
  customer: {
    name: string;
    email?: string;
    phone?: number;
  };
  product?: {
    description: string;
    license_plate?: string;
    price?: number;
    real_estate_detail?: {
      negotiation_name?: 'Venda' | 'Aluguel';
      area?: number;
      rooms?: number;
      suites?: number;
      bathrooms?: number;
      garage?: number;
      neighborhood?: string;
      city?: string;
      state?: string;
    };
  };
  seller?: {
    name: string;
    external_id?: string;
  };
  lead_source?: {
    name: string;
  };
  channel?: {
    name: string;
  };
  tags?: string[];
  metadata?: Record<string, any>;
}
```

### ScheduleVisitRequest

```typescript
interface ScheduleVisitRequest {
  propertyId: string;
  propertyCode?: string;
  type: 'in_person' | 'video';
  videoProvider?: 'whatsapp' | 'meet';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  email: string;
  phone: string;
  notes?: string;
  realtorId?: string;
  consent: boolean;
}
```

---

**Documentação oficial do C2S:** https://api.contact2sale.com/docs/api

**Última atualização:** 10/12/2025

