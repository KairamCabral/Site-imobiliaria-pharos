'use client';

/**
 * Global Error Boundary
 * 
 * Captura erros CRÍTICOS que acontecem:
 * - No root layout
 * - Em _app ou _document
 * - Antes do React hidratar
 * 
 * Este é o último recurso - se chegar aqui, algo MUITO errado aconteceu
 */

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log crítico
    console.error('[CRITICAL] Global Error Boundary:', error);
    
    // Enviar para Sentry com prioridade máxima
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        level: 'fatal', // Prioridade máxima
        tags: {
          errorBoundary: 'global',
          critical: true,
          digest: error.digest,
        },
      });
    }
    
    // Tentar enviar para endpoint de alertas (se existir)
    if (process.env.NEXT_PUBLIC_ALERT_WEBHOOK) {
      fetch(process.env.NEXT_PUBLIC_ALERT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CRITICAL_ERROR',
          error: error.message,
          stack: error.stack,
          digest: error.digest,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Ignorar falhas (já estamos em estado crítico)
      });
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Erro Crítico | Pharos</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            text-align: center;
          }
          .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
          }
          p {
            font-size: 18px;
            line-height: 1.6;
            opacity: 0.9;
            margin-bottom: 32px;
          }
          .actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
          }
          button, a {
            padding: 12px 32px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-block;
          }
          .btn-primary {
            background: white;
            color: #667eea;
            border: none;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid white;
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .details {
            margin-top: 40px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            text-align: left;
            font-size: 12px;
            font-family: monospace;
            max-height: 200px;
            overflow: auto;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1>Erro Crítico</h1>
          
          <p>
            Desculpe, ocorreu um erro grave que impediu o site de carregar corretamente.
            Nossa equipe técnica foi notificada automaticamente.
          </p>
          
          <div className="actions">
            <button 
              className="btn-primary" 
              onClick={() => {
                // Forçar reload completo (limpar cache)
                window.location.href = window.location.origin;
              }}
            >
              Recarregar Página
            </button>
            
            <a 
              href="/" 
              className="btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                reset();
              }}
            >
              Tentar Recuperar
            </a>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="details">
              <strong>Erro:</strong> {error.message}
              <br /><br />
              {error.digest && (
                <>
                  <strong>Digest:</strong> {error.digest}
                  <br /><br />
                </>
              )}
              <strong>Stack:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {error.stack}
              </pre>
            </div>
          )}
          
          <p style={{ marginTop: '40px', fontSize: '14px', opacity: '0.7' }}>
            Se o problema persistir, entre em contato: contato@pharos.imob.br
          </p>
        </div>
      </body>
    </html>
  );
}

