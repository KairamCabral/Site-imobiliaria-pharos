# DEBUG DO CARROSSEL

## Problema Reportado
Usuário reporta que o carrossel não está aparecendo nos cards.

## Componentes Verificados

### ✅ usePropertyCarousel (Hook)
- **Status**: Implementado corretamente
- **Funcionalidade**: 
  - Filtra imagens válidas
  - Gerencia estado currentIndex
  - Fornece next/prev/goTo
  - Integra com useSwipe
  - **SEM AUTOPLAY** ✓

### ✅ ImovelCard
- **Status**: Implementado corretamente
- **Hooks usados**: usePropertyCarousel ✓
- **Controles renderizados**:
  - Setas prev/next (quando hasMultiple) ✓
  - Indicadores/dots (quando hasMultiple) ✓
  - Swipe via ref ✓
  - Teclado (ArrowLeft/Right) ✓

### ✅ PropertyCardHorizontal
- **Status**: Implementado corretamente
- **Mesma estrutura** do ImovelCard ✓

## Hipóteses

### 1. Imagens não estão chegando como array
**Verificar**: Se `imagens` está vindo como string ao invés de array

### 2. Array vazio ou com 1 imagem
**Comportamento esperado**: 
- 0 imagens → placeholder
- 1 imagem → imagem única SEM controles
- 2+ imagens → carrossel COM controles

### 3. hasMultiple = false
Se `hasMultiple` é false, os controles não aparecem (comportamento correto).

## Próximos Passos

1. Adicionar console.log temporário para depurar
2. Verificar no browser DevTools quantas imagens chegam
3. Testar manualmente clicando nas setas
4. Verificar se CSS está escondendo elementos

## Solução

Adicionar logs de depuração temporários no ImovelCard:

```typescript
console.log('[ImovelCard Debug]', {
  id,
  imagensRecebidas: imagens?.length || 0,
  galleryFiltrada: gallery.length,
  carouselImagesLength: carouselImages.length,
  hasMultiple,
  currentIndex,
});
```

