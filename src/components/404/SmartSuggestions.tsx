import React from 'react';
import Link from 'next/link';
import ImovelCard from '@/components/ImovelCard';
import { PropertyService } from '@/services/PropertyService';
import type { Property } from '@/domain/models/Property';

/**
 * Sugestões inteligentes de imóveis para página 404
 * Busca imóveis em destaque para manter o usuário engajado
 */

interface SmartSuggestionsProps {
  attemptedPath?: string;
}

export default async function SmartSuggestions({ attemptedPath }: SmartSuggestionsProps) {
  let properties: Property[] = [];
  let hasError = false;

  try {
    // Buscar imóveis em destaque
    const propertyService = new PropertyService();
    const searchResult = await propertyService.searchProperties(
      { sortBy: 'updatedAt', sortOrder: 'desc' },
      { page: 1, limit: 3 }
    );

    properties = searchResult.result.properties || [];
  } catch (error) {
    console.error('[SmartSuggestions] Erro ao buscar imóveis:', error);
    hasError = true;
  }

  // Se não tiver imóveis, não renderizar a seção
  if (!properties.length || hasError) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-pharos-base-off">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-pharos-navy-900 mb-3">
          Confira Nossos Imóveis em Destaque
        </h2>
        <p className="text-base text-pharos-slate-700">
          Enquanto você está aqui, que tal conhecer algumas de nossas melhores ofertas?
        </p>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {properties.map((property) => (
          <ImovelCard
            key={property.id}
            id={property.id}
            titulo={property.title}
            endereco={`${property.address.neighborhood || ''}, ${property.address.city}`.trim()}
            preco={property.pricing.sale || property.pricing.rent || 0}
            quartos={property.specs.bedrooms || 0}
            banheiros={property.specs.bathrooms || 0}
            suites={property.specs.suites || 0}
            area={property.specs.totalArea || property.specs.privateArea || 0}
            imagens={property.photos?.map(p => p.url) || []}
            tipoImovel={property.type}
            destaque={property.isHighlight || property.webHighlight || false}
            caracteristicas={property.caracteristicasImovel || []}
            caracteristicasImovel={property.caracteristicasImovel || []}
            caracteristicasLocalizacao={property.caracteristicasLocalizacao || []}
            vagas={property.specs.parkingSpots || 0}
            distanciaMar={property.distanciaMar}
          />
        ))}
      </div>

      {/* CTA to view all properties */}
      <div className="text-center">
        <Link
          href="/imoveis"
          className="
            inline-flex items-center gap-2
            px-8 py-4
            bg-pharos-blue-500
            text-white
            font-semibold
            rounded-xl
            hover:bg-pharos-blue-600
            hover:scale-105
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
            shadow-lg hover:shadow-xl
            touch-target
          "
        >
          Ver Todos os Imóveis
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

