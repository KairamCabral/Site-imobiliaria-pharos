# 🔧 Exemplo de Configuração - Variáveis Mautic

## .env.local - Configuração Mínima

Adicione estas variáveis ao seu arquivo `.env.local`:

```bash
# Mautic Marketing Automation Configuration
MAUTIC_BASE_URL=https://mautic.seudominio.com.br
MAUTIC_AUTH_TYPE=basic
MAUTIC_API_USERNAME=admin
MAUTIC_API_PASSWORD=sua_senha_segura_aqui
MAUTIC_TIMEOUT_MS=30000
```

---

## .env.local - Configuração Completa (Recomendada)

Para usar Mautic junto com Vista/DWV no modo dual:

```bash
# Vista CRM API Configuration
VISTA_BASE_URL=https://gabarito-rest.vistahost.com.br
VISTA_API_KEY=sua_api_key_vista_aqui

# DWV API Configuration (PRODUÇÃO)
DWV_BASE_URL=https://agencies.dwvapp.com.br
DWV_API_TOKEN=seu_token_dwv_aqui
DWV_TIMEOUT_MS=15000

# Mautic Marketing Automation Configuration
MAUTIC_BASE_URL=https://mautic.seudominio.com.br
MAUTIC_AUTH_TYPE=basic
MAUTIC_API_USERNAME=admin
MAUTIC_API_PASSWORD=sua_senha_segura_aqui
MAUTIC_TIMEOUT_MS=30000

# Provider Configuration
# Use 'dual' para combinar Vista + DWV + Mautic
NEXT_PUBLIC_LISTING_PROVIDER=dual

# Feature Flags
FOTOS_ENDPOINT_ENABLED=false

# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3600

# Google Analytics (opcional)
NEXT_PUBLIC_GA_ID=

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5548999999999
NEXT_PUBLIC_WHATSAPP_MESSAGE=Olá! Gostaria de ver mais fotos do imóvel {CODIGO}.
```

---

## 📝 Notas Importantes

### MAUTIC_BASE_URL
- ⚠️ **NÃO inclua `/api` no final**
- ✅ Correto: `https://mautic.seudominio.com.br`
- ❌ Errado: `https://mautic.seudominio.com.br/api`

### MAUTIC_AUTH_TYPE
- Atualmente apenas `basic` está implementado
- OAuth2 será implementado no futuro

### MAUTIC_API_USERNAME / PASSWORD
- Use suas credenciais de admin
- Ou crie usuário dedicado para API (recomendado)
- ⚠️ **Nunca commite estas credenciais no Git**

### MAUTIC_TIMEOUT_MS
- Padrão: `30000` (30 segundos)
- Aumente se o servidor Mautic for lento: `60000`
- Diminua se quiser timeout mais rápido: `15000`

---

## 🧪 Como Testar a Configuração

### 1. Adicionar variáveis ao .env.local

```bash
# Cole as variáveis acima no arquivo .env.local na raiz do projeto
```

### 2. Reiniciar o servidor

```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 3. Testar endpoint de debug

```bash
curl http://localhost:3600/api/debug/mautic
```

### 4. Resposta esperada

```json
{
  "success": true,
  "message": "✅ Integração Mautic funcionando perfeitamente!",
  "debug": {
    "timestamp": "2025-12-10T12:00:00.000Z",
    "environment": "development",
    "mautic": {
      "configured": true,
      "baseUrl": "https://mautic.seudominio.com.br",
      "authType": "basic",
      "username": "***",
      "password": "***",
      "timeout": "30000"
    },
    "health": {
      "healthy": true,
      "message": "Conexão OK"
    },
    "test": {
      "leadCreated": true,
      "leadId": "1",
      "message": "Contato criado no Mautic"
    }
  },
  "recommendations": [
    "Integração OK! Próximos passos:",
    "1. Configurar campos personalizados no Mautic (veja docs/MAUTIC-SETUP.md)",
    "2. Criar campanhas de boas-vindas",
    "3. Configurar segmentação automática",
    "4. Testar formulários em produção"
  ]
}
```

---

## 🔧 Troubleshooting

### Erro: "Mautic não configurado"

**Problema:** `MAUTIC_BASE_URL` não está definida

**Solução:**
```bash
# Adicione ao .env.local:
MAUTIC_BASE_URL=https://mautic.seudominio.com.br

# Reinicie o servidor
npm run dev
```

### Erro 401 Unauthorized

**Problema:** Credenciais inválidas

**Solução:**
1. Verifique `MAUTIC_API_USERNAME` e `MAUTIC_API_PASSWORD`
2. Confirme que usuário existe no Mautic
3. Verifique se Basic Auth está habilitado: Mautic → Configurações → API Settings

### Erro: "Não foi possível conectar ao Mautic"

**Problema:** URL incorreta ou servidor offline

**Solução:**
1. Verifique `MAUTIC_BASE_URL` (sem `/api` no final)
2. Teste acesso direto: `curl https://mautic.seudominio.com.br`
3. Confirme que Mautic está rodando: `docker-compose ps` (se usar Docker)

### Timeout

**Problema:** Servidor Mautic lento

**Solução:**
```bash
# Aumente o timeout no .env.local:
MAUTIC_TIMEOUT_MS=60000  # 60 segundos

# Reinicie o servidor
npm run dev
```

### Campos personalizados não aparecem

**Problema:** Campos não criados no Mautic

**Solução:**
1. Siga o guia completo: `docs/MAUTIC-SETUP.md`
2. Crie os campos no Mautic: Configurações → Campos de Contato
3. Verifique alias dos campos (deve ser exatamente como no código)

---

## 📚 Documentação Relacionada

- **Guia Completo de Setup:** `docs/MAUTIC-SETUP.md`
- **Variáveis de Ambiente:** `ENV-VARIABLES.md`
- **Resumo da Implementação:** `MAUTIC-INTEGRATION-SUMMARY.md`

---

## ✅ Checklist de Configuração

### Preparação
- [ ] Servidor Mautic instalado e funcionando
- [ ] Domínio configurado (ex: mautic.seudominio.com.br)
- [ ] Certificado SSL válido
- [ ] API habilitada no Mautic (Basic Auth)

### Configuração
- [ ] Variáveis adicionadas ao `.env.local`
- [ ] Servidor Next.js reiniciado
- [ ] Endpoint de debug testado (`/api/debug/mautic`)
- [ ] Resposta `success: true` recebida

### Mautic
- [ ] Campos personalizados criados
- [ ] Email de boas-vindas configurado
- [ ] Campanha ativada

### Testes
- [ ] Teste via endpoint de debug OK
- [ ] Teste via formulário de contato OK
- [ ] Contato aparece no Mautic
- [ ] Campos personalizados preenchidos
- [ ] Tags aplicadas corretamente

---

**Última atualização:** 10/12/2025

