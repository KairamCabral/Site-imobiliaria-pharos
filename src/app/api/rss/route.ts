// src/app/api/rss/route.ts
import { NextResponse } from 'next/server';
import { getCachedPropertyList } from '@/lib/data/propertyQueries';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.imob.br';

/**
 * RSS Feed para imóveis recém adicionados
 * Útil para SEO, agregadores e notificações
 */
export async function GET() {
  try {
    // Buscar os 50 imóveis mais recentes
    const { properties } = await getCachedPropertyList(
      {
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      },
      { page: 1, limit: 50 }
    );

    const rssItems = properties.map((property: any) => {
      const title = property.title || property.titulo || `${property.type || property.tipo} em ${property.address?.neighborhood || property.bairro}`;
      const description = property.description || property.descricao || `${property.type || property.tipo} com ${property.specs?.bedrooms || property.quartos || 0} quartos, ${property.specs?.area || property.area || 0}m²`;
      const link = `${BASE_URL}/imoveis/${property.id || property.codigo}`;
      const pubDate = new Date(property.updatedAt || property.createdAt || Date.now()).toUTCString();
      const imageUrl = property.photos?.[0]?.url || property.imagens?.[0] || property.imagem || '';

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" />` : ''}
      <category>Imóveis</category>
      <category>${property.type}</category>
      ${property.address?.city ? `<category>${property.address.city}</category>` : ''}
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Pharos Negócios Imobiliários - Novos Imóveis</title>
    <link>${BASE_URL}</link>
    <description>Imóveis de alto padrão em Balneário Camboriú, Itajaí e região</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/api/rss" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>Pharos Negócios Imobiliários</title>
      <link>${BASE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('[RSS] Error generating feed:', error);
    return NextResponse.json({ error: 'Failed to generate RSS feed' }, { status: 500 });
  }
}

