import { NextResponse } from 'next/server';

/**
 * Endpoint para descobrir campos fazendo requisição SEM fields
 * GET /api/vista-all-fields
 */
export async function GET(request: Request) {
  try {
    const apiKey = process.env.VISTA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key não configurada' }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo') || 'PH1060';
    
    console.log(`[VISTA-ALL-FIELDS] Buscando TODOS os campos do imóvel: ${codigo}`);
    
    // Buscar detalhes SEM especificar fields (teoricamente retorna tudo)
    const pesquisa = {
      filter: {
        Codigo: codigo,
      },
    };
    
    const url = `https://api.vistahost.com.br/imoveis/detalhes?key=${apiKey}&imovel=${codigo}&pesquisa=${encodeURIComponent(JSON.stringify(pesquisa))}`;
    
    console.log('[VISTA-ALL-FIELDS] URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VISTA-ALL-FIELDS] Erro:', errorText);
      return NextResponse.json({
        success: false,
        error: `Vista API retornou ${response.status}`,
        details: errorText,
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // Pegar o imóvel retornado
    const property = data[codigo];
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: `Imóvel ${codigo} não encontrado`,
        responseKeys: Object.keys(data),
      }, { status: 404 });
    }
    
    // Procurar campos relacionados a flags
    const flagFields: Record<string, any> = {};
    Object.keys(property).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('destaque') ||
          lowerKey.includes('exclusivo') ||
          lowerKey.includes('placa') ||
          lowerKey.includes('exibir') ||
          lowerKey.includes('publicar') ||
          lowerKey.includes('lancamento') ||
          lowerKey.includes('site') ||
          lowerKey.includes('web') ||
          lowerKey.includes('portal')) {
        flagFields[key] = property[key];
      }
    });
    
    console.log('[VISTA-ALL-FIELDS] Total de campos:', Object.keys(property).length);
    console.log('[VISTA-ALL-FIELDS] Campos de flags encontrados:', Object.keys(flagFields));
    
    return NextResponse.json({
      success: true,
      propertyCode: codigo,
      totalFields: Object.keys(property).length,
      allFields: Object.keys(property).sort(),
      flagRelatedFields: flagFields,
      fullPropertyData: property,
    });
    
  } catch (error: any) {
    console.error('[VISTA-ALL-FIELDS] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

