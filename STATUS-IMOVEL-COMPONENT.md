# Componente StatusImovel - Documentação

## Resumo

Componente visual para exibir o status atual de um imóvel ou empreendimento através de um stepper (indicador de progresso) com 4 etapas: Pré-Lançamento, Lançamento, Em Construção e Pronto para Morar.

---

## 🎯 Propósito

Fornecer uma visualização clara e intuitiva do estágio atual do empreendimento/imóvel para o usuário, inspirado no design da imagem referência do Urbano Videira.

---

## 📋 Props

```typescript
interface StatusImovelProps {
  status: 'pre-lancamento' | 'lancamento' | 'em-construcao' | 'pronto';
  dataEntrega?: string; // Ex: "Fev 2025", "Out 2027"
}
```

### **Valores Possíveis para `status`:**

| Valor | Label | Step | Descrição |
|-------|-------|------|-----------|
| `pre-lancamento` | Pré-Lançamento | 0 | Empreendimento ainda não lançado |
| `lancamento` | Lançamento | 1 | Empreendimento recém-lançado |
| `em-construcao` | Em Construção | 2 | Empreendimento em obras |
| `pronto` | Pronto para Morar | 3 | Imóvel pronto para entrega |

---

## 🎨 Design e Estilo

### **Layout:**
- Container: `bg-white border border-[#E8ECF2] rounded-2xl p-6 lg:p-8`
- Título: `text-xl font-bold text-[#192233]`
- Grid: 4 colunas responsivas

### **Stepper:**
- **Círculos**: 48px (12x12 Tailwind)
- **Linha de progresso**: Altura 2px, conecta todos os círculos
- **Estado ativo**: `bg-[#054ADA] text-white shadow-md`
- **Estado inativo**: `bg-[#E8ECF2] text-[#8E99AB]`

### **Badge de Status Atual:**
- **Ativo (< 3)**: `bg-blue-100 text-[#054ADA]`
- **Pronto (3)**: `bg-green-100 text-green-700`
- Inclui um ponto animado indicando o status

---

## 📊 Estrutura Visual

```
┌──────────────────────────────────────────────────────────────┐
│  Status do Empreendimento                                    │
│                                                              │
│     ①───────②───────③───────④                               │
│     │       │       │       │                               │
│  Pré-Lança  Lança   Em      Pronto                          │
│  mento      mento   Constr. p/ Morar                        │
│                                                              │
│             Fev 2025                                         │
│                                                              │
│  [ • Status Atual: Lançamento ]                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Lógica de Progresso

### **Cálculo da Barra:**
```typescript
const progressPercent = (currentStep / 3) * 100;
```

- **Pré-Lançamento (0)**: 0% de progresso
- **Lançamento (1)**: 33.33% de progresso
- **Em Construção (2)**: 66.66% de progresso
- **Pronto (3)**: 100% de progresso

### **Exibição de Data:**

| Step | Condição | Exibição |
|------|----------|----------|
| 1 (Lançamento) | `dataEntrega` fornecida | Mostra data abaixo do step 1 |
| 3 (Pronto) | `dataEntrega` fornecida | Mostra "Aproximadamente" + data |

---

## 📱 Responsividade

### **Mobile (< 640px):**
- Labels encurtados via `sm:hidden` e `hidden sm:inline`
- Exemplo: "Pré-Lançamento" → "Pré-Lançamento"
- "Pronto para Morar" → "Pronto"

### **Tablet/Desktop (≥ 640px):**
- Labels completos visíveis

---

## 💻 Exemplos de Uso

### **1. Imóvel em Lançamento**
```tsx
<StatusImovel 
  status="lancamento" 
  dataEntrega="Fev 2025" 
/>
```

**Resultado:**
- Steps 0 e 1 ativos (azul)
- Data "Fev 2025" exibida abaixo do step 1
- Badge: "Status Atual: Lançamento" (azul)

---

### **2. Imóvel em Construção**
```tsx
<StatusImovel 
  status="em-construcao" 
