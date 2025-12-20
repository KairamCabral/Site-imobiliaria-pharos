/**
 * Secure Logger - Imobiliária Pharos
 * 
 * Sistema de logging que:
 * - Sanitiza dados sensíveis automaticamente
 * - Diferencia ambientes (dev vs prod)
 * - Prepara integração com serviços externos (Sentry, DataDog)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  environment: string;
  service: string;
}

class SecureLogger {
  private serviceName = 'imobiliaria-pharos';
  
  /**
   * Campos que devem ser redacted por conter informações sensíveis
   */
  private sensitiveFields = [
    'password',
    'senha',
    'token',
    'apikey',
    'api_key',
    'secret',
    'authorization',
    'cookie',
    'cpf',
    'rg',
    'creditcard',
    'credit_card',
    'cvv',
    'ssn',
    'passport',
    'auth',
    'bearer',
    'key',
    'private',
  ];

  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Sanitiza recursivamente objetos removendo dados sensíveis
   */
  private sanitize(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Strings
    if (typeof data === 'string') {
      // Mascara emails parcialmente
      if (data.includes('@')) {
        return this.maskEmail(data);
      }
      return data;
    }

    // Arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    // Objetos
    if (typeof data === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = this.sensitiveFields.some(field =>
          lowerKey.includes(field)
        );

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else if (key === 'email' && typeof value === 'string') {
          sanitized[key] = this.maskEmail(value);
        } else if (key === 'phone' && typeof value === 'string') {
          sanitized[key] = this.maskPhone(value);
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized;
    }

    return data;
  }

  /**
   * Mascara email: teste@exemplo.com → t***e@exemplo.com
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }

  /**
   * Mascara telefone: +5547991234567 → +5547****4567
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 8) return phone;
    
    const visible = 4;
    const hidden = phone.length - (visible * 2);
    const start = phone.slice(0, visible);
    const end = phone.slice(-visible);
    
    return `${start}${'*'.repeat(Math.max(hidden, 4))}${end}`;
  }

  /**
   * Formata stack trace de erro removendo paths absolutos
   */
  private sanitizeStack(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    // Em produção, remove paths completos
    if (this.isProduction) {
      return stack
        .split('\n')
        .map(line => {
          // Remove paths absolutos do sistema
          return line.replace(/\([^)]*\/([^/)]+)\)/g, '($1)');
        })
        .slice(0, 5) // Apenas primeiras 5 linhas
        .join('\n');
    }
    
    return stack;
  }

  /**
   * Log genérico
   */
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? this.sanitize(context) : {};

    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context: sanitizedContext,
      environment: process.env.NODE_ENV || 'development',
      service: this.serviceName,
    };

    // Em produção, enviar para serviço externo
    if (this.isProduction) {
      this.sendToExternalService(logEntry);
    }

    // Console apenas em desenvolvimento ou para erros
    if (this.isDevelopment || level === 'error') {
      this.logToConsole(level, message, sanitizedContext);
    }
  }

  /**
   * Envia logs para serviço externo (Sentry, DataDog, etc)
   */
  private sendToExternalService(entry: LogEntry) {
    // TODO: Integrar com Sentry ou similar
    // Exemplo com Sentry:
    // if (entry.level === 'error') {
    //   Sentry.captureMessage(entry.message, {
    //     level: 'error',
    //     extra: entry.context,
    //   });
    // }
    
    // Por enquanto, apenas estrutura o log
    // Em produção real, remover este console.log
    if (entry.level === 'error') {
      console.error('[PROD LOG]', JSON.stringify(entry));
    }
  }

  /**
   * Log no console com formatação
   */
  private logToConsole(level: LogLevel, message: string, context?: Record<string, any>) {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';

    const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    const color = colors[level];
    const prefix = `${color}[${level.toUpperCase()}]${reset}`;

    if (context && Object.keys(context).length > 0) {
      console[method](prefix, message, context);
    } else {
      console[method](prefix, message);
    }
  }

  /**
   * Log DEBUG
   */
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  /**
   * Log INFO
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  /**
   * Log WARN
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  /**
   * Log ERROR
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
    };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: this.sanitizeStack(error.stack),
      };
    } else if (error) {
      errorContext.error = String(error);
    }

    this.log('error', message, errorContext);
  }

  /**
   * Log de evento de segurança (tentativas suspeitas)
   */
  security(event: string, details: LogContext) {
    this.warn(`[SECURITY] ${event}`, details);
  }

  /**
   * Log de performance (tempo de execução)
   */
  performance(operation: string, durationMs: number, context?: LogContext) {
    this.info(`[PERF] ${operation} completed in ${durationMs}ms`, context);
  }
}

/**
 * Instância singleton do logger
 */
export const logger = new SecureLogger();

/**
 * Helper: Timer para medir performance
 */
export function createTimer() {
  const start = Date.now();
  
  return {
    stop: (operation: string, context?: LogContext) => {
      const duration = Date.now() - start;
      logger.performance(operation, duration, context);
      return duration;
    },
  };
}

