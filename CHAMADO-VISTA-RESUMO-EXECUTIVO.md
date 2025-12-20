# 📧 Chamado Vista - Resumo Executivo (Copiar/Colar)

---

**DE:** Pharos Imobiliária  
**CONTA:** gabarito-rest.vistahost.com.br  
**ASSUNTO:** Campos não retornando dados na API - StatusObra, TourVirtual, Videos, Anexos, IPTU

---

Olá, equipe Vista!

Estamos integrando nosso site com a API Vista CRM e identificamos **5 campos essenciais que não estão retornando dados**:

## ❌ PROBLEMAS IDENTIFICADOS

### 1. Status da Obra (`StatusObra`)
- **Endpoint testado:** `/imoveis/listar` e `/imoveis/detalhes`
- **Campos solicitados:** `StatusObra`, `StatusDaObra`, `StatusEmpreendimento`
- **Resultado:** Todos retornam `null`
- **Impacto:** Não conseguimos diferenciar imóveis em Lançamento, Em Construção ou Prontos

**Pergunta:** Qual é o nome exato do campo de status da obra na nossa conta?

---

### 2. Tour Virtual (`TourVirtual`)
- **Endpoint testado:** `/imoveis/detalhes`
- **Campo solicitado:** `TourVirtual`
- **Resultado:** Retorna `null` mesmo quando o campo existe na interface web
- **Impacto:** Não conseguimos exibir o tour 360° no site

**Pergunta:** Como acessar o campo de Tour Virtual via API?

---

### 3. Vídeos (`Videos`)
- **Endpoint testado:** `/imoveis/detalhes` e `/empreendimentos/listar`
- **Campo solicitado:** `Videos`
- **Resultado:** Retorna array vazio `[]`
- **Impacto:** Não conseguimos exibir galeria de vídeos

**Pergunta:** Como cadastrar e buscar vídeos corretamente?

---

### 4. Anexos (PDF, Plantas, Documentos)
- **Endpoint testado:** Múltiplos (veja detalhes técnicos)
- **Campos testados:** `Anexos`, `Documentos`, `Folder`, `FolderPDF`
- **Resultado:** Erro 400 ou `null`
- **Impacto:** Não conseguimos disponibilizar PDFs (catálogos, plantas) para download
- **Evidência:** Na interface web vemos o arquivo "APICE TOWERS - Catalogo.pdf" cadastrado

**Pergunta:** Existe endpoint ou campo na API para buscar anexos de um imóvel?

---

### 5. IPTU (`ValorIPTU` / `IPTU`)
- **Endpoint testado:** `/imoveis/detalhes`
- **Campos testados:** `ValorIPTU`, `IPTU`
- **Resultado:** Inconsistente (às vezes erro 400, às vezes `null`)
- **Impacto:** Resumo financeiro incompleto no site

**Pergunta:** Qual é o nome exato do campo IPTU na nossa conta `gabarito-rest`?

---

## 📊 REQUISIÇÕES EXEMPLO

### StatusObra
```bash
GET /imoveis/detalhes?key={API_KEY}&imovel=1108&pesquisa={"fields":["Codigo","StatusObra"]}

Resposta atual:
{
  "Codigo": "1108",
  "StatusObra": null  ❌
}

Resposta esperada:
{
  "Codigo": "1108",
  "StatusObra": "Em Construção"  ✅
}
```

### TourVirtual
```bash
GET /imoveis/detalhes?key={API_KEY}&imovel=1108&pesquisa={"fields":["Codigo","TourVirtual"]}

Resposta atual:
{
  "Codigo": "1108",
  "TourVirtual": null  ❌
}

Resposta esperada:
{
  "Codigo": "1108",
  "TourVirtual": "https://360tour.com/imovel/123"  ✅
}
```

### Videos
```bash
GET /imoveis/detalhes?key={API_KEY}&imovel=1108&pesquisa={"fields":["Codigo","Videos"]}

Resposta atual:
{
  "Codigo": "1108",
  "Videos": []  ❌
}

Resposta esperada:
{
  "Codigo": "1108",
  "Videos": ["https://youtube.com/watch?v=abc123"]  ✅
}
```

