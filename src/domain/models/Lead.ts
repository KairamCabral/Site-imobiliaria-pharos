/**
 * Modelos de Domínio - Lead (Contato/Cliente)
 */

export type LeadSource = 
  | 'site'
  | 'facebook'
  | 'instagram'
  | 'google'
  | 'email'
  | 'whatsapp'
  | 'phone'
  | 'referral'
  | 'other';

export type LeadIntent = 
  | 'buy'
  | 'rent'
  | 'sell'
  | 'evaluate'
  | 'info'
  | 'partnership'
  | 'other';

export interface LeadUTM {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface LeadInput {
  // Dados pessoais
  name: string;
  email?: string;
  phone?: string;
  
  // Mensagem
  message?: string;
  subject?: string;

  // Contexto
  intent?: LeadIntent;
  propertyId?: string; // Imóvel de interesse
  propertyCode?: string;

  // Rastreamento
  source?: LeadSource;
  utm?: LeadUTM;
  referralUrl?: string;
  userAgent?: string;

  // Dados adicionais
  acceptsMarketing?: boolean;
  acceptsWhatsapp?: boolean;
  
  // Metadados
  metadata?: Record<string, any>;
}

export interface Lead extends LeadInput {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  
  // Relacionamentos
  realtorId?: string;
  agencyId?: string;

  // Provider info
  providerData?: {
    provider: string;
    originalId: string;
    [key: string]: any;
  };
}

export interface LeadResult {
  success: boolean;
  leadId?: string;
  message?: string;
  errors?: string[];
}

