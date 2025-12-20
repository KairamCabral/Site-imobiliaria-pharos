# ✅ Solução Vista - Descobrir Campos Corretos

**Data:** 09/12/2025  
**Resposta do Suporte Vista:** Usar `/imoveis/listarcampos` para descobrir nomes exatos

---

## 📧 RESPOSTA DO SUPORTE

O suporte do Vista nos instruiu a:

1. ✅ Usar o endpoint `/imoveis/listarcampos` para descobrir os campos disponíveis
2. ✅ A grafia correta dos campos vem dessa requisição
3. ✅ Consultar as documentações oficiais

**Documentações fornecidas:**
- 📚 **DOC 1:** https://vistasoft.com.br/api/#fotos
- 📚 **DOC 2:** https://cli43769-rest.vistahost.com.br/doc/

**Endpoint recomendado:**
```
http://SEUHOST/imoveis/listarcampos?key=SUAKEY&pesquisa
```

---

## 🚀 PASSO A PASSO - DESCOBRIR CAMPOS

### **Passo 1: Executar `/imoveis/listarcampos`**

**Comando PowerShell:**
```powershell
$API_KEY = "e4e62e22782c7646f2db00a2c56ac70e"
$BASE_URL = "https://gabarito-rest.vistahost.com.br"

$url = "$BASE_URL/imoveis/listarcampos?key=$API_KEY"

# Executar requisição
$response = Invoke-RestMethod -Uri $url -Method GET

# Salvar resultado em arquivo JSON
$response | ConvertTo-Json -Depth 10 | Out-File "vista-campos-disponiveis.json"

# Mostrar total de campos
$campos = $response | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
Write-Host "Total de campos disponíveis: $($campos.Count)" -ForegroundColor Green
```

**Comando cURL (alternativa):**
```bash
curl -X GET "https://gabarito-rest.vistahost.com.br/imoveis/listarcampos?key=e4e62e22782c7646f2db00a2c56ac70e" > vista-campos-disponiveis.json
```

**Comando direto no navegador:**
```
https://gabarito-rest.vistahost.com.br/imoveis/listarcampos?key=e4e62e22782c7646f2db00a2c56ac70e
```

---

### **Passo 2: Buscar Campos Específicos**

**Script PowerShell para buscar os campos problemáticos:**

```powershell
# Executar listarcampos
$url = "https://gabarito-rest.vistahost.com.br/imoveis/listarcampos?key=e4e62e22782c7646f2db00a2c56ac70e"
$response = Invoke-RestMethod -Uri $url -Method GET

# Obter lista de todos os campos
$allFields = $response | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name

Write-Host "`n=== BUSCANDO CAMPOS PROBLEMÁTICOS ===" -ForegroundColor Yellow

# 1. Status da Obra
Write-Host "`n[1] Status da Obra:" -ForegroundColor Cyan
$statusObraFields = $allFields | Where-Object { 
    $_ -match "status.*obra|obra.*status|status.*construc|status.*empreend" 
}
if ($statusObraFields) {
    $statusObraFields | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
} else {
    Write-Host "  ❌ Nenhum campo encontrado" -ForegroundColor Red
}

# 2. Tour Virtual
Write-Host "`n[2] Tour Virtual:" -ForegroundColor Cyan
$tourFields = $allFields | Where-Object { 
    $_ -match "tour|360|virtual|link.*tour" 
}
if ($tourFields) {
    $tourFields | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
} else {
    Write-Host "  ❌ Nenhum campo encontrado" -ForegroundColor Red
}

# 3. Vídeos
Write-Host "`n[3] Vídeos:" -ForegroundColor Cyan
$videoFields = $allFields | Where-Object { 
    $_ -match "video|youtube|vimeo" 
}
if ($videoFields) {
    $videoFields | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
} else {
    Write-Host "  ❌ Nenhum campo encontrado" -ForegroundColor Red
}

# 4. Anexos
Write-Host "`n[4] Anexos/Documentos:" -ForegroundColor Cyan
$anexoFields = $allFields | Where-Object { 
    $_ -match "anexo|documento|arquivo|pdf|folder|planta" 
}
if ($anexoFields) {
    $anexoFields | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
} else {
    Write-Host "  ❌ Nenhum campo encontrado" -ForegroundColor Red
}

# 5. IPTU
Write-Host "`n[5] IPTU:" -ForegroundColor Cyan
$iptuFields = $allFields | Where-Object { 
    $_ -match "iptu" 
}
if ($iptuFields) {
    $iptuFields | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
} else {
    Write-Host "  ❌ Nenhum campo encontrado" -ForegroundColor Red
}

