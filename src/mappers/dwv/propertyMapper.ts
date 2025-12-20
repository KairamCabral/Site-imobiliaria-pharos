import type { Property, PropertyFeatures, PropertyPricing, PropertySpecs, Photo } from '@/domain/models';
import type { DwvProperty, DwvAddress, DwvMediaItem } from '@/providers/dwv/types';

const TYPE_MAP: Record<string, Property['type']> = {
  apartment: 'apartamento',
  apartamentos: 'apartamento',
  cobertura: 'cobertura',
  penthouse: 'cobertura',
  house: 'casa',
  casa: 'casa',
  land: 'terreno',
  terreno: 'terreno',
  commercialroom: 'comercial',
  commercial: 'comercial',
  sala: 'sala',
  loja: 'loja',
  duplex: 'diferenciado',
  differentiated: 'diferenciado',
  garden: 'diferenciado',
  warehouse: 'galpao',
  smallfarm: 'chacara',
};

const STATUS_MAP: Record<string, Property['status']> = {
  active: 'disponivel',
  inactive: 'inativo',
  auto_inactive: 'vendido',
};

const OBRA_MAP: Record<string, Property['obraStatus']> = {
  'pre-market': 'pre-lancamento',
  'under construction': 'construcao',
  new: 'lancamento',
  // used: 'pronto', // ❌ Removido: imóveis usados não devem aparecer em filtro de "pronto para morar"
  // Imóveis usados ficarão com obraStatus undefined, sendo filtrados quando necessário
};

export function mapDwvToProperty(raw: DwvProperty): Property {
  const address = extractAddress(raw);
  const specs = extractSpecs(raw);
  const pricing = extractPricing(raw);
  const photos = extractPhotos(raw);
  const apartmentFeatureTags = collectFeatureTags(raw, 'apartment');
  const buildingFeatureTags = collectFeatureTags(raw, 'building');
  const features = extractFeatures(raw);

  // Código único: P + ID interno do DWV (ex: P587200)
  const code = `P${raw.id}`;
  
  // ID unificado: usar código
  const id = code;
  
  const title = raw.title || raw.headline || `Imóvel ${code}`;
  const type = resolveType(raw);

  // Slug SEO-friendly: codigo-titulo-bairro (ex: 1202-boreal-tower-centro)
  const slug = generateSlug(code, title, address.neighborhood);

  const updatedAt = safeDate(raw.last_updated_at) ?? new Date();

  return {
    id,
    code,
    title,
    description: raw.description ?? raw.headline ?? '',
    descriptionFull: raw.description,
    type,
    status: STATUS_MAP[raw.status || ''] || 'disponivel',
    purpose: raw.rent ? 'aluguel' : 'venda',
    obraStatus: OBRA_MAP[raw.construction_stage_raw || ''],
    address,
    buildingName: raw.building?.title,
    builderName: raw.construction_company?.title,
    distanciaMar: undefined,
    pricing,
    specs,
    features,
    caracteristicasImovel: apartmentFeatureTags,
    caracteristicasLocalizacao: buildingFeatureTags,
    caracteristicasEmpreendimento: buildingFeatureTags,
    photos,
    photosSource: 'dwv',
    galleryMissing: photos.length === 0,
    videos: collectVideoLinks(raw),
    virtualTour: raw.unit?.tour_360 || raw.building?.tour_360,
    realtor: undefined,
    agency: undefined,
    createdAt: updatedAt,
    updatedAt,
    publishedAt: safeDate(raw.building?.delivery_date),
    slug,
    metaTitle: raw.headline,
    metaDescription: raw.description,
    keywords: [],
    showOnWebsite: !raw.deleted,
    isExclusive: undefined,
    superHighlight: undefined,
    hasSignboard: undefined,
    webHighlight: undefined,
    isHighlight: undefined,
    isLaunch: raw.construction_stage === 'Lançamento',
    providerData: {
      provider: 'dwv',
      originalId: String(raw.id ?? ''),
      raw,
    },
  };
}

function resolveType(raw: DwvProperty): Property['type'] {
  const candidates: (string | undefined)[] = [
    raw.unit?.floor_plan?.category?.tag,
    raw.unit?.floor_plan?.category?.title,
    raw.unit?.type,
    raw.third_party_property?.type,
  ];
  const resolved = candidates
    .filter(Boolean)
    .map(value => value!.toString().toLowerCase().replace(/\s/g, ''));

  for (const cand of resolved) {
    const mapped = TYPE_MAP[cand];
    if (mapped) {
      return mapped;
    }
  }

  return 'diferenciado';
}

function extractAddress(raw: DwvProperty): Property['address'] {
  const source = raw.building?.address
    ?? raw.third_party_property?.address
    ?? (raw as { address?: DwvAddress }).address;

  return {
    street: source?.street_name,
    number: source?.street_number,
    complement: source?.complement,
    neighborhood: source?.neighborhood,
    city: source?.city || 'Não informado',
    state: source?.state || '',
    zipCode: source?.zip_code,
    coordinates: source?.latitude && source?.longitude
      ? { lat: source.latitude, lng: source.longitude }
      : undefined,
  };
}

