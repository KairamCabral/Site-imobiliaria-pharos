'use client';

import { Bed, Bath, Car, Maximize, Home } from 'lucide-react';

interface PropertySpecsPremiumProps {
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  areaTotal?: number;
  areaPrivativa?: number;
}

export default function PropertySpecsPremium({
  bedrooms,
  suites,
  bathrooms,
  parkingSpaces,
  areaTotal,
  areaPrivativa,
}: PropertySpecsPremiumProps) {
  const specs = [
    // 1. Área Privativa
    (areaPrivativa !== undefined && areaPrivativa !== null) ? {
      icon: Maximize,
      value: areaPrivativa,
      label: 'm² Privativa',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    } : null,
    // 2. Área Total
    (areaTotal !== undefined && areaTotal !== null) ? {
      icon: Maximize,
      value: areaTotal,
      label: 'm² Total',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    } : null,
    // 3. Dormitórios
    (bedrooms !== undefined && bedrooms !== null) ? {
      icon: Bed,
      value: bedrooms,
      label: bedrooms === 1 ? 'Dormitório' : 'Dormitórios',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    } : null,
    // 4. Suítes
    (suites !== undefined && suites !== null) ? {
      icon: Bed,
      value: suites,
      label: suites === 1 ? 'Suíte' : 'Suítes',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
    } : null,
    // 5. Banheiros
    (bathrooms !== undefined && bathrooms !== null) ? {
      icon: Bath,
      value: bathrooms,
      label: bathrooms === 1 ? 'Banheiro' : 'Banheiros',
      color: 'from-teal-500 to-emerald-500',
      bgColor: 'bg-teal-50',
    } : null,
    // 6. Vagas
    (parkingSpaces !== undefined && parkingSpaces !== null) ? {
      icon: Car,
      value: parkingSpaces,
      label: parkingSpaces === 1 ? 'Vaga' : 'Vagas',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    } : null,
  ].filter(spec => spec !== null) as Array<{
    icon: any;
    value: number;
    label: string;
    sublabel?: string;
    color: string;
    bgColor: string;
  }>;

  if (specs.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-white to-pharos-slate-50/30 rounded-2xl border border-pharos-slate-200/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-pharos-slate-200/60 bg-gradient-to-r from-pharos-slate-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pharos-blue-500 to-pharos-blue-600 flex items-center justify-center shadow-lg shadow-pharos-blue-500/20">
            <Home className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pharos-navy-900 leading-tight">
              Especificações
            </h2>
            <p className="text-xs text-pharos-slate-600 font-medium">
              Características principais
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Especificações */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {specs.map((spec, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl border-2 border-pharos-slate-200/60 hover:border-pharos-blue-500/30 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-pharos-blue-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${spec.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`bg-gradient-to-br ${spec.color} bg-clip-text`}>
                    <spec.icon className="w-6 h-6 text-transparent stroke-current" strokeWidth={2} style={{
                      WebkitTextFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                    }} />
                  </div>
                </div>

                {/* Value */}
                <div className="mb-2">
                  <p className="text-3xl font-bold text-pharos-navy-900 leading-none">
                    {spec.value}
                  </p>
                  {spec.sublabel && (
                    <p className="text-xs text-pharos-slate-500 font-medium mt-1">
                      {spec.sublabel}
                    </p>
                  )}
                </div>

                {/* Label */}
                <p className="text-sm font-semibold text-pharos-slate-600 uppercase tracking-wide">
                  {spec.label}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                <div className={`w-full h-full bg-gradient-to-br ${spec.color} rounded-full blur-sm`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

