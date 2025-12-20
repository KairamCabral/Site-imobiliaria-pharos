# 🚀 Guia Completo de Configuração - Mautic Integration

## Visão Geral

Este guia fornece instruções passo a passo para configurar a integração completa com Mautic Marketing Automation na plataforma Pharos Imobiliária.

---

## 📋 Pré-requisitos

- [ ] Servidor VPS ou Cloud (mínimo 2GB RAM, 2 CPU cores)
- [ ] Domínio configurado (ex: `mautic.seudominio.com.br`)
- [ ] Certificado SSL válido (Let's Encrypt recomendado)
- [ ] Docker e Docker Compose instalados (recomendado)
- [ ] Acesso SSH ao servidor

---

## 🐳 Passo 1: Instalar Mautic

### Opção A: Instalação com Docker (Recomendado)

1. **Criar diretório do projeto:**

```bash
mkdir -p /opt/mautic
cd /opt/mautic
```

2. **Criar arquivo `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  mautic_db:
    image: mysql:8.0
    container_name: mautic_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root_password_segura
      MYSQL_DATABASE: mautic
      MYSQL_USER: mautic_user
      MYSQL_PASSWORD: senha_segura_mautic
    volumes:
      - ./mysql_data:/var/lib/mysql
    networks:
      - mautic_network

  mautic:
    image: mautic/mautic:v5-apache
    container_name: mautic_app
    restart: always
    ports:
      - "8080:80"
    environment:
      MAUTIC_DB_HOST: mautic_db
      MAUTIC_DB_NAME: mautic
      MAUTIC_DB_USER: mautic_user
      MAUTIC_DB_PASSWORD: senha_segura_mautic
      MAUTIC_TRUSTED_PROXIES: '0.0.0.0/0'
    volumes:
      - ./mautic_data:/var/www/html
    depends_on:
      - mautic_db
    networks:
      - mautic_network

networks:
  mautic_network:
    driver: bridge
```

3. **Iniciar containers:**

```bash
docker-compose up -d
```

4. **Aguardar inicialização (2-3 minutos):**

```bash
docker-compose logs -f mautic
```

### Opção B: Instalação Manual

Consulte a documentação oficial: https://docs.mautic.org/en/setup

---

## 🌐 Passo 2: Configurar Nginx Reverse Proxy (Opcional)

Se você usar Docker na porta 8080, configure um reverse proxy:

```nginx
server {
    listen 80;
    server_name mautic.seudominio.com.br;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name mautic.seudominio.com.br;

    ssl_certificate /etc/letsencrypt/live/mautic.seudominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mautic.seudominio.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reinicie o Nginx:

```bash
sudo systemctl restart nginx
```

---

## ⚙️ Passo 3: Configuração Inicial do Mautic

1. **Acesse o Mautic:**

```
https://mautic.seudominio.com.br
```

2. **Complete o wizard de instalação:**
   - Escolha idioma: Português (Brasil)
   - Verificação de requisitos (deve estar tudo OK)
   - Banco de dados: Já configurado via Docker
   - Criar usuário administrador:
     - Nome: Admin Pharos
     - Email: admin@pharosnegocios.com.br
     - Username: `admin`
     - Senha: (senha forte)

3. **Configurações iniciais:**
   - Nome da empresa: Pharos Negócios Imobiliários
   - Website: https://pharosnegocios.com.br
   - Timezone: America/Sao_Paulo
   - Formato de data: DD/MM/YYYY

---

## 🔧 Passo 4: Habilitar API

1. **Ir para Configurações:**
   - Menu superior direito → ⚙️ Configurações

2. **Habilitar API:**
   - API Settings → **Enable Mautic's API**: ✅ Sim
   - **Enable HTTP basic auth?**: ✅ Sim
   - Salvar configurações

---

## 📝 Passo 5: Criar Campos Personalizados

### 5.1. Acessar Campos de Contato

Menu: **Configurações** → **Campos de Contato**

### 5.2. Criar Campos do Imóvel

Para cada campo abaixo, clique em **Novo** e preencha:

#### Campo: Código do Imóvel
- **Rótulo:** Código do Imóvel
- **Alias:** `imovel_codigo`
- **Tipo:** Text
- **Obrigatório:** Não
- **Visível publicamente:** Sim
- **Ordem:** 100

#### Campo: Título do Imóvel
- **Rótulo:** Título do Imóvel
- **Alias:** `imovel_titulo`
- **Tipo:** Text
- **Obrigatório:** Não
- **Visível publicamente:** Sim
- **Ordem:** 101

#### Campo: Preço do Imóvel
- **Rótulo:** Preço do Imóvel
- **Alias:** `imovel_preco`
- **Tipo:** Number
- **Obrigatório:** Não
- **Visível publicamente:** Sim
- **Ordem:** 102

#### Campo: Quartos
- **Rótulo:** Quartos
- **Alias:** `imovel_quartos`
- **Tipo:** Number
- **Obrigatório:** Não
- **Visível publicamente:** Sim
- **Ordem:** 103

#### Campo: Área Total
- **Rótulo:** Área Total (m²)
- **Alias:** `imovel_area`
- **Tipo:** Number
- **Obrigatório:** Não
- **Visível publicamente:** Sim
- **Ordem:** 104

#### Campo: Tipo de Imóvel
- **Rótulo:** Tipo de Imóvel
- **Alias:** `imovel_tipo`
- **Tipo:** Select
- **Opções:**
  - apartamento
  - casa
  - terreno
  - comercial
  - rural
- **Obrigatório:** Não
- **Ordem:** 105

#### Campo: URL do Imóvel
- **Rótulo:** URL do Imóvel
- **Alias:** `imovel_url`
- **Tipo:** URL
- **Obrigatório:** Não
- **Visível publicamente:** Sim
- **Ordem:** 106

### 5.3. Criar Campos de Intenção e Origem

#### Campo: Intenção do Lead
- **Rótulo:** Intenção
- **Alias:** `lead_intent`
- **Tipo:** Select
- **Opções:**
  - buy (Comprar)
  - rent (Alugar)
  - sell (Vender)
  - partnership (Parcerias)
  - info (Informação)
- **Obrigatório:** Não
- **Ordem:** 110

#### Campo: Origem do Lead
- **Rótulo:** Origem
- **Alias:** `lead_source`
- **Tipo:** Text
- **Obrigatório:** Não
- **Ordem:** 111

### 5.4. Criar Campos de Tracking UTM

Para cada campo UTM:

```
utm_source    | Text | Ordem: 120
utm_medium    | Text | Ordem: 121
utm_campaign  | Text | Ordem: 122
utm_term      | Text | Ordem: 123
utm_content   | Text | Ordem: 124
```

### 5.5. Criar Campos de Contexto

```
device_type   | Select (mobile, desktop, tablet) | Ordem: 130
browser       | Text | Ordem: 131
os            | Text | Ordem: 132
cidade        | Text | Ordem: 133
estado        | Text | Ordem: 134
referrer_url  | URL  | Ordem: 135
```

---

## 📧 Passo 6: Configurar Email de Boas-Vindas

### 6.1. Criar Template de Email

1. **Ir para:** Canais → Emails
2. **Clicar em:** Novo
3. **Preencher:**
   - Nome: Boas-vindas Pharos
   - Assunto: Olá {contactfield=firstname}! Bem-vindo à Pharos
   - Tipo: Template

4. **Corpo do email:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #054ADA 0%, #192233 100%); padding: 40px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0;">Pharos Negócios Imobiliários</h1>
        <p style="color: white; font-size: 18px;">Seus sonhos, nosso compromisso</p>
    </div>
    
    <div style="padding: 40px; background: #f5f5f5;">
        <h2 style="color: #192233;">Olá, {contactfield=firstname}!</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Seja muito bem-vindo(a) à <strong>Pharos Negócios Imobiliários</strong>!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Recebemos seu contato e nossa equipe está analisando sua solicitação. 
            Em breve, um de nossos especialistas entrará em contato.
        </p>
        
        {if contactfield=imovel_codigo}
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #054ADA; margin-top: 0;">Imóvel de Interesse</h3>
            <p><strong>Código:</strong> {contactfield=imovel_codigo}</p>
            {if contactfield=imovel_titulo}
            <p><strong>Título:</strong> {contactfield=imovel_titulo}</p>
            {/if}
            {if contactfield=imovel_url}
            <p><a href="{contactfield=imovel_url}" style="color: #054ADA;">Ver detalhes do imóvel</a></p>
            {/if}
        </div>
        {/if}
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Enquanto isso, conheça mais sobre nosso portfólio:
        </p>
        
        <a href="https://pharosnegocios.com.br/imoveis" 
           style="display: inline-block; background: #054ADA; color: white; 
                  padding: 15px 30px; text-decoration: none; border-radius: 5px; 
                  margin: 20px 0; font-weight: bold;">
            Ver Todos os Imóveis
        </a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666;">
            Tem dúvidas? Fale conosco:<br>
            📞 WhatsApp: <a href="tel:+5548999999999" style="color: #054ADA;">+55 (48) 99999-9999</a><br>
            ✉️ Email: <a href="mailto:contato@pharosnegocios.com.br" style="color: #054ADA;">contato@pharosnegocios.com.br</a>
        </p>
    </div>
    
    <div style="background: #192233; padding: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 Pharos Negócios Imobiliários. Todos os direitos reservados.
        </p>
    </div>
</body>
</html>
```

5. **Salvar e publicar**

### 6.2. Criar Campanha de Boas-Vindas

1. **Ir para:** Campanhas → Campanhas
2. **Clicar em:** Novo
3. **Preencher:**
   - Nome: Boas-vindas Automático
   - Descrição: Envia email de boas-vindas para novos contatos

4. **Configurar gatilho:**
   - Clique em "Launch Campaign Builder"
   - Adicionar fonte: **Contact field value changes**
   - Campo: `dateAdded` (data de criação)
   - Condição: is not empty

5. **Adicionar ação:**
   - Arrastar: **Send Email**
   - Selecionar: Boas-vindas Pharos
   - Delay: Imediato (0 minutos)

6. **Publicar campanha**

---

## 🔑 Passo 7: Gerar Credenciais de API

As credenciais já estão prontas! Você usará:

- **Username:** `admin` (seu usuário administrador)
- **Password:** (senha que você criou)

⚠️ **Segurança:** Recomendado criar usuário dedicado para API:

1. Ir para: Configurações → Usuários
2. Novo → Criar usuário `api_pharos`
3. Permissões: API Access
4. Usar este usuário nas configurações

---

## 🧪 Passo 8: Configurar Variáveis de Ambiente

No projeto Pharos, edite `.env.local`:

```bash
# Mautic Marketing Automation Configuration
MAUTIC_BASE_URL=https://mautic.seudominio.com.br
MAUTIC_AUTH_TYPE=basic
MAUTIC_API_USERNAME=admin
MAUTIC_API_PASSWORD=sua_senha_aqui
MAUTIC_TIMEOUT_MS=30000
```

**Reinicie o servidor Next.js:**

```bash
# Parar servidor (Ctrl+C)
npm run dev
```

---

## ✅ Passo 9: Testar Integração

### 9.1. Teste via Endpoint de Debug

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
    "contactId": 1
  }
}
```

### 9.2. Teste via Formulário de Contato

1. Acesse: http://localhost:3600/contato
2. Preencha o formulário
3. Envie

**Verificar no Mautic:**
1. Ir para: Contatos
2. O novo contato deve aparecer com:
   - Nome e email corretos
   - Campos personalizados preenchidos
   - Tags aplicadas automaticamente

---

## 🎯 Passo 10: Monitoramento e Manutenção

### Logs do Mautic

```bash
# Ver logs em tempo real
docker-compose logs -f mautic

