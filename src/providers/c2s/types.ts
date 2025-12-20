/**
 * Tipos e Interfaces para Contact2Sale API
 * 
 * @see https://api.contact2sale.com/docs/api
 */

// ============================================
// TIPOS DE DOMÍNIO C2S
// ============================================

/**
 * Status do lead no C2S
 */
export type C2SLeadStatus = 
  | 'novo'
  | 'em_negociacao'
  | 'convertido'
  | 'negocio_fechado'
  | 'arquivado'
  | 'resgatado'
  | 'pendente'
  | 'recusado'
  | 'finalizado';

/**
 * Tipo de negociação
 */
export type C2SNegotiationType = 'Venda' | 'Aluguel' | 'Temporada';

/**
 * Tipo de produto (imóvel)
 */
export type C2SProductType = 
  | 'Apartamento'
  | 'Casa'
  | 'Cobertura'
  | 'Terreno'
  | 'Comercial'
  | 'Loft'
  | 'Kitnet';

// ============================================
// REQUEST PAYLOADS
// ============================================

/**
 * Dados do cliente (customer)
 */
export interface C2SCustomer {
  name: string;
  email?: string;
  phone?: string; // Formato: "5548999999999" (apenas dígitos, com DDI)
  phone2?: string;
  neighbourhood?: string;
}

/**
 * Dados do produto (imóvel)
 */
export interface C2SProduct {
  description: string;
  brand?: string; // Empreendimento
  model?: string; // Tipo do imóvel
  version?: string; // Código interno
  year?: string; // Ano de construção
  color?: string; // Não usado para imóveis
  km?: string; // Não usado para imóveis
  license_plate?: string; // Código do imóvel
  price?: number;
  real_estate_detail?: {
    negotiation_name?: C2SNegotiationType;
    area?: number;
    rooms?: number;
    suites?: number;
    bathrooms?: number;
    garage?: number;
    location?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
}

/**
 * Dados do vendedor (seller)
 */
export interface C2SSeller {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  external_id?: string; // ID externo para sincronização
}

/**
 * Fonte do lead
 */
export interface C2SLeadSource {
  id?: number;
  name: string;
}

/**
 * Canal de captura
 */
export interface C2SChannel {
  id?: number;
  name: string;
}

/**
 * Tag do lead
 */
export interface C2STag {
  id?: string;
  name: string;
}

/**
 * Payload completo para criação de lead (formato flat que o C2S espera)
 */
export interface C2SLeadPayload {
  // Campos principais (flat, não aninhados!)
  name: string; // Nome do cliente
  email?: string; // Email do cliente
  phone?: string; // Telefone do cliente (formato: "5548999999999")
  source?: string; // Fonte do lead (ex: "Site Pharos")
  description: string; // Descrição/mensagem do lead
  tags?: string[]; // Array de tags (ex: ["site", "novo-site"])
  
  // Campos opcionais
  seller_id?: string; // ID do vendedor (pode ser obrigatório)
  company_id?: string; // ID da empresa (pode ser obrigatório)
  
