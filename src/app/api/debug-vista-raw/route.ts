import { NextResponse } from 'next/server';
import { VistaProvider } from '@/providers/vista/VistaProvider';

/**
 * Endpoint de debug para ver TODOS os campos RAW da API Vista
 * GET /api/debug-vista-raw
 */
export async function GET() {
  try {
    const provider = new VistaProvider();
    
    // Buscar apenas 3 imóveis para ver TODOS os campos
    const result = await provider.listProperties(
      { city: 'Balneário Camboriú' },
      { page: 1, limit: 3 }
    );
    
    if (result.properties.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum imóvel retornado',
      }, { status: 404 });
    }
    
    // Pegar o primeiro imóvel e seus dados RAW completos
    const property = result.properties[0];
    const rawData = property.providerData?.raw || {};
    
    // Listar TODAS as chaves do objeto RAW
    const allKeys = Object.keys(rawData).sort();
    
    // Filtrar apenas as chaves que parecem ser flags/boolean
    const flagKeys = allKeys.filter(key => {
      const value = rawData[key];
      // Procurar por valores que sejam 0, 1, true, false, "0", "1", "true", "false"
      return value === 0 || value === 1 || 
             value === true || value === false ||
             value === "0" || value === "1" ||
             value === "true" || value === "false" ||
             key.toLowerCase().includes('destaque') ||
             key.toLowerCase().includes('exclusivo') ||
             key.toLowerCase().includes('placa') ||
             key.toLowerCase().includes('exibir') ||
             key.toLowerCase().includes('publicar') ||
             key.toLowerCase().includes('lancamento') ||
             key.toLowerCase().includes('vista');
    });
    
    // Criar objeto com apenas as flags
    const flags: Record<string, any> = {};
    flagKeys.forEach(key => {
      flags[key] = rawData[key];
    });
    
    return NextResponse.json({
      success: true,
      propertyId: property.id,
      propertyCode: property.code,
      propertyTitle: property.title,
      
      // Todas as chaves disponíveis (para referência)
      allAvailableKeys: allKeys,
      totalKeys: allKeys.length,
      
      // Flags identificadas
      identifiedFlags: flags,
      totalFlags: Object.keys(flags).length,
      
      // Dados RAW completos (para debug)
      rawDataComplete: rawData,
    }); // Pretty print com indentação
    
  } catch (error: any) {
    console.error('[DEBUG VISTA RAW] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido',
      stack: error.stack,
    }, { status: 500 });
  }
}

