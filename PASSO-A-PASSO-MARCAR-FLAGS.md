# 📋 Passo a Passo: Como Marcar Flags no Vista CRM

## 🎯 Problema Identificado

**Imóvel PH1068** aparece na seção "Imóveis em Destaque" do site **por causa do fallback**.

**Na imagem do Vista CRM você mostrou:**
- ✅ **Exibir no site** - Marcado
- ❌ **Super Destaque** - **DESMARCADO** ← Este precisa ser marcado!
- ❌ **Destaque Web** - Desmarcado
- ✅ **Lançamento** - Marcado
- ❌ **Tem Placa** - Desmarcado
- ❌ **Exclusivo** - Desmarcado

---

## ✅ Como Marcar Corretamente

### Para que o PH1068 apareça oficialmente na seção "Imóveis em Destaque":

**1. No Vista CRM, abra o imóvel PH1068**

**2. Na aba "Dados do Imóvel" → seção "Visão geral"**

**3. Marque o checkbox:**
   - ☑ **Super Destaque**

**4. Clique em "Salvar"**

**5. Recarregue o site**

---

## 📊 Checklist Completo para Organizar os Imóveis

### 🥇 **1ª Seção: Imóveis EXCLUSIVOS**
Marque estes checkboxes nos imóveis que você quer destacar como exclusivos (mais luxuosos/caros):
- ☑ **Exibir no site**
- ☑ **Exclusivo** ← Importante!

**Quantos marcar:** Recomendo 6-12 imóveis

---

### 🌟 **2ª Seção: Imóveis em DESTAQUE**
Marque estes checkboxes nos imóveis que você quer destacar (lançamentos, oportunidades, etc):
- ☑ **Exibir no site**
- ☑ **Super Destaque** ← Importante!

**Quantos marcar:** Recomendo 6-12 imóveis

**Alternativa:** Se o checkbox "Super Destaque" não funcionar, marque:
- ☑ **Destaque** (genérico)

---

### 🌊 **3ª Seção: Imóveis FRENTE MAR**
Marque estes checkboxes nos imóveis com vista para o mar:
- ☑ **Exibir no site**
- ☑ **Vista Mar** (nas características)

**Quantos marcar:** Todos os imóveis que realmente têm vista para o mar

---

## 🔧 Sistema de Prioridades

Quando você marcar as flags, o site vai ordenar automaticamente por prioridade:

| Prioridade | Flag no Vista | Seção do Site |
|------------|---------------|---------------|
| **1 (maior)** | Exclusivo | 1ª seção: "Imóveis Exclusivos" |
| **2** | Super Destaque | 2ª seção: "Imóveis em Destaque" |
| **3** | Tem Placa | Ordenação dentro das seções |
| **4** | Destaque Web | Ordenação dentro das seções |
| **5** | Destaque | Fallback para 2ª seção |

---

## ⚠️ IMPORTANTE: Fallback Temporário

**Enquanto você não marcar as flags:**

O site está usando **fallbacks inteligentes**:
- **1ª seção:** Mostra os 6 imóveis mais caros
- **2ª seção:** Mostra os 6 imóveis mais recentes
- **3ª seção:** Mostra os 6 imóveis mais próximos do mar

**Depois que você marcar as flags:**
- O site vai mostrar **apenas os imóveis marcados**
- Com **ordenação por prioridade**

---

## 🎯 Exemplo Prático: Imóvel PH1068

**Situação Atual:**
```
✅ Exibir no site
❌ Super Destaque ← Marque este!
❌ Destaque Web
✅ Lançamento
❌ Tem Placa
❌ Exclusivo
```

**O que fazer:**
1. Abrir o imóvel PH1068 no Vista CRM
2. Marcar ☑ **Super Destaque**
3. (Opcional) Marcar ☑ **Tem Placa** se ele tiver placa
4. Salvar
5. Recarregar o site

**Resultado:**
- PH1068 terá **prioridade oficial** na seção "Imóveis em Destaque"
- Se tiver "Tem Placa" marcado, terá prioridade 3 (antes de outros sem placa)

---

## 🔍 Como Verificar se Funcionou

**1. Acesse o endpoint de debug:**
```
http://localhost:3600/api/debug-flags
```

**2. Procure pelo imóvel PH1068 no JSON retornado:**
```json
{
  "id": "PH1068",
  "superHighlight": true,  ← Deve estar true!
  "isLaunch": true,
  "raw": {
    "SuperDestaque": 1  ← Deve estar 1 ou true
  }
}
```

**3. Recarregue a home e veja o console:**
- Deve mostrar: `superDestaque: 1` (ou mais, dependendo de quantos você marcar)

---

## ❓ Troubleshooting

### Problema: Marquei a flag mas não aparece no site

**Solução:**
1. Verifique se **"Exibir no site"** também está marcado
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Aguarde 1-2 minutos (pode haver cache no Vista)
4. Acesse `/api/debug-flags` para confirmar que a API está retornando `true`

### Problema: O checkbox "Super Destaque" não existe no meu Vista

**Solução alternativa:**
- Marque **"Destaque"** (checkbox genérico)
- O site vai usar como fallback
- Entre em contato com o suporte do Vista para habilitar "Super Destaque"

### Problema: Quero mudar um imóvel de seção

**Exemplo:** Mover PH1068 de "Destaque" para "Exclusivos"

**Passos:**
1. Desmarcar ☐ **Super Destaque**
2. Marcar ☑ **Exclusivo**
3. Salvar
4. Recarregar site

---

## 📞 Próximos Passos

1. **Agora:** Marque "Super Destaque" no PH1068
2. **Depois:** Escolha mais 5-10 imóveis para marcar com "Super Destaque"
3. **Por último:** Organize os imóveis nas 3 seções conforme sua estratégia de vendas

---

## ✅ Checklist de Configuração Inicial

- [ ] Marcar 6-12 imóveis como **Exclusivos** (mais caros/luxuosos)
- [ ] Marcar 6-12 imóveis como **Super Destaque** (lançamentos/oportunidades)
- [ ] Marcar todos os imóveis com **Vista Mar** que realmente têm vista
- [ ] Verificar se todos têm **Exibir no site** marcado
- [ ] Testar no site se as seções estão corretas
- [ ] Acessar `/api/debug-flags` para confirmar

**Tempo estimado:** 15-30 minutos para configurar tudo

