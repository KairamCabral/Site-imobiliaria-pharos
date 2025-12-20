'use client';

import { useState, useEffect, useRef } from 'react';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sendWhatsAppAppointment, generateICSFile, downloadICS } from '@/utils/whatsapp';

/**
 * PHAROS - AGENDAMENTO DE VISITAS
 * Seção premium para agendar visitas presenciais ou por vídeo
 */

interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  slots: string[]; // ['09:00', '10:30', ...]
}

interface AppointmentData {
  propertyId: string;
  type: 'in_person' | 'video';
  videoProvider?: 'whatsapp' | 'meet';
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  tz: string;
  consent: boolean;
}

interface AgendarVisitaProps {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
}

export default function AgendarVisita({
  propertyId,
  propertyTitle,
  propertyAddress,
}: AgendarVisitaProps) {
  // Estados
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<'in_person' | 'video'>('in_person');
  const [videoProvider, setVideoProvider] = useState<'whatsapp' | 'meet'>('whatsapp');
  
  // Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // 🍯 Honeypot

  // UI States
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const dateScrollRef = useRef<HTMLDivElement>(null);

  // Carregar disponibilidade
  useEffect(() => {
    loadAvailability();
  }, [propertyId]);

  const loadAvailability = async () => {
    setIsLoadingAvailability(true);
    setError(null);
    
    try {
      // Simulação - em produção, chamar API real
      // const response = await fetch(`/api/properties/${propertyId}/availability`);
      // const data = await response.json();
      
      // Mock data
      const mockAvailability: AvailabilitySlot[] = [];
      for (let i = 0; i < 14; i++) {
        const date = addDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Simular alguns dias com horários
        if (i % 3 !== 0) { // Nem todos os dias têm disponibilidade
          mockAvailability.push({
            date: dateStr,
            slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
          });
        }
      }
      
      setAvailability(mockAvailability);
      
      // Selecionar primeiro dia disponível
      if (mockAvailability.length > 0) {
        const firstDate = parseISO(mockAvailability[0].date);
        setSelectedDate(firstDate);
      }
      
    } catch (err) {
      console.error('Erro ao carregar disponibilidade:', err);
      setError('Não foi possível carregar os horários disponíveis.');
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Scroll do carrossel de datas
  const scrollDates = (direction: 'left' | 'right') => {
    if (!dateScrollRef.current) return;
    
    const scrollAmount = 280;
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;
    
    dateScrollRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    
    setScrollPosition(newPosition);
  };

  // Obter slots do dia selecionado
  const selectedDaySlots = selectedDate 
    ? availability.find(av => 
        isSameDay(parseISO(av.date), selectedDate)
      )?.slots || []
    : [];

  // Validação do formulário
  const isFormValid = 
    selectedDate &&
    selectedTime &&
    name.trim().length >= 3 &&
    email.includes('@') &&
    phone.length >= 10 &&
    consent;

  // Submeter agendamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const payload: AppointmentData = {
        propertyId,
        type: visitType,
        videoProvider: visitType === 'video' ? videoProvider : undefined,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        name,
        email,
        phone,
        notes: notes || undefined,
        tz: 'America/Sao_Paulo',
        consent,
      };

      // Simulação - em produção, chamar API real
      // const response = await fetch('/api/appointments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // const data = await response.json();

      // Mock response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Gerar arquivo .ics
      const startDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora

      const icsContent = generateICSFile({
        title: `Visita ao imóvel ${propertyTitle}`,
        description: `Visita ${visitType === 'in_person' ? 'presencial' : 'por vídeo'} ao imóvel ${propertyTitle}`,
        location: propertyAddress,
        startDate,
        endDate,
      });

      const icsBlob = new Blob([icsContent], { type: 'text/calendar' });
      const icsUrl = URL.createObjectURL(icsBlob);
      
      const mockResponse = {
        appointmentId: `appt_${Date.now()}`,
        icsUrl,
        googleCalendarLink: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(propertyTitle)}&dates=${format(selectedDate, 'yyyyMMdd')}T${selectedTime.replace(':', '')}00/${format(selectedDate, 'yyyyMMdd')}T${selectedTime.replace(':', '')}00&details=${encodeURIComponent(propertyAddress)}`,
        manageUrl: '#',
      };

      setAppointmentDetails(mockResponse);
      setShowSuccessModal(true);

      // Enviar WhatsApp para 47991878070
      sendWhatsAppAppointment('47991878070', {
        propertyCode: propertyId, // Usar propertyId como code por enquanto
        propertyTitle,
        clientName: name,
        clientPhone: phone,
        date: format(selectedDate, "dd/MM/yyyy", { locale: ptBR }),
        time: selectedTime,
        type: visitType,
      });

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'appointment_booked', {
          property_id: propertyId,
          appointment_id: mockResponse.appointmentId,
          type: visitType,
          video_provider: videoProvider,
        });
      }

    } catch (err) {
      console.error('Erro ao agendar:', err);
      setError('Não foi possível agendar a visita. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp link
  const whatsappLink = `https://wa.me/554733660000?text=${encodeURIComponent(
    `Olá! Gostaria de agendar uma visita para o imóvel: ${propertyTitle}\nEndereço: ${propertyAddress}${selectedDate ? `\nData de interesse: ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}` : ''}`
  )}`;

  return (
    <section 
      className="bg-pharos-base-off py-12 lg:py-16"
      id="agendar-visita"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Coluna Esquerda: Informações */}
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-pharos-navy-900 mb-4">
              Agende sua visita
            </h2>
            <p className="text-lg text-pharos-slate-700 mb-3">
              Escolha o melhor dia e horário para uma visita presencial ou por videoconferência.
            </p>
            <p className="text-sm text-pharos-slate-500 mb-8">
              Você pode cancelar ou remarcar quando quiser.
            </p>

            {/* Benefícios */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pharos-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-pharos-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-pharos-navy-900 mb-1">
                    Confirmação imediata
                  </h3>
                  <p className="text-sm text-pharos-slate-500">
                    Receba confirmação por e-mail e WhatsApp com todos os detalhes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pharos-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-pharos-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-pharos-navy-900 mb-1">
                    Flexibilidade total
                  </h3>
                  <p className="text-sm text-pharos-slate-500">
                    Remarque ou cancele a qualquer momento sem custos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pharos-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-pharos-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-pharos-navy-900 mb-1">
                    Atendimento especializado
                  </h3>
                  <p className="text-sm text-pharos-slate-500">
                    Corretor dedicado para tirar todas as suas dúvidas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Card de Agendamento */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-pharos-slate-300 shadow-[0_6px_20px_rgba(25,34,51,0.08)] p-6 lg:p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-sm text-red-600 hover:text-red-700 underline mt-1"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Tipo de Visita */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-pharos-navy-900 mb-3">
                    Tipo de visita
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setVisitType('in_person');
                        if (typeof window !== 'undefined' && (window as any).gtag) {
                          (window as any).gtag('event', 'visit_type_select', {
                            type: 'in_person',
                          });
                        }
                      }}
                      className={`
                        flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[52px]
                        ${visitType === 'in_person'
                          ? 'border-pharos-blue-500 bg-pharos-blue-500/5'
                          : 'border-pharos-slate-300 hover:border-pharos-slate-400'
                        }
                        focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
                      `}
                      aria-pressed={visitType === 'in_person'}
                    >
                      <svg className="w-5 h-5 text-pharos-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-medium text-pharos-navy-900">
                        Presencial
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setVisitType('video');
                        if (typeof window !== 'undefined' && (window as any).gtag) {
                          (window as any).gtag('event', 'visit_type_select', {
                            type: 'video',
                          });
                        }
                      }}
                      className={`
                        flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[52px]
                        ${visitType === 'video'
                          ? 'border-pharos-blue-500 bg-pharos-blue-500/5'
                          : 'border-pharos-slate-300 hover:border-pharos-slate-400'
                        }
                        focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
                      `}
                      aria-pressed={visitType === 'video'}
                    >
                      <svg className="w-5 h-5 text-pharos-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-pharos-navy-900">
                        Por vídeo
                      </span>
                    </button>
                  </div>

                  {/* Provedor de vídeo */}
                  {visitType === 'video' && (
                    <div className="mt-3 p-3 bg-pharos-base-off rounded-lg">
                      <label className="block text-xs font-medium text-pharos-slate-700 mb-2">
                        Preferência de plataforma
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoProvider('whatsapp')}
                          className={`
                            flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                            ${videoProvider === 'whatsapp'
                              ? 'bg-pharos-blue-500 text-white'
                              : 'bg-white text-pharos-slate-700 border border-pharos-slate-300 hover:bg-pharos-slate-50'
                            }
                          `}
                        >
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoProvider('meet')}
                          className={`
                            flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                            ${videoProvider === 'meet'
                              ? 'bg-pharos-blue-500 text-white'
                              : 'bg-white text-pharos-slate-700 border border-pharos-slate-300 hover:bg-pharos-slate-50'
                            }
                          `}
                        >
                          Google Meet
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seletor de Data */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-pharos-navy-900 mb-3">
                    Escolha o dia
                  </label>
                  
                  {isLoadingAvailability ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-pharos-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : availability.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-pharos-slate-500 mb-4">
                        Agenda indisponível no momento
                      </p>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-pharos-blue-500 hover:text-pharos-blue-600"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Falar no WhatsApp
                      </a>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Setas de navegação */}
                      {scrollPosition > 0 && (
                        <button
                          type="button"
                          onClick={() => scrollDates('left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-pharos-navy-900 hover:bg-pharos-base-off transition-colors"
                          aria-label="Dias anteriores"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      )}
                      
                      <div
                        ref={dateScrollRef}
                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {availability.map((av) => {
                          const date = parseISO(av.date);
                          const isSelected = !!(selectedDate && isSameDay(date, selectedDate));
                          const isToday = isSameDay(date, new Date());
                          
                          return (
                            <button
                              key={av.date}
                              type="button"
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedTime(null); // Reset time when date changes
                                if (typeof window !== 'undefined' && (window as any).gtag) {
                                  (window as any).gtag('event', 'visit_date_select', {
                                    date: av.date,
                                  });
                                }
                              }}
                              className={`
                                flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border-2 transition-all flex-shrink-0
                                ${isSelected
                                  ? 'border-pharos-blue-500 bg-pharos-blue-500/5 shadow-[0_0_0_4px_rgba(5,74,218,0.1)]'
                                  : 'border-pharos-slate-300 hover:border-pharos-slate-400 hover:bg-pharos-base-off'
                                }
                                focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
                              `}
                              aria-pressed={isSelected}
                              aria-label={format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            >
                              <span className="text-xs text-pharos-slate-500 uppercase">
                                {format(date, 'EEE', { locale: ptBR })}
                              </span>
                              <span className="text-2xl font-bold text-pharos-navy-900 my-1">
                                {format(date, 'dd')}
                              </span>
                              <span className="text-xs text-pharos-slate-500 uppercase">
                                {format(date, 'MMM', { locale: ptBR })}
                              </span>
                              {isToday && (
                                <span className="text-[10px] text-pharos-blue-500 font-semibold mt-1">
                                  HOJE
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => scrollDates('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-pharos-navy-900 hover:bg-pharos-base-off transition-colors"
                        aria-label="Próximos dias"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Seletor de Horário */}
                {selectedDate && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-pharos-navy-900">
                        Escolha o horário
                      </label>
                      <span className="text-xs text-pharos-slate-500">
                        Horário local – Brasília (GMT-3)
                      </span>
                    </div>

                    {selectedDaySlots.length === 0 ? (
                      <div className="text-center py-6 bg-pharos-base-off rounded-lg">
                        <p className="text-sm text-pharos-slate-500 mb-3">
                          Sem horários disponíveis neste dia
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            // Avançar 3 dias
                            const nextDate = addDays(selectedDate, 3);
                            const nextAvailable = availability.find(av => 
                              parseISO(av.date) >= nextDate
                            );
                            if (nextAvailable) {
                              setSelectedDate(parseISO(nextAvailable.date));
                            }
                          }}
                          className="text-sm text-pharos-blue-500 hover:text-pharos-blue-600 font-medium"
                        >
                          Ver dias seguintes
                        </button>
                        <span className="mx-2 text-pharos-slate-300">•</span>
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-pharos-blue-500 hover:text-pharos-blue-600 font-medium"
                        >
                          Falar no WhatsApp
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedDaySlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedTime(slot);
                              if (typeof window !== 'undefined' && (window as any).gtag) {
                                (window as any).gtag('event', 'visit_time_select', {
                                  time: slot,
                                });
                              }
                            }}
                            className={`
                              px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all min-h-[44px]
                              ${selectedTime === slot
                                ? 'border-pharos-blue-500 bg-pharos-blue-500 text-white'
                                : 'border-pharos-slate-300 text-pharos-slate-700 hover:border-pharos-slate-400 hover:bg-pharos-base-off'
                              }
                              focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
                            `}
                            aria-pressed={selectedTime === slot}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Formulário de Contato */}
                {selectedDate && selectedTime && (
                  <div className="space-y-4 mb-6 pt-6 border-t border-pharos-slate-300">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-pharos-slate-700 mb-2">
                        Seu nome *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-3 border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent text-pharos-navy-900 placeholder:text-pharos-slate-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-pharos-slate-700 mb-2">
                        Seu WhatsApp *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-3 border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent text-pharos-navy-900 placeholder:text-pharos-slate-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-pharos-slate-700 mb-2">
                        Seu e-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent text-pharos-navy-900 placeholder:text-pharos-slate-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-pharos-slate-700 mb-2">
                        Observações (opcional)
                      </label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Quer deixar algum detalhe?"
                        rows={3}
                        className="w-full px-4 py-3 border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent text-pharos-navy-900 placeholder:text-pharos-slate-400 resize-none"
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

                    {/* LGPD */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="w-5 h-5 mt-0.5 border-pharos-slate-300 rounded text-pharos-blue-500 focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2"
                        required
                      />
                      <label htmlFor="consent" className="text-sm text-pharos-slate-700">
                        Autorizo contato por WhatsApp e e-mail sobre este imóvel. *
                      </label>
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`
                      w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-xl transition-all min-h-[52px]
                      ${isFormValid && !isSubmitting
                        ? 'bg-pharos-blue-500 text-white hover:bg-pharos-blue-600 shadow-md hover:shadow-lg'
                        : 'bg-pharos-slate-300 text-pharos-slate-500 cursor-not-allowed'
                      }
                      focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
                    `}
                    aria-label={`Agendar visita ${visitType === 'in_person' ? 'presencial' : 'por vídeo'} para ${selectedDate ? format(selectedDate, "dd/MM/yyyy") : ''} às ${selectedTime || ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Agendando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Agendar visita
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'visit_whatsapp_click', {
                          property_id: propertyId,
                        });
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-pharos-blue-500 border border-pharos-blue-500 rounded-xl hover:bg-pharos-blue-50 transition-colors min-h-[44px]"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Falar no WhatsApp
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && appointmentDetails && (
        <SuccessModal
          appointmentDetails={appointmentDetails}
          visitType={visitType}
          selectedDate={selectedDate!}
          selectedTime={selectedTime!}
          propertyTitle={propertyTitle}
          propertyAddress={propertyAddress}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </section>
  );
}

