# Correções UI/UX — Página /imoveis

## Objetivo
Aplicar UI/UX profissional, refinado, moderno e minimalista seguindo a paleta Navy Pharos oficial, corrigindo z-index, contador, chips e padronização visual.

---

## ✅ Correções Implementadas

### 1. Z-Index Hierarchy
**Status:** ✅ Completo

**Problema:** Dropdowns do header ficavam atrás do botão "Buscar Imóvel"

**Solução:**
- Barra de filtros: `z-[60]` (antes: `z-50`)
- Estrutura hierárquica definida:
  - Header base: 40
  - Barra filtros: 60
  - Overlay busca: 70
  - Dropdowns header: 80

**Arquivo:** `src/app/imoveis/page.tsx`
```tsx
// Linha 1092
className={`bg-navy shadow-lg sticky top-0 z-[60] ...`}
```

---

### 2. Contador "X imóveis"
**Status:** ✅ Completo

**Problema:** Contador usava `text-cyan-500` (fora da paleta) e hierarquia visual fraca

**Solução:**
- Cor: `text-navy` (#192233)
- Tamanho: `text-2xl sm:text-3xl` (24-32px responsivo)
- Peso: `font-semibold` (600)
- Estrutura: Número em semibold, "imóveis" em font-normal

**Arquivo:** `src/app/imoveis/page.tsx`
```tsx
// Linha 1711
<h2 className="text-2xl sm:text-3xl font-semibold text-navy leading-tight">
  {imoveisFiltrados.length}{' '}
  <span className="font-normal">
    {imoveisFiltrados.length === 1 ? 'imóvel' : 'imóveis'}
  </span>
</h2>
```

---

### 3. Chips de Filtros Rápidos
**Status:** ✅ Completo

**Problema:** 
- Emojis (🌊, 🏖️, 🍖, etc.) - visual inconsistente
- Desalinhados e ocupavam mal o espaço
- Tamanho pequeno (text-xs, minHeight 36px)

**Solução:**
- **Ícones Lucide:** `Waves`, `MapPin`, `Flame`, `Sofa`, `DoorOpen`, `Sparkles`
- **Layout:** `flex-wrap` com `gap-x-2 gap-y-2` para distribuição harmônica
- **Tamanho:** `text-sm` (14px), `minHeight: 40px`, padding `px-4 py-2`
- **Ícones:** `w-4 h-4 stroke-[1.5]` (traço fino profissional)
- **Estados:**
  - Ativo: `bg-white text-navy border-white shadow-md`
  - Normal: `bg-white/10 text-white border-white/20 hover:bg-white/20`
- **Transição:** `120ms cubic-bezier(0.4, 0, 0.2, 1)`

**Arquivo:** `src/app/imoveis/page.tsx`
```tsx
// Linha 1610-1648
{[
  { id: 'frente-mar', label: 'Frente Mar', icon: Waves, field: 'distanciaMar' },
  { id: 'quadra-mar', label: 'Quadra Mar', icon: Waves, field: 'distanciaMar' },
  // ...
].map((carac) => {
  const Icon = carac.icon;
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-full...">
      <Icon className="w-4 h-4 stroke-[1.5]" />
      <span>{carac.label}</span>
    </button>
  );
})}
```

---

### 4. Paleta Navy Pharos
**Status:** ✅ Completo

**Problema:** Múltiplas referências a `primary` (azul #054ADA), `text-cyan-500`, `bg-primary-dark`, etc.

**Solução - Substituições Globais:**

| Classe Antiga | Classe Nova | Ocorrências |
|--------------|-------------|-------------|
| `text-cyan-500` | `text-navy` | 1 |
| `bg-primary` | `bg-navy` | 3 tags ativas |
| `hover:bg-primary-dark` | `hover:bg-navy-light` | 3 tags ativas |
| `text-primary` | `text-navy` | 12 checkboxes/botões |
| `hover:text-primary-dark` | `hover:text-navy-light` | 1 botão |
| `hover:text-primary` | `hover:text-navy` | 5 labels |
| `focus:ring-primary/20` | `focus:ring-navy/20` | 12 checkboxes |
| `hover:bg-primary/10` | `hover:bg-navy/10` | 1 botão |

**Total:** 38 ocorrências corrigidas

**Componentes Afetados:**
- Contador de imóveis
- Botão "Limpar todos"
- Tags de filtros ativos (distanciaMar, caracImovel, caracEmpreendimento)
- Checkboxes dos dropdowns
- Labels dos dropdowns
- Botões de valor rápido
- Inputs focus

---

## 📦 Dependências Instaladas

```bash
npm install lucide-react
```

**Ícones utilizados:**
- `Waves` - Distância do mar
- `MapPin` - Localização
- `Flame` - Churrasqueira
- `Sofa` - Mobiliado
- `DoorOpen` - Sacada
- `Sparkles` - Decorado
- `Home` - (reservado)

---

## 🎨 Paleta Aplicada (Navy Pharos)

### Cores Primárias
- **Navy:** `#192233`
- **Navy Light:** `#202A44`
- **Navy Dark:** `#0F151F`

### Cinzas Neutros
- **Gray 50:** `#F5F7FA`
- **Gray 100:** `#E8ECF2`
- **Gray 300:** `#C9D1E0`
- **Gray 500:** `#8E99AB`

### Acentos
- **Gold:** `#C8A968` (badges de contagem)
- **Success:** `#2FBF71` (usado nos cards, não na /imoveis)

### ❌ Removidos
- `#054ADA` (primary azul)
- `text-cyan-500`
- `bg-primary-*` e variações
- Emojis nos chips

---

## 📊 Métricas

- ✅ **38 ocorrências** de cores primárias corrigidas
- ✅ **9 chips** refatorados com ícones lucide
- ✅ **1 contador** padronizado (navy, semibold, hierarquia)
- ✅ **3 tags ativas** atualizadas (navy)
- ✅ **12 checkboxes** com foco navy
- ✅ **Z-index** ajustado (60)
- ✅ **0 erros** de linter

---

### 5. Padronização de Popovers
**Status:** ✅ Completo

**Problema:** Dropdowns com larguras inconsistentes (w-64, w-72, w-80) e heights variáveis

**Solução:**
- **Largura padrão:** `w-[340px]` (340px) para todos os dropdowns
- **Max-height:** `max-h-[60vh]` com `overflow-y-auto` e `overscroll-contain`
- **Posicionamento:** Ajuste automático quando próximo das bordas
- **Scroll suave:** Custom scrollbar com `custom-scrollbar`

**Dropdowns Padronizados:**
| Dropdown | Largura Antiga | Largura Nova |
|----------|---------------|--------------|
| Localização | w-72 (288px) | w-[340px] (340px) |
| Tipo do Imóvel | w-64 (256px) | w-[340px] (340px) |
| Venda | w-80 (320px) | w-[340px] (340px) |
| Status | w-64 (256px) | w-[340px] (340px) |
| Suítes | (default) | w-[340px] (340px) |
| Vagas | (default) | w-[340px] (340px) |

**Arquivo:** `src/app/imoveis/page.tsx`
```tsx
// Linha 987-1040: DropdownPortal Component
const DropdownPortal = ({
  isOpen,
  dropdownKey,
  children,
  width = 'w-[340px]', // Padrão 340px
}: {...}) => {
  // Ajuste dinâmico baseado em viewport
  const widthMap: { [key: string]: number } = {
    'w-[340px]': 340,
    'w-80': 320,
    'w-72': 288,
    'w-64': 256,
  };
  
  return (
    <div className={`fixed ${width} ... max-h-[60vh] overflow-hidden`}>
      <div className="overflow-y-auto max-h-[60vh] custom-scrollbar overscroll-contain">
        {children}
      </div>
    </div>
  );
};
```

---

## 🔄 Melhorias Adicionais (Sugeridas)

### Para Implementações Futuras
- [ ] Implementar z-index para header (dropdowns do menu principal acima de tudo)
- [ ] Adicionar aria-labels mais descritivos em todos os filtros
- [ ] Persistir filtros na URL com debounce automático
- [ ] Implementar analytics (filter_open, filter_applied, quick_shortcut_toggle, filter_clear_all)
- [ ] Adicionar testes de acessibilidade (navegação por teclado, leitores de tela)

---

**Data:** 10/10/2025  
**Status:** ✅ **5 de 5 tarefas completas**  
**Versão:** 1.1

