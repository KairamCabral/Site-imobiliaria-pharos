"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { Button } from './Button';
import PhoneInputPremium from './PhoneInputPremium';
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

type IntentType = 'comprar' | 'vender' | 'duvida' | 'parcerias' | '';

interface FormData {
  // Step 1 - Base
  intent: IntentType;
  nome: string;
  email: string;
  whatsapp: string;
  whatsappFormatted?: string; // Número formatado para display
  whatsappDDI?: string; // DDI do telefone
  preferenciaContato: string;
  aceitoContato: boolean;
  aceitoOportunidades: boolean;
  
  // Step 2 - Detalhes (condicionais)
  orcamento?: string;
  caracteristicas?: string;
  endereco?: string;
  mensagem?: string;
  
  // 🍯 Honeypot
  website?: string;
}

export const ContactForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    intent: '',
    nome: '',
    email: '',
    whatsapp: '',
    preferenciaContato: 'whatsapp',
    aceitoContato: false,
    aceitoOportunidades: false,
    website: '', // 🍯 Honeypot
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Ref para o container do formulário
  const formRef = useRef<HTMLDivElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('pharos_contact_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Erro ao carregar rascunho', e);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.nome || formData.email) {
      localStorage.setItem('pharos_contact_draft', JSON.stringify(formData));
    }
  }, [formData]);

  const intents = [
    { id: 'comprar', label: 'Comprar', icon: HomeIcon },
    { id: 'vender', label: 'Vender/Avaliar', icon: CurrencyDollarIcon },
    { id: 'duvida', label: 'Dúvida Geral', icon: ChatBubbleLeftRightIcon },
    { id: 'parcerias', label: 'Parcerias', icon: UserGroupIcon },
  ];

  const handleIntentSelect = (intent: IntentType) => {
    setFormData(prev => ({ ...prev, intent }));
    setErrors(prev => ({ ...prev, intent: undefined }));
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'contact_intent_select', {
        event_category: 'contact',
        intent: intent
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.intent) {
      newErrors.intent = 'Selecione uma opção acima';
    }

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    } else if (formData.whatsapp.replace(/\D/g, '').length < 10) {
      newErrors.whatsapp = 'WhatsApp inválido';
    }

    // Nota: aceitoContato é validado na etapa 2 (não aqui)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação da etapa 2
    if (!formData.aceitoContato) {
      setErrors({ aceitoContato: 'Você precisa autorizar o contato' });
      return;
    }

    if (!formData.mensagem?.trim() && formData.intent === 'duvida') {
      setErrors({ mensagem: 'Descreva sua dúvida' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_form_submit', {
          event_category: 'contact',
          intent: formData.intent,
          channelPreference: formData.preferenciaContato
        });
      }

      // Montar mensagem detalhada
      let detailedMessage = formData.mensagem || '';
      
      if (!detailedMessage) {
        detailedMessage = `Contato via formulário - Intenção: ${formData.intent}\n`;
        
        if (formData.orcamento) {
          detailedMessage += `Orçamento: ${formData.orcamento}\n`;
        }
        if (formData.caracteristicas) {
          detailedMessage += `Características: ${formData.caracteristicas}\n`;
        }
        if (formData.endereco) {
          detailedMessage += `Endereço: ${formData.endereco}\n`;
        }
        detailedMessage += `Preferência de contato: ${formData.preferenciaContato}`;
      }

      // Enviar APENAS para C2S (não envia para Vista)
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email,
          phone: formData.whatsapp, // E.164 format (ex: +5548999999999)
          message: detailedMessage,
          subject: `Formulário de Contato - ${formData.intent}`,
          intent: formData.intent === 'comprar' ? 'buy' : 
                  formData.intent === 'vender' ? 'sell' : 
                  formData.intent === 'parcerias' ? 'other' : 'info',
          source: 'site',
          acceptsMarketing: formData.aceitoOportunidades,
          acceptsWhatsapp: formData.preferenciaContato === 'whatsapp',
          metadata: {
            orcamento: formData.orcamento,
            caracteristicas: formData.caracteristicas,
            endereco: formData.endereco,
            preferenciaContato: formData.preferenciaContato,
            phoneFormatted: formData.whatsappFormatted,
            phoneDDI: formData.whatsappDDI,
            skipVista: true, // Flag para não enviar ao Vista
          },
        }),
      });

      const result = await response.json();

      console.log('[ContactForm] Resposta da API:', result);

      if (!result.success) {
        throw new Error(result.error || result.message || 'Erro ao enviar formulário');
      }

      // Sucesso!
      localStorage.removeItem('pharos_contact_draft');
      setSubmitSuccess(true);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_success', {
          event_category: 'contact',
          leadId: result.leadId || result.data?.leadId || `LEAD-${Date.now()}`
        });
      }

      // Reset após 4 segundos
      setTimeout(() => {
        setFormData({
          intent: '',
          nome: '',
          email: '',
          whatsapp: '',
          preferenciaContato: 'whatsapp',
          aceitoContato: false,
          aceitoOportunidades: false,
          website: '', // 🍯 Reset honeypot
        });
        setSubmitSuccess(false);
        setCurrentStep(1);
        
        // Scroll para o topo
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 4000);

    } catch (error: any) {
      console.error('[ContactForm] Erro ao enviar formulário:', error);
      
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_error', {
          event_category: 'contact',
          error: error.message || 'submit_failed'
        });
      }

      // Mostra erro amigável
      const errorMessage = error.message?.includes('Vista CRM') 
        ? 'Ops! Houve um erro técnico. Tente novamente ou entre em contato via WhatsApp.'
        : error.message || 'Erro ao enviar. Tente novamente.';

      setErrors({ mensagem: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitSuccess) {
    return (
      <div 
        className="bg-green-50 border-2 border-green-500 rounded-xl p-6 sm:p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-pharos-navy-900 mb-2">
          Mensagem enviada!
        </h3>
        <p className="text-sm sm:text-base text-pharos-slate-700">
          Retornaremos em breve no seu canal preferido.
        </p>
      </div>
    );
  }

  return (
    <div ref={formRef} className="bg-white rounded-xl border border-pharos-slate-300 p-4 sm:p-6 shadow-sm">
      {/* Progress Indicator - Mobile Optimizado */}
      <div className="flex items-center justify-between mb-5 sm:mb-6" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={2}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm sm:text-base font-semibold transition-all ${
              currentStep >= 1 ? 'bg-pharos-blue-500 text-white' : 'bg-pharos-slate-300 text-pharos-slate-500'
            }`}
            aria-label={`Etapa 1${currentStep > 1 ? ' concluída' : ' atual'}`}
          >
            {currentStep > 1 ? <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : '1'}
          </div>
          <div className={`w-12 sm:w-16 h-1 rounded-full transition-all ${currentStep >= 2 ? 'bg-pharos-blue-500' : 'bg-pharos-slate-300'}`} />
          <div 
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm sm:text-base font-semibold transition-all ${
              currentStep >= 2 ? 'bg-pharos-blue-500 text-white' : 'bg-pharos-slate-300 text-pharos-slate-500'
            }`}
            aria-label={`Etapa 2${currentStep === 2 ? ' atual' : ''}`}
          >
            2
          </div>
        </div>
        <span className="text-xs sm:text-sm text-pharos-slate-500 font-medium">
          <span className="hidden sm:inline">Etapa {currentStep} de 2</span>
          <span className="sm:hidden">{currentStep}/2</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Base */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Seletor de Intenção - Mobile Optimizado */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-pharos-navy-900 mb-3 sm:mb-4">
                Como podemos ajudar?
              </h3>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {intents.map((intent) => {
                  const Icon = intent.icon;
                  return (
                    <button
                      key={intent.id}
                      type="button"
                      onClick={() => handleIntentSelect(intent.id as IntentType)}
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 min-h-[100px] sm:min-h-[110px] touch-manipulation ${
                        formData.intent === intent.id
                          ? 'border-pharos-blue-500 bg-pharos-blue-50 shadow-md'
                          : 'border-pharos-slate-300 bg-white hover:border-pharos-blue-500 active:scale-95'
                      }`}
                      aria-pressed={formData.intent === intent.id}
                      aria-label={`Selecionar opção: ${intent.label}`}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 mb-2 text-pharos-blue-500" />
                      <span className="text-xs sm:text-sm font-medium text-pharos-navy-900 text-center leading-snug">
                        {intent.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errors.intent && (
                <p className="mt-2 text-sm text-red-500" role="alert">
                  {errors.intent}
                </p>
              )}
            </div>

            {/* Campos Base */}
            {formData.intent && (
              <div className="space-y-4 pt-4 sm:pt-5 border-t border-pharos-slate-300">
                <h3 className="text-base sm:text-lg font-semibold text-pharos-navy-900 mb-2">
                  Seus dados de contato
                </h3>

                <Input
                  label="Como devemos te chamar?"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  error={errors.nome}
                  required
                  placeholder="Seu nome completo"
                />

                <Input
                  label="E-mail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  required
                  placeholder="seu@email.com"
                />

                {/* WhatsApp com DDI Premium */}
                <div>
                  <label className="block text-sm font-medium text-pharos-navy-900 mb-2">
                    WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <PhoneInputPremium
                    value={formData.whatsapp}
                    onChange={(e164: string, formatted: string, ddi: string) => {
                      handleChange('whatsapp', e164);
                      handleChange('whatsappFormatted', formatted);
                      handleChange('whatsappDDI', ddi);
                    }}
                    onValidation={(valid: boolean) => {
                      if (!valid && formData.whatsapp) {
                        setErrors(prev => ({ ...prev, whatsapp: 'Número inválido' }));
                      } else {
                        setErrors(prev => ({ ...prev, whatsapp: undefined }));
                      }
                    }}
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-sm text-red-500">{errors.whatsapp}</p>
                  )}
                </div>

                <Select
                  label="Preferência de contato"
                  value={formData.preferenciaContato}
                  onChange={(e) => handleChange('preferenciaContato', e.target.value)}
                  options={[
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'ligacao', label: 'Ligação' },
                    { value: 'email', label: 'E-mail' },
                  ]}
                />

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleContinue}
                  icon={<ArrowRightIcon className="w-5 h-5" />}
                  iconPosition="right"
                  className="min-h-[48px] sm:min-h-[52px] text-base sm:text-lg font-semibold touch-manipulation"
                >
                  Continuar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Detalhes - Mobile Optimizado */}
        {currentStep === 2 && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-pharos-navy-900">
                Detalhes adicionais
              </h3>
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-pharos-blue-500 hover:text-pharos-blue-600 touch-manipulation min-h-[44px] min-w-[44px] justify-end"
                aria-label="Voltar para etapa anterior"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            </div>

            {/* Campos Condicionais por Intenção */}
            <div className="space-y-4">
              {formData.intent === 'comprar' && (
                <>
                  <Select
                    label="Orçamento disponível"
                    value={formData.orcamento || ''}
                    onChange={(e) => handleChange('orcamento', e.target.value)}
                    options={[
                      { value: '', label: 'Selecione sua faixa de orçamento' },
                      { value: 'ate-300k', label: 'Até R$ 300 mil' },
                      { value: '300k-500k', label: 'R$ 300 mil - R$ 500 mil' },
                      { value: '500k-800k', label: 'R$ 500 mil - R$ 800 mil' },
                      { value: '800k-1mi', label: 'R$ 800 mil - R$ 1 milhão' },
                      { value: '1mi-1.5mi', label: 'R$ 1 milhão - R$ 1,5 milhão' },
                      { value: '1.5mi-2mi', label: 'R$ 1,5 milhão - R$ 2 milhões' },
                      { value: '2mi-3mi', label: 'R$ 2 milhões - R$ 3 milhões' },
                      { value: 'acima-3mi', label: 'Acima de R$ 3 milhões' },
                    ]}
                  />

                  <Textarea
                    label="Características desejadas"
                    value={formData.caracteristicas || ''}
                    onChange={(e) => handleChange('caracteristicas', e.target.value)}
                    rows={4}
                    placeholder="Ex: 3 suítes, 2 vagas, frente mar, Praia Brava..."
                  />
                </>
              )}

              {formData.intent === 'vender' && (
                <>
                  <Input
                    label="Endereço do imóvel"
                    value={formData.endereco || ''}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                  />

                  <Textarea
                    label="Características do imóvel"
                    value={formData.caracteristicas || ''}
                    onChange={(e) => handleChange('caracteristicas', e.target.value)}
                    rows={4}
                    placeholder="Ex: Apartamento, 120m², 3 suítes, 2 vagas, ano 2018..."
                  />
                </>
              )}

              {formData.intent === 'parcerias' && (
                <>
                  <Input
                    label="Ticket de investimento"
                    value={formData.orcamento || ''}
                    onChange={(e) => handleChange('orcamento', e.target.value)}
                    placeholder="Ex: R$ 2.000.000"
                  />

                  <Textarea
                    label="Detalhes da parceria ou investimento"
                    value={formData.mensagem || ''}
                    onChange={(e) => handleChange('mensagem', e.target.value)}
                    rows={5}
                    placeholder="Descreva sua tese de investimento, tipo de parceria desejada, prazos..."
                  />
                </>
              )}

              {formData.intent === 'duvida' && (
                <Textarea
                  label="Sua dúvida"
                  value={formData.mensagem || ''}
                  onChange={(e) => handleChange('mensagem', e.target.value)}
                  error={errors.mensagem}
                  rows={6}
                  required
                  placeholder="Conte os detalhes para acelerarmos sua resposta..."
                />
              )}
            </div>

            {/* 🍯 Honeypot Field - Invisível para humanos, visível para bots */}
            <input
              type="text"
              name="website"
              value={formData.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              autoComplete="off"
              tabIndex={-1}
              style={{
                position: 'absolute',
                left: '-5000px',
                top: 'auto',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
              }}
              aria-hidden="true"
            />

            {/* Autorizações e LGPD - Etapa 2 */}
            <div className="pt-4 pb-2 space-y-3 border-t border-pharos-slate-200">
              <Checkbox
                label="Autorizo a Pharos a entrar em contato comigo por WhatsApp, telefone ou e-mail."
                checked={formData.aceitoContato}
                onChange={(e) => handleChange('aceitoContato', e.target.checked)}
                error={errors.aceitoContato}
                required
              />

              <Checkbox
                label="Quero receber oportunidades exclusivas da Pharos (opcional)."
                checked={formData.aceitoOportunidades}
                onChange={(e) => handleChange('aceitoOportunidades', e.target.checked)}
              />

              <p className="text-xs sm:text-sm text-pharos-slate-500 leading-relaxed">
                Seus dados estão protegidos conforme a LGPD.
              </p>
            </div>

            {/* Botões de ação - Mobile Optimizado */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleBack}
                icon={<ArrowLeftIcon className="w-5 h-5" />}
                className="flex-1 order-2 sm:order-1 min-h-[48px] sm:min-h-[52px] touch-manipulation"
              >
                Voltar
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting || !formData.aceitoContato}
                className="flex-[2] order-1 sm:order-2 min-h-[48px] sm:min-h-[52px] text-base sm:text-lg font-semibold touch-manipulation"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
