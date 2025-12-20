"use client";

import React from 'react';
import { Metadata } from "next"; 
import { motion } from 'framer-motion';
import Image from 'next/image';
import { AnimatedStats } from '@/components/AnimatedCounter';
import { HistorySection } from '@/components/HistorySection';
import { MissionVision } from '@/components/MissionVision';
import { ValuesSection } from '@/components/ValuesSection';
import { TeamGrid } from '@/components/TeamGrid';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { AboutCTA } from '@/components/AboutCTA';
import { LazySection } from '@/components/LazySection';
import Breadcrumb from '@/components/Breadcrumb';

export default function Sobre() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50/80 border-b border-gray-200/80">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            items={[
              { name: 'Início', label: 'Início', href: '/', url: '/' },
              { name: 'Sobre Nós', label: 'Sobre Nós', href: '/sobre', url: '/sobre', current: true },
            ]}
          />
        </div>
      </div>

      {/* Hero Minimalista Premium */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden bg-pharos-navy-900/5">
        {/* Background com profundidade elegante */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image 
            src="/images/banners/balneario-camboriu.webp"
            alt="Pharos Negócios Imobiliários"
            fill
            className="object-cover scale-[1.01]"
            priority
            quality={95}
            style={{ filter: "saturate(0.9) brightness(0.78)" }}
          />
          {/* Overlay sofisticado para contraste em tons de azul */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1E47]/78 via-[#123B7A]/46 to-[#E8F1FF]/25" />
          {/* Vinheta sutil para foco no centro */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_52%)]" />
        </motion.div>

        {/* Content centralizado */}
        <div className="relative h-full flex items-center justify-center">
          <div className="container max-w-5xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {/* Badge minimalista */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/18 bg-white/14 backdrop-blur-lg shadow-[0_10px_40px_rgba(0,0,0,0.12)]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-pharos-gold animate-pulse" />
                <span className="text-sm font-medium text-white tracking-wide">
                  Excelência em Alto Padrão
                </span>
              </motion.div>

              {/* Título refinado */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.15] tracking-tight drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                Guiando você para o
                <span className="block font-semibold mt-2 text-white">
                  imóvel ideal
                </span>
              </h1>

              {/* Subtítulo elegante */}
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
                Excelência em negócios imobiliários de alto padrão em Balneário Camboriú
              </p>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator minimalista */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-xs font-medium text-white/65 uppercase tracking-widest">
              Descubra mais
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      <LazySection rootMargin="320px 0px" fallback={<div className="min-h-[160px] w-full" />}
        className="w-full">
        <AnimatedStats />
      </LazySection>

      <LazySection rootMargin="280px 0px" fallback={<div className="min-h-[200px] bg-transparent" />}
        className="w-full">
        <HistorySection />
      </LazySection>

      <LazySection rootMargin="280px 0px" fallback={<div className="min-h-[200px] bg-transparent" />}
        className="w-full">
        <MissionVision />
      </LazySection>

      <LazySection rootMargin="280px 0px" fallback={<div className="min-h-[200px] bg-transparent" />}
        className="w-full">
        <ValuesSection />
      </LazySection>

      <LazySection rootMargin="280px 0px" fallback={<div className="min-h-[200px] bg-transparent" />}
        className="w-full">
        <TeamGrid />
      </LazySection>

      <LazySection rootMargin="320px 0px" fallback={<div className="min-h-[200px] bg-transparent" />}
        className="w-full">
        <TestimonialsCarousel />
      </LazySection>

      <LazySection rootMargin="320px 0px" fallback={<div className="min-h-[200px] bg-transparent" />}
        className="w-full">
        <AboutCTA />
      </LazySection>
    </>
  );
}
