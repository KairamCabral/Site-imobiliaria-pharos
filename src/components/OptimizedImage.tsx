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
  
  // Se src é string e contém hosts DWV/Vista, otimiza e usa img nativo
  if (typeof src === 'string' && (
    src.includes('dwvimagesv1.b-cdn.net') ||
    src.includes('b-cdn.net') ||
    src.includes('cdn.vistahost.com.br') ||
    src.includes('vistahost.com.br')
  )) {
    // ✅ OTIMIZAÇÃO AGRESSIVA: Reduzir tamanhos e qualidade
    let optimizedSrc = src;
    const targetWidth = fill ? 800 : 600; // Reduzido de 1200/800
    const targetQuality = 60; // Reduzido de 75
    
    // Para B-CDN (DWV), adiciona parâmetros de resize e qualidade
    if (src.includes('b-cdn.net')) {
      const separator = src.includes('?') ? '&' : '?';
      optimizedSrc = `${src}${separator}width=${targetWidth}&quality=${targetQuality}&format=webp`;
    }
    
    // Para Vista CDN, adiciona parâmetros se disponível
    if (src.includes('vistahost.com.br')) {
      const separator = src.includes('?') ? '&' : '?';
      optimizedSrc = `${src}${separator}w=${targetWidth}&q=${targetQuality}&fm=webp`;
    }
    
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
        src={optimizedSrc}
        alt={alt}
        className={className}
        style={imgStyle}
        loading={loading || (priority ? 'eager' : 'lazy')}
        draggable={draggable}
        // ✅ Adicionar width/height para evitar CLS
        width={fill ? undefined : 400}
        height={fill ? undefined : 300}
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

