"use client";

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none touch-target', 
  {
    variants: {
      variant: {
        primary: 'bg-pharos-blue-500 text-white hover:bg-pharos-blue-600 active:bg-pharos-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-pharos-blue-500 shadow-md shadow-pharos-blue-500/10',
        secondary: 'bg-white border-2 border-pharos-blue-500 text-pharos-blue-500 hover:bg-pharos-blue-500 hover:text-white active:bg-pharos-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-pharos-blue-500',
        ghost: 'bg-transparent text-pharos-blue-500 hover:bg-pharos-blue-500/10 active:bg-pharos-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-pharos-blue-500',
      },
      size: {
        sm: 'py-2 px-4 text-sm',
        md: 'py-3 px-6 text-base',
        lg: 'py-4 px-8 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading = false, 
    icon, 
    iconPosition = 'left', 
    disabled, 
    ...props 
  }, ref) => {
    return (
      <button
        className={twMerge(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        
        {icon && iconPosition === 'left' && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 