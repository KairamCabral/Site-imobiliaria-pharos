'use client';

import { useState, Fragment, useRef, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  CITY_OPTIONS,
  LOCATION_FEATURE_OPTIONS,
  PROPERTY_FEATURE_OPTIONS,
  BUILDING_FEATURE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  STATUS_OPTIONS,
  VALUE_RANGE_OPTIONS,
  BEDROOM_PRESET_OPTIONS,
  getNeighborhoodOptionsByCity,
  CITY_SLUG_TO_NAME,
} from '@/constants/filterOptions';
import { buildPropertySearchParams } from '@/utils/propertySearchParams';

// Dados para os dropdowns compartilhados com a listagem
const cidadeOptions = CITY_OPTIONS;
const localizacaoOptions = CITY_OPTIONS;
const tipoImovelOptions = PROPERTY_TYPE_OPTIONS;
const statusOptions = STATUS_OPTIONS;
const valorOptions = VALUE_RANGE_OPTIONS;
const quartosOptions = BEDROOM_PRESET_OPTIONS;
const suitesOptions = BEDROOM_PRESET_OPTIONS;
const banheirosOptions = BEDROOM_PRESET_OPTIONS;
const vagasOptions = BEDROOM_PRESET_OPTIONS;

// Consolidação de todas as características (compatibilidade)
const caracteristicasOptions = [
  ...PROPERTY_FEATURE_OPTIONS,
  ...LOCATION_FEATURE_OPTIONS,
  ...BUILDING_FEATURE_OPTIONS,
];

