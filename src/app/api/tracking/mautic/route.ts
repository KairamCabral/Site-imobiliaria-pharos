// src/app/api/tracking/mautic/route.ts

import { NextResponse } from 'next/server';

/**
 * API Route para enviar eventos para Mautic
 * 
 * Configuração necessária (.env.local):
 * - MAUTIC_BASE_URL - URL base do Mautic (ex: https://mautic.pharos.imob.br)
 * - MAUTIC_API_USERNAME - Username da API
 * - MAUTIC_API_PASSWORD - Password da API
 * OU
 * - MAUTIC_ACCESS_TOKEN - OAuth2 access token
 */

const MAUTIC_BASE_URL = process.env.MAUTIC_BASE_URL;
const MAUTIC_USERNAME = process.env.MAUTIC_API_USERNAME;
const MAUTIC_PASSWORD = process.env.MAUTIC_API_PASSWORD;
const MAUTIC_TOKEN = process.env.MAUTIC_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    const { action, sessionId, email, leadData, metadata } = await request.json();

    if (!MAUTIC_BASE_URL) {
      console.warn('[Mautic] MAUTIC_BASE_URL not configured');
      return NextResponse.json({ success: false, error: 'Mautic not configured' }, { status: 200 });
    }

    // Mapear ação para ponto do Mautic
    const points = getPointsForAction(action);

    // Se não tiver email, apenas registrar como visitante anônimo
    if (!email) {
      await trackAnonymousContact(sessionId, action, leadData, metadata);
      return NextResponse.json({ success: true, anonymous: true }, { status: 200 });
    }

    // Buscar ou criar contato no Mautic
    const contact = await findOrCreateContact(email, leadData);

    if (!contact) {
      throw new Error('Failed to create/find contact in Mautic');
    }

    // Adicionar pontos pela ação
    if (points > 0) {
      await addPointsToContact(contact.id, points, action);
    }

    // Registrar evento customizado
    await trackCustomEvent(contact.id, action, metadata);

    // Adicionar tags baseadas no comportamento
    await addBehaviorTags(contact.id, action, leadData);

    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('[Mautic] Event tracked:', {
        action,
        contactId: contact.id,
        email,
        points,
      });
    }

    return NextResponse.json({
      success: true,
      contactId: contact.id,
      points,
    }, { status: 200 });
  } catch (error) {
    console.error('[Mautic] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Buscar ou criar contato no Mautic
 */
async function findOrCreateContact(email: string, leadData: any): Promise<any> {
  try {
    // Buscar contato existente
    let contact = await mauticRequest(`/api/contacts?search=email:${email}`, 'GET');

    if (contact?.contacts && Object.keys(contact.contacts).length > 0) {
      // Contato existe, retornar o primeiro
      const contactId = Object.keys(contact.contacts)[0];
      contact = contact.contacts[contactId];
      
      // Atualizar dados do contato
      await updateContact(contact.id, leadData);
      
      return contact;
    }

    // Criar novo contato
    const newContact = await mauticRequest('/api/contacts/new', 'POST', {
      email,
      firstname: leadData.name?.split(' ')[0],
      lastname: leadData.name?.split(' ').slice(1).join(' '),
      phone: leadData.phone,
      tags: ['website', `source_${leadData.source}`],
      fields: {
        all: {
          // Campos customizados
          lead_source: leadData.source,
          utm_source: leadData.utm_source,
          utm_medium: leadData.utm_medium,
          utm_campaign: leadData.utm_campaign,
          first_visit: leadData.firstVisit,
          device: leadData.device,
          total_pageviews: leadData.totalPageViews,
          total_property_views: leadData.totalPropertyViews,
          lead_score_internal: leadData.score,
        },
      },
    });

    return newContact?.contact;
  } catch (error) {
    console.error('[Mautic] Error finding/creating contact:', error);
    throw error;
  }
}

/**
 * Atualizar dados do contato
 */
async function updateContact(contactId: number, leadData: any): Promise<void> {
  try {
    await mauticRequest(`/api/contacts/${contactId}/edit`, 'PATCH', {
      phone: leadData.phone,
      fields: {
        all: {
          total_pageviews: leadData.totalPageViews,
          total_property_views: leadData.totalPropertyViews,
          lead_score_internal: leadData.score,
          last_visit: leadData.lastVisit,
          time_on_site: leadData.timeOnSite,
          scroll_depth: leadData.scrollDepth,
        },
      },
    });
  } catch (error) {
    console.error('[Mautic] Error updating contact:', error);
  }
}

/**
 * Adicionar pontos ao contato
 */
async function addPointsToContact(contactId: number, points: number, reason: string): Promise<void> {
  try {
    await mauticRequest(`/api/contacts/${contactId}/points/plus/${points}`, 'POST', {
      eventName: reason,
      actionName: reason,
    });
  } catch (error) {
    console.error('[Mautic] Error adding points:', error);
  }
}

/**
 * Registrar evento customizado
 */
async function trackCustomEvent(contactId: number, action: string, metadata: any): Promise<void> {
  try {
    // Mautic não tem endpoint direto de eventos, usar notes
    await mauticRequest(`/api/contacts/${contactId}/notes/new`, 'POST', {
      text: `Ação: ${action}`,
      type: 'general',
    });
  } catch (error) {
    console.error('[Mautic] Error tracking event:', error);
  }
}

/**
 * Adicionar tags baseadas no comportamento
 */
async function addBehaviorTags(contactId: number, action: string, leadData: any): Promise<void> {
  try {
    const tags: string[] = [];

    // Tags baseadas em score
    if (leadData.score >= 50) tags.push('hot_lead');
    else if (leadData.score >= 25) tags.push('warm_lead');
    else tags.push('cold_lead');

    // Tags baseadas em ação
    if (action === 'property_view' && leadData.totalPropertyViews >= 5) {
      tags.push('active_searcher');
    }

    if (action === 'form_submit') {
      tags.push('contacted');
    }

    if (action === 'whatsapp_click') {
      tags.push('whatsapp_interested');
    }

    // Adicionar tags
    if (tags.length > 0) {
      await mauticRequest(`/api/contacts/${contactId}/edit`, 'PATCH', {
        tags,
      });
    }
  } catch (error) {
    console.error('[Mautic] Error adding tags:', error);
  }
}

/**
 * Trackear contato anônimo
 */
async function trackAnonymousContact(sessionId: string, action: string, leadData: any, metadata: any): Promise<void> {
  // Mautic tracking JS irá criar um cookie mtc_id
  // Aqui apenas logamos para referência
  if (process.env.NODE_ENV === 'development') {
    console.log('[Mautic] Anonymous contact:', { sessionId, action });
  }
}

/**
 * Fazer request para API do Mautic
 */
async function mauticRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const url = `${MAUTIC_BASE_URL}${endpoint}`;

  // Preparar headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Autenticação
  if (MAUTIC_TOKEN) {
    headers['Authorization'] = `Bearer ${MAUTIC_TOKEN}`;
  } else if (MAUTIC_USERNAME && MAUTIC_PASSWORD) {
    const credentials = Buffer.from(`${MAUTIC_USERNAME}:${MAUTIC_PASSWORD}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mautic API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Mapear ação para pontos
 */
function getPointsForAction(action: string): number {
  const pointsMap: Record<string, number> = {
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

  return pointsMap[action] || 0;
}

