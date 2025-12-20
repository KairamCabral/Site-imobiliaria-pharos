# Guia de Deploy - Imobiliária Pharos

## Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Servidor](#configuração-do-servidor)
3. [Deploy Inicial](#deploy-inicial)
4. [Deploy de Atualização](#deploy-de-atualização)
5. [Gestão PM2](#gestão-pm2)
6. [Troubleshooting](#troubleshooting)
7. [Rollback](#rollback)

---

## Pré-requisitos

### Versões Necessárias
- **Node.js**: >= 20.0.0 e < 21.0.0
- **npm**: >= 10.0.0
- **PM2**: >= 5.0.0 (instalado globalmente)

### Verificar Versões
```bash
node -v     # Deve retornar v20.x.x
npm -v      # Deve retornar 10.x.x ou superior
pm2 -v      # Deve retornar 5.x.x ou superior
```

### Estrutura de Diretórios no Servidor
```
/srv/apps/pharos-next/
├── current/           # Release atual (symlink)
├── releases/          # Histórico de releases
│   ├── 2025-12-19_14-30-00/
│   ├── 2025-12-19_15-45-00/
│   └── ...
├── shared/            # Arquivos compartilhados entre releases
│   ├── .env.production
│   └── node_modules/  (opcional, para cache)
└── logs/              # Logs da aplicação
    ├── pharos-next-out.log
    └── pharos-next-error.log
```

---

## Configuração do Servidor

### 1. Criar Usuário `apps` (se não existir)

```bash
# Como root ou sudo
sudo useradd -m -s /bin/bash apps
sudo mkdir -p /srv/apps
sudo chown apps:apps /srv/apps
```

### 2. Instalar Node.js (usando NVM - recomendado)

```bash
# Como usuário apps
su - apps

# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node 20.x LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar instalação
node -v
npm -v
```

### 3. Instalar PM2 Globalmente

```bash
npm install -g pm2

# Configurar PM2 para iniciar no boot (opcional)
pm2 startup
# Execute o comando sugerido pelo PM2
```

### 4. Criar Estrutura de Diretórios

```bash
mkdir -p /srv/apps/pharos-next/{releases,shared,logs}
cd /srv/apps/pharos-next
```

### 5. Configurar Variáveis de Ambiente

Crie o arquivo `/srv/apps/pharos-next/shared/.env.production`:

```env
# Next.js
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://pharos.com.br

# API Base URLs
NEXT_PUBLIC_API_URL=https://api.pharos.com.br
API_URL=https://api.pharos.com.br

# Contact2Sale (C2S)
C2S_ENABLED=true
C2S_API_URL=https://api.contact2sale.com/integration
C2S_API_TOKEN=seu_token_aqui
C2S_COMPANY_ID=sua_company_id
C2S_DEFAULT_SELLER_ID=seu_seller_id
C2S_WEBHOOK_SECRET=seu_webhook_secret
C2S_WEBHOOKS_ENABLED=true
C2S_TIMEOUT_MS=15000
C2S_RETRY_ATTEMPTS=3
C2S_RETRY_DELAY_MS=1000

# Redis (se usado)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

# Outros
PORT=3600
```

**IMPORTANTE**: Nunca versione este arquivo no Git. Mantenha credenciais seguras.

---

## Deploy Inicial

### Passo 1: Preparar Release

```bash
# Como usuário apps
cd /srv/apps/pharos-next/releases

# Criar diretório da release (formato: YYYY-MM-DD_HH-MM-SS)
RELEASE_DIR=$(date +"%Y-%m-%d_%H-%M-%S")
mkdir $RELEASE_DIR
cd $RELEASE_DIR

# Clonar código (ou copiar via rsync/scp)
git clone https://github.com/seu-usuario/imobiliaria-pharos.git .

# OU via rsync do seu local:
# rsync -avz --delete \
#   --exclude 'node_modules' \
#   --exclude '.next' \
#   --exclude '.git' \
#   /caminho/local/imobiliaria-pharos/ \
#   apps@servidor:/srv/apps/pharos-next/releases/$RELEASE_DIR/
```

### Passo 2: Linkar .env

```bash
ln -sf /srv/apps/pharos-next/shared/.env.production .env.production
```

### Passo 3: Instalar Dependências

```bash
# Limpar cache npm (opcional, mas recomendado)
npm cache clean --force

# Instalar dependências (preferir npm ci para builds reproduzíveis)
npm ci --omit=dev --prefer-offline

# OU se não houver package-lock.json:
# npm install --production
```

### Passo 4: Build da Aplicação

```bash
# Executar typecheck e build
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
  echo "✅ Build concluído com sucesso!"
else
  echo "❌ Erro no build. Verifique os logs acima."
  exit 1
fi
```

### Passo 5: Atualizar Symlink `current`

```bash
cd /srv/apps/pharos-next

# Backup do symlink atual (se existir)
if [ -L current ]; then
  PREVIOUS_RELEASE=$(readlink current)
  echo "📦 Release anterior: $PREVIOUS_RELEASE"
fi

# Atualizar symlink para nova release
ln -sfn releases/$RELEASE_DIR current

echo "✅ Symlink 'current' atualizado para: releases/$RELEASE_DIR"
```

### Passo 6: Iniciar com PM2

```bash
cd /srv/apps/pharos-next/current

# Iniciar aplicação
pm2 start npm \
  --name pharos-next \
  --time \
  --merge-logs \
  --output ../logs/pharos-next-out.log \
  --error ../logs/pharos-next-error.log \
  -- start -- --port 3600

# Salvar configuração PM2
pm2 save

# Verificar status
pm2 status
pm2 logs pharos-next --lines 50
```

### Passo 7: Verificar Saúde da Aplicação

```bash
# Aguardar alguns segundos para a aplicação subir
sleep 5

# Verificar se a porta está ativa
ss -lptn | grep 3600

# Testar endpoint de saúde (se existir)
curl -f http://localhost:3600/api/health

# Se OK, testar externamente
curl -f https://pharos.com.br
```

---

## Deploy de Atualização

### Script de Deploy Automatizado

Crie `/srv/apps/pharos-next/deploy.sh`:

```bash
#!/bin/bash
set -e

APP_NAME="pharos-next"
APP_DIR="/srv/apps/$APP_NAME"
RELEASE_DIR=$(date +"%Y-%m-%d_%H-%M-%S")
RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"
CURRENT_LINK="$APP_DIR/current"
KEEP_RELEASES=5

echo "🚀 Iniciando deploy do $APP_NAME"
echo "📅 Release: $RELEASE_DIR"

# 1. Criar diretório da release
mkdir -p "$RELEASES_DIR/$RELEASE_DIR"
cd "$RELEASES_DIR/$RELEASE_DIR"

# 2. Clonar/copiar código
echo "📦 Obtendo código..."
git clone https://github.com/seu-usuario/imobiliaria-pharos.git .
# OU: rsync do build local pré-compilado

# 3. Linkar .env
ln -sf "$SHARED_DIR/.env.production" .env.production

# 4. Instalar dependências
echo "📚 Instalando dependências..."
npm ci --omit=dev --prefer-offline

# 5. Build
echo "🔨 Executando build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build falhou. Abortando deploy."
  exit 1
fi

# 6. Atualizar symlink
echo "🔗 Atualizando symlink..."
ln -sfn "$RELEASES_DIR/$RELEASE_DIR" "$CURRENT_LINK"

# 7. Reload PM2
echo "🔄 Recarregando PM2..."
cd "$CURRENT_LINK"

if pm2 describe $APP_NAME > /dev/null 2>&1; then
  pm2 reload $APP_NAME --update-env
else
  pm2 start npm \
    --name $APP_NAME \
    --time \
    --merge-logs \
    --output "$APP_DIR/logs/$APP_NAME-out.log" \
    --error "$APP_DIR/logs/$APP_NAME-error.log" \
    -- start -- --port 3600
fi

pm2 save

# 8. Aguardar aplicação subir
echo "⏳ Aguardando aplicação..."
sleep 5

# 9. Health check
echo "🏥 Verificando saúde..."
if curl -f http://localhost:3600/api/health > /dev/null 2>&1; then
  echo "✅ Deploy concluído com sucesso!"
else
  echo "⚠️  Aplicação iniciada, mas health check falhou. Verifique os logs."
fi

# 10. Limpar releases antigas (manter últimas 5)
echo "🧹 Limpando releases antigas..."
cd "$RELEASES_DIR"
ls -t | tail -n +$((KEEP_RELEASES + 1)) | xargs -I {} rm -rf {}

echo "✨ Deploy finalizado: $RELEASE_DIR"
pm2 logs $APP_NAME --lines 30
```

Tornar executável:
```bash
chmod +x /srv/apps/pharos-next/deploy.sh
```

### Executar Deploy

```bash
cd /srv/apps/pharos-next
./deploy.sh
```

---

## Gestão PM2

### Comandos Comuns

```bash
# Listar processos
pm2 list
pm2 status

# Ver logs
pm2 logs pharos-next
pm2 logs pharos-next --lines 200
pm2 logs pharos-next --lines 50 --nostream

# Parar aplicação
pm2 stop pharos-next

# Iniciar aplicação
pm2 start pharos-next

# Reiniciar (zero-downtime)
pm2 reload pharos-next

# Restart (com downtime)
pm2 restart pharos-next

# Remover do PM2
pm2 delete pharos-next

# Monitorar recursos
pm2 monit

# Informações detalhadas
pm2 describe pharos-next

# Limpar logs
pm2 flush pharos-next
```

### Configuração PM2 (Alternativa)

Crie `ecosystem.config.js` no diretório raiz:

```javascript
module.exports = {
  apps: [{
    name: 'pharos-next',
    script: 'npm',
    args: 'start -- --port 3600',
    cwd: '/srv/apps/pharos-next/current',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3600
    },
    error_file: '../logs/pharos-next-error.log',
    out_file: '../logs/pharos-next-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
}
```

Usar com:
```bash
pm2 start ecosystem.config.js
pm2 reload ecosystem.config.js
```

---

## Troubleshooting

### Problema: Build Falha com Erros de TypeScript

**Sintoma**: `npm run build` retorna erros de tipo.

**Solução**:
```bash
# Verificar erros localmente
npm run typecheck

# Verificar versão do Node
node -v  # Deve ser 20.x

# Limpar cache e reinstalar
rm -rf node_modules .next
npm cache clean --force
npm install
npm run build
```

### Problema: Porta 3600 Já em Uso

**Sintoma**: Erro "Port 3600 is already in use".

**Solução**:
```bash
# Verificar processo na porta
ss -lptn | grep 3600
# OU
lsof -i :3600

# Parar processo antigo
pm2 stop pharos-next

# OU matar processo manualmente
kill -9 <PID>
```

### Problema: Permissões Negadas

**Sintoma**: Erro "EACCES: permission denied".

**Solução**:
```bash
# Corrigir ownership do diretório
sudo chown -R apps:apps /srv/apps/pharos-next

# Verificar permissões
ls -la /srv/apps/pharos-next
```

### Problema: Aplicação Não Inicia (Crash Loop)

**Sintoma**: PM2 mostra status "errored" ou "stopped".

**Solução**:
```bash
# Ver logs de erro
pm2 logs pharos-next --err --lines 100

# Verificar .env
cat /srv/apps/pharos-next/shared/.env.production

# Verificar se build existe
ls -la /srv/apps/pharos-next/current/.next

# Testar inicialização manual
cd /srv/apps/pharos-next/current
npm start
```

### Problema: Webhooks C2S Falhando

**Sintoma**: Logs mostram erros em `/api/webhooks/c2s`.

**Solução**:
```bash
# Verificar variáveis C2S
grep C2S_ /srv/apps/pharos-next/shared/.env.production

# Testar endpoint localmente
curl -X POST http://localhost:3600/api/webhooks/c2s \
  -H "Content-Type: application/json" \
  -d '{"hook_action":"on_create_lead","data":{"type":"lead","id":"123","attributes":{"customer":{"name":"Teste"},"lead_status":{"id":1,"alias":"novo"}}}}'

# Ver logs específicos
pm2 logs pharos-next | grep webhook
```

### Problema: High Memory Usage

**Sintoma**: PM2 reinicia constantemente (max_memory_restart).

**Solução**:
```bash
# Monitorar memória
pm2 monit

# Aumentar limite no ecosystem.config.js
# max_memory_restart: '2G'

# OU otimizar build (verificar cache, imagens, etc.)
```

---

## Rollback

### Rollback Rápido (usar release anterior)

```bash
cd /srv/apps/pharos-next

# Listar releases disponíveis
ls -lt releases/

# Ver release atual
readlink current

# Reverter para release anterior
PREVIOUS_RELEASE=$(ls -t releases/ | sed -n '2p')
echo "🔙 Revertendo para: $PREVIOUS_RELEASE"

ln -sfn releases/$PREVIOUS_RELEASE current

# Reload PM2
cd current
pm2 reload pharos-next

# Verificar
pm2 logs pharos-next --lines 30
```

### Script de Rollback Automatizado

Crie `/srv/apps/pharos-next/rollback.sh`:

```bash
#!/bin/bash
set -e

APP_NAME="pharos-next"
APP_DIR="/srv/apps/$APP_NAME"
RELEASES_DIR="$APP_DIR/releases"
CURRENT_LINK="$APP_DIR/current"

echo "🔙 Iniciando rollback do $APP_NAME"

# Pegar release anterior
PREVIOUS_RELEASE=$(ls -t "$RELEASES_DIR" | sed -n '2p')

if [ -z "$PREVIOUS_RELEASE" ]; then
  echo "❌ Nenhuma release anterior encontrada."
  exit 1
fi

echo "📦 Revertendo para: $PREVIOUS_RELEASE"

# Atualizar symlink
ln -sfn "$RELEASES_DIR/$PREVIOUS_RELEASE" "$CURRENT_LINK"

# Reload PM2
cd "$CURRENT_LINK"
pm2 reload $APP_NAME

echo "✅ Rollback concluído!"
pm2 logs $APP_NAME --lines 30
```

---

## Checklist de Deploy

### Pré-Deploy
- [ ] Código commitado e pushed para o repositório
- [ ] Testes passando localmente (`npm run test`)
- [ ] Build local bem-sucedido (`npm run build`)
- [ ] Variáveis de ambiente atualizadas (se necessário)
- [ ] Backups realizados (banco de dados, arquivos, etc.)

### Durante o Deploy
- [ ] SSH como usuário `apps`
- [ ] Executar script de deploy ou passos manuais
- [ ] Build concluído sem erros
- [ ] PM2 reload/restart bem-sucedido
- [ ] Health check passou

### Pós-Deploy
- [ ] Aplicação acessível externamente
- [ ] Logs sem erros críticos (`pm2 logs`)
- [ ] Funcionalidades principais testadas
- [ ] Webhooks C2S funcionando (se aplicável)
- [ ] Performance aceitável (tempo de resposta, CPU, memória)
- [ ] PM2 configuração salva (`pm2 save`)

---

## Contatos e Suporte

- **Documentação Next.js**: https://nextjs.org/docs
- **PM2 Documentação**: https://pm2.keymetrics.io/docs
- **Node.js Releases**: https://nodejs.org/en/about/releases/

Para problemas específicos, consulte os logs e a documentação técnica do projeto.

---

**Última atualização**: 19/12/2025  
**Versão do documento**: 1.0.0

