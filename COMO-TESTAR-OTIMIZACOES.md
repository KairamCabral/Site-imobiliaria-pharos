# 🧪 Como Testar as Otimizações

## Guia Rápido de Validação

### **1. Teste Local (Desenvolvimento)**

```bash
# 1. Instalar dependências (se necessário)
npm install

# 2. Rodar em modo desenvolvimento
npm run dev

# 3. Abrir navegador
# http://localhost:3000
```

#### **Verificar no Console:**

Você deve ver logs como:

```
📸 Imagem carregada: foto-1141.jpg
   Tamanho: 245.32KB | Tempo: 523ms

📸 Imagem carregada: banner-home.webp
   Tamanho: 156.78KB | Tempo: 312ms
```

**Se aparecer alertas:**
```
⚠️ IMAGEM MUITO GRANDE: foto-destaque.jpg
   Tamanho: 892.45KB (máx recomendado: 300KB)
   Redução recomendada: 197%
```
→ Essas imagens precisam de otimização adicional ou são candidatas para Cloudinary.

---

### **2. Teste no Chrome DevTools**

#### **Performance Tab:**

1. Abrir DevTools (F12)
2. Aba **Performance**
3. Clicar em **🔴 Record**
4. Recarregar página (Ctrl+R)
5. Parar gravação

**Verificar:**
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ CLS (Cumulative Layout Shift) < 0.1
- ✅ TBT (Total Blocking Time) < 200ms

#### **Network Tab:**

1. Abrir DevTools (F12)
2. Aba **Network**
3. Filtrar por **Img**
4. Recarregar página (Ctrl+R)

**Verificar:**
- ✅ Imagens carregando em **WebP** ou **AVIF**
- ✅ Tamanhos variados por dispositivo (usar Device Mode)
- ✅ Nenhuma imagem > 500KB

#### **Lighthouse:**

1. Abrir DevTools (F12)
2. Aba **Lighthouse**
3. Selecionar:
   - ✅ Performance
   - ✅ Mobile
   - ✅ Desktop
4. Clicar **Analyze page load**

**Metas:**
- Performance: > 85
- LCP: Verde (< 2.5s)
- CLS: Verde (< 0.1)

---

### **3. Build de Produção**

```bash
# 1. Build otimizado
npm run build

# 2. Rodar build localmente
npm start

# 3. Testar em http://localhost:3000
```

**Importante:** Algumas otimizações só funcionam em produção:
- Minificação de CSS/JS
- Tree shaking
- Image optimization via Vercel

---

### **4. GTmetrix (RECOMENDADO)**

**URL:** https://gtmetrix.com

#### **Passo a passo:**

1. Deploy para staging/produção
2. Acessar GTmetrix
3. Inserir URL do site
4. Selecionar:
   - Location: **Brazil - São Paulo** (mais próximo)
   - Browser: **Chrome (Desktop)**
   - Connection: **Unthrottled**
5. Clicar **Test your site**

#### **Verificar métricas:**

**Antes das otimizações:**
- Grade: D (61%)
- Performance: 61%
- Structure: 77%
- LCP: 6.6s 🔴
- TBT: 335ms 🟡
- CLS: 0.68 🔴

**Depois (esperado):**
- Grade: B (82%+) ✅
- Performance: 82%+ ✅
- Structure: 85%+ ✅
- LCP: ~2.5s 🟢
- TBT: ~220ms 🟢
- CLS: < 0.1 🟢

#### **Top Issues esperados RESOLVIDOS:**

- ✅ "Avoid enormous network payloads" (era 5.38MB)
- ✅ "Properly size images" 
- ✅ "Layout shift culprits" (footer)
- ✅ "Render blocking CSS" (critical CSS inline)

---

### **5. PageSpeed Insights (Google)**

**URL:** https://pagespeed.web.dev/

1. Inserir URL do site
2. Aguardar análise (2-3 minutos)
3. Ver resultados Mobile e Desktop

**Metas:**
- **Mobile:** > 70 (bom), > 85 (ótimo)
- **Desktop:** > 90

**Core Web Vitals esperados:**
- LCP: Verde (< 2.5s) ✅
- FID: Verde (< 100ms) ✅
- CLS: Verde (< 0.1) ✅

---

### **6. Testes Visuais (Comparação)**

#### **Teste de qualidade de imagem:**

1. Abrir uma página com imagens (ex: `/imoveis`)
2. Inspecionar imagem no DevTools
3. Copiar URL da imagem
4. Abrir em nova aba
5. Fazer zoom 200-300%

**Verificar:**
- ✅ Imagem ainda nítida
- ✅ Sem artefatos visíveis
- ✅ Cores preservadas

Quality 75 deve ser **indistinguível** de 90-95 para o usuário comum.

---

### **7. Teste Mobile Real**

#### **Android (Chrome DevTools Remote):**

