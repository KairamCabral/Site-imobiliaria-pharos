# 📅 Agendamento de Visitas - Pharos

## Visão Geral

Sistema completo de agendamento de visitas (presenciais ou por vídeo) com design premium, acessibilidade AA/AAA e integração com calendários.

---

## ✨ Funcionalidades Principais

### 1. **Tipos de Visita**
- ✅ **Visita Presencial**: Agendamento no imóvel
- ✅ **Visita por Vídeo**: Escolha entre WhatsApp ou Google Meet
- ✅ Segmented control com ícones e estados visuais claros

### 2. **Seletor de Data**
- ✅ Carrossel horizontal navegável (7-14 dias)
- ✅ Navegação por setas e scroll
- ✅ Indicador "HOJE" para data atual
- ✅ Estados: normal, selecionado (glow azul), desabilitado
- ✅ Navegação por teclado (←/→)

### 3. **Seletor de Horário**
- ✅ Grade de chips com slots disponíveis
- ✅ Indicação de fuso horário (Brasília GMT-3)
- ✅ Fallback: "Ver dias seguintes" + "Falar no WhatsApp"

### 4. **Formulário de Contato**
- ✅ Campos: Nome, WhatsApp, E-mail, Observações (opcional)
- ✅ Validação em tempo real
- ✅ Checkbox LGPD obrigatório
- ✅ Pré-preenchimento para usuários logados

### 5. **Confirmação de Sucesso**
- ✅ Modal elegante com resumo completo
- ✅ Botões: Adicionar ao Google Calendar, Baixar .ics
- ✅ Links: Remarcar e Cancelar
- ✅ Confirmação por e-mail e WhatsApp

---

## 🎨 Design System

### Paleta de Cores
```typescript
// Seguindo tokens Pharos
--ph-navy-900: #192233    // Títulos
--ph-blue-500: #054ADA    // Ação primária, seleções
--ph-slate-700: #2C3444   // Texto principal
--ph-slate-500: #585E6B   // Texto secundário
--ph-slate-300: #ADB4C0   // Bordas
--ph-offwhite: #F7F9FC    // Fundo da seção
--ph-white: #FFFFFF       // Cards
```

### Raios e Sombras
```css
/* Cards principais */
border-radius: 20-24px;
box-shadow: 0 6px 20px rgba(25,34,51,0.08);

/* Chips de seleção */
border-radius: 12-14px;

/* Hover em cards */
box-shadow: 0 10px 28px rgba(25,34,51,0.12);
```

---

## 📱 Responsividade

### Desktop (≥1024px)
```
┌────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────────┐ │
│  │ Informações │  │ Card Agendamento│ │
│  │ Título      │  │ • Tipo visita   │ │
│  │ Subtítulo   │  │ • Data          │ │
│  │ Benefícios  │  │ • Horário       │ │
│  │             │  │ • Formulário    │ │
│  └─────────────┘  └─────────────────┘ │
└────────────────────────────────────────┘
```

### Mobile/Tablet
```
┌────────────────────────────┐
│  ┌────────────────────────┐│
│  │ Card Agendamento       ││
│  │ (primeiro)             ││
│  └────────────────────────┘│
│  ┌────────────────────────┐│
│  │ Informações            ││
│  │ (embaixo)              ││
│  └────────────────────────┘│
└────────────────────────────┘
```

---

## 🚀 Uso

### Integração na Página do Imóvel

```tsx
import AgendarVisita from '@/components/AgendarVisita';

export default function ImovelPage({ imovel }) {
  return (
    <div>
      {/* Cabeçalho, galeria, informações principais */}
      
      {/* Seção de Agendamento */}
      <AgendarVisita
        propertyId={imovel.id}
        propertyTitle={imovel.titulo}
        propertyAddress={`${imovel.endereco.rua}, ${imovel.endereco.numero} - ${imovel.endereco.bairro}, ${imovel.endereco.cidade}`}
      />
      
      {/* Imóveis similares */}
    </div>
  );
}
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `propertyId` | `string` | ID único do imóvel |
| `propertyTitle` | `string` | Título do imóvel |
| `propertyAddress` | `string` | Endereço completo |

---

## 🔌 API Integration

### GET /availability
Retorna disponibilidade de horários.

**Endpoint:**
```
GET /api/properties/{propertyId}/availability
```

**Response:**
```json
{
  "dates": [
    {
      "date": "2024-10-15",
      "slots": ["09:00", "10:30", "14:00", "15:30", "17:00"]
    }
  ],
  "timezone": "America/Sao_Paulo"
}
```

### POST /appointments
Cria novo agendamento.

**Endpoint:**
```
POST /api/appointments
```

**Payload:**
```json
{
  "propertyId": "imovel-001",
  "type": "in_person",
  "videoProvider": "whatsapp",
  "date": "2024-10-15",
  "time": "14:00",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "+5547999999999",
  "notes": "Quero ver a área externa",
  "tz": "America/Sao_Paulo",
  "consent": true
}
```

**Response:**
```json
{
  "appointmentId": "appt_1234567890",
  "icsUrl": "https://api.pharos.com.br/appointments/appt_1234567890/calendar.ics",
  "googleCalendarLink": "https://calendar.google.com/calendar/render?action=TEMPLATE&...",
  "manageUrl": "https://pharos.com.br/appointments/appt_1234567890/manage"
}
```

---

## 📊 Analytics

### Eventos Rastreados

```typescript
// Abertura
gtag('event', 'visit_open', {
  source: 'property_page',
  property_id: '...'
});

