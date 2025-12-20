"use client";

import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';
import { Select } from './Select';
import { Input } from './Input';

export interface SearchBarProps {
  onSearch: (searchParams: SearchParams) => void;
  className?: string;
  initialValues?: Partial<SearchParams>;
}

export interface SearchParams {
  query: string;
  type: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  bedrooms?: string;
  bathrooms?: string;
}

const propertyTypes = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'land', label: 'Terreno' },
  { value: 'commercial', label: 'Comercial' },
];

const bedroomsOptions = [
  { value: 'any', label: 'Quartos' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const bathroomsOptions = [
  { value: 'any', label: 'Banheiros' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

export function SearchBar({ onSearch, className, initialValues = {} }: SearchBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: initialValues.query || '',
    type: initialValues.type || 'all',
    minPrice: initialValues.minPrice || null,
    maxPrice: initialValues.maxPrice || null,
    bedrooms: initialValues.bedrooms || 'any',
    bathrooms: initialValues.bathrooms || 'any',
  });

  const handleChange = (name: keyof SearchParams, value: string | number | null) => {
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={twMerge('bg-white rounded-lg shadow-card p-6', className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-4">
          {/* Linha principal de busca */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-grow">
              <Input
                placeholder="Buscar por localização, código ou características..."
                value={searchParams.query}
                onChange={(e) => handleChange('query', e.target.value)}
                fullWidth
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                options={propertyTypes}
                value={searchParams.type}
                onChange={(e) => handleChange('type', e.target.value)}
                fullWidth
              />
            </div>
            <div>
              <Button type="submit" variant="primary">
                Buscar
              </Button>
            </div>
          </div>

          {/* Botão para mostrar filtros avançados */}
          <div className="flex justify-center">
            <button
              type="button"
              className="text-primary flex items-center text-body-sm hover:text-primary-600 focus:outline-none transition-colors"
              onClick={toggleExpanded}
            >
              <span>{expanded ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-1 transform transition-transform ${
                  expanded ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Filtros avançados */}
          {expanded && (
            <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  label="Preço Mínimo (R$)"
                  type="number"
                  placeholder="Mínimo"
                  value={searchParams.minPrice || ''}
                  onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <Input
                  label="Preço Máximo (R$)"
                  type="number"
                  placeholder="Máximo"
                  value={searchParams.maxPrice || ''}
                  onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <Select
                  label="Quartos"
                  options={bedroomsOptions}
                  value={searchParams.bedrooms || 'any'}
                  onChange={(e) => handleChange('bedrooms', e.target.value)}
                />
              </div>
              <div>
                <Select
                  label="Banheiros"
                  options={bathroomsOptions}
                  value={searchParams.bathrooms || 'any'}
                  onChange={(e) => handleChange('bathrooms', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
} 