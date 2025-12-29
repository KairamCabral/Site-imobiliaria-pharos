'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Componente de vídeo com lazy loading otimizado
 * Só carrega o vídeo quando está prestes a entrar na viewport
 */
interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  onClick?: () => void;
  onLoadedData?: () => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export function LazyVideo({
  src,
  poster,
  className = '',
  controls = false,
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
  preload = 'none',
  onClick,
  onLoadedData,
  videoRef: externalRef,
}: LazyVideoProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalRef || internalRef;
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
      },
      {
        rootMargin: '300px', // Começar a carregar 300px antes de entrar na viewport
        threshold: 0,
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const handleLoadedData = () => {
    setIsLoaded(true);
    onLoadedData?.();
  };

  return (
    <div className="relative w-full h-full">
      {/* Poster placeholder enquanto não carrega */}
      {!isLoaded && poster && (
        <img
          src={poster}
          alt="Video thumbnail"
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
        />
      )}
      
      {/* Skeleton enquanto carrega */}
      {!isLoaded && !poster && (
        <div className={`absolute inset-0 w-full h-full bg-gray-200 animate-pulse ${className}`} />
      )}
      
      {/* Vídeo - só renderiza o src quando shouldLoad = true */}
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        className={className}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={preload}
        onClick={onClick}
        onLoadedData={handleLoadedData}
        poster={poster}
      >
        Seu navegador não suporta vídeos HTML5.
      </video>
    </div>
  );
}

