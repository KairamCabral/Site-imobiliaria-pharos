'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImovelCard from '@/components/ImovelCard';
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Waves, MapPin, Flame, Sofa, DoorOpen, Sparkles, Home, X } from 'lucide-react';

// Hook de debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Interface para o tipo de imóvel
interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  endereco: string;
  cidade: string;
  bairro: string;
  empreendimento?: string;
  preco: number;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  area: number;
  imagens: string[];
  tipoImovel: string;
  status: string;
  destaque?: boolean;
  featured?: boolean;
  caracteristicas?: string[];
  distanciaMar?: number; // em metros
  distancia_mar_m?: number; // em metros (padrão backend)
  entrega_prevista?: string; // ISO date (YYYY-MM-DD)
  updatedAt?: string; // ISO timestamp
  createdAt?: string; // ISO timestamp
  caracImovel?: string[];
  caracLocalizacao?: string[];
  caracEmpreendimento?: string[];
}

// Dados expandidos de imóveis para demonstração
const todosImoveis: Imovel[] = [
  {
    id: 'imovel-01',
    codigo: 'PHR-001',
    titulo: 'Apartamento de Luxo Frente Mar',
    endereco: 'Av. Atlântica, 1500 - Centro, Balneário Camboriú',
    cidade: 'balneario-camboriu',
    bairro: 'centro',
    empreendimento: 'Edifício Atlântico Residence',
    preco: 4500000,
    quartos: 4,
    suites: 3,
    banheiros: 4,
    vagas: 3,
    area: 220,
    imagens: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&q=80'],
    tipoImovel: 'apartamento',
    status: 'pronto',
    destaque: true,
    featured: true,
    distanciaMar: 0,
    distancia_mar_m: 0,
    updatedAt: '2025-01-08T14:30:00Z',
    createdAt: '2024-12-15T10:00:00Z',
    caracImovel: ['Vista para o Mar', 'Mobiliado', 'Sacada'],
    caracLocalizacao: ['Frente Mar', 'Centro', 'Avenida Brasil'],
    caracEmpreendimento: ['Piscina', 'Academia', 'Salão de Festas', 'Rooftop'],
  },
  {
    id: 'imovel-02',
    codigo: 'PHR-002',
    titulo: 'Cobertura Duplex Vista Mar',
    endereco: 'Av. Brasil, 1000 - Centro, Balneário Camboriú',
    cidade: 'balneario-camboriu',
    bairro: 'centro',
    empreendimento: 'Residencial Brasil Premium',
    preco: 3800000,
    quartos: 3,
    suites: 2,
    banheiros: 4,
    vagas: 2,
    area: 280,
    imagens: ['https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&h=600&q=80'],
    tipoImovel: 'cobertura',
    status: 'pronto',
    destaque: true,
    featured: false,
    distanciaMar: 100,
    distancia_mar_m: 100,
    updatedAt: '2025-01-10T09:15:00Z',
    createdAt: '2024-11-20T14:00:00Z',
    caracImovel: ['Vista para o Mar', 'Churrasqueira a gás'],
    caracLocalizacao: ['Quadra Mar', 'Centro', 'Avenida Brasil'],
    caracEmpreendimento: ['Piscina Aquecida', 'Espaço Gourmet', 'Cinema'],
  },
  {
    id: 'imovel-03',
    codigo: 'PHR-003',
    titulo: 'Apartamento 3 Suítes Barra Sul',
    endereco: 'Rua das Palmeiras, 500 - Barra Sul, Balneário Camboriú',
    cidade: 'balneario-camboriu',
    bairro: 'barra-sul',
    empreendimento: 'Green Valley Residence',
    preco: 2900000,
    quartos: 3,
    suites: 3,
    banheiros: 3,
    vagas: 2,
    area: 150,
    imagens: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&q=80'],
    tipoImovel: 'apartamento',
    status: 'construcao',
    destaque: true,
    featured: false,
    distanciaMar: 200,
    distancia_mar_m: 200,
    entrega_prevista: '2026-08-15',
    updatedAt: '2025-01-05T16:45:00Z',
    createdAt: '2024-10-10T11:30:00Z',
    caracImovel: ['Semi Mobiliado', 'Sacada'],
    caracLocalizacao: ['Segunda Quadra', 'Barra Sul'],
    caracEmpreendimento: ['Piscina', 'Playground', 'Quadra de Esportes'],
  },
  {
    id: 'imovel-04',
    codigo: 'PHR-004',
    titulo: 'Lançamento Praia Brava - 4 Suítes',
    endereco: 'Av. Praia Brava, 2000 - Praia Brava, Balneário Camboriú',
    cidade: 'balneario-camboriu',
    bairro: 'praia-brava',
    empreendimento: 'Ocean View Tower',
    preco: 5200000,
    quartos: 4,
    suites: 4,
    banheiros: 5,
    vagas: 4,
    area: 320,
    imagens: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&q=80'],
    tipoImovel: 'apartamento',
    status: 'lancamento',
    destaque: true,
    featured: true,
    distanciaMar: 50,
    distancia_mar_m: 50,
    entrega_prevista: '2026-03-30',
    updatedAt: '2025-01-09T11:20:00Z',
    createdAt: '2024-12-01T09:00:00Z',
    caracImovel: ['Vista para o Mar', 'Churrasqueira a carvão'],
    caracLocalizacao: ['Frente Mar', 'Praia Brava'],
    caracEmpreendimento: ['Rooftop', 'Sauna', 'Sala de Jogos', 'Academia'],
  },
  {
    id: 'imovel-05',
    codigo: 'PHR-005',
    titulo: 'Apartamento 2 Quartos Pioneiros',
    endereco: 'Rua 1500, 240 - Pioneiros, Balneário Camboriú',
    cidade: 'balneario-camboriu',
    bairro: 'pioneiros',
    empreendimento: 'Residencial Pioneiros',
    preco: 980000,
    quartos: 2,
    suites: 1,
    banheiros: 2,
    vagas: 1,
    area: 85,
    imagens: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&q=80'],
    tipoImovel: 'apartamento',
    status: 'pronto',
    featured: false,
    distanciaMar: 800,
    distancia_mar_m: 800,
    updatedAt: '2025-01-03T08:00:00Z',
    createdAt: '2024-09-15T10:00:00Z',
    caracImovel: ['Sacada'],
    caracLocalizacao: ['Pioneiros'],
    caracEmpreendimento: ['Piscina', 'Salão de Festas'],
  },
  {
    id: 'imovel-06',
    codigo: 'PHR-006',
    titulo: 'Cobertura Nações com Piscina Privativa',
    endereco: 'Rua das Nações, 800 - Nações, Balneário Camboriú',
    cidade: 'balneario-camboriu',
    bairro: 'nacoes',
    empreendimento: 'Nações Tower',
    preco: 3200000,
    quartos: 3,
    suites: 2,
    banheiros: 3,
    vagas: 3,
    area: 240,
    imagens: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&q=80'],
    tipoImovel: 'cobertura',
    status: 'pronto',
    featured: false,
    distanciaMar: 400,
    distancia_mar_m: 400,
    updatedAt: '2025-01-07T13:30:00Z',
    createdAt: '2024-08-22T15:00:00Z',
    caracImovel: ['Churrasqueira a gás', 'Vista para o Mar'],
    caracLocalizacao: ['Nações'],
    caracEmpreendimento: ['Piscina Aquecida', 'Academia', 'Espaço Gourmet'],
  },
  {
    id: 'imovel-07',
    codigo: 'PHR-007',
    titulo: 'Apartamento Diferenciado Itajaí Centro',
    endereco: 'Av. Beira Rio, 500 - Centro, Itajaí',
    cidade: 'itajai',
    bairro: 'centro',
    empreendimento: 'Beira Rio Corporate',
    preco: 1200000,
    quartos: 3,
    suites: 1,
    banheiros: 2,
    vagas: 2,
    area: 120,
    imagens: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&q=80'],
    tipoImovel: 'diferenciado',
    status: 'pronto',
    featured: false,
    distanciaMar: 1000,
    distancia_mar_m: 1000,
    updatedAt: '2025-01-02T10:00:00Z',
    createdAt: '2024-07-10T12:00:00Z',
    caracImovel: ['Mobiliado'],
    caracLocalizacao: ['Centro'],
    caracEmpreendimento: ['Academia', 'Salão de Festas'],
  },
  {
    id: 'imovel-08',
    codigo: 'PHR-008',
    titulo: 'Pré-Lançamento Camboriú - 2 Suítes',
    endereco: 'Rua Principal, 100 - Centro, Camboriú',
    cidade: 'camboriu',
    bairro: 'centro',
    empreendimento: 'Camboriú Exclusive',
    preco: 750000,
    quartos: 2,
    suites: 2,
    banheiros: 2,
    vagas: 1,
    area: 90,
    imagens: ['https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&h=600&q=80'],
    tipoImovel: 'apartamento',
    status: 'pre-lancamento',
    featured: false,
    distanciaMar: 600,
    distancia_mar_m: 600,
    entrega_prevista: '2027-12-20',
    updatedAt: '2025-01-06T14:00:00Z',
    createdAt: '2024-12-28T16:00:00Z',
    caracImovel: ['Sacada'],
    caracLocalizacao: ['Centro'],
    caracEmpreendimento: ['Piscina', 'Playground'],
  },
];

