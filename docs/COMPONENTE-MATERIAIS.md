# 📎 Componente: Material/Anexos - Downloads Premium

## 📝 Descrição

Novo tab na galeria de mídia do imóvel para exibir e permitir download de materiais (PDFs, plantas, documentos) com UI/UX premium e intuitiva.

---

## 🎨 Design

### **Características Visuais:**
- ✅ Tab "Material (X)" na galeria, ao lado de "Tour 360°"
- ✅ Cards com gradiente e hover elegante
- ✅ Ícones diferenciados por tipo de arquivo (PDF, Imagem, Documento)
- ✅ Badge com extensão do arquivo
- ✅ Botão principal "Baixar" + botão secundário "Visualizar"
- ✅ Grid responsivo (1 coluna mobile, 2 colunas desktop)
- ✅ Animações escalonadas (50ms delay entre cards)

### **Estados:**
- **Normal:** Card branco com borda cinza
- **Hover:** Borda azul + sombra + gradiente azul suave
- **Badge:** Muda de cinza para azul no hover

---

## 📦 Implementação

### **1. Modelo de Dados**
**Arquivo:** `src/domain/models/Property.ts`

```typescript
export interface PropertyAttachment {
  id?: string;
  url: string;
  filename: string;
  description?: string;
  type?: string; // 'pdf' | 'image' | 'document'
  size?: number; // em bytes
  showOnWebsite?: boolean;
}

export interface Property {
  // ... outros campos
  attachments?: PropertyAttachment[]; // ✨ NOVO!
}
```

---

### **2. Mapper Vista**
**Arquivo:** `src/mappers/vista/PropertyMapper.ts`

**Função criada:**
```typescript
function normalizeVistaAttachmentsField(vista: VistaImovel): PropertyAttachment[] | undefined {
  const attachments: PropertyAttachment[] = [];
  const anexos = (vista as any).Anexo || [];
  
  if (Array.isArray(anexos)) {
    anexos.forEach((anexo: any, index: number) => {
      // Filtra por ExibirNoSite
      const showOnWebsite = parseBoolean(anexo.ExibirNoSite);
      if (showOnWebsite === false) {
        return; // Pula
      }
      
      const url = sanitizeMediaUrl(anexo.Anexo || anexo.Arquivo || anexo.URL);
      if (!url) {
        return; // Sem URL válida
      }
      
      const filename = cleanString(anexo.Arquivo) || cleanString(anexo.Descricao) || `Arquivo ${index + 1}`;
      const description = cleanString(anexo.Descricao);
      
      // Detecta tipo pela extensão
      let type = 'document';
      const lowerFilename = filename.toLowerCase();
      if (lowerFilename.endsWith('.pdf')) {
        type = 'pdf';
      } else if (lowerFilename.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        type = 'image';
      }
      
      attachments.push({
        id: cleanString(anexo.Codigo || anexo.CodigoAnexo),
        url,
        filename,
        description,
        type,
        showOnWebsite: showOnWebsite !== false,
      });
    });
  }
  
  return attachments.length > 0 ? attachments : undefined;
}
```

**Mapeamento no retorno:**
```typescript
return {
  // ... outros campos
  attachments: normalizeVistaAttachmentsField(vista),
};
```

---

### **3. PropertyMediaGallery**
**Arquivo:** `src/components/PropertyMediaGallery.tsx`

**Novo Tab:**
```typescript
type MediaTab = 'photos' | 'videos' | 'map' | 'nearby' | 'tour360' | 'materials'; // ✨ materials!

const allTabs = [
  // ... outros tabs
  {
    id: 'materials',
    label: `Material (${attachments?.length || 0})`,
    icon: <FileText className="w-4 h-4" />,
    available: (attachments && attachments.length > 0) || false,
  },
];
```

**Novo Props:**
```typescript
interface PropertyMediaGalleryProps {
  // ... outros props
  attachments?: Array<{
    id?: string;
    url: string;
    filename: string;
    description?: string;
    type?: string;
  }>;
}
```

**Conteúdo:**
```typescript
{activeTab === 'materials' && attachments && (
  <MaterialsViewer
    attachments={attachments}
  />
)}
```

---

### **4. MaterialsViewer Component**
**Arquivo:** `src/components/PropertyMediaGallery.tsx` (inline)

**Funcionalidades:**
- ✅ Grid de cards premium
- ✅ Ícones diferenciados (PDF vermelho, Imagem azul, Documento cinza)
- ✅ Extração automática de extensão
- ✅ Botão "Baixar" (download via createElement)
- ✅ Botão "Visualizar" (abre em nova aba)
- ✅ Gradientes e hover elegantes
- ✅ Animações escalonadas

---

## 🧪 Exemplo de Uso

### **Vista CRM:**
No cadastro do imóvel, adicione anexos em "Anexos":
- Marque "Exibir no Site"
- Adicione descrição
- Faça upload do arquivo (PDF, imagem, etc.)

### **Resultado na galeria:**
```
[Fotos (20)] [Vídeos (2)] [Tour 360°] [Material (3)] [Mapa] [Proximidades]
                                       ↑ NOVO!
```