/>
```

**Resultado:**
- Steps 0, 1 e 2 ativos (azul)
- Sem data exibida
- Badge: "Status Atual: Em Construção" (azul)

---

### **3. Imóvel Pronto**
```tsx
<StatusImovel 
  status="pronto" 
  dataEntrega="Out 2027" 
/>
```

**Resultado:**
- Todos os steps ativos (azul)
- Data "Aproximadamente Out 2027" exibida abaixo do step 3
- Badge: "Status Atual: Pronto para Morar" (verde)

---

### **4. Pré-Lançamento**
```tsx
<StatusImovel 
  status="pre-lancamento" 
/>
```

**Resultado:**
- Apenas step 0 ativo (azul)
- Steps 1, 2, 3 inativos (cinza)
- Badge: "Status Atual: Pré-Lançamento" (azul)

---

## 🎯 Integração

### **Página de Detalhes do Imóvel**
```tsx
// src/app/imoveis/[id]/page.tsx
<div className="mb-8">
  <StatusImovel 
    status={imovelData.status} 
    dataEntrega={imovelData.dataEntrega} 
  />
</div>
```

**Posição:** Após os cards de características (Quartos, Suítes, etc.) e antes da descrição.

---

### **Página de Detalhes do Empreendimento**
```tsx
// src/app/empreendimentos/[slug]/page.tsx
<div className="lg:col-span-1">
  <StatusImovel 
    status={empreendimento.status as 'pre-lancamento' | 'lancamento' | 'em-construcao' | 'pronto'} 
    dataEntrega={empreendimento.dataEntrega}
  />
</div>
```

**Posição:** Ao lado da descrição do empreendimento, em uma coluna separada (1/3 da largura).

---

## 🎨 Cores da Paleta Pharos

| Elemento | Cor | Código |
|----------|-----|--------|
| Círculo Ativo | Azul Pharos | `#054ADA` |
| Círculo Inativo | Slate-200 | `#E8ECF2` |
| Texto Ativo | Navy Pharos | `#192233` |
| Texto Inativo | Slate-500 | `#8E99AB` |
| Badge Azul (Ativo) | Azul Pharos | `#054ADA` |
| Badge Verde (Pronto) | Verde | `#2FBF71` |

---

## ⚡ Animações

### **Transições:**
- Círculos: `transition-all duration-300`
- Barra de progresso: `transition-all duration-500`
- Badge: `transition-colors`

### **Estados:**
- Círculo ativo: `shadow-md`
- Hover: Pode ser adicionado posteriormente se necessário

---

## 🔧 Dados Necessários

### **imovelData (Imóvel):**
```typescript
const imovelData = {
  // ...
  status: 'lancamento' as const,
  dataEntrega: 'Fev 2025',
};
```

### **empreendimento (Empreendimento):**
```typescript
// Já existe no data/empreendimentos.ts
{
  status: 'em-construcao',
  dataEntrega: 'Dez 2026',
}
```

---

## ✅ Acessibilidade

- ✅ Contraste adequado (WCAG AA)
- ✅ Labels descritivos
- ✅ Estrutura semântica clara
- ✅ Responsivo para todos os dispositivos
- ⚠️ Considerar: ARIA labels para leitores de tela (próxima iteração)

---

## 📄 Arquivos Modificados

1. **`src/components/StatusImovel.tsx`** (novo)
   - Componente principal
   - 151 linhas
   
2. **`src/app/imoveis/[id]/page.tsx`**
   - Import: linha 9
   - Dados: linhas 39-40 (status e dataEntrega)
   - Uso: linhas 347-350

3. **`src/app/empreendimentos/[slug]/page.tsx`**
   - Import: linha 7
   - Uso: linhas 379-384

---

## 🚀 Próximas Melhorias

- [ ] Animação de entrada (fade-in)
- [ ] Tooltip ao passar o mouse nos steps
- [ ] ARIA labels completos
- [ ] Modal com informações detalhadas de cada etapa
- [ ] Integração com API real (status dinâmico)

---

**Última atualização**: 11/10/2025

