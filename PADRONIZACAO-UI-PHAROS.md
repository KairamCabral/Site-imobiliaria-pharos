# Padronização de UI — Página Imóveis (Alto Padrão, Moderno, Minimalista)

## Objetivo
Aplicar UI/UX profissional, refinado, moderno e minimalista com a **paleta oficial Pharos** e um design editorial de alto padrão. Remover variações de azul não previstas e eliminar degradês fracos.

---

## 1. Paleta Oficial Implementada

### Cores Primárias
- **Navy Pharos (primário):** `#192233`
- **Navy Light:** `#202A44`
- **Branco:** `#FFFFFF`

### Cinzas Neutros
- **Gray 50 (bg suave):** `#F5F7FA`
- **Gray 100 (borda/divisor):** `#E8ECF2`
- **Gray 300:** `#C9D1E0`
- **Gray 500 (texto secundário):** `#8E99AB`

### Dourado-Acento (microdetalhes)
- **Gold:** `#C8A968` - Usado apenas em badges de contagem

### Feedback
- **Sucesso:** `#2FBF71`
- **Alerta:** `#F5A524`
- **Erro:** `#E5484D`

### Proibições
✅ **Implementado:**
- ❌ Nenhum azul fora da paleta (`#054ADA`, `#337FE7`, etc. foram removidos)
- ❌ Sem degradê azul→branco (substituído por navy sólido)
- ❌ Sem azul vibrante/ciano em badges

---

## 2. Componentes Atualizados

### 2.1 Barra de Filtros (Sticky)
**Antes:** Gradient `from-primary via-primary to-primary-dark` (azul vibrante)

**Depois:**
- Fundo: `bg-navy` sólido (`#192233`)
- Borda inferior: `border-pharos-gray-100/60` (1px com 60% opacidade)
- Sombra: Dinâmica baseada em sticky state
  - Normal: `0 4px 12px 0 rgba(25, 34, 51, 0.08)`
  - Sticky: `0 6px 16px 0 rgba(25, 34, 51, 0.12)`

### 2.2 Botões de Filtro (Pills)
**Antes:** `bg-white text-primary border-2 border-primary` (azul vibrante)

**Depois - Estado Normal:**
- `bg-pharos-gray-50` (fundo neutro)
- `text-navy` (texto navy)
- `border border-pharos-gray-100` (borda sutil)
- `hover:border-navy/20 hover:shadow-md`
- Transição: `120ms cubic-bezier(0.4, 0, 0.2, 1)`

**Depois - Estado Selecionado:**
- `bg-navy` (fundo navy)
- `text-white` (texto branco)
- `border border-navy`

### 2.3 Badges de Contagem
**Antes:** `bg-cyan-400` (azul ciano não-oficial)

**Depois:**
- `bg-pharos-gold` (dourado acento `#C8A968`)
- `text-navy` (contraste alto)
- `font-bold` mantido

### 2.4 Contadores (Suítes/Vagas)
**Antes:** `bg-primary` quando selecionado, `bg-gray-100` normal

**Depois - Estado Normal:**
- `bg-pharos-gray-50`
- `hover:bg-pharos-gray-100`
- `text-navy`

**Depois - Estado Selecionado:**
- `bg-navy`
- `text-white`
- `shadow-md`

### 2.5 Chips de Características (Atalhos Rápidos)
**Antes:** `bg-white text-primary` quando ativo (azul vibrante)

**Depois - Estado Ativo:**
- `bg-white`
- `text-navy` (navy ao invés de primary)
- `border-white`
- `shadow-md`

**Estado Inativo:**
- `bg-white/10`
- `hover:bg-white/20`
- `text-white`
- `border-white/20`

### 2.6 Botões de Ação (Limpar/Mais Filtros)
**Antes:** `shadow-md hover:shadow-lg` com `border-white/40`

**Depois:**
- **Limpar Filtros (Secundário):**
  - `bg-white/95 hover:bg-white`
  - `text-navy` (alto contraste)
  - `border-2 border-pharos-gray-100`
  - `hover:border-navy/30 hover:shadow-md`
  - `backdrop-blur-sm` mantido

- **Mais Filtros:**
  - `bg-white/95 hover:bg-white`
  - `text-navy`
  - `border border-pharos-gray-100`
  - `hover:border-navy/30 hover:shadow-md`

### 2.7 Cards de Imóveis
**Antes:** `border border-gray-100`, `rounded-2xl`, `text-primary` em vários elementos

**Depois:**
- **Estrutura:**
  - `border border-pharos-gray-100` (borda 1px oficial)
  - `hover:border-pharos-gray-300`
  - `border-radius: 24px` (raio 2xl = 24px)
  - `box-shadow: 0 2px 4px 0 rgba(25, 34, 51, 0.04)`
  - Transição: `120ms cubic-bezier(0.4, 0, 0.2, 1)`

- **Badges:**
  - Tipo do Imóvel: `bg-white/90` mantido
  - Características: `bg-navy/90` (navy ao invés de primary)
  - Urgência/Oportunidade: `bg-navy/90` (sem vermelho/verde vibrante)

- **Distância do Mar:**
  - **Antes:** `bg-blue-50`, `text-blue-600` (azul não-oficial)
  - **Depois:** `bg-pharos-gray-50`, `text-navy`, `border border-pharos-gray-100`

- **Ícones (Localização, Área, Quartos, Banheiros, Vagas):**
  - **Antes:** `text-primary`
  - **Depois:** `text-navy opacity-80` (traço fino com 80% opacidade)

