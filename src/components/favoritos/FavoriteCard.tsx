'use client';

import { useState } from 'react';
import { OptimizedImage as Image } from '../OptimizedImage';
import Link from 'next/link';
import { useFavoritos } from '@/contexts/FavoritosContext';
import type { Favorito, Imovel } from '@/types';
import PastaSelector from './PastaSelector';

/**
 * PHAROS - CARD DE FAVORITO
 * Card premium com funcionalidades de favoritos (notas, pastas, quick-actions)
 */

interface FavoriteCardProps {
  favorito: Favorito;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  showCheckbox?: boolean;
}

export default function FavoriteCard({
  favorito,
  isSelected = false,
  onToggleSelection,
  showCheckbox = false,
}: FavoriteCardProps) {
  const { removeFavorito, updateNotes, colecoes } = useFavoritos();
  
  const [currentImage, setCurrentImage] = useState(0);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notesValue, setNotesValue] = useState(favorito.notes || '');
  
  // Encontrar nome da pasta atual
  const currentPasta = colecoes.find(c => c.id === favorito.collectionId);
  const pastaName = currentPasta?.id === 'default' ? 'Todos os Favoritos' : currentPasta?.name || 'Todos os Favoritos';

  // Mock: em produção virá populado do backend
  const imovel: Imovel | undefined = favorito.imovel;

  if (!imovel) {
    return null; // Ou skeleton/placeholder
  }

  const images = imovel.galeria || [imovel.imagemCapa];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Remover este imóvel dos favoritos?')) {
      removeFavorito(favorito.id);
    }
  };

  const handleSaveNotes = () => {
    updateNotes(favorito.id, notesValue);
    setShowNotesInput(false);
  };

  const formatarPreco = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <article className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-pharos-slate-300 hover:shadow-lg active:scale-[0.99] transition-all duration-300 group">
      {/* Checkbox de seleção - Touch Friendly */}
      {showCheckbox && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelection?.();
            }}
            className={`
              w-7 h-7 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all
              ${isSelected 
                ? 'bg-pharos-blue-500 border-pharos-blue-500' 
                : 'bg-white border-pharos-slate-300 hover:border-pharos-blue-500'
              }
            `}
            aria-label={isSelected ? 'Desmarcar imóvel' : 'Selecionar imóvel'}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      )}

      <Link href={`/imoveis/${favorito.id}`} className="block">
        {/* Área de imagens */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-pharos-base-off">
          <Image
            src={images[currentImage]}
            alt={imovel.titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Tags superiores - Touch Friendly */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2 z-20">
            {/* Badge de favorito (sempre ativo) */}
            <button
              onClick={handleRemove}
              className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full hover:bg-red-50 active:scale-90 transition-all duration-200 group/fav"
              aria-label="Remover dos favoritos"
            >
              <svg
                className="w-5 h-5 text-red-500 fill-current group-hover/fav:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Tags inferiores (tipo, características) - Mobile Otimizado */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2 z-20">
            <span className="text-[10px] sm:text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-pharos-navy-900 bg-white/90 backdrop-blur-sm">
              {imovel.tipo}
            </span>
            {imovel.caracteristicas.slice(0, 1).map((caract, idx) => (
              <span
                key={idx}
                className="text-[10px] sm:text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-white bg-pharos-blue-500/90 backdrop-blur-sm"
              >
                {caract}
              </span>
            ))}
          </div>

          {/* Controles do carrossel */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center bg-white/95 hover:bg-white text-pharos-navy-900 rounded-full shadow-xl z-30 opacity-0 sm:group-hover:opacity-100 active:scale-90 transition-all duration-200 sm:hover:scale-110"
                aria-label="Imagem anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center bg-white/95 hover:bg-white text-pharos-navy-900 rounded-full shadow-xl z-30 opacity-0 sm:group-hover:opacity-100 active:scale-90 transition-all duration-200 sm:hover:scale-110"
                aria-label="Próxima imagem"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Indicadores */}
              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 z-20">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImage(index);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentImage === index ? 'w-6 bg-white shadow-md' : 'w-1.5 bg-white/60 hover:bg-white/90'
                    }`}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Conteúdo - Mobile Otimizado */}
        <div className="p-4 sm:p-5">
          {/* Localização */}
          <div className="flex items-start gap-2 mb-2 sm:mb-3">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-pharos-gold-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="text-[10px] sm:text-xs text-pharos-slate-500 line-clamp-1 uppercase tracking-wide font-medium">
              {imovel.endereco.bairro}, {imovel.endereco.cidade}
            </span>
          </div>

          {/* Título */}
          <h3 className="text-sm sm:text-base font-bold text-pharos-navy-900 group-hover:text-pharos-blue-500 transition-colors duration-300 mb-3 sm:mb-4 line-clamp-2 leading-tight">
            {imovel.titulo}
          </h3>

          {/* Características - Grid Responsivo */}
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pharos-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
              <span className="text-sm sm:text-base font-bold text-pharos-navy-900">{imovel.areaTotal}</span>
              <span className="text-xs sm:text-sm text-pharos-slate-500">m²</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pharos-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 9.556V3h-2v2H6V3H4v6.556C2.81 10.25 2 11.526 2 13v4a1 1 0 001 1h1v4h2v-4h12v4h2v-4h1a1 1 0 001-1v-4c0-1.474-.811-2.75-2-3.444zM11 9a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0111 9zm5 0a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0116 9z" />
              </svg>
              <span className="text-sm sm:text-base font-bold text-pharos-navy-900">{imovel.quartos}</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pharos-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 10.78V8c0-1.65-1.35-3-3-3h-4c-.77 0-1.47.3-2 .78-.53-.48-1.23-.78-2-.78H6C4.35 5 3 6.35 3 8v2.78c-.61.55-1 1.34-1 2.22v6h2v-2h16v2h2v-6c0-.88-.39-1.67-1-2.22zM14 7h4c.55 0 1 .45 1 1v2h-6V8c0-.55.45-1 1-1zM5 8c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v2H5V8z" />
              </svg>
              <span className="text-sm sm:text-base font-bold text-pharos-navy-900">{imovel.suites}</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pharos-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
              <span className="text-sm sm:text-base font-bold text-pharos-navy-900">{imovel.vagasGaragem}</span>
            </div>
          </div>

          {/* Pasta atual - Mobile Otimizado */}
          {favorito.collectionId !== 'default' && currentPasta && (
            <div className="mb-3 sm:mb-4">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-pharos-blue-500/10 border border-pharos-blue-200 rounded-md sm:rounded-lg">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pharos-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-[10px] sm:text-xs font-medium text-pharos-blue-700 truncate">{pastaName}</span>
              </div>
            </div>
          )}

          {/* Notas - Mobile Otimizado */}
          {(favorito.notes || showNotesInput) && (
            <div className="mb-3 sm:mb-4">
              {showNotesInput ? (
                <div className="space-y-2">
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Adicione suas anotações..."
                    className="w-full px-3 py-2.5 text-sm border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleSaveNotes();
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 active:scale-95 transition-all min-h-[44px]"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowNotesInput(false);
                        setNotesValue(favorito.notes || '');
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off active:scale-95 transition-all min-h-[44px]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNotesInput(true);
                  }}
                  className="p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 active:bg-amber-150 transition-colors"
                >
                  <p className="text-xs text-pharos-slate-700 line-clamp-2">{favorito.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Preço - Mobile Otimizado */}
          <div className="mb-3 sm:mb-4 pt-3 sm:pt-4 border-t border-pharos-slate-300">
            <span className="text-xl sm:text-2xl font-bold text-pharos-blue-500 block">
              {formatarPreco(imovel.preco)}
            </span>
          </div>

          {/* Quick actions - Touch Friendly */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowNotesInput(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off active:scale-[0.98] transition-all min-h-[44px]"
              title="Adicionar nota"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Nota
            </button>

            <PastaSelector
              imovelId={favorito.id}
              currentCollectionId={favorito.collectionId}
            />
          </div>
        </div>
      </Link>
    </article>
  );
}

