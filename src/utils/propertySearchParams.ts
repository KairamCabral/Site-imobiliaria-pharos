import {
  CITY_OPTIONS,
  CITY_SLUG_TO_NAME,
} from '@/constants/filterOptions';

const normalizeText = (value: string): string => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeCodeFilter = (value?: string | number): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  return str.toUpperCase();
};

const resolveCityName = (slugOrName: string): string | undefined => {
  if (!slugOrName) return undefined;
  const normalized = normalizeText(slugOrName);
  return CITY_SLUG_TO_NAME[normalized] || CITY_OPTIONS.find(option => normalizeText(option.id) === normalized || normalizeText(option.label) === normalized)?.label;
};

const inferCitiesFromLocationFeatures = (features: string[] = []): Set<string> => {
  const derived = new Set<string>();

  features.forEach((feature) => {
    const normalized = normalizeText(feature);

    if (
      normalized.includes('praia dos amores') ||
      normalized.includes('barra norte') ||
      normalized.includes('barra sul') ||
      normalized.includes('centro') ||
      normalized.includes('pioneiros') ||
      normalized.includes('nacoes')
    ) {
      derived.add('Balneário Camboriú');
    }

    if (
      normalized.includes('frente mar') ||
      normalized.includes('quadra mar') ||
      normalized.includes('segunda quadra') ||
      normalized.includes('terceira quadra') ||
      normalized.includes('avenida brasil') ||
      normalized.includes('avenida atlantica') ||
      normalized.includes('terceira avenida')
    ) {
      derived.add('Balneário Camboriú');
      derived.add('Itajaí');
    }
  });

  return derived;
};

export interface PropertySearchFiltersInput {
  cityNames?: string[];
  citySlugs?: string[];
  neighborhoods?: string[];
  types?: string[];
  status?: string[];
  priceMin?: string | number;
  priceMax?: string | number;
  priceRanges?: string[];
  areaMin?: string | number;
  areaMax?: string | number;
  bedroomsMin?: string;
  suitesMin?: string;
  parkingMin?: string;
  bedroomsExact?: string[];
  bedroomsFourPlus?: boolean;
  suitesExact?: string[];
  suitesFourPlus?: boolean;
  parkingExact?: string[];
  parkingFourPlus?: boolean;
  propertyCode?: string;
  buildingName?: string;
  propertyFeatures?: string[];
  locationFeatures?: string[];
  buildingFeatures?: string[];
  genericFeatures?: string[];
  searchTerm?: string;
  isExclusive?: boolean | string;
}

export interface BuildSearchParamsOptions {
  includeDefaultCity?: boolean;
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    sortBy: string;
    sortOrder: string;
  };
}

export const buildPropertySearchParams = (
  filters: PropertySearchFiltersInput,
  options: BuildSearchParamsOptions = {}
): URLSearchParams => {
  const params = new URLSearchParams();

  const citySet = new Set<string>();

  (filters.cityNames || []).forEach((city) => {
    if (city) citySet.add(city);
  });

  (filters.citySlugs || []).forEach((slug) => {
    const resolved = resolveCityName(slug);
    if (resolved) citySet.add(resolved);
  });

  if (filters.locationFeatures && filters.locationFeatures.length > 0) {
    inferCitiesFromLocationFeatures(filters.locationFeatures).forEach((city) => citySet.add(city));
  }

  if (citySet.size === 0 && (options.includeDefaultCity ?? true)) {
    citySet.add('Balneário Camboriú');
  }

  citySet.forEach((city) => params.append('city', city));

  (filters.neighborhoods || []).forEach((bairro) => {
    // API /api/properties espera "neighborhood" (não "bairro")
    if (bairro) params.append('neighborhood', bairro);
  });

  (filters.types || []).forEach((tipo) => {
    if (tipo) params.append('type', tipo);
  });

  (filters.status || []).forEach((status) => {
    if (status) params.append('status', status);
  });

  let minPrice: number | undefined = undefined;
  let maxPrice: number | undefined = undefined;

  const parseNumber = (value?: string | number): number | undefined => {
    if (value === undefined || value === null) return undefined;
    const num = typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, ''), 10);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  };

  minPrice = parseNumber(filters.priceMin);
  maxPrice = parseNumber(filters.priceMax);

  (filters.priceRanges || []).forEach((range) => {
    const [minStr, maxStr] = String(range).split('-');
    const min = parseNumber(minStr);
    const max = parseNumber(maxStr);

    if (typeof min === 'number') {
      minPrice = typeof minPrice === 'number' ? Math.min(minPrice, min) : min;
    }
    if (typeof max === 'number' && max > 0) {
      maxPrice = typeof maxPrice === 'number' ? Math.max(maxPrice, max) : max;
    }
  });

  if (typeof minPrice === 'number') params.set('minPrice', String(minPrice));
  if (typeof maxPrice === 'number') params.set('maxPrice', String(maxPrice));

  const minArea = parseNumber(filters.areaMin);
  const maxArea = parseNumber(filters.areaMax);

  if (typeof minArea === 'number') params.set('minArea', String(minArea));
  if (typeof maxArea === 'number') params.set('maxArea', String(maxArea));

  if (filters.bedroomsMin) params.set('minBedrooms', filters.bedroomsMin);
  if (filters.suitesMin) params.set('minSuites', filters.suitesMin);
  if (filters.parkingMin) params.set('minParkingSpots', filters.parkingMin);

  (filters.bedroomsExact || []).forEach((value) => {
    if (value) params.append('bedroomsExact', value);
  });
  if (filters.bedroomsFourPlus) params.append('bedroomsFourPlus', '1');

  (filters.suitesExact || []).forEach((value) => {
    if (value) params.append('suitesExact', value);
  });
  if (filters.suitesFourPlus) params.append('suitesFourPlus', '1');

  (filters.parkingExact || []).forEach((value) => {
    if (value) params.append('parkingExact', value);
  });
  if (filters.parkingFourPlus) params.append('parkingFourPlus', '1');

  const normalizedCode = normalizeCodeFilter(filters.propertyCode);
  if (normalizedCode) params.set('codigo', normalizedCode);
  if (filters.buildingName) params.set('empreendimento', filters.buildingName);

  (filters.propertyFeatures || []).forEach((feature) => {
    if (feature) params.append('caracImovel', feature);
  });

  (filters.locationFeatures || []).forEach((feature) => {
    if (feature) params.append('caracLocalizacao', feature);
  });

  (filters.buildingFeatures || []).forEach((feature) => {
    if (feature) params.append('caracEmpreendimento', feature);
  });

  (filters.genericFeatures || []).forEach((feature) => {
    if (feature) params.append('caracImovel', feature);
  });

  if (filters.searchTerm) params.set('search', filters.searchTerm);

  if (typeof filters.isExclusive === 'string') {
    if (filters.isExclusive.trim().length > 0) {
      params.set('isExclusive', filters.isExclusive.trim());
    }
  } else if (filters.isExclusive) {
    params.set('isExclusive', '1');
  }

  if (options.pagination) {
    params.set('page', String(options.pagination.page));
    params.set('limit', String(options.pagination.limit));
  }

  if (options.sort) {
    params.set('sortBy', options.sort.sortBy);
    params.set('sortOrder', options.sort.sortOrder);
  }

  return params;
};


