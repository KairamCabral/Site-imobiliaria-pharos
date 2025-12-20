# 🎯 Vista API - Status dos Campos por Categoria

**Conta:** gabarito-rest.vistahost.com.br  
**Última Verificação:** 09/12/2025

---

## 📊 LEGENDA

- ✅ **Funcionando** - Campo retorna dados corretamente
- ⚠️ **Parcial** - Campo retorna mas com limitações ou dados vazios
- ❌ **Não Funciona** - Campo retorna null, vazio ou erro 400
- ❓ **Desconhecido** - Não encontramos como acessar

---

## 🏠 DADOS BÁSICOS DO IMÓVEL

| Campo | Status | Observação |
|-------|--------|------------|
| `Codigo` | ✅ | Retorna corretamente |
| `TipoImovel` | ✅ | Retorna corretamente |
| `Categoria` | ✅ | Retorna corretamente |
| `Finalidade` | ✅ | Venda/Aluguel - OK |
| `Status` | ✅ | Disponível/Vendido - OK |
| `Titulo` / `TituloSite` | ✅ | Retorna corretamente |
| `Descricao` / `DescricaoWeb` | ✅ | Retorna corretamente |

**Resumo:** ✅ 100% funcionando

---

## 📍 LOCALIZAÇÃO

| Campo | Status | Observação |
|-------|--------|------------|
| `Endereco` | ✅ | Retorna corretamente |
| `Numero` | ✅ | Retorna corretamente |
| `Complemento` | ✅ | Retorna corretamente |
| `Bairro` | ✅ | Retorna corretamente |
| `BairroComercial` | ✅ | Retorna corretamente |
| `Cidade` | ✅ | Retorna corretamente |
| `UF` / `Estado` | ✅ | Retorna corretamente |
| `CEP` | ✅ | Retorna corretamente |
| `Latitude` | ✅ | Retorna corretamente |
| `Longitude` | ✅ | Retorna corretamente |

**Resumo:** ✅ 100% funcionando

---

## 💰 VALORES

| Campo | Status | Observação |
|-------|--------|------------|
| `ValorVenda` | ✅ | Retorna corretamente |
| `ValorLocacao` | ✅ | Retorna corretamente |
| `ValorCondominio` | ✅ | Retorna corretamente |
| `ValorIPTU` | ❌ | **NÃO RETORNA** ou erro 400 |
| `IPTU` | ⚠️ | Retorna `null` |

**Resumo:** ⚠️ 75% funcionando (IPTU com problema)

**🔴 PROBLEMA:** Não conseguimos obter o valor do IPTU

---

## 📐 ESPECIFICAÇÕES

| Campo | Status | Observação |
|-------|--------|------------|
| `Dormitorios` | ✅ | Retorna corretamente |
| `Suites` | ✅ | Retorna corretamente |
| `Banheiros` | ✅ | Retorna corretamente |
| `Vagas` | ✅ | Retorna corretamente |
| `AreaTotal` | ✅ | Retorna corretamente |
| `AreaPrivativa` | ✅ | Retorna corretamente |
| `AreaTerreno` | ✅ | Retorna corretamente |
| `Andar` | ✅ | Retorna corretamente |
| `TotalAndares` | ✅ | Retorna corretamente |

**Resumo:** ✅ 100% funcionando

---

## 🏢 EMPREENDIMENTO

| Campo | Status | Observação |
|-------|--------|------------|
| `Empreendimento` | ✅ | Nome do empreendimento - OK |
| `NomeEmpreendimento` | ✅ | Variante - OK |
| `Condominio` | ✅ | Nome do condomínio - OK |
| `NomeCondominio` | ✅ | Variante - OK |
| `DescricaoEmpreendimento` | ✅ | Retorna corretamente |
| `Construtora` | ✅ | Retorna corretamente |
| `StatusObra` | ❌ | **NÃO RETORNA** - sempre `null` |

**Resumo:** ⚠️ 86% funcionando (StatusObra com problema)

**🔴 PROBLEMA:** Campo `StatusObra` retorna sempre `null`

---

## 📸 MÍDIA