function extractSpecs(raw: DwvProperty): PropertySpecs {
  const unit = raw.unit;
  const third = raw.third_party_property;

  let totalArea = toNumber(unit?.total_area ?? third?.total_area);
  let privateArea = toNumber(unit?.private_area ?? third?.private_area);

  // DWV pode retornar áreas em cm² (multiplicado por 10000)
  // Corrige se área > 10.000 m² (muito grande para apartamento/casa)
  if (totalArea && totalArea > 10_000) {
    totalArea = totalArea / 100;
  }
  if (privateArea && privateArea > 10_000) {
    privateArea = privateArea / 100;
  }

  return {
    totalArea,
    privateArea,
    landArea: undefined,
    buildingArea: undefined,
    bedrooms: unit?.dorms ?? third?.dorms ?? undefined,
    suites: unit?.suites ?? third?.suites ?? undefined,
    bathrooms: unit?.bathroom ?? third?.bathroom ?? undefined,
    halfBathrooms: undefined,
    parkingSpots: unit?.parking_spaces ?? third?.parking_spaces ?? undefined,
    floor: undefined,
    totalFloors: undefined,
  };
}

function extractPricing(raw: DwvProperty): PropertyPricing {
  const unit = raw.unit;
  const third = raw.third_party_property;
  let sale = toNumber(unit?.price ?? third?.price);

  // DWV retorna valores em centavos (multiplicado por 100)
  // Corrige dividindo por 100 se valor for muito alto (> R$ 100 milhões é suspeito)
  if (sale && sale > 100_000_000) {
    sale = sale / 100;
  }

  return {
    sale: raw.rent ? undefined : sale,
    rent: raw.rent ? sale : undefined,
    condo: undefined,
    iptu: undefined,
  };
}

function extractPhotos(raw: DwvProperty): Photo[] {
  const photos: Photo[] = [];
  const push = (url?: string, order = photos.length, title?: string) => {
    if (!url) return;
    photos.push({
      url,
      title,
      order,
    });
  };

  const addMediaItem = (item?: DwvMediaItem | string, order?: number, title?: string) => {
    if (!item) return;
    if (typeof item === 'string') {
      push(item, order, title);
      return;
    }
    push(item.url || item.sizes?.xlarge || item.sizes?.large || item.sizes?.medium, order, title || item.title);
  };

  addMediaItem(raw.unit?.cover, 0, raw.title);
  raw.unit?.additional_galleries?.forEach(gallery => {
    gallery.files?.forEach(file => addMediaItem(file, photos.length, gallery.title));
  });
  raw.building?.gallery?.forEach(item => addMediaItem(item));
  raw.building?.cover && addMediaItem(raw.building.cover);
  raw.third_party_property?.gallery?.forEach(item => addMediaItem(item));
  raw.third_party_property?.cover && addMediaItem(raw.third_party_property.cover);

  if (photos.length === 0 && raw.construction_company?.logo) {
    addMediaItem(raw.construction_company.logo, undefined, raw.construction_company.title);
  }

  // Remove duplicados simples
  const seen = new Set<string>();
  return photos.filter(photo => {
    if (!photo.url) return false;
    if (seen.has(photo.url)) return false;
    seen.add(photo.url);
    return true;
  });
}

function collectFeatureTags(raw: DwvProperty, type: string): string[] | undefined {
  const source = [
    ...(raw.building?.features || []),
    ...(raw.third_party_property?.features || []),
  ];

  const tags = source
    .filter(feature => feature.type === type)
    .flatMap(feature => feature.tags || [])
    .filter(Boolean);

  return tags.length ? tags : undefined;
}

function extractFeatures(raw: DwvProperty): PropertyFeatures | undefined {
  const apartmentTags = collectFeatureTags(raw, 'apartment');
  if (!apartmentTags || apartmentTags.length === 0) {
    return undefined;
  }

  const features: PropertyFeatures = {};
  apartmentTags.forEach(tag => {
    const normalized = tag.toLowerCase();
    if (normalized.includes('mobiliad')) features.furnished = true;
    if (normalized.includes('pet')) features.petFriendly = true;
    if (normalized.includes('academia') || normalized.includes('gym')) features.gym = true;
    if (normalized.includes('piscina')) features.pool = true;
    if (normalized.includes('churrasqueira')) features.bbqGrill = true;
    if (normalized.includes('play') || normalized.includes('brinquedo')) features.playground = true;
    if (normalized.includes('varanda') || normalized.includes('sacada')) features.balcony = true;
    if (normalized.includes('vista')) features.oceanView = true;
  });
  return features;
}

function collectVideoLinks(raw: DwvProperty): string[] | undefined {
  const unitVideos = (raw.unit?.videos || []).map(video => video.url).filter(Boolean);
  const buildingVideos = (raw.building?.videos || []).map(video => video.url).filter(Boolean);
  
  // ✅ DESABILITADO: Log completamente removido (causa lentidão em dev)
  // Reativar apenas se necessário debug específico

  const links = [
    ...unitVideos,
    ...buildingVideos,
  ].filter(Boolean) as string[];

  // Remove duplicatas
  const uniqueLinks = Array.from(new Set(links));
  
  if (links.length !== uniqueLinks.length) {
    console.log('[DWV Mapper] ⚠️ Removidas duplicatas de vídeos:', {
      original: links.length,
      unique: uniqueLinks.length,
      removidas: links.length - uniqueLinks.length,
    });
  }

  return uniqueLinks.length ? uniqueLinks : undefined;
}

function generateSlug(code: string, title: string, neighborhood?: string): string {
  const slugify = (text: string) => text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Espaços para hífens
    .replace(/-+/g, '-') // Múltiplos hífens para um
    .replace(/^-|-$/g, ''); // Remove hífens das pontas

  const parts = [
    code.replace(/[^\w]/g, ''), // Código limpo
    slugify(title),
    neighborhood ? slugify(neighborhood) : null,
  ].filter(Boolean);

  return parts.join('-');
}

function toNumber(value?: string | number | null): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return isFinite(parsed) ? parsed : undefined;
}

function safeDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function cryptoRandom(): string {
  return Math.random().toString(36).slice(2);
}

