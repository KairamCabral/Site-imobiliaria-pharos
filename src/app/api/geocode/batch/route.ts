/**
 * API Route para Geocoding em Batch
 * Geocodifica múltiplos endereços de uma vez
 * 
 * POST /api/geocode/batch
 * Body: { 
 *   addresses: Array<{
 *     id: string,
 *     address: string, 
 *     city: string, 
 *     state: string
 *   }> 
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { geocodeBatch } from '@/lib/geocoding/geocodingService';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar estrutura
    if (!body.addresses || !Array.isArray(body.addresses)) {
      return NextResponse.json(
        { error: 'Campo obrigatório: addresses (array)' },
        { status: 400 }
      );
    }
    
    // Validar cada endereço
    for (const addr of body.addresses) {
      if (!addr.id || !addr.address || !addr.city || !addr.state) {
        return NextResponse.json(
          { error: 'Cada endereço deve ter: id, address, city, state' },
          { status: 400 }
        );
      }
    }
    
    // Limitar batch size
    if (body.addresses.length > 100) {
      return NextResponse.json(
        { error: 'Limite de 100 endereços por batch' },
        { status: 400 }
      );
    }
    
    logger.info('API Geocode Batch', `Processando ${body.addresses.length} endereços`);
    
    const results = await geocodeBatch(body.addresses);
    
    return NextResponse.json({
      success: true,
      total: results.length,
      data: results,
    });
    
  } catch (error) {
    logger.error('API Geocode Batch', 'Erro ao processar batch', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}

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

