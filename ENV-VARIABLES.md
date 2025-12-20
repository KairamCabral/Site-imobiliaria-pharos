# 🔧 Variáveis de Ambiente

## Configuração Obrigatória

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Vista CRM API Configuration
VISTA_BASE_URL=https://gabarito-rest.vistahost.com.br
VISTA_API_KEY=your_api_key_here

# DWV API Configuration (PRODUÇÃO - Clube Premium → Integração DWV)
DWV_BASE_URL=https://agencies.dwvapp.com.br
# Token válido para produção (não sandbox)
DWV_API_TOKEN=4b3e322a7773c8b3498606ed5d086a613171c65d542acbacd41b41af51d1d59a
DWV_TIMEOUT_MS=15000

# Feature Flags
# ⚠️ Quando o Vista habilitar o endpoint /imoveis/fotos, mude para true
FOTOS_ENDPOINT_ENABLED=false
# Define qual provider alimenta a listagem (vista | dwv | dual | mock)
NEXT_PUBLIC_LISTING_PROVIDER=dual

# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3600

# Google Tag Manager & Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Server-Side Tag Manager (SSGTM)
SSGTM_ENDPOINT_URL=https://ssgtm.pharos.imob.br
SSGTM_CONTAINER_CONFIG=

# Meta Ads (Facebook Pixel & Conversion API)
META_PIXEL_ID=
META_CONVERSION_API_TOKEN=

# Google Analytics 4 - Measurement Protocol
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_ANALYTICS_API_SECRET=

# Google Ads
GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXXX
GOOGLE_ADS_CONVERSION_LABEL=

# WhatsApp para CTA "Solicitar mais fotos"
NEXT_PUBLIC_WHATSAPP_NUMBER=5548999999999
NEXT_PUBLIC_WHATSAPP_MESSAGE=Olá! Gostaria de ver mais fotos do imóvel {CODIGO}.

# Mautic Marketing Automation Configuration
MAUTIC_BASE_URL=https://mautic.seudominio.com.br
MAUTIC_AUTH_TYPE=basic  # basic | oauth2
MAUTIC_API_USERNAME=admin
MAUTIC_API_PASSWORD=sua_senha_segura
# Ou OAuth2 (opcional):
MAUTIC_CLIENT_ID=
MAUTIC_CLIENT_SECRET=
MAUTIC_TIMEOUT_MS=30000

# Contact2Sale (C2S) API Configuration
C2S_API_URL=https://api.contact2sale.com/integration
C2S_API_TOKEN=dc3e9b0ce9ba484da1e1e5e3d884f2778bd71dc5e8c7afe50f
C2S_COMPANY_ID=sua_company_id_aqui
C2S_WEBHOOK_SECRET=gerar_secret_seguro_aqui_min_32_chars
C2S_TIMEOUT_MS=15000
C2S_RETRY_ATTEMPTS=3
C2S_RETRY_DELAY_MS=1000

# C2S Feature Flags
C2S_ENABLED=true
C2S_SYNC_SELLERS=true
C2S_AUTO_TAGS=true
C2S_WEBHOOKS_ENABLED=true
C2S_DISTRIBUTION_ENABLED=false
C2S_VISIT_INTEGRATION=true
```

---

## Feature Flag: `FOTOS_ENDPOINT_ENABLED`

### Estado Atual: `false`

**Motivo:** O endpoint `/imoveis/fotos` do Vista CRM retorna `404` para nosso tenant.

**O que acontece quando `false`:**
- Sistema usa apenas `FotoDestaque` da listagem (1 foto)
- Galeria exibe skeletons com CTA "Solicitar mais fotos via WhatsApp"
- Telemetria registra evento `photo_gallery_missing`

**Quando mudar para `true`:**
- Após o suporte do Vista habilitar o endpoint
- Validar primeiro com: `curl https://gabarito-rest.vistahost.com.br/imoveis/fotos?key=...&imovel=742`
- Se retornar `200 OK` com `total > 1`, pode ativar o flag

**Como ativar:**
1. Edite `.env.local`
2. Mude `FOTOS_ENDPOINT_ENABLED=false` para `FOTOS_ENDPOINT_ENABLED=true`
3. Reinicie o servidor de desenvolvimento: `npm run dev`
4. Teste a galeria: `http://localhost:3600/imoveis/PH742`

---

## Variáveis Públicas (Frontend)

Variáveis com prefixo `NEXT_PUBLIC_` são expostas no bundle do cliente.

### `NEXT_PUBLIC_WHATSAPP_NUMBER`

