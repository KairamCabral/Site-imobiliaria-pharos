'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Home, Search } from 'lucide-react';
import type { Property } from '@/domain/models';
import ImovelCard from './ImovelCard';

interface PropertySoldPageProps {
  property: Property;
  similarProperties?: any[];
}

/**
 * Página especial para imóveis vendidos/alugados
 * - Mostra status "Vendido" com UX positiva
 * - Exibe imóveis similares
 * - Após 30 dias: Badge "Vendido há X dias"
 * - Após 60 dias: Deve retornar 410 Gone (configurar no page.tsx)
 */
export default function PropertySoldPage({ property, similarProperties = [] }: PropertySoldPageProps) {
  const tipo = property.type || 'Imóvel';
  const bairro = property.address?.neighborhood || '';
  const cidade = property.address?.city || 'Balneário Camboriú';
  const quartos = property.specs?.bedrooms || 0;
  const area = property.specs?.area || 0;

  // Calcular dias desde venda (se houver data)
  const soldDate = property.soldAt || property.updatedAt;
  const daysSinceSold = soldDate 
    ? Math.floor((Date.now() - new Date(soldDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header com breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pharos-blue-600 transition-colors">
              Início
            </Link>
            <span>/</span>
            <Link href="/imoveis" className="hover:text-pharos-blue-600 transition-colors">
              Imóveis
            </Link>
            <span>/</span>
            <span className="text-pharos-navy-900 font-medium">Imóvel Vendido</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Badge de Sucesso */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 border-2 border-green-200 rounded-full">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span className="text-green-700 font-semibold text-lg">
              Imóvel Negociado com Sucesso
            </span>
          </div>
        </div>

        {/* Informações do Imóvel */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-pharos-navy-900 mb-4">
            Este {tipo} Já Foi Vendido
          </h1>
          
          <div className="space-y-2 text-gray-600">
            <p className="text-lg">
              {tipo} {quartos > 0 && `com ${quartos} quartos`}
              {area > 0 && `, ${area}m²`}
            </p>
            <p className="text-base">
              {bairro && `${bairro}, `}{cidade}
            </p>
            
            {daysSinceSold > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Vendido há {daysSinceSold} {daysSinceSold === 1 ? 'dia' : 'dias'}
              </p>
            )}
          </div>
        </div>

        {/* CTA - Buscar Similares */}
        <div className="bg-gradient-to-br from-pharos-blue-500 to-pharos-navy-900 rounded-2xl p-8 md:p-10 text-white text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Encontre Seu Próximo Imóvel
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Temos muitas outras opções incríveis como esta. Nossa equipe está pronta para ajudar você a encontrar o imóvel perfeito.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/imoveis?type=${property.type}&neighborhood=${bairro}`}
              className="inline-flex items-center justify-center gap-2 bg-white text-pharos-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:scale-105 shadow-lg"
            >
              <Search className="w-5 h-5" />
              Ver Imóveis Similares
            </Link>
            
            <Link
              href="/contato"
              className="inline-flex items-center justify-center gap-2 bg-pharos-gold-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-pharos-gold-600 transition-all hover:scale-105 shadow-lg"
            >
              Falar com Corretor
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Imóveis Similares */}
        {similarProperties.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-pharos-navy-900 mb-2">
                  Imóveis Similares Disponíveis
                </h2>
                <p className="text-gray-600">
                  Confira outras opções que podem te interessar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.slice(0, 6).map((imovel) => {
                const endereco = [
                  imovel.address?.street,
                  imovel.address?.neighborhood,
                  imovel.address?.city,
                ].filter(Boolean).join(', ');

                const imagens = imovel.photos?.map((p: any) => p.url).filter(Boolean) || [];

                return (
                  <ImovelCard
                    key={imovel.id}
                    id={imovel.id}
                    titulo={imovel.title || imovel.type || 'Imóvel'}
                    endereco={endereco}
                    preco={imovel.pricing?.sale || 0}
                    quartos={imovel.specs?.bedrooms || 0}
                    banheiros={imovel.specs?.bathrooms || 0}
                    suites={imovel.specs?.suites || 0}
                    area={imovel.specs?.area || imovel.specs?.privateArea || 0}
                    imagens={imagens}
                    tipoImovel={imovel.type || 'Imóvel'}
                    vagas={imovel.specs?.parkingSpots || 0}
                    caracteristicasImovel={imovel.features?.property || []}
                    caracteristicasLocalizacao={imovel.features?.location || []}
                    caracteristicas={imovel.features?.building || []}
                  />
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href={`/imoveis?type=${property.type}&neighborhood=${bairro}`}
                className="inline-flex items-center gap-2 text-pharos-blue-600 hover:text-pharos-blue-700 font-semibold"
              >
                Ver Todos os Imóveis Similares
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Links Rápidos */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/imoveis"
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-pharos-blue-500 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-pharos-blue-50 rounded-lg flex items-center justify-center group-hover:bg-pharos-blue-100 transition-colors">
                <Search className="w-6 h-6 text-pharos-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-pharos-navy-900 group-hover:text-pharos-blue-600 transition-colors">
                  Buscar Imóveis
                </div>
                <div className="text-sm text-gray-500">Explore nosso catálogo</div>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-pharos-blue-500 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-pharos-blue-50 rounded-lg flex items-center justify-center group-hover:bg-pharos-blue-100 transition-colors">
                <Home className="w-6 h-6 text-pharos-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-pharos-navy-900 group-hover:text-pharos-blue-600 transition-colors">
                  Página Inicial
                </div>
                <div className="text-sm text-gray-500">Voltar ao início</div>
              </div>
            </Link>

            <Link
              href="/contato"
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-pharos-blue-500 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-pharos-blue-50 rounded-lg flex items-center justify-center group-hover:bg-pharos-blue-100 transition-colors">
                <ArrowRight className="w-6 h-6 text-pharos-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-pharos-navy-900 group-hover:text-pharos-blue-600 transition-colors">
                  Fale Conosco
                </div>
                <div className="text-sm text-gray-500">Atendimento personalizado</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

