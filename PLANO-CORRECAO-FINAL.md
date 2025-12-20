# 🔧 Plano de Correção Final - 4 Problemas

## 🐛 Problemas Identificados

### 1. ✅ Suítes NÃO aparecem
**Status:** API retorna corretamente (confirmado: `suites: 4`)  
**Problema:** Exibição no card

### 2. ❌ Página de busca não lista cards  
**Status:** Código correto, precisa investigar  
**Provável causa:** `imoveisFiltrados` vazio ou filtros muito restritivos

### 3. ❌ Página de detalhes com dados mockados  
**Status:** Completamente mockada (linha 30-100)  
**Necessário:** Integrar com API `/api/properties/[id]`

### 4. ❌ Carrossel de cards não funciona  
**Provável causa:** Event handlers ou estado do `currentImage`

---

## 📋 Correções a Aplicar

### Correção 1: Suítes no Card

**Arquivo:** `src/components/ImovelCard.tsx`

Verificar se está renderizando suítes:
```typescript
{suites > 0 && (
  <div className="flex items-center gap-1.5">
    <Bed className="w-4 h-4 text-pharos-slate-500" />
    <span>{suites} {suites === 1 ? 'suíte' : 'suítes'}</span>
  </div>
)}
```

### Correção 2: Página de Busca - Debug

**Problema:** `imoveisFiltrados` pode estar vazio

**Solução:** Adicionar logs e verificar filtros:
```typescript
useEffect(() => {
  console.log('[DEBUG] todosImoveis:', todosImoveis.length);
  console.log('[DEBUG] imoveisFiltrados:', imoveisFiltrados.length);
}, [todosImoveis, imoveisFiltrados]);
```

### Correção 3: Página de Detalhes - Integrar API

**Arquivo:** `src/app/imoveis/[id]/page.tsx`

**Substituir:**
- Dados mockados por busca da API
- Usar `usePropertyDetails` hook
- Adicionar loading e error states

**Estrutura:**
```typescript
'use client';

import { usePropertyDetails } from '@/hooks/usePropertyDetails';

export default function DetalheImovel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Next.js 15
  const { data, isLoading, isError, error } = usePropertyDetails(id);
  
  if (isLoading) return <PropertyDetailLoading />;
  if (isError) return <PropertyDetailError error={error} />;
  if (!data) return <NotFound />;
  
  // Renderizar com data real
  return ( ... );
}
```

### Correção 4: Carrossel do Card

**Arquivo:** `src/components/ImovelCard.tsx`

Verificar:
- Event handlers `handlePrevious`/`handleNext`
- Estado `currentImage`
- Botões de navegação

---

## 🚀 Ordem de Implementação

1. ✅ **Verificar suítes** - Confirmar renderização no card
2. ❌ **Debug página de busca** - Logs e verificação de filtros
3. ❌ **Integrar página de detalhes** - Substituir mock por API
4. ❌ **Corrigir carrossel** - Event handlers e navegação

---

**Status:** Aguardando implementação  
**Prioridade:** Alta - Problemas bloqueiam UX

