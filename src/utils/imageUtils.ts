/**
 * Utilitários para tratamento de imagens
 */

// Placeholder SVG base64 para usar quando imagens não carregam
export const PLACEHOLDER_SVG_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2U5ZWNlZiIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltw7N2ZWw8L3RleHQ+PC9zdmc+';

// Função para verificar se a URL é externa
export const isExternalUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    // Se a URL não começa com http/https, é relativa (interna)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // Parse da URL
    const parsedUrl = new URL(url);
    
    // No servidor (SSR), window não existe
    // Neste caso, verificamos apenas se é um domínio externo conhecido
    if (typeof window === 'undefined') {
      // Lista de domínios externos conhecidos que devem ser tratados como externos
      const externalDomains = [
        'images.unsplash.com',
        'cdn.vistahost.com.br',
        'via.placeholder.com',
        'placehold.co',
        'picsum.photos'
      ];
      
      return externalDomains.some(domain => parsedUrl.hostname.includes(domain));
    }
    
    // No cliente, podemos comparar com o origin atual
    return parsedUrl.origin !== window.location.origin;
  } catch (e) {
    return false;
  }
}; 