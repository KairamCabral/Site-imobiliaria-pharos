# 📊 Sistema de Tracking Avançado - Pharos Imobiliária

## 🎯 Visão Geral

Sistema completo de rastreamento de conversões com **Server-Side Google Tag Manager (SSGTM)**, **Meta Conversion API**, e **Google Ads Enhanced Conversions** implementado no site da Pharos Imobiliária.

### **Características Principais**

- ✅ **Enhanced Conversions** com SHA-256 hashing
- ✅ **Consent Mode v2** (LGPD/GDPR compliant)
- ✅ **Client Hints API** para dados aprimorados
- ✅ **Deduplicação** via event_id único
- ✅ **Multi-platform**: Meta, Google, GA4
- ✅ **Server-Side tracking** para bypass de adblockers
- ✅ **Rastreamento do funil completo** imobiliário

---

## 📁 Estrutura de Arquivos

```
src/
├── types/
│   └── tracking.ts                    # Types e interfaces
├── lib/
│   └── analytics/
│       └── advanced-tracking.ts       # Biblioteca principal de tracking
├── hooks/
│   └── useTracking.ts                 # Hook personalizado
├── components/
│   ├── GTMScript.tsx                  # Google Tag Manager + Consent Mode
│   ├── ConsentBanner.tsx              # Banner de consentimento LGPD
│   ├── LeadCaptureCard.tsx            # Card de lead (com tracking)
│   └── ...
├── app/
│   ├── api/
│   │   └── tracking/
│   │       └── event/
│   │           └── route.ts           # API endpoint para eventos
│   ├── imoveis/
│   │   └── [id]/
│   │       └── PropertyClient.tsx     # Página de imóvel (com tracking)
│   └── layout.tsx                     # Layout global (GTM injetado)
```

---

## 🚀 Eventos Rastreados

### **1. Funil de Conversão Imobiliário**

| Evento | Nome Técnico | Momento | Valor |
|--------|--------------|---------|-------|
| Visualização de Imóvel | `view_item` | Ao abrir página do imóvel | 0 |
| Visualização de Galeria | `property_gallery_view` | Ao abrir galeria de fotos | 0 |
| Adicionar aos Favoritos | `add_to_wishlist` | Ao favoritar imóvel | Preço |
| Início de Contato | `begin_checkout` | Ao visualizar formulário | Preço |
| Preenchimento Iniciado | `add_payment_info` | Ao digitar 1º caractere | Preço |
| **Lead Gerado** | `generate_lead` | Ao enviar formulário | **R$ 100** |
| **Visita Agendada** | `purchase` | Ao agendar visita | **R$ 500** |

### **2. Engajamento**

- `share` - Compartilhamento de imóvel
- `property_compare` - Comparação de imóveis
- `video_view` - Visualização de vídeo
- `map_interaction` - Interação com mapa

### **3. Remarketing**

- `search` - Busca realizada
- `filter_change` - Aplicação de filtros
- `contact_whatsapp` - Clique em WhatsApp
- `contact_phone` - Clique em telefone

---

## 💻 Como Usar

### **1. Tracking de Visualização de Imóvel**

```typescript
import { useTracking } from '@/hooks/useTracking';

export default function PropertyPage({ property }) {
  const { trackPropertyView } = useTracking();
  
  useEffect(() => {
    trackPropertyView({
      id: property.id,
      code: property.code,
      title: property.title,
      price: property.price,
      bedrooms: property.bedrooms,
      area: property.area,
      type: property.type,
      city: property.city,
      state: property.state,
      realtor: property.realtor,
    });
  }, [property]);
  
  return (
    // JSX
  );
}
```

### **2. Tracking de Lead (Conversão)**

```typescript
import { useTracking } from '@/hooks/useTracking';

export default function LeadForm({ property }) {
  const { trackLead } = useTracking();
  
  const handleSubmit = async (formData) => {
    const result = await submitLead(formData);
    
    if (result.success) {
      trackLead(
        property,
        {
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' '),
          phone: formData.phone,
          email: formData.email,
        },
        result.leadId,
        100 // Valor do lead em R$
      );
    }
  };
  
  return (
    // JSX
  );
}
```

### **3. Tracking de Compartilhamento**