1. Conectar celular via USB
2. Ativar Depuração USB
3. Chrome DevTools → More tools → Remote devices
4. Abrir site no celular
5. Inspecionar no desktop

#### **iOS (Safari Web Inspector):**

1. iPhone → Ajustes → Safari → Avançado → Inspetor Web
2. Mac → Safari → Develop → [Seu iPhone]
3. Abrir site no iPhone
4. Inspecionar no Mac

**Verificar:**
- ✅ Imagens carregam rápido em 4G
- ✅ Sem layout shifts visíveis
- ✅ Scroll suave
- ✅ Nenhuma imagem > 300KB no Network

---

### **8. Teste de Cloudinary (Opcional)**

Se você configurou Cloudinary:

1. Abrir Network tab
2. Procurar por `res.cloudinary.com`
3. Verificar URLs de imagens

**Formato esperado:**
```
https://res.cloudinary.com/SEU-CLOUD-NAME/image/fetch/
f_auto,q_75,w_800,c_limit,dpr_auto/
https%3A%2F%2Fcdn.vistahost.com.br%2F...%2Ffoto.jpg
```

**Verificar:**
- ✅ Imagens passando pelo Cloudinary
- ✅ Formato automático (WebP/AVIF)
- ✅ Tamanho reduzido (comparar com original)

---

## 🐛 Troubleshooting

### **Problema: Imagens ainda grandes (>500KB)**

**Possíveis causas:**
1. Cloudinary não configurado → imagens vindo direto da API
2. Next.js não otimizando → verificar `next.config.ts`
3. Quality muito alto → verificar se variant está sendo usado

**Solução:**
```typescript
// Verificar se está usando OptimizedImage:
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage 
  src={url} 
  variant="card" // ✅ Importante!
  width={800}
  height={600}
/>
```

---

### **Problema: CLS ainda alto**

**Verificar:**
1. Todas as imagens têm `width` e `height` definidos?
2. Footer tem `minHeight`?
3. Há elementos carregando assincronamente sem placeholder?

**Solução:**
```typescript
// Sempre definir dimensões:
<Image 
  src={url} 
  width={800}  // ✅
  height={600} // ✅
  alt="..."
/>

// Ou usar fill com aspect-ratio:
<Image 
  src={url}
  fill
  style={{ aspectRatio: '16/9' }} // ✅
  alt="..."
/>
```

---

### **Problema: Imagens não otimizando via Vercel**

**Verificar `next.config.ts`:**

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.vistahost.com.br',
    },
    // ... outros domínios
  ],
  formats: ['image/avif', 'image/webp'], // ✅
}
```

**Verificar URL no Network:**
Deve ser algo como:
```
/_next/image?url=https%3A%2F%2Fcdn.vistahost.com.br%2F...&w=828&q=75
```

---

### **Problema: Console logs não aparecem**

**Verificar:**
1. Está rodando em modo `development`? (Logs só aparecem em dev)
2. Console está filtrado? (remover filtros)
3. ImagePerformanceMonitor foi adicionado ao layout?

```typescript
// src/app/layout.tsx
import { ImagePerformanceMonitor } from '@/components/ImagePerformanceMonitor';

// No body:
<ImagePerformanceMonitor />
```

---

## 📊 Métricas de Sucesso

### **Critérios de Aprovação:**

| Métrica | Antes | Meta | Status |
|---------|-------|------|--------|
| GTmetrix Grade | D (61%) | B (80%+) | ⏳ Testar |
| LCP | 6.6s | < 2.5s | ⏳ Testar |
| CLS | 0.68 | < 0.1 | ⏳ Testar |
| Payload Total | 5.38MB | < 2.5MB | ⏳ Testar |
| Imagens Médias | ~700KB | < 250KB | ⏳ Testar |

### **Após testar, atualizar status:**

```
✅ Aprovado: Meta atingida
🟡 Parcial: Melhorou mas não atingiu meta
❌ Falhou: Sem melhoria significativa
```

---

## 🎯 Próximos Passos

Após validar localmente:

1. **Commit e push** das mudanças
2. **Deploy** para staging
3. **Testar** em staging com GTmetrix
4. **Validar** métricas atingidas
5. **Deploy** para produção
6. **Monitorar** por 48h

---

## 📞 Suporte

**Dúvidas sobre as otimizações?**

Consulte:
- `OTIMIZACOES-PERFORMANCE.md` - Documentação completa
- `src/utils/imageOptimizer.ts` - Código fonte comentado
- `src/components/ImagePerformanceMonitor.tsx` - Monitor de imagens

**Problemas técnicos?**

1. Verificar console do navegador
2. Verificar logs do servidor
3. Testar em modo incógnito (sem cache)
4. Limpar cache do navegador (Ctrl+Shift+Del)

---

**Boa sorte com os testes! 🚀**

