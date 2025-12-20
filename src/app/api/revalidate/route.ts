/**
 * API Route: /api/revalidate
 * 
 * On-Demand Revalidation para ISR
 * Permite revalidar páginas específicas via webhook ou trigger manual
 * 
 * Uso:
 * POST /api/revalidate
 * Authorization: Bearer YOUR_REVALIDATE_SECRET
 * Body: { "tags": ["property:PH1234"], "paths": ["/imoveis/PH1234"] }
 * 
 * Segurança: Requer REVALIDATE_SECRET no .env
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting simples (em produção usar Redis)
const revalidationLog = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REVALIDATIONS_PER_WINDOW = 10;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const lastRevalidation = revalidationLog.get(identifier);
  
  if (!lastRevalidation || now - lastRevalidation > RATE_LIMIT_WINDOW) {
    revalidationLog.set(identifier, now);
    return false;
  }
  
  return true;
}

interface RevalidationRequest {
  tags?: string[];
  paths?: string[];
  secret?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar secret (segurança)
    const authHeader = request.headers.get('authorization');
    const secret = authHeader?.replace('Bearer ', '');
    const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
    
    if (REVALIDATE_SECRET && secret !== REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid secret' },
        { status: 401 }
      );
    }
    
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Too many revalidation requests' },
        { status: 429 }
      );
    }
    
    // Parse body
    const body = await request.json() as RevalidationRequest;
    const { tags = [], paths = [] } = body;
    
    // Validação
    if (tags.length === 0 && paths.length === 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Must provide tags or paths' },
        { status: 400 }
      );
    }
    
    // Limites de segurança
    if (tags.length > 50) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Maximum 50 tags per request' },
        { status: 400 }
      );
    }
    
    if (paths.length > 20) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Maximum 20 paths per request' },
        { status: 400 }
      );
    }
    
    // Revalidar tags
    const revalidatedTags: string[] = [];
    for (const tag of tags) {
      try {
        revalidateTag(tag);
        revalidatedTags.push(tag);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Revalidate] Tag revalidated: ${tag}`);
        }
      } catch (error) {
        console.error(`[Revalidate] Error revalidating tag ${tag}:`, error);
      }
    }
    
    // Revalidar paths
    const revalidatedPaths: string[] = [];
    for (const path of paths) {
      try {
        revalidatePath(path);
        revalidatedPaths.push(path);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Revalidate] Path revalidated: ${path}`);
        }
      } catch (error) {
        console.error(`[Revalidate] Error revalidating path ${path}:`, error);
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        revalidated: {
          tags: revalidatedTags,
          paths: revalidatedPaths,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Revalidate API] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET para testar endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
  
  if (REVALIDATE_SECRET && secret !== REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    status: 'ok',
    service: 'revalidation-api',
    timestamp: new Date().toISOString(),
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_REVALIDATE_SECRET',
      },
      body: {
        tags: ['property:PH1234', 'properties:list'],
        paths: ['/imoveis/PH1234', '/imoveis'],
      },
    },
  });
}

