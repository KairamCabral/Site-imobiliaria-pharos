import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CustomImage from '@/components/CustomImage';
import Breadcrumb from '@/components/Breadcrumb';
import ImovelCard from '@/components/ImovelCard';
import { gerarTituloSEO, formatarPreco } from '@/utils/seo';
import type { BreadcrumbItem, BairroInfo } from '@/types';
import { getCachedPropertyList } from '@/lib/data/propertyQueries';
import type { Imovel } from '@/types';
import { createBairroSlug, createCitySlug, normalizeSlug, parseBairroSlug } from '@/utils/locationSlug';
import type { PropertyFilters } from '@/domain/models';

const bairrosInfo: Record<string, BairroInfo & {
  galeriaFotos?: string[];
  videoYoutube?: string;
  fatos?: string[];
}> = {
  'centro': {
    id: 'centro',
    slug: 'centro',
    nome: 'Centro',
    cidade: 'Balneário Camboriú',
    estado: 'SC',
    descricao: 'O coração pulsante de Balneário Camboriú',
    descricaoCompleta:
      'O Centro de Balneário Camboriú é o epicentro da vida urbana da cidade, reunindo o melhor da infraestrutura, lazer e negócios. Com acesso direto à Praia Central e à emblemática Avenida Atlântica, o bairro oferece uma experiência cosmopolita única no litoral catarinense. A região concentra os principais arranha-céus da cidade, shopping centers, restaurantes premiados, vida noturna sofisticada e serviços de primeira linha. Perfeito para quem busca dinamismo, conveniência e proximidade a tudo que Balneário Camboriú tem a oferecer, o Centro também apresenta alta liquidez e valorização constante no mercado imobiliário.',
    imagemCapa: '/images/bairros/centro-bc.webp',
    galeriaFotos: [
      '/images/bairros/centro-bc.webp',
      '/images/bairros/Barra-Sul.webp',
      '/images/bairros/Pioneiros.png',
      '/images/bairros/Nacoes.webp',
      '/images/bairros/Praia-Brava.webp',
    ],
    videoYoutube: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    fatos: [
      'Localização central com acesso a toda cidade',
      'Maior concentração de serviços e comércio',
      'Praia Central com 7km de extensão',
      'Vida noturna sofisticada e diversificada',
      'Alta valorização e liquidez imobiliária',
      'Infraestrutura urbana completa',
    ],
    pontosInteresse: [
      'Avenida Atlântica (orla)',
      'Praia Central',
      'Parque Unipraias',
      'Balneário Shopping',
      'Molhe da Barra Sul',
      'Cristo Luz',
      'Avenida Brasil (comércio)',
      'Passarela do Samba',
    ],
    infraestrutura: [
      'Supermercados',
      'Farmácias 24h',
      'Hospitais e clínicas',
      'Escolas e universidades',
      'Academias',
      'Bancos',
    ],
    transporte: ['Linhas de ônibus', 'Táxi e Uber', 'Ciclovia', 'Estacionamentos'],
    comercio: ['Shopping centers', 'Restaurantes', 'Bares e cafés', 'Lojas diversas'],
    quantidadeImoveis: 0,
    faixaPrecoMedia: { min: 800000, max: 8000000 },
    coordenadas: { latitude: -26.9857, longitude: -48.6348 },
    metaTitle: 'Imóveis no Centro de Balneário Camboriú',
    metaDescription:
      'Encontre os melhores imóveis no Centro de Balneário Camboriú. Apartamentos, casas e coberturas próximos à praia.',
    keywords: ['centro balneário camboriú', 'imóveis centro', 'apartamento centro'],
  },
  'centro-itajai': {
    id: 'centro-itajai',
    slug: 'centro-itajai',
    nome: 'Centro',
    cidade: 'Itajaí',
    estado: 'SC',
    descricao: 'O coração histórico e financeiro de Itajaí',
    descricaoCompleta:
      'O Centro de Itajaí é o núcleo histórico, financeiro e cultural da cidade portuária mais importante de Santa Catarina. Localizado estrategicamente próximo ao Porto de Itajaí, à sofisticada Marina Itajaí e ao Rio Itajaí-Açu, o bairro combina tradição centenária com desenvolvimento urbano moderno. A região concentra serviços corporativos, bancos, comércio diversificado, gastronomia de qualidade e entretenimento cultural. Com excelente mobilidade urbana e acesso facilitado à BR-101, o Centro oferece imóveis de alta liquidez, tornando-se ideal tanto para profissionais que trabalham no porto e empresas locais quanto para investidores que buscam rentabilidade. O bairro vem passando por um processo de revitalização, valorizando seu patrimônio histórico enquanto se moderniza com novos empreendimentos.',
    imagemCapa: '/images/bairros/Praia-Brava.webp',
    galeriaFotos: [
      '/images/bairros/Barra-Sul.webp',
      '/images/bairros/centro-bc.webp',
      '/images/bairros/Praia-Brava.webp',
    ],
    videoYoutube: 'https://www.youtube.com/embed/7YpYpS_Cs64',
    fatos: [
      'Próximo ao maior porto pesqueiro do Brasil',
      'Centro financeiro e corporativo regional',
      'Mobilidade privilegiada (BR-101, cidades vizinhas)',
      'Patrimônio histórico preservado',
      'Alta liquidez imobiliária',
      'Polo gastronômico em crescimento',
    ],
    pontosInteresse: [
      'Marina Itajaí',
      'Mercado Público de Itajaí',
      'Praça Arno Bauer',
      'Teatro Municipal Pedro Ivo',
      'Porto de Itajaí',
      'Molhe de Itajaí',
      'Centreventos Itajaí',
      'Casarão Hardt (cultura)',
    ],
    infraestrutura: [
      'Hospitais e clínicas especializadas',
      'Supermercados e comércio variado',
      'Universidades (UNIVALI, IFSC)',
      'Bancos e agências',
      'Coworkings e escritórios',
      'Cartórios e serviços públicos',
    ],
    transporte: [
      'Terminal urbano central',
      'Rodoviária intermunicipal',
      'Linhas de ônibus para toda região',
      'Ciclovias integradas',
      'Fácil acesso BR-101',
    ],
    comercio: [
      'Shopping Itajaí',
      'Restaurantes variados',
      'Bares e cafés',
      'Serviços corporativos',
      'Lojas especializadas',
    ],
    quantidadeImoveis: 0,
    faixaPrecoMedia: { min: 600000, max: 6000000 },
    coordenadas: { latitude: -26.9085, longitude: -48.6616 },
    metaTitle: 'Imóveis no Centro de Itajaí',
    metaDescription:
      'Seleção de imóveis no Centro de Itajaí com fácil acesso ao porto, marina, comércio e serviços essenciais.',
    keywords: ['centro itajaí', 'imóveis centro itajaí', 'apartamento próximo ao porto'],
  },
  'fazenda-itajai': {
    id: 'fazenda-itajai',
    slug: 'fazenda-itajai',
    nome: 'Fazenda',
    cidade: 'Itajaí',
    estado: 'SC',
    descricao: 'Vista privilegiada para a Marina de Itajaí',
    descricaoCompleta:
      'O bairro Fazenda é uma das regiões mais valorizadas e estratégicas de Itajaí, oferecendo vistas privilegiadas para a sofisticada Marina Itajaí. Localizado próximo ao centro e ao porto, o bairro combina tranquilidade residencial com acesso facilitado aos principais pontos da cidade. A região vem experimentando crescente valorização imobiliária, atraindo investidores e moradores que buscam qualidade de vida aliada à conveniência urbana. Com vista panorâmica para a marina, o Rio Itajaí-Açu e as embarcações de luxo, o bairro Fazenda oferece uma atmosfera única, mesclando o charme náutico com a infraestrutura completa de uma cidade em constante desenvolvimento. Perfeito para quem aprecia o lifestyle à beira-rio e busca rentabilidade e liquidez no mercado imobiliário.',
    imagemCapa: '/images/bairros/Praia-Brava.webp',
    galeriaFotos: [
      '/images/bairros/Barra-Sul.webp',
      '/images/bairros/centro-bc.webp',
      '/images/bairros/Praia-Brava.webp',
    ],
    videoYoutube: 'https://www.youtube.com/embed/7YpYpS_Cs64',
    fatos: [
      'Vista privilegiada para a Marina Itajaí',
      'Proximidade com o centro e porto',
      'Crescente valorização imobiliária',
      'Ambiente tranquilo e residencial',
      'Acesso facilitado às principais vias',
      'Infraestrutura completa próxima',
    ],
    pontosInteresse: [
      'Marina Itajaí',
      'Rio Itajaí-Açu',
      'Porto de Itajaí',
      'Centro de Itajaí',
      'Mercado Público',
      'Orla da Marina',
      'Restaurantes à beira-rio',
    ],
    infraestrutura: [
      'Supermercados próximos',
      'Farmácias e drogarias',
      'Escolas e creches',
      'Clínicas e consultórios',
      'Academias',
      'Comércio variado',
      'Serviços essenciais',
    ],
    transporte: [
      'Linhas de ônibus municipal',
      'Fácil acesso ao centro',
      'Proximidade da BR-101',
      'Táxi e aplicativos disponíveis',
      'Acesso rápido ao porto',
    ],
    comercio: [
      'Restaurantes locais',
      'Padarias',
      'Minimercados',
      'Serviços náuticos',
      'Lojas especializadas',
    ],
    quantidadeImoveis: 0,
    faixaPrecoMedia: { min: 500000, max: 3500000 },
    coordenadas: { latitude: -26.9150, longitude: -48.6550 },
    metaTitle: 'Imóveis na Fazenda - Itajaí | Vista para a Marina',
    metaDescription:
      'Apartamentos e casas no bairro Fazenda em Itajaí com vista privilegiada para a Marina. Região em valorização com infraestrutura completa e acesso facilitado.',
    keywords: ['fazenda itajaí', 'imóveis fazenda', 'apartamento vista marina itajaí', 'fazenda itajai'],
  },
  'praia-brava-itajai': {
    id: 'praia-brava-itajai',
    slug: 'praia-brava-itajai',
    nome: 'Praia Brava',
    cidade: 'Itajaí',
    estado: 'SC',
    descricao: 'Lifestyle premium à beira-mar em Itajaí',
    descricaoCompleta:
      'A Praia Brava de Itajaí é um verdadeiro refúgio de tranquilidade e natureza, oferecendo um estilo de vida exclusivo para quem busca qualidade de vida à beira-mar. Com águas cristalinas e areia branca, a região combina a beleza natural preservada com infraestrutura de alto padrão. Perfeita para residências de veraneio ou moradia permanente, a Praia Brava de Itajaí atrai famílias e investidores que valorizam privacidade, segurança e contato com a natureza. A proximidade com Balneário Camboriú e a facilidade de acesso tornam esta região uma excelente opção para quem deseja viver em um ambiente sereno sem abrir mão da conveniência urbana.',
    imagemCapa: '/images/bairros/Praia-Brava.webp',
    galeriaFotos: [
      '/images/bairros/Praia-Brava.webp',
      '/images/bairros/centro-bc.webp',
      '/images/bairros/Barra-Sul.webp',
    ],
    videoYoutube: 'https://www.youtube.com/embed/7YpYpS_Cs64',
    fatos: [
      'Praia extensa com natureza preservada',
      'Infraestrutura moderna e em crescimento',
      'Proximidade com Balneário Camboriú',
      'Ambiente tranquilo e familiar',
      'Excelente para veraneio',
      'Alta valorização imobiliária',
    ],
    pontosInteresse: [
      'Praia Brava de Itajaí',
      'Trilhas ecológicas',
      'Beach clubs e restaurantes',
      'Mirantes naturais',
      'Comércio local',
    ],
    infraestrutura: [
      'Supermercados próximos',
      'Farmácias',
      'Escolas',
      'Academias',
      'Posto de saúde',
      'Comércio variado',
    ],
    transporte: [
      'Linhas de ônibus',
      'Acesso à BR-101',
      'Táxi e aplicativos',
      'Fácil acesso a Balneário Camboriú',
    ],
    comercio: [
      'Restaurantes à beira-mar',
      'Padarias',
      'Minimercados',
      'Lojas de conveniência',
      'Serviços essenciais',
    ],
    quantidadeImoveis: 0,
    faixaPrecoMedia: { min: 600000, max: 4000000 },
    coordenadas: { latitude: -26.9800, longitude: -48.6200 },
    metaTitle: 'Imóveis na Praia Brava - Itajaí | Lifestyle à Beira-Mar',
    metaDescription:
      'Casas e apartamentos na Praia Brava de Itajaí com infraestrutura moderna e natureza preservada. Tranquilidade, segurança e alta valorização.',
    keywords: ['praia brava itajaí', 'imóveis praia brava itajaí', 'apartamento praia brava', 'casa praia brava itajaí'],
  },
  'barra-sul': {
    id: 'barra-sul',
    slug: 'barra-sul',
    nome: 'Barra Sul',
    cidade: 'Balneário Camboriú',
    estado: 'SC',
    descricao: 'Bairro nobre com vista privilegiada para o mar',
    descricaoCompleta:
      'A Barra Sul representa o ápice da sofisticação imobiliária em Balneário Camboriú. Localizada na extremidade sul da Praia Central, próxima ao icônico Cristo Luz e ao Molhe, a região concentra os empreendimentos mais exclusivos da cidade. Com vista panorâmica deslumbrante para o oceano Atlântico, o bairro oferece privacidade, segurança e uma qualidade de vida incomparável. Os edifícios de alto padrão contam com infraestrutura completa de lazer, segurança 24h e acabamentos premium. A Barra Sul é a escolha de quem busca o melhor em localização, status e valorização patrimonial, mantendo-se próximo aos principais pontos turísticos e gastronômicos da cidade.',
    imagemCapa: '/images/bairros/Barra-Sul.webp',
    galeriaFotos: [
      '/images/bairros/Barra-Sul.webp',
      '/images/bairros/centro-bc.webp',
      '/images/bairros/Praia-Brava.webp',
      '/images/bairros/Pioneiros.png',
      '/images/bairros/Nacoes.webp',
    ],
    videoYoutube: 'https://www.youtube.com/embed/7dZ0xD6fC_8',
    fatos: [
      'Região mais nobre de Balneário Camboriú',
      'Vista panorâmica para o mar',
      'Empreendimentos de alto padrão',
      'Próximo ao Cristo Luz e Molhe',
    ],
    pontosInteresse: ['Praia da Barra Sul', 'Molhe da Barra', 'Restaurantes à beira-mar', 'Mirante da Barra', 'Marina exclusiva'],
    infraestrutura: ['Condomínios de luxo', 'Segurança privada', 'Comércio local', 'Academias premium'],
    transporte: ['Acesso facilitado', 'Estacionamentos privados'],
    comercio: ['Restaurantes', 'Cafés', 'Lojas especializadas'],
    quantidadeImoveis: 0,
    faixaPrecoMedia: { min: 2000000, max: 15000000 },
    coordenadas: { latitude: -26.995, longitude: -48.625 },
    metaTitle: 'Imóveis na Barra Sul - Balneário Camboriú',
    metaDescription:
      'Imóveis de luxo na Barra Sul. Apartamentos e coberturas com vista para o mar em um dos bairros mais exclusivos de Balneário Camboriú.',
    keywords: ['barra sul', 'imóveis luxo', 'vista mar', 'alto padrão'],
  },
  'pioneiros': {
    id: 'pioneiros',
    slug: 'pioneiros',
    nome: 'Pioneiros',
    cidade: 'Balneário Camboriú',
    estado: 'SC',
    descricao: 'Bairro residencial com infraestrutura completa',
    descricaoCompleta:
      'O bairro Pioneiros é uma das regiões mais procuradas por famílias em Balneário Camboriú. Localizado estrategicamente entre o Centro e a Praia Brava, oferece o equilíbrio perfeito entre tranquilidade residencial e proximidade aos principais pontos da cidade. Com ampla infraestrutura de serviços, comércio diversificado, escolas de qualidade e opções de lazer, o Pioneiros proporciona qualidade de vida em um ambiente familiar e seguro. O bairro conta com ruas arborizadas, praças bem cuidadas e fácil acesso às principais vias, tornando-se ideal tanto para moradia permanente quanto para investimento imobiliário.',
    imagemCapa: '/images/bairros/Pioneiros.png',
    galeriaFotos: [
      '/images/bairros/Pioneiros.png',
      '/images/bairros/centro-bc.webp',
      '/images/bairros/Barra-Sul.webp',
      '/images/bairros/Nacoes.webp',
      '/images/bairros/Praia-Brava.webp',
    ],
    videoYoutube: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    fatos: [
      'Localização estratégica entre Centro e Praia Brava',
      'Bairro familiar com alta valorização imobiliária',
      'Infraestrutura completa de serviços e comércio',
      'Ruas arborizadas e ambiente seguro',
      'Proximidade a escolas de qualidade',
      'Acesso rápido às principais praias (5-10 min)',
    ],
    pontosInteresse: [
      'Praça dos Pioneiros',
      'Colégio Energia',
      'Supermercado Giassi',
      'Parque Natural do Morro do Careca',
      'Avenida Santa Catarina (comércio)',
      'Academia Smart Fit',
    ],
    infraestrutura: [
      'Supermercados (Giassi, Angeloni)',
      'Escolas e Colégios',
      'Clínicas e Consultórios',
      'Farmácias 24h',
      'Padarias e Restaurantes',
      'Academias',
      'Bancos e Caixas Eletrônicos',
    ],
    transporte: [
      'Múltiplas linhas de ônibus municipal',
      'Ciclovia integrada',
      'Fácil acesso à Av. do Estado (via principal)',
      'Proximidade da BR-101 (10 min)',
      'Estacionamentos públicos',
      'Táxi e serviços de app disponíveis',
    ],
    comercio: [
      'Supermercados de rede',
      'Padarias artesanais',
      'Restaurantes variados',
      'Pet shops e veterinárias',
      'Lojas de materiais de construção',
      'Farmácias e drogarias',
    ],
    quantidadeImoveis: 0,
    faixaPrecoMedia: { min: 800000, max: 4500000 },
    coordenadas: { latitude: -26.975, longitude: -48.64 },
    metaTitle: 'Imóveis no Pioneiros - Balneário Camboriú | Bairro Residencial Completo',
    metaDescription:
      'Apartamentos e casas no Pioneiros, Balneário Camboriú. Bairro familiar com infraestrutura completa, escolas, comércio e próximo às praias. Confira os imóveis disponíveis.',
    keywords: [
      'pioneiros balneário camboriú',
      'imóveis pioneiros',
      'apartamento pioneiros',
      'casa pioneiros bc',
      'bairro familiar balneário camboriú',
      'imóveis residenciais pioneiros',
      'investimento pioneiros',
    ],
  },
  'nacoes': {
    id: 'nacoes',
    slug: 'nacoes',
    nome: 'Nações',
    cidade: 'Balneário Camboriú',
    estado: 'SC',
    descricao: 'Bairro tranquilo e familiar',
    descricaoCompleta:
      'O bairro Nações é um verdadeiro refúgio familiar em Balneário Camboriú. Caracterizado por suas ruas arborizadas, ambiente seguro e tranquilo, o Nações oferece qualidade de vida em um contexto residencial acolhedor. Localizado estrategicamente entre o Centro e outras regiões da cidade, o bairro conta com comércio local consolidado, serviços essenciais e fácil acesso às praias. É a escolha perfeita para famílias que buscam sossego, segurança e custo-benefício, sem abrir mão da conveniência urbana. Com imóveis de padrão médio a alto e uma comunidade estabelecida, o Nações representa uma excelente oportunidade tanto para moradia quanto para investimento de longo prazo.',
    imagemCapa: '/images/bairros/Nacoes.webp',
    galeriaFotos: [
      '/images/bairros/Nacoes.webp',
      '/images/bairros/Pioneiros.png',
      '/images/bairros/centro-bc.webp',
      '/images/bairros/Barra-Sul.webp',
    ],
    videoYoutube: 'https://www.youtube.com/embed/B1J6Ou4q8vE',
    fatos: [
      'Ambiente familiar e seguro',
      'Ruas arborizadas e bem cuidadas',
      'Excelente custo-benefício',
      'Comércio local consolidado',
      'Proximidade ao Centro (10 min)',
      'Comunidade estabelecida e tranquila',
    ],
    pontosInteresse: [
      'Praça do bairro',
      'Escolas e creches',
      'Comércio de vizinhança',
      'Igrejas e centros comunitários',
      'Parques infantis',
    ],
    infraestrutura: [
      'Supermercados',
      'Farmácias',
      'Padarias artesanais',
      'Escolas públicas e privadas',
      'Clínicas médicas',
      'Academias locais',
    ],
    transporte: [
      'Linhas de ônibus regulares',
      'Fácil acesso às vias principais',
      'Proximidade da BR-101',
    ],
    comercio: [
      'Mercados de bairro',
      'Padarias',
      'Restaurantes familiares',
      'Lojas de conveniência',
      'Serviços essenciais',
    ],
    quantidadeImoveis: 0,
    faixaPrecoMedia: { min: 600000, max: 2800000 },
    coordenadas: { latitude: -26.982, longitude: -48.642 },
    metaTitle: 'Imóveis no Nações - Balneário Camboriú',
    metaDescription:
      'Imóveis no bairro Nações, um bairro tranquilo e familiar em Balneário Camboriú. Casas e apartamentos com ótimo custo-benefício.',
    keywords: ['nações', 'bairro tranquilo', 'familiar', 'casas'],
  },
  'praia-brava': {
    id: 'praia-brava',
    slug: 'praia-brava',
    nome: 'Praia Brava',
    cidade: 'Balneário Camboriú',
    estado: 'SC',
    descricao: 'Paraíso exclusivo frente ao mar',
    descricaoCompleta:
      'A Praia Brava é considerada uma das joias do litoral catarinense e o endereço mais cobiçado de Balneário Camboriú. Com 1km de extensão de areia branca e fina, águas cristalinas em tons de azul turquesa e ondas perfeitas para o surf, a praia oferece uma experiência paradisíaca única. O bairro é refúgio de empreendimentos de altíssimo padrão, incluindo alguns dos edifícios mais icônicos e luxuosos do Brasil, como FG Empreendimentos e grandes incorporadoras internacionais. Rodeada por morros preservados e vegetação nativa, a Praia Brava combina exclusividade, privacidade e conexão com a natureza. A região conta com beach clubs sofisticados, restaurantes gourmet e infraestrutura premium, sendo ideal para investidores e moradores que buscam o máximo em qualidade de vida, status e valorização patrimonial.',
    imagemCapa: '/images/bairros/Praia-Brava.webp',
    galeriaFotos: [
      '/images/bairros/Praia-Brava.webp',
      '/images/bairros/Barra-Sul.webp',
      '/images/bairros/centro-bc.webp',
      '/images/bairros/Pioneiros.png',
    ],
    videoYoutube: 'https://www.youtube.com/embed/Y8HOfcYWZoo',
    fatos: [
      'Uma das praias mais bonitas de SC',
      'Empreendimentos de altíssimo padrão',
      'Área preservada e exclusiva',
      'Vista panorâmica para o oceano',
    ],
    pontosInteresse: ['Praia Brava', 'Trilhas ecológicas', 'Restaurantes gourmet', 'Beach clubs'],
    infraestrutura: ['Supermercados premium', 'Farmácias', 'Clínicas', 'Academias'],
    transporte: ['Acesso via Interpraias', 'Estacionamentos privados'],
    comercio: ['Restaurantes de alto padrão', 'Lojas especializadas', 'Beach clubs'],
    quantidadeImoveis: 0,
    faixaPrecoMedia: { min: 2500000, max: 15000000 },
    coordenadas: { latitude: -26.965, longitude: -48.615 },
    metaTitle: 'Imóveis na Praia Brava - Balneário Camboriú',
    metaDescription:
      'Apartamentos e coberturas de luxo na Praia Brava. Empreendimentos exclusivos frente ao mar com vista panorâmica.',
    keywords: ['praia brava', 'imóveis luxo', 'frente mar', 'alto padrão', 'vista oceano'],
  },
};

