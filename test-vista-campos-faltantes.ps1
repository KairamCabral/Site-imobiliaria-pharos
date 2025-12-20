# 🧪 Script de Teste - Campos Faltantes Vista API
# 
# Este script testa os campos que não estão retornando dados
# Execute: .\test-vista-campos-faltantes.ps1

# ==============================================================================
# CONFIGURAÇÃO
# ==============================================================================

$API_KEY = "e4e62e22782c7646f2db00a2c56ac70e"
$BASE_URL = "https://gabarito-rest.vistahost.com.br"

# Código de um imóvel para testar (substitua por um código válido da sua base)
$CODIGO_TESTE = "1108"

# ==============================================================================
# FUNÇÕES AUXILIARES
# ==============================================================================

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Yellow
    Write-Host "=" * 80 -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$Campo,
        [string]$Status,
        [string]$Valor
    )
    
    $StatusColor = switch ($Status) {
        "OK" { "Green" }
        "VAZIO" { "Yellow" }
        "ERRO" { "Red" }
        "NULL" { "DarkYellow" }
        default { "White" }
    }
    
    Write-Host "  Campo: " -NoNewline
    Write-Host $Campo.PadRight(25) -ForegroundColor White -NoNewline
    Write-Host " | Status: " -NoNewline
    Write-Host $Status.PadRight(10) -ForegroundColor $StatusColor -NoNewline
    Write-Host " | Valor: " -NoNewline
    Write-Host $Valor -ForegroundColor Gray
}

function Test-VistaEndpoint {
    param(
        [string]$Endpoint,
        [hashtable]$Params,
        [string]$Method = "GET"
    )
    
    try {
        # Monta URL com parâmetros
        $url = "$BASE_URL$Endpoint"
        $queryParams = @()
        $queryParams += "key=$API_KEY"
        
        foreach ($key in $Params.Keys) {
            $value = $Params[$key]
            if ($value -is [hashtable] -or $value -is [array]) {
                $jsonValue = $value | ConvertTo-Json -Compress -Depth 10
                $encodedValue = [System.Web.HttpUtility]::UrlEncode($jsonValue)
                $queryParams += "$key=$encodedValue"
            } else {
                $queryParams += "$key=$value"
            }
        }
        
        $url += "?" + ($queryParams -join "&")
        
        Write-Host "`n  Request: $Method $url" -ForegroundColor DarkGray
        
        # Faz requisição
        $response = Invoke-RestMethod -Uri $url -Method $Method -ContentType "application/json"
        
        return @{
            Success = $true
            Data = $response
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# ==============================================================================
# TESTE 1: STATUS DA OBRA
# ==============================================================================

Write-TestHeader "TESTE 1: StatusObra (Status da Obra)"

Write-Host "`n[1.1] Testando campo 'StatusObra' via /imoveis/detalhes"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "StatusObra")
    }
}

if ($result.Success) {
    $statusObra = $result.Data.StatusObra
    if ($null -eq $statusObra -or $statusObra -eq "") {
        Write-TestResult -Campo "StatusObra" -Status "NULL" -Valor "(vazio)"
    } else {
        Write-TestResult -Campo "StatusObra" -Status "OK" -Valor $statusObra
    }
} else {
    Write-TestResult -Campo "StatusObra" -Status "ERRO" -Valor $result.Error
}

Write-Host "`n[1.2] Testando variantes: StatusDaObra, StatusEmpreendimento"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "StatusDaObra", "StatusEmpreendimento")
    }
}

if ($result.Success) {
    $statusDaObra = $result.Data.StatusDaObra
    $statusEmpreendimento = $result.Data.StatusEmpreendimento
    
    Write-TestResult -Campo "StatusDaObra" -Status $(if ($statusDaObra) { "OK" } else { "NULL" }) -Valor $(if ($statusDaObra) { $statusDaObra } else { "(vazio)" })
    Write-TestResult -Campo "StatusEmpreendimento" -Status $(if ($statusEmpreendimento) { "OK" } else { "NULL" }) -Valor $(if ($statusEmpreendimento) { $statusEmpreendimento } else { "(vazio)" })
} else {
    Write-Host "  Erro ao testar variantes: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[1.3] Testando campo 'Lancamento' (workaround atual)"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "Lancamento")
    }
}

if ($result.Success) {
    $lancamento = $result.Data.Lancamento
    Write-TestResult -Campo "Lancamento" -Status $(if ($lancamento) { "OK" } else { "NULL" }) -Valor $(if ($lancamento) { $lancamento } else { "(vazio)" })
} else {
    Write-TestResult -Campo "Lancamento" -Status "ERRO" -Valor $result.Error
}

# ==============================================================================
# TESTE 2: TOUR VIRTUAL
# ==============================================================================

Write-TestHeader "TESTE 2: TourVirtual (Tour 360°)"

Write-Host "`n[2.1] Testando campo 'TourVirtual' via /imoveis/detalhes"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "TourVirtual")
    }
}

