/**
 * Schedule Visit API Endpoint
 * 
 * Endpoint SEGURO para agendamentos de visitas
 * 
 * Segurança implementada:
 * - Rate limiting (3 requisições por 15 min por IP)
 * - Validação com Zod
 * - Sanitização de inputs
 * - Cloudflare Turnstile (anti-bot)
 * - Honeypot fields
 * - Logging seguro
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getC2SLeadProvider } from '@/providers/c2s/C2SLeadProvider';
import { getLeadService } from '@/services';
import { loadC2SFeatureFlags, createLog, createErrorLog } from '@/providers/c2s/utils';
import { scheduleVisitSchema, formatZodErrors } from '@/lib/validators';
import { strictLimiter, getClientIp, rateLimitExceededResponse } from '@/lib/ratelimit';
import { requireTurnstile } from '@/lib/turnstile';
import { logger, createTimer } from '@/lib/logger';
import type { LeadInput } from '@/domain/models';

export const dynamic = 'force-dynamic';

/**
 * POST: Agendar visita
 */
export async function POST(request: NextRequest) {
  const timer = createTimer();
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // ========================================
    // 1. RATE LIMITING (mais restritivo que leads)
    // ========================================
    try {
      await strictLimiter.check(3, `schedule:${ip}`); // 3 requisições por 15 min
    } catch {
      logger.security('Rate limit exceeded', { 
        ip, 
        userAgent, 
        endpoint: '/api/schedule-visit' 
      });
      return rateLimitExceededResponse(900);
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
      logger.security('Honeypot triggered on schedule', { ip, userAgent });
      return NextResponse.json({ success: true, leadId: 'fake' }, { status: 200 });
    }

    // ========================================
    // 4. CLOUDFLARE TURNSTILE
    // ========================================
    const turnstileResult = await requireTurnstile(body.turnstileToken, ip);
    if (!turnstileResult.valid) {
      logger.security('Turnstile verification failed on schedule', { ip, userAgent });
      return turnstileResult.response!;
    }

    // ========================================
    // 5. VALIDAÇÃO COM ZOD
    // ========================================
    let validatedData;
    try {
      validatedData = scheduleVisitSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Schedule validation failed', { 
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
    // 6. CRIAR LEAD E AGENDAR VISITA
    // ========================================

    // Monta data/hora ISO
    const scheduledDateTime = `${validatedData.date}T${validatedData.time}:00.000Z`;

    const leadService = getLeadService();
    
    const visitTypeLabel = validatedData.type === 'in_person' ? 'presencial' : 'por vídeo';
    const videoProviderLabel = validatedData.videoProvider === 'whatsapp' ? 'WhatsApp' : 'Google Meet';
    
    let message = `Agendamento de visita ${visitTypeLabel} para o imóvel ${validatedData.propertyCode || validatedData.propertyId}.\n`;
    message += `Data: ${validatedData.date} às ${validatedData.time}`;
    
    if (validatedData.type === 'video') {
      message += `\nPlataforma: ${videoProviderLabel}`;
    }
    
    if (validatedData.notes) {
      message += `\n\nObservações: ${validatedData.notes}`;
    }

    const leadInput: LeadInput = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      message,
      subject: `Agendamento de visita - ${validatedData.propertyCode || validatedData.propertyId}`,
      propertyId: validatedData.propertyId,
      propertyCode: validatedData.propertyCode,
      intent: 'buy',
      source: 'site',
      utm: validatedData.utms,
      referralUrl: validatedData.referralUrl || request.headers.get('referer') || undefined,
      userAgent: userAgent,
      metadata: {
        visitType: validatedData.type,
        videoProvider: validatedData.videoProvider,
        scheduledDate: validatedData.date,
        scheduledTime: validatedData.time,
        scheduledDateTime,
        timezone: validatedData.timezone,
        realtorId: validatedData.realtorId,
        realtorName: validatedData.realtorName,
        propertyTitle: validatedData.propertyTitle,
        propertyAddress: validatedData.propertyAddress,
      },
    };

    const leadResult = await leadService.createLead(leadInput);

    if (!leadResult.success) {
      logger.warn('Visit schedule failed - lead creation', {
        error: leadResult.message,
        propertyId: validatedData.propertyId,
      });
      return NextResponse.json(
        {
          success: false,
          error: leadResult.message || 'Erro ao criar lead',
          errors: leadResult.errors,
        },
        { status: 400 }
      );
    }

    logger.info('Visit scheduled successfully', {
      leadId: leadResult.leadId,
      propertyCode: validatedData.propertyCode,
      visitType: validatedData.type,
      scheduledDate: validatedData.date,
    });

    // Integração com C2S (se habilitado)
    const featureFlags = loadC2SFeatureFlags();
    let c2sResult = null;

    if (featureFlags.enabled && featureFlags.visitIntegration && leadResult.leadId) {
      try {
        const c2sProvider = getC2SLeadProvider();

        // Cria atividade de visita no C2S
        c2sResult = await c2sProvider.createVisitActivity(
          leadResult.leadId,
          {
            scheduledDate: scheduledDateTime,
            propertyCode: validatedData.propertyCode,
            sellerId: validatedData.realtorId,
            notes: `Visita ${visitTypeLabel}${validatedData.type === 'video' ? ` via ${videoProviderLabel}` : ''}${validatedData.notes ? `: ${validatedData.notes}` : ''}`,
          }
        );

        createLog('schedule_visit:c2s_integration', {
          leadId: leadResult.leadId,
          propertyCode: validatedData.propertyCode,
          scheduledDate: scheduledDateTime,
          c2sSuccess: c2sResult?.success,
        });
      } catch (error) {
        createErrorLog('schedule_visit:c2s_integration', error, {
          leadId: leadResult.leadId,
        });
        // Não bloqueia o fluxo se C2S falhar
      }
    }

    createLog('schedule_visit:success', {
      propertyId: validatedData.propertyId,
      propertyCode: validatedData.propertyCode,
      visitType: validatedData.type,
      scheduledDate: validatedData.date,
      leadId: leadResult.leadId,
      c2sIntegrated: !!c2sResult?.success,
    });

    timer.stop('schedule_visit');

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      leadId: leadResult.leadId,
      message: 'Visita agendada com sucesso',
      appointment: {
        type: validatedData.type,
        date: validatedData.date,
        time: validatedData.time,
        videoProvider: validatedData.videoProvider,
        propertyTitle: validatedData.propertyTitle,
        propertyAddress: validatedData.propertyAddress,
      },
      c2sIntegration: featureFlags.enabled && featureFlags.visitIntegration ? {
        enabled: true,
        success: c2sResult?.success || false,
      } : {
        enabled: false,
      },
    });
  } catch (error: any) {
    logger.error('Unexpected error in /api/schedule-visit', error, { ip, userAgent });
    createErrorLog('schedule_visit', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar agendamento. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Verifica disponibilidade (placeholder)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');

  if (!propertyId) {
    return NextResponse.json(
      {
        success: false,
        error: 'propertyId é obrigatório',
      },
      { status: 400 }
    );
  }

  // TODO: Implementar busca real de disponibilidade
  // Por enquanto, retorna horários mock
  
  const availability = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Disponibilidade mock (dias úteis apenas)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      availability.push({
        date: date.toISOString().split('T')[0],
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
      });
    }
  }

  return NextResponse.json({
    success: true,
    propertyId,
    availability,
  });
}

