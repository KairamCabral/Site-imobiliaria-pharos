/**
 * Lead Queue Management API
 * 
 * Endpoint para gerenciar e monitorar a fila de retry de leads
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLeadQueue } from '@/providers/c2s/LeadQueue';
import { loadC2SFeatureFlags, createLog } from '@/providers/c2s/utils';

export const dynamic = 'force-dynamic';

/**
 * GET: Retorna estatísticas e conteúdo da fila
 */
export async function GET(request: NextRequest) {
  try {
    const featureFlags = loadC2SFeatureFlags();

    if (!featureFlags.enabled) {
      return NextResponse.json(
        {
          success: false,
          message: 'Integração C2S desabilitada',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';

    const queue = getLeadQueue();
    const stats = queue.getStats();

    const response: any = {
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    };

    if (includeDetails) {
      const allQueued = queue.getAllQueued();
      response.leads = allQueued.map(lead => ({
        id: lead.id,
        leadName: lead.lead.name,
        propertyCode: lead.lead.propertyCode,
        attempts: lead.attempts,
        maxAttempts: lead.maxAttempts,
        lastAttempt: lead.lastAttempt,
        createdAt: lead.createdAt,
        error: lead.error,
      }));
    }

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar fila',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Processa fila manualmente ou executa ações
 */
export async function POST(request: NextRequest) {
  try {
    const featureFlags = loadC2SFeatureFlags();

    if (!featureFlags.enabled) {
      return NextResponse.json(
        {
          success: false,
          message: 'Integração C2S desabilitada',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, leadId } = body;

    const queue = getLeadQueue();

    switch (action) {
      case 'process':
        // Processa fila manualmente
        await queue.processQueue();
        
        createLog('queue:manual_process', {
          queueSize: queue.getStats().total,
        });

        return NextResponse.json({
          success: true,
          message: 'Fila processada com sucesso',
          stats: queue.getStats(),
        });

      case 'remove':
        // Remove lead específico da fila
        if (!leadId) {
          return NextResponse.json(
            {
              success: false,
              error: 'leadId é obrigatório para remoção',
            },
            { status: 400 }
          );
        }

        const removed = queue.removeFromQueue(leadId);

        if (!removed) {
          return NextResponse.json(
            {
              success: false,
              error: 'Lead não encontrado na fila',
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Lead removido da fila',
          leadId,
        });

      case 'clear_maxed':
        // Limpa leads que excederam max attempts
        const cleared = queue.clearMaxedLeads();

        return NextResponse.json({
          success: true,
          message: `${cleared} leads removidos`,
          clearedCount: cleared,
        });

      case 'clear_all':
        // Limpa toda a fila (cuidado!)
        queue.clearAll();

        return NextResponse.json({
          success: true,
          message: 'Fila completamente limpa',
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Ação desconhecida: ${action}`,
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar ação na fila',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

