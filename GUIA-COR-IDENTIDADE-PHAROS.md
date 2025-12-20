# 🎨 Pharos — Guia de Cor & Identidade Visual

**Sistema oficial de design | Alto padrão minimalista | WCAG 2.1 AA/AAA**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Paleta Oficial](#paleta-oficial)
3. [Contraste e Acessibilidade](#contraste-e-acessibilidade)
4. [Diretrizes por Área](#diretrizes-por-área)
5. [Gradientes e Sombras](#gradientes-e-sombras)
6. [Tokens de Design](#tokens-de-design)
7. [Padrões de UI](#padrões-de-ui)
8. [Do/Don't](#dodont-rápidos)
9. [Checklist de QA](#checklist-de-qa)

---

## 🎯 Visão Geral

### Objetivo

Definir uma **paleta enxuta, consistente e acessível** para todo o site da imobiliária Pharos, transmitindo:

- ✨ **Confiança** — cores sólidas, sem experimentalismos
- 🏢 **Sofisticação** — minimalismo premium
- 🚀 **Modernidade** — tecnologia e inovação

### Proporção 70/20/10

```
70% — Neutros frios (Slate, White, Off-White)
20% — Primárias (Blue, Navy)
10% — Acento (Brass Gold - micro-detalhes)
```

### Princípio Central

> **"Menos é mais"** — Usar APENAS as cores da paleta oficial. Nenhum tom adicional, nenhum degradê improvisado, nenhuma saturação diferente.

---

## 🎨 Paleta Oficial

### Cores Primárias

#### Pharos Blue 500
- **Hex:** `#054ADA`
- **HSL:** 221°, 96%, 44%
- **Uso:** Ação primária, links, CTAs, botões
- **Contraste:** AAA em white (7.00:1)

#### Pharos Navy 900
- **Hex:** `#192233`
- **HSL:** 219°, 34%, 15%
- **Uso:** Header, footer, títulos principais
- **Contraste:** AAA em white (15.93:1)

---

### Neutros Frios (70% do uso)

#### Slate 700 — Texto Principal
- **Hex:** `#2C3444`
- **Uso:** Body text, parágrafos, conteúdo principal
- **Contraste:** AAA em white (12.49:1) / AAA em off-white (11.84:1)

#### Slate 500 — Texto Secundário
- **Hex:** `#585E6B`
- **Uso:** Metadados, legendas, texto auxiliar
- **Contraste:** AA em white (6.50:1) / AA em off-white (6.17:1)

#### Slate 300 — Bordas/Divisores
- **Hex:** `#ADB4C0`
- **Uso:** **SOMENTE bordas e divisores**
- ⚠️ **NUNCA usar em texto** (contraste 2.09 — reprovado)

#### Off-White — Fundo Premium
- **Hex:** `#F7F9FC`
- **Uso:** Background principal do site (body)

#### White
- **Hex:** `#FFFFFF`
- **Uso:** Cards, superfícies, texto em fundos escuros

---

### Acento Metálico (10% — micro-uso)

#### Brass Gold 500
- **Hex:** `#C89C4D`
- **Uso:** **Micro-detalhes, ícones, filetes, linhas decorativas**
- ⚠️ **NUNCA blocos grandes ou texto longo**
- ⚠️ Contraste com white: 2.52 (reprovado) — usar apenas como detalhe

---

### Cores de Feedback

#### Success
- **Hex:** `#2FBF71`
- **Uso:** Confirmações, estados de sucesso

#### Error
- **Hex:** `#C53A3A`
- **Uso:** Erros, validações (contraste AA: 4.58:1)

#### Warning
- **Hex:** `#F5A524`
- **Uso:** Avisos, atenção

---

## ✅ Contraste e Acessibilidade

### Padrão WCAG 2.1

| Nível | Texto Normal | Texto Grande | Gráficos |
|-------|--------------|--------------|----------|
| **AA** | ≥ 4.5:1 | ≥ 3.0:1 | ≥ 3.0:1 |
| **AAA** | ≥ 7.0:1 | ≥ 4.5:1 | ≥ 4.5:1 |

### Pares Validados ✅

| Par | Contraste | Nível | Uso |
|-----|-----------|-------|-----|
| Navy 900 ↔ White | 15.93 | AAA | Títulos principais |
| Slate 700 ↔ White | 12.49 | AAA | Texto principal |
| Blue 500 ↔ White | 7.00 | AAA | Botões, CTAs |
| Slate 500 ↔ White | 6.50 | AA | Texto secundário |
| Blue 500 ↔ Off-White | 6.64 | AA | Links no body |
| Slate 700 ↔ Off-White | 11.84 | AAA | Body em off-white |
| Error ↔ White | 4.58 | AA | Mensagens de erro |

### Pares Reprovados ❌

| Par | Contraste | Motivo |
|-----|-----------|--------|
| Slate 300 ↔ White | 2.09 | Apenas bordas, não texto |
| Gold ↔ White | 2.52 | Detalhe decorativo apenas |

---

## 🏗️ Diretrizes por Área

### 1. Header e Rodapé

```css
background: var(--ph-navy-900);
color: var(--ph-white);
```

- **CTA primário:** `--ph-blue-500`
  - Hover: `--ph-blue-600`
  - Active: `--ph-blue-700`
  - Focus: outline 2px `--ph-blue-500`

- **Links:** `--ph-white`
  - Hover: sublinhado ou `--ph-gold` (sutil)

---

### 2. Corpo (Body)

```css
background: var(--ph-offwhite);
color: var(--ph-slate-700);
```

- **Texto principal:** `--ph-slate-700`
- **Texto secundário:** `--ph-slate-500`
- **Links:** `--ph-blue-500`
  - Hover: sublinhado + `--ph-blue-600`
  - Focus: outline visível

---

### 3. Cards

```css
background: var(--ph-white);
border: 1px solid var(--ph-slate-300);
border-radius: 20-24px;
box-shadow: var(--ph-shadow-md);
```

- **Títulos:** `--ph-navy-900`
- **Descrição:** `--ph-slate-700`
- **Metadados:** `--ph-slate-500`
- **Ações/CTAs:** `--ph-blue-500`

**Hover:**
```css
box-shadow: var(--ph-shadow-hover);
transform: translateY(-2px);
```

---

### 4. Formulários

#### Campos

```css
background: var(--ph-white);
border: 1px solid var(--ph-slate-300);
border-radius: 12px;
color: var(--ph-slate-700);
```

**Estados:**

- **Focus:**
  ```css
  border-color: var(--ph-blue-500);
  outline: 2px solid var(--ph-blue-500);
  outline-offset: 2px;
  ```

- **Error:**
  ```css
  border-color: var(--ph-error);
  ```

- **Disabled:**
  ```css
  background: var(--ph-offwhite);
  color: var(--ph-slate-500);
  cursor: not-allowed;
  ```

#### Labels e Ajuda

- **Label:** `--ph-slate-700` (bold ou semibold)
- **Helper text:** `--ph-slate-500`
- **Error message:** `--ph-error`

---

### 5. Botões

#### Primário

```css
background: var(--ph-blue-500);
color: var(--ph-white);
border-radius: 14px;
min-height: 44px; /* touch target */
```

**Estados:**
- Hover: `--ph-blue-600`
- Active: `--ph-blue-700`
- Focus: outline 2px `--ph-blue-500`
- Disabled: opacity 0.5, cursor not-allowed

#### Secundário

```css
background: transparent;
border: 2px solid var(--ph-blue-500);
color: var(--ph-blue-500);
```

**Hover:**
```css
background: var(--ph-blue-500);
color: var(--ph-white);
```

#### Terciário / Ghost

```css
background: transparent;
color: var(--ph-blue-500);
```

**Hover:**
```css
background: rgba(5, 74, 218, 0.08);
```

---

### 6. Destaques de Luxo (Gold)

- **Filetes decorativos:** 1-2px `--ph-gold`
- **Ícones pequenos:** 16-20px em `--ph-gold`
- **Linhas divisórias:** `border-top: 1px solid var(--ph-gold)`

⚠️ **NUNCA:**
- Blocos inteiros em gold
- Texto longo em gold
- Gold sobre white (baixo contraste)

---

## 🌈 Gradientes e Sombras

### Gradiente Premium (Hero/CTAs)

```css
background: linear-gradient(135deg, #054ADA 0%, #192233 60%);
```

**Aplicação:**
- Hero sections
- CTAs premium
- Banners principais

**Sobre fotos:**
```css
/* Foto em P&B com overlay */
background: url('foto.jpg');
filter: grayscale(0.3);
```
```css
/* Overlay escuro */
&::after {
  content: '';
  background: rgba(25, 34, 51, 0.55);
}
```

---

### Sombras Sofisticadas

```css
/* Padrão (cards) */
--ph-shadow-md: 0 6px 20px rgba(25, 34, 51, 0.08);

/* Hover */
--ph-shadow-hover: 0 10px 28px rgba(25, 34, 51, 0.12);

/* Elevado (modais, dropdowns) */
--ph-shadow-lg: 0 10px 28px rgba(25, 34, 51, 0.12);
--ph-shadow-xl: 0 16px 40px rgba(25, 34, 51, 0.16);
```

---

## 🔧 Tokens de Design

### CSS Variables (globals)

```css
:root {
  /* Primárias */
  --ph-blue-500: #054ADA;
  --ph-blue-600: #043BAE;
  --ph-blue-700: #032C83;
  --ph-navy-900: #192233;
  
  /* Neutros */
  --ph-slate-700: #2C3444;
  --ph-slate-500: #585E6B;
  --ph-slate-300: #ADB4C0;
  --ph-offwhite: #F7F9FC;
  --ph-white: #FFFFFF;
  
  /* Acento */
  --ph-gold: #C89C4D;
  
  /* Feedback */
  --ph-success: #2FBF71;
  --ph-error: #C53A3A;
  --ph-warning: #F5A524;
  
  /* Sombras */
  --ph-shadow-md: 0 6px 20px rgba(25, 34, 51, 0.08);
  --ph-shadow-hover: 0 10px 28px rgba(25, 34, 51, 0.12);
  
  /* Gradientes */
  --ph-gradient-primary: linear-gradient(135deg, #054ADA 0%, #192233 60%);
}
```

---

### Tailwind Extend

```javascript
theme: {
  extend: {
    colors: {
      pharos: {
        blue: {
          500: '#054ADA',
          600: '#043BAE',
          700: '#032C83',
        },
        navy: {
          900: '#192233',
        },
        slate: {
          700: '#2C3444',
          500: '#585E6B',
          300: '#ADB4C0',
        },
        base: {
          white: '#FFFFFF',
          off: '#F7F9FC',
        },
        gold: {
          500: '#C89C4D',
        },
      },
    },
  },
}
```

---

## 🎛️ Padrões de UI

### Raios de Borda

| Elemento | Raio | Uso |
|----------|------|-----|
| Chips, inputs | 12px | `--ph-radius-md` |
| Botões | 14px | `--ph-radius-lg` |
| Cards pequenos | 20px | `--ph-radius-xl` |
| Cards grandes | 24px | `--ph-radius-2xl` |

---

### Alturas Mínimas (Touch Target)

```css
/* Área mínima de toque (mobile) */
min-height: 44px;
min-width: 44px;
```

Aplicar em:
- Botões
- Campos de formulário
- Links clicáveis
- Checkboxes / Radio (área clicável)

---

### Ícones

| Contexto | Tamanho | Uso |
|----------|---------|-----|
| Controles | 18-20px | Botões, filtros |
| Metadados | 16-18px | Área, quartos, vagas |
| Detalhe gold | 16-20px | Ícones decorativos |

**Biblioteca recomendada:** Lucide Icons

---

### Estados Interativos

Todos os elementos interativos devem ter:

✅ **Default** — estado inicial  
✅ **Hover** — visual feedback  
✅ **Focus** — outline visível (nunca `outline: none`)  
✅ **Active** — pressed state  
✅ **Disabled** — visualmente desabilitado + cursor: not-allowed  

---

### Percentual de Uso

```
70% — Neutros (Slate, White, Off-White)
20% — Primárias (Blue, Navy)
10% — Gold (micro-detalhes)
```

**Exemplo visual:**
```
███████████████████████████████████████████████ 70% neutros
█████████████████ 20% blue/navy
██████ 10% gold
```

---

### Tipografia (Inter)

| Elemento | Tamanho | Peso | Line Height |
|----------|---------|------|-------------|
| H1 | 56px | Bold 700 | 1.2 |
| H2 | 36px | Bold 700 | 1.25 |
| H3 | 28px | Semibold 600 | 1.3 |
| H4 | 24px | Semibold 600 | 1.35 |
| Body | 16-18px | Regular 400 | 1.5 |
| Caption | 13-14px | Regular 400 | 1.35 |

---

## ✅ Do/Don't Rápidos

### ✅ Faça

- ✅ Usar **apenas** os tokens de cor oficiais
- ✅ Validar contraste AA/AAA em novos componentes
- ✅ Aplicar gradiente Blue→Navy somente em hero/CTAs premium
- ✅ Usar Gold como detalhe (ícones, filetes)
- ✅ Garantir altura mínima de 44px para touch targets
- ✅ Manter focus visível em todos os elementos interativos
- ✅ Usar Slate 300 **apenas** para bordas/divisores

---

### ❌ Não Faça

- ❌ Introduzir novos tons de azul ou outras cores
- ❌ Usar degradês azul→branco ou improvisados
- ❌ Usar Slate 300 em texto (contraste reprovado)
- ❌ Usar Gold em blocos grandes ou texto longo
- ❌ Combinar Gold com White em texto (contraste baixo)
- ❌ Remover outline de focus (`outline: none`)
- ❌ Criar sombras com cores diferentes de Navy

---

## 🧪 Checklist de QA

### ✅ Cores

- [ ] Todos os componentes usam tokens (`var(--ph-*)` ou Tailwind `pharos-*`)
- [ ] Nenhum hex/rgb solto no código (exceto tokens)
- [ ] Nenhum tom de azul fora da paleta
- [ ] Nenhum degradê improvisado

---

### ✅ Contraste

- [ ] Texto principal: ≥7.0 (AAA)
- [ ] Texto secundário: ≥4.5 (AA)
- [ ] Links/CTAs: ≥7.0 (AAA)
- [ ] Ícones gráficos: ≥3.0
- [ ] Slate 300 não usado em texto
- [ ] Gold usado apenas como detalhe decorativo

---

### ✅ Componentes

- [ ] Header/Footer: fundo Navy 900, texto White
- [ ] Body: fundo Off-White, texto Slate 700
- [ ] Cards: fundo White, borda Slate 300, sombra padrão
- [ ] Botões primários: Blue 500 com estados hover/focus/active
- [ ] Formulários: bordas Slate 300, focus Blue 500
- [ ] Links: Blue 500 com sublinhado em hover/focus

---

### ✅ Gradientes e Sombras

- [ ] Gradiente Blue→Navy aplicado apenas em hero/CTAs premium
- [ ] Overlay em fotos: `rgba(25, 34, 51, 0.55)` ou similar
- [ ] Sombras usando Navy com opacidade baixa
- [ ] Nenhuma sombra em preto puro

---

### ✅ UX e Acessibilidade

- [ ] Altura mínima de 44px em elementos clicáveis (mobile)
- [ ] Focus visível em todos os interativos
- [ ] Estados hover/active/disabled implementados
- [ ] Ícones com tamanho adequado (16-20px)
- [ ] Tipografia Inter aplicada globalmente

---

## 📦 Entregáveis

### 1. Tokens CSS

📄 **Arquivo:** `src/styles/pharos-tokens.css`

Contém todas as CSS variables (`--ph-*`) para uso global.

---

### 2. Tailwind Config

📄 **Arquivo:** `tailwind.config.js`

Paleta `pharos.*` configurada no `theme.extend.colors`.

---

### 3. Design Tokens JSON

📄 **Arquivo:** `public/design-tokens/colors.json`

JSON estruturado com valores, uso e contrastes WCAG.

---

### 4. Guia de Referência

📄 **Arquivo:** `GUIA-COR-IDENTIDADE-PHAROS.md` (este documento)

Documentação completa com exemplos de código e diretrizes.

---

### 5. Relatório de Contraste

📄 **Arquivo:** `RELATORIO-CONTRASTE-WCAG.md`

Tabela detalhada de todos os pares de contraste validados.

---

## 🚀 Próximos Passos

1. **Revisar componentes existentes** e aplicar os tokens
2. **Testar contraste** em todas as telas (ferramentas: Axe, Lighthouse)
3. **Criar biblioteca de componentes** no Figma (opcional)
4. **Documentar casos especiais** (se houver)
5. **Treinar o time** sobre o uso correto da paleta

---

## 📞 Suporte

Para dúvidas sobre uso da paleta ou validação de contraste:

- Consultar este guia
- Validar com ferramentas: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Manter consistência: sempre usar tokens, nunca hex solto

---

**Pharos — Confiança, Sofisticação, Modernidade** 🏢✨

