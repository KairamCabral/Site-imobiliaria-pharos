import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { Property } from '@/domain/models';
import { getPropertyService } from '@/services';
import PropertyClient from './PropertyClient';

export const revalidate = 120;

type PropertyPageParams = {
  id: string;
};

/**
 * generateMetadata dinâmico para SEO otimizado
 * Gera título e descrição personalizados baseados nos dados reais do imóvel
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<PropertyPageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    return {
      title: 'Imóvel não encontrado | Pharos',
    };
  }

  const service = getPropertyService();
  let property: Property | null = null;

  try {
    property = await service.getPropertyDetails(id);
  } catch (error) {
    return {
      title: 'Imóvel | Pharos Negócios Imobiliários',
      description: 'Encontre imóveis de alto padrão em Balneário Camboriú com a Pharos.',
    };
  }

  if (!property) {
    return {
      title: 'Imóvel não encontrado | Pharos',
    };
  }

  // Extrair dados do imóvel
  const tipo = property.type || 'Imóvel';
  const quartos = property.specs?.bedrooms || 0;
  const area = property.specs?.totalArea || property.specs?.area || 0;
  const bairro = property.address?.neighborhood || '';
  const cidade = property.address?.city || 'Balneário Camboriú';
  const preco = property.pricing?.sale || 0;

  // Formatar preço de forma compacta
  const formatarPreco = (valor: number): string => {
    if (valor >= 1000000) {
      const mi = valor / 1000000;
      return `R$ ${mi.toFixed(1).replace('.', ',')}mi`;
    } else if (valor >= 1000) {
      const mil = valor / 1000;
      return `R$ ${mil.toFixed(0)}mil`;
    }
    return `R$ ${valor.toLocaleString('pt-BR')}`;
  };

  const precoFormatado = preco > 0 ? formatarPreco(preco) : 'Sob consulta';

  // Título otimizado (max 60 chars)
  const titulo = quartos > 0
    ? `${tipo} ${quartos}Q - ${bairro} - ${precoFormatado} | Pharos`
    : `${tipo} - ${bairro} - ${precoFormatado} | Pharos`;

  // Descrição otimizada (max 155 chars)
  const destaquesArray: string[] = [];
  if (quartos > 0) destaquesArray.push(`${quartos} quartos`);
  if (area > 0) destaquesArray.push(`${area}m²`);
  if (bairro) destaquesArray.push(bairro);
  if (cidade) destaquesArray.push(cidade);

  // Adicionar características especiais
  const caracteristicas = (property as any)?.features?.location || [];
  const vistaMar = caracteristicas.some((c: string) => 
    c.toLowerCase().includes('frente mar') || c.toLowerCase().includes('vista mar')
  );
  if (vistaMar) destaquesArray.push('Vista mar');

  const descricao = `${tipo} ${destaquesArray.slice(0, 4).join(', ')}. Agende visita com a Pharos Imobiliária.`;

  // Primeira foto para OG
  const primeiraFoto = property.photos?.[0]?.url || '/images/og-default.jpg';

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      images: [
        {
          url: primeiraFoto,
          width: 1200,
          height: 630,
          alt: `${tipo} ${bairro}`,
        },
      ],
      type: 'article',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: [primeiraFoto],
    },
    alternates: {
      canonical: `https://pharos.imob.br/imoveis/${id}`,
    },
  };
}

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<PropertyPageParams>;
  // Next 15: searchParams é sempre Promise em RSC
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedRouteParams = await params;

  const { id } = resolvedRouteParams;

  if (!id) {
    notFound();
  }

  const resolvedParams: Record<string, string | string[] | undefined> =
    searchParams ? await searchParams : {};

  const noCacheParam = resolvedParams?.noCache;
  const skipInitialFetch = Array.isArray(noCacheParam)
    ? noCacheParam.some((value) => ['1', 'true', 'yes'].includes(String(value).toLowerCase()))
    : typeof noCacheParam === 'string' && ['1', 'true', 'yes'].includes(noCacheParam.toLowerCase());

  if (skipInitialFetch) {
    return <PropertyClient propertyId={id} initialProperty={null} />;
  }

  const service = getPropertyService();
  let property: Property | null = null;

  try {
    property = await service.getPropertyDetails(id);
  } catch (error) {
    console.warn('[PropertyPage] Falha ao buscar imóvel no servidor:', error);
  }

  // Se for um cadastro de empreendimento, redirecionar para a página de empreendimentos
  if (property) {
    const categoria = (property as any)?.providerData?.raw?.Categoria;
    if (categoria === 'Empreendimento') {
      const nomeEmpreendimento = property.buildingName || (property as any)?.providerData?.raw?.Empreendimento;
      if (nomeEmpreendimento) {
        // Criar slug do empreendimento
        const slug = nomeEmpreendimento
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        
        console.log(`[PropertyPage] Redirecionando cadastro de empreendimento ${id} para /empreendimentos/${slug}`);
        redirect(`/empreendimentos/${slug}`);
      }
    }

    // Verificar se imóvel foi vendido/alugado
    const status = property.status?.toLowerCase();
    const isSold = status === 'sold' || status === 'vendido' || status === 'alugado' || status === 'rented';
    
    if (isSold) {
      // Calcular dias desde venda
      const soldDate = property.soldAt || property.updatedAt;
      const daysSinceSold = soldDate 
        ? Math.floor((Date.now() - new Date(soldDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Após 60 dias, retornar 410 Gone e redirecionar
      if (daysSinceSold > 60) {
        console.log(`[PropertyPage] Imóvel vendido há ${daysSinceSold} dias, redirecionando...`);
        const tipo = property.type?.toLowerCase() || 'apartamento';
        const bairro = property.address?.neighborhood?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') || '';
        redirect(`/imoveis?type=${tipo}&neighborhood=${bairro}`);
      }

      // Nos primeiros 60 dias, mostrar página especial de "vendido"
      const PropertySoldPage = (await import('@/components/PropertySoldPage')).default;
      
      // Buscar imóveis similares
      let similarProperties: any[] = [];
      try {
        const similarResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3700'}/api/properties?type=${property.type}&neighborhood=${property.address?.neighborhood}&limit=6`,
          { cache: 'no-store' }
        );
        const similarData = await similarResponse.json();
        similarProperties = Array.isArray(similarData?.data) ? similarData.data.filter((p: any) => p.id !== property.id) : [];
      } catch (error) {
        console.warn('[PropertyPage] Erro ao buscar similares:', error);
      }

      return <PropertySoldPage property={property} similarProperties={similarProperties} />;
    }
  }

  return <PropertyClient propertyId={id} initialProperty={property} />;
}
