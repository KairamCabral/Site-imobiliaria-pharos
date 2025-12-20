/**
 * Clear Vista Cache
 */

import { NextResponse } from 'next/server';
import { detailsCache } from '@/providers/vista/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    detailsCache.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Cache limpo com sucesso!'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

