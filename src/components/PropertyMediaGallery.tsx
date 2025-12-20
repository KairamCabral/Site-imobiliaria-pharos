'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Play, MapPin, Map as MapIcon, Navigation, Maximize2, ChevronLeft, ChevronRight, MessageSquare, FileText, Download, Volume2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getWhatsAppLink } from '@/utils/whatsapp';

// Lazy load do mapa otimizado para performance
const ProximityMap = dynamic(() => import('./ProximityMapOptimized'), { ssr: false });

/**
 * PHAROS - Galeria de Mídia Premium
 * Layout mosaic minimalista com tabs para fotos, vídeos, mapa, tour 360
 */

type MediaTab = 'photos' | 'videos' | 'map' | 'nearby' | 'tour360' | 'materials';

interface PropertyMediaGalleryProps {
  // Fotos
  images: string[];
  title: string;
  
  // Vídeos (opcional)
  videos?: {
    url: string;
    thumbnail: string;
    title?: string;
  }[];
  
  // Tour 360 (opcional)
  tour360Url?: string;
  
  // Materiais/Anexos (opcional)
  attachments?: Array<{
    id?: string;
    url: string;
    filename: string;
    description?: string;
    type?: string;
  }>;
  
  // Localização para mapa
  location?: {
    lat: number;
    lng: number;
  };
  
  // Informações do imóvel para contexto
  propertyId: string;
  propertyCode: string;
  neighborhood?: string;
  distanciaMar?: number;
  city?: string;
  address?: string;
}

