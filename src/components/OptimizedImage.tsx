'use client';

import Image, { ImageProps } from 'next/image';
import { getGenericBlurDataURL, getSmartBlurDataURL } from '@/utils/imageBlurUtils';

interface OptimizedImageProps extends ImageProps {
  propertyType?: string; // Tipo de imóvel para blur placeholder colorido
}

/**
 * Componente de imagem otimizado que:
 * - Usa <img> nativo para hosts DWV (evita problemas de otimização)
 * - Usa Next/Image para outros hosts
 * - Adiciona blur placeholders automaticamente
 */
export function OptimizedImage(props: OptimizedImageProps) {
  const { 
    src, 
    alt, 
    fill, 
    className, 
    sizes, 
    quality, 
    placeholder: providedPlaceholder, 
    blurDataURL: providedBlurDataURL, 
    loading, 
    draggable, 
    style, 
    priority,
    propertyType,
    ...restProps 
  } = props;
  
  // ✅ OTIMIZAÇÃO: Gerar blur placeholder automaticamente se não fornecido
  const shouldUseBlur = !providedPlaceholder && !providedBlurDataURL && !priority;
  const blurDataURL = shouldUseBlur 
    ? (typeof src === 'string' ? getSmartBlurDataURL(src) : getGenericBlurDataURL())
    : providedBlurDataURL;
  
  const placeholder = shouldUseBlur ? 'blur' as const : providedPlaceholder;
  
  // Se src é string e contém hosts DWV, usa img nativo
  if (typeof src === 'string' && (
    src.includes('dwvimagesv1.b-cdn.net') ||
    src.includes('b-cdn.net')
  )) {
    const imgStyle: React.CSSProperties = {
      ...style,
      objectFit: 'cover',
      width: fill ? '100%' : style?.width,
      height: fill ? '100%' : style?.height,
      position: fill ? 'absolute' : (style?.position || 'relative'),
      inset: fill ? 0 : undefined,
      // ✅ Fade-in suave para imagens carregadas
      transition: 'opacity 0.3s ease-in-out',
    };

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={imgStyle}
        loading={loading || (priority ? 'eager' : 'lazy')}
        draggable={draggable}
        {...(restProps as any)}
      />
    );
  }
  
  // Para outros hosts, usa Next/Image com blur placeholder
  const imageProps: ImageProps = {
    ...restProps,
    src,
    alt,
    fill,
    className,
    sizes,
    quality,
    loading,
    draggable,
    style,
    placeholder,
    blurDataURL,
  };
  
  // Só passa priority se for true
  if (priority) {
    imageProps.priority = true;
  }
  
  return <Image {...imageProps} />;
}

