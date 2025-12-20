/**
 * Mapeamento de Empreendimentos
 * 
 * Mapeia nome do empreendimento/condomínio (Vista) → ID interno (Pharos)
 */

export interface EmpreendimentoMap {
  id: string;
  nomes: string[]; // Variações do nome que podem vir da API
  nome: string;    // Nome oficial
}

/**
 * Lista de empreendimentos cadastrados
 */
export const EMPREENDIMENTOS_MAP: EmpreendimentoMap[] = [
  {
    id: 'boreal-tower',
    nomes: [
      'Boreal Tower',
      'Torre Boreal',
      'Edifício Boreal Tower',
      'Condomínio Boreal Tower',
      'Residencial Boreal Tower',
      'BOREAL TOWER',
    ],
    nome: 'Boreal Tower',
  },
  {
    id: 'infinity-coast',
    nomes: [
      'Infinity Coast',
      'Edifício Infinity Coast',
      'Condomínio Infinity Coast',
      'Residencial Infinity Coast',
      'INFINITY COAST',
    ],
    nome: 'Infinity Coast',
  },
  {
    id: 'grand-place-tower',
    nomes: [
      'Grand Place Tower',
      'Torre Grand Place',
      'Edifício Grand Place Tower',
      'Condomínio Grand Place',
      'GRAND PLACE TOWER',
    ],
    nome: 'Grand Place Tower',
  },
  {
    id: 'eleganza-tower',
    nomes: [
      'Eleganza Tower',
      'Torre Eleganza',
      'Edifício Eleganza Tower',
      'Condomínio Eleganza',
      'ELEGANZA TOWER',
    ],
    nome: 'Eleganza Tower',
  },
  {
    id: 'green-valley',
    nomes: [
      'Green Valley',
      'Residencial Green Valley',
      'Condomínio Green Valley',
      'GREEN VALLEY',
    ],
    nome: 'Green Valley',
  },
  {
    id: 'villa-veneto',
    nomes: [
      'Villa Veneto',
      'Edifício Villa Veneto',
      'Condomínio Villa Veneto',
      'VILLA VENETO',
    ],
    nome: 'Villa Veneto',
  },
  {
    id: 'barra-sul-residence',
    nomes: [
      'Barra Sul Residence',
      'Residencial Barra Sul',
      'Condomínio Barra Sul Residence',
      'BARRA SUL RESIDENCE',
    ],
    nome: 'Barra Sul Residence',
  },
  {
    id: 'oceanic-tower',
    nomes: [
      'Oceanic Tower',
      'Torre Oceanic',
      'Edifício Oceanic Tower',
      'Condomínio Oceanic',
      'OCEANIC TOWER',
    ],
    nome: 'Oceanic Tower',
  },
  {
    id: 'costa-azul',
    nomes: [
      'Costa Azul',
      'Residencial Costa Azul',
      'Condomínio Costa Azul',
      'COSTA AZUL',
    ],
    nome: 'Costa Azul',
  },
  // Adicione mais empreendimentos conforme necessário
];

/**
 * Normaliza nome para comparação
 * @param nome Nome a normalizar
 * @returns Nome normalizado (lowercase, sem acentos, sem espaços extras)
 */
function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
}

/**
 * Encontra ID do empreendimento pelo nome
 * @param nomeVista Nome do empreendimento vindo da API Vista
 * @returns ID do empreendimento ou undefined se não encontrado
 */
export function encontrarEmpreendimentoId(nomeVista?: string | null): string | undefined {
  if (!nomeVista || typeof nomeVista !== 'string') {
    return undefined;
  }

  const nomeNormalizado = normalizarNome(nomeVista);

  // Buscar match exato ou parcial
  for (const emp of EMPREENDIMENTOS_MAP) {
    for (const variacao of emp.nomes) {
      const variacaoNormalizada = normalizarNome(variacao);
      
      // Match exato
      if (nomeNormalizado === variacaoNormalizada) {
        return emp.id;
      }
      
      // Match parcial (nome contém a variação ou vice-versa)
      if (
        nomeNormalizado.includes(variacaoNormalizada) ||
        variacaoNormalizada.includes(nomeNormalizado)
      ) {
        return emp.id;
      }
    }
  }

  // Não encontrado - log para monitoramento
  if (typeof window !== 'undefined') {
    console.info('[EmpreendimentoMapping] Não mapeado:', nomeVista);
  }

  return undefined;
}

/**
 * Busca dados do empreendimento pelo ID
 * @param id ID do empreendimento
 * @returns Dados do empreendimento ou undefined
 */
export function buscarEmpreendimentoPorId(id?: string): EmpreendimentoMap | undefined {
  if (!id) return undefined;
  return EMPREENDIMENTOS_MAP.find(emp => emp.id === id);
}

/**
 * Busca dados do empreendimento pelo nome Vista
 * @param nomeVista Nome do empreendimento vindo da API Vista
 * @returns Dados do empreendimento ou undefined
 */
export function buscarEmpreendimentoPorNome(nomeVista?: string | null): EmpreendimentoMap | undefined {
  const id = encontrarEmpreendimentoId(nomeVista);
  return id ? buscarEmpreendimentoPorId(id) : undefined;
}

/**
 * Lista todos os empreendimentos
 * @returns Lista de empreendimentos
 */
export function listarEmpreendimentos(): EmpreendimentoMap[] {
  return EMPREENDIMENTOS_MAP;
}

