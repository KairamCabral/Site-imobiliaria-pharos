import React from 'react';

export const EmpreendimentoSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-pharos-slate-300 animate-pulse h-full flex flex-col">
      {/* Imagem Skeleton */}
      <div className="aspect-[16/10] bg-pharos-slate-300" />
      
      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Título */}
        <div className="h-6 bg-pharos-slate-300 rounded-lg mb-4 w-3/4" />
        
        {/* Construtora */}
        <div className="h-4 bg-pharos-slate-300 rounded-lg mb-2 w-1/2" />
        
        {/* Localização */}
        <div className="h-4 bg-pharos-slate-300 rounded-lg mb-4 w-2/3" />
        
        {/* Descrição */}
        <div className="h-4 bg-pharos-slate-300 rounded-lg mb-2 w-full" />
        <div className="h-4 bg-pharos-slate-300 rounded-lg mb-5 w-5/6" />
        
        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-t border-pharos-slate-300 pt-4">
          <div className="h-12 bg-pharos-slate-300 rounded-lg" />
          <div className="h-12 bg-pharos-slate-300 rounded-lg" />
          <div className="h-12 bg-pharos-slate-300 rounded-lg" />
        </div>
        
        {/* Amenities */}
        <div className="flex gap-2 mb-4">
          <div className="h-7 bg-pharos-slate-300 rounded-lg w-20" />
          <div className="h-7 bg-pharos-slate-300 rounded-lg w-24" />
          <div className="h-7 bg-pharos-slate-300 rounded-lg w-16" />
        </div>
        
        {/* CTA Button */}
        <div className="h-12 bg-pharos-slate-300 rounded-xl mt-auto" />
      </div>
    </div>
  );
};

