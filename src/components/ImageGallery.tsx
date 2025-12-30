'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OptimizedImage as Image } from './OptimizedImage';
import { X, ChevronLeft, ChevronRight, Maximize2, MapPin, Video, FileText, Scan, Heart, Share2 } from 'lucide-react';
import { useFavoritos } from '@/contexts/FavoritosContext';

interface ImageGalleryProps {
  images: string[];
  title?: string;
  videoUrl?: string;
  folderUrl?: string;
  tour360Url?: string;
  localizacao?: {
    latitude: number;
    longitude: number;
  };
  propertyId?: string;
  propertyCode?: string;
  galleryMissing?: boolean; // Flag quando só há 1 foto (FotoDestaque)
}

export default function ImageGallery({ 
  images = [],
  title,
  videoUrl,
  folderUrl,
  tour360Url,
  localizacao,
  propertyId,
  propertyCode,
  galleryMissing = false,
}: ImageGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  
  const { isFavorito, toggleFavorito } = useFavoritos();
  const isFavorited = propertyId ? isFavorito(propertyId) : false;

  // Validar e filtrar imagens
  const validImages = images.filter(img => 
    typeof img === 'string' && 
    img.trim() !== '' && 
    img.startsWith('http')
  );

  // Preload de imagens adjacentes no lightbox
  useEffect(() => {
    if (!isLightboxOpen || validImages.length === 0) return;
    
    const preloadAdjacent = () => {
      const prevIndex = (currentImageIndex - 1 + validImages.length) % validImages.length;
      const nextIndex = (currentImageIndex + 1) % validImages.length;
      
      [prevIndex, nextIndex].forEach(idx => {
        if (!loadedImages.has(idx) && !imageErrors.has(idx)) {
          const img = new window.Image();
          img.src = validImages[idx];
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, idx]));
          };
          img.onerror = () => {
            setImageErrors(prev => new Set([...prev, idx]));
          };
        }
      });
    };
    
    preloadAdjacent();
  }, [currentImageIndex, isLightboxOpen, validImages, loadedImages, imageErrors]);

  // Favoritar
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!propertyId) return;
    
    toggleFavorito(propertyId);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'favorite_toggle', {
        property_id: propertyId,
        property_code: propertyCode,
        action: isFavorited ? 'remove' : 'add',
      });
    }
  };

  // Compartilhar
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: title || 'Imóvel Pharos',
      text: `Confira este imóvel: ${title || 'Imóvel de alto padrão'}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'share_click', {
            property_id: propertyId,
            property_code: propertyCode,
            method: 'web_share_api',
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Erro ao compartilhar:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
        
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'share_click', {
            property_id: propertyId,
            property_code: propertyCode,
            method: 'clipboard',
          });
        }
      } catch (err) {
        console.error('Erro ao copiar link:', err);
      }
    }
  };

  // CTA WhatsApp para solicitar mais fotos
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5548999999999';
    const messageTemplate = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Olá! Gostaria de ver mais fotos do imóvel {CODIGO}.';
    const message = messageTemplate.replace('{CODIGO}', propertyCode || 'este');
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_more_photos', {
        property_id: propertyId,
        property_code: propertyCode,
        source: 'gallery_skeleton',
      });
    }
  };

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lightbox_open', {
        property_id: propertyId,
        property_code: propertyCode,
        image_index: index,
      });
    }
  }, [propertyId, propertyCode]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => {
      const newIndex = (prev + 1) % validImages.length;
      
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'image_view', {
          property_id: propertyId,
          image_index: newIndex,
          direction: 'next',
        });
      }
      
      return newIndex;
    });
  }, [validImages.length, propertyId]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => {
      const newIndex = (prev - 1 + validImages.length) % validImages.length;
      
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'image_view', {
          property_id: propertyId,
          image_index: newIndex,
          direction: 'prev',
        });
      }
      
      return newIndex;
    });
  }, [validImages.length, propertyId]);

  // Navegação por teclado
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextImage, prevImage, closeLightbox]);

  // Touch/Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextImage();
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'swipe_left', {
          property_id: propertyId,
        });
      }
    }
    if (isRightSwipe) {
      prevImage();
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'swipe_right', {
          property_id: propertyId,
        });
      }
    }
  };

  // Placeholder quando não há imagens
  if (validImages.length === 0) {
    return (
      <div 
        className="w-full bg-gradient-to-br from-pharos-blue-500/10 to-pharos-blue-500/5 flex items-center justify-center"
        style={{ height: 'clamp(400px, 60vh, 600px)' }}
      >
        <div className="text-center p-8">
          <svg 
            className="w-24 h-24 mx-auto mb-4 text-pharos-blue-500/30" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-pharos-slate-500 font-medium">Sem imagens disponíveis</p>
          <p className="text-xs text-red-600 mt-2">imagem mock</p>
        </div>
      </div>
    );
  }
  
  // Layout: 1 imagem grande + grid de até 4 imagens
  const mainImage = validImages[0];
  const gridImages = validImages.slice(1, 5);
  const remainingCount = validImages.length - 5;

  return (
    <>
      {/* Galeria Hero - True Full Bleed (100vw) */}
      <div 
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden" 
        style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}
        role="region"
        aria-label="Galeria de fotos do imóvel"
      >
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-4 xl:gap-5" 
          style={{ height: 'clamp(500px, 65vh, 650px)' }}
        >
          {/* Imagem Principal - 9 colunas (70%) */}
          <div
            className="relative lg:col-span-9 h-full cursor-pointer group overflow-hidden bg-gray-100"
            onClick={() => openLightbox(0)}
            style={{ aspectRatio: '16/10' }}
            role="button"
            tabIndex={0}
            aria-label={`Ver imagem principal em tela cheia - Foto 1 de ${validImages.length}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(0);
              }
            }}
          >
            <Image
              src={mainImage}
              alt={`${title || 'Imóvel'} - Foto principal`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority
              variant="card"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            {/* Overlay Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
            
            {/* Botões de Ação - Canto Superior Direito */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              <button
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2"
                title="Compartilhar imóvel"
                aria-label="Compartilhar imóvel"
                onClick={handleShare}
                tabIndex={0}
              >
                <Share2 className="w-5 h-5 text-gray-600 hover:text-pharos-blue-500 transition-colors" />
              </button>

              <button
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2"
                title={isFavorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                onClick={handleFavoriteClick}
                tabIndex={0}
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'
                  }`} 
                />
              </button>
            </div>

            {/* Botões de Ação - Canto Inferior Esquerdo */}
            <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 flex items-center gap-1.5 md:gap-2 z-10">
              {/* Mapa */}
              {localizacao && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps?q=${localizacao.latitude},${localizacao.longitude}`, '_blank');
                  }}
                  className="bg-white/95 hover:bg-white backdrop-blur-sm px-2.5 py-2 md:px-3 md:py-2 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all hover:shadow-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pharos-blue-500"
                  title="Ver localização no mapa"
                  aria-label="Ver localização no mapa"
                  tabIndex={0}
                >
                  <MapPin className="w-4 h-4 md:w-4 md:h-4 text-[#192233] flex-shrink-0" />
                  <span className="hidden sm:inline text-xs md:text-sm font-medium text-[#192233] whitespace-nowrap">Mapa</span>
                </button>
              )}

              {/* Vídeo */}
              {videoUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(videoUrl, '_blank');
                  }}
                  className="bg-white/95 hover:bg-white backdrop-blur-sm px-2.5 py-2 md:px-3 md:py-2 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all hover:shadow-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pharos-blue-500"
                  title="Assistir vídeo"
                  aria-label="Assistir vídeo"
                  tabIndex={0}
                >
                  <Video className="w-4 h-4 md:w-4 md:h-4 text-[#192233] flex-shrink-0" />
                  <span className="hidden sm:inline text-xs md:text-sm font-medium text-[#192233] whitespace-nowrap">Vídeo</span>
                </button>
              )}

              {/* Tour 360° */}
              {tour360Url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(tour360Url, '_blank');
                  }}
                  className="bg-white/95 hover:bg-white backdrop-blur-sm px-2.5 py-2 md:px-3 md:py-2 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all hover:shadow-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pharos-blue-500"
                  title="Tour virtual 360°"
                  aria-label="Tour virtual 360°"
                  tabIndex={0}
                >
                  <Scan className="w-4 h-4 md:w-4 md:h-4 text-[#192233] flex-shrink-0" />
                  <span className="hidden sm:inline text-xs md:text-sm font-medium text-[#192233] whitespace-nowrap">Tour 360°</span>
                </button>
              )}

              {/* Folder (Download) */}
              {folderUrl && (
                <a
                  href={folderUrl}
                  download
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-white/95 hover:bg-white backdrop-blur-sm px-2.5 py-2 md:px-3 md:py-2 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all hover:shadow-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pharos-blue-500"
                  title="Baixar folder"
                  aria-label="Baixar folder"
                  tabIndex={0}
                >
                  <FileText className="w-4 h-4 md:w-4 md:h-4 text-[#192233] flex-shrink-0" />
                  <span className="hidden sm:inline text-xs md:text-sm font-medium text-[#192233] whitespace-nowrap">Folder</span>
                </a>
              )}
            </div>
            
            {/* Ícone Expandir */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
              <Maximize2 className="w-5 h-5 text-[#192233]" />
            </div>
          </div>

          {/* Grid de Thumbs - 3 colunas (30%, 2x2) */}
          {/* Skeletons quando galeria está ausente (apenas 1 foto) */}
          {galleryMissing && validImages.length <= 1 && (
            <div className="hidden lg:grid lg:col-span-3 grid-cols-2 gap-4 xl:gap-5 h-full content-start">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={handleWhatsAppClick}
                  className="relative overflow-hidden bg-gradient-to-br from-pharos-blue-50 to-pharos-slate-50 rounded-lg hover:from-pharos-blue-100 hover:to-pharos-slate-100 transition-all duration-300 group border-2 border-dashed border-pharos-blue-200 hover:border-pharos-blue-400"
                  style={{ aspectRatio: '16/10' }}
                  title="Solicitar mais fotos via WhatsApp"
                  aria-label="Solicitar galeria completa via WhatsApp"
                >
                  {/* Ícone de Imagem Placeholder */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <svg 
                      className="w-12 h-12 text-pharos-blue-300 group-hover:text-pharos-blue-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <span className="text-xs text-pharos-slate-500 font-medium group-hover:text-pharos-blue-600 transition-colors">
                      Solicitar
                    </span>
                  </div>
                  
                  {/* Badge "Mais fotos" */}
                  {index === 3 && (
                    <div className="absolute bottom-3 right-3 bg-pharos-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg group-hover:bg-pharos-blue-600 transition-colors">
                      Mais fotos via WhatsApp
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {/* Grid normal (quando há múltiplas fotos) */}
          {!galleryMissing && gridImages.length > 0 && (
            <div className="hidden lg:grid lg:col-span-3 grid-cols-2 gap-4 xl:gap-5 h-full content-start">
              {gridImages.map((image, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer group overflow-hidden bg-gray-100 rounded-lg"
                  onClick={() => openLightbox(index + 1)}
                  style={{ aspectRatio: '16/10' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver foto ${index + 2} de ${validImages.length} em tela cheia`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(index + 1);
                    }
                  }}
                >
                  <Image
                    src={image}
                    alt={`${title} - Foto ${index + 2}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    variant="gallery"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Overlay Hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  
                  {/* Badge "+X fotos" na última imagem */}
                  {index === 3 && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all">
                      <div className="text-center">
                        <Maximize2 className="w-8 h-8 text-white mx-auto mb-2" />
                        <span className="text-white text-2xl font-semibold">+{remainingCount}</span>
                        <p className="text-white/90 text-xs mt-1">fotos</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão "Ver todas as fotos" - Mobile */}
        <button
          onClick={() => openLightbox(0)}
          className="lg:hidden w-full mt-4 flex items-center justify-center gap-2 bg-[#192233] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#2a3547] transition-colors focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2"
          aria-label={`Ver todas as ${validImages.length} fotos em tela cheia`}
        >
          <Maximize2 className="w-5 h-5" />
          Ver todas as {validImages.length} fotos
        </button>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[1000] bg-black flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos em tela cheia"
          tabIndex={-1}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 lg:p-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-white">
                <p 
                  className="text-sm lg:text-base font-medium"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {currentImageIndex + 1} / {validImages.length}
                </p>
                <p className="text-xs lg:text-sm text-white/70 mt-1">{title}</p>
              </div>
              <button
                onClick={closeLightbox}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 lg:p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Fechar galeria"
                tabIndex={0}
              >
                <X className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
          </div>

          {/* Imagem Principal */}
          <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-20">
            <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
              <Image
                src={validImages[currentImageIndex] || validImages[0]}
                alt={`${title || 'Imóvel'} - Foto ${currentImageIndex + 1} de ${validImages.length}`}
                fill
                className="object-contain"
                sizes="100vw"
                variant="hero"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Navegação - Setas */}
          <button
            onClick={prevImage}
            className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 lg:p-4 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Foto anterior"
            tabIndex={0}
          >
            <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 lg:p-4 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Próxima foto"
            tabIndex={0}
          >
            <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>

          {/* Thumbnails na parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                      currentImageIndex === index
                        ? 'ring-2 ring-white scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`Ir para foto ${index + 1}`}
                    aria-current={currentImageIndex === index ? 'true' : 'false'}
                    tabIndex={0}
                  >
                    <Image
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                      variant="thumbnail"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
