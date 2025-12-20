import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, FileText, Calculator, Home, Shield } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import { generateBreadcrumbSchema } from '@/utils/structuredData';
import type { BreadcrumbItem } from '@/types';

export const metadata: Metadata = {
  title: 'Como Comprar um Imóvel: Guia Completo Passo a Passo | Pharos',
  description: 'Guia completo sobre como comprar um imóvel: documentação, financiamento, avaliação, escritura e todos os passos até a entrega das chaves.',
  keywords: 'como comprar imóvel, passo a passo compra imóvel, documentos compra imóvel, financiamento imobiliário, escritura imóvel',
  openGraph: {
    title: 'Como Comprar um Imóvel: Guia Completo | Pharos',
    description: 'Tudo que você precisa saber para comprar seu imóvel com segurança.',
    type: 'article',
  },
};

export default function ComoComprarImovelPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', label: 'Home', href: '/', url: '/' },
    { name: 'Guias', label: 'Guias', href: '/guias', url: '/guias' },
    { name: 'Como Comprar um Imóvel', label: 'Como Comprar um Imóvel', href: '/guias/como-comprar-imovel', url: '/guias/como-comprar-imovel', current: true },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  // HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como Comprar um Imóvel',
    description: 'Guia completo passo a passo para comprar um imóvel com segurança',
    totalTime: 'P90D', // ~90 dias
    step: [
      {
        '@type': 'HowToStep',
        name: 'Defina seu orçamento',
        text: 'Calcule quanto você pode pagar de entrada e parcela mensal considerando renda e despesas',
        url: 'https://pharos.imob.br/guias/como-comprar-imovel#orcamento',
      },
      {
        '@type': 'HowToStep',
        name: 'Busque o imóvel ideal',
        text: 'Pesquise imóveis que atendam suas necessidades de localização, tamanho e características',
        url: 'https://pharos.imob.br/guias/como-comprar-imovel#busca',
      },
      {
        '@type': 'HowToStep',
        name: 'Visite os imóveis',
        text: 'Agende visitas e avalie estado de conservação, documentação e vizinhança',
        url: 'https://pharos.imob.br/guias/como-comprar-imovel#visita',
      },
      {
        '@type': 'HowToStep',
        name: 'Verifique a documentação',
        text: 'Confira matrícula, certidões negativas, IPTU e comprovantes do vendedor',
        url: 'https://pharos.imob.br/guias/como-comprar-imovel#documentacao',
      },
      {
        '@type': 'HowToStep',
        name: 'Negocie o preço',
        text: 'Faça uma proposta baseada em pesquisa de mercado e condições do imóvel',
        url: 'https://pharos.imob.br/guias/como-comprar-imovel#negociacao',
      },
      {
        '@type': 'HowToStep',
        name: 'Solicite o financiamento',
        text: 'Escolha o banco, entregue documentos e aguarde aprovação do crédito',
        url: 'https://pharos.imob.br/guias/como-comprar-imovel#financiamento',
      },
      {
        '@type': 'HowToStep',
        name: 'Assine o contrato',
        text: 'Com advogado, assine escritura no cartório e registre o imóvel em seu nome',
        url: 'https://pharos.imob.br/guias/como-comprar-imovel#escritura',
      },
      {
        '@type': 'HowToStep',
        name: 'Receba as chaves',
        text: 'Após registro, receba as chaves e faça vistoria final do imóvel',
        url: 'https://pharos.imob.br/guias/como-comprar-imovel#entrega',
      },
    ],
  };

  return (
    <>
      <StructuredData data={[breadcrumbSchema, howToSchema]} />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container max-w-5xl mx-auto px-4 py-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-pharos-blue-600 to-pharos-navy-900 text-white py-16">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-semibold">Guia Completo</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Como Comprar um Imóvel: Passo a Passo Completo
              </h1>
              <p className="text-xl text-white/90">
                Tudo que você precisa saber para comprar seu imóvel com segurança, do planejamento até a entrega das chaves.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-5xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Sumário */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Neste guia:</h3>
                <nav className="space-y-2 text-sm">
                  {[
                    { href: '#orcamento', label: '1. Defina seu orçamento' },
                    { href: '#busca', label: '2. Busque o imóvel' },
                    { href: '#visita', label: '3. Visite os imóveis' },
                    { href: '#documentacao', label: '4. Documentação' },
                    { href: '#negociacao', label: '5. Negociação' },
                    { href: '#financiamento', label: '6. Financiamento' },
                    { href: '#escritura', label: '7. Escritura' },
                    { href: '#entrega', label: '8. Entrega' },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-pharos-blue-600 transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              {/* Intro */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Comprar um imóvel é uma das decisões mais importantes da vida. Este guia completo vai te acompanhar em cada etapa do processo, desde o planejamento financeiro até a entrega das chaves, garantindo uma compra segura e sem surpresas.
                </p>
              </div>

              {/* Passo 1 */}
              <section id="orcamento" className="scroll-mt-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-pharos-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calculator className="w-6 h-6 text-pharos-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        1. Defina seu Orçamento
                      </h2>
                      <p className="text-gray-600">O primeiro passo é saber quanto você pode gastar</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Como calcular:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Renda mensal:</strong> A parcela não deve ultrapassar 30% da sua renda líquida
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Entrada:</strong> Bancos geralmente financiam até 80%, então você precisa de 20% de entrada
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>FGTS:</strong> Pode ser usado para entrada ou amortização (saldo mínimo de 3 anos)
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Custos extras:</strong> Reserve 5-8% do valor para ITBI, registro e escritura
                        </div>
                      </li>
                    </ul>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <strong>Dica:</strong> Use nossa calculadora de financiamento para simular parcelas e ver quanto você consegue financiar baseado na sua renda.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Passo 2 */}
              <section id="busca" className="scroll-mt-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        2. Busque o Imóvel Ideal
                      </h2>
                      <p className="text-gray-600">Defina suas prioridades e comece a pesquisa</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">O que considerar:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Localização:</strong> Proximidade do trabalho, escolas, comércio e transporte
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Tamanho:</strong> Número de quartos, banheiros, vagas e área total
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Características:</strong> Lazer, segurança, vista, andar, exposição solar
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Valorização:</strong> Potencial de crescimento da região e infraestrutura futura
                        </div>
                      </li>
                    </ul>

                    <Link
                      href="/imoveis"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-pharos-blue-600 text-white rounded-lg font-semibold hover:bg-pharos-blue-700 transition-colors mt-4"
                    >
                      Ver Imóveis Disponíveis
                    </Link>
                  </div>
                </div>
              </section>

              {/* Continuar com outros passos... */}
              {/* Adicionar seções 3-8 seguindo o mesmo padrão */}

              {/* CTA Final */}
              <div className="bg-gradient-to-br from-pharos-navy-900 to-pharos-blue-700 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">
                  Precisa de Ajuda Profissional?
                </h2>
                <p className="text-white/90 mb-6">
                  Nossa equipe especializada pode te guiar em todas as etapas da compra do seu imóvel, desde a escolha até a entrega das chaves.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/contato"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pharos-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Falar com Especialista
                  </Link>
                  <Link
                    href="/imoveis"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Ver Imóveis
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