// Opções de filtros
const cidadeOptions = [
  { id: 'balneario-camboriu', label: 'Balneário Camboriú' },
  { id: 'itajai', label: 'Itajaí' },
  { id: 'camboriu', label: 'Camboriú' },
];

const bairroOptions = [
  { id: 'centro', label: 'Centro' },
  { id: 'barra-sul', label: 'Barra Sul' },
  { id: 'barra-norte', label: 'Barra Norte' },
  { id: 'pioneiros', label: 'Pioneiros' },
  { id: 'nacoes', label: 'Nações' },
  { id: 'praia-brava', label: 'Praia Brava' },
  { id: 'fazenda', label: 'Fazenda' },
];

const tipoImovelOptions = [
  { id: 'apartamento', label: 'Apartamento' },
  { id: 'cobertura', label: 'Cobertura' },
  { id: 'diferenciado', label: 'Diferenciado' },
  { id: 'duplex', label: 'Duplex' },
  { id: 'studio', label: 'Studio' },
];

const statusOptions = [
  { id: 'pronto', label: 'Pronto' },
  { id: 'lancamento', label: 'Lançamento' },
  { id: 'construcao', label: 'Em construção' },
  { id: 'pre-lancamento', label: 'Pré-lançamento' },
];

const distanciaMarOptions = [
  { id: 'frente-mar', label: 'Frente mar' },
  { id: 'quadra-mar', label: 'Quadra mar (0-100m)' },
  { id: 'segunda-quadra', label: 'Segunda quadra (100-200m)' },
  { id: 'terceira-quadra', label: 'Terceira quadra (200-300m)' },
  { id: 'ate-500m', label: 'Até 500m' },
  { id: 'ate-1km', label: 'Até 1km' },
];

const caracteristicasImovelOptions = [
  'Churrasqueira a gás',
  'Churrasqueira a carvão',
  'Mobiliado',
  'Sacada',
  'Semi Mobiliado',
  'Vista para o Mar',
];

const caracteristicasLocalizacaoOptions = [
  'Avenida Brasil',
  'Barra Norte',
  'Barra Sul',
  'Centro',
  'Frente Mar',
  'Praia Brava',
  'Praia dos Amores',
  'Quadra Mar',
  'Segunda Quadra',
  'Terceira Avenida',
];

const caracteristicasEmpreendimentoOptions = [
  'Academia',
  'Cinema',
  'Espaço Gourmet',
  'Piscina',
  'Piscina Aquecida',
  'Playground',
  'Quadra de Esportes',
  'Quadra de Tênis',
  'Rooftop',
  'Sala de Jogos',
  'Salão de Festas',
  'Sauna',
];

