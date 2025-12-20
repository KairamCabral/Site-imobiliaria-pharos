# Refatoração do Card de Captação de Lead 🚀

## Resumo das Melhorias

Card de lead completamente refatorado com integração Vista CRM, DDI selector internacional e técnicas avançadas de conversão.

---

## ✅ Mudanças Implementadas

### 1. **PhoneInput.tsx** (NOVO)
Componente internacional de telefone com:

- ✅ **DDI Selector** com dropdown pesquisável
- ✅ **Países suportados**: Brasil, EUA, Portugal, Espanha, Argentina
- ✅ **Máscaras dinâmicas** por país
- ✅ **Validação robusta** (especial para BR: DDD + 9 dígitos iniciando em 9)
- ✅ **Output E.164** (`+5547999990000`)
- ✅ **Detecção inteligente** ao colar número com DDI
- ✅ **inputMode="tel"** e `autocomplete`
- ✅ **Feedback visual** de erro com mensagens claras
- ✅ **Acessibilidade AA**: ARIA, labels, foco visível

**Exemplo de uso:**
```tsx
<PhoneInput
  value={phoneE164}
  onChange={(e164, formatted, ddi) => { ... }}
  onValidation={(isValid, error) => { ... }}
  placeholder="Seu WhatsApp"
  required
/>
```

---

### 2. **LeadCaptureCard.tsx** (REFATORADO)

#### Copy Atualizada
- ❌ **Removido**: "3 pessoas estão vendo" (prova social removida)
- ✅ **Novo**: "Resposta em *menos de 15 minutos*" (itálico em destaque)
- ✅ Título: "Tire suas dúvidas agora"
- ✅ Trust badges: "✅ Dados protegidos • ⚡ Resposta rápida"

#### Integração Vista CRM
```typescript
interface Realtor {
  id?: string;
  name: string;
  photo?: string;      // URL da foto do corretor
  whatsapp?: string;
  creci?: string;
  online?: boolean;    // Status online
}
```

- ✅ **Foto real do corretor** quando disponível
- ✅ **Fallback**: Avatar com iniciais da "Equipe Pharos"
- ✅ **Badge "Online"** com ponto verde
- ✅ **CRECI** exibido abaixo do nome

#### Idempotência & Payload
- ✅ **Hash SHA-256** do payload (`nome + phoneE164 + propertyId`)
- ✅ **Payload completo** enviado ao Vista:
  ```typescript
  {
    name, phone, phoneFormatted, phoneDDI,
    propertyId, propertyCode, propertyTitle,
    realtorId, realtorName,
    source: 'site',
    page: window.location.href,
    utms: { source, medium, campaign, term, content },
    idempotencyKey,
    timestamp
  }
  ```

#### Estados
- ✅ **Loading**: Spinner no botão + campos desabilitados
- ✅ **Success**: Tela de confirmação com ícone verde + mensagem
- ✅ **Error**: Toast + tracking + TODO fallback Slack/Email

#### Telemetria Completa
Eventos implementados:
```typescript
- lead_card_impression      // Ao carregar
- lead_phone_input          // Ao digitar telefone
- lead_phone_ddi_changed    // Ao trocar DDI
- lead_submit_attempt       // Ao tentar enviar
- lead_submit_success       // Sucesso
- lead_submit_error         // Erro
// - whatsapp_deeplink_opened (comentado, pronto para ativar)
```

Todos com payload:
```typescript
{
  property_id, property_code,
  realtor_id, realtor_name,
  ddi, lead_id,
  idempotency_key, error, reason
}
```

#### UX & Acessibilidade
- ✅ **Focus rings visíveis** em todos inputs
- ✅ **ARIA labels** em avatares, badges, ícones
- ✅ **role="status"** e `aria-live="polite"` no success
- ✅ **Labels visíveis** com `.sr-only` para acessibilidade
- ✅ **Disabled states** claros
- ✅ **Success state** substitui o form (sem desaparecer imediatamente)

#### Mobile vs Desktop
**Desktop (Sticky):**
- Card completo com header do corretor
- Form vertical (Nome acima, Phone abaixo)
- `sticky top-[100px]` - acompanha scroll perfeitamente
- Trust badges no rodapé

**Mobile (Bottom Dock):**
- Header compacto com avatar + nome + "15min"
- Form otimizado (Nome + Phone em sequência)
- Success state compacto
- `fixed bottom-0` com `safe-area-inset-bottom`

---

## 🎨 Paleta & Estilos

Mantém consistência com **Paleta Pharos**:
- Navy 900 (títulos)
- Slate 50/100/200 (backgrounds/borders)
- Blue 500/600 (CTAs, links)
- Green 500 (online, sucesso)
- Error #C53A3A (erros)

**Cantos:** `rounded-lg` (8px) / `rounded-xl` (12px) / `rounded-2xl` (16px)  
**Sombras:** `0 4px 20px rgba(0,0,0,0.08)` → `0 8px 32px rgba(0,0,0,0.12)` (hover)

---

## 📊 Validação de Telefone

### Brasil (+55)
```
- DDD: 11-99 (2 dígitos)
- Número: 9XXXX-XXXX (9 dígitos, começa com 9)
- Formato: (11) 99999-9999
- E.164: +5511999990000
```

### EUA (+1)
```
- Formato: (415) 555-0137
- E.164: +14155550137
```

### Portugal (+351)
```
- Formato: 912 345 678
- E.164: +351912345678
```

**Regras:**
- BR: valida DDD (11-99) + primeiro dígito = 9
- Outros: mínimo 8 dígitos após DDI
- Erros amigáveis: "Digite um número válido para Brasil"

