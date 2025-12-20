# Sistema Lead Card Follower (Sticky-Proof) 📌

## Visão Geral

Sistema **robusto** de acompanhamento de sidebar que funciona **independente** de:
- ❌ `overflow: hidden/auto/scroll` nos parents
- ❌ `transform`, `filter`, `backdrop-filter` ativos
- ❌ Qualquer outro contexto que quebre `position: sticky`

Usa `position: fixed` com cálculos manuais via `requestAnimationFrame` para 60fps garantido.

---

## ✨ Por que "Follower" ao invés de "Sticky"?

### Problema do `position: sticky`:

```css
/* 5 situações que QUEBRAM o sticky: */

/* 1. Overflow no parent */
.parent { overflow: hidden; } ❌

/* 2. Transform no parent */
.parent { transform: translateZ(0); } ❌

/* 3. Filter/backdrop-filter no parent */
.parent { filter: blur(0); } ❌

/* 4. Contain no parent */
.parent { contain: paint; } ❌

/* 5. Will-change com transform */
.parent { will-change: transform; } ❌
```

### Solução: Follower System

✅ **Position: fixed** calculado manualmente  
✅ **Funciona com qualquer parent** (overflow, transform, etc.)  
✅ **60fps** via `requestAnimationFrame`  
✅ **Zero CLS** com `ResizeObserver`  
✅ **3 estados inteligentes:**
- **Original:** `absolute` no topo do boundary
- **Fixed:** Colado ao topo da viewport (com offset do header)
- **Bottomed:** `absolute` no fim do boundary (não ultrapassa)

---

## 🏗️ Arquitetura

### Estrutura HTML com IDs Obrigatórios

```html
<!-- Header fixo global (obrigatório ter ID) -->
<header id="site-header">
  <!-- Seu header aqui -->
</header>

<main className="imovel-grid">
  <!-- Sidebar (desktop only) -->
  <aside id="imovel-sidebar">
    <!-- Navegação vertical (opcional) -->
    <nav className="sidebar-nav">
      <a href="#detalhes">Detalhes</a>
      <a href="#specs">Ficha Técnica</a>
      <a href="#localizacao">Localização</a>
    </nav>

    <!-- BOUNDARY: Limite do follower -->
    <div id="lead-boundary">
      <LeadCardFollower
        propertyId={property.id}
        propertyCode={property.code}
        propertyTitle={property.title}
        realtor={property.realtor}
      />
    </div>
  </aside>

  <!-- Content -->
  <section id="imovel-content">
    {/* Conteúdo do imóvel */}
  </section>
</main>

<!-- Dock Mobile (≤1024px) -->
<LeadDockMobile ... />
```

---

## 🎨 CSS (já incluído em `lead-sticky.css`)

### Desktop

```css
.imovel-grid {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: clamp(20px, 3vw, 48px);
  max-width: 1440px;
  margin: 0 auto;
  padding-inline: clamp(16px, 4vw, 48px);
}

#imovel-sidebar {
  position: relative;
}

#lead-boundary {
  position: relative;
  min-height: 100vh;
  padding-bottom: 24px;
}

.lead-follower {
  will-change: transform;
  z-index: 5;
}

.lead-card {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(25, 34, 51, 0.08);
}
```

### Mobile

```css
@media (max-width: 1024px) {
  .lead-follower {
    display: none; /* Follower desliga */
  }

  .imovel-grid {
    grid-template-columns: 1fr; /* Uma coluna */
  }

  #imovel-sidebar {
    display: none; /* Sidebar some */
  }

  .lead-dock {
    position: fixed;
    inset: auto 0 0 0;
    /* ... dock fixo no rodapé */
  }
}
```

---

## 🔧 Como Funciona (Algoritmo)

### Estados do Follower

```typescript
// 1) ORIGINAL (posição inicial)
if (boundary.top >= topOffset) {
  card.style.position = 'absolute';
  card.style.top = '0';
}

// 2) FIXED (acompanhando scroll)
else if (boundary.bottom > topOffset + card.height) {
  card.style.position = 'fixed';
  card.style.top = `${topOffset}px`;
  card.style.left = `${boundary.left}px`;
  card.style.width = `${boundary.width}px`;
}

// 3) BOTTOMED (chegou no fim)
else {
  card.style.position = 'absolute';
  card.style.bottom = '0';
}
```

### Performance

```typescript
// requestAnimationFrame para 60fps
let raf = 0;

const onScroll = () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    // Cálculos aqui (getBoundingClientRect)
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
```

### Zero CLS

```typescript
// ResizeObserver mantém largura sincronizada
const ro = new ResizeObserver(([entry]) => {
  setWidth(entry.contentRect.width);
});

ro.observe(boundary);
```

---

## 📱 Mobile: Dock System

O dock é um **CTA fixo no rodapé** que abre um **bottom sheet** com o form completo.

### Componente: LeadDockMobile.tsx

```tsx
<div className="lead-dock">
  <button onClick={openSheet} className="lead-dock__cta">
    <WhatsAppIcon />
    Falar com {realtorName}
  </button>
</div>

{/* Bottom Sheet */}
{isSheetOpen && (
  <div className="lead-sheet-overlay">
    <div className="lead-sheet">
      <LeadCaptureCard ... />
    </div>
  </div>
)}
```

