# Contact2Sale - Troubleshooting Guide

## 🔍 Problemas Comuns e Soluções

### 1. Lead não chegou no C2S

**Sintomas:**
- Lead aparece no sistema mas não no C2S
- Sem erros aparentes

**Diagnóstico:**

```bash
# 1. Verificar se C2S está habilitado
curl https://seu-site.com/api/health | jq '.c2s'

# 2. Verificar fila de retry
curl https://seu-site.com/api/admin/c2s/queue?details=true

# 3. Verificar logs do servidor
grep "C2S.*error" logs/production.log | tail -20
```

**Soluções:**

✅ **Se C2S está desabilitado:**
```bash
# Edite .env.local
C2S_ENABLED=true

# Reinicie o servidor
npm run start
```

✅ **Se lead está na fila:**
```bash
# Processar fila manualmente
curl -X POST https://seu-site.com/api/admin/c2s/queue \
  -H "Content-Type: application/json" \
  -d '{"action": "process"}'
```

✅ **Se há erro de rede:**
- Verificar conectividade com `api.contact2sale.com`
- Verificar firewall e proxy
- Aguardar retry automático (5 minutos)

---

### 2. Erro de Autenticação

**Sintomas:**
- HTTP 401 Unauthorized
- Mensagem: "Invalid authentication token"

**Diagnóstico:**

```bash
# Testar token diretamente
curl https://api.contact2sale.com/integration/leads \
  -H "Authentication: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

**Soluções:**

✅ **Token inválido ou expirado:**
1. Obtenha novo token no painel C2S
2. Atualize `C2S_API_TOKEN` no `.env.local`
3. Reinicie o servidor

✅ **Token com espaços/quebras:**
```bash
# Verificar se token tem espaços
echo $C2S_API_TOKEN | od -c

# Remover espaços
export C2S_API_TOKEN=$(echo $C2S_API_TOKEN | tr -d ' \n')
```

---

### 3. Tags não estão sendo aplicadas

**Sintomas:**
- Leads chegam no C2S sem tags
- Ou com tags parciais

**Diagnóstico:**

```bash
# 1. Verificar feature flag
echo $C2S_AUTO_TAGS

# 2. Verificar logs de tags
grep "autoTags" logs/production.log | tail -10
```

**Soluções:**

✅ **Feature desabilitada:**
```bash
# Edite .env.local
C2S_AUTO_TAGS=true

# Reinicie o servidor
```

✅ **Dados do imóvel não encontrados:**
- Verificar se `propertyId` é válido
- Verificar se imóvel existe no sistema
- Logs mostrarão: `getPropertyDetails error`

✅ **Tags sendo limitadas:**
- Sistema limita a 20 tags por lead
- Verifique regras em `src/providers/c2s/tags.ts`

---

### 4. Webhook não está funcionando

**Sintomas:**
- Eventos do C2S não chegam ao sistema
- Atualizações não sincronizam

**Diagnóstico:**

```bash
# 1. Verificar se webhook está registrado
curl https://api.contact2sale.com/integration/leads/webhooks \
  -H "Authentication: Bearer SEU_TOKEN"

# 2. Testar endpoint manualmente
curl -X POST https://seu-site.com/api/webhooks/c2s \
  -H "Content-Type: application/json" \
  -d '{
    "hook_action": "on_update_lead",
    "data": {
      "type": "lead",
      "id": "test-123",
      "attributes": {
        "customer": {"name": "Test"},
        "lead_status": {"alias": "novo"}
      }
    }
  }'

# 3. Verificar logs
grep "webhook" logs/production.log | tail -20
```

**Soluções:**

✅ **Webhook não registrado:**
```bash
# Registrar webhook
curl -X POST https://api.contact2sale.com/integration/leads/subscribe \
  -H "Content-Type: application/json" \
  -H "Authentication: Bearer SEU_TOKEN" \
  -d '{
    "hook_url": "https://seu-site.com/api/webhooks/c2s",
    "hook_action": "on_update_lead"
  }'
```

✅ **Assinatura HMAC inválida:**
- Verificar `C2S_WEBHOOK_SECRET`
- Regenerar secret se necessário
- Atualizar no código e no C2S

✅ **URL do webhook incorreta:**
- Deve ser HTTPS em produção
- Deve ser acessível publicamente
- Testar com `curl` de servidor externo

---

### 5. Timeout em Requisições

**Sintomas:**
- HTTP 408 Request Timeout
- Leads demoram muito para processar

**Diagnóstico:**

```bash
# 1. Verificar latência
curl https://seu-site.com/api/admin/c2s/stats | jq '.data.health.latency'

# 2. Verificar timeout configurado
echo $C2S_TIMEOUT_MS

# 3. Testar latência direta
time curl https://api.contact2sale.com/integration/leads \
  -H "Authentication: Bearer SEU_TOKEN"
