import { NextResponse } from 'next/server';
import { VistaProvider } from '@/providers/vista/VistaProvider';

/**
 * Endpoint de debug para buscar um imóvel específico por código
 * GET /api/debug-property/[code]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const provider = new VistaProvider();
    
    console.log(`[DEBUG-PROPERTY] Buscando imóvel: ${code}`);
    
    // Buscar todos os imóveis e filtrar pelo código
    const result = await provider.listProperties(
      { city: 'Balneário Camboriú' },
      { page: 1, limit: 100 }
    );
    
    // Procurar pelo código específico
    const property = result.properties.find((p: any) => 
      p.code === code || p.id === code || p.providerData?.originalId === code
    );
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: `Imóvel ${code} não encontrado nos primeiros 100 resultados`,
        hint: 'Tente buscar outro imóvel ou aumente o limite',
      }, { status: 404 });
    }
    
    const rawData = property.providerData?.raw || {};
    
    // Extrair TODAS as flags relacionadas
    const allFlagsRaw: Record<string, any> = {};
    Object.keys(rawData).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('destaque') ||
        lowerKey.includes('exclusivo') ||
        lowerKey.includes('placa') ||
        lowerKey.includes('exibir') ||
        lowerKey.includes('publicar') ||
        lowerKey.includes('lancamento') ||
        lowerKey.includes('vista') ||
        typeof rawData[key] === 'boolean' ||
        rawData[key] === 0 ||
        rawData[key] === 1 ||
        rawData[key] === '0' ||
        rawData[key] === '1'
      ) {
        allFlagsRaw[key] = rawData[key];
      }
    });
    
    return NextResponse.json({
      success: true,
      propertyCode: property.code,
      propertyId: property.id,
      propertyTitle: property.title,
      
      // Flags já mapeadas pelo nosso código
      flagsMapped: {
        showOnWebsite: property.showOnWebsite,
        isExclusive: property.isExclusive,
        superHighlight: property.superHighlight,
        hasSignboard: property.hasSignboard,
        webHighlight: property.webHighlight,
        isHighlight: property.isHighlight,
        isLaunch: property.isLaunch,
      },
      
      // TODAS as flags RAW do Vista
      flagsRaw: allFlagsRaw,
      
      // Campos específicos que estamos procurando
      specificFields: {
        ExibirSite: rawData.ExibirSite,
        ExibirWeb: rawData.ExibirWeb,
        PublicarSite: rawData.PublicarSite,
        Exclusivo: rawData.Exclusivo,
        SuperDestaque: rawData.SuperDestaque,
        Destaque: rawData.Destaque,
        DestaqueWeb: rawData.DestaqueWeb,
        TemPlaca: rawData.TemPlaca,
        Placa: rawData.Placa,
        Lancamento: rawData.Lancamento,
      },
      
      // Dados completos para debug
      rawDataComplete: rawData,
    });
    
  } catch (error: any) {
    console.error('[DEBUG-PROPERTY] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido',
      stack: error.stack,
    }, { status: 500 });
  }
}

