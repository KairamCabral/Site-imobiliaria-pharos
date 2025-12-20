/**
 * Test property details endpoint
 */

import { NextResponse } from 'next/server';
import { VISTA_CONFIG } from '@/config/providers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = VISTA_CONFIG.apiKey;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'VISTA_API_KEY não configurada',
        },
        { status: 500 },
      );
    }

    // Buscar detalhes de um imóvel específico
    const url = new URL(`${VISTA_CONFIG.baseUrl}/imoveis/detalhes`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('imovel', 'PH1108'); // Código de teste
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      status: response.status,
      data,
      availableFields: data ? Object.keys(data) : []
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

