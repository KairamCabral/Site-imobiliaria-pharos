import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CustomImage from '@/components/CustomImage';
import Breadcrumb from '@/components/Breadcrumb';
import ImovelCard from '@/components/ImovelCard';
import { gerarTituloSEO, formatarPreco } from '@/utils/seo';
import type { BreadcrumbItem } from '@/types';
import { getCachedPropertyList } from '@/lib/data/propertyQueries';
import { LazySection } from '@/components/LazySection';
import type { Imovel } from '@/types';
import type { PropertyFilters } from '@/domain/models';

// Categorias válidas de imóveis
const categoriasValidas = [
  'apartamentos',
  'coberturas',
  'diferenciados',
  'mobiliados',
  'prontos',
  'lancamentos'
];

// Títulos formatados
const categoriaParaTitulo: Record<string, string> = {
  'apartamentos': 'Apartamentos',
  'coberturas': 'Coberturas',
  'diferenciados': 'Imóveis Diferenciados',
  'mobiliados': 'Imóveis Mobiliados',
  'prontos': 'Imóveis Prontos para Morar',
  'lancamentos': 'Lançamentos e Pré-Lançamentos',
};

// Descrições para SEO
const categoriaParaDescricao: Record<string, string> = {
  'apartamentos': 'Encontre os melhores apartamentos de alto padrão à venda',
  'coberturas': 'Coberturas de luxo com acabamento premium e vista privilegiada',
  'diferenciados': 'Imóveis exclusivos e diferenciados com características únicas',
  'mobiliados': 'Imóveis completamente mobiliados e prontos para morar',
  'prontos': 'Imóveis novos e prontos para você ocupar imediatamente',
  'lancamentos': 'Lançamentos, pré-lançamentos e imóveis em construção',
};

function buildFilters(categoria: string): PropertyFilters {
  const filters: PropertyFilters = {
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  };

  switch (categoria) {
    case 'apartamentos':
      filters.type = 'apartamento';
      break;
    case 'coberturas':
      filters.type = 'cobertura';
      break;
    case 'diferenciados':
      filters.isExclusive = true;
      filters.superHighlight = true;
      break;
    case 'mobiliados':
      filters.furnished = true;
      break;
    case 'prontos':
      filters.obraStatus = 'pronto';
      break;
    case 'lancamentos':
      filters.isLaunch = true;
      filters.obraStatus = ['pre-lancamento', 'lancamento'] as PropertyFilters['obraStatus'];
      break;
    default:
      break;
  }

  return filters;
}

// Gerar metadata dinâmica
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tipo: string }>;
}): Promise<Metadata> {
  const { tipo } = await params;
  const categoria = tipo.toLowerCase();
  
  if (!categoriasValidas.includes(categoria)) {
    return {
      title: 'Categoria não encontrada',
    };
  }

  const tituloFormatado = categoriaParaTitulo[categoria] || categoria;
  const descricao = categoriaParaDescricao[categoria] || '';
  try {
    const filters = buildFilters(categoria);
    const { pagination } = await getCachedPropertyList(filters, { page: 1, limit: 12 });
    const total = pagination?.total ?? 0;
 
    return {
      title: gerarTituloSEO(`${tituloFormatado} em Balneário Camboriú`),
      description: `${descricao} em Balneário Camboriú. ${total || 'Diversos'} imóveis disponíveis com a Pharos Negócios Imobiliários.`,
      keywords: `${categoria} balneário camboriú, ${categoria} à venda, comprar ${categoria}, ${categoria} alto padrão`,
      openGraph: {
        title: `${tituloFormatado} em Balneário Camboriú`,
        description: `${total || 'Diversos'} imóveis disponíveis com a Pharos Negócios Imobiliários`,
        url: `https://pharosnegocios.com.br/imoveis/tipo/${categoria}`,
        type: 'website',
      },
    };
  } catch (error) {
    console.warn('[Tipo Metadata] Falha ao consultar provider', error);
    return {
      title: gerarTituloSEO(`${tituloFormatado} em Balneário Camboriú`),
      description: `${descricao} em Balneário Camboriú.`,
      keywords: `${categoria} balneário camboriú, ${categoria} à venda, comprar ${categoria}, ${categoria} alto padrão`,
      openGraph: {
        title: `${tituloFormatado} em Balneário Camboriú`,
        description: `${descricao} em Balneário Camboriú.`,
        url: `https://pharosnegocios.com.br/imoveis/tipo/${categoria}`,
        type: 'website',
      },
    };
  }
}

// ✅ REMOVIDO generateStaticParams para evitar build massivo
// Rotas serão geradas on-demand com ISR
export const dynamic = 'force-dynamic';
export const revalidate = 600; // 10 minutos
export const dynamicParams = true;

