# Empty State Premium - Sistema de Captação de Leads

## 📋 Visão Geral

Sistema completo de Empty/End State para a busca de imóveis, com design premium, wizard de captação de leads em 3 etapas e integração com WhatsApp.

## 🎯 Componentes Criados

### 1. `EmptyState.tsx`
Componente principal que exibe o empty state com duas variantes:

#### Variantes
- **`no_results`**: Quando não há imóveis para os filtros aplicados
- **`end_of_list`**: Quando o usuário chegou ao fim da listagem

#### Features
- ✅ Animação de entrada com Intersection Observer
- ✅ Scroll automático para o estado (no_results)
- ✅ Textos dinâmicos baseados em filtros
- ✅ CTAs secundários contextuais
- ✅ Analytics integrado
- ✅ Acessibilidade AA/AAA

#### Props
```tsx
interface EmptyStateProps {
  type: 'no_results' | 'end_of_list';
  filtrosAtivos?: {
    cidade?: string;
    bairro?: string;
    precoMin?: number;
    precoMax?: number;
    quartos?: number;
    suites?: number;
    vagas?: number;
    caracteristicas?: string[];
  };
  onAdjustFilters?: (action: 'clear' | 'expand_area' | 'raise_price' | 'remove_features') => void;
  totalResultados?: number;
}
```

### 2. `LeadWizardModal.tsx`
Modal wizard de 3 etapas para captação de leads:

#### Etapas
1. **Preferências**: Tipo, bairros, suítes, vagas, área
2. **Budget & Prazo**: Preço, status do imóvel, prazo de mudança
3. **Contato**: Nome, e-mail, telefone, opt-ins LGPD

#### Features
- ✅ Barra de progresso visual
- ✅ Pré-preenchimento com filtros atuais
- ✅ Validação de campos obrigatórios
- ✅ Trap de foco para acessibilidade
- ✅ Fechar com ESC
- ✅ Tela de sucesso com CTA WhatsApp
- ✅ Analytics completo

## 🎨 Design System

### Tokens Utilizados
```css
--ph-navy: #192233
--ph-blue-500: #054ADA
--ph-gold: #C89C4D
--ph-white: #FFFFFF
--ph-offwhite: #F7F9FC
--ph-slate-300: #E8ECF2
--ph-slate-500: #64748B
--ph-slate-700: #475569
```

### Hierarquia Visual
1. **Ícone**: 80-88px circle, bg Off-White, halo Gold 2px
2. **Título**: 28-32px, Navy 900, bold
3. **Subtítulo**: 18-20px, Slate 700
4. **CTA Primário**: Blue 500, 48-52px altura, AAA contrast
5. **CTAs Secundários**: Chips outline Slate 300

### Responsividade
- **Mobile**: Stack vertical, full-width CTAs, 16-20px spacing
- **Desktop**: Max-width 720-840px, espaçamentos confortáveis

## 📍 Integração

### Na página `/imoveis`

#### 1. Import
```tsx
import EmptyState from '@/components/EmptyState';
```

#### 2. Handler de Ajuste Rápido
```tsx
const handleAjusteFiltrosRapido = useCallback((action) => {
  switch (action) {
    case 'clear': // Limpar todos
    case 'expand_area': // Remover filtros de localização
    case 'raise_price': // Aumentar preço em 20%
    case 'remove_features': // Remover comodidades
  }
}, []);
```

#### 3. Renderização

**Sem resultados:**
```tsx
{imoveisFiltrados.length === 0 && (
  <EmptyState
    type="no_results"
    filtrosAtivos={{...}}
    onAdjustFilters={handleAjusteFiltrosRapido}
    totalResultados={0}
  />
)}
```

**Fim da lista:**
```tsx
{imoveisFiltrados.length >= 10 && viewMode === 'list' && (
  <EmptyState
    type="end_of_list"
    filtrosAtivos={{...}}
    onAdjustFilters={handleAjusteFiltrosRapido}
    totalResultados={imoveisFiltrados.length}
  />
)}
```

## 📊 Analytics

### Eventos Disparados

#### `empty_view_impression`
```js
{
  type: 'no_results' | 'end_of_list',
  filters: JSON.stringify(filtrosAtivos),
  city: 'Balneário Camboriú',
  total_results: number
}
```

#### `empty_view_primary_click`
```js
{
  type: 'no_results' | 'end_of_list',
  lead_step: 1
}
```

#### `empty_view_secondary_click`
```js
{
  type: 'no_results' | 'end_of_list',
  action: 'clear' | 'expand_area' | 'raise_price' | 'remove_features'
}
```

#### `lead_wizard_next`
```js
{
  step: 1 | 2,
  tipo: 'no_results' | 'end_of_list'
}
```

#### `lead_wizard_submit`
```js
{
  subscribed_whatsapp: boolean,
  tipo: 'no_results' | 'end_of_list',
  budget: number
}
```

