'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Home,
  DollarSign,
  Maximize,
  Construction,
  Sparkles
} from 'lucide-react';
import {
  CITY_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  STATUS_OPTIONS,
  getNeighborhoodOptionsByCity,
  PROPERTY_FEATURE_OPTIONS,
  LOCATION_FEATURE_OPTIONS,
  BUILDING_FEATURE_OPTIONS,
} from '@/constants/filterOptions';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface FiltrosState {
  localizacao: string[];
  bairros: string[];
  tipos: string[];
  status: string[];
  precoMin: string;
  precoMax: string;
  areaMin: string;
  areaMax: string;
  quartos: string; // compatibilidade (será descontinuado)
  suites: string;  // compatibilidade (será descontinuado)
  banheiros: string;
  vagas: string;   // compatibilidade (será descontinuado)
  // NOVO: seleção exata multi (1,2,3) e flag 4+
  quartosExatos?: string[];
  suitesExatos?: string[];
  vagasExatos?: string[];
  quartos4Plus?: boolean;
  suites4Plus?: boolean;
  vagas4Plus?: boolean;
  codigoImovel: string;
  empreendimento: string;
  caracteristicasImovel: string[];
  caracteristicasLocalizacao: string[];
  caracteristicasEmpreendimento: string[];
  apenasExclusivos: boolean;
}

