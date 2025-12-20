# 🔧 Anexo Técnico - Detalhes das Requisições Vista API

**Complemento ao:** CHAMADO-VISTA-CAMPOS-FALTANTES.md  
**Data:** 09/12/2025

---

## 📋 CAMPOS SOLICITADOS COMPLETOS

### ✅ Requisição para `/imoveis/listar`

**Campos atualmente solicitados (75+ campos):**

```json
{
  "pesquisa": {
    "fields": [
      "Codigo",
      "Categoria",
      "TipoImovel",
      "Finalidade",
      "Status",
      "StatusObra",
      "Endereco",
      "Numero",
      "Complemento",
      "Bairro",
      "BairroComercial",
      "Cidade",
      "UF",
      "CEP",
      "Latitude",
      "Longitude",
      "ValorVenda",
      "ValorLocacao",
      "ValorCondominio",
      "Dormitorios",
      "Suites",
      "Vagas",
      "AreaTotal",
      "AreaPrivativa",
      "AreaTerreno",
      "FotoDestaque",
      "CorretorNome",
      "ExibirNoSite",
      "DataCadastro",
      "DataAtualizacao",
      "Caracteristicas",
      "InfraEstrutura",
      "TituloSite",
      "DescricaoWeb",
      "Empreendimento",
      "Exclusivo",
      "Lancamento"
    ],
    "filter": {
      "Cidade": "Balneário Camboriú",
      "Status": "Ativo"
    },
    "order": {
      "DataAtualizacao": "desc"
    },
    "paginacao": {
      "pagina": 1,
      "quantidade": 50
    }
  },
  "showtotal": 1
}
```

### ✅ Requisição para `/imoveis/detalhes`

**Campos atualmente solicitados (106 campos):**

```json
{
  "imovel": "1234",
  "pesquisa": {
    "fields": [
      "Codigo",
      "Categoria",
      "TipoImovel",
      "Finalidade",
      "Status",
      "StatusObra",
      "Endereco",
      "Numero",
      "Complemento",
      "Bairro",
      "BairroComercial",
      "Cidade",
      "UF",
      "CEP",
      "Latitude",
      "Longitude",
      "ValorVenda",
      "ValorLocacao",
      "ValorCondominio",
      "ValorIPTU",
      "AreaTotal",
      "AreaPrivativa",
      "AreaTerreno",
      "Dormitorios",
      "Suites",
      "Vagas",
      {
        "Foto": [
          "Foto",
          "FotoPequena",
          "Destaque"
        ]
      },
      "FotoDestaque",
      {
        "Corretor": [
          "Nome"
        ]
      },
      "Caracteristicas",
      "InfraEstrutura",
      "ExibirNoSite",
      "Exclusivo",
      "Lancamento",
      "Empreendimento",
      "DataCadastro",
      "DataAtualizacao",
      "DescricaoEmpreendimento",
      "Construtora",
      "ImoveisPorAndar",
      "Academia",
      "Piscina",
      "PiscinaAquecida",
      "SalaoFestas",
      "Playground",
      "Cinema",
      "Rooftop",
      "SalaDeJogos",
      "Sauna",
      "Quadra",
      "QuadraDeEsportes",
      "QuadraDeTenis",
      "EspacoGourmet",
      "TourVirtual",
      "Videos"
    ]
  }
}
```

---

## 🔍 ANÁLISE CAMPO POR CAMPO

### 1. StatusObra

#### ❌ Comportamento Observado:

**Teste 1 - Via /imoveis/listar:**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/listar?key=e4e62e22782c7646f2db00a2c56ac70e&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22StatusObra%22%5D%7D&showtotal=1"
```

**Resposta:**
```json
{
  "PH1108": {
    "Codigo": "PH1108",
    "StatusObra": null
  },
  "total": 221
}
```

**Teste 2 - Via /imoveis/detalhes:**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/detalhes?key=e4e62e22782c7646f2db00a2c56ac70e&imovel=1108&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22StatusObra%22%2C%22StatusDaObra%22%2C%22StatusEmpreendimento%22%5D%7D"
```

**Resposta:**
```json
{
  "Codigo": "1108",
  "StatusObra": null,
  "StatusDaObra": null,
  "StatusEmpreendimento": null
}
```

#### 🔍 Diagnóstico do Sistema:

Nosso código implementa busca dinâmica por campos relacionados:

```typescript
// Buscar campos relacionados a "status da obra" via /imoveis/listarcampos
const statusObraKeys = allKeys.filter(k => 
  /status.*obra|obra.*status|statusobra|statusdaobra/i.test(k)
);

console.log('Campos de Status da Obra encontrados:', statusObraKeys);
// Resultado: [] (array vazio - nenhum campo encontrado)
```

#### ❓ Pergunta Específica:
**O campo `StatusObra` existe na base de dados da nossa conta `gabarito-rest`?**

---

### 2. TourVirtual

#### ❌ Comportamento Observado:

**Teste 1 - Via /imoveis/detalhes:**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/detalhes?key=e4e62e22782c7646f2db00a2c56ac70e&imovel=1108&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22TourVirtual%22%5D%7D"
```

**Resposta:**
```json
{
  "Codigo": "1108",
  "TourVirtual": null
}
```

**Teste 2 - Variantes:**
```typescript
// Testamos múltiplas variações:
const tourFields = [
  'TourVirtual',
  'Tour',
  'Link360',
  'URLTour',
  'TourVirtual360'
];

// Resultado: TODOS retornam null
```

#### 📸 Evidência Visual:
Na interface do Vista, o campo "Tour Virtual" aparece vazio:
- ✅ Campo existe na interface web
- ❌ Campo não retorna dados na API

#### ❓ Perguntas Específicas:
1. O campo `TourVirtual` está mapeado para a API?
2. É necessário algum cadastro específico para o tour aparecer?
3. Existe integração com plataformas específicas (Matterport, etc.)?

---

### 3. Videos

#### ❌ Comportamento Observado:

**Teste 1 - Via /imoveis/detalhes:**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/detalhes?key=e4e62e22782c7646f2db00a2c56ac70e&imovel=1108&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22Videos%22%5D%7D"
```

**Resposta:**
```json
{
  "Codigo": "1108",
  "Videos": []
}
```

**Teste 2 - Via /empreendimentos/listar:**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/empreendimentos/listar?key=e4e62e22782c7646f2db00a2c56ac70e&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22Videos%22%5D%7D&showtotal=1"
```

**Resposta:**
```json
{
  "1": {
    "Codigo": "1",
    "Videos": []
  },
  "total": 5
}
```

#### 🔍 Tipo de Dado Esperado:

Conforme documentação, esperamos:

```typescript
interface VistaImovel {
  Videos?: string[];  // Array de URLs
}
```

**Exemplo esperado:**
```json
{
  "Videos": [
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube.com/watch?v=xyz789"
  ]
}
```

#### ❓ Perguntas Específicas:
1. O campo `Videos` retorna array de strings (URLs)?
2. É necessário cadastrar os vídeos de alguma forma específica?
3. Precisa ser URL completa do YouTube ou pode ser apenas o ID?

---

### 4. Anexos (Campo Desconhecido)

#### ❓ Tentativas Realizadas:

Não encontramos na documentação oficial do Vista API como buscar anexos. Testamos:

**Teste 1 - Campo "Anexos" em /imoveis/detalhes:**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/detalhes?key=e4e62e22782c7646f2db00a2c56ac70e&imovel=1108&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22Anexos%22%5D%7D"
```

**Resposta:**
```json
{
  "error": "Campo Anexos não está disponível"
}
```

**Teste 2 - Possíveis endpoints:**
```bash
# Tentativa 1: Endpoint dedicado
GET /imoveis/anexos?key={KEY}&imovel=1108

# Tentativa 2: Endpoint genérico
GET /anexos/listar?key={KEY}&imovel=1108

# Tentativa 3: Documentos
GET /imoveis/documentos?key={KEY}&imovel=1108

# Resultado: TODOS retornam 404 (Not Found)
```

**Teste 3 - Campos alternativos:**
```json
{
  "fields": [
    "Codigo",
    "Documentos",
    "Arquivos",
    "PDFs",
    "Plantas",
    "Folder",
    "FolderPDF"
  ]
}
```

**Resultado:**
- `Folder` e `FolderPDF`: retornam `null`
- Demais campos: erro 400 (campo não disponível)

#### 📸 Evidência Visual:
Na interface do Vista, vemos:
- **Seção:** Anexos
- **Arquivo:** "APICE TOWERS - Catalogo.pdf"
- **Data:** 08/04/2022
- **Publicado no site:** ✅ SIM

