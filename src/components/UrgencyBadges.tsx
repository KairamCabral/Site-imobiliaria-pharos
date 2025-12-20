'use client';

import React from 'react';
import { Eye, Clock, TrendingUp } from 'lucide-react';

interface UrgencyBadgesProps {
  visualizacoes?: number;
  updatedAt?: string;
  destaque?: boolean;
  lancamento?: boolean;
  exclusivo?: boolean;
}

export default function UrgencyBadges({
  visualizacoes,
  updatedAt,
  destaque,
  lancamento,
  exclusivo,
}: UrgencyBadgesProps) {
  // Calcular tempo desde última atualização
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Atualizado agora';
    if (diffHours < 24) return `Atualizado há ${diffHours}h`;
    if (diffDays < 7) return `Atualizado há ${diffDays} dias`;
    return null;
  };

  const timeAgo = getTimeAgo(updatedAt);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Badge Exclusivo */}
      {exclusivo && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A968] text-white rounded-full text-xs font-bold uppercase tracking-wide">
          <TrendingUp className="w-3.5 h-3.5" />
          Exclusivo
        </span>
      )}

      {/* Badge Lançamento */}
      {lancamento && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#054ADA] text-white rounded-full text-xs font-bold uppercase tracking-wide animate-pulse">
          Lançamento
        </span>
      )}

      {/* Badge Destaque */}
      {destaque && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5A524] text-white rounded-full text-xs font-bold uppercase tracking-wide">
          Destaque
        </span>
      )}

      {/* Visualizações */}
      {visualizacoes && visualizacoes > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F9FC] border border-[#E8ECF2] text-[#192233] rounded-full text-xs font-medium">
          <Eye className="w-3.5 h-3.5 text-[#8E99AB]" />
          {visualizacoes.toLocaleString('pt-BR')} visualizações
        </span>
      )}

      {/* Última Atualização */}
      {timeAgo && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4F4E2] border border-[#2FBF71] text-[#2FBF71] rounded-full text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo}
        </span>
      )}
    </div>
  );
}

