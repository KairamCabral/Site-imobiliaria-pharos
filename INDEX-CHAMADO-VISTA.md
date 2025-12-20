# 📚 Índice - Chamado Vista CRM: Campos Faltantes

**Data de Criação:** 09/12/2025  
**Status:** 📝 Documentos prontos para envio ao suporte Vista

---

## 🎯 OBJETIVO

Documentação completa para abrir chamado no suporte do Vista CRM sobre campos que não estão retornando dados via API.

---

## 📁 DOCUMENTOS CRIADOS

### 1️⃣ **CHAMADO-VISTA-RESUMO-EXECUTIVO.md** 
**📋 Para:** Copiar/Colar no ticket de suporte  
**📄 Tipo:** Resumo executivo  
**⏱️ Leitura:** 5 minutos

**Conteúdo:**
- ✅ Resumo dos 5 campos com problema
- ✅ Exemplos de requisição/resposta
- ✅ Perguntas específicas para o suporte
- ✅ Informações de contato

**👉 USE ESTE para abrir o chamado inicial**

---

### 2️⃣ **CHAMADO-VISTA-CAMPOS-FALTANTES.md**
**📋 Para:** Descrição detalhada do problema  
**📄 Tipo:** Documentação completa  
**⏱️ Leitura:** 15 minutos

**Conteúdo:**
- ✅ Descrição completa de cada problema
- ✅ Endpoints utilizados
- ✅ Evidências visuais (referências às imagens)
- ✅ Valores esperados vs. retornados
- ✅ Impacto no negócio
- ✅ Checklist para o suporte

**👉 ANEXE ESTE ao chamado como documentação de suporte**

---

### 3️⃣ **CHAMADO-VISTA-DETALHES-TECNICOS.md**
**📋 Para:** Informações técnicas avançadas  
**📄 Tipo:** Anexo técnico  
**⏱️ Leitura:** 20 minutos

**Conteúdo:**
- ✅ Campos completos solicitados (JSON)
- ✅ Exemplos de cURL
- ✅ Logs do sistema
- ✅ Código TypeScript relevante
- ✅ Sistema de descoberta de campos
- ✅ Estratégias de fallback implementadas

**👉 ANEXE ESTE se o suporte pedir detalhes técnicos**

---

### 4️⃣ **VISTA-API-STATUS-CAMPOS.md**
**📋 Para:** Visão geral do status da integração  
**📄 Tipo:** Dashboard visual  
**⏱️ Leitura:** 10 minutos

**Conteúdo:**
- ✅ Status de TODOS os campos (✅⚠️❌)
- ✅ Tabelas por categoria
- ✅ Score geral da integração (85%)
- ✅ Priorização dos problemas (Alta/Média/Baixa)
- ✅ Resumo visual do que funciona e o que não funciona

**👉 USE ESTE para apresentação visual e relatórios internos**

---

### 5️⃣ **test-vista-campos-faltantes.ps1**
**📋 Para:** Testar os campos diretamente  
**📄 Tipo:** Script PowerShell  
**⏱️ Execução:** 2-3 minutos

**Conteúdo:**
- ✅ Testes automatizados dos 5 campos problemáticos
- ✅ Descoberta de campos via `/imoveis/listarcampos`
- ✅ Resultados coloridos no terminal
- ✅ Logs detalhados de cada requisição

**👉 EXECUTE ESTE antes de enviar o chamado para confirmar os problemas**

---

## 🚀 FLUXO DE USO RECOMENDADO

### 📝 PASSO 1: Preparação (5 minutos)

1. ✅ Execute o script de teste:
   ```powershell
   .\test-vista-campos-faltantes.ps1
   ```

2. ✅ Anote os resultados (quais campos retornaram NULL/vazio)

3. ✅ Tire prints da interface do Vista mostrando:
   - Campo "Status da Obra" com dropdown
   - Campo "Tour Virtual" vazio
   - Seção "Vídeos" vazia
   - Seção "Anexos" com PDF cadastrado

---

### 📧 PASSO 2: Abrir Chamado (10 minutos)

