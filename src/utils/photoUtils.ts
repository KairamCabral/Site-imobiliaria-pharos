/**
 * Utilitários para normalização e sanitização de URLs de fotos
 * 
 * - Sanitiza http → https
 * - Normaliza domínios Vista
 * - Valida URLs
 */

/**
 * Domínios conhecidos do Vista CRM
 */
const VISTA_CDN_DOMAINS = [
  'cdn.vistahost.com.br',
  'www.vistasoft.com.br',
  'sandbox.vistahost.com.br',
  'img.vistahost.com.br',
  'fotos.vistahost.com.br',
];

const VISTA_IMOBI_DOMAINS = [
  'vista.imobi',
  'cdn.vista.imobi',
  'img.vista.imobi',
];

/**
 * Sanitiza URL de foto
 * - Converte http → https
 * - Preserva filename e path
 * - Normaliza domínios Vista para CDN quando possível
 */
export function sanitizePhotoUrl(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  
  try {
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    
    // Se não começar com http, assume que é relativa (não deveria acontecer com Vista)
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      console.warn('[photoUtils] URL sem protocolo:', trimmed);
      return undefined;
    }
    
    const parsed = new URL(trimmed);
    
    // 1. Força https
    parsed.protocol = 'https:';
    
    // 2. Normaliza domínio Vista
    const hostname = parsed.hostname.toLowerCase();
    
    // Se for sandbox ou www.vistasoft, tenta reescrever para CDN
    if (hostname === 'www.vistasoft.com.br' || hostname === 'sandbox.vistahost.com.br') {
      // Mantém o path completo (com filename)
      const fullPath = parsed.pathname + parsed.search + parsed.hash;
      
      // Reescreve para CDN principal
      return `https://cdn.vistahost.com.br${fullPath}`;
    }
    
    // Se já for CDN ou outro domínio Vista válido, apenas retorna com https
    if (VISTA_CDN_DOMAINS.some(domain => hostname.includes(domain))) {
      return parsed.toString();
    }
    
    if (VISTA_IMOBI_DOMAINS.some(domain => hostname.includes(domain))) {
      return parsed.toString();
    }
    
    // Se não for Vista, retorna como está (pode ser placeholder, unsplash, etc)
    return parsed.toString();
    
  } catch (error) {
    console.warn('[photoUtils] URL inválida:', url, error);
    return undefined;
  }
}

/**
 * Valida se URL é uma imagem válida
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    
    // Verifica extensão
    const ext = parsed.pathname.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (ext && validExtensions.includes(ext)) {
      return true;
    }
    
    // Vista às vezes não tem extensão na URL (usa query params)
    // Aceita se for domínio Vista conhecido
    const hostname = parsed.hostname.toLowerCase();
    const isVista = VISTA_CDN_DOMAINS.some(d => hostname.includes(d)) ||
                    VISTA_IMOBI_DOMAINS.some(d => hostname.includes(d));
    
    return isVista;
    
  } catch {
    return false;
  }
}

/**
 * Extrai melhor resolução disponível de um objeto de foto Vista
 */
export function extractBestPhotoUrl(foto: any): string | undefined {
  // Ordem de preferência: FotoGrande → Foto → FotoMedia
  const candidates = [
    foto.FotoGrande,
    foto.Foto,
    foto.FotoMedia,
  ];
  
  for (const url of candidates) {
    const sanitized = sanitizePhotoUrl(url);
    if (sanitized && isValidImageUrl(sanitized)) {
      return sanitized;
    }
  }
  
  return undefined;
}

/**
 * Extrai thumbnail de um objeto de foto Vista
 */
export function extractThumbnailUrl(foto: any, fallbackUrl?: string): string | undefined {
  // Ordem de preferência: FotoPequena → FotoMedia → fallback
  const candidates = [
    foto.FotoPequena,
    foto.FotoMedia,
    fallbackUrl,
  ];
  
  for (const url of candidates) {
    const sanitized = sanitizePhotoUrl(url);
    if (sanitized && isValidImageUrl(sanitized)) {
      return sanitized;
    }
  }
  
  return fallbackUrl;
}

/**
 * Remove duplicatas de URLs
 */
export function deduplicatePhotos<T extends { url: string }>(photos: T[]): T[] {
  const seen = new Set<string>();
  return photos.filter(photo => {
    // Normaliza URL para comparação (remove query params)
    const normalized = photo.url.split('?')[0].toLowerCase();
    
    if (seen.has(normalized)) {
      return false;
    }
    
    seen.add(normalized);
    return true;
  });
}

