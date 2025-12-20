# Imobiliária Pharos - Negócios Imobiliários

Site institucional de alto padrão para a Imobiliária Pharos em Balneário Camboriú, focado em performance, SEO e experiência mobile.

## 📋 Tecnologias Utilizadas

- **Next.js 14**: Framework React com SSR/SSG otimizado para SEO
- **TypeScript**: Tipagem estática para maior segurança e produtividade
- **Tailwind CSS**: Utilitários CSS para desenvolvimento rápido e responsivo
- **ESLint/Prettier**: Ferramentas de linting e formatação de código
- **Server Components**: Melhor performance e SEO com renderização no servidor
- **Responsivo**: Totalmente adaptado para todos os dispositivos

## 🚀 Configuração do Ambiente

### Requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior
- Recomendado: usar nvm para gerenciar versões do Node

### Instalação

```bash
# Se usar nvm, ativar Node 20 (lê do arquivo .nvmrc)
nvm use

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor de desenvolvimento estará disponível em [http://localhost:3000](http://localhost:3000).

### Comandos Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Iniciar servidor de produção
npm run start

# Executar linting
npm run lint
```

## 📂 Estrutura do Projeto

### Principais Diretórios

- `/src/app`: Páginas da aplicação (App Router)
  - `/page.tsx`: Homepage
  - `/imoveis/page.tsx`: Listagem de imóveis
  - `/imoveis/[id]/page.tsx`: Página de detalhes do imóvel
  - `/sobre/page.tsx`: Página institucional
  - `/contato/page.tsx`: Página de contato com formulário e mapa ✅
  - `/blog/page.tsx`: Blog com listagem de posts ✅
  - `/blog/[slug]/page.tsx`: Página de detalhes do post ✅

- `/src/components`: Componentes reutilizáveis
  - `/Header.tsx`: Cabeçalho do site
  - `/Footer.tsx`: Rodapé do site
  - `/ImovelCard.tsx`: Card de imóvel para listagens
  - `/forms`: Componentes de formulário
  - `/ui`: Componentes de interface

- `/src/lib`: Funções auxiliares e utilitários
  - `/api.ts`: Funções para consumo de API
  - `/utils`: Utilitários gerais

### Convenções

- **Server Components**: Usados por padrão para melhor SEO e performance
- **Client Components**: Marcados com `'use client'` quando necessário
- **SEO**: Cada página implementa seu próprio objeto `metadata`
- **Responsivo**: Design mobile-first com breakpoints para tablets e desktop

## 🌐 Escopo do Projeto e Status

O site inclui as seguintes seções principais:

1. **Home**: Apresentação da imobiliária e imóveis em destaque ✅
2. **Imóveis**: Listagem e busca avançada de propriedades ✅
3. **Sobre**: Informações sobre a empresa, equipe e missão ✅
4. **Contato**: Formulário de contato, informações e mapa ✅
5. **Blog**: Conteúdo sobre mercado imobiliário, listagem e posts individuais ✅

### Funcionalidades Implementadas

- Design responsivo para todos os dispositivos
- Formulários funcionais para busca de imóveis e contato
- Integração de mapas para localização da imobiliária
- Galeria de imagens nos detalhes dos imóveis
- Seção de blog com categorias e posts em destaque
- SEO otimizado com metadados personalizados
- Breadcrumbs para melhor navegação

### Próximos Passos

- Integração com CMS para gerenciamento de conteúdo
- Implementação de autenticação para área do cliente
- Desenvolvimento de funcionalidade de favoritos
- Integração com API de WhatsApp para contato rápido
- Implementação de filtros avançados na busca de imóveis
- Otimização de performance e Core Web Vitals

## 📚 Links Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ESLint](https://eslint.org/docs/user-guide/getting-started)

## 📝 Licença

Este projeto é proprietário da Imobiliária Pharos - Todos os direitos reservados.
