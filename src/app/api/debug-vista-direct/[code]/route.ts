import { NextResponse } from 'next/server';

/**
 * Endpoint de debug para buscar imóvel DIRETO do Vista por código
 * Sem passar pelo adapter/mapper
 * GET /api/debug-vista-direct/[code]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const apiKey = process.env.VISTA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'VISTA_API_KEY não configurada',
      }, { status: 500 });
    }
    
    console.log(`[DEBUG-VISTA-DIRECT] Buscando imóvel: ${code}`);
    
    // Buscar DIRETO do Vista, sem adapter
    // NÃO especificar fields para pegar TODOS os campos disponíveis
    const pesquisa = {
      filter: {
        Codigo: code,
      },
    };
    
    const url = `https://api.vistahost.com.br/imoveis/listar?key=${apiKey}&pesquisa=${encodeURIComponent(JSON.stringify(pesquisa))}&showtotal=1`;
    
    console.log('[DEBUG-VISTA-DIRECT] URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `Vista API retornou ${response.status}`,
        details: errorText,
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    console.log('[DEBUG-VISTA-DIRECT] Resposta completa:', JSON.stringify(data, null, 2));
    
    // Encontrar o imóvel na resposta
    let property = null;
    if (data && typeof data === 'object') {
      // Vista retorna as propriedades como chaves do objeto
      const foundKey = Object.keys(data).find(k => k === code);
      property = data[code] || (foundKey ? data[foundKey] : null);
    }
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: `Imóvel ${code} não encontrado`,
        responseKeys: Object.keys(data || {}),
        responseData: data,
      }, { status: 404 });
    }
    
    // Extrair TODAS as flags
    const allFlags: Record<string, any> = {};
    Object.keys(property).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('destaque') ||
        lowerKey.includes('exclusivo') ||
        lowerKey.includes('placa') ||
        lowerKey.includes('exibir') ||
        lowerKey.includes('publicar') ||
        lowerKey.includes('lancamento') ||
        typeof property[key] === 'boolean' ||
        property[key] === 0 ||
        property[key] === 1 ||
        property[key] === '0' ||
        property[key] === '1'
      ) {
        allFlags[key] = property[key];
      }
    });
    
    return NextResponse.json({
      success: true,
      propertyCode: property.Codigo || code,
      propertyTitle: property.Titulo,
      propertyType: property.TipoImovel,
      
      // Campos específicos que estamos procurando
      specificFields: {
        ExibirSite: property.ExibirSite,
        ExibirWeb: property.ExibirWeb,
        PublicarSite: property.PublicarSite,
        Exclusivo: property.Exclusivo,
        SuperDestaque: property.SuperDestaque,
        Destaque: property.Destaque,
        DestaqueWeb: property.DestaqueWeb,
        TemPlaca: property.TemPlaca,
        Placa: property.Placa,
        Lancamento: property.Lancamento,
      },
      
      // TODAS as flags encontradas
      allFlags,
      
      // Dados COMPLETOS do Vista (raw)
      rawVistaData: property,
      
      // TODAS as chaves disponíveis
      allKeys: Object.keys(property),
    });
    
  } catch (error: any) {
    console.error('[DEBUG-VISTA-DIRECT] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido',
      stack: error.stack,
    }, { status: 500 });
  }
}

