/**
 * Image Blur Utilities
 * 
 * Utilitários para gerar blur placeholders SVG para imagens
 * Melhora a percepção de velocidade e reduz CLS
 */

/**
 * Converte string para base64 (compatível com browser e Node.js)
 */
function toBase64(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(str);
  }
  // Node.js (SSR)
  return Buffer.from(str).toString('base64');
}

/**
 * Gera um blur placeholder genérico (cinza)
 */
export function getGenericBlurDataURL(): string {
  const svg = `
    <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="40" height="30" fill="url(#grad)"/>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

/**
 * Gera blur placeholder com cor específica
 */
export function getColoredBlurDataURL(color: string): string {
  const svg = `
    <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="30" fill="${color}"/>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

/**
 * Gera blur placeholder com gradiente shimmer (loading effect)
 */
export function getShimmerBlurDataURL(): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1">
            <animate attributeName="stop-opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1">
            <animate attributeName="stop-opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1">
            <animate attributeName="stop-opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#shimmer)"/>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

/**
 * Cores por tipo de imóvel para blur placeholder
 */
const PROPERTY_TYPE_COLORS: Record<string, string> = {
  apartamento: '#3b82f6',    // Blue
  casa: '#10b981',            // Green
  cobertura: '#8b5cf6',       // Purple
  terreno: '#f59e0b',         // Amber
  comercial: '#ef4444',       // Red
  empreendimento: '#ec4899',  // Pink
  sala: '#06b6d4',            // Cyan
  loft: '#a855f7',            // Purple
  sobrado: '#14b8a6',         // Teal
  kitnet: '#f97316',          // Orange
};

/**
 * Gera blur placeholder baseado no tipo de imóvel
 */
export function getPropertyTypeBlurDataURL(propertyType?: string): string {
  if (!propertyType) {
    return getGenericBlurDataURL();
  }
  
  const normalizedType = propertyType.toLowerCase().trim();
  const color = PROPERTY_TYPE_COLORS[normalizedType];
  
  if (!color) {
    return getGenericBlurDataURL();
  }
  
  // Criar gradiente sutil com a cor do tipo
  const svg = `
    <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.6" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>
      <rect width="40" height="30" fill="url(#grad)" filter="url(#blur)"/>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

/**
 * Extrai cor dominante de uma imagem e gera blur placeholder
 * (versão simplificada - usa hash do URL)
 */
export function getSmartBlurDataURL(imageUrl: string): string {
  if (!imageUrl) {
    return getGenericBlurDataURL();
  }
  
  // Gerar hash simples do URL para cor consistente
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    hash = ((hash << 5) - hash) + imageUrl.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Gerar cor suave baseada no hash
  const hue = Math.abs(hash % 360);
  const color = `hsl(${hue}, 60%, 70%)`;
  
  return getColoredBlurDataURL(color);
}

/**
 * Hook para pré-carregar blur placeholder
 */
export function preloadBlurDataURL(dataURL: string): void {
  if (typeof window === 'undefined') return;
  
  const img = new Image();
  img.src = dataURL;
  // Não precisa fazer nada com a imagem, apenas forçar o navegador a cachear
}

/**
 * Gera LQIP (Low Quality Image Placeholder) simulado
 * Retorna um SVG de 10x10 com cor média
 */
export function getLQIPDataURL(avgColor?: string): string {
  const color = avgColor || '#e5e7eb';
  
  const svg = `
    <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="10" fill="${color}"/>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

/**
 * Mapa de cores para destaque
 */
export const BLUR_PRESETS = {
  default: getGenericBlurDataURL(),
  shimmer: getShimmerBlurDataURL(),
  blue: getColoredBlurDataURL('#3b82f6'),
  green: getColoredBlurDataURL('#10b981'),
  purple: getColoredBlurDataURL('#8b5cf6'),
  amber: getColoredBlurDataURL('#f59e0b'),
} as const;

