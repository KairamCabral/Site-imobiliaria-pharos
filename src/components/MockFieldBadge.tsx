'use client';

import { useEffect } from 'react';

/**
 * PHAROS - Mock Field Badge
 * 
 * Componente para exibir campos mockados em vermelho quando não encontrados no Vista CRM
 * Usado apenas para campos globalmente ausentes
 */

interface MockFieldBadgeProps {
  field: string;
  value?: string | number;
  inline?: boolean;
  propertyId?: string;
}

export default function MockFieldBadge({
  field,
  value,
  inline = false,
  propertyId,
}: MockFieldBadgeProps) {
  // Logar evento de campo mockado
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mock_field_rendered', {
        field,
        property_id: propertyId,
        has_value: !!value,
      });
    }
  }, [field, propertyId, value]);

  if (inline) {
    return (
      <span
        className="text-pharos-error"
        data-mock="true"
        aria-label="dado-mockado"
        title={`Campo "${field}" não disponível no Vista CRM`}
      >
        • (mock) {value || 'N/D'}
      </span>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 text-pharos-error text-sm"
      data-mock="true"
      aria-label="dado-mockado"
      title={`Campo "${field}" não disponível no Vista CRM`}
    >
      <span className="w-1.5 h-1.5 bg-pharos-error rounded-full"></span>
      <span className="font-medium">(mock) {value || 'N/D'}</span>
    </div>
  );
}

/**
 * Hook auxiliar para verificar se um campo deve ser mockado
 * IMPORTANTE: Só considera mock quando o valor é undefined ou null
 * Valores como 0, false, '' são considerados válidos da API
 */
export function useMockField(value: any): boolean {
  // Só mostra mock se for undefined ou null (campo não retornado pela API)
  return value === undefined || value === null;
}

