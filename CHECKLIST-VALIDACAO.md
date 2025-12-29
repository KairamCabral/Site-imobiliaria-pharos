# ✅ Checklist de Validação - Correções Mobile

## 🎯 Como Testar

Abra o site em diferentes dispositivos móveis ou use o DevTools do Chrome (F12 → Toggle Device Toolbar).

---

## 1. 🔧 Menu Mobile (CRÍTICO)

### Teste em TODAS as páginas:
- [ ] **Página Inicial** (`/`)
  - Scroll até o final da página
  - Clique no ícone hamburger (☰)
  - Menu abre corretamente? ✅ / ❌
  
- [ ] **Página Sobre** (`/sobre`)
  - Scroll até o meio da página
  - Clique no ícone hamburger
  - Menu abre corretamente? ✅ / ❌
  
- [ ] **Página Contato** (`/contato`)
  - Scroll até o formulário
  - Clique no ícone hamburger
  - Menu abre corretamente? ✅ / ❌
  
- [ ] **Página Empreendimentos** (`/empreendimentos`)
  - Scroll até a listagem
  - Clique no ícone hamburger
  - Menu abre corretamente? ✅ / ❌
  
- [ ] **Página Imóveis** (`/imoveis`)
  - Scroll até os cards
  - Clique no ícone hamburger
  - Menu abre corretamente? ✅ / ❌

### Resultado Esperado:
✅ Menu deve abrir **sempre**, independente da posição do scroll  
✅ Menu deve cobrir toda a tela (drawer lateral)  
✅ Logo deve aparecer completa dentro do menu  
✅ Overlay escuro deve aparecer atrás do menu  

---

## 2. 🏷️ Logo Pharos no Rodapé

### Teste em Mobile (< 640px):
- [ ] Scroll até o rodapé
- [ ] Logo da Pharos está menor que antes? ✅ / ❌
- [ ] Logo não está cortada? ✅ / ❌
- [ ] Logo está proporcional? ✅ / ❌

### Tamanhos Esperados:
- **Mobile** (< 640px): ~28px altura
- **Tablet** (640px+): ~32px altura  
- **Desktop** (768px+): ~36px altura

### Resultado Esperado:
✅ Logo **22% menor** em mobile  
✅ Logo não ocupa espaço desnecessário  
✅ Mais espaço para outros conteúdos  

---

## 3. 📱 Rodapé Mobile

### Links e Touch Targets:
- [ ] Tente tocar em "Imóveis" no rodapé
  - Fácil de acertar? ✅ / ❌
  
- [ ] Tente tocar em "Barra Sul"
  - Fácil de acertar? ✅ / ❌
  
- [ ] Tente tocar em telefone "(47) 9 9187-8070"
  - Fácil de acertar? ✅ / ❌
  
- [ ] Tente tocar em "contato@pharosnegocios.com.br"
  - Email não transborda? ✅ / ❌
  
- [ ] Tente tocar em "Privacidade" (bottom bar)
  - Fácil de acertar? ✅ / ❌

### Botão WhatsApp:
- [ ] Botão WhatsApp ocupa toda a largura em mobile? ✅ / ❌
- [ ] Botão tem altura mínima de 48px? ✅ / ❌
- [ ] Fácil de tocar? ✅ / ❌
- [ ] Abre WhatsApp corretamente? ✅ / ❌

### Ícones Sociais:
- [ ] Instagram está em tamanho adequado? ✅ / ❌
- [ ] YouTube está em tamanho adequado? ✅ / ❌
- [ ] Fácil de tocar? ✅ / ❌

### Resultado Esperado:
✅ **Todos** os links têm **mínimo 44x44px**  
✅ Textos legíveis (mínimo 12px)  
✅ Email não transborda  
✅ Botões fáceis de tocar  

---

## 4. 🎠 Setas do Carrossel

### Teste na Home (`/`):
- [ ] Scroll até "Destaques"
- [ ] Setas aparecem nos dois lados do carrossel? ✅ / ❌
- [ ] Seta esquerda funciona? ✅ / ❌
- [ ] Seta direita funciona? ✅ / ❌
- [ ] Setas têm tamanho adequado em mobile? ✅ / ❌

### Teste em Outras Seções:
- [ ] "Lançamentos" - Setas visíveis? ✅ / ❌
- [ ] "Exclusivos" - Setas visíveis? ✅ / ❌
- [ ] "Frente Mar" - Setas visíveis? ✅ / ❌

### Tamanhos Esperados:
- **Mobile**: 40x40px (h-10 w-10)
- **Desktop**: 48x48px (h-12 w-12)

