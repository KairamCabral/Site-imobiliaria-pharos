/**
 * Debug Vista API - Teste Direto
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pesquisa = {
      fields: [
        'Codigo', 'Categoria', 'TipoImovel', 'Finalidade',
        'Endereco', 'Numero', 'Bairro', 'Cidade', 'UF',
        'ValorVenda', 'ValorLocacao', 'ValorCondominio',
        'Dormitorios', 'Suites', 'Vagas',
        'AreaTotal', 'AreaPrivativa',
        'FotoDestaque',
        'DataCadastro', 'DataAtualizacao'
      ],
      paginacao: { pagina: 1, quantidade: 10 }
    };

    const base = process.env.VISTA_BASE_URL || 'https://gabarito-rest.vistahost.com.br';
    const key = process.env.VISTA_API_KEY || '';

    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'VISTA_API_KEY não configurada',
        message: 'Configure VISTA_API_KEY no arquivo .env.local'
      }, { status: 500 });
    }

    const url = `${base}/imoveis/listar?key=${key}&showtotal=1&pesquisa=${encodeURIComponent(JSON.stringify(pesquisa))}`;

    console.log('[DEBUG vista/listar] URL:', url);
    console.log('[DEBUG vista/listar] pesquisa:', JSON.stringify(pesquisa, null, 2));

    const r = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    const data = await r.json();

    console.log('[DEBUG vista/listar] status:', r.status);
    console.log('[DEBUG vista/listar] first item:', JSON.stringify(data[Object.keys(data)[0]], null, 2));

    // Pegar primeiro item (excluindo metadados)
    const firstKey = Object.keys(data).find(k => !['total', 'paginas', 'pagina', 'quantidade'].includes(k));
    const sample = firstKey ? data[firstKey] : null;

    return NextResponse.json({
      success: r.ok,
      status: r.status,
      sample,
      metadata: {
        total: data.total,
        paginas: data.paginas,
        pagina: data.pagina
      },
      validation: {
        temCodigo: !!sample?.Codigo,
        temValorVenda: !!sample?.ValorVenda,
        temDormitorios: !!sample?.Dormitorios,
        temFotoDestaque: !!sample?.FotoDestaque,
        valorVenda: sample?.ValorVenda,
        dormitorios: sample?.Dormitorios,
        fotos: sample?.fotos?.length || 0
      }
    });
  } catch (error: any) {
    console.error('[DEBUG vista/listar] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

