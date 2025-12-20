/**
 * Property Adapter
 * 
 * Adapta o modelo Property do domínio para a interface Imovel da UI
 * Permite substituir mocks sem quebrar componentes existentes
 */

import type { Property } from '@/domain/models';
import type { Imovel } from '@/types';

/**
 * Valida se string é URL HTTP/HTTPS válida
 */
const isValidUrl = (u: any): boolean => {
  return typeof u === "string" && /^https?:\/\//i.test(u) && u.trim() !== '';
};

/**
 * Extrai e saneia URLs de fotos (remove vazias e não-HTTP)
 */
function extractFotos(property: Property, raw?: any): string[] {
  const urls: string[] = [];
  
  // Fotos do modelo normalizado
  if (property.photos && property.photos.length > 0) {
    property.photos.forEach(photo => {
      if (isValidUrl(photo.url)) {
        urls.push(photo.url);
      }
    });
  }
  
  // Se vazio, tentar foto destaque do raw data (Vista)
  if (urls.length === 0 && raw) {
    const destaque = String(raw.FotoDestaque ?? raw.fotoDestaque ?? raw.foto_destaque ?? "");
    if (isValidUrl(destaque)) {
      urls.push(destaque);
    }
    
    // Tentar array de fotos do Vista
    const arrVista = Array.isArray(raw.fotos)
      ? raw.fotos.map((f: any) => String(f?.Foto ?? f?.FotoPequena ?? ""))
      : [];
    
    arrVista.forEach((url: string) => {
      if (isValidUrl(url) && !urls.includes(url)) {
        urls.push(url);
      }
    });
  }
  
  // Remove duplicatas mantendo ordem
  return Array.from(new Set(urls));
}

/**
 * Converte Property (domínio) para Imovel (UI)
 */
export function adaptPropertyToImovel(property: Property, rawData?: any): Imovel {
  // Usa raw do provider (quando disponível) como fallback automático
  const raw = rawData ?? (property as any)?.providerData?.raw;
  return {
    id: property.id,
    codigo: property.code,
    slug: property.slug || generateSlug(property),
    titulo: property.title,
    descricao: property.description || '',
    descricaoCompleta: property.descriptionFull || property.description || '',
    
    // Tipo e finalidade
    tipo: property.type as any,
    finalidade: property.purpose === 'venda' ? 'venda' : property.purpose === 'aluguel' ? 'aluguel' : 'venda',
    
    // Endereço
    endereco: {
      rua: property.address?.street || '',
      numero: property.address?.number || '',
      complemento: property.address?.complement,
      bairro: property.address?.neighborhood || '',
      cidade: property.address?.city || '',
      estado: property.address?.state || '',
      cep: property.address?.zipCode || '',
      coordenadas: property.address?.coordinates as any,
    },
    distanciaMar: typeof property.distanciaMar === 'number' ? Math.round(property.distanciaMar) : undefined,
    distancia_mar_m: typeof property.distanciaMar === 'number' ? Math.round(property.distanciaMar) : undefined,
    
    // Valores
    preco: property.pricing?.sale || property.pricing?.rent || 0,
    precoCondominio: property.pricing?.condo,
    iptu: property.pricing?.iptu,
    aceitaPermuta: false, // Não temos essa info no Vista ainda
    aceitaFinanciamento: true,
    
    // Especificações
    areaTotal: property.specs?.totalArea as any,
    areaPrivativa: property.specs?.privateArea as any,
    areaTerreno: property.specs?.landArea as any,
    quartos: property.specs?.bedrooms || 0,
    suites: property.specs?.suites || 0,
    banheiros: property.specs?.bathrooms || 0,
    lavabos: property.specs?.halfBathrooms,
    vagasGaragem: property.specs?.parkingSpots || 0,
    andar: property.specs?.floor,
    totalAndares: property.specs?.totalFloors,
    
    // Características
    caracteristicas: extractCaracteristicas(property),
    caracteristicasLocalizacao: extractCaracteristicasLocalizacao(property),
    caracteristicasImovel: extractCaracteristicasImovel(property),
    diferenciais: extractDiferenciais(property),
    mobiliado: property.features?.furnished as any,
    petFriendly: property.features?.petFriendly as any,
    acessibilidade: property.features?.accessible as any,
    
    // Vista e posição
    vistaParaMar: property.features?.balcony as any, // Aproximação
    
    // Status e estado
    status: adaptStatus(property.status) as any,
    statusObra: property.obraStatus as any,
    estadoConservacao: 'novo', // Não temos essa info específica
    
    // Mídia (saneada - somente URLs válidas)
    imagemCapa: extractFotos(property, raw)[0] || '',
    galeria: extractFotos(property, raw),
    videosYoutube: property.videos || undefined,
    tourVirtual: property.virtualTour || undefined,
    
    // Flags de visibilidade e prioridade
    exibirNoSite: property.showOnWebsite ?? true,
    exclusivo: property.isExclusive || false,       // Prioridade 1
    superDestaque: property.superHighlight || false, // Prioridade 2
    temPlaca: property.hasSignboard || false,        // Prioridade 3
    destaqueWeb: property.webHighlight || false,     // Prioridade 4
    destaque: property.isHighlight || false,         // Prioridade 5
    lancamento: property.isLaunch || false,
    
    // Corretor
    corretor: (property.realtor ? {
      id: property.realtor.id || '',
      nome: property.realtor.name,
      telefone: property.realtor.phone || '',
      email: property.realtor.email || '',
      creci: property.realtor.creci || '',
      whatsapp: property.realtor.whatsapp || property.realtor.phone || '',
    } : undefined) as any,
    empreendimentoNome: property.buildingName || undefined,
    
    // Metadados (com fallback seguro)
    createdAt: property.createdAt?.toISOString() as any,
    updatedAt: property.updatedAt?.toISOString() || new Date().toISOString(),
    publicadoEm: property.publishedAt?.toISOString() as any,
    
    // SEO
    metaTitle: property.metaTitle as any,
    metaDescription: property.metaDescription as any,
    keywords: property.keywords as any,
    
    // UI state
    visualizacoes: 0,
    favoritado: 0,
  };
}

