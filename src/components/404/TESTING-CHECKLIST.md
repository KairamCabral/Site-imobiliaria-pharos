# ✅ Checklist de Testes - Página 404 Premium

## 🧪 Testes Funcionais

### Renderização Básica
- [ ] Página carrega sem erros no console
- [ ] Ilustração SVG aparece corretamente
- [ ] Contador anima de 0 a 404
- [ ] Textos estão corretos e sem typos
- [ ] Layout responsivo funciona (testar 3 breakpoints)

### Navegação
- [ ] Botão "Voltar para Home" → `/`
- [ ] Botão "Ver Imóveis" → `/imoveis`
- [ ] Link "Empreendimentos" → `/empreendimentos`
- [ ] Link "Busca Avançada" → `/busca-avancada`
- [ ] Link "Contato" → `/contato`
- [ ] Link "Sobre Nós" → `/sobre`
- [ ] Link "Entre em contato" (rodapé) → `/contato`

### Busca
- [ ] Input aceita texto
- [ ] Botão buscar fica desabilitado quando vazio
- [ ] Enter no input envia busca
- [ ] Click no botão envia busca
- [ ] Loading state aparece
- [ ] Redirecionamento para `/imoveis?busca=...` funciona
- [ ] Sugestão "Apartamentos" → `/imoveis?tipo=apartamento`
- [ ] Sugestão "Casas" → `/imoveis?tipo=casa`
- [ ] Sugestão "Alto Padrão" → `/imoveis?tags=alto-padrao`
- [ ] Sugestão "Balneário Camboriú" → `/imoveis?cidade=balneario-camboriu`

### Smart Suggestions
- [ ] 3 cards de imóveis aparecem
- [ ] Cards têm imagem, título, preço
- [ ] Click no card abre detalhes
- [ ] Botão "Ver Todos os Imóveis" → `/imoveis`
- [ ] Fallback gracioso se API falhar (seção não aparece)

---

## 📊 Analytics

### Page View
1. Abrir DevTools → Network
2. Acessar `/pagina-inexistente`
3. Verificar:
   - [ ] POST para `/api/metrics`
   - [ ] Payload contém `404_page_view`
   - [ ] `attempted_url` = `/pagina-inexistente`
   - [ ] `referrer` preenchido
   - [ ] `user_agent` preenchido
   - [ ] `timestamp` ISO string

### Action Click
1. Clicar em "Voltar para Home"
2. Verificar:
   - [ ] POST para `/api/metrics`
   - [ ] Evento: `404_action_click`
   - [ ] `action` = `"home"`
   - [ ] `attempted_url` correto

3. Repetir para:
   - [ ] "Ver Imóveis" (action: `imoveis`)
   - [ ] "Empreendimentos" (action: `empreendimentos`)
   - [ ] "Busca Avançada" (action: `busca-avancada`)
   - [ ] "Contato" (action: `contato`)
   - [ ] "Sobre Nós" (action: `sobre`)

### Search Submit
1. Digitar "apartamento 3 quartos"
2. Clicar buscar
3. Verificar:
   - [ ] POST para `/api/metrics`
   - [ ] Evento: `404_search_submit`
   - [ ] `query` = `"apartamento 3 quartos"`
   - [ ] `attempted_url` correto

---

## 🔍 SEO

### Metadata
Inspecionar `<head>` da página:
- [ ] `<title>` = "Página Não Encontrada | Pharos Negócios Imobiliários"
- [ ] `<meta name="description">` presente
- [ ] `<meta name="robots" content="noindex, follow">`
- [ ] OpenGraph tags presentes
  - [ ] `og:title`
  - [ ] `og:description`
  - [ ] `og:type` = `"website"`

### Structured Data
1. Copiar JSON-LD do source
2. Validar em: https://validator.schema.org/
   - [ ] Sem erros
   - [ ] Schema: WebPage
   - [ ] BreadcrumbList presente
   - [ ] Organization reference

### Status HTTP
1. Abrir DevTools → Network
2. Acessar `/pagina-inexistente`
3. Verificar:
   - [ ] Status: 404 (não 200 ou 301)

---

## ♿ Acessibilidade

### Contraste (DevTools → Lighthouse → Accessibility)
- [ ] Todos os textos têm contraste ≥ 4.5:1 (AA)
- [ ] Preferência: contraste ≥ 7:1 (AAA)
- [ ] Nenhum warning de contraste

### Navegação por Teclado
1. Usar apenas Tab + Enter
2. Verificar ordem lógica:
   - [ ] 1º: Logo Pharos (header)
   - [ ] 2º: Menu navegação (header)
   - [ ] 3º: Botão "Voltar para Home"
   - [ ] 4º: Botão "Ver Imóveis"
   - [ ] 5º: Input de busca
   - [ ] 6º: Botão buscar
   - [ ] 7-10: Sugestões rápidas
   - [ ] 11-14: Quick links
   - [ ] 15-17: Cards de imóveis
   - [ ] 18: "Ver Todos os Imóveis"
   - [ ] 19+: Footer links

3. Focus visível:
   - [ ] Ring azul 2px em todos os elementos
   - [ ] Contraste adequado
   - [ ] Não é removido por CSS

### Touch Targets
Inspecionar com régua do DevTools:
- [ ] Todos os botões ≥ 44x44px
- [ ] Links principais ≥ 44px altura
- [ ] Sugestões rápidas ≥ 44px
- [ ] Cards clicáveis ≥ 44x44px

