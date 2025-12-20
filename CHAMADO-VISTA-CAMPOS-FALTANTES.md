# 🎫 Chamado Vista CRM - Campos Não Retornando Dados

**Data:** 09/12/2025  
**Cliente:** Pharos Imobiliária  
**Conta:** gabarito-rest.vistahost.com.br  
**API Key:** e4e62e22782c7646f2db00a2c56ac70e

---

## 📋 RESUMO DO PROBLEMA

Estamos integrando com a API Vista CRM e identificamos que **4 campos essenciais** estão sendo solicitados mas **NÃO estão retornando dados** ou estão retornando **vazios/nulos**:

1. ❌ **Status da Obra** (StatusObra)
2. ❌ **Tour Virtual** (TourVirtual)
3. ❌ **Vídeos** (Videos)
4. ❌ **Anexos** (documentos PDF, plantas, etc.)
5. ⚠️ **IPTU** (ValorIPTU / IPTU) - Incerto

---

## 🔍 DETALHAMENTO POR CAMPO

### 1. ❌ STATUS DA OBRA (`StatusObra`)

#### 📍 **Onde estamos solicitando:**

**Endpoint:** `GET /imoveis/listar`  
**Parâmetros:**
```json
{
  "pesquisa": {
    "fields": [
      "Codigo",
      "StatusObra",
      "..."
    ]
  }
}
```

**Endpoint:** `GET /imoveis/detalhes`  
**Parâmetros:**
```json
{
  "imovel": "1234",
  "pesquisa": {
    "fields": [
      "Codigo",
      "StatusObra",
      "..."
    ]
  }
}
```

#### ❌ **Problema:**
- Campo `StatusObra` retorna **vazio/nulo** em todos os imóveis
- Variantes testadas também não retornam dados:
  - `StatusDaObra`
  - `StatusEmpreendimento`
  - `StatusConstrucao`

#### 📌 **Valores Esperados:**
Conforme documentação do Vista, esperamos um dos seguintes valores:
- `"Pré-Lançamento"`
- `"Lançamento"`
- `"Em Construção"`
- `"Pronto"`
- `"Entregue"`

#### 💡 **Alternativa Atual:**
Estamos usando o campo `Lancamento` (Sim/Não) como workaround, mas isso **não diferencia**:
- Pré-lançamento vs. Lançamento
- Em construção vs. Pronto

#### ❓ **Pergunta para o Suporte:**
1. O campo `StatusObra` está disponível na nossa conta?
2. Se sim, qual é o nome exato do campo?
3. Se não, existe algum campo alternativo que retorne o status da obra?
4. Como podemos diferenciar imóveis em lançamento, construção e prontos?

---

### 2. ❌ TOUR VIRTUAL (`TourVirtual`)

#### 📍 **Onde estamos solicitando:**

**Endpoint:** `GET /imoveis/detalhes`  
**Parâmetros:**
```json
{
  "imovel": "1234",
  "pesquisa": {
    "fields": [
      "Codigo",
      "TourVirtual",
      "..."
    ]
  }
}
```

#### ❌ **Problema:**
- Campo `TourVirtual` retorna **vazio/nulo** mesmo para imóveis que **possuem tour 360° cadastrado**
- Na imagem fornecida pelo cliente, vemos um campo **"Tour Virtual"** vazio no cadastro

#### 📌 **Valor Esperado:**
URL do tour virtual 360° (ex: `https://360tour.com/imovel/123`)

#### 💡 **Informação Adicional:**
Verificamos que no cadastro do Vista (interface web) existe um campo chamado **"Tour Virtual"** que está vazio. Precisamos confirmar:

#### ❓ **Pergunta para o Suporte:**
1. O campo `TourVirtual` está disponível na API?
2. Existe algum nome alternativo? (`Tour`, `Link360`, `URLTour`, `TourVirtual360`)
3. É necessário preencher este campo manualmente no cadastro para ele aparecer na API?
4. Existe alguma configuração de permissão/visibilidade para este campo?

---

### 3. ❌ VÍDEOS (`Videos`)

#### 📍 **Onde estamos solicitando:**

**Endpoint:** `GET /imoveis/detalhes`  
**Parâmetros:**
```json
{
  "imovel": "1234",
  "pesquisa": {
    "fields": [
      "Codigo",
      "Videos",
      "..."
    ]
  }
}
```

**Endpoint:** `GET /empreendimentos/listar`  
**Parâmetros:**
```json
{
  "pesquisa": {
    "fields": [
      "Codigo",
      "Videos",
      "..."
    ]
  }
}
```

#### ❌ **Problema:**
- Campo `Videos` retorna **vazio/nulo** ou **array vazio `[]`**
- Mesmo para imóveis com vídeos cadastrados no Vista

#### 📌 **Valor Esperado:**
Array de URLs de vídeos (geralmente YouTube/Vimeo):
```json
{
  "Videos": [
    "https://www.youtube.com/watch?v=abc123",
    "https://vimeo.com/123456789"
  ]
}
```

