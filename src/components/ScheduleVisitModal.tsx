'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Video, Home, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sendWhatsAppAppointment, generateICSFile } from '@/utils/whatsapp';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  propertyAddress: string;
}

interface AvailabilitySlot {
  date: string;
  slots: string[];
}

const steps = ['Tipo', 'Data', 'Horário', 'Dados', 'Confirmação'];

export default function ScheduleVisitModal({
  isOpen,
  onClose,
  propertyId,
  propertyCode,
  propertyTitle,
  propertyAddress,
}: ScheduleVisitModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitType, setVisitType] = useState<'in_person' | 'video'>('in_person');
  const [videoProvider, setVideoProvider] = useState<'whatsapp' | 'meet'>('whatsapp');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // 🍯 Honeypot
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  const dateScrollRef = useRef<HTMLDivElement>(null);

  // Carregar disponibilidade quando modal abre
  useEffect(() => {
    if (isOpen) {
      loadAvailability();
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'schedule_modal_open', {
          property_id: propertyId,
        });
      }
    } else {
      // Reset ao fechar
      setCurrentStep(0);
      setSelectedDate(null);
      setSelectedTime(null);
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      setConsent(false);
      setWebsite(''); // 🍯 Reset honeypot
      setAppointmentDetails(null);
    }
  }, [isOpen, propertyId]);

  const loadAvailability = async () => {
    setIsLoadingAvailability(true);
    
    try {
      // Mock data - em produção chamar API real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockAvailability: AvailabilitySlot[] = [];
      for (let i = 0; i < 14; i++) {
        const date = addDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        if (i % 3 !== 0) {
          mockAvailability.push({
            date: dateStr,
            slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
          });
        }
      }
      
      setAvailability(mockAvailability);
      
      if (mockAvailability.length > 0) {
        const firstDate = parseISO(mockAvailability[0].date);
        setSelectedDate(firstDate);
      }
    } catch (err) {
      console.error('Erro ao carregar disponibilidade:', err);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const selectedDaySlots = selectedDate 
    ? availability.find(av => isSameDay(parseISO(av.date), selectedDate))?.slots || []
    : [];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Tipo sempre válido
      case 1: return selectedDate !== null;
      case 2: return selectedTime !== null;
      case 3: return name.trim().length >= 3 && email.includes('@') && phone.length >= 10 && consent;
      case 4: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'schedule_step_complete', {
          property_id: propertyId,
          step: currentStep,
          step_name: steps[currentStep],
        });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed() || !selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    
    try {
      // Mock response - em produção chamar API real
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const startDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

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
      };

      setAppointmentDetails(mockResponse);
      setCurrentStep(4); // Success screen

      // Enviar WhatsApp
      sendWhatsAppAppointment('47991878070', {
        propertyCode,
        propertyTitle,
        clientName: name,
        clientPhone: phone,
        date: format(selectedDate, "dd/MM/yyyy", { locale: ptBR }),
        time: selectedTime,
        type: visitType,
      });

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'visit_scheduled', {
          property_id: propertyId,
          appointment_id: mockResponse.appointmentId,
          type: visitType,
          video_provider: videoProvider,
        });
      }
    } catch (err) {
      console.error('Erro ao agendar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-pharos-slate-200 bg-gradient-to-r from-pharos-blue-50 to-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-pharos-slate-400 hover:text-pharos-slate-600 hover:bg-pharos-slate-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold text-pharos-navy-900 mb-1 pr-10">
            Agendar Visita
          </h2>
          <p className="text-sm text-pharos-slate-600">
            {propertyCode} - {propertyTitle}
          </p>
        </div>

        {/* Progress Bar */}
        {currentStep < 4 && (
          <div className="px-6 py-4 bg-pharos-slate-50">
            <div className="flex items-center justify-between mb-2">
              {steps.slice(0, 4).map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${
                      index < currentStep 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                        ? 'bg-pharos-blue-500 text-white ring-4 ring-pharos-blue-100' 
                        : 'bg-pharos-slate-200 text-pharos-slate-500'
                    }`}>
                      {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${
                      index <= currentStep ? 'text-pharos-navy-900' : 'text-pharos-slate-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full ${
                      index < currentStep ? 'bg-green-500' : 'bg-pharos-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {/* Step 0: Tipo de Visita */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-bold text-pharos-navy-900 mb-2">
                  Como você prefere conhecer o imóvel?
                </h3>
                <p className="text-sm text-pharos-slate-600">
                  Escolha entre visita presencial ou por videoconferência
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setVisitType('in_person')}
                  className={`group flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${
                    visitType === 'in_person'
                      ? 'border-pharos-blue-500 bg-pharos-blue-50 shadow-lg shadow-pharos-blue-500/20'
                      : 'border-pharos-slate-200 hover:border-pharos-slate-300 hover:bg-pharos-slate-50'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    visitType === 'in_person'
                      ? 'bg-pharos-blue-500 shadow-lg shadow-pharos-blue-500/30'
                      : 'bg-pharos-slate-200 group-hover:bg-pharos-slate-300'
                  }`}>
                    <Home className={`w-8 h-8 ${visitType === 'in_person' ? 'text-white' : 'text-pharos-slate-600'}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-pharos-navy-900 mb-1">Visita Presencial</p>
                    <p className="text-xs text-pharos-slate-600">
                      Conheça o imóvel pessoalmente
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisitType('video')}
                  className={`group flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${
                    visitType === 'video'
                      ? 'border-pharos-blue-500 bg-pharos-blue-50 shadow-lg shadow-pharos-blue-500/20'
                      : 'border-pharos-slate-200 hover:border-pharos-slate-300 hover:bg-pharos-slate-50'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    visitType === 'video'
                      ? 'bg-pharos-blue-500 shadow-lg shadow-pharos-blue-500/30'
                      : 'bg-pharos-slate-200 group-hover:bg-pharos-slate-300'
                  }`}>
                    <Video className={`w-8 h-8 ${visitType === 'video' ? 'text-white' : 'text-pharos-slate-600'}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-pharos-navy-900 mb-1">Visita por Vídeo</p>
                    <p className="text-xs text-pharos-slate-600">
                      Via WhatsApp ou Google Meet
                    </p>
                  </div>
                </button>
              </div>

              {/* Escolha de plataforma de vídeo */}
              {visitType === 'video' && (
                <div className="p-4 bg-pharos-base-off rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold text-pharos-slate-700 mb-3">
                    Plataforma preferida
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVideoProvider('whatsapp')}
                      className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                        videoProvider === 'whatsapp'
                          ? 'bg-[#25D366] text-white shadow-md'
                          : 'bg-white text-pharos-slate-700 border border-pharos-slate-300 hover:bg-pharos-slate-50'
                      }`}
                    >
                      WhatsApp Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoProvider('meet')}
                      className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                        videoProvider === 'meet'
                          ? 'bg-pharos-blue-500 text-white shadow-md'
                          : 'bg-white text-pharos-slate-700 border border-pharos-slate-300 hover:bg-pharos-slate-50'
                      }`}
                    >
                      Google Meet
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Escolha de Data */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-bold text-pharos-navy-900 mb-2">
                  Escolha o melhor dia
                </h3>
                <p className="text-sm text-pharos-slate-600">
                  Selecione uma data disponível para a visita
                </p>
              </div>

              {isLoadingAvailability ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-pharos-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div
                  ref={dateScrollRef}
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
                >
                  {availability.map((av) => {
                    const date = parseISO(av.date);
                    const isSelected = !!(selectedDate && isSameDay(date, selectedDate));
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                      <button
                        key={av.date}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-pharos-blue-500 bg-pharos-blue-50 shadow-lg shadow-pharos-blue-500/20'
                            : 'border-pharos-slate-200 hover:border-pharos-slate-300 hover:bg-pharos-slate-50'
                        }`}
                      >
                        <span className="text-xs text-pharos-slate-500 uppercase font-medium mb-1">
                          {format(date, 'EEE', { locale: ptBR })}
                        </span>
                        <span className="text-2xl font-bold text-pharos-navy-900 mb-1">
                          {format(date, 'dd')}
                        </span>
                        <span className="text-xs text-pharos-slate-500 uppercase">
                          {format(date, 'MMM', { locale: ptBR })}
                        </span>
                        {isToday && (
                          <span className="text-[10px] text-pharos-blue-500 font-bold mt-1">
                            HOJE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Escolha de Horário */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-bold text-pharos-navy-900 mb-2">
                  Escolha o horário
                </h3>
                <p className="text-sm text-pharos-slate-600">
                  {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>

              {selectedDaySlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-pharos-slate-500">
                    Sem horários disponíveis neste dia
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {selectedDaySlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`px-4 py-4 text-base font-semibold rounded-xl border-2 transition-all ${
                        selectedTime === slot
                          ? 'border-pharos-blue-500 bg-pharos-blue-500 text-white shadow-lg shadow-pharos-blue-500/20'
                          : 'border-pharos-slate-200 text-pharos-slate-700 hover:border-pharos-slate-300 hover:bg-pharos-slate-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Dados do Visitante */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-bold text-pharos-navy-900 mb-2">
                  Seus dados
                </h3>
                <p className="text-sm text-pharos-slate-600">
                  Para confirmar o agendamento
                </p>
              </div>

              <div>
                <label htmlFor="name-modal" className="block text-sm font-semibold text-pharos-slate-700 mb-2">
                  Seu nome *
                </label>
                <input
                  type="text"
                  id="name-modal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-4 py-3 border-2 border-pharos-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone-modal" className="block text-sm font-semibold text-pharos-slate-700 mb-2">
                  Seu WhatsApp *
                </label>
                <input
                  type="tel"
                  id="phone-modal"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 border-2 border-pharos-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email-modal" className="block text-sm font-semibold text-pharos-slate-700 mb-2">
                  Seu e-mail *
                </label>
                <input
                  type="email"
                  id="email-modal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border-2 border-pharos-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="notes-modal" className="block text-sm font-semibold text-pharos-slate-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  id="notes-modal"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma dúvida ou preferência?"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-pharos-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-transparent resize-none"
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

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-modal"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-5 h-5 mt-0.5 border-pharos-slate-300 rounded text-pharos-blue-500 focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2"
                  required
                />
                <label htmlFor="consent-modal" className="text-sm text-pharos-slate-700">
                  Autorizo contato por WhatsApp e e-mail sobre este agendamento. *
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Confirmação */}
          {currentStep === 4 && appointmentDetails && (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-full flex items-center justify-center">
                  <Check className="w-12 h-12 text-green-600" strokeWidth={2.5} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-pharos-navy-900 mb-2">
                Visita Agendada!
              </h3>
              <p className="text-sm text-pharos-slate-600 mb-8">
                Enviamos a confirmação por e-mail e WhatsApp
              </p>

              <div className="bg-pharos-base-off rounded-xl p-6 mb-6 text-left">
                <div className="flex items-start gap-4 mb-4">
                  <CalendarIcon className="w-6 h-6 text-pharos-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base font-bold text-pharos-navy-900">
                      {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                    </p>
                    <p className="text-sm text-pharos-slate-600 mt-1">
                      {visitType === 'in_person' ? 'Visita presencial' : `Visita por vídeo (${videoProvider === 'whatsapp' ? 'WhatsApp' : 'Google Meet'})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Home className="w-6 h-6 text-pharos-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base font-bold text-pharos-navy-900">
                      {propertyTitle}
                    </p>
                    <p className="text-sm text-pharos-slate-600 mt-1">
                      {propertyAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={appointmentDetails.googleCalendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <CalendarIcon className="w-5 h-5" />
                  Adicionar ao Google Calendar
                </a>

                <a
                  href={appointmentDetails.icsUrl}
                  download
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-pharos-slate-50 text-pharos-slate-700 font-semibold border-2 border-pharos-slate-200 rounded-xl transition-colors"
                >
                  Baixar arquivo .ics
                </a>

                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 text-pharos-slate-600 hover:text-pharos-slate-700 font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Navigation Buttons */}
        {currentStep < 4 && (
          <div className="px-6 py-4 border-t border-pharos-slate-200 bg-pharos-slate-50 flex items-center justify-between gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-pharos-slate-600 hover:text-pharos-slate-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            {currentStep === 3 ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmar Agendamento
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