// Seleção de data
gtag('event', 'visit_date_select', {
  date: '2024-10-15'
});

// Seleção de horário
gtag('event', 'visit_time_select', {
  time: '14:00'
});

// Seleção de tipo
gtag('event', 'visit_type_select', {
  type: 'in_person',
  provider: null
});

// Sucesso
gtag('event', 'visit_success', {
  property_id: '...',
  appointment_id: '...',
  type: 'in_person',
  video_provider: null
});

// WhatsApp
gtag('event', 'visit_whatsapp_click', {
  property_id: '...'
});

// Calendar
gtag('event', 'visit_calendar_add', {
  appointment_id: '...'
});

// ICS Download
gtag('event', 'visit_ics_download', {
  appointment_id: '...'
});

// Remarcar
gtag('event', 'visit_reschedule_click', {
  appointment_id: '...'
});

// Cancelar
gtag('event', 'visit_cancel_click', {
  appointment_id: '...'
});
```

---

## ♿ Acessibilidade

### Conformidade WCAG 2.1 AA/AAA

#### ✅ Navegação por Teclado
- Tab: Navegar entre campos
- ←/→: Navegar entre datas no carrossel
- Enter/Space: Selecionar opções
- Escape: Fechar modal

#### ✅ Leitor de Tela
```html
<!-- Exemplo de labels descritivos -->
<button aria-label="Quarta-feira, 15 de outubro">
  <span aria-hidden="true">Qua</span>
  <span aria-hidden="true">15</span>
  <span aria-hidden="true">Out</span>
</button>

<button 
  aria-pressed="true"
  aria-label="Agendar visita presencial para 15/10 às 14h"
>
  Agendar visita
</button>
```

#### ✅ Contraste
- Todos os textos: contraste ≥ 4.5:1 (AA)
- Textos grandes: contraste ≥ 3:1 (AAA)
- Componentes interativos: ≥ 3:1

#### ✅ Áreas de Toque
- Todos os botões: mínimo 44x44px
- Cards de data: 80x88px
- Chips de horário: 44x44px

#### ✅ Focus Visible
```css
focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
```

---

## 🎯 Estados da UI

### 1. Loading (Disponibilidade)
```tsx
<div className="flex items-center justify-center py-8">
  <div className="w-8 h-8 border-4 border-pharos-blue-500 
                  border-t-transparent rounded-full animate-spin" />
</div>
```

### 2. Erro de Rede
```tsx
<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
  <p className="text-sm font-medium text-red-800">
    {error}
  </p>
  <button onClick={() => setError(null)}>Fechar</button>
</div>
```

### 3. Sem Disponibilidade
```tsx
<div className="text-center py-6">
  <p className="text-sm text-pharos-slate-500 mb-4">
    Agenda indisponível no momento
  </p>
  <a href={whatsappLink}>Falar no WhatsApp</a>
</div>
```

### 4. Sem Slots no Dia
```tsx
<div className="text-center py-6 bg-pharos-base-off rounded-lg">
  <p className="text-sm text-pharos-slate-500 mb-3">
    Sem horários disponíveis neste dia
  </p>
  <button onClick={verDiasSeguintes}>Ver dias seguintes</button>
  <span> • </span>
  <a href={whatsappLink}>Falar no WhatsApp</a>
</div>
```

### 5. Submitting
```tsx
<button disabled>
  <div className="w-5 h-5 border-2 border-white 
                  border-t-transparent rounded-full animate-spin" />
  Agendando...
</button>
```

### 6. Sucesso (Modal)
```tsx
<SuccessModal
  appointmentDetails={details}
  visitType="in_person"
  selectedDate={date}
  selectedTime="14:00"
  propertyTitle="..."
  propertyAddress="..."
  onClose={() => setShowSuccessModal(false)}
/>
```

---

## 📝 Cópias (PT-BR)

### Títulos e Descrições
```
H2: "Agende sua visita"
Sub: "Escolha o melhor dia e horário para uma visita presencial 
      ou por videoconferência."
