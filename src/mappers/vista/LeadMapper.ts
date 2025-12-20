/**
 * Mapper Lead Domain → Vista
 * 
 * Converte lead do domínio Pharos para formato do Vista
 */

import type { LeadInput, LeadResult } from '@/domain/models';
import type { VistaLeadInput, VistaLeadResponse } from '@/providers/vista/types';
import { cleanString, normalizePhone } from '@/mappers/normalizers';

/**
 * Mapeia LeadInput para formato do Vista
 */
export function mapLeadToVista(lead: LeadInput): VistaLeadInput {
  return {
    Nome: lead.name,
    Email: cleanString(lead.email),
    Telefone: normalizePhone(lead.phone),
    Celular: normalizePhone(lead.phone),
    Mensagem: cleanString(lead.message),
    Assunto: cleanString(lead.subject),
    CodigoImovel: cleanString(lead.propertyCode || lead.propertyId),
    Origem: lead.source || 'site',
    UTMSource: cleanString(lead.utm?.source),
    UTMMedium: cleanString(lead.utm?.medium),
    UTMCampaign: cleanString(lead.utm?.campaign),
    URLOrigem: cleanString(lead.referralUrl),
  };
}

/**
 * Mapeia resposta do Vista para LeadResult
 */
export function mapVistaLeadResponse(response: VistaLeadResponse): LeadResult {
  const success = response.sucesso === true || 
                  response.success === true || 
                  (response.codigo !== undefined && !response.erro);
  
  return {
    success,
    leadId: response.codigo ? String(response.codigo) : undefined,
    message: cleanString(response.mensagem || response.message) || 
             (success ? 'Lead criado com sucesso' : 'Erro ao criar lead'),
    errors: response.erro || response.error ? [String(response.erro || response.error)] : undefined,
  };
}

