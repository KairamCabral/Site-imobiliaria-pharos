/**
 * API Route: /api/leads
 * 
 * Endpoint SEGURO para criação de leads
 * 
 * Segurança implementada:
 * - Rate limiting (5 requisições por 15 min por IP)
 * - Validação com Zod
 * - Sanitização de inputs
 * - Cloudflare Turnstile (anti-bot)
 * - Honeypot fields
 * - Logging seguro
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getLeadService } from '@/services';
import { leadSchema, formatZodErrors } from '@/lib/validators';
import { strictLimiter, getClientIp, rateLimitExceededResponse } from '@/lib/ratelimit';
import { requireTurnstile } from '@/lib/turnstile';
import { logger, createTimer } from '@/lib/logger';
import type { LeadInput } from '@/domain/models';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const timer = createTimer();
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // ========================================
    // 1. RATE LIMITING
    // ========================================
    try {
      await strictLimiter.check(5, ip); // 5 requisições por 15 min
    } catch {
      logger.security('Rate limit exceeded', { ip, userAgent, endpoint: '/api/leads' });
      return rateLimitExceededResponse(900); // 15 min
    }

    // ========================================
    // 2. PARSE BODY
    // ========================================
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'JSON inválido' },
        { status: 400 }
      );
    }

    // ========================================
    // 3. HONEYPOT CHECK
    // ========================================
    if (body.website || body.company) {
      logger.security('Honeypot triggered', { 
        ip, 
        userAgent,
        honeypotFields: {
          website: !!body.website,
          company: !!body.company,
        }
      });
      // Finge sucesso para não alertar bot
      return NextResponse.json({ success: true, leadId: 'fake' }, { status: 200 });
    }

    // ========================================
    // 4. CLOUDFLARE TURNSTILE (bypass para formulários internos)
    // ========================================
    const skipTurnstile = body.metadata?.formType === 'venda-com-pharos';
    
    if (!skipTurnstile) {
      const turnstileResult = await requireTurnstile(body.turnstileToken, ip);
      if (!turnstileResult.valid) {
        logger.security('Turnstile verification failed', { ip, userAgent });
        return turnstileResult.response!;
      }
    }

    // ========================================
    // 5. VALIDAÇÃO COM ZOD
    // ========================================
    let validatedData;
    try {
      validatedData = leadSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Lead validation failed', { 
          ip, 
          errors: formatZodErrors(error) 
        });
        return NextResponse.json(
          {
            success: false,
            error: 'Dados inválidos',
            details: formatZodErrors(error),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // ========================================
    // 6. CRIAR LEAD
    // ========================================
    const lead: LeadInput = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      message: validatedData.message,
      subject: validatedData.subject,
      propertyId: validatedData.propertyId,
      propertyCode: validatedData.propertyCode,
      intent: validatedData.intent as LeadInput['intent'],
      source: (validatedData.source || 'site') as LeadInput['source'],
      utm: validatedData.utm,
      referralUrl: validatedData.referralUrl || request.headers.get('referer') || undefined,
      userAgent: validatedData.userAgent || userAgent,
      acceptsMarketing: validatedData.acceptsMarketing,
      acceptsWhatsapp: validatedData.acceptsWhatsapp,
      metadata: validatedData.metadata,
    };

    const leadService = getLeadService();
    const result = await leadService.createLead(lead);

    if (result.success) {
      logger.info('Lead created successfully', { 
        leadId: result.leadId,
        propertyCode: lead.propertyCode,
        intent: lead.intent,
      });
      
      timer.stop('create_lead');

      return NextResponse.json({
        success: true,
        data: result,
        message: result.message || 'Lead criado com sucesso',
      });
    } else {
      logger.warn('Lead creation failed', {
        error: result.message,
        errors: result.errors,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Erro ao criar lead',
          errors: result.errors,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    logger.error('Unexpected error in /api/leads', error, { ip, userAgent });

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar solicitação. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

