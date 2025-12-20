import type { Metadata } from 'next';
import Link from 'next/link';
import { FileCheck, AlertTriangle, CheckCircle2, Shield, FileText, Home } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import { generateBreadcrumbSchema } from '@/utils/structuredData';
import type { BreadcrumbItem } from '@/types';

export const metadata: Metadata = {
  title: 'Documentação para Comprar Imóvel: Guia Completo 2024 | Pharos',
  description: 'Lista completa de documentos necessários para comprar um imóvel: do comprador, do vendedor, do imóvel e para financiamento bancário. Guia atualizado 2024.',
  keywords: 'documentos compra imóvel, documentação imobiliária, comprar imóvel documentos, financiamento documentos, escritura imóvel',
  openGraph: {
    title: 'Documentação para Comprar Imóvel: Guia Completo | Pharos',
    description: 'Todos os documentos necessários para comprar seu imóvel com segurança.',
    type: 'article',
  },
};

export default function DocumentacaoImovelPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', label: 'Home', href: '/', url: '/' },
    { name: 'Guias', label: 'Guias', href: '/guias', url: '/guias' },
    { name: 'Documentação Imobiliária', label: 'Documentação Imobiliária', href: '/guias/documentacao-imovel', url: '/guias/documentacao-imovel', current: true },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  // HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como Reunir Documentação para Comprar Imóvel',
    description: 'Passo a passo para organizar toda documentação necessária na compra de imóvel',
    totalTime: 'P7D',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Documentos pessoais do comprador',
        text: 'RG, CPF, comprovante de residência e estado civil',
      },
      {
        '@type': 'HowToStep',
        name: 'Documentos do imóvel',
        text: 'Matrícula atualizada, IPTU, certidões negativas',
      },
      {
        '@type': 'HowToStep',
        name: 'Documentos para financiamento',
        text: 'Comprovantes de renda, extrato FGTS, declaração IR',
      },
      {
        '@type': 'HowToStep',
        name: 'Documentos do vendedor',
        text: 'RG, CPF, certidões e comprovação de propriedade',
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
        <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white py-16">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-semibold">Guia de Documentação</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Documentação para Comprar Imóvel: Lista Completa
              </h1>
              <p className="text-xl text-white/90">
                Todos os documentos necessários do comprador, vendedor, imóvel e financiamento. Checklist atualizado 2024.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-5xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Neste guia:</h3>
                <nav className="space-y-2 text-sm">
                  {[
                    { href: '#comprador', label: 'Documentos do Comprador' },
                    { href: '#imovel', label: 'Documentos do Imóvel' },
                    { href: '#vendedor', label: 'Documentos do Vendedor' },
                    { href: '#financiamento', label: 'Para Financiamento' },
                    { href: '#checklist', label: 'Checklist Final' },
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
                  A documentação é uma das etapas mais importantes na compra de um imóvel. Este guia completo lista todos os documentos necessários, organizados por categoria, para garantir uma transação segura e sem surpresas.
                </p>
              </div>

              {/* Alerta */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-2">Importante</h3>
                    <p className="text-yellow-800 text-sm">
                      Esta lista é geral e pode variar conforme o tipo de imóvel (novo/usado), banco financiador e estado civil. Sempre consulte seu corretor e o banco para confirmar os documentos específicos do seu caso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Documentos do Comprador */}
              <section id="comprador" className="scroll-mt-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Documentos do Comprador
                      </h2>
                      <p className="text-gray-600">Documentos pessoais necessários de quem está comprando</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Documentos Pessoais Básicos:</h3>
                      <ul className="space-y-3">
                        {[
                          'RG (Registro Geral) ou CNH dentro da validade',
                          'CPF (Cadastro de Pessoa Física)',
                          'Comprovante de residência atualizado (últimos 90 dias)',
                          'Certidão de nascimento ou casamento',
                          'Comprovante de estado civil',
                        ].map((doc, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-bold text-gray-900 mb-3">Se Casado (Regime de Bens):</h3>
                      <ul className="space-y-3">
                        {[
                          'Certidão de casamento atualizada (últimos 90 dias)',
                          'RG e CPF do cônjuge',
                          'Pacto antenupcial (se houver)',
                        ].map((doc, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-bold text-gray-900 mb-3">Certidões Negativas:</h3>
                      <ul className="space-y-3">
                        {[
                          'Certidão de Distribuição Cível (fórum)',
                          'Certidão Negativa de Débitos Federais',
                          'Certidão Negativa de Débitos Estaduais',
                          'Certidão Negativa de Débitos Municipais',
                        ].map((doc, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Documentos do Imóvel */}
              <section id="imovel" className="scroll-mt-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Documentos do Imóvel
                      </h2>
                      <p className="text-gray-600">Documentação que comprova a situação legal do imóvel</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Documentos Essenciais:</h3>
                      <ul className="space-y-3">
                        {[
                          'Matrícula atualizada do imóvel (Cartório de Registro de Imóveis)',
                          'IPTU quitado ou certidão negativa de débitos',
                          'Certidão Negativa de Ônus Reais',
                          'Habite-se ou Certificado de Conclusão de Obra',
                          'Planta aprovada pela prefeitura',
                        ].map((doc, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-bold text-gray-900 mb-3">Se Apartamento (Condomínio):</h3>
                      <ul className="space-y-3">
                        {[
                          'Convenção de condomínio',
                          'Regimento interno',
                          'Certidão negativa de débitos condominiais',
                          'Atas de assembleias (últimas 3)',
                        ].map((doc, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-900">
                          <strong>Atenção:</strong> A matrícula é o documento MAIS importante. Ela deve estar limpa, sem ônus, penhoras ou restrições. Sempre solicite a versão atualizada (últimos 30 dias).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Documentos para Financiamento */}
              <section id="financiamento" className="scroll-mt-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Documentos para Financiamento Bancário
                      </h2>
                      <p className="text-gray-600">Comprovações de renda e capacidade de pagamento</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">CLT (Trabalhador Assalariado):</h3>
                      <ul className="space-y-3">
                        {[
                          'Carteira de trabalho (páginas principais e último contrato)',
                          'Holerites dos últimos 3 meses',
                          'Extrato bancário dos últimos 3 meses',
                          'Declaração de Imposto de Renda (últimas 2)',
                          'Extrato do FGTS',
                        ].map((doc, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-bold text-gray-900 mb-3">Autônomo/Empresário:</h3>
                      <ul className="space-y-3">
                        {[
                          'Declaração de Imposto de Renda (últimas 3)',
                          'Extrato bancário (últimos 6 meses)',
                          'Contrato social ou MEI',
                          'Decore (Declaração Comprobatória) emitido por contador',
                          'Balanço patrimonial',
                        ].map((doc, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Checklist Final */}
              <section id="checklist" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-pharos-blue-600 to-pharos-navy-900 rounded-xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">
                    Checklist: Organize sua Documentação
                  </h2>
                  <div className="space-y-4">
                    <p className="text-white/90">
                      Use esta lista para não esquecer nenhum documento:
                    </p>
                    <ul className="space-y-3 text-white/90">
                      <li>□ Todos os documentos pessoais (RG, CPF, comprovante residência)</li>
                      <li>□ Certidões negativas do comprador</li>
                      <li>□ Matrícula atualizada do imóvel</li>
                      <li>□ IPTU e condomínio quitados</li>
                      <li>□ Documentos do vendedor</li>
                      <li>□ Comprovantes de renda (últimos 3-6 meses)</li>
                      <li>□ Declaração IR (2-3 últimas)</li>
                      <li>□ Extrato FGTS</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Precisa de Ajuda com a Documentação?
                </h2>
                <p className="text-gray-700 mb-6">
                  Nossa equipe pode te orientar sobre toda documentação necessária e até intermediar a solicitação de certidões e documentos junto aos órgãos competentes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/contato"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-pharos-blue-600 text-white rounded-lg font-semibold hover:bg-pharos-blue-700 transition-colors"
                  >
                    Falar com Especialista
                  </Link>
                  <Link
                    href="/guias/como-comprar-imovel"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                  >
                    Ver Guia de Compra
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

