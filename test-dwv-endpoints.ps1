# Script para descobrir o endpoint correto da DWV API
$token = "4b3e322a7773c8b3498606ed5d086a613171c65d542acbacd41b41af51d1d59a"
$baseUrls = @(
    "https://api.dwvapp.com.br",
    "https://integration.dwvapp.com.br"
)

$paths = @(
    "/integration/properties",
    "/v1/integration/properties",
    "/api/integration/properties",
    "/api/v1/integration/properties",
    "/properties",
    "/v1/properties"
)

Write-Host "=== Testando endpoints DWV ===" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Accept" = "application/json"
    "Authorization" = "Bearer $token"
}

foreach ($baseUrl in $baseUrls) {
    foreach ($path in $paths) {
        $fullUrl = "$baseUrl$path" + "?limit=1"
        
        Write-Host "Testando: $fullUrl" -ForegroundColor Gray -NoNewline
        
        try {
            $response = Invoke-RestMethod -Uri $fullUrl -Method Get -Headers $headers -ContentType "application/json" -ErrorAction Stop
            
            Write-Host " OK!" -ForegroundColor Green
            Write-Host "  Encontrado endpoint valido!" -ForegroundColor Green
            Write-Host "  URL: $fullUrl" -ForegroundColor Cyan
            Write-Host ""
            
            $response | ConvertTo-Json -Depth 10 | Out-File -FilePath "dwv-response-success.json" -Encoding UTF8
            Write-Host "  Resposta salva em: dwv-response-success.json" -ForegroundColor Green
            
            if ($response.data) {
                Write-Host "  Total de imoveis: $($response.data.Count)" -ForegroundColor White
            }
            
            Write-Host ""
            Write-Host "=== ENDPOINT CORRETO ENCONTRADO ===" -ForegroundColor Green
            Write-Host "Use esta URL no .env.local:" -ForegroundColor Yellow
            Write-Host "DWV_BASE_URL=$baseUrl" -ForegroundColor Cyan
            exit 0
            
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            
            if ($statusCode -eq 404) {
                Write-Host " 404" -ForegroundColor Red
            } elseif ($statusCode -eq 401) {
                Write-Host " 401" -ForegroundColor Yellow
            } else {
                Write-Host " Erro: $statusCode" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "=== Nenhum endpoint funcionou ===" -ForegroundColor Red
Write-Host "Entre em contato com o suporte DWV" -ForegroundColor Yellow
