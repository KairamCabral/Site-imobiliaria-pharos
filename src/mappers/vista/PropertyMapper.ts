/**
 * Mapper Vista → Domain
 * 
 * Converte estrutura de dados do Vista para o modelo de domínio Pharos
 * 
 * VERSÃO: 3.0 - CARACTERÍSTICAS COMO OBJETO
 * - Descoberta: Vista retorna "Caracteristicas" como um OBJETO (não array!)
 * - Exemplo: { "Churrasqueira Carvao": "Sim", "Churrasqueira Gas": "Nao", "Mobiliado": "Sim" }
 * - Suporte completo a todos os campos de características do Vista
 */

import type { Property, Photo, PropertyAttachment, Realtor, Agency, PropertyFeatures, PropertyObraStatus } from '@/domain/models';
import type { VistaImovel, VistaFoto, VistaCorretor, VistaAgencia } from '@/providers/vista/types';
import {
  normalizeVistaStatus,
  normalizeVistaType,
  normalizeVistaPurpose,
  parsePrice,
  parseArea,
  parseInteger,
  parseCoordinate,
  validateCoordinates,
  cleanString,
  cleanDescription,
  normalizeTitle,
  createSlug,
  normalizePhone,
  normalizeCEP,
  parseDate,
} from '@/mappers/normalizers';
import { calcularDistanciaMar } from '@/utils/distanciaMar';
import { encontrarEmpreendimentoId } from '@/data/empreendimentosMapping';

type MaybeObraStatus = PropertyObraStatus | undefined;

