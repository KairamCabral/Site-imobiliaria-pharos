"use client";

import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hint?: string;
  fullWidth?: boolean;
  containerClassName?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      showCharCount,
      maxLength,
      value,
      required,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;
    const helperId = `${textareaId}-helper`;

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
          <label htmlFor={textareaId} className="block text-sm font-medium text-pharos-slate-700 mb-2">
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
        
        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          maxLength={maxLength}
          value={value}
          className={twMerge(
            'w-full px-4 py-3 border border-pharos-slate-300 rounded-lg focus:ring-2 focus:ring-pharos-blue-500 focus:border-pharos-blue-500 outline-none transition-all duration-200 bg-white text-pharos-slate-700 resize-none',
            'placeholder:text-pharos-slate-400',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={describedBy || undefined}
          {...props}
        />
        
        <div className="flex items-center justify-between mt-2 gap-4">
          <div className="flex-1">
            {error && (
              <p id={errorId} className="text-sm text-red-500 flex items-start gap-1.5" role="alert">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </p>
            )}
            
            {helperText && !error && (
              <p id={helperId} className="text-sm text-pharos-slate-500">
                {helperText}
              </p>
            )}
          </div>
          
          {showCharCount && maxLength && (
            <p className="text-sm text-pharos-slate-500 flex-shrink-0" aria-live="polite" aria-atomic="true">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };

