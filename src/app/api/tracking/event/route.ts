/**
 * API Route: /api/tracking/event
 * 
 * Endpoint para receber eventos de tracking do frontend
 * e enviar para SSGTM, Meta CAPI e Google Ads
 */

import { NextRequest, NextResponse } from 'next/server';
import type { TrackingPayload, MetaConversionAPIPayload } from '@/types/tracking';

export const dynamic = 'force-dynamic';

/**
 * Envia evento para SSGTM
 */
async function sendToSSGTM(payload: any): Promise<boolean> {
  const ssgtmUrl = process.env.SSGTM_ENDPOINT_URL;
  
  if (!ssgtmUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  [SSGTM] Endpoint não configurado');
    }
    return false;
  }
  
  try {
    const response = await fetch(ssgtmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [SSGTM] Evento enviado:', payload.event);
      }
      return true;
    } else {
      console.error('[SSGTM] Erro ao enviar:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[SSGTM] Erro de rede:', error);
    return false;
  }
}

/**
 * Envia conversão para Meta Conversion API
 */
async function sendToMetaConversionAPI(payload: TrackingPayload): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSION_API_TOKEN;
  
  if (!pixelId || !accessToken) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  [Meta CAPI] Credenciais não configuradas');
    }
    return false;
  }
  
  // Apenas envia conversões importantes
  const conversionEvents = ['generate_lead', 'purchase', 'add_to_wishlist', 'begin_checkout'];
  if (!conversionEvents.includes(payload.event)) {
    return false;
  }
  
  // Mapeia eventos para nomes do Meta
  const eventNameMap: Record<string, string> = {
    'generate_lead': 'Lead',
    'purchase': 'Purchase',
    'add_to_wishlist': 'AddToWishlist',
    'begin_checkout': 'InitiateCheckout',
  };
  
  const eventName = eventNameMap[payload.event] || payload.event;
  
  const metaPayload: MetaConversionAPIPayload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(new Date(payload.timestamp).getTime() / 1000),
      event_id: payload.event_id,
      action_source: 'website',
      event_source_url: payload.page_url,
      user_data: {
        ...payload.user_data,
        client_ip_address: payload.ip_address,
        client_user_agent: payload.user_agent,
        fbp: payload.fbp,
        fbc: payload.fbc,
      },
      custom_data: {
        currency: payload.currency || 'BRL',
        value: payload.value || 0,
        content_name: payload.ecommerce?.items?.[0]?.item_name,
        content_category: payload.ecommerce?.items?.[0]?.item_category,
        content_ids: payload.ecommerce?.items?.map(item => item.item_id),
        content_type: 'product',
        num_items: payload.ecommerce?.items?.length || 1,
      },
    }],
  };
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metaPayload,
          access_token: accessToken,
        }),
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [Meta CAPI] Conversão enviada:', eventName, result);
      }
      return true;
    } else {
      const error = await response.text();
      console.error('[Meta CAPI] Erro ao enviar:', response.status, error);
      return false;
    }
  } catch (error) {
    console.error('[Meta CAPI] Erro de rede:', error);
    return false;
  }
}

/**
 * Envia conversão para Google Ads (via GA4 Measurement Protocol)
 * 
 * Nota: Para Enhanced Conversions direto no Google Ads, é necessário
 * usar a Google Ads API com OAuth2, que é mais complexa.
 * Por enquanto, vamos enviar via GA4 que automaticamente sincroniza
 * com Google Ads se houver linking configurado.
 */
async function sendToGoogleAnalytics(payload: TrackingPayload): Promise<boolean> {
  const measurementId = process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID;
  const apiSecret = process.env.GOOGLE_ANALYTICS_API_SECRET;
  
  if (!measurementId || !apiSecret) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  [GA4] Credenciais não configuradas');
    }
    return false;
  }
  
  const ga4Payload = {
    client_id: payload.client_id || payload.session_id,
    user_id: payload.user_id,
    timestamp_micros: new Date(payload.timestamp).getTime() * 1000,
    non_personalized_ads: false,
    events: [{
      name: payload.event,
      params: {
        session_id: payload.session_id,
        engagement_time_msec: '100',
        page_location: payload.page_url,
        page_title: payload.page_title,
        
        // Enhanced Conversions data
        ...(payload.user_data && {
          user_data: payload.user_data,
        }),
        
        // Ecommerce data
        ...(payload.ecommerce && {
          currency: payload.currency,
          value: payload.value,
          items: payload.ecommerce.items,
        }),
        
        // Marketing params
        ...(payload.gclid && { gclid: payload.gclid }),
        ...(payload.utm_source && { campaign_source: payload.utm_source }),
        ...(payload.utm_medium && { campaign_medium: payload.utm_medium }),
        ...(payload.utm_campaign && { campaign_name: payload.utm_campaign }),
        ...(payload.utm_term && { campaign_term: payload.utm_term }),
        ...(payload.utm_content && { campaign_content: payload.utm_content }),
        
        // Custom params
        ...payload.customParams,
      },
    }],
  };
  
  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ga4Payload),
      }
    );
    
    if (response.ok || response.status === 204) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [GA4] Evento enviado:', payload.event);
      }
      return true;
    } else {
      console.error('[GA4] Erro ao enviar:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[GA4] Erro de rede:', error);
    return false;
  }
}

/**
 * Handler POST
 */
export async function POST(request: NextRequest) {
  try {
    const payload: TrackingPayload = await request.json();
    
    // Enriquece com dados do servidor
    const enrichedPayload = {
      ...payload,
      server_timestamp: new Date().toISOString(),
      ip_address: 
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
        request.headers.get('x-real-ip') ||
        'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    };
    
    // Envios paralelos (não bloqueantes)
    const promises = [
      sendToSSGTM(enrichedPayload),
    ];
    
    // Envia para Meta CAPI apenas em conversões
    const conversionEvents = ['generate_lead', 'purchase', 'add_to_wishlist', 'begin_checkout'];
    if (conversionEvents.includes(payload.event)) {
      promises.push(sendToMetaConversionAPI(enrichedPayload));
      promises.push(sendToGoogleAnalytics(enrichedPayload));
    }
    
    // Aguarda todos (não falha se algum der erro)
    const results = await Promise.allSettled(promises);
    
    // Log de resultados em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [Tracking API] Resultados:', {
        event: payload.event,
        results: results.map((r, i) => ({
          destination: i === 0 ? 'SSGTM' : i === 1 ? 'Meta CAPI' : 'GA4',
          status: r.status,
          value: r.status === 'fulfilled' ? r.value : r.reason,
        })),
      });
    }
    
    return NextResponse.json({
      success: true,
      event: payload.event,
      destinations: {
        ssgtm: results[0]?.status === 'fulfilled' ? results[0].value : false,
        meta: results[1]?.status === 'fulfilled' ? results[1].value : false,
        google: results[2]?.status === 'fulfilled' ? results[2].value : false,
      },
    });
  } catch (error: any) {
    console.error('[Tracking API] Erro ao processar evento:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar evento de tracking',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Handler GET (health check)
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'tracking-api',
    endpoints: {
      ssgtm: !!process.env.SSGTM_ENDPOINT_URL,
      meta_capi: !!(process.env.META_PIXEL_ID && process.env.META_CONVERSION_API_TOKEN),
      google_ads: !!(process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID && process.env.GOOGLE_ANALYTICS_API_SECRET),
    },
  });
}

