# Problema: Endpoint `/imoveis/detalhes` Indisponível

## Situação Atual

### ✅ Funcionando
- **Endpoint:** `/imoveis/listar`
- **Campos retornados:**
  - Codigo
  - Categoria (tipo do imóvel)
  - Endereco, Numero
  - Cidade, Bairro
  - CodigoImobiliaria

### ❌ NÃO Funcionando
- **Endpoint:** `/imoveis/detalhes`
- **Erro:** HTTP 400 - "O formato dos dados não está correto"
- **Tentativas realizadas:**
  1. `/imoveis/detalhes?key=XXX&imovel=PH1108`
  2. `/imoveis/detalhes?key=XXX&imovel=PH1108&pesquisa={}`
  3. Com headers Accept: application/json
  4. Todas retornam erro 400

### ❌ Campos Faltando
- Preço (ValorVenda, ValorLocacao)
- Quartos/Suítes/Banheiros/Vagas
- Áreas (AreaTotal, AreaPrivativa)
- Fotos (FotoDestaque, fotos[])
- Descrição completa
- Características (Mobiliado, AceitaPet, etc.)

---

## Hipóteses

### 1. Endpoint desabilitado para o plano atual
A conta Vista pode não ter acesso ao endpoint `/imoveis/detalhes`, apenas ao `/imoveis/listar`.

### 2. Documentação desatualizada
A API pode ter mudado e o endpoint de detalhes pode ter sido descontinuado ou alterado.

### 3. Formato de requisição incorreto
Pode haver um formato específico não documentado que não descobrimos ainda.

---

## Soluções Alternativas

### Opção A: Usar Apenas Listagem (Atual - Temporária)
**Implementação:**
- Aceitar dados parciais da listagem
- Usar placeholders para campos faltantes
- Cards mostram apenas informações básicas

**Prós:**
- ✅ Funciona imediatamente
- ✅ Sem erros técnicos

**Contras:**
- ❌ Cards sem preço = baixa conversão
- ❌ Sem fotos = UX ruim
- ❌ Impossível filtrar por preço/quartos

**Decisão:** **NÃO ACEITÁVEL** para produção.

---

### Opção B: Contatar Suporte Vista ⭐ RECOMENDADO
**Ação:**
1. Abrir chamado com Vista Software
2. Questões específicas:
   - O endpoint `/imoveis/detalhes` está disponível para nossa conta?
   - Qual é o formato correto da requisição?
   - Há endpoint alternativo para buscar dados completos?
   - Nossa conta permite retornar preços/fotos na listagem?

**Prazo estimado:** 1-3 dias úteis

**Próximos passos após resposta:**
- Se endpoint disponível: corrigir requisição
- Se indisponível: solicitar upgrade de plano
- Se houver endpoint alternativo: integrar

---

### Opção C: Dados Mockados Temporários
**Implementação:**
- Manter integração com Vista para dados básicos
- Criar camada de enriquecimento com dados mockados/fixos
- Adicionar preços e fotos manualmente para principais imóveis

**Prós:**
- ✅ UI/UX completo imediatamente
- ✅ Pode avançar com outras funcionalidades

**Contras:**
- ❌ Manutenção manual trabalhosa
- ❌ Dados desatualizados
- ❌ Não escala

**Decisão:** Apenas como **último recurso** ou para **demo/staging**.

---

### Opção D: Migrar para Outro Provider
**Implementação:**
- Implementar PharosProvider (CRM próprio)
- Manter Vista como fallback apenas

**Prós:**
- ✅ Controle total dos dados
- ✅ Endpoints customizados

**Contras:**
- ❌ Requer desenvolvimento do CRM
- ❌ Prazo mais longo (semanas)

**Decisão:** **Solução de médio prazo**, não resolve urgência atual.

---

## Plano de Ação Recomendado

### Curto Prazo (Hoje - 3 dias)

1. **[URGENTE] Contatar Suporte Vista**
   - Responsável: [Definir]
   - Prazo: Hoje
   - Objetivo: Esclarecer disponibilidade do `/imoveis/detalhes`

2. **Reverter Enriquecimento Automático**
   - Código: Desabilitar `enrichPropertiesWithDetails`
   - Motivo: Está causando lentidão e não retorna dados
   - Arquivo: `src/providers/vista/VistaProvider.ts`

3. **Implementar Dados Mockados Temporários (Staging)**
   - Para imóveis em destaque (homepage)
   - Apenas para testes e aprovação de UI/UX
   - Marcado claramente como "MOCK - Aguardando API"

### Médio Prazo (1 semana)

4. **Resolver Integração Vista**
   - Com resposta do suporte, corrigir endpoint
   - Testar dados completos
   - Validar qualidade

5. **Implementar Cache Agressivo**
   - Redis/Upstash para cache persistente
   - TTL de 1 hora para listagens
   - Background job para atualizar cache

### Longo Prazo (1 mês)

6. **Desenvolver CRM Pharos**
   - API própria com dados completos
   - Sincronização com Vista (se mantido)
   - Migration path definida

---

## Status Atual do Código

### ✅ Implementado e Funcionando
- [x] Sistema de cache em memória
- [x] Método `enrichPropertiesWithDetails`
- [x] Fallbacks inteligentes no PropertyMapper
- [x] Validação de placeholders
- [x] Endpoint de teste `/api/properties-detailed`

### ⚠️ Implementado mas NÃO Funcional
- [ ] Enriquecimento de dados (API retorna 400)
- [ ] Cache de detalhes (nenhum detalhe para cachear)
- [ ] Qualidade de dados completa (0% com preço/fotos)

### ⏸️ Pausado Aguardando Resolução
- [ ] Integração na homepage com dados completos
- [ ] Testes de qualidade de dados
- [ ] Documentação de performance (baseada em suposições)

---

## Decisão Necessária

**BLOQUEADOR:** Não podemos prosseguir com a integração completa sem resolver o acesso aos dados detalhados da Vista.

**Opções:**
1. ⭐ **Contatar Vista urgentemente** (Recomendado)
2. Usar dados mockados temporariamente
3. Pausar integração Vista e focar em CRM próprio

**Responsável pela decisão:** [Product Owner / Tech Lead]

**Prazo:** Hoje (15/10/2025)

---

**Documento criado em:** 15/10/2025  
**Última atualização:** 15/10/2025  
**Status:** 🔴 BLOQUEADO - Aguardando decisão

