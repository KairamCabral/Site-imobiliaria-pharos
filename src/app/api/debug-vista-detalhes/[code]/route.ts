import { NextResponse } from 'next/server';

/**
 * Endpoint de debug para buscar DETALHES do imóvel DIRETO do Vista
 * USA /imoveis/detalhes (não /imoveis/listar)
 * GET /api/debug-vista-detalhes/[code]
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
    
    console.log(`[DEBUG-VISTA-DETALHES] Buscando DETALHES do imóvel: ${code}`);
    
    // Buscar DETALHES do Vista (não listar)
    // Documentação: /imoveis/detalhes usa imovel=codigo e pesquisa com fields
    const pesquisa = {
      fields: [
        'Codigo',
        'Titulo',
        'TipoImovel',
      ],
    };
    
    const url = `https://api.vistahost.com.br/imoveis/detalhes?key=${apiKey}&imovel=${code}&pesquisa=${encodeURIComponent(JSON.stringify(pesquisa))}`;
    
    console.log('[DEBUG-VISTA-DETALHES] URL:', url);
    
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
    
    console.log('[DEBUG-VISTA-DETALHES] Resposta completa:', JSON.stringify(data, null, 2));
    
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
        lowerKey.includes('site') ||
        lowerKey.includes('web') ||
        lowerKey.includes('portal') ||
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
      propertyTitle: property.Titulo || property.TituloSite,
      propertyType: property.TipoImovel || property.Categoria,
      
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
      allKeys: Object.keys(property).sort(),
      totalKeys: Object.keys(property).length,
    });
    
  } catch (error: any) {
    console.error('[DEBUG-VISTA-DETALHES] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido',
      stack: error.stack,
    }, { status: 500 });
  }
}

