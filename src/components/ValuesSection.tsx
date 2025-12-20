"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon
} from '@heroicons/react/24/outline';

interface Value {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const valores: Value[] = [
  {
    title: 'Evolução Contínua',
    description: 'Estamos comprometidos com o crescimento constante e o aprimoramento contínuo de nossas habilidades e serviços.',
    Icon: ArrowTrendingUpIcon
  },
  {
    title: 'Humildade',
    description: 'Valorizamos o aprendizado contínuo, aproveitando cada feedback e oportunidade para melhorar.',
    Icon: LightBulbIcon
  },
  {
    title: 'Honestidade',
    description: 'Agimos com integridade total, construindo relações de confiança com clientes, parceiros e colaboradores.',
    Icon: ShieldCheckIcon
  },
  {
    title: 'Proatividade',
    description: 'Fomentamos uma atitude de antecipação e inovação, rejeitando a complacência e buscando sempre novos desafios.',
    Icon: SparklesIcon
  },
  {
    title: 'Positividade',
    description: 'Promovemos um ambiente de trabalho motivador, onde encaramos desafios como oportunidades para crescimento.',
    Icon: SunIcon
  }
];

export const ValuesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-0.5 bg-pharos-gold mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-pharos-navy-900 mb-4">
            Nossos Valores
          </h2>
          <p className="text-pharos-slate-700 text-lg max-w-2xl mx-auto">
            Princípios que guiam todas as nossas ações e decisões
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {valores.map((valor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 border border-pharos-slate-300 hover:border-pharos-blue-500 hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-pharos-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-pharos-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pharos-blue-500 transition-colors duration-300">
                  <valor.Icon className="w-8 h-8 text-pharos-blue-500 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-xl font-semibold text-pharos-navy-900 mb-3">
                  {valor.title}
                </h3>
                <p className="text-pharos-slate-700 leading-relaxed">
                  {valor.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

