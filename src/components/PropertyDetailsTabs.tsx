/**
 * PropertyDetailsTabs
 * Sistema de tabs interativo para organizar informações detalhadas do imóvel
 * Desktop: Tabs horizontais | Mobile: Accordion
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Maximize2,
  Sparkles,
  MapPin,
  FileText,
  ChevronDown,
  Bed,
  Bath,
  Car,
  Building,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface TabContent {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface PropertyDetailsTabsProps {
  tabs: TabContent[];
  defaultTab?: string;
  className?: string;
}

export default function PropertyDetailsTabs({
  tabs,
  defaultTab,
  className = '',
}: PropertyDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [openAccordion, setOpenAccordion] = useState<string | null>(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop: Horizontal Tabs */}
      <div className="hidden md:block">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative inline-flex items-center gap-2 py-4 px-1 
                    text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? 'text-pharos-blue-600'
                        : 'text-pharos-slate-600 hover:text-pharos-navy-900'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Icon */}
                  <span
                    className={`
                      transition-colors duration-200
                      ${isActive ? 'text-pharos-blue-600' : 'text-pharos-slate-400 group-hover:text-pharos-slate-600'}
                    `}
                  >
                    {tab.icon}
                  </span>

                  {/* Label */}
                  {tab.label}

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharos-blue-600"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          {activeTabContent && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-8"
            >
              {activeTabContent.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: Accordion */}
      <div className="md:hidden space-y-3">
        {tabs.map((tab) => {
          const isOpen = openAccordion === tab.id;
          return (
            <div
              key={tab.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Accordion Header */}
              <button
                onClick={() => setOpenAccordion(isOpen ? null : tab.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`${isOpen ? 'text-pharos-blue-600' : 'text-pharos-slate-400'}`}>
                    {tab.icon}
                  </span>
                  <span
                    className={`font-medium ${
                      isOpen ? 'text-pharos-navy-900' : 'text-pharos-slate-700'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-pharos-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-gray-100">
                      {tab.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Factory para criar tabs baseado em dados do imóvel
 */
export function createPropertyTabs(property: any): TabContent[] {
  return [
    {
      id: 'specs',
      label: 'Especificações',
      icon: <Home className="w-5 h-5" />,
      content: <SpecsTab property={property} />,
    },
    {
      id: 'areas',
      label: 'Áreas',
      icon: <Maximize2 className="w-5 h-5" />,
      content: <AreasTab property={property} />,
    },
    {
      id: 'amenities',
      label: 'Comodidades',
      icon: <Sparkles className="w-5 h-5" />,
      content: <AmenitiesTab property={property} />,
    },
    {
      id: 'location',
      label: 'Localização',
      icon: <MapPin className="w-5 h-5" />,
      content: <LocationTab property={property} />,
    },
    {
      id: 'docs',
      label: 'Documentação',
      icon: <FileText className="w-5 h-5" />,
      content: <DocsTab property={property} />,
    },
  ];
}

/**
 * Tab Content: Especificações
 */
function SpecsTab({ property }: { property: any }) {
  const specs = [
    {
      icon: <Bed className="w-6 h-6" />,
      label: 'Dormitórios',
      value: property.specs?.bedrooms || '-',
      suffix: property.specs?.bedrooms === 1 ? 'dormitório' : 'dormitórios',
    },
    {
      icon: <Bed className="w-6 h-6" />,
      label: 'Suítes',
      value: property.specs?.suites || '-',
      suffix: property.specs?.suites === 1 ? 'suíte' : 'suítes',
    },
    {
      icon: <Bath className="w-6 h-6" />,
      label: 'Banheiros',
      value: property.specs?.bathrooms || '-',
      suffix: property.specs?.bathrooms === 1 ? 'banheiro' : 'banheiros',
    },
    {
      icon: <Car className="w-6 h-6" />,
      label: 'Vagas',
      value: property.specs?.parkingSpots || '-',
      suffix: property.specs?.parkingSpots === 1 ? 'vaga' : 'vagas',
    },
    {
      icon: <Building className="w-6 h-6" />,
      label: 'Andar',
      value: property.specs?.floor || '-',
      suffix: property.specs?.floor ? 'º andar' : '',
    },
  ].filter((spec) => spec.value && spec.value !== '-');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {specs.map((spec, index) => (
        <motion.div
          key={spec.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="text-pharos-blue-500 mb-3">{spec.icon}</div>
          <div className="text-2xl font-bold text-pharos-navy-900 mb-1">{spec.value}</div>
          <div className="text-xs text-pharos-slate-600">{spec.suffix || spec.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Tab Content: Áreas
 */
function AreasTab({ property }: { property: any }) {
  const areas = [
    {
      label: 'Área Privativa',
      value: property.specs?.privateArea,
      color: 'bg-blue-500',
    },
    {
      label: 'Área Total',
      value: property.specs?.totalArea,
      color: 'bg-emerald-500',
    },
    {
      label: 'Área de Terreno',
      value: property.specs?.landArea,
      color: 'bg-amber-500',
    },
  ].filter((area) => area.value);

  const totalArea = areas.reduce((sum, area) => sum + (area.value || 0), 0);

  return (
    <div className="space-y-6">
      {areas.map((area, index) => {
        const percentage = totalArea > 0 ? (area.value! / totalArea) * 100 : 0;
        return (
          <motion.div
            key={area.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-pharos-slate-700">{area.label}</span>
              <span className="text-lg font-bold text-pharos-navy-900">{area.value} m²</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`h-full ${area.color} rounded-full`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Tab Content: Comodidades
 */
function AmenitiesTab({ property }: { property: any }) {
  const amenitiesMap: Record<string, string> = {
    pool: 'Piscina',
    gym: 'Academia',
    playground: 'Playground',
    bbqGrill: 'Churrasqueira',
    partyRoom: 'Salão de Festas',
    sportsField: 'Quadra Esportiva',
    sauna: 'Sauna',
    elevator: 'Elevador',
    gatedCommunity: 'Condomínio Fechado',
    petFriendly: 'Aceita Pet',
    furnished: 'Mobiliado',
    oceanView: 'Vista Mar',
    balcony: 'Sacada',
    garden: 'Jardim',
    bikeRack: 'Bicicletário',
  };

  const amenities = Object.entries(property.features || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => amenitiesMap[key] || key);

  if (amenities.length === 0) {
    return (
      <p className="text-center text-pharos-slate-500 py-8">
        Informações de comodidades não disponíveis
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {amenities.map((amenity, index) => (
        <motion.div
          key={amenity}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-pharos-blue-50 hover:border-pharos-blue-200 border border-transparent transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-pharos-blue-500 flex-shrink-0" />
          <span className="text-sm text-pharos-slate-700">{amenity}</span>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Tab Content: Localização
 */
function LocationTab({ property }: { property: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-pharos-navy-900 mb-4">Endereço</h4>
        <div className="space-y-2 text-pharos-slate-700">
          {property.address?.street && (
            <p>
              <strong>Rua:</strong> {property.address.street}
              {property.address.number && `, ${property.address.number}`}
            </p>
          )}
          {property.address?.neighborhood && (
            <p>
              <strong>Bairro:</strong> {property.address.neighborhood}
            </p>
          )}
          {property.address?.city && property.address?.state && (
            <p>
              <strong>Cidade:</strong> {property.address.city}/{property.address.state}
            </p>
          )}
          {property.address?.zipCode && (
            <p>
              <strong>CEP:</strong> {property.address.zipCode}
            </p>
          )}
        </div>
      </div>

      {property.distanciaMar && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <p className="text-pharos-blue-900">
            <strong className="text-lg">🌊 {property.distanciaMar}m</strong> da praia
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Tab Content: Documentação
 */
function DocsTab({ property }: { property: any }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {property.pricing?.iptu && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-pharos-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-pharos-slate-600 mb-1">IPTU</p>
                <p className="text-lg font-bold text-pharos-navy-900">
                  R$ {property.pricing.iptu.toLocaleString('pt-BR')}
                  <span className="text-sm font-normal text-pharos-slate-500">/mês</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {property.pricing?.condo && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-pharos-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-pharos-slate-600 mb-1">Condomínio</p>
                <p className="text-lg font-bold text-pharos-navy-900">
                  R$ {property.pricing.condo.toLocaleString('pt-BR')}
                  <span className="text-sm font-normal text-pharos-slate-500">/mês</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {property.updatedAt && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-pharos-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-pharos-slate-600 mb-1">
                  Última Atualização
                </p>
                <p className="text-lg font-bold text-pharos-navy-900">
                  {new Date(property.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {property.code && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-pharos-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-pharos-slate-600 mb-1">Código</p>
                <p className="text-lg font-bold text-pharos-navy-900 font-mono">{property.code}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
        <p className="text-sm text-amber-900">
          <strong>📋 Documentação:</strong> Todos os documentos do imóvel estão regulares e
          disponíveis para consulta. Entre em contato para mais informações.
        </p>
      </div>
    </div>
  );
}

