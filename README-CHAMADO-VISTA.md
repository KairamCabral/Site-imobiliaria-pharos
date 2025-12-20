# 🎫 Chamado Vista CRM - Documentação Completa

> **📌 Status:** Pronto para envio  
> **📅 Data:** 09/12/2025  
> **🎯 Objetivo:** Resolver problemas com campos da API Vista

---

## 🚀 INÍCIO RÁPIDO

### Passo 1: Teste (2 minutos)
```powershell
.\test-vista-campos-faltantes.ps1
```

### Passo 2: Abra o chamado (5 minutos)
1. Leia: **`CHAMADO-VISTA-RESUMO-EXECUTIVO.md`**
2. Copie o conteúdo
3. Cole no ticket de suporte Vista
4. Anexe prints da interface
5. Envie!

### Passo 3: Se pedirem detalhes
Envie os anexos técnicos:
- **`CHAMADO-VISTA-CAMPOS-FALTANTES.md`**
- **`CHAMADO-VISTA-DETALHES-TECNICOS.md`**

---

## 📚 DOCUMENTOS

| Arquivo | Para que serve | Quando usar |
|---------|----------------|-------------|
| **INDEX-CHAMADO-VISTA.md** | Índice completo | Navegação e referência |
| **CHAMADO-VISTA-RESUMO-EXECUTIVO.md** | Copiar/colar no ticket | ✅ **SEMPRE** (abrir chamado) |
| **CHAMADO-VISTA-CAMPOS-FALTANTES.md** | Descrição detalhada | Se solicitado pelo suporte |
| **CHAMADO-VISTA-DETALHES-TECNICOS.md** | Logs e código técnico | Se solicitado pelo suporte |
| **VISTA-API-STATUS-CAMPOS.md** | Status geral da API | Referência interna |
| **test-vista-campos-faltantes.ps1** | Script de teste | Antes de enviar chamado |

---

## ❌ PROBLEMAS IDENTIFICADOS

### 🔴 Críticos
1. **StatusObra** - Retorna `null` (não conseguimos filtrar por status da obra)
2. **Anexos** - Sem endpoint (não conseguimos exibir PDFs/plantas)

### 🟡 Importantes
3. **TourVirtual** - Retorna `null` (tour 360° indisponível)
4. **Videos** - Retorna `[]` vazio (galeria de vídeos indisponível)
5. **ValorIPTU** - Inconsistente (custo total incompleto)

---

## 📧 TEMPLATE DE EMAIL

```
Para: suporte@vistasoft.com.br
Assunto: Campos API não retornando - Pharos (gabarito-rest)

Olá!

Campos essenciais da API não retornam dados:
1. StatusObra → null
2. TourVirtual → null
3. Videos → []
4. Anexos → não encontrado
5. ValorIPTU → erro/null

Conta: gabarito-rest.vistahost.com.br
Urgência: ALTA

Documentação completa em anexo.

[Seu Nome]
Pharos Imobiliária
```

---

## ✅ CHECKLIST

Antes de enviar:
- [ ] Executei o script de teste
- [ ] Tirei prints da interface
- [ ] Revisei o documento de resumo
- [ ] Atualizei meus dados de contato
- [ ] Marquei como urgência ALTA

---

## 📞 SUPORTE

**Vista CRM:**
- 📧 suporte@vistasoft.com.br
- 🌐 https://www.vistasoft.com.br/api/

**Pharos:**
- Conta: gabarito-rest.vistahost.com.br
- API Key: e4e62e22782c7646f2db00a2c56ac70e

---

## 🎯 RESULTADO ESPERADO

Após resolução:
- ✅ Filtro por Status da Obra funcionando
- ✅ Tour Virtual 360° disponível
- ✅ Galeria de vídeos funcionando
- ✅ Download de catálogos/plantas
- ✅ IPTU no resumo financeiro

---

**👉 Comece por: `INDEX-CHAMADO-VISTA.md`**




