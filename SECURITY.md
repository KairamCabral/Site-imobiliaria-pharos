# 🔒 GUIA DE SEGURANÇA - IMOBILIÁRIA PHAROS

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Segurança Implementada](#segurança-implementada)
4. [Checklist de Produção](#checklist-de-produção)
5. [Incidentes e Resposta](#incidentes-e-resposta)
6. [Manutenção](#manutenção)

---

## VISÃO GERAL

Este sistema implementa **segurança em múltiplas camadas** seguindo as melhores práticas da indústria (OWASP Top 10, LGPD, ISO 27001).

### ✅ Proteções Implementadas

- ✅ **Security Headers** (CSP, HSTS, X-Frame-Options, etc)
- ✅ **Rate Limiting** (LRU Cache)
- ✅ **Input Validation** (Zod schemas)
- ✅ **XSS Protection** (sanitização HTML)
- ✅ **CSRF Protection** (via headers e tokens)
- ✅ **Bot Protection** (Cloudflare Turnstile)
- ✅ **Honeypot Fields** (anti-spam)
- ✅ **Secure Logging** (sanitização de dados sensíveis)
- ✅ **Environment Validation** (Zod)

---

## CONFIGURAÇÃO INICIAL

### 1. Instalar Dependências

```bash
npm install lru-cache zod
```

### 2. Configurar Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```bash
# Obrigatório
VISTA_BASE_URL=https://gabarito-rest.vistahost.com.br
VISTA_API_KEY=sua_chave_aqui

# Cloudflare Turnstile (RECOMENDADO)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAAxxxxxxxxx
TURNSTILE_SECRET_KEY=0x4AAAAAAAAyyyyyyyyyyy
```

**Obter chaves Turnstile:**
1. Acesse: https://dash.cloudflare.com/turnstile
2. Crie um novo site
3. Copie Site Key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. Copie Secret Key → `TURNSTILE_SECRET_KEY`

### 3. Gerar Secrets Seguros

Para `C2S_WEBHOOK_SECRET` e outros:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## SEGURANÇA IMPLEMENTADA

### 🛡️ 1. Security Headers (middleware.ts)

**Arquivo:** `middleware.ts` (raiz do projeto)

**Headers configurados:**

| Header | Valor | Proteção |
|--------|-------|----------|
| Content-Security-Policy | Ver arquivo | XSS, Injection |
| X-Frame-Options | DENY | Clickjacking |
| X-Content-Type-Options | nosniff | MIME Sniffing |
| X-XSS-Protection | 1; mode=block | XSS (legacy) |
| Referrer-Policy | strict-origin-when-cross-origin | Data Leakage |
| Permissions-Policy | camera=(), microphone=(), etc | Privacy |
| Strict-Transport-Security | max-age=31536000 (prod) | MITM |

**Validação:**

```bash
# Testar headers
curl -I https://pharos.imob.br | grep -i "x-frame-options\|content-security"
```

### 🚦 2. Rate Limiting

**Arquivo:** `src/lib/ratelimit.ts`

**Limiters disponíveis:**

```typescript
// Endpoints sensíveis (leads, agendamentos)
strictLimiter // 5 req/15min por IP

// Listagens e buscas
queryLimiter // 30 req/min por IP

// Geral
limiter // 10 req/min por IP
```

**Customizar:**

```typescript
const customLimiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

await customLimiter.check(10, ip); // 10 por minuto
```

**Resposta de rate limit:**

```json
{
  "success": false,
  "error": "Muitas requisições. Aguarde alguns minutos...",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

Headers: `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### ✅ 3. Validação de Inputs (Zod)

**Arquivo:** `src/lib/validators.ts`

**Schemas disponíveis:**

- `leadSchema` - Criação de leads
- `scheduleVisitSchema` - Agendamento de visitas
- `contactFormSchema` - Formulário de contato

**Exemplo de uso:**

```typescript
import { leadSchema, formatZodErrors } from '@/lib/validators';

try {
  const validatedData = leadSchema.parse(body);
  // ... usar validatedData
} catch (error) {
  if (error instanceof ZodError) {
    return NextResponse.json({
      success: false,
      error: 'Dados inválidos',
      details: formatZodErrors(error),
    }, { status: 400 });
  }
}
```

**Sanitização automática:**

- Remove tags HTML perigosas (`<script>`, `<iframe>`, `<object>`)
- Remove event handlers (`onclick`, `onerror`, etc)
- Remove `javascript:` protocol
- Limita comprimento de strings

### 🤖 4. Cloudflare Turnstile (Anti-Bot)

**Componente Client:** `src/components/TurnstileWidget.tsx`

**Uso no formulário:**

```tsx
import TurnstileWidget from '@/components/TurnstileWidget';

function MyForm() {
  const [turnstileToken, setTurnstileToken] = useState('');
  
  return (
    <form>
      {/* ... campos do form ... */}
      
      <TurnstileWidget 
        onVerify={(token) => setTurnstileToken(token)}
        theme="light"
        size="normal"
      />
      
      <button type="submit" disabled={!turnstileToken}>
        Enviar
      </button>
    </form>
  );
}
```

**Validação Server-Side:**

```typescript
import { requireTurnstile } from '@/lib/turnstile';

const turnstileResult = await requireTurnstile(body.turnstileToken, ip);
if (!turnstileResult.valid) {
  return turnstileResult.response!;
}
```

**Bypass em desenvolvimento:**

```typescript
// Em turnstile.ts
if (process.env.NODE_ENV === 'development') {
  console.warn('[Turnstile] Bypass ativado');
  return { success: true };
}
```

⚠️ **REMOVER BYPASS EM PRODUÇÃO!**

### 🍯 5. Honeypot Fields

**Adicionar aos formulários:**

```tsx
{/* Campo honeypot (invisível para humanos) */}
<input
  type="text"
  name="website"
  autoComplete="off"
  tabIndex={-1}
  style={{ position: 'absolute', left: '-5000px' }}
/>
```

**Validação no servidor:**

```typescript
// Se honeypot preenchido = bot
if (body.website || body.company) {
  logger.security('Honeypot triggered', { ip });
  // Finge sucesso para não alertar bot
  return NextResponse.json({ success: true }, { status: 200 });
}
```

**Campos honeypot disponíveis:**
- `website`
- `company`

### 📝 6. Logging Seguro

**Arquivo:** `src/lib/logger.ts`

**Uso:**

```typescript
import { logger } from '@/lib/logger';

// Log simples
logger.info('Lead criado', { leadId: '123' });

// Log de erro
logger.error('Falha na API', error, { context: 'adicional' });

// Log de segurança
logger.security('Tentativa suspeita', { ip, userAgent });

// Performance
import { createTimer } from '@/lib/logger';
const timer = createTimer();
// ... operação ...
timer.stop('operacao_nome');
```

**Sanitização automática:**

O logger remove/mascara automaticamente:
- Passwords, tokens, API keys
- Emails (parcialmente: `t***e@domain.com`)
- Telefones (parcialmente: `+5547****4567`)
- Stack traces (em produção)

### 🔐 7. Variáveis de Ambiente Seguras

**Arquivo:** `src/lib/env.ts`

**Validação automática:**

```typescript
import { env, getServerEnv } from '@/lib/env';

// ✅ Seguro no servidor
const apiKey = getServerEnv('VISTA_API_KEY');

// ❌ Erro se tentar no cliente
// Error: Tentativa de acessar variável privada no cliente
```

**Validação na inicialização:**

```bash
# Se variáveis inválidas:
❌ Erro na validação de variáveis de ambiente:
  - VISTA_API_KEY: Required
  - TURNSTILE_SECRET_KEY: Required
```

---

## CHECKLIST DE PRODUÇÃO

### 🚀 Antes do Deploy

- [ ] **Remover bypass de Turnstile** em `src/lib/turnstile.ts`
- [ ] **Validar .env.local** não está commitado
- [ ] **Testar rate limiting** com ferramentas (Postman, curl)
- [ ] **Validar CSP** com https://csp-evaluator.withgoogle.com/
- [ ] **Scan de vulnerabilidades**: `npm audit`
- [ ] **Testar formulários** com payloads XSS
- [ ] **Verificar HTTPS** está forçado (HSTS)
- [ ] **Backup de .env.local** criptografado em local seguro

### 🔒 Headers HTTP (Validar no deploy)

```bash
curl -I https://pharos.imob.br
```

Deve retornar:
- ✅ `Content-Security-Policy`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Strict-Transport-Security`
- ❌ Sem `X-Powered-By` ou `Server`

### 🧪 Testes de Segurança

**1. Rate Limiting:**

```bash
# Testar rate limit (deve bloquear após 5 requisições)
for i in {1..10}; do
  curl -X POST https://pharos.imob.br/api/leads \
    -H "Content-Type: application/json" \
    -d '{"name":"Test"}'
  sleep 1
done
```

**2. XSS:**

Tentar enviar:
```json
{
  "name": "<script>alert('XSS')</script>",
  "message": "<img src=x onerror=alert('XSS')>"
}
```

Deve: sanitizar ou rejeitar

**3. SQL Injection (se aplicável):**

```json
{
  "email": "' OR '1'='1"
}
```

Deve: validar formato de email

**4. CSRF:**

Requisição sem origin correto deve ser bloqueada.

---

## INCIDENTES E RESPOSTA

### 🚨 Tipos de Incidentes

1. **Rate Limit Excedido** → Normal, monitorar padrões
2. **Honeypot Triggered** → Bot detectado, IP em watchlist
3. **Turnstile Failed** → Bot ou problema no Cloudflare
4. **Validação Failed** → Possível ataque ou erro de integração
5. **Erro 500** → Bug ou ataque complexo

### 📊 Monitoramento

**Logs de segurança:**

```bash
# Buscar eventos suspeitos
grep "SECURITY" logs/*.log

# Contar rate limits por IP
grep "Rate limit exceeded" logs/*.log | cut -d' ' -f5 | sort | uniq -c | sort -rn
```

**Integração com Sentry (recomendado):**

Ver: `src/lib/logger.ts` → `sendToExternalService()`

### 🛠️ Resposta a Incidentes

**1. Bot Attack Detectado:**

```typescript
// Adicionar IP à blocklist temporária
// Em middleware.ts ou ratelimit.ts
const blockedIps = new Set(['123.456.789.0']);

if (blockedIps.has(ip)) {
  return new NextResponse('Forbidden', { status: 403 });
}
```

**2. Vazamento de Token:**

1. **Rotacionar imediatamente** tokens em:
   - Vista CRM
   - DWV API
   - C2S
   - Turnstile
2. **Atualizar .env.local**
3. **Redeploy** aplicação
4. **Monitorar** logs por 48h

**3. Vulnerabilidade Descoberta:**

1. **Avaliar severidade** (baixa/média/alta/crítica)
2. **Patch imediato** se crítica
3. **Notificar equipe** e stakeholders
4. **Documentar** em changelog
5. **Revisar** código relacionado

---

## MANUTENÇÃO

### 🔄 Tarefas Mensais

- [ ] Revisar logs de segurança
- [ ] Atualizar dependências: `npm update`
- [ ] Scan de vulnerabilidades: `npm audit fix`
- [ ] Revisar rate limit thresholds
- [ ] Backup de configurações

### 📅 Tarefas Trimestrais

- [ ] Rotacionar secrets (tokens, senhas)
- [ ] Audit de permissões de APIs
- [ ] Revisar CSP (adicionar/remover domínios)
- [ ] Teste de penetração (interno ou externo)
- [ ] Revisar política de privacidade (LGPD)

### 🆙 Atualizações de Dependências

```bash
# Checar vulnerabilidades
npm audit

# Atualizar com segurança
npm audit fix

# Atualizar Next.js (testar em staging primeiro)
npm install next@latest react@latest react-dom@latest
```

### 🔍 Ferramentas Recomendadas

- **OWASP ZAP** - Scan de vulnerabilidades
- **Burp Suite** - Teste de penetração
- **npm audit** - Vulnerabilidades em deps
- **Snyk** - Monitoramento contínuo
- **Sentry** - Monitoramento de erros
- **Cloudflare Analytics** - Traffic patterns

---

## 📞 CONTATO

**Segurança de TI:**
- Email: seguranca@pharos.imob.br (criar)
- Telefone: +55 48 9999-9999

**Reportar Vulnerabilidade:**
- Email: security@pharos.imob.br (criar)
- PGP Key: [adicionar se necessário]

**Tempo de Resposta:**
- Crítica: < 4 horas
- Alta: < 24 horas
- Média: < 72 horas
- Baixa: < 7 dias

---

## 📚 REFERÊNCIAS

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [LGPD](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Zod Documentation](https://zod.dev/)

---

**Última atualização:** 11 de Dezembro de 2025  
**Versão:** 1.0.0  
**Responsável:** Equipe de Desenvolvimento Pharos