// Modal de Sucesso
interface SuccessModalProps {
  appointmentDetails: any;
  visitType: 'in_person' | 'video';
  selectedDate: Date;
  selectedTime: string;
  propertyTitle: string;
  propertyAddress: string;
  onClose: () => void;
}

function SuccessModal({
  appointmentDetails,
  visitType,
  selectedDate,
  selectedTime,
  propertyTitle,
  propertyAddress,
  onClose,
}: SuccessModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone de Sucesso */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold text-pharos-navy-900 text-center mb-2">
          Visita agendada!
        </h3>
        <p className="text-sm text-pharos-slate-500 text-center mb-6">
          Enviamos a confirmação por e-mail e WhatsApp
        </p>

        {/* Resumo */}
        <div className="bg-pharos-base-off rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <svg className="w-5 h-5 text-pharos-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-pharos-navy-900">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
              </p>
              <p className="text-xs text-pharos-slate-500 mt-1">
                {visitType === 'in_person' ? 'Visita presencial' : 'Visita por vídeo'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-pharos-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-pharos-navy-900">
                {propertyTitle}
              </p>
              <p className="text-xs text-pharos-slate-500 mt-1">
                {propertyAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <a
            href={appointmentDetails.googleCalendarLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'visit_calendar_add', {
                  appointment_id: appointmentDetails.appointmentId,
                });
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Adicionar ao Google Calendar
          </a>

          <a
            href={appointmentDetails.icsUrl}
            download
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'visit_ics_download', {
                  appointment_id: appointmentDetails.appointmentId,
                });
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-pharos-slate-700 border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Baixar .ics
          </a>

          <div className="flex gap-3 pt-3 border-t border-pharos-slate-200">
            <a
              href={appointmentDetails.manageUrl}
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'visit_reschedule_click', {
                    appointment_id: appointmentDetails.appointmentId,
                  });
                }
              }}
              className="flex-1 text-center text-sm text-pharos-blue-500 hover:text-pharos-blue-600 font-medium py-2"
            >
              Remarcar
            </a>
            <a
              href={appointmentDetails.manageUrl}
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'visit_cancel_click', {
                    appointment_id: appointmentDetails.appointmentId,
                  });
                }
              }}
              className="flex-1 text-center text-sm text-pharos-slate-500 hover:text-pharos-slate-700 font-medium py-2"
            >
              Cancelar
            </a>
          </div>
        </div>

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-pharos-slate-400 hover:text-pharos-slate-600 hover:bg-pharos-base-off rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

