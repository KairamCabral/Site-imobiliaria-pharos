'use client';

import Link from 'next/link';
import CustomImage from './CustomImage';
import ImovelCard from './ImovelCard';
import { traduzirStatus } from '@/utils/seo';
import type { Empreendimento } from '@/types';
import type { Imovel } from '@/types';

interface EmpreendimentoSectionProps {
  empreendimento: Empreendimento;
  imoveisDisponiveis?: Imovel[];
  imovelAtualId?: string;
}

/**
 * Seção de Empreendimento para página de imóvel
 * Exibe informações destacadas do empreendimento relacionado
 */
export default function EmpreendimentoSection({ 
  empreendimento, 
  imoveisDisponiveis = [],
  imovelAtualId 
}: EmpreendimentoSectionProps) {
  const {
    slug,
    nome,
    descricao,
    imagemCapa,
    status,
    construtora,
    lazer,
    areasComuns,
    totalUnidades,
    unidadesDisponiveis,
    dataEntrega,
    folderPdf,
  } = empreendimento;
  
  const qtdImoveisDisponiveis = imoveisDisponiveis.length;

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-primary/10 overflow-hidden">
      {/* Header da seção */}
      <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-white/90 text-xs font-medium uppercase tracking-wider">Empreendimento</p>
              <h2 className="text-white text-xl font-bold">{nome}</h2>
            </div>
          </div>
          
          {/* Badge de Status */}
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            status === 'lancamento' 
              ? 'bg-amber-400 text-amber-900'
              : status === 'em-construcao'
              ? 'bg-blue-400 text-blue-900'
              : status === 'pronto'
              ? 'bg-green-400 text-green-900'
              : 'bg-gray-400 text-gray-900'
          }`}>
            {traduzirStatus(status)}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 lg:p-8">
        {/* Imagem do Empreendimento - Full Width */}
        <div className="mb-6">
          <Link href={`/empreendimentos/${slug}`} className="group block">
            <div className="relative h-[300px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
              <CustomImage
                src={imagemCapa || '/images/placeholder-building.jpg'}
                alt={nome || 'Empreendimento'}
                fill
                sizes="100vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Overlay com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              
              {/* Informações sobrepostas */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {construtora}
                  </span>
                  {qtdImoveisDisponiveis > 0 && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#054ADA] text-white">
                      {qtdImoveisDisponiveis} {qtdImoveisDisponiveis === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-sm md:text-base line-clamp-2">{descricao}</p>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white font-semibold text-lg mb-2">Ver Empreendimento Completo</p>
                  <svg className="w-10 h-10 text-white mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Descrição do Empreendimento */}
        <div className="mb-8 bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-[#192233] mb-3 flex items-center">
            <svg className="w-5 h-5 text-[#054ADA] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sobre o Empreendimento
          </h3>
          <p className="text-[#4E5968] text-base leading-relaxed">
            {descricao}
          </p>
        </div>

        {/* Lazer e Comodidades */}
        {((lazer?.length ?? 0) > 0 || (areasComuns?.length ?? 0) > 0) && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#192233] mb-4 flex items-center">
              <svg className="w-6 h-6 text-[#054ADA] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Lazer e Comodidades
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...(lazer || []), ...(areasComuns || [])].slice(0, 12).map((item, index) => (
                <div key={index} className="flex items-center bg-[#F7F9FC] p-3 rounded-lg text-sm text-[#192233] hover:bg-[#E8ECF2] transition-colors">
                  <svg className="w-4 h-4 text-[#054ADA] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="line-clamp-1 font-medium">{item}</span>
                </div>
              ))}
            </div>
            
            {((lazer?.length ?? 0) + (areasComuns?.length ?? 0)) > 12 && (
              <Link 
                href={`/empreendimentos/${slug}`}
                className="inline-flex items-center text-sm text-[#054ADA] hover:text-[#043bb8] font-semibold mt-4 group"
              >
                Ver todas as comodidades ({(lazer?.length ?? 0) + (areasComuns?.length ?? 0)})
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}
        
        {/* Imóveis Disponíveis - Preview com Carrossel */}
        {imoveisDisponiveis.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#192233] flex items-center">
                <svg className="w-6 h-6 text-[#054ADA] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Imóveis Disponíveis
              </h3>
              <Link
                href={`/imoveis?empreendimento=${empreendimento.id}`}
                className="text-[#054ADA] hover:text-[#043bb8] font-semibold flex items-center gap-1 group text-sm"
              >
                Ver todos ({imoveisDisponiveis.length})
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
              {imoveisDisponiveis.slice(0, 2).map((imovel) => (
                <div key={imovel.id} className="h-full">
                  <ImovelCard
                    id={imovel.id}
                    titulo={imovel.titulo}
                    endereco={imovel.endereco?.bairro || ''}
                    preco={imovel.preco}
                    quartos={imovel.quartos}
                    banheiros={imovel.banheiros}
                    area={imovel.areaTotal}
                    vagas={imovel.vagasGaragem || 0}
                    imagens={imovel.galeria && imovel.galeria.length > 0 ? imovel.galeria : (imovel.imagemCapa ? [imovel.imagemCapa] : [])}
                    tipoImovel={imovel.tipo}
                    caracteristicas={imovel.caracteristicas || []}
                    caracteristicasImovel={imovel.caracteristicasImovel || []}
                    caracteristicasLocalizacao={imovel.caracteristicasLocalizacao || []}
                    distanciaMar={imovel.distanciaMar}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/empreendimentos/${slug}`}
              className="flex-1 flex items-center justify-center gap-2 bg-[#054ADA] hover:bg-[#043bb8] text-white font-semibold py-3 px-6 rounded-lg transition-all hover:shadow-lg group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Ver Empreendimento Completo
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            {folderPdf && (
              <a
                href={folderPdf}
                download
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#054ADA] border-2 border-[#054ADA] font-semibold py-3 px-6 rounded-lg transition-all hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Baixar Folder (PDF)
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

