'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { isExternalUrl, PLACEHOLDER_SVG_BASE64 } from '@/utils/imageUtils';

interface CustomImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  quality?: number;
}

/**
 * CustomImage é um componente wrapper para o Next.js Image que:
 * 1. Adiciona suporte avançado para imagens externas
 * 2. Oferece fallback automático para placeholder em caso de erro
 * 3. Simplifica o tratamento de imagens externas vs. locais
 * 4. Inclui otimizações de qualidade e carregamento
 */
export default function CustomImage({
  src,
  alt,
  quality = 85,
  fallbackSrc = PLACEHOLDER_SVG_BASE64,
  ...props
}: CustomImageProps) {
  // Usar a fonte da imagem como está
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para atualizar a fonte da imagem quando a prop src mudar
  useEffect(() => {
    if (!isError) {
      setImgSrc(src);
    }
  }, [src, isError]);

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