// src/lib/tracking/leadTracking.ts

/**
 * Sistema completo de Lead Tracking
 * Integrado com SSGTM e Mautic
 */

export type LeadSource = 
  | 'organic' 
  | 'direct' 
  | 'paid' 
  | 'social' 
  | 'referral' 
  | 'email';

export type LeadAction = 
  | 'page_view'
  | 'property_view'
  | 'property_favorite'
  | 'whatsapp_click'
  | 'form_submit'
  | 'phone_click'
  | 'email_click'
  | 'schedule_visit'
  | 'download_pdf'
  | 'search';

export interface LeadData {
  // Identificação
  sessionId: string;
  userId?: string; // Se identificado
  fingerprint?: string;
  
  // Dados pessoais (quando disponível)
  name?: string;
  email?: string;
  phone?: string;
  
  // Origem
  source: LeadSource;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  
  // UTMs
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  
  // Comportamento
  firstVisit: string; // ISO date
  lastVisit: string; // ISO date
  totalPageViews: number;
  totalPropertyViews: number;
  favoritedProperties: string[];
  searchedTerms: string[];
  
  // Engagement
  timeOnSite: number; // segundos
  scrollDepth: number; // percentual
  clicks: number;
  
  // Conversão
  convertedAt?: string; // ISO date
  conversionType?: 'form' | 'whatsapp' | 'phone' | 'email';
  
  // Interesse
  interestedProperty?: string; // ID do imóvel
  interestedCity?: string;
  interestedNeighborhood?: string;
  priceRange?: { min: number; max: number };
  
  // Scoring
  score: number;
  
  // Metadata
  device: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  referrer?: string;
  landingPage?: string;
  currentPage?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface LeadEvent {
  action: LeadAction;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Classe principal de Lead Tracking
 */
export class LeadTracker {
  private static STORAGE_KEY = 'pharos_lead_data';
  private static SESSION_KEY = 'pharos_session_id';
  
  /**
   * Inicializar tracking do lead
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;
    
    // Gerar ou recuperar session ID
    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    
    // Criar ou recuperar lead data
    let leadData = this.getLeadData();
    if (!leadData) {
      leadData = this.createLeadData(sessionId);
      this.saveLeadData(leadData);
    } else {
      // Atualizar última visita
      leadData.lastVisit = new Date().toISOString();
      leadData.updatedAt = new Date().toISOString();
      this.saveLeadData(leadData);
    }
    
    // Capturar UTMs da URL
    this.captureUTMs();
    
    // Tracking de scroll
    this.trackScrollDepth();
    
    // Tracking de tempo no site
    this.trackTimeOnSite();
    
    // Page view
    this.trackEvent('page_view', {
      url: window.location.href,
      title: document.title,
    });
  }
  
  /**
   * Trackear evento de lead
   */
  static trackEvent(action: LeadAction, metadata?: Record<string, any>): void {
    if (typeof window === 'undefined') return;
    
    const leadData = this.getLeadData();
    if (!leadData) return;
    
    // Atualizar contadores
    if (action === 'page_view') {
      leadData.totalPageViews++;
    } else if (action === 'property_view') {
      leadData.totalPropertyViews++;
    }
    
    // Atualizar score baseado na ação
    leadData.score += this.getScoreForAction(action);
    
    // Atualizar metadata específica
    if (action === 'property_favorite' && metadata?.propertyId) {
      if (!leadData.favoritedProperties.includes(metadata.propertyId)) {
        leadData.favoritedProperties.push(metadata.propertyId);
      }
    }
    
    if (action === 'search' && metadata?.term) {
      if (!leadData.searchedTerms.includes(metadata.term)) {
        leadData.searchedTerms.push(metadata.term);
      }
    }
    
    leadData.clicks++;
    leadData.updatedAt = new Date().toISOString();
    leadData.currentPage = window.location.pathname;
    
    this.saveLeadData(leadData);
    
    // Enviar para SSGTM
    this.sendToSSGTM(action, leadData, metadata);
    
    // Enviar para Mautic
    this.sendToMautic(action, leadData, metadata);
  }
  
  /**
   * Identificar lead (quando preenche formulário)
   */
  static identifyLead(data: {
    name?: string;
    email?: string;
    phone?: string;
  }): void {
    const leadData = this.getLeadData();
    if (!leadData) return;
    
    leadData.name = data.name || leadData.name;
    leadData.email = data.email || leadData.email;
    leadData.phone = data.phone || leadData.phone;
    leadData.updatedAt = new Date().toISOString();
    
    this.saveLeadData(leadData);
    
    // Enviar identificação para Mautic
    this.sendIdentificationToMautic(leadData);
  }
  
  /**
   * Marcar conversão
   */
  static trackConversion(type: 'form' | 'whatsapp' | 'phone' | 'email', metadata?: Record<string, any>): void {
    const leadData = this.getLeadData();
    if (!leadData) return;
    
    leadData.convertedAt = new Date().toISOString();
    leadData.conversionType = type;
    leadData.score += 50; // Conversão vale 50 pontos
    
    if (metadata?.propertyId) {
      leadData.interestedProperty = metadata.propertyId;
    }
    
    this.saveLeadData(leadData);
    
    // Enviar conversão para SSGTM
    this.sendConversionToSSGTM(type, leadData, metadata);
    
    // Enviar conversão para Mautic
    this.sendConversionToMautic(type, leadData, metadata);
  }
  
  /**
   * Obter dados do lead atual
   */
  static getLeadData(): LeadData | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('[LeadTracker] Error parsing lead data:', e);
      return null;
    }
  }
  
