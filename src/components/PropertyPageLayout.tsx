'use client';

import { ReactNode } from 'react';
import LeadCardFollower from './LeadCardFollower';
import LeadDockMobile from './LeadDockMobile';

/**
 * PHAROS - Property Page Layout
 * 
 * Layout inteligente para página do imóvel com:
 * - Grid responsivo (sidebar + content)
 * - Follower robusto (sticky-proof) para o LeadCard
 * - Sistema automático desktop/mobile
 */

interface PropertyPageLayoutProps {
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  realtor?: {
    id?: string;
    name: string;
    photo?: string;
    creci?: string;
    whatsapp?: string;
    online?: boolean;
  };
  children: ReactNode; // Conteúdo principal (galeria, specs, map, etc.)
  sidebar?: ReactNode; // Navegação vertical opcional
}

export default function PropertyPageLayout({
  propertyId,
  propertyCode,
  propertyTitle,
  realtor,
  children,
  sidebar,
}: PropertyPageLayoutProps) {
  return (
    <>
      <main className="imovel-grid">
        {/* Sidebar (Desktop Only) */}
        <aside id="imovel-sidebar">
          {/* Navegação vertical opcional */}
          {sidebar && <div className="sidebar-nav mb-6">{sidebar}</div>}

          {/* Lead Boundary - Container do Follower */}
          <div id="lead-boundary">
            <LeadCardFollower
              propertyId={propertyId}
              propertyCode={propertyCode}
              propertyTitle={propertyTitle}
              realtor={realtor}
            />
          </div>
        </aside>

        {/* Content Principal */}
        <section id="imovel-content">
          {children}
        </section>
      </main>

      {/* Dock Mobile */}
      <LeadDockMobile
        propertyId={propertyId}
        propertyCode={propertyCode}
        propertyTitle={propertyTitle}
        realtor={realtor}
      />
    </>
  );
}

