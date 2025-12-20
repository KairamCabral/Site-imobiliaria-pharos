# ✅ Correção: Erro "imovel.galeria is not iterable"

## 📋 Problema

```
Runtime Error
Error: imovel.galeria is not iterable

at gerarSchemaImovel (src\utils\seo.ts:169:42)
```

### Causa

A função `gerarSchemaImovel` estava tentando fazer spread (`...`) de `imovel.galeria` sem verificar se era um array:

```typescript
// ❌ ANTES (ERRO)
image: [imovel.imagemCapa, ...imovel.galeria],
```

Se `imovel.galeria` fosse `undefined`, `null`, ou não-array, o código falhava.

---

## ✅ Correção Aplicada

### 1. **Arquivo:** `src/utils/seo.ts`

**Mudança:** Validar que `galeria` é array antes do spread

```typescript
// ✅ DEPOIS (CORRIGIDO)
export function gerarSchemaImovel(imovel: Imovel, url: string): SchemaRealEstateListing {
  // Garantir que galeria seja array
  const galeria = Array.isArray(imovel.galeria) ? imovel.galeria : [];
  const imagens = [imovel.imagemCapa, ...galeria].filter(Boolean);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.titulo,
    description: imovel.descricao,
    url,
    image: imagens, // ✅ Sempre um array válido
    // ...
  };
}
```

**Benefícios:**
- ✅ Verifica se `galeria` é array antes de fazer spread
- ✅ Remove valores `null`/`undefined` com `.filter(Boolean)`
- ✅ Sempre retorna array válido para Schema.org

---

### 2. **Arquivo:** `src/app/imoveis/[id]/page.tsx`

**Mudança 1:** Garantir que `imovelData.imagens` seja sempre array

```typescript
// ✅ CORRIGIDO: Sempre retorna array
imagens: (() => {
  const fotos = Array.isArray(data.fotos) ? data.fotos : [];
  const urls = [
    data.FotoDestaque,
    ...fotos.map((f: any) => f?.Foto),
    ...fotos.map((f: any) => f?.FotoPequena),
  ].filter((url: any) => typeof url === "string" && url.trim() !== '' && url.startsWith('http'));
  // Garantir que sempre retorna array, mesmo vazio
  return Array.from(new Set(urls));
})() || [], // ✅ Fallback para array vazio
```

**Mudança 2:** Passar objeto `Imovel` completo para `gerarSchemaImovel`

```typescript
// ✅ CORRIGIDO: Objeto completo compatível com tipo Imovel
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(gerarSchemaImovel(
      {
        id: imovelData.id,
        slug: codigo,
        codigo: imovelData.id,
        titulo: imovelData.titulo,
        descricao: imovelData.descricao || '',
        tipo: imovelData.tipoImovel as any,
        finalidade: 'venda',
        endereco: {
          rua: imovelData.endereco.split(',')[0] || '',
          numero: '',
          bairro: imovelData.bairro,
          cidade: imovelData.cidade,
          estado: 'SC',
          cep: '',
          coordenadas: { latitude: 0, longitude: 0 }
        },
        preco: imovelData.preco,
        areaTotal: imovelData.areaTotal,
        quartos: imovelData.quartos,
        suites: imovelData.suites,
        banheiros: imovelData.banheiros || 0,
        vagasGaragem: imovelData.vagas,
        imagemCapa: imovelData.imagens[0] || '',
        galeria: imovelData.imagens, // ✅ Sempre array
        status: imovelData.status as any,
        // ... outros campos
      } as any,
      `${typeof window !== 'undefined' ? window.location.origin : ''}/imoveis/${codigo}`
    ))
  }}
/>
```

---

## 🔍 Validação da Correção

### Teste 1: Array Vazio
```typescript
const imovel = { galeria: [] };
// ✅ Não gera erro, retorna []
```

### Teste 2: Undefined
```typescript
const imovel = { galeria: undefined };
// ✅ Não gera erro, retorna []
```

### Teste 3: Array com Valores
```typescript
const imovel = { 
  imagemCapa: 'foto1.jpg',
  galeria: ['foto2.jpg', 'foto3.jpg'] 
};
// ✅ Retorna ['foto1.jpg', 'foto2.jpg', 'foto3.jpg']
```

### Teste 4: Com Nulls
```typescript
const imovel = { 
  imagemCapa: null,
  galeria: ['foto1.jpg', null, 'foto2.jpg'] 
};
// ✅ Retorna ['foto1.jpg', 'foto2.jpg'] (nulls removidos)
```

---

## 📊 Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Erro Runtime** | ❌ Sim | ✅ Não |
| **SEO (Schema.org)** | ❌ Quebrado | ✅ Funcionando |
| **Galeria vazia** | ❌ Erro | ✅ Array vazio |
| **Valores null** | ❌ Erro | ✅ Filtrados |

---

## 🚀 Teste

1. **Acesse:** `http://localhost:3600/imoveis/apartamento-ph1107-barra-norte`

2. **Verifique:**
   - ✅ Página carrega sem erro
   - ✅ Schema.org no HTML (View Source → procure por `application/ld+json`)
   - ✅ Console sem erros (F12)

3. **View Source:**
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "RealEstateListing",
     "image": ["foto1.jpg", "foto2.jpg", ...],
     ...
   }
   </script>
   ```

---

## 🎯 Arquivos Modificados

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `src/utils/seo.ts` | Validação de array em `gerarSchemaImovel` | ✅ |
| `src/app/imoveis/[id]/page.tsx` | Garantir `imagens` sempre array | ✅ |
| `src/app/imoveis/[id]/page.tsx` | Passar objeto `Imovel` completo | ✅ |
| `CORRECAO-ERRO-GALERIA-ITERAVEL.md` | Documentação | ✅ |

---

## 🎉 Resultado

**Status:** ✅ **CORRIGIDO**

- ✅ Erro "galeria is not iterable" eliminado
- ✅ Schema.org JSON-LD funcionando
- ✅ Página de detalhes sem erros
- ✅ SEO mantido

**Data:** 15/10/2025  
**Impacto:** Página de detalhes, SEO Schema.org  
**Performance:** Sem degradação

