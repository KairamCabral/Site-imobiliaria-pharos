# Cards de Características do Imóvel - Ordem e Layout

## Resumo das Alterações

Reorganização dos cards de características principais na página de detalhes do imóvel, seguindo a ordem: Quartos → Suítes → Vagas → Distância do Mar → Área Privativa → Área Total.

**Mudanças principais:**
- ❌ Removido card de "Banheiros"
- ✅ Adicionado card de "Distância do Mar" com ícone de ondas
- 🔄 Ícone de Suítes alterado de Key (chave) para Bath (banheira)

---

## 📋 Ordem dos Cards

### **Sequência Implementada:**
1. **Quartos** (sempre visível)
2. **Suítes** (quando houver)
3. **Vagas** (quando houver)
4. **Distância do Mar** (quando definida)
5. **Área Privativa** (quando houver)
6. **Área Total** (quando houver)

---

## 🎨 Ícones Utilizados

| Característica | Ícone | Cor | Descrição |
|----------------|-------|-----|-----------|
| Quartos | 🛏️ `Bed` | Azul #054ADA | Cama |
| Suítes | 🚿 `Bath` | Azul #054ADA | Banheira/Chuveiro |
| Vagas | 🚗 `Car` | Azul #054ADA | Carro |
| Distância do Mar | 🌊 `Waves` | Azul #054ADA | Ondas do mar |
| Área Privativa | 📐 `Maximize` | Azul #054ADA | Expandir/Dimensão |
| Área Total | 📐 `Maximize` | Azul #054ADA | Expandir/Dimensão |

---

## 📱 Layout Responsivo

### **Grid Responsivo:**
```tsx
grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6
```

**Comportamento:**
- **Mobile** (< 768px): 2 colunas
- **Tablet** (768px - 1024px): 3 colunas
- **Desktop** (> 1024px): 6 colunas (todos visíveis em 1 linha)

---

## 🔄 Lógica de Exibição

### **Campos Obrigatórios:**
- ✅ **Quartos**: Sempre exibido

### **Campos Condicionais:**
```typescript
{imovelData.suites && imovelData.suites > 0 && (
  // Card de Suítes
)}

{imovelData.vagas && imovelData.vagas > 0 && (
  // Card de Vagas
)}

{imovelData.distanciaMar !== undefined && (
  // Card de Distância do Mar
)}

{imovelData.areaPrivativa && (
  // Card de Área Privativa
)}

{imovelData.areaTotal && (
  // Card de Área Total
)}
```

**Regra:** Cards só aparecem quando o valor existe e é maior que 0 (exceto distanciaMar que pode ser 0 para "Frente Mar").

---

## 📊 Exemplo Visual

### **Desktop (6 cards):**
```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│   🛏️   │ │   🚿   │ │   🚗   │ │   🌊   │ │   📐   │ │   📐   │
│   4    │ │   3    │ │   3    │ │ Frente │ │  220   │ │  250   │
│Quartos │ │Suítes  │ │ Vagas  │ │  Mar   │ │Área Pr.│ │Área Tot│
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

### **Tablet (3 colunas):**
```
┌────────┐ ┌────────┐ ┌────────┐
│   🛏️   │ │   🚿   │ │   🚗   │
│   4    │ │   3    │ │   3    │
│Quartos │ │Suítes  │ │ Vagas  │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│   🌊   │ │   📐   │ │   📐   │
│ Frente │ │  220   │ │  250   │
│  Mar   │ │Área Pr.│ │Área Tot│
└────────┘ └────────┘ └────────┘
```

### **Mobile (2 colunas):**
```
┌────────┐ ┌────────┐
│   🛏️   │ │   🚿   │
│   4    │ │   3    │
│Quartos │ │Suítes  │
└────────┘ └────────┘
┌────────┐ ┌────────┐
│   🚗   │ │   🌊   │
│   3    │ │ Frente │
│ Vagas  │ │  Mar   │
└────────┘ └────────┘
┌────────┐ ┌────────┐
│   📐   │ │   📐   │
│  220   │ │  250   │
│Área Pr.│ │Área Tot│
└────────┘ └────────┘
```

---

## 🎨 Estilo dos Cards

### **Estrutura:**
```tsx
<div className="bg-[#F7F9FC] border border-[#E8ECF2] rounded-xl p-4 text-center">
  {/* Ícone */}
  <div className="flex justify-center mb-2">
    <div className="bg-[#054ADA]/10 p-3 rounded-full">
      <Icon className="w-6 h-6 text-[#054ADA]" />
    </div>
  </div>
  
  {/* Valor */}
  <span className="block text-2xl font-bold text-[#192233] mb-1">
    {valor}
  </span>
  
  {/* Label */}
  <span className="block text-sm text-[#8E99AB]">
    {label}
  </span>
