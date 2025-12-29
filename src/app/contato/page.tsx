import React from 'react';
import { Metadata } from 'next';
import { ContactQuickCards } from '@/components/ContactQuickCards';
import { ContactForm } from '@/components/ContactForm';
import { ContactSidebar } from '@/components/ContactSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/utils/structuredData';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Contato | Pharos Negócios Imobiliários',
  description: 'Entre em contato com a Pharos para encontrar o imóvel perfeito em Balneário Camboriú. Atendimento personalizado para alto padrão e lançamentos exclusivos.',
  keywords: 'contato pharos, imobiliária balneário camboriú, agendar visita, falar com corretor, atendimento imobiliário',
  openGraph: {
    title: 'Contato | Pharos Negócios Imobiliários',
    description: 'Fale com a Pharos e encontre o imóvel dos seus sonhos em Balneário Camboriú. Atendimento premium e consultoria especializada.',
    url: 'https://pharos.imob.br/contato',
    siteName: 'Pharos Negócios Imobiliários',
    images: [
      {
        url: 'https://pharos.imob.br/images/og-contato.jpg',
        width: 1200,
        height: 630,
        alt: 'Entre em contato com a Pharos',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contato | Pharos Negócios Imobiliários',
    description: 'Fale com a Pharos e encontre o imóvel dos seus sonhos em Balneário Camboriú.',
    images: ['https://pharos.imob.br/images/og-contato.jpg'],
  },
  alternates: {
    canonical: 'https://pharos.imob.br/contato',
  },
};

export default function ContatoPage() {
  // Usar structured data centralizado
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Contato', url: '/contato' },
  ]);

  return (
    <>
      <StructuredData data={[localBusinessSchema, breadcrumbSchema]} />

      <main className="min-h-screen bg-pharos-offwhite">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <Breadcrumb
              items={[
                { name: 'Início', label: 'Início', href: '/', url: '/' },
                { name: 'Contato', label: 'Contato', href: '/contato', url: '/contato', current: true },
              ]}
            />
          </div>
        </div>

        {/* Hero Section - Mobile-First Optimizado */}
        <section 
          className="relative min-h-[280px] sm:min-h-[320px] md:h-[40vh] md:min-h-[400px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #054ADA 0%, #192233 60%)'
          }}
          role="banner"
          aria-label="Seção de contato"
        >
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              Fale com a Pharos
            </h1>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
              Preencha o formulário e nossa equipe retorna em até 1 hora útil
            </p>
          </div>
        </section>

        {/* Quick Contact Buttons */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6" aria-label="Botões de contato rápido">
          <ContactQuickCards />
        </section>

        {/* Main Content Grid - Mobile-First */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Formulário - 3/5 (60%) em desktop */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <ContactForm />
            </div>

            {/* Sidebar - 2/5 (40%) em desktop - Aparece primeiro em mobile */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <ContactSidebar />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
