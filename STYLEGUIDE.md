# Styleguide | Pharos Negócios Imobiliários

![Pharos Negócios Imobiliários](public/logo-pharos.svg)

Este styleguide define o padrão de identidade visual e os componentes UI da Pharos Negócios Imobiliários, com foco em uma experiência digital consistente, acessível e de alto padrão.

## Índice

- [1. Design Tokens](#1-design-tokens)
  - [1.1. Cores](#11-cores)
  - [1.2. Tipografia](#12-tipografia)
  - [1.3. Espaçamento](#13-espaçamento)
  - [1.4. Breakpoints](#14-breakpoints)
  - [1.5. Sombras](#15-sombras)
  - [1.6. Bordas](#16-bordas)
- [2. Logotipo](#2-logotipo)
  - [2.1. Versões do Logotipo](#21-versões-do-logotipo)
  - [2.2. Área de Proteção](#22-área-de-proteção)
  - [2.3. Tamanho Mínimo](#23-tamanho-mínimo)
- [3. Componentes](#3-componentes)
  - [3.1. Botões](#31-botões)
  - [3.2. Formulários](#32-formulários)
  - [3.3. Cards de Imóvel](#33-cards-de-imóvel)
  - [3.4. Navegação](#34-navegação)
- [4. Layout e Grid](#4-layout-e-grid)
- [5. Acessibilidade](#5-acessibilidade)
- [6. Boas Práticas](#6-boas-práticas)

---

## 1. Design Tokens

### 1.1. Cores

A paleta da Pharos foi cuidadosamente selecionada para refletir os valores da marca: confiança, sofisticação e exclusividade.

#### Cores Primárias

Azul Royal (#054ADA) - Representa confiança, estabilidade e profissionalismo.

```css
--color-primary: #054ADA;
--color-primary-50: #E6EFFC;
--color-primary-100: #CCDFF9;
--color-primary-200: #99BFF3;
--color-primary-300: #669FED;
--color-primary-400: #337FE7;
--color-primary-600: #043BAE;
--color-primary-700: #032C83;
--color-primary-800: #021D57;
--color-primary-900: #010E2C;
```

```jsx
// Uso no Tailwind
<div className="bg-primary text-white">Conteúdo</div>
<div className="bg-primary-100 text-primary-800">Conteúdo em tons</div>
```

#### Cores Secundárias

Azul Escuro (#192233) - Transmite elegância, sofisticação e seriedade.

```css
--color-secondary: #192233;
--color-secondary-50: #E8EBF0;
--color-secondary-100: #D1D6E0;
--color-secondary-200: #A3ADC2;
--color-secondary-300: #7684A3;
--color-secondary-400: #485B85;
--color-secondary-600: #141B29;
--color-secondary-700: #0F151F;
--color-secondary-800: #0A0E14;
--color-secondary-900: #05070A;
```

#### Cores Terciárias

Azul Claro (#A4BDE4) - Aporta um toque de leveza e tranquilidade, equilibrando os tons mais profundos.

```css
--color-tertiary: #A4BDE4;
--color-tertiary-50: #F6F9FD;
--color-tertiary-100: #EDF3FA;
--color-tertiary-200: #DBE7F5;
--color-tertiary-300: #C9DBF0;
--color-tertiary-400: #B6CFEA;
--color-tertiary-600: #8397B7;
--color-tertiary-700: #637189;
--color-tertiary-800: #424B5C;
--color-tertiary-900: #21262E;
```

### 1.2. Tipografia

A tipografia é essencial para comunicar a identidade exclusiva da marca.

#### Fontes

- **Inter**: Fonte principal utilizada em todo o site. Uma fonte moderna, elegante e altamente legível que transmite sofisticação, profissionalismo e clareza.

```jsx
// Configuração no Tailwind
font-sans    // Para todo o conteúdo do site (Inter)
font-serif   // Também usa Inter para consistência
font-heading // Também usa Inter para consistência
```

#### Escala Tipográfica

```jsx
// Headings
h1: text-5xl font-bold leading-tight
h2: text-4xl font-semibold leading-snug
h3: text-3xl font-semibold leading-snug
h4: text-2xl font-semibold leading-snug
h5: text-xl font-semibold leading-snug
h6: text-lg font-semibold leading-snug

// Body
p: text-base font-normal leading-relaxed
small: text-sm font-medium leading-none
label: text-sm font-medium leading-none
```

Para aplicar essa tipografia nos componentes:

```jsx
// Título principal
<h1 className="text-5xl font-bold leading-tight text-secondary-800">
  Título Elegante
</h1>

// Subtítulo
<h2 className="text-4xl font-semibold leading-snug text-secondary-700">
  Subtítulo Sofisticado
</h2>

// Parágrafo
<p className="text-base font-normal leading-relaxed text-secondary-600">
  Texto de corpo com boa legibilidade e contraste adequado para leitura confortável.
</p>

// Label/texto pequeno
<small className="text-sm font-medium leading-none text-secondary-500">
  Informação adicional ou label
</small>
```

### 1.3. Espaçamento

O sistema de espaçamento é baseado em múltiplos de 4px, criando ritmo e consistência visual.

```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-4: 16px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
--spacing-24: 96px;
--spacing-32: 128px;
```

```jsx
// Uso no Tailwind
<div className="p-4 m-8">Espaçamento de 16px padding e 32px margin</div>
```

### 1.4. Breakpoints

Sistema responsivo com breakpoints definidos para experiência consistente em diferentes dispositivos.

```jsx
screens: {
  'sm': '640px',   // Smartphones na horizontal
  'md': '768px',   // Tablets
  'lg': '1024px',  // Desktops menores
  'xl': '1280px',  // Desktops padrão
  '2xl': '1536px', // Telas grandes
}
```

### 1.5. Sombras

```jsx
boxShadow: {
  'card': '0 4px 16px rgba(0, 0, 0, 0.08)',
  'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
  'dropdown': '0 2px 8px rgba(0, 0, 0, 0.1)',
}
```

### 1.6. Bordas

```jsx
borderRadius: {
  'sm': '4px',
  'md': '8px',
  'lg': '16px',
}
```

## 2. Logotipo

O logotipo da Pharos representa a missão da empresa: ser um farol (pharos) que guia seus clientes para as melhores decisões imobiliárias.

### 2.1. Versões do Logotipo

- **Padrão**: Versão principal para uso em fundos claros (logo-pharos.svg)
- **Negativa**: Versão para uso em fundos escuros (logo-pharos-white.svg)
- **Símbolo**: Farol e triângulo isolados para uso em espaços reduzidos

### 2.2. Área de Proteção

Mantenha um espaço livre ao redor do logotipo de pelo menos 1/4 da altura total do logo.

### 2.3. Tamanho Mínimo

- **Digital**: 120px de largura
- **Impresso**: 35mm de largura

## 3. Componentes

### 3.1. Botões

Os botões possuem estados claros e acessíveis para interação.

#### Variações

```jsx
// Primário - Para ações principais
<Button variant="primary">Botão Primário</Button>

// Secundário - Para ações alternativas
<Button variant="secondary">Botão Secundário</Button>

// Ghost - Para ações terciárias/discretas
<Button variant="ghost">Botão Ghost</Button>
```

#### Estados

- Normal: Estado padrão
- Hover: Feedback visual ao passar o mouse
- Active: Feedback ao clicar
- Disabled: Indisponível para interação

```jsx
// Exemplo de uso com ícones
<Button 
  variant="primary" 
  icon={<SearchIcon />} 
  iconPosition="left"
>
  Buscar Imóveis
</Button>
```

### 3.2. Formulários

Campos de formulário consistentes com validação clara.

```jsx
// Campo de texto básico
<Input 
  label="Nome completo" 
  placeholder="Digite seu nome" 
  error={errors.name} 
/>

// Com ícone
<Input 
  label="Email" 
  placeholder="seu@email.com" 
  leftIcon={<EmailIcon />} 
/>

// Com erro
<Input 
  label="Telefone" 
  placeholder="(47) 99999-9999" 
  error="Telefone inválido" 
/>
```

#### Estados

- Normal: Estado padrão
- Focus: Feedback visual ao focar
- Error: Indicação de erro de validação
- Disabled: Campo indisponível

### 3.3. Cards de Imóvel

Cards otimizados para exibição de imóveis com informações claras e relevantes.

```jsx
<PropertyCard
  id="ap-101"
  title="Apartamento de Luxo"
  price={1200000}
  location="Centro, Balneário Camboriú"
  image="/imoveis/apartamento-101.jpg"
  bedrooms={3}
  bathrooms={2}
  area={120}
/>
```

### 3.4. Navegação

Header responsivo com estados para scroll e versão mobile. Footer organizado por seções temáticas.

```jsx
// Header com scroll detection
<Header />

// Footer com links agrupados
<Footer />
```

## 4. Layout e Grid

O sistema de grid é baseado em 12 colunas, com gutter de 16px e container centralizado.

```jsx
// Container centralizado
<div className="container">
  <!-- Conteúdo -->
</div>

// Grid básico
<div className="grid-container">
  <!-- Cards de imóveis -->
</div>
```

## 5. Acessibilidade

Todos os componentes seguem as diretrizes WCAG 2.1 AA:

- Contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande
- Estrutura semântica (use `<header>`, `<main>`, `<section>`, `<footer>`)
- Navegação por teclado suportada
- Atributos ARIA onde necessário

```jsx
// Exemplo de botão acessível
<button
  aria-label="Buscar imóveis"
  role="button"
  className="btn btn-primary"
>
  <span className="sr-only">Buscar</span>
  <SearchIcon />
</button>
```

## 6. Boas Práticas

- Use componentes reutilizáveis para manter consistência
- Adote abordagem mobile-first para todas as interfaces
- Otimize imagens com `loading="lazy"` e formato WebP
- Monitore CLS (Cumulative Layout Shift) para estabilidade visual
- Mantenha ritmo vertical baseado em múltiplos de 8px 