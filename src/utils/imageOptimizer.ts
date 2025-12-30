/**
 * 🚀 Otimização Estratégica de Imagens de APIs Externas
 * 
 * Suporta:
 * - Vista CDN (cdn.vistahost.com.br)
 * - DWV B-CDN (dwvimagesv1.b-cdn.net)
 * - Cloudinary (opcional, configurar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
 * 
 * Estratégias aplicadas:
 * ✅ Quality adaptativo por contexto (hero: 80, card: 75, gallery: 70, thumbnail: 65)
 * ✅ Sizes responsivos por tipo de layout
 * ✅ Lazy loading inteligente
 * ✅ Cloudinary como proxy opcional para otimização adicional
 */

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export type ImageQualityPreset = 'hero' | 'card' | 'gallery' | 'thumbnail';

/**
 * Presets de qualidade baseados em pesquisas de performance web:
 * - Quality 75-80 é visualmente idêntico a 90-95
 * - Reduz payload em 40-60% sem perda perceptível
 */
export const QUALITY_PRESETS: Record<ImageQualityPreset, number> = {
  hero: 80,      // Hero banners, LCP crítico - balance entre qualidade e performance
  card: 75,      // Cards de imóveis - qualidade ótima para listagens
  gallery: 70,   // Galerias lazy-loaded - prioriza velocidade
  thumbnail: 65, // Miniaturas pequenas - otimização máxima
};

/**
 * Presets de sizes para diferentes layouts responsivos
 * Formato: media queries CSS que informam ao navegador qual tamanho carregar
 */
export const SIZES_PRESETS = {
  // Full width (100% da viewport)
  fullWidth: '100vw',
  hero: '100vw',
  
  // Grid de 3 colunas (33% desktop, 50% tablet, 100% mobile)
  cardGrid3: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  
  // Grid de 2 colunas (50% desktop/tablet, 100% mobile)
  cardGrid2: '(max-width: 768px) 100vw, 50vw',
  
  // Galeria principal (70% da largura no desktop)
  galleryMain: '(max-width: 1024px) 100vw, 70vw',
  
  // Thumbnails fixos
  thumbnail: '150px',
  thumbnailSmall: '100px',
  
  // Sidebar/coluna lateral (30% desktop)
  sidebar: '(max-width: 768px) 100vw, 30vw',
  
  // Card horizontal (42% da largura)
  cardHorizontal: '(max-width: 768px) 100vw, 42vw',
};

/**
 * Detecta se a URL é de uma API externa (Vista ou DWV)
 */
export function isExternalAPIImage(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const externalDomains = [
    'vistahost.com.br',
    'b-cdn.net',
    'dwv.com.br',
    'dwvimages',
    'vista.imobi',
  ];
  
  return externalDomains.some(domain => url.includes(domain));
}

/**
 * Otimiza URL de imagem externa via Cloudinary (se configurado)
 * 
 * Cloudinary gratuito: 25GB/mês de bandwidth
 * - Otimização automática para WebP/AVIF
 * - Resize on-the-fly
 * - Cache global em 200+ datacenters
 * 
 * Se não configurado, retorna URL original para Next.js otimizar via Vercel
 */
export function optimizeExternalImage(
  url: string,
  options: {
    width?: number;
    quality?: number | ImageQualityPreset;
    format?: 'auto' | 'webp' | 'avif';
  } = {}
): string {
  if (!url || !url.startsWith('http')) return url;
  
  // Se não for imagem de API externa, retornar original
  if (!isExternalAPIImage(url)) return url;
  
  // Se Cloudinary não configurado, deixar Next.js/Vercel otimizar
  if (!CLOUDINARY_CLOUD) {
    return url;
  }
  
  // Resolver quality preset
  const quality = typeof options.quality === 'string' 
    ? QUALITY_PRESETS[options.quality]
    : options.quality || 75;
  
  const width = options.width ? `w_${options.width},` : '';
  const format = options.format || 'auto';
  
  // Transformações Cloudinary otimizadas:
  // - f_auto: formato automático (WebP/AVIF quando suportado)
  // - q_auto:good: qualidade automática otimizada
  // - c_limit: não aumentar imagem se menor que width
  // - dpr_auto: suporta telas retina automaticamente
  const transforms = `f_${format},q_${quality},${width}c_limit,dpr_auto`;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${transforms}/${encodeURIComponent(url)}`;
}

/**
 * Gera placeholder SVG para evitar CLS (Cumulative Layout Shift)
 * Retorna um SVG leve em base64 que mantém o aspect ratio
 */
export function generatePlaceholderSVG(
  width: number = 1200,
  height: number = 800,
  bgColor: string = '#f3f4f6'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" version="1.1">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Placeholder padrão para imagens 16:9
 */
export const DEFAULT_PLACEHOLDER = generatePlaceholderSVG(1600, 900);

/**
 * Placeholder para cards quadrados
 */
export const SQUARE_PLACEHOLDER = generatePlaceholderSVG(800, 800);

/**
 * Placeholder para cards verticais (portrait)
 */
export const PORTRAIT_PLACEHOLDER = generatePlaceholderSVG(600, 800);

/**
 * Calcula dimensões ideais baseadas no aspect ratio
 */
export function calculateImageDimensions(
  targetWidth: number,
  aspectRatio: number = 16 / 9
): { width: number; height: number } {
  return {
    width: targetWidth,
    height: Math.round(targetWidth / aspectRatio),
  };
}

/**
 * Configuração recomendada para diferentes tipos de imagens
 */
export const IMAGE_CONFIGS = {
  hero: {
    quality: QUALITY_PRESETS.hero,
    sizes: SIZES_PRESETS.hero,
    priority: true,
    placeholder: DEFAULT_PLACEHOLDER,
  },
  cardGrid: {
    quality: QUALITY_PRESETS.card,
    sizes: SIZES_PRESETS.cardGrid3,
    priority: false,
    placeholder: DEFAULT_PLACEHOLDER,
  },
  gallery: {
    quality: QUALITY_PRESETS.gallery,
    sizes: SIZES_PRESETS.galleryMain,
    priority: false,
    placeholder: DEFAULT_PLACEHOLDER,
  },
  thumbnail: {
    quality: QUALITY_PRESETS.thumbnail,
    sizes: SIZES_PRESETS.thumbnail,
    priority: false,
    placeholder: SQUARE_PLACEHOLDER,
  },
} as const;

