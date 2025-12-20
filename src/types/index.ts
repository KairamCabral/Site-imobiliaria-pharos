// ============================================
// TIPOS PRINCIPAIS - PHAROS IMOBILIÁRIA
// ============================================

/**
 * Status de um empreendimento
 */
export type StatusEmpreendimento = 'pre-lancamento' | 'lancamento' | 'em-construcao' | 'pronto' | 'entregue';

/**
 * Tipo de empreendimento
 */
export type TipoEmpreendimento = 'residencial' | 'comercial' | 'misto';

/**
 * Status de um imóvel
 */
export type StatusImovel = 'disponivel' | 'reservado' | 'vendido' | 'alugado';
export type StatusObra = 'pre-lancamento' | 'lancamento' | 'construcao' | 'pronto';

/**
 * Tipo de imóvel
 */
export type TipoImovel = 'apartamento' | 'casa' | 'cobertura' | 'terreno' | 'comercial' | 'loft' | 'kitnet';

/**
 * Finalidade do imóvel
 */
export type FinalidadeImovel = 'venda' | 'aluguel' | 'temporada';

/**
 * Coordenadas geográficas
 */
export interface Coordenadas {
  latitude: number;
  longitude: number;
}

/**
 * Endereço completo
 */
export interface Endereco {
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  coordenadas?: Coordenadas;
}

/**
 * Planta de um empreendimento
 */
export interface Planta {
  id: string;
  titulo: string;
  descricao?: string;
  imagem: string;
  metragem: number;
  quartos: number;
  suites?: number;
  banheiros: number;
  vagas?: number;
  precoDesde?: number;
}

/**
 * Corretor responsável
 */
export interface Corretor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  foto?: string;
  creci: string;
  whatsapp?: string;
}

/**
 * Empreendimento Imobiliário
 */
export interface Empreendimento {
  id: string;
  slug: string; // URL-friendly
  nome: string;
  descricao?: string;
  descricaoCompleta?: string;
  
  // Localização
  endereco?: Endereco;
  
  // Informações do empreendimento
  construtora?: string;
  incorporadora?: string;
  arquiteto?: string;
  status?: StatusEmpreendimento;
  dataLancamento?: string; // ISO date string
  dataPrevisaoEntrega?: string;
  dataEntrega?: string;
  
  // Características
  tipoEmpreendimento?: TipoEmpreendimento;
  totalUnidades?: number;
  unidadesDisponiveis?: number;
  totalTorres?: number;
  andaresPorTorre?: number;
  unidadesPorAndar?: number;
  
  // Diferenciais e comodidades
  diferenciais?: string[];
  areasComuns?: string[];
  lazer?: string[];
  seguranca?: string[];
  sustentabilidade?: string[];
  caracteristicas?: string[]; // Características do Vista
  infraestrutura?: string[]; // Infraestrutura do Vista
  
  // Mídia
  imagemCapa?: string;
  imagemDestaque?: string;
  galeria?: string[];
  fotos?: Array<{ url: string; destaque?: boolean }>; // Fotos do cadastro direto
  fotosUnidades?: Array<{ url: string; description?: string }>; // Fotos das unidades
  videosYoutube?: string[];
  tourVirtual?: string;
  folderPdf?: string; // URL para download do folder em PDF
  plantas?: Planta[];
  logotipo?: string;
  
  // Valores
  precoDesde?: number;
  precoAte?: number;
  precoMinimo?: number; // Alias para precoDesde
  precoMaximo?: number; // Alias para precoAte
  areaDesde?: number;
  areaAte?: number;
  areaMinima?: number; // Alias para areaDesde
  areaMaxima?: number; // Alias para areaAte
  
  // SEO e Metadata
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Relacionamentos
  imoveisIds?: string[];
  
  // Analytics
  visualizacoes?: number;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  
  // Provider data
  providerData?: {
    provider: string;
    originalId: string;
    raw?: any;
  };
}

/**
 * Imóvel
 */
export interface Imovel {
  id: string;
  slug: string; // URL-friendly
  codigo?: string; // Código interno
  titulo: string;
  descricao: string;
  descricaoCompleta?: string;
  
  // Relação com empreendimento
  empreendimentoId?: string;
  empreendimento?: Empreendimento;
  empreendimentoNome?: string;
  
  // Tipo e categoria
  tipo: TipoImovel;
  subtipo?: string; // ex: duplex, triplex, geminada
  finalidade: FinalidadeImovel;
  
