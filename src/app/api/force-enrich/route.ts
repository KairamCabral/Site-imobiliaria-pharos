/**
 * Force Enrichment Test - Simplified
 */

import { NextResponse } from 'next/server';
import { getVistaClient } from '@/providers/vista/client';
import { mapVistaToProperty } from '@/mappers/vista';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = getVistaClient();
    
    // Teste 1: Buscar PH1108 com pesquisa.fields
    const pesquisa = {
      fields: [
        'Codigo', 'Categoria', 'Endereco', 'Bairro', 'Cidade',
        'ValorVenda', 'Dormitorios', 'Suites', 'Vagas',
        'AreaTotal', 'FotoDestaque'
      ]
    };
    
    const response = await client.get('/imoveis/detalhes', {
      imovel: 'PH1108',
      pesquisa: pesquisa
    });
    
    const vistaData = response.data as any;
    const mapped = mapVistaToProperty(vistaData);
    
    return NextResponse.json({
      success: true,
      vistaData: {
        Codigo: vistaData.Codigo,
        ValorVenda: vistaData.ValorVenda,
        Dormitorios: vistaData.Dormitorios,
        AreaTotal: vistaData.AreaTotal
      },
      mappedData: {
        id: mapped.id,
        pricing: mapped.pricing,
        specs: mapped.specs,
        photosCount: mapped.photos.length
      }
    });
  } catch (error: any) {
    console.error('[FORCE-ENRICH] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

