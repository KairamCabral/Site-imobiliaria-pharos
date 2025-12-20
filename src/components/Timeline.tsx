"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { milestones } from '@/data/timeline';

export const Timeline: React.FC = () => {
  return (
    <section className="py-20 bg-pharos-offwhite">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-0.5 bg-pharos-gold mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-pharos-navy-900 mb-4">
            Nossa Jornada
          </h2>
          <p className="text-pharos-slate-700 text-lg max-w-2xl mx-auto">
            Construindo história no mercado imobiliário de alto padrão
          </p>
        </motion.div>

        <div className="relative">
          {/* Linha vertical - ajusta para mobile */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-pharos-blue-500" />

          {milestones.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative flex items-center mb-16 last:mb-0 ${
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex-row`}
            >
              {/* Desktop layout */}
              <div className={`hidden md:block md:w-1/2 ${i % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <span className="text-pharos-blue-500 font-bold text-2xl block mb-3">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-semibold text-pharos-navy-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-pharos-slate-700 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="md:hidden pl-12 w-full">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <span className="text-pharos-blue-500 font-bold text-2xl block mb-3">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-semibold text-pharos-navy-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-pharos-slate-700 leading-relaxed">{item.description}</p>
                </div>
              </div>
              
              {/* Ponto na timeline */}
              <div className="absolute left-2.5 md:left-1/2 w-5 h-5 md:-ml-2.5 bg-pharos-blue-500 rounded-full border-4 border-white shadow-lg z-10" />
              
              <div className="hidden md:block md:w-1/2" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

