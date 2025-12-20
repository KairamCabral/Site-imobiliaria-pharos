# 🔍 Script para Descobrir Campos Vista CRM
# 
# Baseado na orientação do suporte Vista:
# Usar /imoveis/listarcampos para descobrir nomes exatos dos campos
#
# Execute: .\descobrir-campos-vista.ps1

# ==============================================================================
# CONFIGURAÇÃO
# ==============================================================================

$API_KEY = "e4e62e22782c7646f2db00a2c56ac70e"
$BASE_URL = "https://gabarito-rest.vistahost.com.br"

# ==============================================================================
# FUNÇÕES
# ==============================================================================

function Write-Header {
    param([string]$Text)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Yellow
    Write-Host "=" * 80 -ForegroundColor Cyan
}

function Write-Section {
    param([string]$Text)
    Write-Host "`n$Text" -ForegroundColor Cyan
}

function Search-Fields {
    param(
        [string[]]$AllFields,
        [string]$Pattern,
        [string]$FieldName
    )
    
    Write-Section "[$FieldName]"
    $found = $AllFields | Where-Object { $_ -match $Pattern }
    
    if ($found) {
        Write-Host "  ✅ Encontrados $($found.Count) campo(s):" -ForegroundColor Green
        $found | ForEach-Object {
            Write-Host "     • $_" -ForegroundColor White
        }
        return $found
    } else {
        Write-Host "  ❌ Nenhum campo encontrado" -ForegroundColor Red
        Write-Host "     Padrão buscado: $Pattern" -ForegroundColor DarkGray
        return $null
    }
}

# ==============================================================================
# PASSO 1: BUSCAR TODOS OS CAMPOS
# ==============================================================================

Write-Header "DESCOBRINDO CAMPOS DISPONÍVEIS VIA /imoveis/listarcampos"

$url = "$BASE_URL/imoveis/listarcampos?key=$API_KEY"

Write-Host "`nExecutando requisição..." -ForegroundColor Gray
Write-Host "URL: $url" -ForegroundColor DarkGray

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -ContentType "application/json"
    
    # Obter lista de todos os campos
    $allFields = $response | Get-Member -MemberType NoteProperty | 
                 Select-Object -ExpandProperty Name | 
                 Sort-Object
    
    Write-Host "`n✅ Requisição bem-sucedida!" -ForegroundColor Green
    Write-Host "📊 Total de campos disponíveis: $($allFields.Count)" -ForegroundColor Green
    
    # Salvar resultado em arquivo JSON
    $jsonFile = "vista-campos-disponiveis.json"
    $response | ConvertTo-Json -Depth 10 | Out-File $jsonFile -Encoding UTF8
    Write-Host "💾 Resultado salvo em: $jsonFile" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Erro ao executar requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nVerifique:" -ForegroundColor Yellow
    Write-Host "  1. API Key está correta" -ForegroundColor White
    Write-Host "  2. URL do host está correta" -ForegroundColor White
    Write-Host "  3. Conexão com internet está funcionando" -ForegroundColor White
    exit 1
}

# ==============================================================================
# PASSO 2: BUSCAR CAMPOS PROBLEMÁTICOS
# ==============================================================================

Write-Header "BUSCANDO CAMPOS PROBLEMÁTICOS"

# Armazenar resultados
$results = @{
    StatusObra = $null
    TourVirtual = $null
    Videos = $null
    Anexos = $null
    IPTU = $null
}

# 1. STATUS DA OBRA
$results.StatusObra = Search-Fields -AllFields $allFields `
    -Pattern "(?i)(status.*(obra|construc|empreend|lancamento))|(obra.*status)|(fase.*obra)|(etapa.*obra)" `
    -FieldName "1. Status da Obra"

# 2. TOUR VIRTUAL
$results.TourVirtual = Search-Fields -AllFields $allFields `
    -Pattern "(?i)(tour)|(360)|(virtual.*tour)|(link.*tour)|(url.*tour)" `
    -FieldName "2. Tour Virtual"

# 3. VÍDEOS
$results.Videos = Search-Fields -AllFields $allFields `
    -Pattern "(?i)(video)|(youtube)|(vimeo)|(link.*video)" `
    -FieldName "3. Vídeos"

# 4. ANEXOS/DOCUMENTOS
$results.Anexos = Search-Fields -AllFields $allFields `
    -Pattern "(?i)(anexo)|(documento)|(arquivo)|(pdf)|(folder)|(planta)|(catalogo)|(material)" `
    -FieldName "4. Anexos/Documentos"