---

## 🚀 Como Usar

### No `page.tsx` do imóvel:

```tsx
<LeadCaptureCard
  propertyId={property.id}
  propertyCode={property.code}
  propertyTitle={property.title}
  realtor={{
    id: property.realtor?.id,
    name: property.realtor?.name || 'Equipe Pharos',
    photo: property.realtor?.photo,
    creci: property.realtor?.creci,
    whatsapp: property.realtor?.whatsapp,
    online: true,
  }}
/>
```

### Dados do Corretor (Vista CRM)

Atualmente usando fallback. Para integrar com Vista:

```typescript
// TODO: Implementar no VistaProvider
interface VistaResponsavel {
  id: string;
  nome: string;
  creci: string;
  avatarUrl?: string;
  whatsapp?: string;
  email?: string;
  online?: boolean;
}

// Método a criar:
async getResponsavelPorImovel(imovelId: string): Promise<VistaResponsavel>
```

---

## 📋 Checklist de Entrega

✅ **PhoneInput.tsx criado** com DDI selector  
✅ **Máscaras dinâmicas** (BR, US, PT, ES, AR)  
✅ **Validação robusta** BR (DDD + 9 dígitos)  
✅ **Output E.164** (`+5547999990000`)  
✅ **Copy atualizada**: "Resposta em *menos de 15 minutos*"  
✅ **Removido**: "3 pessoas estão vendo"  
✅ **Idempotência** via SHA-256 hash  
✅ **Payload completo** para Vista  
✅ **Telemetria**: 6 eventos implementados  
✅ **Success state** com confirmação visual  
✅ **Acessibilidade AA**: ARIA, foco, labels  
✅ **Desktop sticky** + **Mobile bottom dock**  
✅ **Trust badges** no rodapé  
✅ **Foto real do corretor** quando disponível  
✅ **Fallback**: Avatar com iniciais  

---

## 🔮 Próximos Passos (Opcional)

### 1. Integração Vista - Corretor Responsável
```typescript
// src/providers/vista/VistaProvider.ts
async getResponsavelPorImovel(imovelId: string) {
  // Buscar responsável no Vista
  // Retornar: id, nome, creci, avatarUrl, whatsapp, online
}
```

### 2. Fallback Secondary Channel
Descomentar no `handleSubmit`:
```typescript
if (error.status >= 500 || error.code === 'TIMEOUT') {
  await sendToSlackWebhook(payload);
  // ou await sendToEmailService(payload);
}
```

### 3. WhatsApp Deeplink (A/B Test)
Descomentar seção no `handleSubmit` (linha 181):
```typescript
if (realtor?.whatsapp && ENABLE_WHATSAPP_DEEPLINK) {
  const message = `Olá, tenho interesse no imóvel...`;
  window.open(`https://wa.me/${realtor.whatsapp}?text=...`, '_blank');
}
```

### 4. Mais Países
Adicionar em `PhoneInput.tsx` → `COUNTRIES[]`:
```typescript
{ code: 'MX', name: 'México', ddi: '+52', ... }
{ code: 'CL', name: 'Chile', ddi: '+56', ... }
```

---

## 📸 Visual

**Desktop:**
```
┌───────────────────────────────┐
│ 👤 Equipe Pharos         🟢   │
│    CRECI-SC                   │
├───────────────────────────────┤
│ Tire suas dúvidas agora       │
│ Resposta em menos de 15 min   │
│                               │
│ [ Seu nome                  ] │
│ [ +55 ] [ (11) 99999-9999  ] │
│ [ 🟦 Falar com Equipe       ] │
│                               │
│ ✅ Dados • ⚡ Resposta         │
└───────────────────────────────┘
```

**Mobile (Bottom Dock):**
```
┌───────────────────────────────┐
│ 👤 Equipe • 15min             │
├───────────────────────────────┤
│ [ Nome                      ] │
│ [ +55 ] [ WhatsApp          ] │
│ [ 🟦 Falar com Equipe       ] │
└───────────────────────────────┘
```

---

## 🎯 KPIs a Monitorar

No Google Analytics / Dashboard:

1. **Impressões** (`lead_card_impression`)
2. **Tentativas** (`lead_submit_attempt`)
3. **Conversões** (`lead_submit_success`)
4. **Taxa de erro** (`lead_submit_error / attempt`)
5. **DDIs mais usados** (`lead_phone_ddi_changed`)
6. **Tempo médio até submit**
7. **Diferença Desktop vs Mobile**

**Meta**: Conversão > 8-12% (benchmark imobiliário)

---

## 🐛 Debug

Ver eventos no console:
```javascript
// Chrome DevTools > Console
gtag('config', 'GA_MEASUREMENT_ID', {
  debug_mode: true
});
```

Ver payload enviado ao Vista:
```javascript
// Procurar no console por:
[LeadCaptureCard] Payload: { ... }
```

---

## ✨ Diferenciais vs Versão Anterior

| Antes | Depois |
|-------|--------|
| Máscara BR fixa | DDI selector + máscaras dinâmicas |
| `phone.replace(/\D/g, '')` | E.164 validado (`+5547999990000`) |
| "5 minutos" | "**menos de 15 minutos**" (italic) |
| "3 pessoas vendo" | ❌ Removido |
| Avatar genérico | Foto real do corretor (Vista) |
| Sem idempotência | SHA-256 hash |
| 2 eventos | 6 eventos de telemetria |
| Form desaparece | Success state permanece |

---

**Versão:** 2.0  
**Data:** 18/10/2025  
**Autor:** Cursor AI + Pharos Team  
**Status:** ✅ Pronto para produção (pending Vista integration)

