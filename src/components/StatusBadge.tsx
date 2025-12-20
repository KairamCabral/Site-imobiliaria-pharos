import React from 'react';
import { traduzirStatus } from '@/utils/seo';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Cores com contraste máximo para acessibilidade WCAG AAA
  const statusStyles = {
    'pre-lancamento': 'bg-purple-700 text-white shadow-lg border-2 border-purple-900',
    'lancamento': 'bg-amber-600 text-white shadow-lg border-2 border-amber-800',
    'em-construcao': 'bg-blue-700 text-white shadow-lg border-2 border-blue-900',
    'pronto': 'bg-green-700 text-white shadow-lg border-2 border-green-900',
    'entregue': 'bg-gray-800 text-white shadow-lg border-2 border-gray-950',
  };

  const statusClass = statusStyles[status as keyof typeof statusStyles] || statusStyles.entregue;

  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-extrabold backdrop-blur-sm ${statusClass} ${className}`}
      role="status"
      aria-label={`Status: ${traduzirStatus(status)}`}
    >
      {traduzirStatus(status)}
    </span>
  );
};

