# 🧪 **COMO TESTAR: Filtros de Características**

**Guia prático para validar a correção aplicada**

---

## 🎯 **OBJETIVO**

Validar que os filtros de características do imóvel e empreendimento estão funcionando corretamente após a correção do bug crítico.

---

## 🚀 **ACESSO RÁPIDO**

### **URL Base:**
```
http://localhost:3600/imoveis
```

### **Servidor:**
```bash
npm run dev
```
✅ Servidor deve estar rodando na porta **3600**

---

## 📝 **CENÁRIOS DE TESTE**

### **🟢 TESTE 1: Piscina (Simples)**

#### **Passos:**
1. Acesse `http://localhost:3600/imoveis`
2. Clique em **"Filtros Avançados"**
3. Na seção **"Características do Empreendimento"**, selecione **"Piscina"**
4. Clique em **"Aplicar Filtros"**

#### **Resultado Esperado:**
- ✅ URL muda para: `/imoveis?caracEmpreendimento=Piscina`
- ✅ Console do navegador mostra:
  ```javascript
  [ImoveisClient] ✅ Filtro de características do empreendimento aplicado na API
  ```
- ✅ Console do servidor mostra:
  ```javascript
  [API /properties] 🏢 Características do empreendimento recebidas: ["Piscina"]
  [VistaProvider] 🔍 DEBUG - Filtros recebidos: {
    caracteristicasEmpreendimento: ["Piscina"]
  }
  🗺️ [Mapeamento] Características empreendimento
    Piscina → Piscina
    ✅ Piscina → Piscina = 'Sim'
  
  Filter COMPLETO: { "Piscina": "Sim" }
  Filter tem características? true
  ```
- ✅ Listagem mostra apenas imóveis com piscina
- ✅ Contador: "X imóveis encontrados" (número reduzido)

#### **❌ Antes da Correção:**
```javascript
Filter COMPLETO: {}
Filter tem características? false
// Retornava TODOS os 250 imóveis
```

---

### **🟡 TESTE 2: Múltiplas Características**

#### **Passos:**
1. Mantenha **"Piscina"** selecionada
2. Adicione **"Academia"**
3. Adicione **"Rooftop"**
4. Clique em **"Aplicar Filtros"**

#### **Resultado Esperado:**
- ✅ URL: `/imoveis?caracEmpreendimento=Piscina&caracEmpreendimento=Academia&caracEmpreendimento=Rooftop`
- ✅ Console do servidor:
  ```javascript
  Filter COMPLETO: {
    "Piscina": "Sim",
    "Academia": "Sim",
    "Rooftop": "Sim"
  }
  ```
- ✅ Número de resultados **menor** que Teste 1
- ✅ Todos os imóveis exibidos **possuem as 3 características**

---

### **🔵 TESTE 3: Características do Imóvel**

#### **Passos:**
1. Limpe os filtros anteriores
2. Na seção **"Características do Imóvel"**, selecione **"Vista Mar"**
3. Aplique os filtros

#### **Resultado Esperado:**
- ✅ URL: `/imoveis?caracImovel=Vista+Mar`
- ✅ Console:
  ```javascript
  [API /properties] 🏠 Características do imóvel recebidas: ["Vista Mar"]
  Filter COMPLETO: { "VistaMar": "Sim" }
  ```
- ✅ Lista mostra apenas imóveis com vista para o mar

---

### **🟣 TESTE 4: Mix Completo**

#### **Passos:**
1. **Tipo:** Apartamento
2. **Localização:** Balneário Camboriú
3. **Bairro:** Barra Norte
4. **Preço:** R$ 1.000.000 - R$ 2.000.000
5. **Quartos:** 3+
6. **Características Imóvel:** Vista Mar
7. **Características Empreendimento:** Piscina + Academia
8. Aplique os filtros

#### **Resultado Esperado:**
- ✅ URL complexa com todos os parâmetros
- ✅ Console mostra filtro completo:
  ```javascript
  Filter COMPLETO: {
    "Categoria": "Apartamento",
    "Cidade": "Balneário Camboriú",
    "ValorVenda": [1000000, 2000000],
    "Dormitorios": [">=", 3],
    "VistaMar": "Sim",
    "Piscina": "Sim",
    "Academia": "Sim"
  }
  ```
- ✅ Resultados altamente filtrados (poucos imóveis)
- ✅ Todos atendem **TODOS** os critérios

---

## 🔍 **COMO VERIFICAR NO CONSOLE**

