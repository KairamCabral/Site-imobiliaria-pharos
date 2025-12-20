"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { HomeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import EmpreendimentoCard from '@/components/EmpreendimentoCard';
import { EmpreendimentoListItem } from '@/components/EmpreendimentoListItem';
import { EmpreendimentosFilters } from '@/components/EmpreendimentosFilters';
import { EmptyState } from '@/components/EmptyState';
import { EmpreendimentoSkeleton } from '@/components/EmpreendimentoSkeleton';
import { Button } from '@/components/Button';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import { generateBreadcrumbSchema } from '@/utils/structuredData';
import { useEmpreendimentosFilter, SortOption, StatusFilter } from '@/hooks/useEmpreendimentosFilter';
import type { Empreendimento } from '@/types';

type EmpreendimentosClientProps = {
  empreendimentos: Empreendimento[];
  total: number;
  stats: {
    preLancamento: number;
    lancamento: number;
    construcao: number;
    prontos: number;
  };
  initialSearch?: string;
  initialStatus?: StatusFilter;
  initialSort?: SortOption;
};

export function EmpreendimentosClient({
  empreendimentos,
  total,
  stats,
  initialSearch = '',
  initialStatus = 'todos',
  initialSort = 'relevancia',
}: EmpreendimentosClientProps) {
  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredEmpreendimentos,
  } = useEmpreendimentosFilter(empreendimentos, {
    initialSearch,
    initialStatus,
    initialSort,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Empreendimentos', url: '/empreendimentos' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />

      {/* Breadcrumb */}
      <div className="bg-gray-50/80 border-b border-gray-200/80">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            items={[
              { name: 'Início', label: 'Início', href: '/', url: '/' },
              { name: 'Empreendimentos', label: 'Empreendimentos', href: '/empreendimentos', url: '/empreendimentos', current: true },
            ]}
          />
        </div>
      </div>

      {/* Hero minimalista com alto contraste */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b1220] via-[#0f1a30] to-[#0b1220] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/banners/balneario-camboriu.webp"
            alt="Empreendimentos Premium"
            fill
            className="object-cover opacity-25 mix-blend-overlay"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-[#0f1a30]/85 to-[#0b1220]/90" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-18 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide">Curadoria premium Pharos</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight drop-shadow-md text-white">
              Empreendimentos em Balneário Camboriú, Itajaí e Camboriú
            </h1>
            <p className="text-base md:text-lg text-white/85 max-w-3xl">
              Seleção curada de empreendimentos: pré-lançamentos, lançamentos, em construção e prontos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtros Inteligentes */}
      <EmpreendimentosFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={() => {}}
        sortBy={sortBy}
        onSortChange={setSortBy}
        stats={{
          total,
          preLancamento: stats.preLancamento,
          lancamento: stats.lancamento,
          construcao: stats.construcao,
          prontos: stats.prontos,
        }}
      />

      {/* Listagem de Empreendimentos - Responsiva */}
      <section className="py-8 md:py-16 bg-pharos-offwhite">
        <div className="container max-w-7xl mx-auto px-4">
          {isLoading ? (
            // Loading Skeletons - Responsivos
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8'
              : 'space-y-4 md:space-y-6'
            }>
              {[...Array(6)].map((_, i) => (
                <EmpreendimentoSkeleton key={i} />
              ))}
            </div>
          ) : filteredEmpreendimentos.length > 0 ? (
            <>
              {/* Grid View - Responsivo */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {filteredEmpreendimentos.map((empreendimento, index) => (
                    <EmpreendimentoCard
                      key={empreendimento.id}
                      empreendimento={empreendimento}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {/* List View - Responsivo */}
              {viewMode === 'list' && (
                <div className="space-y-4 md:space-y-6">
                  {filteredEmpreendimentos.map((empreendimento, index) => (
                    <EmpreendimentoListItem
                      key={empreendimento.id}
                      empreendimento={empreendimento}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {/* Contador de resultados */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-12 text-pharos-slate-700"
              >
                <p className="text-sm font-medium">
                  Exibindo <strong className="text-pharos-blue-600">{filteredEmpreendimentos.length}</strong> de <strong className="text-pharos-navy-900">{total}</strong> empreendimentos
                </p>
              </motion.div>
            </>
          ) : (
            // Empty State
            <EmptyState
              title="Nenhum empreendimento encontrado"
              description="Tente ajustar os filtros ou a busca para ver mais resultados."
              action={{
                label: 'Limpar Filtros',
                onClick: () => {
                  setSearchQuery('');
                  setStatusFilter('todos');
                  setSortBy('relevancia');
                }
              }}
            />
          )}
        </div>
      </section>

      {/* CTA minimalista e acessível */}
      <section className="py-14 md:py-18 bg-gradient-to-b from-[#0b1220] via-[#0d182b] to-[#0b1220] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_15%_20%,#1d4ed8_0%,transparent_28%),radial-gradient(circle_at_85%_15%,#0ea5e9_0%,transparent_24%)]" />
        <div className="max-w-5xl mx-auto px-4 relative text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Atendimento premium</p>
            <h2 className="text-2xl md:text-3xl font-semibold leading-snug text-white">
              Não encontrou o empreendimento ideal?
            </h2>
            <p className="text-base md:text-lg text-white/85 max-w-3xl mx-auto">
              Falamos com proprietários e temos unidades exclusivas fora do site. Diga o que precisa e captamos para você.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="https://wa.me/5547991878070" target="_blank" rel="noopener noreferrer">
              <Button
                variant="primary"
                size="lg"
                className="px-6 py-3 bg-white text-pharos-navy-900 hover:bg-pharos-blue-100 font-semibold shadow-lg"
                icon={<PhoneIcon className="w-5 h-5" />}
              >
                Falar com um especialista
              </Button>
            </Link>
            <Link href="/imoveis">
              <Button
                variant="secondary"
                size="lg"
                className="px-6 py-3 border border-white/25 bg-gradient-to-r from-[#0f172a] to-[#0b1220] text-white hover:from-[#111b30] hover:to-[#0d1526] shadow-lg"
                icon={<HomeIcon className="w-5 h-5" />}
              >
                Ver todos os imóveis
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

