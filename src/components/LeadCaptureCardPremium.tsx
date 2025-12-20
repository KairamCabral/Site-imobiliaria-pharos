'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getLeadService } from '@/services/LeadService';
import { useToast } from '@/hooks/useToast';
import PhoneInput from './PhoneInput';

/**
 * PHAROS - Lead Capture Card Premium
 * 
 * Design ultra refinado com:
 * - UI/UX internacional de alto padrão
 * - Microinterações sofisticadas
 * - Hierarquia visual clara
 * - Espaçamento premium
 * - Elementos glassmorphism sutis
 * - Feedback visual rico
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

interface LeadCaptureCardPremiumProps {
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  realtor?: Realtor;
  className?: string;
}

// Simple SHA-256 hash for idempotency
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

export default function LeadCaptureCardPremium({
  propertyId,
  propertyCode,
  propertyTitle,
  realtor,
  className = '',
}: LeadCaptureCardPremiumProps) {
  const [name, setName] = useState('');
  const [phoneE164, setPhoneE164] = useState('');
  const [phoneFormatted, setPhoneFormatted] = useState('');
  const [phoneDDI, setPhoneDDI] = useState('+55');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const toast = useToast();

  // Track impressions
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_card_premium_impression', {
        property_id: propertyId,
        property_code: propertyCode,
        realtor_id: realtor?.id,
      });
    }
  }, [propertyId, propertyCode, realtor]);

  // Get UTMs
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

  const handlePhoneChange = (e164: string, formatted: string, ddi: string) => {
    setPhoneE164(e164);
    setPhoneFormatted(formatted);
    setPhoneDDI(ddi);
  };

  const handlePhoneValidation = (isValid: boolean, error?: string) => {
    setIsPhoneValid(isValid);
  };

  const isValid = name.trim().length >= 3 && isPhoneValid && !isSubmitting && !submitSuccess;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting || submitSuccess) return;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_submit_attempt_premium', {
        property_id: propertyId,
        property_code: propertyCode,
      });
    }

    setIsSubmitting(true);

    try {
      const idempotencyPayload = `${name.trim()}_${phoneE164}_${propertyId}`;
      const idempotencyKey = await simpleHash(idempotencyPayload);
      const leadService = getLeadService();
      const utms = getUTMsFromURL();

      const payload = {
        name: name.trim(),
        phone: phoneE164,
        phoneFormatted,
        phoneDDI,
        message: `Interesse no imóvel ${propertyCode} - ${propertyTitle}`,
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
      };

      const result = await leadService.createPropertyInterestLead(propertyId, propertyCode, payload);

      if (result.success) {
        setSubmitSuccess(true);
        toast.showToast('Mensagem enviada! Entraremos em contato em breve.', 'success');

        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'lead_submit_success_premium', {
            property_id: propertyId,
            lead_id: result.leadId,
          });
        }
      } else {
        throw new Error(result.message || 'Erro ao enviar');
      }
    } catch (error: any) {
      console.error('[LeadCaptureCardPremium] Erro:', error);
      toast.showToast(error.message || 'Erro ao enviar mensagem. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const realtorData = realtor || {
    name: 'Equipe Pharos',
    creci: 'CRECI-SC 40107',
    online: true,
  };

  const ctaName = realtor?.name ? realtor.name.split(' ')[0] : 'Equipe';

  return (
    <div className={`bg-gradient-to-br from-white via-white to-pharos-slate-50/30 rounded-3xl shadow-[0_8px_40px_-4px_rgba(0,0,0,0.08)] border border-pharos-slate-200/50 overflow-hidden backdrop-blur-sm ${className}`}>
      
      {/* Decorative Gradient Line */}
      <div className="h-1 bg-gradient-to-r from-pharos-blue-500 via-pharos-blue-600 to-pharos-blue-500" />
      
      {/* Realtor Header */}
      <div className="relative px-6 pt-6 pb-5">
        {/* Background Pattern Sutil */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="relative flex items-start gap-4">
          {/* Avatar com animação */}
          <div className="relative flex-shrink-0 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pharos-blue-500 to-pharos-blue-600 rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
              {realtorData.photo ? (
                <Image
                  src={realtorData.photo}
                  alt={realtorData.name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pharos-blue-500 to-pharos-blue-600">
                  <span className="text-white text-xl font-bold">
                    {realtorData.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {realtorData.online && (
              <>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-3 border-white rounded-full" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-ping" />
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-pharos-navy-900 font-bold text-base leading-tight mb-1">
              {realtorData.name}
            </h3>
            <p className="text-pharos-slate-600 text-xs font-medium mb-2">
              {realtorData.creci}
            </p>
            {realtorData.online && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 text-[10px] font-semibold tracking-wide uppercase">
                  Online agora
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        {/* Headline Premium */}
        <div className="mb-5">
          <h4 className="text-pharos-navy-900 text-lg font-bold leading-tight mb-2">
            Tire suas dúvidas agora
          </h4>
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-pharos-blue-500/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-pharos-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-pharos-slate-700 text-sm">
              Resposta em <span className="font-bold text-pharos-blue-600">menos de 15 minutos</span>
            </p>
          </div>
        </div>

        {/* Form */}
        {!submitSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Nome Input Premium */}
            <div className="relative group">
              <label htmlFor="name-premium" className="block text-xs font-semibold text-pharos-slate-700 mb-1.5 ml-0.5">
                Seu nome
              </label>
              <input
                id="name-premium"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Como podemos te chamar?"
                className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-pharos-navy-900 placeholder:text-pharos-slate-400 text-sm font-medium transition-all duration-200
                  ${focusedField === 'name'
                    ? 'border-pharos-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)] ring-1 ring-pharos-blue-500/20'
                    : 'border-pharos-slate-200 hover:border-pharos-slate-300'
                  }
                `}
                required
                minLength={3}
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>

            {/* Phone Input Premium */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-pharos-slate-700 mb-1.5 ml-0.5">
                Seu WhatsApp
              </label>
              <PhoneInput
                value={phoneE164}
                onChange={handlePhoneChange}
                onValidation={handlePhoneValidation}
                placeholder="(00) 00000-0000"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* CTA Button Premium */}
            <button
              type="submit"
              disabled={!isValid}
              className={`group relative w-full overflow-hidden rounded-xl font-bold text-sm transition-all duration-300 mt-4
                ${isValid
                  ? 'bg-gradient-to-r from-pharos-blue-600 via-pharos-blue-500 to-pharos-blue-600 bg-size-200 hover:bg-pos-100 text-white shadow-lg shadow-pharos-blue-500/30 hover:shadow-xl hover:shadow-pharos-blue-500/40 active:scale-[0.98]'
                  : 'bg-pharos-slate-200 text-pharos-slate-400 cursor-not-allowed'
                }
              `}
            >
              <div className="relative flex items-center justify-center gap-2.5 px-6 py-4">
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
                    <svg className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>
        ) : (
          /* Success State Premium */
          <div className="py-10 text-center animate-fade-in">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
              <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h4 className="text-pharos-navy-900 font-bold text-lg mb-2">
              Mensagem enviada com sucesso!
            </h4>
            <p className="text-pharos-slate-600 text-sm leading-relaxed max-w-[240px] mx-auto">
              Você receberá uma resposta da nossa equipe em breve pelo WhatsApp
            </p>
          </div>
        )}

        {/* Trust Indicators Premium */}
        <div className="mt-5 pt-5 border-t border-pharos-slate-100">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-pharos-slate-600">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Dados protegidos</span>
            </div>
            <div className="flex items-center gap-2 text-pharos-slate-600">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-pharos-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-pharos-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Resposta rápida</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-size-200 {
          background-size: 200%;
        }
        .bg-pos-100 {
          background-position: 100%;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