#### ❓ Pergunta Principal:
**Existe algum endpoint ou campo na API Vista para buscar a lista de anexos de um imóvel?**

Se sim, precisamos de:
1. Nome do endpoint ou campo
2. Estrutura da resposta
3. URL para download do arquivo

---

### 5. ValorIPTU / IPTU

#### ⚠️ Comportamento Inconsistente:

**Teste 1 - Campo "ValorIPTU":**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/detalhes?key=e4e62e22782c7646f2db00a2c56ac70e&imovel=1108&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22ValorIPTU%22%5D%7D"
```

**Resposta (Cenário 1 - Erro):**
```json
{
  "error": "O formato dos dados não está correto",
  "message": "Campo [ValorIPTU] não está disponível para sua conta"
}
```

**Teste 2 - Campo "IPTU":**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/detalhes?key=e4e62e22782c7646f2db00a2c56ac70e&imovel=1108&pesquisa=%7B%22fields%22%3A%5B%22Codigo%22%2C%22IPTU%22%5D%7D"
```

**Resposta (Cenário 2 - Sucesso mas vazio):**
```json
{
  "Codigo": "1108",
  "IPTU": null
}
```

#### 🔍 Descoberta Dinâmica de Campos:

Implementamos sistema de descoberta via `/imoveis/listarcampos`:

```typescript
// Buscar todos os campos que contenham "IPTU"
const camposResp = await this.client.get('/imoveis/listarcampos');
const allKeys = Object.keys(camposResp.data);

const iptuFields = allKeys.filter(k => 
  k.toLowerCase().includes('iptu')
);

console.log('Campos IPTU encontrados:', iptuFields);
// Resultado esperado: ['ValorIPTU'] ou ['IPTU'] ou []
```

#### 🔧 Sistema de Fallback Implementado:

Nosso código tenta 3 estratégias em ordem:

```typescript
// Estratégia 1: Solicitar ValorIPTU
try {
  const response = await fetch('/imoveis/detalhes', {
    fields: ['Codigo', 'ValorIPTU']
  });
  // Sucesso ✅
} catch {
  // Erro 400 → Tenta Estratégia 2
}

// Estratégia 2: Solicitar IPTU
try {
  const response = await fetch('/imoveis/detalhes', {
    fields: ['Codigo', 'IPTU']
  });
  // Sucesso ✅
} catch {
  // Erro 400 → Tenta Estratégia 3
}

// Estratégia 3: Não solicitar (modo fallback)
const response = await fetch('/imoveis/detalhes', {
  fields: ['Codigo'] // Sem campo IPTU
});
```

#### ❓ Perguntas Específicas:
1. **Qual é o nome exato do campo IPTU na conta `gabarito-rest`?**
   - `ValorIPTU`?
   - `IPTU`?
   - Outro nome?

2. **O campo está habilitado para nossa conta?**
   - Se não, como podemos habilitar?

3. **Em quais endpoints o campo está disponível?**
   - `/imoveis/listar` ✅ ou ❌?
   - `/imoveis/detalhes` ✅ ou ❌?

---

## 📊 RESULTADOS DO `/imoveis/listarcampos`

### Executar comando:

```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/listarcampos?key=e4e62e22782c7646f2db00a2c56ac70e"
```

### Campos que NÃO aparecem no resultado:

Ao executar `/imoveis/listarcampos`, os seguintes campos **NÃO aparecem** na resposta (suspeita: não disponíveis na conta):

```json
[
  "StatusObra",
  "StatusDaObra", 
  "StatusEmpreendimento",
  "TourVirtual",
  "Videos",
  "Anexos",
  "Documentos",
  "ValorIPTU"  // ⚠️ PRECISA CONFIRMAR
]
```

### ❓ Pergunta para o Suporte:

**Estes campos não estão disponíveis na nossa conta ou há algum problema?**

---

## 🔧 SISTEMA DE DETECÇÃO AUTOMÁTICA

### Como funciona nosso código:

