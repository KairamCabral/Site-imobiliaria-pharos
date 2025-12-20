'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, Check, Phone } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LeadWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  filtrosIniciais?: {
    cidade?: string;
    bairro?: string;
    precoMin?: number;
    precoMax?: number;
    quartos?: number;
    suites?: number;
    vagas?: number;
    caracteristicas?: string[];
  };
  tipo?: 'no_results' | 'end_of_list';
}

interface FormData {
  // Etapa 1: Preferências
  tipo: string[];
  bairros: string;
  suites: number;
  vagas: number;
  areaMin: number;
  
  // Etapa 2: Budget & Prazo
  precoMin: number;
  precoMax: number;
  status: string;
  prazo: string;
  
  // Etapa 3: Contato
  nome: string;
  email: string;
  ddi: string;
  telefone: string;
  aceitaWhatsApp: boolean;
  
  // 🍯 Honeypot
  website: string;
}

const ETAPAS = [
  { numero: 1, titulo: 'Preferências', descricao: 'Conte o que você procura' },
  { numero: 2, titulo: 'Budget & Prazo', descricao: 'Vamos falar de valores' },
  { numero: 3, titulo: 'Contato', descricao: 'Como te alcançamos' },
];

/**
 * Wizard de captação de leads em 3 etapas
 * Com pré-preenchimento, validação e integração WhatsApp
 */