# Verificar erros recentes
docker-compose logs mautic | grep -i error
```

### Backup do Banco de Dados

```bash
# Criar backup
docker exec mautic_mysql mysqldump -u mautic_user -psenha_segura_mautic mautic > backup_mautic_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i mautic_mysql mysql -u mautic_user -psenha_segura_mautic mautic < backup_mautic_20251210.sql
```

### Atualizar Mautic

```bash
cd /opt/mautic
docker-compose pull
docker-compose up -d
```

---

## 📊 Recursos Avançados

### Segmentação Automática

Criar segmentos baseados em tags:

1. **Ir para:** Segmentos → Novo
2. **Nome:** Leads - Interesse em Comprar
3. **Filtros:**
   - Tags: contém `intent:comprar`
4. **Salvar**

### Campanhas de Nutrição

Criar sequência de emails baseada em intenção:

1. Segmento: Leads - Interesse em Comprar
2. Email 1: Imóveis Recomendados (dia 0)
3. Email 2: Guia de Compra (dia 3)
4. Email 3: Depoimentos de Clientes (dia 7)
5. Email 4: Oferta Especial (dia 14)

### Lead Scoring

Configurar pontuação automática:

**Pontos positivos:**
- Abriu email: +5
- Clicou em link: +10
- Visitou página de imóvel: +15
- Preencheu formulário: +25
- Agendou visita: +50

**Pontos negativos:**
- Não abriu emails (7 dias): -5
- Não interagiu (30 dias): -20

---

## 🆘 Troubleshooting

### Problema: Erro 401 Unauthorized

**Solução:**
- Verificar username e password em `.env.local`
- Confirmar que API está habilitada no Mautic
- Verificar se Basic Auth está habilitado

### Problema: Campos personalizados não aparecem

**Solução:**
- Verificar alias dos campos (deve ser exatamente como no código)
- Confirmar que campos estão publicados
- Limpar cache do Mautic: `docker-compose exec mautic php bin/console cache:clear`

### Problema: Tags não sendo aplicadas

**Solução:**
- Verificar logs: `docker-compose logs mautic`
- Confirmar que tags existem (Mautic cria automaticamente)
- Verificar permissões do usuário API

### Problema: Timeout nas requisições

**Solução:**
- Aumentar `MAUTIC_TIMEOUT_MS` para 60000
- Verificar saúde do servidor: `docker-compose ps`
- Checar recursos: `docker stats`

---

## 📚 Recursos Úteis

- **Documentação Oficial:** https://docs.mautic.org
- **Fórum Comunidade:** https://forum.mautic.org
- **API Reference:** https://developer.mautic.org/#rest-api
- **GitHub:** https://github.com/mautic/mautic

---

## ✨ Próximos Passos

Após concluir este setup:

- [ ] Personalizar templates de email com identidade visual Pharos
- [ ] Criar landing pages no Mautic
- [ ] Configurar campanhas de nutrição por segmento
- [ ] Implementar lead scoring customizado
- [ ] Integrar com Google Analytics
- [ ] Configurar relatórios e dashboards
- [ ] Treinar equipe no uso do Mautic

---

**Guia criado em:** 10/12/2025  
**Versão:** 1.0  
**Última atualização:** 10/12/2025