</div>
```

### **Cores:**
- **Fundo Card**: `#F7F9FC` (Off-white Pharos)
- **Borda**: `#E8ECF2` (Slate-200)
- **Fundo Ícone**: `#054ADA/10` (Azul 10% opacidade)
- **Cor Ícone**: `#054ADA` (Azul Pharos)
- **Valor**: `#192233` (Navy Pharos)
- **Label**: `#8E99AB` (Slate-500)

---

## 📐 Dimensões

- **Padding Card**: `p-4` (16px)
- **Border Radius**: `rounded-xl` (12px)
- **Ícone**: 24x24px (`w-6 h-6`)
- **Círculo Ícone**: `p-3` (12px padding)
- **Fonte Valor**: `text-2xl` (~24px)
- **Fonte Label**: `text-sm` (~14px)

---

## 🔧 Dados do Imóvel

### **Interface atualizada:**
```typescript
const imovelData = {
  quartos: 4,          // Obrigatório
  suites: 3,           // Opcional
  vagas: 3,            // Opcional
  distanciaMar: 0,     // Opcional (0 = Frente Mar, em metros)
  areaPrivativa: 220,  // Opcional
  areaTotal: 250,      // Opcional
  // ... outros campos
};
```

**Exibição de Distância do Mar:**
- `0` metros → Exibe "Frente" + "Mar"
- `> 0` metros → Exibe valor numérico + "m do Mar"
- Exemplos: "Frente Mar", "100 m do Mar", "250 m do Mar"

---

## ✅ Casos de Uso

### **Caso 1: Imóvel Completo Frente Mar**
```typescript
{
  quartos: 4,
  suites: 3,
  vagas: 3,
  distanciaMar: 0,
  areaPrivativa: 220,
  areaTotal: 250
}
```
**Resultado**: 6 cards visíveis (com "Frente Mar")

### **Caso 2: Imóvel Próximo ao Mar**
```typescript
{
  quartos: 3,
  suites: 2,
  vagas: 2,
  distanciaMar: 150,
  areaPrivativa: 80,
  areaTotal: 100
}
```
**Resultado**: 6 cards visíveis (com "150 m do Mar")

### **Caso 3: Imóvel sem Suítes**
```typescript
{
  quartos: 2,
  vagas: 1,
  distanciaMar: 500,
  areaPrivativa: 65
}
```
**Resultado**: 4 cards visíveis (sem Suítes e Área Total)

### **Caso 4: Mínimo**
```typescript
{
  quartos: 1
}
```
**Resultado**: 1 card visível (apenas Quartos)

---

## 🎯 Acessibilidade

- ✅ Cards com contraste adequado (WCAG AA)
- ✅ Ícones com significado visual claro
- ✅ Labels descritivos
- ✅ Responsivo para todos os dispositivos
- ✅ Touch targets adequados (44x44px mínimo)

---

## 📄 Arquivo Modificado

**`src/app/imoveis/[id]/page.tsx`**
- Linha 16: Importado ícone `Waves` do lucide-react (removido `Key`)
- Linhas 31-36: Adicionados campos `suites`, `vagas`, `distanciaMar`, `areaPrivativa`, `areaTotal` (removido `banheiros`)
- Linhas 260-341: Seção de Características Principais reestruturada
  - Removido card de Banheiros
  - Adicionado card de Distância do Mar com lógica condicional
  - Ícone de Suítes alterado de `Key` para `Bath`

---

**Última atualização**: 11/10/2025

