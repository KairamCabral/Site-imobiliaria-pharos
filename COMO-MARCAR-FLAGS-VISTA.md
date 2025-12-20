# 🏷️ Como Marcar Flags no CRM Vista

## 📋 Problema Identificado

A API está funcionando corretamente, mas **nenhum imóvel está marcado com as flags de destaque** no CRM Vista.

**Logs mostram:**
```
Imóvel 1 (PH1110): exclusivo: false, superDestaque: false, destaque: false
Imóvel 2 (PH1068): exclusivo: false, superDestaque: false, destaque: false
Imóvel 3 (PH1066): exclusivo: false, superDestaque: false, destaque: false
```

---

## ✅ Solução: Marcar Imóveis no CRM Vista

Para que os imóveis apareçam nas seções da home, você precisa **marcar as flags no CRM Vista**:

### 1️⃣ **Imóveis Exclusivos** (1ª Seção)
No Vista, marque o checkbox:
- ✅ **"Exclusivo"**

### 2️⃣ **Imóveis em Destaque** (2ª Seção)
No Vista, marque o checkbox:
- ✅ **"Super Destaque"** *(se disponível)*
- **OU** ✅ **"Destaque"** *(como fallback)*

### 3️⃣ **Imóveis Frente Mar** (3ª Seção)
No Vista, marque o checkbox:
- ✅ **"Vista Mar"** *(nas características do imóvel)*

---

## 🔧 Outras Flags Disponíveis

| Flag no Vista | Campo no Site | Uso |
|---------------|---------------|-----|
| **Exibir no Site** | `showOnWebsite` | Controla se o imóvel aparece no site |
| **Exclusivo** | `isExclusive` | 1ª seção da home (Prioridade 1) |
| **Super Destaque** | `superHighlight` | 2ª seção da home (Prioridade 2) |
| **Tem Placa** | `hasSignboard` | Prioridade na ordenação (nível 3) |
| **Destaque Web** | `webHighlight` | Prioridade na ordenação (nível 4) |
| **Destaque** | `isHighlight` | Fallback para 2ª seção (Prioridade 5) |
| **Lançamento** | `isLaunch` | Badge "Lançamento" |
| **Vista Mar** | `vistaParaMar` | 3ª seção da home (Frente Mar) |

---

## 🎯 Recomendação Imediata

**Para testar rapidamente:**

1. Entre no **CRM Vista**
2. Selecione **3-6 imóveis** que você quer destacar
3. Marque a flag **"Destaque"** ou **"Super Destaque"**
4. Salve as alterações
5. **Recarregue o site** - os imóveis devem aparecer na 2ª seção!

---

## 🔄 Fallback Implementado

O site já tem um **fallback inteligente**:

- Se não houver imóveis com `superDestaque = true`
- A 2ª seção mostrará imóveis com `destaque = true`
- Se não houver nenhum com flags, a seção **não aparecerá** (comportamento atual)

---

## 💡 Próximos Passos

1. **Marcar alguns imóveis** no Vista com as flags
2. **Testar** se as seções aparecem
3. **Ajustar** quais imóveis ficam em cada seção conforme necessário

---

## ❓ Dúvidas?

Se o Vista não tiver os checkboxes mencionados, me avise e vou:
1. Verificar os nomes exatos dos campos no Vista
2. Atualizar o mapeamento se necessário
3. Criar uma solução alternativa