### Resultado Esperado:
✅ Setas **sempre visíveis** em mobile  
✅ Setas em tamanho adequado (40x40px)  
✅ Fácil de tocar  
✅ Feedback visual ao tocar (scale-95)  

---

## 5. 🏢 Página Empreendimentos

### Hero Section:
- [ ] Título legível em mobile? ✅ / ❌
- [ ] Badge "Curadoria premium" visível? ✅ / ❌
- [ ] Descrição não corta? ✅ / ❌
- [ ] Hero não está muito alto? ✅ / ❌

### Listagem:
- [ ] Cards têm espaçamento adequado? ✅ / ❌
- [ ] Grid de 1 coluna em mobile? ✅ / ❌
- [ ] Imagens carregam corretamente? ✅ / ❌
- [ ] Textos legíveis? ✅ / ❌

### Resultado Esperado:
✅ Hero compacto em mobile  
✅ Título: 24px (text-2xl) em mobile  
✅ Gaps menores entre cards (12px)  
✅ Grid responsivo: 1 → 2 → 3 colunas  

---

## 6. 🎨 Testes de Acessibilidade

### Touch Targets (Importante!):
Use um dedo para testar:

- [ ] Consegue tocar todos os links do rodapé? ✅ / ❌
- [ ] Consegue tocar botões do menu mobile? ✅ / ❌
- [ ] Consegue tocar setas do carrossel? ✅ / ❌
- [ ] Consegue tocar botões CTA? ✅ / ❌

### Contraste:
- [ ] Textos brancos no rodapé legíveis? ✅ / ❌
- [ ] Textos escuros no conteúdo legíveis? ✅ / ❌
- [ ] Links destacam bem do fundo? ✅ / ❌

### Resultado Esperado:
✅ **100%** dos elementos tocáveis com ≥ 44x44px  
✅ Contraste ≥ 4.5:1  
✅ WCAG 2.1 AA compliant  

---

## 7. 📐 Testes de Layout

### Orientação:
- [ ] **Portrait** (vertical): Tudo funciona? ✅ / ❌
- [ ] **Landscape** (horizontal): Tudo funciona? ✅ / ❌

### Zoom:
- [ ] Zoom 100%: Layout ok? ✅ / ❌
- [ ] Zoom 150%: Layout ok? ✅ / ❌
- [ ] Zoom 200%: Layout ok? ✅ / ❌
- [ ] Sem scroll horizontal? ✅ / ❌

### Resultado Esperado:
✅ Layout funciona em ambas orientações  
✅ Sem scroll horizontal em nenhum zoom  
✅ Elementos não quebram até 200%  

---

## 8. 🌐 Testes Cross-Browser

### Chrome Mobile:
- [ ] Menu mobile funciona? ✅ / ❌
- [ ] Carrossel funciona? ✅ / ❌
- [ ] Rodapé renderiza bem? ✅ / ❌

### Safari iOS:
- [ ] Menu mobile funciona? ✅ / ❌
- [ ] Carrossel funciona? ✅ / ❌
- [ ] Rodapé renderiza bem? ✅ / ❌

### Samsung Internet:
- [ ] Menu mobile funciona? ✅ / ❌
- [ ] Carrossel funciona? ✅ / ❌
- [ ] Rodapé renderiza bem? ✅ / ❌

---

## 📊 Score Final

### Contagem:
- Total de testes: **60**
- Testes passando: _____ / 60
- Percentual: _____ %

### Critério de Aprovação:
- ✅ **Excelente**: ≥ 95% (57+/60)
- ⚠️ **Bom**: 85-94% (51-56/60)
- ❌ **Precisa melhorar**: < 85% (< 51/60)

---

## 🐛 Reportar Problemas

Se encontrar algum problema, documente:

**Dispositivo**: _____________  
**Navegador**: _____________  
**Problema**: _____________  
**Página**: _____________  
**Screenshot**: [anexo]  

**Passos para reproduzir**:
1. _____________
2. _____________
3. _____________

---

## 🎉 Checklist Rápido (Top 5)

Teste rápido para validar principais correções:

1. [ ] **Menu mobile abre em qualquer posição?** ✅ / ❌
2. [ ] **Logo do rodapé está menor em mobile?** ✅ / ❌
3. [ ] **Setas do carrossel visíveis em mobile?** ✅ / ❌
4. [ ] **Links do rodapé fáceis de tocar?** ✅ / ❌
5. [ ] **Página de empreendimentos carrega bem?** ✅ / ❌

Se todos os 5 estão ✅, as correções principais funcionam!

---

**Última Atualização**: 29/12/2025  
**Versão**: 1.0  
**Status**: Pronto para teste