| Campo/Endpoint | Status | Observação |
|----------------|--------|------------|
| `FotoDestaque` | ✅ | Foto principal - OK |
| `Foto` (array) | ✅ | Galeria de fotos - OK |
| `/imoveis/fotos` | ✅ | Endpoint funcionando |
| `Videos` | ❌ | **RETORNA ARRAY VAZIO** `[]` |
| `TourVirtual` | ❌ | **NÃO RETORNA** - sempre `null` |

**Resumo:** ⚠️ 60% funcionando (Vídeos e Tour com problema)

**🔴 PROBLEMAS:**
1. Campo `Videos` retorna sempre array vazio
2. Campo `TourVirtual` retorna sempre `null`

---

## 📎 ANEXOS / DOCUMENTOS

| Campo/Endpoint | Status | Observação |
|----------------|--------|------------|
| `Anexos` | ❌ | Erro 400 (campo não existe?) |
| `Documentos` | ❌ | Erro 400 (campo não existe?) |
| `Folder` | ⚠️ | Retorna `null` |
| `FolderPDF` | ⚠️ | Retorna `null` |
| `/imoveis/anexos` | ❓ | Endpoint não encontrado (404) |
| `/documentos/listar` | ❓ | Endpoint não encontrado (404) |

**Resumo:** ❌ 0% funcionando

**🔴 PROBLEMA CRÍTICO:** Não encontramos forma de acessar os anexos via API

**Impacto:**
- Não conseguimos disponibilizar catálogos para download
- Não conseguimos exibir plantas dos imóveis
- Não conseguimos mostrar documentação técnica

---

## ✨ CARACTERÍSTICAS

| Campo | Status | Observação |
|-------|--------|------------|
| `Caracteristicas` | ✅ | Retorna objeto com características |
| `InfraEstrutura` | ✅ | Retorna array de infraestrutura |
| `Mobiliado` | ✅ | Sim/Não - OK |
| `AceitaPet` | ✅ | Sim/Não - OK |
| `Acessibilidade` | ✅ | Sim/Não - OK |
| `Piscina` | ✅ | Sim/Não - OK |
| `Academia` | ✅ | Sim/Não - OK |
| `Playground` | ✅ | Sim/Não - OK |

**Resumo:** ✅ 100% funcionando

---

## 👤 CORRETOR

| Campo | Status | Observação |
|-------|--------|------------|
| `Corretor.Nome` | ✅ | Nome do corretor - OK |
| `Corretor.Email` | ✅ | Email - OK |
| `Corretor.Telefone` | ✅ | Telefone - OK |
| `Corretor.Celular` | ✅ | Celular - OK |
| `Corretor.Creci` | ✅ | CRECI - OK |
| `Corretor.Foto` | ⚠️ | Às vezes vazio |
| `CorretorNome` | ✅ | Fallback simples - OK |

**Resumo:** ✅ 95% funcionando

---

## 🏢 AGÊNCIA

| Campo | Status | Observação |
|-------|--------|------------|
| `Agencia.Nome` | ✅ | Nome da agência - OK |
| `Agencia.Email` | ✅ | Email - OK |
| `Agencia.Telefone` | ✅ | Telefone - OK |
| `Agencia.Endereco` | ✅ | Endereço - OK |
| `Agencia.Cidade` | ✅ | Cidade - OK |
| `Agencia.Logo` | ⚠️ | Às vezes vazio |

**Resumo:** ✅ 95% funcionando

---

## 🚩 FLAGS E DESTAQUES

| Campo | Status | Observação |
|-------|--------|------------|
| `Destaque` | ✅ | Sim/Não - OK |
| `SuperDestaque` | ✅ | Sim/Não - OK |
| `Exclusivo` | ✅ | Sim/Não - OK |
| `Lancamento` | ✅ | Sim/Não - OK |
| `ExibirNoSite` | ✅ | Sim/Não - OK |

**Resumo:** ✅ 100% funcionando

---

## 📅 DATAS

| Campo | Status | Observação |
|-------|--------|------------|
| `DataCadastro` | ✅ | Data de cadastro - OK |
| `DataAtualizacao` | ✅ | Última atualização - OK |
| `DataHoraAtualizacao` | ✅ | Com hora - OK |

**Resumo:** ✅ 100% funcionando

---

## 📊 RESUMO GERAL POR CATEGORIA

