# 🚀 Integração Mautic - Início Rápido

## ✅ Status: Implementação Completa

A integração com Mautic Marketing Automation está **100% funcional e pronta para uso**.

---

## 📖 Documentação

### Guias Principais

1. **[docs/MAUTIC-SETUP.md](docs/MAUTIC-SETUP.md)**  
   📘 Guia completo passo a passo para instalar e configurar o Mautic

2. **[MAUTIC-INTEGRATION-SUMMARY.md](MAUTIC-INTEGRATION-SUMMARY.md)**  
   📊 Resumo técnico da implementação

3. **[MAUTIC-ENV-EXAMPLE.md](MAUTIC-ENV-EXAMPLE.md)**  
   🔧 Exemplos de configuração de variáveis de ambiente

4. **[ENV-VARIABLES.md](ENV-VARIABLES.md)**  
   📝 Documentação completa de todas as variáveis (seção Mautic adicionada)

---

## ⚡ Configuração Rápida

### 1. Adicionar Variáveis de Ambiente

Edite `.env.local` na raiz do projeto:

```bash
# Mautic Marketing Automation Configuration
MAUTIC_BASE_URL=https://mautic.seudominio.com.br
MAUTIC_AUTH_TYPE=basic
MAUTIC_API_USERNAME=admin
MAUTIC_API_PASSWORD=sua_senha_segura
MAUTIC_TIMEOUT_MS=30000
```

### 2. Reiniciar Servidor

```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 3. Testar Integração

```bash
curl http://localhost:3600/api/debug/mautic
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "✅ Integração Mautic funcionando perfeitamente!"
}
```

---

## 🎯 O Que Foi Implementado

### ✅ Funcionalidades

- **MauticProvider completo** - Cliente HTTP resiliente com retry
- **Enriquecimento automático** - Device, browser, localização
- **Detalhes do imóvel** - Código, preço, quartos, área, tipo, URL
- **Tags inteligentes** - Automáticas por intenção, corretor, imóvel
- **Integração com DualProvider** - Envia para Vista E Mautic
- **Tolerante a falhas** - Vista continua funcionando se Mautic falhar
- **Endpoint de debug** - `/api/debug/mautic` para testes

### 📁 Arquivos Criados (12 arquivos)

**Providers:**
- `src/providers/mautic/MauticProvider.ts`
- `src/providers/mautic/client.ts`
- `src/providers/mautic/types.ts`
- `src/providers/mautic/index.ts`

**Services:**
- `src/services/DataEnricher.ts`
- `src/services/MauticTagService.ts`

**Mappers:**
- `src/mappers/mautic/LeadMapper.ts`

**API:**
- `src/app/api/debug/mautic/route.ts`

**Documentação:**
- `docs/MAUTIC-SETUP.md`
- `MAUTIC-INTEGRATION-SUMMARY.md`
- `MAUTIC-ENV-EXAMPLE.md`
- Este arquivo

**Modificados:**
- `src/providers/dual/DualProvider.ts`
- `ENV-VARIABLES.md`

---

## 🔄 Fluxo de Dados

```
Usuário preenche formulário
    ↓
API /api/leads
    ↓
LeadService.createLead()
    ↓
DualProvider.createLead()
    ↓
    ├─→ DataEnricher (enriquece dados)
    │   ├─ Device type (mobile/desktop)
    │   ├─ Browser e OS
    │   └─ Detalhes do imóvel (se aplicável)
    ↓
    ├─→ VistaProvider.createLead() ✅
    │   (Vista CRM - principal)
    │
    └─→ MauticProvider.createLead() ✅
        (Mautic - paralelo)
        ├─ Cria/atualiza contato
        └─ Aplica tags automaticamente
            ├─ intent:comprar
            ├─ corretor:Nome_Do_Corretor
            └─ imovel:PH1234
```

---

## 🏷️ Tags Automáticas

O sistema aplica tags automaticamente baseado em:

### Intenção do Lead
- `intent:comprar`
- `intent:alugar`
- `intent:vender`
- `intent:parcerias`
- `intent:informacao`

### Origem
- `source:site`
- `source:whatsapp`
- `source:landing_page`

### Corretor (quando disponível)
- `corretor:Nome_Do_Corretor`

### Imóvel (quando aplicável)
- `imovel:PH1234`

### Device
- `device:mobile`
- `device:desktop`
- `device:tablet`

### Formulário
- `form:contato`
- `form:agendamento`
- `form:lead_wizard`

---

## 📊 Campos Personalizados Enviados

O sistema envia automaticamente para o Mautic:

### Dados do Imóvel
- `imovel_codigo` - PH1234
- `imovel_titulo` - Apartamento Frente Mar
- `imovel_preco` - 1500000
- `imovel_quartos` - 3
- `imovel_area` - 120
- `imovel_tipo` - apartamento
- `imovel_url` - https://pharosnegocios.com.br/imoveis/PH1234

### Dados do Lead
- `lead_intent` - buy/rent/sell/partnership/info
- `lead_source` - site/whatsapp/landing

### Tracking UTM
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`

