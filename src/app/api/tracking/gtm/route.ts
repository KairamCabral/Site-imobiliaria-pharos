// src/app/api/tracking/gtm/route.ts

import { NextResponse } from 'next/server';

/**
 * API Route para enviar eventos para SSGTM (Server-Side Google Tag Manager)
 * 
 * Configuração necessária:
 * - NEXT_PUBLIC_SSGTM_ENDPOINT - URL do container SSGTM
 * - SSGTM_MEASUREMENT_ID - Measurement ID do Google Analytics 4
 * - SSGTM_API_SECRET - API Secret do GA4
 */

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validar dados mínimos
    if (!data.event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Extrair informações do request
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Preparar payload para SSGTM
    const eventPayload = {
      // Identificadores
      client_id: data.sessionId || generateClientId(),
      user_id: data.userId,
      
      // Evento
      events: [
        {
          name: mapEventName(data.event),
          params: {
            // Dados do evento
            session_id: data.sessionId,
            engagement_time_msec: data.engagementTime || 100,
            
            // Source/Medium/Campaign
            source: data.source,
            medium: data.medium || data.utm_medium,
            campaign: data.campaign || data.utm_campaign,
            content: data.content || data.utm_content,
            term: data.term || data.utm_term,
            
            // Dados do lead
            lead_score: data.score,
            lead_email: data.email,
            lead_phone: data.phone,
            
            // Contexto
            page_location: data.url || data.page_location,
            page_title: data.title || data.page_title,
            page_referrer: data.referrer,
            
            // Device
            device_category: data.device,
            browser: data.browser,
            os: data.os,
            
            // Metadata adicional
            ...data.metadata,
            
            // Conversão
            ...(data.event === 'conversion' && {
              conversion_type: data.conversion_type,
              value: data.value || 1,
              currency: data.currency || 'BRL',
            }),
            
            // Property específico
            ...(data.propertyId && {
              property_id: data.propertyId,
              property_title: data.propertyTitle,
              property_price: data.propertyPrice,
            }),
          },
        },
      ],
      
      // Informações do usuário
      user_properties: {
        lead_source: { value: data.source },
        lead_score: { value: data.score },
        total_page_views: { value: data.totalPageViews },
        total_property_views: { value: data.totalPropertyViews },
      },
      
      // Timestamp
      timestamp_micros: Date.now() * 1000,
    };

    // Enviar para SSGTM
    const ssgtmEndpoint = process.env.NEXT_PUBLIC_SSGTM_ENDPOINT;
    
    if (ssgtmEndpoint) {
      // Enviar para container SSGTM customizado
      await fetch(ssgtmEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'X-Forwarded-For': ip,
        },
        body: JSON.stringify({
          event_name: data.event,
          ...eventPayload,
        }),
      });
    }

    // Também enviar diretamente para GA4 Measurement Protocol (backup)
    const measurementId = process.env.SSGTM_MEASUREMENT_ID;
    const apiSecret = process.env.SSGTM_API_SECRET;

    if (measurementId && apiSecret) {
      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventPayload),
        }
      );
    }

    // Log para debug (remover em produção)
    if (process.env.NODE_ENV === 'development') {
      console.log('[SSGTM] Event sent:', {
        event: data.event,
        sessionId: data.sessionId,
        score: data.score,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[SSGTM] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Mapear nomes de eventos internos para GA4
 */
function mapEventName(event: string): string {
  const eventMap: Record<string, string> = {
    page_view: 'page_view',
    property_view: 'view_item',
    property_favorite: 'add_to_wishlist',
    whatsapp_click: 'generate_lead',
    form_submit: 'generate_lead',
    phone_click: 'generate_lead',
    email_click: 'contact',
    schedule_visit: 'begin_checkout',
    download_pdf: 'file_download',
    search: 'search',
    conversion: 'conversion',
  };

  return eventMap[event] || event;
}

/**
 * Gerar client_id único se não fornecido
 */
function generateClientId(): string {
  return `${Date.now()}.${Math.random().toString(36).substring(2, 15)}`;
}

