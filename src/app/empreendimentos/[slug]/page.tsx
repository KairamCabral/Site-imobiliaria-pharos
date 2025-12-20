import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomImage from '@/components/CustomImage';
import ImovelCard from '@/components/ImovelCard';
import ImageCarousel from '@/components/ImageCarousel';
import {
  buscarEmpreendimentoPorSlug,
  listarEmpreendimentos,
} from '@/data/empreendimentos';
import { PropertyService } from '@/services/PropertyService';
import { buildImovelCardProps } from '@/utils/imovelCardProps';
import { adaptPropertiesToImoveis } from '@/utils/propertyAdapter';
import { MapPin, Building2, Calendar, Users } from 'lucide-react';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

// Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const empreendimento = await buscarEmpreendimentoPorSlug(slug);

  if (!empreendimento) {
    return {
      title: 'Empreendimento não encontrado',
    };
  }

  const url = `https://pharosnegocios.com.br/empreendimentos/${slug}`;
  const imagemPrincipal = empreendimento.fotos?.[0]?.url || 
                          empreendimento.imagemCapa || 
                          empreendimento.fotosUnidades?.[0]?.url || 
                          '/images/placeholder-empreendimento.jpg';

  return {
    title: `${empreendimento.nome} | Pharos Negócios Imobiliários`,
    description: empreendimento.descricao || empreendimento.descricaoCompleta || `Conheça o ${empreendimento.nome}`,
    openGraph: {
      title: empreendimento.nome,
      description: empreendimento.descricao || '',
      url,
      images: [imagemPrincipal],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: empreendimento.nome,
      description: empreendimento.descricao || '',
      images: [imagemPrincipal],
    },
    alternates: {
      canonical: url,
    },
  };
}

// Static params
export async function generateStaticParams() {
  try {
    const { items } = await listarEmpreendimentos({ page: 1, limit: 50 });
    return items
      .filter((emp) => !!emp.slug)
      .map((emp) => ({ slug: emp.slug }));
  } catch {
    return [];
  }
}

