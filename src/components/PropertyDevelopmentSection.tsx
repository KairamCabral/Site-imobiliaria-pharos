'use client';

import { useState, useEffect } from 'react';
import { OptimizedImage as Image } from './OptimizedImage';
import Link from 'next/link';

/**
 * PHAROS - Property Development Section
 * 
 * Seção de empreendimento com:
 * - Informações do empreendimento
 * - Comodidades/amenidades
 * - Unidades disponíveis (scroll horizontal)
 * - Integração com Vista CRM
 */

interface Development {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  facade?: string;
  address?: string;
  amenities: string[];
}

interface AvailableUnit {
  id: string;
  code: string;
  title: string;
  price: number;
  bedrooms?: number;
  suites?: number;
  parkingSpots?: number;
  privateArea?: number;
  totalArea?: number;
  image?: string;
  status: 'available' | 'reserved' | 'sold';
}

interface PropertyDevelopmentSectionProps {
  developmentId: string;
  propertyId: string;
}

export default function PropertyDevelopmentSection({
  developmentId,
  propertyId,
}: PropertyDevelopmentSectionProps) {
  const [development, setDevelopment] = useState<Development | null>(null);
  const [units, setUnits] = useState<AvailableUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do empreendimento e unidades
  useEffect(() => {
    loadDevelopmentData();
  }, [developmentId]);

  const loadDevelopmentData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Integrar com Vista CRM
      // const [devResponse, unitsResponse] = await Promise.all([
      //   fetch(`/api/developments/${developmentId}`),
      //   fetch(`/api/developments/${developmentId}/units?status=available`),
      // ]);
      // const dev = await devResponse.json();
      // const unitsData = await unitsResponse.json();

      // Mock data por enquanto
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockDevelopment: Development = {
        id: developmentId,
        name: 'Ed. Madrid',
        description:
          'Edifício com localização privilegiada, na Barra Sul, rua reta ao mar. O condomínio conta com área de lazer completa.',
        logo: undefined,
        facade: undefined,
        address: 'R. 3850, Barra Sul - Balneário Camboriú, SC',
        amenities: [
          'Piscina',
          'Salão de Festas',
          'Churrasqueira',
          'Terraço',
          'Sala de Jogos',
          'Box de Praia',
          'Portaria 24h',
          'Elevador',
        ],
      };

      const mockUnits: AvailableUnit[] = [
        {
          id: 'PH1060',
          code: 'PH1060',
          title: 'Apto 402 - 2 Dorms + 1 Vaga',
          price: 1395000,
          bedrooms: 2,
          suites: 0,
          parkingSpots: 1,
          privateArea: 85,
          totalArea: 0,
          image: 'https://cdn.vistahost.com.br/gabarito/vista.imobi/fotos/1060/i7K9P_106068645796c0d2a.jpg',
          status: 'available',
        },
        {
          id: 'PH1061',
          code: 'PH1061',
          title: 'Apto 501 - 3 Dorms + 2 Vagas',
          price: 1650000,
          bedrooms: 3,
          suites: 1,
          parkingSpots: 2,
          privateArea: 110,
          totalArea: 0,
          image: undefined,
          status: 'available',
        },
        {
          id: 'PH1062',
          code: 'PH1062',
          title: 'Apto 602 - 2 Dorms + 1 Vaga',
          price: 1420000,
          bedrooms: 2,
          suites: 0,
          parkingSpots: 1,
          privateArea: 85,
          totalArea: 0,
          image: undefined,
          status: 'reserved',
        },
      ];

      setDevelopment(mockDevelopment);
      setUnits(mockUnits);
    } catch (err) {
      console.error('[PropertyDevelopmentSection] Erro:', err);
      setError('Não foi possível carregar as informações do empreendimento.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-pharos-slate-50 py-12 lg:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-pharos-slate-200 rounded w-1/3" />
            <div className="h-4 bg-pharos-slate-200 rounded w-2/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-pharos-slate-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !development) {
    return null; // Não mostrar nada se houver erro ou sem dados
  }

  return (
    <section className="bg-pharos-slate-50 py-12 lg:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header do Empreendimento */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            {development.logo && (
              <Image
                src={development.logo}
                alt={development.name}
                width={80}
                height={80}
                className="rounded-lg object-contain bg-white p-2 border border-pharos-slate-200"
              />
            )}
            <div className="flex-1">
              <h2 className="text-3xl lg:text-4xl font-bold text-pharos-navy-900 mb-2">
                {development.name}
              </h2>
              {development.address && (
                <p className="text-sm text-pharos-slate-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  {development.address}
                </p>
              )}
            </div>
          </div>

          {development.description && (
            <p className="text-lg text-pharos-slate-700 mb-6">{development.description}</p>
          )}
        </div>

        {/* Comodidades */}
        {development.amenities && development.amenities.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-pharos-navy-900 mb-4">Comodidades</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {development.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-3 bg-white rounded-lg border border-pharos-slate-200"
                >
                  <div className="w-2 h-2 bg-pharos-blue-500 rounded-full flex-shrink-0" />
                  <span className="text-sm font-medium text-pharos-navy-900">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unidades Disponíveis */}
        {units && units.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-pharos-navy-900">
                Unidades Disponíveis
              </h3>
              <span className="text-sm text-pharos-slate-600">
                {units.filter((u) => u.status === 'available').length} unidade
                {units.filter((u) => u.status === 'available').length !== 1 ? 's' : ''} disponível
                {units.filter((u) => u.status === 'available').length !== 1 ? 'eis' : ''}
              </span>
            </div>

            {/* Scroll Horizontal de Unidades */}
            <div className="relative -mx-4 px-4 lg:mx-0 lg:px-0">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {units.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    currentPropertyId={propertyId}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

// Card de Unidade
interface UnitCardProps {
  unit: AvailableUnit;
  currentPropertyId: string;
}

function UnitCard({ unit, currentPropertyId }: UnitCardProps) {
  const isCurrentUnit = unit.id === currentPropertyId;
  const isAvailable = unit.status === 'available';

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(unit.price);

  return (
    <div
      className={`
        flex-shrink-0 w-[280px] md:w-[320px] snap-start
        ${isCurrentUnit ? 'ring-2 ring-pharos-blue-500' : ''}
      `}
    >
      <div className="bg-white rounded-xl overflow-hidden border border-pharos-slate-200 hover:shadow-lg transition-shadow h-full">
        {/* Imagem */}
        <div className="relative h-[160px] bg-pharos-slate-100">
          {unit.image ? (
            <Image
              src={unit.image}
              alt={unit.title}
              fill
              className="object-cover"
              sizes="320px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-pharos-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          )}

          {/* Badge Status */}
          <div className="absolute top-3 left-3">
            {isCurrentUnit ? (
              <span className="px-2.5 py-1 bg-pharos-blue-500 text-white text-xs font-semibold rounded-full">
                Você está aqui
              </span>
            ) : !isAvailable ? (
              <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                Reservado
              </span>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Código */}
          <p className="text-xs text-pharos-slate-500 mb-1">Cód. {unit.code}</p>

          {/* Título */}
          <h4 className="text-sm font-bold text-pharos-navy-900 mb-3 line-clamp-2 min-h-[40px]">
            {unit.title}
          </h4>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-pharos-slate-600 mb-3">
            {unit.bedrooms != null && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {unit.bedrooms} {unit.bedrooms === 1 ? 'quarto' : 'quartos'}
              </div>
            )}
            {unit.privateArea != null && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
                {unit.privateArea} m²
              </div>
            )}
          </div>

          {/* Preço */}
          <div className="mb-3">
            <p className="text-lg font-bold text-pharos-navy-900">{formattedPrice}</p>
          </div>

          {/* CTA */}
          {isCurrentUnit ? (
            <div className="px-4 py-2 bg-pharos-blue-50 text-pharos-blue-600 text-sm font-semibold rounded-lg text-center">
              Unidade atual
            </div>
          ) : isAvailable ? (
            <Link
              href={`/imoveis/${unit.code}`}
              className="block w-full px-4 py-2 bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white text-sm font-semibold rounded-lg text-center transition-colors"
            >
              Ver detalhes
            </Link>
          ) : (
            <div className="px-4 py-2 bg-pharos-slate-100 text-pharos-slate-500 text-sm font-semibold rounded-lg text-center">
              Indisponível
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
