'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from "next/link";
import Image from "next/image";
import SearchFilter from "@/components/SearchFilter";
import PropertyShowcaseCarousel from "@/components/PropertyShowcaseCarousel";
import type { Empreendimento, Imovel } from "@/types";
import { LazySection } from "@/components/LazySection";
import { createBairroSlug } from '@/utils/locationSlug';
import { AnimatedSection } from '@/components/AnimatedSection';

// Lazy load componentes pesados (client-side only para evitar erros de SSR)
const EmpreendimentoCard = dynamic(() => import("@/components/EmpreendimentoCard"), {
  loading: () => <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />,
  ssr: false
});
const LogosCarousel = dynamic(() => import('@/components/LogosCarousel'), {
  loading: () => <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />,
  ssr: false
});
const VideoTestimonials = dynamic(() => import('@/components/VideoTestimonials'), {
  loading: () => <div className="h-screen bg-gray-50 animate-pulse" />,
  ssr: false
});
const AnunciarForm = dynamic(() => import("@/components/AnunciarForm"), {
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
    </div>
  ),
  ssr: false
});

// Placeholders SVG otimizados (< 1KB cada, substituem Unsplash)
import { PLACEHOLDERS } from '@/utils/placeholders';

const placeholderImagens = {
  apartamentoModerno: PLACEHOLDERS.apartamento,
  salaApartamento: PLACEHOLDERS.sala,
  vistaApartamentoLuxo: PLACEHOLDERS.apartamento,
  sacadaApartamentoCidade: PLACEHOLDERS.apartamento,
  casaExteriorModerna: PLACEHOLDERS.casa,
  cozinhaApartamento: PLACEHOLDERS.cozinha,
  quartoApartamentoAconchegante: PLACEHOLDERS.quarto,
  bannerImobiliaria: PLACEHOLDERS.banner,
  cidadeBalneario: PLACEHOLDERS.cidade,
  cidadeItapema: PLACEHOLDERS.cidade,
  retratoPessoa1: PLACEHOLDERS.pessoa,
  retratoPessoa2: PLACEHOLDERS.pessoa,
  retratoPessoa3: PLACEHOLDERS.pessoa,
  retratoPessoa4: PLACEHOLDERS.pessoa,
  vistaAereaBalneario: PLACEHOLDERS.banner,
};

// Imóveis em destaque - carregados da API
// (Mantém array vazio como fallback, será populado via API)

// Dados simulados para bairros
const bairrosDestaque = [
  {
    id: "centro",
    nome: "Centro",
    descricao: "O coração de Balneário Camboriú, com as melhores opções de lazer, comércio e gastronomia.",
    imagem: "/images/bairros/centro-bc.webp",
    quantidadeImoveis: 145
  },
  {
    id: "pioneiros",
    nome: "Pioneiros",
    descricao: "Bairro residencial com excelente infraestrutura e próximo às principais praias.",
    imagem: "/images/bairros/Pioneiros.png",
    quantidadeImoveis: 87
  },
  {
    id: "barra-sul",
    nome: "Barra Sul",
    descricao: "Região nobre com vista privilegiada e os empreendimentos mais exclusivos da cidade.",
    imagem: "/images/bairros/Barra-Sul.webp",
    quantidadeImoveis: 112
  },
  {
    id: "nacoes",
    nome: "Nações",
    descricao: "Bairro tranquilo e familiar com fácil acesso às praias e excelente opção de moradia permanente.",
    imagem: "/images/bairros/Nacoes.webp",
    quantidadeImoveis: 94
  },
  {
    id: "praia-brava",
    nome: "Praia Brava",
    descricao: "Região exclusiva com praias de águas cristalinas e empreendimentos de alto padrão frente ao mar.",
    imagem: "/images/bairros/Praia-Brava.webp",
    quantidadeImoveis: 68
  }
];

// Depoimentos movidos para VideoTestimonials.tsx (usando vídeos)

