'use client';

import { useState } from 'react';

/**
 * PHAROS - MODAL DE COMPARTILHAMENTO
 * Modal para gerar link compartilhável dos favoritos
 */

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: string;
  collectionName?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  collectionId,
  collectionName,
}: ShareModalProps) {
  const [expiresIn, setExpiresIn] = useState<'7' | '30' | 'never'>('30');
  const [protected_, setProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    // Mock: gerar token e link
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/favoritos/compartilhado/${token}`;
    setGeneratedLink(link);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'fav_share_create', {
        expiresAt: expiresIn,
        protected: protected_,
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Erro ao copiar link');
    }
  };

  const handleWhatsApp = () => {
    const text = `Confira meus imóveis favoritos na Pharos: ${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = `Imóveis favoritos - Pharos`;
    const body = `Olá!\n\nConfira minha seleção de imóveis na Pharos:\n\n${generatedLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[900] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pharos-slate-300">
          <div>
            <h2 className="text-xl font-bold text-pharos-navy-900">
              Compartilhar favoritos
            </h2>
            {collectionName && (
              <p className="text-sm text-pharos-slate-500 mt-1">
                Coleção: {collectionName}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-pharos-slate-500 hover:text-pharos-slate-700 hover:bg-pharos-base-off rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!generatedLink ? (
            <>
              {/* Configurações */}
              <div>
                <label className="block text-sm font-semibold text-pharos-navy-900 mb-3">
                  Validade do link
                </label>
                <div className="space-y-2">
                  {[
                    { value: '7', label: '7 dias' },
                    { value: '30', label: '30 dias' },
                    { value: 'never', label: 'Sem expiração' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="expiry"
                        value={option.value}
                        checked={expiresIn === option.value}
                        onChange={(e) => setExpiresIn(e.target.value as any)}
                        className="w-4 h-4 text-pharos-blue-500 focus:ring-pharos-blue-500"
                      />
                      <span className="text-sm text-pharos-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Proteção por senha */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={protected_}
                    onChange={(e) => setProtected(e.target.checked)}
                    className="w-4 h-4 text-pharos-blue-500 rounded focus:ring-pharos-blue-500"
                  />
                  <span className="text-sm font-semibold text-pharos-navy-900">
                    Proteger com senha
                  </span>
                </label>

                {protected_ && (
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite uma senha (opcional)"
                    className="mt-3 w-full px-4 py-2.5 text-sm border border-pharos-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500"
                  />
                )}
              </div>

              {/* Info */}
              <div className="p-4 bg-pharos-blue-500/10 border border-pharos-blue-500/30 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-pharos-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-pharos-slate-700">
                    <p className="font-semibold mb-1">Link somente leitura</p>
                    <p className="text-pharos-slate-600">
                      Quem receber o link poderá visualizar os imóveis, mas não poderá editá-los.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Link gerado */}
              <div>
                <label className="block text-sm font-semibold text-pharos-navy-900 mb-2">
                  Link compartilhável
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-4 py-2.5 text-sm bg-pharos-base-off border border-pharos-slate-300 rounded-lg"
                  />
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-pharos-blue-500 text-white hover:bg-pharos-blue-600'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copiado!
                      </>
                    ) : (
                      'Copiar'
                    )}
                  </button>
                </div>
              </div>

              {/* Compartilhar em redes */}
              <div>
                <label className="block text-sm font-semibold text-pharos-navy-900 mb-3">
                  Compartilhar via
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>

                  <button
                    onClick={handleEmail}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-pharos-slate-700 text-white rounded-lg hover:bg-pharos-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    E-mail
                  </button>
                </div>
              </div>

              {/* Info adicional */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-green-800">
                    <p className="font-semibold">Link criado com sucesso!</p>
                    <p className="text-green-700 mt-1">
                      {expiresIn === 'never'
                        ? 'Este link não expira.'
                        : `Este link expira em ${expiresIn} dias.`}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-pharos-slate-300 flex justify-end gap-3">
          {!generatedLink ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-pharos-slate-700 bg-white border border-pharos-slate-300 rounded-lg hover:bg-pharos-base-off transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2.5 text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 transition-colors"
              >
                Gerar link
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 transition-colors"
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