const quartosOptions = [
  { value: '', label: 'Qualquer' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' }
];

interface FiltersSidebarProps {
  filtros: FiltrosState;
  onFiltrosChange: (novos: FiltrosState) => void;
  onLimpar: () => void;
}

export default function FiltersSidebar({
  filtros,
  onFiltrosChange,
  onLimpar,
}: FiltersSidebarProps) {
  // State local para inputs controlados (melhor UX - sem delay visual)
  const [localPrecoMin, setLocalPrecoMin] = useState(filtros.precoMin);
  const [localPrecoMax, setLocalPrecoMax] = useState(filtros.precoMax);
  const [localAreaMin, setLocalAreaMin] = useState(filtros.areaMin);
  const [localAreaMax, setLocalAreaMax] = useState(filtros.areaMax);
  const [localCodigoImovel, setLocalCodigoImovel] = useState(filtros.codigoImovel);
  const [localEmpreendimento, setLocalEmpreendimento] = useState(filtros.empreendimento);
  
  const toggleArrayFilter = (field: keyof FiltrosState, value: string) => {
    console.log('🟢 toggleArrayFilter chamado:', field, value);
    const currentArray = filtros[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    console.log('🟢 toggleArrayFilter newArray:', newArray);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FiltersSidebar.tsx:87',message:'toggleArrayFilter',data:{field,value,currentArray,newArray},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H11'})}).catch(()=>{});
    // #endregion
    onFiltrosChange({ ...filtros, [field]: newArray });
  };

  const updateFilter = (field: keyof FiltrosState, value: any) => {
    onFiltrosChange({ ...filtros, [field]: value });
  };
  
  // Debounced update (500ms) - Apenas para filtros de texto pesados
  const debouncedUpdateFilter = useDebouncedCallback(
    (field: keyof FiltrosState, value: any) => {
      onFiltrosChange({ ...filtros, [field]: value });
    },
    500 // 500ms delay para reduzir chamadas à API
  );

  const formatCurrencyBR = (digits: string): string => {
    const onlyDigits = digits.replace(/\D/g, '');
    if (!onlyDigits) return '';
    const n = parseInt(onlyDigits, 10);
    if (isNaN(n)) return '';
    return n.toLocaleString('pt-BR');
  };

  // Handler com debounce para preço (reduz INP)
  const handlePriceChange = (field: 'precoMin' | 'precoMax', raw: string) => {
    const onlyDigits = raw.replace(/\D/g, '');
    
    // Atualizar state local imediatamente (UX responsivo)
    if (field === 'precoMin') setLocalPrecoMin(onlyDigits);
    else setLocalPrecoMax(onlyDigits);
    
    // Atualizar filtros com debounce (performance)
    debouncedUpdateFilter(field, onlyDigits);
  };
  
  // Handler com debounce para área
  const handleAreaChange = (field: 'areaMin' | 'areaMax', raw: string) => {
    const onlyDigits = raw.replace(/\D/g, '');
    
    if (field === 'areaMin') setLocalAreaMin(onlyDigits);
    else setLocalAreaMax(onlyDigits);
    
    debouncedUpdateFilter(field, onlyDigits);
  };
  
  // Handler com debounce para código/empreendimento
  const handleTextChange = (field: 'codigoImovel' | 'empreendimento', value: string) => {
    if (field === 'codigoImovel') setLocalCodigoImovel(value);
    else setLocalEmpreendimento(value);
    
    debouncedUpdateFilter(field, value);
  };

  const getFiltrosAtivos = (): Array<{ label: string; onRemove: () => void }> => {
    const ativos: Array<{ label: string; onRemove: () => void }> = [];

    // Código do Imóvel
    if (filtros.codigoImovel) {
      ativos.push({
        label: `Código: ${filtros.codigoImovel}`,
        onRemove: () => updateFilter('codigoImovel', ''),
      });
    }

    // Empreendimento
    if (filtros.empreendimento) {
      ativos.push({
        label: `Empreendimento: ${filtros.empreendimento}`,
        onRemove: () => updateFilter('empreendimento', ''),
      });
    }

    if (filtros.apenasExclusivos) {
      ativos.push({
        label: 'Exclusivos',
        onRemove: () => updateFilter('apenasExclusivos', false),
      });
    }

    // Localização (Cidades)
    filtros.localizacao.forEach(loc => {
      const option = CITY_OPTIONS.find(o => o.id === loc);
      if (option) {
        ativos.push({
          label: option.label,
          onRemove: () => toggleArrayFilter('localizacao', loc),
        });
      }
    });

    // Bairros (condicionais à cidade selecionada)
    const bairrosDisponiveis = getNeighborhoodOptionsByCity(filtros.localizacao);
    filtros.bairros.forEach(bairro => {
      const option = bairrosDisponiveis.find(o => o.id === bairro);
      if (option) {
        ativos.push({
          label: option.label,
          onRemove: () => toggleArrayFilter('bairros', bairro),
        });
      }
    });

    // Tipos de Imóvel
    filtros.tipos.forEach(tipo => {
      const option = PROPERTY_TYPE_OPTIONS.find(o => o.id === tipo);
      if (option) {
        ativos.push({
          label: option.label,
          onRemove: () => toggleArrayFilter('tipos', tipo),
        });
      }
    });

    // Status
    filtros.status.forEach(st => {
      const option = STATUS_OPTIONS.find(o => o.id === st);
      if (option) {
        ativos.push({
          label: option.label,
          onRemove: () => toggleArrayFilter('status', st),
        });
      }
    });

    // Preço Mínimo
    if (filtros.precoMin) {
      ativos.push({
        label: `Preço mín: R$ ${Number(filtros.precoMin).toLocaleString('pt-BR')}`,
        onRemove: () => updateFilter('precoMin', ''),
      });
    }

    // Preço Máximo
    if (filtros.precoMax) {
      ativos.push({
        label: `Preço máx: R$ ${Number(filtros.precoMax).toLocaleString('pt-BR')}`,
        onRemove: () => updateFilter('precoMax', ''),
      });
    }

    // Área Mínima
    if (filtros.areaMin) {
      ativos.push({
        label: `Área mín: ${filtros.areaMin}m²`,
        onRemove: () => updateFilter('areaMin', ''),
      });
    }

    // Área Máxima
    if (filtros.areaMax) {
      ativos.push({
        label: `Área máx: ${filtros.areaMax}m²`,
        onRemove: () => updateFilter('areaMax', ''),
      });
    }

    // Quartos (exato multi)
    if (filtros.quartosExatos && filtros.quartosExatos.length > 0) {
      ativos.push({
        label: `Quartos: ${filtros.quartosExatos.join(', ')}`,
        onRemove: () => onFiltrosChange({ ...filtros, quartosExatos: [] }),
      });
    }
    if (filtros.quartos4Plus) {
      ativos.push({
        label: 'Quartos: 4+',
        onRemove: () => onFiltrosChange({ ...filtros, quartos4Plus: false }),
      });
    }

    // Suítes (exato multi)
    if (filtros.suitesExatos && filtros.suitesExatos.length > 0) {
      ativos.push({
        label: `Suítes: ${filtros.suitesExatos.join(', ')}`,
        onRemove: () => onFiltrosChange({ ...filtros, suitesExatos: [] }),
      });
    }
    if (filtros.suites4Plus) {
      ativos.push({
        label: 'Suítes: 4+',
        onRemove: () => onFiltrosChange({ ...filtros, suites4Plus: false }),
      });
    }

    // Banheiros removido do filtro (indisponível nesta conta)

    // Vagas (exato multi)
    if (filtros.vagasExatos && filtros.vagasExatos.length > 0) {
      ativos.push({
        label: `Vagas: ${filtros.vagasExatos.join(', ')}`,
        onRemove: () => onFiltrosChange({ ...filtros, vagasExatos: [] }),
      });
    }
    if (filtros.vagas4Plus) {
      ativos.push({
        label: 'Vagas: 4+',
        onRemove: () => onFiltrosChange({ ...filtros, vagas4Plus: false }),
      });
    }

    // Características do Imóvel
    filtros.caracteristicasImovel.forEach(carac => {
      ativos.push({
        label: carac,
        onRemove: () => toggleArrayFilter('caracteristicasImovel', carac),
      });
    });

    // Características da Localização
    filtros.caracteristicasLocalizacao.forEach(carac => {
      ativos.push({
        label: carac,
        onRemove: () => toggleArrayFilter('caracteristicasLocalizacao', carac),
      });
    });

    // Características do Empreendimento
    filtros.caracteristicasEmpreendimento.forEach(carac => {
      ativos.push({
        label: carac,
        onRemove: () => toggleArrayFilter('caracteristicasEmpreendimento', carac),
      });
    });

    return ativos;
  };

  const filtrosAtivos = getFiltrosAtivos();

  return (
    <div className="bg-white rounded-[20px] border border-[#E8ECF2] shadow-[0_4px_12px_rgba(25,34,51,0.08)] h-full flex flex-col overflow-hidden">
      {/* Header Fixo */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-[#E8ECF2]">
        <div className="flex items-center justify-between">
          <h2 className="text-[#192233] font-bold text-lg">Filtros</h2>
          {filtrosAtivos.length > 0 && (
            <button
              onClick={onLimpar}
              className="text-[#C8A968] hover:text-white text-sm font-bold transition-all bg-white hover:bg-[#C8A968] border-2 border-[#C8A968] rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md active:scale-[0.98]"
              style={{ minHeight: '36px' }}
              aria-label="Limpar todos os filtros"
            >
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      {/* Seleção Atual (fixa após header) */}
      {filtrosAtivos.length > 0 && (
        <div className="flex-shrink-0 px-5 py-4 bg-[#F5F7FA] border-b border-[#E8ECF2]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#192233] font-semibold text-sm">Seleção atual</h3>
            <button
              onClick={onLimpar}
              className="text-[#8E99AB] hover:text-[#192233] text-xs font-medium transition-colors"
              aria-label="Remover todos os filtros"
            >
              Remover todos
            </button>
          </div>
          <div className="max-h-[72px] overflow-y-auto scrollbar-slim pr-1">
            <div className="flex flex-wrap gap-2">
              {filtrosAtivos.map((filtro, index) => (
                <button
                  key={index}
                  onClick={filtro.onRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8ECF2] rounded-lg text-xs font-medium text-[#192233] hover:border-[#C8A968] hover:bg-white/80 transition-colors"
                  aria-label={`Remover filtro ${filtro.label}`}
                >
                  {filtro.label}
                  <X className="w-3 h-3 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Rolável - TUDO SEMPRE ABERTO */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-6 scrollbar-slim">

        {/* Código do Imóvel */}
        <div className="pt-2">
          <label htmlFor="codigoImovel" className="block text-sm text-[#192233] font-semibold mb-2">
            Código do Imóvel
          </label>
          <input
            id="codigoImovel"
            type="text"
            value={filtros.codigoImovel}
            onChange={(e) => updateFilter('codigoImovel', e.target.value)}
            placeholder="Ex.: PH1045"
            className="w-full px-3 py-2 border border-[#E8ECF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#192233]/20 focus:border-[#192233]"
          />
        </div>

        {/* Empreendimento */}
        <div>
          <label htmlFor="empreendimento" className="block text-sm text-[#192233] font-semibold mb-2">
            Empreendimento
          </label>
          <input
            id="empreendimento"
            type="text"
            value={filtros.empreendimento}
            onChange={(e) => updateFilter('empreendimento', e.target.value)}
            placeholder="Nome do edifício"
            className="w-full px-3 py-2 border border-[#E8ECF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#192233]/20 focus:border-[#192233]"
          />
        </div>

        {/* Cidade */}
        <div className="border-t border-[#E8ECF2] pt-5">
          <h3 className="text-sm text-[#192233] font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-[18px] h-[18px]" />
            Cidade
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {CITY_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => toggleArrayFilter('localizacao', option.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  filtros.localizacao.includes(option.id)
                    ? 'bg-[#192233] text-white shadow-md'
                    : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                }`}
                style={{ minHeight: '44px' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preço */}
        <div className="border-t border-[#E8ECF2] pt-5">
          <h3 className="text-sm text-[#192233] font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-[18px] h-[18px]" />
            Preço
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8E99AB] font-medium mb-1.5">Mínimo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E99AB] text-sm">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyBR(filtros.precoMin)}
                  onChange={(e) => handlePriceChange('precoMin', e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 border border-[#E8ECF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#192233]/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8E99AB] font-medium mb-1.5">Máximo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E99AB] text-sm">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyBR(filtros.precoMax)}
                  onChange={(e) => handlePriceChange('precoMax', e.target.value)}
                  placeholder="∞"
                  className="w-full pl-9 pr-3 py-2 border border-[#E8ECF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#192233]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Área Útil */}
        <div>
          <h3 className="text-sm text-[#192233] font-semibold mb-3 flex items-center gap-2">
            <Maximize className="w-[18px] h-[18px]" />
            Área Útil (m²)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8E99AB] font-medium mb-1.5">Mínimo</label>
              <input
                type="number"
                value={filtros.areaMin}
                onChange={(e) => updateFilter('areaMin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#192233]/20"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8E99AB] font-medium mb-1.5">Máximo</label>
              <input
                type="number"
                value={filtros.areaMax}
                onChange={(e) => updateFilter('areaMax', e.target.value)}
                placeholder="∞"
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#192233]/20"
              />
            </div>
          </div>
        </div>

        {/* Bairro */}
        <div className="border-t border-[#E8ECF2] pt-5">
          <h3 className="text-sm text-[#192233] font-semibold mb-3">Bairro</h3>
          <div className="grid grid-cols-2 gap-2">
            {getNeighborhoodOptionsByCity(filtros.localizacao).map(option => (
              <button
                key={option.id}
                onClick={() => toggleArrayFilter('bairros', option.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  filtros.bairros.includes(option.id)
                    ? 'bg-[#192233] text-white shadow-md'
                    : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                }`}
                style={{ minHeight: '44px' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de Imóvel */}
        <div className="border-t border-[#E8ECF2] pt-5">
          <h3 className="text-sm text-[#192233] font-semibold mb-3 flex items-center gap-2">
            <Home className="w-[18px] h-[18px]" />
            Tipo de Imóvel
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_TYPE_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => toggleArrayFilter('tipos', option.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  filtros.tipos.includes(option.id)
                    ? 'bg-[#192233] text-white shadow-md'
                    : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                }`}
                style={{ minHeight: '44px' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status da Obra */}
        <div className="border-t border-[#E8ECF2] pt-5">
          <h3 className="text-sm text-[#192233] font-semibold mb-3 flex items-center gap-2">
            <Construction className="w-[18px] h-[18px]" />
            Status da Obra
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => toggleArrayFilter('status', option.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  filtros.status.includes(option.id)
                    ? 'bg-[#192233] text-white shadow-md'
                    : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                }`}
                style={{ minHeight: '44px' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Características */}
        <div className="border-t border-[#E8ECF2] pt-5">
          <h3 className="text-sm text-[#192233] font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-[18px] h-[18px]" />
            Características
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#192233] font-medium mb-2">Quartos</label>
              <div className="grid grid-cols-4 gap-2">
                {['1','2','3'].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      const list = new Set<string>(filtros.quartosExatos || []);
                      console.log('[FiltersSidebar] Antes de clicar:', { num, listaAtual: Array.from(list) });
                      if (list.has(num)) list.delete(num); else list.add(num);
                      const novaLista = Array.from(list);
                      console.log('[FiltersSidebar] Depois de clicar:', { novaLista });
                      onFiltrosChange({ ...filtros, quartosExatos: novaLista });
                    }}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                      (filtros.quartosExatos || []).includes(num)
                        ? 'bg-[#192233] text-white'
                        : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => onFiltrosChange({ ...filtros, quartos4Plus: !filtros.quartos4Plus })}
                  className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                    filtros.quartos4Plus ? 'bg-[#192233] text-white' : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  4+
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#192233] font-medium mb-2">Suítes</label>
              <div className="grid grid-cols-4 gap-2">
                {['1','2','3'].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      const list = new Set<string>(filtros.suitesExatos || []);
                      if (list.has(num)) list.delete(num); else list.add(num);
                      onFiltrosChange({ ...filtros, suitesExatos: Array.from(list) });
                    }}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                      (filtros.suitesExatos || []).includes(num)
                        ? 'bg-[#192233] text-white'
                        : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => onFiltrosChange({ ...filtros, suites4Plus: !filtros.suites4Plus })}
                  className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                    filtros.suites4Plus ? 'bg-[#192233] text-white' : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  4+
                </button>
              </div>
            </div>

            {/* Banheiros removido (não suportado na conta) */}

            <div>
              <label className="block text-sm text-[#192233] font-medium mb-2">Vagas</label>
              <div className="grid grid-cols-4 gap-2">
                {['1','2','3'].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      const list = new Set<string>(filtros.vagasExatos || []);
                      if (list.has(num)) list.delete(num); else list.add(num);
                      onFiltrosChange({ ...filtros, vagasExatos: Array.from(list) });
                    }}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                      (filtros.vagasExatos || []).includes(num)
                        ? 'bg-[#192233] text-white'
                        : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => onFiltrosChange({ ...filtros, vagas4Plus: !filtros.vagas4Plus })}
                  className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                    filtros.vagas4Plus ? 'bg-[#192233] text-white' : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2]'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  4+
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Características do Imóvel */}
        <div className="border-t border-[#E8ECF2] pt-5">
          <h3 className="text-sm text-[#192233] font-semibold mb-3">Características do Imóvel</h3>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_FEATURE_OPTIONS.map(caract => (
              <button
                key={caract}
                onClick={() => toggleArrayFilter('caracteristicasImovel', caract)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                  filtros.caracteristicasImovel.includes(caract)
                    ? 'bg-[#192233] text-white shadow-md'
                    : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2] border border-[#E8ECF2]'
                }`}
              >
                {caract}
              </button>
            ))}
          </div>
        </div>

        {/* Características da Localização */}
        <div className="border-t border-[#E8ECF2] pt-5">
          <h3 className="text-sm text-[#192233] font-semibold mb-3">Características da Localização</h3>
          <div className="grid grid-cols-2 gap-2">
            {LOCATION_FEATURE_OPTIONS.map(caract => (
              <button
                key={caract}
                onClick={() => toggleArrayFilter('caracteristicasLocalizacao', caract)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                  filtros.caracteristicasLocalizacao.includes(caract)
                    ? 'bg-[#192233] text-white shadow-md'
                    : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2] border border-[#E8ECF2]'
                }`}
              >
                {caract}
              </button>
            ))}
          </div>
        </div>

        {/* Características do Empreendimento */}
        <div className="border-t border-[#E8ECF2] pt-5 pb-4">
          <h3 className="text-sm text-[#192233] font-semibold mb-3">Características do Empreendimento</h3>
          <div className="grid grid-cols-2 gap-2">
            {BUILDING_FEATURE_OPTIONS.map(caract => (
              <button
                key={caract}
                onClick={() => {
                  console.log('🔵 CLIQUE DETECTADO:', caract, 'Filtros atuais:', filtros.caracteristicasEmpreendimento);
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FiltersSidebar.tsx:724',message:'CLIQUE característica empreendimento',data:{caracteristica:caract,filtrosAtuais:filtros.caracteristicasEmpreendimento},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H10'})}).catch((err)=>{console.error('❌ Erro ao enviar log:',err);});
                  // #endregion
                  toggleArrayFilter('caracteristicasEmpreendimento', caract);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                  filtros.caracteristicasEmpreendimento.includes(caract)
                    ? 'bg-[#192233] text-white shadow-md'
                    : 'bg-[#F5F7FA] text-[#192233] hover:bg-[#E8ECF2] border border-[#E8ECF2]'
                }`}
              >
                {caract}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
