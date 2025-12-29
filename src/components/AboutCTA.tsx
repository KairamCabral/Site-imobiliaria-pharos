"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from './Button';
import { HomeIcon, PhoneIcon } from '@heroicons/react/24/outline';

export const AboutCTA: React.FC = () => {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-pharos-navy-900" aria-labelledby="cta-heading">
      {/* Background Pattern */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#054ADA_0%,transparent_50%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,#C89C4D_0%,transparent_50%)] opacity-10" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Pronto para encontrar seu imóvel dos sonhos?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Nossa equipe está pronta para guiá-lo em cada etapa da sua jornada imobiliária
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4">
            <Link href="/imoveis" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                icon={<HomeIcon className="w-5 h-5" />}
                className="bg-white text-pharos-navy-900 hover:bg-pharos-offwhite active:bg-gray-100 shadow-xl w-full sm:min-w-[200px] min-h-[48px] sm:min-h-[52px] text-base sm:text-lg font-semibold touch-manipulation"
                aria-label="Ver todos os imóveis disponíveis"
              >
                Ver Imóveis
              </Button>
            </Link>
            <Link href="/contato" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                icon={<PhoneIcon className="w-5 h-5" />}
                className="font-bold shadow-2xl transition-all group overflow-hidden relative w-full sm:min-w-[200px] min-h-[48px] sm:min-h-[52px] text-base sm:text-lg touch-manipulation"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(16px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  color: '#FFFFFF'
                }}
                aria-label="Falar com um corretor especializado"
              >
                <span className="relative z-10">Falar com Corretor</span>
                <div 
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  style={{ zIndex: 0 }}
                  aria-hidden="true"
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold" style={{ color: '#192233', zIndex: 10 }}>
                  Falar com Corretor
                </span>
              </Button>
            </Link>
          </div>

          {/* Trust Badge - Mobile-First */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 sm:mt-12 pt-8 sm:pt-12 border-t border-white/10"
          >
            <p className="text-white/60 text-xs sm:text-sm mb-3">Associados e Certificados</p>
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
              <div className="text-white/80 text-xs sm:text-sm">
                <strong>CRECI</strong> 40107
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="text-white/80 text-sm">
                <strong>CNPJ</strong> 51.040.966/0001-93
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

