import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { LazySection } from '@/components/LazySection';

export const metadata = {
  title: 'Para Vendedores | Pharos Negócios Imobiliários',
  description: 'Serviços especializados para quem deseja vender ou alugar seu imóvel. Anuncie com a Pharos e tenha uma experiência personalizada.',
};

export default function ParaVendedores() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Hero */}
      <section className="relative bg-secondary-800 text-white py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 to-secondary-800/70">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ 
            backgroundImage: 'url("/banner-home.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-h2 md:text-h1 font-bold mb-6">
              Venda ou alugue seu imóvel com quem entende do mercado
            </h1>
            <p className="text-body-lg mb-8 text-tertiary-300">
              A Pharos oferece soluções completas para proprietários que desejam vender ou alugar seus imóveis com segurança e tranquilidade.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">Anunciar imóvel</Button>
              <Button variant="secondary" size="lg">Solicitar avaliação</Button>
            </div>
          </div>
        </div>
      </section>

      <LazySection
        as="section"
        className="py-16 bg-white"
        rootMargin="260px 0px"
        fallback={<section className="py-16 bg-white" />}>
        <div className="container mx-auto px-4">
          <h2 className="text-h3 font-bold text-center mb-4">Nossos serviços para vendedores</h2>
          <p className="text-body-lg text-secondary-600 text-center max-w-3xl mx-auto mb-12">
            Conheça os serviços exclusivos que a Pharos oferece para quem deseja vender ou alugar seu imóvel.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-tertiary-50 rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-h5 font-bold mb-3">Anúncio de imóvel</h3>
              <p className="text-secondary-600 mb-4">
                Anuncie seu imóvel em nossa plataforma com fotos profissionais e descrições detalhadas para atrair mais compradores.
              </p>
              <Link href="/para-vendedores/anunciar-imovel" className="text-primary font-medium inline-flex items-center">
                Saiba mais
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="bg-tertiary-50 rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-h5 font-bold mb-3">Avaliação gratuita</h3>
              <p className="text-secondary-600 mb-4">
                Receba uma avaliação profissional do valor do seu imóvel baseada em dados de mercado e características do seu imóvel.
              </p>
              <Link href="/para-vendedores/avaliacao-gratuita" className="text-primary font-medium inline-flex items-center">
                Saiba mais
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="bg-tertiary-50 rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-h5 font-bold mb-3">Consultoria especializada</h3>
              <p className="text-secondary-600 mb-4">
                Tenha um consultor dedicado para orientá-lo em todas as etapas da venda, desde a preparação do imóvel até a negociação final.
              </p>
              <Link href="/para-vendedores/consultoria" className="text-primary font-medium inline-flex items-center">
                Saiba mais
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </LazySection>

      <LazySection
        as="section"
        className="py-16 bg-tertiary-50"
        rootMargin="260px 0px"
        fallback={<section className="py-16 bg-tertiary-50" />}>
        <div className="container mx-auto px-4">
          <h2 className="text-h3 font-bold text-center mb-4">Por que escolher a Pharos?</h2>
          <p className="text-body-lg text-secondary-600 text-center max-w-3xl mx-auto mb-12">
            Somos especialistas em imóveis de alto padrão e oferecemos um atendimento personalizado para cada cliente.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col space-y-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 mr-4">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-h6 font-bold mb-2">Especialistas em alto padrão</h3>
                  <p className="text-secondary-600">
                    Nossa equipe é especializada em imóveis de alto padrão, entendendo as particularidades deste mercado.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 mr-4">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-h6 font-bold mb-2">Marketing imobiliário eficiente</h3>
                  <p className="text-secondary-600">
                    Utilizamos estratégias avançadas de marketing digital para dar maior visibilidade ao seu imóvel.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 mr-4">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-h6 font-bold mb-2">Transparência em todas as etapas</h3>
                  <p className="text-secondary-600">
                    Acompanhamento transparente de todo o processo, com relatórios periódicos sobre as visitas e feedback dos interessados.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden h-96">
              <Image 
                src="/balneario-camboriu.jpg" 
                alt="Imóveis em Balneário Camboriú" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </LazySection>

      <LazySection
        as="section"
        className="py-16 bg-primary text-white"
        rootMargin="320px 0px"
        fallback={<section className="py-16 bg-primary text-white" />}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-h3 font-bold mb-6">Pronto para vender seu imóvel?</h2>
          <p className="text-body-lg max-w-3xl mx-auto mb-8">
            Entre em contato conosco hoje mesmo e descubra como podemos ajudá-lo a vender seu imóvel pelo melhor preço e no menor tempo possível.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg">Anunciar imóvel</Button>
            <Button variant="ghost" size="lg" className="text-white border-2 border-white hover:bg-white/10">Falar com consultor</Button>
          </div>
        </div>
      </LazySection>
    </div>
  );
} 