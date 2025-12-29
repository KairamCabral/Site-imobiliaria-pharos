/**
 * Custom image loader para Next.js
 * Roteia imagens do Vista CDN através de um proxy local para otimização
 */
export default function vistaImageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Para imagens do Vista CDN ou B-CDN, usar proxy de otimização
  if (
    typeof src === 'string' && 
    (src.includes('vistahost.com.br') || 
     src.includes('b-cdn.net'))
  ) {
    // Proxy via Next.js para otimizar com sharp
    return `/api/image-proxy?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }
  
  // Para imagens locais e outros hosts, retornar src original
  // O Next.js vai otimizar automaticamente
  return src;
}

