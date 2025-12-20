"use client";

import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'checkbox');

    return (
      <div className={twMerge('mb-4', containerClassName)}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className={twMerge(
                'w-5 h-5 text-pharos-blue-500 border-pharos-slate-300 rounded focus:ring-pharos-blue-500 focus:ring-offset-0 transition-colors',
                error && 'border-red-500 focus:ring-red-500',
                className
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
              {...props}
            />
          </div>
          {label && (
            <div className="ml-3 text-body">
              <label htmlFor={checkboxId} className="text-pharos-slate-700 select-none cursor-pointer">
                {label}
              </label>
            </div>
          )}
        </div>

        {error && (
          <p id={`${checkboxId}-error`} className="mt-1 text-body-sm text-red-500">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${checkboxId}-helper`} className="mt-1 text-body-sm text-pharos-slate-500 ml-8">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox }; 