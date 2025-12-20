'use client';

import { useState } from 'react';

/**
 * PHAROS - Property FAQ
 * 
 * Acordeão de perguntas frequentes sobre imóveis
 */

interface FAQItem {
  question: string;
  answer: string;
}

interface PropertyFAQProps {
  propertyId: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Como posso agendar uma visita?',
    answer: 'Você pode agendar uma visita preenchendo o formulário de agendamento nesta página ou entrando em contato pelo WhatsApp. Oferecemos visitas presenciais e por vídeo para sua comodidade.',
  },
  {
    question: 'Posso visitar o imóvel sem agendamento?',
    answer: 'Recomendamos agendar previamente para garantir que um de nossos corretores especializados estará disponível para acompanhá-lo e responder todas as suas dúvidas sobre o imóvel.',
  },
  {
    question: 'Quais documentos preciso para comprar?',
    answer: 'Para iniciar o processo de compra, você precisará de documentos pessoais (RG, CPF, comprovante de renda e residência). Nossos especialistas te orientarão sobre toda a documentação necessária durante o processo.',
  },
  {
    question: 'Posso financiar este imóvel?',
    answer: 'Sim! Trabalhamos com diversos bancos e condições de financiamento. Nossa equipe pode te ajudar a encontrar as melhores opções de crédito imobiliário para o seu perfil.',
  },
  {
    question: 'O imóvel está disponível para locação?',
    answer: 'As informações sobre disponibilidade para venda ou locação estão descritas nos detalhes do imóvel. Entre em contato para confirmar a disponibilidade atual e conhecer as condições.',
  },
];

export default function PropertyFAQ({ propertyId }: PropertyFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'faq_toggle', {
        property_id: propertyId,
        question_index: index,
        action: openIndex === index ? 'close' : 'open',
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-10 border border-gray-200/60">
      <h2 className="text-2xl lg:text-3xl font-light text-pharos-navy-900 mb-6 tracking-tight">
        Dúvidas Frequentes
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-pharos-blue-500/30"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-pharos-base-off transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="text-base font-semibold text-pharos-navy-900 pr-4">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-pharos-slate-500 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {openIndex === index && (
              <div className="px-5 pb-5 bg-pharos-base-off">
                <p className="text-sm text-pharos-slate-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-5 bg-pharos-base-off rounded-xl">
        <p className="text-sm text-pharos-slate-700 text-center">
          Não encontrou a resposta que procurava?{' '}
          <a
            href="#agendar-visita"
            onClick={() => {
              // Scroll suave até o form
              document.querySelector('#agendar-visita')?.scrollIntoView({ behavior: 'smooth' });
              
              // Analytics
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'faq_contact_click', {
                  property_id: propertyId,
                });
              }
            }}
            className="font-semibold text-pharos-blue-500 hover:text-pharos-blue-600 transition-colors"
          >
            Fale conosco
          </a>
        </p>
      </div>
    </div>
  );
}

