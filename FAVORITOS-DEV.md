# 🛠️ Sistema de Favoritos — Guia de Desenvolvimento

Comandos úteis, debugging e troubleshooting para o sistema de favoritos.

---

## 🚀 Comandos de Desenvolvimento

### Iniciar servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

Acesse: `http://localhost:3600/favoritos` [[memory:8251365]]

### Build de produção
```bash
npm run build
npm start
```

### Linter
```bash
npm run lint
npm run lint:fix
```

---

## 🧪 Testes Manuais

### 1. Adicionar aos Favoritos
1. Navegue para `/imoveis`
2. Clique no ícone de coração em um card
3. Verifique se o ícone fica vermelho (preenchido)
4. Vá para `/favoritos` e confirme que o imóvel está lá

### 2. Criar Coleção
1. Vá para `/favoritos`
2. Clique em "Nova coleção" na sidebar
3. Digite um nome e pressione Enter
4. Verifique se a coleção aparece na lista

### 3. Mover para Coleção
1. Em `/favoritos`, selecione um imóvel (checkbox)
2. Use o menu de ações em massa
3. Escolha "Mover para..." e selecione a coleção
4. Verifique se o imóvel foi movido

### 4. Comparação
1. Selecione 2+ imóveis (⌘/Ctrl+Click)
2. Clique em "Comparar" na barra flutuante
3. Verifique a tabela lado a lado
4. Teste o pin de imóvel base

### 5. Compartilhamento
1. Clique em "Compartilhar" na toolbar
2. Configure expiração e proteção
3. Gere o link
4. Copie e teste em nova aba anônima

### 6. Responsividade
1. Teste em Chrome DevTools:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
2. Verifique sidebar colapsável
3. Teste touch interactions

---

## 🐛 Debugging

### Console do navegador

```javascript
// Ver todos os favoritos salvos
JSON.parse(localStorage.getItem('pharos_favoritos'))

// Ver coleções
JSON.parse(localStorage.getItem('pharos_colecoes'))

// Ver query atual
JSON.parse(localStorage.getItem('pharos_favoritos_query'))

// Ver modo de visualização
localStorage.getItem('pharos_favoritos_view')

// Limpar tudo
localStorage.removeItem('pharos_favoritos')
localStorage.removeItem('pharos_colecoes')
localStorage.removeItem('pharos_favoritos_view')
localStorage.removeItem('pharos_favoritos_query')

// Adicionar mock data
localStorage.setItem('pharos_favoritos', JSON.stringify([
  {
    id: 'imovel-1',
    savedAt: new Date().toISOString(),
    collectionId: 'default',
    notes: 'Ótima localização',
    tags: ['prioridade', 'agendar']
  },
  {
    id: 'imovel-2',
    savedAt: new Date().toISOString(),
    collectionId: 'default',
  }
]))
```

### React DevTools

1. Instale a extensão React DevTools
2. Abra as ferramentas de desenvolvedor
3. Vá para a aba "Components"
4. Procure por `FavoritosProvider`
5. Inspecione o state:
   - `favoritos`
   - `colecoes`
   - `selectedIds`
   - `currentQuery`

### Verificar eventos de analytics

```javascript
// No console do navegador
window.dataLayer // Google Tag Manager
// ou
window.gtag // Google Analytics 4

// Ouvir todos os eventos
window.addEventListener('message', (event) => {
  if (event.data.event) {
    console.log('📊 Analytics:', event.data);
  }
});
```

---

## 🔧 Customizações Comuns

### Adicionar novo tipo de etiqueta

```typescript
// 1. Adicionar ao type
// src/types/index.ts
export type FavoritoTag = 
  | 'agendar' 
  | 'negociar' 
  | 'prioridade' 
  | 'urgente' 
  | 'contato-feito'
  | 'minha-nova-tag'; // ← adicione aqui

// 2. Adicionar label e cor
// src/components/favoritos/FavoriteCard.tsx
const TAG_LABELS: Record<FavoritoTag, { label: string; color: string }> = {
  // ... tags existentes
  'minha-nova-tag': { 
    label: 'Minha Nova Tag', 
    color: 'bg-purple-100 text-purple-700 border-purple-200' 
  },
};
```

### Alterar tempo de expiração do toast

```typescript
// src/contexts/FavoritosContext.tsx
// Procure por setTimeout e altere o valor (em ms)
setTimeout(() => setShowToast(false), 5000); // 5 segundos
```

### Adicionar novo critério de ordenação

```typescript
// 1. Adicionar ao type
// src/types/index.ts
export type FavoritosOrdenacao = 
  | 'savedAt-desc'
  | 'savedAt-asc'
  // ...
  | 'meu-criterio'; // ← adicione aqui

// 2. Adicionar opção no dropdown
// src/components/favoritos/FavoritesToolbar.tsx
const SORT_OPTIONS = [
  // ... opções existentes
  { value: 'meu-criterio', label: 'Meu Critério' },
];

// 3. Implementar lógica
// src/contexts/FavoritosContext.tsx (getFilteredFavoritos)
case 'meu-criterio':
  filtered.sort((a, b) => {
    // sua lógica aqui
    return 0;
  });
  break;
```