  /**
   * Salvar dados do lead
   */
  private static saveLeadData(data: LeadData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
  
  /**
   * Criar novo lead data
   */
  private static createLeadData(sessionId: string): LeadData {
    const now = new Date().toISOString();
    const source = this.detectSource();
    
    return {
      sessionId,
      source,
      firstVisit: now,
      lastVisit: now,
      totalPageViews: 0,
      totalPropertyViews: 0,
      favoritedProperties: [],
      searchedTerms: [],
      timeOnSite: 0,
      scrollDepth: 0,
      clicks: 0,
      score: 0,
      device: this.detectDevice(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      referrer: document.referrer || undefined,
      landingPage: window.location.pathname,
      createdAt: now,
      updatedAt: now,
    };
  }
  
  /**
   * Gerar session ID único
   */
  private static generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * Detectar fonte de tráfego
   */
  private static detectSource(): LeadSource {
    const referrer = document.referrer.toLowerCase();
    const url = new URL(window.location.href);
    
    // Verificar UTM source primeiro
    const utmSource = url.searchParams.get('utm_source');
    if (utmSource) {
      if (utmSource.includes('google') || utmSource.includes('facebook') || utmSource.includes('instagram')) {
        return 'paid';
      }
      if (utmSource.includes('email')) return 'email';
      if (utmSource.includes('social')) return 'social';
    }
    
    // Verificar referrer
    if (!referrer) return 'direct';
    
    if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('yahoo')) {
      return 'organic';
    }
    
    if (referrer.includes('facebook') || referrer.includes('instagram') || referrer.includes('linkedin')) {
      return 'social';
    }
    
    return 'referral';
  }
  
  /**
   * Detectar dispositivo
   */
  private static detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
  
  /**
   * Detectar browser
   */
  private static detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }
  
