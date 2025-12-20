# 📊 Relatório de Contraste WCAG 2.1 — Pharos

**Data:** 11/10/2025  
**Padrão:** WCAG 2.1 Level AA / AAA  
**Ferramenta:** WebAIM Contrast Checker + Manual Validation

---

## 📋 Critérios WCAG 2.1

| Nível | Texto Normal (≤18px) | Texto Grande (≥18px bold / 24px) | Elementos Gráficos |
|-------|----------------------|----------------------------------|-------------------|
| **AA** | ≥ 4.5:1 | ≥ 3.0:1 | ≥ 3.0:1 |
| **AAA** | ≥ 7.0:1 | ≥ 4.5:1 | ≥ 4.5:1 |

---

## ✅ Pares Validados (Aprovados)

### 1. Navy 900 sobre White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#192233` (Navy 900) |
| **Background** | `#FFFFFF` (White) |
| **Contraste** | **15.93:1** |
| **WCAG** | ✅ **AAA** (texto normal e grande) |
| **Uso Recomendado** | Títulos principais, header/footer |

**Aplicações:**
- H1, H2, H3 em fundo branco
- Header e rodapé (invertido: White sobre Navy)
- Cards com títulos em destaque

---

### 2. Slate 700 sobre White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#2C3444` (Slate 700) |
| **Background** | `#FFFFFF` (White) |
| **Contraste** | **12.49:1** |
| **WCAG** | ✅ **AAA** (texto normal e grande) |
| **Uso Recomendado** | Texto principal (body), parágrafos |

**Aplicações:**
- Body text em cards
- Descrições de imóveis
- Conteúdo de formulários

---

### 3. Slate 700 sobre Off-White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#2C3444` (Slate 700) |
| **Background** | `#F7F9FC` (Off-White) |
| **Contraste** | **11.84:1** |
| **WCAG** | ✅ **AAA** (texto normal e grande) |
| **Uso Recomendado** | Texto principal no body do site |

**Aplicações:**
- Parágrafos no background principal
- Conteúdo de artigos/blog
- Listagens de imóveis

---

### 4. Blue 500 sobre White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#054ADA` (Blue 500) |
| **Background** | `#FFFFFF` (White) |
| **Contraste** | **7.00:1** |
| **WCAG** | ✅ **AAA** (texto normal e grande) |
| **Uso Recomendado** | Botões primários, CTAs, links em cards |

**Aplicações:**
- Botão "Ver Detalhes" em cards
- Links de navegação
- Preços em destaque (opcional, preferir Navy)

---

### 5. Blue 500 sobre Off-White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#054ADA` (Blue 500) |
| **Background** | `#F7F9FC` (Off-White) |
| **Contraste** | **6.64:1** |
| **WCAG** | ✅ **AA** (texto normal) / ✅ **AAA** (texto grande) |
| **Uso Recomendado** | Links no body, CTAs secundários |

**Aplicações:**
- Links inline no texto
- Botões de texto no body
- Navegação breadcrumb

---

### 6. Slate 500 sobre White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#585E6B` (Slate 500) |
| **Background** | `#FFFFFF` (White) |
| **Contraste** | **6.50:1** |
| **WCAG** | ✅ **AA** (texto normal) / ✅ **AAA** (texto grande) |
| **Uso Recomendado** | Texto secundário, metadados |

**Aplicações:**
- Área, quartos, vagas (cards)
- Timestamps, autores
- Legendas e helper text

---

### 7. Slate 500 sobre Off-White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#585E6B` (Slate 500) |
| **Background** | `#F7F9FC` (Off-White) |
| **Contraste** | **6.17:1** |
| **WCAG** | ✅ **AA** (texto normal) / ✅ **AAA** (texto grande) |
| **Uso Recomendado** | Metadados no body |

**Aplicações:**
- Filtros aplicados
- Datas de atualização
- Informações auxiliares

---