# 5. IPTU
$results.IPTU = Search-Fields -AllFields $allFields `
    -Pattern "(?i)(iptu)|(valor.*iptu)|(imposto)" `
    -FieldName "5. IPTU"

# ==============================================================================
# PASSO 3: BUSCAR CAMPOS ADICIONAIS ÚTEIS
# ==============================================================================

Write-Header "BUSCANDO OUTROS CAMPOS ÚTEIS"

# Fotos
Search-Fields -AllFields $allFields `
    -Pattern "(?i)(foto)|(imagem)|(image)|(galeria)" `
    -FieldName "Fotos/Imagens"

# Empreendimento
Search-Fields -AllFields $allFields `
    -Pattern "(?i)(empreendimento)|(condominio)|(edificio)|(predio)" `
    -FieldName "Empreendimento/Condomínio"

# Corretor
Search-Fields -AllFields $allFields `
    -Pattern "(?i)(corretor)|(broker)|(agente)" `
    -FieldName "Corretor"

# ==============================================================================
# PASSO 4: RESUMO E PRÓXIMOS PASSOS
# ==============================================================================

Write-Header "RESUMO DOS RESULTADOS"

Write-Host "`n📊 ESTATÍSTICAS:" -ForegroundColor Yellow
Write-Host "   Total de campos disponíveis: $($allFields.Count)" -ForegroundColor White

$foundCount = 0
$notFoundCount = 0

foreach ($key in $results.Keys) {
    if ($results[$key]) {
        $foundCount++
    } else {
        $notFoundCount++
    }
}

Write-Host "   Campos problemáticos encontrados: $foundCount de 5" -ForegroundColor $(if ($foundCount -eq 5) { "Green" } elseif ($foundCount -gt 0) { "Yellow" } else { "Red" })
Write-Host "   Campos problemáticos NÃO encontrados: $notFoundCount de 5" -ForegroundColor $(if ($notFoundCount -eq 0) { "Green" } else { "Red" })

Write-Host "`n📋 DETALHAMENTO:" -ForegroundColor Yellow

foreach ($key in $results.Keys) {
    $status = if ($results[$key]) { "✅ ENCONTRADO" } else { "❌ NÃO ENCONTRADO" }
    $color = if ($results[$key]) { "Green" } else { "Red" }
    $count = if ($results[$key]) { " ($($results[$key].Count) campo(s))" } else { "" }
    
    Write-Host "   $key`: " -NoNewline -ForegroundColor White
    Write-Host "$status$count" -ForegroundColor $color
    
    if ($results[$key]) {
        $results[$key] | ForEach-Object {
            Write-Host "      → $_" -ForegroundColor DarkGray
        }
    }
}

# ==============================================================================
# PASSO 5: PRÓXIMOS PASSOS
# ==============================================================================

Write-Header "PRÓXIMOS PASSOS"

if ($foundCount -eq 5) {
    Write-Host "`n🎉 ÓTIMA NOTÍCIA! Todos os campos foram encontrados!" -ForegroundColor Green
    Write-Host "`n📝 O que fazer agora:" -ForegroundColor Yellow
    Write-Host "   1. ✅ Anote os nomes EXATOS dos campos encontrados (acima)" -ForegroundColor White
    Write-Host "   2. ✅ Atualize o código do VistaProvider.ts com os nomes corretos" -ForegroundColor White
    Write-Host "   3. ✅ Teste novamente a integração" -ForegroundColor White
    Write-Host "   4. ✅ Responda ao suporte do Vista agradecendo" -ForegroundColor White
    
} elseif ($foundCount -gt 0) {
    Write-Host "`n⚠️  PARCIALMENTE ENCONTRADO: $foundCount de 5 campos" -ForegroundColor Yellow
    Write-Host "`n📝 O que fazer agora:" -ForegroundColor Yellow
    Write-Host "   1. ✅ Para os campos ENCONTRADOS:" -ForegroundColor White
    Write-Host "      → Atualize o código com os nomes corretos" -ForegroundColor DarkGray
    Write-Host "   2. ❌ Para os campos NÃO ENCONTRADOS:" -ForegroundColor White
    Write-Host "      → Responda ao suporte Vista perguntando sobre eles" -ForegroundColor DarkGray
    Write-Host "      → Use o template de email abaixo" -ForegroundColor DarkGray
    
} else {
    Write-Host "`n❌ NENHUM CAMPO ENCONTRADO!" -ForegroundColor Red
    Write-Host "`n📝 O que fazer agora:" -ForegroundColor Yellow
    Write-Host "   1. ❌ Responda ao suporte Vista informando" -ForegroundColor White
    Write-Host "   2. ❓ Pergunte se os campos estão habilitados na conta" -ForegroundColor White
    Write-Host "   3. ❓ Solicite habilitação ou alternativas" -ForegroundColor White
    Write-Host "   4. 📧 Use o template de email abaixo" -ForegroundColor White
}

