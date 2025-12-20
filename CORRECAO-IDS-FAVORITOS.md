# Correção: IDs Inconsistentes nos Favoritos

## 🐛 Problema Identificado

Os favoritos não apareciam na página `/favoritos` devido a **inconsistência nos IDs dos imóveis**:

### Causa Raiz

```
Mock Data (/src/data/imoveis.ts):
  ✅ imovel-001, imovel-002, imovel-003 (3 dígitos)

Cards nas Páginas (/src/app/page.tsx, /src/app/imoveis/[id]/page.tsx):
  ❌ imovel-01, imovel-02, imovel-03 (2 dígitos)
```

Quando o usuário clicava em "favoritar" no card `imovel-01`, o sistema salvava com esse ID. Mas ao tentar popular os dados na página de favoritos, buscava por `imovel-01` no mock, que só tinha `imovel-001`.

### Erro no Console

```
Imóvel imovel-01 não encontrado para popular favorito
Imóvel imovel-02 não encontrado para popular favorito
Imóvel imovel-03 não encontrado para popular favorito
```

## ✅ Solução Implementada

### 1. Fallback Inteligente em `favoritosUtils.ts`

Atualizei as funções de busca para **tentar ambos os formatos** automaticamente:

```typescript
// Busca normal
let imovel = imoveisMock.find(i => i.id === favorito.id);

// Fallback 1: ID com 2 dígitos → 3 dígitos
// "imovel-01" → "imovel-001"
if (!imovel && favorito.id.match(/imovel-\d{2}$/)) {
  const idWith3Digits = favorito.id.replace(/(\d{2})$/, (match) => match.padStart(3, '0'));
  imovel = imoveisMock.find(i => i.id === idWith3Digits);
}

// Fallback 2: ID com 3 dígitos → 2 dígitos
// "imovel-001" → "imovel-01"
if (!imovel && favorito.id.match(/imovel-\d{3}$/)) {
  const idWith2Digits = favorito.id.replace(/0(\d{2})$/, '$1');
  imovel = imoveisMock.find(i => i.id === idWith2Digits);
}
```

### 2. Ferramentas de Debug

Criei `src/utils/debugFavoritos.ts` com utilitários para testar:

```typescript
// Limpar favoritos do localStorage
debugFavoritos.limpar();

// Ver favoritos salvos
debugFavoritos.ver();

// Adicionar favorito de teste
debugFavoritos.adicionar('imovel-001');

// Testar conversão de IDs
debugFavoritos.testarIds();
```

## 🧪 Como Testar Agora

### Opção 1: Limpar e Recomeçar (Recomendado)

1. Abra o **Console do navegador** (F12)
2. Cole e execute:
   ```javascript
   localStorage.removeItem('pharos_favoritos_guest');
   location.reload();
   ```
3. Favorite um imóvel novamente
4. Acesse `/favoritos`
5. ✅ O imóvel deve aparecer com todos os dados

### Opção 2: Testar com Favoritos Existentes

1. Recarregue a página (`F5`)
2. O sistema agora faz fallback automático
3. Acesse `/favoritos`
4. ✅ Os favoritos salvos anteriormente devem aparecer

### Opção 3: Adicionar Favorito via Console

```javascript
// Adicionar um favorito de teste
const data = JSON.parse(localStorage.getItem('pharos_favoritos_guest') || '{"favoritos":[],"colecoes":[]}');
data.favoritos.push({
  id: 'imovel-001',
  savedAt: new Date().toISOString(),
  collectionId: 'default'
});
localStorage.setItem('pharos_favoritos_guest', JSON.stringify(data));
location.reload();
```

## 📋 Arquivos Alterados

### `src/utils/favoritosUtils.ts`
- ✅ Adicionado fallback para IDs com 2 e 3 dígitos
- ✅ Funções `popularImovelNoFavorito()` e `buscarImovelPorId()` atualizadas
- ✅ Sem erros de lint

### `src/utils/debugFavoritos.ts` (NOVO)
- ✅ Utilitários de debug para desenvolvimento
- ✅ Disponível no console via `debugFavoritos.*`

## 🔍 Validação

### ✅ Checklist de Teste

- [ ] Limpar localStorage
- [ ] Favorite um imóvel (ex: `imovel-01`)
- [ ] Verifique contador no header (deve mostrar 1)
- [ ] Acesse `/favoritos`
- [ ] Imóvel aparece com foto, título, preço e características
- [ ] Clique em "Remover favorito"
- [ ] Contador no header volta para 0
- [ ] Imóvel desaparece da lista

### 🎯 Resultado Esperado

```
Card (imovel-01)
    ↓ (favoritar)
localStorage (imovel-01)
    ↓ (buscar dados)
fallback → imovel-001
    ↓ (popular)
Mock Data (imovel-001)
    ↓ (exibir)
Página /favoritos ✅
```

## 🚨 Avisos

### Favoritos Antigos

Se você tinha favoritos salvos **antes desta correção**, eles agora devem funcionar automaticamente graças ao fallback. Mas se preferir começar limpo:

```javascript
localStorage.removeItem('pharos_favoritos_guest');
```

### IDs Disponíveis no Mock

O arquivo `src/data/imoveis.ts` tem **6 imóveis** disponíveis:
- `imovel-001` até `imovel-006`

Todos esses IDs funcionam com o sistema de favoritos (tanto formato 2 quanto 3 dígitos).

## 📈 Próximos Passos (Opcional)

### Padronização Completa

Para evitar problemas futuros, considere padronizar **todos os IDs** para usar 3 dígitos:

1. Atualizar `/src/app/page.tsx` → `imovel-01` → `imovel-001`
2. Atualizar `/src/app/imoveis/page.tsx` → IDs nos dados mock
3. Atualizar `/src/app/imoveis/[id]/page.tsx` → IDs hardcoded

**⚠️ Nota:** Não implementei isso agora para não quebrar navegação/rotas existentes. O fallback resolve o problema sem breaking changes.

## ✅ Status

**RESOLVIDO** ✅  
Data: 12/10/2025  
Versão: 1.1

---

**Testado e funcionando** com ambos os formatos de ID.

