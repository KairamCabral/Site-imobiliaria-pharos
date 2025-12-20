# 🔍 Troubleshooting Final - Dados Não Aparecem no Frontend

## ✅ O Que JÁ Sabemos que Funciona

1. ✅ **Vista API retorna dados completos**
   ```
   GET /api/test-vista-raw
   → ValorVenda: "2750000", Dormitorios: "3"
   ```

2. ✅ **Mapeamento funciona perfeitamente**
   ```
   GET /api/force-enrich
   → pricing.sale: 5142758.19, specs.bedrooms: 4
   ```

3. ✅ **Servidor Next.js rodando** na porta 3600

---

## ❌ O Que NÃO Está Funcionando

**Frontend mostra:** R$ 0, 0 quartos, 0 vagas

**Causa provável:** O enriquecimento de dados não está sendo executado na listagem.

---

## 🔧 Diagnóstico Passo a Passo

### Passo 1: Verificar Logs do Servidor

No terminal onde o Next.js está rodando, você deve ver quando acessar a homepage:

```
[VistaProvider] Found X basic properties
[VistaProvider] Enriching X properties with details...
[VistaProvider] Processing batch 1/Y
[VistaProvider] Dados retornados para PH1108: { ValorVenda: '5142758.19', ... }
[VistaProvider] Merged PH1108: { ... }
[VistaProvider] Enrichment complete: X properties
```

**❓ Você vê essas mensagens?**

- **SIM** → O enriquecimento está rodando, problema é no mapeamento ou cache
- **NÃO** → O enriquecimento não está sendo chamado

---

### Passo 2: Testar Endpoints Diretamente

Abra o navegador e teste cada endpoint:

#### Teste A: Dados Raw Vista ✅
```
http://localhost:3600/api/test-vista-raw
```
**Esperado:** Dados completos (preço, quartos, etc.)

#### Teste B: Mapeamento ✅
```
http://localhost:3600/api/force-enrich
```
**Esperado:** Dados mapeados corretamente

#### Teste C: Listagem Enriquecida ❌
```
http://localhost:3600/api/properties-detailed?limit=3
```
**Esperado:** quality.withPrice = 3 (ou > 0)
**Atual:** quality.withPrice = 0

#### Teste D: Listagem Normal ❌
```
http://localhost:3600/api/properties?limit=6
```
**Esperado:** Dados completos nos cards
**Atual:** R$ 0, 0 quartos

---

### Passo 3: Limpar Cache Completamente

```bash
# No PowerShell
cd imobiliaria-pharos

# 1. Limpar cache da API
Invoke-WebRequest -Uri "http://localhost:3600/api/clear-cache"

# 2. Parar servidor (Ctrl+C)

# 3. Limpar cache do Next.js
Remove-Item -Recurse -Force .next

# 4. Reiniciar
npm run dev

# 5. Aguardar iniciar (espere mensagem "Ready in Xs")

# 6. Testar novamente
Invoke-WebRequest -Uri "http://localhost:3600/api/properties-detailed?limit=3"
```

---

## 🐛 Possíveis Causas e Soluções

### Causa 1: Cache Retornando Dados Antigos

**Solução:**
```bash
# Limpar cache e reiniciar
http://localhost:3600/api/clear-cache
# Recarregar página com Ctrl+Shift+R (hard reload)
```

---

### Causa 2: Enriquecimento Não Executando

**Verificar no código:**

Arquivo: `src/providers/vista/VistaProvider.ts` linha ~90

Deve ter:
```typescript
// Enriquecer com detalhes completos
const enrichedProperties = await this.enrichPropertiesWithDetails(basicProperties);
```

**Se NÃO tiver**, adicionar após linha que extrai `basicProperties`.

---

### Causa 3: Homepage Usando Endpoint Errado

**Verificar:**

Arquivo: `src/app/page.tsx`

Deve usar:
```typescript
const { data: imoveisAPI } = useProperties({
  filters: {
    city: cidadeDestaque,
    limit: 6
  }
});
```