## 🔄 Fluxo de Lead

### 1. Usuário Clica em CTA Primário
→ Abre `LeadWizardModal`

### 2. Wizard de 3 Etapas
1. **Preferências**: Pré-preenchidas com filtros
2. **Budget**: Valores e prazo
3. **Contato**: Dados pessoais + LGPD

### 3. Submissão
→ Salva lead (backend)  
→ Exibe tela de sucesso

### 4. Tela de Sucesso
Opções:
- **"Falar agora no WhatsApp"**: Abre WhatsApp com mensagem pré-formatada
- **"Ver imóveis semelhantes"**: Fecha modal e retorna à busca

## ♿ Acessibilidade

### EmptyState
- ✅ `role="status"` para leitores de tela
- ✅ `aria-live="polite"` para atualizações
- ✅ Focus ring 2px Blue 500 (AA contrast)
- ✅ Todos os botões com min-height 48px
- ✅ Textos com contraste AAA

### LeadWizardModal
- ✅ `role="dialog"` + `aria-modal="true"`
- ✅ Focus trap (Tab não sai do modal)
- ✅ ESC fecha o modal
- ✅ Labels associados a inputs
- ✅ Campos obrigatórios com `required`
- ✅ Checkboxes com boa área de clique

## 🎬 Animações

### Entrada do EmptyState
```css
@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```
- Ícone com pulse suave (3s infinite)
- Container fade-in + translate-y (500ms)

### Barra de Progresso
- Transição suave entre etapas (300ms)
- Checkmarks quando etapa concluída
- Destaque Gold na etapa atual

## 📱 Responsividade

### Mobile (< 768px)
- Stack vertical completo
- CTAs full-width
- Ícone 80px
- Título 28px
- Modal com max-h 90vh e scroll

### Tablet (768px - 1024px)
- Max-width 720px
- Grid 2 colunas nos chips
- Ícone 88px
- Título 32px

### Desktop (> 1024px)
- Max-width 840px
- Grid 4 colunas (tipos de imóvel)
- Espaçamentos maiores
- Modal max-width 768px (2xl)

## 🧪 Testes

### Cenários de Teste

#### 1. Empty State - No Results
- [ ] Aplicar filtros sem resultados
- [ ] Verificar scroll automático
- [ ] Clicar em "Encontre meu imóvel"
- [ ] Verificar pré-preenchimento do wizard
- [ ] Testar CTAs secundários

#### 2. Empty State - End of List
- [ ] Scroll até o fim da lista (10+ imóveis)
- [ ] Verificar animação de entrada (50% viewport)
- [ ] Clicar em "Fale com especialista"
- [ ] Verificar que não repete ao recarregar

#### 3. Lead Wizard
- [ ] Navegar entre as 3 etapas
- [ ] Testar validação de campos
- [ ] Verificar barra de progresso
- [ ] Submeter formulário
- [ ] Clicar em WhatsApp na tela de sucesso
- [ ] Testar ESC para fechar

#### 4. Ajustes Rápidos
- [ ] "Ampliar região" → remove filtros de localização
- [ ] "Aumentar faixa de preço" → +20% no máximo
- [ ] "Remover diferenciais" → limpa características
- [ ] "Limpar filtros" → reset completo

#### 5. Analytics
- [ ] Verificar `empty_view_impression` no console
- [ ] Verificar `empty_view_primary_click`
- [ ] Verificar `lead_wizard_submit`
- [ ] Confirmar payloads corretos

## 🚀 Próximos Passos

### Backend Integration
- [ ] Endpoint POST `/api/leads` para salvar leads
- [ ] Endpoint POST `/api/searches/save` para busca salva
- [ ] Notificação por e-mail para equipe
- [ ] Envio de WhatsApp automático (opcional)

### Melhorias Futuras
- [ ] Toast notifications para feedback visual
- [ ] Busca salva com notificações
- [ ] Exportar preferências como PDF
- [ ] Histórico de buscas do usuário
- [ ] A/B testing de cópias

## 📦 Arquivos Criados

```
src/
  components/
    ✨ EmptyState.tsx (267 linhas)
    ✨ LeadWizardModal.tsx (596 linhas)
  
  app/
    imoveis/
      📝 page.tsx (atualizado)
        + Import EmptyState
        + Handler handleAjusteFiltrosRapido
        + Renderização no_results
        + Renderização end_of_list
```

## 🎉 Resultado

Um sistema completo de captação de leads que:
- ✅ Transforma "sem resultados" em oportunidade de conversão
- ✅ Oferece ajuda personalizada ao fim da busca
- ✅ Coleta dados estruturados em 3 etapas
- ✅ Integra com WhatsApp para contato imediato
- ✅ Mantém design premium e acessibilidade AAA
- ✅ Rastreia todas as interações com analytics

---

**Pharos Imobiliária** | Design System Premium