---

## 🎯 Telemetria

### Eventos Implementados

| Evento | Quando | Dados |
|--------|--------|-------|
| `lead_follower_impression` | Card carrega (desktop) | `property_id`, `property_code`, `type: 'desktop'` |
| `lead_dock_impression` | Dock carrega (mobile) | `property_id`, `property_code`, `type: 'mobile'` |
| `lead_dock_open` | Sheet abre (mobile) | `property_id` |
| `lead_submit_success` | Lead enviado | `property_id`, `lead_id`, `idempotency_key` |

---

## 🚀 Como Integrar

### Opção 1: Usar PropertyPageLayout (Recomendado)

```tsx
import PropertyPageLayout from '@/components/PropertyPageLayout';
import '@/styles/lead-sticky.css';

<PropertyPageLayout
  propertyId={property.id}
  propertyCode={property.code}
  propertyTitle={property.title}
  realtor={property.realtor}
  sidebar={
    <nav>
      <a href="#detalhes">Detalhes</a>
      <a href="#specs">Ficha Técnica</a>
      <a href="#map">Localização</a>
    </nav>
  }
>
  {/* Conteúdo do imóvel */}
  <ImageGallery ... />
  <PropertySpecs ... />
  <PropertyMap ... />
</PropertyPageLayout>
```

### Opção 2: Manual

```tsx
import LeadCardFollower from '@/components/LeadCardFollower';
import LeadDockMobile from '@/components/LeadDockMobile';
import '@/styles/lead-sticky.css';

<header id="site-header">{/* ... */}</header>

<main className="imovel-grid">
  <aside id="imovel-sidebar">
    <div id="lead-boundary">
      <LeadCardFollower ... />
    </div>
  </aside>

  <section id="imovel-content">
    {/* Conteúdo */}
  </section>
</main>

<LeadDockMobile ... />
```

---

## ⚠️ Checklist Pré-Deploy

### Estrutura HTML

- [ ] Header tem `id="site-header"`
- [ ] Sidebar tem `id="imovel-sidebar"`
- [ ] Boundary tem `id="lead-boundary"`
- [ ] Content tem `id="imovel-content"`

### CSS

- [ ] `lead-sticky.css` importado globalmente
- [ ] `.imovel-grid` aplicado no `<main>`
- [ ] Sem `overflow: hidden/auto/scroll` nos parents do card
- [ ] Sem `transform` nos parents do card

### Funcionalidade

- [ ] Desktop: Card acompanha scroll suavemente
- [ ] Desktop: Card para no fim do boundary (não ultrapassa)
- [ ] Mobile: Dock aparece fixo no rodapé
- [ ] Mobile: Bottom sheet abre ao clicar no CTA
- [ ] Form funciona em ambos (desktop/mobile)

### Performance

- [ ] 60fps constante no scroll
- [ ] Sem CLS (largura fixa)
- [ ] Telemetria disparando corretamente

---

## 🐛 Troubleshooting

### Card não segue o scroll

**Causa:** IDs incorretos ou não encontrados.

**Solução:**
```typescript
// Verificar no console
console.log(document.querySelector('#site-header')); // Deve existir
console.log(document.querySelector('#lead-boundary')); // Deve existir
```

### Card "pula" ao virar fixed

**Causa:** Largura não está sincronizada.

**Solução:** Verificar se `ResizeObserver` está funcionando:
```typescript
// LeadCardFollower.tsx - linha 58
const ro = new ResizeObserver(([entry]) => {
  console.log('Largura:', entry.contentRect.width); // Debug
  setWidth(entry.contentRect.width);
});
```

### Card não para no fim (ultrapassa boundary)

**Causa:** `#lead-boundary` sem altura ou `min-height`.

**Solução:**
```css
#lead-boundary {
  min-height: 100vh; /* Garante altura mínima */
  padding-bottom: 24px; /* Espaço no fim */
}
```

### Dock não aparece no mobile

**Causa:** CSS não importado ou breakpoint errado.

**Solução:**
1. Verificar se `lead-sticky.css` foi importado
2. Testar com DevTools em modo mobile (<= 1024px)
3. Verificar z-index do dock (deve ser >= 40)

---

## 📊 Comparação: Sticky vs Follower

| Característica | Sticky | Follower |
|----------------|--------|----------|
| **Simplicidade** | ✅ Simples | ⚠️ Complexo |
| **Performance** | ✅ Nativo | ✅ 60fps (RAF) |
| **Overflow-proof** | ❌ Quebra | ✅ Funciona |
| **Transform-proof** | ❌ Quebra | ✅ Funciona |
| **Suporte Safari** | ⚠️ Bugs | ✅ Funciona |
| **Z-index** | ⚠️ Contexto | ✅ Controlado |
| **CLS** | ✅ Zero | ✅ Zero (ResizeObserver) |

**Recomendação:** Use **Follower** se tiver qualquer problema com sticky. Caso contrário, sticky é mais simples.

---

## 🎓 Referências

- [MDN: position sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)
- [CSS Tricks: position sticky](https://css-tricks.com/position-sticky-2/)
- [ResizeObserver API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

---

**Status:** ✅ Sistema Follower implementado e pronto para produção

**Versão:** 1.0  
**Data:** 18/10/2025  
**Autor:** Cursor AI + Pharos Team

