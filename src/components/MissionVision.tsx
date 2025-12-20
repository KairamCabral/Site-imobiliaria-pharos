"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RocketLaunchIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

type TabType = 'missao' | 'visao' | 'valores';

interface TabContent {
  id: TabType;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
}

const tabs: TabContent[] = [
  {
    id: 'missao',
    label: 'Missão',
    Icon: RocketLaunchIcon,
    title: 'MISSÃO',
    content: 'Proporcionar negócios seguros e rentáveis, superando as expectativas dos clientes com serviços de alto padrão de excelência.'
  },
  {
    id: 'visao',
    label: 'Visão',
    Icon: EyeIcon,
    title: 'VISÃO',
    content: 'Aspiramos ser reconhecidos como a imobiliária de destaque no mercado de alto padrão, pela excelência dos nossos corretores e a qualidade dos nossos serviços.'
  },
  {
    id: 'valores',
    label: 'Valores',
    Icon: SparklesIcon,
    title: 'VALORES',
    content: 'Evolução Contínua, Humildade, Honestidade, Proatividade e Positividade orientam todas as nossas ações e decisões.'
  }
];

export const MissionVision: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('missao');
  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <section className="py-20 bg-pharos-offwhite">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-0.5 bg-pharos-gold mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-pharos-navy-900 mb-4">
            Quem Somos
          </h2>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-pharos-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white text-pharos-slate-700 hover:bg-pharos-slate-300/30'
              }`}
            >
              <tab.Icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl p-12 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-20 h-20 bg-pharos-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <currentTab.Icon className="w-10 h-10 text-pharos-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-pharos-navy-900 mb-6">
                  {currentTab.title}
                </h3>
                <p className="text-pharos-slate-700 text-lg leading-relaxed">
                  {currentTab.content}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