  // Metadados customizados (se necessário)
  metadata?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    referral_url?: string;
    user_agent?: string;
    property_code?: string;
    property_url?: string;
    intent?: string;
    accepts_marketing?: boolean;
    accepts_whatsapp?: boolean;
    timestamp?: string;
    idempotency_key?: string;
  };
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Resposta da criação de lead
 */
export interface C2SLeadResponse {
  success: boolean;
  lead_id: string;
  received_by?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  company?: string;
  info?: any;
}

/**
 * Resposta de lista de leads
 */
export interface C2SLeadsListResponse {
  data: Array<any>; // Formato de lista diferente do create
  meta: {
    total: number;
    page: number;
    perpage: number;
  };
}

/**
 * Resposta de lista de sellers
 */
export interface C2SSellersResponse {
  data: Array<{
    type: 'seller';
    id: string;
    attributes: C2SSeller;
  }>;
}

/**
 * Resposta de criação de tag
 */
export interface C2STagResponse {
  data: {
    type: 'tag';
    id: string;
    attributes: {
      name: string;
      color?: string;
    };
  };
}

// ============================================
// WEBHOOK TYPES
// ============================================

/**
 * Ações de webhook disponíveis
 */
export type C2SWebhookAction = 
  | 'on_create_lead'
  | 'on_update_lead'
  | 'on_close_lead';

/**
 * Status do lead no formato do webhook
 */
export interface C2SWebhookLeadStatus {
  id: string | number;
  alias: string;
  name?: string;
}

/**
 * Status do funil no formato do webhook
 */
export interface C2SWebhookFunnelStatus {
  id: string | number;
  alias: string;
  name?: string;
}

/**
 * Fonte do lead no formato do webhook
 */
export interface C2SWebhookLeadSource {
  id: number;
  name: string;
}

/**
 * Cliente/Customer no formato do webhook
 */
export interface C2SWebhookCustomer {
  name: string;
  email?: string;
  phone?: string;
  phone2?: string;
  neighbourhood?: string;
}

/**
 * Vendedor no formato do webhook
 */
export interface C2SWebhookSeller {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

/**
 * Produto no formato do webhook
 */
export interface C2SWebhookProduct {
  license_plate?: string; // Código do imóvel
  description?: string;
  price?: number;
  brand?: string;
  model?: string;
}

/**
 * Atributos do lead recebidos no webhook (formato JSON:API)
 */
export interface C2SWebhookLeadAttributes {
  customer: C2SWebhookCustomer;
  lead_status: C2SWebhookLeadStatus;
  funnel_status?: C2SWebhookFunnelStatus;
  lead_source?: C2SWebhookLeadSource;
  seller?: C2SWebhookSeller;
  product?: C2SWebhookProduct;
  description?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Dados do lead no formato JSON:API (usado nos webhooks)
 */
export interface C2SWebhookLead {
  type: 'lead';
  id: string;
  attributes: C2SWebhookLeadAttributes;
}

/**
 * Payload completo do webhook no formato JSON:API
 */
export interface C2SWebhookPayloadJsonApi {
  hook_action: C2SWebhookAction;
  data: C2SWebhookLead;
  timestamp: string;
  signature?: string;
}

/**
 * Payload de webhook (formato simples - fallback)
 * Alguns webhooks podem enviar data diretamente sem envelope
 */
export interface C2SWebhookPayloadFlat {
  hook_action: C2SWebhookAction;
  data: {
    id: string;
    customer: C2SWebhookCustomer;
    lead_status: C2SWebhookLeadStatus;
    funnel_status?: C2SWebhookFunnelStatus;
    lead_source?: C2SWebhookLeadSource;
    seller?: C2SWebhookSeller;
    product?: C2SWebhookProduct;
    [key: string]: unknown;
  };
  timestamp: string;
  signature?: string;
}

/**
 * Payload de webhook (union type para aceitar ambos formatos)
 */
export type C2SWebhookPayload = C2SWebhookPayloadJsonApi | C2SWebhookPayloadFlat;

/**
 * Lead normalizado (formato interno após processar webhook)
 */
export interface C2SNormalizedLead {
  id: string;
  customer: C2SWebhookCustomer;
  lead_status: C2SWebhookLeadStatus;
  funnel_status?: C2SWebhookFunnelStatus;
  lead_source?: C2SWebhookLeadSource;
  seller?: C2SWebhookSeller;
  product?: C2SWebhookProduct;
  description?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Configuração de webhook
 */
export interface C2SWebhookConfig {
  hook_url: string;
  hook_action: C2SWebhookAction;
}

// ============================================
// VISIT/ACTIVITY TYPES
// ============================================

/**
 * Dados de visita
 */
export interface C2SVisitData {
  lead_id: string;
  seller_id?: string;
  property_code?: string;
  scheduled_date: string; // ISO 8601
  notes?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

/**
 * Dados de atividade
 */
export interface C2SActivityData {
  lead_id: string;
  type: 'call' | 'email' | 'whatsapp' | 'visit' | 'meeting' | 'other';
  description: string;
  date: string; // ISO 8601
  seller_id?: string;
  notes?: string;
}

/**
 * Dados de negócio fechado
 */
export interface C2SDoneDealData {
  lead_id: string;
  done: true;
  done_details?: string;
  done_price?: number;
  closed_at?: string; // ISO 8601
}

// ============================================
// DISTRIBUTION TYPES
// ============================================

/**
 * Fila de distribuição
 */
export interface C2SDistributionQueue {
  id: string;
  name: string;
  description?: string;
  strategy: 'round_robin' | 'priority' | 'custom';
  active: boolean;
}

/**
 * Seller na fila de distribuição
 */
export interface C2SDistributionQueueSeller {
  id: number;
  distribution_queue_id: number;
  seller_id: number;
  priority: number;
  status: 'enabled' | 'disabled';
  last_lead_received_at: string | null;
}

/**
 * Regra de distribuição
 */
export interface C2SDistributionRule {
  cod_1?: string; // Código/tipo de imóvel
  cod_2?: string; // Tipo de negociação
  cod_3?: string; // Valor ou outras condições
  seller_id: string;
  company_id: string;
  priority: boolean;
  type_rule: 'rotation' | 'direct' | 'custom';
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Erro da API C2S
 */
export interface C2SError {
  success: false;
  message: string;
  errors?: string[];
  statusCode?: number;
}

/**
 * Resposta genérica de sucesso
 */
export interface C2SSuccessResponse {
  success: true;
  message: string;
  data?: any;
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * Configuração do cliente C2S
 */
export interface C2SConfig {
  apiUrl: string;
  apiToken: string;
  companyId?: string;
  defaultSellerId?: string; // Vendedor padrão para leads sem vendedor específico
  webhookSecret?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Feature flags para C2S
 */
export interface C2SFeatureFlags {
  enabled: boolean;
  syncSellers: boolean;
  autoTags: boolean;
  webhooksEnabled: boolean;
  distributionEnabled: boolean;
  visitIntegration: boolean;
}

