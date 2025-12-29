'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './Button';
import { twMerge } from 'tailwind-merge';
import { useRouter, usePathname } from 'next/navigation';
import { useFavoritos } from '@/contexts/FavoritosContext';
import { createBairroSlug } from '@/utils/locationSlug';
import {
  CITY_OPTIONS,
  STATUS_OPTIONS,
  VALUE_RANGE_OPTIONS,
  getNeighborhoodOptionsByCity,
} from '@/constants/filterOptions';
import {
  buildPropertySearchParams,
  type PropertySearchFiltersInput,
  type BuildSearchParamsOptions,
} from '@/utils/propertySearchParams';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  hasDropdown?: boolean;
  dropdownContent?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

interface DropdownLinkProps {
  href: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

function DropdownLink({ href, title, description, icon, onClick }: DropdownLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3.5 p-4 hover:bg-gradient-to-r hover:from-pharos-blue-500/5 hover:to-transparent rounded-xl transition-all duration-300"
      onClick={onClick}
    >
      {icon && (
        <div className="flex-shrink-0 w-11 h-11 bg-pharos-blue-500/10 rounded-xl flex items-center justify-center text-pharos-blue-500 group-hover:bg-pharos-blue-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[15px] text-pharos-navy-900 group-hover:text-pharos-blue-500 transition-colors">
          {title}
        </div>
        {description && (
          <div className="text-[13px] text-pharos-slate-500 mt-1 line-clamp-1">{description}</div>
        )}
      </div>
      <svg
        className="w-4 h-4 text-pharos-slate-500 group-hover:text-pharos-blue-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

interface MegaMenuLink {
  label: string;
  description?: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
}

const buildFilterHref = (
  filters: PropertySearchFiltersInput,
  options?: BuildSearchParamsOptions,
) => {
  const params = buildPropertySearchParams(filters, {
    includeDefaultCity: false,
    ...(options ?? {}),
  });
  const searchParams = params.toString();
  return searchParams ? `/imoveis?${searchParams}` : '/imoveis';
};

const PRIMARY_CATEGORY_LINKS: MegaMenuLink[] = [
  {
    label: 'Apartamentos',
    description: 'Plantas amplas com lazer completo',
    href: buildFilterHref(
      { types: ['Apartamento'] },
      { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } }
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    label: 'Coberturas',
    description: 'Vista panorâmica e privacidade total',
    href: buildFilterHref(
      { types: ['Cobertura'] },
      { sort: { sortBy: 'price', sortOrder: 'desc' } }
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  },
  {
    label: 'Exclusivos',
    description: 'Portfólio reservado e assinaturas únicas',
    href: buildFilterHref(
      { isExclusive: true },
      { sort: { sortBy: 'price', sortOrder: 'desc' } }
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  },
  {
    label: 'Frente Mar',
    description: 'Vista definitiva para o Atlântico e pé na areia',
    href: buildFilterHref(
      { locationFeatures: ['Frente Mar'] },
      { sort: { sortBy: 'price', sortOrder: 'desc' } }
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12s2-2 6-2 6 2 6 2 2-2 6-2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 18s2-2 6-2 6 2 6 2 2-2 6-2"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 0l2-2m-2 2L10 4" />
      </svg>
    ),
  },
];

const SMART_FILTER_LINKS: MegaMenuLink[] = [
  {
    label: 'Vista para o Mar',
    description: 'Varandas panorâmicas frente mar',
    href: buildFilterHref(
      { propertyFeatures: ['Vista para o Mar'] },
      { sort: { sortBy: 'price', sortOrder: 'desc' } },
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 18c2.21-1.5 4.59-2.25 7-2.25s4.79.75 7 2.25M3 6l7.89 5.26a2 2 0 002.22 0L21 6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: 'Mobiliado',
    description: 'Pronto para morar com décor completo',
    href: buildFilterHref(
      { propertyFeatures: ['Mobiliado'] },
      { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } },
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
        />
      </svg>
    ),
  },
  {
    label: 'Churrasqueira a carvão',
    description: 'Área gourmet com churrasqueira tradicional',
    href: buildFilterHref(
      { propertyFeatures: ['Churrasqueira a carvão'] },
      { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } },
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
        />
      </svg>
    ),
  },
  {
    label: 'Sacada',
    description: 'Espaço ao ar livre integrado',
    href: buildFilterHref(
      { propertyFeatures: ['Sacada'] },
      { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } },
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
];

const STATUS_DESCRIPTION_MAP: Record<string, string> = {
  'pre-lancamento': 'Antecipe-se às reservas prioritárias',
  lancamento: 'Condições especiais de lançamento',
  construcao: 'Acompanhe obras em andamento',
  pronto: 'Entrega imediata e vistoria concluída',
};

const STATUS_ICON_MAP: Record<string, React.ReactNode> = {
  'pre-lancamento': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 1.79-3 4s1.343 4 3 4 3-1.79 3-4-1.343-4-3-4z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364l-1.414-1.414M8.05 8.05L6.636 6.636m0 10.728l1.414-1.414M17.95 8.05l1.414-1.414" />
    </svg>
  ),
  lancamento: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 19a9 9 0 009 0M12 3v10m0 0l3-3m-3 3l-3-3"
      />
    </svg>
  ),
  construcao: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 8h2a2 2 0 012 2v9h-6V12H9v7H3v-9a2 2 0 012-2h2"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8V6a5 5 0 1110 0v2" />
    </svg>
  ),
  pronto: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

const STATUS_FILTER_LINKS: MegaMenuLink[] = STATUS_OPTIONS.map((status) => ({
  label: status.label,
  description: STATUS_DESCRIPTION_MAP[status.id] ?? 'Descubra as oportunidades disponíveis',
  href: buildFilterHref({ status: [status.id] }, { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } }),
  icon: STATUS_ICON_MAP[status.id],
}));

const PRICE_RANGE_LINKS = VALUE_RANGE_OPTIONS.map((range) => ({
  label: range.label,
  href: buildFilterHref(
    { priceRanges: [range.id] },
    { sort: { sortBy: 'price', sortOrder: 'asc' } },
  ),
}));

const CITY_DESCRIPTION_MAP: Record<string, string> = {
  'balneario-camboriu': 'Capital catarinense do alto padrão',
  itajai: 'Infraestrutura náutica e logística',
  camboriu: 'Condomínios horizontais exclusivos',
};

const CITY_LINKS: MegaMenuLink[] = CITY_OPTIONS.map((city) => ({
  label: city.label,
  description: CITY_DESCRIPTION_MAP[city.id] ?? 'Imóveis selecionados na região',
  href: buildFilterHref(
    { citySlugs: [city.id] },
    { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } }
  ),
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  ),
}));

const NEIGHBORHOOD_DESCRIPTION_MAP: Record<string, string> = {
  Centro: 'Mobilidade total e serviços 24h',
  'Barra Sul': 'Endereço nobre com marina e nightlife',
  'Barra Norte': 'Infraestrutura completa e natureza',
  Pioneiros: 'High-end com acesso rápido à BR-101',
  Nações: 'Região estratégica com facilidades',
  'Praia Brava': 'Lifestyle pé na areia e beach clubs',
  Fazenda: 'Vista para a marina de Itajaí',
};

const NEIGHBORHOOD_LINKS: MegaMenuLink[] = [
  ...getNeighborhoodOptionsByCity(['balneario-camboriu'])
    .slice(0, 6)
    .map((bairro) => ({
      label: bairro.label,
      description: NEIGHBORHOOD_DESCRIPTION_MAP[bairro.label] ?? 'Seleção curada na região',
      href: `/imoveis/bairro/${createBairroSlug(bairro.label, 'Balneário Camboriú')}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      ),
    })),
  ...getNeighborhoodOptionsByCity(['itajai']).map((bairro) => ({
    label: `${bairro.label} • Itajaí`,
    description: NEIGHBORHOOD_DESCRIPTION_MAP[bairro.label] ?? 'Bairro estratégico e consolidado',
    href: `/imoveis/bairro/${createBairroSlug(bairro.label, 'Itajaí')}`,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    ),
  })),
];

const LOCATION_QUICK_LINKS: MegaMenuLink[] = [
  {
    label: 'Frente Mar',
    description: 'Vista definitiva para o Atlântico e pé na areia',
    href: buildFilterHref(
      { locationFeatures: ['Frente Mar'] },
      { sort: { sortBy: 'price', sortOrder: 'desc' } },
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12s2-2 6-2 6 2 6 2 2-2 6-2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 18s2-2 6-2 6 2 6 2 2-2 6-2"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 0l2-2m-2 2L10 4" />
      </svg>
    ),
  },
  {
    label: 'Avenida Brasil',
    description: 'Endereço vibrante com comércio e serviços premium',
    href: buildFilterHref(
      { locationFeatures: ['Avenida Brasil'] },
      { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } },
    ),
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 19l4-14m2 0l4 14m2 0l4-14"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9h4M8 13h4M6 17h4" />
      </svg>
    ),
  },
  {
    label: 'Praia Brava',
    description: 'Beach clubs, natureza preservada e lifestyle premium',
    href: `/imoveis/bairro/${createBairroSlug('Praia Brava', 'Balneário Camboriú')}`,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 15s2-2 8-2 8 2 8 2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7c0-1.657 1.79-3 4-3 2.21 0 4 1.343 4 3s-1.79 3-4 3-4 1-4 3"
        />
      </svg>
    ),
  },
];

function MegaMenuCard({
  link,
  onNavigate,
  className,
}: {
  link: MegaMenuLink;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={link.href}
      className={twMerge(
        'group relative flex w-full items-center gap-3 rounded-xl border border-white/18 bg-white/85 px-4 py-3 text-left shadow-[0_12px_32px_rgba(13,27,71,0.08)] backdrop-blur-xl transition-colors duration-150 hover:border-pharos-blue-300/40 hover:bg-white hover:shadow-[0_18px_36px_rgba(13,27,71,0.12)]',
        className,
      )}
      onClick={onNavigate}
    >
      {link.icon && (
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-pharos-blue-200/40 bg-white/80 text-pharos-blue-500 transition-colors duration-150 group-hover:bg-pharos-blue-500 group-hover:text-white">
          {link.icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-pharos-navy-900 transition-colors duration-150 group-hover:text-pharos-blue-600">
          {link.label}
        </span>
        {link.description && (
          <span className="mt-0.5 block text-xs text-pharos-slate-500 transition-colors duration-150 group-hover:text-pharos-slate-600">
            {link.description}
          </span>
        )}
      </span>
      <svg
        className="h-4 w-4 flex-shrink-0 text-pharos-slate-400 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-pharos-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      {link.badge && (
        <span className="absolute -top-2 -right-2 rounded-full bg-pharos-blue-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          {link.badge}
        </span>
      )}
    </Link>
  );
}

function NavLink({
  href,
  children,
  className,
  hasDropdown,
  dropdownContent,
  onClick,
  isActive,
}: NavLinkProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const linkRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateDropdownPosition = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!linkRef.current) return;
    const rect = linkRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pagePadding = 16;
    const targetWidth = Math.min(1240, viewportWidth - pagePadding * 2);
    const left = Math.max(pagePadding, (viewportWidth - targetWidth) / 2);
    const topOffset = 12;
    const desiredTop = rect.bottom + topOffset;
    const maxTop = Math.max(pagePadding, viewportHeight - 120);
    setDropdownPosition({
      top: Math.min(desiredTop, maxTop),
      left,
      width: targetWidth,
    });
  }, []);

  useEffect(() => {
    if (!isDropdownOpen || typeof window === 'undefined') return;
    const handleReposition = () => requestAnimationFrame(updateDropdownPosition);
    handleReposition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isDropdownOpen, updateDropdownPosition]);

  const handleMouseEnter = () => {
    if (hasDropdown) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasDropdown) {
      timeoutRef.current = setTimeout(() => {
        if (!isHoveringDropdown) {
          setIsDropdownOpen(false);
        }
      }, 150);
    }
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHoveringDropdown(true);
  };

  const handleDropdownMouseLeave = () => {
    setIsHoveringDropdown(false);
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={linkRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className={twMerge(
          'relative inline-flex items-center gap-1 text-sm font-medium text-pharos-slate-700 hover:text-pharos-blue-500 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-pharos-blue-500/5',
          hasDropdown && 'group',
          isActive && 'text-pharos-blue-500 bg-pharos-blue-500/10',
          className
        )}
        onClick={onClick}
      >
        {children}
        {hasDropdown && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={twMerge(
              'h-4 w-4 transition-transform duration-300',
              isDropdownOpen ? 'rotate-180' : 'rotate-0'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </Link>

      {hasDropdown &&
        isMounted &&
        isDropdownOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={twMerge(
              'fixed max-w-full rounded-[28px] border border-white/18 bg-gradient-to-br from-white/92 via-white/84 to-white/78 shadow-[0_22px_68px_rgba(13,27,71,0.2)] backdrop-blur-[22px] transition duration-150 ease-out origin-top',
              isDropdownOpen
                ? 'opacity-100 translate-y-0'
                : 'pointer-events-none opacity-0 -translate-y-2'
            )}
            style={{
              zIndex: 'var(--z-dropdown)',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: dropdownPosition.width ? `${dropdownPosition.width}px` : undefined,
            }}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <div className="max-h-[calc(100vh-140px)] overflow-y-auto px-5 py-5">
              {dropdownContent}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileLocationsOpen, setIsMobileLocationsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { getTotalCount } = useFavoritos();
  
  const favoritosCount = getTotalCount();

  // Check if component is mounted (for portal)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearchClick = () => {
    router.push('/imoveis');
  };

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevenir scroll quando menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsMobileFiltersOpen(false);
      setIsMobileLocationsOpen(false);
    }
  }, [isMobileMenuOpen]);

  // Fechar menu mobile ao redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const imoveisDropdown = (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <div className="grid gap-5 md:grid-cols-12">
        <div className="rounded-2xl border border-white/25 bg-white/70 p-5 shadow-[0_14px_38px_rgba(13,27,71,0.12)] backdrop-blur-xl md:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pharos-blue-500/90">
                Curadoria Pharos
              </p>
              <h3 className="text-xl font-semibold text-pharos-navy-900">Experiências de morar</h3>
              <p className="text-sm text-pharos-slate-500">
                Escolha o estilo que domina as buscas dos nossos clientes.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {PRIMARY_CATEGORY_LINKS.map((link) => (
              <MegaMenuCard key={link.label} link={link} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/25 bg-white/70 p-5 shadow-[0_14px_38px_rgba(13,27,71,0.12)] backdrop-blur-xl md:col-span-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pharos-blue-500">
              One-click
            </p>
            <h3 className="text-xl font-semibold text-pharos-navy-900">Filtros inteligentes</h3>
            <p className="text-sm text-pharos-slate-500">
              Atalhos mais usados para avançar direto para o imóvel certo.
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {SMART_FILTER_LINKS.map((link) => (
              <MegaMenuCard key={link.label} link={link} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="rounded-2xl border border-white/25 bg-white/70 p-5 shadow-[0_12px_30px_rgba(13,27,71,0.1)] backdrop-blur-xl md:col-span-6">
          <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-pharos-slate-500">
            Estágio do empreendimento
          </h4>
          <div className="mt-3 space-y-2">
            {STATUS_FILTER_LINKS.map((link) => (
              <MegaMenuCard key={link.label} link={link} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/25 bg-white/70 p-5 shadow-[0_12px_30px_rgba(13,27,71,0.1)] backdrop-blur-xl md:col-span-6">
          <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-pharos-slate-500">
            Investimento planejado
          </h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PRICE_RANGE_LINKS.map((link) => (
              <MegaMenuCard key={link.label} link={link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const bcNeighborhoods = getNeighborhoodOptionsByCity(['balneario-camboriu']);
  const itajaiNeighborhoods = getNeighborhoodOptionsByCity(['itajai']);
  const mapPinIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );

  const bairrosDropdown = (
    <div className="mx-auto w-full max-w-[1180px] space-y-5">
      <div className="grid gap-5 md:grid-cols-12">
        <div className="rounded-2xl border border-white/30 bg-white/70 p-6 shadow-[0_16px_40px_rgba(13,27,71,0.12)] backdrop-blur-2xl md:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pharos-slate-400">
                Balneário Camboriú
              </p>
              <h3 className="text-xl font-semibold text-pharos-navy-900">Bairros premium</h3>
              <p className="text-sm text-pharos-slate-500">
                Conecte-se aos endereços mais desejados com infraestrutura completa e lifestyle premium.
              </p>
            </div>
            <Link
              href={buildFilterHref(
                { citySlugs: ['balneario-camboriu'] },
                { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } }
              )}
              className="inline-flex items-center gap-2 rounded-xl border border-pharos-blue-200/40 bg-white/70 px-3 py-2 text-xs font-semibold text-pharos-navy-900 transition-colors duration-200 hover:border-pharos-blue-400 hover:text-pharos-blue-600"
            >
              Ver cidade
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {bcNeighborhoods.map((bairro) => (
              <MegaMenuCard
                key={`bc-${bairro.id}`}
                link={{
                  label: bairro.label,
                  description:
                    NEIGHBORHOOD_DESCRIPTION_MAP[bairro.label] ??
                    'Bairro de alto padrão em Balneário Camboriú',
                  href: `/imoveis/bairro/${createBairroSlug(bairro.label, 'Balneário Camboriú')}`,
                  icon: mapPinIcon(),
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-6 shadow-[0_16px_40px_rgba(13,27,71,0.12)] backdrop-blur-2xl md:col-span-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pharos-slate-400">
                Itajaí
              </p>
              <h3 className="text-xl font-semibold text-pharos-navy-900">Bairros selecionados</h3>
              <p className="text-sm text-pharos-slate-500">
                Seleção exclusiva em uma das cidades mais dinâmicas de Santa Catarina.
              </p>
            </div>
            <Link
              href={buildFilterHref(
                { citySlugs: ['itajai'] },
                { sort: { sortBy: 'updatedAt', sortOrder: 'desc' } }
              )}
              className="inline-flex items-center gap-2 rounded-xl border border-pharos-blue-200/40 bg-white/70 px-3 py-2 text-xs font-semibold text-pharos-navy-900 transition-colors duration-200 hover:border-pharos-blue-400 hover:text-pharos-blue-600"
            >
              Ver cidade
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {itajaiNeighborhoods.map((bairro) => (
              <MegaMenuCard
                key={`itajai-${bairro.id}`}
                link={{
                  label: bairro.label,
                  description:
                    NEIGHBORHOOD_DESCRIPTION_MAP[bairro.label] ?? 'Infraestrutura completa em Itajaí',
                  href: `/imoveis/bairro/${createBairroSlug(bairro.label, 'Itajaí')}`,
                  icon: mapPinIcon(),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        id="site-header"
        className={twMerge(
          'fixed top-0 left-0 w-full z-header transition-all duration-300',
          isScrolled ? 'bg-pharos-base-white/95 backdrop-blur-md shadow-card-hover' : 'bg-pharos-base-white shadow-card'
        )}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1400px]">
        <div className="flex items-center justify-between h-[72px] sm:h-20 lg:h-[88px]">
          {/* Logo */}
          <Link
            href="/"
            className="relative z-50 flex-shrink-0 transition-transform duration-300 hover:scale-[1.02] h-10 sm:h-11 lg:h-12 w-auto"
            style={{ aspectRatio: '160/42' }}
          >
            <Image
              src="/images/logos/Logo-pharos.webp"
              alt="Pharos Negócios Imobiliários"
              fill
              sizes="(max-width: 640px) 120px, (max-width: 1024px) 140px, 160px"
              className="object-contain object-left"
              priority
            />
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink
              href="/imoveis"
              hasDropdown
              dropdownContent={imoveisDropdown}
              isActive={pathname?.startsWith('/imoveis')}
            >
              Imóveis
            </NavLink>

            <NavLink href="/empreendimentos" isActive={pathname?.startsWith('/empreendimentos')}>
              Empreendimentos
            </NavLink>

            <NavLink
              href={`/imoveis/bairro/${createBairroSlug('Centro', 'Balneário Camboriú')}`}
              hasDropdown
              dropdownContent={bairrosDropdown}
              isActive={pathname?.includes('/bairro/')}
            >
              Bairros
            </NavLink>

            <NavLink href="/sobre" isActive={pathname === '/sobre'}>
              Sobre
            </NavLink>

            <NavLink href="/contato" isActive={pathname === '/contato'}>
              Contato
            </NavLink>
          </nav>

          {/* Ações Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/favoritos"
              aria-label={`Meus Favoritos${favoritosCount > 0 ? ` (${favoritosCount})` : ''}`}
              className={twMerge(
                "relative p-2.5 rounded-xl transition-all duration-200",
                pathname === '/favoritos'
                  ? 'text-pharos-blue-500 bg-pharos-blue-500/10'
                  : 'text-pharos-slate-500 hover:text-pharos-blue-500 hover:bg-pharos-blue-500/10'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill={pathname === '/favoritos' ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {favoritosCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-pharos-blue-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white px-1">
                  {favoritosCount > 99 ? '99+' : favoritosCount}
                </span>
              )}
            </Link>

            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-pharos-blue-500/20 hover:shadow-xl hover:shadow-pharos-blue-500/30 transition-all duration-300 font-semibold"
              onClick={handleSearchClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[18px] w-[18px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Buscar Imóvel
            </Button>
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              aria-label="Buscar"
              className="p-2 text-pharos-slate-500 hover:text-pharos-blue-500 hover:bg-pharos-blue-500/10 rounded-lg transition-all duration-200"
              onClick={handleSearchClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Botão Hamburger - só aparece quando menu está fechado */}
            {!isMobileMenuOpen && (
              <button
                className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-pharos-slate-700"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Abrir menu"
                aria-expanded={false}
              >
                <span className="block w-6 h-0.5 bg-current" />
                <span className="block w-6 h-0.5 bg-current" />
                <span className="block w-6 h-0.5 bg-current" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
    {/* Menu Mobile Portal - Renderizado fora do header para evitar problemas de height */}
    {isMounted && isMobileMenuOpen && createPortal(
      <>
        {/* Menu Mobile - Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ zIndex: 9999998 }}
        />

        {/* Menu Mobile - Drawer */}
        <div
        className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-pharos-base-white flex flex-col lg:hidden shadow-2xl"
        style={{ 
          zIndex: 9999999,
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      >
        {/* Header do Menu Mobile */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-pharos-slate-300">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <Image
              src="/images/logos/Logo-pharos.webp"
              alt="Pharos"
              width={140}
              height={36}
              style={{ height: 'auto' }}
              className="h-10 w-auto"
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 hover:bg-pharos-slate-300/30 rounded-xl transition-colors"
            aria-label="Fechar menu"
          >
            <svg
              className="w-6 h-6 text-pharos-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo do Menu Mobile */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 sm:px-5">
          <div className="space-y-4">
            <Link
              href="/imoveis"
              className={twMerge(
                'flex items-center justify-between rounded-xl px-4 py-4 font-semibold text-[15px] transition-all duration-200 sm:px-5',
                pathname?.startsWith('/imoveis')
                  ? 'bg-pharos-blue-500 text-white shadow-lg shadow-pharos-blue-500/20'
                  : 'bg-pharos-base-off text-pharos-slate-700 hover:bg-pharos-blue-500/10 hover:text-pharos-blue-600'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Imóveis</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/empreendimentos"
              className={twMerge(
                'flex items-center justify-between rounded-xl px-4 py-4 font-semibold text-[15px] transition-all duration-200 sm:px-5',
                pathname?.startsWith('/empreendimentos')
                  ? 'bg-pharos-blue-500 text-white shadow-lg shadow-pharos-blue-500/20'
                  : 'bg-white/80 text-pharos-slate-700 hover:bg-pharos-blue-500/10 hover:text-pharos-blue-600'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Empreendimentos</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="rounded-2xl border border-white/25 bg-white/65 p-4 shadow-[0_12px_32px_rgba(13,27,71,0.12)] backdrop-blur-xl sm:p-5">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
              >
                <div>
                  <span className="text-sm font-semibold text-pharos-navy-900">Buscas rápidas</span>
                  <p className="mt-1 text-xs text-pharos-slate-500">
                    Acesse filtros inteligentes e categorias com um toque.
                  </p>
                </div>
                <svg
                  className={twMerge(
                    'h-5 w-5 text-pharos-slate-400 transition-transform duration-200',
                    isMobileFiltersOpen ? 'rotate-180' : 'rotate-0'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMobileFiltersOpen && (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-pharos-slate-400">
                      Experiências de morar
                    </p>
                    <div className="mt-2 space-y-2">
                      {PRIMARY_CATEGORY_LINKS.map((link) => (
                        <MegaMenuCard
                          key={`mobile-category-${link.label}`}
                          link={link}
                          onNavigate={() => setIsMobileMenuOpen(false)}
                          className="bg-white hover:bg-pharos-blue-500/5"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-pharos-slate-200 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-pharos-slate-400">
                      Filtros inteligentes
                    </p>
                    <div className="mt-2 space-y-2">
                      {SMART_FILTER_LINKS.map((link) => (
                        <MegaMenuCard
                          key={`mobile-smart-${link.label}`}
                          link={link}
                          onNavigate={() => setIsMobileMenuOpen(false)}
                          className="bg-white hover:bg-pharos-blue-500/5"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-pharos-slate-200 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-pharos-slate-400">
                      Estágio do empreendimento
                    </p>
                    <div className="mt-2 space-y-2">
                      {STATUS_FILTER_LINKS.map((link) => (
                        <MegaMenuCard
                          key={`mobile-status-${link.label}`}
                          link={link}
                          onNavigate={() => setIsMobileMenuOpen(false)}
                          className="bg-white hover:bg-pharos-blue-500/5"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-pharos-slate-200 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-pharos-slate-400">
                      Investimento planejado
                    </p>
                    <div className="mt-2 space-y-2">
                      {PRICE_RANGE_LINKS.map((range) => (
                        <Link
                          key={`mobile-price-${range.label}`}
                          href={range.href}
                          className="group flex items-center justify-between gap-2 rounded-xl border border-pharos-slate-200 bg-white px-4 py-3 text-sm font-semibold text-pharos-slate-600 transition-all duration-200 hover:border-pharos-blue-400 hover:text-pharos-blue-600 hover:shadow-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>{range.label}</span>
                          <svg
                            className="h-4 w-4 text-pharos-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-pharos-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/25 bg-white/65 p-4 shadow-[0_12px_32px_rgba(13,27,71,0.12)] backdrop-blur-xl sm:p-5">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => setIsMobileLocationsOpen((prev) => !prev)}
              >
                <div>
                  <span className="text-sm font-semibold text-pharos-navy-900">Localizações estratégicas</span>
                  <p className="mt-1 text-xs text-pharos-slate-500">
                    Descubra por cidade, hotspots e estilo de localização.
                  </p>
                </div>
                <svg
                  className={twMerge(
                    'h-5 w-5 text-pharos-slate-400 transition-transform duration-200',
                    isMobileLocationsOpen ? 'rotate-180' : 'rotate-0'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMobileLocationsOpen && (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-pharos-slate-400">
                      Por cidade
                    </p>
                    <div className="mt-2 space-y-2">
                      {CITY_LINKS.map((link) => (
                        <MegaMenuCard
                          key={`mobile-city-${link.label}`}
                          link={link}
                          onNavigate={() => setIsMobileMenuOpen(false)}
                          className="bg-white hover:bg-pharos-blue-500/5"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-pharos-slate-200 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-pharos-slate-400">
                      Hotspots preferidos
                    </p>
                    <div className="mt-2 space-y-2">
                      {NEIGHBORHOOD_LINKS.slice(0, 8).map((link, index) => (
                        <MegaMenuCard
                          key={`mobile-neighborhood-${index}-${link.label}`}
                          link={link}
                          onNavigate={() => setIsMobileMenuOpen(false)}
                          className="bg-white hover:bg-pharos-blue-500/5"
                        />
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            <Link
              href="/sobre"
              className={twMerge(
                'flex items-center justify-between rounded-xl px-4 py-4 font-semibold text-[15px] transition-all duration-200 sm:px-5',
                pathname === '/sobre'
                  ? 'bg-pharos-blue-500 text-white shadow-lg shadow-pharos-blue-500/20'
                  : 'bg-white/80 text-pharos-slate-700 hover:bg-pharos-blue-500/10 hover:text-pharos-blue-600'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Sobre</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/contato"
              className={twMerge(
                'flex items-center justify-between rounded-xl px-4 py-4 font-semibold text-[15px] transition-all duration-200 sm:px-5',
                pathname === '/contato'
                  ? 'bg-pharos-blue-500 text-white shadow-lg shadow-pharos-blue-500/20'
                  : 'bg-white/80 text-pharos-slate-700 hover:bg-pharos-blue-500/10 hover:text-pharos-blue-600'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Contato</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </nav>

        {/* Footer do Menu Mobile */}
        <div className="p-5 border-t border-pharos-slate-300 space-y-3 bg-pharos-base-off/50">
          <button
            className="w-full flex items-center justify-center gap-2.5 px-5 py-4 bg-pharos-blue-500 text-white font-bold text-[15px] rounded-xl hover:bg-pharos-blue-600 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-pharos-blue-500/30"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleSearchClick();
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Buscar Imóvel
          </button>

          <Link
            href="/favoritos"
            className={twMerge(
              "w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 font-semibold text-[14px] rounded-xl hover:bg-white active:scale-[0.98] transition-all duration-200 relative",
              pathname === '/favoritos'
                ? 'border-pharos-blue-500 text-pharos-blue-500 bg-pharos-blue-500/5'
                : 'border-pharos-slate-300 text-pharos-slate-700 hover:border-pharos-slate-300'
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg
              className="w-5 h-5"
              fill={pathname === '/favoritos' ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>Favoritos</span>
            {favoritosCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center bg-pharos-blue-500 text-white text-[11px] font-bold rounded-full ring-2 ring-white px-1.5">
                {favoritosCount > 99 ? '99+' : favoritosCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      </>,
      document.body
    )}
  </>
  );
}
