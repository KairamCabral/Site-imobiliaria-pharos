/**
 * Validation Schemas - Imobiliária Pharos
 * 
 * Validação server-side com Zod para todos os inputs de usuário
 * Protege contra: SQL Injection, XSS, malformed data
 */

import { z } from 'zod';

// ========================================
// REGEX PATTERNS
// ========================================

// E.164 format: +[country code][number]
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Nome: apenas letras, acentos, espaços, hífens e apóstrofos
const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/;

// Código de imóvel: letras maiúsculas e números
const propertyCodeRegex = /^[A-Z0-9]{2,10}$/;

// ========================================
// SANITIZATION HELPERS
// ========================================

/**
 * Remove tags HTML perigosas e event handlers
 */
function sanitizeHtml(html: string): string {
  return html
    // Remove scripts
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframes
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove objects e embeds
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    // Remove event handlers (onclick, onerror, etc)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: URIs (exceto imagens pequenas base64 se necessário)
    .replace(/data:(?!image\/(?:png|jpeg|gif|webp);base64,)[^,]*,/gi, '')
    .trim();
}

/**
 * Limita comprimento de string
 */
function maxLength(max: number) {
  return (str: string) => str.slice(0, max);
}

// ========================================
// LEAD SCHEMA
// ========================================

export const leadSchema = z.object({
  // Informações pessoais
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(nameRegex, 'Nome contém caracteres inválidos')
    .transform(str => str.trim()),
  
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .transform(str => str.trim()),
  
  phone: z
    .string({ required_error: 'Telefone é obrigatório' })
    .regex(phoneRegex, 'Telefone inválido (use formato internacional)')
    .max(20, 'Telefone muito longo'),
  
  // Mensagem
  message: z
    .string()
    .max(2000, 'Mensagem muito longa (máximo 2000 caracteres)')
    .optional()
    .transform(str => str ? sanitizeHtml(str) : undefined),
  
  subject: z
    .string()
    .max(200, 'Assunto muito longo')
    .optional()
    .transform(str => str ? sanitizeHtml(str) : undefined),
  
  // Informações do imóvel
  propertyId: z
    .string()
    .max(50)
    .optional(),
  
  propertyCode: z
    .string()
    .regex(propertyCodeRegex, 'Código de imóvel inválido')
    .optional(),
  
  // Intenção
  intent: z.enum(['buy', 'rent', 'sell', 'info', 'partnership'], {
    errorMap: () => ({ message: 'Intenção inválida' }),
  }),
  
  // Source e tracking
  source: z.string().max(50).optional().default('site'),
  
  utm: z.object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
  }).optional(),
  
  referralUrl: z.string().url().max(500).optional().or(z.literal('')),
  
  userAgent: z.string().max(500).optional(),
  
  // Consentimentos
  acceptsMarketing: z.boolean().optional(),
  acceptsWhatsapp: z.boolean().optional(),
  
  // Metadata adicional
  metadata: z.record(z.any()).optional(),
  
  // ========================================
  // HONEYPOT FIELDS (devem estar vazios)
  // ========================================
  website: z.string().max(0).optional(),
  company: z.string().max(0).optional(),
  
  // Turnstile token
  turnstileToken: z.string().optional(),
}).strict(); // Rejeita campos extras

// ========================================
// SCHEDULE VISIT SCHEMA
// ========================================

