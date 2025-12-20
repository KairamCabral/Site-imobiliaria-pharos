import { NextResponse } from 'next/server';
import { VistaProvider } from '@/providers/vista/VistaProvider';

/**
 * Endpoint de debug para verificar flags RAW da API Vista
 * GET /api/debug-flags
 */
export async function GET() {
  try {
    const provider = new VistaProvider();
    
    // Buscar 5 imóveis para debug
    const result = await provider.listProperties(
      { city: 'Balneário Camboriú' },
      { page: 1, limit: 5 }
    );
    
    // Mapear apenas os dados relevantes para debug
    const debug = result.properties.map((property: any) => ({
      id: property.id,
      code: property.code,
      title: property.title,
      
      // FLAGS DA API (já mapeadas pelo PropertyMapper)
      showOnWebsite: property.showOnWebsite,
      isExclusive: property.isExclusive,
      superHighlight: property.superHighlight,
      hasSignboard: property.hasSignboard,
      webHighlight: property.webHighlight,
      isHighlight: property.isHighlight,
      isLaunch: property.isLaunch,
      
      // DADOS RAW ORIGINAIS DO VISTA (se disponíveis)
      raw: property.providerData?.raw ? {
        Codigo: property.providerData.raw.Codigo,
        Titulo: property.providerData.raw.Titulo,
        ExibirSite: property.providerData.raw.ExibirSite,
        ExibirWeb: property.providerData.raw.ExibirWeb,
        PublicarSite: property.providerData.raw.PublicarSite,
        Exclusivo: property.providerData.raw.Exclusivo,
        SuperDestaque: property.providerData.raw.SuperDestaque,
        Destaque: property.providerData.raw.Destaque,
        DestaqueWeb: property.providerData.raw.DestaqueWeb,
        TemPlaca: property.providerData.raw.TemPlaca,
        Placa: property.providerData.raw.Placa,
        Lancamento: property.providerData.raw.Lancamento,
      } : null,
    }));
    
    return NextResponse.json({
      success: true,
      total: result.properties.length,
      debug,
    });
    
  } catch (error: any) {
    console.error('[DEBUG FLAGS] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido',
    }, { status: 500 });
  }
}

