'use client';

import { MessageSquare, Calendar, ChevronDown, X, Video, User } from 'lucide-react';
import { useState } from 'react';

/**
 * PHAROS - Componente de Contato Premium
 * 
 * Psicologia de Conversão aplicada:
 * 1. Hierarquia de ações (WhatsApp > Telefone > Agendar)
 * 2. Cores estratégicas (Verde WhatsApp = familiar e confiável)
 * 3. Microcopy persuasivo ("Resposta em minutos")
 * 4. Redução de atrito (1 clique, sem formulários)
 * 5. Prova social implícita ("12 pessoas visitaram hoje")
 * 6. Escassez sutil (disponibilidade)
 * 7. Affordance clara (botões grandes e legíveis)
 */

interface PropertyContactProps {
  propertyCode: string;
  propertyTitle: string;
  className?: string;
}

export default function PropertyContact({ 
  propertyCode, 
  propertyTitle,
  className = '' 
}: PropertyContactProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitType, setVisitType] = useState<'presencial' | 'video' | null>(null);
  
  // Mensagem pré-formatada para WhatsApp (reduz atrito)
  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${propertyCode}${propertyTitle ? ` - ${propertyTitle}` : ''}. Gostaria de mais informações.`
  );
  
  const whatsappUrl = `https://wa.me/5547991878070?text=${whatsappMessage}`;
  
  // Mensagem personalizada para agendamento
  const getScheduleMessage = () => {
    const tipo = visitType === 'presencial' ? 'visita presencial' : 'videochamada';
    return encodeURIComponent(
      `Olá! Gostaria de agendar uma ${tipo} para o imóvel ${propertyCode}${propertyTitle ? ` - ${propertyTitle}` : ''}. Quando seria possível?`
    );
  };
  
  return (
    <div className={className}>
      {/* CTA Principal - Sticky Sidebar */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        
        {/* Header com micro-copy persuasivo */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Interessado neste imóvel?
          </h3>
          <p className="text-sm text-gray-600">
            Fale conosco agora mesmo
          </p>
        </div>
        
        {/* CTAs Principais - Hierarquia Visual Clara */}
        <div className="p-6 space-y-3">
          
          {/* WhatsApp - Ação Primária (Menos atrito, resposta rápida) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <MessageSquare className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base">WhatsApp</div>
                  <div className="text-xs text-green-100">Resposta em minutos</div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </div>
            </div>
          </a>
          
          {/* Agendar Visita - Ação Secundária (abre modal) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-br from-pharos-blue-50 to-pharos-blue-100/50 hover:from-pharos-blue-100 hover:to-pharos-blue-200/50 border border-pharos-blue-200 text-pharos-blue-700 rounded-xl p-4 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-pharos-blue-600" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base">Agendar Visita</div>
                  <div className="text-xs text-pharos-blue-600">Escolha o melhor horário</div>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </div>
          </button>
        </div>
        
        {/* Footer com informações de suporte */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Disponível agora
            </span>
            <span className="font-mono text-gray-400">
              {propertyCode}
            </span>
          </div>
        </div>
        
      </div>
      
      {/* Mensagem de Segurança - Design Minimalista */}
      <div className="flex items-center justify-center gap-2 mt-4 px-4">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-xs text-gray-400">
          Seus dados estão protegidos
        </p>
      </div>
      
      {/* Modal de Agendamento */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsModalOpen(false);
            setVisitType(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Agende sua visita
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Como você prefere ver esse imóvel?
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setVisitType(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-3">
              {/* Opção: Presencial */}
              <button
                onClick={() => setVisitType('presencial')}
                className={`w-full border-2 rounded-xl p-4 transition-all duration-200 text-left ${
                  visitType === 'presencial'
                    ? 'border-pharos-blue-500 bg-pharos-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    visitType === 'presencial' ? 'bg-pharos-blue-100' : 'bg-gray-100'
                  }`}>
                    <User className={`w-6 h-6 ${
                      visitType === 'presencial' ? 'text-pharos-blue-600' : 'text-gray-600'
                    }`} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      Pessoalmente
                    </div>
                    <p className="text-sm text-gray-600">
                      Conheça o imóvel presencialmente com um dos nossos corretores
                    </p>
                  </div>
                  {visitType === 'presencial' && (
                    <div className="w-5 h-5 rounded-full bg-pharos-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
              
              {/* Opção: Videochamada */}
              <button
                onClick={() => setVisitType('video')}
                className={`w-full border-2 rounded-xl p-4 transition-all duration-200 text-left ${
                  visitType === 'video'
                    ? 'border-pharos-blue-500 bg-pharos-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    visitType === 'video' ? 'bg-pharos-blue-100' : 'bg-gray-100'
                  }`}>
                    <Video className={`w-6 h-6 ${
                      visitType === 'video' ? 'text-pharos-blue-600' : 'text-gray-600'
                    }`} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      Videochamada
                    </div>
                    <p className="text-sm text-gray-600">
                      Faça um tour virtual pelo imóvel por videochamada
                    </p>
                  </div>
                  {visitType === 'video' && (
                    <div className="w-5 h-5 rounded-full bg-pharos-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            </div>
            
            {/* Footer */}
            <div className="p-6 pt-0">
              <a
                href={visitType ? `https://wa.me/5547991878070?text=${getScheduleMessage()}` : '#'}
                target={visitType ? '_blank' : undefined}
                rel={visitType ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (!visitType) {
                    e.preventDefault();
                  }
                }}
                className={`block w-full text-center font-semibold py-4 rounded-xl transition-all duration-200 ${
                  visitType
                    ? 'bg-gradient-to-r from-pharos-blue-500 to-pharos-blue-600 hover:from-pharos-blue-600 hover:to-pharos-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuar
              </a>
              <p className="text-xs text-gray-500 text-center mt-3">
                Você será redirecionado para o WhatsApp
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Versão Sticky para Mobile (Flutuante na parte inferior)
 */
export function PropertyContactSticky({ 
  propertyCode, 
  propertyTitle 
}: PropertyContactProps) {
  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${propertyCode}. Gostaria de mais informações.`
  );
  
  const whatsappUrl = `https://wa.me/5547991878070?text=${whatsappMessage}`;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* WhatsApp - Full width no mobile */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-green-500 to-green-600 active:from-green-600 active:to-green-700 text-white rounded-xl py-3.5 px-4 font-semibold text-center transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" strokeWidth={2.5} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

