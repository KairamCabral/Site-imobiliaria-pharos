/**
 * Normalizers de Strings
 * 
 * Funções para limpar e normalizar textos
 */

/**
 * Limpa e normaliza string removendo espaços extras
 */
export function cleanString(value: any): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    value = String(value);
  }

  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Limpa descrição preservando quebras de linha
 */
export function cleanDescription(value: any): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    value = String(value);
  }

  // Remove apenas espaços extras em cada linha, mas preserva quebras de linha
  const cleaned = value
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .join('\n')
    .trim();
    
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Normaliza título do imóvel
 */
export function normalizeTitle(type: string, city?: string, neighborhood?: string): string {
  const parts: string[] = [];

  // Capitaliza o tipo (apartamento -> Apartamento)
  if (type) {
    parts.push(capitalize(type));
  }

  if (neighborhood) {
    parts.push(`em ${neighborhood}`);
  } else if (city) {
    parts.push(`em ${city}`);
  }

  return parts.join(' ') || 'Imóvel';
}

/**
 * Cria slug a partir de string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início/fim
}

/**
 * Trunca texto com reticências
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Normaliza telefone removendo caracteres especiais
 */
export function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '');
  
  return cleaned.length >= 10 ? cleaned : undefined;
}

/**
 * Formata telefone para exibição (47) 99999-0000
 */
export function formatPhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;

  const cleaned = normalizePhone(phone);
  if (!cleaned) return undefined;

  // (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }

  return phone;
}

/**
 * Normaliza CEP
 */
export function normalizeCEP(cep: string | undefined): string | undefined {
  if (!cep) return undefined;
  
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8 ? cleaned : undefined;
}

/**
 * Formata CEP para exibição (88330-000)
 */
export function formatCEP(cep: string | undefined): string | undefined {
  if (!cep) return undefined;

  const cleaned = normalizeCEP(cep);
  if (!cleaned) return undefined;

  return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
}

