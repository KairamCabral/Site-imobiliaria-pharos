'use client';

import Link from 'next/link';
import type { BreadcrumbItem } from '@/types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Componente Breadcrumb com navegação hierárquica
 * Otimizado para SEO e acessibilidade WCAG 2.1 AA
 * Inclui schema.org BreadcrumbList para rich snippets
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Gerar schema.org para o Google - sempre usar BASE_URL para evitar hydration mismatch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.imob.br';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav 
        aria-label="Navegação estrutural (breadcrumb)" 
        className={className}
      >
        <ol 
          className="flex items-center flex-wrap gap-x-1 gap-y-1.5 text-[13px] md:text-sm"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li 
                key={item.href || `breadcrumb-${index}-${item.label}`} 
                className="flex items-center"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {index > 0 && (
                  <span 
                    className="text-pharos-slate-300 mx-2.5 select-none text-base font-light" 
                    aria-hidden="true"
                  >
                    ›
                  </span>
                )}
                
                {isLast || item.current ? (
                  <span 
                    className="text-pharos-navy-900 font-semibold truncate max-w-[180px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-none"
                    aria-current="page"
                    title={item.label}
                    itemProp="name"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className="text-pharos-slate-500 hover:text-pharos-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2 rounded px-1"
                    title={item.label}
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                )}
                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

