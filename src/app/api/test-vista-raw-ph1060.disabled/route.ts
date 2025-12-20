import { NextResponse } from 'next/server';
import { getVistaClient } from '@/providers/vista/client';

/**
 * Teste DIRETO da API Vista para o PH1060
 * Mostra EXATAMENTE o que o Vista retorna SEM mapeamento
 */
export async function GET() {
  try {
    const client = getVistaClient();
    
    console.log('[TEST-RAW] Buscando PH1060 diretamente do Vista...');
    
    // Buscar com os campos que estamos tentando
    const pesquisa = {
      fields: [
        'Codigo',
        'Titulo',
        'Bairro',
        // CAMPOS DE FLAGS - TESTANDO DIFERENTES VARIAÇÕES
        'ExibirSite', 'ExibirWeb', 'ExibirPortal', 'PublicarSite',
        'Exclusivo',
        'SuperDestaque', 'Super_Destaque', 'Superdestaque',
        'Destaque', 'DestaqueWeb', 'Destaque_Web', 'DestaqueSite',
        'TemPlaca', 'Tem_Placa', 'Placa',
        'Lancamento',
      ],
    };
    
    const response = await client.get<any>('/imoveis/detalhes', {
      imovel: 'PH1060',
      pesquisa: pesquisa,
    });
    
    const rawData = response.data['PH1060'] || response.data;
    
    if (!rawData || !rawData.Codigo) {
      return NextResponse.json({
        success: false,
        error: 'PH1060 não encontrado',
        responseKeys: Object.keys(response.data as any),
      }, { status: 404 });
    }
    
    console.log('[TEST-RAW] Dados recebidos:', rawData);
    
    // Extrair apenas os campos relacionados a flags
    const flagFields: Record<string, any> = {};
    Object.keys(rawData as any).forEach(key => {
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
        flagFields[key] = rawData[key];
      }
    });
    
    console.log('[TEST-RAW] Campos de flags encontrados:', flagFields);
    
    return NextResponse.json({
      success: true,
      message: 'Dados RAW do Vista para PH1060',
      totalFields: Object.keys(rawData as any).length,
      allFieldNames: Object.keys(rawData as any).sort(),
      flagFieldsFound: flagFields,
      rawVistaData: rawData,
    });
    
  } catch (error: any) {
    console.error('[TEST-RAW] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

