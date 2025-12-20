/**
 * Advanced Tracking System - SSGTM
 * Sistema de rastreamento avançado com Enhanced Conversions
 * Imobiliária Pharos
 */

'use client';

import type {
  UserData,
  PropertyData,
  TrackingParams,
  EnhancedUserData,
  ClientHints,
  MarketingParams,
  TrackingPayload,
} from '@/types/tracking';

class AdvancedTracking {
  private static instance: AdvancedTracking;
  private sessionId: string;
  private userId?: string;
  private fbp?: string;
  private fbc?: string;
  private gclid?: string;
  private fbclid?: string;
  private clientId?: string;
  private isInitialized = false;
  
  private constructor() {
    this.sessionId = this.generateSessionId();
  }
  
  static getInstance(): AdvancedTracking {
    if (!AdvancedTracking.instance) {
      AdvancedTracking.instance = new AdvancedTracking();
    }
    return AdvancedTracking.instance;
  }
  
  /**
   * Inicializa o sistema de tracking
   * Deve ser chamado uma única vez no client
   */
  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;
    
    // Captura Facebook cookies
    this.fbp = this.getCookie('_fbp');
    this.fbc = this.getCookie('_fbc') || this.extractFbc();
    
    // Captura Click IDs
    const urlParams = new URLSearchParams(window.location.search);
    
    // Google Click ID
    this.gclid = urlParams.get('gclid') || undefined;
    if (this.gclid) {
      localStorage.setItem('gclid', this.gclid);
      localStorage.setItem('gclid_timestamp', Date.now().toString());
    } else {
      // Recupera gclid se foi clicado nos últimos 90 dias
      const storedGclid = localStorage.getItem('gclid');
      const gclidTimestamp = localStorage.getItem('gclid_timestamp');
      if (storedGclid && gclidTimestamp) {
        const daysSinceClick = (Date.now() - parseInt(gclidTimestamp)) / (1000 * 60 * 60 * 24);
        if (daysSinceClick < 90) {
          this.gclid = storedGclid;
        } else {
          localStorage.removeItem('gclid');
          localStorage.removeItem('gclid_timestamp');
        }
      }
    }
    
    // Facebook Click ID
    this.fbclid = urlParams.get('fbclid') || undefined;
    if (this.fbclid && !this.fbc) {
      this.fbc = `fb.1.${Date.now()}.${this.fbclid}`;
      this.setCookie('_fbc', this.fbc, 90);
    }
    
    // Cria Facebook Browser ID se não existir
    if (!this.fbp) {
      this.fbp = `fb.1.${Date.now()}.${Math.random().toString(36).substring(2, 11)}`;
      this.setCookie('_fbp', this.fbp, 90);
    }
    
