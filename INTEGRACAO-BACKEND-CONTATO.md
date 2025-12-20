# Integração Backend — Página CONTATO

Guia prático para conectar o formulário de contato com backend, CRM e notificações.

---

## 📋 Índice

1. [API Route Next.js](#1-api-route-nextjs)
2. [Validação Server-Side](#2-validação-server-side)
3. [Integração CRM (HubSpot)](#3-integração-crm-hubspot)
4. [Notificações Slack](#4-notificações-slack)
5. [E-mail Automático](#5-e-mail-automático)
6. [WhatsApp Cloud API](#6-whatsapp-cloud-api)
7. [Anti-Spam (reCAPTCHA)](#7-anti-spam-recaptcha)
8. [Rate Limiting](#8-rate-limiting)
9. [Variáveis de Ambiente](#9-variáveis-de-ambiente)

---

## 1. API Route Next.js

### Criar arquivo: `src/app/api/contact/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { createLead } from '@/lib/crm';
import { sendSlackNotification } from '@/lib/slack';
import { sendEmailConfirmation } from '@/lib/email';

// Schema de validação com Zod
const contactSchema = z.object({
  intent: z.enum(['comprar', 'alugar', 'vender', 'duvida', 'parcerias']),
  nome: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  preferenciaContato: z.string(),
  melhorHorario: z.string(),
  aceitoContato: z.boolean().refine((val) => val === true, {
    message: 'Você precisa autorizar o contato',
  }),
  aceitoOportunidades: z.boolean().optional(),
  
  // Campos opcionais (dinâmicos)
  cidades: z.string().optional(),
  suites: z.string().optional(),
  vagas: z.string().optional(),
  areaMin: z.string().optional(),
  areaMax: z.string().optional(),
  orcamento: z.string().optional(),
  prazoMudanca: z.string().optional(),
  frenteMar: z.boolean().optional(),
  
  endereco: z.string().optional(),
  tipoImovel: z.string().optional(),
  area: z.string().optional(),
  ano: z.string().optional(),
  vagasVenda: z.string().optional(),
  linkAnuncio: z.string().optional(),
  
  ticketAlvo: z.string().optional(),
  teseInvestimento: z.array(z.string()).optional(),
  
  assunto: z.string().optional(),
  mensagem: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
    }

    // 2. Parse e validação
    const body = await request.json();
    const data = contactSchema.parse(body);

    // 3. Sanitização (DOMPurify server-side)
    const sanitizedData = {
      ...data,
      nome: sanitize(data.nome),
      mensagem: data.mensagem ? sanitize(data.mensagem) : undefined,
    };

    // 4. Gerar Lead ID
    const leadId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 5. Criar lead no CRM
    await createLead({
      id: leadId,
      ...sanitizedData,
      source: 'website_contact',
      createdAt: new Date().toISOString(),
    });

    // 6. Notificar Slack
    await sendSlackNotification({
      leadId,
      intent: data.intent,
      nome: data.nome,
      email: data.email,
      whatsapp: data.whatsapp,
      preferenciaContato: data.preferenciaContato,
    });

    // 7. Enviar e-mail de confirmação
    if (data.aceitoOportunidades) {
      await sendEmailConfirmation({
        to: data.email,
        nome: data.nome,
        leadId,
      });
    }

    // 8. Retornar sucesso
    return NextResponse.json({
      success: true,
      leadId,
      message: 'Mensagem enviada com sucesso! Retornaremos em breve.',
    });

  } catch (error) {
    console.error('Erro ao processar contato:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar sua solicitação. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Sanitização básica
function sanitize(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
```

---

## 2. Validação Server-Side

### Instalar dependências:
```bash
npm install zod dompurify
npm install @types/dompurify --save-dev
```

### Criar: `src/lib/validation.ts`

```typescript
import { z } from 'zod';

export const phoneRegex = /^(\+55)?(\d{2})?\d{8,9}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateContact = (data: any) => {
  const schema = z.object({
    nome: z.string().min(3).max(100),
    email: z.string().regex(emailRegex),
    whatsapp: z.string().regex(phoneRegex),
    // ... outros campos
  });

  return schema.safeParse(data);
};
```

---

## 3. Integração CRM (HubSpot)

### Criar: `src/lib/crm.ts`

```typescript
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  intent: string;
  [key: string]: any;
}

export async function createLead(lead: Lead) {
  try {
    const response = await fetch(HUBSPOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          email: lead.email,
          firstname: lead.nome.split(' ')[0],
          lastname: lead.nome.split(' ').slice(1).join(' '),
          phone: lead.whatsapp,
          lead_source: 'website_contact',
          lead_intent: lead.intent,
          // Campos customizados
          contact_preference: lead.preferenciaContato,
          best_time: lead.melhorHorario,
          budget: lead.orcamento,
          message: lead.mensagem,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar lead no HubSpot');
    }

    const data = await response.json();
    console.log('Lead criado no HubSpot:', data.id);
    
    return data;
  } catch (error) {
    console.error('Erro CRM:', error);
    throw error;
  }
}
```

### Alternativa: Pipedrive

```typescript
const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN;
const PIPEDRIVE_API_URL = 'https://api.pipedrive.com/v1';

export async function createLeadPipedrive(lead: Lead) {
  // 1. Criar pessoa
  const personResponse = await fetch(`${PIPEDRIVE_API_URL}/persons?api_token=${PIPEDRIVE_API_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: lead.nome,
      email: [{ value: lead.email, primary: true }],
      phone: [{ value: lead.whatsapp, primary: true }],
    }),
  });

  const person = await personResponse.json();

  // 2. Criar deal
  const dealResponse = await fetch(`${PIPEDRIVE_API_URL}/deals?api_token=${PIPEDRIVE_API_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Lead: ${lead.nome} - ${lead.intent}`,
      person_id: person.data.id,
      value: lead.orcamento ? parseFloat(lead.orcamento.replace(/\D/g, '')) : 0,
      currency: 'BRL',
    }),
  });

  return dealResponse.json();
}
```

---

## 4. Notificações Slack

### Criar: `src/lib/slack.ts`

```typescript
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface SlackNotification {
  leadId: string;
  intent: string;
  nome: string;
  email: string;
  whatsapp: string;
  preferenciaContato: string;
}

export async function sendSlackNotification(data: SlackNotification) {
  const emoji = {
    comprar: '🏠',
    alugar: '🔑',
    vender: '💰',
    duvida: '💬',
    parcerias: '🤝',
  }[data.intent] || '📩';

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} Novo Lead: ${data.intent.toUpperCase()}`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Nome:*\n${data.nome}` },
          { type: 'mrkdwn', text: `*Lead ID:*\n${data.leadId}` },
          { type: 'mrkdwn', text: `*E-mail:*\n${data.email}` },
          { type: 'mrkdwn', text: `*WhatsApp:*\n${data.whatsapp}` },
          { type: 'mrkdwn', text: `*Preferência:*\n${data.preferenciaContato}` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Abrir no CRM' },
            url: `https://app.hubspot.com/contacts/.../${data.leadId}`,
            style: 'primary',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'WhatsApp' },
            url: `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar notificação Slack');
    }

    console.log('Notificação Slack enviada com sucesso');
  } catch (error) {
    console.error('Erro Slack:', error);
  }
}
```

**Configurar Webhook:**
1. Acesse: https://api.slack.com/apps
2. Create New App → "From scratch"
3. Incoming Webhooks → Activate
4. Add New Webhook to Workspace
5. Selecione canal #leads
6. Copie a URL do webhook

---

## 5. E-mail Automático

### Criar: `src/lib/email.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailData {
  to: string;
  nome: string;
  leadId: string;
}

export async function sendEmailConfirmation(data: EmailData) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Inter, sans-serif; color: #2C3444; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { background: linear-gradient(135deg, #054ADA 0%, #192233 60%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #ADB4C0; }
        .footer { text-align: center; color: #585E6B; font-size: 14px; margin-top: 20px; }
        .button { display: inline-block; background: #054ADA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recebemos sua mensagem!</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${data.nome}</strong>!</p>
          
          <p>Obrigado por entrar em contato com a Pharos Negócios Imobiliários.</p>
          
          <p>Sua solicitação foi registrada com sucesso e nosso time de especialistas retornará em breve através do seu canal de preferência.</p>
          
          <p><strong>Protocolo:</strong> ${data.leadId}</p>
          
          <p>Nosso horário de atendimento:</p>
          <ul>
            <li>Segunda a Sexta: 9h às 18h</li>
            <li>Sábado: 9h às 13h</li>
          </ul>
          
          <p>Se preferir, você pode falar diretamente conosco:</p>
          
          <a href="https://wa.me/5547999999999" class="button">Chamar no WhatsApp</a>
          
          <p style="margin-top: 30px; color: #585E6B; font-size: 14px;">
            Enquanto isso, conheça nossos <a href="https://pharos.imob.br/imoveis" style="color: #054ADA;">imóveis disponíveis</a>.
          </p>
        </div>
        <div class="footer">
          <p>Pharos Negócios Imobiliários<br/>
          Av. Atlântica, 5678 - Balneário Camboriú, SC<br/>
          (47) 3333-3333 | contato@pharos.imob.br</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"Pharos Negócios Imobiliários" <contato@pharos.imob.br>',
      to: data.to,
      subject: 'Recebemos sua mensagem - Pharos',
      html: htmlTemplate,
    });

    console.log('E-mail de confirmação enviado');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}
```

**Alternativa: SendGrid**

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmailSendGrid(data: EmailData) {
  await sgMail.send({
    to: data.to,
    from: 'contato@pharos.imob.br',
    subject: 'Recebemos sua mensagem - Pharos',
    html: htmlTemplate,
  });
}
```

---

## 6. WhatsApp Cloud API

### Criar: `src/lib/whatsapp.ts`

```typescript
const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsAppMessage(to: string, nome: string) {
  const message = {
    messaging_product: 'whatsapp',
    to: to.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: 'confirmacao_contato', // Template pré-aprovado
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: nome }],
        },
      ],
    },
  };

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao enviar WhatsApp');
    }

    console.log('Mensagem WhatsApp enviada');
  } catch (error) {
    console.error('Erro WhatsApp:', error);
  }
}
```

**Template de exemplo (criar no Meta Business):**
```
Olá {{1}}! 👋

Recebemos sua mensagem na Pharos e nosso time retornará em breve.

Protocolo: #{{2}}

Obrigado pelo contato!
```

---

## 7. Anti-Spam (reCAPTCHA)

### 1. Adicionar reCAPTCHA v3 no frontend

**Atualizar: `ContactForm.tsx`**

```typescript
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const { executeRecaptcha } = useGoogleReCaptcha();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!executeRecaptcha) {
    console.error('reCAPTCHA não carregado');
    return;
  }

  // Obter token
  const token = await executeRecaptcha('contact_form');

  // Enviar com o token
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, recaptchaToken: token }),
  });
  
  // ...
};
```

### 2. Validar no backend

**Atualizar: `src/app/api/contact/route.ts`**

```typescript
async function verifyRecaptcha(token: string): Promise<boolean> {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const data = await response.json();
  return data.success && data.score >= 0.5; // Ajustar threshold
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Verificar reCAPTCHA
  const isHuman = await verifyRecaptcha(body.recaptchaToken);
  if (!isHuman) {
    return NextResponse.json({ error: 'Verificação de segurança falhou' }, { status: 403 });
  }
  
  // ... resto do código
}
```

---

## 8. Rate Limiting

### Usar Upstash Redis

**Criar: `src/lib/rateLimit.ts`**

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Criar rate limiter: 5 requisições por hora por IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
});

export async function rateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset: new Date(reset),
  };
}
```

**Instalar:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

---

## 9. Variáveis de Ambiente

### Criar: `.env.local`

```bash
# API Keys
HUBSPOT_API_KEY=your_hubspot_api_key
PIPEDRIVE_API_TOKEN=your_pipedrive_token

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# E-mail (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@pharos.imob.br
SMTP_PASSWORD=your_app_password

# SendGrid (alternativa)
SENDGRID_API_KEY=SG.xxxxxxxxx

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=your_access_token

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
RECAPTCHA_SECRET_KEY=6LcxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxQ

# Base URL
NEXT_PUBLIC_BASE_URL=https://pharos.imob.br
```

---

## 🚀 Deploy Checklist

### Antes de ir para produção:

- [ ] Atualizar todos os dados de contato (telefone, e-mail, endereço)
- [ ] Criar conta HubSpot/Pipedrive e configurar API
- [ ] Configurar webhook Slack (canal #leads)
- [ ] Configurar SMTP ou SendGrid
- [ ] Registrar WhatsApp Business API (opcional)
- [ ] Adicionar reCAPTCHA v3 no Google Cloud
- [ ] Criar conta Upstash Redis para rate limiting
- [ ] Testar formulário em staging
- [ ] Verificar eventos de analytics no GA4
- [ ] Criar imagem OG (1200x630) para compartilhamento
- [ ] Atualizar fotos da equipe com reais

---

## 📚 Recursos Úteis

- **HubSpot API:** https://developers.hubspot.com/docs/api/overview
- **Pipedrive API:** https://developers.pipedrive.com/docs/api/v1
- **Slack Webhooks:** https://api.slack.com/messaging/webhooks
- **SendGrid Docs:** https://docs.sendgrid.com/
- **WhatsApp Cloud API:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **reCAPTCHA:** https://www.google.com/recaptcha/admin
- **Upstash:** https://upstash.com/

---

**Pronto para integração! 🚀**

