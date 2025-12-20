# 🔧 Correção: Erro com Imagens Vazias

**Data:** 15/10/2025  
**Problema:** `Cannot read properties of undefined (reading 'startsWith')`  
**Status:** ✅ **CORRIGIDO**

---

## 🐛 Problema Identificado

### Erro Original

```
Runtime Error

Error: Cannot read properties of undefined (reading 'startsWith')

src\components\ImovelCard.tsx (125:37)
```

### Causa Raiz

A API Vista retorna imóveis com o array `galeria` vazio:

```json
{
  "id": "PH1108",
  "galeria": [],  // ← Array vazio!
  "titulo": "Apartamento em Brava",
  ...
}
```

O componente `ImovelCard` tentava acessar diretamente:
```typescript
imagens[currentImage].startsWith('http')  // ❌ ERRO se imagens está vazio
```

---

## ✅ Solução Implementada

### Arquivo Corrigido: `ImovelCard.tsx`

**Antes:**
```typescript
<Image
  src={
    imagens[currentImage].startsWith('http')
      ? imagens[currentImage]
      : `https://via.placeholder.com/...`
  }
/>
```

**Depois:**
```typescript
// Calcular imagem atual ou placeholder ANTES de renderizar
const currentImageSrc = imagens && imagens.length > 0 && imagens[currentImage]
  ? (imagens[currentImage].startsWith('http')
      ? imagens[currentImage]
      : imagens[currentImage])
  : `https://via.placeholder.com/800x600.jpg?text=${encodeURIComponent(titulo)}`;

<Image src={currentImageSrc} />
```

### Outras Proteções Adicionadas

**1. Controles de Carrossel:**
```typescript
// Antes
{imagens.length > 1 && (

// Depois
{imagens && imagens.length > 1 && (
```

**2. Tags de Características:**
```typescript
// Antes
{caracteristicas.slice(0, 1).map(...)}

// Depois
{caracteristicas && caracteristicas.slice(0, 1).map(...)}
```

---

## 🧪 Validação

### Testado Com:

✅ Imóvel com galeria vazia (`[]`)  
✅ Imóvel com 1 imagem  
✅ Imóvel com múltiplas imagens  
✅ Imóvel com características vazias  

### Comportamento Esperado

| Situação | Resultado |
|----------|-----------|
| `galeria: []` | Mostra placeholder com título do imóvel |
| `galeria: [url]` | Mostra a imagem, sem controles de navegação |
| `galeria: [url1, url2, ...]` | Mostra carrossel com navegação |

---

## 📊 Impacto

### Arquivos Modificados

- ✅ `src/components/ImovelCard.tsx` - Corrigido
- ✅ `src/components/PropertyCardHorizontal.tsx` - Já estava seguro (usa `?.`)

### Componentes Seguros

Outros componentes já usavam **optional chaining** (`?.`):

```typescript
// PropertyCardHorizontal.tsx - JÁ ESTAVA CORRETO
src={imagens[currentImageIndex]?.src || imagens[0]?.src}
```

---

## 💡 Lições Aprendidas

### Problemas com Dados de API

1. **Nunca confie cegamente em dados externos**
   - Sempre validar arrays antes de acessar índices
   - Sempre verificar propriedades antes de chamar métodos

2. **Defensive Programming**
   ```typescript
   // ❌ PERIGOSO
   array[0].method()
   
   // ✅ SEGURO
   array && array.length > 0 && array[0]?.method()
   ```

3. **Usar Optional Chaining (`?.`)**
   ```typescript
   // ✅ BOM
   obj?.prop?.method?.()
   ```

### Melhorias Futuras Sugeridas

1. **Validação de dados com Zod/Yup**
   ```typescript
   const PropertySchema = z.object({
     galeria: z.array(z.string()).default([]),
     caracteristicas: z.array(z.string()).default([])
   });
   ```

2. **Placeholder mais inteligente**
   - Gerar placeholder com logo da Pharos
   - Adicionar cor de fundo baseada no tipo de imóvel

3. **Lazy loading de imagens**
   - Carregar placeholders enquanto imagens reais carregam
   - Feedback visual durante carregamento

---

## 🔍 Debug: Como Identificamos

1. **Console do Browser (F12)**
   - Mostrou linha exata do erro
   - Call stack apontou para `ImovelCard.tsx:125`

2. **Teste da API**
   - Verificamos resposta: `galeria: []`
   - Confirmamos que dados estavam corretos, mas vazios

3. **Análise de Código**
   - Encontramos acesso direto ao array sem validação
   - Implementamos proteções

---

## ✅ Checklist de Segurança para Arrays

Ao trabalhar com arrays de APIs:

- [ ] Verificar se array existe (`array &&`)
- [ ] Verificar se não está vazio (`array.length > 0`)
- [ ] Usar optional chaining para propriedades (`array[0]?.prop`)
- [ ] Ter fallback/placeholder quando vazio
- [ ] Testar com dados vazios

---

## 🚀 Status

**CORRIGIDO E TESTADO!**

Agora o site funciona perfeitamente mesmo quando a API Vista retorna imóveis sem fotos.

---

**Desenvolvido para:** Pharos Negócios Imobiliários  
**Versão:** 1.0.1  
**Data da Correção:** 15/10/2025 16:30

