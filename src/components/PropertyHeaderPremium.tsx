'use client';

import { useState } from 'react';
import { MapPin, Clock, Ruler, Heart, Share2, Zap, Star, Award } from 'lucide-react';
import { useFavoritos } from '@/contexts/FavoritosContext';

interface PropertyHeaderPremiumProps {
  propertyId: string;
  title: string;
  address: {
    street?: string;
    number?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  code: string;
  updatedAt?: string;
  distanciaMar?: number;
  price: number;
  priceLabel?: string;
  condominio?: number;
  iptu?: number;
  isExclusive?: boolean;
  isLaunch?: boolean;
  isFeatured?: boolean;
}

export default function PropertyHeaderPremium({
  propertyId,
  title,
  address,
  code,
  updatedAt,
  distanciaMar,
  price,
  priceLabel = 'Valor de Venda',
  condominio,
  iptu,
  isExclusive = false,
  isLaunch = false,
  isFeatured = false,
}: PropertyHeaderPremiumProps) {
  const [shareSuccess, setShareSuccess] = useState(false);
  const { isFavorito, toggleFavorito } = useFavoritos();
  const isFavorited = isFavorito(propertyId);

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatAddress = () => {
    const parts = [];
    if (address.street) {
      let streetPart = address.street;
      if (address.number) streetPart += `, ${address.number}`;
      parts.push(streetPart);
    }
    parts.push(address.neighborhood);
    parts.push(`${address.city}/${address.state}`);
    return parts.join(', ');
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Confira este imóvel: ${title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'share_click', {
            property_id: propertyId,
            method: 'web_share_api',
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Erro ao compartilhar:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'share_click', {
            property_id: propertyId,
            method: 'clipboard',
          });
        }
      } catch (err) {
        console.error('Erro ao copiar link:', err);
      }
    }
  };

  const handleFavorite = () => {
    toggleFavorito(propertyId);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'favorite_toggle', {
        property_id: propertyId,
        action: isFavorited ? 'remove' : 'add',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Badges e Ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Badges de Destaque */}
        <div className="flex flex-wrap items-center gap-2">
          {isExclusive && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/30">
              <Award className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="text-white text-xs font-bold uppercase tracking-wide">
                Exclusivo
              </span>
            </div>
          )}
          
          {isLaunch && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/30">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="text-white text-xs font-bold uppercase tracking-wide">
                Lançamento
              </span>
            </div>
          )}
          
          {isFeatured && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pharos-blue-500 to-purple-500 rounded-full shadow-lg shadow-pharos-blue-500/30">
              <Star className="w-4 h-4 text-white" strokeWidth={2.5} fill="currentColor" />
              <span className="text-white text-xs font-bold uppercase tracking-wide">
                Destaque
              </span>
            </div>
          )}
        </div>

        {/* Ações: Compartilhar e Favoritar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="group flex items-center gap-2 px-3 py-2 bg-white hover:bg-pharos-slate-50 border-2 border-pharos-slate-200 hover:border-pharos-blue-500 rounded-lg transition-all active:scale-95"
            title="Compartilhar imóvel"
          >
            {shareSuccess ? (
              <>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600 text-sm font-semibold hidden sm:inline">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-pharos-slate-600 group-hover:text-pharos-blue-600 transition-colors" strokeWidth={2} />
                <span className="text-pharos-slate-700 group-hover:text-pharos-blue-600 text-sm font-semibold hidden sm:inline">
                  Compartilhar
                </span>
              </>
            )}
          </button>

          <button
            onClick={handleFavorite}
            className="group flex items-center gap-2 px-3 py-2 bg-white hover:bg-red-50 border-2 border-pharos-slate-200 hover:border-red-500 rounded-lg transition-all active:scale-95"
            title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart 
              className={`w-5 h-5 transition-all ${isFavorited ? 'text-red-500 fill-red-500' : 'text-pharos-slate-600 group-hover:text-red-500'}`}
              strokeWidth={2} 
            />
            <span className={`text-sm font-semibold hidden sm:inline transition-colors ${isFavorited ? 'text-red-500' : 'text-pharos-slate-700 group-hover:text-red-500'}`}>
              {isFavorited ? 'Favoritado' : 'Favoritar'}
            </span>
          </button>
        </div>
      </div>

      {/* Título Premium */}
      <div>
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-pharos-navy-900 leading-[1.2] tracking-tight mb-4">
          {title}
        </h1>

        {/* Localização Premium */}
        <div className="flex items-start gap-2.5 text-pharos-slate-700 mb-4">
          <MapPin className="w-5 h-5 text-pharos-blue-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <p className="text-base font-medium leading-relaxed">
            {formatAddress()}
          </p>
        </div>

        {/* Metadados Premium */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {/* Código */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pharos-slate-50 border border-pharos-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-pharos-slate-500 uppercase tracking-wide">
              Cód:
            </span>
            <span className="text-sm font-mono font-semibold text-pharos-navy-900">
              {code}
            </span>
          </div>

          {/* Data de Atualização */}
          {updatedAt && (
            <>
              <div className="hidden sm:block w-px h-4 bg-pharos-slate-300" />
              <div className="flex items-center gap-2 text-pharos-slate-600">
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">
                  Atualizado em {new Date(updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </>
          )}

          {/* Distância do Mar */}
          {distanciaMar !== undefined && distanciaMar <= 300 && (
            <>
              <div className="hidden sm:block w-px h-4 bg-pharos-slate-300" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50 rounded-lg">
                <Ruler className="w-4 h-4 text-cyan-600" strokeWidth={2} />
                <span className="text-sm font-semibold text-cyan-900">
                  {distanciaMar === 0 ? 'Frente Mar' : `${distanciaMar}m do mar`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Divider Decorativo */}
      <div className="relative h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pharos-slate-200 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pharos-blue-500/20 to-transparent blur-sm" />
      </div>

      {/* Preço e Custos Premium */}
      <div className="space-y-3">
        {/* Preço Principal */}
        <div className="space-y-2 group">
          <p className="text-xs text-pharos-slate-500 uppercase tracking-widest font-semibold">
            {priceLabel}
          </p>
          <div className="relative inline-block">
            <p className="text-5xl lg:text-6xl font-extralight text-pharos-navy-900 tracking-tighter transition-all duration-300 group-hover:scale-105">
              {formatPrice(price)}
            </p>
            {/* Highlight animado */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pharos-blue-500/5 via-pharos-blue-500/10 to-pharos-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </div>
        </div>

        {/* Custos Adicionais - Minimalista */}
        {(condominio || iptu) && (
          <div className="flex items-center gap-4 text-xs text-pharos-slate-500">
            {condominio && (
              <span>
                Condomínio: <span className="font-medium text-pharos-slate-700">{formatPrice(condominio)}/mês</span>
              </span>
            )}
            {condominio && iptu && (
              <span className="text-pharos-slate-300">•</span>
            )}
            {iptu && (
              <span>
                IPTU: <span className="font-medium text-pharos-slate-700">{formatPrice(iptu)}/ano</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

