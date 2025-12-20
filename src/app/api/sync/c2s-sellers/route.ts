/**
 * Sincronização de Corretores (Sellers) com Contact2Sale
 * 
 * Endpoint para sincronizar corretores entre o sistema e o C2S
 */

import { NextRequest, NextResponse } from 'next/server';
import { getC2SClient } from '@/providers/c2s/C2SClient';
import { loadC2SFeatureFlags, createLog, createErrorLog } from '@/providers/c2s/utils';

export const dynamic = 'force-dynamic';

/**
 * GET: Busca todos os sellers do C2S
 */
export async function GET(request: NextRequest) {
  try {
    const featureFlags = loadC2SFeatureFlags();

    if (!featureFlags.enabled || !featureFlags.syncSellers) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sincronização de sellers desabilitada',
        },
        { status: 403 }
      );
    }

    const client = getC2SClient();
    const sellers = await client.getSellers();

    createLog('sync:sellers:get', {
      count: sellers.length,
    });

    return NextResponse.json({
      success: true,
      data: sellers,
      total: sellers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    createErrorLog('sync:sellers:get', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar sellers do C2S',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Cria ou atualiza sellers no C2S
 */
export async function POST(request: NextRequest) {
  try {
    const featureFlags = loadC2SFeatureFlags();

    if (!featureFlags.enabled || !featureFlags.syncSellers) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sincronização de sellers desabilitada',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sellers, mode = 'sync' } = body;

    if (!Array.isArray(sellers) || sellers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Array de sellers é obrigatório',
        },
        { status: 400 }
      );
    }

    const client = getC2SClient();
    const results = {
      created: [] as any[],
      updated: [] as any[],
      errors: [] as any[],
    };

    // Busca sellers existentes do C2S
    let existingSellers: any[] = [];
    try {
      existingSellers = await client.getSellers();
    } catch (error) {
      createErrorLog('sync:sellers:get_existing', error);
    }

    // Processa cada seller
    for (const seller of sellers) {
      try {
        // Valida dados mínimos
        if (!seller.name || !seller.external_id) {
          results.errors.push({
            seller,
            error: 'Nome e external_id são obrigatórios',
          });
          continue;
        }

        // Verifica se já existe no C2S (por external_id)
        const existing = existingSellers.find(
          (s: any) => s.external_id === seller.external_id
        );

        if (existing) {
          // Atualiza
          if (mode === 'sync' || mode === 'update') {
            const updated = await client.updateSeller(existing.id, {
              name: seller.name,
              phone: seller.phone,
              email: seller.email,
              external_id: seller.external_id,
            });

            results.updated.push({
              id: updated.id,
              external_id: updated.external_id,
              name: updated.name,
            });

            createLog('sync:seller:updated', {
              id: updated.id,
              name: updated.name,
            });
          }
        } else {
          // Cria novo
          if (mode === 'sync' || mode === 'create') {
            const created = await client.createSeller({
              name: seller.name,
              phone: seller.phone,
              email: seller.email,
              company: 'Imobiliária Pharos',
              external_id: seller.external_id,
            });

            results.created.push({
              id: created.id,
              external_id: created.external_id,
              name: created.name,
            });

            createLog('sync:seller:created', {
              id: created.id,
              name: created.name,
            });
          }
        }
      } catch (error: any) {
        results.errors.push({
          seller: seller.name,
          error: error.message,
        });

        createErrorLog('sync:seller:process', error, {
          sellerName: seller.name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: sellers.length,
        created: results.created.length,
        updated: results.updated.length,
        errors: results.errors.length,
      },
      details: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    createErrorLog('sync:sellers:post', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao sincronizar sellers',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