  /**
   * Detectar OS
   */
  private static detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Other';
  }
  
  /**
   * Capturar UTMs da URL
   */
  private static captureUTMs(): void {
    const url = new URL(window.location.href);
    const leadData = this.getLeadData();
    if (!leadData) return;
    
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    let updated = false;
    
    utmParams.forEach(param => {
      const value = url.searchParams.get(param);
      if (value && !(leadData as any)[param]) {
        (leadData as any)[param] = value;
        updated = true;
      }
    });
    
    if (updated) {
      this.saveLeadData(leadData);
    }
  }
  
  /**
   * Tracking de scroll depth
   */
  private static trackScrollDepth(): void {
    let maxScroll = 0;
    
    const updateScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        const leadData = this.getLeadData();
        if (leadData) {
          leadData.scrollDepth = Math.max(leadData.scrollDepth, scrollPercent);
          this.saveLeadData(leadData);
        }
      }
    };
    
    window.addEventListener('scroll', updateScroll, { passive: true });
  }
  
  /**
   * Tracking de tempo no site
   */
  private static trackTimeOnSite(): void {
    const startTime = Date.now();
    
    const updateTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const leadData = this.getLeadData();
      if (leadData) {
        leadData.timeOnSite += timeSpent;
        this.saveLeadData(leadData);
      }
    };
    
    // Atualizar a cada 30 segundos
    setInterval(updateTime, 30000);
    
    // Atualizar ao sair
    window.addEventListener('beforeunload', updateTime);
  }
  
  /**
   * Score por ação
   */
  private static getScoreForAction(action: LeadAction): number {
    const scores: Record<LeadAction, number> = {
      page_view: 1,
      property_view: 5,
      property_favorite: 10,
      whatsapp_click: 15,
      form_submit: 20,
      phone_click: 15,
      email_click: 10,
      schedule_visit: 25,
      download_pdf: 10,
      search: 3,
    };
    
    return scores[action] || 0;
  }
  
  /**
   * Enviar evento para SSGTM
   */
  private static async sendToSSGTM(
    action: LeadAction,
    leadData: LeadData,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const endpoint = process.env.NEXT_PUBLIC_SSGTM_ENDPOINT || '/api/tracking/gtm';
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: action,
          sessionId: leadData.sessionId,
          userId: leadData.userId,
          email: leadData.email,
          phone: leadData.phone,
          source: leadData.source,
          utm_source: leadData.utm_source,
          utm_medium: leadData.utm_medium,
          utm_campaign: leadData.utm_campaign,
          score: leadData.score,
          device: leadData.device,
          timestamp: new Date().toISOString(),
          ...metadata,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error('[LeadTracker] Error sending to SSGTM:', error);
    }
  }
  
  /**
   * Enviar evento para Mautic
   */
  private static async sendToMautic(
    action: LeadAction,
    leadData: LeadData,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const endpoint = '/api/tracking/mautic';
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          sessionId: leadData.sessionId,
          email: leadData.email,
          leadData,
          metadata,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error('[LeadTracker] Error sending to Mautic:', error);
    }
  }
  
  /**
   * Enviar identificação para Mautic
   */
  private static async sendIdentificationToMautic(leadData: LeadData): Promise<void> {
    try {
      await fetch('/api/tracking/mautic/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: leadData.sessionId,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          source: leadData.source,
          utm_source: leadData.utm_source,
          utm_medium: leadData.utm_medium,
          utm_campaign: leadData.utm_campaign,
          score: leadData.score,
          firstVisit: leadData.firstVisit,
          totalPageViews: leadData.totalPageViews,
          totalPropertyViews: leadData.totalPropertyViews,
          device: leadData.device,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error('[LeadTracker] Error identifying in Mautic:', error);
    }
  }
  
  /**
   * Enviar conversão para SSGTM
   */
  private static async sendConversionToSSGTM(
    type: string,
    leadData: LeadData,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const endpoint = process.env.NEXT_PUBLIC_SSGTM_ENDPOINT || '/api/tracking/gtm';
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'conversion',
          conversion_type: type,
          sessionId: leadData.sessionId,
          email: leadData.email,
          phone: leadData.phone,
          score: leadData.score,
          value: 1,
          currency: 'BRL',
          ...metadata,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error('[LeadTracker] Error sending conversion to SSGTM:', error);
    }
  }
  
  /**
   * Enviar conversão para Mautic
   */
  private static async sendConversionToMautic(
    type: string,
    leadData: LeadData,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch('/api/tracking/mautic/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: leadData.sessionId,
          email: leadData.email,
          conversionType: type,
          leadData,
          metadata,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error('[LeadTracker] Error sending conversion to Mautic:', error);
    }
  }
}

