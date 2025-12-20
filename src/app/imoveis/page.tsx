import type { Metadata } from 'next';
import type { PropertyFilters, Pagination } from '@/domain/models';
import { getCachedPropertyList } from '@/lib/data/propertyQueries';
import ImoveisClient, { type FiltrosState, type OrdenacaoType } from './ImoveisClient';
import { logger } from '@/utils/logger';

export const revalidate = 120;

type PageProps = {
  // Next.js 15: searchParams é sempre Promise em RSC
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DEFAULT_PAGE = 1;
// Otimizado: 200 imóveis iniciais (equilibra performance e UX)
// Com galeria limitada a 3 fotos, 200 imóveis = ~170KB (safe para cache)
// Paginação infinita carrega mais conforme scroll
const DEFAULT_LIMIT = 200;

const CITY_SLUG_TO_NAME: Record<string, string> = {
  'balneario-camboriu': 'Balneário Camboriú',
  'balneário-camboriú': 'Balneário Camboriú',
  'balneario camboriu': 'Balneário Camboriú',
  balneario: 'Balneário Camboriú',
  camboriu: 'Camboriú',
  'camboriú': 'Camboriú',
  itajai: 'Itajaí',
  'itajai-sc': 'Itajaí',
  'itajaí': 'Itajaí',
  itapema: 'Itapema',
};

const NEIGHBORHOOD_SLUG_TO_NAME: Record<string, string> = {
  centro: 'Centro',
  'barra-sul': 'Barra Sul',
  'barra norte': 'Barra Norte',
  'barra-norte': 'Barra Norte',
  pioneiros: 'Pioneiros',
  nacoes: 'Nações',
  'nações': 'Nações',
  'praia-brava': 'Praia Brava',
  fazenda: 'Fazenda',
};

/**
 * generateMetadata para SEO da listagem
 * - Canonical: remove query params se houver múltiplos filtros
 * - Noindex: se resultados < 3 (thin content)
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = searchParams ? await searchParams : {};

  // Contar filtros (excluindo UTMs e page/limit)
  const filterKeys = Object.keys(resolvedParams).filter(
    (key) => !key.startsWith('utm_') && key !== 'page' && key !== 'limit' && key !== 'ordenacao' && key !== 'sort' && key !== 'sortBy' && key !== 'sortOrder'
  );

  const hasMultipleFilters = filterKeys.length > 1;
  const hasSingleFilter = filterKeys.length === 1;

  // Buscar propriedades para verificar quantidade de resultados
  const { filters, pagination } = parseSearchParams(resolvedParams);
  const { properties } = await getCachedPropertyList(filters, pagination);

  const totalResults = properties.length;
  const shouldNoindex = totalResults < 3;

  // Canonical: se múltiplos filtros, canonical para /imoveis
  const canonical = hasMultipleFilters ? 'https://pharos.imob.br/imoveis' : undefined;

  // Título e descrição baseados nos filtros
  let title = 'Imóveis em Balneário Camboriú | Pharos';
  let description = 'Encontre apartamentos, casas e terrenos de alto padrão em Balneário Camboriú.';

  if (hasSingleFilter) {
    const cidade = firstParam(resolvedParams.city || resolvedParams.cidade);
    const bairro = firstParam(resolvedParams.bairro);
    const tipo = firstParam(resolvedParams.type || resolvedParams.tipoImovel);

    if (cidade) {
      const cidadeNome = CITY_SLUG_TO_NAME[cidade.toLowerCase()] || cidade;
      title = `Imóveis em ${cidadeNome} | Pharos`;
      description = `${totalResults} imóveis disponíveis em ${cidadeNome}. Encontre seu imóvel ideal.`;
    } else if (bairro) {
      const bairroNome = NEIGHBORHOOD_SLUG_TO_NAME[bairro.toLowerCase()] || bairro;
      title = `Imóveis no ${bairroNome} | Pharos`;
      description = `${totalResults} imóveis disponíveis no bairro ${bairroNome}, Balneário Camboriú.`;
    } else if (tipo) {
      const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      title = `${tipoCapitalizado} em Balneário Camboriú | Pharos`;
      description = `${totalResults} ${tipo}s disponíveis em Balneário Camboriú e região.`;
    }
  }

  const metadata: Metadata = {
    title,
    description,
  };

  // Canonical
  if (canonical) {
    metadata.alternates = { canonical };
  }

  // Noindex se thin content
  if (shouldNoindex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  return metadata;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function ImoveisPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};

  const { filters, pagination, initialFilters, ordenacao } = parseSearchParams(resolvedParams);
  
  logger.time('getCachedPropertyList');
  const { properties, pagination: resultPagination, cacheLayer, fetchedAt } = await getCachedPropertyList(
    filters,
    pagination,
  );
  logger.timeEnd('getCachedPropertyList');

  // NOTA: properties já vem como Imovel[] (adaptado em propertyQueries.ts)
  // Não precisamos otimizar novamente, apenas passar direto
  
  const effectivePagination = resultPagination ?? {
    page: pagination.page,
    limit: pagination.limit,
    total: properties.length,
    totalPages: Math.ceil(properties.length / pagination.limit),
  };

  return (
    <ImoveisClient
      initialData={properties}
      initialPagination={effectivePagination}
      initialCacheLayer={cacheLayer}
      initialFetchedAt={fetchedAt}
      initialFilters={initialFilters}
      initialOrdenacao={ordenacao}
    />
  );
}

function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): {
  filters: PropertyFilters;
  pagination: Pagination;
  initialFilters: Partial<FiltrosState>;
  ordenacao: OrdenacaoType;
} {
  const filters: PropertyFilters = {};
  const initialFilters: Partial<FiltrosState> = {};

  const citySlugs = toArrayParam(params.city ?? params.localizacao ?? params.cidade);
  if (citySlugs.length > 0) {
    initialFilters.localizacao = citySlugs.map(toSlug);
    const cityNames = citySlugs.map((slug) => CITY_SLUG_TO_NAME[toSlug(slug)] ?? formatTitle(slug));
    filters.city = cityNames.length === 1 ? cityNames[0] : cityNames;
  }

  const neighborhoodSlugs = toArrayParam(params.bairro ?? params.neighborhood);
  if (neighborhoodSlugs.length > 0) {
    initialFilters.bairros = neighborhoodSlugs.map(toSlug);
    const neighborhoods = neighborhoodSlugs.map(
      (slug) => NEIGHBORHOOD_SLUG_TO_NAME[toSlug(slug)] ?? formatTitle(slug),
    );
    filters.neighborhood = neighborhoods.length === 1 ? neighborhoods[0] : neighborhoods;
  }

  const typeValues = toArrayParam(params.type ?? params.tipoImovel).map((value) => value.toLowerCase());
  if (typeValues.length > 0) {
    initialFilters.tipos = typeValues;
    filters.type = typeValues.length === 1 ? (typeValues[0] as PropertyFilters['type']) : (typeValues as any);
  }

  const statusValues = toArrayParam(params.status).map((value) => value.toLowerCase());
  if (statusValues.length > 0) {
    initialFilters.status = statusValues;
    filters.status =
      statusValues.length === 1 ? (statusValues[0] as PropertyFilters['status']) : (statusValues as any);
  }

  const precoMinRaw = firstParam(params.minPrice ?? params.precoMin);
  const precoMaxRaw = firstParam(params.maxPrice ?? params.precoMax);
  if (precoMinRaw) {
    const sanitized = sanitizeNumberString(precoMinRaw);
    if (sanitized) {
      initialFilters.precoMin = sanitized;
      filters.minPrice = Number(sanitized);
    }
  }
  if (precoMaxRaw) {
    const sanitized = sanitizeNumberString(precoMaxRaw);
    if (sanitized) {
      initialFilters.precoMax = sanitized;
      filters.maxPrice = Number(sanitized);
    }
  }

  const areaMinRaw = firstParam(params.minArea ?? params.areaMin);
  const areaMaxRaw = firstParam(params.maxArea ?? params.areaMax);
  if (areaMinRaw) {
    const sanitized = sanitizeNumberString(areaMinRaw);
    if (sanitized) {
      initialFilters.areaMin = sanitized;
      filters.minArea = Number(sanitized);
    }
  }
  if (areaMaxRaw) {
    const sanitized = sanitizeNumberString(areaMaxRaw);
    if (sanitized) {
      initialFilters.areaMax = sanitized;
      filters.maxArea = Number(sanitized);
    }
  }

  const quartosRaw = firstParam(params.quartos ?? params.minBedrooms);
  if (quartosRaw) {
    const sanitized = sanitizeNumberString(quartosRaw);
    if (sanitized) {
      initialFilters.quartos = sanitized;
      filters.minBedrooms = Number(sanitized);
    }
  }

  const suitesRaw = firstParam(params.suites ?? params.minSuites);
  if (suitesRaw) {
    const sanitized = sanitizeNumberString(suitesRaw);
    if (sanitized) {
      initialFilters.suites = sanitized;
      filters.minSuites = Number(sanitized);
    }
  }

  const vagasRaw = firstParam(params.vagas ?? params.minParkingSpots);
  if (vagasRaw) {
    const sanitized = sanitizeNumberString(vagasRaw);
    if (sanitized) {
      initialFilters.vagas = sanitized;
      filters.minParkingSpots = Number(sanitized);
    }
  }

  const codigoImovel = firstParam(params.codigoImovel ?? params.propertyCode);
  if (codigoImovel) {
    initialFilters.codigoImovel = codigoImovel;
    filters.propertyCode = codigoImovel;
  }

  const empreendimento = firstParam(params.empreendimento ?? params.buildingName);
  if (empreendimento) {
    initialFilters.empreendimento = empreendimento;
    filters.buildingName = empreendimento;
  }

  const caracteristicasImovel = toArrayParam(params.caracImovel ?? params.caracteristicasImovel);
  if (caracteristicasImovel.length > 0) {
    initialFilters.caracteristicasImovel = caracteristicasImovel;
    filters.caracteristicasImovel = caracteristicasImovel;
  }

  const caracteristicasLocalizacao = toArrayParam(params.caracLocalizacao ?? params.caracteristicasLocalizacao);
  if (caracteristicasLocalizacao.length > 0) {
    initialFilters.caracteristicasLocalizacao = caracteristicasLocalizacao;
    filters.caracteristicasLocalizacao = caracteristicasLocalizacao;
  }

  const caracteristicasEmpreendimento = toArrayParam(
    params.caracEmpreendimento ?? params.caracteristicasEmpreendimento,
  );
  if (caracteristicasEmpreendimento.length > 0) {
    initialFilters.caracteristicasEmpreendimento = caracteristicasEmpreendimento;
    filters.caracteristicasEmpreendimento = caracteristicasEmpreendimento;
  }

  const isExclusive = parseBooleanParam(params.isExclusive ?? params.exclusivo);
  if (isExclusive !== undefined) {
    initialFilters.apenasExclusivos = isExclusive;
    filters.isExclusive = isExclusive;
  }

  const distanciaMar = firstParam(params.distanciaMar ?? params.distancia_mar);
  if (distanciaMar) {
    filters.distanciaMarRange = distanciaMar as PropertyFilters['distanciaMarRange'];
  }

  const ordenacao = parseOrdenacaoParam(params);
  const sortConfig = mapOrdenacaoToSort(ordenacao);
  if (sortConfig.sortBy) {
    filters.sortBy = sortConfig.sortBy;
  }
  if (sortConfig.sortOrder) {
    filters.sortOrder = sortConfig.sortOrder;
  }

  const page = clampNumber(parseNumberParam(params.page), DEFAULT_PAGE);
  const limit = clampNumber(parseNumberParam(params.limit), DEFAULT_LIMIT);

  const pagination: Pagination = {
    page,
    limit,
  };

  return { filters, pagination, initialFilters, ordenacao };
}

function toArrayParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const collection = Array.isArray(value) ? value : [value];
  return collection
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeNumberString(value: string): string {
  return value.replace(/[^\d]/g, '');
}

function parseNumberParam(value: string | string[] | undefined): number | undefined {
  const raw = firstParam(value);
  if (!raw) return undefined;
  const sanitized = sanitizeNumberString(raw);
  if (!sanitized) return undefined;
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBooleanParam(value: string | string[] | undefined): boolean | undefined {
  const raw = firstParam(value);
  if (!raw) return undefined;
  const normalized = raw.toLowerCase();
  if (['1', 'true', 'sim', 'yes'].includes(normalized)) return true;
  if (['0', 'false', 'nao', 'não', 'no'].includes(normalized)) return false;
  return undefined;
}

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function formatTitle(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function clampNumber(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  // Permite até 1000 itens por página para obter o total real
  return Math.max(1, Math.min(1000, value));
}

function parseOrdenacaoParam(params: Record<string, string | string[] | undefined>): OrdenacaoType {
  const rawOrdenacao = firstParam(params.ordenacao ?? params.sort);
  if (rawOrdenacao && isOrdenacaoType(rawOrdenacao.toLowerCase())) {
    return rawOrdenacao.toLowerCase() as OrdenacaoType;
  }

  const sortBy = firstParam(params.sortBy)?.toLowerCase();
  const sortOrder = firstParam(params.sortOrder)?.toLowerCase();

  if (sortBy === 'price') {
    return sortOrder === 'asc' ? 'preco-asc' : 'preco-desc';
  }

  if (sortBy === 'updatedat' || sortBy === 'updated_at') {
    return 'mais-recentes';
  }

  return 'relevancia';
}

function mapOrdenacaoToSort(
  ordenacao: OrdenacaoType,
): { sortBy?: PropertyFilters['sortBy']; sortOrder?: PropertyFilters['sortOrder'] } {
  switch (ordenacao) {
    case 'preco-asc':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'preco-desc':
      return { sortBy: 'price', sortOrder: 'desc' };
    case 'mais-recentes':
      return { sortBy: 'updatedAt', sortOrder: 'desc' };
    case 'relevancia':
      return { sortBy: 'updatedAt', sortOrder: 'desc' };
    case 'prazo-entrega-asc':
    case 'prazo-entrega-desc':
    case 'distancia-mar-asc':
    case 'distancia-mar-desc':
    default:
      return {};
  }
}

function isOrdenacaoType(value: string): value is OrdenacaoType {
  return [
    'relevancia',
    'preco-asc',
    'preco-desc',
    'distancia-mar-asc',
    'distancia-mar-desc',
    'prazo-entrega-asc',
    'prazo-entrega-desc',
    'mais-recentes',
  ].includes(value);
}


