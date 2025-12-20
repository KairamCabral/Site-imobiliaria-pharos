/**
 * Endpoint de Debug - Detalhes Raw Vista
 */

import { NextRequest, NextResponse } from 'next/server';
import { VISTA_CONFIG } from '@/config/providers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const propertyId = searchParams.get('id') || 'PH1108';
  
  try {
    const apiKey = VISTA_CONFIG.apiKey;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'VISTA_API_KEY não configurada',
        },
        { status: 500 },
      );
    }

    // Conforme documentação Vista: precisa do parâmetro 'pesquisa' com 'fields'
    const pesquisa = {
      fields: [
        'Codigo', 'CodigoImovel', 'Titulo', 'Categoria', 'TipoImovel',
        'Endereco', 'Numero', 'Bairro', 'Cidade', 'Estado',
        'ValorVenda', 'Valor', 'ValorLocacao', 'ValorCondominio', 'ValorIPTU',
        'Dormitorio', 'Dormitorios', 'Suites', 'Vagas', 'Banheiros',
        'AreaTotal', 'AreaPrivativa', 'Descricao',
        'FotoDestaque', 'FotoCapa',
        { fotos: ['Foto', 'FotoPequena', 'Destaque'] }
      ]
    };
    
    const url = new URL(`${VISTA_CONFIG.baseUrl}/imoveis/detalhes`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('imovel', propertyId);
    url.searchParams.set('pesquisa', JSON.stringify(pesquisa));
    
    console.log('[DEBUG] Fetching:', url.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    const rawData = await response.json();
    
    console.log('[DEBUG] Raw response:', JSON.stringify(rawData, null, 2));
    
    // Analizar campos disponíveis
    const availableFields = Object.keys(rawData || {});
    const priceFields = availableFields.filter(f => 
      f.toLowerCase().includes('valor') || 
      f.toLowerCase().includes('preco') ||
      f.toLowerCase().includes('price')
    );
    const photoFields = availableFields.filter(f => 
      f.toLowerCase().includes('foto') || 
      f.toLowerCase().includes('image')
    );
    const specFields = availableFields.filter(f => 
      f.toLowerCase().includes('quarto') ||
      f.toLowerCase().includes('suite') ||
      f.toLowerCase().includes('vaga') ||
      f.toLowerCase().includes('area') ||
      f.toLowerCase().includes('banheiro')
    );
    
    return NextResponse.json({
      success: true,
      propertyId,
      rawData,
      analysis: {
        totalFields: availableFields.length,
        availableFields,
        priceFields,
        photoFields,
        specFields,
        hasValorVenda: !!rawData.ValorVenda,
        hasValor: !!rawData.Valor,
        hasFotos: !!rawData.fotos,
        hasFotoDestaque: !!rawData.FotoDestaque,
        hasDormitorios: !!rawData.Dormitorio || !!rawData.Dormitorios,
      }
    });
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