### 8. White sobre Navy 900

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#FFFFFF` (White) |
| **Background** | `#192233` (Navy 900) |
| **Contraste** | **15.93:1** |
| **WCAG** | ✅ **AAA** (texto normal e grande) |
| **Uso Recomendado** | Header, footer, CTAs premium |

**Aplicações:**
- Texto de navegação
- Links no header
- Títulos no footer

---

### 9. White sobre Blue 500

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#FFFFFF` (White) |
| **Background** | `#054ADA` (Blue 500) |
| **Contraste** | **7.00:1** |
| **WCAG** | ✅ **AAA** (texto normal e grande) |
| **Uso Recomendado** | Botões primários |

**Aplicações:**
- Botão "Buscar"
- CTAs principais (ex: "Entre em Contato")
- Badges de destaque (ex: "Novo")

---

### 10. Error (Red) sobre White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#C53A3A` (Error Red) |
| **Background** | `#FFFFFF` (White) |
| **Contraste** | **4.58:1** |
| **WCAG** | ✅ **AA** (texto normal) |
| **Uso Recomendado** | Mensagens de erro, validações |

**Aplicações:**
- Mensagens de erro em formulários
- Alertas de validação
- Estados de erro

---

## ❌ Pares Reprovados (Não Usar)

### 1. Slate 300 sobre White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#ADB4C0` (Slate 300) |
| **Background** | `#FFFFFF` (White) |
| **Contraste** | **2.09:1** |
| **WCAG** | ❌ **FAIL** (não atinge AA) |
| **Uso Permitido** | **Apenas bordas e divisores** |

⚠️ **NUNCA usar Slate 300 para texto**

**Uso correto:**
```css
/* ✅ Correto - Borda */
border: 1px solid var(--ph-slate-300);

/* ❌ Errado - Texto */
color: var(--ph-slate-300); /* NÃO FAZER */
```

---

### 2. Gold 500 sobre White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#C89C4D` (Brass Gold) |
| **Background** | `#FFFFFF` (White) |
| **Contraste** | **2.52:1** |
| **WCAG** | ❌ **FAIL** (não atinge AA) |
| **Uso Permitido** | **Apenas como detalhe decorativo** |

⚠️ **NUNCA usar Gold para texto longo ou blocos**

**Uso correto:**
```css
/* ✅ Correto - Ícone decorativo */
.icon-accent {
  color: var(--ph-gold);
  font-size: 18px; /* pequeno */
}

/* ✅ Correto - Filete decorativo */
border-top: 1px solid var(--ph-gold);

/* ❌ Errado - Texto de parágrafo */
p.highlight {
  color: var(--ph-gold); /* NÃO FAZER */
}
```

---

### 3. Gold 500 sobre Off-White

| Propriedade | Valor |
|-------------|-------|
| **Foreground** | `#C89C4D` (Brass Gold) |
| **Background** | `#F7F9FC` (Off-White) |
| **Contraste** | **2.39:1** |
| **WCAG** | ❌ **FAIL** |
| **Uso Permitido** | Detalhe decorativo apenas |

---

## 📊 Tabela Resumida

| Par (Foreground / Background) | Contraste | WCAG | Status |
|-------------------------------|-----------|------|--------|
| Navy 900 / White | 15.93:1 | AAA | ✅ |
| Slate 700 / White | 12.49:1 | AAA | ✅ |
| Slate 700 / Off-White | 11.84:1 | AAA | ✅ |
| Blue 500 / White | 7.00:1 | AAA | ✅ |
| Blue 500 / Off-White | 6.64:1 | AA | ✅ |
| Slate 500 / White | 6.50:1 | AA | ✅ |
| Slate 500 / Off-White | 6.17:1 | AA | ✅ |
| White / Navy 900 | 15.93:1 | AAA | ✅ |
| White / Blue 500 | 7.00:1 | AAA | ✅ |
| Error / White | 4.58:1 | AA | ✅ |
| **Slate 300 / White** | **2.09:1** | **FAIL** | ❌ |
| **Gold / White** | **2.52:1** | **FAIL** | ❌ |
| **Gold / Off-White** | **2.39:1** | **FAIL** | ❌ |

