# 🔍 TESTE MANUAL DO CARROSSEL - Instruções

## ✅ O QUE FOI IMPLEMENTADO

1. **Hook useSwipe** atualizado com suporte a Pointer Events (mouse + touch + pen)
2. **ImovelCard** com carrossel manual completo
3. **PropertyCardHorizontal** com carrossel manual completo
4. **PropertyMiniCard** (mini card do mapa) com carrossel manual
5. **Logs de debug** temporários adicionados

## 🧪 COMO TESTAR

### Passo 1: Abrir o Console do Navegador
1. Acesse http://localhost:3600 [[memory:8251365]]
2. Pressione `F12` ou `Ctrl+Shift+I`
3. Vá na aba **Console**

### Passo 2: Procurar pelos Logs de Debug
No console, você verá logs assim:

```
[ImovelCard PH742] Carrossel: {
  imagensRecebidas: 4,
  galleryFiltrada: 4,
  carouselImagesLength: 4,
  hasMultiple: true,
  currentIndex: 0,
  primeiraImagem: "https://..."
}
```

### Passo 3: Analisar os Valores

**✅ Carrossel DEVE funcionar quando:**
- `imagensRecebidas >= 2`
- `galleryFiltrada >= 2`
- `carouselImagesLength >= 2`
- `hasMultiple: true`

**❌ Carrossel NÃO aparece quando:**
- `imagensRecebidas < 2` (0 ou 1)
- `hasMultiple: false`

### Passo 4: Testar Interação Manual

Quando `hasMultiple: true`, você deve ver:

#### Desktop:
- **Setas** aparecem no hover sobre o card
- **Indicadores** (bolinhas) aparecem na parte inferior
- **Teclado**: Foque o card e use `ArrowLeft`/`ArrowRight`

#### Mobile:
- **Setas** sempre visíveis
- **Swipe**: Arraste horizontalmente
- **Indicadores** clicáveis

### Passo 5: Verificar Locais

Teste nos 4 contextos:

1. ✅ **Página Inicial** (/) - seção "Imóveis Exclusivos"
2. ✅ **Página /imoveis** - lista com filtros
3. ✅ **Página /imoveis/[id]** - seção "Imóveis Relacionados"
4. ✅ **Página /imoveis/[id]** - seção "Visto recentemente"

## 🐛 SE O CARROSSEL NÃO APARECER

Copie e cole os logs do console aqui e me envie:

```
// Cole aqui os logs que aparecem no console
[ImovelCard ...] Carrossel: { ... }
```

## ✅ CRITÉRIOS DE ACEITE

- [ ] Aguardar 60s sem interação → slide NÃO muda
- [ ] Alternar de aba e voltar → permanece no mesmo slide
- [ ] Setas funcionam (desktop hover + mobile sempre)
- [ ] Indicadores funcionam (clique/tap)
- [ ] Swipe funciona (mobile/touch)
- [ ] Teclado funciona (ArrowLeft/Right)
- [ ] Botão favoritar clicável
- [ ] Card inteiro clicável (link para detalhes)
- [ ] Cards com 0 imagens → placeholder
- [ ] Cards com 1 imagem → sem controles
- [ ] Cards com 2+ imagens → controles aparecem
- [ ] Console sem erros

## 🎯 PRÓXIMO PASSO

Após testar, me informe:

1. **Funciona?** Sim/Não
2. **Em quais locais?** (home, /imoveis, relacionados, recentes)
3. **Quantas imagens aparecem nos logs?** (imagensRecebidas, hasMultiple)
4. **Console tem erros?** Cole aqui se tiver

Com essas informações, posso ajustar o que for necessário!

