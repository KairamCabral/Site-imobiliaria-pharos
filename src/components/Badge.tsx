"use client";

import React from 'react';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
}

// Mapeamento de variantes para classes Tailwind
const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
};

// Mapeamento de tamanhos para classes Tailwind
const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs py-0.5 px-2',
  md: 'text-sm py-1 px-3',
  lg: 'text-base py-1.5 px-4',
};

export function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  icon
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center justify-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}

// Componentes pré-configurados para estados comuns de imóveis
export function NewBadge({ className, ...props }: Omit<BadgeProps, 'variant' | 'children'>) {
  return (
    <Badge
      variant="primary"
      className={twMerge('font-bold', className)}
      {...props}
    >
      Novo
    </Badge>
  );
}

export function SoldBadge({ className, ...props }: Omit<BadgeProps, 'variant' | 'children'>) {
  return (
    <Badge
      variant="error"
      className={twMerge('font-bold', className)}
      {...props}
    >
      Vendido
    </Badge>
  );
}

export function RentedBadge({ className, ...props }: Omit<BadgeProps, 'variant' | 'children'>) {
  return (
    <Badge
      variant="secondary"
      className={twMerge('font-bold', className)}
      {...props}
    >
      Alugado
    </Badge>
  );
}

export function PromotionBadge({ className, ...props }: Omit<BadgeProps, 'variant' | 'children'>) {
  return (
    <Badge
      variant="warning"
      className={twMerge('font-bold', className)}
      {...props}
    >
      Promoção
    </Badge>
  );
}

export function FeaturedBadge({ className, ...props }: Omit<BadgeProps, 'variant' | 'children'>) {
  return (
    <Badge
      variant="success"
      className={twMerge('font-bold', className)}
      {...props}
      icon={
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3.5 w-3.5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
          />
        </svg>
      }
    >
      Destaque
    </Badge>
  );
} 