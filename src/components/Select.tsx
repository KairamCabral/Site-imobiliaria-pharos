"use client";

import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hint?: string;
  fullWidth?: boolean;
  containerClassName?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      hint,
      className,
      fullWidth = true,
      containerClassName,
      id,
      options,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;
    const helperId = `${selectId}-helper`;

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
          <label htmlFor={selectId} className="block text-sm font-medium text-pharos-slate-700 mb-2">
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
          <select
            id={selectId}
            ref={ref}
            required={required}
            className={twMerge(
              'w-full px-4 py-3 pr-10 border border-pharos-slate-300 rounded-lg focus:ring-2 focus:ring-pharos-blue-500 focus:border-pharos-blue-500 outline-none transition-all duration-200 bg-white text-pharos-slate-700 appearance-none cursor-pointer',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              className
            )}
            aria-invalid={!!error}
            aria-required={required}
            aria-describedby={describedBy || undefined}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Ícone de seta */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-pharos-slate-500" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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

Select.displayName = 'Select';

export { Select };
