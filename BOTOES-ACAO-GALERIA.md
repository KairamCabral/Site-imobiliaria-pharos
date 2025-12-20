# Botões de Ação na Galeria de Imagens

## 📋 Visão Geral

Sistema de botões de ação integrado à galeria de imagens da página de detalhes do imóvel, permitindo acesso rápido a recursos complementares como mapa, vídeo, tour 360° e folder para download.

## 🎨 Design e Posicionamento

### Localização
- **Desktop/Mobile**: Canto inferior esquerdo da imagem principal
- **z-index**: 10 (acima do overlay, abaixo do lightbox)
- **Sempre visível**: Não requer hover para aparecer

### Estilo Visual (Pharos Premium)
- **Background**: `bg-white/95` com `backdrop-blur-sm`
- **Hover**: `bg-white` com `shadow-lg`
- **Bordas**: `rounded-lg` (mobile) | `rounded-xl` (desktop)
- **Sombra**: `shadow-sm` padrão, `shadow-lg` no hover
- **Cores**: Navy (`#192233`) para ícones e texto
- **Transições**: `transition-all` suave

### Responsividade

#### Mobile (< 640px)
- Apenas ícones visíveis
- Padding reduzido: `px-2.5 py-2`
- Gap menor: `gap-1.5`
- Bordas: `rounded-lg`

#### Tablet/Desktop (≥ 640px)
- Ícones + texto
- Padding normal: `px-3 py-2`
- Gap: `gap-2`
- Bordas: `rounded-xl`

## 🔘 Botões Disponíveis

### 1. Mapa
- **Ícone**: `MapPin` (Lucide)
- **Ação**: Abre Google Maps com as coordenadas do imóvel em nova aba
- **Condição**: Aparece se `localizacao` estiver definida
- **URL**: `https://www.google.com/maps?q={latitude},{longitude}`
- **Aria-label**: "Ver localização no mapa"

### 2. Vídeo
- **Ícone**: `Video` (Lucide)
- **Ação**: Abre URL do vídeo em nova aba (YouTube, Vimeo, etc.)
- **Condição**: Aparece se `videoUrl` estiver definida
- **Aria-label**: "Assistir vídeo"

### 3. Tour 360°
- **Ícone**: `Scan` (Lucide)
- **Ação**: Abre tour virtual 360° em nova aba
- **Condição**: Aparece se `tour360Url` estiver definida
- **Aria-label**: "Tour virtual 360°"
- **Nota**: Pode integrar com Matterport, Kuula, etc.

### 4. Folder (Download)
- **Ícone**: `FileText` (Lucide)
- **Ação**: Inicia download do folder do imóvel (PDF)
- **Condição**: Aparece se `folderUrl` estiver definida
- **Tag**: `<a>` com atributo `download`
- **Aria-label**: "Baixar folder"

## 📝 Props do Componente

### ImageGallery

```typescript
interface ImageGalleryProps {
  images: string[];              // Obrigatório
  title: string;                 // Obrigatório
  videoUrl?: string;             // Opcional - URL do vídeo
  folderUrl?: string;            // Opcional - URL do PDF
  tour360Url?: string;           // Opcional - URL do tour 360°
  localizacao?: {                // Opcional - Coordenadas GPS
    latitude: number;
    longitude: number;
  };
}
```

### Exemplo de Uso

```tsx
<ImageGallery 
  images={imovelData.imagens} 
  title={imovelData.titulo}
  videoUrl="https://www.youtube.com/watch?v=..."
  folderUrl="/pdfs/apartamento-luxo.pdf"
  tour360Url="https://my.matterport.com/show/?m=..."
  localizacao={{
    latitude: -26.9857,
    longitude: -48.6348
  }}
/>
```

## 🎯 Comportamento

### Interações
1. **Click/Tap**: Executa ação do botão
2. **stopPropagation**: Impede abertura do lightbox ao clicar nos botões
3. **Hover** (desktop): Aumenta sombra e torna fundo opaco
4. **Acessibilidade**: 
   - `aria-label` em todos os botões
   - `title` para tooltip
   - Contraste AAA entre texto/ícone e fundo

### Prioridade de Exibição
1. Mapa (mais à esquerda)
2. Vídeo
3. Tour 360°
4. Folder (mais à direita)

**Nota**: Apenas os botões com dados disponíveis são renderizados.

## ✅ Acessibilidade

- ✅ Labels semânticos (`aria-label`)
- ✅ Tooltips informativos (`title`)
- ✅ Contraste AAA (Navy sobre branco)
- ✅ Touch targets adequados (≥ 44x44px)
- ✅ Foco visível para navegação por teclado
- ✅ stopPropagation para evitar ações indesejadas

## 📱 Estratégia Mobile-First

### Mobile
- Ícones-only para economizar espaço
- Tamanho compacto sem perder área de toque
- Sombra visível para destacar da imagem

### Tablet/Desktop
- Ícone + texto para clareza
- Espaçamento confortável
- Hover states sofisticados

## 🔄 Integração com Dados

### Página do Imóvel (src/app/imoveis/[id]/page.tsx)

```typescript
const imovelData = {
  // ... outros campos
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  folderUrl: "/pdfs/apartamento-luxo-frente-mar.pdf",
  tour360Url: "https://www.exemplo.com/tour360",
  localizacao: {
    latitude: -26.9857,
    longitude: -48.6348,
    endereco: "Av. Atlântica, 1500 - Centro, Balneário Camboriú - SC"
  },
  // ...
};
```

## 🎨 Classes CSS Principais

```css
/* Container */
.absolute.bottom-3.left-3.md:bottom-4.md:left-4

/* Botão Base */
.bg-white/95.hover:bg-white.backdrop-blur-sm
.px-2.5.py-2.md:px-3.md:py-2
.rounded-lg.md:rounded-xl
.shadow-sm.hover:shadow-lg

/* Texto Responsivo */
.hidden.sm:inline         /* Esconde em mobile */
.text-xs.md:text-sm       /* Tamanho ajustável */
.whitespace-nowrap        /* Evita quebra */

/* Ícone */
.w-4.h-4.flex-shrink-0   /* Tamanho fixo */
```

## 🚀 Próximas Melhorias

1. **Compartilhar**: Botão para compartilhar imóvel em redes sociais
2. **Favoritar**: Integração com sistema de favoritos
3. **Analytics**: Tracking de cliques nos botões
4. **Impressão**: Botão para gerar versão para impressão
5. **Comparar**: Adicionar imóvel à comparação

## 📊 Métricas de Sucesso

- Taxa de clique em cada botão
- Conversão após visualizar vídeo/tour
- Downloads de folder
- Abertura do mapa

---

**Versão**: 1.0  
**Data**: 12/10/2025  
**Status**: ✅ Implementado

