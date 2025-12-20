// src/utils/imageProxy.ts

/**
 * Helper para gerar URLs do proxy CDN de imagens
 */

// Domínios externos que devem usar o proxy
const EXTERNAL_DOMAINS = [
  'vistahost.com.br',
  'vistaimoveis.com.br',
  'dwv.com.br',
  'dwvcloud.com.br',
  'unsplash.com',
  'images.unsplash.com',
];

/**
 * Verifica se uma URL é externa e deve ser proxiada
 */
export function shouldProxyImage(url: string): boolean {
  if (!url || !url.startsWith('http')) return false;
  
  try {
    const urlObj = new URL(url);
    return EXTERNAL_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Gera URL do proxy CDN para imagens externas
 * 
 * @param url - URL original da imagem
 * @param width - Largura desejada (default: 1200)
 * @param quality - Qualidade 1-100 (default: 80)
 * @returns URL proxiada ou original se local
 */
export function getProxiedImageUrl(
  url: string,
  width: number = 1200,
  quality: number = 80
): string {
  // Se não for URL externa, retornar original
  if (!shouldProxyImage(url)) {
    return url;
  }

  // Construir URL do proxy
  const params = new URLSearchParams({
    url: url,
    w: width.toString(),
    q: quality.toString(),
  });

  return `/api/image-proxy?${params.toString()}`;
}

/**
 * Gera múltiplos tamanhos para srcset
 * 
 * @param url - URL original da imagem
 * @param widths - Array de larguras (default: [640, 828, 1200, 1920])
 * @param quality - Qualidade 1-100 (default: 80)
 * @returns String srcset
 */
export function getProxiedImageSrcSet(
  url: string,
  widths: number[] = [640, 828, 1200, 1920],
  quality: number = 80
): string {
  if (!shouldProxyImage(url)) {
    return '';
  }

  return widths
    .map(width => `${getProxiedImageUrl(url, width, quality)} ${width}w`)
    .join(', ');
}

/**
 * Hook para usar no OptimizedImage component
 * 
 * Exemplo:
 * 
 * import { getProxiedImageUrl } from '@/utils/imageProxy';
 * 
 * const imageSrc = getProxiedImageUrl(property.photo, 800, 85);
 * <Image src={imageSrc} ... />
 */

/**
 * Configurações por contexto
 */
export const IMAGE_PROXY_CONFIGS = {
  // Hero images - alta qualidade
  hero: { width: 1920, quality: 90 },
  
  // Cards de listagem - balanceado
  card: { width: 800, quality: 80 },
  
  // Thumbnails - mais comprimido
  thumbnail: { width: 400, quality: 75 },
  
  // Galeria/lightbox - alta qualidade
  gallery: { width: 1600, quality: 85 },
  
  // Mobile otimizado
  mobile: { width: 640, quality: 75 },
} as const;

/**
 * Helper com configuração predefinida
 */
export function getProxiedImage(
  url: string,
  preset: keyof typeof IMAGE_PROXY_CONFIGS = 'card'
): string {
  const config = IMAGE_PROXY_CONFIGS[preset];
  return getProxiedImageUrl(url, config.width, config.quality);
}