**Ao clicar em "Material (3)":**
```
┌─────────────────────────────────────────┐
│ Material Disponível                      │
│ Plantas, documentos e informações        │
├─────────────────────────────────────────┤
│ [PDF] Planta Baixa.pdf           [Badge]│
│ "Layout completo do apartamento"        │
│ [Baixar ▼]         [👁]                 │
├─────────────────────────────────────────┤
│ [PDF] Memorial Descritivo.pdf    [Badge]│
│ [Baixar ▼]         [👁]                 │
├─────────────────────────────────────────┤
│ [IMG] Fachada.jpg                [Badge]│
│ "Vista frontal do empreendimento"       │
│ [Baixar ▼]         [👁]                 │
└─────────────────────────────────────────┘
```

---

## 📊 Fluxo Completo

```mermaid
flowchart TD
    CRM[CRM Vista - Cadastro do Imóvel]
    Upload[Upload de Anexo]
    Check[Marcar: Exibir no Site]
    API[API Vista - /imoveis/detalhes]
    Provider[VistaProvider]
    Mapper[PropertyMapper]
    Property[Property com attachments]
    Client[PropertyClient]
    Gallery[PropertyMediaGallery]
    Tab[Tab Material]
    Viewer[MaterialsViewer]
    Download[Download/Visualizar]
    
    CRM -->|1. Adicionar anexo| Upload
    Upload -->|2. Configurar| Check
    Check -->|3. Request| API
    API -->|4. {Anexo:[...]}| Provider
    Provider -->|5. Normalizar| Mapper
    Mapper -->|6. attachments[]| Property
    Property -->|7. Passar prop| Client
    Client -->|8. Passar prop| Gallery
    Gallery -->|9. Se attachments| Tab
    Tab -->|10. Ao clicar| Viewer
    Viewer -->|11. Botões| Download
    
    style Tab fill:#ccffcc
    style Viewer fill:#ccffcc
    style Download fill:#ccffcc
```

---

## 🎯 Tipos de Arquivo Suportados

| Extensão | Tipo | Ícone | Cor Badge |
|----------|------|-------|-----------|
| `.pdf` | PDF | FileText | Vermelho (#ef4444) |
| `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` | Imagem | Maximize2 | Azul (#3b82f6) |
| Outros | Documento | FileText | Cinza (#6b7280) |

---

## 📱 Responsividade

### **Desktop (md+):**
- Grid 2 colunas
- Cards com espaçamento confortável
- Botões lado a lado

### **Mobile:**
- Grid 1 coluna
- Cards full-width
- Botões empilhados (Baixar maior, Visualizar menor)

---

## 🔧 API Vista

### **Campos solicitados:**
```typescript
{ 
  'Anexo': [
    'Anexo',        // URL do arquivo
    'Arquivo',      // Nome do arquivo
    'Descricao',    // Descrição
    'ExibirNoSite', // Filtro (true/false)
    'Data'          // Data de upload
  ] 
}
```

### **Resposta esperada:**
```json
{
  "Anexo": [
    {
      "Codigo": "12345",
      "CodigoAnexo": "67890",
      "Anexo": "https://cdn.vista.com/anexos/planta.pdf",
      "Arquivo": "Planta Baixa.pdf",
      "Descricao": "Layout completo do apartamento",
      "ExibirNoSite": "Sim",
      "Data": "2025-01-10"
    }
  ]
}
```

---

## ✅ Checklist de Funcionalidades

- [x] Interface PropertyAttachment criada
- [x] Campo attachments adicionado ao Property
- [x] Função normalizeVistaAttachmentsField implementada
- [x] Mapper atualizado para incluir attachments
- [x] Tab "Material" adicionado ao PropertyMediaGallery
- [x] Componente MaterialsViewer criado
- [x] Ícones diferenciados por tipo
- [x] Botão "Baixar" funcional
- [x] Botão "Visualizar" funcional
- [x] Filtro por ExibirNoSite
- [x] Badge com extensão
- [x] Animações e hover elegantes
- [x] Grid responsivo
- [x] Integração completa PropertyClient

---

## 🐛 Troubleshooting

### **Tab não aparece:**
- ✅ Verificar se imóvel tem anexos no CRM
- ✅ Verificar se "Exibir no Site" está marcado
- ✅ Verificar console: buscar por `normalizeVistaAttachmentsField`

### **Download não funciona:**
- ✅ Verificar URL do anexo (deve ser válida e acessível)
- ✅ Verificar CORS (pode bloquear downloads de alguns domínios)
- ✅ Testar "Visualizar" primeiro

### **Tipo de arquivo errado:**
- ✅ Verificar extensão do filename
- ✅ Ajustar regex em `getFileExtension()`

---

## 🚀 Próximas Melhorias (Futuras)

- [ ] Adicionar tamanho do arquivo (em MB)
- [ ] Pré-visualização de PDFs inline (pdf.js)
- [ ] Download múltiplo (ZIP)
- [ ] Controle de acesso por lead/cliente
- [ ] Analytics de downloads
- [ ] Watermark em PDFs sensíveis

---

## 📝 Arquivos Modificados

| Arquivo | Mudança | Linhas |
|---------|---------|--------|
| `src/domain/models/Property.ts` | +PropertyAttachment interface, +attachments field | +10 |
| `src/mappers/vista/PropertyMapper.ts` | +normalizeVistaAttachmentsField, +import, +mapping | +60 |
| `src/components/PropertyMediaGallery.tsx` | +materials tab, +MaterialsViewer component, +props | +180 |
| `src/app/imoveis/[id]/PropertyClient.tsx` | +attachments prop | +1 |
| `docs/COMPONENTE-MATERIAIS.md` | Documentação completa | **NOVO** |

---

**Criado em:** 12/12/2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementado e Pronto para Uso

