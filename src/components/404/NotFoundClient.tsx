"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import NotFound404Illustration from './NotFound404Illustration';
import SearchWidget404 from './SearchWidget404';

/**
 * Componente principal da página 404
 * Gerencia interatividade, animações e tracking
 */

interface NotFoundClientProps {
  className?: string;
}

// Função para enviar eventos de analytics
function sendAnalyticsEvent(eventType: string, data: Record<string, any>) {
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob(
        [JSON.stringify({ type: 'custom', event: eventType, data })],
        { type: 'application/json' }
      );
      navigator.sendBeacon('/api/metrics', blob);
    } else if (typeof fetch !== 'undefined') {
      void fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'custom', event: eventType, data }),
        keepalive: true,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[404 Analytics] Erro ao enviar evento:', error);
    }
  }
}

function NotFoundClientContent({ className = '' }: NotFoundClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);

  // Animar entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animação do contador 404
  useEffect(() => {
    if (!isVisible) return;

    const target = 404;
    const duration = 1000; // 1 segundo
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);

      if (current >= target) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible]);

  // Track page view no mount
  useEffect(() => {
    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    sendAnalyticsEvent('404_page_view', {
      attempted_url: fullUrl,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.info('📊 [404 Analytics] Page view:', fullUrl);
    }
  }, [pathname, searchParams]);

  // Handler para cliques em ações
  const handleActionClick = useCallback((action: string) => {
    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    sendAnalyticsEvent('404_action_click', {
      action,
      attempted_url: fullUrl,
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.info('📊 [404 Analytics] Action click:', action);
    }
  }, [pathname, searchParams]);

  // Handler para busca
  const handleSearch = useCallback((query: string) => {
    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    sendAnalyticsEvent('404_search_submit', {
      query,
      attempted_url: fullUrl,
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.info('📊 [404 Analytics] Search:', query);
    }
  }, [pathname, searchParams]);

  return (
    <div className={`min-h-[calc(100vh-80px)] bg-pharos-base-off ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Main Content - Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-12 items-center mb-16"
        >
          {/* Left: Illustration */}
          <div className="order-2 lg:order-1">
            <div className="w-full max-w-md mx-auto aspect-square">
              <NotFound404Illustration />
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            {/* Animated Counter */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <span
                className="
                  inline-block
                  text-7xl md:text-8xl
                  font-bold
                  text-transparent
                  bg-clip-text
                  bg-gradient-to-r from-pharos-blue-500 to-pharos-navy-900
                "
                aria-label="Erro 404"
              >
                {count}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-pharos-navy-900 mb-4"
            >
              Página Não Encontrada
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-lg text-pharos-slate-700 mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Ops! Parece que esta página saiu do mapa. Mas não se preocupe, podemos ajudá-lo a
              encontrar o imóvel dos seus sonhos.
            </motion.p>

            {/* Primary Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <Link
                href="/"
                onClick={() => handleActionClick('home')}
                className="
                  inline-flex items-center justify-center gap-2
                  px-8 py-4
                  bg-pharos-blue-500
                  text-white
                  font-semibold
                  rounded-xl
                  hover:bg-pharos-blue-600
                  hover:scale-105
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
                  shadow-lg hover:shadow-xl
                  touch-target
                "
              >
                <HomeIcon className="w-5 h-5" />
                Voltar para Home
                <ChevronRightIcon className="w-4 h-4" />
              </Link>

              <Link
                href="/imoveis"
                onClick={() => handleActionClick('imoveis')}
                className="
                  inline-flex items-center justify-center gap-2
                  px-8 py-4
                  bg-white
                  text-pharos-blue-500
                  font-semibold
                  border-2 border-pharos-blue-500
                  rounded-xl
                  hover:bg-pharos-blue-50
                  hover:scale-105
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
                  touch-target
                "
              >
                <BuildingOffice2Icon className="w-5 h-5" />
                Ver Imóveis
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Search Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-pharos-navy-900 mb-2">
              Ou Faça uma Busca Rápida
            </h2>
            <p className="text-pharos-slate-700">
              Encontre o imóvel ideal para você
            </p>
          </div>
          <SearchWidget404 onSearch={handleSearch} />
        </motion.div>

        {/* Quick Links Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-pharos-navy-900 text-center mb-8">
            Links Úteis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <QuickLinkCard
              href="/empreendimentos"
              icon={BuildingOffice2Icon}
              title="Empreendimentos"
              onClick={() => handleActionClick('empreendimentos')}
            />
            <QuickLinkCard
              href="/contato"
              icon={PhoneIcon}
              title="Contato"
              onClick={() => handleActionClick('contato')}
            />
            <QuickLinkCard
              href="/sobre"
              icon={HomeIcon}
              title="Sobre Nós"
              onClick={() => handleActionClick('sobre')}
            />
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-center text-pharos-slate-700"
        >
          <p className="text-sm">
            Precisa de ajuda?{' '}
            <Link
              href="/contato"
              onClick={() => handleActionClick('contato')}
              className="
                text-pharos-blue-500
                font-semibold
                hover:text-pharos-blue-600
                hover:underline
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:rounded
              "
            >
              Entre em contato conosco
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Quick Link Card Component
interface QuickLinkCardProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick?: () => void;
}

function QuickLinkCard({ href, icon: Icon, title, onClick }: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        group
        flex flex-col items-center justify-center
        p-6
        bg-white
        rounded-xl
        border border-pharos-slate-300
        hover:border-pharos-blue-500
        hover:shadow-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2
        touch-target
      "
    >
      <div
        className="
          w-12 h-12
          mb-3
          flex items-center justify-center
          bg-pharos-blue-500/10
          text-pharos-blue-500
          rounded-lg
          group-hover:bg-pharos-blue-500
          group-hover:text-white
          transition-all duration-200
        "
      >
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm font-semibold text-pharos-navy-900 text-center">
        {title}
      </span>
    </Link>
  );
}

// Wrapper com Suspense para useSearchParams
export default function NotFoundClient(props: NotFoundClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pharos-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <NotFoundClientContent {...props} />
    </Suspense>
  );
}