const KNOWN_CITY_SLUGS = Array.from(new Set(Object.values(bairrosInfo).map((info) => createCitySlug(info.cidade))));

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { bairroSlug, cidadeSlug } = parseBairroSlug(slug, KNOWN_CITY_SLUGS);
  const compositeKey = cidadeSlug ? `${bairroSlug}-${cidadeSlug}` : undefined;
  const fallbackKey = (compositeKey && bairrosInfo[compositeKey]) ? compositeKey : bairroSlug;
  const bairroInfo = fallbackKey ? bairrosInfo[fallbackKey] : undefined;

  if (!bairroInfo) {
    return { title: 'Bairro não encontrado' };
  }

  const neighborhoodName = bairroInfo.nome;
  const cityName = bairroInfo.cidade || findCityNameBySlug(cidadeSlug);

  try {
    const { pagination } = await getCachedPropertyList(
      {
        neighborhood: neighborhoodName,
        ...(cityName ? { city: cityName } : {}),
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      },
      { page: 1, limit: 12 },
    );

    const total = pagination?.total ?? 0;

    return {
      title: gerarTituloSEO(bairroInfo.metaTitle),
      description: `${bairroInfo.metaDescription} ${total ? `${total} imóveis selecionados.` : ''}`.trim(),
      keywords: bairroInfo.keywords.join(', '),
      openGraph: {
        title: bairroInfo.metaTitle,
        description: `${bairroInfo.metaDescription} ${total ? `${total} imóveis em destaque.` : ''}`.trim(),
        url: `https://pharosnegocios.com.br/imoveis/bairro/${slug}`,
        images: [{ url: bairroInfo.imagemCapa }],
        type: 'website',
      },
    };
  } catch (error) {
    console.warn('[Bairro Metadata] Falha ao buscar dados do provider', error);
    return {
      title: gerarTituloSEO(bairroInfo.metaTitle),
      description: bairroInfo.metaDescription,
      keywords: bairroInfo.keywords.join(', '),
      openGraph: {
        title: bairroInfo.metaTitle,
        description: bairroInfo.metaDescription,
        url: `https://pharosnegocios.com.br/imoveis/bairro/${slug}`,
        images: [{ url: bairroInfo.imagemCapa }],
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

// Imagens de fallback por cidade
const CITY_FALLBACK_IMAGES: Record<string, string> = {
  'Balneário Camboriú': '/images/bairros/centro-bc.webp',
  'Itajaí': '/images/bairros/Praia-Brava.webp',
};

export default async function ImovelPorBairroPage({ params }: PageParams) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { bairroSlug, cidadeSlug } = parseBairroSlug(slug, KNOWN_CITY_SLUGS);
  const compositeKey = cidadeSlug ? `${bairroSlug}-${cidadeSlug}` : undefined;
  const fallbackKey = (compositeKey && bairrosInfo[compositeKey]) ? compositeKey : bairroSlug || normalizeSlug(slug);
  const bairroInfo = fallbackKey ? bairrosInfo[fallbackKey] : undefined;

  if (!bairroInfo) {
    notFound();
  }

  const cityName = bairroInfo.cidade || findCityNameBySlug(cidadeSlug);
  const filters: PropertyFilters = {
    neighborhood: bairroInfo.nome,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  };

  if (cityName) {
    filters.city = cityName as PropertyFilters['city'];
  }

  const { properties, pagination, fetchedAt, cacheLayer } = await getCachedPropertyList(filters, {
    page: 1,
    limit: 200,
  });

  // Filtrar imóveis para garantir que só apareçam do bairro correto
  const normalizeNeighborhood = (name: string) => 
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais e espaços
      .trim();
  
  const targetNeighborhood = normalizeNeighborhood(bairroInfo.nome);
  
  const imoveis = properties.filter((imovel) => {
    const imovelNeighborhood = normalizeNeighborhood(imovel.endereco?.bairro || '');
    // Match exato do bairro normalizado
    return imovelNeighborhood === targetNeighborhood;
  });
  
  // Log para debug (remover em produção)
  if (imoveis.length !== properties.length) {
    console.log(`[Bairro Filter] Filtrados ${properties.length - imoveis.length} imóveis de outros bairros`);
    console.log(`[Bairro Filter] Bairro alvo: "${bairroInfo.nome}" (normalizado: "${targetNeighborhood}")`);
  }
  
  const totalImoveis = imoveis.length;
  const imoveisDisponiveis = imoveis.filter((i) => i.status === 'disponivel').length;
  const imoveisDestaque = imoveis.filter((i) => i.destaque).length;
  const menorPreco = getLowerPrice(imoveis);
  const bairroSlugCanonical = createBairroSlug(bairroInfo.nome, cityName || bairroInfo.cidade);

  // Estatísticas dinâmicas do bairro
  const calcularEstatisticas = (propriedades: Imovel[]) => {
    if (propriedades.length === 0) return null;

    const precos = propriedades.map(p => p.preco).filter(p => p > 0);
    const areas = propriedades.map(p => p.areaTotal).filter(a => a > 0);
    const quartos = propriedades.map(p => p.quartos).filter(q => q > 0);

    const precoMedio = precos.length > 0 ? Math.round(precos.reduce((a, b) => a + b, 0) / precos.length) : 0;
    const areaMed = areas.length > 0 ? Math.round(areas.reduce((a, b) => a + b, 0) / areas.length) : 0;
    const quartosMedio = quartos.length > 0 ? Math.round(quartos.reduce((a, b) => a + b, 0) / quartos.length) : 0;
    const precoM2 = areaMed > 0 && precoMedio > 0 ? Math.round(precoMedio / areaMed) : 0;

    const tiposDistribuicao = propriedades.reduce((acc, p) => {
      acc[p.tipo] = (acc[p.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tipoMaisComum = Object.entries(tiposDistribuicao).sort((a, b) => b[1] - a[1])[0];

    return {
      precoMedio,
      areaMed,
      quartosMedio,
      precoM2,
      tipoMaisComum: tipoMaisComum ? tipoMaisComum[0] : 'Apartamento',
      quantidadeTipoComum: tipoMaisComum ? tipoMaisComum[1] : 0,
    };
  };

  const estatisticas = calcularEstatisticas(imoveis);

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', label: 'Home', href: '/', url: '/' },
    { name: 'Imóveis', label: 'Imóveis', href: '/imoveis', url: '/imoveis' },
    { name: bairroInfo.nome, label: bairroInfo.nome, href: `/imoveis/bairro/${bairroSlugCanonical}`, url: `/imoveis/bairro/${bairroSlugCanonical}`, current: true },
  ];

  const hasGaleria = Boolean(bairroInfo.galeriaFotos && bairroInfo.galeriaFotos.length > 0);
  const hasVideo = Boolean(bairroInfo.videoYoutube);
  const hasFatos = Boolean(bairroInfo.fatos && bairroInfo.fatos.length > 0);

  // Determinar qual imagem usar (própria ou fallback da cidade)
  const imagemParaUsar = bairroInfo.imagemCapa && 
    bairroInfo.imagemCapa.startsWith('/images/') 
    ? bairroInfo.imagemCapa 
    : CITY_FALLBACK_IMAGES[bairroInfo.cidade] || '/images/bairros/centro-bc.webp';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="pt-6">
        <Breadcrumb items={breadcrumbs} />
      </div>

      <section 
        className="relative h-[70vh] min-h-[520px] overflow-hidden bg-gray-900"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-0">
          <CustomImage
            src={imagemParaUsar}
            alt={`Vista do bairro ${bairroInfo.nome} em ${bairroInfo.cidade}`}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" aria-hidden="true" />
        </div>

        <div className="relative container mx-auto flex h-full items-end px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
          <div className="max-w-4xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-md ring-1 ring-white/30">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white">{bairroInfo.cidade}, {bairroInfo.estado}</span>
            </div>

            <h1 
              id="hero-title" 
              className="mt-6 text-white"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
              }}
            >
              {bairroInfo.nome}
            </h1>
            <p className="mt-4 max-w-2xl text-white" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)' }}>
              {bairroInfo.descricao}
            </p>

            <div className="mt-8 inline-flex items-center gap-4 rounded-xl border border-primary/20 bg-white px-6 py-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalImoveis}</div>
                <div className="text-sm font-medium text-gray-600">Imóveis encontrados</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-white/75 sm:text-sm">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Atualizado em {fetchedAt ? new Date(fetchedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'tempo real'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span>Origem: {cacheLayer?.toUpperCase() || 'ORIGIN'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16" aria-labelledby="sobre-bairro">
        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
          {/* Header da seção */}
          <div className="mb-8">
            <h2 id="sobre-bairro" className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Sobre o {bairroInfo.nome}
            </h2>
          </div>

          {/* Descrição principal */}
          <div className="mb-10 max-w-4xl">
            <p className="text-base leading-relaxed text-gray-600">{bairroInfo.descricaoCompleta}</p>
          </div>

          {/* Estatísticas dinâmicas do mercado imobiliário */}
          {estatisticas && estatisticas.precoMedio > 0 && (
            <div className="mb-10 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Análise do Mercado Imobiliário
                </h3>
                <p className="text-sm text-gray-600 mt-2">Dados atualizados baseados em {totalImoveis} {totalImoveis === 1 ? 'imóvel disponível' : 'imóveis disponíveis'} no bairro</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Preço Médio</span>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatarPreco(estatisticas.precoMedio)}</div>
                  <div className="text-xs text-gray-500 mt-1">Valor médio dos imóveis</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Área Média</span>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{estatisticas.areaMed}m²</div>
                  <div className="text-xs text-gray-500 mt-1">Metragem média</div>
                </div>

                {estatisticas.precoM2 > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Preço/m²</span>
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatarPreco(estatisticas.precoM2)}</div>
                    <div className="text-xs text-gray-500 mt-1">Por metro quadrado</div>
                  </div>
                )}

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Tipo Popular</span>
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{estatisticas.tipoMaisComum}</div>
                  <div className="text-xs text-gray-500 mt-1">{estatisticas.quantidadeTipoComum} {estatisticas.quantidadeTipoComum === 1 ? 'unidade' : 'unidades'}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">💡 Insight:</strong> No {bairroInfo.nome}, o tipo de imóvel mais procurado é <strong>{estatisticas.tipoMaisComum}</strong>, com preço médio de <strong>{formatarPreco(estatisticas.precoMedio)}</strong> e área média de <strong>{estatisticas.areaMed}m²</strong>. {estatisticas.quartosMedio > 0 && `A maioria possui cerca de ${estatisticas.quartosMedio} ${estatisticas.quartosMedio === 1 ? 'quarto' : 'quartos'}.`}
                </p>
              </div>
            </div>
          )}

          {/* Grid de informações */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pontos de Interesse */}
            <div>
              {/* Pontos de Interesse */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Pontos de Interesse
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {bairroInfo.pontosInteresse.map((ponto, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2 transition-colors hover:bg-blue-50"
                    >
                      <svg className="h-4 w-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{ponto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Por que morar aqui */}
            {hasFatos && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Por que morar aqui
                </h3>
                <ul className="grid gap-2.5 sm:grid-cols-2" role="list">
                  {bairroInfo.fatos!.map((fato, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm leading-relaxed text-gray-700">{fato}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          </div>
      </section>

      {(hasGaleria || hasVideo) && (
        <section className="bg-gray-50 py-16" aria-labelledby="galeria-heading">
          <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
            <header className="text-center">
              <h2 id="galeria-heading" className="text-3xl font-bold text-gray-900">
                Conheça o bairro
              </h2>
              <p className="mt-2 text-gray-600">
                Fotos e referências do cotidiano no {bairroInfo.nome}
              </p>
            </header>

            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              {hasGaleria && (
                <div>
                  <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
                    <svg className="mr-2 h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Galeria de fotos
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {bairroInfo.galeriaFotos!.slice(0, 6).map((foto, index) => (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-xl shadow-lg transition-transform hover:scale-105 ${index === 0 ? 'sm:col-span-2 h-64' : 'h-44'}`}
                      >
                        <CustomImage 
                          src={foto} 
                          alt={`Vista ${index + 1} do bairro ${bairroInfo.nome}, ${bairroInfo.cidade}`}
                          fill 
                          sizes="(min-width: 768px) 50vw, 100vw" 
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasVideo && (
                <div>
                  <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
                    <svg 
                      className="mr-2 h-5 w-5 text-primary" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Vídeo do bairro
                  </h3>
                  <div className="relative aspect-video overflow-hidden rounded-xl shadow-xl">
                    <iframe
                      src={bairroInfo.videoYoutube}
                      title={`Vídeo mostrando o bairro ${bairroInfo.nome}, ${bairroInfo.cidade}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-16" aria-labelledby="imoveis-heading">
        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 id="imoveis-heading" className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Imóveis no {bairroInfo.nome}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold text-primary">{totalImoveis}</span> {totalImoveis === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
              </p>
            </div>
            <div>
              <select 
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Ordenar imóveis"
              >
                <option value="relevancia">Mais relevantes</option>
                <option value="preco-asc">Menor preço</option>
                <option value="preco-desc">Maior preço</option>
                <option value="area-desc">Maior área</option>
                <option value="recente">Mais recentes</option>
              </select>
            </div>
          </div>

          {totalImoveis > 0 && imoveis.length === 0 && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-6 w-6 flex-shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">Filtragem aplicada</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    A API retornou imóveis de outros bairros que foram filtrados automaticamente. 
                    Mostrando apenas imóveis de {bairroInfo.nome}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {imoveis.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                  imagens={imovel.galeria && imovel.galeria.length > 0 ? imovel.galeria : imovel.imagemCapa ? [imovel.imagemCapa] : []}
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
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
              <svg 
                className="mx-auto mb-6 h-24 w-24 text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Nenhum imóvel encontrado</h3>
              <p className="mb-8 text-gray-600">
                Não há imóveis disponíveis no {bairroInfo.nome} no momento.<br />
                Cadastre seu interesse e seja avisado quando novos imóveis chegarem.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/contato"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/50"
                >
                  Cadastrar interesse
                </Link>
                <Link
                  href="/imoveis"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300"
                >
                  Ver todos os imóveis
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-blue-900" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />

        <div className="relative container mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/10 p-12 shadow-2xl backdrop-blur">
            <div className="mb-10 text-center">
              <div className="mb-6 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
                Atendimento Personalizado
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">Pronto para conhecer o {bairroInfo.nome}?</h2>
              <p className="text-lg text-white/85">
                Nossa equipe especializada está pronta para apresentar os melhores imóveis do bairro e conduzir você em cada etapa da negociação.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Link
                href="/contato"
                className="group flex items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 font-bold text-primary shadow-xl transition-all hover:scale-105 hover:bg-gray-50 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/50"
                aria-label={`Enviar mensagem sobre imóveis no ${bairroInfo.nome}`}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar uma mensagem
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <a
                href={`https://wa.me/5547991878070?text=Olá! Gostaria de saber mais sobre os imóveis no bairro ${bairroInfo.nome}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 rounded-xl bg-green-500 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-green-600 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-500/50"
                aria-label={`Conversar no WhatsApp sobre imóveis no ${bairroInfo.nome}`}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Conversar no WhatsApp
                <svg className="h-5 w-5 transition group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="mt-12 grid gap-6 border-t border-white/20 pt-10 text-white/85 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold">Atendimento rápido</h4>
                <p className="text-sm">Resposta em até 30 minutos</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-semibold">Imóveis verificados</h4>
                <p className="text-sm">Curadoria completa Pharos</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold">Equipe especialista</h4>
                <p className="text-sm">Corretores líderes na região</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function findCityNameBySlug(slug: string | null | undefined) {
  if (!slug) return undefined;
  const match = Object.values(bairrosInfo).find((info) => createCitySlug(info.cidade) === slug);
  return match?.cidade;
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