  // Localização
  endereco: Endereco;
  
  // Valores financeiros
  preco: number;
  precoCondominio?: number;
  iptu?: number;
  aceitaPermuta: boolean;
  aceitaFinanciamento: boolean;
  valorPermuta?: number;
  
  // Características físicas
  areaTotal: number; // m²
  areaPrivativa?: number; // m²
  areaTerreno?: number; // para casas/terrenos
  quartos: number;
  suites: number;
  banheiros: number;
  lavabos?: number;
  vagasGaragem: number;
  andar?: number;
  totalAndares?: number;
  
  // Características especiais
  caracteristicas: string[];
  caracteristicasLocalizacao?: string[]; // Ex: Barra Sul, Quadra Mar
  caracteristicasImovel?: string[]; // Ex: Churrasqueira, Piscina
  caracteristicasEmpreendimento?: string[];
  diferenciais: string[];
  mobiliado: boolean;
  petFriendly: boolean;
  acessibilidade: boolean;
  
  // Orientação e posição
  posicaoSolar?: string; // Norte, Sul, Leste, Oeste
  vistaParaMar?: boolean;
  frenteRua?: boolean;
  distanciaMar?: number; // Distância do mar em metros (0 = frente mar)
  distancia_mar_m?: number; // Alias legado para compatibilidade
  
  // Estado e acabamento
  estadoConservacao?: 'novo' | 'seminovo' | 'usado' | 'reforma';
  anosConstrucao?: number;
  
  // Mídia
  imagemCapa: string;
  galeria: string[];
  videosYoutube?: string[];
  tourVirtual?: string;
  plantaBaixa?: string;
  
  // Status e visibilidade
  status: StatusImovel;
  statusObra?: StatusObra;
  exibirNoSite?: boolean;      // Exibir no site
  exclusivo?: boolean;          // Prioridade 1 - Primeira seção home
  superDestaque?: boolean;      // Prioridade 2 - Segunda seção home
  temPlaca?: boolean;           // Prioridade 3
  destaqueWeb?: boolean;        // Prioridade 4
  destaque: boolean;            // Prioridade 5
  lancamento: boolean;
  
  // Corretor responsável
  corretor: Corretor;
  
  // SEO e Metadata
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  
  // Analytics
  visualizacoes: number;
  favoritado: number;
  contatosRecebidos?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publicadoEm?: string;
}

/**
 * Informações sobre um bairro
 */
export interface BairroInfo {
  id: string;
  slug: string;
  nome: string;
  cidade: string;
  estado: string;
  descricao: string;
  descricaoCompleta?: string;
  imagemCapa: string;
  galeria?: string[];
  
  // Características do bairro
  pontosInteresse: string[];
  infraestrutura: string[];
  transporte: string[];
  comercio: string[];
  
  // Estatísticas
  quantidadeImoveis: number;
  quantidadeEmpreendimentos?: number;
  faixaPrecoMedia: {
    min: number;
    max: number;
  };
  
  // Localização
  coordenadas: Coordenadas;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

/**
 * Filtros de busca para imóveis
 */
export interface FiltrosImoveis {
  tipo?: TipoImovel[];
  finalidade?: FinalidadeImovel;
  cidade?: string;
  bairro?: string[];
  precoMin?: number;
  precoMax?: number;
  areaMin?: number;
  areaMax?: number;
  quartos?: number;
  suites?: number;
  banheiros?: number;
  vagas?: number;
  caracteristicas?: string[];
  empreendimentoId?: string;
  destaque?: boolean;
  lancamento?: boolean;
}

/**
 * Ordenação de resultados
 */
export type OrdenacaoImoveis = 
  | 'relevancia'
  | 'preco-asc'
  | 'preco-desc'
  | 'area-asc'
  | 'area-desc'
  | 'recentes'
  | 'antigos';

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label?: string;  // Para uso em componentes UI
  name: string;    // Para uso em schema.org (obrigatório)
  href?: string;   // Para uso em componentes UI
  url?: string;    // Para uso em schema.org
  current?: boolean;
}

/**
 * Schema.org JSON-LD types
 */
export interface SchemaOrganization {
  '@context': 'https://schema.org';
  '@type': 'RealEstateAgent' | 'Organization';
  name: string;
  description?: string;
  url: string;
  logo?: string;
  image?: string;
  telephone?: string;
  email?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs?: string[]; // Social media links
}