// Parceiros (marcas) - logos das construtoras reais
const logosParceiros = [
  { id: 'fg', src: '/images/construtoras/FG.svg', alt: 'FG Empreendimentos' },
  { id: 'aikon', src: '/images/construtoras/Aikon.svg', alt: 'Aikon' },
  { id: 'bella-cyntra', src: '/images/construtoras/Bella Cyntra.svg', alt: 'Bella Cyntra' },
  { id: 'cechinel', src: '/images/construtoras/cechinel.svg', alt: 'Cechinel' },
  { id: 'ck', src: '/images/construtoras/CK.svg', alt: 'CK' },
  { id: 'embraed', src: '/images/construtoras/embraed.svg', alt: 'Embraed' },
  { id: 'haacke', src: '/images/construtoras/Haacke.svg', alt: 'Haacke' },
  { id: 'ja-russi', src: '/images/construtoras/JA Russi.svg', alt: 'JA Russi' },
  { id: 'pioneira', src: '/images/construtoras/pioneira.svg', alt: 'Pioneira' },
  { id: 'procave', src: '/images/construtoras/procave.svg', alt: 'Procave' },
];

type CacheLayer = 'memory' | 'redis' | 'origin';

type SectionMeta = {
  lastUpdated: number | null;
  cacheLayer: CacheLayer;
};

type HomeClientProps = {
  exclusivos: Imovel[];
  superDestaque: Imovel[];
  frenteMar: Imovel[];
  exclusivosMeta: SectionMeta;
  frenteMarMeta: SectionMeta;
  empreendimentos?: Empreendimento[];
};

