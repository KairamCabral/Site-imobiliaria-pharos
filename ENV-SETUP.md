# ⚙️ Configuração de Variáveis de Ambiente

## Passo 1: Criar arquivo .env.local

Na raiz do projeto `imobiliaria-pharos/`, crie o arquivo `.env.local`:

```bash
# Vista CRM Configuration
VISTA_BASE_URL=https://gabarito-rest.vistahost.com.br
VISTA_API_KEY=e4e62e22782c7646f2db00a2c56ac70e

# Provider Configuration
CRM_PROVIDER=vista
```

## Passo 2: Reiniciar Servidor

Após criar o `.env.local`, reinicie o servidor Next.js:

```bash
# Parar servidor (Ctrl+C)

# Iniciar novamente
npm run dev
```

## Passo 3: Validar Configuração

Acesse o endpoint de debug:

```
http://localhost:3600/api/debug/vista
```

**Resultado esperado:**
```json
{
  "success": true,
  "status": 200,
  "sample": {
    "Codigo": "PH14",
    "ValorVenda": "2750000",   // ✅ Preço!
    "Dormitorios": "3",         // ✅ Quartos!
    "FotoDestaque": "https://..." // ✅ Foto!
  },
  "validation": {
    "temValorVenda": true,
    "temDormitorios": true,
    "temFotoDestaque": true
  }
}
```

## ⚠️ Importante

- O arquivo `.env.local` está no `.gitignore` e **NÃO deve ser commitado**
- Guarde a chave API em local seguro
- Use variáveis diferentes para produção

## 🔍 Troubleshooting

### Erro: "VISTA_API_KEY não configurada"
- Certifique-se que o arquivo `.env.local` existe
- Verifique se está na raiz correta do projeto
- Reinicie o servidor após criar o arquivo

### Erro 403/401 da API Vista
- Valide se a chave API está correta
- Confirme se a URL base está correta
- Verifique se sua conta Vista está ativa

