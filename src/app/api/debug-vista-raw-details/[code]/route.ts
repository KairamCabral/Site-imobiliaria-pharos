import { NextResponse } from 'next/server';
import { getVistaClient } from '@/providers/vista/client';
import type { VistaImovel } from '@/providers/vista/types';

/**
 * Endpoint de debug para buscar detalhes do Vista usando o CLIENTE OFICIAL
 * GET /api/debug-vista-raw-details/[code]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const client = getVistaClient();
    
    console.log(`[DEBUG-VISTA-RAW-DETAILS] Buscando detalhes do imóvel: ${code}`);
    
    // Buscar DETALHES usando o cliente (que já funciona no VistaProvider)
    const fieldSets = [
      [
        'Codigo', 'Titulo', 'TipoImovel', 'Finalidade',
        'ValorVenda', 'ValorLocacao', 'ValorCondominio',
        'AreaTotal', 'AreaPrivativa', 'AreaTerreno',
        'Dormitorios', 'Suites', 'Vagas',
        'DescricaoWeb',
        'Empreendimento', 'DataCadastro', 'DataAtualizacao',
        'Status', 'StatusObra', 'StatusEmpreendimento', 'StatusConstrucao',
        'Lancamento', 'AnoEntrega', 'AnoConstrucao'
      ],
      ['Codigo', 'Status', 'StatusObra', 'DescricaoWeb', 'Lancamento']
    ];

    let response: { data: VistaImovel } | null = null;
    let lastError: any = null;

    for (const fields of fieldSets) {
      try {
        const pesquisa = { fields } as any;
        response = await client.get<VistaImovel>('/imoveis/detalhes', {
          imovel: code,
          pesquisa,
        });
        break;
      } catch (error) {
        lastError = error;
        console.warn('[DEBUG-VISTA-RAW-DETAILS] Tentativa com fields falhou:', fields, error instanceof Error ? error.message : error);
      }
    }

    if (!response) {
      throw lastError || new Error('Não foi possível obter detalhes do Vista');
    }
    
    const property = response.data;
    
    if (!property || !property.Codigo) {
      return NextResponse.json({
        success: false,
        error: `Imóvel ${code} não encontrado`,
        rawResponse: response.data,
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
    console.error('[DEBUG-VISTA-RAW-DETAILS] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido',
      stack: error.stack,
    }, { status: 500 });
  }
}

