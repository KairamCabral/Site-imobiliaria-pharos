"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { twMerge } from 'tailwind-merge';
import CustomImage from './CustomImage';
import { PLACEHOLDER_SVG_BASE64 } from '../utils/imageUtils';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  className?: string;
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  image,
  bedrooms,
  bathrooms,
  area,
  className,
}: PropertyCardProps) {
  // Formatar preço em reais
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(price);

  // Usar imagem de fallback local se a imagem fornecida não estiver disponível
  const placeholder = PLACEHOLDER_SVG_BASE64;
  const imageSrc = image || placeholder;

  return (
    <div className={twMerge('bg-white rounded-lg shadow-card overflow-hidden transition-shadow hover:shadow-card-hover', className)}>
      <div className="relative h-48 md:h-60 w-full">
        <CustomImage
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          loading="lazy"
          quality={80}
          fallbackSrc={placeholder}
        />
      </div>
      
      <div className="p-4 md:p-6">
        <h3 className="text-xl font-semibold text-secondary-800 mb-2">{title}</h3>
        <p className="text-2xl font-bold text-primary-600 mb-3">{formattedPrice}</p>
        
        <div className="flex items-center text-secondary-600 mb-4 text-sm">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          <span>{location}</span>
        </div>
        
        {(bedrooms || bathrooms || area) && (
          <div className="flex items-center justify-between text-secondary-600 mb-4 text-sm">
            {bedrooms && (
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                  />
                </svg>
                {bedrooms} {bedrooms === 1 ? 'quarto' : 'quartos'}
              </div>
            )}
            
            {bathrooms && (
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                {bathrooms} {bathrooms === 1 ? 'banheiro' : 'banheiros'}
              </div>
            )}
            
            {area && (
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" 
                  />
                </svg>
                {area}m²
              </div>
            )}
          </div>
        )}
        
        <Link href={`/imoveis/${id}`} target="_blank" rel="noopener noreferrer" passHref>
          <Button variant="primary" fullWidth={true}>
            Ver detalhes
          </Button>
        </Link>
      </div>
    </div>
  );
} 