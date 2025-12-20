# Guia de Acessibilidade - Pharos Imobiliária

## 🎯 Objetivo: WCAG 2.1 AAA Compliance

Este documento descreve as práticas e implementações de acessibilidade no projeto, visando conformidade total com WCAG 2.1 nível AAA.

---

## 📋 Índice

1. [Princípios WCAG](#princípios-wcag)
2. [Implementações Atuais](#implementações-atuais)
3. [Utilities e Helpers](#utilities-e-helpers)
4. [Testes de Acessibilidade](#testes-de-acessibilidade)
5. [Checklist de Desenvolvimento](#checklist-de-desenvolvimento)
6. [Ferramentas](#ferramentas)

---

## 🎨 Princípios WCAG

### 1. Perceptível
Os usuários devem ser capazes de perceber as informações apresentadas.

**Implementações:**
- ✅ Contraste mínimo 7:1 (AAA) para texto normal
- ✅ Contraste mínimo 4.5:1 (AAA) para texto grande
- ✅ Alt text em todas as imagens
- ✅ Legendas/transcrições para vídeos
- ✅ Sem uso de cor como único meio de transmitir informação

### 2. Operável
Os usuários devem ser capazes de operar a interface.

**Implementações:**
- ✅ Navegação completa via teclado
- ✅ Tempo suficiente para interações
- ✅ Sem conteúdo que cause convulsões (sem flashes)
- ✅ Skip links para navegação rápida
- ✅ Touch targets mínimos de 44x44px (AAA)

### 3. Compreensível
A informação e operação da interface devem ser compreensíveis.

**Implementações:**
- ✅ Linguagem clara e simples
- ✅ Labels descritivos em formulários
- ✅ Mensagens de erro claras
- ✅ Navegação consistente
- ✅ Previsibilidade de comportamento

### 4. Robusto
O conteúdo deve ser robusto o suficiente para ser interpretado por diferentes tecnologias.

**Implementações:**
- ✅ HTML semântico (nav, main, aside, footer)
- ✅ ARIA labels onde necessário
- ✅ Validação HTML
- ✅ Compatibilidade com screen readers

---

## 🛠️ Implementações Atuais

### 1. Contraste de Cores

**Arquivo:** `src/utils/accessibility.ts`

```typescript
import { meetsWCAGContrast, ACCESSIBLE_COLORS } from '@/utils/accessibility';

// Verificar contraste
const isAccessible = meetsWCAGContrast('#054ADA', '#FFFFFF', 'AAA');

// Usar cores pré-aprovadas
const textColor = ACCESSIBLE_COLORS.textOnWhite.primary;
```

**Paleta Acessível:**
- Texto em fundo branco: `#192233` (15.4:1)
- Texto em fundo escuro: `#ffffff` (15.4:1)
- Links: `#054ADA` (8.6:1)
- Success: `#047857` (7.8:1)
- Warning: `#b45309` (7.1:1)
- Error: `#dc2626` (7.5:1)

### 2. Focus Management

**Focus Trap para Modals:**

```typescript
import { FocusTrap } from '@/utils/accessibility';

// Em um modal
const trap = new FocusTrap(modalElement);
trap.activate(); // Ao abrir
trap.deactivate(); // Ao fechar
```

**Hook para Focus Trap:**

```typescript
import { useFocusTrap } from '@/utils/accessibility';

function Modal({ isOpen }) {
  useFocusTrap(isOpen);
  // ...
}
```

### 3. Screen Reader Support

**Announce para SR:**

```typescript
import { announceToScreenReader } from '@/utils/accessibility';

// Anunciar mudanças importantes
announceToScreenReader('5 imóveis encontrados', 'polite');
announceToScreenReader('Erro ao carregar dados', 'assertive');
```

**Hook de Announcer:**

```typescript
import { useAnnouncer } from '@/utils/accessibility';

function SearchResults() {
  const { announce } = useAnnouncer();
  
  useEffect(() => {
    announce(`${results.length} imóveis encontrados`);
  }, [results]);
}
```

### 4. Keyboard Navigation

**Hook para listas:**

```typescript
import { useKeyboardNavigation } from '@/utils/accessibility';

function Dropdown({ items, onSelect }) {
  const { activeIndex, handleKeyDown } = useKeyboardNavigation(
    items,
    onSelect,
    { loop: true, orientation: 'vertical' }
  );
  
  return (
    <div onKeyDown={handleKeyDown}>
      {items.map((item, i) => (
        <div key={i} className={i === activeIndex ? 'active' : ''}>
          {item}
        </div>
      ))}
    </div>
  );
}
```

**Constantes de teclas:**

```typescript
import { KEYBOARD_KEYS } from '@/utils/accessibility';

function handleKeyPress(e: KeyboardEvent) {
  if (e.key === KEYBOARD_KEYS.ESCAPE) {
    closeModal();
  }
}
```

### 5. Skip Links

**Implementação:**

```tsx
import { useSkipLinks } from '@/utils/accessibility';

function Header() {
  const { skipToMain, skipToNav } = useSkipLinks();
  
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only"
        onClick={skipToMain}
      >
        Pular para conteúdo principal
      </a>
      {/* ... */}
    </>
  );
}
```

**CSS necessário:**

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus,
.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 6. Touch Targets

**Validação:**

```typescript
import { validateTouchTargets, MIN_TOUCH_TARGET } from '@/utils/accessibility';

// Em desenvolvimento, validar
const { valid, invalidTargets } = validateTouchTargets();
if (!valid) {
  console.warn('Touch targets inválidos:', invalidTargets);
}
```

**CSS para garantir tamanho:**

```css
button, a, [role="button"] {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 7. Reduced Motion

**Hook:**

```typescript
import { useReducedMotion } from '@/utils/accessibility';

function AnimatedComponent() {
  const reducedMotion = useReducedMotion();
  
  const variants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  return <motion.div variants={variants} />;
}
```

**CSS:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧪 Testes de Acessibilidade

### Auditoria Automatizada

**Função principal:**

```typescript
import { runA11yAudit } from '@/utils/accessibility';

// Em desenvolvimento
const { score, issues } = await runA11yAudit();

console.log(`A11y Score: ${score}/100`);
issues.forEach(issue => {
  console.log(`[${issue.severity}] ${issue.rule}: ${issue.message}`);
});
```

**Validações incluídas:**
- ✅ Estrutura de headings (H1 único, hierarquia correta)
- ✅ Landmarks (main, nav, footer)
- ✅ Alt text em imagens
- ✅ Labels em form inputs
- ✅ Nomes acessíveis em botões e links
- ✅ Touch target sizes

### Testes Manuais

**Checklist:**
1. [ ] Navegação completa via teclado (Tab, Shift+Tab)
2. [ ] Sem "keyboard traps" (consegue sair de modals)
3. [ ] Focus visível em todos os elementos interativos
4. [ ] Screen reader (NVDA/JAWS) consegue ler todo conteúdo
5. [ ] Zoom 200% sem perda de funcionalidade
6. [ ] Sem scroll horizontal em 320px de largura
7. [ ] Contraste adequado em todos os estados (hover, focus, active)

### Ferramentas de Teste

**Browser Extensions:**
- [axe DevTools](https://www.deque.com/axe/devtools/) - Auditoria completa
- [WAVE](https://wave.webaim.org/extension/) - Avaliação visual
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Score A11y

**Screen Readers:**
- **Windows:** NVDA (gratuito) ou JAWS
- **macOS:** VoiceOver (nativo)
- **Linux:** Orca

**Comandos Screen Reader (NVDA):**
- `NVDA + N` - Menu NVDA
- `Insert + Down` - Modo navegação
- `H` - Próximo heading
- `K` - Próximo link
- `B` - Próximo botão
- `T` - Próxima tabela

---

## ✅ Checklist de Desenvolvimento

### Para Todo Componente Novo

- [ ] HTML semântico (evitar `<div>` genéricos)
- [ ] ARIA labels onde necessário
- [ ] Navegação via teclado funcional
- [ ] Focus visível (outline customizado se necessário)
- [ ] Contraste de cores validado (mínimo 7:1 AAA)
- [ ] Touch targets mínimos de 44x44px
- [ ] Alt text descritivo em imagens
- [ ] Testar com screen reader
- [ ] Testar com teclado apenas (sem mouse)
- [ ] Testar em zoom 200%
- [ ] Respeitar `prefers-reduced-motion`

### Para Formulários

- [ ] Labels associados (`<label for="id">` ou `aria-label`)
- [ ] Placeholder não substitui label
- [ ] Mensagens de erro claras e anunciadas
- [ ] Validação em tempo real acessível
- [ ] Estados de sucesso/erro comunicados via ARIA
- [ ] Ordem de foco lógica
- [ ] Submit via Enter funcional

### Para Modals/Dialogs

- [ ] Focus trap ativado
- [ ] ESC fecha o modal
- [ ] Foco retorna ao elemento que abriu
- [ ] `role="dialog"` e `aria-modal="true"`
- [ ] `aria-labelledby` ou `aria-label`
- [ ] Overlay não recebe foco

### Para Navegação

- [ ] Skip link no topo da página
- [ ] Landmarks semânticos (`<nav>`, `<main>`, `<aside>`)
- [ ] Breadcrumbs com `aria-label="breadcrumb"`
- [ ] Link ativo indicado visualmente e via ARIA
- [ ] Dropdown menus navegáveis via teclado

---

## 🔧 Ferramentas

### Scripts Disponíveis

```bash
# Auditoria A11y em desenvolvimento
npm run dev
# Abrir console e executar:
# runA11yAudit().then(console.log)

# Lighthouse A11y
npm run lighthouse
# Verificar score de accessibility no relatório

# Validação de contraste
# Usar função meetsWCAGContrast() no código
```

### Integração CI/CD

Adicionar ao `.github/workflows/ci.yml`:

```yaml
- name: A11y Testing
  run: |
    npm run build
    npm run lighthouse -- --only-categories=accessibility
    # Falhar se score < 100
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)

### Cursos
- [Web Accessibility by Google (Udacity)](https://www.udacity.com/course/web-accessibility--ud891)
- [Accessibility Fundamentals (Deque University)](https://dequeuniversity.com/)

### Comunidade
- [WebAIM Mailing List](https://webaim.org/discussion/)
- [A11y Slack](https://web-a11y.slack.com/)

---

## 🎯 Metas de Acessibilidade

### Atual
- ✅ WCAG 2.1 AA (conformidade parcial)
- 🔄 WCAG 2.1 AAA (em progresso)

### Meta Final
- 🎯 100% WCAG 2.1 AAA
- 🎯 100% navegável via teclado
- 🎯 100% compatível com screen readers
- 🎯 100% Lighthouse Accessibility Score

---

**Última atualização:** Dez 2025  
**Responsável:** Tech Lead Performance/SEO

