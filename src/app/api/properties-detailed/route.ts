/**
 * Endpoint de Teste - Propriedades com Detalhes Completos
 * 
 * Testa a busca de imóveis enriquecida com detalhes completos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPropertyService } from '@/services';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '3');
    
    console.log(`[API /properties-detailed] Fetching ${limit} properties with full details...`);
    
    const propertyService = getPropertyService();
    
    const startTime = Date.now();
    const { result, cache } = await propertyService.searchProperties(
      {},
      { page: 1, limit }
    );
    const endTime = Date.now();
    
    const enrichmentTime = endTime - startTime;
    
    console.log(`[API /properties-detailed] Fetched ${result.properties.length} properties in ${enrichmentTime}ms (cache: ${cache.hit ? 'HIT' : 'MISS'})`);
    
    // Verificar qualidade dos dados
    const dataQuality = result.properties.map(prop => ({
      id: prop.id,
      code: prop.code,
      hasPrice: (prop.pricing.sale || prop.pricing.rent || 0) > 0,
      hasPhotos: prop.photos.length > 0,
      hasBedrooms: (prop.specs.bedrooms || 0) > 0,
      hasDescription: (prop.description || '') !== '',
      photoCount: prop.photos.length,
      price: prop.pricing.sale || prop.pricing.rent || 0,
    }));
    
    const qualityStats = {
      total: dataQuality.length,
      withPrice: dataQuality.filter(d => d.hasPrice).length,
      withPhotos: dataQuality.filter(d => d.hasPhotos).length,
      withBedrooms: dataQuality.filter(d => d.hasBedrooms).length,
      withDescription: dataQuality.filter(d => d.hasDescription).length,
      avgPhotoCount: dataQuality.reduce((sum, d) => sum + d.photoCount, 0) / dataQuality.length,
    };
    
    const headers = new Headers();
    headers.set('x-cache-status', cache.hit ? 'HIT' : 'MISS');
    headers.set('x-cache-ttl', cache.ttl.toString());
    headers.set('x-cache-expires', new Date(cache.expiresAt).toISOString());
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    headers.set('Vary', 'accept, accept-encoding');

    return NextResponse.json({
      success: true,
      enriched: true,
      enrichmentTime: `${enrichmentTime}ms`,
      data: result.properties,
      quality: qualityStats,
      dataQuality,
      message: `Fetched ${result.properties.length} properties with full details in ${enrichmentTime}ms`,
      meta: {
        cache: {
          status: cache.hit ? 'HIT' : 'MISS',
          expiresAt: cache.expiresAt,
          ttl: cache.ttl,
        },
      },
    }, { headers });
  } catch (error: any) {
    console.error('[API /properties-detailed] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar imóveis enriquecidos',
        message: error.message || 'Erro desconhecido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

