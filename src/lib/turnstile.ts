/**
 * Cloudflare Turnstile - Server-Side Verification
 * 
 * Valida tokens do Turnstile no servidor
 */

interface TurnstileResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

/**
 * Verifica o token do Turnstile com a API do Cloudflare
 * 
 * @param token - Token recebido do widget
 * @param ip - IP do cliente (opcional, mas recomendado)
 * @returns true se válido, false caso contrário
 */
export async function verifyTurnstile(
  token: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error('[Turnstile] TURNSTILE_SECRET_KEY não configurada');
    // Em desenvolvimento, permitir bypass (REMOVER EM PRODUÇÃO)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Turnstile] Bypass ativado em desenvolvimento');
      return { success: true };
    }
    return { success: false, error: 'Configuração de segurança ausente' };
  }

  if (!token) {
    return { success: false, error: 'Token ausente' };
  }

  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      console.error('[Turnstile] HTTP error:', response.status);
      return { 
        success: false, 
        error: 'Erro ao verificar com o serviço de segurança' 
      };
    }

    const data: TurnstileResponse = await response.json();

    if (!data.success) {
      const errors = data['error-codes']?.join(', ') || 'Desconhecido';
      console.warn('[Turnstile] Verificação falhou:', errors);
      return { 
        success: false, 
        error: 'Verificação de segurança falhou' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[Turnstile] Erro na verificação:', error);
    return { 
      success: false, 
      error: 'Erro ao processar verificação de segurança' 
    };
  }
}

/**
 * Middleware helper para verificar Turnstile em rotas de API
 */
export async function requireTurnstile(
  token: string | null | undefined,
  ip?: string
): Promise<{ valid: boolean; response?: Response }> {
  if (!token) {
    return {
      valid: false,
      response: Response.json(
        {
          success: false,
          error: 'Verificação de segurança ausente',
          code: 'TURNSTILE_MISSING',
        },
        { status: 400 }
      ),
    };
  }

  const result = await verifyTurnstile(token, ip);

  if (!result.success) {
    return {
      valid: false,
      response: Response.json(
        {
          success: false,
          error: result.error || 'Falha na verificação de segurança',
          code: 'TURNSTILE_FAILED',
        },
        { status: 403 }
      ),
    };
  }

  return { valid: true };
}

