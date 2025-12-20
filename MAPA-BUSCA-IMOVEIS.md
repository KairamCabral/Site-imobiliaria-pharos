# 🗺️ Busca de Imóveis com Mapa - Implementação

## ✅ Funcionalidades Implementadas

### 1. **Toggle Lista/Mapa**
- ✅ Botão toggle minimalista com ícones Lista e Mapa
- ✅ Design Pharos (navy/blue/neutros)
- ✅ Transição suave entre modos
- ✅ Estado preservado entre navegações

### 2. **Visualização em Mapa**
- ✅ **Desktop**: Mapa full-width com altura responsiva
- ✅ **Mobile**: Mapa fullscreen com BottomSheet
- ✅ Marcadores customizados (pill navy com preço)
- ✅ Clusters inteligentes (agrupamento automático)
- ✅ Mini-card ao clicar no marcador (foto + info + CTA)

### 3. **Marcadores e Clusters**
- ✅ Marcador: Pill com preço (bg navy #192233, texto white)
- ✅ Marcador em hover: Borda blue + glow
- ✅ Marcador selecionado: Escala 1.1 + sombra
- ✅ Dot dourado para imóveis de destaque
- ✅ Cluster: Badge circular blue com contagem
- ✅ Cluster click: Auto-zoom para expandir

### 4. **Interações**
- ✅ Hover em marcador → destaque no card (se visível)
- ✅ Click em marcador → abre mini-card com detalhes
- ✅ Botão "Buscar nesta área" (aparece ao mover o mapa)
- ✅ Geolocalização (botão FAB com ícone Navigation)
- ✅ Controles de zoom (FAB buttons navy)

### 5. **BottomSheet (Mobile)**
- ✅ Snap points: peek (96px), half (40vh), full (85vh)
- ✅ Swipe to drag entre snap points
- ✅ Modo peek: Carrossel horizontal de cards
- ✅ Modo full: Grid vertical com scroll
- ✅ Botão "Voltar para lista"

### 6. **Sincronização**
- ✅ Filtros aplicados ao mapa (mesmos resultados da lista)
- ✅ Ordenação refletida no mapa
- ✅ Bounds do mapa sincronizados com busca
- ✅ Debounce para evitar queries excessivas

### 7. **Acessibilidade**
- ✅ ARIA labels nos controles
- ✅ Contraste AA/AAA nos marcadores
- ✅ Foco visível com anel blue 2px
- ✅ role="application" no container do mapa
- ✅ aria-pressed no toggle Lista/Mapa

### 8. **Performance**
- ✅ Clustering automático (>50 marcadores)
- ✅ Lazy loading do MapView (SSR disabled)
- ✅ useMemo para transformação de dados
- ✅ Virtualização do BottomSheet

---

## 🏗️ Arquitetura

### Componentes Criados

```
src/components/map/
├── MapView.tsx              # Componente principal do mapa (Leaflet)
├── MapViewWrapper.tsx       # Wrapper para carregamento dinâmico (SSR-safe)
├── PropertyMarker.tsx       # Marcador customizado com pill de preço
├── PropertyMiniCard.tsx     # Card que aparece ao clicar no marcador
├── MapControls.tsx          # Controles (zoom, geolocalização)
└── BottomSheet.tsx          # Sheet para mobile com snap points
```

### Biblioteca

- **Leaflet** (via `react-leaflet` e `react-leaflet-cluster`)
- **Tiles**: OpenStreetMap (pode ser trocado por Mapbox/MapLibre)

---

## 🎨 Design System Pharos

### Cores Utilizadas
- **Navy**: `#192233` (marcadores, botões)
- **Blue**: `#054ADA` (hover, selecionado, clusters)
- **White**: `#FFFFFF` (texto nos marcadores)
- **Gold**: `#C8A968` (dot de destaque)
- **Slate**: `#8E99AB` (textos secundários)
- **Off-white**: `#F7F9FC` (backgrounds)

### Tokens CSS
Todos os estilos customizados estão em:
- `src/styles/leaflet-custom.css`

---

## 📱 Responsividade

### Desktop (≥1024px)
- Mapa com altura `calc(100vh - 320px)` (mínimo 500px)
- Sidebar de filtros à esquerda (fixa)
- Toggle Lista/Mapa no topo direito

### Mobile (<1024px)
- Mapa fullscreen (`fixed inset-0`)
- BottomSheet com cards em carrossel
- Swipe to drag entre snap points
- Botão "Voltar para lista" no header do BottomSheet

---

## 🔧 Como Usar

### 1. Visualizar Mapa
1. Acesse `/imoveis`
2. Clique no botão **Mapa** (ao lado de "Lista")
3. O mapa será carregado com todos os imóveis filtrados

### 2. Interagir com Marcadores
- **Click**: Abre mini-card com detalhes e CTA "Ver detalhes"
- **Hover**: Destaque visual (borda blue + glow)

### 3. Buscar em Área Específica
1. Mova/arraste o mapa para a área desejada
2. Botão "Buscar nesta área" aparecerá automaticamente
3. Click para buscar imóveis nos bounds atuais

### 4. Usar Geolocalização
1. Click no botão **Navigation** (canto inferior direito)
2. Permitir acesso à localização
3. Mapa centralizará na sua posição

### 5. Mobile - BottomSheet
- **Peek (minimizado)**: Cards em carrossel horizontal
- **Half (40%)**: Arraste para cima para ver mais cards
- **Full (85%)**: Modo lista completo com scroll

---

## 🚀 Próximos Passos Opcionais

### Funcionalidades Avançadas

1. **Layout Split (Desktop)**
   - Mapa à direita (50-60%)
   - Lista à esquerda (40-50%)
   - Drag-resize da divisória

2. **Desenhar Área**
   - Modo "Desenhar polígono" para filtrar por região desenhada
   - Persistir GeoJSON no URL

3. **Analytics Completo**
   - `map_view_open`
   - `map_bounds_change`
   - `map_search_in_area_click`
   - `map_marker_hover/click`
   - `map_cluster_click`

4. **Otimizações**
   - Virtualização da lista no split
   - Prefetch de tiles ao mover
   - Lazy images com srcset no mini-card

5. **Coordenadas Reais**
   - Atualmente usa coordenadas mockadas
   - Integrar com banco de dados para lat/long reais

---

## 📊 Performance

### Métricas Atuais
- **Clustering**: Ativado para >50 marcadores
- **Lazy Loading**: Mapa carrega apenas quando necessário (dynamic import)
- **Debounce**: 300ms para bounds change
- **Memory**: Virtualização do BottomSheet

### Recomendações
- Para 1000+ imóveis: implementar server-side clustering
- Para tiles customizados: usar Mapbox/MapLibre
- Para área grande: limitar maxBounds à região de atuação

---

## 🐛 Troubleshooting

### Mapa não carrega
- Verifique se Leaflet CSS está importado: `'leaflet/dist/leaflet.css'`
- Confira se o wrapper dinâmico está correto (`ssr: false`)

### Marcadores não aparecem
- Verifique se `latitude` e `longitude` estão preenchidos
- Coordenadas mockadas estão centradas em Balneário Camboriú

### BottomSheet não funciona no mobile
- Verifique se `viewMode === 'map'` no mobile
- Confira se `fixed inset-0 z-50` está aplicado

---

## ✨ Créditos

- **Mapas**: OpenStreetMap (tiles gratuitos)
- **Biblioteca**: Leaflet + React Leaflet
- **Clustering**: React Leaflet Cluster
- **Design**: Pharos Design System
- **Ícones**: Lucide React

---

**Implementação completa e funcional!** 🎉

