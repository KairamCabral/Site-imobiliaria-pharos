/**
 * Normalizers de Números
 * 
 * Funções para normalizar áreas, preços e outros números
 */

/**
 * Limpa string de preço e retorna número em reais (converte centavos se necessário)
 * 
 * Exemplos:
 * "R$ 1.500.000,00" → 1500000
 * "1.500.000,00" → 1500000
 * 320843833 (centavos) → 3208438.33 (reais)
 * 1500000 (reais) → 1500000
 */
export function parsePrice(value: any): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  // Se já é número, pode estar em centavos ou reais
  if (typeof value === 'number') {
    // Se o número for muito grande (> 10 milhões), provavelmente está em centavos
    // Valores normais de imóveis em reais: R$ 100.000 a R$ 10.000.000
    // Se vier em centavos: 10.000.000 centavos = R$ 100.000
    // Heurística: se > 100.000.000 (100 milhões), está em centavos
    if (value > 100000000) {
      return value / 100; // Converte centavos para reais
    }
    return value; // Já está em reais
  }

  // Se é string, limpa e converte
  if (typeof value === 'string') {
    // Remove símbolo e espaços
    const raw = value.replace(/R\$/g, '').replace(/\s/g, '').trim();

    let normalized = raw;

    // Regras de normalização:
    // 1) Formato BR (ex.: 5.413,00): pontos = milhar, vírgula = decimal
    // 2) Formato EN (ex.: 541.30): ponto = decimal
    // 3) Números simples (ex.: 5413 ou 541,30)
    if (raw.includes(',') && raw.includes('.')) {
      // Caso 1: BR com milhar e decimal
      normalized = raw.replace(/\./g, '').replace(',', '.');
    } else if (raw.includes(',')) {
      // Caso 3 (BR simples): vírgula = decimal
      normalized = raw.replace(',', '.');
    } else {
      // Caso 2 ou dígitos puros: manter ponto decimal se existir
      normalized = raw; // não remover pontos aqui
    }

    const parsed = parseFloat(normalized);
    
    if (isNaN(parsed) || parsed <= 0) {
      return undefined;
    }
    
    // Mesma heurística para strings parseadas
    if (parsed > 100000000) {
      return parsed / 100; // Converte centavos para reais
    }
    
    return parsed;
  }

  return undefined;
}

/**
 * Limpa string de área e retorna número em m²
 * 
 * Exemplos:
 * "150,50 m²" → 150.5
 * "150.50" → 150.5
 * "150,50" → 150.5
 */
export function parseArea(value: any): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  // Se já é número, retorna
  if (typeof value === 'number') {
    return value > 0 ? value : undefined;
  }

  // Se é string, limpa e converte
  if (typeof value === 'string') {
    // Remove m², m2, espaços e converte vírgula em ponto
    const cleaned = value
      .replace(/m²|m2|m/gi, '')
      .replace(/\s/g, '')
      .replace(',', '.')
      .trim();

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) || parsed <= 0 ? undefined : parsed;
  }

  return undefined;
}

/**
 * Parse de número inteiro (quartos, suítes, vagas, etc.)
 */
export function parseInteger(value: any): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Math.floor(value);
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

/**
 * Parse de coordenadas geográficas
 */
export function parseCoordinate(value: any): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(',', '.').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

/**
 * Valida se as coordenadas são válidas
 */
export function validateCoordinates(lat?: number, lng?: number): boolean {
  if (!lat || !lng) return false;
  
  // Latitude: -90 a 90
  // Longitude: -180 a 180
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Formata preço para exibição (R$ 1.500.000,00)
 */
export function formatPrice(value: number | undefined): string {
  if (value === undefined || value === null) {
    return 'Sob consulta';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata área para exibição (150,50 m²)
 */
export function formatArea(value: number | undefined): string {
  if (value === undefined || value === null) {
    return '-';
  }

  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} m²`;
}

