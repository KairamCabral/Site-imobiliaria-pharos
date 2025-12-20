'use client';

import { useMemo, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Bed, Car, Maximize } from 'lucide-react';

interface PropertyMiniCardHorizontalProps {
  id: string;
  titulo: string;
  imagens: string[] | { src: string; alt?: string }[];
  preco: number;
  quartos: number;
  vagas: number;
  area: number;
  onClose: () => void;
}

/**
 * Card horizontal minimalista otimizado para mapas
 * Design clean, carregamento rápido, UX premium
 */
const PropertyMiniCardHorizontal = memo(function PropertyMiniCardHorizontal({
  id,
  titulo,
  imagens,
  preco,
  quartos,
  vagas,
  area,
  onClose,
}: PropertyMiniCardHorizontalProps) {
  // Primeira imagem apenas (performance)
  const imagemPrincipal = useMemo(() => {
    if (Array.isArray(imagens) && imagens.length > 0) {
      return typeof imagens[0] === 'string' ? imagens[0] : imagens[0].src;
    }
    return 'https://via.placeholder.com/300x200';
  }, [imagens]);

  // Formatação de preço (memoizada)
  const precoFormatado = useMemo(() => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(preco),
    [preco]
  );

  return (
    <div 
      className="relative bg-white rounded-xl shadow-xl overflow-hidden flex"
      style={{
        width: '420px',
        height: '140px',
        border: '1px solid #E8ECF2',
      }}
    >
      {/* Botão Fechar */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#054ADA]"
        aria-label="Fechar"
      >
        <X className="w-4 h-4 text-[#192233]" strokeWidth={2.5} />
      </button>

      {/* Imagem (lado esquerdo) */}
      <div className="relative w-[140px] h-full flex-shrink-0 bg-[#F7F9FC]">
        <Image
          src={imagemPrincipal}
          alt={titulo}
          fill
          sizes="140px"
          className="object-cover"
          loading="lazy"
          quality={75}
        />
      </div>

      {/* Conteúdo (lado direito) */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        {/* Título */}
        <h3 
          className="text-[#192233] font-bold text-sm leading-tight line-clamp-2 mb-2"
          style={{ fontSize: '13px' }}
        >
          {titulo}
        </h3>

        {/* Características */}
        <div className="flex items-center gap-3 mb-2">
          {quartos > 0 && (
            <div className="flex items-center gap-1 text-[#8E99AB]">
              <Bed className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-xs font-medium">{quartos}</span>
            </div>
          )}
          {vagas > 0 && (
            <div className="flex items-center gap-1 text-[#8E99AB]">
              <Car className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-xs font-medium">{vagas}</span>
            </div>
          )}
          {area > 0 && (
            <div className="flex items-center gap-1 text-[#8E99AB]">
              <Maximize className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-xs font-medium">{area}m²</span>
            </div>
          )}
        </div>

        {/* Preço e CTA */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-[#8E99AB] font-medium uppercase tracking-wide mb-0.5">
              Valor
            </p>
            <p className="text-[#054ADA] font-bold text-base leading-none">
              {precoFormatado}
            </p>
          </div>

          <Link
            href={`/imoveis/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#054ADA] hover:bg-[#043bb8] text-white text-xs font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:ring-offset-2 whitespace-nowrap"
          >
            Ver Mais
          </Link>
        </div>
      </div>
    </div>
  );
});

export default PropertyMiniCardHorizontal;

