'use client';

import { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface QuickQuestionsProps {
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  realtorWhatsapp?: string;
}

interface QuestionPill {
  icon: string;
  text: string;
}

const quickQuestionsList: QuestionPill[] = [
  { icon: '📅', text: 'Posso visitar hoje?' },
  { icon: '🔄', text: 'Aceita permuta?' },
  { icon: '💰', text: 'Qual a melhor oferta?' },
  { icon: '📄', text: 'Quais documentos preciso?' },
  { icon: '🏗️', text: 'Quando fica pronto?' },
  { icon: '🅿️', text: 'Tem mais vagas disponíveis?' },
];

export default function QuickQuestions({ 
  propertyId, 
  propertyCode, 
  propertyTitle,
  realtorWhatsapp 
}: QuickQuestionsProps) {
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState(false);
  const maxChars = 200;

  // Formatar número do WhatsApp (remover caracteres não numéricos)
  const formatWhatsAppNumber = (phone?: string): string => {
    if (!phone) return '5547991878070'; // Número padrão da Pharos
    return phone.replace(/\D/g, '');
  };

  // Enviar pergunta via WhatsApp
  const sendQuestion = (question: string) => {
    const message = `Olá! Tenho interesse no imóvel *${propertyCode}* - ${propertyTitle}.\n\n${question}`;
    const whatsappNumber = formatWhatsAppNumber(realtorWhatsapp);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Disparar analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quick_question_send', {
        property_id: propertyId,
        property_code: propertyCode,
        question_type: selectedQuestion || 'custom',
        question_length: question.length,
      });
    }

    window.open(whatsappUrl, '_blank');
  };

  // Handler para botões de pergunta rápida
  const handleQuickQuestion = (question: string) => {
    setSelectedQuestion(question);
    sendQuestion(question);
  };

  // Handler para pergunta customizada
  const handleCustomQuestion = () => {
    if (customQuestion.trim()) {
      setSelectedQuestion(null);
      sendQuestion(customQuestion);
      setCustomQuestion(''); // Limpar após enviar
    }
  };

  // Contador de caracteres
  const remainingChars = maxChars - customQuestion.length;
  const isOverLimit = remainingChars < 0;

  return (
    <section className="bg-gradient-to-br from-white to-pharos-slate-50/30 border border-pharos-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pharos-blue-500 to-pharos-blue-600 flex items-center justify-center shadow-lg shadow-pharos-blue-500/20 flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold text-pharos-navy-900 mb-2 leading-tight">
              Pergunte Rápido
            </h2>
            <p className="text-sm text-pharos-slate-600 leading-relaxed">
              Tire suas dúvidas rapidamente pelo WhatsApp
            </p>
          </div>
        </div>

        {/* Layout 2 Colunas em Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Coluna Esquerda: Pills de Perguntas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-pharos-navy-900 mb-3 uppercase tracking-wide">
              Perguntas Frequentes
            </h3>
            <div className="space-y-2">
              {quickQuestionsList.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question.text)}
                  className="group w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-pharos-blue-50 border-2 border-pharos-slate-200 hover:border-pharos-blue-500 rounded-xl text-left transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                >
                  <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {question.icon}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-pharos-slate-700 group-hover:text-pharos-blue-600 transition-colors">
                    {question.text}
                  </span>
                  <svg 
                    className="w-4 h-4 text-pharos-slate-400 group-hover:text-pharos-blue-500 group-hover:translate-x-0.5 transition-all" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Coluna Direita: Campo Customizado */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-pharos-navy-900 mb-3 uppercase tracking-wide">
              Ou escreva sua pergunta
            </h3>
            
            <div className="relative">
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onFocus={() => setFocusedField(true)}
                onBlur={() => setFocusedField(false)}
                placeholder="Digite sua dúvida aqui..."
                maxLength={maxChars}
                rows={6}
                className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-pharos-navy-900 placeholder-pharos-slate-400 focus:outline-none transition-all resize-none text-sm leading-relaxed ${
                  isOverLimit 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : focusedField
                    ? 'border-pharos-blue-500 ring-4 ring-pharos-blue-500/10'
                    : 'border-pharos-slate-200 hover:border-pharos-slate-300'
                }`}
              />
              
              {/* Character Counter */}
              <div className={`absolute bottom-4 right-4 px-2 py-1 rounded-md text-xs font-bold ${
                isOverLimit 
                  ? 'bg-red-100 text-red-600' 
                  : remainingChars < 20 
                  ? 'bg-amber-100 text-amber-600' 
                  : 'bg-pharos-slate-100 text-pharos-slate-500'
              }`}>
                {customQuestion.length}/{maxChars}
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleCustomQuestion}
              disabled={!customQuestion.trim() || isOverLimit}
              className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#25D366] to-[#20BA5A] hover:from-[#20BA5A] hover:to-[#1da851] disabled:from-pharos-slate-300 disabled:to-pharos-slate-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:active:scale-100 disabled:shadow-none"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Enviar via WhatsApp</span>
            </button>

            {/* Helper Text */}
            <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-200/50 rounded-lg">
              <svg 
                className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clipRule="evenodd" 
                />
              </svg>
              <p className="text-xs text-green-800 leading-relaxed font-medium">
                Resposta rápida direto no seu WhatsApp!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