# ==============================================================================
# TEMPLATE DE EMAIL
# ==============================================================================

Write-Header "TEMPLATE DE EMAIL PARA O SUPORTE"

if ($foundCount -eq 5) {
    Write-Host @"

Para: suporte@vistasoft.com.br
Assunto: RE: Campos API Vista - Pharos (gabarito-rest)

Olá!

Obrigado pelas orientações. Executei o /imoveis/listarcampos e encontrei 
TODOS os campos:

✅ Status da Obra: $($results.StatusObra -join ', ')
✅ Tour Virtual: $($results.TourVirtual -join ', ')
✅ Vídeos: $($results.Videos -join ', ')
✅ Anexos: $($results.Anexos -join ', ')
✅ IPTU: $($results.IPTU -join ', ')

Vou atualizar nosso código com esses nomes corretos e testar novamente.

Obrigado pelo suporte!

[Seu Nome]
Pharos Imobiliária

"@ -ForegroundColor Green

} elseif ($foundCount -gt 0) {
    Write-Host @"

Para: suporte@vistasoft.com.br
Assunto: RE: Campos API Vista - Pharos (gabarito-rest)

Olá!

Obrigado pelas orientações. Executei o /imoveis/listarcampos.

CAMPOS ENCONTRADOS:
$( ($results.Keys | Where-Object { $results[$_] } | ForEach-Object { "✅ $_`:: $($results[$_] -join ', ')" }) -join "`n" )

CAMPOS NÃO ENCONTRADOS:
$( ($results.Keys | Where-Object { -not $results[$_] } | ForEach-Object { "❌ $_" }) -join "`n" )

Perguntas:
1. Os campos não encontrados estão habilitados na conta gabarito-rest?
2. Se sim, qual seria a grafia exata?
3. Se não, como podemos habilitar?

Total de campos retornados: $($allFields.Count)

Aguardo retorno.

[Seu Nome]
Pharos Imobiliária

"@ -ForegroundColor Yellow

} else {
    Write-Host @"

Para: suporte@vistasoft.com.br
Assunto: RE: Campos API Vista - Pharos (gabarito-rest)

Olá!

Obrigado pelas orientações. Executei o /imoveis/listarcampos.

RESULTADO: Nenhum dos campos problemáticos foi encontrado.

❌ Status da Obra: busquei por "status.*obra", "obra.*status", "construc", "lancamento"
❌ Tour Virtual: busquei por "tour", "360", "virtual"
❌ Vídeos: busquei por "video", "youtube"
❌ Anexos: busquei por "anexo", "documento", "pdf"
❌ IPTU: busquei por "iptu"

Total de campos retornados: $($allFields.Count)

Perguntas:
1. Esses campos estão habilitados na conta gabarito-rest?
2. Se sim, qual seria a grafia exata?
3. Se não, como podemos habilitar?

Arquivo com todos os campos anexado: vista-campos-disponiveis.json

Aguardo retorno.

[Seu Nome]
Pharos Imobiliária

"@ -ForegroundColor Red
}

# ==============================================================================
# ARQUIVOS GERADOS
# ==============================================================================

Write-Header "ARQUIVOS GERADOS"

Write-Host "`n📁 Arquivo JSON com todos os campos:" -ForegroundColor Yellow
Write-Host "   $jsonFile" -ForegroundColor White
Write-Host "`n💡 Você pode anexar este arquivo ao email para o suporte." -ForegroundColor Gray

# ==============================================================================
# FINALIZAÇÃO
# ==============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Perguntar se quer ver todos os campos
$showAll = Read-Host "`nDeseja ver a lista COMPLETA de todos os $($allFields.Count) campos? (s/n)"
if ($showAll -eq 's' -or $showAll -eq 'S') {
    Write-Header "LISTA COMPLETA DE CAMPOS"
    $allFields | ForEach-Object {
        Write-Host "  • $_" -ForegroundColor White
    }
}

Write-Host "`n✅ Script concluído!" -ForegroundColor Green
Write-Host "📧 Copie o template de email acima e envie ao suporte." -ForegroundColor Yellow
Write-Host ""

