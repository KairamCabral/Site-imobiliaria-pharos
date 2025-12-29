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
    <section className="py-12 sm:py-16 md:py-20 bg-pharos-offwhite" aria-labelledby="quem-somos-heading">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <div className="w-12 sm:w-16 h-0.5 bg-pharos-gold mx-auto mb-4 sm:mb-6" aria-hidden="true" />
          <h2 id="quem-somos-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-pharos-navy-900 mb-4">
            Quem Somos
          </h2>
        </motion.div>

        {/* Tabs Navigation - Mobile-First */}
        <div 
          className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 flex-wrap px-2"
          role="tablist"
          aria-label="Navegação entre Missão, Visão e Valores"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-pharos-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white text-pharos-slate-700 hover:bg-pharos-slate-300/30 active:scale-95'
              }`}
            >
              <tab.Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content - Mobile-First */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg sm:shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-start gap-6 sm:gap-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pharos-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <currentTab.Icon className="w-8 h-8 sm:w-10 sm:h-10 text-pharos-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-pharos-navy-900 mb-4 sm:mb-5 md:mb-6">
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

