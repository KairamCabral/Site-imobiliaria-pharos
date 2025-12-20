# 🔄 Guia de Migração — Sistema de Cores Pharos

**Como migrar componentes existentes para o novo sistema**

---

## 📋 Visão Geral

Este guia ajuda a migrar componentes existentes que usam a paleta antiga para o novo sistema oficial Pharos.

---

## 🎯 Estratégia de Migração

### Opção 1: Migração Gradual (Recomendado)
Atualizar componentes aos poucos, página por página.

### Opção 2: Migração Completa
Atualizar tudo de uma vez (mais arriscado, mas mais rápido).

---

## 📊 Mapeamento de Cores

### De → Para (Tailwind)

| Classe Antiga | Classe Nova | Uso |
|---------------|-------------|-----|
| `bg-primary` | `bg-pharos-blue-500` | Botões, CTAs |
| `bg-primary-600` | `bg-pharos-blue-600` | Hover states |
| `bg-navy` | `bg-pharos-navy-900` | Header, footer |
| `text-secondary` | `text-pharos-slate-700` | Texto principal |
| `text-secondary-600` | `text-pharos-slate-500` | Texto secundário |
| `text-gray-500` | `text-pharos-slate-500` | Metadados |
| `border-gray-300` | `border-pharos-slate-300` | Bordas |
| `bg-white` | `bg-pharos-base-white` | Cards |
| `bg-gray-50` | `bg-pharos-base-off` | Body |

---

### De → Para (CSS Variables)

| Variável Antiga | Variável Nova | Uso |
|-----------------|---------------|-----|
| `var(--color-primary)` | `var(--ph-blue-500)` | Azul principal |
| `var(--color-secondary)` | `var(--ph-navy-900)` | Navy escuro |
| `var(--pharos-navy)` | `var(--ph-navy-900)` | Navy escuro |
| `var(--pharos-gray-500)` | `var(--ph-slate-500)` | Cinza médio |
| `var(--pharos-gray-300)` | `var(--ph-slate-300)` | Cinza claro |
| `var(--pharos-white)` | `var(--ph-white)` | Branco |
| `var(--pharos-gold)` | `var(--ph-gold)` | Dourado |

---

## 🔍 Como Encontrar Usos Antigos

### Buscar no Terminal

```bash
# Buscar classes Tailwind antigas
grep -r "bg-primary" src/
grep -r "text-secondary" src/
grep -r "border-gray" src/

# Buscar CSS variables antigas
grep -r "var(--color-" src/
grep -r "var(--pharos-navy)" src/
grep -r "var(--pharos-gray-" src/

# Buscar hex codes soltos
grep -r "#054ADA" src/
grep -r "#192233" src/
```

### Buscar no VS Code/Cursor

1. `Ctrl+Shift+F` (Windows/Linux) ou `Cmd+Shift+F` (Mac)
2. Buscar por:
   - `bg-primary`
   - `text-secondary`
   - `var(--color-`
   - `#054ADA`
   - `#192233`

---

## 🛠️ Exemplos de Migração

### Exemplo 1: Botão Primário

**Antes:**
```jsx
<button className="bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-md">
  Ver Detalhes
</button>
```

**Depois:**
```jsx
<button className="bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white px-6 py-3 rounded-lg">
  Ver Detalhes
</button>
```

---

### Exemplo 2: Card de Imóvel

**Antes:**
```jsx
<div className="bg-white border border-gray-300 rounded-lg shadow-card">
  <h3 className="text-secondary-800">Título</h3>
  <p className="text-gray-600">Descrição</p>
</div>
```

**Depois:**
```jsx
<div className="bg-pharos-base-white border border-pharos-slate-300 rounded-2xl shadow-card">
  <h3 className="text-pharos-navy-900">Título</h3>
  <p className="text-pharos-slate-700">Descrição</p>
</div>
```

---

### Exemplo 3: Header

**Antes:**
```jsx
<header className="bg-navy text-white">
  <nav>
    <a href="/" className="text-white hover:text-gray-300">Home</a>
  </nav>
</header>
```

**Depois:**
```jsx
<header className="bg-pharos-navy-900 text-pharos-base-white">
  <nav>
    <a href="/" className="text-pharos-base-white hover:text-pharos-gold-500">Home</a>
  </nav>
</header>
```

---

### Exemplo 4: CSS Personalizado

**Antes:**
```css
.custom-component {
  background-color: #054ADA;
  color: #FFFFFF;
  border: 1px solid #C9D1E0;
}

.custom-component:hover {
  background-color: #043BAE;
}
```

**Depois:**
```css
.custom-component {
  background-color: var(--ph-blue-500);
  color: var(--ph-white);
  border: 1px solid var(--ph-slate-300);
}

.custom-component:hover {
  background-color: var(--ph-blue-600);
}
```

---

## 📝 Checklist por Componente