Número de WhatsApp (com DDI + DDD) para o CTA "Solicitar mais fotos".

**Formato:** `55` (Brasil) + `48` (DDD) + `999999999`

**Exemplo:** `5548991234567`

### `NEXT_PUBLIC_WHATSAPP_MESSAGE`

Mensagem pré-pronta que aparece no WhatsApp quando o usuário clica no CTA.

**Placeholder:** `{CODIGO}` será substituído pelo código do imóvel (ex: PH742)

**Exemplo:**
```
Olá! Gostaria de ver mais fotos do imóvel {CODIGO}.
```

**Resultado no WhatsApp:**
```
Olá! Gostaria de ver mais fotos do imóvel PH742.
```

---

## Validação

Após configurar, valide com:

```bash
# No terminal, dentro de imobiliaria-pharos:
node -e "console.log(process.env.VISTA_BASE_URL)"
```

Se retornar `undefined`, o `.env.local` não está sendo carregado.

**Solução:** Reinicie o servidor Next.js (`Ctrl+C` e `npm run dev` novamente).

---

## Segurança

- ⚠️ **Nunca commite `.env.local`** no Git
- ✅ O arquivo já está no `.gitignore`
- ✅ Use `.env.example` ou este documento como referência para novos desenvolvedores
- 🔐 Proteja a `VISTA_API_KEY` — não compartilhe publicamente

---

## Mautic Marketing Automation Integration

### `MAUTIC_BASE_URL`

URL base da sua instância Mautic (auto-hospedada ou cloud).

**Exemplos:**
- Auto-hospedado: `https://mautic.seudominio.com.br`
- Mautic Cloud: `https://sua-empresa.mautic.net`

⚠️ **Importante:** Não inclua `/api` no final da URL. O sistema adiciona automaticamente.

### `MAUTIC_AUTH_TYPE`

Tipo de autenticação a ser usado.

**Opções:**
- `basic` - Autenticação Basic Auth (recomendado para auto-hospedado)
- `oauth2` - Autenticação OAuth2 (futuro suporte)

**Padrão:** `basic`

### `MAUTIC_API_USERNAME` e `MAUTIC_API_PASSWORD`

Credenciais de acesso à API do Mautic (necessário quando `MAUTIC_AUTH_TYPE=basic`).

**Como criar:**
1. Acesse o Mautic: Configurações → API Settings
2. Ative "API enabled"
3. Use suas credenciais de administrador ou crie usuário específico para API
4. Recomendado: Criar usuário dedicado com permissões de API apenas

🔐 **Segurança:** Use senha forte e exclusiva para API. Nunca compartilhe estas credenciais.

### `MAUTIC_CLIENT_ID` e `MAUTIC_CLIENT_SECRET`

Credenciais OAuth2 (opcional, para autenticação OAuth2).

**Status:** Não implementado ainda. Use `basic` por enquanto.

### `MAUTIC_TIMEOUT_MS`

Timeout para requisições à API do Mautic em milissegundos.

**Padrão:** `30000` (30 segundos)

### Comportamento da Integração

Quando configurado (`MAUTIC_BASE_URL` presente):
- ✅ Leads são enviados **simultaneamente** para Vista/DWV E Mautic
- ✅ **Enriquecimento automático** de dados (device, browser, localização)
- ✅ **Detalhes do imóvel** incluídos quando aplicável
- ✅ **Tags inteligentes** aplicadas automaticamente
- ✅ **Tolerante a falhas**: Se Mautic falhar, Vista/DWV continua funcionando
- ✅ Deduplica contatos automaticamente por email

### Tags Automáticas Aplicadas

O sistema aplica tags automaticamente baseado em:

**Intenção do lead:**
- `intent:comprar`
- `intent:alugar`
- `intent:vender`
- `intent:parcerias`

**Origem:**
- `source:site`
- `source:whatsapp`
- `source:landing_page`

**Corretor:**
- `corretor:Nome_Do_Corretor` (quando disponível)

**Imóvel:**
- `imovel:PH1234` (código do imóvel de interesse)

**Device:**
- `device:mobile`
- `device:desktop`
- `device:tablet`

**Tipo de formulário:**
- `form:contato`
- `form:agendamento`
- `form:lead_wizard`

### Campos Personalizados Enviados

O sistema envia os seguintes campos personalizados para o Mautic (quando disponíveis):

**Dados do lead:**
- `lead_intent` - Intenção (comprar/alugar/vender)
- `lead_source` - Origem do lead
- `device_type` - Tipo de device
- `browser` - Navegador utilizado
- `os` - Sistema operacional

