'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Favorito } from '@/types';

/**
 * PHAROS - TABELA DE COMPARAÇÃO
 * Comparação lado a lado responsiva com pin de imóvel base
 */

interface ComparisonTableProps {
  favoritos: Favorito[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onPin?: (id: string) => void;
  pinnedId?: string;
}

export default function ComparisonTable({
  favoritos,
  onClose,
  onRemove,
  onPin,
  pinnedId,
}: ComparisonTableProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  if (favoritos.length === 0) {
    return null;
  }

  const formatarPreco = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Organizar: pinned primeiro
  const sortedFavoritos = [...favoritos].sort((a, b) => {
    if (a.id === pinnedId) return -1;
    if (b.id === pinnedId) return 1;
    return 0;
  });

  const rows = [
    {
      label: 'Imóvel',
      key: 'image',
      render: (fav: Favorito) => (
        <div className="flex flex-col gap-2">
          {fav.imovel && (
            <>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={fav.imovel.imagemCapa}
                  alt={fav.imovel.titulo}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
              <Link
                href={`/imoveis/${fav.id}`}
                className="text-sm font-bold text-pharos-navy-900 hover:text-pharos-blue-500 transition-colors line-clamp-2"
              >
                {fav.imovel.titulo}
              </Link>
            </>
          )}
        </div>
      ),
    },
    {
      label: 'Preço',
      key: 'preco',
      render: (fav: Favorito) => (
        <span className="text-lg font-bold text-pharos-blue-500">
          {fav.imovel ? formatarPreco(fav.imovel.preco) : '—'}
        </span>
      ),
    },
    {
      label: 'Área total',
      key: 'area',
      render: (fav: Favorito) => (
        <span className="text-base font-semibold text-pharos-navy-900">
          {fav.imovel ? `${fav.imovel.areaTotal} m²` : '—'}
        </span>
      ),
    },
    {
      label: 'Quartos',
      key: 'quartos',
      render: (fav: Favorito) => (
        <span className="text-base text-pharos-slate-700">
          {fav.imovel?.quartos || '—'}
        </span>
      ),
    },
    {
      label: 'Suítes',
      key: 'suites',
      render: (fav: Favorito) => (
        <span className="text-base text-pharos-slate-700">
          {fav.imovel?.suites || 0}
        </span>
      ),
    },
    {
      label: 'Vagas',
      key: 'vagas',
      render: (fav: Favorito) => (
        <span className="text-base text-pharos-slate-700">
          {fav.imovel?.vagasGaragem || 0}
        </span>
      ),
    },
    {
      label: 'Condomínio',
      key: 'condominio',
      render: (fav: Favorito) => (
        <span className="text-sm text-pharos-slate-700">
          {fav.imovel?.precoCondominio ? formatarPreco(fav.imovel.precoCondominio) : '—'}
        </span>
      ),
    },
    {
      label: 'IPTU',
      key: 'iptu',
      render: (fav: Favorito) => (
        <span className="text-sm text-pharos-slate-700">
          {fav.imovel?.iptu ? formatarPreco(fav.imovel.iptu) : '—'}
        </span>
      ),
    },
    {
      label: 'Endereço',
      key: 'endereco',
      render: (fav: Favorito) => (
        <span className="text-sm text-pharos-slate-700">
          {fav.imovel
            ? `${fav.imovel.endereco.bairro}, ${fav.imovel.endereco.cidade}`
            : '—'}
        </span>
      ),
    },
    {
      label: 'Diferenciais',
      key: 'diferenciais',
      render: (fav: Favorito) => (
        <div className="flex flex-wrap gap-1">
          {fav.imovel?.diferenciais.slice(0, 3).map((dif, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 bg-pharos-base-off text-pharos-slate-700 rounded-md"
            >
              {dif}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[900] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-6xl sm:rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pharos-slate-300">
          <div>
            <h2 className="text-xl font-bold text-pharos-navy-900">
              Comparar imóveis
            </h2>
            <p className="text-sm text-pharos-slate-500 mt-1">
              {favoritos.length} {favoritos.length === 1 ? 'imóvel selecionado' : 'imóveis selecionados'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão Exportar PDF */}
            <button
              onClick={async () => {
                try {
                  const { exportComparisonToPDF } = await import('@/utils/pdfExport');
                  await exportComparisonToPDF(favoritos);
                  
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'comparison_export_pdf', {
                      count: favoritos.length,
                    });
                  }
                } catch (error) {
                  console.error('Erro ao exportar comparação:', error);
                  alert('Erro ao gerar o PDF. Por favor, tente novamente.');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 transition-colors shadow-sm active:scale-95"
              aria-label="Exportar comparação como PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-pharos-slate-500 hover:text-pharos-slate-700 hover:bg-pharos-base-off rounded-lg transition-colors"
              aria-label="Fechar comparação"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full border-collapse">
              <thead className="bg-pharos-base-off sticky top-0 z-10">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-pharos-slate-700 border-b border-pharos-slate-300 w-48 sticky left-0 bg-pharos-base-off z-20">
                    Característica
                  </th>
                  {sortedFavoritos.map((fav) => (
                    <th
                      key={fav.id}
                      className="px-4 py-4 border-b border-pharos-slate-300 min-w-[280px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Pin button */}
                        {onPin && (
                          <button
                            onClick={() => onPin(fav.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              pinnedId === fav.id
                                ? 'bg-pharos-blue-500 text-white'
                                : 'text-pharos-slate-500 hover:bg-pharos-slate-300'
                            }`}
                            title={pinnedId === fav.id ? 'Imóvel base' : 'Fixar como base'}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 3a1 1 0 011 1v5h3a1 1 0 110 2h-3v6a1 1 0 11-2 0v-6H6a1 1 0 110-2h3V4a1 1 0 011-1z" />
                            </svg>
                          </button>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={() => onRemove(fav.id)}
                          className="p-1.5 text-pharos-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover da comparação"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={row.key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-pharos-base-off/50'}>
                    <td className="px-6 py-4 text-sm font-medium text-pharos-slate-700 border-b border-pharos-slate-300 sticky left-0 bg-inherit z-10">
                      {row.label}
                    </td>
                    {sortedFavoritos.map((fav) => (
                      <td
                        key={fav.id}
                        className={`px-4 py-4 border-b border-pharos-slate-300 ${
                          pinnedId === fav.id ? 'bg-pharos-blue-500/5' : ''
                        }`}
                      >
                        {row.render(fav)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer com ações */}
        <div className="p-6 border-t border-pharos-slate-300 flex justify-between items-center">
          <p className="text-sm text-pharos-slate-500">
            Dica: Use o ícone de pin para fixar um imóvel como base de comparação
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off transition-colors"
            >
              Fechar
            </button>
            <button
              className="px-4 py-2.5 text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 transition-colors flex items-center gap-2"
              onClick={() => {
                // Implementar exportação depois
                alert('Exportar PDF será implementado em breve');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