### **1. Abra o DevTools:**
```
F12 (Chrome/Edge)
Cmd+Option+I (Mac)
```

### **2. Console do Navegador (Client):**
Procure por:
```javascript
[ImoveisClient] ✅ Filtro de características do empreendimento aplicado na API
[ImoveisClient] ✅ Filtro de características do imóvel aplicado na API
```

### **3. Console do Terminal (Server):**
Procure por:
```javascript
[API /properties] 🏢 Características do empreendimento recebidas: [...]
[VistaProvider] 🔍 DEBUG - Filtros recebidos: {...}
🗺️ [Mapeamento] Características empreendimento
Filter COMPLETO: {...}
Filter tem características? true ✅
```

---

## ⚠️ **PROBLEMAS COMUNS**

### **❌ Problema 1: "Filter tem características? false"**
**Causa:** Correção não aplicada  
**Solução:** Reinicie o servidor Next.js

### **❌ Problema 2: Retorna 250 imóveis (todos)**
**Causa:** Filtro não está sendo enviado  
**Solução:** Verifique o console do servidor

### **❌ Problema 3: Erro de compilação**
**Causa:** Sintaxe incorreta  
**Solução:** Verifique `VistaProvider.ts:1353-1362`

### **❌ Problema 4: "Característica não mapeada"**
**Causa:** Falta mapeamento em `caracteristicas.ts`  
**Solução:** Adicione o mapeamento necessário

---

## 📊 **TABELA DE RESULTADOS ESPERADOS**

| Filtro | Total Vista | Esperado com Filtro | Observação |
|--------|-------------|---------------------|------------|
| Sem filtro | ~250 | ~250 | Baseline |
| Piscina | ~250 | ~23 | 🎯 |
| Piscina + Academia | ~250 | ~15 | 🎯 |
| Piscina + Academia + Rooftop | ~250 | ~8 | 🎯 |
| Vista Mar | ~250 | ~47 | 🎯 |
| Vista Mar + Mobiliado | ~250 | ~12 | 🎯 |

**🎯 = Resultado correto após correção**

---

## 🐛 **DEBUGGING**

### **Se o filtro não funcionar:**

1. **Verifique o console do servidor:**
   ```javascript
   // Deve mostrar:
   Filter COMPLETO: { "Piscina": "Sim" } ✅
   
   // NÃO deve mostrar:
   Filter COMPLETO: {} ❌
   ```

2. **Verifique a URL:**
   ```
   ✅ Correto: /imoveis?caracEmpreendimento=Piscina
   ❌ Errado:  /imoveis (sem parâmetros)
   ```

3. **Verifique a resposta da API:**
   - Abra a aba **Network** no DevTools
   - Procure por `/api/properties?caracEmpreendimento=Piscina`
   - Verifique a resposta JSON
   - Conte o número de `data` retornados

4. **Verifique logs de erro:**
   ```bash
   # Terminal do servidor
   tail -f .next/trace
   ```

---

## 📸 **EVIDÊNCIAS (Screenshots)**

### **1. Filtros Aplicados:**
![Filtros](screenshot-filtros.png)

### **2. Console do Servidor:**
![Console](screenshot-console.png)

### **3. Resultados Filtrados:**
![Resultados](screenshot-resultados.png)

---

## ✅ **CHECKLIST FINAL**

Marque cada item após testar:

- [ ] **Teste 1:** Piscina funcionando
- [ ] **Teste 2:** Múltiplas características funcionando
- [ ] **Teste 3:** Características do imóvel funcionando
- [ ] **Teste 4:** Mix completo funcionando
- [ ] Console do servidor mostra logs corretos
- [ ] Número de resultados corresponde ao esperado
- [ ] URL é construída corretamente
- [ ] Filtros podem ser limpos e reaplicados
- [ ] Performance aceitável (<2s para resposta)

---

## 🚀 **PRÓXIMO PASSO**

Após validar todos os testes:
1. ✅ Commit das alterações
2. ✅ Deploy em staging
3. ✅ Testes em staging
4. ✅ Deploy em produção
5. ✅ Monitorar logs de produção

---

## 📞 **SUPORTE**

**Se encontrar problemas:**
1. Verifique `docs/CORRECAO-FILTROS-CARACTERISTICAS.md`
2. Verifique `docs/VERIFICACAO-FILTROS-COMPLETA.md`
3. Cheque os logs do servidor
4. Abra um issue com:
   - Screenshots do console
   - URL que não funciona
   - Filtros aplicados
   - Número de resultados esperado vs. obtido

---

**Última atualização:** 15/12/2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para teste

