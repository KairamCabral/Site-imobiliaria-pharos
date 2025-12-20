import { NextResponse } from 'next/server';

/**
 * Endpoint para descobrir TODOS os campos disponíveis na API Vista
 * GET /api/vista-fields
 */
export async function GET() {
  try {
    const apiKey = process.env.VISTA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key não configurada' }, { status: 500 });
    }
    
    console.log('[VISTA-FIELDS] Buscando campos disponíveis...');
    
    // Buscar campos disponíveis
    const url = `https://api.vistahost.com.br/imoveis/fields?key=${apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VISTA-FIELDS] Erro:', errorText);
      return NextResponse.json({
        success: false,
        error: `Vista API retornou ${response.status}`,
        details: errorText,
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    console.log('[VISTA-FIELDS] Total de campos:', Object.keys(data).length);
    
    // Procurar especificamente por campos relacionados às flags
    const flagFields: Record<string, any> = {};
    Object.keys(data).forEach(key => {
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
        flagFields[key] = data[key];
      }
    });
    
    console.log('[VISTA-FIELDS] Campos relacionados a flags:', Object.keys(flagFields));
    
    return NextResponse.json({
      success: true,
      totalFields: Object.keys(data).length,
      allFields: Object.keys(data).sort(),
      flagRelatedFields: flagFields,
      fullData: data,
    });
    
  } catch (error: any) {
    console.error('[VISTA-FIELDS] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