1. ✅ Acesse o suporte do Vista CRM

2. ✅ Copie o conteúdo de **CHAMADO-VISTA-RESUMO-EXECUTIVO.md**

3. ✅ Cole no ticket de suporte

4. ✅ Ajuste as informações de contato:
   - Nome
   - Email
   - Telefone

5. ✅ Anexe os prints da interface Vista

6. ✅ Envie o chamado

---

### 📎 PASSO 3: Complementação (opcional)

**Se o suporte solicitar mais detalhes:**

1. ✅ Envie **CHAMADO-VISTA-CAMPOS-FALTANTES.md**  
   _(Descrição completa do problema)_

2. ✅ Envie **CHAMADO-VISTA-DETALHES-TECNICOS.md**  
   _(Logs, código, requisições cURL)_

3. ✅ Envie **VISTA-API-STATUS-CAMPOS.md**  
   _(Status geral da integração)_

---

### 📞 PASSO 4: Follow-up

**Quando o suporte responder:**

1. ✅ Se informarem o nome correto dos campos:
   - Execute o script novamente testando os novos nomes
   - Atualize o código do VistaProvider

2. ✅ Se precisarem habilitar campos:
   - Aguarde a habilitação
   - Teste novamente com o script

3. ✅ Se os campos não existirem:
   - Solicite alternativas
   - Pergunte sobre campos personalizados

---

## 📊 RESUMO DOS PROBLEMAS

### 🔴 Prioridade ALTA

| Campo | Problema | Impacto |
|-------|----------|---------|
| **StatusObra** | Sempre retorna `null` | ❌ Filtro de busca essencial não funciona |
| **Anexos** | Não encontramos endpoint | ❌ Catálogos/plantas indisponíveis |

### 🟡 Prioridade MÉDIA

| Campo | Problema | Impacto |
|-------|----------|---------|
| **TourVirtual** | Sempre retorna `null` | ⚠️ Tour 360° não disponível |
| **Videos** | Retorna array vazio `[]` | ⚠️ Galeria de vídeos indisponível |
| **ValorIPTU** | Inconsistente (erro 400 ou `null`) | ⚠️ Custo total incompleto |

---

## 🔍 PERGUNTAS-CHAVE PARA O SUPORTE

### 1. StatusObra
- ❓ Nome exato do campo na conta `gabarito-rest`?
- ❓ Campo está habilitado?
- ❓ Valores possíveis (Lançamento, Em Construção, Pronto)?

### 2. TourVirtual
- ❓ Nome exato do campo?
- ❓ Como cadastrar no Vista para aparecer na API?
- ❓ Formato esperado (URL completa)?

### 3. Videos
- ❓ Nome exato do campo?
- ❓ Formato (array de URLs)?
- ❓ Como cadastrar vídeos corretamente?

### 4. Anexos
- ❓ **Existe endpoint ou campo para buscar anexos?**
- ❓ Se sim, qual é o endpoint/campo?
- ❓ Estrutura da resposta esperada?

### 5. ValorIPTU
- ❓ Nome exato na nossa conta (`ValorIPTU` ou `IPTU`)?
- ❓ Campo está habilitado?
- ❓ Disponível em `/listar` ou só em `/detalhes`?

---

## 📧 TEMPLATE DE EMAIL

