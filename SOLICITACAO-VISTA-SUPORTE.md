# Solicitação ao Suporte Vista CRM

## 🎯 Objetivo

Ativar o endpoint `/imoveis/fotos` para permitir a exibição de galeria completa de imagens no site da imobiliária.

## 📋 Informações da Conta

- **Cliente:** Pharos Negócios Imobiliários
- **Tenant:** gabarito
- **Base URL:** https://gabarito-rest.vistahost.com.br
- **API Key:** (já configurada e funcionando)

## ❌ Problema Identificado

O endpoint `/imoveis/fotos` retorna **404 Not Found** para todos os imóveis:

```bash
# Tentativa 1: Com código original
GET https://gabarito-rest.vistahost.com.br/imoveis/fotos?key={key}&imovel=PH742
Resposta: 404 Not Found

# Tentativa 2: Com código numérico
GET https://gabarito-rest.vistahost.com.br/imoveis/fotos?key={key}&imovel=742
Resposta: 404 Not Found
```

## ✅ O Que Funciona Atualmente

- ✅ `GET /imoveis/listar` - Retorna listagem com `FotoDestaque`
- ✅ Site está exibindo a foto destaque corretamente
- ✅ Código já está preparado para galeria completa

## 🎯 Solicitação

**Ativar o endpoint:**
```
GET /imoveis/fotos?key={key}&imovel={codigo}
```

**Resposta esperada:**
```json
{
  "1": {
    "Codigo": "1",
    "Foto": "https://cdn.vistahost.com.br/gabarito/vista.imobi/fotos/742/...",
    "FotoPequena": "https://cdn.vistahost.com.br/...",
    "FotoMedia": "https://cdn.vistahost.com.br/...",
    "FotoGrande": "https://cdn.vistahost.com.br/...",
    "Destaque": "Sim",
    "Ordem": 1,
    "Titulo": "Sala",
    "Descricao": "Vista mar"
  },
  "2": { ... },
  "total": 12
}
```

## 🔧 Estrutura da CDN

Conforme documentação Vista:
```
https://cdn.vistahost.com.br/{tenant}/vista.imobi/fotos/{CODIGO}/{ARQUIVO}.jpg
                             └─gabarito─┘                └──742──┘
```

## 💡 Benefícios para o Cliente

1. **Galeria completa** de fotos no site
2. **Maior conversão** de leads (imóveis bem fotografados)
3. **Melhor experiência** do usuário
4. **SEO otimizado** com múltiplas imagens

## 📊 Impacto Técnico

**Sem alteração de código necessária!**

O site já está preparado:
- ✅ Código implementado e testado
- ✅ Fallback automático funcionando
- ✅ Domínios CDN configurados
- ✅ Performance otimizada

Assim que o endpoint for ativado:
- ✅ Galeria completa aparecerá automaticamente
- ✅ Todas as fotos cadastradas serão exibidas
- ✅ Ordenação respeitará o campo `Ordem`

## 🧪 Imóveis para Teste

- **PH742** - Apartamento Frente Mar (2 dorm)
- **PH1060** - (qualquer imóvel com múltiplas fotos cadastradas)

## 📞 Contato Técnico

Se precisar de mais informações técnicas ou testes, estamos à disposição.

---

**Prioridade:** Média-Alta  
**Impacto:** Melhoria significativa na apresentação dos imóveis  
**Status do Código:** ✅ Pronto e aguardando ativação do endpoint