Write-Host "`n=== BUSCA CONCLUÍDA ===" -ForegroundColor Yellow
Write-Host "`nTotal de campos disponíveis: $($allFields.Count)" -ForegroundColor White
```

**Salve como:** `descobrir-campos-vista.ps1`

---

### **Passo 3: Executar o Script**

```powershell
# Execute o script
.\descobrir-campos-vista.ps1
```

**O que o script faz:**
1. ✅ Busca todos os campos disponíveis via `/imoveis/listarcampos`
2. ✅ Filtra por palavras-chave relacionadas aos campos problemáticos
3. ✅ Mostra os nomes exatos encontrados
4. ✅ Identifica campos faltantes

---

## 🔍 **POSSÍVEIS DESCOBERTAS**

### **Cenário A: Campos Existem com Nomes Diferentes**

Se o script encontrar campos, pode ser algo como:

```
[1] Status da Obra:
  ✅ StatusDaObra
  ✅ StatusConstrucao
  ✅ FaseObra

[2] Tour Virtual:
  ✅ LinkTourVirtual
  ✅ URLTour360

[3] Vídeos:
  ✅ VideosYoutube
  ✅ LinksVideo

[4] Anexos:
  ✅ DocumentosAnexos
  ✅ ArquivosPDF

[5] IPTU:
  ✅ ValorIPTUAnual
  ✅ IPTU
```

**Ação:** Atualizar o código com os nomes corretos!

---

### **Cenário B: Campos NÃO Existem**

Se o script **não encontrar** nenhum campo:

```
[1] Status da Obra:
  ❌ Nenhum campo encontrado

[2] Tour Virtual:
  ❌ Nenhum campo encontrado

[3] Vídeos:
  ❌ Nenhum campo encontrado
```

**Ação:** Responder ao suporte informando que os campos não aparecem no `listarcampos`

---

## 📧 **TEMPLATE DE RESPOSTA AO SUPORTE**

### **Se Encontrar os Campos:**

```
Olá!

Obrigado pelas orientações. Executei o /imoveis/listarcampos e encontrei os seguintes campos:

✅ Status da Obra: [NOME_EXATO]
✅ Tour Virtual: [NOME_EXATO]
✅ Vídeos: [NOME_EXATO]
✅ Anexos: [NOME_EXATO]
✅ IPTU: [NOME_EXATO]

Vou atualizar nosso código com esses nomes. Obrigado!

[Seu Nome]
```

---

### **Se NÃO Encontrar os Campos:**

```
Olá!

Obrigado pelas orientações. Executei o /imoveis/listarcampos mas não encontrei os seguintes campos:

❌ Status da Obra: busquei por "status.*obra", "obra.*status", "construc"
❌ Tour Virtual: busquei por "tour", "360", "virtual"
❌ Vídeos: busquei por "video", "youtube"
❌ Anexos: busquei por "anexo", "documento", "pdf"
⚠️ IPTU: [ENCONTRADO ou NÃO ENCONTRADO]

Total de campos retornados: XXX campos

Perguntas:
1. Esses campos estão habilitados na conta gabarito-rest?
2. Se sim, qual seria a grafia exata?
3. Se não, como podemos habilitar?

Aguardo retorno.

[Seu Nome]
```

---

## 🛠️ **ATUALIZAÇÃO DO CÓDIGO**

### **Depois de descobrir os nomes corretos:**

**Arquivo:** `src/providers/vista/VistaProvider.ts`

**Localizar linha ~1002 e atualizar:**

```typescript
// ANTES (nomes que estávamos usando)
let baseFields: string[] = [
  'Codigo', 'Categoria', 'TipoImovel', 'Finalidade', 'Status', 
  'StatusObra',  // ❌ Nome incorreto?
  // ...
];

// DEPOIS (nomes corretos descobertos)
let baseFields: string[] = [
  'Codigo', 'Categoria', 'TipoImovel', 'Finalidade', 'Status', 
  'StatusDaObra',  // ✅ Nome correto descoberto
  // ou
  'FaseObra',      // ✅ Ou este, dependendo do que encontrar
  // ...
];
```

**Repetir para:**
- `TourVirtual` → usar nome correto encontrado
- `Videos` → usar nome correto encontrado
- `ValorIPTU` → usar nome correto encontrado

---

## 📊 **RESULTADO ESPERADO**

### **Após executar o script:**

```
=== BUSCANDO CAMPOS PROBLEMÁTICOS ===

