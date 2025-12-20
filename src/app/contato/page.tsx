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
          <div className="container max-w-7xl mx-auto px-4 py-3">
            <Breadcrumb
              items={[
                { name: 'Início', label: 'Início', href: '/', url: '/' },
                { name: 'Contato', label: 'Contato', href: '/contato', url: '/contato', current: true },
              ]}
            />
          </div>
        </div>
        {/* Hero Section - Compacto */}
        <section 
          className="relative h-[40vh] min-h-[400px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #054ADA 0%, #192233 60%)'
          }}
        >
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Fale com a Pharos
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Preencha o formulário e nossa equipe retorna em até 1 hora útil
            </p>
          </div>
        </section>

        {/* Quick Contact Buttons */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6">
          <ContactQuickCards />
        </section>

        {/* Main Content Grid - 60/40 */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Formulário - 3/5 (60%) */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>

            {/* Sidebar - 2/5 (40%) */}
            <div className="lg:col-span-2">
              <ContactSidebar />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