export interface SchemaRealEstateListing {
  '@context': 'https://schema.org';
  '@type': 'RealEstateListing';
  name: string;
  description: string;
  url: string;
  image: string[];
  offers: {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
    availability: string;
    validFrom?: string;
  };
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  numberOfRooms?: number;
  numberOfBathroomsTotal?: number;
  floorSize?: {
    '@type': 'QuantitativeValue';
    value: number;
    unitCode: 'MTK'; // Square meters
  };
}

export interface SchemaApartmentComplex {
  '@context': 'https://schema.org';
  '@type': 'ApartmentComplex';
  name: string;
  description: string;
  url: string;
  image: string[];
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  amenityFeature?: Array<{
    '@type': 'LocationFeatureSpecification';
    name: string;
    value: boolean;
  }>;
}

export interface SchemaBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Sistema de Favoritos - Pharos
 */

/**
 * Etiquetas (tags) para favoritos
 */
export type FavoritoTag = 'agendar' | 'negociar' | 'prioridade' | 'urgente' | 'contato-feito';

/**
 * Tipos de alertas
 */
export interface FavoritoAlertas {
  priceDrop?: boolean;
  newPhotos?: boolean;
  statusChange?: boolean;
}

/**
 * Dados conhecidos do imóvel no momento de salvar
 */
export interface FavoritoLastKnown {
  price?: number;
  photos?: number;
  status?: string;
}

/**
 * Item de favorito
 */
export interface Favorito {
  id: string;              // id do imóvel
  savedAt: string;         // ISO date string
  collectionId: string;    // 'default' ou ID da coleção personalizada
  notes?: string;          // Anotações do usuário (markdown simples)
  tags?: FavoritoTag[];    // Etiquetas
  alerts?: FavoritoAlertas;
  lastKnown?: FavoritoLastKnown;
  imovel?: Imovel;         // Dados completos do imóvel (populado ao buscar)
  order?: number;          // Ordem dentro da coleção (para drag & drop)
}

/**
 * Coleção de favoritos
 */
export interface Colecao {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  icon?: string;           // Ícone opcional (emoji ou nome do ícone)
  color?: string;          // Cor temática opcional (neutros apenas)
  count?: number;          // Quantidade de itens (calculado)
}

/**
 * Tipos de ordenação para favoritos
 */
export type FavoritosOrdenacao = 
  | 'savedAt-desc'         // Mais recentes salvos
  | 'savedAt-asc'          // Mais antigos salvos
  | 'relevance'            // Últimos atualizados
  | 'price-asc'            // Menor preço
  | 'price-desc'           // Maior preço
  | 'sea-asc'              // Mais próximo do mar
  | 'deadline-asc'         // Prazo de entrega mais próximo
  | 'area-asc'             // Menor área
  | 'area-desc';           // Maior área

/**
 * Modos de visualização
 */
export type FavoritosViewMode = 'grid' | 'map';

/**
 * Filtros internos para favoritos
 */
export interface FavoritosFiltros {
  city?: string[];
  bairro?: string[];
  type?: TipoImovel[];
  status?: StatusImovel[];
  suites?: number[];
  vagas?: number[];
  areaMin?: number;
  areaMax?: number;
  priceMin?: number;
  priceMax?: number;
  distanciaMarMax?: number;  // em metros
  diferenciais?: string[];
  tags?: FavoritoTag[];
}

/**
 * Query completa para listagem de favoritos
 */
export interface FavoritosListQuery {
  collectionId?: string;
  q?: string;                    // Busca textual
  filters?: FavoritosFiltros;
  sort?: FavoritosOrdenacao;
  view?: FavoritosViewMode;
}

/**
 * Resposta da API de favoritos
 */
export interface FavoritosResponse {
  favoritos: Favorito[];
  total: number;
  colecoes: Colecao[];
}

/**
 * Item selecionado para comparação
 */
export interface FavoritoSelecionado {
  id: string;
  isPinned?: boolean;  // Imóvel base fixado
}

/**
 * Dados para compartilhamento
 */
export interface FavoritosShare {
  token: string;
  url: string;
  expiresAt?: string;
  protected?: boolean;
  collectionId?: string;
  createdAt: string;
}

/**
 * Ações em massa
 */
export type FavoritosAcaoMassa = 
  | 'move'           // Mover para outra coleção
  | 'remove'         // Remover dos favoritos
  | 'tag'            // Aplicar etiqueta
  | 'export';        // Exportar PDF

