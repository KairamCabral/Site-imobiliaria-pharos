/**
 * Mautic Types
 * 
 * Tipos TypeScript para integração com Mautic API
 */

export type MauticAuthType = 'basic' | 'oauth2';

/**
 * Configuração do Mautic
 */
export interface MauticConfig {
  baseUrl: string;
  authType: MauticAuthType;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  timeout?: number;
}

/**
 * Contato do Mautic
 */
export interface MauticContact {
  id?: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  mobile?: string;
  phone?: string;
  
  // Campos personalizados
  [key: string]: any;
}

/**
 * Campos personalizados do lead
 */
export interface MauticCustomFields {
  // Informações do imóvel
  imovel_codigo?: string;
  imovel_titulo?: string;
  imovel_preco?: number;
  imovel_quartos?: number;
  imovel_area?: number;
  imovel_tipo?: string;
  imovel_url?: string;
  
  // Intenção do lead
  lead_intent?: string;
  lead_source?: string;
  
  // UTM tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  
  // Enriquecimento
  device_type?: string;
  browser?: string;
  cidade?: string;
  estado?: string;
  referrer_url?: string;
}

/**
 * Request para criar/atualizar contato
 */
export interface MauticContactRequest {
  email?: string;
  firstname?: string;
  lastname?: string;
  mobile?: string;
  phone?: string;
  tags?: string[];
  
  // Campos personalizados
  [key: string]: any;
}

/**
 * Resposta da API do Mautic
 */
export interface MauticResponse<T = any> {
  contact?: MauticContact;
  contacts?: Record<string, MauticContact>;
  errors?: Array<{
    code: number;
    message: string;
    details?: any;
  }>;
}

/**
 * Tag do Mautic
 */
export interface MauticTag {
  tag: string;
}

/**
 * Resultado de operação no Mautic
 */
export interface MauticResult {
  success: boolean;
  contactId?: number;
  message?: string;
  errors?: string[];
  wasUpdated?: boolean;
  isNew?: boolean;
}

/**
 * Opções para criação de lead
 */
export interface MauticLeadOptions {
  skipIfExists?: boolean;
  overrideWithBlank?: boolean;
}