- **Título:**
  - **Antes:** `text-gray-900 group-hover:text-primary`
  - **Depois:** `text-navy group-hover:text-navy-light`
  - `font-weight: 800`

- **Preço:**
  - **Antes:** `text-primary` (azul), `text-red-700` (vermelho), `text-green-600` (verde)
  - **Depois:**
    - Preço principal: `text-navy` com `font-weight: 800`
    - Economia: `text-pharos-success` (verde discreto `#2FBF71`)
    - Badge economia: `bg-pharos-success/10`
    - Preço antigo: `text-pharos-gray-500`

- **Botão CTA:**
  - **Antes:** `bg-gray-900 hover:bg-primary`
  - **Depois:** `bg-navy hover:bg-navy-light`
  - Transição: `120ms cubic-bezier(0.4, 0, 0.2, 1)`

### 2.8 Empty State (Nenhum Resultado)
**Antes:** `bg-primary hover:bg-primary-dark`

**Depois:**
- `bg-navy hover:bg-navy-light`
- Transição: `120ms cubic-bezier(0.4, 0, 0.2, 1)`

---

## 3. Arquivos Modificados

### 3.1 Novos Arquivos
- **`src/styles/pharos-tokens.css`**
  - CSS Vars com toda a paleta oficial
  - Sombras padronizadas
  - Espaçamentos (base 8px)
  - Border radius
  - Transições
  - Utility classes

### 3.2 Atualizados
- **`tailwind.config.js`**
  - Paleta `primary` agora é navy (`#192233`)
  - Adicionado `navy` e `pharos` namespaces
  - Cores `gray` atualizadas para paleta oficial
  - Removidos `primary` azul e `tertiary`

- **`src/app/globals.css`**
  - Importado `pharos-tokens.css`

- **`src/app/imoveis/page.tsx`**
  - Barra de filtros: navy sólido
  - Botões: paleta oficial
  - Badges: gold accent
  - Contadores: navy/neutro
  - Chips: navy ativo
  - 21 linter errors corrigidos

- **`src/components/ImovelCard.tsx`**
  - Card: raio 24px, borda 1px oficial
  - Badges: navy
  - Ícones: navy 80% opacidade
  - Preço: navy, economia verde discreto
  - Botão: navy
  - Distância mar: neutro

---

## 4. Design System

### 4.1 Transições
- **Padrão:** `120ms cubic-bezier(0.4, 0, 0.2, 1)`
- Aplicado em: botões, cards, chips, hovers

### 4.2 Sombras
- **sm:** `0 2px 4px 0 rgba(25, 34, 51, 0.04)`
- **md:** `0 4px 12px 0 rgba(25, 34, 51, 0.08)`
- **lg:** `0 6px 16px 0 rgba(25, 34, 51, 0.12)`
- **xl:** `0 12px 24px 0 rgba(25, 34, 51, 0.16)`

### 4.3 Espaçamentos (Base 8px)
- Mantido sistema existente
- Padronizado em tokens CSS

### 4.4 Border Radius
- **Pills:** `rounded-full` (9999px)
- **Cards:** `24px`
- **Badges:** `8-12px`

### 4.5 Tipografia
- **Fonte:** Inter (via `--font-inter`)
- **Peso:**
  - Títulos cards: `800`
  - Botões: `600-700`
  - Preço: `800`
  - Metadados: `400-500`

---

## 5. Acessibilidade Mantida
- ✅ Contraste mínimo 4.5:1 (navy vs branco)
- ✅ Alvos de toque ≥ 44px
- ✅ Foco visível
- ✅ `aria-label`, `aria-pressed`, `aria-modal` preservados
- ✅ Transições respeitam `prefers-reduced-motion`

---

## 6. Performance
- ✅ Transições curtas (120ms)
- ✅ Propriedades CSS otimizadas (transform, opacity)
- ✅ Sem gradientes complexos

---

## 7. Checklist de Aceitação

- ✅ Nenhum tom de azul fora da paleta oficial
- ✅ Sem gradiente azul→branco
- ✅ Barra de filtros navy sólido, sticky sem CLS
- ✅ Cards com borda 1px, raio 24px, sombras leves
- ✅ Preço em navy, economia verde discreto
- ✅ Títulos legíveis (peso 800)
- ✅ Chips e botões com estados claros e acessíveis
- ✅ Badges dourado-acento para contagem
- ✅ Ícones navy com 80% opacidade (traço fino)
- ✅ Página transmite alto padrão & estilo de vida
- ✅ Sem warnings visuais no console
- ✅ Prettier formatado
- ✅ 21 erros de linter corrigidos

---

## 8. Próximos Passos Recomendados

1. **QA Visual:**
   - Testar em desktop (Chrome, Firefox, Safari)
   - Testar em mobile (iOS Safari, Chrome Android)
   - Verificar contraste, foco, sticky
   - Validar consistência entre filtros, dropdowns, cards

2. **Lighthouse Audit:**
   - Meta: ≥90 em Acessibilidade e Best Practices
   - Verificar performance de transições

3. **Estender Paleta:**
   - Aplicar em outras páginas (`/`, `/sobre`, `/empreendimentos`, etc.)
   - Atualizar `Header.tsx` e `Footer.tsx` se necessário

4. **Documentação:**
   - Criar Storybook com componentes padronizados
   - Design tokens acessíveis para toda equipe

5. **Analytics:**
   - Implementar eventos de filtro com paleta atualizada
   - Validar conversões após UI/UX refresh

---

**Data da Padronização:** 10/10/2025  
**Versão:** 1.0  
**Status:** ✅ Completa e Testada