---

## 🎨 Mapa de Uso por Contexto

### Header e Rodapé

```
Background: Navy 900 (#192233)
Texto: White (#FFFFFF) — ✅ AAA (15.93:1)
Links: White com hover em Gold (detalhe visual, não mudança de cor de texto)
CTA: Blue 500 background + White text — ✅ AAA (7.00:1)
```

---

### Body (Fundo Off-White)

```
Background: Off-White (#F7F9FC)
Texto principal: Slate 700 (#2C3444) — ✅ AAA (11.84:1)
Texto secundário: Slate 500 (#585E6B) — ✅ AA (6.17:1)
Links: Blue 500 (#054ADA) — ✅ AA (6.64:1)
```

---

### Cards (Fundo White)

```
Background: White (#FFFFFF)
Título: Navy 900 (#192233) — ✅ AAA (15.93:1)
Descrição: Slate 700 (#2C3444) — ✅ AAA (12.49:1)
Metadados: Slate 500 (#585E6B) — ✅ AA (6.50:1)
Bordas: Slate 300 (#ADB4C0) — ✅ (uso apenas em borda)
CTAs: Blue 500 (#054ADA) — ✅ AAA (7.00:1)
```

---

### Botões Primários

```
Background: Blue 500 (#054ADA)
Texto: White (#FFFFFF) — ✅ AAA (7.00:1)
```

---

### Formulários

```
Campo:
  Background: White (#FFFFFF)
  Borda: Slate 300 (#ADB4C0) — ✅ (borda, não texto)
  Texto: Slate 700 (#2C3444) — ✅ AAA (12.49:1)

Focus:
  Borda: Blue 500 (#054ADA)
  Outline: Blue 500 com offset

Erro:
  Borda: Error Red (#C53A3A)
  Mensagem: Error Red (#C53A3A) — ✅ AA (4.58:1)
```

---

## 🧪 Ferramentas de Validação

### Recomendadas

1. **WebAIM Contrast Checker**  
   🔗 https://webaim.org/resources/contrastchecker/

2. **Chrome DevTools - Lighthouse**  
   Accessibility audit built-in

3. **axe DevTools**  
   Extensão para Chrome/Firefox

4. **Stark (Figma/Sketch)**  
   Plugin para designers

---

## ✅ Checklist de Implementação

### Antes de publicar novo componente:

- [ ] Verificar contraste de todos os textos (≥4.5 AA / ≥7.0 AAA)
- [ ] Validar que Slate 300 é usado apenas em bordas
- [ ] Confirmar que Gold não é usado em texto longo
- [ ] Garantir estados hover/focus com contraste adequado
- [ ] Testar com Lighthouse (Accessibility score ≥90)

---

## 📝 Notas Finais

### Prioridade de Contraste

1. **Títulos principais:** AAA (≥7.0)
2. **Texto de corpo:** AAA quando possível, mínimo AA (≥4.5)
3. **Texto secundário:** AA obrigatório (≥4.5)
4. **Elementos gráficos:** AA (≥3.0)

---

### Exceções Permitidas

**Gold como detalhe decorativo:**
- Permitido em ícones pequenos (16-20px)
- Permitido em filetes e bordas
- **Não permitido** em texto longo ou blocos

**Slate 300:**
- Permitido apenas em bordas e divisores
- **Não permitido** em texto ou elementos gráficos informativos

---

## 🚀 Próximos Passos

1. **Auditar componentes existentes** — verificar se seguem os pares aprovados
2. **Criar testes automatizados** — integrar validação de contraste no CI/CD
3. **Treinar a equipe** — workshop sobre acessibilidade e contraste
4. **Documentar exceções** — se houver casos especiais, justificar e documentar

---

**Pharos — Comprometido com acessibilidade e excelência visual** ♿✨

---

**Revisado por:** Sistema de Design Pharos  
**Última atualização:** 11/10/2025