#### 💡 **Informação Adicional:**
Na imagem fornecida, vemos uma seção **"Vídeos"** com a mensagem **"Nenhum Vídeo foi cadastrado"**.

#### ❓ **Pergunta para o Suporte:**
1. O campo `Videos` está disponível na API?
2. Existe algum nome alternativo? (`Video`, `VideoURL`, `VideosYoutube`)
3. É necessário cadastrar vídeos de alguma forma específica?
4. Os vídeos precisam estar em algum formato específico (URL do YouTube, embed, etc.)?

---

### 4. ❌ ANEXOS (PDFs, Plantas, Documentos)

#### 📍 **Onde estamos tentando buscar:**

Testamos múltiplos campos e endpoints, mas **não encontramos documentação clara** sobre como buscar anexos via API.

**Campos testados:**
- `Anexos`
- `Documentos`
- `Arquivos`
- `PDFs`
- `Plantas`
- `Folder`
- `FolderPDF`

#### ❌ **Problema:**
- **Não conseguimos identificar qual endpoint ou campo usar** para buscar anexos
- Na imagem fornecida, vemos uma seção **"Anexos"** com um arquivo:
  - **Nome:** "APICE TOWERS - Catalogo.pdf"
  - **Data:** 08/04/2022
  - **Corretor:** Cadastro
  - **Publicado no site:** ✅

#### 📌 **Valor Esperado:**
Array de objetos com informações dos anexos:
```json
{
  "Anexos": [
    {
      "Nome": "APICE TOWERS - Catalogo.pdf",
      "URL": "https://cdn.vistahost.com.br/anexos/12345/catalogo.pdf",
      "Tipo": "application/pdf",
      "Data": "2022-04-08",
      "PublicarSite": true
    }
  ]
}
```

#### ❓ **Pergunta para o Suporte:**
1. **Existe endpoint ou campo na API para buscar anexos?**
2. Se sim, qual é o endpoint e qual é o nome do campo?
3. Se não, há previsão de implementação deste recurso?
4. Como podemos acessar programaticamente os anexos (PDFs, plantas, documentos)?

**Casos de uso importantes:**
- Catálogos de empreendimentos
- Plantas dos imóveis
- Documentos técnicos (IPTU, matrícula, etc.)
- Material de marketing

---

### 5. ⚠️ IPTU (`ValorIPTU` / `IPTU`)

#### 📍 **Onde estamos solicitando:**

**Endpoint:** `GET /imoveis/detalhes`  
**Parâmetros (tentativa 1):**
```json
{
  "imovel": "1234",
  "pesquisa": {
    "fields": [
      "Codigo",
      "ValorIPTU",
      "..."
    ]
  }
}
```

**Parâmetros (tentativa 2 - fallback):**
```json
{
  "imovel": "1234",
  "pesquisa": {
    "fields": [
      "Codigo",
      "IPTU",
      "..."
    ]
  }
}
```

#### ⚠️ **Problema:**
- Nosso código implementa **fallback inteligente** (tenta `ValorIPTU` → `IPTU` → sem campo)
- Em alguns casos, recebemos **erro 400** ao solicitar `ValorIPTU`
- Em outros casos, o campo retorna mas está **vazio/nulo**

#### 📌 **Valor Esperado:**
Valor do IPTU anual ou mensal:
```json
{
  "ValorIPTU": "1200.50"
}
```
ou
```json
{
  "IPTU": "1200.50"
}
```

#### 💡 **Implementação Atual:**
Nosso código tenta 3 estratégias:
1. Solicitar `ValorIPTU` (modo `valorIptu`)
2. Solicitar `IPTU` (modo `iptu`)
3. Não solicitar (modo `none`)

Se falhar, tenta buscar via `/imoveis/listar` com filtro por código.

#### ❓ **Pergunta para o Suporte:**
1. Qual é o **nome exato** do campo de IPTU na nossa conta?
2. O campo está disponível apenas em `/imoveis/detalhes` ou também em `/imoveis/listar`?
3. Existe alguma permissão ou configuração necessária para acessar este campo?
4. Se o campo não estiver disponível, como podemos habilitar?

---

## 📊 RESUMO DOS ENDPOINTS UTILIZADOS

### ✅ Endpoints que estamos chamando:

| Endpoint | Método | Uso | Status |
|----------|--------|-----|--------|
| `/imoveis/listar` | GET | Listagem de imóveis | ✅ Funcionando |
| `/imoveis/detalhes` | GET | Detalhes de um imóvel | ✅ Funcionando |
| `/imoveis/fotos` | POST | Galeria de fotos | ✅ Funcionando |
| `/imoveis/listarcampos` | GET | Descoberta de campos disponíveis | ✅ Funcionando |
| `/empreendimentos/listar` | GET | Listagem de empreendimentos | ⚠️ Parcial |
| `/empreendimentos/detalhes` | GET | Detalhes de empreendimento | ⚠️ Parcial |
| `/clientes/enviarLeads` | POST | Envio de leads | ✅ Funcionando |

### ❓ Endpoints que não encontramos na documentação:

