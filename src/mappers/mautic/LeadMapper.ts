/**
 * Lead Mapper - Pharos → Mautic
 * 
 * Converte LeadInput do domínio Pharos para formato do Mautic
 */

import type { LeadInput } from '@/domain/models';
import type { MauticContactRequest, MauticCustomFields } from '@/providers/mautic';

/**
 * Mapeia LeadInput para MauticContactRequest
 */
export function mapLeadToMautic(lead: LeadInput): MauticContactRequest {
  // Divide nome em primeiro e último
  const nameParts = lead.name.trim().split(' ');
  const firstname = nameParts[0] || '';
  const lastname = nameParts.slice(1).join(' ') || '';

  const contact: MauticContactRequest = {
    email: lead.email,
    firstname,
    lastname,
    mobile: lead.phone,
    phone: lead.phone,
  };

  // Campos personalizados básicos
  if (lead.intent) {
    contact.lead_intent = lead.intent;
  }

  if (lead.source) {
    contact.lead_source = lead.source;
  }

  if (lead.message) {
    contact.description = lead.message;
  }

  if (lead.subject) {
    contact.subject = lead.subject;
  }

  // UTM Tracking
  if (lead.utm) {
    if (lead.utm.source) contact.utm_source = lead.utm.source;
    if (lead.utm.medium) contact.utm_medium = lead.utm.medium;
    if (lead.utm.campaign) contact.utm_campaign = lead.utm.campaign;
    if (lead.utm.term) contact.utm_term = lead.utm.term;
    if (lead.utm.content) contact.utm_content = lead.utm.content;
  }

  // Referrer URL
  if (lead.referralUrl) {
    contact.referrer_url = lead.referralUrl;
  }

  // Dados do imóvel (de propertyCode ou metadata)
  if (lead.propertyCode) {
    contact.imovel_codigo = lead.propertyCode;
  }

  // Metadados adicionais (enriquecimento, dados do imóvel, etc)
  if (lead.metadata) {
    // Dados do imóvel
    if (lead.metadata.imovel_titulo) contact.imovel_titulo = lead.metadata.imovel_titulo;
    if (lead.metadata.imovel_preco) contact.imovel_preco = lead.metadata.imovel_preco;
    if (lead.metadata.imovel_quartos) contact.imovel_quartos = lead.metadata.imovel_quartos;
    if (lead.metadata.imovel_area) contact.imovel_area = lead.metadata.imovel_area;
    if (lead.metadata.imovel_tipo) contact.imovel_tipo = lead.metadata.imovel_tipo;
    if (lead.metadata.imovel_url) contact.imovel_url = lead.metadata.imovel_url;

    // Dados de enriquecimento
    if (lead.metadata.device_type) contact.device_type = lead.metadata.device_type;
    if (lead.metadata.browser) contact.browser = lead.metadata.browser;
    if (lead.metadata.os) contact.os = lead.metadata.os;
    if (lead.metadata.cidade) contact.cidade = lead.metadata.cidade;
    if (lead.metadata.estado) contact.estado = lead.metadata.estado;
    if (lead.metadata.ip) contact.ip = lead.metadata.ip;
    if (lead.metadata.timezone) contact.timezone = lead.metadata.timezone;

    // Outros metadados customizados
    Object.keys(lead.metadata).forEach(key => {
      // Evita sobrescrever campos já mapeados
      if (!contact[key] && lead.metadata![key]) {
        contact[key] = lead.metadata![key];
      }
    });
  }

  // Preferências de marketing
  if (lead.acceptsMarketing !== undefined) {
    contact.aceita_marketing = lead.acceptsMarketing;
  }

  if (lead.acceptsWhatsapp !== undefined) {
    contact.aceita_whatsapp = lead.acceptsWhatsapp;
  }

  return contact;
}

/**
 * Extrai campos personalizados do lead
 */
export function extractCustomFields(lead: LeadInput): MauticCustomFields {
  const fields: MauticCustomFields = {};

  // Intenção
  if (lead.intent) {
    fields.lead_intent = lead.intent;
  }

  // Fonte
  if (lead.source) {
    fields.lead_source = lead.source;
  }

  // UTM
  if (lead.utm) {
    fields.utm_source = lead.utm.source;
    fields.utm_medium = lead.utm.medium;
    fields.utm_campaign = lead.utm.campaign;
    fields.utm_term = lead.utm.term;
    fields.utm_content = lead.utm.content;
  }

  // Dados do imóvel (de metadata)
  if (lead.metadata) {
    if (lead.metadata.imovel_codigo) fields.imovel_codigo = lead.metadata.imovel_codigo;
    if (lead.metadata.imovel_titulo) fields.imovel_titulo = lead.metadata.imovel_titulo;
    if (lead.metadata.imovel_preco) fields.imovel_preco = lead.metadata.imovel_preco;
    if (lead.metadata.imovel_quartos) fields.imovel_quartos = lead.metadata.imovel_quartos;
    if (lead.metadata.imovel_area) fields.imovel_area = lead.metadata.imovel_area;
    if (lead.metadata.imovel_tipo) fields.imovel_tipo = lead.metadata.imovel_tipo;
    if (lead.metadata.imovel_url) fields.imovel_url = lead.metadata.imovel_url;

    // Device e contexto
    if (lead.metadata.device_type) fields.device_type = lead.metadata.device_type;
    if (lead.metadata.browser) fields.browser = lead.metadata.browser;
    if (lead.metadata.cidade) fields.cidade = lead.metadata.cidade;
    if (lead.metadata.estado) fields.estado = lead.metadata.estado;
  }

  // Referrer
  if (lead.referralUrl) {
    fields.referrer_url = lead.referralUrl;
  }

  return fields;
}

/**
 * Normaliza nome de campo para formato do Mautic
 * Remove caracteres especiais e converte para snake_case
 */
export function normalizeMauticFieldName(fieldName: string): string {
  return fieldName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