**Dados do imóvel:**
- `imovel_codigo` - Código do imóvel (ex: PH1234)
- `imovel_titulo` - Título do imóvel
- `imovel_preco` - Preço do imóvel
- `imovel_quartos` - Quantidade de quartos
- `imovel_area` - Área total em m²
- `imovel_tipo` - Tipo (apartamento/casa/terreno)
- `imovel_url` - Link do imóvel no site

**Tracking:**
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `referrer_url` - URL de origem do lead
- `cidade`, `estado` - Localização (quando detectável)

⚠️ **Importante:** Você precisa criar estes campos personalizados no Mautic primeiro. Veja o guia completo em [`docs/MAUTIC-SETUP.md`](docs/MAUTIC-SETUP.md).

### Validação da Integração

Após configurar, teste a integração:

```bash
curl http://localhost:3600/api/debug/mautic
```

**Resposta esperada:**
```json
{
  "success": true,
  "mautic": {
    "configured": true,
    "healthy": true,
    "baseUrl": "https://mautic.seudominio.com.br"
  },
  "test": {
    "contactCreated": true,
    "contactId": 123
  }
}
```

---

## Contact2Sale (C2S) Integration

### `C2S_API_URL`

URL base da API do Contact2Sale.

**Padrão:** `https://api.contact2sale.com/integration`

### `C2S_API_TOKEN`

Token de autenticação Bearer para a API do C2S.

**Onde encontrar:** Painel administrativo do C2S → Configurações → API → Token de Integração

⚠️ **Importante:** Mantenha este token em segredo. Não compartilhe publicamente.

### `C2S_COMPANY_ID`

⚠️ **OBRIGATÓRIO (ou pode ser)**: ID da sua empresa no sistema C2S.

**Como obter:**
1. Acesse: https://app.contact2sale.com
2. Vá em: `Configurações → API/Integrações` ou `Configurações → Empresa`
3. Copie o Company ID

**Exemplo:** `59d517f81c0bb20004fd95f3`

**Por quê é importante:** Segundo a IA do C2S, este campo pode ser obrigatório na sua conta.

### `C2S_DEFAULT_SELLER_ID`

⚠️ **IMPORTANTE**: ID do vendedor padrão para leads que não têm vendedor específico.

**Como obter:**
1. Acesse: https://app.contact2sale.com
2. Vá em: `Configurações → Vendedores`
3. Escolha um vendedor para ser o padrão dos leads do site
4. Copie o ID dele

**Exemplo:** `59d517f81c0bb20004fd95f3`

**Por quê é importante:** A IA do C2S confirmou que `seller_id` pode ser obrigatório na sua conta. Se não houver um corretor específico atribuído ao lead, este será usado como fallback.

### `C2S_WEBHOOK_SECRET`

Secret usado para validar assinaturas HMAC dos webhooks recebidos do C2S.

**Como gerar:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Feature Flags do C2S

- `C2S_ENABLED`: Habilita/desabilita toda a integração
- `C2S_SYNC_SELLERS`: Sincroniza corretores do C2S
- `C2S_AUTO_TAGS`: Aplica tags automáticas aos leads
- `C2S_WEBHOOKS_ENABLED`: Habilita recebimento de webhooks
- `C2S_DISTRIBUTION_ENABLED`: Usa distribuição automática de leads
- `C2S_VISIT_INTEGRATION`: Integra agendamento de visitas

### Configurações de Performance

- `C2S_TIMEOUT_MS`: Timeout para requisições HTTP (padrão: 15000ms)
- `C2S_RETRY_ATTEMPTS`: Tentativas de retry em caso de falha (padrão: 3)
- `C2S_RETRY_DELAY_MS`: Delay base para retry com exponential backoff (padrão: 1000ms)

---

---

## Ordem de Prioridade dos Providers

O sistema usa a seguinte ordem de prioridade para operações:

### Listagem de Imóveis
1. **Vista CRM** (prioritário)
2. **DWV API** (complementar)
3. Combinação de ambos (sem duplicatas)

### Criação de Leads
1. **Vista CRM** (obrigatório - resultado principal)
2. **Mautic** (paralelo - marketing automation)

Ambos são executados simultaneamente usando `Promise.allSettled`. Se Mautic falhar, o lead ainda é criado no Vista.

### Detalhes de Imóveis
1. **DWV API** (prioritário)
2. **Vista CRM** (fallback)

---

**Última atualização:** 10/12/2025

