import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Home, Calculator, Shield, BookOpen } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import type { BreadcrumbItem } from '@/types';

export const metadata: Metadata = {
  title: 'Guias Imobiliários: Tudo sobre Compra e Venda de Imóveis | Pharos',
  description: 'Guias completos sobre compra, venda e financiamento de imóveis. Documentação, processo, dicas e tudo que você precisa saber.',
  keywords: 'guias imobiliários, como comprar imóvel, documentação imóvel, financiamento, compra e venda',
};

export default function GuiasPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', label: 'Home', href: '/', url: '/' },
    { name: 'Guias', label: 'Guias', href: '/guias', url: '/guias', current: true },
  ];

  const guias = [
    {
      slug: 'como-comprar-imovel',
      title: 'Como Comprar um Imóvel',
      description: 'Guia completo passo a passo: do planejamento até a entrega das chaves',
      icon: Home,
      color: 'blue',
      duration: '10 min de leitura',
    },
    {
      slug: 'documentacao-imovel',
      title: 'Documentação Imobiliária',
      description: 'Lista completa de documentos necessários para comprar um imóvel',
      icon: FileText,
      color: 'green',
      duration: '8 min de leitura',
    },
    {
      slug: 'financiamento-imobiliario',
      title: 'Financiamento Imobiliário',
      description: 'Tudo sobre financiamento: como funciona, bancos, simulação e aprovação',
      icon: Calculator,
      color: 'purple',
      duration: '12 min de leitura',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-pharos-navy-900 to-pharos-blue-700 text-white py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-semibold">Central de Conhecimento</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Guias Imobiliários Completos
            </h1>
            <p className="text-xl text-white/90">
              Tudo que você precisa saber sobre compra, venda e financiamento de imóveis em um só lugar.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Guias Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {guias.map((guia) => {
            const Icon = guia.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
            }[guia.color];

            return (
              <Link
                key={guia.slug}
                href={`/guias/${guia.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClasses} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-pharos-blue-600 transition-colors">
                  {guia.title}
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {guia.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{guia.duration}</span>
                  <span className="text-pharos-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                    Ler guia
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-pharos-blue-600 to-pharos-navy-900 rounded-2xl p-12 text-white text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Nossa equipe de especialistas está pronta para te ajudar em cada etapa da sua jornada imobiliária.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pharos-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Falar com Especialista
          </Link>
        </div>
      </div>
    </div>
  );
}