| Recurso | Endpoint Esperado | Existe? |
|---------|-------------------|---------|
| Anexos/Documentos | `/imoveis/anexos` ou `/documentos/listar` | ❓ |
| Vídeos (específico) | `/imoveis/videos` | ❓ |

---

## 🔧 INFORMAÇÕES TÉCNICAS

### 📌 Nossa Stack:
- **Linguagem:** TypeScript / Node.js
- **Framework:** Next.js 14
- **Arquitetura:** Provider Pattern (abstração multi-CRM)

### 📌 Como estamos montando as requisições:

**Exemplo de requisição completa:**
```http
GET https://gabarito-rest.vistahost.com.br/imoveis/detalhes?key=e4e62e22782c7646f2db00a2c56ac70e&imovel=1234&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22StatusObra%22%2C%22TourVirtual%22%2C%22Videos%22%2C%22ValorIPTU%22%5D%7D
```

**Pesquisa decodificada:**
```json
{
  "fields": [
    "Codigo",
    "StatusObra",
    "TourVirtual",
    "Videos",
    "ValorIPTU"
  ]
}
```

### 📌 Sistema de descoberta de campos:

Implementamos chamada a `/imoveis/listarcampos` para:
1. Descobrir quais campos estão disponíveis na conta
2. Evitar erros 400 por campos inexistentes
3. Adaptar automaticamente aos campos da conta

**Código relevante:**
```typescript
// Descoberta de campos disponíveis
const camposResp = await this.client.get<any>('/imoveis/listarcampos');
const camposDisponiveis = new Set<string>(Object.keys(camposResp.data));

// Filtrar apenas campos disponíveis
const fieldsFiltrados = baseFields.filter(field => 
  camposDisponiveis.has(field)
);
```

---

## 📝 O QUE PRECISAMOS DO SUPORTE

### 1️⃣ **Status da Obra:**
- [ ] Nome exato do campo
- [ ] Valores possíveis
- [ ] Disponível em `/listar` e `/detalhes`?

### 2️⃣ **Tour Virtual:**
- [ ] Nome exato do campo
- [ ] Formato esperado (URL completa?)
- [ ] Como cadastrar no Vista para aparecer na API?

### 3️⃣ **Vídeos:**
- [ ] Nome exato do campo
- [ ] Formato (array de URLs?)
- [ ] Como cadastrar vídeos corretamente?

### 4️⃣ **Anexos/Documentos:**
- [ ] Endpoint ou campo para buscar anexos
- [ ] Estrutura de resposta
- [ ] Filtros disponíveis (ex: apenas PDFs públicos)

### 5️⃣ **IPTU:**
- [ ] Nome exato do campo na nossa conta
- [ ] Confirmar se está habilitado
- [ ] Como habilitar se não estiver

---

## 📸 EVIDÊNCIAS

### Imagem 1: Status da Obra (campo vazio)
> Campo "Status da Obra" aparece como dropdown mas não retorna na API

### Imagem 2: Tour Virtual (campo vazio)
> Campo "Tour Virtual" vazio no cadastro

### Imagem 3: Vídeos (nenhum cadastrado)
> Seção "Vídeos" mostra "Nenhum Vídeo foi cadastrado"

### Imagem 4: Anexos (PDF disponível)
> Anexo "APICE TOWERS - Catalogo.pdf" cadastrado mas não conseguimos acessar via API

---

## 🎯 OBJETIVO FINAL

Precisamos exibir no nosso site:

1. **Filtro por Status da Obra**
   - Permitir que usuários filtrem por "Lançamento", "Em Construção", "Pronto"
   
2. **Tour Virtual 360°**
   - Exibir iframe ou link para tour virtual nos detalhes do imóvel
   
3. **Galeria de Vídeos**
   - Player de vídeo (YouTube/Vimeo) na página do imóvel
   
4. **Downloads de Documentos**
   - Links para download de:
     - Catálogo do empreendimento
     - Plantas dos imóveis
     - Documentação técnica
   
5. **IPTU no Resumo Financeiro**
   - Exibir: Valor de Venda + Condomínio + **IPTU**

---

## 📞 CONTATO

**Nome:** [SEU NOME]  
**Empresa:** Pharos Imobiliária  
**Email:** [SEU EMAIL]  
**Telefone:** [SEU TELEFONE]  

**Urgência:** 🔴 **ALTA** - Campos essenciais para lançamento do site

---

## ✅ CHECKLIST PARA O SUPORTE

Por favor, nos responda:

- [ ] Status da Obra: Campo disponível? Nome exato?
- [ ] Tour Virtual: Campo disponível? Como configurar?
- [ ] Vídeos: Campo disponível? Formato esperado?
- [ ] Anexos: Endpoint/campo disponível para buscar PDFs?
- [ ] IPTU: Nome exato do campo na nossa conta?
- [ ] Documentação atualizada sobre estes campos
- [ ] Exemplos de requisições para cada campo

---

**Aguardamos retorno do suporte o mais breve possível.**

**Obrigado!** 🙏




