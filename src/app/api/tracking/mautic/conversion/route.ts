// src/app/api/tracking/mautic/conversion/route.ts

import { NextResponse } from 'next/server';

const MAUTIC_BASE_URL = process.env.MAUTIC_BASE_URL;
const MAUTIC_USERNAME = process.env.MAUTIC_API_USERNAME;
const MAUTIC_PASSWORD = process.env.MAUTIC_API_PASSWORD;
const MAUTIC_TOKEN = process.env.MAUTIC_ACCESS_TOKEN;

/**
 * Registrar conversão no Mautic
 */
export async function POST(request: Request) {
  try {
    const { sessionId, email, conversionType, leadData, metadata } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false }, { status: 200 });
    }

    if (!MAUTIC_BASE_URL) {
      return NextResponse.json({ success: false }, { status: 200 });
    }

    // Buscar contato
    const contact = await findContact(email);

    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    // Adicionar pontos de conversão (50 pontos)
    await addPoints(contact.id, 50, `Conversão: ${conversionType}`);

    // Adicionar tags
    await addConversionTags(contact.id, conversionType);

    // Registrar em campanha (se houver)
    // await addToCampaign(contact.id, conversionType);

    // Criar nota com detalhes
    await createConversionNote(contact.id, conversionType, metadata);

    return NextResponse.json({
      success: true,
      contactId: contact.id,
    }, { status: 200 });
  } catch (error) {
    console.error('[Mautic Conversion] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function findContact(email: string) {
  const response = await mauticRequest(`/api/contacts?search=email:${email}`, 'GET');
  if (response?.contacts && Object.keys(response.contacts).length > 0) {
    const contactId = Object.keys(response.contacts)[0];
    return response.contacts[contactId];
  }
  return null;
}

async function addPoints(contactId: number, points: number, reason: string) {
  await mauticRequest(`/api/contacts/${contactId}/points/plus/${points}`, 'POST', {
    eventName: reason,
  });
}

async function addConversionTags(contactId: number, conversionType: string) {
  const tags = ['converted', `converted_${conversionType}`];
  await mauticRequest(`/api/contacts/${contactId}/edit`, 'PATCH', { tags });
}

async function createConversionNote(contactId: number, type: string, metadata: any) {
  await mauticRequest(`/api/contacts/${contactId}/notes/new`, 'POST', {
    text: `Conversão via ${type}. Imóvel: ${metadata?.propertyId || 'N/A'}`,
    type: 'general',
  });
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

