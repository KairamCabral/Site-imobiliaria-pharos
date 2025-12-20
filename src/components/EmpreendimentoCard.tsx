'use client';

import Link from 'next/link';
import { OptimizedImage as Image } from './OptimizedImage';
import { motion } from 'framer-motion';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  CalendarIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { formatarPreco, formatarArea } from '@/utils/seo';
import type { Empreendimento } from '@/types';

interface EmpreendimentoCardProps {
  empreendimento: Empreendimento;
  index?: number;
}

/**
 * Card de Empreendimento - Design premium sofisticado
 */
export default function EmpreendimentoCard({ empreendimento, index = 0 }: EmpreendimentoCardProps) {
  const {
    slug,
    nome,
    descricao,
    imagemCapa,
    fotos,
    fotosUnidades,
    construtora,
    endereco,
    precoDesde,
    precoMinimo,
    areaDesde,
    areaMinima,
    unidadesDisponiveis,
    dataEntrega,
    caracteristicas,
    infraestrutura,
  } = empreendimento;

  // Usar primeira foto disponível
  const imagemPrincipal = 
    fotos?.[0]?.url || 
    imagemCapa || 
    fotosUnidades?.[0]?.url || 
    '/images/placeholder-empreendimento.jpg';

  const preco = precoDesde || precoMinimo;
  const area = areaDesde || areaMinima;

  // Pegar principais amenidades
  const amenidades = [
    ...(caracteristicas || []),
    ...(infraestrutura || []),
  ].slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Link href={`/empreendimentos/${slug}`} className="block h-full group">
        <article className="relative h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 hover:border-blue-500/50">
          {/* Imagem com Overlay Gradiente */}
          <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-200">
            <Image
              src={imagemPrincipal}
              alt={nome}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              quality={85}
            />
            
            {/* Overlay gradiente premium */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
            
            {/* Badge de Unidades Disponíveis */}
            {unidadesDisponiveis !== undefined && unidadesDisponiveis > 0 && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-full shadow-lg">
                  <HomeIcon className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">
                    {unidadesDisponiveis} Unidade{unidadesDisponiveis !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Info overlay (aparece no hover) */}
            <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-full">
                <div className="flex items-center gap-2 text-white/90 mb-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {endereco?.bairro}, {endereco?.cidade}
                  </span>
                </div>
                
                {dataEntrega && (
                  <div className="flex items-center gap-2 text-white/90">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Entrega: {new Date(dataEntrega).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 flex flex-col flex-1">
            {/* Título e Construtora */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
                {nome}
              </h3>
              
              {construtora && (
                <div className="flex items-center gap-2 text-slate-600">
                  <BuildingOffice2Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium line-clamp-1">{construtora}</span>
                </div>
              )}
            </div>
            
            {/* Descrição */}
            {descricao && (
              <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                {descricao}
              </p>
            )}
            
            {/* Preço */}
            {preco && preco > 0 && (
              <div className="mb-6 pb-6 border-t border-slate-200 pt-6">
                <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">A partir de</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatarPreco(preco)}
                </p>
              </div>
            )}
            
            {/* CTA Button */}
            <div className="mt-auto pt-2">
              <div className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-700 group-hover:to-blue-800 text-white rounded-xl transition-all duration-300 group-hover:shadow-lg">
                <span className="font-semibold text-sm">Ver Empreendimento</span>
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Brilho sutil no hover (efeito premium) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
