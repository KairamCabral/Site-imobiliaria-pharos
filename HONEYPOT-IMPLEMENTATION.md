# 🍯 GUIA: Implementar Honeypot Fields

## O que é Honeypot?

Honeypot é um campo **invisível para humanos** mas **visível para bots**. Quando preenchido, indica que a submissão é de um bot.

## Como Funciona

1. **Campo oculto** é adicionado ao formulário
2. **Humanos não veem** (CSS: position absolute, left: -5000px)
3. **Bots preenchem** automaticamente (leem HTML)
4. **Servidor detecta** e rejeita silenciosamente

---

## IMPLEMENTAÇÃO

### Passo 1: Adicionar Campo ao Formulário

**Exemplo para qualquer formulário React:**

```tsx
export function MeuFormulario() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // ... outros campos
    
    // ✅ HONEYPOT (não mostrar na UI)
    website: '', // bots preenchem este campo
  });
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos visíveis normais */}
      <input 
        type="text"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      {/* ... outros campos ... */}
      
      {/* ✅ HONEYPOT FIELD (invisível) */}
      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={(e) => setFormData({...formData, website: e.target.value})}
        autoComplete="off"
        tabIndex={-1}
        style={{
          position: 'absolute',
          left: '-5000px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      />
      
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### Passo 2: Enviar ao Servidor

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Incluir honeypot no body
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      // ... outros campos
      website: formData.website, // ✅ HONEYPOT
    }),
  });
  
  // ... processar resposta
};
```

### Passo 3: Validação Server-Side (JÁ IMPLEMENTADA)

A validação já está implementada em:
- `/api/leads/route.ts`
- `/api/schedule-visit/route.ts`

```typescript
// Código já presente nas APIs:
if (body.website || body.company) {
  logger.security('Honeypot triggered', { ip, userAgent });
  // Finge sucesso para não alertar bot
  return NextResponse.json({ success: true, leadId: 'fake' }, { status: 200 });
}
```

---

## FORMULÁRIOS QUE PRECISAM DE HONEYPOT

### ✅ 1. LeadCaptureCard (src/components/LeadCaptureCard.tsx)

```tsx
// Adicionar ao estado:
const [formData, setFormData] = useState({
  // ... campos existentes
  website: '', // ✅ HONEYPOT
});

// Adicionar ao JSX (antes do botão submit):
<input
  type="text"
  name="website"
  value={formData.website}
  onChange={(e) => setFormData({...formData, website: e.target.value})}
  autoComplete="off"
  tabIndex={-1}
  style={{
    position: 'absolute',
    left: '-5000px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  }}
  aria-hidden="true"
/>

// Adicionar ao body da requisição:
const response = await fetch('/api/leads', {
  method: 'POST',
  body: JSON.stringify({
    // ... campos existentes
    website: formData.website, // ✅
  }),
});
```

### ✅ 2. LeadWizardModal (src/components/LeadWizardModal.tsx)

```tsx
// Similar ao exemplo acima
// Adicionar campo honeypot antes do botão "Finalizar"
```

### ✅ 3. ScheduleVisitModal (src/components/ScheduleVisitModal.tsx)

```tsx
// Adicionar honeypot com nome "website" ou "company"
```

### ✅ 4. ContactForm (src/components/ContactForm.tsx)

```tsx
// Adicionar honeypot na etapa final
```

### ✅ 5. AgendarVisita (src/components/AgendarVisita.tsx)

```tsx
// Adicionar honeypot antes do submit
```

---

## BOAS PRÁTICAS

### ✅ Fazer:

- Usar nomes "naturais" como `website`, `company`, `url`
- Esconder com CSS (não `display: none`, use `position: absolute`)
- Adicionar `autoComplete="off"`
- Adicionar `tabIndex={-1}`
- Adicionar `aria-hidden="true"`
- Não adicionar labels visíveis

### ❌ Evitar:

- Nomes óbvios como `honeypot`, `trap`, `fake`
- `display: none` (alguns bots detectam)
- `visibility: hidden` (alguns bots detectam)
- Deixar campo obrigatório (required)

---

## TESTE

### Testar se está funcionando:

1. **Teste Manual (dev):**
   - Abrir DevTools → Console
   - Preencher o campo honeypot manualmente:
   ```javascript
   document.querySelector('input[name="website"]').value = 'test';
   ```
   - Submeter formulário
   - Deve retornar sucesso falso mas log de segurança

2. **Teste Automatizado:**
   ```bash
   curl -X POST http://localhost:3700/api/leads \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","website":"bot-filled-this"}'
   ```
   
   Esperado: `{ "success": true, "leadId": "fake" }`

3. **Verificar logs:**
   ```bash
   # Deve aparecer:
   [WARN] [SECURITY] Honeypot triggered
   ```

---

## CAMPOS HONEYPOT DISPONÍVEIS

O servidor valida os seguintes campos (escolha um ou mais):

- `website` ✅ (recomendado)
- `company` ✅ (recomendado)

Para adicionar mais, edite:
- `src/lib/validators.ts` (adicionar ao schema)
- `src/app/api/leads/route.ts` (adicionar à verificação)
- `src/app/api/schedule-visit/route.ts` (adicionar à verificação)

---

## EXEMPLO COMPLETO

```tsx
'use client';

import { useState } from 'react';

export function FormularioSeguro() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '', // 🍯 HONEYPOT
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Lead criado com sucesso!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nome"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Telefone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />
      
      <textarea
        placeholder="Mensagem"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
      />
      
      {/* 🍯 HONEYPOT - Invisível para humanos */}
      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={(e) => setFormData({...formData, website: e.target.value})}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-5000px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      />
      
      <button type="submit">Enviar</button>
    </form>
  );
}
```

---

## ESTATÍSTICAS ESPERADAS

Após implementação, espere:
- ✅ **70-90% redução** em spam de bots simples
- ✅ **Sem impacto** na experiência de usuários reais
- ✅ **Logs de segurança** com IPs de bots bloqueados

Combine com **Turnstile** para **98%+ de proteção**!

---

**Última atualização:** 11 de Dezembro de 2025  
**Versão:** 1.0.0