[1] Status da Obra:
  ✅ StatusDaObra
  ✅ StatusObra

[2] Tour Virtual:
  ✅ TourVirtual360
  ✅ LinkTourVirtual

[3] Vídeos:
  ✅ Videos
  ✅ LinksVideo

[4] Anexos/Documentos:
  ✅ Anexos
  ✅ DocumentosPDF

[5] IPTU:
  ✅ ValorIPTUAnual
  ✅ IPTU

=== BUSCA CONCLUÍDA ===

Total de campos disponíveis: 157 campos
```

---

## ⚠️ **IMPORTANTE: NOSSO CÓDIGO JÁ FAZ ISSO!**

**Boa notícia:** O código que implementamos **JÁ** usa o `/imoveis/listarcampos`! 

**Arquivo:** `src/providers/vista/VistaProvider.ts`

```typescript
// Linha ~181-188 (já implementado!)
if (!VistaProvider.listarCamposCache) {
  try {
    const camposResp = await this.client.get<any>('/imoveis/listarcampos');
    VistaProvider.setListarCamposCache(camposResp.data);
    console.log('[VistaProvider] listarcampos carregado');
  } catch (e) {
    console.warn('[VistaProvider] listarcampos falhou:', e);
  }
}
```

**O sistema já:**
1. ✅ Busca campos disponíveis automaticamente
2. ✅ Filtra apenas campos que existem
3. ✅ Evita erro 400 por campos inexistentes
4. ✅ Loga os resultados no console

**Problema:** Talvez os campos **realmente não existam** na sua conta!

---

## 🔍 **VERIFICAÇÃO RÁPIDA**

### **Execute no console do navegador (Dev Tools):**

```javascript
fetch('https://gabarito-rest.vistahost.com.br/imoveis/listarcampos?key=e4e62e22782c7646f2db00a2c56ac70e')
  .then(res => res.json())
  .then(data => {
    const campos = Object.keys(data);
    console.log('Total de campos:', campos.length);
    
    // Buscar Status Obra
    const statusObra = campos.filter(c => /status.*obra|obra.*status/i.test(c));
    console.log('Status Obra:', statusObra.length ? statusObra : '❌ Não encontrado');
    
    // Buscar Tour Virtual
    const tour = campos.filter(c => /tour|360|virtual/i.test(c));
    console.log('Tour Virtual:', tour.length ? tour : '❌ Não encontrado');
    
    // Buscar Videos
    const videos = campos.filter(c => /video/i.test(c));
    console.log('Vídeos:', videos.length ? videos : '❌ Não encontrado');
    
    // Buscar Anexos
    const anexos = campos.filter(c => /anexo|documento|pdf/i.test(c));
    console.log('Anexos:', anexos.length ? anexos : '❌ Não encontrado');
    
    // Buscar IPTU
    const iptu = campos.filter(c => /iptu/i.test(c));
    console.log('IPTU:', iptu.length ? iptu : '❌ Não encontrado');
  });
```

---

## 🎯 **PRÓXIMOS PASSOS**

### **1. Execute o script de descoberta**
```powershell
.\descobrir-campos-vista.ps1
```

### **2A. Se encontrar campos:**
- ✅ Anote os nomes exatos
- ✅ Atualize o código do VistaProvider
- ✅ Teste novamente
- ✅ Responda ao suporte agradecendo

### **2B. Se NÃO encontrar campos:**
- ✅ Responda ao suporte informando
- ✅ Pergunte se os campos estão habilitados
- ✅ Solicite habilitação se necessário

---

## 📧 **EMAIL DE FOLLOW-UP**

```
Para: suporte@vistasoft.com.br
Assunto: RE: Campos API Vista - Pharos

Olá!

Obrigado pela resposta e pelas documentações.

Executei o endpoint /imoveis/listarcampos conforme orientado.

Resultado:
- Total de campos retornados: XXX campos
- [COLE OS RESULTADOS DO SCRIPT AQUI]

[CENÁRIO A - Se encontrou]
✅ Encontrei os campos! Vou atualizar nosso código.

[CENÁRIO B - Se não encontrou]
❌ Os seguintes campos não aparecem no resultado:
   - Status da Obra
   - Tour Virtual
   - Vídeos
   - Anexos

Esses campos estão habilitados na conta gabarito-rest?
Se não, como posso habilitar?

Aguardo retorno.

[Seu Nome]
Pharos Imobiliária
```

---

**Execute o script e me conte os resultados!** 🚀

Se precisar de ajuda para interpretar os resultados ou atualizar o código, é só avisar! 😊

