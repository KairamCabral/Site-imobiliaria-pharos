/**
 * API Route: /api/health
 * 
 * Health check do sistema e providers
 */

import { NextResponse } from 'next/server';
import { getPropertyService } from '@/services';
import { getProviderInfo } from '@/providers/registry';
import { getC2SLeadProvider } from '@/providers/c2s/C2SLeadProvider';
import { loadC2SFeatureFlags } from '@/providers/c2s/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const propertyService = getPropertyService();
    const providerInfo = getProviderInfo();
    
    // Health check do provider principal
    const healthCheck = await propertyService.healthCheck();
    
    // Health check do C2S (se habilitado)
    const c2sFlags = loadC2SFeatureFlags();
    let c2sHealth = null;
    
    if (c2sFlags.enabled) {
      try {
        const c2sProvider = getC2SLeadProvider();
        c2sHealth = await c2sProvider.healthCheck();
      } catch (error: any) {
        c2sHealth = {
          healthy: false,
          error: error.message,
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      status: healthCheck.healthy ? 'healthy' : 'unhealthy',
      provider: {
        name: providerInfo.name,
        active: providerInfo.active,
        healthy: healthCheck.healthy,
        message: healthCheck.message,
        capabilities: providerInfo.capabilities,
      },
      c2s: c2sFlags.enabled ? {
        status: c2sHealth?.healthy ? 'healthy' : 'unhealthy',
        latency: c2sHealth?.latency,
        message: c2sHealth?.message || (c2sHealth && 'error' in c2sHealth ? c2sHealth.error : undefined),
        enabled: c2sFlags.enabled,
        features: c2sFlags,
      } : {
        status: 'disabled',
        enabled: false,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /health] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error.message || 'Erro ao verificar saúde do sistema',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