export const scheduleVisitSchema = z.object({
  // Imóvel
  propertyId: z.string({ required_error: 'ID do imóvel é obrigatório' }).min(1),
  
  propertyCode: z
    .string()
    .regex(propertyCodeRegex)
    .optional(),
  
  propertyTitle: z
    .string()
    .max(200)
    .optional()
    .transform(str => str ? sanitizeHtml(str) : undefined),
  
  propertyAddress: z
    .string()
    .max(300)
    .optional()
    .transform(str => str ? sanitizeHtml(str) : undefined),
  
  // Tipo de visita
  type: z.enum(['in_person', 'video'], {
    errorMap: () => ({ message: 'Tipo de visita inválido' }),
  }),
  
  videoProvider: z.enum(['whatsapp', 'meet']).optional(),
  
  // Data e hora
  date: z
    .string({ required_error: 'Data é obrigatória' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
  
  time: z
    .string({ required_error: 'Hora é obrigatória' })
    .regex(/^\d{2}:\d{2}$/, 'Hora inválida (use HH:MM)'),
  
  timezone: z.string().max(50).optional().default('America/Sao_Paulo'),
  
  // Cliente
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(nameRegex, 'Nome contém caracteres inválidos')
    .transform(str => str.trim()),
  
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .max(255)
    .toLowerCase()
    .transform(str => str.trim()),
  
  phone: z
    .string({ required_error: 'Telefone é obrigatório' })
    .regex(phoneRegex, 'Telefone inválido')
    .max(20),
  
  notes: z
    .string()
    .max(500, 'Observações muito longas (máximo 500 caracteres)')
    .optional()
    .transform(str => str ? sanitizeHtml(str) : undefined),
  
  // Corretor
  realtorId: z.string().max(50).optional(),
  realtorName: z.string().max(100).optional(),
  realtorPhone: z.string().max(20).optional(),
  realtorEmail: z.string().email().max(255).optional(),
  
  // Tracking
  utms: z.record(z.string().max(200)).optional(),
  referralUrl: z.string().url().max(500).optional().or(z.literal('')),
  userAgent: z.string().max(500).optional(),
  
  // Consentimento (obrigatório)
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consentimento é obrigatório' }),
  }),
  
  // Honeypot
  website: z.string().max(0).optional(),
  
  // Turnstile
  turnstileToken: z.string().optional(),
}).strict()
  .refine(
    data => {
      // Valida que a data não é no passado
      const visitDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return visitDate >= today;
    },
    { 
      message: 'Data da visita deve ser hoje ou no futuro', 
      path: ['date'] 
    }
  )
  .refine(
    data => {
      // Se é vídeo, deve ter provider
      if (data.type === 'video' && !data.videoProvider) {
        return false;
      }
      return true;
    },
    {
      message: 'Plataforma de vídeo é obrigatória para visitas virtuais',
      path: ['videoProvider']
    }
  );

// ========================================
// CONTACT FORM SCHEMA
// ========================================

export const contactFormSchema = z.object({
  intent: z.enum(['comprar', 'alugar', 'vender', 'duvida', 'parcerias'], {
    errorMap: () => ({ message: 'Selecione uma intenção' }),
  }),
  
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(nameRegex, 'Nome contém caracteres inválidos')
    .transform(str => str.trim()),
  
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email('E-mail inválido')
    .max(255)
    .toLowerCase()
    .transform(str => str.trim()),
  
  whatsapp: z
    .string({ required_error: 'WhatsApp é obrigatório' })
    .min(10, 'WhatsApp inválido')
    .max(20),
  
  preferenciaContato: z.string().max(50),
  
  melhorHorario: z.string().max(50),
  
  aceitoContato: z.boolean().refine((val) => val === true, {
    message: 'Você precisa autorizar o contato',
  }),
  
  aceitoOportunidades: z.boolean().optional(),
  
  // Campos dinâmicos (opcionais)
  cidades: z.string().max(200).optional(),
  suites: z.string().max(10).optional(),
  vagas: z.string().max(10).optional(),
  areaMin: z.string().max(20).optional(),
  areaMax: z.string().max(20).optional(),
  orcamento: z.string().max(50).optional(),
  prazoMudanca: z.string().max(50).optional(),
  frenteMar: z.boolean().optional(),
  
  endereco: z.string().max(300).optional(),
  tipoImovel: z.string().max(100).optional(),
  area: z.string().max(20).optional(),
  ano: z.string().max(10).optional(),
  vagasVenda: z.string().max(10).optional(),
  linkAnuncio: z.string().url().max(500).optional().or(z.literal('')),
  
  ticketAlvo: z.string().max(50).optional(),
  teseInvestimento: z.array(z.string().max(100)).optional(),
  
  assunto: z.string().max(200).optional(),
  mensagem: z
    .string()
    .max(2000)
    .optional()
    .transform(str => str ? sanitizeHtml(str) : undefined),
  
  // Honeypot
  website: z.string().max(0).optional(),
  
  // Turnstile
  turnstileToken: z.string().optional(),
}).strict();

// ========================================
// TYPES (exportados para uso em TypeScript)
// ========================================

export type LeadInput = z.infer<typeof leadSchema>;
export type ScheduleVisitInput = z.infer<typeof scheduleVisitSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ========================================
// HELPER: Formata erros do Zod
// ========================================

export function formatZodErrors(error: z.ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