export default function HomeClient({
  exclusivos,
  superDestaque,
  frenteMar,
  exclusivosMeta,
  frenteMarMeta,
  empreendimentos = [],
}: HomeClientProps) {
  const imoveisExclusivos = exclusivos;
  const imoveisSuperDestaque = superDestaque;
  const imoveisFrenteMar = frenteMar;
  const atualizadoImoveis = exclusivosMeta.lastUpdated;
  const atualizadoFrenteMar = frenteMarMeta.lastUpdated;

  return (
    <>
      {/* Hero Section - Above the Fold com imagem otimizada */}
      <AnimatedSection as="section" className="relative h-[65vh] min-h-[680px] bg-gray-900">
        {/* Imagem de fundo otimizada para mobile-first com picture para servir tamanhos adequados */}
        <picture>
          <source 
            media="(max-width: 640px)" 
            srcSet="/images/banners/optimized/balneario-camboriu-mobile.avif"
            type="image/avif"
          />
          <source 
            media="(max-width: 640px)" 
            srcSet="/images/banners/optimized/balneario-camboriu-mobile.webp"
            type="image/webp"
          />
          <source 
            media="(max-width: 1024px)" 
            srcSet="/images/banners/optimized/balneario-camboriu-tablet.avif"
            type="image/avif"
          />
          <source 
            media="(max-width: 1024px)" 
            srcSet="/images/banners/optimized/balneario-camboriu-tablet.webp"
            type="image/webp"
          />
          <source 
            media="(min-width: 1025px)" 
            srcSet="/images/banners/optimized/balneario-camboriu-desktop.avif"
            type="image/avif"
          />
          <source 
            media="(min-width: 1025px)" 
            srcSet="/images/banners/optimized/balneario-camboriu-desktop.webp"
            type="image/webp"
          />
          <Image
            src="/images/banners/optimized/balneario-camboriu-desktop.webp" 
            alt="Imóveis de alto padrão em Balneário Camboriú" 
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSI2ODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFhMjAzMCIvPjwvc3ZnPg=="
          />
        </picture>
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10"></div>
        
        {/* Conteúdo */}
        <div className="h-full flex items-start md:items-center pt-20 sm:pt-24 md:pt-24 pb-8 relative z-20">
          <SearchFilter variant="hero" />
        </div>
      </AnimatedSection>
      
      <AnimatedSection delay={100}>
        <PropertyShowcaseCarousel
          id="exclusivos"
          badge="Destaques"
          title="Imóveis Exclusivos"
          subtitle="Balneário Camboriú"
          backgroundClass="bg-gray-50"
          ctaHref="/imoveis?isExclusive=1"
          ctaLabel="Ver todos"
          properties={imoveisExclusivos}
          loading={false}
          loadingCount={6}
          error={null}
          refreshing={false}
          lastUpdated={atualizadoImoveis ?? null}
          cacheLayer={exclusivosMeta.cacheLayer}
        />
      </AnimatedSection>

      {imoveisSuperDestaque.length > 0 && (
        <AnimatedSection delay={150}>
          <PropertyShowcaseCarousel
            id="destaques"
            badge="Destaques"
            title="Imóveis em Destaque"
            backgroundClass="bg-white"
            ctaHref="/imoveis"
            ctaLabel="Ver todos"
            properties={imoveisSuperDestaque}
            loading={false}
            loadingCount={6}
            error={null}
            cacheLayer={exclusivosMeta.cacheLayer}
          />
        </AnimatedSection>
      )}

      <AnimatedSection delay={200}>
        <PropertyShowcaseCarousel
          id="frente-mar"
          badge="Vista Mar"
          title="Imóveis Frente Mar"
          description="Um cenário à altura das suas conquistas"
          backgroundClass="bg-gray-50"
          ctaHref="/imoveis?caracLocalizacao=Frente%20Mar"
          ctaLabel="Explorar frente mar"
          properties={imoveisFrenteMar}
          loading={false}
          loadingCount={3}
          error={null}
          refreshing={false}
          lastUpdated={atualizadoFrenteMar ?? null}
          cacheLayer={frenteMarMeta.cacheLayer}
        />
      </AnimatedSection>
      
      {/* Empreendimentos em Destaque - Lazy loading otimizado */}
      <LazySection
        as="section"
        className="py-24 md:py-28 lg:py-32 bg-white"
        rootMargin="500px 0px"
        fallback={
          <div className="py-24 md:py-28 lg:py-32 bg-white">
            <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-[10px] font-semibold text-pharos-blue-500 uppercase tracking-[0.2em] mb-6">
              Lançamentos e Obras
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-pharos-navy-900 mb-6 leading-tight">
              Empreendimentos de Alto Padrão
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conheça os melhores empreendimentos imobiliários de Balneário Camboriú, com infraestrutura completa e acabamento premium
            </p>
          </div>
          
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-9 mb-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-9 mb-12">
              {empreendimentos.slice(0, 3).map((empreendimento) => (
                <EmpreendimentoCard key={empreendimento.id} empreendimento={empreendimento} />
              ))}
            </div>
          </Suspense>
          
          <div className="text-center mt-12">
            <Link 
              href="/empreendimentos"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-5 px-12 rounded-xl text-lg transition-all hover:shadow-xl hover:scale-[1.02] group"
            >
              Ver Todos os Empreendimentos
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </LazySection>
      
      {/* Bairros em Destaque - Carrossel */}
      <LazySection
        as="section"
        className="py-24 md:py-28 lg:py-32 bg-gray-50"
        rootMargin="600px 0px"
        fallback={<div className="py-24 md:py-28 lg:py-32 bg-gray-50 animate-pulse" />}
      >
        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-[10px] font-semibold text-pharos-blue-500 uppercase tracking-[0.2em] mb-6">
              Regiões
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-pharos-navy-900 mb-6 leading-tight">
              Bairros em Destaque
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conheça os melhores bairros de Balneário Camboriú e encontre o local perfeito para viver
            </p>
          </div>
          
          {/* Carrossel de Bairros */}
          <div className="relative group/carousel">
            {/* Botão anterior */}
            <button 
              onClick={() => {
                const container = document.getElementById('bairros-carousel');
                if (container) container.scrollLeft -= 400;
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hidden lg:block"
              aria-label="Anterior"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Botão próximo */}
            <button 
              onClick={() => {
                const container = document.getElementById('bairros-carousel');
                if (container) container.scrollLeft += 400;
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hidden lg:block"
              aria-label="Próximo"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div 
              id="bairros-carousel"
              className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-7 pb-4 scroll-smooth"
            >
            {bairrosDestaque.map((bairro) => (
                <div 
                  key={bairro.id} 
                  className="group bg-pharos-base-white rounded-xl overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 border border-pharos-slate-300 flex-shrink-0 w-[85vw] md:w-[45vw] lg:w-[30vw] xl:w-[23vw] snap-start"
                >
                    <div className="relative h-56 w-full overflow-hidden bg-pharos-base-off">
                    <Image
                    src={bairro.imagem}
                    alt={bairro.nome}
                    fill
                      sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 23vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                      quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Nome do bairro na imagem */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{bairro.nome}</h3>
                    <span className="text-sm font-medium text-white/90">{bairro.quantidadeImoveis} imóveis disponíveis</span>
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-pharos-slate-500 text-sm leading-relaxed mb-4">{bairro.descricao}</p>
                  <Link 
                    href={`/imoveis/bairro/${createBairroSlug(bairro.nome, 'Balneário Camboriú')}`}
                    className="inline-flex items-center gap-2 text-pharos-blue-500 hover:text-pharos-blue-600 font-semibold text-sm transition-colors group-hover:gap-3"
                  >
                    Ver imóveis
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </LazySection>
      
      {/* Impacto e Confiança - Seção Institucional Premium */}
      <LazySection
        as="section"
        className="relative py-24 md:py-28 lg:py-32 bg-gradient-to-b from-white via-[#F7FAFF] to-white overflow-hidden"
        rootMargin="700px 0px"
        fallback={<div className="relative py-24 md:py-28 lg:py-32 bg-gradient-to-b from-white via-[#F7FAFF] to-white animate-pulse" />}
      >
        {/* Arcos decorativos no topo (semicículos) */}
        <div className="absolute inset-x-0 -top-[520px] h-[1040px] overflow-hidden pointer-events-none opacity-70">
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[1200px] h-[1200px] rounded-full border border-blue-100/60"></div>
            <div className="absolute left-1/2 -translate-x-1/2 top-[80px] w-[960px] h-[960px] rounded-full border border-blue-100/50"></div>
            <div className="absolute left-1/2 -translate-x-1/2 top-[160px] w-[720px] h-[720px] rounded-full border border-blue-100/40"></div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl">
          {/* Headline de impacto - Hero da seção */}
          <div className="text-center mb-20 md:mb-24">
            <span className="inline-block text-[10px] font-semibold text-pharos-blue-500 uppercase tracking-[0.2em] mb-6">
              Tamanho do nosso impacto
            </span>
            
            <div className="max-w-5xl mx-auto">
              <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-pharos-blue-500 tracking-tight leading-none mb-6">
                R$ 200+ milhões
              </h3>
              <p className="text-pharos-slate-500 text-lg md:text-xl leading-relaxed font-normal max-w-2xl mx-auto">
                VGV em imóveis vendidos através da Pharos
              </p>
            </div>
          </div>
            
          {/* Métricas principais - Cards com divisores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-20 md:mb-24 max-w-7xl mx-auto bg-pharos-base-off p-1 rounded-2xl">
            <div className="relative text-center px-6 py-10 rounded-xl bg-pharos-base-white border-r border-pharos-slate-300 last:border-r-0">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-pharos-navy-900 mb-4">500+</div>
              <p className="text-pharos-slate-500 text-sm md:text-base leading-relaxed font-normal">
                Imóveis ativos anunciados
              </p>
            </div>
            
            <div className="relative text-center px-6 py-10 rounded-xl bg-pharos-base-white border-r border-pharos-slate-300 last:border-r-0">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-pharos-navy-900 mb-4">100%</div>
              <p className="text-pharos-slate-500 text-sm md:text-base leading-relaxed font-normal">
                Focados em apartamentos no litoral
              </p>
            </div>
            
            <div className="relative text-center px-6 py-10 rounded-xl bg-pharos-base-white border-r border-pharos-slate-300 last:border-r-0">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-pharos-navy-900 mb-4">7</div>
              <p className="text-pharos-slate-500 text-sm md:text-base leading-relaxed font-normal">
                Dias na semana atendendo
              </p>
            </div>
            
            <div className="relative text-center px-6 py-10 rounded-xl bg-white">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-pharos-navy-900 mb-4">5+</div>
              <p className="text-pharos-slate-500 text-sm md:text-base leading-relaxed font-normal">
                Anos de experiência
              </p>
            </div>
          </div>
            
          {/* Logos de parceiros - Seção separada */}
          <div className="text-center mb-12 md:mb-16">
            <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-pharos-navy-900 leading-tight max-w-4xl mx-auto">
              Selecionamos e trabalhamos com as melhores construtoras
            </h4>
          </div>
          
          <Suspense fallback={
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
          }>
            <LogosCarousel logos={logosParceiros} />
          </Suspense>
        </div>
      </LazySection>
      
      {/* Depoimentos em Vídeo - Experiência Moderna tipo Rede Social */}
      <LazySection
        as="section"
        rootMargin="800px 0px"
        fallback={<div className="h-screen bg-gray-50 animate-pulse" />}
      >
        <Suspense fallback={<div className="h-screen bg-gray-50 animate-pulse" />}>
          <VideoTestimonials />
        </Suspense>
      </LazySection>
      
      {/* Venda seu Imóvel - CTA Premium */}
      <LazySection
        as="section"
        className="relative py-24 md:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-blue-800"
        rootMargin="900px 0px"
        fallback={<div className="py-24 md:py-28 lg:py-32 bg-gradient-to-br from-primary via-primary-600 to-blue-800 animate-pulse" />}
      >
        {/* Padrões decorativos de fundo sofisticados */}
        <div className="absolute inset-0">
          {/* Círculos difusos */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl"></div>
          
          {/* Anéis concêntricos */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[800px] h-[800px] border border-white/10 rounded-full"></div>
            <div className="absolute inset-0 w-[650px] h-[650px] border border-white/5 rounded-full m-auto"></div>
            <div className="absolute inset-0 w-[500px] h-[500px] border border-white/5 rounded-full m-auto"></div>
          </div>

          {/* Grid pattern sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>
        
        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Conteúdo à esquerda */}
            <div className="text-white">
              <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold tracking-[0.2em] uppercase mb-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Venda com a Pharos
                </span>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 leading-tight">
                Venda seu imóvel com quem entende do mercado
              </h2>
              
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-12 max-w-xl">
                Avaliação gratuita, assessoria completa e os melhores compradores do litoral catarinense. 
                Transformamos sua venda em uma experiência tranquila e lucrativa.
              </p>

              <div className="space-y-6 mb-14">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Avaliação profissional gratuita</h3>
                    <p className="text-white/80 text-base leading-relaxed">Análise completa do valor de mercado do seu imóvel</p>
                  </div>
            </div>
            
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Divulgação premium</h3>
                    <p className="text-white/80 text-base leading-relaxed">Seu imóvel nos melhores portais e redes sociais</p>
                  </div>
              </div>
              
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Suporte jurídico e documental</h3>
                    <p className="text-white/80 text-base leading-relaxed">Acompanhamento completo até a assinatura</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-white/90">
                  <span className="font-bold">+100 proprietários</span> já venderam conosco
                </p>
              </div>
              </div>
              
            {/* Formulário à direita */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 lg:p-12 border border-white/20">
              <Suspense fallback={
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-32 bg-gray-200 rounded-xl"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              }>
                <AnunciarForm />
              </Suspense>
            </div>
          </div>
        </div>
      </LazySection>
      
      {/* Equipe Pharos Negócios - Ultra Premium & Tecnológico */}
      <LazySection
        as="section"
        className="relative py-24 md:py-32 lg:py-36 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
        rootMargin="1000px 0px"
        fallback={<div className="py-24 md:py-32 lg:py-36 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 animate-pulse" />}
      >
        {/* Background patterns tecnológicos */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af08_1px,transparent_1px),linear-gradient(to_bottom,#1e40af08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
            <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
            <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold tracking-[0.2em] uppercase mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Nossa Equipe
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
              Conheça a{' '}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                Pharos Negócios
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Especialistas em negócios imobiliários de alto padrão no litoral catarinense. 
              Uma equipe dedicada, experiente e apaixonada por conectar pessoas aos seus sonhos
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-start">
            <div className="relative group max-w-xl mx-auto lg:mx-0 w-full mb-8 lg:mb-0">
              {/* Glow effect premium nas bordas */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-blue-500/40 to-primary/40 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-700"></div>
              
              {/* Frame premium com gradiente */}
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-primary/20 to-blue-500/20">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube-nocookie.com/embed/lcYYUkt1uTQ?modestbranding=1&rel=0&showinfo=0&controls=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1&playsinline=1"
                      title="Pharos Negócios - Nossa Equipe"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                  
                  {/* Overlay decorativo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
              
              {/* Elementos decorativos sofisticados */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full blur-xl pointer-events-none hidden sm:block"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-primary/10 rounded-full blur-xl pointer-events-none hidden sm:block"></div>
              
              {/* Linhas decorativas */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/20 rounded-tl-2xl pointer-events-none hidden md:block"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/20 rounded-br-2xl pointer-events-none hidden md:block"></div>
            </div>

              <div className="space-y-10 md:space-y-12">
              <div className="grid grid-cols-2 gap-5 md:gap-7">
                <div className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">5+</div>
                    <div className="text-sm text-gray-400">Anos no mercado</div>
                  </div>
                </div>

                <div className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">6+</div>
                    <div className="text-sm text-gray-400">Corretores especializados</div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 md:space-y-7">
                <div className="flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Especialização exclusiva</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Focados 100% em apartamentos de alto padrão no litoral catarinense
                    </p>
                  </div>
              </div>
              
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Atendimento ágil</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Disponíveis 7 dias por semana para atender suas necessidades
                </p>
              </div>
            </div>

                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Conhecimento de mercado</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Análise profunda de tendências e oportunidades de investimento
                    </p>
                  </div>
          </div>
        </div>
        
              <div className="pt-2 md:pt-4">
                <a
                  href="https://wa.me/554791878070"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white py-3.5 md:py-4 px-7 md:px-8 rounded-xl font-semibold transition-all duration-300 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 hover:scale-[1.03]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Fale com nossa equipe
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </LazySection>
      
      {/* Call to Action - Minimalista & Tecnológico */}
      <LazySection
        as="section"
        className="relative overflow-hidden py-20 md:py-24 text-white bg-gradient-to-br from-primary via-primary-600 to-blue-800"
        rootMargin="1200px 0px"
        fallback={<div className="py-20 md:py-24 bg-gradient-to-br from-primary via-primary-600 to-blue-800 animate-pulse" />}
      >
        {/* Background minimalista */}
        <div className="pointer-events-none absolute inset-0">
          {/* Círculos difusos */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"></div>
          
          {/* Grid pattern sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="relative container mx-auto px-6 sm:px-10 md:px-16 max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Pronto para encontrar seu{' '}
              <span className="text-white">
                imóvel dos sonhos?
              </span>
            </h2>
            
            <p className="text-base md:text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Nossa equipe está pronta para ajudá-lo a encontrar o imóvel perfeito em Balneário Camboriú
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
              {/* Botão Secundário */}
            <Link 
              href="/contato"
                className="group/btn inline-flex items-center justify-center gap-3 rounded-xl border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white px-10 py-5 text-lg font-semibold transition-all duration-200"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              Fale Conosco
            </Link>

              {/* Botão Principal */}
            <Link 
              href="/imoveis"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-white/90 text-primary px-10 py-5 text-lg font-bold transition-all duration-200 shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02]"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              Ver Imóveis Disponíveis
            </Link>
            </div>
          </div>
    </div>
      </LazySection>
    </>
  );
}
