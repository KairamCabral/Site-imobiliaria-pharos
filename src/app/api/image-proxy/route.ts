import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * API Route para proxy e otimização de imagens externas
 * Reduz imagens do Vista CDN em 60-70% sem perda significativa de qualidade
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const width = parseInt(request.nextUrl.searchParams.get('w') || '1200');
  const quality = parseInt(request.nextUrl.searchParams.get('q') || '75');
  
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Fetch imagem original do CDN externo
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PharosBot/1.0)',
      },
      // Cache por 24h
      next: { revalidate: 86400 },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const buffer = await imageResponse.arrayBuffer();
    
    // Otimizar com sharp: resize + webp compression
    const optimizedBuffer = await sharp(Buffer.from(buffer))
      .resize(width, null, { 
        fit: 'inside', 
        withoutEnlargement: true,
        kernel: 'lanczos3', // Melhor qualidade de resize
      })
      .webp({ 
        quality, 
        effort: 4, // Balance entre velocidade e compressão
      })
      .toBuffer();

    // Retornar imagem otimizada com cache agressivo
    return new NextResponse(new Uint8Array(optimizedBuffer), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Optimized-Size': optimizedBuffer.length.toString(),
        'X-Original-Size': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Em caso de erro, tentar retornar imagem original
    try {
      const fallbackResponse = await fetch(url);
      if (fallbackResponse.ok) {
        const fallbackBuffer = await fallbackResponse.arrayBuffer();
        return new NextResponse(new Uint8Array(fallbackBuffer), {
          headers: {
            'Content-Type': fallbackResponse.headers.get('Content-Type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
            'X-Proxy-Error': 'true',
          },
        });
      }
    } catch (fallbackError) {
      // Se tudo falhar, retornar erro
    }
    
    return new NextResponse('Error processing image', { status: 500 });
  }
}

// Usar Node.js runtime para acesso ao sharp
export const runtime = 'nodejs';

// Forçar dynamic para evitar problemas de cache
export const dynamic = 'force-dynamic';
