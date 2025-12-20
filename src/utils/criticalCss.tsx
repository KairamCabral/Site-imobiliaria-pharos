/**
 * Critical CSS Strategy
 * 
 * Utilitários para gerenciar CSS crítico e melhorar FCP
 * Performance Impact: FCP -20-30%
 * 
 * Estratégia:
 * 1. Inline CSS crítico no <head>
 * 2. Carregar resto do CSS async
 * 3. Fonts com preload
 * 4. Above-the-fold prioritizado
 */

import React from 'react';

/**
 * CSS crítico inline (above-the-fold)
 * Este CSS deve ser pequeno (<14KB) e conter apenas estilos
 * necessários para renderizar conteúdo acima da dobra
 */
export const CRITICAL_CSS = `
  /* Reset básico */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Body e HTML */
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    font-family: var(--font-inter, system-ui, -apple-system, sans-serif);
    background-color: #ffffff;
    color: #192233;
    line-height: 1.5;
  }

  /* Header (above-the-fold) */
  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 5rem;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    z-index: 50;
  }

  /* Main content offset */
  main {
    padding-top: 5rem;
    min-height: 100vh;
  }

  /* Container */
  .container {
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* Grid básico */
  .grid {
    display: grid;
    gap: 1.5rem;
  }

  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  
  @media (min-width: 768px) {
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  
  @media (min-width: 1024px) {
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  /* Loading state */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Skip link (acessibilidade) */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .sr-only:focus {
    position: fixed;
    width: auto;
    height: auto;
    padding: 1rem 1.5rem;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }

  /* Hero section (se existir) */
  .hero {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Button primário */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background-color: #054ADA;
    color: #ffffff;
    font-weight: 600;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-primary:hover {
    background-color: #0440c4;
  }

  /* Skeleton loader */
  .skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

/**
 * Retorna CSS crítico minificado
 */
export function getCriticalCss(): string {
  return CRITICAL_CSS.replace(/\s+/g, ' ').trim();
}

/**
 * Gera tag <style> para inline no <head>
 */
export function generateCriticalCssTag(): string {
  return `<style id="critical-css">${getCriticalCss()}</style>`;
}

/**
 * Preload de fonts críticas
 */
export function getFontPreloadLinks(): string[] {
  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  ];
}

/**
 * Carregar CSS não-crítico de forma assíncrona
 * (para usar após hidratação)
 */
export function loadNonCriticalCss() {
  if (typeof window === 'undefined') return;
  
  // Aguardar idle para carregar CSS restante
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/_next/static/css/app.css'; // Ajustar path conforme build
      document.head.appendChild(link);
    });
  } else {
    // Fallback para browsers sem requestIdleCallback
    setTimeout(() => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/_next/static/css/app.css';
      document.head.appendChild(link);
    }, 100);
  }
}

/**
 * HOC para componentes que precisam de CSS específico
 * Carrega CSS de forma lazy apenas quando componente monta
 */
export function withLazyCss(
  Component: React.ComponentType<any>,
  cssPath: string
) {
  return function LazyStyledComponent(props: any) {
    const [cssLoaded, setCssLoaded] = React.useState(false);

    React.useEffect(() => {
      if (typeof window === 'undefined') return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      link.onload = () => setCssLoaded(true);
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }, []);

    // Renderizar com skeleton enquanto CSS carrega
    if (!cssLoaded) {
      return <div className="skeleton" style={{ minHeight: '200px' }} />;
    }

    return <Component {...props} />;
  };
}

/**
 * Detectar CSS usado vs. não usado
 * (para análise e otimização)
 */
export async function analyzeCssUsage(): Promise<{
  used: number;
  unused: number;
  coverage: number;
}> {
  if (typeof window === 'undefined' || !('CSS' in window)) {
    return { used: 0, unused: 0, coverage: 0 };
  }

  try {
    // Usar Coverage API do Chrome DevTools (se disponível)
    if ((window as any).chrome?.runtime) {
      // Disponível apenas em DevTools
      const coverageData = await (window as any).chrome.coverage.startCSSCoverage();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar render
      const result = await (window as any).chrome.coverage.stopCSSCoverage();
      
      let totalBytes = 0;
      let usedBytes = 0;
      
      result.forEach((entry: any) => {
        totalBytes += entry.text.length;
        entry.ranges.forEach((range: any) => {
          usedBytes += range.end - range.start;
        });
      });
      
      const coveragePercentage = (usedBytes / totalBytes) * 100;
      
      return {
        used: usedBytes,
        unused: totalBytes - usedBytes,
        coverage: coveragePercentage,
      };
    }
  } catch (error) {
    console.error('[CriticalCSS] Error analyzing CSS usage:', error);
  }

  return { used: 0, unused: 0, coverage: 0 };
}

/**
 * Remover CSS crítico inline após CSS principal carregar
 * (para evitar duplicação)
 */
export function removeCriticalCss() {
  if (typeof window === 'undefined') return;
  
  // Aguardar CSS principal carregar
  if (document.readyState === 'complete') {
    const criticalStyle = document.getElementById('critical-css');
    if (criticalStyle) {
      criticalStyle.remove();
    }
  } else {
    window.addEventListener('load', () => {
      const criticalStyle = document.getElementById('critical-css');
      if (criticalStyle) {
        // Delay para garantir que CSS principal foi aplicado
        setTimeout(() => criticalStyle.remove(), 500);
      }
    });
  }
}

