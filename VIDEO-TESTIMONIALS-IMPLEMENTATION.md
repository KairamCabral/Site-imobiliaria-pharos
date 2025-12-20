# Implementação de Depoimentos em Vídeo

## 📱 Visão Geral

Seção moderna de depoimentos em vídeo vertical, inspirada em redes sociais (Stories/TikTok), substituindo os cards estáticos de texto. Design premium com foco em performance e experiência do usuário.

## ✨ Funcionalidades Implementadas

### 1. **Player de Vídeo Vertical (9:16)**
- Formato otimizado para dispositivos móveis
- Design tipo Stories/TikTok
- Aspect ratio fixo para consistência visual

### 2. **Controles Inteligentes**
- **Vídeo Contínuo**: Os vídeos ficam rodando em loop automaticamente (mudos)
- **Botão Play no Hover**: Aparece apenas ao passar o mouse sobre o vídeo
- **Clique em Play**: 
  - Recomeça do início
  - Ativa o som deste vídeo
  - **Silencia automaticamente os outros vídeos** (apenas 1 com som por vez)
- **Mute/Unmute**: Botão no canto superior direito para controle individual
- **Auto-play**: Inicia automaticamente quando visível na viewport (50% visível)
- **Auto-pause**: Pausa quando sai da viewport para economizar recursos
- **Loop**: Vídeo reinicia automaticamente ao fim
- **Sistema de Áudio Exclusivo**: Apenas 1 vídeo pode ter som ativo simultaneamente

### 3. **Indicadores Visuais**
- **Barra de progresso** no topo do vídeo (sempre visível)
- **Botão Play** aparece apenas no hover:
  - Oculto quando não há hover
  - Ao passar o mouse: `bg-white/90` com animação fade-in
  - Ao hover no botão: `bg-white scale-110` (100% opaco e maior)
  - Ícone em azul navy para melhor contraste
- **Botão de Som** no canto superior direito:
  - Mudo: ícone de speaker barrado
  - Com som: ícone de speaker com ondas
- **Informações do cliente** (nome e cargo) no rodapé com drop-shadow
- **Overlay gradiente** inferior para melhor legibilidade do texto

### 4. **Sistema de Áudio Exclusivo**

Implementado usando React Context para garantir que apenas 1 vídeo tenha som por vez:

```typescript
// Context para controlar qual vídeo tem som ativo
interface AudioContextType {
  activeAudioId: number | null;
  setActiveAudioId: (id: number | null) => void;
}

const AudioContext = createContext<AudioContextType>({
  activeAudioId: null,
  setActiveAudioId: () => {},
});
```

**Comportamento:**
- Quando o usuário clica em PLAY em um vídeo:
  1. O vídeo recomeça do início
  2. Seu ID é definido como `activeAudioId` no contexto
  3. Todos os outros vídeos automaticamente ficam mudos
  4. Apenas o vídeo ativo tem som

**Benefícios:**
- ✅ Evita confusão com múltiplos áudios simultâneos
- ✅ Melhor experiência do usuário
- ✅ Economia de processamento de áudio

### 5. **Otimizações de Performance**

#### Lazy Loading Avançado
```typescript
// Intersection Observer detecta quando cada vídeo está visível
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      // Auto-play apenas quando 50% do vídeo está visível
    },
    { threshold: 0.5 }
  );
}, []);
```

#### Preload Metadata
```html
<video
  preload="metadata"  // Carrega apenas metadados, não o vídeo completo
  playsInline        // Evita fullscreen no mobile
  muted={isMuted}    // Inicia mudo para permitir autoplay
/>
```

### 6. **Responsividade Premium**
- **Mobile**: 1 coluna, vídeos empilhados
- **Tablet**: 2 colunas lado a lado
- **Desktop**: 4 colunas em grid

## 🎨 Design System

### Cores Utilizadas
- **Background**: Gradiente `from-pharos-base-off to-white`
- **Controles**: Branco com backdrop-blur para glassmorphism
- **Texto**: Branco com drop-shadow para contraste
- **Progresso**: Branco sobre fundo semi-transparente

### Animações
- **Framer Motion** para animações de entrada suaves
- **AnimatePresence** para transições de controles
- Delays progressivos nos cards (efeito cascata)

### Espaçamento
- **Section padding**: `py-24 md:py-28 lg:py-32`
- **Gap entre vídeos**: `gap-6 lg:gap-8`
- **Border radius**: `rounded-3xl` (cards arredondados)

## 📁 Estrutura de Arquivos

```
public/videos/depoimentos/
├── Depoimento 1.mp4
├── Depoimento 2.mp4
├── Depoimento 3.mp4
└── Depoimento 4.mp4

src/components/
└── VideoTestimonials.tsx  // Componente principal

src/app/
└── HomeClient.tsx  // Importa e usa o componente
```

