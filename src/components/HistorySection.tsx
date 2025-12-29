"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const HistorySection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <picture>
                <source 
                  media="(max-width: 640px)" 
                  srcSet="/images/banners/optimized/balneario-camboriu-mobile.avif"
                  type="image/avif"
                />
                <source 
                  media="(max-width: 640px)" 
                  srcSet="/images/banners/optimized/balneario-camboriu-mobile.webp"
                  type="image/webp"
                />
                <source 
                  media="(min-width: 641px)" 
                  srcSet="/images/banners/optimized/balneario-camboriu-tablet.avif"
                  type="image/avif"
                />
                <source 
                  media="(min-width: 641px)" 
                  srcSet="/images/banners/optimized/balneario-camboriu-tablet.webp"
                  type="image/webp"
                />
                <Image 
                  src="/images/banners/optimized/balneario-camboriu-tablet.webp" 
                  alt="Balneário Camboriú" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={85}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-pharos-navy-900/40 to-transparent" />
            </div>
            
            {/* Elemento decorativo */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-pharos-gold/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-pharos-blue-500/20 rounded-full blur-3xl" />
          </motion.div>

          {/* Conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-0.5 bg-pharos-gold mb-6" />
            <h2 className="text-4xl font-bold text-pharos-navy-900 mb-6">
              Nossa História
            </h2>
            
            <div className="space-y-4 text-pharos-slate-700 leading-relaxed text-justify">
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