```typescript
const { trackPropertyShare } = useTracking();

const handleShare = () => {
  trackPropertyShare(property, 'whatsapp');
};
```

### **4. Tracking de Busca**

```typescript
const { trackSearch } = useTracking();

const handleSearch = (term, filters, resultsCount) => {
  trackSearch(term, filters, resultsCount);
};
```

---

## 🔐 Enhanced Conversions (Dados Hasheados)

### **Campos Suportados**

Todos os dados sensíveis são **automaticamente hasheados** com SHA-256 antes de serem enviados:

```typescript
{
  em: 'hashed_email',           // Email
  ph: 'hashed_phone',           // Telefone (formato E.164)
  fn: 'hashed_first_name',      // Primeiro nome
  ln: 'hashed_last_name',       // Sobrenome
  ct: 'hashed_city',            // Cidade
  st: 'hashed_state',           // Estado
  zp: 'hashed_zipcode',         // CEP
  country: 'hashed_country'     // País
}
```

### **Processo de Hash**

```typescript
// Exemplo: email "joao@exemplo.com"
// 1. Normalização: "joao@exemplo.com" → "joao@exemplo.com" (trim + lowercase)
// 2. SHA-256 Hash: → "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514"
```

---

## 🍪 Consent Mode v2

### **Estados de Consentimento**

| Tipo | Descrição | Padrão | Necessário para |
|------|-----------|--------|-----------------|
| `analytics_storage` | Cookies analíticos | ❌ Denied | Google Analytics |
| `ad_storage` | Cookies de publicidade | ❌ Denied | Meta Pixel, Google Ads |
| `ad_user_data` | Dados de usuário para ads | ❌ Denied | Enhanced Conversions |
| `ad_personalization` | Personalização de ads | ❌ Denied | Remarketing |
| `functionality_storage` | Cookies funcionais | ✅ Granted | Site básico |
| `security_storage` | Cookies de segurança | ✅ Granted | CSRF, autenticação |

### **Como Atualizar Consentimento**

```typescript
import { useConsentMode } from '@/components/GTMScript';

export default function CookieSettings() {
  const { updateConsent, acceptAll, rejectAll } = useConsentMode();
  
  const handleAcceptAll = () => {
    acceptAll(); // Aceita todos os cookies
  };
  
  const handleCustom = () => {
    updateConsent(
      true,  // analytics
      true,  // advertising
      false  // personalization
    );
  };
  
  return (
    // JSX
  );
}
```

---

## 🔄 Fluxo de Dados

### **Frontend → Backend → Plataformas**

```
1. Usuário gera lead
     ↓
2. useTracking.trackLead() é chamado
     ↓
3. AdvancedTracking.track() processa:
   - Hash de dados sensíveis (SHA-256)
   - Captura Client Hints
   - Captura UTMs, fbp, fbc, gclid
   - Gera event_id único
     ↓
4. Envia para dataLayer (GTM Web)
     ↓
5. GTM Web → SSGTM (Server Container)
     ↓
6. SSGTM distribui para:
   - Meta Conversion API (CAPI)
   - Google Ads API
   - GA4 Measurement Protocol
     ↓
7. API Route /api/tracking/event (backup direto):
   - Enriquece com IP, User-Agent
   - Envia diretamente para Meta CAPI
   - Envia para GA4 Measurement Protocol
```

---

## 🎯 Mapeamento de Eventos

### **Frontend → Meta Ads**

| Evento Frontend | Meta Event Name | Event Type |
|-----------------|-----------------|------------|
| `view_item` | `ViewContent` | Standard |
| `add_to_wishlist` | `AddToWishlist` | Standard |
| `begin_checkout` | `InitiateCheckout` | Standard |
| `generate_lead` | `Lead` | Standard |
| `purchase` | `Purchase` | Standard |

### **Frontend → Google Ads**

| Evento Frontend | Google Conversion | Categoria |
|-----------------|-------------------|-----------|
| `generate_lead` | Lead | Submit form |
| `purchase` | Schedule Visit | Appointment |

---

## 📊 Monitoramento e Debug

### **Modo Desenvolvimento**

Todos os eventos são logados no console:

