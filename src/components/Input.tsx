"use client";

import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      hint,
      className,
      fullWidth = true,
      leftIcon,
      rightIcon,
      containerClassName,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const helperId = `${inputId}-helper`;

    const describedBy = [
      error && errorId,
      hint && hintId,
      helperText && helperId,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={twMerge('mb-4', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-pharos-slate-700 mb-2">
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="obrigatório">
                *
              </span>
            )}
          </label>
        )}

        {hint && (
          <p id={hintId} className="text-xs text-pharos-slate-500 mb-2">
            {hint}
          </p>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pharos-slate-500 pointer-events-none" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={twMerge(
              'w-full px-4 py-3 border border-pharos-slate-300 rounded-lg focus:ring-2 focus:ring-pharos-blue-500 focus:border-pharos-blue-500 outline-none transition-all duration-200 bg-white text-pharos-slate-700',
              'placeholder:text-pharos-slate-400',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500 pr-10',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={!!error}
            aria-required={required}
            aria-describedby={describedBy || undefined}
            {...props}
          />
          
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" aria-hidden="true">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {rightIcon && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-pharos-slate-500 pointer-events-none" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="mt-2 text-sm text-red-500 flex items-start gap-1.5" role="alert">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="mt-2 text-sm text-pharos-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 