### Header
- [ ] Background: `bg-pharos-navy-900`
- [ ] Texto: `text-pharos-base-white`
- [ ] Links hover: `hover:text-pharos-gold-500`
- [ ] CTAs: `bg-pharos-blue-500`

### Cards
- [ ] Background: `bg-pharos-base-white`
- [ ] Borda: `border-pharos-slate-300`
- [ ] Título: `text-pharos-navy-900`
- [ ] Descrição: `text-pharos-slate-700`
- [ ] Metadados: `text-pharos-slate-500`
- [ ] Sombra: `shadow-card`

### Botões
- [ ] Primário: `bg-pharos-blue-500 hover:bg-pharos-blue-600`
- [ ] Texto: `text-white`
- [ ] Raio: `rounded-lg` (14px)
- [ ] Focus: `focus:ring-2 focus:ring-pharos-blue-500`

### Formulários
- [ ] Campo: `border-pharos-slate-300`
- [ ] Focus: `focus:border-pharos-blue-500`
- [ ] Label: `text-pharos-slate-700`
- [ ] Helper: `text-pharos-slate-500`
- [ ] Error: `border-red-500 text-red-500`

### Footer
- [ ] Background: `bg-pharos-navy-900`
- [ ] Texto: `text-pharos-base-white`
- [ ] Links: `hover:text-pharos-gold-500`
- [ ] Divisor dourado: `border-t border-pharos-gold-500`

---

## 🧪 Testes Após Migração

### 1. Validar Visualmente
- [ ] Header e navegação
- [ ] Hero section
- [ ] Cards de imóveis
- [ ] Formulários de contato
- [ ] Footer
- [ ] Botões e CTAs

### 2. Validar Contraste
```bash
# Rodar Lighthouse
npm run build
npm run start
# Chrome DevTools → Lighthouse → Accessibility
```

### 3. Validar Responsividade
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)

### 4. Validar Estados Interativos
- [ ] Hover
- [ ] Focus (navegação por teclado)
- [ ] Active
- [ ] Disabled

---

## 🚨 Cuidados Importantes

### ❌ Não Fazer

1. **Não misturar sistemas**
   ```jsx
   {/* ❌ Errado */}
   <button className="bg-primary hover:bg-pharos-blue-600">
   
   {/* ✅ Correto */}
   <button className="bg-pharos-blue-500 hover:bg-pharos-blue-600">
   ```

2. **Não usar hex codes soltos**
   ```css
   /* ❌ Errado */
   .component { color: #054ADA; }
   
   /* ✅ Correto */
   .component { color: var(--ph-blue-500); }
   ```

3. **Não usar Slate 300 em texto**
   ```jsx
   {/* ❌ Errado */}
   <p className="text-pharos-slate-300">Texto</p>
   
   {/* ✅ Correto */}
   <div className="border-pharos-slate-300">...</div>
   ```

---

## 🔄 Script de Migração Automatizada (Opcional)

### Find & Replace em Massa

**VS Code / Cursor:**

1. `Ctrl+Shift+H` (Find & Replace em todos os arquivos)
2. Substituir:

```
bg-primary-600       →  bg-pharos-blue-600
bg-primary           →  bg-pharos-blue-500
bg-navy              →  bg-pharos-navy-900
text-secondary-800   →  text-pharos-navy-900
text-secondary-700   →  text-pharos-slate-700
text-secondary-600   →  text-pharos-slate-500
border-gray-300      →  border-pharos-slate-300
bg-gray-50           →  bg-pharos-base-off
```

⚠️ **Cuidado:** Sempre revisar as mudanças antes de aplicar!

---

## 📊 Priorização de Migração

### Fase 1 (Alta Prioridade)
1. Header e Footer
2. Botões e CTAs globais
3. Cards de imóveis (página principal)

### Fase 2 (Média Prioridade)
4. Formulários de contato
5. Filtros e barra de busca
6. Páginas de listagem

### Fase 3 (Baixa Prioridade)
7. Páginas secundárias
8. Componentes internos
9. Estados de erro/sucesso

---

## ✅ Checklist Final

### Antes de fazer commit:
- [ ] Todos os componentes migrados testados visualmente
- [ ] Nenhum hex code solto no código
- [ ] Contraste validado (Lighthouse ≥90)
- [ ] Responsividade testada
- [ ] Estados interativos funcionando
- [ ] Sem erros no console
- [ ] Build rodando sem erros (`npm run build`)

---

## 📞 Suporte

Se encontrar dificuldades:

1. Consultar o **GUIA-COR-IDENTIDADE-PHAROS.md**
2. Ver exemplos práticos em **EXEMPLOS-PRATICOS-CORES.md**
3. Verificar contraste em **RELATORIO-CONTRASTE-WCAG.md**

---

**Boa migração!** 🚀  
Lembre-se: é melhor migrar aos poucos e com qualidade do que tudo de uma vez e com bugs.