```javascript
// DevTools Console
📊 [Tracking Event] generate_lead
{
  event: "generate_lead",
  event_id: "evt_abc123_1234567890",
  user_data: { em: "hashed...", ph: "hashed..." },
  ecommerce: { ... },
  fbp: "fb.1.1234567890.987654321",
  gclid: "abc123def456",
  ...
}
```

### **Health Check da API**

```bash
curl http://localhost:3700/api/tracking/event
```

Resposta:
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

### **Validação Meta Events Manager**

1. Acesse [Meta Events Manager](https://business.facebook.com/events_manager2/)
2. Vá em **Teste de eventos**
3. Aguarde 30-60 segundos após conversão
4. Valide:
   - ✅ Event ID presente
   - ✅ Match quality ≥ 7.0 (Bom)
   - ✅ fbp e fbc presentes
   - ✅ User data hasheado

---

## 🔧 Variáveis de Ambiente

```bash
# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# SSGTM
SSGTM_ENDPOINT_URL=https://ssgtm.pharos.imob.br

# Meta Ads
META_PIXEL_ID=1234567890123456
META_CONVERSION_API_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Analytics 4
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_ANALYTICS_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Google Ads (opcional)
GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXXX
GOOGLE_ADS_CONVERSION_LABEL=abc123DEF456
```

---

## 📈 Métricas de Sucesso

### **KPIs Principais**

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Event Match Quality** | ≥ 7.0 | Meta Events Manager |
| **Server Match Rate** | ≥ 90% | Meta Events Manager → Server Events |
| **Conversões atribuídas** | +30% | Google Ads / Meta Ads Reports |
| **Cross-device conversions** | +20% | Google Ads → Conversões (com SSGTM) |
| **ROAS** | +15% | Meta Ads / Google Ads (após 14 dias) |

### **Antes vs Depois SSGTM**

| Métrica | Antes (Client-Side) | Depois (SSGTM) |
|---------|---------------------|----------------|
| Match Rate | 60-70% | 85-95% |
| iOS Tracking | 40-50% | 80-90% |
| Deduplicação | Manual | Automática |
| LGPD Compliance | Parcial | Completa |
| Adblocker bypass | ❌ Não | ✅ Sim |

---

## 🆘 Troubleshooting

### **Problema: Eventos não aparecem no Meta**

**Diagnóstico:**
1. Verificar console do navegador por erros
2. Verificar `META_PIXEL_ID` e `META_CONVERSION_API_TOKEN`
3. Testar API diretamente:

```bash
curl -X POST https://ssgtm.pharos.imob.br \
  -H "Content-Type: application/json" \
  -d '{"event":"test","event_id":"test_123"}'
```

### **Problema: Match Quality baixo**

**Soluções:**
1. Verificar hash SHA-256: deve estar em minúsculas, sem espaços
2. Telefone no formato E.164: `+5511999999999`
3. Email válido e normalizado
4. Adicionar mais campos (fn, ln, ct, st)

### **Problema: Conversões duplicadas**

**Soluções:**
1. Verificar se `event_id` está único por evento
2. Mesmo `event_id` em client e server
3. Meta deduplica automaticamente se event_id + event_time < 24h

---

## 🎓 Próximos Passos

### **Fase 2: Expansão**

- [ ] Adicionar TikTok Pixel + Events API
- [ ] Adicionar LinkedIn Insight Tag
- [ ] Implementar Google Analytics 4 E-commerce completo
- [ ] Criar dashboards customizados (Looker Studio)

### **Fase 3: Otimização**

- [ ] A/B test de valores de conversão
- [ ] Implementar Offline Conversions (vendas fechadas)
- [ ] Machine Learning para lead scoring
- [ ] Predictive audiences

---

## 📚 Recursos

- [Guia de Setup SSGTM](./SSGTM-SETUP-GUIDE.md)
- [Variáveis de Ambiente](./ENV-VARIABLES.md)
- [Meta Conversions API Docs](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Google Enhanced Conversions](https://support.google.com/google-ads/answer/11062876)

---

## 🤝 Suporte

Dúvidas sobre o sistema de tracking? Entre em contato com o time de tecnologia.

**Última atualização**: 11/12/2024
**Versão**: 1.0.0

