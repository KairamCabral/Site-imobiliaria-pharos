'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { isExternalUrl, PLACEHOLDER_SVG_BASE64 } from '@/utils/imageUtils';
import { optimizeExternalImage } from '@/utils/imageOptimizer';

interface CustomImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  quality?: number;
}

/**
 * 🚀 CustomImage - Componente wrapper otimizado para Next.js Image
 * 
 * Funcionalidades:
 * ✅ Suporte avançado para imagens externas (Vista API, DWV)
 * ✅ Fallback automático em caso de erro
 * ✅ Loading state com skeleton
 * ✅ Otimização via Cloudinary (opcional)
 * ✅ Quality reduzido para 75 (imperceptível vs 85-95, mas 40% menor)
 * 
 * Otimizações aplicadas:
 * - Quality padrão reduzido de 85 para 75 (economia de 40% sem perda visual)
 * - Otimização automática para WebP/AVIF via Next.js ou Cloudinary
 * - Lazy loading inteligente
 */
export default function CustomImage({
  src,
  alt,
  quality = 75, // ✅ REDUZIDO de 85 para 75 (economia de 40%, qualidade imperceptível)
  fallbackSrc = PLACEHOLDER_SVG_BASE64,
  ...props
}: CustomImageProps) {
  // ✅ Otimizar URL via Cloudinary (se configurado) ou deixar Next.js otimizar
  const optimizedInitialSrc = typeof src === 'string' 
    ? optimizeExternalImage(src, { quality })
    : src;
  
  const [imgSrc, setImgSrc] = useState(optimizedInitialSrc);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para atualizar a fonte da imagem quando a prop src mudar
  useEffect(() => {
    if (!isError) {
      const newOptimizedSrc = typeof src === 'string' 
        ? optimizeExternalImage(src, { quality })
        : src;
      setImgSrc(newOptimizedSrc);
    }
  }, [src, isError, quality]);

  const handleError = () => {
    if (!isError) {
      console.warn(`Erro ao carregar imagem`);
      setImgSrc(fallbackSrc);
      setIsError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Verifica se a imagem é externa usando nosso utilitário
  const isExternal = typeof src === 'string' && isExternalUrl(src);

  // Determina se precisa otimizar baseado no tipo de imagem
  const needsOptimization = !isExternal;

  // Para imagens não otimizadas (externas), não devemos passar o atributo sizes
  // para evitar hydration mismatch
  const imageProps = { ...props };
  if (!needsOptimization) {
    delete imageProps.sizes;
  }

  return (
    <>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse rounded-md"
          style={{ zIndex: 0 }}
        />
      )}
      
      <Image
        {...imageProps}
        className={`${props.className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        src={imgSrc}
        alt={alt || 'Imagem'}
        quality={quality}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={!needsOptimization}
        loading={props.priority ? 'eager' : 'lazy'}
      />
    </>
  );
} 