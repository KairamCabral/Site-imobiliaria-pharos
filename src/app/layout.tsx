import "./globals.css";
import { Inter } from "next/font/google";
import { FilterDrawerContextProvider } from "@/contexts/FilterDrawerContext";
import { FavoritosProvider } from "@/contexts/FavoritosContext";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import GTMScript from "@/components/GTMScript";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import { PWAProvider } from "@/components/PWAInstallPrompt";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { ImagePerformanceMonitor } from "@/components/ImagePerformanceMonitor";

// Configuração da fonte Inter como padrão para todo o projeto
// display: swap evita FOIT (Flash of Invisible Text)
// preload: true adiciona <link rel="preload"> automaticamente
// Usando apenas 2 weights (400 e 700) para reduzir payload
// CSS font-weight: 600 vai interpolar entre 400 e 700 automaticamente
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"], // Apenas 2 weights = -33% no tamanho das fontes
  variable: "--font-inter",
  preload: true, // Preload automático
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true, // Ajusta métricas do fallback para reduzir CLS
});

export const metadata = {
  title: "Pharos Negócios Imobiliários | Imóveis de Alto Padrão em Balneário Camboriú",
  description: "Encontre imóveis de alto padrão em Balneário Camboriú e região. Apartamentos, casas e terrenos exclusivos com a Pharos Imobiliária.",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/images/logos/Favicon.png', sizes: 'any' },
    ],
    apple: [
      { url: '/images/logos/Favicon.png' },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.imob.br'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pharos',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <head>
         {/* Inline Critical CSS EXPANDIDO para Above-the-Fold */}
         <style dangerouslySetInnerHTML={{__html: `
           *{box-sizing:border-box;margin:0;padding:0}
           body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;background:#fff;color:#1f2937;line-height:1.5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
           
           /* Cores base */
           .bg-gray-50{background-color:#f9fafb}
           .bg-gray-100{background-color:#f3f4f6}
           .bg-gray-900{background-color:#111827}
           .bg-white{background-color:#fff}
           .bg-pharos-navy-900{background-color:#0B1E47}
           .text-pharos-gold{color:#D4AF37}
           .text-gray-600{color:#4b5563}
           
           /* Layout */
           .relative{position:relative}
           .absolute{position:absolute}
           .fixed{position:fixed}
           .inset-0{top:0;right:0;bottom:0;left:0}
           .overflow-hidden{overflow:hidden}
           
           /* Dimensões */
           .h-\\[65vh\\]{height:65vh}
           .min-h-\\[680px\\]{min-height:680px}
           .min-h-screen{min-height:100vh}
           .w-full{width:100%}
           .h-full{height:100%}
           
           /* Flexbox */
           .flex{display:flex}
           .flex-col{flex-direction:column}
           .items-center{align-items:center}
           .items-start{align-items:flex-start}
           .justify-center{justify-content:center}
           .justify-between{justify-content:space-between}
           .gap-4{gap:1rem}
           .gap-6{gap:1.5rem}
           
           /* Grid */
           .grid{display:grid}
           .grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
           @media(min-width:768px){.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
           @media(min-width:1024px){.lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}
           
           /* Imagens */
           .object-cover{object-fit:cover}
           .object-center{object-position:center}
           img,picture{max-width:100%;height:auto;display:block}
           
           /* Z-index */
           .z-10{z-index:10}
           .z-20{z-index:20}
           .z-50{z-index:50}
           
           /* Espaçamento */
           .p-4{padding:1rem}
           .px-4{padding-left:1rem;padding-right:1rem}
           .py-6{padding-top:1.5rem;padding-bottom:1.5rem}
           .pt-20{padding-top:5rem}
           .mb-4{margin-bottom:1rem}
           .mb-6{margin-bottom:1.5rem}
           
           /* Tipografia */
           .text-sm{font-size:0.875rem;line-height:1.25rem}
           .text-base{font-size:1rem;line-height:1.5rem}
           .text-lg{font-size:1.125rem;line-height:1.75rem}
           .text-xl{font-size:1.25rem;line-height:1.75rem}
           .text-2xl{font-size:1.5rem;line-height:2rem}
           .text-3xl{font-size:1.875rem;line-height:2.25rem}
           .font-medium{font-weight:500}
           .font-semibold{font-weight:600}
           .font-bold{font-weight:700}
           .text-center{text-align:center}
           
           /* Bordas e sombras */
           .rounded-lg{border-radius:0.5rem}
           .rounded-xl{border-radius:0.75rem}
           .rounded-2xl{border-radius:1rem}
           .shadow-sm{box-shadow:0 1px 2px 0 rgba(0,0,0,.05)}
           .shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)}
           .shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)}
           
           /* Animações de loading */
           .animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}
           @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
           
           /* Transições */
           .transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:150ms}
           .duration-300{transition-duration:300ms}
           
           /* Container responsivo */
           .container{width:100%;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem}
           @media(min-width:640px){.container{max-width:640px;padding-left:1.5rem;padding-right:1.5rem}}
           @media(min-width:768px){.container{max-width:768px}}
           @media(min-width:1024px){.container{max-width:1024px}}
           @media(min-width:1280px){.container{max-width:1280px}}
           @media(min-width:1536px){.container{max-width:1536px}}
           
           /* Skeleton placeholder */
           .skeleton{background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);background-size:200% 100%;animation:skeleton 1.5s ease-in-out infinite}
           @keyframes skeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}
         `}} />
         
         {/* DNS Prefetch para domínios externos críticos */}
         <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
         <link rel="dns-prefetch" href="https://cdn.vistahost.com.br" />
         
         {/* Preconnect APENAS para recursos críticos do hero */}
         <link rel="preconnect" href="https://cdn.vistahost.com.br" crossOrigin="anonymous" />
         
         {/* Preload de imagem LCP (hero banner) com imageSizes */}
         <link 
           rel="preload" 
           as="image" 
           href="/images/banners/optimized/balneario-camboriu-mobile.avif"
           type="image/avif"
           fetchPriority="high"
           media="(max-width: 640px)"
           imageSizes="640px"
         />
         <link 
           rel="preload" 
           as="image" 
           href="/images/banners/optimized/balneario-camboriu-tablet.avif"
           type="image/avif"
           fetchPriority="high"
           media="(min-width: 641px) and (max-width: 1024px)"
           imageSizes="1024px"
         />
         <link 
           rel="preload" 
           as="image" 
           href="/images/banners/optimized/balneario-camboriu-desktop.avif"
           type="image/avif"
           fetchPriority="high"
           media="(min-width: 1025px)"
           imageSizes="1920px"
         />
      </head>
      <body className="flex flex-col min-h-screen antialiased bg-white text-secondary-800">
        <PWAProvider>
          {/* Skip Navigation - Acessibilidade WCAG 2.1 AA */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-pharos-blue-500 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg focus:ring-4 focus:ring-pharos-blue-500/50 transition-all"
          >
            Pular para o conteúdo principal
          </a>
          
          {/* Scripts de terceiros com lazy loading */}
          <GTMScript />
          <WebVitalsReporter />
          <ServiceWorkerRegistration />
          <PerformanceMonitor />
          <ImagePerformanceMonitor />
          
          {/* Providers e layout */}
          <FavoritosProvider>
            <FilterDrawerContextProvider>
              <AnalyticsProvider />
              <Header />
              <main
                id="main-content"
                role="main"
                aria-label="Conteúdo principal"
                className="flex-grow pt-20"
                style={{ paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))' }}
              >
                {children}
              </main>
              <Footer />
            </FilterDrawerContextProvider>
          </FavoritosProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
