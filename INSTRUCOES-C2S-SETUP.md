# 🚀 **Instruções para Configurar C2S**

Siga este guia passo a passo para finalizar a integração com o Contact2Sale.

---

## 📋 **Passo 1: Obter Informações no Painel C2S**

1. **Acesse:** https://app.contact2sale.com
2. **Faça login** com suas credenciais
3. **Vá em:** `Configurações → API/Integrações`

### 🔑 **Informações Necessárias:**

#### **1. Token de API** ✅
- Copie o token de autenticação
- Exemplo: `dc3e9b0ce9ba484da1e1e5e3d884f2778bd71dc5e8c7afe50f`

#### **2. Company ID** ✅
- Encontre o ID da sua empresa
- Pode estar em: `Configurações → Empresa` ou `Configurações → API`
- Exemplo: `59d517f81c0bb20004fd95f3`

#### **3. Seller ID (Vendedor Padrão)** ⚠️ **IMPORTANTE**
- Vá em: `Configurações → Vendedores`
- Escolha um vendedor para ser o padrão dos leads do site
- Copie o ID dele
- **Por quê?** A IA do C2S confirmou que `seller_id` pode ser obrigatório na sua conta

---

## ⚙️ **Passo 2: Configurar Variáveis de Ambiente**

Abra o arquivo `.env.local` e adicione/atualize:

```bash
# ============== C2S - CONTACT2SALE ==============

# ✅ Token (já configurado)
C2S_API_TOKEN=dc3e9b0ce9ba484da1e1e5e3d884f2778bd71dc5e8c7afe50f

# ✅ ADICIONAR: Company ID (obrigatório)
C2S_COMPANY_ID=COLE_SEU_COMPANY_ID_AQUI

# ⚠️ ADICIONAR: Seller ID Padrão (pode ser obrigatório)
C2S_DEFAULT_SELLER_ID=COLE_SEU_SELLER_ID_AQUI

# Feature Flags (já configurados)
C2S_ENABLED=true
C2S_AUTO_TAGS=true
C2S_WEBHOOKS_ENABLED=true
```

---

## 🧪 **Passo 3: Testar a Integração**

### **Teste via PowerShell:**

```powershell
$body = @{
    name = "Teste Final Pharos"
    email = "teste@pharos.com.br"
    phone = "+5548999999999"
    message = "Teste após configurar company_id e seller_id"
    subject = "Teste C2S"
    intent = "buy"
    source = "site"
    acceptsMarketing = $true
    acceptsWhatsapp = $true
    metadata = @{
        skipVista = $true
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3600/api/leads" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | ConvertTo-Json -Depth 5
```

### **✅ Resposta de Sucesso:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "leadId": "67589abc123...",
    "message": "Lead enviado para C2S com sucesso"
  },
  "message": "Lead criado com sucesso"
}
```

### **❌ Se ainda der erro 422:**

1. **Verifique** se o `C2S_COMPANY_ID` está correto
2. **Verifique** se o `C2S_DEFAULT_SELLER_ID` está correto
3. **Entre em contato** com o suporte C2S e informe:
   - "Configurei `company_id` e `seller_id`, mas ainda recebo erro 422"
   - Envie o payload que está sendo enviado (copie do log do servidor)

---

## 🌐 **Passo 4: Testar pelo Site**

1. **Acesse:** http://localhost:3600/contato
2. **Preencha o formulário:**
   - Escolha "Comprar"
   - Preencha nome, email e WhatsApp
   - Selecione orçamento
   - Marque as autorizações
3. **Clique em "Enviar mensagem"**
4. **Verifique no painel C2S** se o lead chegou!

---

## 📊 **Passo 5: Monitorar**

### **Ver logs em tempo real:**

```bash
# No terminal onde está rodando npm run dev
# Os logs aparecerão automaticamente
```

### **Verificar fila de retry:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3600/api/admin/c2s/queue"
```

### **Verificar estatísticas:**

```powershell
$body = '{"includeLeads":false}'
Invoke-RestMethod -Uri "http://localhost:3600/api/admin/c2s/stats" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | ConvertTo-Json -Depth 10
```

---

## ✅ **Checklist Final**

- [ ] Token C2S configurado em `.env.local`
- [ ] Company ID configurado em `.env.local`
- [ ] Seller ID padrão configurado em `.env.local`
- [ ] Servidor reiniciado após alterar `.env.local`
- [ ] Teste via PowerShell passou
- [ ] Teste via site passou
- [ ] Lead apareceu no painel C2S

---

## 🆘 **Suporte**

Se ainda tiver problemas, entre em contato com:

**Contact2Sale:**
- Email: suporte@contact2sale.com
- Chat: https://app.contact2sale.com (ícone de chat no canto inferior direito)

**Informações para o Suporte:**
- Token: `dc3e9b0ce9ba484da1e1e5e3d884f2778bd71dc5e8c7afe50f`
- Erro: HTTP 422
- Payload: (copie do log do servidor)

---

## 🎉 **Pronto!**

Assim que configurar `C2S_COMPANY_ID` e `C2S_DEFAULT_SELLER_ID`, o sistema estará **100% funcional**! 🚀