export default async function ImovelPorTipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const categoria = tipo.toLowerCase();
  
  if (!categoriasValidas.includes(categoria)) {
    notFound();
  }

  const tituloFormatado = categoriaParaTitulo[categoria] || categoria;
  const descricao = categoriaParaDescricao[categoria] || '';
  const filters = buildFilters(categoria);
  const { properties, pagination, fetchedAt, cacheLayer } = await getCachedPropertyList(filters, {
    page: 1,
    limit: 200,
  });
  const imoveis = properties;
 
  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', label: 'Home', href: '/', url: '/' },
    { name: 'Imóveis', label: 'Imóveis', href: '/imoveis', url: '/imoveis' },
    { name: tituloFormatado, label: tituloFormatado, href: `/imoveis/tipo/${categoria}`, url: `/imoveis/tipo/${categoria}`, current: true },
  ];
 
  // Estatísticas
  const imoveisDisponiveis = imoveis.filter(i => i.status === 'disponivel').length;
  const imoveisDestaque = imoveis.filter(i => i.destaque).length;
  const totalImoveis = pagination?.total ?? imoveis.length;
  const menorPreco = getLowerPrice(imoveis);

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-800 py-16 overflow-hidden">
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-white font-semibold text-sm">{tituloFormatado}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {tituloFormatado}
              <span className="block text-2xl md:text-3xl text-white/90 font-light mt-3">
                em Balneário Camboriú
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              {descricao} em Balneário Camboriú. {totalImoveis} {totalImoveis === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}.
            </p>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <div className="text-3xl font-bold text-white mb-1">{imoveisDisponiveis || totalImoveis}</div>
                <div className="text-sm text-white/80">Disponíveis agora</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-300 mb-1">{menorPreco !== null ? formatarPreco(menorPreco) : '—'}</div>
                <div className="text-sm text-white/80">A partir de</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <div className="text-3xl font-bold text-amber-300 mb-1">{imoveisDestaque}</div>
                <div className="text-sm text-white/80">Destaque</div>
              </div>
            </div>

            <p className="mt-6 text-sm text-white/70">
              Atualizado em {fetchedAt ? new Date(fetchedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'tempo real'} · Origem: {cacheLayer?.toUpperCase() || 'ORIGIN'}
            </p>
          </div>
        </div>
      </section>

      {/* Filtros e Ordenação */}
      <section className="bg-white py-6 border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-medium">
                {totalImoveis} {totalImoveis === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="ordenar" className="text-sm text-gray-600">
                  Ordenar:
                </label>
                <select
                  id="ordenar"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="relevancia">Mais Relevantes</option>
                  <option value="preco-asc">Menor Preço</option>
                  <option value="preco-desc">Maior Preço</option>
                  <option value="area-desc">Maior Área</option>
                  <option value="recentes">Mais Recentes</option>
                </select>
              </div>

              <Link
                href="/imoveis"
                className="text-sm text-primary hover:text-primary-dark font-semibold"
              >
                Ver todos os tipos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Listagem de Imóveis */}
      <LazySection
        as="section"
        className="py-16 bg-gray-50"
        rootMargin="280px 0px"
        fallback={<section className="py-16 bg-gray-50" />}
      >
        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl">
          {imoveis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {imoveis.map((imovel) => (
                <ImovelCard
                  key={imovel.id}
                  id={imovel.id}
                  titulo={imovel.titulo}
                  endereco={`${imovel.endereco.bairro}, ${imovel.endereco.cidade}`}
                  preco={imovel.preco}
                  quartos={imovel.quartos}
                  banheiros={imovel.banheiros}
                  area={imovel.areaTotal}
                  imagens={imovel.galeria && imovel.galeria.length > 0 ? imovel.galeria : (imovel.imagemCapa ? [imovel.imagemCapa] : [])}
                  tipoImovel={imovel.tipo}
                  destaque={imovel.destaque}
                  caracteristicas={imovel.diferenciais}
                  caracteristicasImovel={imovel.caracteristicasImovel || []}
                  caracteristicasLocalizacao={imovel.caracteristicasLocalizacao || []}
                  vagas={imovel.vagasGaragem}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-600 mb-6">Não há {tipo} disponíveis no momento.</p>
              <Link
                href="/imoveis"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Ver todos os imóveis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </LazySection>

      {/* CTA Section */}
      <LazySection
        as="section"
        className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden"
        rootMargin="320px 0px"
        fallback={<section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden" />}
      >
        <div className="absolute inset-0 opacity-10">
          <CustomImage
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&h=600&q=80"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Não Encontrou o Imóvel Ideal?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Nossa equipe está pronta para ajudá-lo a encontrar o imóvel perfeito para você.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contato"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-8 rounded-xl transition-all hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Fale Conosco
              </Link>
              
              <Link
                href="/imoveis"
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-4 px-8 rounded-xl transition-all"
              >
                Ver Todos os Imóveis
              </Link>
            </div>
          </div>
        </div>
      </LazySection>
    </>
  );
}

function getLowerPrice(lista: Imovel[]) {
  const valores = lista
    .map((item) => (typeof item.preco === 'number' ? item.preco : null))
    .filter((valor): valor is number => typeof valor === 'number' && Number.isFinite(valor));

  if (valores.length === 0) {
    return null;
  }

  return Math.min(...valores);
}

