'use client';

import { useState } from 'react';
import PhoneInputPremium from './PhoneInputPremium';

export default function AnunciarForm() {
  const [anunciarStep, setAnunciarStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneE164, setPhoneE164] = useState('');
  const [phoneDDI, setPhoneDDI] = useState('+55');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  
  const [anunciarForm, setAnunciarForm] = useState({
    endereco: '',
    nome: '',
    email: '',
    telefone: '', // Formato exibido
    empreendimento: '',
    areaPrivativa: '',
    dormitorios: '',
    suites: '',
    vagas: '',
    mobiliado: 'nao' as 'sim' | 'nao',
  });

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Venda seu imóvel</h3>
        <p className="text-sm md:text-base text-gray-600">Avaliação gratuita em 4 passos simples.</p>
      </div>

      {/* Indicador de progresso refinado */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              anunciarStep >= step ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {anunciarStep === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço do imóvel</label>
            <input
              type="text"
              value={anunciarForm.endereco}
              onChange={(e) => setAnunciarForm(prev => ({ ...prev, endereco: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome completo</label>
            <input
              type="text"
              value={anunciarForm.nome}
              onChange={(e) => setAnunciarForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setAnunciarStep(2)}
              className="bg-primary hover:bg-primary-600 text-white py-3 px-8 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {anunciarStep === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              value={anunciarForm.email}
              onChange={(e) => setAnunciarForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone com WhatsApp</label>
            <PhoneInputPremium
              value={phoneE164}
              onChange={(e164, formatted, ddi) => {
                setPhoneE164(e164);
                setPhoneDDI(ddi);
                setAnunciarForm(prev => ({ ...prev, telefone: formatted }));
              }}
              onValidation={(isValid) => setIsPhoneValid(isValid)}
              required
            />
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setAnunciarStep(1)}
              className="text-gray-600 hover:text-gray-900 py-3 px-6 text-sm font-semibold transition-colors hover:bg-gray-50 rounded-xl"
            >
              Voltar
            </button>
            <button
              onClick={() => setAnunciarStep(3)}
              disabled={!anunciarForm.email || !isPhoneValid}
              className="bg-primary hover:bg-primary-600 text-white py-3 px-8 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {anunciarStep === 3 && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dormitórios</label>
              <input
                type="number"
                value={anunciarForm.dormitorios}
                onChange={(e) => setAnunciarForm(prev => ({ ...prev, dormitorios: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Suítes</label>
              <input
                type="number"
                value={anunciarForm.suites}
                onChange={(e) => setAnunciarForm(prev => ({ ...prev, suites: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vagas</label>
              <input
                type="number"
                value={anunciarForm.vagas}
                onChange={(e) => setAnunciarForm(prev => ({ ...prev, vagas: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                placeholder="2"
              />
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setAnunciarStep(2)}
              className="text-gray-600 hover:text-gray-900 py-3 px-6 text-sm font-semibold transition-colors hover:bg-gray-50 rounded-xl"
            >
              Voltar
            </button>
            <button
              onClick={() => setAnunciarStep(4)}
              className="bg-primary hover:bg-primary-600 text-white py-3 px-8 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {anunciarStep === 4 && (
        <div className="space-y-5">
          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">Erro ao enviar</p>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Área privativa (m²)</label>
              <input
                type="number"
                value={anunciarForm.areaPrivativa}
                onChange={(e) => setAnunciarForm(prev => ({ ...prev, areaPrivativa: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                placeholder="120"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Empreendimento</label>
              <input
                type="text"
                value={anunciarForm.empreendimento}
                onChange={(e) => setAnunciarForm(prev => ({ ...prev, empreendimento: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                placeholder="Nome do edifício"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mobiliado?</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative flex items-center justify-center gap-2.5 py-3.5 px-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:shadow-md has-[:checked]:shadow-primary/10">
                <input
                  type="radio"
                  name="mobiliado"
                  checked={anunciarForm.mobiliado === 'sim'}
                  onChange={() => setAnunciarForm(prev => ({ ...prev, mobiliado: 'sim' }))}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-gray-700">Sim</span>
                <svg className="w-5 h-5 text-primary opacity-0 has-[:checked]:opacity-100 absolute right-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </label>
              <label className="relative flex items-center justify-center gap-2.5 py-3.5 px-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:shadow-md has-[:checked]:shadow-primary/10">
                <input
                  type="radio"
                  name="mobiliado"
                  checked={anunciarForm.mobiliado === 'nao'}
                  onChange={() => setAnunciarForm(prev => ({ ...prev, mobiliado: 'nao' }))}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-gray-700">Não</span>
                <svg className="w-5 h-5 text-primary opacity-0 has-[:checked]:opacity-100 absolute right-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setAnunciarStep(3)}
              className="text-gray-600 hover:text-gray-900 py-3 px-6 text-sm font-semibold transition-colors hover:bg-gray-50 rounded-xl"
            >
              Voltar
            </button>
            <button
              onClick={async () => {
                setEnviandoAvaliacao(true);
                setErrorMessage(null);
                
                try {
                  // Preparar dados do lead
                  const leadData = {
                    name: anunciarForm.nome,
                    email: anunciarForm.email,
                    phone: phoneE164,
                    message: `Avaliação de Imóvel\n\nEndereço: ${anunciarForm.endereco}\nEmpreendimento: ${anunciarForm.empreendimento || 'Não informado'}\nÁrea: ${anunciarForm.areaPrivativa}m²\nDormitórios: ${anunciarForm.dormitorios}\nSuítes: ${anunciarForm.suites}\nVagas: ${anunciarForm.vagas}\nMobiliado: ${anunciarForm.mobiliado === 'sim' ? 'Sim' : 'Não'}`,
                    source: 'Site Pharos - Venda com a Pharos',
                    intent: 'sell', // Schema Zod requer 'sell' para captação
                    metadata: {
                      skipVista: true, // Envia apenas para C2S
                      formType: 'venda-com-pharos',
                      ddi: phoneDDI,
                      endereco: anunciarForm.endereco, // C2S mapper espera 'endereco'
                      empreendimento: anunciarForm.empreendimento,
                      areaPrivativa: anunciarForm.areaPrivativa,
                      dormitorios: anunciarForm.dormitorios,
                      suites: anunciarForm.suites,
                      vagas: anunciarForm.vagas,
                      mobiliado: anunciarForm.mobiliado,
                    }
                  };

                  // Enviar para API
                  const response = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData),
                  });

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erro ao enviar avaliação');
                  }

                  const result = await response.json();
                  
                  // Analytics
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'lead_submit', {
                      event_category: 'Formulário',
                      event_label: 'Venda com Pharos',
                      lead_type: 'captacao',
                      value: 1
                    });
                  }

                  // Sucesso
                  setAnunciarStep(5);
                  
                } catch (error: any) {
                  console.error('Erro ao enviar avaliação:', error);
                  setErrorMessage(error.message || 'Erro ao enviar. Tente novamente.');
                } finally {
                  setEnviandoAvaliacao(false);
                }
              }}
              disabled={enviandoAvaliacao}
              className="bg-primary hover:bg-primary-600 text-white py-3 px-8 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {enviandoAvaliacao ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : 'Receber avaliação'}
            </button>
          </div>
        </div>
      )}

      {anunciarStep === 5 && (
        <div className="text-center py-8 space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">Avaliação solicitada!</h4>
            <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
              Recebemos sua solicitação! Em breve, nossa equipe entrará em contato para validar as informações 
              e enviar a avaliação completa do seu imóvel.
            </p>
          </div>

          <a
            href="https://wa.me/554791878070"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white py-3.5 px-8 rounded-xl transition-all font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Falar no WhatsApp
          </a>

          <button
            onClick={() => {
              setAnunciarStep(1);
              setAnunciarForm({
                endereco: '',
                nome: '',
                email: '',
                telefone: '',
                empreendimento: '',
                areaPrivativa: '',
                dormitorios: '',
                suites: '',
                vagas: '',
                mobiliado: 'nao',
              });
              setPhoneE164('');
              setPhoneDDI('+55');
              setIsPhoneValid(false);
              setErrorMessage(null);
            }}
            className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors"
          >
            Fazer nova avaliação
          </button>
        </div>
      )}
    </div>
  );
}

