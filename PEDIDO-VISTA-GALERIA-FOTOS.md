# 📧 Solicitação ao Suporte Vista - Habilitar Galeria Completa

**⚠️ COPIAR E ENVIAR PARA O SUPORTE DO VISTA:**

---

## Assunto
**Habilitar galeria – endpoint /imoveis/fotos**

---

## Dados do Tenant/Ambiente

- **Tenant/Ambiente:** `gabarito-rest.vistahost.com.br`
- **Chave API (terminação):** `...c70e` *(não envie a key completa por segurança)*
- **Exemplo de código de imóvel:** PH742 (numérico: 742)

---

## Cenário Atual (Problema)

Atualmente, os endpoints:

```
GET https://gabarito-rest.vistahost.com.br/imoveis/fotos?key=...&imovel=742
GET https://gabarito-rest.vistahost.com.br/imoveis/fotos?key=...&imovel=PH742
```

**Retornam:** `404 Not Found`

Por esse motivo, nosso sistema está limitado a exibir **apenas** a `FotoDestaque` retornada pelo endpoint `/imoveis/listar`, o que resulta em uma experiência de galeria com apenas 1 imagem.

---

## O Que Precisamos

**Habilitar o endpoint `/imoveis/fotos`** para retornar a galeria completa de cada imóvel, com os seguintes campos:

```json
{
  "total": 10,
  "1": {
    "Codigo": "...",
    "Foto": "...",
    "FotoGrande": "...",
    "FotoPequena": "...",
    "FotoMedia": "...",
    "Ordem": 1,
    "Destaque": "Sim/Não",
    "Titulo": "...",
    "Descricao": "..."
  },
  "2": { ... },
  ...
}
```

### Alternativa Aceitável

Se não for possível habilitar o endpoint `/imoveis/fotos`, pedimos que incluam a **galeria completa** no retorno do endpoint `/imoveis/detalhes`, com um campo `fotos` contendo o array/objeto completo de imagens.

**⚠️ Importante:** Precisamos da **galeria completa**, não apenas a `FotoDestaque`.

---

## Como Validaremos

Após a ativação, faremos este teste:

```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/fotos?key=SUA_KEY&imovel=742" \
  -H "Accept: application/json"
```

**Resultado esperado:**
- Status: `200 OK`
- Body: Objeto numerado com chaves `"1"`, `"2"`, ..., `"total"` (conforme exemplo acima)
- `total` ≥ 1 (idealmente refletindo o total de fotos cadastradas no imóvel)

---

## Observações Técnicas

1. **Permissões da API:**
   - Alguns tenants precisam de ativação específica no painel administrativo ou perfil de API para "Fotos/Galeria".
   - Se for o caso, **podem ativar para a nossa key?**

2. **Formato de Código Aceito:**
   - Nossos logs mostram que já tentamos enviar tanto o código **numérico** (742) quanto o **alfanumérico** (PH742).
   - Ambos retornam 404 atualmente.
   - Qual formato é o correto para este endpoint?

3. **CDN das Imagens:**
   - As URLs retornadas devem ser acessíveis (preferencialmente via CDN `cdn.vistahost.com.br`).
   - Se forem URLs antigas (`www.vistasoft.com.br/sandbox/...`), conseguiremos remapear, mas seria ideal já vir no formato CDN.

---

## Impacto no Negócio

A galeria completa de imagens é **crítica** para a conversão de leads em nosso site de imóveis. Imóveis com múltiplas fotos têm taxa de conversão significativamente maior.

Atualmente, estamos operando com **1 foto por imóvel**, o que reduz a qualidade da experiência do usuário e impacta negativamente as vendas.

---

## Contato para Retorno

- **E-mail:** [SEU_EMAIL]
- **Telefone/WhatsApp:** [SEU_TELEFONE]
- **Horário preferencial:** [HORÁRIO]

---

## Prazo Esperado

Solicitamos que esta ativação seja feita com **prioridade alta**, pois impacta diretamente nossa operação comercial.

Caso haja alguma restrição técnica ou de plano que impeça a ativação, pedimos que nos informem as alternativas disponíveis.

---

**Agradecemos a atenção e aguardamos retorno!**

---

## 📋 Checklist de Validação (Vista)

Para o suporte do Vista validar internamente:

- [ ] Tenant/ambiente: `gabarito-rest.vistahost.com.br` está correto?
- [ ] Key tem permissão para acessar endpoint "Fotos"?
- [ ] Formato de código aceito: numérico (742) ou alfanumérico (PH742)?
- [ ] Endpoint `/imoveis/fotos` está habilitado para este tenant?
- [ ] Alguma configuração no painel administrativo necessária?

---

**Versão do documento:** 1.0  
**Data:** 18/10/2025  
**Sistema:** Site Oficial Pharos Imobiliária

