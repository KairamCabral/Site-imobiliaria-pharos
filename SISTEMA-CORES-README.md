# 🎨 Sistema de Cores Pharos — Índice Completo

**Sistema oficial de design | Implementado em 11/10/2025**

---

## 📚 Documentação Disponível

### 1. 📘 **Guia Principal de Identidade**
📄 [`GUIA-COR-IDENTIDADE-PHAROS.md`](./GUIA-COR-IDENTIDADE-PHAROS.md)

**O que contém:**
- Paleta oficial completa
- Diretrizes por área (header, body, cards, forms)
- Gradientes e sombras
- Tokens de design
- Padrões de UI
- Do/Don't rápidos
- Checklist de QA

**Quando usar:** Referência principal para qualquer dúvida sobre cores.

---

### 2. 📊 **Relatório de Contraste WCAG**
📄 [`RELATORIO-CONTRASTE-WCAG.md`](./RELATORIO-CONTRASTE-WCAG.md)

**O que contém:**
- Todos os pares de contraste validados
- Níveis WCAG (AA/AAA)
- Pares reprovados com justificativa
- Mapa de uso por contexto
- Ferramentas de validação

**Quando usar:** Para validar acessibilidade e contraste de novos componentes.

---

### 3. ✅ **Guia de Implementação**
📄 [`IMPLEMENTACAO-SISTEMA-CORES.md`](./IMPLEMENTACAO-SISTEMA-CORES.md)

**O que contém:**
- Resumo da implementação
- Arquivos criados/atualizados
- Como usar tokens CSS e Tailwind
- Restrições importantes
- Checklist de implementação

**Quando usar:** Para entender o que foi implementado e como usar.

---

### 4. 💡 **Exemplos Práticos**
📄 [`EXEMPLOS-PRATICOS-CORES.md`](./EXEMPLOS-PRATICOS-CORES.md)

**O que contém:**
- Exemplos prontos de código (Tailwind + CSS)
- Header, hero, cards, forms, botões
- Listagens, filtros, footer
- Estados de feedback

**Quando usar:** Para copiar e colar código pronto.

---

### 5. 🔄 **Guia de Migração**
📄 [`GUIA-MIGRACAO-CORES.md`](./GUIA-MIGRACAO-CORES.md)

**O que contém:**
- Mapeamento de cores antigas → novas
- Exemplos de migração
- Checklist por componente
- Script de find & replace
- Testes após migração

**Quando usar:** Para migrar componentes existentes para o novo sistema.

---

## 🗂️ Arquivos Técnicos

### Tokens e Configuração

| Arquivo | Descrição |
|---------|-----------|
| `src/styles/pharos-tokens.css` | CSS variables (`--ph-*`) |
| `tailwind.config.js` | Paleta Tailwind (`pharos.*`) |
| `public/design-tokens/colors.json` | JSON estruturado com metadados |
| `src/app/globals.css` | Estilos globais integrados |

---

## 🎨 Paleta Rápida

### Primárias
```
Blue 500:  #054ADA  (AAA - 7.00:1)
Navy 900:  #192233  (AAA - 15.93:1)
```

### Neutros
```
Slate 700: #2C3444  (AAA - 12.49:1) — Texto principal
Slate 500: #585E6B  (AA - 6.50:1)   — Texto secundário
Slate 300: #ADB4C0                  — Bordas apenas
Off-White: #F7F9FC                  — Background premium
White:     #FFFFFF
```

### Acento
```
Gold 500:  #C89C4D  (Micro-detalhes apenas)
```

### Feedback
```
Success:   #2FBF71
Error:     #C53A3A  (AA - 4.58:1)
Warning:   #F5A524
```

---

## 🚀 Quick Start

### 1. Usando Tailwind (Recomendado)

```jsx
// Header
<header className="bg-pharos-navy-900 text-pharos-base-white">
  <button className="bg-pharos-blue-500 hover:bg-pharos-blue-600">
    Entrar
  </button>
</header>

// Card
<div className="bg-pharos-base-white border border-pharos-slate-300 rounded-2xl shadow-card">
  <h3 className="text-pharos-navy-900">Título</h3>
  <p className="text-pharos-slate-700">Descrição</p>
</div>
```

---

### 2. Usando CSS Variables

```css
.header {
  background: var(--ph-navy-900);
  color: var(--ph-white);
}

.button-primary {
  background: var(--ph-blue-500);
  color: var(--ph-white);
  border-radius: var(--ph-radius-lg);
}

.card {
  background: var(--ph-white);
  border: 1px solid var(--ph-slate-300);
  box-shadow: var(--ph-shadow-md);
}
```

---

## ⚠️ Restrições Importantes

### ❌ Nunca Fazer

