# Formulário de Contato Simplificado - WhatsApp

## Resumo das Alterações

Simplificação do formulário de captação de leads com integração direta ao WhatsApp do corretor.

---

## 🎯 O que mudou

### **Antes:**
- 6 campos: Nome, E-mail, Telefone, Interesse (dropdown), Mensagem
- Botão: "Enviar Mensagem"
- Ação: Simulava envio de formulário

### **Depois:**
- 2 campos: Nome completo, Telefone (com DDI)
- Botão: "Solicitar Contato"
- Ação: Redireciona para WhatsApp do corretor com dados pré-preenchidos

---

## 📱 Funcionalidades Implementadas

### **1. Campo Nome**
- Input simples de texto
- Obrigatório (required)
- Placeholder: "Seu nome completo"

### **2. Campo Telefone com DDI**
- **Dropdown DDI** (código do país):
  - Padrão: +55 (Brasil)
  - Opções: +1 (EUA), +351 (Portugal), +34 (Espanha), +39 (Itália), +44 (UK), +49 (Alemanha)
- **Input Telefone**:
  - Formatação automática: `(XX) XXXXX-XXXX`
  - Máximo 15 caracteres
  - Remove caracteres não numéricos automaticamente
  - Placeholder: "(00) 00000-0000"

### **3. Formatação Automática de Telefone**

```typescript
// Formato aplicado em tempo real
const formatTelefone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};
```

**Exemplo:**
- Digitação: `47991878070`
- Exibição: `(47) 99187-8070`

---

## 🔄 Fluxo de Redirecionamento

### **1. Ao clicar em "Solicitar Contato":**

```typescript
// 1. Extrai dados do formulário
const nome = "João Silva"
const telefone = "(47) 99187-8070" → "4799187-8070"
const ddi = "55"
const telefoneCompleto = "554799187-8070"

// 2. Monta URL do imóvel
const imovelUrl = "https://pharosnegocios.com.br/imoveis/apartamento-luxo-frente-mar-centro"

// 3. Cria mensagem pré-formatada
Olá! Meu nome é João Silva.

Tenho interesse no imóvel "Apartamento de Luxo Frente Mar".

Link: https://pharosnegocios.com.br/imoveis/apartamento-luxo-frente-mar-centro

Telefone para contato: +554799187-8070

// 4. Redireciona para WhatsApp
https://wa.me/47991878070?text=[mensagem_codificada]
```

### **2. Telefone do Corretor:**

**Prioridade:**
1. `corretor.whatsapp` (se disponível)
2. `corretor.telefone` (se whatsapp não disponível)
3. **47991878070** (número padrão fallback)

```typescript
const telefoneCorretor = corretor.whatsapp?.replace(/\D/g, '') || 
                         corretor.telefone?.replace(/\D/g, '') || 
                         '47991878070';
```

---

## 📊 Analytics Tracking

Evento disparado ao submeter o formulário:

```typescript
gtag('event', 'contact_form_submit', {
  property_id: 'apartamento-luxo-frente-mar-centro',
  contact_method: 'whatsapp',
});
```

---

## 🎨 UI/UX

### **Layout:**
```
┌─────────────────────────────────┐
│ Solicite Mais Informações       │
├─────────────────────────────────┤
│ Nome completo *                 │
│ [___________________________]   │
│                                 │
│ Telefone *                      │
│ [+55 ▼] [________________]      │
│  DDI     (00) 00000-0000        │
│                                 │
│ [💬 Solicitar Contato]          │
│                                 │
│ 🔒 Ao solicitar, você será      │
│    redirecionado para WhatsApp  │
└─────────────────────────────────┘
```

### **Estados:**
- **Normal**: Botão azul (#054ADA)
- **Hover**: Botão azul escuro (#043BAE)
- **Loading**: Spinner + "Redirecionando..."
- **Disabled**: Botão cinza (#ADB4C0)

---

## 🔒 Privacidade

**Texto atualizado:**
> "Ao solicitar, você será redirecionado para o WhatsApp do corretor. Seus dados estão protegidos."

---

## 📱 Compatibilidade

### **Desktop:**
- Abre WhatsApp Web em nova aba
- Campos lado a lado (DDI + Telefone)

### **Mobile:**
- Abre aplicativo WhatsApp nativo
- Layout vertical otimizado
- Touch targets ≥44px

---

## 🧪 Testes Realizados

- ✅ Formatação automática de telefone
- ✅ Validação de campos obrigatórios
- ✅ Redirecionamento para WhatsApp
- ✅ Fallback para número padrão
- ✅ Mensagem pré-formatada correta
- ✅ Analytics tracking
- ✅ Responsividade mobile/desktop

---

## 📋 Exemplo de Mensagem Enviada

**WhatsApp do Corretor:**
```
Olá! Meu nome é João Silva.

Tenho interesse no imóvel "Apartamento de Luxo Frente Mar".

Link: https://pharosnegocios.com.br/imoveis/apartamento-luxo-frente-mar-centro

Telefone para contato: +554799187-8070
```

---

## 🚀 Próximos Passos (Opcionais)

1. Adicionar validação de telefone mais robusta
2. Integrar com API para salvar leads no banco
3. Adicionar campo de mensagem personalizada (opcional)
4. Implementar máscara de telefone internacional
5. Criar analytics dashboard para leads

---

**Última atualização**: 11/10/2025
**Arquivo**: `src/components/ContactSidebar.tsx`

