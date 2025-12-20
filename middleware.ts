import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Segurança - Imobiliária Pharos
 * 
 * Implementa headers de segurança conforme OWASP e boas práticas
 * Protege contra: XSS, Clickjacking, MIME Sniffing, etc.
 */

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // ========================================
  // CONTENT SECURITY POLICY (CSP)
  // ========================================
  const csp = [
    "default-src 'self'",
    // Scripts: GTM, Analytics, Tracking
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com *.google-analytics.com *.facebook.net *.hotjar.com *.mautic.com challenges.cloudflare.com",
    // Estilos: Google Fonts, Inline styles
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    // Imagens: CDNs de imóveis + Analytics
    "img-src 'self' data: blob: https: *.vistahost.com.br *.dwvapp.com.br *.b-cdn.net *.unsplash.com *.googleapis.com *.google-analytics.com *.facebook.com *.doubleclick.net",
    // Fontes
    "font-src 'self' data: fonts.gstatic.com",
    // Conexões: APIs externas e tracking
    "connect-src 'self' *.googletagmanager.com *.google-analytics.com *.facebook.com *.facebook.net *.hotjar.com *.mautic.com *.contact2sale.com *.vistahost.com.br *.dwvapp.com.br api.cloudflare.com",
    // Frames: Google Maps, YouTube (se necessário)
    "frame-src 'self' *.google.com *.youtube.com *.facebook.com",
    // Objetos: bloqueados (Flash, Java Applets)
    "object-src 'none'",
    // Base URI: previne ataques de injeção de base
    "base-uri 'self'",
    // Form Action: apenas submissões para próprio domínio
    "form-action 'self'",
    // Frame Ancestors: previne clickjacking
    "frame-ancestors 'none'",
    // Upgrade para HTTPS automaticamente
    "upgrade-insecure-requests",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // ========================================
  // PROTEÇÃO CONTRA CLICKJACKING
  // ========================================
  response.headers.set('X-Frame-Options', 'DENY');
  
  // ========================================
  // PREVINE MIME SNIFFING
  // ========================================
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // ========================================
  // XSS PROTECTION (legacy browsers)
  // ========================================
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // ========================================
  // REFERRER POLICY
  // ========================================
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // ========================================
  // PERMISSIONS POLICY
  // ========================================
  const permissions = [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'interest-cohort=()', // Bloqueia FLoC do Google
    'payment=()',
    'usb=()',
  ].join(', ');
  response.headers.set('Permissions-Policy', permissions);
  
  // ========================================
  // HSTS (HTTPS Strict Transport Security)
  // Apenas em produção HTTPS
  // ========================================
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // ========================================
  // CORS PARA APIs
  // ========================================
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      'https://pharos.imob.br',
      'https://www.pharos.imob.br',
      'http://localhost:3600',
      'http://localhost:3700',
      'http://localhost:3000',
    ].filter(Boolean) as string[];
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24h
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204, 
        headers: response.headers 
      });
    }
  }
  
  // ========================================
  // REMOVE HEADERS QUE EXPÕEM INFORMAÇÕES
  // ========================================
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  return response;
}

/**
 * Configuração do Matcher
 * Define quais rotas o middleware deve processar
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2)$).*)',
  ],
};