| Categoria | Funcionando | Parcial | Não Funciona |
|-----------|-------------|---------|--------------|
| 🏠 Dados Básicos | ✅ 100% | - | - |
| 📍 Localização | ✅ 100% | - | - |
| 💰 Valores | ⚠️ 75% | IPTU | - |
| 📐 Especificações | ✅ 100% | - | - |
| 🏢 Empreendimento | ⚠️ 86% | - | StatusObra |
| 📸 Mídia | ⚠️ 60% | - | Videos, TourVirtual |
| 📎 Anexos | ❌ 0% | - | Todos |
| ✨ Características | ✅ 100% | - | - |
| 👤 Corretor | ✅ 95% | Foto | - |
| 🏢 Agência | ✅ 95% | Logo | - |
| 🚩 Flags | ✅ 100% | - | - |
| 📅 Datas | ✅ 100% | - | - |

---

## 🔴 CAMPOS CRÍTICOS COM PROBLEMAS

### 1. StatusObra (🏢 Empreendimento)
- **Impacto:** 🔴 **ALTO**
- **Problema:** Campo sempre retorna `null`
- **Uso:** Filtro "Lançamento / Em Construção / Pronto"
- **Workaround:** Usando campo `Lancamento` (limitado)

### 2. TourVirtual (📸 Mídia)
- **Impacto:** 🟡 **MÉDIO**
- **Problema:** Campo sempre retorna `null`
- **Uso:** Exibir tour 360° na página do imóvel
- **Workaround:** Nenhum (funcionalidade indisponível)

### 3. Videos (📸 Mídia)
- **Impacto:** 🟡 **MÉDIO**
- **Problema:** Campo sempre retorna array vazio `[]`
- **Uso:** Galeria de vídeos na página do imóvel
- **Workaround:** Nenhum (funcionalidade indisponível)

### 4. Anexos (📎 Documentos)
- **Impacto:** 🔴 **ALTO**
- **Problema:** Não encontramos como acessar via API
- **Uso:** Download de catálogos, plantas, documentos
- **Workaround:** Nenhum (funcionalidade indisponível)

### 5. ValorIPTU (💰 Valores)
- **Impacto:** 🟡 **MÉDIO**
- **Problema:** Campo não disponível ou sempre `null`
- **Uso:** Exibir custo total mensal (Condomínio + IPTU)
- **Workaround:** Exibir apenas condomínio

---

## 📈 SCORE GERAL DA INTEGRAÇÃO

### ✅ Funcionalidades Implementadas: 85%

**Funcionando perfeitamente:**
- ✅ Listagem de imóveis
- ✅ Detalhes completos
- ✅ Filtros avançados
- ✅ Galeria de fotos
- ✅ Dados do corretor
- ✅ Características do imóvel
- ✅ Infraestrutura do condomínio
- ✅ Envio de leads

**Com problemas:**
- ⚠️ Status da obra (workaround implementado)
- ⚠️ IPTU (não disponível)

**Não disponível:**
- ❌ Tour Virtual 360°
- ❌ Galeria de vídeos
- ❌ Download de anexos/documentos

---

## 🎯 PRIORIDADE DE CORREÇÃO

### 🔴 Prioridade ALTA (Essencial para lançamento)
1. **StatusObra** - Filtro de busca essencial
2. **Anexos** - Catálogos e plantas são muito solicitados

### 🟡 Prioridade MÉDIA (Desejável)
3. **TourVirtual** - Diferencial competitivo
4. **Videos** - Conteúdo rico para o usuário
5. **ValorIPTU** - Informação financeira importante

### 🟢 Prioridade BAIXA (Nice to have)
- Fotos de corretores
- Logos de agências

---

## 📞 AÇÃO NECESSÁRIA

**Chamado aberto com o Vista CRM para:**

1. ✅ Confirmar nome exato dos campos
2. ✅ Verificar disponibilidade na conta
3. ✅ Habilitar campos se necessário
4. ✅ Documentar endpoints faltantes (anexos)
5. ✅ Exemplos de uso correto

**Documentos de suporte:**
- `CHAMADO-VISTA-CAMPOS-FALTANTES.md` - Descrição completa do problema
- `CHAMADO-VISTA-DETALHES-TECNICOS.md` - Logs, código, requisições
- `CHAMADO-VISTA-RESUMO-EXECUTIVO.md` - Resumo para copiar/colar

---

**Última Atualização:** 09/12/2025  
**Status do Chamado:** 🟡 Aguardando resposta do Vista




