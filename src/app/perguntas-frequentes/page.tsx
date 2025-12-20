import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown, Search, MessageCircle, Phone } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import { generateBreadcrumbSchema } from '@/utils/structuredData';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | Pharos Negócios Imobiliários',
  description: 'Tire suas dúvidas sobre compra, venda, locação e financiamento de imóveis em Balneário Camboriú. Respostas rápidas e objetivas da Pharos.',
  keywords: 'faq imobiliária, dúvidas imóveis, comprar apartamento, financiamento imobiliário, documentação imóvel',
  openGraph: {
    title: 'Perguntas Frequentes | Pharos',
    description: 'Tire suas dúvidas sobre imóveis em Balneário Camboriú. Respostas rápidas e práticas.',
    url: 'https://pharos.imob.br/perguntas-frequentes',
    type: 'website',
  },
  alternates: {
    canonical: 'https://pharos.imob.br/perguntas-frequentes',
  },
};

// FAQ data com categorias
const faqCategories = [
  {
    id: 'compra',
    title: 'Compra de Imóveis',
    icon: '🏠',
    questions: [
      {
        question: 'Como funciona o processo de compra de um imóvel?',
        answer: 'O processo inclui: 1) Busca e visita aos imóveis; 2) Negociação de valores e condições; 3) Documentação e análise jurídica; 4) Aprovação de financiamento (se aplicável); 5) Assinatura de contrato; 6) Pagamento e registro. A Pharos acompanha você em cada etapa, garantindo segurança e transparência.',
      },
      {
        question: 'Quais documentos preciso para comprar um imóvel?',
        answer: 'Documentos pessoais necessários: RG, CPF, comprovante de residência, comprovante de renda (últimos 3 meses), declaração de Imposto de Renda. Para financiamento: também são necessários extratos bancários e certidões negativas (CPF, cartório de protestos). Nossa equipe orienta todo o processo documental.',
      },
      {
        question: 'Posso financiar 100% do valor do imóvel?',
        answer: 'Geralmente, os bancos financiam até 80% do valor do imóvel avaliado, exigindo entrada mínima de 20%. Para imóveis de alto padrão, o percentual de financiamento pode ser menor. A Pharos possui parcerias com os principais bancos e pode ajudar a encontrar as melhores condições para seu perfil.',
      },
      {
        question: 'Quanto tempo leva para concluir a compra de um imóvel?',
        answer: 'O prazo médio varia de 60 a 90 dias, dependendo da forma de pagamento. Compras à vista são mais rápidas (30-45 dias), enquanto com financiamento pode levar 60-90 dias (aprovação do crédito, documentação, registro). Casos excepcionais podem ser mais rápidos ou lentos.',
      },
      {
        question: 'Posso visitar o imóvel antes de decidir?',
        answer: 'Sim! Recomendamos visitar pessoalmente todos os imóveis de seu interesse. Nossa equipe agenda visitas nos horários mais convenientes para você, incluindo finais de semana. Também oferecemos tours virtuais 360° para uma pré-seleção.',
      },
    ],
  },
  {
    id: 'venda',
    title: 'Venda de Imóveis',
    icon: '💰',
    questions: [
      {
        question: 'Como avaliar o valor do meu imóvel?',
        answer: 'A Pharos oferece avaliação gratuita baseada em: localização, metragem, estado de conservação, características do imóvel, valores de mercado da região e imóveis similares recentemente vendidos. Agende uma avaliação com nossos especialistas sem compromisso.',
      },
      {
        question: 'Quanto tempo leva para vender um imóvel?',
        answer: 'O tempo médio de venda varia de 3 a 6 meses, dependendo do tipo de imóvel, preço, localização e condições de mercado. Imóveis bem precificados e bem apresentados tendem a vender mais rápido. Nossa estratégia de marketing acelera esse processo.',
      },
      {
        question: 'Quais são os custos para vender um imóvel?',
        answer: 'Principais custos: ITBI (geralmente pago pelo comprador), escritura/registro (~2-3% do valor), certidões (R$ 200-500), laudos técnicos se necessário, e comissão da imobiliária (negociável, geralmente 5-6%). A Pharos detalha todos os custos antes de iniciar o processo.',
      },
      {
        question: 'Preciso reformar o imóvel antes de vender?',
        answer: 'Não é obrigatório, mas pequenas melhorias e reparos podem aumentar o valor e acelerar a venda. Recomendamos: pintura fresca, consertos básicos, limpeza profunda e home staging. Nossa equipe pode orientar quais investimentos trazem melhor retorno.',
      },
      {
        question: 'Como funciona a comissão da imobiliária?',
        answer: 'A comissão é um percentual sobre o valor de venda (geralmente 5-6%), pago apenas quando a venda é concretizada. Inclui: avaliação, marketing profissional, fotos e vídeos, anúncios em portais, atendimento aos interessados, visitas, negociação e assessoria jurídica/documental.',
      },
    ],
  },
  {
    id: 'locacao',
    title: 'Locação',
    icon: '🔑',
    questions: [
      {
        question: 'Quais documentos preciso para alugar um imóvel?',
        answer: 'Documentos necessários: RG, CPF, comprovante de residência, comprovantes de renda (últimos 3 meses), referências pessoais/comerciais. Garantia pode ser: fiador com imóvel próprio, seguro fiança, caução ou título de capitalização.',
      },
      {
        question: 'Como funciona o seguro fiança?',
        answer: 'O seguro fiança é uma alternativa ao fiador tradicional. A seguradora garante o pagamento de aluguéis em caso de inadimplência. O custo varia de 1 a 2 vezes o valor do aluguel mensal, pago anualmente. É mais prático e dispensa a necessidade de fiador.',
      },
      {
        question: 'Posso alugar por temporada?',
        answer: 'Sim! Balneário Camboriú é destino de temporada. Locações de temporada geralmente são de 15, 30 ou 60 dias durante alta temporada (dezembro-março). Valores são diferenciados e contratos mais flexíveis. A Pharos possui portfólio específico para temporada.',
      },
      {
        question: 'Quem paga o condomínio e IPTU?',
        answer: 'Por padrão, o locatário paga o condomínio mensal e o locador paga o IPTU anual. Porém, isso pode ser negociado e deve constar no contrato. Água, luz, gás e internet são sempre de responsabilidade do locatário.',
      },
      {
        question: 'Posso rescindir o contrato antes do prazo?',
        answer: 'Sim, mas podem existir multas contratuais. Contratos de 30 meses permitem rescisão após 12 meses sem multa. Antes disso, multa geralmente é de 3 aluguéis (antes de 12 meses) ou proporcional. Sempre consulte seu contrato específico.',
      },
    ],
  },
  {
    id: 'financiamento',
    title: 'Financiamento',
    icon: '🏦',
    questions: [
      {
        question: 'Como simular um financiamento?',
        answer: 'A Pharos oferece simulação gratuita com os principais bancos (Caixa, Banco do Brasil, Itaú, Bradesco, Santander). Informamos: valor financiável, prazo, parcelas, taxa de juros, CET e documentação necessária. Fazemos simulações comparativas para você escolher a melhor opção.',
      },
      {
        question: 'Quais são as taxas de juros atuais?',
        answer: 'As taxas variam conforme o banco, relacionamento e perfil do cliente, mas atualmente estão entre 8% e 11% ao ano + TR para pessoa física. Funcionários públicos e clientes com bom relacionamento bancário conseguem taxas menores. Consultamos as melhores taxas do mercado.',
      },
      {
        question: 'Posso usar o FGTS para comprar imóvel?',
        answer: 'Sim! O FGTS pode ser usado para: entrada, amortização de parcelas ou quitação. Requisitos: imóvel residencial, valor até R$ 1.5 milhão, não ter outro financiamento ativo, mínimo 3 anos de trabalho sob regime CLT. Podemos orientar todo o processo.',
      },
      {
        question: 'Qual o prazo máximo de financiamento?',
        answer: 'O prazo máximo é de 35 anos (420 meses), mas a última parcela deve vencer antes de você completar 80 anos. Prazos maiores reduzem a parcela mensal, mas aumentam o custo total de juros. Recomendamos simular diferentes cenários.',
      },
      {
        question: 'Posso transferir um financiamento?',
        answer: 'Sim, é possível transferir um financiamento existente (portabilidade) ou assumir o financiamento do vendedor. A portabilidade pode conseguir taxas menores. Já a assunção de dívida depende de aprovação do banco. Avaliamos a melhor estratégia para seu caso.',
      },
    ],
  },
  {
    id: 'documentacao',
    title: 'Documentação e Processos',
    icon: '📄',
    questions: [
      {
        question: 'O que é a matrícula do imóvel?',
        answer: 'A matrícula é o "RG" do imóvel, documento que comprova propriedade e histórico de transações. Contém: dados do proprietário, localização, área, confrontações, ônus (hipotecas, penhoras), averbações. Sempre solicitamos a matrícula atualizada antes de qualquer negociação.',
      },
      {
        question: 'Preciso de advogado para comprar imóvel?',
        answer: 'Não é obrigatório, mas é altamente recomendado. O advogado analisa documentação, verifica pendências legais, elabora/revisa contratos e acompanha o registro. A Pharos trabalha com advogados especializados e pode indicar profissionais confiáveis.',
      },
      {
        question: 'O que é ITBI e quem paga?',
        answer: 'ITBI é o Imposto de Transmissão de Bens Imóveis, pago ao município na transferência de propriedade. Alíquota em Balneário Camboriú é 2% sobre o valor da transação. Tradicionalmente pago pelo comprador, mas pode ser negociado. Pagamento é antes da escritura.',
      },
      {
        question: 'Quanto tempo leva para sair a escritura?',
        answer: 'O processo completo de escritura e registro leva de 30 a 60 dias. Etapas: elaboração da escritura (7-10 dias), assinatura no cartório (agendamento), recolhimento de impostos (1-3 dias), registro no cartório de imóveis (15-30 dias). Prazos variam conforme o cartório.',
      },
      {
        question: 'O que fazer se o imóvel tiver pendências?',
        answer: 'Antes de qualquer compromisso, fazemos análise completa de certidões (negativa de débitos, protestos, ações judiciais). Se houver pendências: negociamos quitação antes da venda, descontamos do valor ou exigimos regularização. Nunca recomendamos comprar imóvel com pendências graves.',
      },
    ],
  },
];