export default async function EmpreendimentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const empreendimento = await buscarEmpreendimentoPorSlug(slug);

  if (!empreendimento) {
    notFound();
  }

  // Buscar unidades do empreendimento com filtro robusto
  const propertyService = new PropertyService();
  let unidades: ReturnType<typeof buildImovelCardProps>[] = [];
  try {
    const { result } = await propertyService.searchProperties(
      { buildingName: empreendimento.nome },
      { page: 1, limit: 100 }, // Aumentar limite para pegar mais imóveis
    );

    // FILTRO CLIENT-SIDE ROBUSTO: Garante que apenas imóveis do empreendimento sejam exibidos
    // Isso compensa inconsistências de nomenclatura no Vista CRM
    const normalize = (str: string) => 
      str.toLowerCase()
         .normalize('NFD')
         .replace(/[\u0300-\u036f]/g, '') // Remove acentos
         .replace(/\s+/g, ' ')
         .trim();

    const nomeNormalizado = normalize(empreendimento.nome);
    
    const imoveisFiltrados = result.properties.filter(property => {
      const propertyBuildingName = property.buildingName?.trim() || '';
      
      if (!propertyBuildingName) {
        return false; // Imóveis sem nome de empreendimento não são incluídos
      }

      const propertyNomeNormalizado = normalize(propertyBuildingName);

      // Correspondência exata (normalizada)
      if (propertyNomeNormalizado === nomeNormalizado) {
        return true;
      }

      // Correspondência parcial forte (um contém o outro com pelo menos 70% do tamanho)
      const minLength = Math.min(nomeNormalizado.length, propertyNomeNormalizado.length);
      const maxLength = Math.max(nomeNormalizado.length, propertyNomeNormalizado.length);
      
      if (propertyNomeNormalizado.includes(nomeNormalizado) || nomeNormalizado.includes(propertyNomeNormalizado)) {
        // Só aceita se a correspondência parcial for significativa (>70%)
        return (minLength / maxLength) > 0.7;
      }

      return false;
    });

    // Log apenas em caso de problema (modo desenvolvimento)
    if (process.env.NODE_ENV === 'development' && imoveisFiltrados.length === 0 && result.properties.length > 0) {
      console.warn(`[EmpreendimentoPage] ⚠️ Nenhum imóvel encontrado para "${empreendimento.nome}" (${result.properties.length} imóveis retornados pela API)`);
    }

    // Converter Property[] para Imovel[] e depois para props do card
    const imoveisAdaptados = adaptPropertiesToImoveis(imoveisFiltrados);
    unidades = imoveisAdaptados.map(buildImovelCardProps);
  } catch (error) {
    console.error('[EmpreendimentoPage] Erro ao buscar unidades:', error);
  }

  // Combinar fotos: fotos do empreendimento + fotos das unidades
  const todasFotos = [
    ...(empreendimento.fotos || []).map(f => f.url),
    ...(empreendimento.fotosUnidades || []).slice(0, 12).map(f => f.url),
  ].filter(Boolean);

  const fotoPrincipal = todasFotos[0] || '/images/placeholder-empreendimento.jpg';
  const galeria = todasFotos.slice(1, 7); // Até 6 fotos na galeria

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <CustomImage
            src={fotoPrincipal}
            alt={empreendimento.nome}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              {empreendimento.nome}
            </h1>
            
            {empreendimento.endereco && (
              <div className="flex items-center gap-2 text-white/90 text-lg">
                <MapPin className="w-5 h-5" />
                <span>
                  {empreendimento.endereco.bairro && `${empreendimento.endereco.bairro}, `}
                  {empreendimento.endereco.cidade}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              {empreendimento.construtora && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>{empreendimento.construtora}</span>
                </div>
              )}
              
              {empreendimento.dataEntrega && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Entrega: {new Date(empreendimento.dataEntrega).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
              
              {empreendimento.unidadesDisponiveis !== undefined && empreendimento.unidadesDisponiveis > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm">
                  <Users className="w-4 h-4" />
                  <span>{empreendimento.unidadesDisponiveis} unidade{empreendimento.unidadesDisponiveis !== 1 ? 's' : ''} disponível{empreendimento.unidadesDisponiveis !== 1 ? 'eis' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      {galeria.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
          <ImageCarousel images={galeria} alt={empreendimento.nome} />
        </section>
      )}

      {/* Descrição */}
      {(empreendimento.descricao || empreendimento.descricaoCompleta) && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-lg prose-slate max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Sobre o Empreendimento</h2>
            <div className="text-slate-600 leading-relaxed whitespace-pre-line">
              {empreendimento.descricaoCompleta || empreendimento.descricao}
            </div>
          </div>
        </section>
      )}

      {/* Unidades Disponíveis */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          Unidades Disponíveis
          {unidades.length > 0 && (
            <span className="text-xl font-normal text-slate-600 ml-3">
              ({unidades.length} {unidades.length === 1 ? 'unidade' : 'unidades'})
            </span>
          )}
        </h2>

        {unidades.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unidades.map((unidade, idx) => (
              <ImovelCard key={idx} {...unidade} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200">
            <Users className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Oportunidades Exclusivas Disponíveis
            </h3>
            <div className="max-w-2xl mx-auto px-6 mb-8 space-y-3">
              <p className="text-slate-600 text-lg leading-relaxed">
                No momento, <strong>não temos unidades públicas disponíveis</strong> neste empreendimento.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Porém, <strong className="text-blue-600">trabalhamos com uma carteira exclusiva de imóveis</strong> que não são divulgados publicamente, além de realizar a <strong className="text-blue-600">captação de novas unidades</strong> diretamente com proprietários.
              </p>
              <p className="text-slate-700 text-lg font-medium">
                Fale com nossa equipe especializada e tenha acesso às melhores oportunidades!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-6">
              <a
                href={`https://wa.me/5547999999999?text=Olá! Tenho interesse em ${encodeURIComponent(empreendimento.nome)}. Gostaria de conhecer as oportunidades exclusivas e possibilidades de captação.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Falar com Especialista
              </a>
              <a
                href="/contato"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-full border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                Enviar Mensagem
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Localização */}
      {empreendimento.endereco?.coordenadas && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Localização</h2>
          <div className="rounded-2xl overflow-hidden shadow-xl h-[400px] bg-slate-100">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&q=${empreendimento.endereco.coordenadas.latitude},${empreendimento.endereco.coordenadas.longitude}&zoom=15`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mapa - ${empreendimento.nome}`}
            />
          </div>
          
          {empreendimento.endereco.rua && (
            <div className="mt-4 text-slate-600 text-center">
              <p className="text-lg">
                {empreendimento.endereco.rua}
                {empreendimento.endereco.numero && `, ${empreendimento.endereco.numero}`}
                {empreendimento.endereco.complemento && ` - ${empreendimento.endereco.complemento}`}
              </p>
              <p>
                {empreendimento.endereco.bairro && `${empreendimento.endereco.bairro} - `}
                {empreendimento.endereco.cidade}
                {empreendimento.endereco.estado && `/${empreendimento.endereco.estado}`}
                {empreendimento.endereco.cep && ` - CEP ${empreendimento.endereco.cep}`}
              </p>
            </div>
          )}
        </section>
      )}

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Interessado em {empreendimento.nome}?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Nossa equipe está pronta para atendê-lo e tirar todas as suas dúvidas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/5547999999999?text=Olá! Gostaria de mais informações sobre o ${encodeURIComponent(empreendimento.nome)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href="/contato"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-800 text-white font-semibold rounded-full hover:bg-blue-900 transition-colors duration-200"
            >
              Formulário de Contato
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
