"use client";

import React, { useState, useMemo } from 'react';
import { Accordion, AccordionItemProps } from './Accordion';
import { Input } from './Input';

const faqData: AccordionItemProps[] = [
  {
    id: 'horario',
    title: 'Qual o horário de atendimento da Pharos?',
    content: (
      <div>
        <p className="mb-2">Nosso horário de atendimento é:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Segunda a Sexta:</strong> 9h às 18h</li>
          <li><strong>Sábado:</strong> 9h às 13h</li>
          <li><strong>Domingo:</strong> Fechado (WhatsApp com resposta no próximo dia útil)</li>
        </ul>
        <p className="mt-3">Para agendamentos fora do horário comercial, utilize nosso sistema de agendamento online.</p>
      </div>
    )
  },
  {
    id: 'agendamento',
    title: 'Como agendar uma visita a um imóvel?',
    content: (
      <div>
        <p className="mb-2">Você pode agendar uma visita de três formas:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Diretamente na página do imóvel, clicando em "Agendar Visita"</li>
          <li>Através desta página de contato, selecionando "Agendar"</li>
          <li>Pelo WhatsApp (47) 99999-9999</li>
        </ol>
        <p className="mt-3">Confirmamos o agendamento em até 30 minutos durante horário comercial.</p>
      </div>
    )
  },
  {
    id: 'documentacao',
    title: 'Quais documentos preciso para alugar ou comprar?',
    content: (
      <div>
        <p className="mb-2"><strong>Para Locação:</strong></p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>RG e CPF</li>
          <li>Comprovante de renda (3 últimos meses)</li>
          <li>Comprovante de residência</li>
          <li>Referências (pessoal e comercial)</li>
        </ul>
        <p className="mb-2"><strong>Para Compra:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>RG e CPF</li>
          <li>Certidão de casamento (se aplicável)</li>
          <li>Comprovante de renda (para financiamento)</li>
          <li>FGTS (se for utilizar)</li>
        </ul>
        <p className="mt-3 text-sm text-pharos-slate-500">Documentação adicional pode ser solicitada conforme análise individual.</p>
      </div>
    )
  },
  {
    id: 'avaliacao',
    title: 'Como funciona a avaliação do meu imóvel?',
    content: (
      <div>
        <p className="mb-3">Nossa avaliação é gratuita e inclui:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Análise de mercado comparativa (imóveis similares na região)</li>
          <li>Visita técnica presencial (opcional)</li>
          <li>Relatório detalhado com preço sugerido</li>
          <li>Estratégia de divulgação personalizada</li>
        </ol>
        <p className="mt-3">O prazo de entrega do relatório é de 48 horas úteis após a visita.</p>
      </div>
    )
  },
  {
    id: 'financiamento',
    title: 'Vocês auxiliam com financiamento imobiliário?',
    content: (
      <div>
        <p className="mb-2">Sim! Temos parceria com os principais bancos e oferecemos:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Simulação gratuita em múltiplos bancos</li>
          <li>Análise da melhor condição para seu perfil</li>
          <li>Assessoria completa durante todo processo</li>
          <li>Suporte com documentação e aprovação</li>
        </ul>
        <p className="mt-3">Entre em contato para simular sem compromisso.</p>
      </div>
    )
  },
  {
    id: 'privacidade',
    title: 'Como meus dados são protegidos?',
    content: (
      <div>
        <p className="mb-2">A Pharos está em total conformidade com a LGPD (Lei Geral de Proteção de Dados):</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Seus dados são utilizados apenas para o atendimento solicitado</li>
          <li>Nunca compartilhamos informações com terceiros sem autorização</li>
          <li>Você pode solicitar exclusão dos dados a qualquer momento</li>
          <li>Todas as comunicações exigem opt-in (consentimento)</li>
        </ul>
        <p className="mt-3">Para mais detalhes, consulte nossa <a href="/politica-privacidade" className="text-pharos-blue-500 hover:underline">Política de Privacidade</a>.</p>
      </div>
    )
  },
  {
    id: 'comissao',
    title: 'Qual o valor da comissão e taxas?',
    content: (
      <div>
        <p className="mb-2"><strong>Locação:</strong></p>
        <p className="mb-3">Não cobramos taxa do locatário. O proprietário paga a comissão de locação (1 aluguel) no fechamento do contrato.</p>
        
        <p className="mb-2"><strong>Compra/Venda:</strong></p>
        <p className="mb-3">A comissão é combinada com o proprietário e está embutida no valor anunciado. O comprador não paga taxa adicional.</p>
        
        <p className="text-sm text-pharos-slate-500">Valores e condições podem variar. Consulte-nos para informações específicas.</p>
      </div>
    )
  },
  {
    id: 'resposta',
    title: 'Em quanto tempo terei retorno após enviar o formulário?',
    content: (
      <div>
        <p className="mb-2">Nosso compromisso de resposta:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>WhatsApp:</strong> Até 30 minutos em horário comercial</li>
          <li><strong>E-mail/Formulário:</strong> Até 1 hora útil em horário comercial</li>
          <li><strong>Ligação:</strong> Retorno no mesmo dia</li>
        </ul>
        <p className="mt-3">Mensagens fora do horário comercial são respondidas no próximo dia útil pela manhã.</p>
      </div>
    )
  },
];

export const ContactFAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQ = useMemo(() => {
    if (!searchQuery.trim()) return faqData;

    const query = searchQuery.toLowerCase();
    return faqData.filter(item => 
      item.title.toLowerCase().includes(query) ||
      (typeof item.content === 'string' && item.content.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    // Track search
    if (value.trim() && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'faq_search', {
        event_category: 'contact',
        search_query: value
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-pharos-navy-900 mb-2">
          Perguntas Frequentes
        </h2>
        <p className="text-pharos-slate-500">
          Encontre respostas rápidas para as dúvidas mais comuns
        </p>
      </div>

      {/* Busca */}
      <Input
        placeholder="Buscar por palavra-chave..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        leftIcon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        }
        rightIcon={
          searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="text-pharos-slate-500 hover:text-pharos-slate-700 transition-colors"
              aria-label="Limpar busca"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )
        }
      />

      {/* Resultados */}
      {filteredFAQ.length > 0 ? (
        <Accordion items={filteredFAQ} />
      ) : (
        <div className="text-center py-12 bg-pharos-offwhite rounded-2xl">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="mx-auto mb-4 text-pharos-slate-300"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-pharos-slate-500 text-lg">
            Nenhuma pergunta encontrada para "{searchQuery}"
          </p>
          <button
            onClick={() => handleSearch('')}
            className="mt-4 text-pharos-blue-500 hover:underline font-medium"
          >
            Limpar busca
          </button>
        </div>
      )}

      {/* CTA adicional */}
      <div className="bg-pharos-blue-500 text-white rounded-2xl p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">
          Não encontrou sua resposta?
        </h3>
        <p className="mb-4 opacity-90">
          Nossa equipe está pronta para te ajudar
        </p>
        <a
          href="https://wa.me/5547999999999?text=Olá! Tenho uma dúvida que não encontrei no FAQ."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-pharos-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-pharos-offwhite transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
};

