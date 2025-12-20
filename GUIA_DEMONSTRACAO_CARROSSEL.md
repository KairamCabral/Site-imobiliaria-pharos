# Guia de Demonstração: Carrossel 100% Manual

## 🎬 Como Criar o Vídeo/GIF Demonstrativo

Este guia orienta a criação da demonstração visual solicitada no plano.

---

## 🛠️ Ferramentas Recomendadas

### Para Gravação de Tela
**Desktop:**
- **Windows:** Xbox Game Bar (Win + G) ou OBS Studio
- **Mac:** QuickTime Player (Cmd + Shift + 5) ou ScreenFlow
- **Linux:** SimpleScreenRecorder ou Kazam

**Mobile:**
- **Android:** Gravador de tela nativo (Android 11+)
- **iOS:** Gravador de tela nativo (Centro de Controle)

### Para Conversão em GIF
- **Online:** CloudConvert, ezgif.com
- **Desktop:** FFmpeg, ScreenToGif (Windows), Gifski (Mac)

---

## 📝 Roteiro de Demonstração

### **Parte 1: Desktop (60 segundos)**

#### Cena 1: Home - PropertyShowcaseCarousel (15s)
1. ⏱️ Abrir página inicial
2. 🎯 Aguardar 10 segundos **sem interação**
3. ✅ Mostrar que carrossel não avança sozinho
4. 🖱️ Clicar nas setas de navegação do carrossel
5. 🎯 Mostrar cards avançando apenas ao clicar

#### Cena 2: Cards com Múltiplas Imagens (20s)
1. 🎯 Focar em um card com 2+ imagens
2. 🖱️ Passar mouse sobre o card (setas aparecem)
3. 🖱️ Clicar na seta direita → imagem avança
4. 🖱️ Clicar na seta esquerda → imagem volta
5. 🖱️ Clicar em um indicador (bolinha) → pula para aquela imagem
6. ⏱️ Aguardar 5 segundos → mostrar que não avança sozinho

#### Cena 3: Página /imoveis (15s)
1. 🎯 Navegar para `/imoveis`
2. 🖱️ Rolar a página
3. ✅ Mostrar que carrosséis não avançam ao entrar na viewport
4. 🖱️ Interagir com um card (setas/indicadores)
5. ✅ Confirmar controle manual

#### Cena 4: Troca de Aba (10s)
1. 🎯 Observar imagem atual de um card
2. 🔄 Alternar para outra aba do navegador
3. ⏱️ Aguardar 5 segundos
4. 🔄 Voltar para a aba
5. ✅ Confirmar que é a mesma imagem

### **Parte 2: Mobile (45 segundos)**

#### Cena 5: Swipe no Mobile (20s)
1. 📱 Abrir em dispositivo móvel ou modo responsivo (375px)
2. 🎯 Focar em um card com múltiplas imagens
3. 👆 Arrastar imagem para esquerda (swipe) → avança
4. 👆 Arrastar imagem para direita (swipe) → volta
5. ✅ Mostrar transição suave com inércia

#### Cena 6: Indicadores no Mobile (10s)
1. 🎯 Focar nas bolinhas (indicadores)
2. 👆 Tocar em uma bolinha específica
3. ✅ Confirmar que pula diretamente para aquela imagem

#### Cena 7: Área de Toque (15s)
1. 🎯 Mostrar setas no mobile (sempre visíveis)
2. 👆 Tocar na seta direita
3. 👆 Tocar na seta esquerda
4. ✅ Destacar que área de toque é confortável (44x44px)

### **Parte 3: Estados de Imagens (15 segundos)**

#### Cena 8: Diferentes Estados (15s)
1. 🎯 Card com 0 imagens → mostrar placeholder sem controles
2. 🎯 Card com 1 imagem → mostrar imagem sem setas/indicadores
3. 🎯 Card com 2+ imagens → mostrar controles completos
4. ✅ Destacar cada estado visualmente

---

## ✍️ Texto de Narração/Legenda

