/**
 * Sistema de Logger Condicional
 * Desabilita logs em produção para melhor performance
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_SERVER = typeof window === 'undefined';
const LOG_LEVEL = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'warn') as LogLevel;

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  // Em produção, só logs de warn+ (a menos que overridden)
  if (!IS_DEV) {
    return LEVELS[level] >= LEVELS[LOG_LEVEL];
  }
  return true;
}

export const logger = {
  /**
   * Debug logs - apenas em desenvolvimento
   */
  debug: (context: string, message: string, data?: any) => {
    if (!shouldLog('debug')) return;
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [${context}] ${message}`, data !== undefined ? data : '');
  },

  /**
   * Info logs - informações gerais
   */
  info: (context: string, message: string, data?: any) => {
    if (!shouldLog('info')) return;
    const timestamp = new Date().toISOString();
    console.log(`ℹ️  [${timestamp}] [${context}] ${message}`, data !== undefined ? data : '');
  },

  /**
   * Warning logs - alertas importantes
   */
  warn: (context: string, message: string, data?: any) => {
    if (!shouldLog('warn')) return;
    const timestamp = new Date().toISOString();
    console.warn(`⚠️  [${timestamp}] [${context}] ${message}`, data !== undefined ? data : '');
  },

  /**
   * Error logs - sempre logados
   */
  error: (context: string, message: string, error?: any) => {
    if (!shouldLog('error')) return;
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] [${context}] ${message}`, error !== undefined ? error : '');
  },

  /**
   * Server-side only logs
   */
  server: (message: string, data?: any) => {
    if (!IS_SERVER || !IS_DEV) return;
    const timestamp = new Date().toISOString();
    console.log(`🖥️  [${timestamp}] [Server] ${message}`, data !== undefined ? data : '');
  },

  /**
   * Performance timing (development only)
   */
  time: (label: string) => {
    if (!IS_DEV) return;
    console.time(`⏱️  ${label}`);
  },

  /**
   * Performance timing end (development only)
   */
  timeEnd: (label: string) => {
    if (!IS_DEV) return;
    console.timeEnd(`⏱️  ${label}`);
  },

  /**
   * Group logs (development only)
   */
  group: (label: string) => {
    if (!IS_DEV) return;
    console.group(`📦 ${label}`);
  },

  groupEnd: () => {
    if (!IS_DEV) return;
    console.groupEnd();
  },
};

/**
 * Wrapper para console.log direto (usar apenas em desenvolvimento)
 */
export const devLog = (...args: any[]) => {
  if (IS_DEV) console.log(...args);
};

/**
 * Wrapper para console direto no servidor (desenvolvimento)
 */
export const serverLog = (...args: any[]) => {
  if (IS_SERVER && IS_DEV) console.log('🖥️ ', ...args);
};
