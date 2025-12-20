/**
 * Hook useTracking
 * Hook personalizado para tracking de eventos imobiliários
 * Imobiliária Pharos
 */

'use client';

import { useCallback, useEffect } from 'react';
import AdvancedTracking from '@/lib/analytics/advanced-tracking';
import type { PropertyData, UserData } from '@/types/tracking';
import { TrackingEvents, EventCategory } from '@/types/tracking';

export function useTracking() {
  // Inicializa tracking quando o hook é montado
  useEffect(() => {
    AdvancedTracking.initialize();
  }, []);
  
  /**
   * Track de visualização de imóvel
   */
  const trackPropertyView = useCallback((property: PropertyData) => {
    AdvancedTracking.track({
      event: TrackingEvents.PROPERTY_VIEW,
      eventCategory: EventCategory.PROPERTY_ENGAGEMENT,
      eventLabel: property.code,
      value: property.price,
      propertyData: property,
      customParams: {
        property_type: property.type,
        property_bedrooms: property.bedrooms,
        property_area: property.area,
        property_city: property.city,
      },
    });
  }, []);
  
  /**
   * Track de visualização da galeria de fotos
   */
  const trackPropertyGalleryView = useCallback((property: PropertyData, photoIndex: number) => {
    AdvancedTracking.track({
      event: TrackingEvents.PROPERTY_GALLERY_VIEW,
      eventCategory: EventCategory.PROPERTY_ENGAGEMENT,
      eventLabel: property.code,
      propertyData: property,
      customParams: {
        photo_index: photoIndex,
      },
    });
  }, []);
  
  /**
   * Track de adicionar aos favoritos
   */
  const trackPropertyFavorite = useCallback((property: PropertyData, action: 'add' | 'remove') => {
    AdvancedTracking.track({
      event: TrackingEvents.PROPERTY_FAVORITE,
      eventCategory: EventCategory.PROPERTY_ENGAGEMENT,
      eventLabel: property.code,
      value: action === 'add' ? property.price : 0,
      propertyData: property,
      customParams: {
        favorite_action: action,
      },
    });
  }, []);
  
  /**
   * Track de compartilhamento
   */
  const trackPropertyShare = useCallback((
    property: PropertyData,
    method: 'whatsapp' | 'email' | 'link' | 'facebook' | 'twitter'
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.PROPERTY_SHARE,
      eventCategory: EventCategory.PROPERTY_ENGAGEMENT,
      eventLabel: property.code,
      propertyData: property,
      customParams: {
        share_method: method,
      },
    });
  }, []);
  
  /**
   * Track de visualização do formulário de contato
   */
  const trackPropertyContactView = useCallback((property: PropertyData) => {
    AdvancedTracking.track({
      event: TrackingEvents.PROPERTY_CONTACT_VIEW,
      eventCategory: EventCategory.LEAD_GENERATION,
      eventLabel: property.code,
      value: property.price,
      propertyData: property,
      customParams: {
        funnel_step: 'contact_view',
      },
    });
  }, []);
  
  /**
   * Track de início de preenchimento do formulário
   */
  const trackPropertyContactStart = useCallback((property: PropertyData) => {
    AdvancedTracking.track({
      event: TrackingEvents.PROPERTY_CONTACT_START,
      eventCategory: EventCategory.LEAD_GENERATION,
      eventLabel: property.code,
      value: property.price,
      propertyData: property,
      customParams: {
        funnel_step: 'contact_start',
      },
    });
  }, []);
  
  /**
   * Track de lead gerado (conversão principal)
   */
  const trackLead = useCallback((
    property: PropertyData,
    userData: UserData,
    leadId: string,
    leadValue: number = 100
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.LEAD,
      eventCategory: EventCategory.CONVERSION,
      eventLabel: property.code,
      value: leadValue,
      currency: 'BRL',
      propertyData: property,
      userData,
      customParams: {
        transaction_id: leadId,
        lead_type: 'property_interest',
        funnel_step: 'lead_generated',
      },
    });
    
    // Identifica o usuário para remarketing
    AdvancedTracking.identifyUser(leadId, userData);
  }, []);
  
  /**
   * Track de visita agendada (conversão de alto valor)
   */
  const trackScheduleVisit = useCallback((
    property: PropertyData,
    userData: UserData,
    scheduleId: string,
    appointmentDate: string,
    visitValue: number = 500
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.SCHEDULE_VISIT,
      eventCategory: EventCategory.CONVERSION,
      eventLabel: property.code,
      value: visitValue,
      currency: 'BRL',
      propertyData: property,
      userData,
      customParams: {
        transaction_id: scheduleId,
        appointment_date: appointmentDate,
        conversion_type: 'schedule_visit',
        funnel_step: 'visit_scheduled',
      },
    });
    
    // Identifica o usuário
    AdvancedTracking.identifyUser(scheduleId, userData);
  }, []);
  
  /**
   * Track de busca
   */
  const trackSearch = useCallback((
    searchTerm: string,
    filters: Record<string, any>,
    resultsCount: number
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.SEARCH,
      eventCategory: EventCategory.REMARKETING,
      eventLabel: searchTerm,
      customParams: {
        search_term: searchTerm,
        filters: JSON.stringify(filters),
        results_count: resultsCount,
        filter_count: Object.keys(filters).length,
      },
    });
  }, []);
  
  /**
   * Track de mudança de filtros
   */
  const trackFilterChange = useCallback((
    filterType: string,
    filterValue: any,
    resultsCount: number
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.FILTER_APPLY,
      eventCategory: EventCategory.REMARKETING,
      eventLabel: filterType,
      customParams: {
        filter_type: filterType,
        filter_value: String(filterValue),
        results_count: resultsCount,
      },
    });
  }, []);
  
  /**
   * Track de contato via WhatsApp
   */
  const trackContactWhatsApp = useCallback((
    property?: PropertyData,
    source: string = 'button'
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.CONTACT_WHATSAPP,
      eventCategory: EventCategory.LEAD_GENERATION,
      eventLabel: property?.code || 'general',
      propertyData: property,
      customParams: {
        contact_method: 'whatsapp',
        contact_source: source,
      },
    });
  }, []);
  
  /**
   * Track de contato via telefone
   */
  const trackContactPhone = useCallback((
    property?: PropertyData,
    source: string = 'button'
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.CONTACT_PHONE,
      eventCategory: EventCategory.LEAD_GENERATION,
      eventLabel: property?.code || 'general',
      propertyData: property,
      customParams: {
        contact_method: 'phone',
        contact_source: source,
      },
    });
  }, []);
  
  /**
   * Track de interação com mapa
   */
  const trackMapInteraction = useCallback((
    action: 'zoom' | 'pan' | 'marker_click' | 'cluster_click',
    propertyCode?: string
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.MAP_INTERACTION,
      eventCategory: EventCategory.ENGAGEMENT,
      eventLabel: propertyCode || 'map',
      customParams: {
        map_action: action,
        property_code: propertyCode,
      },
    });
  }, []);
  
  /**
   * Track de visualização de vídeo
   */
  const trackVideoView = useCallback((
    property: PropertyData,
    percentage: number
  ) => {
    AdvancedTracking.track({
      event: TrackingEvents.VIDEO_VIEW,
      eventCategory: EventCategory.ENGAGEMENT,
      eventLabel: property.code,
      propertyData: property,
      customParams: {
        video_percentage: percentage,
      },
    });
  }, []);
  
  /**
   * Track de comparação de imóveis
   */
  const trackPropertyCompare = useCallback((properties: PropertyData[]) => {
    AdvancedTracking.track({
      event: TrackingEvents.PROPERTY_COMPARE,
      eventCategory: EventCategory.ENGAGEMENT,
      eventLabel: properties.map(p => p.code).join(','),
      customParams: {
        compare_count: properties.length,
        property_codes: properties.map(p => p.code),
      },
    });
  }, []);
  
  /**
   * Track de page view
   */
  const trackPageView = useCallback((pagePath?: string, pageTitle?: string) => {
    AdvancedTracking.track({
      event: TrackingEvents.PAGE_VIEW,
      customParams: {
        page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : ''),
        page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
      },
    });
  }, []);
  
  return {
    // Engagement
    trackPropertyView,
    trackPropertyGalleryView,
    trackPropertyFavorite,
    trackPropertyShare,
    trackPropertyCompare,
    trackVideoView,
    trackMapInteraction,
    
    // Lead Generation
    trackPropertyContactView,
    trackPropertyContactStart,
    trackContactWhatsApp,
    trackContactPhone,
    
    // Conversions
    trackLead,
    trackScheduleVisit,
    
    // Remarketing
    trackSearch,
    trackFilterChange,
    
    // Page tracking
    trackPageView,
  };
}

