# Tags e Badges dos Cards - Documentação Completa

Sistema completo de tags e badges implementado nos cards de imóveis, seguindo o padrão da home.

---

## 📍 Localização das Tags

### **Mobile (<768px)**
- **Imagem (canto superior esquerdo)**: Todas as tags visíveis (tipo, características, venda rápida, badges)
- **Abaixo dos metadados**: Badge distância do mar + tags secundárias

### **Desktop (≥768px)**
- **Imagem (canto superior esquerdo)**: **APENAS tipo do imóvel**
- **Abaixo dos metadados**: Todas as outras tags de forma **minimalista e sutil** (10px, uppercase, cores suaves)

---

## 🏷️ Tags Implementadas

### 1. **Tipo do Imóvel** (Sempre visível)
- **Posição**: 1ª tag no canto superior esquerdo
- **Estilo**: Branco com texto navy
- **Exemplos**: "Apartamento", "Casa", "Cobertura", "Terreno"
- **Código**:
```tsx
<span className="text-xs font-medium px-3 py-1.5 rounded-lg text-pharos-navy-900 bg-white/90 backdrop-blur-sm">
  {tipoImovel}
</span>
```

---

### 2. **Primeira Característica Especial** (Se disponível)
- **Posição**: 2ª tag no canto superior esquerdo (mobile) / Abaixo dos metadados (desktop)
- **Estilo**: Azul (#054ada) com texto branco (mobile) / Azul 10% (desktop)
- **Exemplos**: "Vista mar", "Mobiliado"
- **Lógica**: "Vista mar" só aparece se NÃO tiver badge de distância do mar (evita duplicação)
- **Código**:
```tsx
{caracteristicas && caracteristicas.length > 0 && (
  <span className="text-xs font-medium px-3 py-1.5 rounded-lg text-white bg-pharos-blue-500/90 backdrop-blur-sm">
    {caracteristicas[0]}
  </span>
)}
```

---

### 3. **Venda Rápida** (Quando há desconto)
- **Posição**: 3ª tag no canto superior esquerdo
- **Estilo**: Vermelho (#b91c1c) com texto branco, **pulsando**
- **Condição**: Aparece quando `precoAntigo > precoAtual`
- **Código**:
```tsx
{precoAntigo && economia > 0 && (
  <span className="text-xs font-bold px-3 py-1.5 rounded-lg text-white bg-red-700/90 backdrop-blur-sm animate-pulse">
    Venda Rápida
  </span>
)}
```

---

### 4. **Badges Adicionais** (Exclusivo, Lançamento)
- **Posição**: Últimas tags no canto superior esquerdo
- **Estilo**: Navy (#192233) com texto branco
- **Exemplos**: "Exclusivo", "Lançamento"
- **Código**:
```tsx
{badges.map((badge, index) => (
  <span key={index} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-pharos-navy-900/90 backdrop-blur-sm">
    {badge}
  </span>
))}
```

---

### 5. **Badge Distância do Mar** (≤500m)
- **Posição**: 
  - **Desktop**: Ao lado da localização (direita)
  - **Mobile**: Abaixo dos metadados
- **Estilo**: Azul claro (#EFF6FF) com texto azul (#2563EB)
- **Ícone**: Ondas do mar
- **Condição**: Aparece apenas se `distanciaMar <= 500`
- **Formato**: 
  - `distanciaMar === 0` → "Frente mar"
  - `distanciaMar > 0` → "150m do mar"

**Desktop:**
```tsx
{distanciaMar !== undefined && distanciaMar <= 500 && (
  <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md flex-shrink-0">
    <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 3H3v18h18V3z..." />
    </svg>
    <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
      {distanciaMar === 0 ? 'Frente mar' : `${distanciaMar}m do mar`}
    </span>
  </div>
)}
```

**Mobile:**
```tsx
{distanciaMar !== undefined && distanciaMar <= 500 && (
  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
    <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 3H3v18h18V3z..." />
    </svg>
    <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
      {distanciaMar === 0 ? 'Frente mar' : `${distanciaMar}m do mar`}
    </span>
  </div>
)}
```

---

### 6. **Tags Secundárias** (Desktop: máx 2, Mobile: conforme necessário)
- **Posição**: Abaixo dos metadados
- **Estilo**: Cinza claro (#F5F7FA) com texto navy (mobile) / Cinza (#F1F5F9) 10px (desktop)
- **Exemplos**: "Entrega Q1 2025"
- **Código**:
```tsx
{tags.map((tag, index) => (
  <span key={index} className="inline-flex items-center px-2.5 py-1 bg-[#F5F7FA] text-[#192233] rounded-lg text-xs font-medium">
    {tag}
  </span>
))}
```

---

## 🎨 Paleta de Cores

### **Mobile (Tags na Imagem)**
| Tag | Cor de Fundo | Cor do Texto | Backdrop | Tamanho |
|-----|--------------|--------------|----------|---------|
| **Tipo Imóvel** | Branco | Navy (#192233) | blur-sm 90% | 12px |
| **Característica** | Azul (#054ada) | Branco | blur-sm 90% | 12px |
| **Venda Rápida** | Vermelho (#b91c1c) | Branco | blur-sm 90% + pulse | 12px |
| **Exclusivo/Lançamento** | Navy (#192233) | Branco | blur-sm 90% | 12px |

### **Desktop (Tags Minimalistas Abaixo dos Metadados)**
| Tag | Cor de Fundo | Cor do Texto | Tamanho | Estilo |
|-----|--------------|--------------|---------|--------|
| **Distância Mar** | Azul Claro (#EFF6FF) | Azul (#1D4ED8) | **10px** | uppercase, semibold |
| **Característica** | Azul 10% | Azul (#2563EB) | **10px** | uppercase, semibold |
| **Venda Rápida** | Vermelho Claro (#FEF2F2) | Vermelho (#B91C1C) | **10px** | uppercase, bold |
| **Exclusivo/Lançamento** | Navy 10% | Navy (#192233) | **10px** | uppercase, semibold |
| **Tags Secundárias** | Cinza (#F1F5F9) | Cinza (#64748B) | **10px** | medium |

---

## 📐 Dimensões

- **Padding horizontal**: `px-3` (12px) para tags principais, `px-2` (8px) para distância mar
- **Padding vertical**: `py-1.5` (6px) para tags principais, `py-1` (4px) para distância mar
- **Border radius**: `rounded-lg` (8px)
- **Font size**: `text-xs` (12px)
- **Font weight**: 
  - Tipo: `font-medium` (500)
  - Característica: `font-medium` (500)
  - Venda Rápida: `font-bold` (700)
  - Badges: `font-semibold` (600)
  - Distância Mar: `font-semibold` (600)
  - Tags secundárias: `font-medium` (500)

---

## 🔄 Hierarquia e Ordem

### **Mobile - Imagem (canto superior esquerdo):**
1. Tipo do Imóvel (sempre)
2. Primeira Característica (se houver)
3. Venda Rápida (se houver desconto)
4. Exclusivo/Lançamento (se aplicável)

### **Mobile - Abaixo dos Metadados:**
1. Badge distância do mar (se ≤500m)
2. Tags secundárias (mobiliado, pet friendly, etc.)

### **Desktop - Imagem:**
- **APENAS** Tipo do Imóvel

### **Desktop - Abaixo dos Metadados (minimalistas):**
1. Badge distância do mar (se ≤500m) - **prioridade máxima**
2. Primeira Característica (só se não houver distância do mar para evitar duplicação)
3. Venda Rápida (se houver desconto)
4. Exclusivo/Lançamento (badges especiais)
5. Tags secundárias (máx 2) - Ex: data de entrega

---

## 📊 Lógica de Exibição

### Tipo do Imóvel
```tsx
tipoImovel={imovel.tipoImovel.charAt(0).toUpperCase() + imovel.tipoImovel.slice(1)}
```
**Sempre exibido**, primeira letra maiúscula.

### Características
```tsx
caracteristicas={[
  ...(imovel.vistaParaMar && (imovel.distanciaMar === undefined || imovel.distanciaMar > 500) ? ['Vista mar'] : []),
  ...(imovel.mobiliado ? ['Mobiliado'] : []),
]}
```
**Primeira característica** do array é exibida na tag azul.
**Lógica importante**: "Vista mar" só aparece se NÃO houver badge de distância do mar (≤500m) para evitar duplicação.

### Venda Rápida
```tsx
{precoAntigo && economia > 0 && (
  <span className="...animate-pulse">Venda Rápida</span>
)}
```
Exibido quando há **desconto** (preço antigo > preço atual).

### Distância do Mar
```tsx
distanciaMar={imovel.distanciaMar ?? imovel.distancia_mar_m}
```
- **Exibido apenas se ≤500m**
- Desktop: ao lado da localização
- Mobile: abaixo dos metadados
- Texto especial: "Frente mar" se `distanciaMar === 0`

---

## ✅ Critérios de Exibição

| Tag | Sempre Visível | Condição |
|-----|----------------|----------|
| Tipo Imóvel | ✅ Sim | - |
| Característica | ⚠️ Condicional | Se `caracteristicas.length > 0` E não houver badge distância mar |
| Venda Rápida | ⚠️ Condicional | Se `precoAntigo > precoAtual` |
| Exclusivo/Lançamento | ⚠️ Condicional | Se badge fornecido |
| Distância Mar | ⚠️ Condicional | **Prioridade**: Se `distanciaMar <= 500` |
| Tags Secundárias | ⚠️ Condicional | Desktop: máx 2, Mobile: conforme necessário |

---

## 🎯 Objetivos das Tags

1. **Identificação Rápida**: Tipo do imóvel sempre visível
2. **Diferenciação**: Características especiais em azul
3. **Urgência**: Badge "Venda Rápida" vermelho pulsando
4. **Exclusividade**: Badges navy para imóveis especiais
5. **Proximidade**: Badge azul destaca distância do mar (PRIORIDADE sobre "Vista mar")
6. **Contexto**: Tags secundárias com informações adicionais
7. **Sem Duplicação**: Lógica para evitar tags repetidas (ex: "Frente mar" vs badge distância)

---

## 🔧 Manutenção

### Adicionar Nova Tag
1. Adicionar campo na interface `PropertyCardHorizontalProps`
2. Passar prop ao chamar o componente
3. Adicionar lógica de exibição no JSX
4. Seguir paleta de cores e estilos definidos

### Modificar Estilos
Todas as classes Tailwind estão inline para facilitar ajustes. Paleta de cores segue design tokens Pharos.

---

## 📱 Responsividade

### **Mobile (<768px)**
```
┌─────────────────────┐
│ [Apartamento]       │ ← Tipo na imagem
│ [Frente mar]        │
│ [Venda Rápida]      │
│      IMAGEM         │
└─────────────────────┘
📍 Centro, BC
Apartamento...
📐 🛏️ 🛁 🚗
[🌊 100m do mar] [Mobiliado]
```

### **Desktop (≥768px)**
```
┌─────────────────────┐
│ [Apartamento]       │ ← APENAS tipo na imagem
│                     │
│      IMAGEM         │
└─────────────────────┘
📍 Centro, BC
Apartamento...
📐 🛏️ 🛁 🚗
[FRENTE MAR] [VENDA RÁPIDA] [EXCLUSIVO] [Mobiliado]
    ↑ Tags minimalistas (10px, uppercase, cores suaves)
```

---

**Última atualização**: 11/10/2025