Linha auxiliar: "Você pode cancelar ou remarcar quando quiser."
```

### Labels de Formulário
```
"Seu nome *"
"Seu WhatsApp *"
"Seu e-mail *"
"Observações (opcional)"
"Quer deixar algum detalhe?"
```

### Botões
```
"Agendar visita"
"Falar no WhatsApp"
"Adicionar ao Google Calendar"
"Baixar .ics"
"Remarcar"
"Cancelar"
```

### Mensagens
```
"Horário local – Brasília (GMT-3)"
"Enviamos a confirmação por e-mail e WhatsApp"
"Autorizo contato por WhatsApp e e-mail sobre este imóvel. *"
"Não foi possível carregar os horários disponíveis."
"Agenda indisponível no momento."
"Sem horários disponíveis neste dia"
```

---

## 🧪 Validação de Formulário

### Regras

```typescript
const isFormValid = 
  selectedDate &&               // Data obrigatória
  selectedTime &&               // Horário obrigatório
  name.trim().length >= 3 &&    // Nome mínimo 3 caracteres
  email.includes('@') &&        // E-mail válido
  phone.length >= 10 &&         // Telefone mínimo 10 dígitos
  consent;                      // LGPD obrigatório
```

### Estados do Botão

```typescript
// Disabled
bg-pharos-slate-300 text-pharos-slate-500 cursor-not-allowed

// Enabled
bg-pharos-blue-500 text-white hover:bg-pharos-blue-600

// Loading
<spinner /> + "Agendando..."
```

---

## 📧 Confirmação por E-mail

### Template Sugerido

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Visita Agendada - Pharos</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #192233; padding: 24px; text-align: center;">
    <h1 style="color: #FFFFFF; margin: 0;">PHAROS</h1>
  </div>
  
  <div style="padding: 32px 24px;">
    <h2 style="color: #192233; margin: 0 0 16px;">Visita agendada!</h2>
    <p style="color: #585E6B; margin: 0 0 24px;">
      Sua visita foi confirmada com sucesso.
    </p>
    
    <div style="background: #F7F9FC; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px;"><strong>Data:</strong> Quarta, 15 de outubro às 14:00</p>
      <p style="margin: 0 0 12px;"><strong>Tipo:</strong> Visita presencial</p>
      <p style="margin: 0 0 12px;"><strong>Imóvel:</strong> Apartamento Frente Mar</p>
      <p style="margin: 0;"><strong>Endereço:</strong> Av. Atlântica, 1234 - Centro</p>
    </div>
    
    <p style="color: #585E6B; font-size: 14px;">
      <strong>Ponto de encontro:</strong> Portaria principal do edifício.
    </p>
    
    <div style="margin-top: 32px; text-align: center;">
      <a href="#" style="display: inline-block; background: #054ADA; color: white; 
                         padding: 12px 24px; text-decoration: none; border-radius: 8px;">
        Adicionar ao Calendário
      </a>
    </div>
    
    <p style="color: #ADB4C0; font-size: 12px; margin-top: 32px; text-align: center;">
      <a href="#" style="color: #054ADA;">Remarcar</a> • 
      <a href="#" style="color: #585E6B;">Cancelar</a>
    </p>
  </div>
  
  <div style="background: #F7F9FC; padding: 16px; text-align: center; font-size: 12px; color: #585E6B;">
    <p>Pharos Imobiliária | (47) 3366-0000 | contato@pharos.com.br</p>
  </div>
</body>
</html>
```

---

## 🔧 Customização

### Alterar Período de Disponibilidade

```typescript
// Em loadAvailability()
for (let i = 0; i < 21; i++) { // 3 semanas ao invés de 14 dias
  const date = addDays(new Date(), i);
  // ...
}
```

### Alterar Horários Padrão

```typescript
const defaultSlots = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];
```

### Adicionar Novos Tipos de Visita

```typescript
// Adicionar "Visita Virtual 360°"
<button
  onClick={() => setVisitType('virtual_360')}
  className="..."
>
  <svg>...</svg>
  <span>Virtual 360°</span>
</button>
```

---

## ✅ Checklist de Implementação

- [x] Componente principal criado
- [x] Seletor de data (carrossel)
- [x] Seletor de horário (grid)
- [x] Tipo de visita (presencial/vídeo)
- [x] Formulário de contato com validação
- [x] Checkbox LGPD
- [x] Modal de sucesso
- [x] Integração com Google Calendar
- [x] Download de .ics
- [x] Link para WhatsApp
- [x] Estados de loading/erro
- [x] Acessibilidade AA/AAA
- [x] Navegação por teclado
- [x] Analytics completo
- [x] Responsividade mobile/desktop
- [x] Design system Pharos
- [ ] Integração com API real
- [ ] Template de e-mail
- [ ] SMS de confirmação
- [ ] Deep links (remarcar/cancelar)

---

## 🚧 Próximos Passos

### Fase 2
- [ ] Integrar com calendários do corretor (ocupação real)
- [ ] Sistema de notificações (push)
- [ ] Lembretes automáticos (24h antes, 1h antes)
- [ ] Upload de documentos pré-visita
- [ ] Questionário de qualificação

### Fase 3
- [ ] IA para sugestão de melhores horários
- [ ] Integração com CRM
- [ ] Dashboard de agendamentos para corretores
- [ ] Relatórios de conversão
- [ ] Avaliação pós-visita

---

## 📞 Suporte

Para dúvidas sobre implementação:
- date-fns: https://date-fns.org/
- Google Calendar API: https://developers.google.com/calendar
- iCalendar (.ics): https://icalendar.org/

---

**Desenvolvido com ❤️ para Pharos Imobiliária**

