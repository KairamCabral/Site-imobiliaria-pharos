# 📄 Exportação de PDF - Pharos Favoritos

## Visão Geral

Sistema completo de exportação de relatórios PDF profissionais para os imóveis favoritos, com design premium e branding Pharos.

---

## ✨ Funcionalidades

### 1. **Exportação de Favoritos** (`exportFavoritosToPDF`)
Gera um relatório completo em PDF dos imóveis salvos como favoritos.

**Características:**
- ✅ Design profissional com identidade visual Pharos
- ✅ Cabeçalho com branding (logo, título, data)
- ✅ Resumo executivo (total de imóveis, valor total, valor médio)
- ✅ Tabela resumida com dados principais
- ✅ Páginas de detalhes com informações completas de cada imóvel
- ✅ Rodapé padronizado em todas as páginas
- ✅ Numeração de páginas automática
- ✅ Suporte a notas personalizadas

### 2. **Exportação de Comparação** (`exportComparisonToPDF`)
Gera uma tabela comparativa lado a lado dos imóveis selecionados.

**Características:**
- ✅ Orientação paisagem (landscape) para melhor visualização
- ✅ Tabela comparativa com características chave
- ✅ Design clean e fácil de ler
- ✅ Ideal para decisões rápidas

---

## 🎨 Design e Branding

### Paleta de Cores Pharos
```typescript
COLORS = {
  navy: '#192233',      // Cabeçalho, títulos
  blue: '#054ADA',      // Ação primária, destaques
  slate: '#475569',     // Texto principal
  slateLight: '#94A3B8', // Texto secundário
  gold: '#C89C4D',      // Acentos premium
  offWhite: '#F7F9FC',  // Fundos
  white: '#FFFFFF',     // Background
}
```

### Estrutura do PDF

#### **Página 1: Resumo**
```
┌─────────────────────────────────────┐
│ PHAROS                              │ ← Cabeçalho Navy
│ Imobiliária                         │
│ Relatório de Favoritos - [Coleção] │
│ Gerado em DD/MM/AAAA                │
├─────────────────────────────────────┤
│ Resumo                              │
│ • Total de imóveis: X               │
│ • Valor total: R$ XXX.XXX           │
│ • Valor médio: R$ XXX.XXX           │
├─────────────────────────────────────┤
│ Imóveis Selecionados                │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ # │ Imóvel │ Local │ Q/S │...│  │ ← Tabela
│ │ 1 │ Casa...│ BC    │ 3/2 │...│  │
│ └───────────────────────────────┘  │
├─────────────────────────────────────┤
│ Pharos | www.pharos.com.br | Pág 1│ ← Rodapé
└─────────────────────────────────────┘
```

#### **Página 2+: Detalhes**
Cada imóvel exibido em um card com:
- 🔢 Número de identificação
- 📍 Título e localização completa
- 🏠 Tipo e status
- 🛏️ Características (quartos, suítes, vagas, área)
- 💰 Preço destacado em azul
- ✨ Diferenciais
- 📝 Notas personalizadas (se houver)

---

## 🚀 Uso

### No Componente de Favoritos

```tsx
import { exportFavoritosToPDF } from '@/utils/pdfExport';

const handleExportClick = async () => {
  await exportFavoritosToPDF(
    favoritos,           // Array de Favorito[]
    'Nome da Coleção'    // string | undefined
  );
};
```

### Na Comparação

```tsx
import { exportComparisonToPDF } from '@/utils/pdfExport';

const handleExportComparison = async () => {
  await exportComparisonToPDF(favoritos);
};
```

---

## 📊 Dados Exportados

### Tabela Resumida
| Campo | Exemplo |
|-------|---------|
| # | 1 |
| Imóvel | Apartamento de Alto Padrão... |
| Localização | Centro, Balneário Camboriú |
| Q/S | 3/2 |
| Vagas | 2 |
| Área | 180 m² |
| Valor | R$ 1.850.000 |

