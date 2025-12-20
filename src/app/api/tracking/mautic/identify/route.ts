// src/app/api/tracking/mautic/identify/route.ts

import { NextResponse } from 'next/server';

const MAUTIC_BASE_URL = process.env.MAUTIC_BASE_URL;
const MAUTIC_USERNAME = process.env.MAUTIC_API_USERNAME;
const MAUTIC_PASSWORD = process.env.MAUTIC_API_PASSWORD;
const MAUTIC_TOKEN = process.env.MAUTIC_ACCESS_TOKEN;

/**
 * Identificar lead no Mautic (quando preenche formulário)
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!MAUTIC_BASE_URL) {
      return NextResponse.json({ success: false }, { status: 200 });
    }

    // Criar ou atualizar contato
    const contact = await findOrCreateContact(data);

    return NextResponse.json({
      success: true,
      contactId: contact.id,
    }, { status: 200 });
  } catch (error) {
    console.error('[Mautic Identify] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function findOrCreateContact(data: any) {
  // Buscar contato
  const searchResponse = await mauticRequest(`/api/contacts?search=email:${data.email}`, 'GET');

  let contact;
  if (searchResponse?.contacts && Object.keys(searchResponse.contacts).length > 0) {
    const contactId = Object.keys(searchResponse.contacts)[0];
    contact = searchResponse.contacts[contactId];
    
    // Atualizar
    await mauticRequest(`/api/contacts/${contact.id}/edit`, 'PATCH', {
      firstname: data.name?.split(' ')[0],
      lastname: data.name?.split(' ').slice(1).join(' '),
      phone: data.phone,
      fields: {
        all: {
          lead_source: data.source,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
          total_pageviews: data.totalPageViews,
          total_property_views: data.totalPropertyViews,
          lead_score_internal: data.score,
          device: data.device,
        },
      },
    });
  } else {
    // Criar novo
    const createResponse = await mauticRequest('/api/contacts/new', 'POST', {
      email: data.email,
      firstname: data.name?.split(' ')[0],
      lastname: data.name?.split(' ').slice(1).join(' '),
      phone: data.phone,
      tags: ['website', 'identified', `source_${data.source}`],
      fields: {
        all: {
          lead_source: data.source,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
          first_visit: data.firstVisit,
          total_pageviews: data.totalPageViews,
          total_property_views: data.totalPropertyViews,
          lead_score_internal: data.score,
          device: data.device,
        },
      },
    });

    contact = createResponse.contact;
  }

  return contact;
}

async function mauticRequest(endpoint: string, method: string, body?: any) {
  const url = `${MAUTIC_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (MAUTIC_TOKEN) {
    headers['Authorization'] = `Bearer ${MAUTIC_TOKEN}`;
  } else if (MAUTIC_USERNAME && MAUTIC_PASSWORD) {
    headers['Authorization'] = `Basic ${Buffer.from(`${MAUTIC_USERNAME}:${MAUTIC_PASSWORD}`).toString('base64')}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`Mautic API error: ${response.status}`);
  }

  return response.json();
}

