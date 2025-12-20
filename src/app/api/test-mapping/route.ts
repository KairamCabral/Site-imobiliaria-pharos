/**
 * Test Property Mapping
 */

import { NextResponse } from 'next/server';
import { getVistaClient } from '@/providers/vista/client';
import { mapVistaToProperty } from '@/mappers/vista';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = getVistaClient();
    
    // Buscar detalhes de um imóvel
    const response = await client.get('/imoveis/detalhes', {
      imovel: 'PH14',
      pesquisa: {
        fields: [
          'Codigo', 'Categoria', 'TipoImovel',
          'Endereco', 'Numero', 'Bairro', 'Cidade',
          'ValorVenda', 'Dormitorios', 'Suites', 'Vagas',
          'AreaTotal', 'FotoDestaque'
        ]
      }
    });
    
    const vistaData = response.data as any;
    const mapped = mapVistaToProperty(vistaData);
    
    return NextResponse.json({
      success: true,
      vistaData: {
        Codigo: vistaData.Codigo,
        ValorVenda: vistaData.ValorVenda,
        Dormitorios: vistaData.Dormitorios,
        Suites: vistaData.Suites,
        AreaTotal: vistaData.AreaTotal,
        FotoDestaque: vistaData.FotoDestaque
      },
      mappedData: {
        id: mapped.id,
        pricing: mapped.pricing,
        specs: mapped.specs,
        photos: mapped.photos
      }
    });
  } catch (error: any) {
    console.error('[TEST-MAPPING] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