## 🔧 Componentes

### VideoTestimonials
Componente pai que renderiza a seção completa com:
- Cabeçalho com título e descrição
- Grid responsivo de vídeos
- Background decorativo com blur effects
- Dica de interação no rodapé

### VideoCard
Componente individual para cada vídeo com:
- Player de vídeo com controles customizados
- Gerenciamento de estado (playing, muted, progress)
- Intersection Observer para auto-play/pause
- Event listeners para progresso

## 💡 Boas Práticas Implementadas

### Performance
✅ Lazy loading com Intersection Observer
✅ Preload apenas metadata (não vídeo completo)
✅ Auto-pause quando fora da viewport
✅ Muted por padrão (permite autoplay)
✅ playsInline para evitar fullscreen mobile

### Acessibilidade
✅ `aria-label` em todos os botões
✅ Labels descritivos ("Pausar vídeo", "Ativar som")
✅ Contraste adequado com drop-shadows
✅ Tamanho mínimo de 44x44px nos botões (WCAG)

### UX
✅ Feedback visual ao hover
✅ Controles aparecem/desaparecem inteligentemente
✅ Indicador de progresso sempre visível
✅ Loop automático para re-assistir
✅ Dica de interação no rodapé

### SEO
✅ Heading tags semânticas (h2, h3)
✅ Texto alternativo descritivo
✅ Metadata estruturada no cabeçalho

## 🎯 Dados dos Vídeos

```typescript
const depoimentos: VideoTestimonial[] = [
  {
    id: 1,
    videoUrl: '/videos/depoimentos/Depoimento 1.mp4',
    nome: 'Ricardo Mendes',
    cargo: 'Empresário',
  },
  // ... mais 3 depoimentos
];
```

## 🚀 Como Usar

### Importar no Componente
```tsx
import VideoTestimonials from '@/components/VideoTestimonials';

export default function HomePage() {
  return (
    <div>
      {/* Outras seções */}
      <VideoTestimonials />
      {/* Outras seções */}
    </div>
  );
}
```

### Adicionar Novos Vídeos
1. Coloque o vídeo em `public/videos/depoimentos/`
2. Adicione ao array `depoimentos` no componente:
```typescript
{
  id: 5,
  videoUrl: '/videos/depoimentos/Depoimento 5.mp4',
  nome: 'Nome do Cliente',
  cargo: 'Profissão',
}
```

## 📱 Requisitos de Vídeo

### Especificações Recomendadas
- **Formato**: MP4 (H.264)
- **Aspect Ratio**: 9:16 (vertical)
- **Resolução**: 1080x1920 ou 720x1280
- **Duração**: 15-30 segundos (ideal para Stories)
- **Tamanho**: < 10MB por vídeo
- **Codec**: H.264 para compatibilidade máxima

### Otimização
```bash
# Comprimir vídeo mantendo qualidade
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2000k output.mp4

# Redimensionar para 9:16
ffmpeg -i input.mp4 -vf "scale=720:1280" output.mp4
```

## 🎨 Customização

### Alterar Cores
```tsx
// No componente VideoTestimonials.tsx
className="bg-gradient-to-b from-SUA-COR to-SUA-COR-2"
```

### Ajustar Threshold de Visibilidade
```typescript
const observer = new IntersectionObserver(
  (entries) => { /* ... */ },
  { threshold: 0.5 }  // 0.5 = 50% visível
);
```

### Mudar Aspect Ratio
```tsx
// Para 16:9 (horizontal)
className="aspect-[16/9]"

// Para 1:1 (quadrado)
className="aspect-square"
```

## 🐛 Troubleshooting

### Vídeo não reproduz automaticamente
- Certifique-se que está `muted={true}` por padrão
- Verifique se `playsInline` está presente
- Navegadores bloqueiam autoplay com som

### Performance lenta
- Reduza o tamanho dos vídeos
- Verifique se `preload="metadata"` está configurado
- Considere usar um CDN para hospedar os vídeos

### Layout quebrado no mobile
- Verifique os breakpoints: `sm:grid-cols-2 lg:grid-cols-4`
- Confirme que o aspect-ratio está `aspect-[9/16]`

## 📊 Métricas de Performance

### Lighthouse Scores (Esperado)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 100
- **SEO**: 100

### Core Web Vitals
- **LCP**: < 2.5s (com lazy loading)
- **FID**: < 100ms (interatividade imediata)
- **CLS**: 0 (aspect-ratio fixo previne shifts)

## 🔄 Versão

**v1.0.0** - Implementação inicial com:
- 4 vídeos verticais
- Controles completos de play/pause/mute
- Auto-play com Intersection Observer
- Design responsivo premium
- Otimizações de performance

---

**Desenvolvido para Imobiliária Pharos** 🏢  
Design moderno, performance otimizada, UX premium ✨

