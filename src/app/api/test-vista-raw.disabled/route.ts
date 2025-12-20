/**
 * Test Vista API Raw Response
 */

import { NextResponse } from 'next/server';
import { getVistaClient } from '@/providers/vista/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = getVistaClient();
    
    // Buscar lista básica
    console.log('[TEST] Buscando lista básica...');
    const listResponse = await client.get('/imoveis/listar', {
      pesquisa: {
        paginacao: { pagina: 1, quantidade: 1 }
      },
      showtotal: 1
    });
    
    console.log('[TEST] Lista retornada:', JSON.stringify(listResponse.data, null, 2));
    
    // Pegar primeiro código
    const firstKey = Object.keys(listResponse.data as any).find(k => !['total', 'paginas', 'pagina', 'quantidade'].includes(k));
    const codigo = firstKey || 'PH1108';
    
    console.log('[TEST] Código do primeiro imóvel:', codigo);
    
    // Buscar detalhes com pesquisa.fields
    console.log('[TEST] Buscando detalhes do imóvel', codigo);
    const detailsResponse = await client.get('/imoveis/detalhes', {
      imovel: codigo,
      pesquisa: {
        fields: [
          'Codigo', 'Categoria', 'TipoImovel',
          'Endereco', 'Numero', 'Bairro', 'Cidade',
          'ValorVenda', 'Dormitorios', 'Suites', 'Vagas',
          'AreaTotal', 'FotoDestaque'
        ]
      }
    });
    
    console.log('[TEST] Detalhes retornados:', JSON.stringify(detailsResponse.data, null, 2));
    
    return NextResponse.json({
      success: true,
      codigo,
      lista: listResponse.data,
      detalhes: detailsResponse.data,
      availableFields: Object.keys((detailsResponse.data as any) || {})
    });
  } catch (error: any) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

