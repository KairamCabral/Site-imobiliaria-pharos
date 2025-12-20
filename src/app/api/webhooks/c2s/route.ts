/**
 * Contact2Sale Webhooks Endpoint
 * 
 * Recebe notificações de eventos do C2S:
 * - on_create_lead: Novo lead criado
 * - on_update_lead: Lead atualizado
 * - on_close_lead: Negócio fechado
 * 
 * @see https://api.contact2sale.com/docs/api#webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import type { C2SWebhookPayload, C2SNormalizedLead } from '@/providers/c2s/types';
import { createLog, createErrorLog, normalizeC2SWebhookPayload } from '@/providers/c2s/utils';

export const dynamic = 'force-dynamic';

/**
 * Valida assinatura HMAC do webhook
 */
function validateWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    createErrorLog('validateWebhookSignature', error);
    return false;
  }
}

/**
 * Processa evento de criação de lead
 */
async function handleLeadCreated(data: C2SNormalizedLead): Promise<void> {
  createLog('webhook:on_create_lead', {
    leadId: data.id,
    customer: data.customer.name,
    source: data.lead_source?.name,
  });

  // Aqui você pode:
  // 1. Salvar lead localmente para sincronização
  // 2. Atualizar cache
  // 3. Enviar notificação interna (email, Slack, etc.)
  // 4. Acionar automações
  
  // Exemplo: Log estruturado para analytics
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // Em produção, enviar para sistema de analytics/logging
    console.log(JSON.stringify({
      event: 'c2s_lead_created',
      leadId: data.id,
      customerName: data.customer.name,
      source: data.lead_source?.name,
      timestamp: new Date().toISOString(),
    }));
  }
}

/**
 * Processa evento de atualização de lead
 */
async function handleLeadUpdated(data: C2SNormalizedLead): Promise<void> {
  createLog('webhook:on_update_lead', {
    leadId: data.id,
    customer: data.customer.name,
    status: data.lead_status.alias,
    funnelStatus: data.funnel_status?.alias,
  });

  // Aqui você pode:
  // 1. Atualizar cache local do lead
  // 2. Sincronizar status com sistema interno
  // 3. Notificar equipe sobre mudanças importantes
  // 4. Acionar workflows baseados em status
  
  // Exemplo: Notificação se lead passou para negociação
  if (data.lead_status.alias === 'em_negociacao') {
    createLog('lead_in_negotiation', {
      leadId: data.id,
      customer: data.customer.name,
    });
    
    // TODO: Enviar notificação push/email para corretor responsável
  }
}

/**
 * Processa evento de negócio fechado
 */
async function handleLeadClosed(data: C2SNormalizedLead): Promise<void> {
  createLog('webhook:on_close_lead', {
    leadId: data.id,
    customer: data.customer.name,
    status: data.lead_status.alias,
  });

  // Aqui você pode:
  // 1. Registrar venda no sistema interno
  // 2. Atualizar métricas de conversão
  // 3. Enviar parabenização ao corretor
  // 4. Acionar processo pós-venda
  // 5. Atualizar dashboards em tempo real
  
  // Exemplo: Métricas de conversão
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({
      event: 'c2s_deal_closed',
      leadId: data.id,
      customerName: data.customer.name,
      sellerId: data.seller?.id,
      propertyCode: data.product?.license_plate,
      timestamp: new Date().toISOString(),
    }));
  }

  // TODO: Integrar com sistema de métricas/analytics
  // TODO: Atualizar status do imóvel se necessário
}

/**
 * Handler principal do webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Lê o corpo da requisição
    const rawBody = await request.text();
    const webhookSecret = process.env.C2S_WEBHOOK_SECRET;

    // Validação de segurança (HMAC)
    if (webhookSecret && process.env.C2S_WEBHOOKS_ENABLED === 'true') {
      const signature = request.headers.get('x-c2s-signature');
      
      if (!validateWebhookSignature(rawBody, signature, webhookSecret)) {
        createErrorLog('webhook', new Error('Invalid signature'), {
          signature,
          hasSecret: !!webhookSecret,
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Invalid webhook signature',
          },
          { status: 401 }
        );
      }
    }

    // Parse do payload
    const payload: unknown = JSON.parse(rawBody);

    // Validação básica da estrutura do payload
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid webhook payload structure',
        },
        { status: 400 }
      );
    }

    const webhookPayload = payload as Record<string, unknown>;

    if (!webhookPayload.hook_action || typeof webhookPayload.hook_action !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid hook_action',
        },
        { status: 400 }
      );
    }

    if (!webhookPayload.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing data in webhook payload',
        },
        { status: 400 }
      );
    }

    // Normaliza o payload do lead
    const normalizedLead = normalizeC2SWebhookPayload(webhookPayload.data);

    if (!normalizedLead) {
      createErrorLog('webhook', new Error('Failed to normalize webhook payload'), {
        hook_action: webhookPayload.hook_action,
        data: JSON.stringify(webhookPayload.data),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid lead data structure',
        },
        { status: 400 }
      );
    }

    // Processa evento baseado no tipo
    const hookAction = webhookPayload.hook_action as string;

    switch (hookAction) {
      case 'on_create_lead':
        await handleLeadCreated(normalizedLead);
        break;

      case 'on_update_lead':
        await handleLeadUpdated(normalizedLead);
        break;

      case 'on_close_lead':
        await handleLeadClosed(normalizedLead);
        break;

      default:
        createLog('webhook:unknown_action', { action: hookAction });
        return NextResponse.json(
          {
            success: false,
            error: `Unknown hook action: ${hookAction}`,
          },
          { status: 400 }
        );
    }

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      action: hookAction,
    });
  } catch (error: any) {
    createErrorLog('webhook', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Handler GET para verificação
 */
export async function GET() {
  return NextResponse.json({
    service: 'Contact2Sale Webhooks',
    status: 'active',
    enabled: process.env.C2S_WEBHOOKS_ENABLED === 'true',
    timestamp: new Date().toISOString(),
  });
}

