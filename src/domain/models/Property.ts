/**
 * Modelos de Domínio - Property (Imóvel)
 * 
 * Entidades core independentes de provider
 */

export type PropertyType = 
  | 'apartamento'
  | 'casa'
  | 'cobertura'
  | 'terreno'
  | 'comercial'
  | 'sala'
  | 'loja'
  | 'galpao'
  | 'chacara'
  | 'fazenda'
  | 'diferenciado';

export type PropertyStatus = 
  | 'disponivel'
  | 'reservado'
  | 'vendido'
  | 'alugado'
  | 'lancamento'
  | 'em-construcao'
  | 'inativo';

export type PropertyObraStatus =
  | 'pre-lancamento'
  | 'lancamento'
  | 'construcao'
  | 'pronto';

export type PropertyPurpose = 'venda' | 'aluguel' | 'ambos';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  postalCode?: string; // Alias para zipCode (compatibilidade)
  coordinates?: Coordinates;
}

export interface Photo {
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  order?: number;
  isHighlight?: boolean;
}

export interface PropertyAttachment {
  id?: string;
  url: string;
  filename: string;
  description?: string;
  type?: string; // 'pdf' | 'image' | 'document'
  size?: number; // em bytes
  showOnWebsite?: boolean;
}

export interface PropertySpecs {
  totalArea?: number;
  area?: number; // Alias para totalArea (compatibilidade)
  privateArea?: number;
  landArea?: number;
  buildingArea?: number;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  halfBathrooms?: number;
  parkingSpots?: number;
  parkingSpaces?: number; // Alias para parkingSpots (compatibilidade)
  floor?: number;
  totalFloors?: number;
}

export interface PropertyPricing {
  sale?: number;
  rent?: number;
  condo?: number;
  iptu?: number;
}

export interface PropertyFeatures {
  // Básico
  furnished?: boolean;
  petFriendly?: boolean;
  accessible?: boolean;
  
  // Estrutura
  balcony?: boolean;
  oceanView?: boolean;
  elevator?: boolean;
  
  // Lazer e conforto
  pool?: boolean;
  gym?: boolean;
  playground?: boolean;
  bbqGrill?: boolean;
  fireplace?: boolean;
  sauna?: boolean;
  partyRoom?: boolean;
  sportsField?: boolean;
  bikeRack?: boolean;
  jacuzzi?: boolean;
  garden?: boolean;
  backyard?: boolean;
  
  // Tecnologia e segurança
  heating?: boolean;
  airConditioning?: boolean;
  alarm?: boolean;
  intercom?: boolean;
  electricFence?: boolean;
  gatedCommunity?: boolean;
  
  // Índice para features adicionais
  [key: string]: boolean | undefined;
}

export interface Realtor {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  creci?: string;
  photo?: string;
}

export interface Agency {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
}

export interface BuildingDetails {
  id?: string;
  name?: string;
  descricao?: string;
  construtora?: string;
  imoveisPorAndar?: number;
  features?: string[];
  diferenciais?: string[];
  areasComuns?: string[];
  lazer?: string[];
  imagemCapa?: string;
  slug?: string;
  [key: string]: any;
}

/**
 * Entidade principal: Property (Imóvel)
 */
export interface Property {
  // Identificação
  id: string;
  code: string;
  title: string;
  description?: string;
  descriptionFull?: string;

  // Classificação
  type: PropertyType;
  status: PropertyStatus;
  purpose: PropertyPurpose;
  obraStatus?: PropertyObraStatus;

  // Localização
  address: Address;
  
  // Empreendimento/Condomínio
  buildingName?: string;
  buildingId?: string; // ID interno Pharos do empreendimento
  builderName?: string; // Construtora responsável
  
  // Distância do mar (em metros)
  distanciaMar?: number;

  // Valores
  pricing: PropertyPricing;

  // Especificações
  specs: PropertySpecs;

  // Características
  features?: PropertyFeatures;
  
  // Data de venda (para status vendido)
  soldAt?: Date;
  
  // Características estruturadas (arrays de strings do Vista)
  caracteristicasImovel?: string[];     // Características do imóvel (ex: "Churrasqueira a gás", "Mobiliado")
  caracteristicasLocalizacao?: string[]; // Características do empreendimento (ex: "Piscina", "Academia")
  caracteristicasEmpreendimento?: string[];

