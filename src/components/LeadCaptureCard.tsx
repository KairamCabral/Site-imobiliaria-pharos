'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getLeadService } from '@/services/LeadService';
import { useToast } from '@/hooks/useToast';
import { useTracking } from '@/hooks/useTracking';
import PhoneInputPremium from './PhoneInputPremium';

/**
 * PHAROS - Lead Capture Card (PREMIUM v3)
 * 
 * Card de alta conversão com:
 * - UI/UX Premium com técnicas avançadas
 * - Sticky scroll otimizado com constraints
 * - DDI simplificado (mostra apenas +55 após seleção)
 * - Micro-interações e feedback visual
 * - Validação robusta BR + internacional
 * - Idempotência via hash
 * - Telemetria completa
 */

interface Realtor {
  id?: string;
  name: string;
  photo?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  creci?: string;
  online?: boolean;
}

interface LeadCaptureCardProps {
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  realtor?: Realtor;
  className?: string;
}

// Simple SHA-256 hash for idempotency (client-side)
async function simpleHash(str: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return str.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
  }, 0).toString(16);
}

export default function LeadCaptureCard({
  propertyId,
  propertyCode,
  propertyTitle,
  realtor,
  className = '',
}: LeadCaptureCardProps) {
  const [name, setName] = useState('');
  const [phoneE164, setPhoneE164] = useState('');
  const [phoneFormatted, setPhoneFormatted] = useState('');
  const [phoneDDI, setPhoneDDI] = useState('+55');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [nameInFocus, setNameInFocus] = useState(false);
  const [phoneInFocus, setPhoneInFocus] = useState(false);
  const [website, setWebsite] = useState(''); // 🍯 Honeypot field
  const toast = useToast();
  const { trackPropertyContactView, trackPropertyContactStart, trackLead } = useTracking();

  // Track card impression (visualização do formulário)
  useEffect(() => {
    trackPropertyContactView({
      id: propertyId,
      code: propertyCode,
      title: propertyTitle,
      price: 0, // Preço não disponível aqui
      type: 'property',
      city: '',
      state: '',
      realtor: realtor && realtor.id ? {
        id: realtor.id,
        name: realtor.name,
      } : undefined,
    });
  }, [propertyId, propertyCode, propertyTitle, realtor, trackPropertyContactView]);

  // Capturar UTMs da URL
  const getUTMsFromURL = () => {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      term: params.get('utm_term') || undefined,
      content: params.get('utm_content') || undefined,
    };
  };

  // Handle phone input changes
  const handlePhoneChange = (e164: string, formatted: string, ddi: string) => {
    setPhoneE164(e164);
    setPhoneFormatted(formatted);
    setPhoneDDI(ddi);
  };

  // Handle validation callback
  const handlePhoneValidation = (valid: boolean) => {
    setIsPhoneValid(valid);
  };

  // Computed: is form valid
  const isValid = name.trim().length >= 3 && isPhoneValid && !isSubmitting;

  // Track início de preenchimento (quando começa a digitar)
  const handleNameChange = (value: string) => {
    setName(value);
    if (value.length === 1 && !name) {
      // Primeiro caractere digitado
      trackPropertyContactStart({
        id: propertyId,
        code: propertyCode,
        title: propertyTitle,
        price: 0,
        type: 'property',
        city: '',
        state: '',
        realtor: realtor && realtor.id ? {
        id: realtor.id,
        name: realtor.name,
      } : undefined,
      });
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const leadService = getLeadService();
      const utms = getUTMsFromURL();
      
      // Idempotency key
      const idempotencyData = `${propertyId}-${phoneE164}-${name}-${Date.now()}`;
      const idempotencyKey = await simpleHash(idempotencyData);

      const payload = {
        name: name.trim(),
        phone: phoneFormatted || phoneE164,
        phoneInternational: phoneE164,
        ddi: phoneDDI,
        message: `Olá! Tenho interesse no imóvel ${propertyTitle} (cód. ${propertyCode}). Gostaria de mais informações.`,
        propertyId,
        propertyCode,
        propertyTitle,
        realtorId: realtor?.id,
        realtorName: realtor?.name || 'Equipe Pharos',
        source: 'site',
        page: typeof window !== 'undefined' ? window.location.href : '',
        utms,
        idempotencyKey,
        timestamp: new Date().toISOString(),
        website, // 🍯 Honeypot field
      };

      const result = await leadService.createPropertyInterestLead(
        propertyId,
        propertyCode,
        payload
      );

      if (result.success) {
        setSubmitSuccess(true);
        toast.showToast('Mensagem enviada! Entraremos em contato em breve.', 'success');

        // Track conversão de lead (evento mais importante!)
        trackLead(
          {
            id: propertyId,
            code: propertyCode,
            title: propertyTitle,
            price: 0,
            type: 'property',
            city: '',
            state: '',
            realtor: realtor && realtor.id ? {
        id: realtor.id,
        name: realtor.name,
      } : undefined,
          },
          {
            firstName: name.trim().split(' ')[0],
            lastName: name.trim().split(' ').slice(1).join(' '),
            phone: phoneE164,
          },
          result.leadId || idempotencyKey,
          100 // Valor do lead
        );
        
      } else {
        throw new Error(result.message || 'Erro ao enviar');
      }
    } catch (error: any) {
      console.error('[LeadCaptureCard] Erro:', error);
      
      const errorMessage = error.message || 'Erro ao enviar mensagem. Tente novamente.';
      toast.showToast(errorMessage, 'error');
      
      // Analytics - Error
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'lead_submit_error', {
          property_id: propertyId,
          property_code: propertyCode,
          realtor_id: realtor?.id,
          error: errorMessage,
          reason: error.message || 'unknown',
        });
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dados do corretor (fallback padrão)
  const realtorData = realtor || {
    id: undefined,
    name: 'Equipe Pharos',
    photo: undefined,
    creci: 'CRECI-SC',
    online: true,
  };

  // Nome para CTA
  const ctaName = realtor?.name ? realtor.name.split(' ')[0] : 'Equipe';

  return (
    <>
      {/* Desktop: Sticky Card Premium com Constraint */}
      <aside className={`hidden lg:block ${className}`}>
        <div 
          className="sticky z-20 transition-all duration-300"
          style={{ 
            top: 'calc(var(--header-h, 80px) + 24px)',
            maxHeight: 'calc(100vh - var(--header-h, 80px) - 48px)'
          }}
        >
          <div className="bg-white rounded-2xl shadow-[0_10px_50px_-12px_rgba(0,0,0,0.15)] border border-pharos-slate-200/60 overflow-hidden backdrop-blur-sm hover:shadow-[0_15px_60px_-12px_rgba(0,0,0,0.2)] transition-shadow duration-300">
            
            {/* Decorative Gradient Line */}
            <div className="h-1.5 bg-gradient-to-r from-pharos-blue-500 via-pharos-blue-600 to-pharos-blue-500" />
            
            {/* Realtor Header Premium */}
            <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-pharos-slate-50/30 via-white to-white">
              <div className="relative flex items-start gap-4">
                {/* Avatar com animação premium */}
                <div className="relative flex-shrink-0 group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pharos-blue-500 via-pharos-blue-400 to-pharos-blue-600 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-3 ring-white shadow-xl">
                    {realtorData.photo ? (
                      <Image
                        src={realtorData.photo}
                        alt={realtorData.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pharos-blue-500 to-pharos-blue-600 shadow-inner">
                        <span className="text-white text-2xl font-bold" aria-hidden="true">
                          {realtorData.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {realtorData.online && (
                    <>
                      <span className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 bg-green-500 border-3 border-white rounded-full shadow-md" aria-label="Online" />
                      <span className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 bg-green-400 rounded-full animate-ping" />
                    </>
                  )}
                </div>

                {/* Info Premium */}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-pharos-navy-900 font-bold text-base leading-tight mb-1.5">
                    {realtorData.name}
                  </h3>
                  <p className="text-pharos-slate-600 text-xs font-semibold mb-2.5 tracking-wide uppercase">
                    {realtorData.creci}
                  </p>
                  {realtorData.online && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-50/50 border border-green-200/60 rounded-full shadow-sm">
                      <span className="relative flex w-2 h-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full w-2 h-2 bg-green-500"></span>
                      </span>
                      <span className="text-green-700 text-[11px] font-bold tracking-wide uppercase">
                        Online agora
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Premium */}
            <div className="px-6 pb-6">
              {/* Headline Premium */}
              <div className="mb-6">
                <h4 className="text-pharos-navy-900 text-xl font-bold leading-tight mb-3">
                  Tire suas dúvidas agora
                </h4>
                <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-pharos-blue-50 via-pharos-blue-50/50 to-transparent rounded-xl border border-pharos-blue-100/60">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pharos-blue-500 flex items-center justify-center shadow-sm">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-pharos-slate-700 text-sm font-medium">
                    Resposta em <span className="font-bold text-pharos-blue-600">menos de 15 minutos</span>
                  </p>
                </div>
              </div>

              {/* Form Premium */}
              {!submitSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nome Input Premium */}
                  <div className="relative group">
                    <label 
                      htmlFor="name-desktop" 
                      className={`block text-xs font-bold mb-2 ml-1 transition-colors duration-200 ${
                        nameInFocus ? 'text-pharos-blue-600' : 'text-pharos-slate-700'
                      }`}
                    >
                      Seu nome
                    </label>
                    <div className="relative">
                      <input
                        id="name-desktop"
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onFocus={() => setNameInFocus(true)}
                        onBlur={() => setNameInFocus(false)}
                        placeholder="Como podemos te chamar?"
                        className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-pharos-navy-900 placeholder:text-pharos-slate-400 text-sm font-medium transition-all duration-200 
                          ${nameInFocus 
                            ? 'border-pharos-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' 
                            : 'border-pharos-slate-200 hover:border-pharos-slate-300'
                          }
                          focus:outline-none focus:border-pharos-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]
                        `}
                        required
                        minLength={3}
                        disabled={isSubmitting}
                        autoComplete="name"
                      />
                      {name.length >= 3 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telefone Premium */}
                  <div className="relative group">
                    <label 
                      className={`block text-xs font-bold mb-2 ml-1 transition-colors duration-200 ${
                        phoneInFocus ? 'text-pharos-blue-600' : 'text-pharos-slate-700'
                      }`}
                    >
                      Seu WhatsApp
                    </label>
                    <PhoneInputPremium
                      value={phoneE164}
                      onChange={handlePhoneChange}
                      onValidation={handlePhoneValidation}
                      onFocusChange={setPhoneInFocus}
                      placeholder="(00) 00000-0000"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* 🍯 Honeypot Field - Invisível para humanos, visível para bots */}
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
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

                  {/* CTA Button Premium com Gradiente Animado */}
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`group relative w-full overflow-hidden rounded-xl font-bold text-sm transition-all duration-300 mt-5
                      ${isValid
                        ? 'bg-gradient-to-r from-pharos-blue-600 via-pharos-blue-500 to-pharos-blue-600 bg-[length:200%_auto] hover:bg-right text-white shadow-lg shadow-pharos-blue-500/30 hover:shadow-xl hover:shadow-pharos-blue-500/50 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-pharos-slate-200 text-pharos-slate-400 cursor-not-allowed'
                      }
                    `}
                    aria-label={`Falar com ${ctaName}`}
                  >
                    <div className="relative flex items-center justify-center gap-3 px-6 py-4">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          <span>Falar com {ctaName}</span>
                          <svg className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </div>
                  </button>
                </form>
              ) : (
                /* Success State Premium */
                <div className="py-12 text-center">
                  <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 bg-green-500/10 rounded-full animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-green-50 via-green-100 to-green-50 border-3 border-green-200 rounded-full flex items-center justify-center shadow-xl">
                      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="text-pharos-navy-900 font-bold text-xl mb-3">
                    Mensagem enviada!
                  </h4>
                  <p className="text-pharos-slate-600 text-sm leading-relaxed max-w-[260px] mx-auto">
                    Você receberá uma resposta da nossa equipe em breve pelo WhatsApp
                  </p>
                </div>
              )}

              {/* Trust Indicators Premium */}
              <div className="mt-6 pt-6 border-t border-pharos-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-pharos-slate-700">Dados<br/>protegidos</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pharos-blue-50 to-pharos-blue-100 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-pharos-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-pharos-slate-700">Resposta<br/>rápida</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile: Bottom Dock Premium */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-pharos-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 safe-area-inset-bottom backdrop-blur-lg bg-white/95">
        {/* Compact Header */}
        <div className="px-4 pt-3.5 pb-3 border-b border-pharos-slate-100">
          <div className="flex items-center gap-3">
            {/* Avatar Mini */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-pharos-blue-200 bg-gradient-to-br from-pharos-blue-500 to-pharos-blue-600 shadow-md">
                {realtorData.photo ? (
                  <Image
                    src={realtorData.photo}
                    alt={realtorData.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-base font-bold" aria-hidden="true">
                      {realtorData.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {realtorData.online && (
                <>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" aria-label="Online" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                </>
              )}
            </div>

            {/* Info Compacta */}
            <div className="flex-1 min-w-0">
              <p className="text-pharos-navy-900 font-bold text-sm leading-tight truncate">
                {realtorData.name}
              </p>
              <p className="text-pharos-slate-600 text-xs leading-tight font-medium">
                Online • <span className="text-pharos-blue-600 font-semibold">Resposta em 15min</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Compacto */}
        {!submitSuccess ? (
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 bg-pharos-slate-50 border-2 border-pharos-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-pharos-blue-500 focus:bg-white text-pharos-navy-900 placeholder:text-pharos-slate-400 text-sm font-medium"
              required
              minLength={3}
              disabled={isSubmitting}
            />
            <PhoneInputPremium
              value={phoneE164}
              onChange={handlePhoneChange}
              onValidation={handlePhoneValidation}
              placeholder="(00) 00000-0000"
              required
              disabled={isSubmitting}
            />
            
            {/* 🍯 Honeypot Field - Invisível para humanos, visível para bots */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
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
            
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-pharos-blue-600 to-pharos-blue-500 text-white shadow-lg shadow-pharos-blue-500/30 active:scale-95'
                  : 'bg-pharos-slate-200 text-pharos-slate-400'
              }`}
            >
              {isSubmitting ? 'Enviando...' : `Falar com ${ctaName}`}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-pharos-navy-900 font-bold text-sm">Mensagem enviada!</p>
          </div>
        )}
      </div>
    </>
  );
}
