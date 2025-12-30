'use client';

import Image, { ImageProps } from 'next/image';
import { getGenericBlurDataURL, getSmartBlurDataURL } from '@/utils/imageBlurUtils';
import { 
  optimizeExternalImage, 
  QUALITY_PRESETS, 
  DEFAULT_PLACEHOLDER,
  type ImageQualityPreset 
} from '@/utils/imageOptimizer';

interface OptimizedImageProps extends Omit<ImageProps, 'quality'> {
  propertyType?: string; // Tipo de imóvel para blur placeholder colorido
  variant?: ImageQualityPreset; // Preset de qualidade: 'hero' | 'card' | 'gallery' | 'thumbnail'
}

/**
 * 🚀 Componente de Imagem Super Otimizado
 * 
 * Otimizações aplicadas:
 * ✅ Quality adaptativo por variante (hero: 80, card: 75, gallery: 70, thumbnail: 65)
 * ✅ Cloudinary como proxy opcional (25GB grátis/mês)
 * ✅ Deixa Next.js/Vercel otimizar via /_next/image quando Cloudinary não configurado
 * ✅ Blur placeholder automático para evitar CLS
 * ✅ Lazy loading inteligente
 * 
 * Uso:
 * <OptimizedImage 
 *   src={imageUrl} 
 *   alt="..."
 *   width={800}
 *   height={600}
 *   variant="card" // hero | card | gallery | thumbnail
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 */
export function OptimizedImage(props: OptimizedImageProps) {
  const { 
    src, 
    alt, 
    fill, 
    className, 
    sizes, 
    variant = 'card',
    placeholder: providedPlaceholder, 
    blurDataURL: providedBlurDataURL, 
    loading, 
    draggable, 
    style, 
    priority,
    propertyType,
    width,
    height,
    ...restProps 
  } = props;
  
  // Resolver quality do preset
  const quality = QUALITY_PRESETS[variant];
  
  // ✅ Otimizar URL via Cloudinary (se configurado) ou deixar Next.js otimizar
  const optimizedSrc = typeof src === 'string' 
    ? optimizeExternalImage(src, {
        width: width as number,
        quality: variant,
      })
    : src;
  
  // ✅ OTIMIZAÇÃO: Gerar blur placeholder automaticamente se não fornecido
  const shouldUseBlur = !providedPlaceholder && !providedBlurDataURL && !priority;
  const blurDataURL = shouldUseBlur 
    ? (typeof src === 'string' ? getSmartBlurDataURL(src) : DEFAULT_PLACEHOLDER)
    : providedBlurDataURL;
  
  const placeholder = shouldUseBlur ? 'blur' as const : providedPlaceholder;
  
  // Montar props do Next/Image
  const imageProps: ImageProps = {
    ...restProps,
    src: optimizedSrc,
    alt: alt || '',
    fill,
    width: !fill ? width : undefined,
    height: !fill ? height : undefined,
    className,
    sizes,
    quality,
    loading: priority ? 'eager' : (loading || 'lazy'),
    draggable: draggable ?? false,
    style,
    placeholder,
    blurDataURL,
    priority,
  };
  
  return <Image {...imageProps} />;
}

