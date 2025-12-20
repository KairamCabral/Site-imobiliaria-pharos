import { NextResponse } from 'next/server';

/**
 * Endpoint ultra-simples para debug: busca 1 imóvel e mostra TUDO
 * GET /api/debug-raw-single/[code]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const apiKey = process.env.VISTA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key não configurada' }, { status: 500 });
    }
    
    console.log(`[DEBUG-RAW] Buscando ${code}...`);
    
    // Tentar LISTAR (com filtro por código)
    const pesquisaListar = {
      filter: { Codigo: code },
    };
    
    const urlListar = `https://api.vistahost.com.br/imoveis/listar?key=${apiKey}&pesquisa=${encodeURIComponent(JSON.stringify(pesquisaListar))}&showtotal=1`;
    
    console.log('[DEBUG-RAW] URL Listar:', urlListar);
    
    const responseListar = await fetch(urlListar, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!responseListar.ok) {
      const errorText = await responseListar.text();
      return NextResponse.json({
        success: false,
        error: `Vista /listar retornou ${responseListar.status}`,
        details: errorText,
      }, { status: responseListar.status });
    }
    
    const dataListar = await responseListar.json();
    console.log('[DEBUG-RAW] Resposta /listar:', JSON.stringify(dataListar, null, 2));
    
    // Tentar DETALHES
    const pesquisaDetalhes = {
      fields: [
        'Codigo', 'Titulo', 'TipoImovel', 'Finalidade',
        'ValorVenda', 'Dormitorios', 'Suites',
        'AreaTotal', 'AreaPrivativa',
        // Tentar buscar as flags
        'ExibirSite', 'ExibirWeb', 'PublicarSite',
        'Exclusivo', 'SuperDestaque', 'Destaque', 'DestaqueWeb',
        'TemPlaca', 'Placa', 'Lancamento',
      ],
    };
    
    const urlDetalhes = `https://api.vistahost.com.br/imoveis/detalhes?key=${apiKey}&imovel=${code}&pesquisa=${encodeURIComponent(JSON.stringify(pesquisaDetalhes))}`;
    
    console.log('[DEBUG-RAW] URL Detalhes:', urlDetalhes);
    
    const responseDetalhes = await fetch(urlDetalhes, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    let dataDetalhes = null;
    let errorDetalhes = null;
    
    if (responseDetalhes.ok) {
      dataDetalhes = await responseDetalhes.json();
      console.log('[DEBUG-RAW] Resposta /detalhes:', JSON.stringify(dataDetalhes, null, 2));
    } else {
      errorDetalhes = await responseDetalhes.text();
      console.log('[DEBUG-RAW] Erro /detalhes:', errorDetalhes);
    }
    
    return NextResponse.json({
      success: true,
      code,
      
      listar: {
        success: true,
        total: dataListar.total || 0,
        data: dataListar,
        allKeys: dataListar[code] ? Object.keys(dataListar[code]).sort() : [],
      },
      
      detalhes: dataDetalhes ? {
        success: true,
        data: dataDetalhes,
        property: dataDetalhes[code] || null,
        allKeys: dataDetalhes[code] ? Object.keys(dataDetalhes[code]).sort() : [],
      } : {
        success: false,
        error: errorDetalhes,
      },
    });
    
  } catch (error: any) {
    console.error('[DEBUG-RAW] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

