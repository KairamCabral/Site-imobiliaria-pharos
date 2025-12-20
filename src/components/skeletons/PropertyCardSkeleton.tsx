/**
 * Property Card Skeleton
 * 
 * Skeleton loader para cards de imóveis
 * Usado na listagem e homepage
 */

import React from 'react';
import { Skeleton, SkeletonImage, SkeletonText, SkeletonAvatar } from './Skeleton';

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      {/* Imagem */}
      <SkeletonImage aspectRatio="4/3" className="rounded-t-xl" />
      
      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {/* Badge (Tipo) */}
        <Skeleton variant="rounded" width={80} height={24} />
        
        {/* Título */}
        <SkeletonText lines={2} />
        
        {/* Preço */}
        <Skeleton variant="rounded" width={120} height={28} className="my-2" />
        
        {/* Características (quartos, área, etc) */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton width={30} height={16} />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton width={30} height={16} />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton width={40} height={16} />
          </div>
        </div>
        
        {/* Localização */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton width="60%" height={14} />
        </div>
        
        {/* Corretor */}
        <div className="flex items-center gap-2 pt-2">
          <SkeletonAvatar size={32} />
          <Skeleton width={100} height={14} />
        </div>
      </div>
    </div>
  );
}

/**
 * Property Card Skeleton Compact
 * Versão mais compacta para listagens densas
 */
export function PropertyCardSkeletonCompact() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Imagem menor */}
        <SkeletonImage aspectRatio="1/1" className="w-32 h-32 rounded-l-lg flex-shrink-0" />
        
        {/* Conteúdo */}
        <div className="flex-1 p-3 space-y-2">
          {/* Tipo */}
          <Skeleton variant="rounded" width={70} height={20} />
          
          {/* Título */}
          <SkeletonText lines={1} />
          
          {/* Preço */}
          <Skeleton variant="rounded" width={100} height={24} />
          
          {/* Info */}
          <div className="flex gap-3">
            <Skeleton width={40} height={14} />
            <Skeleton width={40} height={14} />
            <Skeleton width={50} height={14} />
          </div>
        </div>
      </div>
    </div>
  );
}





