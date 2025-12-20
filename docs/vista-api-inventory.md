# Catálogo da Integração Vista API (Inventário Atual)

Atualizado em: 23/10/2025

Fonte oficial de referência: [Vista API – Doc completa](https://www.vistasoft.com.br/api/)

Este documento consolida tudo o que a aplicação busca hoje na Vista API: endpoints usados, campos solicitados (`fields`), filtros suportados (`filter`/`advFilter`), ordenação (`order`), paginação e os mapeamentos UI ↔ Vista ↔ Domínio.

---

## 1) Endpoints em uso

- GET `/imoveis/listar` (listagem paginada)
  - Parâmetros:
    - `pesquisa={ fields, filter | advFilter, order, paginacao }`
    - `showtotal=1` (quando precisamos de totais)
- GET `/imoveis/detalhes` (dados completos por `Codigo`)
  - Parâmetros:
    - `pesquisa={ fields }`
    - `imovel=<Codigo>`
- GET `/imoveis/fotos` (galeria por `Codigo`)
  - Parâmetros:
    - `imovel=<Codigo>` (testamos como string e numérico)
- GET `/imoveis/listarcampos` (descoberta de campos da conta)

---

## 2) Campos (fields) requisitados hoje

### 2.1 Listagem (`/imoveis/listar`)

Usados para montar cards de listagem e permitir filtragem server-side segura.

```
Codigo, Categoria, TipoImovel, Finalidade, Status,
Endereco, Numero, Complemento, Bairro, Cidade, UF, CEP,
Latitude, Longitude,
ValorVenda, ValorLocacao, ValorCondominio,
Dormitorios, Suites, Vagas,
AreaTotal, AreaPrivativa, AreaTerreno,
FotoDestaque,
CorretorNome,
ExibirNoSite,
DataCadastro, DataAtualizacao,

// Características/Infra mais comuns (booleans)
Mobiliado, Churrasqueira, Lareira, Piscina, Academia, Elevador,
Sacada, Varanda, VistaMar, Sauna,
Quadra, SalaoFestas, Playground, Bicicletario,
Hidromassagem, ArCondicionado, Alarme, Interfone, CercaEletrica,
Jardim, Quintal,

// Flags de destaque/visibilidade (quando existirem na conta)
Exclusivo, Lancamento, ... (dinâmicos vindos de listarcampos)
```

Notas:
- Alguns campos “variações” (ex.: `ChurrasqueiraGas/Carvao`) nem sempre existem na conta. Para compatibilidade, usamos o campo genérico `Churrasqueira`.
- Campos adicionais detectados via `/imoveis/listarcampos` podem ser somados dinamicamente ao `fields`.

### 2.2 Detalhes (`/imoveis/detalhes`)

Conjuntos “full” e “basic” para maximizar compatibilidade e reduzir 400.

```
Codigo, Categoria, TipoImovel, Finalidade, Status,
Endereco, Numero, Complemento, Bairro, Cidade, UF, CEP,
Latitude, Longitude,
ValorVenda, ValorLocacao, ValorCondominio,
ValorIPTU | IPTU | (custom IPtu se existir),

AreaTotal, AreaPrivativa, AreaTerreno,
Dormitorios, Suites, Vagas,

// FOTOS (array correto do Vista)
{ 'Foto': ['Foto', 'FotoPequena', 'Destaque'] },
FotoDestaque,

// Texto/SEO
TituloSite, DescricaoWeb,

// Corretor (objeto)
{ 'Corretor': ['Nome'] },

// Grupos livres (características, infraestrutura) quando existentes
Caracteristicas, InfraEstrutura,

// Flags
ExibirNoSite, Exclusivo, Lancamento, ...(dinâmicos),

Empreendimento, DataCadastro, DataAtualizacao
```

### 2.3 Fotos (`/imoveis/fotos`)

Estrutura esperada:

```
fotos: [ { Foto, FotoPequena, Destaque, Ordem, Titulo, Descricao } ]
```

Fallbacks:
- Se array ausente, buscamos via `/imoveis/detalhes` (campo `Foto` → objeto/array) e `FotoDestaque`.

---

## 3) Filtros suportados

Implementados hoje através de `filter` (e `advFilter` quando necessário), conforme doc do Vista.

### 3.1 Localização
- `Cidade`: string ou array de strings
- `Bairro`: string ou array (também enviamos `BairroComercial` para compatibilidade)

### 3.2 Classificação
- `TipoImovel`: string ou array (apenas tipos realmente suportados pela conta)
- `Finalidade`: normalizado para `venda` | `aluguel`

### 3.3 Valores e áreas
- `ValorVenda`: `[min, max]` ou `['>=', n]`
- `ValorLocacao`: `[min, max]` (quando finalidade = aluguel)
- `AreaPrivativa`: `[min, max]`

### 3.4 Especificações (mínimo ou “exato” via advFilter)
- Mínimo:
  - `Dormitorios`: `['>=', n]`
  - `Suites`: `['>=', n]`
  - `Vagas`: `['>=', n]`
- Exato (UI multiseleção 1,2,3 e 4+):
  - `advFilter` com bloco `Or` unindo igualdades (1,2,3) e `['>=',4]` quando 4+ marcado.

### 3.5 Características
- Booleans com `'Sim'` quando a chave existe na conta (ex.: `Churrasqueira: 'Sim'`, `Mobiliado: 'Sim'`, `VistaMar: 'Sim'` etc.)
- Itens que não existem em todas as contas foram mapeados para equivalentes universais (ex.: variações de churrasqueira → `Churrasqueira`).

### 3.6 Status da obra
- Lançamento: `Lancamento: 'Sim'`
- Pronto: `Lancamento: 'Não'`
- Múltiplos status selecionados → não restringe

### 3.7 Distância do mar
- Não há campo nativo. Aplicamos pós-processamento com ranges: `frente-mar (≤50m)`, `quadra-mar (≤100m)`, `segunda-quadra (≤200m)`, `terceira-quadra (≤300m)`, `ate-500m`, `ate-1km`.

---

## 4) Ordenação e paginação

### 4.1 Ordenação (`order`)

```
order = {
  ValorVenda: 'asc' | 'desc',
  AreaPrivativa: 'asc' | 'desc',
  DataAtualizacao: 'asc' | 'desc',
  DataCadastro: 'asc' | 'desc'
}
```

Padrão atual: `DataAtualizacao: 'desc'`.

### 4.2 Paginação (`paginacao`)

```
paginacao = { pagina: <n>, quantidade: <até 50> }
showtotal=1
```

Quando precisamos de mais que 50, agregamos páginas até atingir o limite solicitado.

---

## 5) Mapeamentos principais (UI → Vista → Domínio)

### 5.1 Características do imóvel (UI → Vista)

```
'Churrasqueira a gás' → 'Churrasqueira'
'Churrasqueira a carvão' → 'Churrasqueira'
'Mobiliado' → 'Mobiliado'
'Vista para o Mar' | 'Vista Mar' → 'VistaMar'
'Sacada' → 'Sacada'
'Varanda' → 'Varanda'
'Ar Condicionado' → 'ArCondicionado'
'Piscina' → 'Piscina'
'Academia' → 'Academia'
'Sauna' → 'Sauna'
'Elevador' → 'Elevador'
'Quadra' → 'Quadra'
'Salão de Festas' → 'SalaoFestas'
'Playground' → 'Playground'
'Bicicletário' → 'Bicicletario'
'Hidromassagem' → 'Hidromassagem'
'Alarme' → 'Alarme'
'Interfone' → 'Interfone'
'Cerca Elétrica' → 'CercaEletrica'
'Jardim' → 'Jardim'
'Quintal' → 'Quintal'
```

Obs.: o mapa completo está em `src/mappers/normalizers/caracteristicas.ts`.

### 5.2 Bairros (slug → Vista)

```
'centro' → 'Centro'
'barra-sul' → 'Barra Sul'
'barra-norte' → 'Barra Norte'
'pioneiros' → 'Pioneiros'
'nacoes' | 'nações' → 'Nações'
'praia-brava' → 'Praia Brava'
'fazenda' → 'Fazenda'
'praia-dos-amores' → 'Praia dos Amores'
```

### 5.3 Tipos de imóvel (normalização)

Normalizamos `apartamento`, `cobertura`, `casa`, `terreno`, `comercial` etc. (apenas os suportados pela conta são enviados em `TipoImovel`).

### 5.4 Status da obra (UI → Vista)

```
Lançamento → Lancamento: 'Sim'
Pronto → Lancamento: 'Não'
```

---

## 6) Adaptação e pós-processamento

- Adaptação para UI (`utils/propertyAdapter.ts`): converte `Property` (domínio) para o tipo `Imovel` (UI), incluindo:
  - Conversão e saneamento de imagens
  - Extração de características para chips
  - Flags (exclusivo, superDestaque, etc.)
- Pós-filtro de distância do mar: aplicado com base em `distanciaMar` calculada por coordenadas.

---

## 7) Parâmetros aceitos na nossa API `/api/properties`

Query params atuais (principais):

```
city=<string> (multi)
neighborhood=<string> (multi | csv)
type=<string> (multi)
purpose=venda|aluguel
minPrice=<number>
maxPrice=<number>
minArea=<number>
maxArea=<number>

// Exato (1..3) e 4+
bedroomsExact=<1|2|3> (multi)
bedroomsFourPlus=1
suitesExact=<1|2|3> (multi)
suitesFourPlus=1
parkingExact=<1|2|3> (multi)
parkingFourPlus=1

// Características (booleans)
caracImovel=<label UI> (multi)
caracLocalizacao=<label UI> (multi)
caracEmpreendimento=<label UI> (multi)

// Outros
codigo=<string>
empreendimento=<string>
distanciaMar=<frente-mar|quadra-mar|segunda-quadra|terceira-quadra|ate-500m|ate-1km>

// Ordenação & Paginação
sortBy=price|area|updatedAt|createdAt
sortOrder=asc|desc
page=<n>
limit=<n (<=50)>
```

---

## 8) Boas práticas aplicadas (conforme doc)

- Sempre informar `fields` com todos os campos realmente utilizados.
- Evitar chaves inexistentes no `filter` (usamos mapeamentos conservadores).
- Usar `advFilter` somente quando precisamos de OR/AND combinados (exatos + 4+).
- Respeitar `quantidade <= 50` e, quando necessário, agregar páginas.
- Usar `showtotal=1` quando os totais/páginas são necessários.

---

## 9) Pontos de atenção e próximos passos

- “Em construção”: o nome do campo/flag varia entre contas. Se houver campo específico na sua conta, adicionamos no provider.
- Características específicas da conta: informar nomes exatos (como aparecem no Vista) para incluirmos no mapa de características.
- Bairros comerciais x residenciais: enviamos ambos quando aplicável; confirme qual é predominante na sua conta.

---

## 10) Changelog (resumo)

- Compatibilidade de “Churrasqueira a gás/carvão” → `Churrasqueira` (evita 500).
- Suporte a exato de dormitórios/suítes/vagas via `advFilter`.
- Normalização de cidades, bairros, tipos e status de obra.
- Remoção de filtros client-side duplicados.


