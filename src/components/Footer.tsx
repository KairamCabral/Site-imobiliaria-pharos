"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PrivacyNotice from './PrivacyNotice';
import StructuredData from './StructuredData';
import { generateLocalBusinessSchema } from '@/utils/structuredData';

export default function Footer() {
  const year = new Date().getFullYear();
  const localBusinessSchema = generateLocalBusinessSchema();
  
  return (
    <footer 
      className="relative bg-pharos-navy-900 text-white overflow-hidden" 
      style={{ minHeight: '500px', contentVisibility: 'auto' }}
    >
      {/* LocalBusiness Schema para SEO Local */}
      <StructuredData data={localBusinessSchema} />
      {/* Background sutil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f608_1px,transparent_1px),linear-gradient(to_bottom,#3b82f608_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Conteúdo principal - Mobile-First */}
      <div className="relative container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 max-w-screen-2xl py-12 sm:py-14 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
          
          {/* Logo e Descrição - Mobile Optimizado */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <Link href="/" className="inline-block">
              <Image 
                src="/images/logos/Logo-pharos.webp" 
                alt="Pharos Negócios Imobiliários" 
                width={160} 
                height={40}
                className="h-7 sm:h-8 md:h-9 w-auto brightness-0 invert"
                priority
              />
            </Link>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
              Sua imobiliária de alto padrão em Balneário Camboriú, especializada em imóveis de luxo e investimentos imobiliários.
            </p>
            
            {/* Redes Sociais - Mobile Optimizado */}
            <div className="flex gap-2.5 sm:gap-3 pt-2">
              {[
                { 
                  href: "https://www.instagram.com/pharosimobiliaria", 
                  icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                  label: "Instagram"
                },
                { 
                  href: "https://www.youtube.com/@PharosNegociosImobiliarios", 
                  icon: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
                  label: "YouTube"
                }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/5 hover:bg-pharos-blue-500 flex items-center justify-center transition-all duration-200 hover:scale-110 touch-manipulation"
                  aria-label={social.label}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          {/* Navegação - Mobile Optimizado */}
          <div className="lg:col-span-2">
            <h3 className="text-xs sm:text-sm font-semibold text-white mb-4 sm:mb-6 uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { label: 'Início', href: '/' },
                { label: 'Imóveis', href: '/imoveis' },
                { label: 'Lançamentos', href: '/imoveis?status=lancamento' },
                { label: 'Sobre Nós', href: '/sobre' },
                { label: 'Contato', href: '/contato' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-xs sm:text-sm text-white/70 hover:text-pharos-gold-500 transition-colors inline-block min-h-[44px] sm:min-h-0 flex items-center touch-manipulation"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Regiões - Mobile Optimizado */}
          <div className="lg:col-span-2">
            <h3 className="text-xs sm:text-sm font-semibold text-white mb-4 sm:mb-6 uppercase tracking-wider">Regiões</h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { label: 'Barra Sul', slug: 'barra-sul' },
                { label: 'Centro', slug: 'centro' },
                { label: 'Pioneiros', slug: 'pioneiros' },
                { label: 'Nações', slug: 'nacoes' },
                { label: 'Praia Brava', slug: 'praia-brava' },
              ].map((region) => (
                <li key={region.slug}>
                  <Link 
                    href={`/imoveis/bairro/${region.slug}`}
                    className="text-xs sm:text-sm text-white/70 hover:text-pharos-gold-500 transition-colors inline-block min-h-[44px] sm:min-h-0 flex items-center touch-manipulation"
                  >
                    {region.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contato - Mobile Optimizado */}
          <div className="lg:col-span-4">
            <h3 className="text-xs sm:text-sm font-semibold text-white mb-4 sm:mb-6 uppercase tracking-wider">Contato</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2.5 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pharos-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Rua 2300, 575, Sala 04<br/>
                  Centro - Balneário Camboriú/SC<br/>
                  CEP: 88330-428
                </span>
              </li>
              <li className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pharos-gold-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+5547991878070" className="text-xs sm:text-sm text-white/70 hover:text-pharos-gold-500 transition-colors min-h-[44px] sm:min-h-0 flex items-center touch-manipulation">
                  (47) 9 9187-8070
                </a>
              </li>
              <li className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pharos-gold-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contato@pharosnegocios.com.br" className="text-xs sm:text-sm text-white/70 hover:text-pharos-gold-500 transition-colors break-all min-h-[44px] sm:min-h-0 flex items-center touch-manipulation">
                  contato@pharosnegocios.com.br
                </a>
              </li>
            </ul>
            
            {/* WhatsApp Button - Mobile Optimizado */}
            <a 
              href="https://wa.me/5547991878070" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 sm:mt-6 inline-flex items-center justify-center gap-2 sm:gap-2.5 bg-pharos-blue-500 hover:bg-pharos-blue-600 active:bg-pharos-blue-700 text-white px-4 sm:px-5 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg shadow-pharos-blue-500/20 w-full sm:w-auto min-h-[48px] sm:min-h-0 touch-manipulation"
              aria-label="Falar no WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar - Mobile-First */}
      <div className="relative border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 max-w-screen-2xl py-5 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/50">
            <p className="text-center md:text-left">
              © {year} Pharos Negócios Imobiliários. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <span>CNPJ: 51.040.966/0001-93</span>
              <span className="text-white/30">•</span>
              <span>CRECI: 40107</span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <Link href="/politica-privacidade" className="hover:text-pharos-gold-500 transition-colors min-h-[44px] sm:min-h-0 flex items-center touch-manipulation">
                Privacidade
              </Link>
              <span className="text-white/30">•</span>
              <Link href="/termos-de-uso" className="hover:text-pharos-gold-500 transition-colors min-h-[44px] sm:min-h-0 flex items-center touch-manipulation">
                Termos de Uso
              </Link>
              <span className="text-white/30">•</span>
              <Link href="/politica-cookies" className="hover:text-pharos-gold-500 transition-colors min-h-[44px] sm:min-h-0 flex items-center touch-manipulation">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Aviso de privacidade discreto */}
      <PrivacyNotice />
    </footer>
  );
} 