function normalizeObraStatusValue(rawValue?: string | null): MaybeObraStatus {
  if (!rawValue) return undefined;
  const normalized = rawValue
    .toLowerCase()
    .replace(/[^a-z\sçãõáàâêéíóôú-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return undefined;

  if (normalized.includes('pré') || normalized.includes('pre')) {
    return 'pre-lancamento';
  }

  if (
    normalized.includes('obras iniciadas') ||
    normalized.includes('em andamento') ||
    normalized.includes('em constr') ||
    normalized.includes('construc') ||
    normalized.includes('andamento')
  ) {
    return 'construcao';
  }

  if (normalized.includes('lanç') || normalized.includes('lanc')) {
    return 'lancamento';
  }

  if (
    normalized.includes('pronto') ||
    normalized.includes('entregue') ||
    normalized.includes('finalizado') ||
    normalized.includes('habite') ||
    normalized.includes('entrega realizada') ||
    normalized.includes('moradia') ||
    normalized.includes('para morar')
  ) {
    return 'pronto';
  }

  return undefined;
}

function collectObraStatusCandidates(vista: VistaImovel): string[] {
  const candidates: string[] = [];

  const pushCandidate = (value: any) => {
    const cleaned = cleanString(value);
    if (cleaned) {
      candidates.push(cleaned);
    }
  };

  pushCandidate((vista as any).Situacao); // ✅ Nome correto (prioridade máxima)
  pushCandidate(vista.StatusObra); // Fallback (campo antigo)
  pushCandidate((vista as any).StatusDaObra);
  pushCandidate((vista as any).StatusObraEmpreendimento);
  pushCandidate((vista as any).StatusEmpreendimento);
  pushCandidate((vista as any).StatusDaConstrucao);
  pushCandidate((vista as any).StatusConstrucao);
  pushCandidate((vista as any).StatusObraImovel);
  pushCandidate(vista.Status);

  Object.keys(vista).forEach(key => {
    const lower = key.toLowerCase();
    if (lower.includes('status') && (lower.includes('obra') || lower.includes('constr'))) {
      pushCandidate(vista[key]);
    }
  });

  const textSources = [vista.DescricaoWeb, vista.Descricao, (vista as any).Observacao];
  textSources.filter(Boolean).forEach(text => {
    const normalizedText = cleanString(text)?.toLowerCase();
    if (!normalizedText) return;
    if (normalizedText.includes('pré-lanç') || normalizedText.includes('pre-lanç') || normalizedText.includes('pre lanc')) {
      pushCandidate('Pré-Lançamento');
    }
    if (normalizedText.includes('em constr')) {
      pushCandidate('Em Construção');
    }
    if (normalizedText.includes('lançamento') || normalizedText.includes('lancamento')) {
      pushCandidate('Lançamento');
    }
    if (normalizedText.includes('pronto para morar') || normalizedText.includes('pronto p/ morar') || normalizedText.includes('pronto para uso')) {
      pushCandidate('Pronto');
    }
  });

  return candidates;
}

function sanitizeMediaUrl(value: any): string | undefined {
  const cleaned = cleanString(value);
  if (!cleaned) return undefined;

  const trimmed = cleaned.replace(/[,;.)]+$/g, '');
  let normalized = trimmed;

  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const url = new URL(normalized);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function iterateMediaValues(input: any, cb: (value: string) => void) {
  if (input === null || input === undefined) return;

  if (typeof input === 'string') {
    const raw = input.trim();
    if (!raw) return;

    // Para strings que parecem URLs, pega apenas a primeira URL completa
    // Isso evita pegar query parameters como URLs separadas
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i; // Remove 'g' flag
    const match = raw.match(urlRegex);

    if (match && match[0]) {
      // Pega apenas a primeira URL encontrada
      cb(match[0]);
    } else {
      cb(raw);
    }
    return;
  }

  if (Array.isArray(input)) {
    input.forEach((item) => iterateMediaValues(item, cb));
    return;
  }

  if (typeof input === 'object') {
    // Detecta estrutura de vídeo do Vista: {Video: "ID", Descricao: "..."}
    const videoId = (input as any).Video || (input as any).video || (input as any).VideoCodigo;
    if (videoId && typeof videoId === 'string' && videoId.length > 0) {
      // É um ID do YouTube - construir URL completa
      if (!videoId.startsWith('http')) {
        // Se não é uma URL, assume que é ID do YouTube
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        cb(youtubeUrl);
        return; // Não iterar pelo restante do objeto
      } else {
        // Já é uma URL
        cb(videoId);
        return;
      }
    }
    
    // Se não é estrutura de vídeo, iterar pelos valores
    Object.values(input).forEach((value) => iterateMediaValues(value, cb));
  }
}

function normalizeVistaVideosField(vista: VistaImovel): string[] | undefined {
  const urls = new Set<string>();
  const debugSources: string[] = [];

  const collect = (value: any, sourceName: string) => {
    const beforeSize = urls.size;
    iterateMediaValues(value, (candidate) => {
      const sanitized = sanitizeMediaUrl(candidate);
      if (sanitized) {
        urls.add(sanitized);
      }
    });
  };

  collect((vista as any).Videos, 'Videos');

  const fallbackKeys = [
    'Video',
    'Video1',
    'Video2',
    'Video3',
    'VideoTour',
    'LinkVideo',
    'VideoDestaque',
    'VideoApresentacao',
    'VideoURL',
  ];

  fallbackKeys.forEach((key) => collect((vista as any)[key], key));

  return urls.size > 0 ? Array.from(urls) : undefined;
}

function normalizeVistaTourField(vista: VistaImovel): string | undefined {
  const sourceKeys = [
    'TourVirtual',
    'Tour360',
    'TourVirtual360',
    'TourVirtualLink',
    'TourVirtualUrl',
  ];

  const sources = sourceKeys.map(key => ({ key, value: (vista as any)[key] }));

  for (const { key, value } of sources) {
    let sanitized: string | undefined;
    iterateMediaValues(value, (candidate) => {
      if (sanitized) return;
      const url = sanitizeMediaUrl(candidate);
      if (url) {
        sanitized = url;
      }
    });
    if (sanitized) {
      // Log apenas quando encontrar tour
      if (process.env.NODE_ENV === 'development') {
        // ✅ Log silenciado para performance
        // console.log(`🌐 [Vista] ${vista.Codigo} - Tour virtual encontrado (${key})`);
      }
      return sanitized;
    }
  }

  return undefined;
}

function normalizeVistaAttachmentsField(vista: VistaImovel): PropertyAttachment[] | undefined {
  const attachments: PropertyAttachment[] = [];
  
  // Anexos vêm como array de objetos
  const anexos = (vista as any).Anexo || [];
  
  if (Array.isArray(anexos)) {
    anexos.forEach((anexo: any, index: number) => {
      // Verifica se deve exibir no site
      const showOnWebsite = parseBoolean(anexo.ExibirNoSite);
      if (showOnWebsite === false) {
        return; // Pula este anexo
      }
      
      const url = sanitizeMediaUrl(anexo.Anexo || anexo.Arquivo || anexo.URL);
      if (!url) {
        return; // Sem URL válida
      }
      
      const filename = cleanString(anexo.Arquivo) || cleanString(anexo.Descricao) || `Arquivo ${index + 1}`;
      const description = cleanString(anexo.Descricao);
      
      // Detectar tipo pelo nome/extensão
      let type = 'document';
      const lowerFilename = filename.toLowerCase();
      if (lowerFilename.endsWith('.pdf')) {
        type = 'pdf';
      } else if (lowerFilename.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        type = 'image';
      }
      
      attachments.push({
        id: cleanString(anexo.Codigo || anexo.CodigoAnexo),
        url,
        filename,
        description,
        type,
        showOnWebsite: showOnWebsite === true || showOnWebsite === undefined, // true por padrão
      });
    });
  }
  
  return attachments.length > 0 ? attachments : undefined;
}

function pickObraStatus(candidates: string[], isLaunch?: boolean): PropertyObraStatus | undefined {
  // Tenta resolver pelos candidatos (Situacao, StatusObra, etc.)
  for (const candidate of candidates) {
    const resolved = normalizeObraStatusValue(candidate);
    if (resolved) {
      return resolved;
    }
  }

  // ❌ NÃO inferir automaticamente baseado em checkbox Lancamento
  // Só retorna obraStatus se vier explicitamente do campo Situacao/StatusObra
  // Se não tiver, retorna undefined para que o componente não apareça
  
  return undefined;
}

/**
 * Mapeia imóvel do Vista para Property do domínio
 */
export function mapVistaToProperty(vista: VistaImovel): Property {
  const id = String(vista.Codigo);
  const code = vista.CodigoImovel || String(vista.Codigo);
  
  // Tipo e status
  // IMPORTANTE: Vista usa o campo "Categoria" para tipo do imóvel (conforme documentação)
  const type = normalizeVistaType(vista.Categoria || vista.TipoImovel || '');
  const status = normalizeVistaStatus(vista.Status || 'Ativo');
  const purpose = normalizeVistaPurpose(vista.Finalidade || '');
  
  // DEBUG: Log para imóveis específicos (PH47, PH1047, etc.)
  if (vista.Codigo === 'PH47' || vista.Codigo === 'PH1047' || vista.CodigoImovel === 'PH47') {
    // ✅ Debug PH47 silenciado
    // console.log('%c[PropertyMapper] 🔍 DEBUG PH47:', 'background: #ff0000; color: white; font-weight: bold; padding: 8px;', {
    //   Codigo: vista.Codigo,
    //   CodigoImovel: vista.CodigoImovel,
    //   CategoriaRAW: vista.Categoria,
    //   TipoImovelRAW: vista.TipoImovel,
    //   TipoNormalizado: type,
    //   TituloSite: vista.TituloSite || vista.Titulo,
    // });
  }
  
  // Endereço e Coordenadas
  const lat = parseCoordinate(vista.Latitude);
  const lng = parseCoordinate(vista.Longitude);
  
  // Log de debug para primeiros 3 imóveis
  if (Math.random() < 0.01) {
    // ✅ Log de coordenadas silenciado
    // console.log(`[PropertyMapper] 📍 Coordenadas Vista - Código ${code}:`, {
    //   Latitude: vista.Latitude,
    //   Longitude: vista.Longitude,
    //   parsed: { lat, lng },
    //   valid: validateCoordinates(lat, lng),
    // });
  }
  
  // Preferir BairroComercial quando disponível
  const address = {
    street: cleanString(vista.Endereco),
    number: cleanString(vista.Numero),
    complement: cleanString(vista.Complemento),
    neighborhood: cleanString((vista as any).BairroComercial || vista.Bairro),
    city: cleanString(vista.Cidade) || 'N/A',
    state: cleanString(vista.Estado || vista.UF) || 'SC',
    zipCode: normalizeCEP(vista.CEP),
    coordinates: validateCoordinates(lat, lng) ? { lat: lat!, lng: lng! } : undefined,
  };
  
  // Valores (com fallbacks inteligentes para múltiplos formatos)
  const pricing = {
    sale: parsePrice(vista.ValorVenda || vista.Valor || vista.PrecoVenda),
    rent: parsePrice(vista.ValorLocacao || vista.ValorAluguel),
    condo: parsePrice(vista.ValorCondominio || vista.Condominio),
    iptu: parsePrice(
      vista.ValorIPTU ||
      vista.IPTU ||
      (vista as any)?.Iptu ||
      (vista as any)?.ValorIptu
    ),
  };
  
  // Empreendimento/Condomínio (nome do condomínio + ID mapeado)
  let buildingName = cleanString(
    vista.NomeEmpreendimento ||
    vista.Empreendimento ||
    vista.NomeCondominio ||
    vista.Condominio
  );
  if (!buildingName) {
    const raw = vista as Record<string, any>;
    const candidato = Object.keys(raw || {})
      .filter((key) => /empreend|condom/i.test(key))
      .map((key) => raw[key])
      .find((value) => typeof value === 'string' && value.trim().length > 0);
    buildingName = cleanString(candidato);
  }
  const builderName = cleanString(
    (vista as any)?.Construtora ||
    (vista as any)?.ConstrutoraEmpreendimento ||
    (vista as any)?.Empreendedor
  );
  
  // Mapear nome do empreendimento → ID interno Pharos
  const buildingId = encontrarEmpreendimentoId(buildingName);
  
  // Calcular distância do mar (se tiver coordenadas válidas)
  const distanciaMar = validateCoordinates(lat, lng) 
    ? calcularDistanciaMar(lat!, lng!) 
    : undefined;
  
  // Especificações
  const specs = {
    totalArea: parseArea(vista.AreaTotal),
    privateArea: parseArea(vista.AreaPrivativa),
    landArea: parseArea(vista.AreaTerreno),
    bedrooms: parseInteger(vista.Dormitorio || vista.Dormitorios),
    suites: parseInteger(vista.Suites || vista.Suite),
    bathrooms: parseInteger(vista.Banheiros || vista.Banheiro),
    halfBathrooms: parseInteger(vista.Lavabos),
    parkingSpots: parseInteger(vista.Vagas || vista.VagasGaragem),
    floor: parseInteger(vista.Andar),
    totalFloors: parseInteger(vista.TotalAndares),
  };
  
  // DEBUG: Log especificações em desenvolvimento
  const ENABLE_VERBOSE_LOGS = false; // Altere para true se precisar debugar
  
  if (ENABLE_VERBOSE_LOGS && process.env.NODE_ENV === 'development') {
    console.log(`[PropertyMapper] Specs para ${vista.Codigo}:`, {
      raw: {
        AreaTotal: vista.AreaTotal,
        AreaPrivativa: vista.AreaPrivativa,
        Dormitorios: vista.Dormitorios,
        Suites: vista.Suites,
        Vagas: vista.Vagas,
      },
      parsed: specs,
    });
  }
  
  // Características (expandidas com todos os campos booleanos)
  const features: PropertyFeatures = {
    furnished: parseBoolean(vista.Mobiliado),
    petFriendly: parseBoolean(vista.AceitaPet),
    accessible: parseBoolean(vista.Acessibilidade),
    balcony: parseBoolean(vista.Sacada || vista.VarandaGourmet || vista.Varanda),
    oceanView: parseBoolean(vista.VistaMar),
    pool: parseBoolean(vista.Piscina),
    gym: parseBoolean(vista.Academia),
    elevator: parseBoolean(vista.Elevador),
    bbqGrill: parseBoolean(vista.Churrasqueira),
    fireplace: parseBoolean(vista.Lareira),
    sauna: parseBoolean(vista.Sauna),
    partyRoom: parseBoolean(vista.SalaoFestas),
    playground: parseBoolean(vista.Playground),
    sportsField: parseBoolean(vista.Quadra),
    bikeRack: parseBoolean(vista.Bicicletario),
    jacuzzi: parseBoolean(vista.Hidromassagem),
    heating: parseBoolean(vista.Aquecimento),
    airConditioning: parseBoolean(vista.ArCondicionado),
    alarm: parseBoolean(vista.Alarme),
    intercom: parseBoolean(vista.Interfone),
    electricFence: parseBoolean(vista.CercaEletrica),
    garden: parseBoolean(vista.Jardim),
    backyard: parseBoolean(vista.Quintal),
    gatedCommunity: parseBoolean(vista.Portaria24h),
  };
  
  // Título e descrição
  // Gera título descritivo se não houver título da API
  let title = cleanString(vista.Titulo || vista.TituloSite);
  
  if (!title) {
    // Gera título rico: "Apartamento de 3 quartos em Barra Sul, Balneário Camboriú"
    const typeCap = type.charAt(0).toUpperCase() + type.slice(1);
    const parts: string[] = [typeCap];
    
    if (specs.bedrooms && specs.bedrooms > 0) {
      parts.push(`de ${specs.bedrooms} ${specs.bedrooms === 1 ? 'quarto' : 'quartos'}`);
    }
    
    if (address.neighborhood) {
      parts.push(`em ${address.neighborhood}`);
    }
    
    if (address.city) {
      const lastPart = parts[parts.length - 1];
      if (lastPart.startsWith('em ')) {
        parts[parts.length - 1] = `${lastPart}, ${address.city}`;
      } else {
        parts.push(`em ${address.city}`);
      }
    }
    
    title = parts.join(' ');
  }
  
  const description = cleanDescription(vista.DescricaoWeb || vista.Descricao);
  const descriptionFull = description;
  
  // Fotos (com fallback para FotoDestaque se não houver galeria)
  const photos = mapVistaPhotos(vista);
  const galleryMissing = photos.length === 0 || (photos.length === 1 && photos[0].url === cleanString(vista.FotoDestaque));
  
  // Slug para SEO
  const slug = createSlug(`${type}-${code}-${address.neighborhood || address.city}`);
  
  // Corretor e agência
  // Suporta tanto objeto Corretor quanto string CorretorNome
  let realtor: Realtor | undefined = undefined;
  
  // DEBUG: Log para verificar estrutura de corretor
  // Logs desabilitados para performance
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(`[mapVistaToProperty] Código: ${vista.Codigo}`);
  //   console.log(`[mapVistaToProperty] Corretor?:`, vista.Corretor);
  //   console.log(`[mapVistaToProperty] CorretorNome?:`, vista.CorretorNome);
  // }
  
  if (vista.Corretor && typeof vista.Corretor === 'object' && 'Nome' in vista.Corretor) {
    realtor = mapVistaRealtor(vista.Corretor as import('@/providers/vista/types').VistaCorretor);
  } else if (vista.CorretorNome && typeof vista.CorretorNome === 'string') {
    // Fallback: criar objeto realtor apenas com o nome
    realtor = {
      name: cleanString(vista.CorretorNome) || vista.CorretorNome,
    };
  }
  
  const agency = vista.Agencia ? mapVistaAgency(vista.Agencia) : undefined;
  
  // Datas (conforme documentação Vista)
  const createdAt = parseDate(vista.DataCadastro);
  const updatedAt = parseDate(vista.DataHoraAtualizacao || vista.DataAtualizacao) || new Date();
  
  // Flags de visibilidade e prioridade
  const showOnWebsite = parseBoolean((vista as any).ExibirSite ?? (vista as any).ExibirWeb ?? (vista as any).PublicarSite ?? vista.ExibirNoSite ?? true); // Default true se não especificado
  const isExclusive = parseBoolean(vista.Exclusivo); // Prioridade 1
  let superHighlight = parseBoolean((vista as any).SuperDestaque); // Prioridade 2
  if (superHighlight === undefined) {
    const superKey = Object.keys(vista).find(k => /super\s*.*destaq|destaq\s*.*super|superdestaq/i.test(k));
    if (superKey) {
      superHighlight = parseBoolean((vista as any)[superKey]);
    }
  }
  const hasSignboard = parseBoolean(vista.TemPlaca ?? (vista as any).Placa); // Prioridade 3
  const webHighlight = parseBoolean((vista as any).DestaqueWeb); // Prioridade 4
  const isHighlight = parseBoolean((vista as any).Destaque); // Destaque genérico
  const isLaunch = parseBoolean(vista.Lancamento);
  const obraStatusCandidates = collectObraStatusCandidates(vista);
  const obraStatus = pickObraStatus(obraStatusCandidates, isLaunch);

  
  // DEBUG: Log dos campos RAW de flags (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    // Procurar por TODOS os campos que contenham "destaque" (case insensitive)
    const allKeysWithDestaque: Record<string, any> = {};
    const allKeysWithExclusivo: Record<string, any> = {};
    const allKeysWithPlaca: Record<string, any> = {};
    
    Object.keys(vista).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('destaque')) {
        allKeysWithDestaque[key] = vista[key];
      }
      if (lowerKey.includes('exclusivo')) {
        allKeysWithExclusivo[key] = vista[key];
      }
      if (lowerKey.includes('placa')) {
        allKeysWithPlaca[key] = vista[key];
      }
    });
    
    const flagsRaw = {
      Codigo: vista.Codigo,
      ExibirSite: vista.ExibirSite,
      ExibirWeb: vista.ExibirWeb,
      PublicarSite: vista.PublicarSite,
      Exclusivo: vista.Exclusivo,
      SuperDestaque: vista.SuperDestaque,
      TemPlaca: vista.TemPlaca,
      Placa: vista.Placa,
      DestaqueWeb: vista.DestaqueWeb,
      Destaque: vista.Destaque,
      Lancamento: vista.Lancamento,
    };
    
    // Log do imóvel PH1060 especificamente (que o usuário CONFIRMOU ter Super Destaque marcado no CRM)
    if (vista.Codigo === 'PH1060') {
      console.log('%c[PropertyMapper] ============ IMÓVEL PH1060 (COM SUPER DESTAQUE NO CRM) ============', 'background: #ff0000; color: white; font-weight: bold; padding: 8px;');
      console.log('[PropertyMapper] Flags que estou tentando ler:', flagsRaw);
      console.log('[PropertyMapper] TODOS os campos que contêm "destaque":', allKeysWithDestaque);
      console.log('[PropertyMapper] TODOS os campos que contêm "exclusivo":', allKeysWithExclusivo);
      console.log('[PropertyMapper] TODOS os campos que contêm "placa":', allKeysWithPlaca);
      console.log('%c[PropertyMapper] === TODAS AS CHAVES DISPONÍVEIS NO VISTA ===', 'background: #0000ff; color: white; font-weight: bold; padding: 8px;');
      console.log('[PropertyMapper] Total de campos:', Object.keys(vista).length);
      console.log('[PropertyMapper] Todas as chaves:', Object.keys(vista).sort());
      console.log('%c[PropertyMapper] === DADOS COMPLETOS DO VISTA ===', 'background: #0000ff; color: white; font-weight: bold; padding: 8px;');
      console.log('[PropertyMapper] Dados RAW completos:', vista);
      console.log('%c[PropertyMapper] ========================================', 'background: #ff0000; color: white; font-weight: bold; padding: 8px;');
    }
    
    // Log do imóvel PH1068 especificamente (que o usuário disse ter Super Destaque)
    if (vista.Codigo === 'PH1068') {
      console.log('%c[PropertyMapper] ============ IMÓVEL PH1068 ============', 'background: #ff0000; color: white; font-weight: bold; padding: 8px;');
      console.log('[PropertyMapper] Flags que estou tentando ler:', flagsRaw);
      console.log('[PropertyMapper] TODOS os campos que contêm "destaque":', allKeysWithDestaque);
      console.log('[PropertyMapper] TODOS os campos que contêm "exclusivo":', allKeysWithExclusivo);
      console.log('[PropertyMapper] TODOS os campos que contêm "placa":', allKeysWithPlaca);
      console.log('%c[PropertyMapper] ========================================', 'background: #ff0000; color: white; font-weight: bold; padding: 8px;');
    }
    
    // Log dos primeiros 3 imóveis de forma resumida
    // ✅ Debug flags silenciado para performance
    // if (vista.Codigo === 'PH1110' || vista.Codigo === 'PH1066') {
    //   console.log(`[PropertyMapper] Flags RAW do imóvel ${vista.Codigo}:`, flagsRaw);
    // }
  }
  
  // Características do imóvel (lista do Vista)
  // ⚠️ IMPORTANTE: Vista retorna "Caracteristicas" como um OBJETO (não array!)
  // Exemplo: { "Churrasqueira Carvao": "Sim", "Churrasqueira Gas": "Nao", "Mobiliado": "Sim", ... }
  
  const caracteristicasImovel: string[] = [];
  const caracteristicasLocalizacaoSet = new Set<string>();

  const normalizeKey = (valor: string): string =>
    (cleanString(valor) || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const addLocation = (label?: string) => {
    const cleaned = cleanString(label);
    if (cleaned) {
      caracteristicasLocalizacaoSet.add(cleaned);
    }
  };
  
  // DEBUG: Log para TODOS os imóveis (vai aparecer no TERMINAL DO SERVIDOR)
  // Log desabilitado para performance
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(`[PropertyMapper v3.0 - OBJETO] Processando ${vista.Codigo}...`);
  // }
  
  // Processar o objeto "Caracteristicas"
  // Mapeamento: chave do objeto Vista → nome exibido na UI
  const caracteristicasMap: Record<string, string> = {
    // Churrasqueiras (nomes exatos do Vista - com espaços!)
    'Churrasqueira Carvao': 'Churrasqueira a carvão',
    'Churrasqueira Gas': 'Churrasqueira a gás',
    'Churrasqueira': 'Churrasqueira', // fallback caso exista
    
    // Mobília
    'Mobiliado': 'Mobiliado',
    'Semi Mobiliado': 'Semi Mobiliado',
    
    // Áreas externas
    'Sacada': 'Sacada',
    'Varanda': 'Varanda',
    'Varanda Gourmet': 'Varanda Gourmet',
    'Terraco': 'Terraço',
    'Quintal': 'Quintal',
    'Jardim': 'Jardim',
    'Jardim Inverno': 'Jardim de Inverno',
    
    // Vistas
    'Vista Mar': 'Vista Mar',
    'Vista Panoramica': 'Vista Panorâmica',
    
    // Climatização
    'Ar Condicionado': 'Ar Condicionado',
    'Ar Central': 'Ar Central',
    'Aquecimento Eletrico': 'Aquecimento Elétrico',
    'Calefacao': 'Calefação',
    
    // Segurança
    'Alarme': 'Alarme',
    'Cerca Eletrica': 'Cerca Elétrica',
    'Interfone': 'Interfone',
    'Monitoramento': 'Monitoramento',
    
    // Outros
    'Lareira': 'Lareira',
    'Hidromassagem': 'Hidromassagem',
    'Sauna': 'Sauna',
    'Piscina': 'Piscina',
    'Academia': 'Academia',
    'Elevador': 'Elevador',
    'Lavabo': 'Lavabo',
    'Despensa': 'Despensa',
    'Armario Embutido': 'Armário Embutido',
    
    // Características que podem ser do imóvel OU do condomínio
    // (também estão em infraAliases para cobrir ambos os casos)
    'Rooftop': 'Rooftop',
    'Espaco Gourmet': 'Espaço Gourmet',
    'Playground': 'Playground',
    'Brinquedoteca': 'Brinquedoteca',
    'Cinema': 'Cinema',
    'Salao Festas': 'Salão de Festas',
    'Salao Jogos': 'Salão de Jogos',
    'Churrasqueira Gourmet': 'Churrasqueira Gourmet',
    'Piscina Aquecida': 'Piscina Aquecida',
    'Oportunidade': 'Oportunidade',
  };

  const locationAliases: Record<string, string> = {
    'avenida brasil': 'Avenida Brasil',
    'avenida atlantica': 'Avenida Atlântica',
    'barra norte': 'Barra Norte',
    'barra sul': 'Barra Sul',
    'centro': 'Centro',
    'fazenda': 'Fazenda',
    'nacoes': 'Nações',
    'nações': 'Nações',
    'pioneiros': 'Pioneiros',
    'praia brava': 'Praia Brava',
    'praia dos amores': 'Praia dos Amores',
    'frente mar': 'Frente Mar',
    'quadra mar': 'Quadra Mar',
    'segunda quadra': 'Segunda Quadra',
    'terceira quadra': 'Terceira Quadra',
    'terceira avenida': 'Terceira Avenida',
  };

  const infraAliases: Record<string, string> = {
    ...locationAliases,
    'academia': 'Academia',
    'bicicletario': 'Bicicletário',
    'brinquedoteca': 'Brinquedoteca',
    'cinema': 'Cinema',
    'espaco beauty': 'Espaço Beauty',
    'espaco gourmet': 'Espaço Gourmet',
    'espaco kids': 'Espaço Kids',
    'espaco teen': 'Espaço Teen',
    'garagem coberta': 'Garagem coberta',
    'heliporto': 'Heliponto',
    'heliponto': 'Heliponto',
    'jardim': 'Jardim',
    'pet care': 'Pet Care',
    'pilates': 'Pilates',
    'playground': 'Playground',
    'portaria': 'Portaria',
    'portaria24 hrs': 'Portaria 24h',
    'quadra': 'Quadra',
    'quadra esportes': 'Quadra de Esportes',
    'quadra poli esportiva': 'Quadra Poliesportiva',
    'quadra tenis': 'Quadra de Tênis',
    'rooftop': 'Rooftop',
    'sala fitness': 'Academia',
    'salao festas': 'Salão de Festas',
    'salao jogos': 'Salão de Jogos',
    'sauna': 'Sauna',
    'spa': 'SPA',
    'vigilancia24 horas': 'Vigilância 24h',
  };
  
  // Processar o objeto Caracteristicas
  if (vista.Caracteristicas && typeof vista.Caracteristicas === 'object' && !Array.isArray(vista.Caracteristicas)) {
    Object.entries(vista.Caracteristicas).forEach(([key, value]) => {
      if (value !== 'Sim') {
        return;
      }

      const normalized = normalizeKey(key);
      const locationLabel = locationAliases[normalized];

      if (locationLabel) {
        addLocation(locationLabel);
        return;
      }

      // Tentar encontrar o nome mapeado, senão usar o nome original
      const displayName = caracteristicasMap[key] || caracteristicasMap[normalized] || key;
      
      if (!caracteristicasImovel.includes(displayName)) {
        caracteristicasImovel.push(displayName);
      }
    });
  }
  
  // Fallback: se Caracteristicas for um array (formato antigo)
  if (Array.isArray(vista.Caracteristicas)) {
    vista.Caracteristicas.filter(Boolean).forEach(c => {
      const cleaned = cleanString(c) || String(c);
      if (!caracteristicasImovel.includes(cleaned)) {
        caracteristicasImovel.push(cleaned);
      }
    });
  }
  
  // Características da localização (infraestrutura do condomínio)
  // Vista pode retornar array ou objeto em "InfraEstrutura"
  
  if (Array.isArray(vista.InfraEstrutura)) {
    vista.InfraEstrutura.filter(Boolean).forEach(item => addLocation(item as string));
  } else if (vista.InfraEstrutura && typeof vista.InfraEstrutura === 'object') {
    Object.entries(vista.InfraEstrutura).forEach(([key, value]) => {
      if (!parseBoolean(value) && value !== 'Sim') {
        return;
      }

      const normalized = normalizeKey(key);
      const label = infraAliases[normalized] || cleanString(key) || key;
      addLocation(label);
    });
  }

  // Incluir bairro e bairro comercial explícitos
  addLocation(vista.Bairro);
  addLocation((vista as any)?.BairroComercial);

  // Inferir avenidas principais a partir do endereço
  const enderecoNormalizado = cleanString(vista.Endereco)?.toLowerCase() || '';
  if (enderecoNormalizado.includes('avenida brasil')) {
    addLocation('Avenida Brasil');
  }
  if (enderecoNormalizado.includes('avenida atl') || enderecoNormalizado.includes('av. atl')) {
    addLocation('Avenida Atlântica');
  }

  const caracteristicasLocalizacao = Array.from(caracteristicasLocalizacaoSet);

  // ✅ CORREÇÃO CRÍTICA: Next.js unstable_cache remove propriedades undefined durante serialização JSON
  // Garantir que TODAS as propriedades tenham valores padrão (null, {}, []) em vez de undefined
  return {
    id,
    code,
    title: title || '',
    description: description || '',
    descriptionFull: descriptionFull || '',
    type,
    status,
    purpose,
    obraStatus: obraStatus || undefined,
    // ✅ Garantir que address sempre tenha todas as propriedades definidas
    address: {
      street: address?.street || '',
      number: address?.number || '',
      complement: address?.complement || undefined,
      neighborhood: address?.neighborhood || '',
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || undefined,
      coordinates: address?.coordinates || undefined,
    },
    buildingName: buildingName || undefined, // Nome do empreendimento/condomínio
    builderName: builderName || undefined,
    buildingId: buildingId || undefined, // ID interno Pharos
    distanciaMar: distanciaMar || undefined, // Distância calculada em metros
    // ✅ Garantir que pricing sempre seja um objeto completo (usar 0 em vez de undefined para evitar remoção pelo JSON.stringify)
    pricing: {
      sale: pricing?.sale ?? undefined,
      rent: pricing?.rent ?? undefined,
      condo: pricing?.condo ?? undefined,
      iptu: pricing?.iptu ?? undefined,
    },
    // ✅ Garantir que specs sempre seja um objeto completo
    specs: {
      totalArea: specs?.totalArea ?? undefined,
      privateArea: specs?.privateArea ?? undefined,
      landArea: specs?.landArea ?? undefined,
      bedrooms: specs?.bedrooms ?? 0,
      suites: specs?.suites ?? 0,
      bathrooms: specs?.bathrooms ?? 0,
      halfBathrooms: specs?.halfBathrooms ?? undefined,
      parkingSpots: specs?.parkingSpots ?? 0,
      floor: specs?.floor ?? undefined,
      totalFloors: specs?.totalFloors ?? undefined,
    },
    // ✅ Garantir que features sempre seja um objeto (pode estar vazio)
    features: features || {},
    // ✅ Garantir que photos sempre seja um array
    photos: photos && photos.length > 0 ? photos : [],
    galleryMissing: galleryMissing || false, // Flag para indicar galeria não disponível
    videos: normalizeVistaVideosField(vista) || [],
    virtualTour: normalizeVistaTourField(vista) || undefined,
    attachments: normalizeVistaAttachmentsField(vista) || [],
    realtor: realtor || undefined,
    agency: agency || undefined,
    createdAt: createdAt || new Date(),
    updatedAt: updatedAt || new Date(),
    slug: slug || '',
    showOnWebsite: showOnWebsite ?? true,
    isExclusive: isExclusive || false,
    superHighlight: superHighlight || false,
    hasSignboard: hasSignboard || false,
    webHighlight: webHighlight || false,
    isHighlight: isHighlight || false,
    isLaunch: isLaunch || false,
    caracteristicasImovel: caracteristicasImovel.filter((c): c is string => typeof c === 'string'), // Array de características do imóvel
    caracteristicasLocalizacao: caracteristicasLocalizacao.filter((c): c is string => typeof c === 'string'), // Array de características do empreendimento
    providerData: {
      provider: 'vista',
      originalId: String(vista.Codigo),
      raw: vista, // Mantém dados originais para debug
      obraStatusCandidates: process.env.NODE_ENV === 'development' ? obraStatusCandidates : undefined,
    },
  };
}

