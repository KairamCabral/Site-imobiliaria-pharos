/**
 * Validação e acesso centralizado a variáveis de ambiente
 * ✅ Falhas de env não derrubam o build
 */

const IS_SERVER = typeof window === 'undefined';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * Variáveis de servidor (obrigatórias em produção)
 */
export const VISTA_BASE_URL = process.env.VISTA_BASE_URL || '';
export const VISTA_API_KEY = process.env.VISTA_API_KEY || '';

/**
 * Variáveis públicas (opcionais)
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3600';

/**
 * Valida envs críticos (apenas em servidor e produção)
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // ✅ Durante build, apenas avisar (não derrubar)
  if (IS_BUILD) {
    if (!VISTA_API_KEY) {
      console.warn('[ENV] ⚠️  VISTA_API_KEY não configurada. SSG de imóveis pode falhar.');
    }
    return { valid: true, errors };
  }

  // Em runtime de produção, validar envs críticos
  if (IS_SERVER && IS_PRODUCTION) {
    if (!VISTA_BASE_URL) {
      errors.push('VISTA_BASE_URL não configurada');
    }
    if (!VISTA_API_KEY) {
      errors.push('VISTA_API_KEY não configurada');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log de diagnóstico (apenas em dev/build)
 */
if (!IS_PRODUCTION || IS_BUILD) {
  const status = validateEnv();
  if (!status.valid) {
    console.warn('[ENV] ⚠️  Variáveis faltando:', status.errors);
  }
}