### Contexto
- `device_type` - mobile/desktop/tablet
- `browser` - Chrome/Safari/Firefox
- `os` - Windows/macOS/Android/iOS
- `cidade`, `estado` - (quando detectável)
- `referrer_url` - URL de origem

⚠️ **Importante:** Você precisa criar estes campos no Mautic primeiro!  
📖 Veja: [docs/MAUTIC-SETUP.md](docs/MAUTIC-SETUP.md) - Passo 5

---

## 🧪 Testes

### Teste de Configuração

```bash
curl http://localhost:3600/api/debug/mautic
```

### Teste de Criação de Lead

```bash
curl -X POST http://localhost:3600/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(48) 99999-9999",
    "intent": "buy",
    "propertyCode": "PH1234"
  }'
```

### Verificar no Mautic

1. Acesse: https://mautic.seudominio.com.br
2. Menu: **Contatos**
3. Verifique:
   - ✅ Contato criado
   - ✅ Campos personalizados preenchidos
   - ✅ Tags aplicadas (`intent:comprar`, `imovel:PH1234`)

---

## 📋 Checklist de Setup

### Antes de Começar
- [ ] Servidor/VPS preparado (2GB RAM, 2 CPU cores)
- [ ] Domínio configurado (mautic.seudominio.com.br)
- [ ] Certificado SSL instalado

### Instalação do Mautic
- [ ] Docker e Docker Compose instalados
- [ ] Mautic rodando (via Docker)
- [ ] Acesso administrativo funcionando
- [ ] API habilitada (Basic Auth)

### Configuração de Campos no Mautic
- [ ] Campos do imóvel criados (código, título, preço, etc)
- [ ] Campos de tracking (UTM) criados
- [ ] Campos de contexto (device, browser) criados
- [ ] Campos de intenção criados

### Email de Boas-Vindas
- [ ] Template de email criado
- [ ] Campanha configurada
- [ ] Gatilho ativado (novo contato)

### Integração Pharos
- [ ] Variáveis adicionadas ao `.env.local`
- [ ] Servidor Next.js reiniciado
- [ ] Endpoint `/api/debug/mautic` testado
- [ ] Formulário de contato testado

---

## 🆘 Problemas Comuns

### ❌ Erro: "Mautic não configurado"

**Causa:** `MAUTIC_BASE_URL` não está definida

**Solução:**
```bash
# Adicione ao .env.local
MAUTIC_BASE_URL=https://mautic.seudominio.com.br

# Reinicie
npm run dev
```

### ❌ Erro 401 Unauthorized

**Causa:** Credenciais inválidas

**Solução:**
1. Verifique `MAUTIC_API_USERNAME` e `MAUTIC_API_PASSWORD`
2. Confirme que Basic Auth está habilitado no Mautic
3. Teste login manual no Mautic

### ❌ Timeout

**Causa:** Servidor Mautic lento

**Solução:**
```bash
# Aumente timeout no .env.local
MAUTIC_TIMEOUT_MS=60000

# Reinicie
npm run dev
```

### ❌ Campos não aparecem

**Causa:** Campos não criados no Mautic

**Solução:**
Siga o **Passo 5** do guia: [docs/MAUTIC-SETUP.md](docs/MAUTIC-SETUP.md)

---

## 📞 Suporte

### Documentação Oficial
- Mautic Docs: https://docs.mautic.org
- API Reference: https://developer.mautic.org/#rest-api
- Fórum: https://forum.mautic.org

### Logs e Debug
```bash
# Ver logs do Mautic (Docker)
docker-compose logs -f mautic

# Ver logs da aplicação
grep "MauticProvider" logs/application.log
```

---

## 🎓 Próximos Passos

Após configurar a integração básica:

1. **Seguir guia completo:** [docs/MAUTIC-SETUP.md](docs/MAUTIC-SETUP.md)
2. **Criar campanhas de nutrição** de leads
3. **Configurar lead scoring** automático
4. **Criar segmentos** por intenção
5. **Personalizar templates** de email
6. **Configurar relatórios** e dashboards

---

## ✨ Recursos da Integração

✅ **Nativa** - Segue arquitetura do projeto  
✅ **Inteligente** - Enriquecimento automático  
✅ **Completa** - Detalhes de imóveis incluídos  
✅ **Resiliente** - Não bloqueia Vista/DWV  
✅ **Testável** - Endpoint de debug  
✅ **Documentada** - Guias detalhados  
✅ **Escalável** - Pronto para crescimento  

---

**Implementado em:** 10/12/2025  
**Status:** ✅ Produção Ready  
**Versão:** 1.0

