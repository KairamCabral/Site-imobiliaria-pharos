# 💡 Exemplos Práticos — Sistema de Cores Pharos

**Guia rápido de uso com exemplos reais**

---

## 📋 Índice

1. [Header e Navegação](#1-header-e-navegação)
2. [Hero Section](#2-hero-section)
3. [Cards de Imóveis](#3-cards-de-imóveis)
4. [Formulários](#4-formulários)
5. [Botões e CTAs](#5-botões-e-ctas)
6. [Listagens e Filtros](#6-listagens-e-filtros)
7. [Footer](#7-footer)
8. [Estados e Feedback](#8-estados-e-feedback)

---

## 1. Header e Navegação

### Tailwind (Recomendado)

```jsx
<header className="bg-pharos-navy-900 text-pharos-base-white border-b border-pharos-slate-300">
  <div className="container mx-auto px-4 py-6 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center">
      <img src="/logo-pharos-white.svg" alt="Pharos" className="h-10" />
    </div>
    
    {/* Navegação */}
    <nav className="hidden md:flex items-center gap-8">
      <a 
        href="/imoveis" 
        className="text-pharos-base-white hover:text-pharos-gold-500 transition-colors"
      >
        Imóveis
      </a>
      <a 
        href="/empreendimentos" 
        className="text-pharos-base-white hover:text-pharos-gold-500 transition-colors"
      >
        Empreendimentos
      </a>
      <a 
        href="/sobre" 
        className="text-pharos-base-white hover:text-pharos-gold-500 transition-colors"
      >
        Sobre
      </a>
    </nav>
    
    {/* CTA */}
    <button className="bg-pharos-blue-500 hover:bg-pharos-blue-600 active:bg-pharos-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors touch-target">
      Anunciar Imóvel
    </button>
  </div>
</header>
```

### CSS Puro

```css
.header {
  background-color: var(--ph-navy-900);
  color: var(--ph-white);
  border-bottom: 1px solid var(--ph-slate-300);
}

.header-nav-link {
  color: var(--ph-white);
  transition: color var(--ph-transition-base);
}

.header-nav-link:hover {
  color: var(--ph-gold);
}

.header-cta {
  background-color: var(--ph-blue-500);
  color: var(--ph-white);
  padding: 12px 24px;
  border-radius: var(--ph-radius-lg);
  min-height: var(--ph-touch-target);
  transition: background-color var(--ph-transition-base);
}

.header-cta:hover {
  background-color: var(--ph-blue-600);
}
```

---

## 2. Hero Section

### Tailwind com Gradiente

```jsx
<section className="relative min-h-[600px] flex items-center">
  {/* Background com gradiente */}
  <div 
    className="absolute inset-0 z-0"
    style={{
      background: 'linear-gradient(135deg, #054ADA 0%, #192233 60%)',
    }}
  />
  
  {/* Foto em P&B com overlay (opcional) */}
  {/* <img 
    src="/hero-bc.jpg" 
    className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-overlay opacity-30"
  /> */}
  
  {/* Conteúdo */}
  <div className="container mx-auto px-4 z-10 relative">
    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
      Encontre o Imóvel<br />dos Seus Sonhos
    </h1>
    <p className="text-xl text-white/90 mb-8 max-w-2xl">
      Apartamentos, casas e coberturas de alto padrão em Balneário Camboriú
    </p>
    
    {/* SearchBar aqui */}
    <div className="bg-white rounded-2xl p-6 shadow-xl max-w-4xl">
      {/* Componente SearchBar */}
    </div>
  </div>
</section>
```

### CSS Puro

```css
.hero {
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  background: var(--ph-gradient-primary);
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ph-overlay-light);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  color: var(--ph-white);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: var(--ph-font-bold);
  color: var(--ph-white);
  margin-bottom: var(--ph-space-6);
}

.hero-search {
  background: var(--ph-white);
  border-radius: var(--ph-radius-2xl);
  padding: var(--ph-space-6);
  box-shadow: var(--ph-shadow-xl);
}
```

---

## 3. Cards de Imóveis

### Tailwind

```jsx
<div className="bg-white rounded-2xl border border-pharos-slate-300 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
  {/* Imagem */}
  <div className="relative h-64 overflow-hidden">
    <img 
      src="/imovel.jpg" 
      alt="Apartamento" 
      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
    />
    
    {/* Badge */}
    <div className="absolute top-4 right-4">
      <span className="bg-pharos-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
        Lançamento
      </span>
    </div>
  </div>
  
  {/* Conteúdo */}
  <div className="p-6">
    {/* Título */}
    <h3 className="text-pharos-navy-900 text-xl font-semibold mb-2">
      Apartamento de Luxo na Barra Sul
    </h3>
    
    {/* Preço */}
    <p className="text-pharos-blue-500 text-2xl font-bold mb-4">
      R$ 1.850.000
    </p>
    
    {/* Localização */}
    <p className="text-pharos-slate-500 text-sm mb-4 flex items-center gap-2">
      <span className="accent-gold">📍</span>
      Barra Sul, Balneário Camboriú
    </p>
    
    {/* Características */}
    <div className="flex items-center gap-4 text-pharos-slate-500 text-sm mb-6">
      <span className="flex items-center gap-1">
        <span>🛏️</span> 3 quartos
      </span>
      <span className="flex items-center gap-1">
        <span>🚿</span> 2 banheiros
      </span>
      <span className="flex items-center gap-1">
        <span>📐</span> 120m²
      </span>
    </div>
    
    {/* CTA */}
    <button className="w-full bg-pharos-blue-500 hover:bg-pharos-blue-600 text-white py-3 rounded-lg font-medium transition-colors">
      Ver Detalhes
    </button>
  </div>
</div>
```

### CSS Puro

```css
.property-card {
  background: var(--ph-white);
  border: 1px solid var(--ph-slate-300);
  border-radius: var(--ph-radius-2xl);
  overflow: hidden;
  box-shadow: var(--ph-shadow-md);
  transition: all var(--ph-transition-slow);
}

.property-card:hover {
  box-shadow: var(--ph-shadow-hover);
  transform: translateY(-4px);
}

.property-card-title {
  color: var(--ph-navy-900);
  font-size: 1.25rem;
  font-weight: var(--ph-font-semibold);
  margin-bottom: var(--ph-space-2);
}

.property-card-price {
  color: var(--ph-blue-500);
  font-size: 1.5rem;
  font-weight: var(--ph-font-bold);
  margin-bottom: var(--ph-space-4);
}

.property-card-location {
  color: var(--ph-slate-500);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--ph-space-2);
}

.property-card-meta {
  color: var(--ph-slate-500);
  font-size: 0.875rem;
}

.property-card-badge {
  background: var(--ph-blue-500);
  color: var(--ph-white);
  padding: 4px 12px;
  border-radius: var(--ph-radius-md);
  font-size: 0.875rem;
}
```

---

## 4. Formulários

### Tailwind

```jsx
<form className="bg-white rounded-2xl border border-pharos-slate-300 p-8 shadow-card">
  {/* Campo de texto */}
  <div className="mb-6">
    <label 
      htmlFor="name" 
      className="block text-pharos-slate-700 font-semibold mb-2"
    >
      Nome Completo *
    </label>
    <input
      type="text"
      id="name"
      className="w-full px-4 py-3 border border-pharos-slate-300 rounded-lg text-pharos-slate-700 focus:border-pharos-blue-500 focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2 transition-all"
      placeholder="Digite seu nome"
    />
    <p className="text-pharos-slate-500 text-sm mt-1">
      Como gostaria de ser chamado
    </p>
  </div>
  
  {/* Campo com erro */}
  <div className="mb-6">
    <label 
      htmlFor="email" 
      className="block text-pharos-slate-700 font-semibold mb-2"
    >
      E-mail *
    </label>
    <input
      type="email"
      id="email"
      className="w-full px-4 py-3 border border-red-500 rounded-lg text-pharos-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
      placeholder="seu@email.com"
    />
    <p className="text-red-500 text-sm mt-1">
      Por favor, insira um e-mail válido
    </p>
  </div>
  
  {/* Select */}
  <div className="mb-6">
    <label 
      htmlFor="tipo" 
      className="block text-pharos-slate-700 font-semibold mb-2"
    >
      Tipo de Imóvel
    </label>
    <select
      id="tipo"
      className="w-full px-4 py-3 border border-pharos-slate-300 rounded-lg text-pharos-slate-700 focus:border-pharos-blue-500 focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2 transition-all"
    >
      <option value="">Selecione...</option>
      <option value="apartamento">Apartamento</option>
      <option value="casa">Casa</option>
      <option value="cobertura">Cobertura</option>
    </select>
  </div>
  
  {/* Checkbox */}
  <div className="mb-6">
    <label className="flex items-start gap-3 cursor-pointer">
      <input 
        type="checkbox" 
        className="mt-1 w-5 h-5 text-pharos-blue-500 border-pharos-slate-300 rounded focus:ring-2 focus:ring-pharos-blue-500"
      />
      <span className="text-pharos-slate-700 text-sm">
        Aceito receber informações sobre lançamentos e ofertas exclusivas
      </span>
    </label>
  </div>
  
  {/* Botão submit */}
  <button 
    type="submit"
    className="w-full bg-pharos-blue-500 hover:bg-pharos-blue-600 active:bg-pharos-blue-700 text-white py-4 rounded-lg font-semibold transition-colors touch-target"
  >
    Enviar Mensagem
  </button>
</form>
```

### CSS Puro

```css
.form-container {
  background: var(--ph-white);
  border: 1px solid var(--ph-slate-300);
  border-radius: var(--ph-radius-2xl);
  padding: var(--ph-space-8);
  box-shadow: var(--ph-shadow-md);
}

.form-label {
  display: block;
  color: var(--ph-slate-700);
  font-weight: var(--ph-font-semibold);
  margin-bottom: var(--ph-space-2);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--ph-slate-300);
  border-radius: var(--ph-radius-md);
  color: var(--ph-slate-700);
  transition: all var(--ph-transition-base);
}

.form-input:focus {
  border-color: var(--ph-blue-500);
  outline: 2px solid var(--ph-blue-500);
  outline-offset: 2px;
}

.form-input.error {
  border-color: var(--ph-error);
}

.form-helper {
  color: var(--ph-slate-500);
  font-size: 0.875rem;
  margin-top: var(--ph-space-1);
}

.form-error {
  color: var(--ph-error);
  font-size: 0.875rem;
  margin-top: var(--ph-space-1);
}

.form-submit {
  width: 100%;
  background: var(--ph-blue-500);
  color: var(--ph-white);
  padding: 16px;
  border-radius: var(--ph-radius-lg);
  font-weight: var(--ph-font-semibold);
  min-height: var(--ph-touch-target);
  transition: background var(--ph-transition-base);
}

.form-submit:hover {
  background: var(--ph-blue-600);
}
```

---

## 5. Botões e CTAs

### Tailwind

```jsx
{/* Primário */}
<button className="bg-pharos-blue-500 hover:bg-pharos-blue-600 active:bg-pharos-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2">
  Agendar Visita
</button>

{/* Secundário */}
<button className="bg-transparent border-2 border-pharos-blue-500 text-pharos-blue-500 hover:bg-pharos-blue-500 hover:text-white px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2">
  Ver Mais
</button>

{/* Ghost */}
<button className="bg-transparent text-pharos-blue-500 hover:bg-pharos-blue-500/10 px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-offset-2">
  Cancelar
</button>

{/* Desabilitado */}
<button className="bg-pharos-blue-500 text-white px-6 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed" disabled>
  Indisponível
</button>
```

### CSS Puro

```css
.btn {
  padding: 12px 24px;
  border-radius: var(--ph-radius-lg);
  font-weight: var(--ph-font-medium);
  min-height: var(--ph-touch-target);
  transition: all var(--ph-transition-base);
  cursor: pointer;
}

.btn-primary {
  background: var(--ph-blue-500);
  color: var(--ph-white);
}

.btn-primary:hover {
  background: var(--ph-blue-600);
}

.btn-primary:active {
  background: var(--ph-blue-700);
}

.btn-primary:focus {
  outline: 2px solid var(--ph-blue-500);
  outline-offset: 2px;
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--ph-blue-500);
  color: var(--ph-blue-500);
}

.btn-secondary:hover {
  background: var(--ph-blue-500);
  color: var(--ph-white);
}

.btn-ghost {
  background: transparent;
  color: var(--ph-blue-500);
}

.btn-ghost:hover {
  background: rgba(5, 74, 218, 0.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 6. Listagens e Filtros

### Tailwind

```jsx
<div className="bg-pharos-base-off min-h-screen">
  <div className="container mx-auto px-4 py-8">
    {/* Barra de filtros */}
    <div className="bg-white rounded-xl border border-pharos-slate-300 p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-pharos-blue-500 text-white rounded-lg text-sm font-medium">
          Todos (243)
        </button>
        <button className="px-4 py-2 bg-transparent text-pharos-slate-700 hover:bg-pharos-slate-300/30 rounded-lg text-sm font-medium">
          Apartamentos (156)
        </button>
        <button className="px-4 py-2 bg-transparent text-pharos-slate-700 hover:bg-pharos-slate-300/30 rounded-lg text-sm font-medium">
          Casas (67)
        </button>
      </div>
      
      <button className="text-pharos-slate-500 hover:text-pharos-slate-700 flex items-center gap-2">
        <span>Ordenar</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    
    {/* Grid de imóveis */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* PropertyCard aqui */}
    </div>
  </div>
</div>
```

---

## 7. Footer

### Tailwind

```jsx
<footer className="bg-pharos-navy-900 text-pharos-base-white">
  <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
      {/* Logo e descrição */}
      <div>
        <img src="/logo-pharos-white.svg" alt="Pharos" className="h-10 mb-4" />
        <p className="text-pharos-base-white/80 text-sm">
          Imóveis de alto padrão em Balneário Camboriú
        </p>
      </div>
      
      {/* Links */}
      <div>
        <h4 className="font-semibold mb-4">Navegação</h4>
        <ul className="space-y-2 text-sm text-pharos-base-white/80">
          <li><a href="/imoveis" className="hover:text-pharos-gold-500 transition-colors">Imóveis</a></li>
          <li><a href="/empreendimentos" className="hover:text-pharos-gold-500 transition-colors">Empreendimentos</a></li>
          <li><a href="/sobre" className="hover:text-pharos-gold-500 transition-colors">Sobre</a></li>
        </ul>
      </div>
      
      {/* Contato */}
      <div>
        <h4 className="font-semibold mb-4">Contato</h4>
        <ul className="space-y-2 text-sm text-pharos-base-white/80">
          <li>(47) 3333-3333</li>
          <li>contato@pharos.com.br</li>
        </ul>
      </div>
      
      {/* Redes sociais */}
      <div>
        <h4 className="font-semibold mb-4">Redes Sociais</h4>
        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 bg-pharos-blue-500 rounded-full flex items-center justify-center hover:bg-pharos-blue-600 transition-colors">
            📘
          </a>
          <a href="#" className="w-10 h-10 bg-pharos-blue-500 rounded-full flex items-center justify-center hover:bg-pharos-blue-600 transition-colors">
            📷
          </a>
        </div>
      </div>
    </div>
    
    {/* Divisor dourado (detalhe) */}
    <div className="border-t border-pharos-gold-500 mb-8"></div>
    
    {/* Copyright */}
    <div className="text-center text-sm text-pharos-base-white/60">
      © 2025 Pharos Imobiliária. Todos os direitos reservados.
    </div>
  </div>
</footer>
```

---

## 8. Estados e Feedback

### Tailwind

```jsx
{/* Sucesso */}
<div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
  <span className="text-pharos-success text-xl">✓</span>
  <div>
    <h4 className="font-semibold text-pharos-navy-900 mb-1">Mensagem enviada!</h4>
    <p className="text-pharos-slate-700 text-sm">Entraremos em contato em breve.</p>
  </div>
</div>

{/* Erro */}
<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
  <span className="text-pharos-error text-xl">⚠</span>
  <div>
    <h4 className="font-semibold text-pharos-navy-900 mb-1">Erro ao enviar</h4>
    <p className="text-pharos-error text-sm">Por favor, verifique os campos e tente novamente.</p>
  </div>
</div>

{/* Warning */}
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
  <span className="text-pharos-warning text-xl">⚠</span>
  <div>
    <h4 className="font-semibold text-pharos-navy-900 mb-1">Atenção</h4>
    <p className="text-pharos-slate-700 text-sm">Alguns campos estão incompletos.</p>
  </div>
</div>
```

---

## ✅ Resumo de Classes Mais Usadas

### Backgrounds
```
bg-pharos-navy-900       → Header, footer
bg-pharos-blue-500       → Botões primários
bg-pharos-base-white     → Cards, formulários
bg-pharos-base-off       → Body principal
```

### Textos
```
text-pharos-navy-900     → Títulos principais
text-pharos-slate-700    → Texto principal
text-pharos-slate-500    → Texto secundário
text-pharos-blue-500     → Links, CTAs
text-pharos-gold-500     → Detalhes (ícones)
```

### Bordas
```
border-pharos-slate-300  → Bordas padrão
border-pharos-blue-500   → Bordas em focus
```

### Sombras
```
shadow-card              → Cards padrão
shadow-card-hover        → Cards hover
shadow-xl                → Modais, hero
```

---

**Pronto para usar!** 🚀  
Copie e cole os exemplos acima e ajuste conforme necessário.

