# Estrutura de Cores Dual — Site Pharos

## Objetivo
Manter **duas paletas de cores distintas** no site:
- **Azul Original** (#054ADA) - Para cards de imóveis, home page e páginas gerais
- **Navy Pharos** (#192233) - Exclusivo para a página `/imoveis` (listagem de imóveis)

---

## Paletas Implementadas

### 1. Azul Original (Primary) - Uso Geral
**Onde usar:** Cards de imóveis, home page, páginas institucionais, componentes gerais

```css
primary: {
  50: '#E6EFFC',
  100: '#CCDFF9',
  200: '#99BFF3',
  300: '#669FED',
  400: '#337FE7',
  DEFAULT: '#054ADA',  // Cor principal
  600: '#043BAE',
  700: '#032C83',
  800: '#021D57',
  900: '#010E2C',
}
```

**Classes Tailwind:**
- `bg-primary` - Fundo azul
- `text-primary` - Texto azul
- `border-primary` - Borda azul
- `bg-primary-50` - Fundo azul claro (hovers)
- `hover:bg-primary` - Hover azul

---

### 2. Navy Pharos - Página /imoveis
**Onde usar:** Exclusivamente na página `/imoveis` (barra de filtros, dropdowns, botões)

```css
navy: {
  DEFAULT: '#192233',  // Navy Pharos
  light: '#202A44',
  dark: '#0F151F',
}
```

**Classes Tailwind:**
- `bg-navy` - Fundo navy
- `text-navy` - Texto navy
- `border-navy` - Borda navy
- `hover:bg-navy-light` - Hover navy
- `bg-pharos-gray-50` - Fundos suaves neutros

---

### 3. Cores Complementares (Ambas Paletas)

**Pharos Gray (neutros):**
```css
pharos: {
  gray: {
    50: '#F5F7FA',   // Fundos suaves
    100: '#E8ECF2',  // Bordas
    300: '#C9D1E0',  // Divisores
    500: '#8E99AB',  // Texto secundário
  },
  gold: '#C8A968',      // Badges de contagem
  success: '#2FBF71',   // Economia
  warning: '#F5A524',   // Alertas
  error: '#E5484D',     // Erros
}
```

---

## Mapeamento por Componente

### ✅ Azul Original (Primary)

| Componente | Classes | Localização |
|-----------|---------|-------------|
| **Cards de Imóveis** | `text-primary`, `bg-primary/90` | `ImovelCard.tsx` |
| **Título Card** | `group-hover:text-primary` | `ImovelCard.tsx` |
| **Ícones Card** | `text-primary` | `ImovelCard.tsx` |
| **Preço Card** | `text-primary` | `ImovelCard.tsx` |
| **Badge Distância Mar** | `bg-blue-50 text-blue-600` | `ImovelCard.tsx` |
| **Botão CTA Card** | `hover:bg-primary` | `ImovelCard.tsx` |
| **Botões Gerais** | `.btn-primary` | `globals.css` |
| **Form Inputs** | `focus:ring-primary focus:border-primary` | `globals.css` |
| **Search Tabs** | `background-color: var(--color-primary)` | `globals.css` |

### 🔵 Navy Pharos

| Componente | Classes | Localização |
|-----------|---------|-------------|
| **Barra de Filtros** | `bg-navy` | `/imoveis/page.tsx` |
| **Botões Filtro (ativo)** | `bg-navy text-white` | `/imoveis/page.tsx` |
| **Botões Filtro (normal)** | `bg-pharos-gray-50 text-navy` | `/imoveis/page.tsx` |
| **Badges Contagem** | `bg-pharos-gold text-navy` | `/imoveis/page.tsx` |
| **Contadores (ativo)** | `bg-navy text-white` | `/imoveis/page.tsx` |
| **Dropdowns** | `border-navy focus:ring-navy/20` | `/imoveis/page.tsx` |
| **Botão Limpar Filtros** | `text-navy border-pharos-gray-100` | `/imoveis/page.tsx` |
| **Empty State** | `bg-navy hover:bg-navy-light` | `/imoveis/page.tsx` |

---

## CSS Vars (globals.css)

```css
:root {
  /* Azul Original - Uso Geral */
  --color-primary: #054ada;
  --color-primary-50: #e6effc;
  --color-primary-100: #ccdff9;
  --color-primary-400: #337fe7;
  --color-primary-600: #043bae;
  --color-primary-700: #032c83;
  
  /* Navy Pharos - Variável adicional */
  --pharos-navy: #192233;
  --pharos-navy-light: #202A44;
}
```

---

## Guia de Uso

### ❓ Quando usar Primary (Azul)?

✅ Cards de imóveis exibidos na home  
✅ Cards de imóveis em listagens gerais  
✅ Páginas institucionais (sobre, contato)  
✅ Componentes de navegação (header, footer)  
✅ Botões de ação gerais  
✅ Links e elementos interativos  

### ❓ Quando usar Navy (Pharos)?

✅ **APENAS** na página `/imoveis`  
✅ Barra de filtros sticky  
✅ Dropdowns de filtro  
✅ Botões de ação específicos da página  
✅ Estados ativos de filtros  

---

## Exemplos Práticos

### Card de Imóvel (Azul Original)
```jsx
// ImovelCard.tsx
<div className="border border-gray-100">
  {/* Badge */}
  <span className="bg-primary/90 text-white">Destaque</span>
  
  {/* Título */}
  <h3 className="text-gray-900 group-hover:text-primary">
    Apartamento de Luxo
  </h3>
  
  {/* Ícone */}
  <svg className="text-primary">...</svg>
  
  {/* Preço */}
  <span className="text-primary font-bold">R$ 2.500.000</span>
  
  {/* Botão */}
  <button className="bg-gray-900 hover:bg-primary">
    Ver Detalhes
  </button>
</div>
```

### Barra de Filtros (Navy Pharos)
```jsx
// /imoveis/page.tsx
<div className="bg-navy sticky top-0">
  {/* Botão Normal */}
  <button className="bg-pharos-gray-50 text-navy border-pharos-gray-100">
    LOCALIZAÇÃO
  </button>
  
  {/* Botão Ativo */}
  <button className="bg-navy text-white">
    TIPO DO IMÓVEL
  </button>
  
  {/* Badge */}
  <span className="bg-pharos-gold text-navy">3</span>
  
  {/* Contador Ativo */}
  <button className="bg-navy text-white">2</button>
</div>
```

---

## Verificação Rápida

### ✅ Checklist de Implementação

- ✅ `tailwind.config.js` - Ambas paletas definidas
- ✅ `globals.css` - CSS vars para azul original
- ✅ `ImovelCard.tsx` - Usando `primary` (azul)
- ✅ `/imoveis/page.tsx` - Usando `navy` exclusivamente
- ✅ Home page - Usando `primary` (azul)
- ✅ Sem conflitos de cores entre páginas

---

## Manutenção

### Para adicionar novos componentes:

1. **Se for para home/geral:** Use `primary` (azul)
2. **Se for para /imoveis:** Use `navy` (Pharos)
3. **Se for neutro:** Use `pharos.gray.*`

### Para modificar cores:

1. **Azul geral:** Edite `tailwind.config.js` → `primary`
2. **Navy /imoveis:** Edite `tailwind.config.js` → `navy`
3. **CSS Vars:** Edite `globals.css` → `:root`

---

**Data:** 10/10/2025  
**Status:** ✅ Implementado e Funcional  
**Versão:** 1.0