// Componente Dropdown personalizado
interface DropdownProps {
  label: string;
  options: { id: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

const Dropdown = ({ label, options, value, onChange, className }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Atualiza a posição do menu
  const updateMenuPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateMenuPosition();
        
        // Fecha o dropdown se o scroll fizer ele colidir com o header
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          // Se o campo de filtro está muito próximo ou acima do header (88px de altura)
          if (rect.top < 100) {
            setIsOpen(false);
          }
        }
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateMenuPosition();
      }
    };

    if (isOpen) {
      updateMenuPosition();
      
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }

    return undefined;
  }, [isOpen]);

  const handleToggleOption = (optionId: string, e?: React.MouseEvent) => {
    // Evitar que o evento se propague
    e?.stopPropagation();
    
    const newValue = [...value];
    const index = newValue.indexOf(optionId);
    
    if (index === -1) {
      newValue.push(optionId);
    } else {
      newValue.splice(index, 1);
    }
    
    // Chamar onChange e evitar fechar o dropdown
    setTimeout(() => {
      onChange(newValue);
    }, 0);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const displayText = () => {
    if (value.length === 0) return 'Qualquer';
    if (value.length === 1) return options.find(o => o.id === value[0])?.label;
    return `${value.length} selecionados`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3.5 text-left text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all hover:border-gray-300"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium mb-0.5">{label}</span>
          <span className="text-sm font-medium truncate">{displayText()}</span>
        </div>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
          {isOpen ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          )}
        </span>
      </button>
      
      {isOpen && createPortal(
        <div 
          ref={menuRef}
          className="fixed z-30 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[250px] max-h-[360px] overflow-y-auto overflow-x-hidden"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            {options.map((option) => (
              <div 
                key={option.id}
                className="px-2 hover:bg-gray-50"
              >
                <div
                  className="flex items-center w-full cursor-pointer py-3 px-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleOption(option.id, e);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.id)}
                    readOnly
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                  />
                  <span className="ml-3 text-base text-gray-700">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Componente FilterChip para exibir os filtros selecionados
interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip = ({ label, onRemove }: FilterChipProps) => {
  return (
    <div className="inline-flex items-center bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full px-3.5 py-1.5 text-sm shadow-sm transition-all">
      <span className="mr-1.5 font-medium">{label}</span>
      <button 
        type="button" 
        onClick={onRemove}
        className="ml-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-0.5 transition-all focus:outline-none"
        aria-label={`Remover filtro ${label}`}
      >
        <XMarkIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface SearchFilterProps {
  defaultTab?: 'comprar' | 'anunciar';
  hideTabSwitch?: boolean;
  /** Usa espaçamentos mais compactos para o contexto de hero na home (mobile-first) */
  variant?: 'default' | 'hero';
}

export default function SearchFilter({ defaultTab = 'comprar', hideTabSwitch = false, variant = 'default' }: SearchFilterProps = {}) {
  const router = useRouter();
  const isHero = variant === 'hero';
  const [tipoTransacao, setTipoTransacao] = useState(defaultTab);
  const [showDrawer, setShowDrawer] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  const [filtros, setFiltros] = useState({
    termo: '',
    cidades: [] as string[],
    bairros: [] as string[],
    codigoImovel: '',
    localizacoes: [] as string[],
    tiposImovel: [] as string[],
    status: [] as string[],
    valoresAproximados: [] as string[],
    valorMinimo: '',
    valorMaximo: '',
    empreendimento: '',
    quartos: '',
    suites: '',
    banheiros: '',
    vagas: '',
    areaMinima: '',
    areaMaxima: '',
    caracteristicas: [] as string[],
    caracteristicasImovel: [] as string[],
    caracteristicasLocalizacao: [] as string[],
    caracteristicasEmpreendimento: [] as string[]
  });

  // Estado temporário para o drawer de filtros avançados
  const [filtrosTemporarios, setFiltrosTemporarios] = useState({...filtros});

  // Estado para Anunciar (formulário em 4 passos)
  const [anunciarStep, setAnunciarStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [anunciarForm, setAnunciarForm] = useState({
    endereco: '',
    nome: '',
    email: '',
    ddi: '+55',
    telefone: '',
    empreendimento: '',
    areaPrivativa: '',
    dormitorios: '',
    suites: '',
    vagas: '',
    mobiliado: 'nao' as 'sim' | 'nao',
  });

  // Função para abrir o drawer de filtros avançados
  const openDrawer = () => {
    setFiltrosTemporarios({...filtros});
    setShowDrawer(true);
  };

  // Adicionar listener para o evento personalizado
  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      openDrawer();
    };

    // Adicionar listener para o evento personalizado
    window.addEventListener('openFilterDrawer', handleOpenDrawerEvent);

    // Remover listener ao desmontar o componente
    return () => {
      window.removeEventListener('openFilterDrawer', handleOpenDrawerEvent);
    };
  }, [filtros]); // Depende de filtros para sempre ter o estado mais atualizado

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setShowDrawer(false);
      }
    }
    
    if (showDrawer) {
      document.addEventListener('mousedown', handleClickOutside);
      // Impedir rolagem do body quando drawer está aberto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showDrawer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltrosTemporarios(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleCaracteristica = (item: string) => {
    setFiltrosTemporarios(prev => {
      const caracteristicas = [...prev.caracteristicas];
      const index = caracteristicas.indexOf(item);
      
      if (index === -1) {
        caracteristicas.push(item);
      } else {
        caracteristicas.splice(index, 1);
      }
      
      return {
        ...prev,
        caracteristicas
      };
    });
  };

  const buildUnifiedSearchParams = (source: typeof filtros | typeof filtrosTemporarios) => {
    const combinedCitySlugs = Array.from(new Set<string>([
      ...(source.cidades || []),
      ...(source.localizacoes || []),
    ]));

    return buildPropertySearchParams({
      citySlugs: combinedCitySlugs,
      neighborhoods: source.bairros,
      types: source.tiposImovel,
      status: source.status,
      priceMin: source.valorMinimo,
      priceMax: source.valorMaximo,
      priceRanges: source.valoresAproximados,
      areaMin: source.areaMinima,
      areaMax: source.areaMaxima,
      bedroomsMin: source.quartos,
      suitesMin: source.suites,
      parkingMin: source.vagas,
      propertyCode: source.codigoImovel,
      buildingName: source.empreendimento,
      propertyFeatures: source.caracteristicasImovel,
      locationFeatures: source.caracteristicasLocalizacao,
      buildingFeatures: source.caracteristicasEmpreendimento,
      genericFeatures: source.caracteristicas,
      searchTerm: source.termo,
    });
  };

  const buscarImoveis = () => {
    const params = buildUnifiedSearchParams(filtros);
    if (tipoTransacao) params.set('tipo', tipoTransacao);
    router.push(`/imoveis?${params.toString()}`);
  };
  
  const resetFiltros = () => {
    const novosFiltros = {
      termo: '',
      cidades: [],
      bairros: [],
      codigoImovel: '',
      localizacoes: [],
      tiposImovel: [],
      status: [],
      valoresAproximados: [],
      valorMinimo: '',
      valorMaximo: '',
      empreendimento: '',
      quartos: '',
      suites: '',
      banheiros: '',
      vagas: '',
      areaMinima: '',
      areaMaxima: '',
      caracteristicas: [],
      caracteristicasImovel: [],
      caracteristicasLocalizacao: [],
      caracteristicasEmpreendimento: []
    };
    
    setFiltros(novosFiltros);
    setFiltrosTemporarios(novosFiltros);
  };

  const handleDropdownChange = (field: 'cidades' | 'bairros' | 'localizacoes' | 'tiposImovel' | 'status' | 'valoresAproximados') => {
    return (value: string[]) => {
      setFiltros(prev => ({
        ...prev,
        [field]: value
      }));
      // Sincroniza com filtros temporários imediatamente
      setFiltrosTemporarios(prev => ({
        ...prev,
        [field]: value
      }));
    };
  };

  const handleOpenDrawer = () => {
    openDrawer();
  };

  const aplicarFiltrosAvancados = () => {
    setFiltros({ ...filtrosTemporarios });
    setShowDrawer(false);
    const params = buildUnifiedSearchParams(filtrosTemporarios);
    if (tipoTransacao) params.set('tipo', tipoTransacao);
    router.push(`/imoveis?${params.toString()}`);
  };

  const removerFiltro = (tipo: keyof typeof filtros, valor?: string) => {
    if (tipo === 'termo' || tipo === 'codigoImovel' || tipo === 'empreendimento' || tipo === 'valorMinimo' || tipo === 'valorMaximo') {
      setFiltros(prev => ({ ...prev, [tipo]: '' }));
      setFiltrosTemporarios(prev => ({ ...prev, [tipo]: '' }));
    } else if (tipo === 'quartos' || tipo === 'suites' || tipo === 'banheiros' || tipo === 'vagas' || tipo === 'areaMinima' || tipo === 'areaMaxima') {
      setFiltros(prev => ({ ...prev, [tipo]: '' }));
      setFiltrosTemporarios(prev => ({ ...prev, [tipo]: '' }));
    } else if (valor) {
      setFiltros(prev => {
        const array = [...(prev[tipo] as string[])];
        const index = array.indexOf(valor);
        if (index !== -1) {
          array.splice(index, 1);
        }
        return { ...prev, [tipo]: array };
      });
      setFiltrosTemporarios(prev => {
        const array = [...(prev[tipo] as string[])];
        const index = array.indexOf(valor);
        if (index !== -1) {
          array.splice(index, 1);
        }
        return { ...prev, [tipo]: array };
      });
    }
  };

  // Gera os chips de filtro para exibição
  const renderFilterChips = () => {
    const chips = [];

    if (filtros.termo) {
      chips.push(
        <FilterChip 
          key="termo" 
          label={`Busca: ${filtros.termo}`} 
          onRemove={() => removerFiltro('termo')} 
        />
      );
    }

    if (filtros.codigoImovel) {
      chips.push(
        <FilterChip 
          key="codigo" 
          label={`Código: ${filtros.codigoImovel}`} 
          onRemove={() => removerFiltro('codigoImovel')} 
        />
      );
    }

    if (filtros.empreendimento) {
      chips.push(
        <FilterChip 
          key="empreendimento" 
          label={`Empreendimento: ${filtros.empreendimento}`} 
          onRemove={() => removerFiltro('empreendimento')} 
        />
      );
    }

    filtros.cidades.forEach(cidade => {
      const label = cidadeOptions.find(o => o.id === cidade)?.label;
      if (label) {
        chips.push(
          <FilterChip 
            key={`cidade-${cidade}`} 
            label={`Cidade: ${label}`} 
            onRemove={() => removerFiltro('cidades', cidade)} 
          />
        );
      }
    });

    filtros.bairros.forEach(bairro => {
      const label = getNeighborhoodOptionsByCity(filtros.cidades).find(o => o.id === bairro)?.label;
      if (label) {
        chips.push(
          <FilterChip 
            key={`bairro-${bairro}`} 
            label={`Bairro: ${label}`} 
            onRemove={() => removerFiltro('bairros', bairro)} 
          />
        );
      }
    });

    filtros.localizacoes.forEach(loc => {
      const label = localizacaoOptions.find(o => o.id === loc)?.label;
      if (label) {
        chips.push(
          <FilterChip 
            key={`loc-${loc}`} 
            label={`Localização: ${label}`} 
            onRemove={() => removerFiltro('localizacoes', loc)} 
          />
        );
      }
    });

    filtros.tiposImovel.forEach(tipo => {
      const label = tipoImovelOptions.find(o => o.id === tipo)?.label;
      if (label) {
        chips.push(
          <FilterChip 
            key={`tipo-${tipo}`} 
            label={`Tipo: ${label}`} 
            onRemove={() => removerFiltro('tiposImovel', tipo)} 
          />
        );
      }
    });

    filtros.status.forEach(st => {
      const label = statusOptions.find(o => o.id === st)?.label;
      if (label) {
        chips.push(
          <FilterChip 
            key={`status-${st}`} 
            label={`Status: ${label}`} 
            onRemove={() => removerFiltro('status', st)} 
          />
        );
      }
    });

    filtros.valoresAproximados.forEach(valor => {
      const label = valorOptions.find(o => o.id === valor)?.label;
      if (label) {
        chips.push(
          <FilterChip 
            key={`valor-${valor}`} 
            label={`Valor: ${label}`} 
            onRemove={() => removerFiltro('valoresAproximados', valor)} 
          />
        );
      }
    });

    if (filtros.valorMinimo) {
      chips.push(
        <FilterChip 
          key="valorMin" 
          label={`Valor mín: R$ ${filtros.valorMinimo}`} 
          onRemove={() => removerFiltro('valorMinimo')} 
        />
      );
    }

    if (filtros.valorMaximo) {
      chips.push(
        <FilterChip 
          key="valorMax" 
          label={`Valor máx: R$ ${filtros.valorMaximo}`} 
          onRemove={() => removerFiltro('valorMaximo')} 
        />
      );
    }

    if (filtros.quartos) {
      const label = quartosOptions.find(o => o.value === filtros.quartos)?.label;
      chips.push(
        <FilterChip 
          key="quartos" 
          label={`Quartos: ${label}`} 
          onRemove={() => removerFiltro('quartos')} 
        />
      );
    }

    if (filtros.suites) {
      const label = suitesOptions.find(o => o.value === filtros.suites)?.label;
      chips.push(
        <FilterChip 
          key="suites" 
          label={`Suítes: ${label}`} 
          onRemove={() => removerFiltro('suites')} 
        />
      );
    }

    if (filtros.banheiros) {
      const label = banheirosOptions.find(o => o.value === filtros.banheiros)?.label;
      chips.push(
        <FilterChip 
          key="banheiros" 
          label={`Banheiros: ${label}`} 
          onRemove={() => removerFiltro('banheiros')} 
        />
      );
    }

    if (filtros.vagas) {
      const label = vagasOptions.find(o => o.value === filtros.vagas)?.label;
      chips.push(
        <FilterChip 
          key="vagas" 
          label={`Vagas: ${label}`} 
          onRemove={() => removerFiltro('vagas')} 
        />
      );
    }

    if (filtros.areaMinima) {
      chips.push(
        <FilterChip 
          key="areaMin" 
          label={`Área mín: ${filtros.areaMinima}m²`} 
          onRemove={() => removerFiltro('areaMinima')} 
        />
      );
    }

    if (filtros.areaMaxima) {
      chips.push(
        <FilterChip 
          key="areaMax" 
          label={`Área máx: ${filtros.areaMaxima}m²`} 
          onRemove={() => removerFiltro('areaMaxima')} 
        />
      );
    }

    // Características do Imóvel
    filtros.caracteristicasImovel.forEach(caract => {
      chips.push(
        <FilterChip 
          key={`caract-imovel-${caract}`} 
          label={`Imóvel: ${caract}`} 
          onRemove={() => removerFiltro('caracteristicasImovel', caract)} 
        />
      );
    });

    // Características da Localização
    filtros.caracteristicasLocalizacao.forEach(caract => {
      chips.push(
        <FilterChip 
          key={`caract-loc-${caract}`} 
          label={`Localização: ${caract}`} 
          onRemove={() => removerFiltro('caracteristicasLocalizacao', caract)} 
        />
      );
    });

    // Características do Empreendimento
    filtros.caracteristicasEmpreendimento.forEach(caract => {
      chips.push(
        <FilterChip 
          key={`caract-emp-${caract}`} 
          label={`Empreendimento: ${caract}`} 
          onRemove={() => removerFiltro('caracteristicasEmpreendimento', caract)} 
        />
      );
    });

    // Características gerais (compatibilidade)
    filtros.caracteristicas.forEach(caract => {
      chips.push(
        <FilterChip 
          key={`caract-${caract}`} 
          label={caract} 
          onRemove={() => removerFiltro('caracteristicas', caract)} 
        />
      );
    });

    return chips;
  };

  return (
    <>
    <section
      className={
        `container mx-auto ${isHero ? 'px-4 md:px-6 lg:px-10' : 'px-4 md:px-8 lg:px-16'} ` +
        `${isHero ? 'pt-1 pb-28 md:pt-6 md:pb-12' : 'pt-8 pb-36 md:pt-12 md:pb-16'} ` +
        `relative`
      }
    >
      <div className="w-full">
        <div className={`text-left ${isHero ? 'mb-4 md:mb-6' : 'mb-6 md:mb-8 lg:mb-10'} md:max-w-2xl lg:mx-0 mx-auto`}>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white mb-2 md:mb-3 leading-tight tracking-tight">
            Seu próximo endereço de alto padrão começa aqui
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 font-light">
            Imóveis em Balneário Camboriú, Praia Brava e região
          </p>
        </div>
        
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 border border-gray-100 md:max-w-2xl lg:max-w-3xl mx-auto md:mx-0">
          {/* Tabs Comprar/Anunciar */}
          <Tab.Group onChange={(index: number) => setTipoTransacao(index === 0 ? 'comprar' : 'anunciar')}>
            <Tab.List className="flex border-b border-gray-100 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 mb-6">
              <Tab as={Fragment}>
                {({ selected }: { selected: boolean }) => (
                  <button
                    className={`flex-1 py-4 md:py-5 text-center text-base md:text-lg font-medium transition-colors focus:outline-none ${
                      selected
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="Buscar imóveis para comprar"
                  >
                    Comprar
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }: { selected: boolean }) => (
                  <button
                    className={`flex-1 py-4 md:py-5 text-center text-base md:text-lg font-medium transition-colors focus:outline-none ${
                      selected
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="Anunciar seu imóvel"
                  >
                    Anunciar
                  </button>
                )}
              </Tab>
            </Tab.List>
            
            <div className="space-y-6">
              {/* Conteúdo condicional: Comprar => busca; Anunciar => formulário */}
              {tipoTransacao === 'comprar' && (
              <>
              {/* Campo de pesquisa principal destacado */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  name="termo"
                  value={filtros.termo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, termo: e.target.value }))}
                  placeholder="Cidade, Bairro ou Empreendimento"
                  className="w-full h-12 md:h-auto pl-12 pr-4 py-3 md:py-4 rounded-xl border border-gray-200 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all text-base"
                  aria-label="Pesquise por cidade, bairro ou empreendimento"
                />
              </div>
              
              {/* Filtros básicos */}
              <div className="flex flex-col md:flex-row gap-4 md:items-end">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                  <Dropdown 
                    label="Tipo do imóvel"
                    options={tipoImovelOptions}
                    value={filtros.tiposImovel}
                    onChange={handleDropdownChange('tiposImovel')}
                  />
                  
                  <Dropdown 
                    label="Status"
                    options={statusOptions}
                    value={filtros.status}
                    onChange={handleDropdownChange('status')}
                  />
                  
                  <Dropdown 
                    label="Valor"
                    options={valorOptions}
                    value={filtros.valoresAproximados}
                    onChange={handleDropdownChange('valoresAproximados')}
                  />
                </div>
                
                <div className="hidden md:flex gap-3 md:ml-4">
                  <button 
                    onClick={openDrawer}
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-all py-3 md:py-3.5 px-4 md:px-5 rounded-xl text-gray-700 shadow-sm font-medium"
                    aria-label="Abrir filtros avançados"
                  >
                    <FunnelIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">Filtros</span>
                  </button>
                  
                  <button 
                    onClick={buscarImoveis}
                    className="flex-shrink-0 bg-primary hover:bg-primary-600 text-white py-3 md:py-3.5 px-5 md:px-6 rounded-xl transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center font-medium text-base"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    Buscar
                  </button>
                </div>
              </div>
              {/* Chips de filtros selecionados */}
              {renderFilterChips().length > 0 && (
                <div className="flex flex-wrap gap-2.5 pt-4 mt-2 border-t border-gray-200">
                  {renderFilterChips()}
                  {renderFilterChips().length > 1 && (
                    <button 
                      onClick={resetFiltros}
                      className="text-sm text-gray-500 hover:text-primary flex items-center px-3 py-1.5 hover:bg-gray-100 rounded-full transition-all shadow-sm"
                      aria-label="Limpar todos os filtros"
                    >
                      <XMarkIcon className="w-4 h-4 mr-1.5" />
                      <span className="font-medium">Limpar todos</span>
                    </button>
                  )}
                </div>
              )}
              </>
              )}

              {tipoTransacao === 'anunciar' && (
                <div className="space-y-4">
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Venda seu imóvel</h3>
                    <p className="text-sm text-gray-600 mt-1">Avaliação gratuita em 4 passos simples.</p>
                  </div>

                  {/* Indicador de progresso */}
                  <div className="flex gap-2">
                    <div className={`h-1 flex-1 rounded-full transition-all ${anunciarStep >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-all ${anunciarStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-all ${anunciarStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-all ${anunciarStep >= 4 ? 'bg-primary' : 'bg-gray-200'}`} />
                  </div>

                  {anunciarStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereço do imóvel</label>
                        <input
                          type="text"
                          value={anunciarForm.endereco}
                          onChange={(e) => setAnunciarForm(prev => ({ ...prev, endereco: e.target.value }))}
                          className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Rua, número, bairro, cidade"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
                        <input
                          type="text"
                          value={anunciarForm.nome}
                          onChange={(e) => setAnunciarForm(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setAnunciarStep(2)}
                          className="bg-primary hover:bg-primary-600 text-white py-2.5 px-6 rounded-lg transition-all text-sm font-medium"
                        >
                          Próximo
                        </button>
                      </div>
                    </div>
                  )}

                  {anunciarStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                        <input
                          type="email"
                          value={anunciarForm.email}
                          onChange={(e) => setAnunciarForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone com WhatsApp</label>
                        <div className="flex gap-2">
                          <select
                            value={anunciarForm.ddi}
                            onChange={(e) => setAnunciarForm(prev => ({ ...prev, ddi: e.target.value }))}
                            className="w-[75px] bg-white border border-gray-300 rounded-lg py-2.5 px-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          >
                            <option value="+55">🇧🇷 +55</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+54">🇦🇷 +54</option>
                            <option value="+56">🇨🇱 +56</option>
                            <option value="+598">🇺🇾 +598</option>
                            <option value="+351">🇵🇹 +351</option>
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+39">🇮🇹 +39</option>
                            <option value="+44">🇬🇧 +44</option>
                          </select>
                          <input
                            type="tel"
                            value={anunciarForm.telefone}
                            onChange={(e) => setAnunciarForm(prev => ({ ...prev, telefone: e.target.value.replace(/\D/g, '') }))}
                            className="flex-1 bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="47 99999-9999"
                            maxLength={15}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Formato: DDD + número (ex: 47 99999-9999)</p>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          onClick={() => setAnunciarStep(1)}
                          className="text-gray-600 hover:text-gray-900 py-2.5 px-4 text-sm font-medium transition-colors"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={() => setAnunciarStep(3)}
                          className="bg-primary hover:bg-primary-600 text-white py-2.5 px-6 rounded-lg transition-all text-sm font-medium"
                        >
                          Próximo
                        </button>
                      </div>
                    </div>
                  )}

                  {anunciarStep === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Dormitórios</label>
                          <input
                            type="number"
                            value={anunciarForm.dormitorios}
                            onChange={(e) => setAnunciarForm(prev => ({ ...prev, dormitorios: e.target.value }))}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Suítes</label>
                          <input
                            type="number"
                            value={anunciarForm.suites}
                            onChange={(e) => setAnunciarForm(prev => ({ ...prev, suites: e.target.value }))}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vagas</label>
                          <input
                            type="number"
                            value={anunciarForm.vagas}
                            onChange={(e) => setAnunciarForm(prev => ({ ...prev, vagas: e.target.value }))}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="2"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          onClick={() => setAnunciarStep(2)}
                          className="text-gray-600 hover:text-gray-900 py-2.5 px-4 text-sm font-medium transition-colors"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={() => setAnunciarStep(4)}
                          className="bg-primary hover:bg-primary-600 text-white py-2.5 px-6 rounded-lg transition-all text-sm font-medium"
                        >
                          Próximo
                        </button>
                      </div>
                    </div>
                  )}

                  {anunciarStep === 4 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Área privativa (m²)</label>
                          <input
                            type="number"
                            value={anunciarForm.areaPrivativa}
                            onChange={(e) => setAnunciarForm(prev => ({ ...prev, areaPrivativa: e.target.value }))}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="120"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Empreendimento</label>
                          <input
                            type="text"
                            value={anunciarForm.empreendimento}
                            onChange={(e) => setAnunciarForm(prev => ({ ...prev, empreendimento: e.target.value }))}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Nome do edifício"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobiliado?</label>
                        <div className="flex gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="mobiliado"
                              checked={anunciarForm.mobiliado === 'sim'}
                              onChange={() => setAnunciarForm(prev => ({ ...prev, mobiliado: 'sim' }))}
                              className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">Sim</span>
                          </label>
                          <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="mobiliado"
                              checked={anunciarForm.mobiliado === 'nao'}
                              onChange={() => setAnunciarForm(prev => ({ ...prev, mobiliado: 'nao' }))}
                              className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">Não</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          onClick={() => setAnunciarStep(3)}
                          className="text-gray-600 hover:text-gray-900 py-2.5 px-4 text-sm font-medium transition-colors"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={() => {
                            setEnviandoAvaliacao(true);
                            setTimeout(() => { setEnviandoAvaliacao(false); setAnunciarStep(5); }, 900);
                          }}
                          disabled={enviandoAvaliacao}
                          className="bg-primary hover:bg-primary-600 text-white py-2.5 px-6 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                        >
                          {enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
                        </button>
                      </div>
                    </div>
                  )}

                  {anunciarStep === 5 && (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Avaliação solicitada!</h4>
                      <p className="text-sm text-gray-600 max-w-md mx-auto">
                        Em breve nossa equipe entrará em contato para validar as informações e enviar a avaliação completa do seu imóvel.
                      </p>
                      <a
                        href="https://wa.me/554791878070?text=Ol%C3%A1%2C%20vim%20do%20site%20da%20Pharos%20e%20solicitei%20uma%20avalia%C3%A7%C3%A3o."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-5 rounded-lg text-sm font-medium transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.62-6.003C.122 5.281 5.403 0 12.057 0c3.182 0 6.167 1.24 8.413 3.488a11.82 11.82 0 013.49 8.414c-.003 6.654-5.284 11.935-11.938 11.935a11.95 11.95 0 01-6.003-1.62L.057 24zm6.597-3.807c1.735 1.032 3.276 1.666 5.392 1.666 5.448 0 9.886-4.434 9.889-9.877.003-5.462-4.415-9.89-9.881-9.893-5.451 0-9.886 4.434-9.889 9.885a9.86 9.86 0 001.662 5.42l-.999 3.648 3.826-.849zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.413.248-.694.248-1.29.173-1.413z" />
                        </svg>
                        Falar no WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Tab.Group>
        </div>
      </div>
      
      {/* Drawer de filtros avançados */}
      {showDrawer && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]" aria-hidden="true" />
          
          {/* Drawer */}
          <div 
            ref={drawerRef}
            className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-white shadow-xl z-[1001] overflow-y-auto transform transition-transform duration-300 ease-in-out"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="flex flex-col h-full">
              {/* Cabeçalho */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gray-50">
                <h2 id="drawer-title" className="text-xl font-bold flex items-center text-gray-800">
                  <AdjustmentsHorizontalIcon className="w-6 h-6 mr-3 text-primary" />
                  Filtros Avançados
                </h2>
                <button 
                  onClick={() => setShowDrawer(false)} 
                  className="p-2.5 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Fechar filtros avançados"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {/* Conteúdo */}
              <div className="flex-grow p-8 overflow-y-auto">
                {/* Cidade */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Cidade</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {cidadeOptions.map(option => (
                      <div key={option.id}>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = [...filtrosTemporarios.cidades];
                            const index = newValue.indexOf(option.id);
                            
                            if (index === -1) {
                              newValue.push(option.id);
                            } else {
                              newValue.splice(index, 1);
                            }
                            
                            setFiltrosTemporarios(prev => ({ ...prev, cidades: newValue }));
                          }}
                          className={`w-full text-center px-3 py-3 rounded-lg transition-all text-sm font-medium ${
                            filtrosTemporarios.cidades.includes(option.id)
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bairro */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Bairro</h3>
                  <div className="grid grid-cols-2 gap-2">
                  {getNeighborhoodOptionsByCity(filtrosTemporarios.cidades).map(option => (
                      <div key={option.id}>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = [...filtrosTemporarios.bairros];
                            const index = newValue.indexOf(option.id);
                            
                            if (index === -1) {
                              newValue.push(option.id);
                            } else {
                              newValue.splice(index, 1);
                            }
                            
                            setFiltrosTemporarios(prev => ({ ...prev, bairros: newValue }));
                          }}
                          className={`w-full text-center px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                            filtrosTemporarios.bairros.includes(option.id)
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Código do Imóvel */}
                <div className="mb-8">
                  <label htmlFor="codigoImovel" className="block text-base font-semibold text-gray-900 mb-3">
                    Código do Imóvel
                  </label>
                  <input 
                    id="codigoImovel"
                    type="text" 
                    name="codigoImovel"
                    value={filtrosTemporarios.codigoImovel}
                    onChange={handleInputChange}
                    placeholder="Ex: PHR-12345"
                    className="w-full bg-white border border-gray-200 rounded-lg py-3.5 px-4 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                {/* Empreendimento */}
                <div className="mb-8">
                  <label htmlFor="empreendimento" className="block text-base font-semibold text-gray-900 mb-3">
                    Empreendimento
                  </label>
                  <input 
                    id="empreendimento"
                    type="text" 
                    name="empreendimento"
                    value={filtrosTemporarios.empreendimento}
                    onChange={handleInputChange}
                    placeholder="Nome do edifício ou condomínio"
                    className="w-full bg-white border border-gray-200 rounded-lg py-3.5 px-4 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                {/* Divider */}
                <hr className="my-8 border-gray-200" />

                {/* Tipo do Imóvel */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Tipo do Imóvel</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tipoImovelOptions.map(option => (
                      <div key={option.id}>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = [...filtrosTemporarios.tiposImovel];
                            const index = newValue.indexOf(option.id);
                            
                            if (index === -1) {
                              newValue.push(option.id);
                            } else {
                              newValue.splice(index, 1);
                            }
                            
                            setFiltrosTemporarios(prev => ({ ...prev, tiposImovel: newValue }));
                          }}
                          className={`w-full text-center px-3 py-3 rounded-lg transition-all text-sm font-medium ${
                            filtrosTemporarios.tiposImovel.includes(option.id)
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status da Obra */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Status da Obra</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map(option => (
                      <div key={option.id}>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = [...filtrosTemporarios.status];
                            const index = newValue.indexOf(option.id);
                            
                            if (index === -1) {
                              newValue.push(option.id);
                            } else {
                              newValue.splice(index, 1);
                            }
                            
                            setFiltrosTemporarios(prev => ({ ...prev, status: newValue }));
                          }}
                          className={`w-full text-center px-3 py-3 rounded-lg transition-all text-sm font-medium ${
                            filtrosTemporarios.status.includes(option.id)
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <hr className="my-8 border-gray-200" />

                {/* Valor de Venda */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Valor de Venda</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="valorMinimo" className="block text-sm font-medium text-gray-700 mb-2">
                        Valor mínimo
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input 
                          id="valorMinimo"
                          type="number" 
                          name="valorMinimo"
                          value={filtrosTemporarios.valorMinimo}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full bg-white border border-gray-200 rounded-lg py-3.5 pl-10 pr-4 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="valorMaximo" className="block text-sm font-medium text-gray-700 mb-2">
                        Valor máximo
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input 
                          id="valorMaximo"
                          type="number" 
                          name="valorMaximo"
                          value={filtrosTemporarios.valorMaximo}
                          onChange={handleInputChange}
                          placeholder="999999999"
                          className="w-full bg-white border border-gray-200 rounded-lg py-3.5 pl-10 pr-4 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <hr className="my-8 border-gray-200" />
                
                {/* Área mínima e máxima */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Área</h3>
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="areaMinima" className="block text-sm font-medium text-gray-700 mb-2">
                        Área mínima (m²)
                      </label>
                      <input 
                        id="areaMinima"
                        type="number" 
                        name="areaMinima"
                        value={filtrosTemporarios.areaMinima}
                        onChange={handleInputChange}
                        placeholder="Min"
                        className="w-full bg-white border border-gray-200 rounded-lg py-3.5 px-4 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="areaMaxima" className="block text-sm font-medium text-gray-700 mb-2">
                        Área máxima (m²)
                      </label>
                      <input 
                        id="areaMaxima"
                        type="number" 
                        name="areaMaxima"
                        value={filtrosTemporarios.areaMaxima}
                        onChange={handleInputChange}
                        placeholder="Max"
                        className="w-full bg-white border border-gray-200 rounded-lg py-3.5 px-4 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Quartos, Suítes, Banheiros e Vagas */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <label htmlFor="quartos" className="block text-sm font-medium text-gray-800 mb-2">
                      Quartos
                    </label>
                    <select 
                      id="quartos"
                      name="quartos"
                      value={filtrosTemporarios.quartos}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-lg py-3 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {quartosOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="suites" className="block text-sm font-medium text-gray-800 mb-2">
                      Suítes
                    </label>
                    <select 
                      id="suites"
                      name="suites"
                      value={filtrosTemporarios.suites}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-lg py-3 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {suitesOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="banheiros" className="block text-sm font-medium text-gray-800 mb-2">
                      Banheiros
                    </label>
                    <select 
                      id="banheiros"
                      name="banheiros"
                      value={filtrosTemporarios.banheiros}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-lg py-3 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {banheirosOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                </div>
                
                  <div>
                    <label htmlFor="vagas" className="block text-sm font-medium text-gray-800 mb-2">
                      Vagas
                    </label>
                    <select 
                      id="vagas"
                      name="vagas"
                      value={filtrosTemporarios.vagas}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-lg py-3 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {vagasOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  </div>
                  
                {/* Divider */}
                <hr className="my-8 border-gray-200" />
                
                {/* Características do Imóvel */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Características do Imóvel</h3>
                  <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_FEATURE_OPTIONS.map(caract => (
                      <div key={caract}>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = [...filtrosTemporarios.caracteristicasImovel];
                            const index = newValue.indexOf(caract);
                            
                            if (index === -1) {
                              newValue.push(caract);
                            } else {
                              newValue.splice(index, 1);
                            }
                            
                            setFiltrosTemporarios(prev => ({ ...prev, caracteristicasImovel: newValue }));
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                            filtrosTemporarios.caracteristicasImovel.includes(caract) 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {caract}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Características da Localização */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Características da Localização</h3>
                  <div className="grid grid-cols-2 gap-2">
                  {LOCATION_FEATURE_OPTIONS.map(caract => (
                      <div key={caract}>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = [...filtrosTemporarios.caracteristicasLocalizacao];
                            const index = newValue.indexOf(caract);
                            
                            if (index === -1) {
                              newValue.push(caract);
                            } else {
                              newValue.splice(index, 1);
                            }
                            
                            setFiltrosTemporarios(prev => ({ ...prev, caracteristicasLocalizacao: newValue }));
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                            filtrosTemporarios.caracteristicasLocalizacao.includes(caract) 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {caract}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Características do Empreendimento */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Características do Empreendimento</h3>
                  <div className="grid grid-cols-2 gap-2">
                  {BUILDING_FEATURE_OPTIONS.map(caract => (
                      <div key={caract}>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = [...filtrosTemporarios.caracteristicasEmpreendimento];
                            const index = newValue.indexOf(caract);
                            
                            if (index === -1) {
                              newValue.push(caract);
                            } else {
                              newValue.splice(index, 1);
                            }
                            
                            setFiltrosTemporarios(prev => ({ ...prev, caracteristicasEmpreendimento: newValue }));
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                            filtrosTemporarios.caracteristicasEmpreendimento.includes(caract) 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {caract}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Rodapé com botões */}
              <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={resetFiltros} 
                  className="py-3.5 px-6 text-gray-700 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center flex-1 font-medium text-base"
                >
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  Limpar filtros
                </button>
                <button 
                  onClick={aplicarFiltrosAvancados} 
                  className="py-3.5 px-6 bg-primary hover:bg-primary-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center flex-1 font-medium text-base"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
      {/* Barra de ação fixa (mobile) */}
      <div className="md:hidden fixed left-0 right-0 bottom-0 z-40 px-4 pb-4">
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 shadow-[0_-6px_24px_rgba(0,0,0,0.06)] rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={openDrawer}
              className="flex items-center justify-center h-12 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium flex-shrink-0 transition-colors touch-manipulation"
              aria-label="Abrir filtros avançados"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtros
            </button>
            <button
              onClick={buscarImoveis}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md transition-all touch-manipulation"
              aria-label="Buscar imóveis"
            >
              Buscar imóveis
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 