**Endpoint chamado deve ser:** `/api/properties` (não `/api/properties-detailed`)

---

### Causa 4: Erro Silencioso no Enriquecimento

**Verificar logs** no terminal do servidor.

Se vir:
```
[VistaProvider] Failed to enrich PH1108: ...
```

Significa que a busca de detalhes está falhando. Verifique:
- Chave API correta
- Formato do parâmetro `pesquisa`
- Campos solicitados existem na conta

---

## 🚀 Solução Rápida (Teste Direto)

Crie este arquivo para testar se o problema é só na homepage:

**Arquivo:** `test-properties.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Teste Direto API</title>
</head>
<body>
  <h1>Teste de Propriedades</h1>
  <button onclick="testar()">Buscar Imóveis</button>
  <pre id="resultado"></pre>
  
  <script>
  async function testar() {
    const res = await fetch('http://localhost:3600/api/properties?limit=3');
    const data = await res.json();
    document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
  }
  </script>
</body>
</html>
```

Abra este HTML no navegador, clique no botão e veja se os dados aparecem com preço/quartos preenchidos.

---

## 📊 Checklist de Validação

Execute em ordem:

- [ ] 1. Servidor rodando na porta 3600
- [ ] 2. `/api/test-vista-raw` retorna dados ✅
- [ ] 3. `/api/force-enrich` mapeia dados ✅
- [ ] 4. `/api/properties-detailed?limit=3` → quality.withPrice > 0
- [ ] 5. `/api/properties?limit=6` → dados completos
- [ ] 6. Homepage http://localhost:3600 → cards com preço
- [ ] 7. Logs do servidor mostram "Enriching X properties"

---

## 🆘 Se Ainda Não Funcionar

**Opção A: Forçar Enriquecimento Sempre**

Adicione log de debug no início do método `listProperties`:

```typescript
async listProperties(filters, pagination) {
  console.log('[VistaProvider] listProperties CHAMADO!', { filters, pagination });
  
  try {
    const response = await this.client.get(...);
    const basicProperties = /* extração */;
    
    console.log('[VistaProvider] basicProperties:', basicProperties.length);
    
    // FORÇAR enriquecimento
    const enriched = await this.enrichPropertiesWithDetails(basicProperties);
    
    console.log('[VistaProvider] enriched:', enriched.length);
    console.log('[VistaProvider] Primeiro enriquecido:', enriched[0]);
    
    const properties = enriched.map(mapVistaToProperty);
    
    console.log('[VistaProvider] Primeiro mapeado:', properties[0]);
    
    return { properties, pagination };
  } catch (error) {
    console.error('[VistaProvider] ERRO:', error);
    throw error;
  }
}
```

Recarregue a página e veja os logs linha por linha.

---

**Opção B: Desabilitar Cache Temporariamente**

Comente a linha de cache em `fetchPropertyDetails`:

```typescript
// const cached = detailsCache.get<VistaImovel>(cacheKey);
// if (cached) return cached;
```

---

**Opção C: Teste com Dados Mockados**

Se nada funcionar, confirme que o problema é na integração (não na UI):

Modifique temporariamente o `PropertyMapper` para retornar dados fixos:

```typescript
export function mapVistaToProperty(vista: VistaImovel): Property {
  return {
    id: vista.Codigo,
    pricing: { sale: 2500000 }, // MOCK
    specs: { bedrooms: 3, totalArea: 100 }, // MOCK
    // ... resto normal
  };
}
```

Se aparecer R$ 2.500.000 na tela, confirma que o problema é na busca de detalhes.

---

## 📝 Próximo Passo

**Me informe:**

1. Você vê logs de "Enriching" no terminal? (SIM/NÃO)
2. O que retorna `/api/properties-detailed?limit=3` → quality.withPrice?
3. O que retorna `/api/properties?limit=1` (mostre 1 imóvel completo)

Com essas informações, vou identificar exatamente onde está o problema!

