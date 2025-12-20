# Estrutura de Imagens do Site Pharos

Esta pasta contém todas as imagens utilizadas no site, organizadas de forma estruturada e semântica.

## 📁 Estrutura de Pastas

### `/logos`
Contém todas as variações da logo da Pharos:
- `Logo-pharos.webp` - Logo principal em formato WebP (otimizado)
- `logo-pharos.svg` - Logo em SVG
- `logo-pharos-white.svg` - Logo em branco para fundos escuros
- `logo-pharos-new.svg` - Nova versão da logo
- `logo-pharos-new-white.svg` - Nova versão em branco
- `logo-pharos-original.svg` - Logo original

**Uso recomendado:**
- Header: `/images/logos/Logo-pharos.webp`
- Footer: `/images/logos/Logo-pharos.webp` (com filtro para branco)

---

### `/banners`
Imagens de banners e fundos para seções principais:
- `banner-home.jpg` - Banner principal da página inicial
- `balneario-camboriu.jpg` - Imagem da cidade para seções institucionais

**Uso recomendado:**
- Hero sections
- Backgrounds de seções destacadas

---

### `/bairros`
Fotos representativas de cada bairro:
- `barra-sul.jpg` - Bairro Barra Sul
- `centro.jpg` - Centro de Balneário Camboriú
- `pioneiros.jpg` - Bairro Pioneiros

**Uso recomendado:**
- Páginas de bairros (`/imoveis/bairro/[slug]`)
- Cards de navegação por região
- Seções de destaque de localização

---

### `/imoveis`
Fotos de imóveis e placeholders:
- Imóveis reais:
  - `apt-luxo-1.jpg` - Apartamento de luxo
  - `casa-1.jpg` - Casa
  - `cobertura-1.jpg` - Cobertura
- Placeholders por tipo:
  - `placeholder-apt.jpg` - Placeholder para apartamentos
  - `placeholder-casa.jpg` - Placeholder para casas
  - `placeholder-cobertura.jpg` - Placeholder para coberturas

**Uso recomendado:**
- Listagens de imóveis
- Cards de propriedades
- Galerias de fotos

---

### `/depoimentos`
Fotos de clientes para depoimentos:
- `depoimento-1.jpg` - Cliente 1
- `depoimento-2.jpg` - Cliente 2
- `depoimento-3.jpg` - Cliente 3

**Uso recomendado:**
- Seção de depoimentos
- Página "Sobre Nós"
- Materiais de marketing

---

### `/placeholders`
Imagens genéricas e de fallback:
- `placeholder-image.svg` - Placeholder genérico em SVG
- `placeholder-imovel.jpg` - Placeholder para imóveis (JPG)
- `placeholder-imovel.svg` - Placeholder para imóveis (SVG)
- `placeholder-data.txt` - Dados de placeholder
- `placeholder.html` - Template HTML de placeholder

**Uso recomendado:**
- Imagens não disponíveis
- Loading states
- Desenvolvimento e testes

---

### `/icons`
Ícones e assets SVG do sistema:
- `file.svg` - Ícone de arquivo
- `globe.svg` - Ícone de globo/mundo
- `window.svg` - Ícone de janela
- `next.svg` - Logo Next.js
- `vercel.svg` - Logo Vercel

**Uso recomendado:**
- Ícones do sistema
- Assets de frameworks
- Elementos de UI

---

## 🎨 Boas Práticas

### Nomenclatura
- Use kebab-case: `nome-do-arquivo.ext`
- Seja descritivo: `apartamento-3-quartos-frente-mar.jpg`
- Inclua tipo quando relevante: `placeholder-apt.jpg`

### Otimização
- **WebP** para fotos principais (menor tamanho, alta qualidade)
- **SVG** para logos e ícones (escalável, leve)
- **JPG** para fotos quando WebP não estiver disponível
- **PNG** para imagens com transparência

### Dimensões Recomendadas
- **Logos:** 
  - Header: 120x32px (responsive até 150x40px)
  - Footer: 140x35px (responsive até 180x45px)
- **Banners:** 1920x800px (hero sections)
- **Imóveis:** 1200x800px (proporção 3:2)
- **Bairros:** 1200x800px (proporção 3:2)
- **Depoimentos:** 400x400px (quadrado para avatares)

### Acessibilidade
- Sempre use `alt` text descritivo
- Implemente lazy loading para performance
- Use `priority` apenas para imagens above-the-fold

---

## 🔄 Migração de Caminhos

Todos os caminhos de imagem no código devem seguir este padrão:

```tsx
// ❌ Antigo
<Image src="/logo-pharos.svg" ... />
<Image src="/img/logo.webp" ... />
<Image src="/bairros/centro.jpg" ... />

// ✅ Novo
<Image src="/images/logos/logo-pharos.svg" ... />
<Image src="/images/logos/Logo-pharos.webp" ... />
<Image src="/images/bairros/centro.jpg" ... />
```

---

## 📊 Estrutura Visual

```
public/images/
├── logos/           (6 arquivos) - Identidade visual
├── banners/         (2 arquivos) - Hero e fundos
├── bairros/         (3 arquivos) - Fotos de regiões
├── imoveis/         (6 arquivos) - Propriedades + placeholders
├── depoimentos/     (3 arquivos) - Clientes
├── placeholders/    (5 arquivos) - Fallbacks genéricos
└── icons/           (5 arquivos) - Ícones e assets SVG
```

**Total:** 7 pastas organizadas semanticamente
**Benefícios:**
- ✅ Fácil localização de assets
- ✅ Manutenção simplificada
- ✅ Escalabilidade garantida
- ✅ SEO otimizado (caminhos descritivos)
- ✅ Performance (organização por uso)

---

## 🚀 Próximos Passos

1. Atualizar todos os caminhos de imagem no código
2. Implementar otimização automática de imagens (sharp/next-image)
3. Criar script de build para gerar versões WebP automaticamente
4. Implementar CDN para servir imagens otimizadas
5. Adicionar versionamento de assets (cache busting)

