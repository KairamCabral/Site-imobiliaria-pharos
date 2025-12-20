# Card de Imóvel Premium — Documentação Completa

## Visão Geral

Card horizontal de alto padrão com carrossel de fotos, metadados ordenados, exibição de taxas (Condomínio/IPTU) e sistema de favoritos minimalista.

---

## 1. Dimensões e Layout

### Desktop (≥768px)
- **Orientação**: Horizontal (3 colunas)
- **Altura FIXA**: 280px (md) → 300px (lg) - **garante consistência**
- **Cantos**: `border-radius: 22px`
- **Borda**: `1px solid var(--ph-slate-300)` (#E8ECF2)
- **Sombra padrão**: `0 6px 20px rgba(25,34,51,0.08)`
- **Sombra hover**: `0 10px 28px rgba(25,34,51,0.12)`
- **Imagem**: `height: 100%` (ocupa toda a altura do card)

### Grid Interno (3 Colunas)

| Coluna | Largura | Conteúdo |
|--------|---------|----------|
| **A - Mídia** | 42% | Carrossel de fotos com badges e favorito (altura 100%) |
| **B - Info** | 36% | Título, localização, metadados (flex-1, `overflow-hidden`) |
| **C - CTA** | 22% | Preço, taxas e botões de ação (`flex-shrink-0`) |

- **Divisor vertical** entre Col B e Col C: `1px var(--ph-slate-300)` com 60% opacidade

### Mobile (<768px)
- **Orientação**: **Vertical** (igual ao card da home)
- **Layout**: Imagem no topo (240px altura) → Conteúdo → Preço/CTA no rodapé
- **CTA**: Botões full-width empilhados
- **Breakpoint**: `md:` (768px) para mudar para layout horizontal

---

## 2. Carrossel de Fotos (Col A)

### Funcionalidades
- **Swipe/Touch**: Suporte nativo para dispositivos touch
- **Setas Flutuantes**: 24–28px, discretas, aparecem no hover (desktop)
- **Indicadores (Dots)**: Alinhados no canto inferior direito
- **Aspect Ratio**: 3:2 (`aspect-ratio: 3/2`)
- **Object Fit**: `cover` (preenchimento sem distorção)
- **Lazy Loading**: Carrega apenas a 1ª imagem com prioridade, demais com `lazy`

### Badges
- **Posição**: Canto superior esquerdo
- **Estilo**: Pill com `bg-[#192233]`, texto branco
- **Exemplos**: "Exclusivo", "Lançamento", "Venda Rápida"

### Botão Favoritar (ver §5)
- **Posição**: Canto superior direito
- **Z-index**: Acima das setas, sem obstrução

### Acessibilidade
- `role="region"`
- `aria-roledescription="carousel"`
- `aria-label="Galeria de fotos do imóvel"`
- Botões com `aria-label` descritivo
- Dots com `aria-current="true"` para foto ativa

---

## 3. Conteúdo Central (Col B)

### 3.1 Título
- **Elemento**: `<h3>`
- **Tipografia**: 22–24px, `font-semibold` (600)
- **Cor**: `var(--ph-navy-900)` (#192233)
- **Limite**: 2 linhas (`line-clamp-2`)
- **Hover**: Muda para `var(--ph-blue-500)` (#054ada)

### 3.2 Localização
- **Ícone**: `MapPin` (Lucide) 16px
- **Formato**: "{bairro}, {cidade}" (se bairro ausente, apenas cidade)
- **Cor**: `var(--ph-slate-500)` (#8E99AB)
- **Tamanho**: 14px

### 3.3 Metadados (Ordem FIXA)

**Ordem obrigatória**:
1. **Quartos** (ícone `Bed`)
2. **Suítes** (ícone `Bath` - banheira)
3. **Vagas** (ícone `Car`)
4. **Área Privativa** (ícone `Maximize2`)

**Estilo**:
- **Tipografia**: 15px, `font-medium`
- **Ícones**: 17px, cor `var(--ph-slate-500)`
- **Separador**: Bullet (•) opcional entre itens
- **Gap**: 16px entre itens (`gap-4`)
- **Formato números**: Separador de milhar (ex: "2.500 m²")

**Regras**:
- Ocultar itens com valor `undefined`, `null` ou `0`
- **Nunca** mostrar "–" ou placeholders

### 3.4 Tags Opcionais
- **Formato**: Pills arredondados
- **Cor de fundo**: `var(--ph-offwhite)` (#F5F7FA)
- **Cor de texto**: `var(--ph-slate-700)` (#192233)
- **Tamanho**: 12px, `font-medium`
- **Exemplos**: "Frente mar", "Pet friendly", "Mobiliado"

---

## 4. Preço, Taxas e Economia (Col C)

### 4.1 Preço Atual
- **Tipografia**: 24–26px, `font-extrabold` (800)
- **Cor**: `var(--ph-navy-900)` (#192233)
- **Formato**: R$ 4.500.000 (sem centavos, separador milhar)

### 4.2 Preço Antigo (se houver)
- **Estilo**: Tachado (`line-through`)
- **Cor**: `var(--ph-slate-500)` (#8E99AB)
- **Tamanho**: 14px

### 4.3 Economia
- **Formato**: Pill pequeno com ícone `TrendingDown`
- **Cor de fundo**: `bg-[#2FBF71]/10` (verde claro)
- **Cor de texto**: `#2FBF71` (verde)
- **Tamanho**: 12px, `font-semibold`
- **Texto**: "Economize R$ 300.000"

### 4.4 Taxas

**Condomínio** (exibir APENAS se houver valor):
```
Condomínio: R$ 2.800/mês
```

**IPTU** (exibir APENAS se houver valor):
```
IPTU: R$ 15.000/ano
```

**Estilo**:
- **Tipografia**: 14px
- **Cor label**: `var(--ph-slate-500)` (#8E99AB)
- **Cor valor**: `var(--ph-navy-900)` (#192233), `font-medium`
- **Alinhamento**: Vertical consistente

---

## 5. Favoritar (Minimalista)

### Design
- **Forma**: Circular 40px
- **Borda**: `1px var(--ph-slate-300)` (#E8ECF2)
- **Fundo**: Branco translúcido 90% (`bg-white/90`) com `backdrop-blur-sm`
- **Ícone**: Coração (`Heart`) 20px, traço fino
  - **Inativo**: `stroke-[#192233]` (navy)
  - **Ativo**: `fill-[#054ada] stroke-[#054ada]` (azul preenchido)

### Estados
- **Hover**: Leve elevação (`scale-105`) + sombra suave
- **Focus**: Anel azul 2px (`ring-2 ring-[#054ada]`)
- **Touch**: Tamanho mínimo 44px para acessibilidade

### Comportamento
- **Sem contador** de likes
- **Sem animações** excessivas
- **Analytics**: Dispara evento `card_favorite_toggle` com `property_id`

---

## 6. Ações (Col C - Rodapé)

### 6.1 Botão Primário: "Saiba mais"
- **Fundo**: `var(--ph-navy-900)` (#192233)
- **Texto**: Branco
- **Hover**: 6–8% mais claro (`bg-[#2a3547]`)
- **Tamanho**: `py-3`, `rounded-xl`, `font-semibold` (14px)
- **Largura**: 100%
- **Altura mínima**: 44px (touch target)
- **Efeito click**: `active:scale-[0.98]`

### 6.2 Botão Secundário: "Compartilhar"
- **Borda**: `1px var(--ph-slate-300)`
- **Fundo**: Branco / Hover: `var(--ph-offwhite)`
- **Texto**: `var(--ph-navy-900)`
- **Ícone**: `Share2` 18px
- **Tamanho**: `py-2.5`, `rounded-xl`, `font-medium` (14px)
- **Largura**: 100%
- **Altura mínima**: 44px

---

## 7. Contador de Resultados "{N} imóveis"

### Redução de Hierarquia
- **Elemento**: `<h6>` (antes era `<h1>`)
- **Tipografia**: 14–16px, `font-semibold`
- **Cor**: `var(--ph-slate-500)` (#8E99AB)
- **Exemplo**: "8 imóveis • 2 filtros ativos"
- **Margem**: `mb-4` (8–12px)

---

## 8. Estados e Microcopy

### Skeleton Loading
- **Cor**: `var(--ph-slate-300)` (#E8ECF2) / `var(--ph-offwhite)` (#F5F7FA)
- **Animação**: Pulse leve
- **Duração**: 1.5s

### Empty State
- **Ícone**: Ilustração SVG ou ícone grande
- **Mensagem**: "Nenhum imóvel encontrado"
- **Sugestão**: "Tente ajustar os filtros" + botão "Limpar filtros"

---

## 9. TypeScript - Props Esperadas

```typescript
interface PropertyImage {
  src: string;
  alt?: string;
}

interface PropertyCardHorizontalProps {
  id: string;
  slug: string;
  titulo: string;
  bairro?: string;
  cidade: string;
  imagens: PropertyImage[];
  quartos?: number;
  suites?: number;
  vagas?: number;
  areaPrivativa?: number;
  precoAtual: number;
  precoAntigo?: number;
  condominio?: number;
  iptuAnual?: number;
  badges?: string[];
  tags?: string[];
  favorito?: boolean;
}
```

### Regras de Dados
- **Ocultar itens vazios**: Campos com `undefined`, `null` ou `0` não renderizam
- **Nunca mostrar "–"**: Preferir ocultar a mostrar placeholders
- **Formatar números**: Usar `Intl.NumberFormat('pt-BR')` para preços e área

---

## 10. Acessibilidade (WCAG 2.1 AA)

### Teclado
- **Tab**: Navega entre links, botões e controles do carrossel
- **Enter/Space**: Ativa botões
- **Arrow Left/Right**: Navega no carrossel (quando focado)
- **Esc**: Fecha modais (se aplicável)

### ARIA
- Carrossel com `role="region"` e `aria-roledescription`
- Botões com `aria-label` descritivo
- Dots com `aria-current` para estado ativo
- Favorito com estado `aria-pressed` (se implementado como toggle)

### Touch Targets
- **Tamanho mínimo**: 44×44px (iOS/Android)
- **Espaçamento**: 8px entre alvos adjacentes

---

## 11. Performance

### Otimizações
- **Lazy Loading**: Imagens além da 1ª com `loading="lazy"`
- **Priority**: 1ª imagem com `priority={true}` (Next.js)
- **Responsive Images**: `srcset` e `sizes` para diferentes resoluções
- **Virtualização**: Para listas >30 cards (via React Window ou similar)
- **Debounce**: Scroll events com 100-200ms

### Web Vitals
- **LCP**: < 2.5s (First Contentful Paint otimizado)
- **CLS**: < 0.1 (sem layout shifts com `aspect-ratio`)
- **FID**: < 100ms (interações responsivas)

---

## 12. Analytics

### Eventos Implementados

| Evento | Trigger | Payload |
|--------|---------|---------|
| `card_favorite_toggle` | Click em Favoritar | `property_id`, `favorited` |
| `card_contact_click` | Click em "Saiba mais" | `property_id`, `property_title` |
| `card_share` | Click em Compartilhar | `property_id`, `method` |
| `carousel_navigate` | Troca de foto | `property_id`, `image_index` |

---

## 13. Critérios de Aceitação

### ✅ Checklist

- [x] Card maior (280–320px) com layout horizontal (3 colunas) no desktop
- [x] Carrossel funcional com swipe, setas flutuantes e dots
- [x] Metadados na ordem: Quartos → Suítes (banheira) → Vagas → Área
- [x] Condomínio e IPTU exibidos apenas quando houver valor
- [x] Botão favoritar minimalista (ícone 20px, outline leve)
- [x] Preço antigo tachado e "Economize" quando aplicável
- [x] Contador "{N} imóveis encontrados" discreto (H6 14–16, Slate 500)
- [x] Paleta/tokens Pharos aplicados (sem novos azuis)
- [x] Acessibilidade (ARIA, teclado, touch targets ≥44px)
- [x] Performance (lazy loading, skeleton, virtualização)
- [x] Responsivo: **vertical no mobile (<768px)**, horizontal no desktop

---

## 14. Arquivos Principais

### Componente
```
imobiliaria-pharos/src/components/PropertyCardHorizontal.tsx
```

### Página de Listagem
```
imobiliaria-pharos/src/app/imoveis/page.tsx
```

### Design Tokens
```
imobiliaria-pharos/src/styles/pharos-tokens.css
```

---

## 15. Próximos Passos (Opcional)

1. **Implementar virtualização** para listas com >30 cards
2. **Adicionar animações** de transição no carrossel (Framer Motion)
3. **Sistema de cache** para imagens favoritadas (localStorage)
4. **Comparação de imóveis** (multi-select com até 3 cards)
5. **Preview 360°** integrado no carrossel (quando disponível)

---

## Changelog

- **11/10/2025**: Criação do card premium com carrossel e taxas
- **11/10/2025**: Adicionado sistema de favoritos minimalista
- **11/10/2025**: Redução de hierarquia do contador de resultados
- **11/10/2025**: Ícone de suítes alterado para banheira (`Bath`)
- **11/10/2025**: Texto alterado para "X imóveis encontrados"
- **11/10/2025**: Card mobile redesenhado para ficar **idêntico ao da home**:
  - Layout vertical com aspect-ratio 4:3
  - Localização acima do título
  - Metadados com ícones SVG e texto maior
  - Botão "Ver Detalhes" com seta
  - Preço em azul (#054ada)
- **11/10/2025**: Responsividade do filtro de ordenação ajustada:
  - Texto "Filtros" oculto em mobile extra pequeno
  - Select de ordenação com `flex-1` para ocupar espaço disponível
  - Texto menor em mobile (xs) e normal em desktop (sm+)
  - Padding ajustado para melhor fit
- **11/10/2025**: **Hierarquia visual invertida** nos controles:
  - Botão "Mais Filtros" agora é PRIMÁRIO (Navy, bold, maior)
  - Ordenação SECUNDÁRIA (texto discreto, sem fundo/borda)
  - Badge contador com `animate-pulse` quando há filtros ativos
- **11/10/2025**: **Card com altura fixa** para evitar desproporção:
  - Desktop: `h-[280px]` (md) → `h-[300px]` (lg)
  - Imagem ocupa 100% da altura (`h-full`)
  - Conteúdo central com `overflow-hidden` e espaçamento otimizado
  - Coluna direita mais compacta (22%, padding reduzido)
  - Metadados e textos responsivos (tamanhos menores em md, maiores em lg)
  - Preços e botões com `flex-shrink-0` para evitar compressão
  - **Resultado**: Card sempre proporcional, independente da quantidade de informação
- **11/10/2025**: **Sistema completo de tags e badges** (igual à home):
  - **Tipo do imóvel** (branco/navy, sempre visível)
  - **Primeira característica** (azul/branco, ex: "Frente mar")
  - **Venda Rápida** (vermelho pulsando, quando há desconto)
  - **Badges adicionais** (navy/branco: Exclusivo, Lançamento)
  - **Distância do mar** (azul claro, desktop: ao lado localização, mobile: abaixo metadados)
  - **Tags secundárias** (cinza, mobile only: Mobiliado, Pet friendly, Entrega)
  - Documentação completa em `TAGS-BADGES-CARDS.md`
- **11/10/2025**: **Reorganização das tags no Desktop**:
  - **Mobile**: Todas as tags permanecem na imagem (visual impactante)
  - **Desktop**: APENAS tipo do imóvel na imagem
  - **Desktop**: Todas as outras tags movidas abaixo dos metadados
  - **Estilo minimalista**: Tags 10px, uppercase, cores suaves (10% opacity)
  - **Objetivo**: Imagem mais limpa, informações organizadas, foco no conteúdo
  - **Máximo de tags visíveis**: Distância mar + característica + venda rápida + badges + 2 tags secundárias
- **11/10/2025**: **Correção de tags duplicadas**:
  - Removido "Pet friendly" conforme solicitação
  - Lógica anti-duplicação: "Vista mar" só aparece se NÃO houver badge de distância (≤500m)
  - Badge distância do mar tem PRIORIDADE sobre característica "Vista mar"
  - Tags secundárias limpas: apenas data de entrega e informações não redundantes