### Detalhes Completos
- ✅ Título completo
- ✅ Tipo e status (Pronto para morar, Lançamento, etc.)
- ✅ Endereço completo
- ✅ Características (quartos, suítes, vagas, área)
- ✅ Preço
- ✅ Diferenciais (até 3 primeiros)
- ✅ Notas personalizadas do usuário

---

## 💡 Feedback Visual

### Loading State
```
┌─────────────────────────────┐
│ ⚪ Gerando PDF...            │ ← Toast animado
└─────────────────────────────┘
```

### Success State
```
┌─────────────────────────────┐
│ ✅ PDF gerado com sucesso!  │ ← Toast verde
└─────────────────────────────┘
```

### Error State
```
┌─────────────────────────────┐
│ ❌ Erro ao gerar o PDF      │ ← Toast vermelho
└─────────────────────────────┘
```

---

## 🎯 Analytics

Eventos rastreados:
- `favorites_export_pdf` - Exportação de favoritos
  - `collection`: nome da coleção
  - `count`: número de imóveis
  
- `comparison_export_pdf` - Exportação de comparação
  - `count`: número de imóveis

---

## 📦 Dependências

```json
{
  "jspdf": "^2.5.x",
  "jspdf-autotable": "^3.8.x"
}
```

### Instalação
```bash
npm install jspdf jspdf-autotable --legacy-peer-deps
```

---

## 🔧 Configuração

### TypeScript
Tipos customizados em `src/types/jspdf-autotable.d.ts`:
- Extensão da interface jsPDF
- Definições para jspdf-autotable

### Importação Dinâmica
Para otimizar o bundle, a biblioteca é carregada sob demanda:

```tsx
const { exportFavoritosToPDF } = await import('@/utils/pdfExport');
```

**Benefício:** ~400KB economizados no bundle inicial.

---

## 📱 Responsividade

### Desktop
- ✅ Botão "Exportar PDF" visível no toolbar
- ✅ Toast no canto superior direito

### Mobile
- ✅ Botão compacto ("PDF" apenas)
- ✅ Toast adaptado para telas pequenas
- ✅ Download direto para dispositivo

---

## 🎨 Customização

### Modificar Cores
Edite `COLORS` em `src/utils/pdfExport.ts`:

```typescript
const COLORS = {
  navy: '#192233',
  blue: '#054ADA',
  // ... suas cores
};
```

### Modificar Layout
Ajuste as seções em `exportFavoritosToPDF()`:
- Cabeçalho: linha 48-74
- Resumo: linha 76-99
- Tabela: linha 101-158
- Detalhes: linha 162-267
- Rodapé: linha 269-296

---

## ✅ Checklist de Qualidade

- [x] Design profissional com branding Pharos
- [x] Cabeçalho e rodapé em todas as páginas
- [x] Numeração automática de páginas
- [x] Tabela responsiva com colunas ajustáveis
- [x] Suporte a múltiplos imóveis
- [x] Quebra de página automática
- [x] Formatação de moeda (pt-BR)
- [x] Formatação de data (pt-BR)
- [x] Feedback visual (loading/success/error)
- [x] Analytics integrado
- [x] Importação dinâmica para otimização
- [x] TypeScript types completos
- [x] Mobile friendly

---

## 🚧 Melhorias Futuras

### Fase 2
- [ ] Adicionar logo real (imagem) no cabeçalho
- [ ] Incluir imagens dos imóveis no PDF
- [ ] Gráficos de comparação de preços
- [ ] QR Code para link do imóvel
- [ ] Watermark Pharos nas páginas

### Fase 3
- [ ] Templates personalizáveis
- [ ] Escolher quais campos exportar
- [ ] Exportar para outros formatos (Excel, CSV)
- [ ] Enviar PDF por email diretamente
- [ ] Salvar PDF na nuvem

---

## 📞 Suporte

Para dúvidas ou sugestões sobre a exportação de PDF:
- Consulte a documentação do jsPDF: https://github.com/parallax/jsPDF
- Consulte a documentação do jspdf-autotable: https://github.com/simonbengtsson/jsPDF-AutoTable

---

**Desenvolvido com ❤️ para Pharos Imobiliária**

