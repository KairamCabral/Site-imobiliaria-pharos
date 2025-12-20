/**
 * API Route para Geocoding
 * Permite geocodificar endereços via API
 * 
 * POST /api/geocode
 * Body: { address: string, city: string, state: string }
 * 
 * POST /api/geocode/batch
 * Body: { addresses: Array<{id, address, city, state}> }
 */

import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, geocodeBatch } from '@/lib/geocoding/geocodingService';
import { logger } from '@/utils/logger';

/**
 * Geocodifica um único endereço
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obrigatórios
    if (!body.address || !body.city || !body.state) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: address, city, state' },
        { status: 400 }
      );
    }
    
    logger.info('API Geocode', `Geocodificando: ${body.address}, ${body.city}`);
    
    const result = await geocodeAddress(
      body.address,
      body.city,
      body.state
    );
    
    return NextResponse.json({
      success: true,
      data: result,
    });
    
  } catch (error) {
    logger.error('API Geocode', 'Erro ao geocodificar', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