export default function PropertyMediaGallery({
  images,
  title,
  videos,
  tour360Url,
  attachments,
  location,
  propertyId,
  propertyCode,
  neighborhood,
  distanciaMar,
  city,
  address,
}: PropertyMediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>('photos');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxTab, setLightboxTab] = useState<MediaTab>('photos');
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  // Determinar quais tabs mostrar baseado no conteúdo disponível
  const allTabs: { id: MediaTab; label: string; icon: React.ReactNode; available: boolean }[] = [
    {
      id: 'photos',
      label: `Fotos (${images.length})`,
      icon: <Maximize2 className="w-4 h-4" />,
      available: images.length > 0,
    },
    {
      id: 'videos',
      label: `Vídeos (${videos?.length || 0})`,
      icon: <Play className="w-4 h-4" />,
      available: (videos && videos.length > 0) || false,
    },
    {
      id: 'tour360',
      label: 'Tour 360°',
      icon: <Navigation className="w-4 h-4" />,
      available: !!tour360Url,
    },
    {
      id: 'materials',
      label: `Material (${attachments?.length || 0})`,
      icon: <FileText className="w-4 h-4" />,
      available: (attachments && attachments.length > 0) || false,
    },
    {
      id: 'map',
      label: 'Mapa',
      icon: <MapIcon className="w-4 h-4" />,
      available: !!location,
    },
    {
      id: 'nearby',
      label: 'Proximidades',
      icon: <MapPin className="w-4 h-4" />,
      available: !!location,
    },
  ];
  const availableTabs = allTabs.filter((tab) => tab.available);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxTab('photos');
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (lightboxTab === 'photos') {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    }
  }, [lightboxOpen, lightboxTab, closeLightbox, nextImage, prevImage]);

  // Global key listener (garante ESC mesmo sem foco)
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
        return;
      }
      // Atalhos numéricos para trocar abas (1..n)
      const tabIndex = Number(e.key);
      if (!Number.isNaN(tabIndex) && tabIndex >= 1 && tabIndex <= availableTabs.length) {
        e.preventDefault();
        setLightboxTab(availableTabs[tabIndex - 1].id);
        return;
      }
      // Seta esquerda/direita: navega fotos ou cicla abas
      if (lightboxTab === 'photos') {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
      } else {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx = availableTabs.findIndex((t) => t.id === lightboxTab);
          if (idx >= 0) {
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const next = (idx + delta + availableTabs.length) % availableTabs.length;
            setLightboxTab(availableTabs[next].id);
          }
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey, { passive: false });
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [lightboxOpen, lightboxTab, nextImage, prevImage, closeLightbox]);

  // Foca o container ao abrir para acessibilidade
  useEffect(() => {
    if (lightboxOpen) {
      setTimeout(() => lightboxRef.current?.focus(), 0);
    }
  }, [lightboxOpen]);

  return (
    <div className="relative bg-white">
      {/* Tabs de navegação (fora do conteúdo para não sobrepor) */}
      <div className="px-4 pt-6 pb-3">
        <div
          className="relative z-10 flex items-center gap-3 overflow-x-auto scrollbar-hide px-2 py-1.5 rounded-2xl"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)',
            maskImage:
              'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)',
          }}
        >
          {availableTabs.map((tab) => (
            <button
              key={`top-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                transition-all duration-200 whitespace-nowrap shadow-lg
                ${activeTab === tab.id
                  ? 'bg-white text-gray-900 ring-1 ring-black/5'
                  : 'bg-white/85 text-gray-700 hover:bg-white ring-1 ring-black/5'
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo baseado na tab ativa */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'photos' && (
            <PhotosMosaic
              images={images}
              title={title}
              onImageClick={openLightbox}
            />
          )}

          {activeTab === 'videos' && videos && (
            <VideosGrid
              videos={videos}
            />
          )}

          {activeTab === 'tour360' && tour360Url && (
            <Tour360Viewer
              url={tour360Url}
              title={title}
            />
          )}

          {activeTab === 'materials' && attachments && (
            <MaterialsViewer
              attachments={attachments}
            />
          )}

          {activeTab === 'map' && location && (
            <MapView
              location={location}
              title={title}
              propertyCode={propertyCode}
            />
          )}

          {activeTab === 'nearby' && location && (
            <NearbyView
              location={location}
              neighborhood={neighborhood}
              distanciaMar={distanciaMar}
              title={title}
              city={city}
              address={address}
            />
          )}
        </AnimatePresence>

        {/* (tabs removidas aqui para evitar sobreposição) */}
      </div>

      {/* Lightbox Fullscreen - com abas (Fotos, Vídeos, Tour, Mapa, Proximidades) e CTA WhatsApp */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label="Galeria de mídia do imóvel"
          >
            {/* Topbar (abas e ações) */}
            <div
              className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 pt-[calc(env(safe-area-inset-top,0px)+12px)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tabs */}
              <div className="flex items-center gap-2" role="tablist" aria-label="Seções da galeria">
                {availableTabs.map((tab) => (
                  <button
                    key={`lb-${tab.id}`}
                    onClick={() => setLightboxTab(tab.id)}
                    role="tab"
                    aria-selected={lightboxTab === tab.id}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                      transition-all duration-200 whitespace-nowrap shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80
                      ${lightboxTab === tab.id
                        ? 'bg-white text-gray-900'
                        : 'bg-white/80 text-gray-900/80 hover:bg-white/90 hover:text-gray-900 backdrop-blur-sm'
                      }
                    `}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppLink('5547991878070', `Olá! Tenho interesse no imóvel ${propertyCode} - ${title}. Poderia me enviar mais detalhes?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Conversar no WhatsApp. Resposta em minutos."
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                  <span className="sr-only">Resposta em minutos • Sem compromisso</span>
                </a>
            <button
              onClick={closeLightbox}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label="Fechar galeria"
            >
              <X className="w-6 h-6" />
            </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="relative flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
              {/* Instruções para leitores de tela */}
              <div className="sr-only" aria-live="polite">
                Use 1 a {availableTabs.length} para alternar entre abas. Pressione Esc para fechar a galeria.
              </div>
              {lightboxTab === 'photos' && (
                <>
            {/* Contador */}
                  <div className="absolute top-4 left-4 z-40 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Navegação anterior */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Imagem */}
                  <div className="w-full h-full flex items-center justify-center">
            <motion.img
              key={currentImageIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
              src={images[currentImageIndex]}
              alt={`${title} - Foto ${currentImageIndex + 1}`}
                      className="max-w-[92vw] max-h-[80vh] object-contain"
            />
                  </div>

            {/* Navegação próxima */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

                  {/* Miniaturas */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full scrollbar-hide">
              {images.slice(0, 10).map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                    ${idx === currentImageIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}
                  `}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {images.length > 10 && (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-medium">
                  +{images.length - 10}
                      </div>
                    )}
                  </div>
                </>
              )}

              {lightboxTab === 'videos' && videos && (
                <div className="w-full h-full overflow-y-auto p-4 sm:p-6">
                  <VideosGrid videos={videos} />
                </div>
              )}

              {lightboxTab === 'tour360' && tour360Url && (
                <div className="w-full h-full">
                  <iframe
                    src={tour360Url}
                    title={`Tour 360° - ${title}`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; gyroscope; vr"
                  />
                </div>
              )}

              {lightboxTab === 'map' && location && (
                <div className="w-full h-full">
                  <iframe
                    src={
                      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                        ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location.lat},${location.lng}&zoom=15&language=pt-BR`
                        : `https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=pt-BR&z=15&output=embed`
                    }
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa de ${title}`}
                    className="w-full h-full"
                  />
                </div>
              )}

              {lightboxTab === 'nearby' && location && (
                <div className="w-full h-full overflow-y-auto p-4 sm:p-6">
                  <NearbyView
                    location={location}
                    neighborhood={neighborhood}
                    distanciaMar={distanciaMar}
                    title={title}
                    city={city}
                    address={address}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Layout Mosaic de Fotos (1 grande + grid de 4)
 * Largura total, sem bordas arredondadas
 */
function PhotosMosaic({
  images,
  title,
  onImageClick,
}: {
  images: string[];
  title: string;
  onImageClick: (index: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative grid grid-cols-1 lg:grid-cols-4 gap-0.5 h-[360px] sm:h-[460px] lg:h-[600px]"
    >
      {/* Imagem principal (ocupa 2 colunas) */}
      <button
        onClick={() => onImageClick(0)}
        className="lg:col-span-2 lg:row-span-2 relative overflow-hidden group bg-gray-200"
      >
        <img
          src={images[0]}
          alt={`${title} - Principal`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      {/* Grid de 4 imagens menores */}
      {images.slice(1, 5).map((img, idx) => (
        <button
          key={idx}
          onClick={() => onImageClick(idx + 1)}
          className="relative overflow-hidden group bg-gray-200"
        >
          <img
            src={img}
            alt={`${title} - ${idx + 2}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      ))}

      {/* Botão "Ver todas as fotos" - sobreposto no canto inferior direito */}
      {images.length > 5 && (
        <button
          onClick={() => onImageClick(0)}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 pl-5 pr-5 py-3 rounded-full bg-white/90 hover:bg-white text-gray-900 font-medium shadow-xl md:shadow-2xl hover:shadow-2xl transition-all flex items-center gap-2 backdrop-blur-md ring-1 ring-black/10 z-20"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-sm md:text-base">Ver todas as {images.length} fotos</span>
        </button>
      )}
    </motion.div>
  );
}

/**
 * Grid de Vídeos com Player em Modal Fullscreen
 */
function VideosGrid({
  videos,
}: {
  videos: { url: string; thumbnail: string; title?: string }[];
}) {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);


  // Detecta o tipo de vídeo e retorna o embed URL
  const getVideoEmbedUrl = (url: string): { embedUrl: string; type: 'youtube' | 'vimeo' | 'direct' | 'gdrive' | 'unsupported' } => {
    // YouTube (múltiplos formatos)
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
        type: 'youtube'
      };
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        type: 'vimeo'
      };
    }

    // Google Drive
    const gdriveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
    const gdriveMatch = url.match(gdriveRegex);
    if (gdriveMatch) {
      return {
        embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
        type: 'gdrive'
      };
    }

    // Dropbox
    if (url.includes('dropbox.com')) {
      return {
        embedUrl: url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', ''),
        type: 'direct'
      };
    }

    // URL direta (MP4, WebM, OGG)
    if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i)) {
      return {
        embedUrl: url,
        type: 'direct'
      };
    }

    // URL não suportada
    return {
      embedUrl: url,
      type: 'unsupported'
    };
  };

  const openVideoModal = (index: number) => {
    setPlayingVideo(index);
  };

  const closeVideoModal = () => {
    setPlayingVideo(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-[360px] sm:h-[480px] lg:h-[600px] bg-black"
      >
        {/* Grid centralizado com max-width */}
        <div className="mx-auto h-full flex items-center justify-center p-0">
          <div className={`w-full h-full grid gap-0 ${
            videos.length === 1 
              ? 'grid-cols-1' 
              : videos.length === 2 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {videos.map((video, idx) => (
              <button
                key={idx}
                onClick={() => openVideoModal(idx)}
                className="relative w-full h-full overflow-hidden group bg-black cursor-pointer border-r border-b border-black/20 last:border-r-0"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title || `Vídeo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay com play button premium */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 flex items-center justify-center group-hover:from-black/80 group-hover:via-black/50 group-hover:to-black/40 transition-all duration-300">
                  <div className="relative">
                    {/* Pulse animation */}
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-pharos-blue-500/30 animate-ping" />
                    {/* Button */}
                    <div className="relative w-24 h-24 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all duration-300 shadow-2xl">
                      <Play className="w-12 h-12 text-pharos-blue-600 ml-2" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                {video.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <p className="text-white font-semibold text-base sm:text-lg">{video.title}</p>
                  </div>
                )}

                {/* Badge no canto superior */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">VÍDEO</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modal de Vídeo Fullscreen */}
      <AnimatePresence>
        {playingVideo !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            onClick={closeVideoModal}
          >
            {/* Header com Título e Fechar */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-6">
              <div className="flex items-center justify-between">
                {videos[playingVideo].title && (
                  <h3 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">
                    {videos[playingVideo].title}
                  </h3>
                )}
                <button
                  onClick={closeVideoModal}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all group ml-auto"
                  aria-label="Fechar vídeo"
                >
                  <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Player Container - Maximizado */}
            <div 
              className="relative w-full h-full max-h-[90vh] max-w-[95vw] lg:max-w-[85vw] bg-black overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const { embedUrl, type } = getVideoEmbedUrl(videos[playingVideo].url);
                
                if (type === 'unsupported') {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-white p-8">
                      <X className="w-16 h-16 mb-4 text-red-400" />
                      <h3 className="text-xl font-semibold mb-2">Vídeo não suportado</h3>
                      <p className="text-gray-300 text-center mb-4">
                        Este tipo de link de vídeo não pode ser reproduzido diretamente.
                      </p>
                      <a
                        href={videos[playingVideo].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-pharos-blue-600 hover:bg-pharos-blue-700 rounded-full font-medium transition-colors"
                      >
                        Abrir em Nova Aba
                      </a>
                    </div>
                  );
                }
                
                if (type === 'direct') {
                  return (
                    <video
                      src={embedUrl}
                      controls
                      autoPlay
                      className="w-full h-full"
                      controlsList="nodownload"
                    >
                      Seu navegador não suporta vídeos HTML5.
                    </video>
                  );
                }
                
                // YouTube, Vimeo, Google Drive
                return (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={videos[playingVideo].title || 'Vídeo'}
                  />
                );
              })()}
            </div>

            {/* Navegação entre vídeos (se houver mais de 1) */}
            {videos.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md rounded-full px-5 py-3 border border-white/10">
                {videos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayingVideo(idx);
                    }}
                    className={`h-3 rounded-full transition-all ${
                      idx === playingVideo 
                        ? 'bg-pharos-blue-500 w-10' 
                        : 'w-3 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Ver vídeo ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Visualizador de Tour 360
 */
function Tour360Viewer({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-[360px] sm:h-[480px] lg:h-[600px] overflow-hidden bg-gray-900"
    >
      <iframe
        src={url}
        title={`Tour 360° - ${title}`}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; gyroscope; vr"
      />
    </motion.div>
  );
}

/**
 * Visualizador de Materiais/Anexos
 * UI/UX premium para download de PDFs, plantas e documentos
 */
function MaterialsViewer({
  attachments,
}: {
  attachments: Array<{
    id?: string;
    url: string;
    filename: string;
    description?: string;
    type?: string;
  }>;
}) {
  const getFileIcon = (type?: string) => {
    if (type === 'pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (type === 'image') {
      return <Maximize2 className="w-6 h-6 text-blue-500" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const getFileExtension = (filename: string) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() : 'DOC';
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-[360px] sm:h-[480px] lg:h-[600px] overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h3 className="text-2xl font-light text-gray-900 mb-2">Material Disponível</h3>
          <p className="text-sm text-gray-500">Plantas, documentos e informações do imóvel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attachments.map((attachment, index) => (
            <motion.div
              key={attachment.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white rounded-2xl border border-gray-200 hover:border-pharos-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Gradiente de destaque no hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-pharos-blue-50/0 to-pharos-blue-100/0 group-hover:from-pharos-blue-50/50 group-hover:to-pharos-blue-100/30 transition-all duration-300 pointer-events-none" />
              
              <div className="relative p-6">
                <div className="flex items-start gap-4">
                  {/* Ícone do arquivo */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-pharos-blue-100 group-hover:to-pharos-blue-200 transition-all duration-300">
                    {getFileIcon(attachment.type)}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 mb-1 truncate group-hover:text-pharos-blue-700 transition-colors">
                      {attachment.filename}
                    </h4>
                    {attachment.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {attachment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 group-hover:bg-pharos-blue-100 group-hover:text-pharos-blue-700 transition-colors">
                        {getFileExtension(attachment.filename)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleDownload(attachment.url, attachment.filename)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pharos-blue-600 hover:bg-pharos-blue-700 text-white font-medium text-sm transition-all duration-200 hover:shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar</span>
                  </button>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:border-pharos-blue-300 hover:bg-pharos-blue-50 text-gray-700 hover:text-pharos-blue-700 font-medium text-sm transition-all duration-200"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mensagem se não houver materiais */}
        {attachments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum material disponível no momento</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Visualização de Mapa com Google Maps
 */
function MapView({
  location,
  title,
  propertyCode,
}: {
  location: { lat: number; lng: number };
  title: string;
  propertyCode: string;
}) {
  // Google Maps Embed API (sem autenticação, com limitações)
  // Para produção, adicione NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no .env.local
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  const googleMapsEmbedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${location.lat},${location.lng}&zoom=15&language=pt-BR`
    : `https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=pt-BR&z=15&output=embed`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[600px] overflow-hidden bg-gray-100">
        {/* Google Maps real */}
        <iframe
          src={googleMapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa de ${title}`}
          className="w-full h-full"
        />
        
        {/* Botões sobrepostos minimalistas */}
        <div className="absolute bottom-6 left-6 right-6 flex gap-3 z-10">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-5 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium text-center transition-all shadow-lg hover:shadow-xl rounded-full text-sm"
          >
            Abrir no Google Maps
          </a>
          <a
            href={`https://waze.com/ul?ll=${location.lat},${location.lng}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-5 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium text-center transition-all shadow-lg hover:shadow-xl rounded-full text-sm"
          >
            Waze
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Visualização de Locais Próximos
 */
function NearbyView({
  location,
  neighborhood,
  distanciaMar,
  title = 'Imóvel',
  city,
  address,
}: {
  location: { lat: number; lng: number };
  neighborhood?: string;
  distanciaMar?: number;
  title?: string;
  city?: string;
  address?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-[420px] sm:h-[520px] lg:h-[600px] overflow-hidden"
    >
      <ProximityMap
        propertyLocation={location}
        propertyTitle={title || 'Imóvel'}
        neighborhood={neighborhood}
        showHeader={false}
      />
    </motion.div>
  );
}

