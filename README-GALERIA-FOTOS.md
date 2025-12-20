# 🚀 Guia Rápido: Galeria de Fotos Vista

## ⚡ TL;DR

**Status:** ✅ Implementação Completa  
**Próxima Ação:** Enviar pedido ao suporte do Vista

---

## 📧 1. Enviar Pedido ao Vista (Agora)

**Copie e envie:**  
👉 Abra: `PEDIDO-VISTA-GALERIA-FOTOS.md`

**Template pronto com:**
- Dados do tenant/key
- Descrição técnica do problema
- Formato de validação esperado
- Prazo e impacto no negócio

---

## 🧪 2. Testar Endpoint (Quando Vista Confirmar)

```bash
# Opção 1: Manual
curl "https://gabarito-rest.vistahost.com.br/imoveis/fotos?key=SUA_KEY&imovel=742"

# Opção 2: Script automático
npm run health-check:fotos
```

---

## 🔧 3. Ativar Feature Flag

**Arquivo:** `.env.local` (criar na raiz se não existir)

```bash
# Vista CRM
VISTA_BASE_URL=https://gabarito-rest.vistahost.com.br
VISTA_API_KEY=sua_key_aqui

# ⚠️ MUDAR PARA true QUANDO VISTA LIBERAR
FOTOS_ENDPOINT_ENABLED=false

# WhatsApp (CTA "Mais fotos")
NEXT_PUBLIC_WHATSAPP_NUMBER=5548999999999
NEXT_PUBLIC_WHATSAPP_MESSAGE=Olá! Gostaria de ver mais fotos do imóvel {CODIGO}.
```

**Quando Vista liberar:**
1. Mude para `FOTOS_ENDPOINT_ENABLED=true`
2. Reinicie: `npm run dev`
3. Teste: `http://localhost:3600/imoveis/PH742`

---

## ✅ Validação Rápida

**Galeria Completa Ativa:**
- ✅ Hero + 4 thumbs **reais** (não skeletons)
- ✅ Lightbox com múltiplas fotos
- ✅ Log: `source: vista-fotos`

**Galeria em Fallback (Atual):**
- ✅ Hero com FotoDestaque
- ✅ 4 skeletons clicáveis → WhatsApp
- ✅ Badge "Mais fotos via WhatsApp"
- ✅ Log: `source: vista-listagem`

---

## 📊 Health-Check Diário (Opcional)

**Windows Task Scheduler:**
```powershell
cd "D:\2 PESSOAL\0 CURSOR\PHAROS\Site Oficial Pharos\imobiliaria-pharos"
npm run health-check:fotos
```

**Frequência:** Diariamente às 8h  
**Alerta:** E-mail quando exit code = 0 (endpoint ativo)

---

## 📚 Documentação Completa

- **`IMPLEMENTACAO-GALERIA-COMPLETA.md`** → Detalhes técnicos e troubleshooting
- **`ENV-VARIABLES.md`** → Todas as variáveis de ambiente
- **`PEDIDO-VISTA-GALERIA-FOTOS.md`** → Template para suporte

---

## 🎯 O Que Funciona Agora (Sem Vista)

✅ UI elegante com skeletons  
✅ CTA WhatsApp "Solicitar mais fotos"  
✅ Telemetria (Google Analytics)  
✅ FotoDestaque carregando normalmente  
✅ Zero erros no console  
✅ Código pronto para galeria completa  

---

## 🔥 Última Ação

**Copie o template e envie para o suporte do Vista:**

```
Assunto: Habilitar galeria – endpoint /imoveis/fotos
```

👉 **Conteúdo:** `PEDIDO-VISTA-GALERIA-FOTOS.md`

---

**Questões?** Consulte `IMPLEMENTACAO-GALERIA-COMPLETA.md`  
**Última atualização:** 18/10/2025