export default function LeadWizardModal({
  isOpen,
  onClose,
  filtrosIniciais = {},
  tipo = 'no_results',
}: LeadWizardModalProps) {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Etapa 1 - pré-preenchida com filtros
    tipo: [],
    bairros: filtrosIniciais.bairro || '',
    suites: filtrosIniciais.suites || 0,
    vagas: filtrosIniciais.vagas || 0,
    areaMin: 0,
    
    // Etapa 2
    precoMin: filtrosIniciais.precoMin || 0,
    precoMax: filtrosIniciais.precoMax || 0,
    status: '',
    prazo: '',
    
    // Etapa 3
    nome: '',
    email: '',
    ddi: '+55',
    telefone: '',
    aceitaWhatsApp: true,
    website: '', // 🍯 Honeypot
  });

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen) {
      setEtapaAtual(1);
      setShowSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showSuccess) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, showSuccess, onClose]);

  // Trap focus no modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTipo = (tipo: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo: prev.tipo.includes(tipo)
        ? prev.tipo.filter((t) => t !== tipo)
        : [...prev.tipo, tipo],
    }));
  };

  // Máscara de telefone (formato brasileiro)
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    updateField('telefone', formatted);
  };

  const proximaEtapa = () => {
    if (etapaAtual < 3) {
      setEtapaAtual(etapaAtual + 1);
      
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'lead_wizard_next', {
          step: etapaAtual,
          tipo,
        });
      }
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_wizard_submit', {
        subscribed_whatsapp: formData.aceitaWhatsApp,
        tipo,
        budget: formData.precoMax,
      });
    }

    // Montar mensagem completa para WhatsApp
    const telefoneCompleto = `${formData.ddi} ${formData.telefone}`;
    
    let mensagem = `🏠 *NOVO LEAD - PHAROS IMOBILIÁRIA*\n\n`;
    mensagem += `👤 *DADOS DO CLIENTE*\n`;
    mensagem += `Nome: ${formData.nome}\n`;
    mensagem += `E-mail: ${formData.email}\n`;
    mensagem += `Telefone: ${telefoneCompleto}\n`;
    mensagem += `WhatsApp: ${formData.aceitaWhatsApp ? 'Sim' : 'Não'}\n\n`;
    
    mensagem += `🔍 *PREFERÊNCIAS DO IMÓVEL*\n`;
    if (formData.tipo.length > 0) {
      mensagem += `Tipo: ${formData.tipo.join(', ')}\n`;
    }
    if (formData.bairros) {
      mensagem += `Bairros: ${formData.bairros}\n`;
    }
    if (formData.suites > 0) {
      mensagem += `Suítes: ${formData.suites}\n`;
    }
    if (formData.vagas > 0) {
      mensagem += `Vagas: ${formData.vagas}\n`;
    }
    if (formData.areaMin > 0) {
      mensagem += `Área mínima: ${formData.areaMin}m²\n`;
    }
    
    mensagem += `\n💰 *ORÇAMENTO*\n`;
    if (formData.precoMin > 0) {
      mensagem += `Preço mínimo: R$ ${formData.precoMin.toLocaleString('pt-BR')}\n`;
    }
    if (formData.precoMax > 0) {
      mensagem += `Preço máximo: R$ ${formData.precoMax.toLocaleString('pt-BR')}\n`;
    }
    if (formData.status) {
      mensagem += `Status: ${formData.status}\n`;
    }
    if (formData.prazo) {
      mensagem += `Prazo: ${formData.prazo}\n`;
    }

    const mensagemEncoded = encodeURIComponent(mensagem);
    window.open(`https://wa.me/5547991878070?text=${mensagemEncoded}`, '_blank');

    setIsSubmitting(false);
    onClose();
  };

  const handleWhatsApp = () => {
    // Não usado mais, mas mantido para compatibilidade
    handleSubmit();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !showSuccess) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-[24px] shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#192233] to-[#054ADA] px-6 md:px-8 py-6 md:py-8">
          {/* Botão Fechar */}
          {!showSuccess && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {!showSuccess ? (
            <>
              {/* Barra de Progresso */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {ETAPAS.map((etapa) => (
                    <div
                      key={etapa.numero}
                      className={`flex items-center ${etapa.numero < ETAPAS.length ? 'flex-1' : ''}`}
                    >
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          transition-all duration-300
                          ${
                            etapa.numero < etapaAtual
                              ? 'bg-white text-[#054ADA]'
                              : etapa.numero === etapaAtual
                              ? 'bg-[#C89C4D] text-white'
                              : 'bg-white/20 text-white/60'
                          }
                        `}
                      >
                        {etapa.numero < etapaAtual ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          etapa.numero
                        )}
                      </div>
                      {etapa.numero < ETAPAS.length && (
                        <div
                          className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                            etapa.numero < etapaAtual ? 'bg-white' : 'bg-white/20'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Título da Etapa */}
              <h2
                id="modal-title"
                className="text-2xl md:text-3xl font-bold text-white mb-2"
              >
                {ETAPAS[etapaAtual - 1].titulo}
              </h2>
              <p className="text-white/80 text-sm md:text-base">
                {ETAPAS[etapaAtual - 1].descricao}
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#C89C4D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Busca personalizada ativada!
              </h2>
              <p className="text-white/90">
                Entraremos em contato em até 1h útil
              </p>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-6 md:py-8 overflow-y-auto max-h-[calc(90vh-280px)]">
          {!showSuccess ? (
            <>
              {/* ETAPA 1: Preferências */}
              {etapaAtual === 1 && (
                <div className="space-y-6">
                  {/* Tipo de Imóvel */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-3">
                      Tipo de imóvel *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Apartamento', 'Casa', 'Cobertura', 'Terreno'].map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => toggleTipo(tipo)}
                          className={`
                            px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all
                            ${
                              formData.tipo.includes(tipo)
                                ? 'border-[#054ADA] bg-[#054ADA]/5 text-[#054ADA]'
                                : 'border-[#E8ECF2] text-[#475569] hover:border-[#CBD5E1]'
                            }
                          `}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bairros */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-2">
                      Bairros de interesse
                    </label>
                    <input
                      type="text"
                      value={formData.bairros}
                      onChange={(e) => updateField('bairros', e.target.value)}
                      placeholder="Ex: Centro, Barra Sul, Nações"
                      className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                    />
                  </div>

                  {/* Suítes e Vagas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#192233] mb-2">
                        Suítes (mín.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.suites}
                        onChange={(e) => updateField('suites', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#192233] mb-2">
                        Vagas (mín.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.vagas}
                        onChange={(e) => updateField('vagas', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Área Mínima */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-2">
                      Área mínima (m²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.areaMin}
                      onChange={(e) => updateField('areaMin', parseInt(e.target.value) || 0)}
                      placeholder="Ex: 80"
                      className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 2: Budget & Prazo */}
              {etapaAtual === 2 && (
                <div className="space-y-6">
                  {/* Faixa de Preço */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-3">
                      Faixa de preço *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#64748B] mb-1">Mínimo</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.precoMin}
                          onChange={(e) => updateField('precoMin', parseInt(e.target.value) || 0)}
                          placeholder="R$ 500.000"
                          className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64748B] mb-1">Máximo</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.precoMax}
                          onChange={(e) => updateField('precoMax', parseInt(e.target.value) || 0)}
                          placeholder="R$ 1.500.000"
                          className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status do Imóvel */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-3">
                      Preferência de status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Lançamento', 'Em construção', 'Pronto'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateField('status', status)}
                          className={`
                            px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all
                            ${
                              formData.status === status
                                ? 'border-[#054ADA] bg-[#054ADA]/5 text-[#054ADA]'
                                : 'border-[#E8ECF2] text-[#475569] hover:border-[#CBD5E1]'
                            }
                          `}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prazo */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-3">
                      Quando pretende mudar?
                    </label>
                    <select
                      value={formData.prazo}
                      onChange={(e) => updateField('prazo', e.target.value)}
                      className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent bg-white"
                    >
                      <option value="">Selecione</option>
                      <option value="imediato">Imediato (até 3 meses)</option>
                      <option value="breve">Em breve (3-6 meses)</option>
                      <option value="medio">Médio prazo (6-12 meses)</option>
                      <option value="longo">Longo prazo (mais de 1 ano)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ETAPA 3: Contato */}
              {etapaAtual === 3 && (
                <div className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => updateField('nome', e.target.value)}
                      placeholder="Digite seu nome"
                      className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value.toLowerCase())}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Telefone com DDI */}
                  <div>
                    <label className="block text-sm font-semibold text-[#192233] mb-2">
                      Telefone/WhatsApp *
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={formData.ddi}
                        onChange={(e) => updateField('ddi', e.target.value)}
                        placeholder="+55"
                        className="w-20 px-3 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent text-center font-medium"
                      />
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={handleTelefoneChange}
                        placeholder="(47) 99999-9999"
                        maxLength={15}
                        className="flex-1 px-4 py-3 border border-[#E8ECF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#054ADA] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Checkbox WhatsApp */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.aceitaWhatsApp}
                        onChange={(e) => updateField('aceitaWhatsApp', e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#054ADA] border-[#CBD5E1] rounded focus:ring-2 focus:ring-[#054ADA]"
                      />
                      <span className="text-sm text-[#475569]">
                        Quero receber oportunidades por WhatsApp
                      </span>
                    </label>
                  </div>

                  {/* 🍯 Honeypot Field - Invisível para humanos, visível para bots */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
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

                  {/* Aviso LGPD (apenas texto) */}
                  <div className="bg-[#F7F9FC] border border-[#E8ECF2] rounded-xl p-4">
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Ao finalizar, você concorda com nossa política de privacidade e autoriza o uso dos seus dados conforme a LGPD. Seus dados estarão protegidos e serão utilizados apenas para contato sobre imóveis.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Tela de Sucesso */
            <div className="text-center py-8">
              <p className="text-lg text-[#475569] mb-8">
                Salvamos suas preferências e em breve um especialista entrará em contato.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleWhatsApp}
                  className="
                    w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold
                    px-6 py-4 rounded-xl
                    shadow-md hover:shadow-lg
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                >
                  <Phone className="w-5 h-5" />
                  Falar agora no WhatsApp
                </button>

                <button
                  onClick={onClose}
                  className="
                    w-full border-2 border-[#E8ECF2] text-[#192233] font-semibold
                    px-6 py-4 rounded-xl
                    hover:bg-[#F7F9FC]
                    transition-all duration-200
                  "
                >
                  Ver imóveis semelhantes agora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer com botões */}
        {!showSuccess && (
          <div className="border-t border-[#E8ECF2] px-6 md:px-8 py-4 flex items-center justify-between gap-4">
            {etapaAtual > 1 ? (
              <button
                onClick={etapaAnterior}
                className="flex items-center gap-2 text-[#475569] hover:text-[#192233] font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
            ) : (
              <div />
            )}

            {etapaAtual < 3 ? (
              <button
                onClick={proximaEtapa}
                disabled={etapaAtual === 1 && formData.tipo.length === 0}
                className="
                  bg-[#054ADA] hover:bg-[#043bb8]
                  disabled:bg-[#CBD5E1] disabled:cursor-not-allowed
                  text-white font-semibold
                  px-8 py-3 rounded-xl
                  transition-all duration-200
                "
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !formData.nome ||
                  !formData.email ||
                  !formData.telefone
                }
                className="
                  bg-[#054ADA] hover:bg-[#043bb8]
                  disabled:bg-[#CBD5E1] disabled:cursor-not-allowed
                  text-white font-semibold
                  px-8 py-3 rounded-xl
                  transition-all duration-200
                  min-w-[140px]
                "
              >
                {isSubmitting ? 'Enviando...' : 'Finalizar'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}

