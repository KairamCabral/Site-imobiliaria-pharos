# 📦 Componentes de Favoritos — Pharos

Documentação detalhada de todos os componentes do sistema de favoritos.

---

## 📋 Índice

1. [CollectionSidebar](#collectionsidebar)
2. [FavoritesToolbar](#favoritestoolbar)
3. [FavoriteCard](#favoritecard)
4. [ComparisonTable](#comparisontable)
5. [ShareModal](#sharemodal)
6. [EmptyStates](#emptystates)

---

## CollectionSidebar

**Arquivo:** `CollectionSidebar.tsx`  
**Linhas:** 214  
**Descrição:** Sidebar para gerenciamento de coleções de favoritos com CRUD completo.

### Props
Nenhuma (usa context interno)

### Features
- ✅ Listar todas as coleções
- ✅ Criar nova coleção
- ✅ Renomear coleção (inline edit)
- ✅ Deletar coleção (com confirmação)
- ✅ Contador de itens por coleção
- ✅ Navegação entre coleções
- ✅ Indicador de coleção ativa
- ✅ Menu dropdown por coleção
- ✅ Footer com total de favoritos

### Uso
```tsx
import CollectionSidebar from '@/components/favoritos/CollectionSidebar';

<CollectionSidebar />
```

### States Internos
- `isCreating` - Modo de criação de coleção
- `newCollectionName` - Nome da nova coleção
- `editingId` - ID da coleção sendo editada
- `editingName` - Nome temporário durante edição
- `menuOpenId` - ID do menu dropdown aberto

### Interações
- **Criar:** Clique em "Nova coleção" → Digite nome → Enter ou Cancelar
- **Renomear:** Menu (•••) → Renomear → Digite → Enter ou Blur
- **Deletar:** Menu (•••) → Excluir → Confirmar
- **Navegar:** Clique na coleção

### Acessibilidade
- ✅ `aria-current="page"` na coleção ativa
- ✅ `aria-label` em botões de ação
- ✅ Navegação por teclado (Tab, Enter, Escape)
- ✅ Focus visível

---

## FavoritesToolbar

**Arquivo:** `FavoritesToolbar.tsx`  
**Linhas:** 216  
**Descrição:** Barra de ferramentas com busca, ordenação, modos de visualização e ações.

### Props
```typescript
interface FavoritesToolbarProps {
  onShareClick?: () => void;
  onExportClick?: () => void;
  showBulkActions?: boolean;
}
```

### Features
- ✅ Campo de busca textual
- ✅ Contador de resultados
- ✅ Dropdown de ordenação (8 opções)
- ✅ Toggle de modos de visualização (grade/lista/mapa)
- ✅ Botão de compartilhar
- ✅ Botão de exportar PDF
- ✅ Barra de ações em massa (quando há seleção)
- ✅ Botão "Desmarcar todos"

### Uso
```tsx
import FavoritesToolbar from '@/components/favoritos/FavoritesToolbar';

<FavoritesToolbar
  onShareClick={() => setShowShareModal(true)}
  onExportClick={() => handleExport()}
  showBulkActions={selectedIds.length > 0}
/>
```

### Opções de Ordenação
- Mais recentes salvos
- Mais antigos salvos
- Últimos atualizados
- Menor preço
- Maior preço
- Mais próximo do mar
- Menor área
- Maior área

### Modos de Visualização
- **Grade** - Cards em grid responsivo
- **Lista** - Cards horizontais
- **Mapa** - Visualização em mapa (preparado)

### Acessibilidade
- ✅ Labels descritivos
- ✅ `aria-label` em todos os botões
- ✅ `aria-expanded` no dropdown
- ✅ Navegação por teclado

---

## FavoriteCard

**Arquivo:** `FavoriteCard.tsx`  
**Linhas:** 410  
**Descrição:** Card premium de imóvel com funcionalidades de favoritos.

### Props
```typescript
interface FavoriteCardProps {
  favorito: Favorito;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  showCheckbox?: boolean;
}
```

### Features
- ✅ Carrossel de imagens
- ✅ Botão de remover dos favoritos
- ✅ Checkbox de seleção múltipla
- ✅ Tags do imóvel (tipo, características)
- ✅ Etiquetas personalizadas (tags do favorito)
- ✅ Anotações inline com autosave
- ✅ Menu de etiquetas (5 tipos)
- ✅ Quick actions (Nota, Tags)
- ✅ Link para detalhes do imóvel
- ✅ Informações principais (área, quartos, suítes, vagas)
- ✅ Preço formatado

### Uso
```tsx
import FavoriteCard from '@/components/favoritos/FavoriteCard';

<FavoriteCard
  favorito={favorito}
  isSelected={selectedIds.includes(favorito.id)}
  onToggleSelection={() => toggleSelection(favorito.id)}
  showCheckbox={selectedIds.length > 0}
/>
```

### Etiquetas Disponíveis
- 🔵 **Agendar visita** - `bg-blue-100 text-blue-700`
- 🟢 **Negociar** - `bg-green-100 text-green-700`
- 🟡 **Prioridade** - `bg-amber-100 text-amber-700`
- 🔴 **Urgente** - `bg-red-100 text-red-700`
- ⚪ **Contato feito** - `bg-slate-100 text-slate-700`

### States Internos
- `currentImage` - Índice da imagem atual no carrossel
- `showNotesInput` - Modo de edição de notas
- `notesValue` - Valor temporário das notas
- `showTagMenu` - Menu de etiquetas aberto

### Interações
- **Carrossel:** Setas ou indicadores na imagem
- **Remover:** Clique no coração (vermelho)
- **Selecionar:** Checkbox no canto superior esquerdo
- **Adicionar nota:** Botão "Nota" → Digite → Salvar ou Cancelar
- **Etiquetar:** Botão "Tags" → Marcar/desmarcar etiquetas
- **Editar nota:** Clique na nota existente

### Acessibilidade
- ✅ `aria-label` em todos os botões
- ✅ Contraste AA/AAA
- ✅ Texto legível (14-16px)
- ✅ Toques ≥44px

---

## ComparisonTable

**Arquivo:** `ComparisonTable.tsx`  
**Linhas:** 243  
**Descrição:** Tabela responsiva para comparação lado a lado de imóveis.

### Props
```typescript
interface ComparisonTableProps {
  favoritos: Favorito[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onPin?: (id: string) => void;
  pinnedId?: string;
}
```

### Features
- ✅ Comparação lado a lado de múltiplos imóveis
- ✅ Pin de "imóvel base" (coluna fixa destacada)
- ✅ Scroll horizontal para muitos imóveis
- ✅ Header sticky (fixo no scroll)
- ✅ Remover imóvel da comparação
- ✅ Exportar PDF (preparado)
- ✅ Modal fullscreen com backdrop
- ✅ Responsivo (desktop/tablet/mobile)

### Uso
```tsx
import ComparisonTable from '@/components/favoritos/ComparisonTable';

<ComparisonTable
  favoritos={selectedFavoritos}
  onClose={() => setShowComparison(false)}
  onRemove={(id) => toggleSelection(id)}
  onPin={(id) => setPinnedId(id)}
  pinnedId={pinnedId}
/>
```

### Linhas Comparadas
1. Imóvel (imagem + título)
2. Preço
3. Área total
4. Quartos
5. Suítes
6. Vagas
7. Condomínio
8. IPTU
9. Endereço
10. Diferenciais (até 3)

### Ordenação
Imóvel pinned sempre aparece primeiro (coluna 1)

### Acessibilidade
- ✅ `role="table"` semântico
- ✅ Headers descritivos
- ✅ `aria-label` em ações
- ✅ Navegação por teclado (Tab, Escape)
- ✅ Focus trap no modal

---

## ShareModal

**Arquivo:** `ShareModal.tsx`  
**Linhas:** 288  
**Descrição:** Modal para geração de link compartilhável dos favoritos.

### Props
```typescript
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: string;
  collectionName?: string;
}
```

### Features
- ✅ Geração de link único
- ✅ Configuração de expiração (7/30 dias ou sem expiração)
- ✅ Proteção por senha opcional
- ✅ Link somente leitura
- ✅ Copiar link com feedback
- ✅ Compartilhar via WhatsApp
- ✅ Compartilhar via E-mail
- ✅ Analytics integrado

### Uso
```tsx
import ShareModal from '@/components/favoritos/ShareModal';

<ShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  collectionId={currentQuery.collectionId}
  collectionName={currentCollection?.name}
/>
```

### States Internos
- `expiresIn` - Validade do link ('7' | '30' | 'never')
- `protected_` - Se requer senha
- `password` - Senha opcional
- `generatedLink` - URL gerada
- `copied` - Feedback de cópia

### Fluxo
1. Abrir modal
2. Configurar expiração e senha
3. Clicar "Gerar link"
4. Copiar ou compartilhar

### Acessibilidade
- ✅ `aria-modal="true"`
- ✅ Focus trap
- ✅ Escape para fechar
- ✅ Labels descritivos

---

## EmptyStates

**Arquivo:** `EmptyStates.tsx`  
**Linhas:** 187  
**Descrição:** Estados vazios elegantes e skeletons de loading.

### Componentes Exportados

#### EmptyState
```typescript
interface EmptyStateProps {
  type: 'no-favorites' | 'empty-collection' | 'no-results';
  collectionName?: string;
}
```

**Tipos:**
- **no-favorites** - Nenhum favorito salvo ainda
  - Ilustração de coração
  - CTAs: "Explorar imóveis" e "Importar de um link"
  - Cards de benefícios (Organize, Compare, Compartilhe)

- **empty-collection** - Coleção vazia
  - Ilustração de pasta
  - Nome da coleção
  - CTA: "Explorar imóveis"

- **no-results** - Sem resultados na busca/filtro
  - Ilustração de lupa
  - CTA: "Limpar filtros"

#### FavoriteCardSkeleton
Loading skeleton animado para um card

#### FavoritesLoadingGrid
Grid de skeletons (padrão: 6 items)

```typescript
interface FavoritesLoadingGridProps {
  count?: number;
}
```

### Uso
```tsx
import EmptyState, { 
  FavoriteCardSkeleton, 
  FavoritesLoadingGrid 
} from '@/components/favoritos/EmptyStates';

// Loading
{isLoading && <FavoritesLoadingGrid count={6} />}

// Sem favoritos
{isEmpty && !isLoading && (
  <EmptyState type="no-favorites" />
)}

// Coleção vazia
{isEmpty && !isDefaultCollection && (
  <EmptyState type="empty-collection" collectionName={collection.name} />
)}

// Sem resultados
{isEmpty && hasFilters && (
  <EmptyState type="no-results" />
)}
```

### Acessibilidade
- ✅ Hierarquia de headings correta
- ✅ Contraste adequado
- ✅ CTAs descritivos
- ✅ Ilustrações como decoração (aria-hidden)

---

## 🎨 Classes CSS Comuns

### Tokens Pharos Usados
```css
/* Cores */
.text-pharos-navy-900    /* #192233 - Títulos */
.text-pharos-blue-500    /* #054ADA - Links/CTAs */
.text-pharos-slate-700   /* #2C3444 - Texto principal */
.text-pharos-slate-500   /* #585E6B - Texto secundário */
.border-pharos-slate-300 /* #ADB4C0 - Bordas */
.bg-pharos-base-off      /* #F7F9FC - Fundo premium */

/* Sombras */
.shadow-card             /* 0 6px 20px rgba(25,34,51,.08) */
.shadow-card-hover       /* 0 10px 28px rgba(25,34,51,.12) */

/* Raios */
.rounded-lg              /* 12px */
.rounded-xl              /* 20px */
.rounded-2xl             /* 24px */
```

### Animações
```css
.transition-all          /* all 200ms cubic-bezier(0.4,0,0.2,1) */
.duration-200            /* 200ms */
.duration-300            /* 300ms */
.duration-500            /* 500ms */
.duration-700            /* 700ms */
```

---

## 📱 Responsividade

### Breakpoints
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

### Padrões Comuns
```tsx
// Grid responsivo
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Texto responsivo
className="text-sm md:text-base lg:text-lg"

// Padding responsivo
className="p-4 md:p-6 lg:p-8"

// Ocultar em mobile
className="hidden md:block"

// Mostrar apenas em mobile
className="md:hidden"
```

---

## 🔧 Manutenção

### Checklist ao Editar Componentes
- [ ] Verificar tipos TypeScript
- [ ] Testar em mobile/tablet/desktop
- [ ] Validar acessibilidade (teclado, screen reader)
- [ ] Verificar contraste de cores (WCAG AA)
- [ ] Testar performance (re-renders)
- [ ] Atualizar documentação se necessário
- [ ] Rodar linter (`npm run lint`)

### Convenções de Código
- **Nomes de funções:** camelCase
- **Nomes de componentes:** PascalCase
- **Nomes de arquivos:** PascalCase.tsx
- **Props:** Interface com sufixo Props
- **Handlers:** Prefixo handle (handleClick, handleSubmit)
- **Booleans:** Prefixo is/has/should (isOpen, hasError, shouldShow)

---

## 📚 Referências

- [Design Tokens](../../styles/pharos-tokens.css)
- [Tipos TypeScript](../../types/index.ts)
- [Context](../../contexts/FavoritosContext.tsx)
- [Documentação Principal](../../../SISTEMA-FAVORITOS.md)

---

**Última atualização:** Outubro 2025