  // Mídia
  photos: Photo[];
  photosSource?: 'vista-fotos' | 'vista-fotos-numeric' | 'vista-detalhes' | 'fallback-destaque-detalhes' | 'fallback-destaque' | 'fallback-empty' | 'dwv';
  galleryMissing?: boolean; // Flag para indicar que galeria não está disponível
  videos?: string[];
  virtualTour?: string;
  attachments?: PropertyAttachment[]; // Materiais/Anexos (PDFs, plantas, documentos)

  // Relacionamentos
  realtor?: Realtor;
  agency?: Agency;

  // Metadados
  createdAt?: Date;
  updatedAt: Date;
  publishedAt?: Date;

  // SEO
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];

  // Flags de visibilidade e prioridade
  showOnWebsite?: boolean;        // Exibir no site
  isExclusive?: boolean;          // Exclusivo (Prioridade 1) - Primeira seção home
  superHighlight?: boolean;       // Super destaque (Prioridade 2) - Segunda seção home
  hasSignboard?: boolean;         // Tem Placa (Prioridade 3)
  webHighlight?: boolean;         // Destaque web (Prioridade 4)
  isHighlight?: boolean;          // Destaque genérico
  isLaunch?: boolean;             // Lançamento
  buildingDetails?: BuildingDetails;

  // Provider info (metadata técnico)
  providerData?: {
    provider: string;
    originalId: string;
    [key: string]: any;
  };
}

/**
 * Lista paginada de imóveis
 */
export interface PropertyList {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Filtros para busca de imóveis
 */
export interface PropertyFilters {
  // Localização
  city?: string | string[];
  state?: string | string[];
  neighborhood?: string | string[];

  // Tipo e finalidade
  type?: PropertyType | PropertyType[];
  purpose?: PropertyPurpose;
  status?: PropertyStatus | PropertyStatus[];
  obraStatus?: PropertyObraStatus | PropertyObraStatus[];

  // Preços
  minPrice?: number;
  maxPrice?: number;
  minRent?: number;
  maxRent?: number;

  // Especificações
  minBedrooms?: number;
  maxBedrooms?: number;
  minSuites?: number;
  minBathrooms?: number;
  minParkingSpots?: number;
  minArea?: number;
  maxArea?: number;

  // Seleções exatas (UI multiseleção: 1,2,3,4+)
  bedroomsExact?: number[];      // exatos (1,2,3). Para 4+ usar bedroomsFourPlus
  bedroomsFourPlus?: boolean;    // incluir >=4
  suitesExact?: number[];
  suitesFourPlus?: boolean;
  parkingExact?: number[];
  parkingFourPlus?: boolean;

  // Características
  furnished?: boolean;
  petFriendly?: boolean;
  accessible?: boolean;

  // Flags especiais
  isExclusive?: boolean;       // filtrar por Exclusivo
  isLaunch?: boolean;          // filtrar por Lançamento
  superHighlight?: boolean;    // filtrar por Super Destaque (quando disponível)

  // Características detalhadas (arrays de strings da UI)
  caracteristicasImovel?: string[];          // Ex: ['Mobiliado', 'Vista para o Mar', 'Churrasqueira']
  caracteristicasLocalizacao?: string[];     // Ex: ['Centro', 'Frente Mar', 'Avenida Brasil']
  caracteristicasEmpreendimento?: string[];  // Ex: ['Academia', 'Piscina', 'Salão de Festas']
  
  // Filtros adicionais
  propertyCode?: string;       // Código do imóvel (busca exata, ex: "PH1060")
  buildingName?: string;       // Nome do empreendimento (busca parcial)
  distanciaMarRange?: 'frente-mar' | 'quadra-mar' | 'segunda-quadra' | 'terceira-quadra' | 'ate-500m' | 'ate-1km';

  // Outros
  search?: string; // busca textual
  realtorId?: string;
  agencyId?: string;
  
  // Ordenação
  sortBy?: 'price' | 'area' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';

  // Delta sync
  updatedSince?: Date;
  
  // Provider control (interno)
  providersToUse?: Array<'vista' | 'dwv' | 'vista-only' | 'dwv-only'>;
}

/**
 * Paginação
 */
export interface Pagination {
  page: number;
  limit: number;
}