### Anexos
```bash
❓ Qual endpoint usar para buscar anexos?

Tentamos:
- GET /imoveis/anexos → 404
- GET /anexos/listar → 404
- Campo "Anexos" em /imoveis/detalhes → Erro 400

Resposta esperada:
{
  "Codigo": "1108",
  "Anexos": [
    {
      "Nome": "APICE TOWERS - Catalogo.pdf",
      "URL": "https://cdn.vistahost.com.br/...",
      "Tipo": "application/pdf"
    }
  ]
}
```

### IPTU
```bash
GET /imoveis/detalhes?key={API_KEY}&imovel=1108&pesquisa={"fields":["Codigo","ValorIPTU"]}

Resposta atual (cenário 1):
{
  "error": "Campo [ValorIPTU] não está disponível"  ❌
}

Resposta atual (cenário 2 com "IPTU"):
{
  "Codigo": "1108",
  "IPTU": null  ❌
}

Resposta esperada:
{
  "Codigo": "1108",
  "ValorIPTU": "1200.50"  ✅
}
```

---

## ✅ O QUE PRECISAMOS DO SUPORTE

**Por favor, confirme para cada campo:**

| Campo | Nome Exato | Está Habilitado? | Endpoint | Como Configurar |
|-------|-----------|------------------|----------|-----------------|
| Status Obra | ? | ? | `/detalhes`? `/listar`? | ? |
| Tour Virtual | ? | ? | `/detalhes`? | ? |
| Vídeos | ? | ? | `/detalhes`? | ? |
| Anexos | ? | ? | Qual endpoint? | ? |
| IPTU | ? | ? | `/detalhes`? `/listar`? | ? |

---

## 📎 ANEXOS

1. **CHAMADO-VISTA-DETALHES-TECNICOS.md** - Detalhes técnicos completos com logs e código
2. **Prints da interface Vista** - Mostrando os campos que existem mas não aparecem na API

---

## 🎯 URGÊNCIA

🔴 **ALTA** - Estes campos são essenciais para o lançamento do novo site da Pharos.

**Timeline desejado:**
- ✅ Resposta inicial: 1-2 dias úteis
- ✅ Solução/workaround: 5 dias úteis

---

## 📞 CONTATO

**Desenvolvedor:**
- Nome: [SEU NOME]
- Email: [SEU EMAIL]
- Telefone/WhatsApp: [SEU TELEFONE]
- Disponibilidade: Segunda a Sexta, 9h-18h

**Preferência:** Reunião técnica por vídeo para agilizar a solução

---

## ❓ RESUMO DAS PERGUNTAS

1. **StatusObra:** Nome exato do campo? Está disponível na conta?
2. **TourVirtual:** Como acessar via API? Precisa configurar algo?
3. **Videos:** Como cadastrar e buscar vídeos?
4. **Anexos:** Qual endpoint usar? Campo disponível?
5. **IPTU:** Nome exato (`ValorIPTU` ou `IPTU`)? Está habilitado?

---

**Aguardamos retorno. Obrigado!** 🙏

---

## 🔍 INFORMAÇÕES ADICIONAIS

### Sistema de Descoberta Implementado

Nosso sistema chama `/imoveis/listarcampos` para descobrir campos disponíveis:

```
Campos encontrados: 157 campos
Campos de "status obra": 0 ❌
Campos de "IPTU": 0 ou 1? ⚠️
```

### Arquitetura da Integração

- **Stack:** TypeScript + Next.js 14
- **Padrão:** Provider Pattern (abstração multi-CRM)
- **Resiliência:** Sistema de fallback automático implementado
- **Performance:** Cache de 5 minutos + retry com backoff

### O que já funciona ✅

- ✅ Listagem de imóveis (`/imoveis/listar`)
- ✅ Detalhes de imóveis (`/imoveis/detalhes`)
- ✅ Galeria de fotos (`/imoveis/fotos`)
- ✅ Envio de leads (`/clientes/enviarLeads`)
- ✅ Características e Infraestrutura
- ✅ Dados do corretor e agência

### O que não funciona ❌

- ❌ Status da Obra (campo vazio)
- ❌ Tour Virtual (campo vazio)
- ❌ Vídeos (array vazio)
- ❌ Anexos (não encontrado)
- ⚠️ IPTU (inconsistente)

---

**Código da Conta:** gabarito-rest.vistahost.com.br  
**API Key:** e4e62e22782c7646f2db00a2c56ac70e  
**Número do Chamado:** [SERÁ PREENCHIDO PELO VISTA]

---