### ARIA
Inspecionar HTML source:
- [ ] Contador: `aria-label="Erro 404"`
- [ ] Input: `aria-label="Buscar imóveis"`
- [ ] Botão buscar: `aria-label="Buscar"`
- [ ] Ilustração: `aria-hidden="true"`
- [ ] SVG decorativos: `aria-hidden="true"`

### Heading Hierarchy
Inspecionar com extension Headings:
```
h1: "Página Não Encontrada"
  h2: "Ou Faça uma Busca Rápida"
  h2: "Links Úteis"
  h2: "Confira Nossos Imóveis em Destaque"
```
- [ ] Sem pulos (h1 → h3)
- [ ] Apenas 1 h1 por página
- [ ] Ordem lógica

### Screen Reader
Testar com NVDA (Windows) ou VoiceOver (Mac):
1. Iniciar screen reader
2. Navegar pela página
3. Verificar:
   - [ ] H1 anunciado: "Página Não Encontrada"
   - [ ] Descrição clara: "Ops! Parece que esta página..."
   - [ ] Botões anunciados com label correto
   - [ ] Input anunciado: "Buscar imóveis, campo de edição"
   - [ ] Links anunciados com destino
   - [ ] Cards de imóveis têm título legível
   - [ ] Navegação lógica e clara

### Motion Sensitivity
1. Ativar: Configurações → Acessibilidade → Reduzir movimento
2. OU: DevTools → Rendering → Emulate prefers-reduced-motion: reduce
3. Verificar:
   - [ ] Ilustração não flutua
   - [ ] Bússola não gira
   - [ ] Question marks não pulsam
   - [ ] Contador não anima (aparece 404 direto)
   - [ ] Fade-in desabilitado
   - [ ] Página ainda funcional

---

## ⚡ Performance

### Lighthouse Audit
1. DevTools → Lighthouse
2. Modo: Desktop + Mobile
3. Categorias: Todas
4. Rodar audit
5. Verificar scores:
   - [ ] Performance: ≥ 95
   - [ ] Accessibility: 100
   - [ ] Best Practices: 100
   - [ ] SEO: 100

### Web Vitals
1. DevTools → Console
2. Verificar logs:
   - [ ] LCP < 2.5s (ideal < 1.5s)
   - [ ] FID < 100ms
   - [ ] CLS = 0 (ideal)
   - [ ] TTFB < 800ms
   - [ ] FCP < 1.8s

### Bundle Size
1. `npm run build`
2. Verificar output:
   - [ ] not-found: < 50KB (gzipped)
   - [ ] Nenhum warning de bundle size

### Network
1. DevTools → Network → Slow 3G
2. Recarregar página
3. Verificar:
   - [ ] Página carrega em < 5s (3G)
   - [ ] Conteúdo principal visível em < 3s
   - [ ] Sem FOUC (flash of unstyled content)
   - [ ] Sem layout shift (CLS = 0)

---

## 📱 Responsividade

### Mobile (375px)
DevTools → iPhone SE
- [ ] Layout em stack vertical
- [ ] Ilustração visível (menor)
- [ ] Botões full-width
- [ ] Busca full-width
- [ ] Cards 1 coluna ou scroll horizontal
- [ ] Quick links 2 colunas
- [ ] Texto legível (≥ 16px)
- [ ] Touch targets ≥ 44px

### Tablet (768px)
DevTools → iPad
- [ ] Layout adaptado
- [ ] Ilustração lado esquerdo ou topo
- [ ] Botões lado a lado
- [ ] Busca centralizada
- [ ] Cards 2 colunas
- [ ] Quick links 4 colunas

### Desktop (1280px+)
DevTools → Responsive 1920x1080
- [ ] Layout 2 colunas (ilustração + conteúdo)
- [ ] Conteúdo alinhado à esquerda
- [ ] Max-width respeitado (1280px)
- [ ] Ilustração proporcional
- [ ] Cards 3 colunas
- [ ] Espaçamento adequado

### Orientação
- [ ] Portrait: OK
- [ ] Landscape: OK
- [ ] Sem overflow horizontal
- [ ] Scroll vertical funciona

---

## 🧪 Testes de Edge Cases

### URLs Especiais
- [ ] `/pagina-inexistente` → 404
- [ ] `/imoveis/codigo-invalido` → 404
- [ ] `/rota/super/profunda/inexistente` → 404
- [ ] `/?query=param` (inexistente) → 404

### Estados de Erro
- [ ] API de imóveis offline → seção SmartSuggestions não aparece
- [ ] API retorna 0 imóveis → seção não aparece
- [ ] Busca com caracteres especiais → funciona
- [ ] Busca com emoji → funciona

### Navegador
Testar em:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Conexão
- [ ] Online: tudo funciona
- [ ] Offline: página carrega (cache)
- [ ] 3G lento: carrega em tempo aceitável
- [ ] Wi-Fi: instant load

---

## ✅ Aprovação Final

### Critérios de Aceitação
- [ ] Todos os testes funcionais passam
- [ ] Analytics capturando eventos
- [ ] SEO completo e válido
- [ ] Lighthouse score ≥ 95 (todas categorias)
- [ ] Acessibilidade WCAG 2.1 AA
- [ ] Responsivo em todos os breakpoints
- [ ] Sem erros no console
- [ ] Sem warnings de lint
- [ ] TypeScript sem erros
- [ ] Build sem erros

### Assinatura
- [ ] Testado por: _______________
- [ ] Data: _______________
- [ ] Status: ⬜ APROVADO | ⬜ REPROVADO

---

**Último update:** 10/12/2025




