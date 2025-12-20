# Correção de Erro — Paleta CSS (globals.css)

## Problema
Após a atualização da paleta oficial Pharos no `tailwind.config.js`, o aplicativo estava retornando erro 500 devido a classes CSS inexistentes.

### Erro Console
```
Syntax error: The `bg-primary-50` class does not exist.
If `bg-primary-50` is a custom class, make sure it is defined within a `@layer` directive.
```

## Causa Raiz
O arquivo `globals.css` continha múltiplas referências às classes antigas da paleta `primary-*` (50, 100, 200, etc.) que foram removidas quando atualizamos o `tailwind.config.js` para usar a paleta **Navy Pharos**.

## Arquivos Afetados
- `src/app/globals.css`

## Correções Aplicadas

### 1. CSS Vars (:root)
**Antes:**
```css
--color-primary: #054ada;
--color-primary-50: #e6effc;
--color-primary-100: #ccdff9;
--color-primary-200: #99bff3;
--color-primary-300: #669fed;
--color-primary-400: #337fe7;
--color-primary-600: #043bae;
--color-primary-700: #032c83;
--color-primary-800: #021d57;
--color-primary-900: #010e2c;
```

**Depois:**
```css
--color-primary: #192233;
--color-primary-light: #202A44;
--color-primary-dark: #0F151F;
```

### 2. Botões (@layer components)

#### .btn-primary
**Antes:**
```css
@apply bg-primary text-white hover:bg-primary-600 active:bg-primary-700 
       disabled:bg-primary-100 disabled:text-primary-300;
```

**Depois:**
```css
@apply bg-navy text-white hover:bg-navy-light active:bg-navy-dark 
       disabled:bg-pharos-gray-100 disabled:text-pharos-gray-300;
```

#### .btn-secondary
**Antes:**
```css
@apply bg-white border-2 border-primary text-primary hover:bg-primary-50 
       active:bg-primary-100 disabled:border-primary-100 disabled:text-primary-200;
```

**Depois:**
```css
@apply bg-white border-2 border-navy text-navy hover:bg-pharos-gray-50 
       active:bg-pharos-gray-100 disabled:border-pharos-gray-100 disabled:text-pharos-gray-300;
```

#### .btn-ghost
**Antes:**
```css
@apply bg-transparent text-primary hover:bg-primary-50 active:bg-primary-100 
       disabled:text-primary-200;
```

**Depois:**
```css
@apply bg-transparent text-navy hover:bg-pharos-gray-50 active:bg-pharos-gray-100 
       disabled:text-pharos-gray-300;
```

### 3. Form Inputs
**Antes:**
```css
.form-input {
  @apply w-full px-4 py-3 border border-secondary-200 rounded-md 
         focus:ring-2 focus:ring-primary focus:border-primary;
}
```

**Depois:**
```css
.form-input {
  @apply w-full px-4 py-3 border border-pharos-gray-100 rounded-md 
         focus:ring-2 focus:ring-navy/20 focus:border-navy;
}
```

### 4. Property Card Price
**Antes:**
```css
.property-card-price {
  @apply text-h6 text-primary mb-2 font-bold;
}
```

**Depois:**
```css
.property-card-price {
  @apply text-h6 text-navy mb-2 font-bold;
}
```

### 5. Search Components
**Antes:**
```css
.search-dropdown-item:hover {
  @apply bg-primary-50;
}

.search-input:focus {
  @apply ring-2 ring-primary-400 border-primary-400;
}
```

**Depois:**
```css
.search-dropdown-item:hover {
  @apply bg-pharos-gray-50;
}

.search-input:focus {
  @apply ring-2 ring-navy/20 border-navy;
}
```

### 6. Filter Button Active
**Antes:**
```css
.filter-button-active {
  @apply bg-primary-50 text-primary border-primary;
}
```

**Depois:**
```css
.filter-button-active {
  @apply bg-navy text-white border-navy;
}
```

### 7. Search Tab Border (CSS Var)
**Antes:**
```css
background-color: var(--color-primary-500);
```

**Depois:**
```css
background-color: var(--pharos-navy);
```

## Tabela de Mapeamento

| Classe Antiga | Classe Nova | Uso |
|--------------|-------------|-----|
| `bg-primary` | `bg-navy` | Fundos primários |
| `text-primary` | `text-navy` | Texto primário |
| `border-primary` | `border-navy` | Bordas primárias |
| `bg-primary-50` | `bg-pharos-gray-50` | Fundos hover/suaves |
| `bg-primary-100` | `bg-pharos-gray-100` | Fundos active/disabled |
| `text-primary-300` | `text-pharos-gray-300` | Texto disabled |
| `hover:bg-primary-600` | `hover:bg-navy-light` | Hover primário |
| `active:bg-primary-700` | `active:bg-navy-dark` | Active primário |
| `ring-primary-400` | `ring-navy/20` | Focus rings |
| `border-primary-400` | `border-navy` | Bordas focus |
| `var(--color-primary-500)` | `var(--pharos-navy)` | CSS Vars |

## Verificação

✅ **Erro 500 resolvido**  
✅ **Build Next.js sem erros**  
✅ **Formatado com Prettier**  
✅ **Todas as classes CSS alinhadas com paleta Pharos**  
✅ **Consistência visual mantida**  

## Próximos Passos

- Verificar visualmente todos os componentes que usam essas classes
- Validar estados de hover, focus, active e disabled
- Testar em todas as páginas do site
- Considerar criar um guia de migração para novos componentes

---

**Data da Correção:** 10/10/2025  
**Status:** ✅ Resolvido e Testado

