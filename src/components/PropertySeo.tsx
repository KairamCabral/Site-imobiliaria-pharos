'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import { generatePropertyJsonLd, generatePropertyMetadata, type PropertySeoData } from '@/utils/propertySeo';

/**
 * PHAROS - Property SEO Component
 * 
 * Componente para injetar SEO metadata e JSON-LD
 * em páginas client-side do Next.js
 */

interface PropertySeoProps {
  property: PropertySeoData;
}

export default function PropertySeo({ property }: PropertySeoProps) {
  const jsonLd = generatePropertyJsonLd(property);
  const metadata = generatePropertyMetadata(property);

  // Atualizar título e meta tags no client-side
  useEffect(() => {
    // Título
    document.title = metadata.title;

    // Meta description
    updateMetaTag('name', 'description', metadata.description);

    // Canonical
    updateLinkTag('canonical', metadata.canonical);

    // Open Graph
    updateMetaTag('property', 'og:title', metadata.openGraph.title);
    updateMetaTag('property', 'og:description', metadata.openGraph.description);
    updateMetaTag('property', 'og:url', metadata.openGraph.url);
    updateMetaTag('property', 'og:type', metadata.openGraph.type);
    updateMetaTag('property', 'og:image', metadata.openGraph.images[0].url);
    updateMetaTag('property', 'og:image:width', String(metadata.openGraph.images[0].width));
    updateMetaTag('property', 'og:image:height', String(metadata.openGraph.images[0].height));
    updateMetaTag('property', 'og:image:alt', metadata.openGraph.images[0].alt);
    updateMetaTag('property', 'og:site_name', metadata.openGraph.siteName);
    updateMetaTag('property', 'og:locale', metadata.openGraph.locale);

    // Twitter
    updateMetaTag('name', 'twitter:card', metadata.twitter.card);
    updateMetaTag('name', 'twitter:title', metadata.twitter.title);
    updateMetaTag('name', 'twitter:description', metadata.twitter.description);
    updateMetaTag('name', 'twitter:image', metadata.twitter.images[0]);
    if (metadata.twitter.site) {
      updateMetaTag('name', 'twitter:site', metadata.twitter.site);
    }

    // Robots
    updateMetaTag(
      'name',
      'robots',
      `${metadata.robots.index ? 'index' : 'noindex'}, ${metadata.robots.follow ? 'follow' : 'nofollow'}`
    );

    // JSON-LD
    let scriptElement = document.getElementById('property-jsonld') as HTMLScriptElement;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'property-jsonld';
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = jsonLd;

    // Cleanup
    return () => {
      // Opcional: remover meta tags ao desmontar
      // (geralmente não é necessário)
    };
  }, [property, jsonLd, metadata]);

  return null; // Componente não renderiza nada visualmente
}

// Utilitários para atualizar meta tags
function updateMetaTag(attr: 'name' | 'property', value: string, content: string) {
  let element = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, value);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  
  element.href = href;
}

