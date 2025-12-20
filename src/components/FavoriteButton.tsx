'use client';

import { useFavoritos } from '@/contexts/FavoritosContext';

/**
 * PHAROS - BOTÃO DE FAVORITO
 * Componente reutilizável para adicionar/remover imóveis dos favoritos
 * 
 * @example
 * <FavoriteButton imovelId="imovel-123" />
 * <FavoriteButton imovelId="imovel-456" size="lg" showLabel />
 */

interface FavoriteButtonProps {
  imovelId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  showLabel?: boolean;
}

export default function FavoriteButton({ 
  imovelId, 
  className = '',
  size = 'md',
  variant = 'icon',
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorito, toggleFavorito } = useFavoritos();
  const isFav = isFavorito(imovelId);

  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorito(imovelId);

    // Feedback visual adicional (opcional)
    const button = e.currentTarget as HTMLButtonElement;
    button.classList.add('scale-110');
    setTimeout(() => button.classList.remove('scale-110'), 200);
  };

  // Variante ícone (circular, para cards)
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`
          ${sizes[size]} flex items-center justify-center 
          bg-white/90 backdrop-blur-sm rounded-full hover:bg-white 
          transition-all duration-200 shadow-sm hover:shadow-md
          ${isFav ? 'text-red-500' : 'text-pharos-slate-700'}
          ${className}
        `}
        aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <svg
          className={`${iconSizes[size]} transition-transform ${isFav ? 'fill-current' : ''}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill={isFav ? 'currentColor' : 'none'}
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    );
  }

  // Variante botão (com label, para páginas de detalhe)
  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 
        text-base font-bold rounded-lg transition-all
        ${isFav 
          ? 'bg-red-50 text-red-600 border-2 border-red-600 hover:bg-red-100' 
          : 'bg-white text-pharos-slate-700 border-2 border-pharos-slate-300 hover:border-pharos-blue-500'
        }
        ${className}
      `}
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <svg
        className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill={isFav ? 'currentColor' : 'none'}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && (
        <span>{isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</span>
      )}
    </button>
  );
}

/**
 * Variante compacta do botão para uso em listas
 */
export function FavoriteButtonCompact({ 
  imovelId, 
  className = '' 
}: { 
  imovelId: string; 
  className?: string 
}) {
  const { isFavorito, toggleFavorito } = useFavoritos();
  const isFav = isFavorito(imovelId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorito(imovelId);
      }}
      className={`
        p-2 rounded-lg transition-colors
        ${isFav 
          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
          : 'text-pharos-slate-500 hover:bg-pharos-slate-300 hover:text-pharos-slate-700'
        }
        ${className}
      `}
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      title={isFav ? 'Nos favoritos' : 'Adicionar aos favoritos'}
    >
      <svg
        className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill={isFav ? 'currentColor' : 'none'}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