/**
 * Converte lista de Properties para lista de Imoveis
 */
export function adaptPropertiesToImoveis(properties: Property[]): Imovel[] {
  return properties.map(adaptPropertyToImovel);
}

/**
 * Gera slug se não existir
 */
function generateSlug(property: Property): string {
  const parts = [
    property.type,
    property.code,
    property.address?.neighborhood || property.address?.city || 'imovel',
  ];
  
  return parts
    .join('-')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extrai características do imóvel
 */
function extractCaracteristicas(property: Property): string[] {
  const caracteristicas: string[] = [];
  
  if (property.specs?.bedrooms) {
    caracteristicas.push(`${property.specs.bedrooms} quartos`);
  }
  
  if (property.specs?.suites) {
    caracteristicas.push(`${property.specs.suites} suítes`);
  }
  
  if (property.specs?.parkingSpots) {
    caracteristicas.push(`${property.specs.parkingSpots} vagas`);
  }
  
  if (property.features?.furnished) {
    caracteristicas.push('Mobiliado');
  }
  
  if (property.features?.balcony) {
    caracteristicas.push('Varanda');
  }
  
  if (property.features?.pool) {
    caracteristicas.push('Piscina');
  }
  
  if (property.features?.gym) {
    caracteristicas.push('Academia');
  }
  
  if (property.features?.elevator) {
    caracteristicas.push('Elevador');
  }
  
  return caracteristicas;
}

/**
 * Extrai características de localização
 */
function extractCaracteristicasLocalizacao(property: Property): string[] {
  const localizacao: string[] = [];

  const add = (label?: string) => {
    if (!label) return;
    const cleaned = label.trim();
    if (!cleaned) return;
    if (!localizacao.includes(cleaned)) {
      localizacao.push(cleaned);
    }
  };

  // Preferir dados estruturados vindos do mapeamento
  if (Array.isArray(property.caracteristicasLocalizacao)) {
    property.caracteristicasLocalizacao
      .filter(Boolean)
      .forEach((label) => add(String(label)));
  }

  // Bairro
  add(property.address?.neighborhood);

  // Posição/Vista calculada
  if (property.distanciaMar !== undefined && property.distanciaMar <= 100) {
    add('Frente Mar');
  } else if (property.distanciaMar !== undefined && property.distanciaMar <= 300) {
    add('Quadra Mar');
  } else if (property.features?.balcony) {
    add('Vista Mar');
  }

  // Avenida principal
  const rua = property.address?.street?.toLowerCase() || '';
  if (rua.includes('avenida brasil')) {
    add('Avenida Brasil');
  } else if (rua.includes('atlântica') || rua.includes('atlantica')) {
    add('Avenida Atlântica');
  }

  return localizacao;
}

/**
 * Extrai características principais do imóvel
 * PRIORIDADE: Vista Mar > Mobiliado > outras características
 */
function extractCaracteristicasImovel(property: Property): string[] {
  const caracteristicasImovel: string[] = [];

  const add = (label?: string) => {
    if (!label) return;
    const cleaned = String(label).trim();
    if (!cleaned) return;
    if (!caracteristicasImovel.includes(cleaned)) {
      caracteristicasImovel.push(cleaned);
    }
  };

  // 1) Dados estruturados vindos do Vista (mapeados no PropertyMapper)
  if (Array.isArray(property.caracteristicasImovel)) {
    property.caracteristicasImovel
      .filter(Boolean)
      .forEach((label) => add(label));
  }

  // 2) Fallbacks derivados de features/calculados
  const temVistaMar = property.features?.oceanView ||
    property.features?.balcony ||
    (typeof property.distanciaMar === 'number' && property.distanciaMar <= 500);
  if (temVistaMar) {
    add('Vista Mar');
  }

  if (property.features?.furnished) {
    add('Mobiliado');
  }

  if (property.features?.pool) {
    add('Piscina');
  }

  if (property.features?.bbqGrill) {
    add('Churrasqueira');
  }

  if (property.features?.gym) {
    add('Academia');
  }

  if (property.features?.sauna) {
    add('Sauna');
  }

  if (property.features?.partyRoom) {
    add('Salão de Festas');
  }

  if (property.features?.petFriendly) {
    add('Pet Friendly');
  }

  if (property.features?.airConditioning) {
    add('Ar Condicionado');
  }

  if (property.features?.gatedCommunity) {
    add('Condomínio Fechado');
  }

  return caracteristicasImovel;
}

/**
 * Extrai diferenciais
 */
function extractDiferenciais(property: Property): string[] {
  const diferenciais: string[] = [];
  
  if (property.isHighlight) {
    diferenciais.push('Destaque');
  }
  
  if (property.isExclusive) {
    diferenciais.push('Exclusivo');
  }
  
  if (property.isLaunch) {
    diferenciais.push('Lançamento');
  }
  
  if (property.features?.petFriendly) {
    diferenciais.push('Pet Friendly');
  }
  
  if (property.features?.accessible) {
    diferenciais.push('Acessível');
  }
  
  return diferenciais;
}

/**
 * Adapta status do domínio para UI
 */
function adaptStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'disponivel': 'disponivel',
    'reservado': 'reservado',
    'vendido': 'vendido',
    'alugado': 'alugado',
    'lancamento': 'lancamento',
    'em-construcao': 'em-construcao',
    'inativo': 'inativo',
  };
  
  return statusMap[status] || 'disponivel';
}

