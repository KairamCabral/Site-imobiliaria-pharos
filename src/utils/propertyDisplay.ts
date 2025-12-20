/**
 * Utilitários de exibição para Property
 * - Centraliza formatações e seletores com fallback seguro
 */

import type { Property } from '@/domain/models';

export function getPropertyTitle(p: Property): string {
  if (p?.title && p.title.trim()) return p.title.trim();
  const type = p?.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : 'Imóvel';
  const rooms = p?.specs?.bedrooms ? `${p.specs.bedrooms} ${p.specs.bedrooms === 1 ? 'quarto' : 'quartos'}` : '';
  const place = p?.address?.neighborhood || p?.address?.city || '';
  const parts = [type, rooms && `de ${rooms}`, place && `em ${place}`].filter(Boolean);
  return parts.join(' ') || 'Imóvel';
}

export function formatCurrencyBRL(value?: number): string {
  if (!value || isNaN(value)) return 'Sob consulta';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDisplayPrice(p?: Property): string {
  if (!p) return 'Sob consulta';
  return formatCurrencyBRL(p.pricing?.sale ?? p.pricing?.rent);
}

export function getBreadcrumbParts(p?: Property): { label: string; href: string }[] {
  if (!p) return [];
  const city = (p.address?.city || '').trim();
  const neighborhood = (p.address?.neighborhood || '').trim();
  const crumbs: { label: string; href: string }[] = [];

  if (city) {
    const href = `/imoveis?city=${encodeURIComponent(city)}`;
    crumbs.push({ label: city, href });
  }

  if (neighborhood) {
    const base = city ? `/imoveis?city=${encodeURIComponent(city)}&neighborhood=${encodeURIComponent(neighborhood)}` : `/imoveis?neighborhood=${encodeURIComponent(neighborhood)}`;
    crumbs.push({ label: neighborhood, href: base });
  }

  return crumbs;
}

export function getPrimaryImage(p?: Property): string | undefined {
  return p?.photos?.[0]?.url || undefined;
}

export function safeText(value?: string, fallback: string = 'N/A'): string {
  const v = (value || '').trim();
  return v || fallback;
}

export function formatArea(value?: number): string | undefined {
  if (!value || isNaN(value)) return undefined;
  return `${Number(value).toLocaleString('pt-BR')} m²`;
}

export function formatDateBR(date?: Date | string): string | undefined {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('pt-BR');
}

export function getPropertyCode(p?: Property): string | undefined {
  if (!p) return undefined;
  return (p.code && String(p.code)) || (p.providerData?.originalId && String(p.providerData.originalId)) || (p.id && String(p.id)) || undefined;
}