export default function Imoveis() {
const searchParams = useSearchParams()!;
  const router = useRouter();
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>(todosImoveis);
  const [ordenacao, setOrdenacao] = useState('relevancia');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isFilterBarSticky, setIsFilterBarSticky] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [tagsOverflow, setTagsOverflow] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Estados dos filtros locais
  const [filtrosLocais, setFiltrosLocais] = useState({
    termo: '',
    codigo: '',
    empreendimento: '',
    cidades: [] as string[],
    bairros: [] as string[],
    tiposImovel: [] as string[],
    status: [] as string[],
    valorMin: '',
    valorMax: '',
    distanciaMar: [] as string[],
    areaMin: '',
    areaMax: '',
    quartos: '',
    suites: '',
    banheiros: '',
    vagas: '',
    caracImovel: [] as string[],
    caracLocalizacao: [] as string[],
    caracEmpreendimento: [] as string[],
  });

  // Debounce para valores numéricos
  const debouncedValorMin = useDebounce(filtrosLocais.valorMin, 300);
  const debouncedValorMax = useDebounce(filtrosLocais.valorMax, 300);

  // Detecta quando está no client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll Lock quando "Mais Filtros" está aberto
  useEffect(() => {
    if (showMobileFilters) {
      // Bloquear scroll do body
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // iOS Safari fix
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restaurar scroll
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showMobileFilters]);

  // ResizeObserver para detectar overflow nas tags e alternar entre modo distribuído/scroll
  useEffect(() => {
    const container = tagsContainerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      // Verificar se o scroll width é maior que o client width
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setTagsOverflow(hasOverflow);
    };

    // Observer para resize
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(container);

    // Observer para mutations (adição/remoção de tags)
    const mutationObserver = new MutationObserver(checkOverflow);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    // Check inicial
    checkOverflow();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [filtrosLocais]);

  // Função para calcular posição do dropdown
  const getDropdownPosition = (dropdownKey: string) => {
    const buttonElement = dropdownRefs.current[dropdownKey];
    if (!buttonElement) return { top: 0, left: 0 };

    const rect = buttonElement.getBoundingClientRect();
    return {
      top: rect.bottom + 8, // 8px de margem
      left: rect.left,
    };
  };

  // Detecta quando a barra de filtros fica sticky
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFilterBarSticky(!entry.isIntersecting);
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );

    if (filterBarRef.current) {
      observer.observe(filterBarRef.current);
    }

    return () => {
      if (filterBarRef.current) {
        observer.unobserve(filterBarRef.current);
      }
    };
  }, []);

  // Bloqueia scroll do body quando o modal está aberto
  useEffect(() => {
    if (showMobileFilters) {
      // Salvar o scroll atual
      const scrollY = window.scrollY;

      // Bloquear scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restaurar scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showMobileFilters]);

  // Aplicação automática de filtros (com debounce para valores)
  useEffect(() => {
    aplicarFiltrosAutomatico();
  }, [
    filtrosLocais.cidades,
    filtrosLocais.bairros,
    filtrosLocais.tiposImovel,
    filtrosLocais.status,
    filtrosLocais.suites,
    filtrosLocais.vagas,
    filtrosLocais.caracLocalizacao,
    debouncedValorMin,
    debouncedValorMax,
  ]);

  // Sincroniza filtros com URL ao carregar
  useEffect(() => {
    const novosFiltros = {
      termo: searchParams.get('termo') || '',
      codigo: searchParams.get('codigo') || '',
      empreendimento: searchParams.get('empreendimento') || '',
      cidades: searchParams.getAll('cidade'),
      bairros: searchParams.getAll('bairro'),
      tiposImovel: searchParams.getAll('tipoImovel'),
      status: searchParams.getAll('status'),
      valorMin: searchParams.get('valorMin') || '',
      valorMax: searchParams.get('valorMax') || '',
      distanciaMar: searchParams.getAll('distanciaMar'),
      areaMin: searchParams.get('areaMin') || '',
      areaMax: searchParams.get('areaMax') || '',
      quartos: searchParams.get('quartos') || '',
      suites: searchParams.get('suites') || '',
      banheiros: searchParams.get('banheiros') || '',
      vagas: searchParams.get('vagas') || '',
      caracImovel: searchParams.getAll('caracImovel'),
      caracLocalizacao: searchParams.getAll('caracLocalizacao'),
      caracEmpreendimento: searchParams.getAll('caracEmpreendimento'),
    };
    setFiltrosLocais(novosFiltros);
    filtrarImoveis();

    // Aplicar ordenação da URL se existir
    const sortParam = searchParams.get('sort');
    const dirParam = searchParams.get('dir');
    if (sortParam && sortParam !== ordenacao) {
      setOrdenacao(sortParam);
    }
  }, [searchParams]);

  // Aplicar ordenação quando imoveisFiltrados mudar e houver parâmetro de sort na URL
  useEffect(() => {
    const sortParam = searchParams?.get('sort');
    const dirParam = searchParams?.get('dir');

    if (sortParam && imoveisFiltrados.length > 0) {
      let ordenados = [...imoveisFiltrados];

      switch (sortParam) {
        case 'relevance':
          ordenados.sort((a, b) => {
            if (a.featured !== b.featured) {
              return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            }
            const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            if (aUpdated !== bUpdated) {
              return bUpdated - aUpdated;
            }
            const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bCreated - aCreated;
          });
          break;
        case 'sea_distance':
          const seaDir = dirParam || 'asc';
          ordenados.sort((a, b) => {
            const aDistance = a.distancia_mar_m ?? a.distanciaMar ?? 999999;
            const bDistance = b.distancia_mar_m ?? b.distanciaMar ?? 999999;
            return seaDir === 'asc' ? aDistance - bDistance : bDistance - aDistance;
          });
          break;
        case 'delivery':
          const deliveryDir = dirParam || 'asc';
          ordenados.sort((a, b) => {
            const aDelivery = a.entrega_prevista
              ? new Date(a.entrega_prevista).getTime()
              : Infinity;
            const bDelivery = b.entrega_prevista
              ? new Date(b.entrega_prevista).getTime()
              : Infinity;
            return deliveryDir === 'asc' ? aDelivery - bDelivery : bDelivery - aDelivery;
          });
          break;
        case 'preco-asc':
          ordenados.sort((a, b) => a.preco - b.preco);
          break;
        case 'preco-desc':
          ordenados.sort((a, b) => b.preco - a.preco);
          break;
        case 'area-asc':
          ordenados.sort((a, b) => a.area - b.area);
          break;
        case 'area-desc':
          ordenados.sort((a, b) => b.area - a.area);
          break;
      }

      setImoveisFiltrados(ordenados);
    }
  }, [searchParams?.get('sort'), searchParams?.get('dir')]);

  const filtrarImoveis = () => {
    let resultado = [...todosImoveis];

    // Termo de busca
    const termo = searchParams.get('termo');
    if (termo) {
      const termoLower = termo.toLowerCase();
      resultado = resultado.filter(
        (imovel) =>
          imovel.titulo.toLowerCase().includes(termoLower) ||
          imovel.endereco.toLowerCase().includes(termoLower) ||
          imovel.empreendimento?.toLowerCase().includes(termoLower)
      );
    }

    // Código do imóvel
    const codigo = searchParams.get('codigo');
    if (codigo) {
      resultado = resultado.filter((imovel) =>
        imovel.codigo.toLowerCase().includes(codigo.toLowerCase())
      );
    }

    // Empreendimento
    const empreendimento = searchParams.get('empreendimento');
    if (empreendimento) {
      resultado = resultado.filter((imovel) =>
        imovel.empreendimento?.toLowerCase().includes(empreendimento.toLowerCase())
      );
    }

    // Cidades
    const cidades = searchParams.getAll('cidade');
    if (cidades.length > 0) {
      resultado = resultado.filter((imovel) => cidades.includes(imovel.cidade));
    }

    // Bairros
    const bairros = searchParams.getAll('bairro');
    if (bairros.length > 0) {
      resultado = resultado.filter((imovel) => bairros.includes(imovel.bairro));
    }

    // Tipo de Imóvel
    const tiposImovel = searchParams.getAll('tipoImovel');
    if (tiposImovel.length > 0) {
      resultado = resultado.filter((imovel) => tiposImovel.includes(imovel.tipoImovel));
    }

    // Status da Obra
    const statusObra = searchParams.getAll('status');
    if (statusObra.length > 0) {
      resultado = resultado.filter((imovel) => statusObra.includes(imovel.status));
    }

    // Valor Mínimo
    const valorMin = searchParams.get('valorMin');
    if (valorMin) {
      resultado = resultado.filter((imovel) => imovel.preco >= parseInt(valorMin));
    }

    // Valor Máximo
    const valorMax = searchParams.get('valorMax');
    if (valorMax) {
      resultado = resultado.filter((imovel) => imovel.preco <= parseInt(valorMax));
    }

    // Faixas de Valor
    const valores = searchParams.getAll('valor');
    if (valores.length > 0) {
      resultado = resultado.filter((imovel) => {
        return valores.some((faixa) => {
          const [min, max] = faixa.split('-').map((v) => parseInt(v));
          if (max === 0) return imovel.preco >= min;
          return imovel.preco >= min && imovel.preco <= max;
        });
      });
    }

    // Distância do Mar
    const distancias = searchParams.getAll('distanciaMar');
    if (distancias.length > 0 && resultado[0]?.distanciaMar !== undefined) {
      resultado = resultado.filter((imovel) => {
        if (!imovel.distanciaMar) return false;
        return distancias.some((dist) => {
          switch (dist) {
            case 'frente-mar':
              return imovel.distanciaMar !== undefined && imovel.distanciaMar === 0;
            case 'quadra-mar':
              return (
                imovel.distanciaMar !== undefined &&
                imovel.distanciaMar > 0 &&
                imovel.distanciaMar <= 100
              );
            case 'segunda-quadra':
              return (
                imovel.distanciaMar !== undefined &&
                imovel.distanciaMar > 100 &&
                imovel.distanciaMar <= 200
              );
            case 'terceira-quadra':
              return (
                imovel.distanciaMar !== undefined &&
                imovel.distanciaMar > 200 &&
                imovel.distanciaMar <= 300
              );
            case 'ate-500m':
              return imovel.distanciaMar !== undefined && imovel.distanciaMar <= 500;
            case 'ate-1km':
              return imovel.distanciaMar !== undefined && imovel.distanciaMar <= 1000;
            default:
              return true;
          }
        });
      });
    }

    // Área Mínima
    const areaMin = searchParams.get('areaMin');
    if (areaMin) {
      resultado = resultado.filter((imovel) => imovel.area >= parseInt(areaMin));
    }

    // Área Máxima
    const areaMax = searchParams.get('areaMax');
    if (areaMax) {
      resultado = resultado.filter((imovel) => imovel.area <= parseInt(areaMax));
    }

    // Quartos
    const quartos = searchParams.get('quartos');
    if (quartos) {
      resultado = resultado.filter((imovel) => imovel.quartos >= parseInt(quartos));
    }

    // Suítes
    const suites = searchParams.get('suites');
    if (suites) {
      resultado = resultado.filter((imovel) => imovel.suites >= parseInt(suites));
    }

    // Banheiros
    const banheiros = searchParams.get('banheiros');
    if (banheiros) {
      resultado = resultado.filter((imovel) => imovel.banheiros >= parseInt(banheiros));
    }

    // Vagas
    const vagas = searchParams.get('vagas');
    if (vagas) {
      resultado = resultado.filter((imovel) => imovel.vagas >= parseInt(vagas));
    }

    // Características do Imóvel
    const caracImovel = searchParams.getAll('caracImovel');
    if (caracImovel.length > 0) {
      resultado = resultado.filter(
        (imovel) => imovel.caracImovel && caracImovel.every((c) => imovel.caracImovel?.includes(c))
      );
    }

    // Características da Localização
    const caracLocalizacao = searchParams.getAll('caracLocalizacao');
    if (caracLocalizacao.length > 0) {
      resultado = resultado.filter(
        (imovel) =>
          imovel.caracLocalizacao &&
          caracLocalizacao.every((c) => imovel.caracLocalizacao?.includes(c))
      );
    }

    // Características do Empreendimento
    const caracEmpreendimento = searchParams.getAll('caracEmpreendimento');
    if (caracEmpreendimento.length > 0) {
      resultado = resultado.filter(
        (imovel) =>
          imovel.caracEmpreendimento &&
          caracEmpreendimento.every((c) => imovel.caracEmpreendimento?.includes(c))
      );
    }

    setImoveisFiltrados(resultado);
  };

  const ordenarImoveis = (tipo: string, direcao?: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    // Atualizar parâmetros na URL
    params.set('sort', tipo);
    if (direcao) {
      params.set('dir', direcao);
    } else {
      params.delete('dir');
    }

    setOrdenacao(tipo);
    let ordenados = [...imoveisFiltrados];

    switch (tipo) {
      case 'preco-asc':
        ordenados.sort((a, b) => a.preco - b.preco);
        break;
      case 'preco-desc':
        ordenados.sort((a, b) => b.preco - a.preco);
        break;
      case 'area-asc':
        ordenados.sort((a, b) => a.area - b.area);
        break;
      case 'area-desc':
        ordenados.sort((a, b) => b.area - a.area);
        break;
      case 'relevance':
        // Ordenar por: featured desc → updatedAt desc → createdAt desc
        ordenados.sort((a, b) => {
          // 1. Prioridade: featured
          if (a.featured !== b.featured) {
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          }
          // 2. updatedAt
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          if (aUpdated !== bUpdated) {
            return bUpdated - aUpdated;
          }
          // 3. createdAt
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bCreated - aCreated;
        });
        break;
      case 'sea_distance':
        // Ordenar por distância do mar (menor primeiro se asc, maior se desc)
        const seaDir = direcao || 'asc';
        ordenados.sort((a, b) => {
          const aDistance = a.distancia_mar_m ?? a.distanciaMar ?? 999999;
          const bDistance = b.distancia_mar_m ?? b.distanciaMar ?? 999999;
          return seaDir === 'asc' ? aDistance - bDistance : bDistance - aDistance;
        });
        break;
      case 'delivery':
        // Ordenar por prazo de entrega (mais breve primeiro se asc, mais distante se desc)
        const deliveryDir = direcao || 'asc';
        ordenados.sort((a, b) => {
          const aDelivery = a.entrega_prevista ? new Date(a.entrega_prevista).getTime() : Infinity;
          const bDelivery = b.entrega_prevista ? new Date(b.entrega_prevista).getTime() : Infinity;
          return deliveryDir === 'asc' ? aDelivery - bDelivery : bDelivery - aDelivery;
        });
        break;
      case 'relevancia':
      default:
        ordenados.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
        break;
    }

    setImoveisFiltrados(ordenados);

    // Atualizar URL e rolar para o topo
    router.push(`/imoveis?${params.toString()}`, { scroll: false });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Funções de manipulação de filtros
  const toggleArrayFilter = (field: keyof typeof filtrosLocais, value: string) => {
    setFiltrosLocais((prev: typeof filtrosLocais) => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      return { ...prev, [field]: newArray };
    });
  };

  // Aplicação automática de filtros (com scroll suave)
  const aplicarFiltrosAutomatico = useCallback(() => {
    const params = new URLSearchParams();

    if (filtrosLocais.termo) params.append('termo', filtrosLocais.termo);
    if (filtrosLocais.codigo) params.append('codigo', filtrosLocais.codigo);
    if (filtrosLocais.empreendimento) params.append('empreendimento', filtrosLocais.empreendimento);

    filtrosLocais.cidades.forEach((c) => params.append('cidade', c));
    filtrosLocais.bairros.forEach((b) => params.append('bairro', b));
    filtrosLocais.tiposImovel.forEach((t) => params.append('tipoImovel', t));
    filtrosLocais.status.forEach((s) => params.append('status', s));
    filtrosLocais.distanciaMar.forEach((d) => params.append('distanciaMar', d));

    if (debouncedValorMin) params.append('valorMin', debouncedValorMin);
    if (debouncedValorMax) params.append('valorMax', debouncedValorMax);
    if (filtrosLocais.areaMin) params.append('areaMin', filtrosLocais.areaMin);
    if (filtrosLocais.areaMax) params.append('areaMax', filtrosLocais.areaMax);
    if (filtrosLocais.quartos) params.append('quartos', filtrosLocais.quartos);
    if (filtrosLocais.suites) params.append('suites', filtrosLocais.suites);
    if (filtrosLocais.banheiros) params.append('banheiros', filtrosLocais.banheiros);
    if (filtrosLocais.vagas) params.append('vagas', filtrosLocais.vagas);

    filtrosLocais.caracImovel.forEach((c) => params.append('caracImovel', c));
    filtrosLocais.caracLocalizacao.forEach((c) => params.append('caracLocalizacao', c));
    filtrosLocais.caracEmpreendimento.forEach((c) => params.append('caracEmpreendimento', c));

    // Preservar ordenação se existir
    const sortParam = searchParams?.get('sort');
    const dirParam = searchParams?.get('dir');
    if (sortParam) params.append('sort', sortParam);
    if (dirParam) params.append('dir', dirParam);

    router.push(`/imoveis?${params.toString()}`, { scroll: false });

    // Scroll suave para o topo da lista (após a barra de filtros)
    setTimeout(() => {
      const targetElement = document.getElementById('imoveis-grid');
      if (targetElement) {
        const yOffset = -120; // Offset para considerar a barra fixa
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  }, [filtrosLocais, debouncedValorMin, debouncedValorMax, searchParams, router]);

  const aplicarFiltros = () => {
    const params = new URLSearchParams();

    if (filtrosLocais.termo) params.append('termo', filtrosLocais.termo);
    if (filtrosLocais.codigo) params.append('codigo', filtrosLocais.codigo);
    if (filtrosLocais.empreendimento) params.append('empreendimento', filtrosLocais.empreendimento);

    filtrosLocais.cidades.forEach((c) => params.append('cidade', c));
    filtrosLocais.bairros.forEach((b) => params.append('bairro', b));
    filtrosLocais.tiposImovel.forEach((t) => params.append('tipoImovel', t));
    filtrosLocais.status.forEach((s) => params.append('status', s));
    filtrosLocais.distanciaMar.forEach((d) => params.append('distanciaMar', d));

    if (filtrosLocais.valorMin) params.append('valorMin', filtrosLocais.valorMin);
    if (filtrosLocais.valorMax) params.append('valorMax', filtrosLocais.valorMax);
    if (filtrosLocais.areaMin) params.append('areaMin', filtrosLocais.areaMin);
    if (filtrosLocais.areaMax) params.append('areaMax', filtrosLocais.areaMax);
    if (filtrosLocais.quartos) params.append('quartos', filtrosLocais.quartos);
    if (filtrosLocais.suites) params.append('suites', filtrosLocais.suites);
    if (filtrosLocais.banheiros) params.append('banheiros', filtrosLocais.banheiros);
    if (filtrosLocais.vagas) params.append('vagas', filtrosLocais.vagas);

    filtrosLocais.caracImovel.forEach((c) => params.append('caracImovel', c));
    filtrosLocais.caracLocalizacao.forEach((c) => params.append('caracLocalizacao', c));
    filtrosLocais.caracEmpreendimento.forEach((c) => params.append('caracEmpreendimento', c));

    router.push(`/imoveis?${params.toString()}`);
    setShowMobileFilters(false);
  };

  const limparFiltros = () => {
    setFiltrosLocais({
      termo: '',
      codigo: '',
      empreendimento: '',
      cidades: [],
      bairros: [],
      tiposImovel: [],
      status: [],
      valorMin: '',
      valorMax: '',
      distanciaMar: [],
      areaMin: '',
      areaMax: '',
      quartos: '',
      suites: '',
      banheiros: '',
      vagas: '',
      caracImovel: [],
      caracLocalizacao: [],
      caracEmpreendimento: [],
    });
    router.push('/imoveis');
    setShowMobileFilters(false);
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filtrosLocais.termo) count++;
    if (filtrosLocais.codigo) count++;
    if (filtrosLocais.empreendimento) count++;
    count += filtrosLocais.cidades.length;
    count += filtrosLocais.bairros.length;
    count += filtrosLocais.tiposImovel.length;
    count += filtrosLocais.status.length;
    count += filtrosLocais.distanciaMar.length;
    if (filtrosLocais.valorMin) count++;
    if (filtrosLocais.valorMax) count++;
    if (filtrosLocais.areaMin) count++;
    if (filtrosLocais.areaMax) count++;
    if (filtrosLocais.quartos) count++;
    if (filtrosLocais.suites) count++;
    if (filtrosLocais.banheiros) count++;
    if (filtrosLocais.vagas) count++;
    count += filtrosLocais.caracImovel.length;
    count += filtrosLocais.caracLocalizacao.length;
    count += filtrosLocais.caracEmpreendimento.length;
    return count;
  };

  // Contar imóveis por característica (simulado com valores realistas)
  const countImoveisByCaracteristica = (
    tipo: 'distanciaMar' | 'caracImovel' | 'caracEmpreendimento',
    valor: string
  ): number => {
    // Simulação de contadores baseada no mock data
    const counts: { [key: string]: number } = {
      'frente-mar': 258,
      'quadra-mar': 567,
      Churrasqueira: 423,
      Mobiliado: 189,
      Sacada: 712,
      Decorado: 145,
    };
    return counts[valor] || Math.floor(Math.random() * 400) + 100;
  };

  // Componente Dropdown com Portal - UI/UX Avançado Padronizado
  const DropdownPortal = ({
    isOpen,
    dropdownKey,
    children,
    width = 'w-[340px]',
  }: {
    isOpen: boolean;
    dropdownKey: string;
    children: React.ReactNode;
    width?: string;
  }) => {
    if (!isOpen || !isMounted) return null;

    const position = getDropdownPosition(dropdownKey);

    // Converte width classes para pixels para cálculo
    const widthMap: { [key: string]: number } = {
      'w-[340px]': 340,
      'w-80': 320,
      'w-72': 288,
      'w-64': 256,
    };
    const dropdownWidth = widthMap[width] || 340;

    // Ajusta posição se o dropdown sair da tela
    const adjustedLeft = Math.min(position.left, window.innerWidth - dropdownWidth - 16);

    return createPortal(
      <>
        {/* Overlay com backdrop blur */}
        <div
          className="fixed inset-0 z-popover bg-black/5 backdrop-blur-[2px] transition-opacity duration-200"
          onClick={() => setOpenDropdown(null)}
          aria-hidden="true"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        />
        {/* Dropdown com animação de entrada */}
        <div
          className={`fixed ${width} bg-white rounded-2xl shadow-2xl border border-gray-200/80 max-h-[60vh] overflow-hidden`}
          style={{
            zIndex: 'var(--z-popover)',
            top: `${position.top}px`,
            left: `${adjustedLeft}px`,
            animation: 'slideDown 0.2s ease-out',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Scroll container com scroll suave */}
          <div className="overflow-y-auto max-h-[60vh] custom-scrollbar overscroll-contain">
            {children}
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <>
      {/* Top Navigation Bar - Sofisticado */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between py-5">
            <nav className="flex items-center text-sm">
              <Link
                href="/"
                className="text-gray-600 hover:text-primary transition-all font-medium flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Início
              </Link>
              <ChevronDownIcon className="w-4 h-4 mx-3 -rotate-90 text-gray-300" />
              <span className="text-gray-900 font-semibold">Imóveis</span>
            </nav>

            {/* Contador de filtros ativos */}
            {countActiveFilters() > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 font-medium">
                  {countActiveFilters()} filtro{countActiveFilters() !== 1 ? 's' : ''} ativo
                  {countActiveFilters() !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={limparFiltros}
                  className="text-navy hover:text-navy-light font-semibold transition-colors flex items-center gap-1"
                  style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Limpar todos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Placeholder para evitar CLS */}
      <div ref={filterBarRef} style={{ height: '1px' }} aria-hidden="true"></div>

      {/* Filters Bar - Funcional e Sticky - Navy Pharos */}
      <div
        className={`bg-navy shadow-lg sticky top-0 z-sticky-filter transition-all duration-300 border-b border-pharos-gray-100/60 overflow-visible ${
          isFilterBarSticky ? 'shadow-xl' : ''
        }`}
        style={{
          boxShadow: isFilterBarSticky
            ? '0 6px 16px 0 rgba(25, 34, 51, 0.12)'
            : '0 4px 12px 0 rgba(25, 34, 51, 0.08)',
        }}
        role="search"
        aria-label="Filtros de busca"
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          {/* Linha Principal de Filtros */}
          <div
            className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2"
            role="group"
            aria-label="Filtros principais"
          >
            {/* Localização */}
            <div>
              <button
                ref={(el) => {
                  dropdownRefs.current['localizacao'] = el;
                }}
                onClick={() =>
                  setOpenDropdown(openDropdown === 'localizacao' ? null : 'localizacao')
                }
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all relative ${
                  filtrosLocais.cidades.length > 0 || filtrosLocais.bairros.length > 0
                    ? 'bg-navy text-white border border-navy'
                    : 'bg-pharos-gray-50 text-navy border border-pharos-gray-100 hover:border-navy/20 hover:shadow-md'
                }`}
                style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)', minHeight: '40px' }}
              >
                <svg
                  className="w-[18px] h-[18px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                LOCALIZAÇÃO
                {(filtrosLocais.cidades.length > 0 || filtrosLocais.bairros.length > 0) && (
                  <span className="absolute -top-1 -right-1 bg-pharos-gold text-navy text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {filtrosLocais.cidades.length + filtrosLocais.bairros.length}
                  </span>
                )}
                <ChevronDownIcon className="w-[18px] h-[18px]" />
              </button>

              {/* Dropdown Localização com Portal */}
              <DropdownPortal
                isOpen={openDropdown === 'localizacao'}
                dropdownKey="localizacao"
                width="w-72"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="mb-4 pb-3 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 tracking-tight">Localização</h4>
                    <p className="text-xs text-gray-500 mt-1">Selecione cidades e bairros</p>
                  </div>

                  {/* Cidades */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                      Cidades
                    </h5>
                    <div className="space-y-1">
                      {cidadeOptions.map((cidade) => (
                        <label
                          key={cidade.id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-navy/5 rounded-xl cursor-pointer transition-all duration-150 group"
                        >
                          <input
                            type="checkbox"
                            checked={filtrosLocais.cidades.includes(cidade.id)}
                            onChange={() => {
                              toggleArrayFilter('cidades', cidade.id);
                              setTimeout(() => setOpenDropdown(null), 150);
                            }}
                            className="w-4 h-4 text-navy border-gray-300 rounded focus:ring-2 focus:ring-navy/20 focus:ring-offset-0 transition-all"
                          />
                          <span className="text-sm text-gray-700 font-medium group-hover:text-navy transition-colors">
                            {cidade.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

                  {/* Bairros */}
                  <div>
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                      Bairros
                    </h5>
                    <div className="space-y-1">
                      {bairroOptions.map((bairro) => (
                        <label
                          key={bairro.id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-navy/5 rounded-xl cursor-pointer transition-all duration-150 group"
                        >
                          <input
                            type="checkbox"
                            checked={filtrosLocais.bairros.includes(bairro.id)}
                            onChange={() => {
                              toggleArrayFilter('bairros', bairro.id);
                              setTimeout(() => setOpenDropdown(null), 150);
                            }}
                            className="w-4 h-4 text-navy border-gray-300 rounded focus:ring-2 focus:ring-navy/20 focus:ring-offset-0 transition-all"
                          />
                          <span className="text-sm text-gray-700 font-medium group-hover:text-navy transition-colors">
                            {bairro.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownPortal>
            </div>

            {/* Tipo do Imóvel */}
            <div>
              <button
                ref={(el) => {
                  dropdownRefs.current['tipo'] = el;
                }}
                onClick={() => setOpenDropdown(openDropdown === 'tipo' ? null : 'tipo')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all relative ${
                  filtrosLocais.tiposImovel.length > 0
                    ? 'bg-navy text-white border border-navy'
                    : 'bg-pharos-gray-50 text-navy border border-pharos-gray-100 hover:border-navy/20 hover:shadow-md'
                }`}
                style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)', minHeight: '40px' }}
              >
                <svg
                  className="w-[18px] h-[18px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                TIPO DE IMÓVEL
                {filtrosLocais.tiposImovel.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pharos-gold text-navy text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {filtrosLocais.tiposImovel.length}
                  </span>
                )}
                <ChevronDownIcon className="w-[18px] h-[18px]" />
              </button>

              {/* Dropdown Tipo com Portal */}
              <DropdownPortal isOpen={openDropdown === 'tipo'} dropdownKey="tipo" width="w-[340px]">
                <div className="p-5">
                  {/* Header */}
                  <div className="mb-4 pb-3 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                      Tipo do Imóvel
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Selecione um ou mais tipos</p>
                  </div>

                  {/* Lista de tipos */}
                  <div className="space-y-1">
                    {tipoImovelOptions.map((tipo) => (
                      <label
                        key={tipo.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-navy/5 rounded-xl cursor-pointer transition-all duration-150 group"
                      >
                        <input
                          type="checkbox"
                          checked={filtrosLocais.tiposImovel.includes(tipo.id)}
                          onChange={() => {
                            toggleArrayFilter('tiposImovel', tipo.id);
                            setTimeout(() => setOpenDropdown(null), 150);
                          }}
                          className="w-4 h-4 text-navy border-gray-300 rounded focus:ring-2 focus:ring-navy/20 focus:ring-offset-0 transition-all"
                        />
                        <span className="text-sm text-gray-700 font-medium group-hover:text-navy transition-colors">
                          {tipo.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </DropdownPortal>
            </div>

            {/* Venda */}
            <div>
              <button
                ref={(el) => {
                  dropdownRefs.current['venda'] = el;
                }}
                onClick={() => setOpenDropdown(openDropdown === 'venda' ? null : 'venda')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all relative ${
                  filtrosLocais.valorMin || filtrosLocais.valorMax
                    ? 'bg-navy text-white border border-navy'
                    : 'bg-pharos-gray-50 text-navy border border-pharos-gray-100 hover:border-navy/20 hover:shadow-md'
                }`}
                style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                VENDA
                {(filtrosLocais.valorMin || filtrosLocais.valorMax) && (
                  <span className="absolute -top-1 -right-1 bg-pharos-gold text-navy text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    1
                  </span>
                )}
                <ChevronDownIcon className="w-[18px] h-[18px]" />
              </button>

              {/* Dropdown Venda com Portal */}
              <DropdownPortal
                isOpen={openDropdown === 'venda'}
                dropdownKey="venda"
                width="w-[340px]"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="mb-4 pb-3 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                      Faixa de Preço
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Defina o valor mínimo e máximo</p>
                  </div>

                  {/* Grid de inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Mínimo
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                          R$
                        </span>
                        <input
                          type="text"
                          value={filtrosLocais.valorMin}
                          onChange={(e) =>
                            setFiltrosLocais((prev: typeof filtrosLocais) => ({
                              ...prev,
                              valorMin: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Máximo
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                          R$
                        </span>
                        <input
                          type="text"
                          value={filtrosLocais.valorMax}
                          onChange={(e) =>
                            setFiltrosLocais((prev: typeof filtrosLocais) => ({
                              ...prev,
                              valorMax: e.target.value,
                            }))
                          }
                          placeholder="999.999.999"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Valores rápidos */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                      Atalhos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['500k', '1M', '2M', '5M', '10M'].map((valor) => (
                        <button
                          key={valor}
                          onClick={() => {
                            const valorNumerico =
                              valor === '500k'
                                ? '500000'
                                : valor.replace('M', '000000').replace('k', '000');
                            setFiltrosLocais((prev: typeof filtrosLocais) => ({
                              ...prev,
                              valorMax: valorNumerico,
                            }));
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-navy/10 hover:text-navy rounded-lg transition-all"
                        >
                          até R$ {valor}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownPortal>
            </div>

            {/* Status */}
            <div>
              <button
                ref={(el) => {
                  dropdownRefs.current['status'] = el;
                }}
                onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all relative ${
                  filtrosLocais.status.length > 0
                    ? 'bg-navy text-white border border-navy'
                    : 'bg-pharos-gray-50 text-navy border border-pharos-gray-100 hover:border-navy/20 hover:shadow-md'
                }`}
                style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                STATUS
                {filtrosLocais.status.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pharos-gold text-navy text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {filtrosLocais.status.length}
                  </span>
                )}
                <ChevronDownIcon className="w-[18px] h-[18px]" />
              </button>

              {/* Dropdown Status com Portal */}
              <DropdownPortal
                isOpen={openDropdown === 'status'}
                dropdownKey="status"
                width="w-[340px]"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="mb-4 pb-3 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                      Status da Obra
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Escolha o status desejado</p>
                  </div>

                  {/* Lista de status */}
                  <div className="space-y-1">
                    {statusOptions.map((status) => (
                      <label
                        key={status.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-navy/5 rounded-xl cursor-pointer transition-all duration-150 group"
                      >
                        <input
                          type="checkbox"
                          checked={filtrosLocais.status.includes(status.id)}
                          onChange={() => {
                            toggleArrayFilter('status', status.id);
                            setTimeout(() => setOpenDropdown(null), 150);
                          }}
                          className="w-4 h-4 text-navy border-gray-300 rounded focus:ring-2 focus:ring-navy/20 focus:ring-offset-0 transition-all"
                        />
                        <span className="text-sm text-gray-700 font-medium group-hover:text-navy transition-colors">
                          {status.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </DropdownPortal>
            </div>

            {/* Contadores Rápidos - Suítes e Vagas */}
            <div className="flex items-center gap-2">
              {/* Suítes */}
              <div className="flex items-center gap-1.5 bg-white/95 hover:bg-white px-3 py-2 rounded-full shadow-md transition-all">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Suítes</span>
                <div className="flex items-center gap-0.5">
                  {['1', '2', '3', '4+'].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setFiltrosLocais((prev: typeof filtrosLocais) => ({
                          ...prev,
                          suites: prev.suites === num ? '' : num,
                        }));
                      }}
                      className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                        filtrosLocais.suites === num
                          ? 'bg-navy text-white shadow-md'
                          : 'bg-pharos-gray-50 hover:bg-pharos-gray-100 text-navy'
                      }`}
                      style={{
                        transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
                        minWidth: '24px',
                        minHeight: '24px',
                      }}
                      aria-label={`${num} suítes`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vagas */}
              <div className="flex items-center gap-1.5 bg-white/95 hover:bg-white px-3 py-2 rounded-full shadow-md transition-all">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Vagas</span>
                <div className="flex items-center gap-0.5">
                  {['1', '2', '3', '4+'].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setFiltrosLocais((prev: typeof filtrosLocais) => ({
                          ...prev,
                          vagas: prev.vagas === num ? '' : num,
                        }));
                      }}
                      className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                        filtrosLocais.vagas === num
                          ? 'bg-navy text-white shadow-md'
                          : 'bg-pharos-gray-50 hover:bg-pharos-gray-100 text-navy'
                      }`}
                      style={{
                        transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
                        minWidth: '24px',
                        minHeight: '24px',
                      }}
                      aria-label={`${num} vagas`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Limpar Filtros - Destaque com Borda Dourada */}
              {countActiveFilters() > 0 && (
                <button
                  onClick={limparFiltros}
                  className="flex items-center gap-2 bg-white hover:bg-pharos-gray-50 text-navy px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 border-pharos-gold hover:shadow-md"
                  aria-label="Limpar todos os filtros"
                  style={{ minHeight: '40px', transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  <X className="w-[18px] h-[18px] stroke-[2]" />
                  <span className="hidden sm:inline">Limpar Filtros</span>
                  <span className="sm:hidden">Limpar</span>
                </button>
              )}

              {/* Mais Filtros */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 bg-white/95 hover:bg-white text-navy px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-pharos-gray-100 hover:border-navy/30 hover:shadow-md"
                aria-label="Abrir mais filtros"
                style={{ minHeight: '40px', transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <FunnelIcon className="w-[18px] h-[18px]" />
                <span className="hidden sm:inline">Mais Filtros</span>
                <span className="sm:hidden">Filtros</span>
              </button>
            </div>
          </div>

          {/* Linha de Atalhos Rápidos - Características */}
          <div className="relative pt-3 border-t border-white/10">
            <div
              ref={tagsContainerRef}
              className="flex items-center gap-3 scrollbar-hide scroll-smooth px-5"
              role="region"
              aria-label="Atalhos de filtros"
              style={{
                flexWrap: 'nowrap',
                overflowX: tagsOverflow ? 'auto' : 'hidden',
                overflowY: 'hidden',
                justifyContent: tagsOverflow ? 'flex-start' : 'space-between',
                overscrollBehaviorX: 'contain',
                WebkitOverflowScrolling: 'touch',
                scrollbarGutter: 'stable both-edges',
                minHeight: '44px',
                ...(tagsOverflow && {
                  maskImage:
                    'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
                }),
              }}
            >
              {[
                { id: 'frente-mar', label: 'Frente Mar', icon: Waves, field: 'distanciaMar' },
                { id: 'quadra-mar', label: 'Quadra Mar', icon: Waves, field: 'distanciaMar' },
                {
                  id: 'Churrasqueira',
                  label: 'Churrasqueira',
                  icon: Flame,
                  field: 'caracEmpreendimento',
                },
                { id: 'Mobiliado', label: 'Mobiliado', icon: Sofa, field: 'caracImovel' },
                { id: 'Sacada', label: 'Sacada', icon: DoorOpen, field: 'caracImovel' },
                { id: 'Decorado', label: 'Decorado', icon: Sparkles, field: 'caracImovel' },
                { id: 'Centro', label: 'Centro', icon: MapPin, field: 'caracLocalizacao' },
                { id: 'Barra Sul', label: 'Barra Sul', icon: MapPin, field: 'caracLocalizacao' },
                {
                  id: 'Praia Brava',
                  label: 'Praia Brava',
                  icon: MapPin,
                  field: 'caracLocalizacao',
                },
              ].map((carac) => {
                const isActive = filtrosLocais[
                  carac.field as keyof typeof filtrosLocais
                ]?.includes?.(carac.id);
                const Icon = carac.icon;
                return (
                  <button
                    key={carac.id}
                    onClick={() => {
                      toggleArrayFilter(carac.field as keyof typeof filtrosLocais, carac.id);
                      // Rolar para o topo da lista suavemente após filtrar
                      setTimeout(() => {
                        window.scrollTo({
                          top: filterBarRef.current?.offsetTop || 0,
                          behavior: 'smooth',
                        });
                      }, 100);
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-white text-navy border-white shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
                    }`}
                    style={{
                      transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: '40px',
                      flex: tagsOverflow ? '0 0 auto' : '1 1 0',
                      minWidth: tagsOverflow ? 'auto' : '140px',
                      maxWidth: tagsOverflow ? '240px' : '280px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                    aria-pressed={isActive}
                    aria-label={`Filtrar por ${carac.label}`}
                  >
                    <Icon className="w-[18px] h-[18px] stroke-[1.5]" />
                    <span>{carac.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tags de Filtros Ativos */}
      {(filtrosLocais.caracImovel.length > 0 ||
        filtrosLocais.caracEmpreendimento.length > 0 ||
        filtrosLocais.distanciaMar.length > 0) && (
        <div className="bg-white border-b border-gray-200">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
            <div className="flex items-center gap-2 flex-wrap">
              {filtrosLocais.distanciaMar.map((dist) => (
                <button
                  key={dist}
                  onClick={() => toggleArrayFilter('distanciaMar', dist)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-full text-xs font-semibold transition-all hover:bg-navy-light"
                  style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  {dist === 'frente-mar'
                    ? 'Frente Mar'
                    : dist === 'quadra-mar'
                      ? 'Quadra Mar'
                      : dist}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ))}
              {filtrosLocais.caracImovel.map((carac) => (
                <button
                  key={carac}
                  onClick={() => toggleArrayFilter('caracImovel', carac)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-full text-xs font-semibold transition-all hover:bg-navy-light"
                  style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  {carac}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ))}
              {filtrosLocais.caracEmpreendimento.map((carac) => (
                <button
                  key={carac}
                  onClick={() => toggleArrayFilter('caracEmpreendimento', carac)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-full text-xs font-semibold transition-all hover:bg-navy-light"
                  style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  {carac}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Header com contador e ordenação */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-navy leading-tight">
              {imoveisFiltrados.length > 0 ? (
                <>
                  {imoveisFiltrados.length}{' '}
                  <span className="font-normal">
                    {imoveisFiltrados.length === 1 ? 'imóvel' : 'imóveis'}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">Nenhum imóvel encontrado</span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="ordenar"
                className="text-sm text-gray-600 whitespace-nowrap"
                aria-label="Ordenar por"
              >
                Ordenar por:
              </label>
              <div className="relative">
                <select
                  id="ordenar"
                  value={ordenacao}
                  onChange={(e) => {
                    const value = e.target.value;
                    const currentDir = searchParams?.get('dir') || 'asc';

                    // Se for um tipo com direção (sea_distance ou delivery), preservar ou usar padrão
                    if (value === 'sea_distance' || value === 'delivery') {
                      ordenarImoveis(value, currentDir);
                    } else {
                      ordenarImoveis(value);
                    }
                  }}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white font-medium appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                  style={{ minHeight: '44px' }}
                  aria-live="polite"
                >
                  <option value="relevancia">Nenhuma</option>
                  <option value="relevance">Relevância (Últimos Atualizados)</option>
                  <option value="preco-asc">Menor Preço</option>
                  <option value="preco-desc">Maior Preço</option>
                  <option value="sea_distance">
                    {searchParams?.get('sort') === 'sea_distance' &&
                    searchParams?.get('dir') === 'desc'
                      ? 'Mais Distante do Mar ⇅'
                      : 'Mais Próximo do Mar ⇅'}
                  </option>
                  {imoveisFiltrados.some((i) => i.entrega_prevista) && (
                    <option value="delivery">
                      {searchParams?.get('sort') === 'delivery' &&
                      searchParams?.get('dir') === 'desc'
                        ? 'Prazo de Entrega (Maior) ⇅'
                        : 'Prazo de Entrega (Menor) ⇅'}
                    </option>
                  )}
                  <option value="area-asc">Menor Área</option>
                  <option value="area-desc">Maior Área</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Botão para alternar direção (apenas para sea_distance e delivery) */}
              {(ordenacao === 'sea_distance' || ordenacao === 'delivery') && (
                <button
                  onClick={() => {
                    const currentDir = searchParams?.get('dir') || 'asc';
                    const newDir = currentDir === 'asc' ? 'desc' : 'asc';
                    ordenarImoveis(ordenacao, newDir);
                  }}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                  aria-label={`Inverter ordenação: ${searchParams?.get('dir') === 'asc' ? 'Crescente para Decrescente' : 'Decrescente para Crescente'}`}
                  title="Inverter ordenação"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {searchParams?.get('dir') === 'desc' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid de Imóveis */}
        {imoveisFiltrados.length > 0 ? (
          <div
            id="imoveis-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8"
          >
            {imoveisFiltrados.map((imovel) => (
              <ImovelCard
                key={imovel.id}
                id={imovel.id}
                titulo={imovel.titulo}
                endereco={imovel.endereco}
                preco={imovel.preco}
                quartos={imovel.quartos}
                banheiros={imovel.banheiros}
                area={imovel.area}
                imagens={imovel.imagens}
                tipoImovel={imovel.tipoImovel}
                destaque={imovel.destaque}
                vagas={imovel.vagas}
                distanciaMar={imovel.distanciaMar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhum imóvel encontrado</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Tente ajustar os filtros para ver mais resultados
            </p>
            <button
              onClick={limparFiltros}
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl font-medium"
              style={{ transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Sheet Modal - Mais Filtros */}
      {showMobileFilters && (
        <>
          {/* Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-sheet backdrop-animate"
            onClick={() => setShowMobileFilters(false)}
            aria-hidden="true"
            style={{ zIndex: 'var(--z-sheet)' }}
          />

          {/* Sheet Container */}
          <div
            className="sheet-modal-container fixed sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:max-w-lg bg-white shadow-2xl sheet-animate-mobile sm:sheet-animate-desktop sm:rounded-none overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-sheet-title"
            style={{
              zIndex: 'calc(var(--z-sheet) + 1)',
              top: 0,
              bottom: 0,
              height: '100dvh',
              minHeight: '100vh',
              maxHeight: '100dvh',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowMobileFilters(false);
            }}
          >
            {/* Grid Layout de 3 linhas: Header, Content, Action Bar */}
            <div className="h-full grid grid-rows-[auto_1fr_auto] overflow-hidden">
              {/* Header Fixo */}
              <div className="flex-shrink-0 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 safe-top">
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      id="filter-sheet-title"
                      className="text-lg sm:text-xl font-bold text-gray-900"
                    >
                      Filtros
                    </h2>
                    {countActiveFilters() > 0 && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {countActiveFilters()}{' '}
                        {countActiveFilters() === 1 ? 'filtro ativo' : 'filtros ativos'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Fechar filtros"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content Rolável Único - Row 2 */}
              <div className="sheet-modal-content overflow-y-auto overscroll-contain px-5 sm:px-6 py-6">
                <FiltersSidebarContent
                  filtrosLocais={filtrosLocais}
                  setFiltrosLocais={setFiltrosLocais}
                  toggleArrayFilter={toggleArrayFilter}
                  cidadeOptions={cidadeOptions}
                  bairroOptions={bairroOptions}
                  tipoImovelOptions={tipoImovelOptions}
                  statusOptions={statusOptions}
                  distanciaMarOptions={distanciaMarOptions}
                />
              </div>

              {/* Action Bar Fixa no Rodapé - Row 3 */}
              <div className="sheet-modal-action-bar border-t border-gray-100 bg-white px-5 sm:px-6 pt-4">
                <div className="space-y-3">
                  {/* Botão Primário */}
                  <button
                    onClick={() => {
                      aplicarFiltros();
                      setShowMobileFilters(false);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl text-base flex items-center justify-center gap-2 active:scale-[0.98]"
                    style={{ minHeight: '48px' }}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    {imoveisFiltrados.length > 0
                      ? `Ver ${imoveisFiltrados.length} ${imoveisFiltrados.length === 1 ? 'imóvel' : 'imóveis'}`
                      : 'Buscar imóveis'}
                  </button>

                  {/* Botão Secundário */}
                  <button
                    onClick={() => {
                      limparFiltros();
                    }}
                    className="w-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-all text-base flex items-center justify-center gap-2 active:scale-[0.98]"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Limpar tudo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Componente de conteúdo de filtros
function FiltersSidebarContent({
  filtrosLocais,
  setFiltrosLocais,
  toggleArrayFilter,
  cidadeOptions,
  bairroOptions,
  tipoImovelOptions,
  statusOptions,
  distanciaMarOptions,
}: {
  filtrosLocais: any;
  setFiltrosLocais: any;
  toggleArrayFilter: any;
  cidadeOptions: any[];
  bairroOptions: any[];
  tipoImovelOptions: any[];
  statusOptions: any[];
  distanciaMarOptions: any[];
}) {
  return (
    <div className="space-y-6">
      {/* Busca Rápida */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2.5">Busca Rápida</label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filtrosLocais.termo}
            onChange={(e) =>
              setFiltrosLocais((prev: typeof filtrosLocais) => ({ ...prev, termo: e.target.value }))
            }
            placeholder="Buscar por cidade, bairro..."
            className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Código do Imóvel */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2.5">Código do Imóvel</label>
        <input
          type="text"
          value={filtrosLocais.codigo}
          onChange={(e) =>
            setFiltrosLocais((prev: typeof filtrosLocais) => ({ ...prev, codigo: e.target.value }))
          }
          placeholder="Ex: PHR-001"
          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      <div className="border-t border-gray-200 pt-5 -mx-6 px-6">
        {/* Cidade */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-900 mb-3">Cidade</label>
          <div className="flex flex-wrap gap-2.5">
            {cidadeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleArrayFilter('cidades', opt.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filtrosLocais.cidades.includes(opt.id)
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Bairro</label>
          <div className="flex flex-wrap gap-2.5">
            {bairroOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleArrayFilter('bairros', opt.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filtrosLocais.bairros.includes(opt.id)
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5 -mx-6 px-6">
        {/* Tipo de Imóvel */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-900 mb-3">Tipo de Imóvel</label>
          <div className="flex flex-wrap gap-2.5">
            {tipoImovelOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleArrayFilter('tiposImovel', opt.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filtrosLocais.tiposImovel.includes(opt.id)
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status da Obra */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Status da Obra</label>
          <div className="flex flex-wrap gap-2.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleArrayFilter('status', opt.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filtrosLocais.status.includes(opt.id)
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5 -mx-6 px-6">
        {/* Valor */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-900 mb-3">Valor de Venda</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-2">Mínimo</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  value={filtrosLocais.valorMin}
                  onChange={(e) =>
                    setFiltrosLocais((prev: typeof filtrosLocais) => ({
                      ...prev,
                      valorMin: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">Máximo</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  value={filtrosLocais.valorMax}
                  onChange={(e) =>
                    setFiltrosLocais((prev: typeof filtrosLocais) => ({
                      ...prev,
                      valorMax: e.target.value,
                    }))
                  }
                  placeholder="9999999"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Área (m²)</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-2">Mínima</label>
              <input
                type="number"
                value={filtrosLocais.areaMin}
                onChange={(e) =>
                  setFiltrosLocais((prev: typeof filtrosLocais) => ({
                    ...prev,
                    areaMin: e.target.value,
                  }))
                }
                placeholder="0"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">Máxima</label>
              <input
                type="number"
                value={filtrosLocais.areaMax}
                onChange={(e) =>
                  setFiltrosLocais((prev: typeof filtrosLocais) => ({
                    ...prev,
                    areaMax: e.target.value,
                  }))
                }
                placeholder="999"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5 -mx-6 px-6">
        {/* Quartos, Suítes, Banheiros, Vagas */}
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Características do Imóvel
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Quartos</label>
            <select
              value={filtrosLocais.quartos}
              onChange={(e) =>
                setFiltrosLocais((prev: typeof filtrosLocais) => ({
                  ...prev,
                  quartos: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-2">Suítes</label>
            <select
              value={filtrosLocais.suites}
              onChange={(e) =>
                setFiltrosLocais((prev: typeof filtrosLocais) => ({
                  ...prev,
                  suites: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-2">Banheiros</label>
            <select
              value={filtrosLocais.banheiros}
              onChange={(e) =>
                setFiltrosLocais((prev: typeof filtrosLocais) => ({
                  ...prev,
                  banheiros: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-2">Vagas</label>
            <select
              value={filtrosLocais.vagas}
              onChange={(e) =>
                setFiltrosLocais((prev: typeof filtrosLocais) => ({
                  ...prev,
                  vagas: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5 -mx-6 px-6">
        {/* Distância do Mar */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Distância do Mar</label>
          <div className="space-y-2">
            {distanciaMarOptions.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center hover:bg-gray-50 px-3 py-2 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filtrosLocais.distanciaMar.includes(opt.id)}
                  onChange={() => toggleArrayFilter('distanciaMar', opt.id)}
                  className="h-4 w-4 text-navy rounded border-gray-300 focus:ring-navy/20 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