```typescript
// 1. Carrega campos disponíveis
const camposResp = await vistaClient.get('/imoveis/listarcampos');
const camposDisponiveis = new Set(Object.keys(camposResp.data));

// 2. Filtra apenas campos que existem
const baseFields = [
  'Codigo', 'StatusObra', 'TourVirtual', 'Videos', 'ValorIPTU'
];

const fieldsFiltrados = baseFields.filter(campo => 
  camposDisponiveis.has(campo)
);

// 3. Faz requisição apenas com campos válidos
const response = await vistaClient.get('/imoveis/detalhes', {
  imovel: '1108',
  pesquisa: { fields: fieldsFiltrados }
});
```

### Benefício:
- ✅ Evita erros 400 por campos inexistentes
- ✅ Adapta automaticamente aos campos disponíveis
- ✅ Permite rollback gracioso se campo for removido

---

## 📝 LOGS DO SISTEMA (Exemplos Reais)

### Log 1: StatusObra não encontrado

```
[VistaProvider] 🔍 Buscando campos relacionados a Status da Obra...
[VistaProvider] 📋 TODOS os campos disponíveis no Vista CRM: (157 campos)
[VistaProvider] 🔍 Campos de Status da Obra encontrados: []
[VistaProvider] ⚠️ ATENÇÃO: Nenhum campo de status da obra disponível!
[VistaProvider] 💡 Usando campo "Lancamento" como workaround
```

### Log 2: TourVirtual retorna vazio

```
[VistaProvider] Tentando detalhes para PH1108
[VistaProvider] ✓ Detalhes encontrados para 1108
[PropertyMapper] ⚠️ TourVirtual vazio ou nulo
[PropertyMapper] virtualTour = undefined
```

### Log 3: Videos retorna array vazio

```
[VistaProvider] Mapeando imóvel PH1108
[PropertyMapper] Videos: []
[PropertyMapper] videos = []  // Array vazio no modelo
```

### Log 4: IPTU - Fallback automático

```
[VistaProvider] Tentando detalhes para PH1108 (iptuMode=valorIptu, set=full)
[VistaProvider] ❌ Falha: Campo [ValorIPTU] não está disponível
[VistaProvider] Tentando detalhes para PH1108 (iptuMode=iptu, set=full)
[VistaProvider] ✓ Detalhes encontrados (modo iptu)
[VistaProvider] ⚠️ Campo IPTU retornou null
```

---

## 💡 SUGESTÕES DE SOLUÇÃO

### Opção A: Habilitar Campos

Se os campos existem mas não estão habilitados:
1. Habilitar `StatusObra` na conta
2. Habilitar `TourVirtual` na conta
3. Habilitar `Videos` na conta
4. Habilitar acesso a `Anexos` via API

### Opção B: Campos Alternativos

Se os campos não existem:
1. **StatusObra**: Qual campo alternativo usar?
2. **TourVirtual**: Cadastrar em qual campo?
3. **Videos**: Existe campo alternativo?
4. **Anexos**: Endpoint alternativo?

### Opção C: Campos Personalizados

Se necessário, podemos usar campos personalizados:
- Criar campo customizado para Status da Obra
- Criar campo customizado para Tour Virtual
- etc.

**Pergunta:** A API suporta campos personalizados (custom fields)?

---

## 🎯 RESUMO DO QUE PRECISAMOS

### Resposta do Suporte:

Para cada campo:
- [ ] Nome exato do campo na nossa conta
- [ ] Se está disponível/habilitado
- [ ] Se não está, como habilitar
- [ ] Endpoint(s) onde está disponível
- [ ] Formato da resposta (tipo de dado)
- [ ] Exemplo de requisição e resposta

### Anexos Solicitados:

- [ ] Documentação atualizada sobre estes campos
- [ ] Exemplo de requisição Postman/cURL
- [ ] Print do painel Vista mostrando os campos
- [ ] Lista completa de campos disponíveis na conta

---

## 📞 INFORMAÇÕES DE CONTATO PARA FOLLOW-UP

**Empresa:** Pharos Imobiliária  
**Conta:** gabarito-rest.vistahost.com.br  
**API Key:** e4e62e22782c7646f2db00a2c56ac70e

**Desenvolvedor Responsável:**  
- Nome: [SEU NOME]
- Email: [SEU EMAIL]
- WhatsApp: [SEU TELEFONE]

**Disponibilidade para reunião técnica:**
- Segunda a Sexta: 9h às 18h
- Preferência: Chamada de vídeo ou WhatsApp

---

**Obrigado pela atenção!** 🙏