/**
 * Tipo para detalhes de imóvel na UI
 */
export type ImovelDetalheUI = {
  id: string;
  codigo?: string;
  titulo?: string;
  endereco: { rua: string; numero: string; bairro: string; cidade: string; uf?: string; cep?: string };
  empreendimento?: string; // Nome do condomínio/empreendimento
  preco?: number;
  precoCondominio?: number;
  iptu?: number;
  quartos?: number;
  suites?: number;
  banheiros?: number;
  vagas?: number;
  areaTotal?: number;
  areaPrivativa?: number;
  andar?: number;
  totalAndares?: number;
  descricao?: string;
  descricaoCompleta?: string;
  diferenciais: string[];
  caracteristicas: string[];
  galeria: string[];
  videos?: string[];
  tourVirtual?: string;
  status?: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
  corretor?: any;
  agencia?: any;
  [k: string]: any;
};

/**
 * Converte string vazia/null para string
 */
const s = (v: any): string => (v == null ? "" : String(v));

/**
 * Adapter de detalhes Vista para UI
 * Extrai TODOS os campos disponíveis da API Vista
 */
export function adaptDetalheVista(raw: any): ImovelDetalheUI {
  // Endereço completo
  const endereco = {
    rua: s(raw.Endereco),
    numero: s(raw.Numero),
    bairro: s(raw.Bairro),
    cidade: s(raw.Cidade),
    uf: s(raw.UF || raw.Estado),
    cep: s(raw.CEP),
  };
  
  // Empreendimento/Condomínio
  const empreendimento = s(raw.NomeEmpreendimento || raw.Empreendimento || raw.NomeCondominio || raw.Condominio);

  // Valores
  const preco = Number(raw.ValorVenda || raw.Valor || raw.PrecoVenda || 0) || undefined;
  const precoCondominio = Number(raw.ValorCondominio || raw.Condominio || 0) || undefined;
  const iptu = Number(raw.ValorIPTU || raw.IPTU || 0) || undefined;

  // Especificações
  const quartos = Number(raw.Dormitorios || raw.Dormitorio || 0) || undefined;
  const suites = Number(raw.Suites || raw.Suite || 0) || undefined;
  const banheiros = Number(raw.Banheiros || raw.Banheiro || 0) || undefined;
  const vagas = Number(raw.Vagas || raw.VagasGaragem || 0) || undefined;
  const areaTotal = Number(raw.AreaTotal || 0) || undefined;
  const areaPrivativa = Number(raw.AreaPrivativa || 0) || undefined;
  const andar = Number(raw.Andar || 0) || undefined;
  const totalAndares = Number(raw.TotalAndares || 0) || undefined;

  // Descrição: use a 1ª não-vazia
  const descricaoCompleta =
    s(raw.DescricaoEmpreendimento).trim() ||
    s(raw.DescricaoWeb).trim() ||
    s(raw.Descricao).trim() ||
    s(raw.Observacao).trim() ||
    "";

  // Diferenciais: pegue TODOS os booleans verdadeiros conhecidos (expandido)
  const flags = [
    "Churrasqueira", "Lareira", "Piscina", "Academia", "Elevador",
    "Mobiliado", "Sacada", "VarandaGourmet", "Sauna", "Portaria24h",
    "Quadra", "SalaoFestas", "Playground", "Bicicletario",
    "Hidromassagem", "Aquecimento", "ArCondicionado", "Alarme",
    "Interfone", "CercaEletrica", "Jardim", "Quintal"
  ];
  const diferenciais = flags.filter((k) => !!raw[k]);
  
  // Características derivadas
  const caracteristicas: string[] = [];
  if (raw.AceitaPet) caracteristicas.push("Aceita Pet");
  if (raw.Acessibilidade) caracteristicas.push("Acessível");
  if (raw.Mobiliado) caracteristicas.push("Mobiliado");

  // Galeria: FotoDestaque + fotos[].Foto/FotoGrande/FotoPequena
  const fotos = Array.isArray(raw.fotos) ? raw.fotos : [];
  const imagens = [
    s(raw.FotoDestaque),
    s(raw.FotoCapa),
    ...fotos.map((f: any) => s(f?.Foto)),
    ...fotos.map((f: any) => s(f?.FotoGrande)),
    ...fotos.map((f: any) => s(f?.FotoPequena)),
  ].filter(isValidUrl);
  
  // Vídeos e Tour
  const videos = Array.isArray(raw.Videos) ? raw.Videos.filter((v: any) => isValidUrl(v)) : undefined;
  const tourVirtual = s(raw.TourVirtual).trim() || undefined;

  return {
    id: s(raw.Codigo),
    codigo: s(raw.CodigoImovel || raw.Codigo),
    titulo: s(raw.Titulo || raw.TituloSite),
    endereco,
    empreendimento: empreendimento || undefined,
    preco,
    precoCondominio,
    iptu,
    quartos,
    suites,
    banheiros,
    vagas,
    areaTotal,
    areaPrivativa,
    andar,
    totalAndares,
    descricaoCompleta: descricaoCompleta || undefined,
    descricao: descricaoCompleta || undefined,
    diferenciais,
    caracteristicas,
    galeria: Array.from(new Set(imagens)),
    videos,
    tourVirtual,
    status: s(raw.Status),
    dataCadastro: s(raw.DataCadastro),
    dataAtualizacao: s(raw.DataAtualizacao),
    corretor: raw.Corretor,
    agencia: raw.Agencia,
  };
}