```

**Soluções:**

✅ **Aumentar timeout:**
```bash
# Edite .env.local
C2S_TIMEOUT_MS=30000  # 30 segundos

# Reinicie o servidor
```

✅ **Otimizar requisições:**
- Verificar se há muitas requisições simultâneas
- Sistema já tem rate limiting (100ms entre reqs)
- Considerar batch processing se volume alto

---

### 6. Fila de Retry Crescendo

**Sintomas:**
- Muitos leads na fila
- Leads não saem da fila

**Diagnóstico:**

```bash
# 1. Verificar tamanho da fila
curl https://seu-site.com/api/admin/c2s/queue | jq '.stats'

# 2. Verificar leads na fila
curl https://seu-site.com/api/admin/c2s/queue?details=true | jq '.leads'

# 3. Verificar se processamento está ativo
curl https://seu-site.com/api/admin/c2s/queue | jq '.stats.isProcessing'
```

**Soluções:**

✅ **Processar fila manualmente:**
```bash
curl -X POST https://seu-site.com/api/admin/c2s/queue \
  -H "Content-Type: application/json" \
  -d '{"action": "process"}'
```

✅ **Limpar leads que falharam 3x:**
```bash
curl -X POST https://seu-site.com/api/admin/c2s/queue \
  -H "Content-Type: application/json" \
  -d '{"action": "clear_maxed"}'
```

✅ **Investigar erros recorrentes:**
```bash
# Ver erros dos leads na fila
curl https://seu-site.com/api/admin/c2s/queue?details=true | \
  jq '.leads[].error' | sort | uniq -c
```

---

### 7. Sincronização de Sellers Falhou

**Sintomas:**
- Erro ao buscar ou criar sellers
- Sellers duplicados

**Diagnóstico:**

```bash
# 1. Listar sellers do C2S
curl https://seu-site.com/api/sync/c2s-sellers

# 2. Verificar logs
grep "sync:seller" logs/production.log | tail -20
```

**Soluções:**

✅ **Seller sem `external_id`:**
- Sempre fornecer `external_id` único
- Usado para evitar duplicatas
- Exemplo: `corretor-{id-interno}`

✅ **Seller duplicado:**
```bash
# Forçar atualização
curl -X POST https://seu-site.com/api/sync/c2s-sellers \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "update",
    "sellers": [...]
  }'
```

---

### 8. Health Check Falha

**Sintomas:**
- `/api/health` retorna unhealthy
- C2S aparece como down

**Diagnóstico:**

```bash
# 1. Health check detalhado
curl https://seu-site.com/api/health | jq '.'

# 2. Testar conectividade
ping api.contact2sale.com
curl -I https://api.contact2sale.com

# 3. Verificar DNS
nslookup api.contact2sale.com
```

**Soluções:**

✅ **Problema de rede:**
- Verificar firewall
- Verificar proxy/VPN
- Testar de servidor diferente

✅ **C2S temporariamente indisponível:**
- Aguardar alguns minutos
- Verificar [status do C2S](https://status.contact2sale.com)
- Sistema continuará funcionando com fila de retry

---

## 🛠️ Ferramentas de Debug

### 1. Curl com Debug Completo

```bash
curl -v \
  -X POST https://api.contact2sale.com/integration/leads \
  -H "Content-Type: application/json" \
  -H "Authentication: Bearer SEU_TOKEN" \
  -d '{"description": "Test", "customer": {"name": "Test", "phone": 5548999999999}}' \
  2>&1 | tee debug.log
```

### 2. Logs Estruturados

```bash
# Ver apenas erros do C2S
grep "C2S.*ERROR" logs/production.log

# Ver estatísticas de requisições
grep "C2S.*createLead" logs/production.log | wc -l

# Ver últimos webhooks recebidos
grep "webhook:" logs/production.log | tail -10
```

### 3. Monitoramento em Tempo Real

```bash
# Seguir logs em tempo real
tail -f logs/production.log | grep "C2S"

# Monitorar fila
watch -n 30 'curl -s https://seu-site.com/api/admin/c2s/queue | jq ".stats"'
```

---

## 📞 Suporte

Se o problema persistir após seguir este guia:

1. **Coletar informações:**
   ```bash
   # Gerar relatório de debug
   curl https://seu-site.com/api/health > debug-health.json
   curl https://seu-site.com/api/admin/c2s/stats > debug-stats.json
   curl https://seu-site.com/api/admin/c2s/queue?details=true > debug-queue.json
   
   # Coletar logs
   grep "C2S" logs/production.log > debug-logs.txt
   ```

2. **Contatar:**
   - Suporte técnico da Pharos
   - Suporte do Contact2Sale: suporte@contact2sale.com

3. **Incluir no chamado:**
   - Versão do sistema
   - Descrição detalhada do problema
   - Arquivos de debug gerados
   - Passos para reproduzir

---

**Última atualização:** 10/12/2025