// Gerar schema FAQPage
function generateFAQSchema() {
  const allQuestions = faqCategories.flatMap(cat => cat.questions);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': allQuestions.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.answer,
      },
    })),
  };
}

export default function PerguntasFrequentesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Perguntas Frequentes', url: '/perguntas-frequentes' },
  ]);

  const faqSchema = generateFAQSchema();

  return (
    <>
      <StructuredData data={[breadcrumbSchema, faqSchema]} />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container max-w-7xl mx-auto px-4 py-3">
            <Breadcrumb
              items={[
                { name: 'Início', label: 'Início', href: '/', url: '/' },
                { name: 'Perguntas Frequentes', label: 'Perguntas Frequentes', href: '/perguntas-frequentes', url: '/perguntas-frequentes', current: true },
              ]}
            />
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-pharos-blue-600 to-pharos-navy-900 text-white py-16 md:py-24">
          <div className="container max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Perguntas Frequentes
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Tire suas dúvidas sobre compra, venda, locação e financiamento de imóveis em Balneário Camboriú
            </p>

            {/* Search box (decorativo por enquanto) */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Buscar pergunta..."
                className="w-full px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span>Não encontrou sua dúvida?</span>
              </div>
              <Link
                href="/contato"
                className="px-6 py-3 bg-white text-pharos-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Fale Conosco
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="space-y-12">
              {faqCategories.map((category) => (
                <div key={category.id} id={category.id}>
                  {/* Category Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{category.icon}</span>
                      <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
                    </div>
                    <div className="h-1 w-20 bg-pharos-blue-500 rounded-full"></div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    {category.questions.map((item, index) => (
                      <details
                        key={index}
                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-pharos-blue-300 transition-colors"
                      >
                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                          <h3 className="text-lg font-semibold text-gray-900 pr-8">
                            {item.question}
                          </h3>
                          <ChevronDown className="w-6 h-6 text-pharos-blue-600 flex-shrink-0 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-6 pb-6 pt-2 text-gray-700 leading-relaxed border-t border-gray-100">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-16 border-t border-gray-200">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ainda tem dúvidas?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Nossa equipe está pronta para ajudar você com qualquer pergunta sobre imóveis em Balneário Camboriú
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 px-8 py-4 bg-pharos-blue-600 text-white rounded-xl font-semibold hover:bg-pharos-blue-700 transition-colors shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar Mensagem
              </Link>

              <a
                href="https://wa.me/5547991878070?text=Olá! Tenho uma dúvida sobre imóveis"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg"
              >
                <Phone className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

