/**
 * Normalizers de Datas
 * 
 * Funções para parsing e formatação de datas
 */

/**
 * Parse de data do Vista
 * 
 * Formatos aceitos:
 * - ISO 8601: "2024-01-15T10:00:00.000Z"
 * - BR: "15/01/2024"
 * - US: "2024-01-15"
 */
export function parseDate(value: any): Date | undefined {
  if (!value) return undefined;

  // Se já é Date
  if (value instanceof Date) {
    return isValidDate(value) ? value : undefined;
  }

  // Se é timestamp numérico
  if (typeof value === 'number') {
    const date = new Date(value);
    return isValidDate(date) ? date : undefined;
  }

  // Se é string
  if (typeof value === 'string') {
    // Tenta parsing direto (ISO 8601)
    let date = new Date(value);
    if (isValidDate(date)) {
      return date;
    }

    // Tenta formato BR: dd/mm/yyyy ou dd-mm-yyyy
    const brMatch = value.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      date = new Date(`${year}-${month}-${day}`);
      if (isValidDate(date)) {
        return date;
      }
    }
  }

  return undefined;
}

/**
 * Valida se é uma data válida
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Formata data para exibição PT-BR (DD/MM/YYYY)
 */
export function formatDate(date: Date | undefined): string {
  if (!date || !isValidDate(date)) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Formata data com hora (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: Date | undefined): string {
  if (!date || !isValidDate(date)) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Retorna data relativa (há 2 dias, há 1 mês, etc.)
 */
export function relativeDate(date: Date | undefined): string {
  if (!date || !isValidDate(date)) {
    return '-';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;
  
  return `Há ${Math.floor(diffDays / 365)} anos`;
}

/**
 * Converte Date para formato ISO string (para API)
 */
export function toISOString(date: Date | undefined): string | undefined {
  if (!date || !isValidDate(date)) {
    return undefined;
  }

  return date.toISOString();
}

/**
 * Converte Date para formato Vista (YYYY-MM-DD)
 */
export function toVistaDate(date: Date | undefined): string | undefined {
  if (!date || !isValidDate(date)) {
    return undefined;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

