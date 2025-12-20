'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * PHAROS - Phone Input com DDI Selector
 * 
 * Input internacional de telefone com:
 * - DDI selector (dropdown com busca)
 * - Máscaras dinâmicas por país
 * - Validação robusta
 * - Output em formato E.164
 */

interface Country {
  code: string;
  name: string;
  ddi: string;
  flag: string;
  mask: string;
  placeholder: string;
  minLength: number;
}

const COUNTRIES: Country[] = [
  { 
    code: 'BR', 
    name: 'Brasil', 
    ddi: '+55', 
    flag: '🇧🇷',
    mask: '(##) #####-####',
    placeholder: '(11) 99999-9999',
    minLength: 11
  },
  { 
    code: 'US', 
    name: 'Estados Unidos', 
    ddi: '+1', 
    flag: '🇺🇸',
    mask: '(###) ###-####',
    placeholder: '(415) 555-0137',
    minLength: 10
  },
  { 
    code: 'PT', 
    name: 'Portugal', 
    ddi: '+351', 
    flag: '🇵🇹',
    mask: '### ### ###',
    placeholder: '912 345 678',
    minLength: 9
  },
  { 
    code: 'ES', 
    name: 'Espanha', 
    ddi: '+34', 
    flag: '🇪🇸',
    mask: '### ## ## ##',
    placeholder: '612 34 56 78',
    minLength: 9
  },
  { 
    code: 'AR', 
    name: 'Argentina', 
    ddi: '+54', 
    flag: '🇦🇷',
    mask: '## #### ####',
    placeholder: '11 1234 5678',
    minLength: 10
  },
];

interface PhoneInputProps {
  value: string;
  onChange: (e164: string, formatted: string, ddi: string) => void;
  onValidation?: (isValid: boolean, error?: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  onValidation,
  placeholder,
  className = '',
  required = false,
  disabled = false,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Brasil default
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse initial value
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const country = COUNTRIES.find(c => value.startsWith(c.ddi));
      if (country) {
        setSelectedCountry(country);
        const digits = value.substring(country.ddi.length);
        setPhoneNumber(digits);
      }
    }
  }, []);

  // Apply mask to phone number
  const applyMask = (digits: string, mask: string): string => {
    let result = '';
    let digitIndex = 0;

    for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
      if (mask[i] === '#') {
        result += digits[digitIndex];
        digitIndex++;
      } else {
        result += mask[i];
      }
    }

    return result;
  };

  // Remove all non-digit characters
  const sanitize = (str: string): string => {
    return str.replace(/\D/g, '');
  };

  // Validate phone number
  const validate = (digits: string, country: Country): { isValid: boolean; error?: string } => {
    if (!digits) {
      return { isValid: false, error: 'Digite seu telefone' };
    }

    if (digits.length < country.minLength) {
      return { 
        isValid: false, 
        error: `Digite um número válido para ${country.name}` 
      };
    }

    // Validação específica BR
    if (country.code === 'BR' && digits.length === 11) {
      const ddd = parseInt(digits.substring(0, 2));
      const firstDigit = parseInt(digits[2]);
      
      if (ddd < 11 || ddd > 99) {
        return { isValid: false, error: 'DDD inválido' };
      }
      
      if (firstDigit !== 9) {
        return { isValid: false, error: 'Número de celular deve começar com 9' };
      }
    }

    return { isValid: true };
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitize(e.target.value);
    
    // Limit to max length
    const maxLength = selectedCountry.mask.split('#').length - 1;
    const limited = sanitized.substring(0, maxLength);
    
    setPhoneNumber(limited);
    
    // Validate
    const validation = validate(limited, selectedCountry);
    setError(validation.error || null);
    
    if (onValidation) {
      onValidation(validation.isValid, validation.error);
    }

    // Format and return E.164
    const formatted = applyMask(limited, selectedCountry.mask);
    const e164 = `${selectedCountry.ddi}${limited}`;
    
    onChange(e164, formatted, selectedCountry.ddi);

    // Track DDI change
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_phone_input', {
        country: selectedCountry.code,
        ddi: selectedCountry.ddi,
      });
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const sanitized = sanitize(pasted);
    
    // Try to detect country from pasted DDI
    if (pasted.startsWith('+')) {
      const detectedCountry = COUNTRIES.find(c => pasted.startsWith(c.ddi));
      if (detectedCountry) {
        setSelectedCountry(detectedCountry);
        const digits = sanitized.substring(detectedCountry.ddi.length - 1); // Remove +
        handlePhoneChange({ target: { value: digits } } as any);
        return;
      }
    }
    
    handlePhoneChange({ target: { value: sanitized } } as any);
  };

  // Handle country change
  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    // Clear phone number when changing country
    setPhoneNumber('');
    setError(null);
    
    if (onValidation) {
      onValidation(false);
    }
    
    onChange('', '', country.ddi);
    
    // Focus input after selecting country
    setTimeout(() => inputRef.current?.focus(), 100);

    // Track DDI change
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_phone_ddi_changed', {
        from: selectedCountry.code,
        to: country.code,
      });
    }
  };

  // Filter countries by search
  const filteredCountries = COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.ddi.includes(searchTerm)
  );

  const displayValue = phoneNumber ? applyMask(phoneNumber, selectedCountry.mask) : '';

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        {/* DDI Selector */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`
              flex items-center gap-1.5 px-3 py-3 bg-pharos-slate-50 border border-pharos-slate-200 rounded-lg 
              hover:bg-pharos-slate-100 transition-colors
              focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-pharos-blue-500
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={`Selecionar código do país: ${selectedCountry.name}`}
          >
            <span className="text-xl leading-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-pharos-slate-700 min-w-[45px]">
              {selectedCountry.ddi}
            </span>
            <svg 
              className={`w-4 h-4 text-pharos-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-pharos-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-pharos-slate-100">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar país..."
                  className="w-full px-3 py-2 text-sm bg-pharos-slate-50 border border-pharos-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pharos-blue-500"
                  autoFocus
                />
              </div>

              {/* Countries List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryChange(country)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-pharos-blue-50 transition-colors
                        ${selectedCountry.code === country.code ? 'bg-pharos-blue-50' : ''}
                      `}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-pharos-navy-900 truncate">
                          {country.name}
                        </div>
                        <div className="text-xs text-pharos-slate-500">
                          {country.ddi}
                        </div>
                      </div>
                      {selectedCountry.code === country.code && (
                        <svg className="w-4 h-4 text-pharos-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-pharos-slate-500">
                    Nenhum país encontrado
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={displayValue}
          onChange={handlePhoneChange}
          onPaste={handlePaste}
          placeholder={placeholder || selectedCountry.placeholder}
          required={required}
          disabled={disabled}
          className={`
            flex-1 px-3.5 py-3 bg-pharos-slate-50 border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-pharos-blue-500 focus:bg-white
            text-pharos-navy-900 placeholder:text-pharos-slate-400 text-sm transition-all
            ${error ? 'border-pharos-error' : 'border-pharos-slate-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? 'phone-error' : undefined}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p 
          id="phone-error" 
          className="mt-1.5 text-xs text-pharos-error flex items-center gap-1"
          role="alert"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