if ($result.Success) {
    $tourVirtual = $result.Data.TourVirtual
    if ($null -eq $tourVirtual -or $tourVirtual -eq "") {
        Write-TestResult -Campo "TourVirtual" -Status "NULL" -Valor "(vazio)"
    } else {
        Write-TestResult -Campo "TourVirtual" -Status "OK" -Valor $tourVirtual
    }
} else {
    Write-TestResult -Campo "TourVirtual" -Status "ERRO" -Valor $result.Error
}

Write-Host "`n[2.2] Testando variantes: Tour, Link360, URLTour"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "Tour", "Link360", "URLTour")
    }
}

if ($result.Success) {
    Write-Host "  Resposta completa:" -ForegroundColor DarkGray
    $result.Data | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor DarkGray
} else {
    Write-Host "  Erro: $($result.Error)" -ForegroundColor Red
}

# ==============================================================================
# TESTE 3: VÍDEOS
# ==============================================================================

Write-TestHeader "TESTE 3: Videos (Galeria de Vídeos)"

Write-Host "`n[3.1] Testando campo 'Videos' via /imoveis/detalhes"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "Videos")
    }
}

if ($result.Success) {
    $videos = $result.Data.Videos
    if ($null -eq $videos) {
        Write-TestResult -Campo "Videos" -Status "NULL" -Valor "(null)"
    } elseif ($videos -is [array] -and $videos.Count -eq 0) {
        Write-TestResult -Campo "Videos" -Status "VAZIO" -Valor "(array vazio [])"
    } elseif ($videos -is [array] -and $videos.Count -gt 0) {
        Write-TestResult -Campo "Videos" -Status "OK" -Valor "($($videos.Count) vídeos)"
        $videos | ForEach-Object {
            Write-Host "    - $_" -ForegroundColor Green
        }
    } else {
        Write-TestResult -Campo "Videos" -Status "OK" -Valor $videos
    }
} else {
    Write-TestResult -Campo "Videos" -Status "ERRO" -Valor $result.Error
}

# ==============================================================================
# TESTE 4: ANEXOS
# ==============================================================================

Write-TestHeader "TESTE 4: Anexos (PDFs, Plantas, Documentos)"

Write-Host "`n[4.1] Testando campo 'Anexos' via /imoveis/detalhes"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "Anexos")
    }
}

if ($result.Success) {
    $anexos = $result.Data.Anexos
    if ($null -eq $anexos) {
        Write-TestResult -Campo "Anexos" -Status "NULL" -Valor "(null)"
    } else {
        Write-TestResult -Campo "Anexos" -Status "OK" -Valor $anexos
    }
} else {
    Write-TestResult -Campo "Anexos" -Status "ERRO" -Valor $result.Error
}

Write-Host "`n[4.2] Testando campos alternativos: Documentos, Folder, FolderPDF"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "Documentos", "Folder", "FolderPDF")
    }
}

if ($result.Success) {
    Write-Host "  Resposta:" -ForegroundColor DarkGray
    $result.Data | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor DarkGray
} else {
    Write-Host "  Erro: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[4.3] Testando endpoint dedicado: /imoveis/anexos"
$result = Test-VistaEndpoint -Endpoint "/imoveis/anexos" -Params @{
    imovel = $CODIGO_TESTE
}

if ($result.Success) {
    Write-Host "  ✅ Endpoint encontrado!" -ForegroundColor Green
    $result.Data | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Green
} else {
    Write-Host "  ❌ Endpoint não encontrado ou erro: $($result.Error)" -ForegroundColor Red
}

# ==============================================================================
# TESTE 5: IPTU
# ==============================================================================

Write-TestHeader "TESTE 5: ValorIPTU / IPTU"

Write-Host "`n[5.1] Testando campo 'ValorIPTU' via /imoveis/detalhes"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "ValorIPTU")
    }
}

if ($result.Success) {
    $valorIPTU = $result.Data.ValorIPTU
    if ($null -eq $valorIPTU -or $valorIPTU -eq "" -or $valorIPTU -eq "0") {
        Write-TestResult -Campo "ValorIPTU" -Status "NULL" -Valor "(vazio ou zero)"
    } else {
        Write-TestResult -Campo "ValorIPTU" -Status "OK" -Valor "R$ $valorIPTU"
    }
} else {
    Write-TestResult -Campo "ValorIPTU" -Status "ERRO" -Valor $result.Error
}

Write-Host "`n[5.2] Testando campo alternativo 'IPTU'"
$result = Test-VistaEndpoint -Endpoint "/imoveis/detalhes" -Params @{
    imovel = $CODIGO_TESTE
    pesquisa = @{
        fields = @("Codigo", "IPTU")
    }
}

if ($result.Success) {
    $iptu = $result.Data.IPTU
    if ($null -eq $iptu -or $iptu -eq "" -or $iptu -eq "0") {
        Write-TestResult -Campo "IPTU" -Status "NULL" -Valor "(vazio ou zero)"
    } else {
        Write-TestResult -Campo "IPTU" -Status "OK" -Valor "R$ $iptu"
    }
} else {
    Write-TestResult -Campo "IPTU" -Status "ERRO" -Valor $result.Error
}

