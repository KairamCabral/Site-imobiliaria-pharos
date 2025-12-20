"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { OptimizedImage as Image } from './OptimizedImage';
import Link from 'next/link';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  HeartIcon,
  ShareIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StatusBadge } from './StatusBadge';
import { formatarPreco, formatarArea } from '@/utils/seo';
import type { Empreendimento } from '@/types';

interface EmpreendimentoListItemProps {
  empreendimento: Empreendimento;
  index: number;
}

export const EmpreendimentoListItem: React.FC<EmpreendimentoListItemProps> = ({ 
  empreendimento,
  index 
}) => {
  const {
    slug,
    nome,
    descricao,
    imagemCapa,
    status,
    construtora,
    endereco,
    precoDesde,
    areaDesde,
    totalUnidades,
    unidadesDisponiveis,
    lazer,
  } = empreendimento;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-pharos-slate-300 hover:border-pharos-blue-500 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {/* Imagem - 30% width */}
        <div className="relative w-full md:w-[35%] h-64 md:h-auto min-h-[300px]">
          <Image
            src={imagemCapa || '/images/placeholder-building.jpg'}
            alt={nome || 'Empreendimento'}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            <StatusBadge status={status || 'disponivel'} />
          </div>
          {(unidadesDisponiveis ?? 0) > 0 && (
            <div className="absolute top-4 right-4">
              <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-bold text-pharos-blue-500 shadow-md">
                {unidadesDisponiveis} {unidadesDisponiveis === 1 ? 'Unidade' : 'Unidades'}
              </span>
            </div>
          )}
        </div>

        {/* Content - 70% width */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-pharos-navy-900 mb-2 hover:text-pharos-blue-500 transition-colors">
                {nome || 'Empreendimento'}
              </h3>
              <div className="flex items-center gap-4 text-sm text-pharos-slate-600 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <BuildingOffice2Icon className="w-4 h-4" />
                  {construtora}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4" />
                  {endereco?.bairro || ''}{endereco?.bairro && endereco?.cidade ? ', ' : ''}{endereco?.cidade || ''}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 ml-4">
              <button className="w-10 h-10 bg-pharos-slate-300/30 rounded-full flex items-center justify-center hover:bg-pharos-blue-500 hover:text-white transition-colors">
                <HeartIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-pharos-slate-300/30 rounded-full flex items-center justify-center hover:bg-pharos-blue-500 hover:text-white transition-colors">
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-pharos-slate-800 mb-4 line-clamp-2 leading-relaxed">
            {descricao}
          </p>

          {/* Specs inline */}
          <div className="flex gap-6 mb-4 flex-wrap">
            {precoDesde && (
              <div>
                <p className="text-xs text-pharos-slate-600 mb-1 font-medium">A partir de</p>
                <p className="text-xl font-bold text-pharos-blue-600">
                  {formatarPreco(precoDesde)}
                </p>
              </div>
            )}
            {areaDesde && (
              <div>
                <p className="text-xs text-pharos-slate-600 mb-1 font-medium">Área desde</p>
                <p className="text-xl font-bold text-pharos-navy-900">
                  {formatarArea(areaDesde)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-pharos-slate-600 mb-1 font-medium">Total Unidades</p>
              <p className="text-xl font-bold text-pharos-navy-900">
                {totalUnidades}
              </p>
            </div>
          </div>

          {/* Amenities */}
          {lazer && lazer.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {lazer.slice(0, 6).map((item, i) => (
                <span 
                  key={i} 
                  className="text-xs bg-pharos-blue-600/15 text-pharos-blue-700 px-3 py-1.5 rounded-lg font-semibold"
                >
                  {item}
                </span>
              ))}
              {lazer.length > 6 && (
                <span className="text-xs text-pharos-slate-600 px-3 py-1.5 font-semibold">
                  +{lazer.length - 6}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <Link href={`/empreendimentos/${slug}`} className="mt-auto">
            <button className="w-full md:w-auto bg-pharos-navy-900 hover:bg-pharos-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group">
              <span>Ver Detalhes</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