    // Captura GA Client ID
    this.captureGAClientId();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 [Advanced Tracking] Inicializado', {
        sessionId: this.sessionId,
        fbp: this.fbp,
        fbc: this.fbc,
        gclid: this.gclid,
      });
    }
  }
  
  /**
   * Gera ID único de sessão
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * Obtém cookie pelo nome
   */
  private getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
    }
    return undefined;
  }
  
  /**
   * Define cookie
   */
  private setCookie(name: string, value: string, days: number) {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
  
  /**
   * Extrai Facebook Click ID da URL
   */
  private extractFbc(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      return `fb.1.${Date.now()}.${fbclid}`;
    }
    return undefined;
  }
  
  /**
   * Captura Google Analytics Client ID
   */
  private captureGAClientId() {
    if (typeof window === 'undefined') return;
    
    // Tenta múltiplas vezes com intervalo
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryCapture = () => {
      if ((window as any).gtag && !this.clientId) {
        const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        if (gaId) {
          (window as any).gtag('get', gaId, 'client_id', (clientId: string) => {
            this.clientId = clientId;
            if (process.env.NODE_ENV === 'development') {
              console.log('📊 [GA] Client ID capturado:', clientId);
            }
          });
        }
      }
      
      attempts++;
      if (attempts < maxAttempts && !this.clientId) {
        setTimeout(tryCapture, 500);
      }
    };
    
    setTimeout(tryCapture, 1000);
  }
  
  /**
   * Hash SHA-256 de dados sensíveis
   */
  private async hashData(data: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      // Fallback para servidor
      return data.toLowerCase().trim();
    }
    
    try {
      const normalized = data.toLowerCase().trim();
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('[Tracking] Erro ao fazer hash:', error);
      return data.toLowerCase().trim();
    }
  }
  
  /**
   * Normaliza e faz hash de user data para Enhanced Conversions
   */
  private async normalizeUserData(userData?: UserData): Promise<EnhancedUserData> {
    if (!userData) return {};
    
    const normalized: EnhancedUserData = {};
    
    if (userData.email) {
      normalized.em = await this.hashData(userData.email);
    }
    
    if (userData.phone) {
      // Remove tudo exceto números
      const cleanPhone = userData.phone.replace(/\D/g, '');
      normalized.ph = await this.hashData(cleanPhone);
    }
    
    if (userData.firstName) {
      normalized.fn = await this.hashData(userData.firstName);
    }
    
    if (userData.lastName) {
      normalized.ln = await this.hashData(userData.lastName);
    }
    
    if (userData.city) {
      normalized.ct = await this.hashData(userData.city);
    }
    
    if (userData.state) {
      normalized.st = await this.hashData(userData.state);
    }
    
    if (userData.country) {
      normalized.country = await this.hashData(userData.country);
    }
    
    if (userData.zipCode) {
      const cleanZip = userData.zipCode.replace(/\D/g, '');
      normalized.zp = await this.hashData(cleanZip);
    }
    
    return normalized;
  }
  
  /**
   * Captura Client Hints (User-Agent melhorado)
   */
  private async getClientHints(): Promise<ClientHints> {
    if (typeof window === 'undefined') return {};
    
    const nav = navigator as any;
    
    if (!nav.userAgentData) {
      // Fallback para navegadores que não suportam Client Hints
      return {
        mobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
      };
    }
    
    try {
      const hints = await nav.userAgentData.getHighEntropyValues([
        'platform',
        'platformVersion',
        'model',
        'uaFullVersion',
        'brands',
      ]);
      
      return {
        platform: hints.platform,
        platformVersion: hints.platformVersion,
        model: hints.model,
        browserVersion: hints.uaFullVersion,
        mobile: hints.mobile,
        brands: hints.brands,
      };
    } catch (error) {
      return {
        mobile: nav.userAgentData.mobile,
      };
    }
  }
  
  /**
   * Captura parâmetros de marketing (UTMs, referrer)
   */
  private getMarketingParams(): MarketingParams {
    if (typeof window === 'undefined') return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      referrer: document.referrer || undefined,
      gclid: this.gclid,
      fbclid: this.fbclid,
    };
  }
  
  /**
   * Gera event_id único para deduplicação
   */
  private generateEventId(event: string, params: any): string {
    const timestamp = Date.now();
    const data = `${event}-${params.propertyData?.id || ''}-${params.userData?.email || ''}-${timestamp}`;
    return `evt_${data.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0).toString(16)}_${timestamp}`;
  }
  
  /**
   * Envia evento para dataLayer
   */
  private pushToDataLayer(payload: TrackingPayload) {
    if (typeof window === 'undefined') return;
    
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(payload);
  }
  
  /**
   * Envia evento para servidor (API route)
   */
  private async sendToServer(payload: TrackingPayload) {
    if (typeof window === 'undefined') return;
    
    try {
      await fetch('/api/tracking/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (error) {
      console.error('[Tracking] Erro ao enviar para servidor:', error);
    }
  }
  
  /**
   * Método principal de tracking
   */
  async track(params: TrackingParams) {
    if (typeof window === 'undefined') return;
    
    // Garante inicialização
    if (!this.isInitialized) {
      this.initialize();
    }
    
    const {
      event,
      eventCategory,
      eventLabel,
      value,
      currency = 'BRL',
      userData,
      propertyData,
      customParams = {},
    } = params;
    
    try {
      // Normaliza user data (hash SHA-256)
      const hashedUserData = await this.normalizeUserData(userData);
      
      // Client Hints
      const clientHints = await this.getClientHints();
      
      // Marketing params
      const marketingParams = this.getMarketingParams();
      
      // Event ID para deduplicação
      const eventId = this.generateEventId(event, params);
      
      // Monta payload completo
      const payload: TrackingPayload = {
        event,
        event_id: eventId,
        event_category: eventCategory,
        event_label: eventLabel,
        value,
        currency,
        
        // Session & User
        session_id: this.sessionId,
        user_id: this.userId,
        client_id: this.clientId,
        
        // Facebook Pixel
        fbp: this.fbp,
        fbc: this.fbc,
        
        // Google Ads
        gclid: this.gclid,
        
        // Enhanced Conversions (hashed user data)
        user_data: Object.keys(hashedUserData).length > 0 ? hashedUserData : undefined,
        
        // Property data (ecommerce)
        ecommerce: propertyData ? {
          items: [{
            item_id: propertyData.id,
            item_name: propertyData.title,
            item_brand: propertyData.realtor?.name || 'Pharos Imobiliária',
            item_category: propertyData.type,
            item_category2: propertyData.city,
            item_category3: propertyData.state,
            price: propertyData.price,
            quantity: 1,
            item_variant: `${propertyData.bedrooms || 0}Q-${propertyData.area || 0}m²`,
          }],
          value: value || propertyData.price,
          currency: 'BRL',
        } : undefined,
        
        // Client Hints
        client_hints: clientHints,
        
        // Marketing params
        ...marketingParams,
        
        // Custom params
        ...customParams,
        
        // Metadata
        page_url: window.location.href,
        page_title: document.title,
        page_path: window.location.pathname,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      };
      
      // Envia para dataLayer (GTM)
      this.pushToDataLayer(payload);
      
      // Envia para servidor (SSGTM + Direct APIs)
      await this.sendToServer(payload);
      
      // Debug em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [Tracking Event]', event, payload);
      }
    } catch (error) {
      console.error('[Tracking] Erro ao processar evento:', error);
    }
  }
  
  /**
   * Identifica usuário após conversão
   */
  identifyUser(userId: string, userData?: UserData) {
    this.userId = userId;
    
    if (userData) {
      this.track({
        event: 'user_identify',
        eventCategory: 'User',
        customParams: {
          user_id: userId,
        },
        userData,
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 [Tracking] Usuário identificado:', userId);
    }
  }
  
  /**
   * Limpa dados de sessão
   */
  clearSession() {
    this.userId = undefined;
    this.sessionId = this.generateSessionId();
  }
}

export default AdvancedTracking.getInstance();

