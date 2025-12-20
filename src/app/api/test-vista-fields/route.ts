/**
 * Test Vista API - Descobrir campos válidos
 */

import { NextResponse } from 'next/server';
import { VISTA_CONFIG } from '@/config/providers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tests = [];
  const apiKey = VISTA_CONFIG.apiKey;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        tests: [],
        error: 'VISTA_API_KEY não configurada',
      },
      { status: 500 },
    );
  }
  
  // Test 1: Com fields comuns da API Vista
  try {
    const url = new URL(`${VISTA_CONFIG.baseUrl}/imoveis/listar`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('showtotal', '1');
    url.searchParams.set('pesquisa', JSON.stringify({
      fields: ['Codigo'],
      paginacao: { pagina: 1, quantidade: 2 }
    }));
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    
    // Pegar o primeiro imóvel (a chave é o código)
    const keys = Object.keys(data).filter(k => k !== 'total' && k !== 'paginas' && k !== 'pagina' && k !== 'quantidade');
    const firstProperty = keys[0] ? data[keys[0]] : null;
    
    tests.push({
      name: 'Listagem com fields comuns',
      status: response.status,
      ok: response.ok,
      firstProperty,
      availableFields: firstProperty ? Object.keys(firstProperty) : [],
      total: data.total
    });
  } catch (error: any) {
    tests.push({
      name: 'Listagem com fields comuns',
      error: error.message
    });
  }
  
  return NextResponse.json({
    success: true,
    tests,
  });
}