1. **Slate 300 em texto** (contraste reprovado)
   ```jsx
   {/* ❌ */ <p className="text-pharos-slate-300">Texto</p> }
   {/* ✅ */ <div className="border-pharos-slate-300">...</div> }
   ```

2. **Gold em texto longo** (contraste reprovado)
   ```jsx
   {/* ❌ */ <p className="text-pharos-gold-500">Parágrafo</p> }
   {/* ✅ */ <span className="text-pharos-gold-500">★</span> }
   ```

3. **Novos tons de azul** (manter paleta enxuta)
   ```jsx
   {/* ❌ */ <div style={{color: '#0066FF'}}>...</div> }
   {/* ✅ */ <div className="text-pharos-blue-500">...</div> }
   ```

---

## 🧪 Checklist de Uso

### Antes de criar novo componente:
- [ ] Usar apenas tokens oficiais (`pharos-*` ou `--ph-*`)
- [ ] Validar contraste (≥4.5 AA / ≥7.0 AAA)
- [ ] Não usar Slate 300 em texto
- [ ] Não usar Gold em blocos grandes
- [ ] Garantir estados hover/focus/active
- [ ] Touch target ≥44px (mobile)

---

## 📊 Proporção de Uso

```
70% Neutros (Slate, White, Off-White)
20% Primárias (Blue, Navy)
10% Acento (Gold - micro-detalhes)
```

---

## 🔗 Links Úteis

### Ferramentas de Validação
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Lighthouse
- axe DevTools (extensão)

### Padrões WCAG
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- AA: ≥4.5:1 (texto normal)
- AAA: ≥7.0:1 (texto normal)

---

## 📞 Dúvidas Frequentes

### 1. Posso usar outras cores além da paleta?
❌ **Não.** A paleta foi projetada para ser enxuta e consistente. Usar outras cores quebra a identidade visual.

### 2. Posso criar um degradê customizado?
❌ **Não.** Use apenas `var(--ph-gradient-primary)` para hero/CTAs premium.

### 3. Por que não posso usar Slate 300 em texto?
⚠️ O contraste é **2.09:1**, reprovado no WCAG. Use apenas para bordas/divisores.

### 4. E se eu precisar de um cinza mais claro para texto?
Use `text-pharos-slate-500` (contraste 6.50:1 AA). Nunca desça para Slate 300.

### 5. Posso usar Gold em títulos?
❌ Não. Gold tem contraste 2.52:1, reprovado. Use apenas em ícones pequenos e detalhes.

---

## 🎯 Fluxo de Trabalho Recomendado

```
1. Consultar → GUIA-COR-IDENTIDADE-PHAROS.md
2. Ver exemplo → EXEMPLOS-PRATICOS-CORES.md
3. Implementar → Usar tokens pharos-* / --ph-*
4. Validar → RELATORIO-CONTRASTE-WCAG.md
5. Testar → Lighthouse + Visual QA
```

---

## 📦 Estrutura de Arquivos

```
imobiliaria-pharos/
├── src/
│   ├── styles/
│   │   └── pharos-tokens.css              ← Tokens CSS
│   └── app/
│       └── globals.css                    ← Estilos globais
├── public/
│   └── design-tokens/
│       └── colors.json                    ← JSON estruturado
├── tailwind.config.js                     ← Config Tailwind
├── GUIA-COR-IDENTIDADE-PHAROS.md         ← Guia principal
├── RELATORIO-CONTRASTE-WCAG.md           ← Contraste validado
├── IMPLEMENTACAO-SISTEMA-CORES.md        ← Status implementação
├── EXEMPLOS-PRATICOS-CORES.md            ← Código pronto
├── GUIA-MIGRACAO-CORES.md                ← Migração
└── SISTEMA-CORES-README.md               ← Este arquivo
```

---

## ✅ Status da Implementação

| Item | Status |
|------|--------|
| Tokens CSS | ✅ Completo |
| Tailwind Config | ✅ Completo |
| Design Tokens JSON | ✅ Completo |
| Documentação | ✅ Completo |
| Contraste Validado | ✅ AAA/AA |
| Exemplos Práticos | ✅ Completo |
| Guia de Migração | ✅ Completo |

---

## 🚀 Próximos Passos

1. **Começar a usar** — Aplicar em novos componentes
2. **Migrar** — Atualizar componentes existentes (gradualmente)
3. **Validar** — Testar contraste com Lighthouse
4. **Treinar** — Compartilhar guias com o time

---

## 📝 Versão

**Sistema de Cores Pharos v1.0.0**  
Implementado em: 11/10/2025  
Última atualização: 11/10/2025

---

**Pharos — Confiança, Sofisticação, Modernidade** 🏢✨