### Alterar cores das etiquetas

```typescript
// src/components/favoritos/FavoriteCard.tsx
const TAG_LABELS: Record<FavoritoTag, { label: string; color: string }> = {
  agendar: { 
    label: 'Agendar visita', 
    color: 'bg-blue-100 text-blue-700 border-blue-200' // ← altere aqui
  },
  // ...
};
```

---

## 📊 Performance Monitoring

### Medir tempo de renderização

```typescript
// Adicione no início do componente
const startTime = performance.now();

useEffect(() => {
  const endTime = performance.now();
  console.log(`⏱️ Render time: ${endTime - startTime}ms`);
}, []);
```

### Verificar re-renders

```typescript
// Instale
npm install @welldone-software/why-did-you-render

// Configure
import whyDidYouRender from '@welldone-software/why-did-you-render';

if (process.env.NODE_ENV === 'development') {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
```

### Lighthouse Score

```bash
# Build de produção
npm run build

# Inicie o servidor
npm start

# Abra Chrome DevTools > Lighthouse
# Execute auditoria para Performance/Accessibility/SEO
```

---

## 🔒 Segurança

### Sanitizar notas de usuário

```typescript
// Instalar
npm install dompurify

// Usar em FavoriteCard.tsx
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(favorito.notes) 
}} />
```

### Validar links compartilhados

```typescript
// src/app/favoritos/compartilhado/[token]/page.tsx
export default async function SharedFavoritesPage({ 
  params 
}: { 
  params: { token: string } 
}) {
  // Validar token no backend
  const isValid = await validateShareToken(params.token);
  
  if (!isValid) {
    return <div>Link inválido ou expirado</div>;
  }
  
  // ... resto do código
}
```

---

## 🎨 Customização de Tema

### Alterar cores principais

```css
/* src/styles/pharos-tokens.css */
:root {
  --ph-blue-500: #0066FF; /* Nova cor primária */
  --ph-navy-900: #1A1A2E; /* Novo navy */
}
```

### Adicionar tema escuro

```typescript
// src/contexts/ThemeContext.tsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

```css
/* src/styles/globals.css */
.dark {
  --ph-navy-900: #E5E5E5;
  --ph-offwhite: #1A1A1A;
  /* ... inverter cores */
}
```

---

## 📱 PWA (Progressive Web App)

### Adicionar Service Worker

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('pharos-favoritos-v1').then((cache) => {
      return cache.addAll([
        '/favoritos',
        '/offline.html',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Manifest

```json
// public/manifest.json
{
  "name": "Pharos Favoritos",
  "short_name": "Favoritos",
  "start_url": "/favoritos",
  "display": "standalone",
  "background_color": "#192233",
  "theme_color": "#054ADA",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 🧰 Ferramentas Úteis

### Extensões do Chrome
- **React DevTools** - Debug de componentes
- **Redux DevTools** - State management (se usar Redux)
- **Lighthouse** - Auditoria de performance
- **axe DevTools** - Verificação de acessibilidade
- **JSON Viewer** - Visualizar localStorage

### VSCode Extensions
- **ESLint** - Linting
- **Prettier** - Formatação
- **TypeScript Hero** - Import organization
- **Error Lens** - Inline error display
- **GitLens** - Git integration

### Online Tools
- **webhint.io** - Site scanner
- **webaim.org/resources/contrastchecker** - Contrast checker
- **pagespeed.web.dev** - Performance analysis

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Comunidade
- [Next.js Discord](https://discord.gg/nextjs)
- [React Discord](https://discord.gg/react)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 🆘 Problemas Comuns

### "Cannot read property 'length' of undefined"
**Solução:** Favoritos ainda não foram carregados. Use `isLoading` para mostrar skeleton.

```tsx
if (isLoading) return <FavoritesLoadingGrid />;
```

### Modal não fecha ao clicar fora
**Solução:** Adicione `stopPropagation` no conteúdo do modal.

```tsx
<div onClick={(e) => e.stopPropagation()}>
  {/* conteúdo */}
</div>
```

### Favoritos duplicados após refresh
**Solução:** Verifique se `isFavorito` está sendo checado antes de adicionar.

```tsx
if (!isFavorito(id)) {
  addFavorito(id);
}
```

### Imagens não carregam
**Solução:** Verifique se o domínio está na lista de `images.domains` no `next.config.js`.

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['seu-dominio.com'],
  },
};
```

---

## 💬 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique a documentação (`SISTEMA-FAVORITOS.md`)
2. Consulte este guia de troubleshooting
3. Procure no código por comentários `// TODO:` ou `// FIXME:`
4. Abra uma issue no repositório

---

**Happy coding! 🚀**

