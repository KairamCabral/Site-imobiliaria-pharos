"use client";

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

const stats: Stat[] = [
  { value: 300, label: "Imóveis Vendidos", suffix: "+" },
  { value: 200, label: "Clientes Satisfeitos", suffix: "+" },
  { value: 6, label: "Anos de Mercado", suffix: "" },
  { value: 6, label: "Corretores Especializados", suffix: "" },
  { value: 200, label: "VGV", suffix: "M+", prefix: "R$" }
];

export const AnimatedStats: React.FC = () => {
  return (
    <section 
      className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-pharos-slate-50/30 to-white relative overflow-hidden"
      aria-label="Estatísticas da Pharos"
    >
      {/* Linha decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pharos-gold/30 to-transparent" aria-hidden="true" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} delay={i * 0.12} />
          ))}
        </div>
      </div>

      {/* Linha decorativa inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pharos-gold/30 to-transparent" aria-hidden="true" />
    </section>
  );
};

const StatCard: React.FC<{ stat: Stat; delay: number }> = ({ stat, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        delay, 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="relative group text-center"
      role="article"
      aria-label={`${stat.prefix || ''}${stat.value}${stat.suffix || ''} ${stat.label}`}
    >
      {/* Card com background sutil - Mobile-First */}
      <div className="relative py-5 px-2 sm:py-6 sm:px-3 md:py-7 md:px-4 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white/85 backdrop-blur-md shadow-[0_8px_32px_rgba(12,23,52,0.06)] sm:shadow-[0_10px_40px_rgba(12,23,52,0.06)] hover:shadow-[0_12px_48px_rgba(12,23,52,0.12)] sm:hover:shadow-[0_16px_60px_rgba(12,23,52,0.12)] hover:translate-y-[-2px] touch-manipulation">
        {/* Indicador minimalista superior */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
          className="w-8 sm:w-10 h-0.5 bg-gradient-to-r from-pharos-gold to-amber-400 mx-auto mb-4 sm:mb-5 md:mb-6 origin-center shadow-sm"
          aria-hidden="true"
        />

        {/* Número */}
        <div className="mb-3 sm:mb-4">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight text-pharos-navy-900 tracking-tight leading-none">
            {isInView && (
              <CountUp
                start={0}
                end={stat.value}
                duration={2.5}
                suffix={stat.suffix}
                prefix={stat.prefix}
                separator="."
              />
            )}
          </div>
        </div>

        {/* Label */}
        <p className="text-[10px] sm:text-xs md:text-sm text-pharos-navy-900/60 font-medium tracking-wide leading-snug px-1 sm:px-2">
          {stat.label}
        </p>

        {/* Borda decorativa no hover */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-pharos-gold/0 group-hover:border-pharos-gold/20 transition-all duration-300" aria-hidden="true" />
      </div>
    </motion.div>
  );
};

