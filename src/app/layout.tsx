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
         {/* DNS Prefetch para domínios externos críticos */}
         <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
         <link rel="dns-prefetch" href="https://www.google-analytics.com" />
         <link rel="dns-prefetch" href="https://cdn.vistahost.com.br" />
         <link rel="dns-prefetch" href="https://dwvimagesv1.b-cdn.net" />
         
         {/* Preconnect para recursos críticos (DNS + TCP + TLS) */}
         <link rel="preconnect" href="https://fonts.googleapis.com" />
         <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
         <link rel="preconnect" href="https://cdn.vistahost.com.br" crossOrigin="anonymous" />
         
         {/* Preload de imagem LCP (hero banner) */}
         <link 
           rel="preload" 
           as="image" 
           href="/images/banners/optimized/balneario-camboriu-desktop.avif"
           type="image/avif"
           fetchPriority="high"
           media="(min-width: 1025px)"
         />
         <link 
           rel="preload" 
           as="image" 
           href="/images/banners/optimized/balneario-camboriu-tablet.avif"
           type="image/avif"
           fetchPriority="high"
           media="(min-width: 641px) and (max-width: 1024px)"
         />
         <link 
           rel="preload" 
           as="image" 
           href="/images/banners/optimized/balneario-camboriu-mobile.avif"
           type="image/avif"
           fetchPriority="high"
           media="(max-width: 640px)"
         />
         
         {/* Prefetch de páginas importantes */}
         <link rel="prefetch" href="/imoveis" as="document" />
         <link rel="prefetch" href="/empreendimentos" as="document" />
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
