'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * PHAROS - Phone Input Premium com DDI Otimizado
 * 
 * Input internacional de telefone com:
 * - DDI compacto (mostra apenas +55 após seleção)
 * - UI/UX Premium com micro-interações
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
    placeholder: '(00) 00000-0000',
    minLength: 11
  },
  { 
    code: 'US', 
    name: 'Estados Unidos', 
    ddi: '+1', 
    flag: '🇺🇸',
    mask: '(###) ###-####',
    placeholder: '(000) 000-0000',
    minLength: 10
  },
  { 
    code: 'AR', 
    name: 'Argentina', 
    ddi: '+54', 
    flag: '🇦🇷',
    mask: '## #### ####',
    placeholder: '00 0000 0000',
    minLength: 10
  },
  { 
    code: 'CL', 
    name: 'Chile', 
    ddi: '+56', 
    flag: '🇨🇱',
    mask: '# #### ####',
    placeholder: '0 0000 0000',
    minLength: 9
  },
  { 
    code: 'UY', 
    name: 'Uruguai', 
    ddi: '+598', 
    flag: '🇺🇾',
    mask: '## ### ###',
    placeholder: '00 000 000',
    minLength: 8
  },
  { 
    code: 'PT', 
    name: 'Portugal', 
    ddi: '+351', 
    flag: '🇵🇹',
    mask: '### ### ###',
    placeholder: '000 000 000',
    minLength: 9
  },
  { 
    code: 'ES', 
    name: 'Espanha', 
    ddi: '+34', 
    flag: '🇪🇸',
    mask: '### ## ## ##',
    placeholder: '000 00 00 00',
    minLength: 9
  },
  { 
    code: 'FR', 
    name: 'França', 
    ddi: '+33', 
    flag: '🇫🇷',
    mask: '# ## ## ## ##',
    placeholder: '0 00 00 00 00',
    minLength: 9
  },
  { 
    code: 'IT', 
    name: 'Itália', 
    ddi: '+39', 
    flag: '🇮🇹',
    mask: '### ### ####',
    placeholder: '000 000 0000',
    minLength: 10
  },
  { 
    code: 'DE', 
    name: 'Alemanha', 
    ddi: '+49', 
    flag: '🇩🇪',
    mask: '#### #######',
    placeholder: '0000 0000000',
    minLength: 10
  },
  { 
    code: 'GB', 
    name: 'Reino Unido', 
    ddi: '+44', 
    flag: '🇬🇧',
    mask: '#### ######',
    placeholder: '0000 000000',
    minLength: 10
  },
];

interface PhoneInputPremiumProps {
  value: string;
  onChange: (e164: string, formatted: string, ddi: string) => void;
  onValidation?: (isValid: boolean, error?: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function PhoneInputPremium({
  value,
  onChange,
  onValidation,
  onFocusChange,
  placeholder,
  className = '',
  required = false,
  disabled = false,
}: PhoneInputPremiumProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
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
        error: `Digite um número válido` 
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
        return { isValid: false, error: 'Deve começar com 9' };
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
        const digits = sanitized.substring(detectedCountry.ddi.length - 1);
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

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocusChange) onFocusChange(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onFocusChange) onFocusChange(false);
  };

  // Validation icon
  const isValid = phoneNumber.length >= selectedCountry.minLength && !error;

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        {/* DDI Selector Compacto Premium */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`
              group relative flex items-center justify-center gap-1.5 w-20 px-2 py-3.5 bg-white border-2 rounded-xl
              hover:border-pharos-slate-300 transition-all duration-200
              focus:outline-none focus:border-pharos-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]
              ${isFocused ? 'border-pharos-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-pharos-slate-200'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={`País: ${selectedCountry.name}`}
          >
            {/* Badge da bandeira */}
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            
            {/* DDI compacto */}
            <span className="text-xs font-bold text-pharos-slate-700">
              {selectedCountry.ddi}
            </span>
            
            {/* Chevron */}
            <svg 
              className={`absolute right-1 w-3 h-3 text-pharos-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Premium */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white border-2 border-pharos-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {/* Search Premium */}
              <div className="p-3 border-b border-pharos-slate-100 bg-pharos-slate-50/50">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharos-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar país..."
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-pharos-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:border-pharos-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Countries List Premium */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryChange(country)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-pharos-blue-50 transition-all duration-150
                        ${selectedCountry.code === country.code ? 'bg-gradient-to-r from-pharos-blue-50 to-pharos-blue-50/50 border-l-3 border-pharos-blue-500' : ''}
                      `}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-pharos-navy-900 truncate">
                          {country.name}
                        </div>
                        <div className="text-xs text-pharos-slate-500 font-medium">
                          {country.ddi}
                        </div>
                      </div>
                      {selectedCountry.code === country.code && (
                        <div className="w-5 h-5 rounded-full bg-pharos-blue-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <svg className="w-12 h-12 text-pharos-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm text-pharos-slate-500 font-medium">
                      Nenhum país encontrado
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Input Premium */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={displayValue}
            onChange={handlePhoneChange}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || selectedCountry.placeholder}
            required={required}
            disabled={disabled}
            className={`
              w-full pl-4 pr-11 py-3.5 bg-white border-2 rounded-xl text-pharos-navy-900 
              placeholder:text-pharos-slate-400 text-sm font-medium transition-all duration-200
              focus:outline-none
              ${isFocused && !error 
                ? 'border-pharos-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' 
                : error 
                  ? 'border-red-400 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                  : 'border-pharos-slate-200 hover:border-pharos-slate-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-pharos-slate-50' : ''}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? 'phone-error' : undefined}
          />
          
          {/* Validation Icon */}
          {phoneNumber && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Message Premium */}
      {error && (
        <p 
          id="phone-error" 
          className="mt-2 text-xs text-red-600 flex items-center gap-1.5 ml-1 font-medium"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

