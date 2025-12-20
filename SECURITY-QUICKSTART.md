# ⚡ QUICK START - SEGURANÇA PHAROS

## 🎯 EM 5 MINUTOS

### Passo 1: Cloudflare Turnstile (2 min)

1. Acesse: https://dash.cloudflare.com/turnstile
2. Clique em **"Add Site"**
3. Preencha:
   - **Site name:** Pharos Imobiliária
   - **Domain:** pharos.imob.br (ou seu domínio)
   - **Widget Mode:** Managed
4. Clique em **"Create"**
5. **Copie as credenciais:**

```
Site Key: 0x4AAAAAAAAxxxxxxxxxxxxxxxxx
Secret Key: 0x4AAAAAAAAyyyyyyyyyyyyyyyyyyy
```

### Passo 2: Configurar .env.local (1 min)

Adicione ao seu `.env.local`:

```bash
# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAAxxxxxxxxxxxxxxxxx
TURNSTILE_SECRET_KEY=0x4AAAAAAAAyyyyyyyyyyyyyyyyyyy
```

### Passo 3: Remover Bypass de Dev (30 segundos)

Abra `src/lib/turnstile.ts` e DELETE as linhas 26-30:

```typescript
// ❌ DELETAR ESTAS LINHAS:
if (process.env.NODE_ENV === 'development') {
  console.warn('[Turnstile] Bypass ativado em desenvolvimento');
  return { success: true };
}
```

### Passo 4: Testar (1 min)

```bash
# Reiniciar servidor
npm run dev

# Abrir navegador
http://localhost:3700

# Testar formulário de lead
# Deve aparecer o widget do Turnstile
```

### Passo 5: Deploy (30 segundos)

No Vercel/Netlify, adicione as variáveis:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY = [sua site key]
TURNSTILE_SECRET_KEY = [sua secret key]
```

**Deploy!** 🚀

---

## ✅ PRONTO!

Seu site agora tem:
- ✅ Security Headers
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ Bot Protection
- ✅ Secure Logging

---

## 🧪 TESTAR SE FUNCIONOU

### Teste 1: Headers

```bash
curl -I https://seu-dominio.com.br | grep "Content-Security"
```

Deve aparecer: `Content-Security-Policy: ...`

### Teste 2: Rate Limit

Envie 10 requisições rápidas. A 6ª deve ser bloqueada (429).

### Teste 3: Turnstile

Abra um formulário. Deve aparecer o widget do Cloudflare.

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **SECURITY.md** - Guia completo
- **SECURITY-IMPLEMENTATION-SUMMARY.md** - Resumo detalhado
- **HONEYPOT-IMPLEMENTATION.md** - Adicionar honeypot

---

## 🆘 PROBLEMAS?

**Turnstile não aparece:**
- Verifique `NEXT_PUBLIC_TURNSTILE_SITE_KEY` no .env.local
- Verifique console do navegador (F12)
- Desative adblock

**Rate limit muito agressivo:**
- Edite `src/lib/ratelimit.ts`
- Aumente `strictLimiter.check(5, ip)` para 10 ou 20

**Validação rejeitando dados válidos:**
- Veja logs: `grep "validation failed" logs/`
- Ajuste regex em `src/lib/validators.ts`

---

**Tempo total:** 5 minutos  
**Dificuldade:** Fácil 🟢  
**Status:** Pronto para produção ✅

