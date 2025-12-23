import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, TrendingUp, Home, Users, Briefcase } from 'lucide-react';
import { getCityBySlug, getAllCities } from '@/data/cities';
import { getCachedPropertyList } from '@/lib/data/propertyQueries';
import ImovelCard from '@/components/ImovelCard';
import Breadcrumb from '@/components/Breadcrumb';
import { generateBreadcrumbSchema } from '@/utils/structuredData';
import StructuredData from '@/components/StructuredData';
import type { BreadcrumbItem } from '@/types';

type PageParams = {
  slug: string;
};

// ✅ REMOVIDO generateStaticParams para evitar build massivo
// Rotas serão geradas on-demand com ISR
export const revalidate = 600; // 10 minutos
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCityBySlug(resolvedParams.slug);

  if (!city) {
    return {
      title: 'Cidade não encontrada',
    };
  }

  return {
    title: city.seoTitle,
    description: city.seoDescription,
    keywords: city.keywords.join(', '),
    openGraph: {
      title: city.seoTitle,
      description: city.seoDescription,
      url: `https://pharos.imob.br/imoveis/cidade/${city.slug}`,
      images: [{ url: city.imageCover }],
      type: 'website',
    },
    alternates: {
      canonical: `https://pharos.imob.br/imoveis/cidade/${city.slug}`,
    },
  };
}

export default async function CityPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const city = getCityBySlug(resolvedParams.slug);

  if (!city) {
    notFound();
  }

  // Buscar imóveis da cidade
  const { properties, pagination } = await getCachedPropertyList(
    { city: city.name },
    { page: 1, limit: 12 }
  );

  const totalProperties = pagination?.total || properties.length;

  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', label: 'Home', href: '/', url: '/' },
    { name: 'Imóveis', label: 'Imóveis', href: '/imoveis', url: '/imoveis' },
    { name: city.name, label: city.name, href: `/imoveis/cidade/${city.slug}`, url: `/imoveis/cidade/${city.slug}`, current: true },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] bg-gray-900 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={city.imageCover}
              alt={`Vista da cidade de ${city.name}`}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          </div>

          <div className="relative container max-w-7xl mx-auto px-4 h-full flex items-end pb-12">
            <div className="max-w-3xl text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">{city.name}, {city.state}</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Imóveis em {city.name}
              </h1>

              <p className="text-xl text-white/90 mb-6">
                {city.description}
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  <span className="font-semibold">{totalProperties} imóveis disponíveis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{city.population.toLocaleString('pt-BR')} habitantes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-pharos-blue-600">
                  {totalProperties}
                </div>
                <div className="text-sm text-gray-600">Imóveis disponíveis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pharos-blue-600">
                  {city.neighborhoods.length}
                </div>
                <div className="text-sm text-gray-600">Bairros atendidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pharos-blue-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(city.averagePrice)}
                </div>
                <div className="text-sm text-gray-600">Preço médio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pharos-blue-600">
                  {city.popularTypes.length}
                </div>
                <div className="text-sm text-gray-600">Tipos disponíveis</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sobre a cidade */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Por que morar em {city.name}?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {city.description}
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Destaques da cidade:
                </h3>
                <ul className="space-y-3">
                  {city.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Imóveis */}
              {properties.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Imóveis em {city.name}
                    </h2>
                    <Link
                      href={`/imoveis?city=${city.slug}`}
                      className="text-pharos-blue-600 hover:text-pharos-blue-700 font-semibold text-sm"
                    >
                      Ver todos ({totalProperties}) →
                    </Link>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {properties.slice(0, 6).map((property) => (
                      <ImovelCard
                        key={property.id}
                        id={property.id}
                        titulo={property.titulo}
                        endereco={`${property.endereco.bairro}, ${property.endereco.cidade}`}
                        preco={property.preco}
                        quartos={property.quartos}
                        banheiros={property.banheiros}
                        area={property.areaTotal}
                        imagens={property.galeria || [property.imagemCapa]}
                        tipoImovel={property.tipo}
                        vagas={property.vagasGaragem}
                        caracteristicas={property.diferenciais}
                        caracteristicasImovel={property.caracteristicasImovel || []}
                        caracteristicasLocalizacao={property.caracteristicasLocalizacao || []}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Bairros */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Bairros em {city.name}
                </h3>
                <div className="space-y-2">
                  {city.neighborhoods.map((neighborhood) => (
                    <Link
                      key={neighborhood}
                      href={`/imoveis?bairro=${neighborhood.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-pharos-blue-600"
                    >
                      {neighborhood}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tipos populares */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Tipos mais procurados
                </h3>
                <div className="space-y-2">
                  {city.popularTypes.map((type) => (
                    <Link
                      key={type}
                      href={`/imoveis?city=${city.slug}&type=${type.toLowerCase()}`}
                      className="block px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-pharos-blue-600"
                    >
                      {type}s em {city.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-pharos-blue-600 to-pharos-navy-900 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">
                  Quer ajuda para encontrar?
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  Nossa equipe conhece {city.name} profundamente e pode te ajudar a encontrar o imóvel ideal.
                </p>
                <Link
                  href="/contato"
                  className="block w-full bg-white text-pharos-blue-600 text-center font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Falar com Especialista
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
