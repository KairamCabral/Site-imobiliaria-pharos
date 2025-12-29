"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Accordion, AccordionItemProps } from './Accordion';
import { teamMembers } from '@/data/team';

type TabType = 'contato' | 'equipe' | 'faq';

const faqItems: AccordionItemProps[] = [
  {
    id: 'horario',
    title: 'Qual o horário de atendimento?',
    content: (
      <div>
        <p className="mb-2">Nosso horário de atendimento presencial:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Segunda a Sexta:</strong> 9h às 18h</li>
          <li><strong>Sábado:</strong> 9h às 13h</li>
          <li><strong>Domingo:</strong> Fechado</li>
        </ul>
        <p className="mt-3">WhatsApp (47) 9 9187-8070 funciona 24/7 com resposta em até 15 minutos durante horário comercial.</p>
      </div>
    )
  },
  {
    id: 'agendamento',
    title: 'Como agendar uma visita a um imóvel?',
    content: (
      <div>
        <p className="mb-2">Você pode agendar de 3 formas:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Pelo formulário desta página</li>
          <li>WhatsApp: (47) 9 9187-8070</li>
          <li>Diretamente na página do imóvel desejado</li>
        </ol>
        <p className="mt-3">Confirmamos o agendamento em até 15 minutos durante horário comercial.</p>
      </div>
    )
  },
  {
    id: 'avaliacao',
    title: 'Como funciona a avaliação do meu imóvel?',
    content: (
      <div>
        <p className="mb-2">Nossa avaliação é <strong>gratuita</strong> e inclui:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Análise de mercado comparativa (imóveis similares na região)</li>
          <li>Visita técnica presencial (opcional)</li>
          <li>Relatório detalhado com preço sugerido</li>
          <li>Estratégia de divulgação personalizada</li>
        </ul>
        <p className="mt-3">Prazo de entrega: 48 horas úteis após a visita. Entre em contato pelo formulário para agendar.</p>
      </div>
    )
  },
  {
    id: 'documentacao',
    title: 'Quais documentos preciso para comprar um imóvel?',
    content: (
      <div>
        <p className="mb-2"><strong>Documentação básica:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>RG e CPF</li>
          <li>Certidão de casamento (se aplicável)</li>
          <li>Comprovante de renda</li>
          <li>Comprovante de residência</li>
        </ul>
        <p className="mt-3"><strong>Para financiamento:</strong> Documentação adicional será solicitada conforme o banco escolhido. Auxiliamos em todo o processo.</p>
      </div>
    )
  },
  {
    id: 'privacidade',
    title: 'Como meus dados são protegidos?',
    content: (
      <div>
        <p className="mb-2">A Pharos está em <strong>total conformidade com a LGPD</strong>:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Seus dados são usados apenas para atendimento</li>
          <li>Nunca compartilhamos com terceiros sem autorização</li>
          <li>Você pode solicitar exclusão a qualquer momento</li>
          <li>Todas as comunicações exigem seu consentimento</li>
        </ul>
        <p className="mt-3 text-sm">CNPJ: 51.040.966/0001-93 | CRECI: 40107</p>
      </div>
    )
  },
];

// Usar dados centralizados de team.ts
// teamMembers já foi importado no topo

