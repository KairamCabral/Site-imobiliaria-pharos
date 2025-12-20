'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CustomImage from './CustomImage';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        // Esconder o header quando modal abrir
        const header = document.querySelector('header');
        if (header) {
          (header as HTMLElement).style.display = 'none';
        }
      } else {
        document.body.style.overflow = 'unset';
        // Mostrar o header quando modal fechar
        const header = document.querySelector('header');
        if (header) {
          (header as HTMLElement).style.display = '';
        }
      }
    }
  }, [isOpen]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  if (images.length === 0) return null;

  return (
    <>
      {/* Galeria de Miniaturas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <CustomImage
              src={image}
              alt={`${alt} - Foto ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 transition-all duration-300 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                  />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          style={{ isolation: 'isolate' }}
        >
          {/* Botão Fechar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-6 right-6 z-[100000] p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 shadow-xl"
            aria-label="Fechar galeria"
          >
            <X className="w-8 h-8 text-white drop-shadow-lg" />
          </button>

          {/* Contador */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100000] px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-lg shadow-xl">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Navegação Anterior */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-[100000] p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 shadow-xl"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
          </button>

          {/* Imagem Principal */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomImage
              src={images[currentIndex]}
              alt={`${alt} - Foto ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Navegação Próxima */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-[100000] p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 shadow-xl"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
          </button>

          {/* Miniaturas (navegação rápida) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100000] flex gap-2 px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md max-w-full overflow-x-auto shadow-xl">
            {images.map((image, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  idx === currentIndex
                    ? 'ring-4 ring-white scale-110'
                    : 'ring-2 ring-white/30 hover:ring-white/60'
                }`}
              >
                <CustomImage
                  src={image}
                  alt={`Miniatura ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

