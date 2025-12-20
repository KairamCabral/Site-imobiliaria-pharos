/**
 * Contact2Sale Statistics and Monitoring Dashboard
 * 
 * Endpoint para métricas e estatísticas da integração C2S
 */

import { NextRequest, NextResponse } from 'next/server';
import { getC2SClient } from '@/providers/c2s/C2SClient';
import { getC2SLeadProvider } from '@/providers/c2s/C2SLeadProvider';
import { loadC2SFeatureFlags, createLog, createErrorLog } from '@/providers/c2s/utils';

export const dynamic = 'force-dynamic';

/**
 * GET: Retorna estatísticas da integração C2S
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

    // Busca parâmetros da requisição
    const body = await request.json().catch(() => ({}));
    const { 
      startDate,
      endDate,
      includeLeads = false,
    } = body;

    const stats: any = {
      timestamp: new Date().toISOString(),
      integration: {
        enabled: featureFlags.enabled,
        features: featureFlags,
      },
    };

    // 1. Health Check
    const client = getC2SClient();
    const provider = getC2SLeadProvider();

    try {
      const healthCheck = await provider.healthCheck();
      stats.health = healthCheck;
    } catch (error) {
      stats.health = {
        healthy: false,
        error: (error as Error).message,
      };
    }

    // 2. Estatísticas do cliente HTTP
    try {
      const clientStats = client.getStats();
      stats.client = {
        totalRequests: clientStats.requestCount,
        lastRequestTime: clientStats.lastRequestTime
          ? new Date(clientStats.lastRequestTime).toISOString()
          : null,
        config: clientStats.config,
      };
    } catch (error) {
      createErrorLog('stats:client', error);
    }

    // 3. Estatísticas de leads (se solicitado)
    if (includeLeads) {
      try {
        const leadsParams: any = {
          page: 1,
          perpage: 50,
        };

        if (startDate) {
          leadsParams.created_gte = startDate;
        }

        if (endDate) {
          leadsParams.created_lt = endDate;
        }

        const leadsResponse = await client.getLeads(leadsParams);

        stats.leads = {
          total: leadsResponse.meta.total,
          page: leadsResponse.meta.page,
          perpage: leadsResponse.meta.perpage,
          recentCount: leadsResponse.data.length,
        };

        // Análise por status
        const statusCounts: Record<string, number> = {};
        leadsResponse.data.forEach(lead => {
          const status = lead.attributes.lead_status.alias;
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        stats.leads.byStatus = statusCounts;

        // Análise por fonte
        const sourceCounts: Record<string, number> = {};
        leadsResponse.data.forEach(lead => {
          const source = lead.attributes.lead_source?.name || 'unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        stats.leads.bySource = sourceCounts;
      } catch (error) {
        createErrorLog('stats:leads', error);
        stats.leads = {
          error: (error as Error).message,
        };
      }
    }

    // 4. Estatísticas de sellers
    try {
      if (featureFlags.syncSellers) {
        const sellers = await client.getSellers();
        stats.sellers = {
          total: sellers.length,
          withExternalId: sellers.filter(s => s.external_id).length,
        };
      }
    } catch (error) {
      createErrorLog('stats:sellers', error);
      stats.sellers = {
        error: (error as Error).message,
      };
    }

    // 5. Provider stats
    try {
      const providerStats = provider.getStats();
      stats.provider = providerStats;
    } catch (error) {
      createErrorLog('stats:provider', error);
    }

    createLog('stats:generated', {
      includeLeads,
      healthStatus: stats.health?.healthy,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    createErrorLog('stats', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao gerar estatísticas',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Health check rápido
 */
export async function GET() {
  try {
    const featureFlags = loadC2SFeatureFlags();

    if (!featureFlags.enabled) {
      return NextResponse.json({
        status: 'disabled',
        message: 'Integração C2S desabilitada',
      });
    }

    const provider = getC2SLeadProvider();
    const healthCheck = await provider.healthCheck();

    return NextResponse.json({
      status: healthCheck.healthy ? 'healthy' : 'unhealthy',
      latency: healthCheck.latency,
      message: healthCheck.message,
      timestamp: new Date().toISOString(),
      features: featureFlags,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