### Para o Vídeo
```
🎯 Carrossel 100% Manual - Demonstração

✅ SEM autoplay - aguardamos 10s e nada acontece
✅ Setas funcionam perfeitamente - controle total do usuário
✅ Indicadores clicáveis - pule para qualquer imagem
✅ Troca de aba - mantém a mesma imagem
✅ Swipe suave no mobile - gesto natural
✅ Área de toque confortável - 44x44px (WCAG 2.1 AA)
✅ Estados corretos - 0, 1 ou múltiplas imagens

Experiência premium. Acessível. 100% manual.
```

### Para o README
```markdown
## 🎥 Demonstração Visual

### Desktop
![Carrossel Desktop](./assets/demo-carrossel-desktop.gif)
- ✅ Aguarda interação do usuário (sem autoplay)
- ✅ Setas e indicadores com feedback visual
- ✅ Troca de aba não afeta estado

### Mobile
![Carrossel Mobile](./assets/demo-carrossel-mobile.gif)
- ✅ Swipe fluido com inércia suave
- ✅ Área de toque 44x44px (WCAG 2.1 AA)
- ✅ Controles sempre visíveis

### Estados
![Estados do Carrossel](./assets/demo-estados.gif)
- 0 imagens: Placeholder sem controles
- 1 imagem: Sem setas/indicadores
- 2+ imagens: Controles completos
```

---

## 🎨 Dicas de Apresentação

### Qualidade
- **Resolução:** Mínimo 1280x720 (HD)
- **Frame rate:** 30 fps ou mais
- **Duração:** 60-90 segundos (máximo 2 minutos)

### Destaque Visual
- 🔵 **Círculo azul** ao clicar (para destacar cliques)
- ⏱️ **Timer visível** durante os 10s de espera
- ✅ **Checkmark** quando algo funciona corretamente
- 🎯 **Seta** apontando para elemento em foco

### Edição
1. **Slow motion** (0.5x) nos momentos de swipe
2. **Zoom** nos controles pequenos (indicadores)
3. **Side-by-side** para comparar desktop/mobile
4. **Text overlay** com confirmações (✅ "Sem autoplay")

---

## 📦 Entrega Final

### Formato
- **Vídeo:** MP4 (H.264, 1280x720, 30fps)
- **GIF:** Máximo 10MB, otimizado para web
- **Screenshots:** PNG em alta resolução

### Onde Salvar
```
imobiliaria-pharos/
├── assets/
│   ├── demo-carrossel-desktop.mp4
│   ├── demo-carrossel-desktop.gif
│   ├── demo-carrossel-mobile.mp4
│   ├── demo-carrossel-mobile.gif
│   └── demo-estados.png
└── VALIDACAO_CARROSSEL_MANUAL.md (já criado)
```

### Checklist Final
- [ ] Gravação desktop completa (60s)
- [ ] Gravação mobile completa (45s)
- [ ] Screenshots de cada estado
- [ ] GIFs otimizados (< 10MB cada)
- [ ] Legendas/texto overlay
- [ ] Salvos na pasta `assets/`

---

## 🚀 Comandos Úteis

### Gravar Tela no Terminal
```bash
# Linux - SimpleScreenRecorder
simplescreenrecorder

# Mac - QuickTime via terminal
# Abrir QuickTime e usar Arquivo > Nova Gravação de Tela

# Windows - Game Bar
# Win + Alt + R para iniciar/parar
```

### Converter Vídeo para GIF (FFmpeg)
```bash
# Otimizado para web (10 fps, redimensionado)
ffmpeg -i input.mp4 -vf "fps=10,scale=800:-1:flags=lanczos" -c:v gif output.gif

# Alta qualidade (20 fps)
ffmpeg -i input.mp4 -vf "fps=20,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif
```

### Otimizar GIF (Gifsicle)
```bash
gifsicle -O3 --lossy=80 -o output-optimized.gif output.gif
```

---

## 📖 Referências

- [WCAG 2.1 AA - Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Web Vitals - CLS](https://web.dev/cls/)

---

## 💡 Dica Final

Se preferir, pode usar ferramentas online como:
- **Loom** (gravação + compartilhamento fácil)
- **ScreenPal** (ex-Screencast-O-Matic)
- **Vidyard** (para vídeos profissionais)

Estas ferramentas já geram link direto, facilitando o compartilhamento.

---

**Status:** Implementação de código ✅ Completa | Demonstração visual 📹 Pronta para gravação

