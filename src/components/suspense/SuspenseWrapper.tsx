/**
 * Suspense Wrappers
 * 
 * Componentes de Suspense com fallbacks apropriados
 * para diferentes seções do site
 */

import React, { Suspense } from 'react';
import {
  PropertyGridSkeleton,
  HeroSkeleton,
  FeaturedPropertiesSkeleton,
} from '@/components/skeletons';

/**
 * Suspense para grid de imóveis
 */
export function PropertyGridSuspense({
  children,
  count = 6,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <Suspense fallback={<PropertyGridSkeleton count={count} />}>
      {children}
    </Suspense>
  );
}

/**
 * Suspense para hero da homepage
 */
export function HeroSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      {children}
    </Suspense>
  );
}

/**
 * Suspense para seção de destaques
 */
export function FeaturedSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<FeaturedPropertiesSkeleton />}>
      {children}
    </Suspense>
  );
}

/**
 * Suspense genérico com skeleton customizado
 */
export function GenericSuspense({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

/**
 * Suspense para componentes não-críticos (sem fallback visual)
 */
export function NonCriticalSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}





