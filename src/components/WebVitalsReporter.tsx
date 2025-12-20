'use client';

/**
 * WebVitalsReporter Component
 * 
 * Componente client-side que inicializa o monitoramento de Web Vitals
 * Deve ser incluído no layout root
 */

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/analytics/webVitals';

export default function WebVitalsReporter() {
  useEffect(() => {
    // Inicializar monitoramento de Web Vitals
    reportWebVitals();
  }, []);

  // Componente invisível, apenas reporta métricas
  return null;
}