```
Assunto: Campos não retornando dados - API Vista (Pharos Imobiliária)

Olá, equipe Vista!

Estamos integrando nosso site com a API Vista CRM e identificamos campos 
essenciais que não estão retornando dados.

Segue documentação completa em anexo. Principais problemas:

1. StatusObra - Retorna sempre null
2. TourVirtual - Retorna sempre null  
3. Videos - Retorna array vazio
4. Anexos - Não encontramos endpoint
5. ValorIPTU - Erro 400 ou null

Conta: gabarito-rest.vistahost.com.br
Urgência: ALTA (bloqueando lançamento do site)

Documentos anexos:
- CHAMADO-VISTA-RESUMO-EXECUTIVO.md
- Prints da interface Vista

Aguardo retorno.

[SEU NOME]
Pharos Imobiliária
[SEU EMAIL] | [SEU TELEFONE]
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
📂 Documentação Chamado Vista/
├─ 📄 INDEX-CHAMADO-VISTA.md                    (você está aqui)
├─ 📄 CHAMADO-VISTA-RESUMO-EXECUTIVO.md         (copiar/colar)
├─ 📄 CHAMADO-VISTA-CAMPOS-FALTANTES.md         (anexo descritivo)
├─ 📄 CHAMADO-VISTA-DETALHES-TECNICOS.md        (anexo técnico)
├─ 📄 VISTA-API-STATUS-CAMPOS.md                (status geral)
├─ 📄 test-vista-campos-faltantes.ps1           (script de teste)
└─ 📂 prints/                                    (criar e adicionar prints)
   ├─ 🖼️ status-obra-dropdown.png
   ├─ 🖼️ tour-virtual-vazio.png
   ├─ 🖼️ videos-vazio.png
   └─ 🖼️ anexos-pdf-cadastrado.png
```

---

## ✅ CHECKLIST DE ENVIO

### Antes de enviar:

- [ ] Executei o script de teste (`test-vista-campos-faltantes.ps1`)
- [ ] Anotei quais campos retornaram NULL/vazio
- [ ] Tirei prints da interface do Vista
- [ ] Revisei o documento **RESUMO-EXECUTIVO.md**
- [ ] Atualizei informações de contato (nome, email, telefone)
- [ ] Preparei os anexos (prints + documentos)

### Ao enviar:

- [ ] Abri ticket no suporte Vista
- [ ] Colei o conteúdo do **RESUMO-EXECUTIVO.md**
- [ ] Anexei prints da interface
- [ ] Marquei como urgência ALTA
- [ ] Solicitei reunião técnica se necessário

### Pós-envio:

- [ ] Salvei número do chamado
- [ ] Agendei follow-up (2 dias úteis)
- [ ] Informei o time sobre o bloqueio

---

## 🎯 RESULTADO ESPERADO

**Após resolução do chamado, teremos:**

1. ✅ Nome exato dos campos (ou confirmação de indisponibilidade)
2. ✅ Campos habilitados na conta (se necessário)
3. ✅ Documentação atualizada
4. ✅ Exemplos de uso correto
5. ✅ Workarounds oficiais (se campos não existirem)

**Isso permitirá:**

- 🎯 Implementar filtro por Status da Obra
- 🎯 Exibir Tour Virtual 360°
- 🎯 Galeria de vídeos funcionando
- 🎯 Download de catálogos/plantas
- 🎯 Resumo financeiro completo (com IPTU)

---

## 📞 CONTATOS

### Suporte Vista CRM
- 📧 Email: suporte@vistasoft.com.br
- 📞 Telefone: (verificar no portal)
- 🌐 Portal: https://www.vistasoft.com.br/suporte/

### Pharos Imobiliária
- 👤 Desenvolvedor: [SEU NOME]
- 📧 Email: [SEU EMAIL]
- 📞 Telefone: [SEU TELEFONE]
- 🏢 Empresa: Pharos Imobiliária

---

## 🔄 HISTÓRICO DE VERSÕES

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0 | 09/12/2025 | Criação inicial da documentação |
| - | - | Aguardando resposta do Vista... |

---

## 💡 DICAS FINAIS

### ✅ DO's (Faça)

1. ✅ Seja claro e objetivo
2. ✅ Forneça exemplos concretos
3. ✅ Inclua prints/evidências
4. ✅ Mencione urgência e impacto
5. ✅ Esteja disponível para reunião técnica

### ❌ DON'Ts (Não Faça)

1. ❌ Não envie apenas "não funciona"
2. ❌ Não omita informações técnicas
3. ❌ Não esqueça dados de contato
4. ❌ Não seja agressivo
5. ❌ Não assuma que o suporte sabe o contexto

---

**Boa sorte com o chamado! 🍀**

**Qualquer dúvida, consulte os documentos de apoio.** 📚

---

**Última Atualização:** 09/12/2025  
**Próxima Revisão:** Após resposta do Vista