Write-Host "`n[5.3] Tentando buscar IPTU via /imoveis/listar (fallback)"
$result = Test-VistaEndpoint -Endpoint "/imoveis/listar" -Params @{
    pesquisa = @{
        fields = @("Codigo", "ValorIPTU", "IPTU")
        filter = @{
            Codigo = $CODIGO_TESTE
        }
    }
}

if ($result.Success) {
    # A resposta de /imoveis/listar vem como objeto com chaves dinâmicas
    $imovel = $result.Data | Get-Member -MemberType NoteProperty | 
              Where-Object { $_.Name -ne "total" -and $_.Name -ne "paginas" } | 
              Select-Object -First 1
    
    if ($imovel) {
        $imovelData = $result.Data.($imovel.Name)
        Write-Host "  Código encontrado: $($imovelData.Codigo)" -ForegroundColor Gray
        Write-Host "  ValorIPTU: $($imovelData.ValorIPTU)" -ForegroundColor Gray
        Write-Host "  IPTU: $($imovelData.IPTU)" -ForegroundColor Gray
    } else {
        Write-Host "  Imóvel não encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Erro: $($result.Error)" -ForegroundColor Red
}

# ==============================================================================
# TESTE 6: DESCOBERTA DE CAMPOS
# ==============================================================================

Write-TestHeader "TESTE 6: Descoberta de Campos Disponíveis"

Write-Host "`n[6.1] Buscando todos os campos via /imoveis/listarcampos"
$result = Test-VistaEndpoint -Endpoint "/imoveis/listarcampos" -Params @{}

if ($result.Success) {
    $allFields = $result.Data | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
    $totalFields = $allFields.Count
    
    Write-Host "`n  ✅ Total de campos disponíveis: $totalFields" -ForegroundColor Green
    
    # Buscar campos relacionados aos nossos testes
    Write-Host "`n  🔍 Campos relacionados a 'Status Obra':" -ForegroundColor Yellow
    $statusObraFields = $allFields | Where-Object { $_ -match "status.*obra|obra.*status" }
    if ($statusObraFields) {
        $statusObraFields | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
    } else {
        Write-Host "    (nenhum encontrado)" -ForegroundColor Red
    }
    
    Write-Host "`n  🔍 Campos relacionados a 'Tour':" -ForegroundColor Yellow
    $tourFields = $allFields | Where-Object { $_ -match "tour|360" }
    if ($tourFields) {
        $tourFields | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
    } else {
        Write-Host "    (nenhum encontrado)" -ForegroundColor Red
    }
    
    Write-Host "`n  🔍 Campos relacionados a 'Video':" -ForegroundColor Yellow
    $videoFields = $allFields | Where-Object { $_ -match "video" }
    if ($videoFields) {
        $videoFields | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
    } else {
        Write-Host "    (nenhum encontrado)" -ForegroundColor Red
    }
    
    Write-Host "`n  🔍 Campos relacionados a 'Anexo/Documento':" -ForegroundColor Yellow
    $anexoFields = $allFields | Where-Object { $_ -match "anexo|documento|folder|pdf|arquivo" }
    if ($anexoFields) {
        $anexoFields | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
    } else {
        Write-Host "    (nenhum encontrado)" -ForegroundColor Red
    }
    
    Write-Host "`n  🔍 Campos relacionados a 'IPTU':" -ForegroundColor Yellow
    $iptuFields = $allFields | Where-Object { $_ -match "iptu" }
    if ($iptuFields) {
        $iptuFields | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
    } else {
        Write-Host "    (nenhum encontrado)" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Erro ao buscar campos: $($result.Error)" -ForegroundColor Red
}

# ==============================================================================
# RESUMO FINAL
# ==============================================================================

Write-TestHeader "RESUMO DOS TESTES"

Write-Host @"

📊 RESULTADOS:

1. StatusObra:        ❓ (execute o script para verificar)
2. TourVirtual:       ❓ (execute o script para verificar)
3. Videos:            ❓ (execute o script para verificar)
4. Anexos:            ❓ (execute o script para verificar)
5. ValorIPTU/IPTU:    ❓ (execute o script para verificar)

📋 PRÓXIMOS PASSOS:

1. Analise os resultados acima
2. Identifique os campos que retornaram NULL ou ERRO
3. Copie as informações relevantes
4. Anexe ao chamado do Vista CRM

📁 ARQUIVOS DE SUPORTE:

- CHAMADO-VISTA-CAMPOS-FALTANTES.md      (descrição completa)
- CHAMADO-VISTA-DETALHES-TECNICOS.md     (logs e código)
- CHAMADO-VISTA-RESUMO-EXECUTIVO.md      (resumo executivo)
- VISTA-API-STATUS-CAMPOS.md             (status por categoria)

"@ -ForegroundColor Cyan

Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""