/**
 * Mapeia fotos do Vista com sanitização de URLs
 * Suporta novo formato do Vista CRM: {"Foto":["Foto","FotoPequena","Destaque"]}
 */
function mapVistaPhotos(vista: VistaImovel): Photo[] {
  const photos: Photo[] = [];
  
  // DEBUG: Log para verificar estrutura de fotos
  // Logs desabilitados para performance
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(`[mapVistaPhotos] Código: ${vista.Codigo}`);
  //   console.log(`[mapVistaPhotos] Foto (array)?:`, vista.Foto ? `SIM (${Array.isArray(vista.Foto) ? vista.Foto.length : 'não é array'})` : 'NÃO');
  //   console.log(`[mapVistaPhotos] fotos (array)?:`, vista.fotos ? `SIM (${Array.isArray(vista.fotos) ? vista.fotos.length : 'não é array'})` : 'NÃO');
  //   console.log(`[mapVistaPhotos] FotoDestaque?:`, vista.FotoDestaque ? 'SIM' : 'NÃO');
  //   
  //   if (vista.Foto && Array.isArray(vista.Foto)) {
  //     console.log(`[mapVistaPhotos] Primeira foto do array:`, vista.Foto[0]);
  //   }
  // }
  
  // Função auxiliar para sanitizar URLs
  const sanitizeUrl = (url: any): string | undefined => {
    const cleaned = cleanString(url);
    if (!cleaned) return undefined;
    
    try {
      if (!cleaned.startsWith('http')) return undefined;
      
      const parsed = new URL(cleaned);
      parsed.protocol = 'https:'; // Força HTTPS
      
      // Normaliza domínio Vista
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'www.vistasoft.com.br' || hostname === 'sandbox.vistahost.com.br') {
        return `https://cdn.vistahost.com.br${parsed.pathname}${parsed.search}`;
      }
      
      return parsed.toString();
    } catch {
      return undefined;
    }
  };
  
  // NOVO: Processar fotos do campo "Foto" (formato oficial)
  // Pode vir como Array de objetos OU como Objeto numerado {'1': {...}, '2': {...}}
  if (vista.Foto) {
    const fotoSource = Array.isArray(vista.Foto)
      ? vista.Foto
      : (typeof vista.Foto === 'object' ? Object.values(vista.Foto as Record<string, any>) : []);
    
    if (Array.isArray(fotoSource) && fotoSource.length > 0) {
      // Log desabilitado para performance
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`[mapVistaPhotos] Processando ${fotoSource.length} fotos do 'Foto' (${Array.isArray(vista.Foto) ? 'array' : 'objeto→array'})`);
      // }
      fotoSource.forEach((foto: any, index: number) => {
        if (!foto || typeof foto !== 'object') return;
        
        const url = sanitizeUrl(foto.Foto || foto.FotoGrande || foto.FotoMedia || foto.URL || foto.url);
        if (!url) return;
        
        const isHighlight = parseBoolean(foto.Destaque);
        
        photos.push({
          url,
          thumbnail: sanitizeUrl(foto.FotoPequena || foto.FotoMedia) || url,
          title: cleanString(foto.Titulo),
          description: cleanString(foto.Descricao),
          order: foto.Ordem !== undefined ? Number(foto.Ordem) : index,
          isHighlight,
        });
      });
    }
  }
  
  // FALLBACK 1: Campo "fotos" (minúsculo) - formato antigo
  if (photos.length === 0 && vista.fotos && Array.isArray(vista.fotos)) {
    vista.fotos.forEach((foto, index) => {
      const url = sanitizeUrl(foto.FotoGrande || foto.Foto || foto.FotoMedia);
      if (!url) return;
      
      const isHighlight = parseBoolean(foto.Destaque);
      
      photos.push({
        url,
        thumbnail: sanitizeUrl(foto.FotoPequena || foto.FotoMedia) || url,
        title: cleanString(foto.Titulo),
        description: cleanString(foto.Descricao),
        order: foto.Ordem !== undefined ? Number(foto.Ordem) : index + 1,
        isHighlight,
      });
    });
  }
  
  // FALLBACK 2: FotoDestaque (último recurso) - conforme documentação Vista
  if (photos.length === 0) {
    const highlightUrl = sanitizeUrl(vista.FotoDestaque || vista.FotoCapa);
    const thumbnailUrl = sanitizeUrl(vista.FotoDestaquePequena);
    if (highlightUrl) {
      photos.push({
        url: highlightUrl,
        thumbnail: thumbnailUrl || highlightUrl, // Usa FotoDestaquePequena se disponível
        isHighlight: true,
        order: 0,
      });
    }
  }
  
  // Remove duplicatas
  const seen = new Set<string>();
  const unique = photos.filter(photo => {
    const normalized = photo.url.split('?')[0].toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  
  // Ordena por ordem (foto destaque primeiro)
  unique.sort((a, b) => {
    // Fotos destaque vêm primeiro
    if (a.isHighlight && !b.isHighlight) return -1;
    if (!a.isHighlight && b.isHighlight) return 1;
    // Depois por ordem
    return (a.order || 0) - (b.order || 0);
  });
  
  return unique;
}

/**
 * Mapeia corretor do Vista
 */
function mapVistaRealtor(corretor: VistaCorretor): Realtor {
  return {
    id: corretor.Codigo ? String(corretor.Codigo) : undefined,
    name: corretor.Nome,
    email: cleanString(corretor.Email),
    phone: normalizePhone(corretor.Fone || corretor.Telefone || corretor.Celular),
    whatsapp: normalizePhone(corretor.Celular),
    creci: cleanString(corretor.Creci),
    photo: cleanString(corretor.Foto),
  };
}

/**
 * Mapeia agência do Vista
 */
function mapVistaAgency(agencia: VistaAgencia): Agency {
  const address = [
    cleanString(agencia.Endereco),
    cleanString(agencia.Numero),
    cleanString(agencia.Complemento),
    cleanString(agencia.Bairro),
    cleanString(agencia.Cidade),
  ].filter(Boolean).join(', ');
  
  return {
    id: agencia.Codigo ? String(agencia.Codigo) : undefined,
    name: agencia.Nome,
    phone: normalizePhone(agencia.Fone || agencia.Telefone),
    email: cleanString(agencia.Email),
    address: address || undefined,
    logo: cleanString(agencia.Logo),
  };
}

/**
 * Parse de valores booleanos do Vista
 * Vista pode retornar: "Sim", "Não", "S", "N", true, false, 1, 0
 */
function parseBoolean(value: any): boolean | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value > 0;
  }
  
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (normalized === 'sim' || normalized === 's' || normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'não' || normalized === 'nao' || normalized === 'n' || normalized === 'false' || normalized === '0') {
      return false;
    }
  }
  
  return undefined;
}

