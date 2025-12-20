/**
 * Privacy Notice - Aviso de Privacidade Implícito
 * Componente discreto no rodapé informando sobre cookies
 */

'use client';

import Link from 'next/link';

export default function PrivacyNotice() {
  return (
    <div className="bg-pharos-navy-50 border-t border-pharos-navy-100">
      <div className="container mx-auto px-4 py-3">
        <p className="text-xs text-pharos-slate-600 text-center">
          Ao utilizar este site, você concorda com o uso de cookies para melhorar sua experiência e análise de tráfego.{' '}
          <Link 
            href="/politica-privacidade" 
            className="text-pharos-blue-600 hover:text-pharos-blue-700 underline font-medium"
          >
            Política de Privacidade
          </Link>
          {' • '}
          <Link 
            href="/politica-cookies" 
            className="text-pharos-blue-600 hover:text-pharos-blue-700 underline font-medium"
          >
            Política de Cookies
          </Link>
        </p>
      </div>
    </div>
  );
}

