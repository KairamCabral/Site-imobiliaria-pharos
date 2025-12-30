"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const HistorySection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white" aria-labelledby="historia-heading">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
              <div className="absolute inset-0 w-full h-full">
                <Image 
                  src="/images/banners/balneario-camboriu.webp" 
                  alt="Balneário Camboriú - Vista aérea da cidade" 
                  fill
                  className="!object-cover !w-full !h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                  quality={85}
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-pharos-navy-900/40 to-transparent z-10" />
            </div>
            
            {/* Elemento decorativo - Oculto em mobile para performance */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-pharos-gold/20 rounded-full blur-3xl hidden sm:block" aria-hidden="true" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-pharos-blue-500/20 rounded-full blur-3xl hidden sm:block" aria-hidden="true" />
          </motion.div>

          {/* Conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="w-12 sm:w-16 h-0.5 bg-pharos-gold mb-4 sm:mb-6" aria-hidden="true" />
            <h2 id="historia-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-pharos-navy-900 mb-4 sm:mb-6">
              Nossa História
            </h2>
            
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-pharos-slate-700 leading-relaxed text-left sm:text-justify">
              <p>
                Fundada em <strong className="text-pharos-blue-500">2020</strong>, a Pharos nasceu com o propósito de revolucionar o mercado imobiliário de alto padrão em Balneário Camboriú. Nosso nome, inspirado no antigo farol de Alexandria, uma das sete maravilhas do mundo antigo, simboliza nossa missão de <strong>guiar nossos clientes</strong> para as melhores oportunidades no mercado imobiliário.
              </p>
              
              <p>
                Ao longo dos últimos anos, construímos uma reputação sólida baseada em valores como transparência, integridade e excelência em atendimento. Nossa equipe de profissionais altamente qualificados e que <strong className="text-pharos-blue-500">décadas de experiência</strong> no mercado imobiliário é composta por especialistas com profundo conhecimento do mercado local e ampla experiência em transações de alto valor. Além de constantes treinamentos e atualizações para estarem sempre atualizados nas melhores oportunidades.
              </p>
              
              <p>
                A Pharos se destaca pela <strong>personalização do atendimento</strong>, compreendendo que cada cliente possui necessidades específicas. Somos especialistas em identificar oportunidades exclusivas, sejam para moradia, investimento ou veraneio, sempre alinhadas ao perfil e objetivos de nossos clientes.
              </p>
              
              <p>
                Hoje, somos reconhecidos como uma das principais imobiliárias de Balneário Camboriú, com atuação destacada nos segmentos de apartamentos de frente para o mar, residências de alto padrão e empreendimentos exclusivos.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

