# 🚀 Guia Completo de Configuração SSGTM - Pharos Imobiliária

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração Google Cloud](#configuração-google-cloud)
4. [Configuração GTM Web Container](#configuração-gtm-web-container)
5. [Configuração GTM Server Container](#configuração-gtm-server-container)
6. [Configuração Meta Ads](#configuração-meta-ads)
7. [Configuração Google Ads](#configuração-google-ads)
8. [Variáveis de Ambiente](#variáveis-de-ambiente)
9. [Testes e Validação](#testes-e-validação)
10. [Monitoramento](#monitoramento)

---

## 🎯 Visão Geral

Este guia mostra como configurar um sistema completo de **Server-Side Google Tag Manager (SSGTM)** para rastreamento avançado de conversões do Meta Ads e Google Ads no site da Pharos Imobiliária.

### **Benefícios desta Implementação**

- ✅ **Match Rate 90%+**: Enhanced Conversions com dados hasheados (SHA-256)
- ✅ **Privacidade First**: LGPD compliant com Consent Mode v2
- ✅ **iOS 14+ Ready**: Bypass de ATT (App Tracking Transparency)
- ✅ **Deduplicação**: Event ID único previne conversões duplicadas
- ✅ **Attribution Real**: Rastreamento preciso de origem do lead
- ✅ **Performance**: Não bloqueia renderização do site

### **Arquitetura**

```
Frontend (Next.js) 
    ↓
Client-Side GTM (dataLayer)
    ↓
Server-Side GTM (Google Cloud)
    ↓
Meta CAPI + Google Ads + GA4
```

---

## 📦 Pré-requisitos

### **Contas Necessárias**

- [ ] Conta Google (Gmail)
- [ ] Conta Google Cloud (novo ou existente)
- [ ] Conta Google Tag Manager
- [ ] Conta Meta Business (Facebook)
- [ ] Conta Google Ads
- [ ] Domínio próprio (pharos.imob.br)
- [ ] Cartão de crédito (para Google Cloud)

### **Conhecimentos Básicos**

- Familiaridade com Google Tag Manager
- Acesso ao código do site (Next.js)
- Acesso ao DNS do domínio

---

## ☁️ Configuração Google Cloud

### **Passo 1: Criar Projeto no Google Cloud**

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em **"Criar Projeto"**
3. Nome do projeto: `pharos-ssgtm`
4. Clique em **"Criar"**

### **Passo 2: Ativar Billing**

1. No menu lateral, vá em **Faturamento**
2. Vincule um cartão de crédito
3. ⚠️ **Custos estimados**: $10-50/mês (depende do tráfego)

### **Passo 3: Criar Servidor SSGTM**

#### **Opção A: App Engine (Recomendado para iniciantes)**

1. No menu lateral, vá em **App Engine**
2. Clique em **"Criar Aplicativo"**
3. Selecione região: `us-central1` (ou mais próxima)
4. Ambiente: **Standard**
5. Linguagem: **Node.js**

#### **Opção B: Cloud Run (Recomendado para produção)**

1. No menu lateral, vá em **Cloud Run**
2. Clique em **"Criar Serviço"**
3. Nome: `pharos-ssgtm`
4. Região: `us-central1`
5. Container: Usar imagem do GTM Server
6. Autenticação: **Permitir invocações não autenticadas**
7. CPU: **1 vCPU**
8. Memória: **512 MB**
9. Máximo de instâncias: **10**

### **Passo 4: Configurar Domínio Personalizado**

1. No Cloud Run (ou App Engine), vá em **"Gerenciar domínios personalizados"**
2. Clique em **"Adicionar mapeamento"**
3. Selecione seu domínio verificado
4. Subdomínio: `ssgtm`
5. Copie os registros DNS fornecidos

### **Passo 5: Configurar DNS**

No seu provedor de DNS (ex: Cloudflare, GoDaddy):

```
CNAME  ssgtm  ghs.googlehosted.com
```

Ou os valores específicos fornecidos pelo Google Cloud.

**Aguarde 5-30 minutos** para propagação do DNS.

---

## 🏷️ Configuração GTM Web Container

### **Passo 1: Criar Web Container**

1. Acesse [Google Tag Manager](https://tagmanager.google.com/)
2. Clique em **"Criar Conta"** (ou use existente)
3. Nome da conta: `Pharos Imobiliária`
4. Nome do container: `Site Pharos - Web`
5. Plataforma de destino: **Web**
6. Clique em **"Criar"**

### **Passo 2: Configurar Variáveis**

Vá em **Variáveis** → **Variáveis definidas pelo usuário** → **Nova**

#### **Variável 1: Server Container URL**

- Nome: `Server Container URL`
- Tipo: **Constante**
- Valor: `https://ssgtm.pharos.imob.br`

#### **Variável 2: GA4 Measurement ID**

- Nome: `GA4 Measurement ID`
- Tipo: **Constante**
- Valor: `G-XXXXXXXXXX` (seu ID do GA4)

### **Passo 3: Criar Tag GA4 Configuration**

Vá em **Tags** → **Nova** → **Configuração de tag**

- Tipo: **Google Analytics: GA4 Configuration**
- Measurement ID: `{{GA4 Measurement ID}}`
- **Marcar**: "Enviar para o contêiner do servidor"
- Transport URL: `{{Server Container URL}}`
- Acionamento: **All Pages**

### **Passo 4: Publicar Web Container**

1. Clique em **Enviar** (canto superior direito)
2. Nome da versão: `v1 - SSGTM Setup`
3. Descrição: `Configuração inicial com Server Container`
4. Clique em **Publicar**

---

## 🖥️ Configuração GTM Server Container

### **Passo 1: Criar Server Container**

1. No GTM, clique na **conta** (não no container)
2. **Container** → **Criar container**
3. Nome: `Site Pharos - Server`
4. Plataforma: **Server**
5. Clique em **Criar**

### **Passo 2: Provisionar Servidor (via Google Cloud)**

1. Na tela inicial do Server Container, clique em **"Provisionar automaticamente via Google Cloud"**
2. Selecione o projeto: `pharos-ssgtm`
3. Região: `us-central1`
4. Aguarde provisionamento (~5 minutos)

### **Passo 3: Configurar Client (GA4)**

Vá em **Clientes** → **Novo**

- Nome: `GA4 Client`
- Tipo: **Google Analytics: GA4**
- Configurações padrão

### **Passo 4: Configurar Tag GA4**

Vá em **Tags** → **Nova**

#### **Tag 1: GA4 Event**

- Nome: `GA4 - All Events`
- Tipo: **Google Analytics: GA4**
- Measurement ID: (usar variável ou direto)
- Event Name: `{{Event Name}}`
- Acionamento: **All Events**

#### **Tag 2: Meta Conversion API**

- Nome: `Meta CAPI - Conversions`
- Tipo: **Meta Conversions API**
- Pixel ID: `SEU_PIXEL_ID`
- API Access Token: `SEU_TOKEN_CAPI`
- Acionamento: **Custom Event** → `generate_lead`, `purchase`

**Configurações avançadas:**
- Event Name: `{{Event Name}}`
- User Data → Email: `{{user_data.em}}` (já hasheado)
- User Data → Phone: `{{user_data.ph}}` (já hasheado)
- Event ID: `{{event_id}}`
- Event Source URL: `{{page_url}}`

### **Passo 5: Publicar Server Container**

1. Clique em **Enviar**
2. Nome: `v1 - Meta CAPI + GA4`
3. **Publicar**

---

## 📱 Configuração Meta Ads

### **Passo 1: Obter Pixel ID**

1. Acesse [Meta Events Manager](https://business.facebook.com/events_manager2/)
2. Selecione seu Pixel (ou crie novo)
3. Copie o **Pixel ID** (ex: `1234567890123456`)

### **Passo 2: Gerar Token de Conversion API**

1. No Events Manager, vá em **Configurações**
2. Role até **Conversions API**
3. Clique em **"Gerar token de acesso"**
4. Copie o token (começa com `EAA...`)
5. ⚠️ **Guarde em local seguro** - você não poderá ver novamente

### **Passo 3: Configurar Event Match Quality**

No Events Manager:

1. Vá em **Teste de eventos**
2. Envie um evento de teste (via site)
3. Valide que:
   - Event ID está presente
   - User data está hasheado
   - Match quality está **Bom** ou **Ótimo**

**Meta ideal de Match Quality**: 7.0+

---

## 🎯 Configuração Google Ads

### **Passo 1: Criar Conversão**

1. Acesse [Google Ads](https://ads.google.com/)
2. Vá em **Ferramentas e configurações** → **Conversões**
3. Clique em **+ Nova ação de conversão**
4. Origem: **Website**
5. Nome: `Lead - Formulário Imóvel`
6. Categoria: **Envio de formulário de contato**
7. Valor: Use **valores variáveis** (enviaremos do código)
8. Contagem: **Uma**
9. Janela de conversão: **30 dias**
10. Método de rastreamento: **Google Tag Manager**

Copie o:
- **Conversion ID**: `AW-XXXXXXXXXX`
- **Conversion Label**: `abc123DEF456`

### **Passo 2: Vincular GA4 ao Google Ads**

1. No GA4, vá em **Admin** → **Propriedade** → **Product Links**
2. Selecione **Google Ads Links**
3. Clique em **Vincular**
4. Selecione sua conta Google Ads
5. Ative **Importação automática de conversões**

---

## 🔐 Variáveis de Ambiente

Crie/edite o arquivo `.env.local` na raiz do projeto:

```bash
# Google Tag Manager & Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Server-Side Tag Manager (SSGTM)
SSGTM_ENDPOINT_URL=https://ssgtm.pharos.imob.br

# Meta Ads (Facebook Pixel & Conversion API)
META_PIXEL_ID=1234567890123456
META_CONVERSION_API_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Analytics 4 - Measurement Protocol
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_ANALYTICS_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Google Ads (opcional - via GA4 é suficiente)
GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXXX
GOOGLE_ADS_CONVERSION_LABEL=abc123DEF456
```

### **Como obter Google Analytics API Secret**

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Admin → Propriedade → Data Streams
3. Selecione seu stream (Web)
4. Role até **Measurement Protocol API secrets**
5. Clique em **Create**
6. Nome: `SSGTM Backend`
7. Copie o secret

---

## ✅ Testes e Validação

### **Teste 1: Verificar GTM Web Container**

1. No site, abra DevTools (F12)
2. Console → Digite:
```javascript
dataLayer
```
3. Deve retornar array com eventos

### **Teste 2: Verificar SSGTM Endpoint**

```bash
curl https://ssgtm.pharos.imob.br/healthz
```

Resposta esperada: `200 OK`

### **Teste 3: Simular Conversão**

1. Acesse uma página de imóvel
2. Preencha o formulário de lead
3. Envie

**Verificações:**

#### **No Meta Events Manager**

1. Vá em **Teste de eventos**
2. Aguarde 30-60 segundos
3. Deve aparecer evento **Lead**
4. Clique no evento e valide:
   - ✅ Event ID presente
   - ✅ fbp e fbc presentes
   - ✅ User data hasheado
   - ✅ Event Match Quality: **Bom** (7.0+)

#### **No Google Ads**

1. Vá em **Conversões**
2. Aguarde 3-6 horas (delay normal)
3. Deve aparecer 1 conversão de **Lead - Formulário Imóvel**

#### **No GA4**

1. Vá em **Relatórios em tempo real**
2. Deve aparecer evento **generate_lead**

### **Teste 4: Validar API Route**

```bash
curl http://localhost:3700/api/tracking/event
```

Resposta esperada:
```json
{
  "status": "ok",
  "service": "tracking-api",
  "endpoints": {
    "ssgtm": true,
    "meta_capi": true,
    "google_ads": true
  }
}
```

---

## 📊 Monitoramento

### **Métricas para Acompanhar**

#### **Meta Ads**

- **Event Match Quality**: Meta ≥ 7.0
- **Events Matched**: % de eventos com match bem-sucedido
- **Attribution Setting**: 7-day click, 1-day view

#### **Google Ads**

- **Conversões importadas**: Via GA4
- **Conversões diretas**: Via Enhanced Conversions
- **Cross-device conversions**: Deve aumentar com SSGTM

#### **Seu Backend**

Crie endpoint de métricas:

```typescript
// src/app/api/tracking/metrics/route.ts
export async function GET() {
  return NextResponse.json({
    total_events_today: 150,
    leads_today: 12,
    conversion_rate: "8%",
    ssgtm_success_rate: "98%",
    meta_capi_success_rate: "95%",
  });
}
```

---

## 🎓 Checklist Final

- [ ] Google Cloud Project criado
- [ ] SSGTM servidor provisionado
- [ ] DNS configurado (ssgtm.pharos.imob.br)
- [ ] GTM Web Container publicado
- [ ] GTM Server Container publicado
- [ ] Meta Pixel configurado
- [ ] Meta CAPI token obtido
- [ ] Google Ads conversões criadas
- [ ] GA4 vinculado ao Google Ads
- [ ] Variáveis de ambiente configuradas
- [ ] Código implementado no site
- [ ] Testes de conversão realizados
- [ ] Event Match Quality ≥ 7.0
- [ ] Conversões aparecendo no Google Ads
- [ ] Consent Banner funcionando

---

## 🆘 Troubleshooting

### **Problema: Eventos não chegam no Meta**

**Soluções:**
1. Validar `META_PIXEL_ID` e `META_CONVERSION_API_TOKEN`
2. Verificar logs do SSGTM (Cloud Console → Logs)
3. Testar com Postman/curl direto na API do Meta

### **Problema: Match Quality baixo (<6.0)**

**Soluções:**
1. Verificar se email está sendo hasheado corretamente (SHA-256)
2. Verificar se telefone está no formato E.164 (+5511999999999)
3. Adicionar mais campos (first_name, last_name, city)
4. Verificar se fbp e fbc estão sendo capturados

### **Problema: DNS não resolve**

**Soluções:**
1. Aguardar 30 minutos para propagação
2. Verificar registros CNAME com `dig ssgtm.pharos.imob.br`
3. Limpar cache DNS: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

### **Problema: Conversões duplicadas**

**Soluções:**
1. Verificar se `event_id` está sendo enviado
2. Usar mesmo `event_id` em client-side e server-side
3. Meta deduplica automaticamente por event_id + event_time (24h)

---

## 📚 Recursos Adicionais

- [Documentação oficial SSGTM](https://developers.google.com/tag-platform/tag-manager/server-side)
- [Meta Conversions API Docs](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Google Ads Enhanced Conversions](https://support.google.com/google-ads/answer/11062876)
- [Consent Mode v2 Guide](https://support.google.com/tagmanager/answer/10718549)

---

## 🎉 Conclusão

Após concluir este guia, você terá:

✅ Sistema SSGTM completo e funcional
✅ Tracking avançado de conversões
✅ Enhanced Conversions no Meta e Google
✅ LGPD compliant com Consent Mode v2
✅ Match rates superiores a 90%
✅ Attribution precisa de campanhas

**Próximos passos:**
1. Monitorar métricas por 7-14 dias
2. Ajustar valores de conversão se necessário
3. Expandir para TikTok Ads, LinkedIn Ads
4. Implementar remarketing avançado

---

**Última atualização**: 11/12/2024
**Versão**: 1.0.0
**Autor**: Sistema de Tracking Avançado - Pharos Imobiliária

