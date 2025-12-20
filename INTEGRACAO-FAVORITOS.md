# Guia de Integração — Sistema de Favoritos

Este guia mostra como integrar o sistema de favoritos em componentes existentes da aplicação.

---

## 📍 Integração no Header/Menu Principal

Adicione um link para a página de favoritos com contador:

```tsx
// src/components/Header.tsx
import Link from 'next/link';
import { useFavoritos } from '@/contexts/FavoritosContext';

export default function Header() {
  const { getTotalCount } = useFavoritos();
  const count = getTotalCount();

  return (
    <header>
      {/* ... outros itens do menu ... */}
      
      <Link 
        href="/favoritos"
        className="relative flex items-center gap-2 px-4 py-2 text-pharos-slate-700 hover:text-pharos-blue-500"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        <span>Favoritos</span>
        
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pharos-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
    </header>
  );
}
```

---

## 🃏 Integração nos Cards de Imóveis

### Opção 1: Atualizar o ImovelCard.tsx existente

Adicione o hook de favoritos ao componente `ImovelCard`:

```tsx
// src/components/ImovelCard.tsx
'use client';

import { useFavoritos } from '@/contexts/FavoritosContext';

export default function ImovelCard({ id, /* ... outras props */ }) {
  const { isFavorito, toggleFavorito } = useFavoritos();
  const isFav = isFavorito(id);

  const handleToggleFavorito = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorito(id);
  };

  return (
    <article>
      {/* ... resto do card ... */}
      
      {/* Substituir o botão de favorito existente: */}
      <button
        onClick={handleToggleFavorito}
        className={`
          absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center 
          bg-white/90 backdrop-blur-sm rounded-full hover:bg-white 
          transition-all duration-200
          ${isFav ? 'text-red-500' : 'text-pharos-slate-700'}
        `}
        aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <svg
          className={`w-5 h-5 transition-colors ${isFav ? 'fill-current' : ''}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill={isFav ? 'currentColor' : 'none'}
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    </article>
  );
}
```

### Opção 2: Criar um componente reutilizável

Crie um botão de favorito isolado:

```tsx
// src/components/FavoriteButton.tsx
'use client';

import { useFavoritos } from '@/contexts/FavoritosContext';

interface FavoriteButtonProps {
  imovelId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({ 
  imovelId, 
  className = '',
  size = 'md' 
}: FavoriteButtonProps) {
  const { isFavorito, toggleFavorito } = useFavoritos();
  const isFav = isFavorito(imovelId);

  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorito(imovelId);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizes[size]} flex items-center justify-center 
        bg-white/90 backdrop-blur-sm rounded-full hover:bg-white 
        transition-all duration-200 shadow-sm hover:shadow-md
        ${isFav ? 'text-red-500' : 'text-pharos-slate-700'}
        ${className}
      `}
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <svg
        className={`${iconSizes[size]} transition-all ${isFav ? 'fill-current scale-110' : ''}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill={isFav ? 'currentColor' : 'none'}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
```

**Uso:**
```tsx
import FavoriteButton from '@/components/FavoriteButton';

<FavoriteButton imovelId={imovel.id} className="absolute top-4 right-4 z-20" />
```

---

## 📄 Integração na Página de Detalhes do Imóvel

Adicione um botão destacado para favoritar:

```tsx
// src/app/imoveis/[id]/page.tsx
import { useFavoritos } from '@/contexts/FavoritosContext';

export default function ImovelDetalhesPage({ params }: { params: { id: string } }) {
  const { isFavorito, toggleFavorito, addFavorito } = useFavoritos();
  const isFav = isFavorito(params.id);

  return (
    <div>
      {/* ... conteúdo da página ... */}
      
      <div className="flex gap-4">
        {/* Botão de favorito destacado */}
        <button
          onClick={() => toggleFavorito(params.id)}
          className={`
            flex-1 flex items-center justify-center gap-2 px-6 py-4 
            text-base font-bold rounded-lg transition-all
            ${isFav 
              ? 'bg-red-50 text-red-600 border-2 border-red-600 hover:bg-red-100' 
              : 'bg-white text-pharos-slate-700 border-2 border-pharos-slate-300 hover:border-pharos-blue-500'
            }
          `}
        >
          <svg
            className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill={isFav ? 'currentColor' : 'none'}
            strokeWidth={2}
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        </button>

        {/* Botão de compartilhar/comparar */}
        {isFav && (
          <Link
            href="/favoritos"
            className="px-6 py-4 text-sm font-medium text-pharos-blue-500 border-2 border-pharos-blue-500 rounded-lg hover:bg-pharos-blue-500 hover:text-white transition-colors"
          >
            Ver favoritos
          </Link>
        )}
      </div>
    </div>
  );
}
```

---

## 🔄 Integração no Layout Principal

Envolver a aplicação com o Provider:

```tsx
// src/app/layout.tsx
import { FavoritosProvider } from '@/contexts/FavoritosContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <FavoritosProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </FavoritosProvider>
      </body>
    </html>
  );
}
```

---

## 🎯 Toast Notifications (Opcional)

Adicione feedback visual ao favoritar:

```tsx
// src/components/FavoriteToast.tsx
'use client';

import { useEffect, useState } from 'react';
import { useFavoritos } from '@/contexts/FavoritosContext';

export default function FavoriteToast() {
  const { favoritos } = useFavoritos();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    const currentCount = favoritos.length;
    
    if (currentCount > lastCount) {
      setMessage('Imóvel adicionado aos favoritos');
      setShow(true);
    } else if (currentCount < lastCount) {
      setMessage('Imóvel removido dos favoritos');
      setShow(true);
    }
    
    setLastCount(currentCount);

    if (show) {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [favoritos.length, lastCount, show]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] animate-slide-up">
      <div className="bg-pharos-navy-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
        <Link 
          href="/favoritos"
          className="text-sm font-semibold text-pharos-blue-500 hover:underline"
        >
          Ver todos
        </Link>
      </div>
    </div>
  );
}
```

Adicione ao layout:
```tsx
import FavoriteToast from '@/components/FavoriteToast';

<FavoritosProvider>
  {children}
  <FavoriteToast />
</FavoritosProvider>
```

---

## 📊 Tracking de Analytics

```tsx
// Configurar eventos no Google Analytics
useEffect(() => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'fav_add', {
      imovel_id: imovelId,
      imovel_tipo: tipo,
      preco: preco,
      collection_id: collectionId,
    });
  }
}, [isFavorito]);
```

---

## ✅ Checklist de Integração

- [ ] Provider envolvendo a aplicação
- [ ] Link no header/menu com contador
- [ ] Botão de favorito nos cards de listagem
- [ ] Botão destacado na página de detalhes
- [ ] Toast notifications (opcional)
- [ ] Analytics configurado
- [ ] Testado em mobile e desktop
- [ ] Acessibilidade verificada (teclado e screen readers)

---

## 🐛 Troubleshooting

### "useFavoritos must be used within FavoritosProvider"
**Solução:** Certifique-se de que o componente está dentro do `<FavoritosProvider>`.

### Favoritos não persistem
**Solução:** Verifique se o localStorage está habilitado no navegador.

### Performance lenta com muitos favoritos
**Solução:** O sistema já está otimizado com `useMemo` e `useCallback`. Para +100 itens, ative a virtualização.

---

## 💡 Dicas

1. **Use o componente FavoriteButton** para manter consistência visual
2. **Adicione feedback visual** em todas as ações
3. **Teste em diferentes dispositivos** para garantir responsividade
4. **Implemente undo** para ações destrutivas
5. **Monitore analytics** para entender padrões de uso

---

**Pronto para usar! 🚀**