export const ContactSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('contato');
  const [teamSearch, setTeamSearch] = useState('');

  const getCurrentTime = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Só mostra status se estiver aberto
    if (day === 0) return null; // Domingo fechado, não mostra
    if (day === 6) {
      if (hour >= 9 && hour < 13) return 'Aberto agora';
      return null; // Fora do horário, não mostra
    }
    if (hour >= 9 && hour < 18) return 'Aberto agora';
    return null; // Fora do horário, não mostra
  };

  const getResponseTime = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (day >= 1 && day <= 5 && hour >= 9 && hour < 18) {
      return 'Hoje, em até 15 minutos';
    }
    if (day === 6 && hour >= 9 && hour < 13) {
      return 'Hoje, em até 30 minutos';
    }
    return 'No próximo dia útil';
  };

  const handleWhatsAppClick = (phone: string, name: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'contact_team_whatsapp_click', {
        event_category: 'contact',
        team_member: name
      });
    }
    window.open(`https://wa.me/${phone}?text=Olá ${name}, vim do site da Pharos!`, '_blank');
  };

  const status = getCurrentTime();

  // Filtrar equipe por busca
  const filteredTeam = teamMembers.filter(member =>
    member.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    member.role.toLowerCase().includes(teamSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm lg:sticky lg:top-24">
      {/* Tabs Navigation - Mobile Optimizado */}
      <div 
        className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Opções de informações de contato"
      >
        <button
          onClick={() => setActiveTab('contato')}
          role="tab"
          aria-selected={activeTab === 'contato'}
          aria-controls="tab-contato"
          className={`flex-1 min-w-[90px] px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-colors relative touch-manipulation ${
            activeTab === 'contato'
              ? 'text-pharos-blue-500'
              : 'text-pharos-slate-500 hover:text-pharos-slate-700'
          }`}
        >
          Contato
          {activeTab === 'contato' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharos-blue-500" />
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('equipe')}
          role="tab"
          aria-selected={activeTab === 'equipe'}
          aria-controls="tab-equipe"
          className={`flex-1 min-w-[90px] px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-colors relative touch-manipulation ${
            activeTab === 'equipe'
              ? 'text-pharos-blue-500'
              : 'text-pharos-slate-500 hover:text-pharos-slate-700'
          }`}
        >
          Equipe
          {activeTab === 'equipe' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharos-blue-500" />
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('faq')}
          role="tab"
          aria-selected={activeTab === 'faq'}
          aria-controls="tab-faq"
          className={`flex-1 min-w-[90px] px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-colors relative touch-manipulation ${
            activeTab === 'faq'
              ? 'text-pharos-blue-500'
              : 'text-pharos-slate-500 hover:text-pharos-slate-700'
          }`}
        >
          FAQ
          {activeTab === 'faq' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharos-blue-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Contato Tab */}
        {activeTab === 'contato' && (
          <div 
            id="tab-contato" 
            role="tabpanel" 
            aria-labelledby="tab-contato"
            className="space-y-4"
          >
            {/* Tempo de Resposta */}
            <div className="bg-pharos-blue-500 text-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <ClockIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Tempo de resposta</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{getResponseTime()}</p>
            </div>

            {/* Status - só mostra quando aberto */}
            {status && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {status}
              </div>
            )}

            {/* Informações de Contato */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-pharos-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-pharos-slate-700">
                  <p className="font-medium">Rua 2300, 575, Sala 04</p>
                  <p>Centro - Balneário Camboriú/SC</p>
                  <p className="text-xs text-pharos-slate-500 mt-1">CEP: 88330-428</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-pharos-blue-500 flex-shrink-0" />
                <a href="tel:+5547991878070" className="text-sm text-pharos-slate-700 hover:text-pharos-blue-500 transition-colors">
                  (47) 9 9187-8070
                </a>
              </div>

              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-pharos-blue-500 flex-shrink-0" />
                <a href="mailto:contato@pharosnegocios.com.br" className="text-sm text-pharos-slate-700 hover:text-pharos-blue-500 transition-colors">
                  contato@pharosnegocios.com.br
                </a>
              </div>
            </div>

            {/* Como Chegar */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Rua+2300,+575,+Centro,+Balneário+Camboriú,+SC"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-pharos-blue-500 hover:bg-pharos-blue-600 active:bg-pharos-blue-700 text-white font-semibold py-3 sm:py-3.5 rounded-lg transition-all text-sm sm:text-base shadow-sm hover:shadow-md touch-manipulation min-h-[48px]"
              aria-label="Abrir localização no Google Maps"
            >
              Como chegar
            </a>

            {/* Horário e CRECI */}
            <div className="text-xs text-pharos-slate-500 pt-2 border-t border-pharos-slate-300 space-y-1">
              <p><strong>Seg-Sex:</strong> 9h às 18h | <strong>Sáb:</strong> 9h às 13h</p>
              <p className="pt-2"><strong>CRECI:</strong> 40107 | <strong>CNPJ:</strong> 51.040.966/0001-93</p>
            </div>
          </div>
        )}

        {/* Equipe Tab */}
        {activeTab === 'equipe' && (
          <div 
            id="tab-equipe" 
            role="tabpanel" 
            aria-labelledby="tab-equipe"
            className="space-y-4"
          >
            <p className="text-xs sm:text-sm text-pharos-slate-500">
              Fale diretamente com nossos especialistas
            </p>

            {/* Busca de Equipe */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar corretor..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-2 pl-10 text-sm border border-pharos-slate-300 rounded-lg focus:ring-2 focus:ring-pharos-blue-500 focus:border-pharos-blue-500 outline-none transition-all min-h-[44px] sm:min-h-0"
                aria-label="Buscar corretor por nome ou cargo"
              />
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pharos-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Lista de Equipe */}
            <div className="space-y-2 max-h-[350px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredTeam.length > 0 ? (
                filteredTeam.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 sm:p-3 rounded-lg border border-pharos-slate-300 hover:border-pharos-blue-500 transition-colors group"
                  >
                    {/* Foto do corretor */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-pharos-slate-200 flex-shrink-0 relative">
                      {member.photo ? (
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          sizes="(max-width: 640px) 48px, 56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-pharos-slate-300">
                          <UserIcon className="w-6 h-6 sm:w-7 sm:h-7 text-pharos-slate-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-pharos-navy-900 text-sm sm:text-base truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-pharos-slate-500 truncate">
                        {member.role}
                      </p>
                    </div>

                    <button
                      onClick={() => handleWhatsAppClick(member.whatsapp, member.name)}
                      className="w-11 h-11 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 active:bg-green-700 transition-all flex-shrink-0 shadow-sm hover:shadow-md touch-manipulation"
                      aria-label={`Falar com ${member.name} no WhatsApp`}
                      title={`WhatsApp ${member.name}`}
                    >
                      <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-pharos-slate-500">
                  <p className="text-sm">Nenhum corretor encontrado</p>
                </div>
              )}
            </div>

            {/* Contador */}
            {filteredTeam.length > 0 && (
              <div className="text-xs text-pharos-slate-500 text-center pt-2 border-t border-pharos-slate-300">
                {filteredTeam.length} {filteredTeam.length === 1 ? 'corretor' : 'corretores'} {teamSearch ? 'encontrado(s)' : 'disponível(is)'}
              </div>
            )}
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div 
            id="tab-faq" 
            role="tabpanel" 
            aria-labelledby="tab-faq"
            className="space-y-4"
          >
            <p className="text-xs sm:text-sm text-pharos-slate-500 mb-4">
              Respostas rápidas para dúvidas comuns
            </p>
            
            <Accordion items={faqItems} />

            <div className="text-center pt-2">
              <p className="text-xs text-pharos-slate-500 mb-3">
                Não encontrou sua resposta?
              </p>
              <a
                href="https://wa.me/5547991878070?text=Olá! Tenho uma dúvida."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-pharos-blue-500 hover:text-pharos-blue-600 font-medium text-sm transition-colors touch-manipulation min-h-[44px] justify-center"
                aria-label="Abrir WhatsApp para tirar dúvidas"
              >
                <PhoneIcon className="w-4 h-4" />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
